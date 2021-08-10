<template>

  <a-layout>

    <a-layout class="authentication-inner">
      <a-layout-header class="logo">
        <a-image :src="require('../assets/logo.png')" />
        <span> Dactiv </span>
      </a-layout-header>
      <a-layout-content class="display-flex align-items-center justify-content-center">
        <a-image :src="require('../assets/login.svg')" />
      </a-layout-content>
      <a-layout-footer class="main-footer text-center">COPYRIGHT © 2021 Dactiv, All rights ReservedHand-crafted & Made with</a-layout-footer>
    </a-layout>

    <a-layout-sider width="500" class="authentication-aside">
      <a-spin :spinning="spinning" tip="正在登陆，请稍等片刻。。。">
        <div class="authentication-aside-main">
          <h2 class="text-center"> Dactiv 后台管理系统 </h2>
          <p class="text-center"> 请登陆您的账户 </p>

          <a-form ref="login-form" :model="form" :rules="rules" layout="vertical">
            <a-form-item label="登陆账户:" name="username">
              <a-input v-model:value="form.username"></a-input>
            </a-form-item>
            <a-form-item label="登陆密码:" name="password">
              <a-input-password v-model:value="form.password"></a-input-password>
            </a-form-item>
            <a-form-item label="验证码:" name="captcha" class="picture-captcha" v-if="captcha.data.type === 'picture'">
              <a-input v-model:value="form.captcha">
                <template #addonAfter>
                  <a-image :width="100" :height="30" :src="this.captcha.pictureCaptchaUrl" @click="generatePictureCaptcha()"/>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-checkbox v-model:checked="form.rememberMe"> 一周内记住我 </a-checkbox>
            </a-form-item>

            <a-button type="primary" block @click="submitForm('login-form')">
              <icon-font type="icon-security"></icon-font>
              登陆
            </a-button>

          </a-form>
        </div>
      </a-spin>
    </a-layout-sider>
  </a-layout>
</template>

<script>

import {PRINCIPAL_ACTION_TYPE} from "@/store/principal"

export default {
  name:"Login",
  data() {
    return {
      spinning:false,
      captcha: {
        generateMapping:{
          picture:this.generatePictureCaptcha
        },
        submitFormMapping: {
          picture:this.getPictureCaptchaField
        },
        data:{},
        pictureCaptchaUrl:"",
        submit:false
      },
      form: {
        username: "",
        password: "",
        rememberMe: true,
        type: "Username",
        captcha:""
      },
      rules: {
        username: { required: true, message: '请输入登陆账户', trigger: 'blur' },
        password: { required: true, message: '请输入登陆密码', trigger: 'blur' },
        captcha: { required: true, message: '请输入验证码', trigger: 'blur' }
      }
    }
  },
  created() {
    let _this = this;
    _this.$http.get("/authentication/prepare").then(this.validCaptcha);
  },
  methods: {
    validCaptcha:function(error) {

      this.spinning = false;

      if (error.data.executeCode === "1001") {
        this.captcha.submit = true;
        this.captcha.data = error.data.data;

        this.captcha.generateMapping[this.captcha.data.type]();
      }

    },
    getPictureCaptchaField:function() {
      this.form["_pictureCaptcha"] = this.form.captcha;
      this.form[this.captcha.data.paramName] = this.captcha.data.token.name;
    },
    generatePictureCaptcha:function() {
      this.captcha.pictureCaptchaUrl = "/captcha/generateCaptcha?" + this.captcha.data.paramName + "=" + this.captcha.data.token.name + "&height=30&time=" + new Date().getTime();
    },
    submitForm:function(form) {
      let _this = this;
      _this.$refs[form].validate().then(() => {

        if (this.captcha.submit) {
          this.captcha.submitFormMapping[this.captcha.data.type]();
        }

        _this.spinning = true;

        this
            .$store
            .dispatch(PRINCIPAL_ACTION_TYPE.Login, _this.formUrlencoded(_this.form))
            .then(() => {

              let requestPath = sessionStorage.getItem("requestPath");

              if (requestPath !== null) {
                _this.$router.push(requestPath);
                sessionStorage.removeItem("requestPath");
              } else {
                _this.$router.push("/");
              }

            })
            .catch(this.validCaptcha);

      });
    }
  }
}
</script>