<template>
  <a-drawer :width="950" placement="right" :closable="false" v-model:visible="this.chat.visible" class="chat">
    <a-layout class="height-100-percent">
      <a-layout-sider class="main-aside border-right" :width="250">
        <a-row class="height-100-percent">
          <a-col :span="6" class="tool-bar border-right">
            <div class="text-center margin-top-15">
              <a-avatar :src="require('../assets/avatar/男生-紫.png')" />
              <a-menu mode="vertical">
                <a-menu-item key="1" @click="this.chat.tab = 'message'">
                  <a-badge :count="this.chat.messageCount">
                  <icon-font class="icon" type="icon-message" />
                  </a-badge>
                </a-menu-item>
                <a-menu-item key="2" @click="this.chat.tab = 'group'">
                  <icon-font class="icon" type="icon-group" />
                </a-menu-item>
              </a-menu>
            </div>
          </a-col>
          <a-col :span="18">
            <div class="search">
              <a-input placeholder="搜索用户" />
            </div>
            <a-menu v-if="this.chat.tab === 'message'" @click="selectContact" mode="vertical">
              <a-menu-item v-for="c of this.chat.contacts" :key="c.id" >
                <a-space :size="10">
                  <a-badge dot :color="c.status" :offset="[-5,33]">
                    <a-avatar :src="c.icon" />
                  </a-badge>
                  <div>
                    <a-typography-text :style="{width: '120px'}" :ellipsis="true" strong class="contacts-name display-block">{{ c.username }}</a-typography-text>
                    <a-typography-text :style="{width: '120px'}" :ellipsis="true" type="secondary" class="contacts-message display-block">{{ c.lastMessage }}</a-typography-text>
                  </div>
                </a-space>
              </a-menu-item>
            </a-menu>
            <a-tree v-if="this.chat.tab === 'group'" :replaceFields="{title:'title', key:'id'}" :tree-data="this.chat.groupData" show-icon>

            </a-tree>
          </a-col>
        </a-row>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="border-bottom">
          <a-row>
            <a-col :span="20">
              <a-space v-if="this.chat.current" :size="10" :color="this.chat.current.status">
                <a-avatar :src="this.chat.current.icon" />
                <a-typography-text strong>{{ this.chat.current.username }}</a-typography-text>
              </a-space>
            </a-col>
            <a-col :span="4" class="text-right">
              <a-button type="text">
                <icon-font class="icon" type="icon-all" />
              </a-button>
            </a-col>
          </a-row>
        </a-layout-header>
        <a-layout-content class="height-100-percent">
          <div class="message">
            <template v-if="this.chat.current">
              <div v-for="m of this.chat.current.messages" :key="m.id" :class="m.id !== (this.principal.details.id + '') ? '' : 'text-right'">
                <a-space :size="15" align="start" >
                  <template v-if="m.id !== this.principal.details.id + ''">
                    <a-avatar :src="m.icon" class="basic-box-shadow" />
                    <div class="message-content">
                      <div v-for="c of m.content" :key="c">
                        <a-card class="border-radius-4 basic-box-shadow">
                          {{ c }}
                        </a-card>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="message-content">
                      <div v-for="c of m.content" :key="c" >
                        <a-card class="border-radius-4 basic-box-shadow self">
                          {{ c }}
                        </a-card>
                      </div>
                    </div>
                    <a-avatar :src="m.icon" class="basic-box-shadow" />
                  </template>
                </a-space>
              </div>
            </template>
          </div>
          <div class="input border-top">
            <QuillEditor theme="snow" v-model:content="this.chat.inputContent" content-type="html" />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-drawer>
  <a-layout class="height-100-percent">

    <a-layout-header :class="menu.collapsed ? 'header-navbar basic-box-shadow toggle' : 'header-navbar basic-box-shadow'">
      <a-row>
        <a-col :span="16">
          <a-menu mode="horizontal" class="left">
            <a-menu-item key="1" @click="toggleCollapsed" class="hidden-xs">
              <icon-font class="icon" :type="this.menu.collapsed ? 'icon-arrow-right-circle' : 'icon-arrow-left-circle'" />
            </a-menu-item>
            <a-menu-item key="2" v-if="this.connected" @click="this.chat.visible = !this.chat.visible">
              <a-badge :count="this.chat.messageCount">
              <icon-font class="icon" type="icon-message" />
              </a-badge>
            </a-menu-item>
          </a-menu>
        </a-col>
        <a-col :span="8">

          <a-menu mode="horizontal" class="float-right right">
            <a-menu-item key="1"><icon-font class="icon" type="icon-moon" /></a-menu-item>
            <a-menu-item key="2">
              <a-typography-text :type="this.connected ? 'success' : 'secondary'">
                <icon-font class="icon" :type="this.connected ? 'icon-wifi-on' : 'icon-wifi-off'" />
              </a-typography-text>
            </a-menu-item>
            <a-sub-menu key="3">
              <template #title>
                <a-space :size="20">
                  <span>{{ this.principal.details.username }}</span>
                  <a-badge dot :status="this.connected ? 'success' : 'default'" :offset="[-5,45]">
                    <a-avatar :src="require('../assets/avatar/男生-紫.png')" />
                  </a-badge>
                </a-space>
              </template>
              <a-menu-item key="3-2"><a-button type="text" @click="profile()"><icon-font class="icon" type="icon-setting" /> 系统设置</a-button> </a-menu-item>
              <a-menu-item key="3-4"><a-button type="text" @click="logout()"><icon-font class="icon" type="icon-sign-out" /> 注销账户</a-button></a-menu-item>
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
              <recursion-menu :data="this.principal.details.menus" />
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

