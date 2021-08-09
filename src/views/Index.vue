<template>
  <a-layout>

    <a-layout-sider class="main-aside" width="260">
      <div class="logo">
        <a-row>
          <a-col :span="24">
            <img alt="Dactiv logo" src="../assets/logo.png">
            <span> Dactiv </span>
          </a-col>
        </a-row>
      </div>
      <div class="main-menu">
        <a-menu mode="inline">
          <recursion-menu :data="this.menus" />
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout class="main-container">

      <a-layout-header class="header-navbar">
        <a-row>
          <a-col :span="16">
            <a-menu mode="horizontal" class="left">
              <a-menu-item key="1"><icon-font type="icon-arrow-left-circle" /></a-menu-item>
              <a-menu-item key="2"><icon-font type="icon-calendar" /></a-menu-item>
              <a-menu-item key="3"><icon-font type="icon-comment" /></a-menu-item>
            </a-menu>
          </a-col>
          <a-col :span="8">
            <a-menu mode="horizontal" class="float-right right">
              <a-menu-item key="1"><icon-font type="icon-moon" /></a-menu-item>
              <a-sub-menu key="2">
                <template #title>
                  <a-avatar size="medium" ></a-avatar>
                </template>
                <a-menu-item key="2-1"><a-button type="text"><icon-font type="icon-user" /> {{ principal.username }}</a-button></a-menu-item>
                <a-menu-item key="2-2"><a-button type="text"><icon-font type="icon-setting" /> 系统设置</a-button> </a-menu-item>
                <a-menu-item key="2-4"><a-button type="text" @click="logout()"><icon-font type="icon-sign-out" /> 注销账户</a-button></a-menu-item>
              </a-sub-menu>
            </a-menu>
          </a-col>
        </a-row>
      </a-layout-header>

      <a-layout-content class="main-content">
        <router-view />
      </a-layout-content>

      <a-layout-footer class="main-footer text-center">COPYRIGHT © 2021 Dactiv, All rights ReservedHand-crafted & Made with </a-layout-footer>

    </a-layout>
  </a-layout>
</template>

<script>

import RecursionMenu from '../components/RecursionMenu.vue'

export default {
  name: 'Index',
  components:{RecursionMenu},
  created() {
    this.getMenus();
  },
  methods: {
    logout:function() {
      this.$router.push('/login');
    },
    getMenus:function() {

      let _this = this;

      _this.$http
          .get("/authentication/resource/getConsolePrincipalResources",{
            params: {
              type:"Menu",
              mergeTree:true
            }
          })
          .then(response => _this.menus = response);
    }
  },
  data() {
    return {
      principal: JSON.parse(localStorage.getItem(process.env.VUE_APP_PRINCIPAL_NAME)),
      menus: {}
    }
  }
}
</script>