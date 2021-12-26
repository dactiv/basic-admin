<template>

  <chat ref="chat" v-model:visible="chatVisible" @messageCountChange="messageCountChange"/>

  <a-layout class="height-100-percent">

    <a-layout-header :class="menu.collapsed ? 'header-navbar border-radius-lg basic-box-shadow toggle' : 'header-navbar border-radius-lg basic-box-shadow'">
      <a-row type="flex" justify="space-between">
        <a-col :span="8">
          <a-menu mode="horizontal" class="left">
            <a-menu-item key="1" @click="toggleCollapsed" class="hidden-xs">
              <icon-font class="icon" :type="menu.collapsed ? 'icon-arrow-right-circle' : 'icon-arrow-left-circle'" />
            </a-menu-item>
            <a-menu-item key="2" v-if="connected" @click="chatVisible = !chatVisible">
              <a-badge :count="messageCount">
                <icon-font class="icon" type="icon-message" />
              </a-badge>
            </a-menu-item>
          </a-menu>
        </a-col>
        <a-col :span="16">

          <a-menu mode="horizontal" class="right">
            <a-menu-item key="dark"><icon-font class="icon" type="icon-moon" /></a-menu-item>
            <a-sub-menu key="profile">
              <template #icon>
                <a-badge dot :status="connected ? 'success' : 'default'" :offset="[-3, 45]">
                  <a-avatar :src="principal.details.avatar">
                    {{ getPrincipalName(this.principal.details).substring(0, 1) }}
                  </a-avatar>
                </a-badge>
              </template>
              <template #title>{{ getPrincipalName(this.principal.details) }}</template>
              <a-menu-item key="setting">
                <a-button type="text" @click="profile()">
                  <icon-font class="icon" type="icon-setting" /> 系统设置
                </a-button>
              </a-menu-item>
              <a-menu-item-group title="聊天">
                <a-menu-item key="clear-chat-cache">
                  <a-button type="text" @click="clearChatCache()">
                    <icon-font class="icon" type="icon-ashbin" /> 清除聊天缓存
                  </a-button>
                </a-menu-item>
                <a-menu-item key="online">
                  <a-button type="text" >
                    <icon-font class="icon" type="icon-wifi-on" /> 在线
                  </a-button>
                </a-menu-item>
                <a-menu-item key="ofline">
                  <a-button type="text" >
                    <icon-font class="icon" type="icon-wifi-off" /> 离线
                  </a-button>
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider />
              <a-menu-item key="logout">
                <a-button type="text" @click="logout()">
                  <icon-font class="icon" type="icon-sign-out" /> 注销账户
                </a-button>
              </a-menu-item>
            </a-sub-menu>
          </a-menu>

        </a-col>
      </a-row>
    </a-layout-header>

    <a-layout class="height-100-percent">

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
            <a-menu mode="inline" :selectedKeys="menu.selectedKeys" :openKeys="menu.openKeys" @openChange="menuOpen" >
              <recursion-menu :data="principal.details.menus" />
            </a-menu>
          </a-spin>
        </div>
      </a-layout-sider>

      <a-layout-content :class="menu.collapsed ? 'main-content height-100-percent toggle' : 'main-content height-100-percent'">
        <div class="header-navbar-shadow"></div>
        <div class="content-body">
          <router-view />
        </div>
        <a-layout-footer class="main-footer text-center">COPYRIGHT © 2021 Dactiv, All rights ReservedHand-crafted & Made with </a-layout-footer>
      </a-layout-content>

    </a-layout>

  </a-layout>
</template>

<script>

import RecursionMenu from '@/components/RecursionMenu.vue'
import Chat from '@/components/chat/Chat.vue'

import { PRINCIPAL_MUTATION_TYPE } from "@/store/principal"
import { SOCKET_IO_ACTION_TYPE } from "@/store/socketIo"

export default {
  name: "Index",
  components:{RecursionMenu, Chat},
  computed:{
    connected() {
      return this.$store.state.socketIo.connected;
    }
  },
  created() {

    let _this = this;

    window.onresize = () => {
      return (() => {
        if (document.body.clientWidth < 768) {
          _this.menu.collapsed = true;
        } else {
          let collapsed = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME);

          if (collapsed !== "true") {
            _this.menu.collapsed = false;
          }
        }
      })()
    }

    let collapsed = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME);

    if (collapsed === "true") {
      _this.menu.collapsed = true;
    }

    _this.$http
        .get("/authentication/prepare")
        .then(_this.postPrepare)
        .catch(() => _this.$router.push(process.env.VUE_APP_LOGIN_PAGE));
  },
  mounted() {
    let id = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_DEVICE_IDENTIFIED_NAME);
    if (id) {
      this.$store.dispatch(SOCKET_IO_ACTION_TYPE.CONNECT,{
        transports:["websocket"],
        query:{
          did:id,
          uid:this.principal.details.id,
          username:this.principal.details.username,
          password:this.principal.details.token
        }
      });
    }
  },
  methods: {
    clearChatCache() {
      this.refs["chat"].clearCache();
      location.reload();
    },
    messageCountChange(count) {
      this.messageCount = count;
    },
    postPrepare(r) {
      let data = r.data.data;

      if (data.authentication) {
        let details = JSON.parse(JSON.stringify(this.principal.details));
        details.authentication = data.authentication;

        if (data.rememberMe === true) {
          details.rememberMe = true;
        }

        this.$store.commit(PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL, details);

      } else {
        this.$store.commit(PRINCIPAL_MUTATION_TYPE.CLEAR_PRINCIPAL);
      }

      if (this.principal.details.rememberMe === true && this.$route.meta.authentication) {
        sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME, this.$route.path);
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      } else if (this.principal.details.authentication === true) {
        this.getMenus();
      } else {
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      }

      this.saveDeviceIdentified(r);

      let _this = this;

      let offset = _this.$moment(r.data.timestamp).valueOf() - Date.now();
      _this.$moment.now = function() { return _this.$moment(Date.now() + offset); }

    },
    profile() {
      this.$router.push({name:"profile"});
    },
    menuOpen(keys) {
      this.menu.openKeys = keys.filter(key => this.menu.openKeys.indexOf(key) === -1);
    },
    toggleCollapsed() {
      this.menu.collapsed = !this.menu.collapsed;
      localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME, this.menu.collapsed);
    },
    logout() {
      this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
    },
    setMenus(response) {

      let details = JSON.parse(JSON.stringify(this.principal.details));

      details.menus = response.data.data;

      this.$store.commit(PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL, details);

      this.spinning = false;

      let requestPath = sessionStorage.getItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME);

      if (requestPath !== null) {
        this.$router.push(requestPath);
        sessionStorage.removeItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME);
      }

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
  watch: {
    $route(r) {
      this.menu.selectedKeys = [r.meta.selectMenu ? r.meta.selectMenu : r.path];
      this.menu.openKeys = [r.meta.parent];
    }
  },
  data() {
    return {
      screenWidth: document.body.clientWidth,
      messageCount:0,
      spinning: false,
      chatVisible:false,
      menu: {
        collapsed: document.body.clientWidth <= 768,
        selectedKeys:[this.$route.meta.selectMenu ? this.$route.meta.selectMenu : this.$route.path],
        openKeys:[this.$route.meta.parent]
      }
    }
  }
}
</script>