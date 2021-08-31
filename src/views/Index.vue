<template>
  <a-layout>

    <a-layout-header :class="menu.collapsed ? 'header-navbar basic-box-shadow toggle' : 'header-navbar basic-box-shadow'">
      <a-row>
        <a-col :span="16">
          <a-menu mode="horizontal" class="left">
            <a-menu-item key="1" @click="toggleCollapsed" class="hidden-xs"><icon-font class="icon" :type="this.menu.collapsed ? 'icon-arrow-right-circle' : 'icon-arrow-left-circle'" /></a-menu-item>
            <a-menu-item key="2">
              <a-badge :count="badge.calendar">
                <icon-font class="icon" type="icon-calendar" />
              </a-badge>
            </a-menu-item>
            <a-menu-item key="3">
              <a-badge :count="badge.message" >
                <icon-font class="icon" type="icon-comment" />
              </a-badge>
            </a-menu-item>
          </a-menu>
        </a-col>
        <a-col :span="8">

          <a-menu mode="horizontal" class="float-right right">
            <a-menu-item key="1"><icon-font class="icon" type="icon-moon" /></a-menu-item>
            <a-sub-menu key="2">
              <template #title>
                <a-avatar :src="require('../assets/avatar/男生-紫.png')" ></a-avatar>
              </template>
              <a-menu-item key="2-1"><a-button type="text"><icon-font class="icon" type="icon-profile" /> {{ this.principal.details.username }}</a-button></a-menu-item>
              <a-menu-item key="2-2"><a-button type="text"><icon-font class="icon" type="icon-setting" /> 系统设置</a-button> </a-menu-item>
              <a-menu-item key="2-4"><a-button type="text" @click="logout()"><icon-font class="icon" type="icon-sign-out" /> 注销账户</a-button></a-menu-item>
            </a-sub-menu>
          </a-menu>

        </a-col>
      </a-row>
    </a-layout-header>

    <a-layout>

      <a-layout-sider class="main-aside" width="260" v-model:collapsed="menu.collapsed" :trigger="null" collapsible>
        <div class="logo">
          <router-link to='/'>
            <a-space>
            <icon-font type="icon-vue" />
            <span v-if="!menu.collapsed"> Dactiv </span>
            </a-space>
          </router-link>
        </div>
        <div class="main-menu">
          <a-spin :spinning="spinning" tip="初始化导航...">
            <a-menu mode="inline" :selectedKeys="menu.selectedKeys" :openKeys="menu.openKeys" @openChange="menuOpen" @select="menuSelect">
              <recursion-menu :data="this.principal.details.menus" />
            </a-menu>
          </a-spin>
        </div>
      </a-layout-sider>

      <a-layout-content :class="menu.collapsed ? 'main-content toggle' : 'main-content'">
        <div class="header-navbar-shadow"></div>
        <router-view />
      </a-layout-content>

    </a-layout>

    <a-layout-footer :class="menu.collapsed ? 'main-footer toggle text-center' : 'main-footer text-center'">COPYRIGHT © 2021 Dactiv, All rights ReservedHand-crafted & Made with </a-layout-footer>

  </a-layout>

</template>

<script>

import RecursionMenu from '@/components/RecursionMenu.vue'
import { PRINCIPAL_ACTION_TYPE, PRINCIPAL_MUTATION_TYPE } from "@/store/principal"

export default {
  name: "Index",
  components:{RecursionMenu},
  created() {

    let _this = this;

    window.onresize = () => {
      return (() => {
        if (document.body.clientWidth < 768) {
          _this.menu.collapsed = true;
        } else {
          let collapsed = localStorage.getItem("menu-collapsed");

          if (collapsed !== "true") {
            _this.menu.collapsed = false;
          }
        }
      })()
    }

    let collapsed = localStorage.getItem("menu-collapsed");

    if (collapsed === "true") {
      _this.menu.collapsed = true;
    }

    _this.$http
        .get("/authentication/prepare")
        .then(r => {
          if (r.data.data.authentication === true) {
            _this.getMenus();
          } else {
            _this.$router.push("/login");
          }
        }).catch(() => _this.$router.push("/login"))

  },
  methods: {
    menuSelect(item) {
      this.menu.selectedKeys = [item.key];
    },
    menuOpen(keys) {
      this.menu.openKeys = keys.filter(key => this.menu.openKeys.indexOf(key) === -1);
    },
    toggleCollapsed() {
      this.menu.collapsed = !this.menu.collapsed;
      localStorage.setItem("menu-collapsed", this.menu.collapsed);
    },
    logout() {
      this.$store.dispatch(PRINCIPAL_ACTION_TYPE.Logout).then(() => this.$router.push(process.env.VUE_APP_LOGIN_PAGE));
    },
    setMenus(response) {

      let details = JSON.parse(JSON.stringify(this.principal.details));

      details.menus = response.data.data;

      this.$store.commit(PRINCIPAL_MUTATION_TYPE.SetPrincipal, details);

      this.spinning = false;

    },
    getMenus() {

      if (this.principal.details.menus.length === 0) {
        this.spinning = true;
        this.$http
            .get("/authentication/resource/getConsolePrincipalResources", {
              params: {
                type: "Menu",
                mergeTree: true
              }
            })
            .then(this.setMenus);
      }
    },
  },
  data() {
    return {
      screenWidth: document.body.clientWidth,
      badge:{
        calendar:0,
        message:0
      },
      spinning: false,
      menu: {
        collapsed: document.body.clientWidth <= 768,
        selectedKeys:[this.$route.meta.selectMenu ? this.$route.meta.selectMenu : this.$route.path],
        openKeys:[this.$route.meta.parent]
      }
    }
  }
}
</script>