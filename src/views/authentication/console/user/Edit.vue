<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'authentication_console_user'}"> <icon-font class="icon" type="icon-system-user" /> 系统用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.username + '] ': '添加') + '系统用户' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.username + '] ': '添加') + '系统用户'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-edit" />
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="登陆账户:" name="username">
              <a-input ref="username" v-model:value="form.username" autocomplete="username" :disabled="form.id !== null" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item has-feedback label="真是姓名:" name="realName">
              <a-input v-model:value="form.realName" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row v-if="form.id === null" :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="登陆密码:" name="password">
              <a-input-password v-model:value="form.password" autocomplete="new-password" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item has-feedback label="确认密码:" name="confirmPassword">
              <a-input-password v-model:value="form.confirmPassword" autocomplete="new-password" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="电子邮箱:" name="email">
              <a-input ref="email" v-model:value="form.email" :disabled="form.id !== null" />
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
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="form.remark" :auto-size="{ minRows: 2, maxRows: 5 }"/>
            </a-form-item>
          </a-col>

        </a-row>

      </a-form>

      <a-tabs>

        <a-tab-pane key="group-table">
          <template #tab>
            <icon-font class="icon" type="icon-group" />
            <span class="hidden-xs">所在组</span>
          </template>
          <group-table ref="group-table" :enable-disabled-checkbox="false" :searchData="{mergeTree:true, 'filter_[status_eq]': 1, 'filter_[sources_jin]':['CONSOLE']}" @search="onGroupSearch"/>
        </a-tab-pane>

        <a-tab-pane key="resource-table" forceRender>
          <template #tab>
            <icon-font class="icon" type="icon-attachment" />
            <span class="hidden-xs">独立权限</span>
          </template>
          <resource-table ref="resource-table" :selection="true" :searchData="{mergeTree:true, sources:['CONSOLE']}" @search="onResourceSearch"/>
        </a-tab-pane>

      </a-tabs>

      <a-divider />

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="principal.hasPermission('perms[console_user:save]')" :loading="spinning" >
          <icon-font class="icon" v-if="!spinning" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="$refs['edit-form'].resetFields();">
          <icon-font class="icon" type="icon-ashbin" />
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
  name:"AuthenticationConsoleUserEdit",
  components:{GroupTable, ResourceTable},
  data() {
    return {
      spinning:true,
      statusOptions:[],
      form: {
        id: null,
        username: "",
        realName: "",
        password: "",
        groupsInfo:[],
        resourceMap:{},
        confirmPassword:"",
        email: "",
        remark: "",
        status: "1"
      },
      rules: {
        username: [
          { required: true, message: "请输入登陆账户", trigger: "change"},
          { validator:this.validateRemoteUsername, trigger: "change"}
        ],
        realName: [{ required: true, message: "请输入真实姓名", trigger: "change" }],
        password: [
          { required: true, message: "请输入登陆密码", trigger: "change"},
          {type:"string", pattern: /^(?!^[0-9a-z]+$)(?!^[0-9A-Z]+$)(?!^[0-9\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[a-zA-Z]+$)(?!^[a-z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)[a-z0-9A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/, message:"密码段中在要求的四种(大写字母，小写字母，数字，标点符号)类型中至少存在三种"}
        ],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "change" },
          { validator:this.validatePassword, trigger: "change"}
        ],
        email: [
          {type: "email", message:"电子邮箱格式不正确",trigger: "change"},
          {validator:this.validateRemoteEmail, trigger: "change"}
        ]
      }
    }
  },
  methods: {
    onGroupSearch() {
      if (!this.form.groupsInfo) {
        return ;
      }
      this.$refs['group-table'].selectedIds = this.form.groupsInfo.map(g => g.id);
    },
    onResourceSearch() {
      if (!this.form.resourceMap) {
        return ;
      }

      let resourceIds = []
      for (let v in this.form.resourceMap) {
        this.form.resourceMap[v].forEach(id => resourceIds.push(id));
      }

      this.$refs['resource-table'].selectedIds = resourceIds;
    },
    validateRemoteUsername(value, s) {
      if (this.$refs["username"].disabled) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/authentication/console/user/isUsernameUnique?username=" + s).then(r => {
          return r.data.data ? resolve() : reject("登陆账户已存在");
        });
      });
    },
    validateRemoteEmail() {
      if (this.$refs["email"].disabled) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/authentication/console/user/isEmailUnique?email=" + this.form.email).then(r => {
          return r.data.data ? resolve() : reject("电子邮箱已存在");
        });
      });
    },
    async validatePassword() {
      if (this.form.confirmPassword !== this.form.password) {
        return Promise.reject('登陆密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    },
    submitForm() {
      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        let groups = this.$refs['group-table'].getSelectedRecords();
        if (groups.length > 0) {
          let groupsInfo = [];
          groups.forEach(r => {
            groupsInfo.push({
              id:r.id,
              name:r.name,
              authority: r.authority
            });
          })
          _this.form.groupsInfo = groupsInfo;
        }

        let resources = _this.$refs['resource-table'].getSelectedRecords();
        if (resources.length > 0) {
          let resourceMap = {};
          resources.forEach(r => {
            if (!resourceMap[r.applicationName]) {
              resourceMap[r.applicationName] = [];
            }
            resourceMap[r.applicationName].push(r.id);
          })
          _this.form.resourceMap = resourceMap;
        }

        _this
            .$http
            .post("/authentication/console/user/save",_this.form)
            .then((r) => {
              let id = r.data.data;
              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"authentication_console_user_edit", query:{id}, replace:true});
                _this.form.id = r.data.data;
              }

              _this.spinning = false;

            })
            .catch(() => _this.spinning = false);

      });

    }
  },
  mounted() {
    this.$refs['group-table'].search();
    this.$refs['resource-table'].search();
  },
  created() {

    let _this = this;

    _this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> _this.statusOptions = r.data.data);

    if (this.$route.query.id !== undefined) {

      _this
          .$http
          .get("/authentication/console/user/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;
            _this.form.status = _this.form.status.value + '';
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>