import { PRINCIPAL_MUTATION_TYPE } from "@/store/principal"
import {SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE} from "@/store/socketIo"
import { mapState } from 'vuex'

import { QuillEditor } from '@vueup/vue-quill'

import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name: "Index",
  components:{RecursionMenu, QuillEditor},
  computed:mapState({
    connected: state => {
      return state.socketIo.connected
    }
  }),
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
  methods: {
    selectContact(record){

      if (this.chat.current && this.chat.current.id === record.key) {
        return ;
      }

      this.chat.current = this.chat.contacts.find(c => c.id === record.key);
    },
    postPrepare(r) {
      let data = r.data.data;

      if (data.authentication) {
        let details = JSON.parse(JSON.stringify(this.principal.details));
        details.authentication = data.authentication;

        if (data.rememberMe === true) {
          details.rememberMe = true;
        }

        this.$store.commit(PRINCIPAL_MUTATION_TYPE.SetPrincipal, details);

      } else {
        this.$store.commit(PRINCIPAL_MUTATION_TYPE.ClearPrincipal);
      }

      if (this.principal.details.rememberMe === true && this.$route.meta.authentication) {
        sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME, this.$route.path);
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      } else if (this.principal.details.authentication === true) {
        this.getMenus();
      } else {
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      }

      let id = this.saveDeviceIdentified(r);

      this.$store.dispatch(SOCKET_IO_ACTION_TYPE.Connect,{
        transports:["websocket"],
        query:{
          did:id,
          uid:this.principal.details.id,
          username:this.principal.details.username,
          password:this.principal.details.token
        }
      }).then((socket) => {
        socket.on(SOCKET_EVENT_TYPE.Connect, () => {
          this
              .$http
              .post("/authentication/group/find")
              .then(r => this.chat.groupData = r.data.data);
        });
      });

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

      this.$store.commit(PRINCIPAL_MUTATION_TYPE.SetPrincipal, details);

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
      spinning: false,
      chat:{
        messageCount:0,
        visible: false,
        current: undefined,
        contacts:[{
          id:"2",
          username:"admin",
          icon:"../assets/avatar/男生-紫.png",
          status:"green",
          messages:[{
            id:"2",
            creationTime:"",
            content:["你好","在吗？。。。"]
          },{
            id:"1",
            creationTime:"",
            content:["在","怎么了，发送到发撒地方"]
          },{
            id:"2",
            creationTime:"",
            content:["没什么，撒发送到发送到发撒地方阿"]
          }],
          lastMessage:"没什么",
        }],
        inputContent:"",
        tab:"message",
        groupData:[]
      },
      menu: {
        collapsed: document.body.clientWidth <= 768,
        selectedKeys:[this.$route.meta.selectMenu ? this.$route.meta.selectMenu : this.$route.path],
        openKeys:[this.$route.meta.parent]
      }
    }
  }
}
</script>