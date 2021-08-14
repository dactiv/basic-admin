<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link to='/index/console/user'>系统用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>{{ (form.id ? '编辑 [' + form.username + '] ': '添加') + '系统用户' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.username + '] ': '添加') + '系统用户'" class="basic-box-shadow">
    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="登陆账户:" name="username">
              <a-input v-model:value="form.username" :disabled="form.id !== null"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="真是姓名:" name="realName">
              <a-input v-model:value="form.realName"></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row v-if="form.id === null" :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="登陆密码:" name="password">
              <a-input-password v-model:value="form.password"></a-input-password>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="确认密码:" name="confirmPassword">
              <a-input-password v-model:value="form.confirmPassword"></a-input-password>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="电子邮箱:" name="email">
              <a-input v-model:value="form.email"></a-input>
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
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="form.remark" :auto-size="{ minRows: 2, maxRows: 5 }"/>
            </a-form-item>
          </a-col>

        </a-row>

      </a-form>

      <a-tabs>

        <a-tab-pane key="group-table">
          <template #tab>
            <icon-font type="icon-group" />
            <span class="hidden-xs">所在组</span>
          </template>
          <group-table ref="group-table" :enable-disabled-checkbox="false" />
        </a-tab-pane>

        <a-tab-pane key="resource-table" forceRender>
          <template #tab>
            <icon-font type="icon-attachment" />
            <span class="hidden-xs">独立权限</span>
          </template>
          <resource-table ref="resource-table" :selection="true"/>
        </a-tab-pane>

      </a-tabs>

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


import GroupTable from '@/components/GroupTable.vue';
import ResourceTable from "@/components/ResourceTable";

export default {
  name:"ConsoleUserEdit",
  components:{GroupTable, ResourceTable},
  data() {
    return {
      spinning:true,
      statusOptions:[],
      form: {
        id:null,
        username: "",
        realName: "",
        password: "",
        groupIds:[],
        resourceIds:[],
        confirmPassword:"",
        email: "",
        remark: "",
        status: "1"
      },
      rules: {
        username: [{ required: true, message: "请输入登陆账户", trigger: "blur" }],
        realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
        password: [
          { required: true, message: "请输入登陆密码", trigger: "blur" },
          { validator:this.validatePass, trigger: "blur"}
        ],
        email: [{type: "email",trigger: "blur", message:"邮箱格式不正确"}],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          { validator:this.validatePass, trigger: "blur"}
        ]
      }
    }
  },
  methods: {
    validatePass: async function (rule, value){
      if (value !== this.form.password) {
        return Promise.reject('登陆密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    },
    submitForm:function() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this.form.groupIds = this.$refs['group-table'].selectedIds;
        _this.form.resourceIds = this.$refs['resource-table'].selectedIds;

        _this
            .$http
            .post("/authentication/console/user/save",_this.formUrlencoded(_this.form))
            .then(() => _this.$router.push("/index/console/user"))
            .catch(() => _this.spinning = false);

      });
    }
  },
  mounted() {
    this.$refs['group-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":["Console"]});

    this.$refs['resource-table'].search({"mergeTree":true, "filter_[status_eq]": 1, "filter_[source_in]":["Console"]});
  },
  created() {

    let _this = this;

    _this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> _this.statusOptions = r);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/authentication/console/user/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r;
            _this.form.status = _this.form.status + '';
            _this.spinning = false
          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>