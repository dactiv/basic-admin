<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home"></icon-font> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-setting"></icon-font> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'group'}"><icon-font type="icon-group"></icon-font> 组管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-edit"></icon-font> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '组' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '组'" class="basic-box-shadow">

    <template #extra>
      <icon-font type="icon-edit"></icon-font>
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="组名称:" name="name">
              <a-input v-model:value="form.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="权限名:" name="authority">
              <a-input v-model:value="form.authority"></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="来源:" name="source">
              <a-select @change="sourceChange" class="width-100-percent" mode="multiple" v-model:value="form.source" >
                <a-select-option v-for="(name,value ) in sourceOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12" >

            <a-form-item label="状态:" name="status">
              <a-select class="width-100-percent" v-model:value="form.status">
                <a-select-option v-for="(value, name) in statusOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="上级组:" name="parentId">
              <a-select class="width-100-percent" v-model:value="form.parentId">
                <a-select-option v-for="p in parentOptions" :key="p.id + ''" :value="p.id + ''">
                  {{p.name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="form.remark" :auto-size="{ minRows: 2, maxRows: 5 }"/>
            </a-form-item>
          </a-col>

        </a-row>

        <a-tabs>

          <a-tab-pane key="group-table">
            <template #tab>
              <icon-font type="icon-attachment" />
              <span class="hidden-xs">拥有权限</span>
            </template>
            <resource-table ref="resource-table" :selection="true"/>
          </a-tab-pane>

        </a-tabs>

      </a-form>

      <a-space :size="10" class="margin-top-20">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[console_user:save]')">
          <icon-font type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

import ResourceTable from "@/components/ResourceTable";

export default {
  name:"GroupEdit",
  components:{ResourceTable},
  data() {
    return {
      spinning:true,
      statusOptions:[],
      parentOptions:[],
      sourceOptions:[],
      form: {
        id:null,
        name: "",
        authority: "",
        source: [],
        resourceIds:[],
        parentId:"",
        removable: "1",
        modifiable: "1",
        status: "1",
        remark: "",
      },
      rules: {
        name: [{ required: true, message: "请输入组名称", trigger: "blur" }],
        authority: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
        source: [{validator:this.validateSource, trigger: "blur"}]
      }
    }
  },
  methods: {
    sourceChange:function(value) {
      if(value.length === 0) {
        this.$refs['resource-table'].data = [];
      } else {
        this.$refs['resource-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":value});
      }
    },
    validateSource:async function (){
      if (this.form.source.length <= 0) {
        return Promise.reject('请选择一个以上的来源');
      } else {
        return Promise.resolve();
      }
    },
    submitForm:function() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;
        _this.form.resourceIds = this.$refs['resource-table'].selectedIds;

        _this
            .$http
            .post("/authentication/group/save",_this.formUrlencoded(_this.form))
            .then(() => _this.$router.push("/index/group"))
            .catch(() => _this.spinning = false);

      });
    },
    setGroupResource:function(id) {
      this
          .$http
          .get("/authentication/resource/getGroupResource?groupId=" + id)
          .then(r => this.$refs['resource-table'].selectedIds = r);
    }
  },
  created() {

    let _this = this;

    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> _this.statusOptions = r);
    this.loadConfig({service:"config", enumerateName:"ResourceSource"}, r=> _this.sourceOptions = r);

    _this
        .$http
        .post("/authentication/group/find",_this.formUrlencoded({mergeTree:false}))
        .then(r => _this.parentOptions = r);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/authentication/group/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r;
            _this.form.status = _this.form.status + '';
            _this.spinning = false;

            if (_this.form.source.length > 0) {
              this.$refs['resource-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":_this.form.source});
            }

            _this.setGroupResource(_this.form.id);

          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>