<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 用户设置 </a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="系统设置" class="basic-box-shadow" style="max-width: 768px;margin:0 auto">

    <template #extra>
      <icon-font class="icon" type="icon-setting" />
    </template>

    <div class="text-center">
      <a-avatar :size="64" :src="require('@/assets/avatar/男生-紫.png')">
      </a-avatar>
      <a-typography-title class="margin-top-15" :level="4" type="secondary">{{ this.principal.details.username }}</a-typography-title>
      <a-typography-title class="margin-top-15" :level="5" disabled>所在组:{{ this.principal.details.roleAuthorityStrings }}</a-typography-title>
    </div>

    <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

      <a-divider orientation="left">修改密码</a-divider>

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="旧密码:" name="oldPassword">
            <a-input-password v-model:value="form.oldPassword" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="新密码:" name="newPassword">
            <a-input-password v-model:value="form.newPassword" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="确认密码:" name="confirmPassword">
            <a-input-password v-model:value="form.confirmPassword" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-space :size="10">
        <a-button type="primary">
          <icon-font class="icon" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-form>

  </a-card>
</template>

<script>

export default {
  name: "AuthenticationConsoleUserProfile",
  methods:{
    async validatePassword() {
      if (this.form.confirmPassword !== this.form.password) {
        return Promise.reject('登陆密码与确认密码不一致');
      } else {
        return Promise.resolve();
      }
    }
  },
  data() {
    return {
      form: {
        oldPassword:"",
        newPassword:"",
        confirmPassword:""
      },
      rules:{
        oldPassword:[{ required: true, message: "请输旧密码", trigger: "change"}],
        newPassword: [
          { required: true, message: "请输新密码", trigger: "change"},
          {type:"string", pattern: /^(?!^[0-9a-z]+$)(?!^[0-9A-Z]+$)(?!^[0-9\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[a-zA-Z]+$)(?!^[a-z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)(?!^[A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$)[a-z0-9A-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+$/, message:"密码段中在要求的四种(大写字母，小写字母，数字，标点符号)类型中至少存在三种"}
        ],
        confirmPassword: [
          { required: true, message: "请输入确认密码", trigger: "change" },
          { validator:this.validatePass, trigger: "change"}
        ],
      }
    }
  }
}

</script>
