<template>
  <a-layout>

    <a-layout-sider class="main-aside" width="260" v-model:collapsed="menu.collapsed" :trigger="null" collapsible>
      <div class="logo display-flex">
          <img alt="Dactiv logo" src="../assets/logo.png">
          <span class="display-block" v-if="!menu.collapsed"> Dactiv </span>
      </div>
      <div class="main-menu">
        <a-menu mode="inline" :selectedKeys="menu.selectedKeys" :openKeys="menu.openKeys">
          <recursion-menu :data="this.menu.data" />
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout :class="menu.collapsed ? 'main-container toggle' : 'main-container'">

      <a-layout-header class="header-navbar">
        <a-row>
          <a-col :span="16">
            <a-menu mode="horizontal" class="left">
              <a-menu-item key="1" @click="toggleCollapsed"><icon-font :type="this.menu.collapsed ? 'icon-arrow-right-circle' : 'icon-arrow-left-circle'" /></a-menu-item>
              <a-menu-item key="2"><icon-font type="icon-calendar" /></a-menu-item>
              <a-menu-item key="3"><icon-font type="icon-comment" /></a-menu-item>
            </a-menu>
          </a-col>
          <a-col :span="8">

            <a-menu mode="horizontal" class="float-right right">
              <a-menu-item key="1"><icon-font type="icon-moon" /></a-menu-item>
              <a-sub-menu key="2">
                <template #title>
                  <a-avatar :src="require('../assets/avatar/男生-紫.png')" ></a-avatar>
                </template>
                <a-menu-item key="2-1"><a-button type="text"><icon-font type="icon-profile" /> {{ this.principal.details.username }}</a-button></a-menu-item>
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

import RecursionMenu from '@/components/RecursionMenu.vue'
import {PRINCIPAL_ACTION_TYPE} from "@/store/principal"

export default {
  name: 'Index',
  components:{RecursionMenu},
  created() {
    this.getMenus();

    let collapsed = localStorage.getItem("menu-collapsed");

    if (collapsed === "true") {
      this.menu.collapsed = true;
    }
  },
  methods: {
    toggleCollapsed:function() {
      this.menu.collapsed = !this.menu.collapsed;
      localStorage.setItem("menu-collapsed", this.menu.collapsed);
    },
    logout:function() {
      let _this = this;
      this.$store.dispatch(PRINCIPAL_ACTION_TYPE.Logout).then(() => _this.$router.push('/login'));
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
          .then(response => _this.menu.data = response);
    },
  },
  data() {
    return {
      menu: {
        collapsed: false,
        selectedKeys:[this.$route.meta.selectMenu ? this.$route.meta.selectMenu : this.$route.path],
        openKeys:[this.$route.meta.parent],
        data:[]
      }
    }
  }
}
</script>