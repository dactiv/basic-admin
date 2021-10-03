<template>
  <a-drawer :width="950" placement="right" :closable="false" v-model:visible="this.visible" class="chat">
    <a-layout class="height-100-percent">
      <a-layout-sider class="main-aside border-right" :width="250">
        <a-row class="height-100-percent">
          <a-col :span="6" class="tool-bar border-right">
            <div class="text-center margin-top-15">
              <a-avatar :src="this.principal.details.avatar">
                {{ (this.principal.details.realName || this.principal.details.username).substring(0, 1) }}
              </a-avatar>
              <a-menu mode="vertical" class="margin-top-10" @select="toolbarSelect" :selectedKeys="selectedToolBar">
                <a-menu-item key="message">
                  <a-badge :count="this.messageCount">
                    <icon-font class="icon" type="icon-message" />
                  </a-badge>
                </a-menu-item>
                <a-menu-item key="group">
                  <icon-font class="icon" type="icon-group" />
                </a-menu-item>
              </a-menu>
            </div>
          </a-col>
          <a-col :span="18" class="height-100-percent">
            <div class="search">
              <a-input placeholder="搜索" />
            </div>
            <div class="left-content">
              <a-menu v-if="this.tab === 'message'" @click="selectContact" mode="vertical">
                <a-menu-item v-for="c of this.contacts" :key="c.id" >
                  <a-space :size="10">
                    <a-avatar :src="c.avatar" >
                      {{ c.title.substring(0, 1) }}
                    </a-avatar>
                    <div>
                      <a-typography-text :style="{width: '120px'}" :ellipsis="true" strong class="contacts-name display-block">{{ c.title }}</a-typography-text>
                      <a-typography-text :style="{width: '120px'}" :ellipsis="true" type="secondary" class="contacts-message display-block">{{ c.lastMessage }}</a-typography-text>
                    </div>
                  </a-space>
                </a-menu-item>
              </a-menu>
              <div v-if="this.tab === 'group'">
                <a-tree @select="addContact" show-icon :load-data="loadGroupData" :replaceFields="{title:'name', key:'id'}" :tree-data="this.groupData">
                  <template #group>
                    <icon-font class="icon" type="icon-folder-close" />
                  </template>
                  <template #root>
                    <icon-font class="icon" type="icon-profile" />
                  </template>
                  <template #title="{name, id, avatar}">
                    <div v-if="id.includes('user-')" class="group-user">
                      <a-avatar size="small" :src="avatar">
                        {{name.substring(0,1)}}
                      </a-avatar>
                      <a-typography-text strong>{{ name }}</a-typography-text>
                    </div>
                    <a-typography-text v-else>{{ name }}</a-typography-text>
                  </template>
                </a-tree>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="border-bottom">
          <a-row>
            <a-col :span="20">
              <a-space v-if="this.current" :size="10" :color="this.current.status">
                <a-avatar :src="this.current.avatar" >
                  {{ this.current.title.substring(0,1) }}
                </a-avatar>
                <a-typography-text strong>{{ this.current.title }}</a-typography-text>
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
            <template v-if="this.current">
              <div v-for="m of this.current.messages" :key="m.id" :class="m.id !== (this.principal.details.id + '') ? '' : 'text-right'">
                <a-space :size="15" align="start" >
                  <template v-if="m.id !== this.principal.details.id + ''">
                    <a-avatar :src="m.avatar" class="basic-box-shadow" >
                    </a-avatar>
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
            <QuillEditor theme="snow" v-model:content="this.inputContent" content-type="html" />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-drawer>
</template>

<script>
import {QuillEditor} from "@vueup/vue-quill";

import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@/assets/css/quill.css'

export default {
  name: "Chat",
  components: {QuillEditor},
  methods:{
    toolbarSelect(info) {
      this.tab = info.key;
      this.selectedToolBar = [info.key];
    },
    loadGroupData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.dataRef.children) {
          resolve();
          return;
        }

        let param = {};
        if (treeNode.eventKey === "root") {
          param["filter_[parent_id_eqn]"] = "true";
        } else {
          param["filter_[parent_id_eq]"] = treeNode.eventKey;
        }

        this
            .$http
            .post("/authentication/group/find", this.formUrlencoded(param))
            .then(r => {

              treeNode.dataRef.children = r.data.data || [];
              if (treeNode.dataRef.children.length > 0) {
                treeNode.dataRef.children.forEach(c => {
                  c.slots = { icon: 'group' };
                  c.id = "group-" + c.id;
                });
              }

              if (treeNode.eventKey !== "root") {
                this
                    .$http
                    .get("/authentication/console/user/findByGroup?groupId=" + treeNode.eventKey.replace("group-",""))
                    .then(u => {
                      let users = u.data.data;
                      users.forEach(u => {
                        if (u.id === this.principal.details.id) {
                          return ;
                        }
                        treeNode.dataRef.children.push({
                          name : u.realName || u.username,
                          id: "user-" + u.id,
                          avatar: u.avatar,
                          isLeaf: true,
                        });
                      });
                    });
              }

              resolve();

            });
      });
    },
    addContact(selectedKeys, info) {
      if (!info.node.dataRef.isLeaf) {
        return ;
      }
      let contact = {
        id:selectedKeys[0].replaceAll("user-",""),
        type:"friend",
        title: info.node.dataRef.name,
        avatar: info.node.dataRef.avatar,
        messages:[],
        lastMessage:"",
      }
      if (this.contacts.filter(c => c.id === contact.id).length === 0) {
        this.contacts.unshift(contact);
        localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(this.contacts));
      }
      this.current = contact;
      this.tab = "message";
      this.selectedToolBar = ["message"];
    },
    selectContact(record){

      if (this.current && this.current.id === record.key) {
        return ;
      }

      this.current = this.contacts.find(c => c.id === record.key);
    },
  },
  data() {
    return {
      selectedToolBar:["message"],
      messageCount:0,
      current: undefined,
      visible: false,
      contacts:[],
      inputContent:"",
      tab:"message",
      groupData:[{ name: '联系人', id: 'root', slots : { icon: 'root' }}]
    }
  }
}
</script>