<template>

  <a-layout>

    <a-layout class="authentication-inner hidden-xs">
      <a-layout-header class="logo" />
      <a-layout-content class="display-flex align-items-center justify-content-center">
        <a-image :src="require('../assets/login.svg')" :width="747" :height="547" />
      </a-layout-content>
      <a-layout-footer class="no-margin main-footer text-center">COPYRIGHT © 2021 Dactiv, All rights ReservedHand-crafted & Made with</a-layout-footer>
    </a-layout>

    <a-layout-sider width="500" class="authentication-aside">
      <a-spin :spinning="spinning" tip="正在登陆，请稍等片刻。。。">
        <div class="authentication-aside-main">
          <h2 class="text-center">
            <span> Dactiv 管理后台 </span>
          </h2>
          <p class="text-center"> 请登陆您的账户 </p>

          <a-form ref="login-form" :model="form" :rules="rules" layout="vertical">
            <a-form-item label="登陆账户:" has-feedback name="username" autocomplete="username">
              <a-input v-model:value="form.username" />
            </a-form-item>
            <a-form-item label="登陆密码:" has-feedback name="password" autocomplete="current-password">
              <a-input-password v-model:value="form.password"/>
            </a-form-item>
            <a-form-item label="验证码:" has-feedback name="captcha" class="picture-captcha" v-if="captcha.data.type === 'picture'">
              <a-input v-model:value="form.captcha">
                <template #addonAfter>
                  <a-image :width="100" :height="30" :src="this.captcha.pictureCaptchaUrl" @click="generatePictureCaptcha()"/>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-checkbox v-model:checked="form.rememberMe"> 一周内记住我 </a-checkbox>
            </a-form-item>

            <a-button type="primary" block @click="submitForm('login-form')" :loading="spinning">
              <icon-font class="icon" v-if="!spinning" type="icon-security" /> 登陆
            </a-button>

            <a-divider class="logo"><icon-font class="icon" type="icon-vue" /></a-divider>

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
        deviceIdentified:"",
        captcha:""
      },
      rules: {
        username: [{ required: true, message: "请输入登陆账户", trigger: "blur" }],
        password: [{ required: true, message: "请输入登陆密码", trigger: "blur" }],
        captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    }
  },
  created() {

    let _this = this;

    _this.$http.get("/authentication/prepare").then(this.prepare);

  },
  methods: {
    prepare(r) {

      this.spinning = false;

      if (r.data.executeCode === process.env.VUE_APP_ERROR_CAPTCH_CODE) {
        this.captcha.submit = true;
        this.captcha.data = r.data.data;

        this.captcha.generateMapping[this.captcha.data.type]();
      }

      this.form.deviceIdentified = this.saveDeviceIdentified(r);
    },
    getPictureCaptchaField() {
      this.form["_pictureCaptcha"] = this.form.captcha;
      this.form[this.captcha.data.paramName] = this.captcha.data.token.name;
    },
    generatePictureCaptcha() {
      this.captcha.pictureCaptchaUrl = "/captcha/generateCaptcha?" + this.captcha.data.paramName + "=" + this.captcha.data.token.name + "&height=30&time=" + new Date().getTime();
    },
    submitForm(form) {
      let _this = this;
      _this.$refs[form].validate().then(() => {

        if (_this.captcha.submit) {
          _this.captcha.submitFormMapping[_this.captcha.data.type]();
        }

        _this.spinning = true;

        _this
            .$store
            .dispatch(PRINCIPAL_ACTION_TYPE.LOGIN, _this.formUrlencoded(_this.form))
            .then(() => _this.$router.push("/"))
            .catch((r) => {
              _this.prepare(r);
              _this.spinning = false;
            });

      });
    }
  }
}
</script>