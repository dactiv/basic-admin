<template>

  <a-breadcrumb>
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link to='/index/console/user'>系统用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>{{ '编辑' + (form.username !== '' ? ' [' + form.username + '] ': '系统') + '用户' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="'编辑' + (form.username !== '' ? ' [' + form.username + '] ': '系统') + '用户'">
    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="登陆账户:" name="username">
              <a-input v-model:value="form.username" :disabled="form.id === null"></a-input>
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
              <a-select style="width: 100%" v-model:value="form.status">
                <a-select-option v-for="(value, name) in statusOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

      </a-form>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[console_user:save]')"><icon-font type="icon-select" />保存</a-button>
        <a-button @click="this.refs['edit-form'].resetFields();"><icon-font type="icon-ashbin" />重置</a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"ConsoleUserEdit",
  data() {
    return {
      spinning:true,
      statusOptions:[],
      query:null,
      form: {
        id:null,
        username: "",
        realName: "",
        password: "",
        confirmPassword:"",
        email: "",
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
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }]
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

        _this
            .$http
            .post("/authentication/console/user/save",_this.formUrlencoded(_this.form))
            .then(() => _this.$router.push("/index/console/user"))
            .catch(() => _this.spinning = false);

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
            this.form.status = this.form.status + '';
            this.spinning = false
          });

    } else {
      this.spinning = false
    }
  }
}
</script>