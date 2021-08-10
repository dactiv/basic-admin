<template>

  <a-breadcrumb>
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link to='/index/console/user'>系统用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>{{ '编辑' + (form.username !== '' ? ' [' + form.username + '] ': '系统') + '用户' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="'编辑' + (form.username !== '' ? ' [' + form.username + '] ': '系统') + '用户'">
    <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical" :loading="formLoading">

      <a-row>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="登陆账户:" name="username">
            <a-input v-model:value="form.username"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="真是姓名:" name="realName">
            <a-input v-model:value="form.realName"></a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-if="query.id === undefined">
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="登陆密码:" name="password">
            <a-input v-model:value="form.password"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="确认密码:" name="confirmPassword">
            <a-input v-model:value="form.confirmPassword"></a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="电子邮箱:" name="email">
            <a-input v-model:value="form.email"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="状态:" name="status">
            <a-select style="width: 100%" v-model:value="form.status">
              <a-select-option v-for="(value, name) in statusOptions" :key="value" :value="value">
                {{name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

      </a-row>

    </a-form>

    <a-space :size="10" class="padding-left-10 padding-right-10">
      <a-button type="primary" @click="submitForm"><icon-font type="icon-select" />保存</a-button>
      <a-button @click="this.refs['edit-form'].resetFields();"><icon-font type="icon-ashbin" />重置</a-button>
    </a-space>

  </a-card>

</template>

<script>

export default {
  name:"ConsoleUserEdit",
  data() {
    return {
      formLoading:true,
      statusOptions:[],
      query:null,
      form: {
        username: "",
        realName: "",
        password: "",
        confirmPassword:"",
        email: "",
        status: 1
      },
      rules: {
        username: { required: true, message: '请输入登陆账户', trigger: 'blur' },
        password: { required: true, message: '请输入登陆密码', trigger: 'blur' },
        realName: { required: true, message: '请输入真实姓名', trigger: 'blur' },
        confirmPassword: { required: true, message: '请输入确认密码', trigger: 'blur' },
        status: { required: true, message: '请选择状态', trigger: 'blur' }
      }
    }
  },
  methods: {
    submitForm:function() {
      let _this = this;
      _this.$refs['edit-form'].validate().then(() => {

      });
    }
  },
  created() {
    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> this.statusOptions = r);
    this.query = this.$route.query;

    if (this.query.id !== undefined) {

      this
          .$http
          .get("/authentication/console/user/get?id=" + this.query.id)
          .then(r => {
            this.form = r;
            this.formLoading = false
          });

    } else {
      this.formLoading = false
    }
  }
}
</script>