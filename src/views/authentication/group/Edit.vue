<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'authentication_group'}"><icon-font class="icon" type="icon-group" /> 组管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '组' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '组'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-edit"/>
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="组名称:" name="name">
              <a-input ref="name" v-model:value="form.name" :disabled="form.id !== null" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item has-feedback label="权限名:" name="authority">
              <a-input ref="authority" v-model:value="form.authority" :disabled="form.id !== null" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="来源:" name="source">
              <a-select @change="sourceChange" class="width-100-percent" mode="multiple" v-model:value="form.source" >
                <a-select-option v-for="(name,value ) of sourceOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12" >

            <a-form-item label="状态:" name="status">
              <a-select class="width-100-percent" v-model:value="form.status">
                <a-select-option v-for="(value, name) of statusOptions" :key="value + ''" :value="value + ''">
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
                <a-select-option v-for="p of parentOptions" :key="p.id + ''" :value="p.id + ''">
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

        <a-form-item label="拥有权限:" name="remark">
          <resource-table ref="resource-table" :selection="true"/>
        </a-form-item>

      </a-form>

      <a-divider></a-divider>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[console_user:save]')">
          <icon-font class="icon" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

import ResourceTable from "@/components/ResourceTable";

export default {
  name:"AuthenticationGroupEdit",
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
        removable: 1,
        modifiable: 1,
        status: "1",
        remark: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入组名称", trigger: "change" },
          { validator:this.validateRemoteName, trigger: "change" }
        ],
        authority: [
          { required: true, message: "请输入权限名称", trigger: "change" },
          { validator:this.validateRemoteAuthority, trigger: "change" }
        ],
        source: [{ required: true, message: "请输入组名称", trigger: "change", type: "array" }]
      }
    }
  },
  methods: {
    sourceChange(value) {
      if(value.length === 0) {
        this.$refs['resource-table'].data = [];
      } else {
        this.$refs['resource-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":value});
      }
    },
    validateRemoteName() {
      return new Promise((resolve, reject) => {
        this.$http.get("/authentication/group/isNameUnique?name=" + this.form.name).then(r => {
          return r.data.data ? resolve() : reject("组名称已存在");
        });
      });
    },
    validateRemoteAuthority() {
      return new Promise((resolve, reject) => {
        this.$http.get("/authentication/group/isAuthorityUnique?authority=" + this.form.authority).then(r => {
          return r.data.data ? resolve() : reject("权限名称已存在");
        });
      });
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;
        _this.form.resourceIds = this.$refs['resource-table'].selectedIds;

        _this
            .$http
            .post("/authentication/group/save",_this.formUrlencoded(_this.form))
            .then((r) => {
              let id = r.data.data;

              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"authentication_group_edit", query:{id}, replace:true});
                _this.form.id = r.data.data;
              }

              _this.spinning = false;

            })
            .catch(() => _this.spinning = false);

      });
    },
    setGroupResource(id) {
      this
          .$http
          .get("/authentication/resource/getGroupResource?groupId=" + id)
          .then(r => this.$refs['resource-table'].selectedIds = r.data.data);
    }
  },
  created() {

    let _this = this;

    _this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r=> _this.statusOptions = r.data.data);
    _this.loadConfig({service:"config", enumerateName:"ResourceSource"}, r=> _this.sourceOptions = r.data.data);

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {

      _this
          .$http
          .get("/authentication/group/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;
            _this.form.status = _this.form.status + '';
            _this.spinning = false;

            if (_this.form.source.length > 0) {
              this.$refs['resource-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":_this.form.source});
            }

            _this.setGroupResource(_this.form.id);

          })
          .catch(() => _this.spinning = false);

      findParentParam["filter_[id_ne]"] = this.$route.query.id;

    } else {
      this.spinning = false
    }

    _this
        .$http
        .post("/authentication/group/find",_this.formUrlencoded(findParentParam))
        .then(r => _this.parentOptions = r.data.data);
  }
}
</script>