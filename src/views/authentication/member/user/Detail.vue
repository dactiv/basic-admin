<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon"  type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon"  type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'member_user'}"><icon-font class="icon"  type="icon-user-groups" /> 会员用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon"  type="icon-file" /> {{ '[' + form.username + '] ' + '会员用户明细' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="'[' + form.username + '] ' + '会员用户明细'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon"  type="icon-file" />
    </template>

    <a-spin :spinning="spinning">
      <a-descriptions
          title="详情信息"
          bordered
          :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
      >

        <a-descriptions-item label="登陆账号">{{ form.username}} </a-descriptions-item>
        <a-descriptions-item label="手机号码">{{ form.phone}}</a-descriptions-item>
        <a-descriptions-item label="电子邮箱">{{ form.email }}</a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ this.timestampFormat(form.registrationTime) }}</a-descriptions-item>
        <a-descriptions-item label="是否更新密码">{{ form.initialization.modifyPassword === 1 ? "是" : "否"}}</a-descriptions-item>
        <a-descriptions-item label="是否更新用户名">{{ form.initialization.modifyUsername === 1 ? "是" : "否" }}</a-descriptions-item>
        <a-descriptions-item label="状态" :span="3" ><a-badge :status="form.status === 1 ? 'success' : form.status === 2 ? 'default' : 'warning'" :text="form.statusName" /></a-descriptions-item>

      </a-descriptions>
    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"ResourceDetail",
  data() {
    return {
      spinning:true,
      form: {
        username: "",
        phone: "",
        email: "",
        registrationTime: null,
        status: "",
        statusName: "",
        initialization:{
          modifyPassword:1,
          modifyUsername:1
        }
      }
    }
  },
  created() {

    let _this = this;

    this
        .$http
        .get("/authentication/member/user/get?id=" + this.$route.query.id)
        .then(r => {
          _this.form = r.data.data;
          _this.spinning = false
        })
        .catch(() => _this.spinning = false);

  }
}
</script>