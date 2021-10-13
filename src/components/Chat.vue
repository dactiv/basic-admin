<template >
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
                    <a-badge :count="c.messages.filter(m => m.status === 'unread').length" :offset="[x=-25, y=0]">
                      <a-avatar :src="this.getUserAvatarByUserId(c.id)" >
                        {{ c.title.substring(0, 1) }}
                      </a-avatar>
                    </a-badge>
                    <div>
                      <a-typography-text :style="{width: '120px'}" :ellipsis="true" strong class="contacts-name display-block" :content="c.title" />
                      <a-typography-text :style="{width: '120px'}" :ellipsis="true" type="secondary" class="contacts-message display-block" :content="c.lastMessage" />
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
                  <template #title="{name, id}">
                    <div v-if="id.includes('user-')" class="group-user">
                      <a-avatar size="small" :src="this.getUserAvatarByUserId(id.replace('user-',''))">
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
                <a-avatar :src="this.getUserAvatarByUserId(this.current.id)" >
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
          <div class="message" ref="message-content">
            <template v-if="this.current">
              <div v-for="m of this.current.messages" :key="m.id">

                <div class="text-center margin-top-10 margin-bottom-10">
                  <a-typography-text type="secondary">{{this.timestampFormat(m.creationTime)}}</a-typography-text>
                </div>

                <div :class="m.senderId !== this.principal.details.id ? '' : 'text-right'">
                  <a-space :size="15" align="start" >
                    <template v-if="m.senderId !== this.principal.details.id">
                      <a-avatar :src="this.getUserAvatarByUserId(this.current.id)" class="basic-box-shadow" >
                        {{this.current.title.substring(0,1)}}
                      </a-avatar>
                      <div class="message-content">
<!--                    <div v-for="c of m.content" :key="c">-->
                        <a-space>
                          <a-card class="border-radius-4 basic-box-shadow" v-html="m.content">
                          </a-card>
                          <a-tooltip :title="m.tooltip">
                            <a-typography-text :type="m.status === 'sending' || m.status === 'success' || m.status === 'unread' ? 'secondary' : m.status === 'read' ? 'success' : 'warning'">
                              <icon-font :spin="m.status === 'sending'" class="icon" :type="m.status === 'sending' ? 'icon-refresh' : m.status === 'fail' ? 'icon-error' :  'icon-success'" />
                            </a-typography-text>
                          </a-tooltip>
                        </a-space>
<!--                    </div>-->
                      </div>
                    </template>
                    <template v-else>
                      <div class="message-content">
<!--                    <div v-for="c of m.content" :key="c">-->
                          <a-space>
                            <a-tooltip :title="m.tooltip">
                              <a-typography-text :type="m.status === 'sending' || m.status === 'success' ? 'secondary' : m.status === 'read' ? 'success' : 'warning'">
                                <icon-font :spin="m.status === 'sending'" class="icon" :type="m.status === 'sending' ? 'icon-refresh' : m.status === 'fail' ? 'icon-error' : 'icon-success'" />
                              </a-typography-text>
                            </a-tooltip>
                            <a-card class="border-radius-4 basic-box-shadow self" v-html="m.content">
                            </a-card>
                          </a-space>
<!--                    </div>-->
                      </div>
                      <a-avatar :src="this.principal.details.avatar" class="basic-box-shadow">
                        我
                      </a-avatar>
                    </template>
                  </a-space>
                </div>
              </div>
            </template>
          </div>
          <div class="input border-top" v-if="this.current">
            <QuillEditor ref="editor" theme="snow" v-model:content="this.inputContent" @keyup.ctrl.enter="send()" content-type="html" />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-drawer>
</template>

<script>

import {QuillEditor} from "@vueup/vue-quill";
import { SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE } from "@/store/socketIo"

import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@/assets/css/quill.css'

export default {
  name: "Chat",
  components: {QuillEditor},
  emits: ['messageCountChange'],
  computed:{
    messageCount() {
      return this.contacts.reduce((sum, o) => sum + o.messages.filter(m => m.status === "unread").length, 0);
    }
  },
  mounted() {

    let _this = this;

    window.onfocus = () => {
      _this.hasFocus = true;
      if (!_this.current && !_this.visible) {
        return ;
      }
      _this.readMessage(_this.current.id);
    };

    this.$emit('messageCountChange', _this.messageCount);

    window.onblur = () => _this.hasFocus = false;

    _this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE,
      callback:(data) => {
        let json = JSON.parse(data);
        let contact = _this.contacts.find(c => c.id === json.data.id);
        let index = _this.contacts.indexOf(contact);

        json.data.messageIds.forEach(id => {
          _this.contacts[index].messages.find(m => m.id === id).status = "read";
          _this.contacts[index].tooltip = "已阅";
        });

        localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(_this.contacts));
        this.$emit('messageCountChange', _this.messageCount);
      }
    })

    _this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.CHAT_MESSAGE,
      callback:(data) => {
        let json = JSON.parse(data);
        let contact = _this.contacts.find(c => c.id === json.data.id);

        json.data.messages.forEach(m => m.status = "unread");

        if (contact) {
          json.data.messages.forEach(m => contact.messages.push(m));
          contact.lastMessage = json.data.lastMessage;
          localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(_this.contacts));
          _this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
          this.$emit('messageCountChange', _this.messageCount);
          if (_this.current && contact.id === _this.current.id && _this.hasFocus && _this.visible) {
            _this.readMessage(_this.current.id)
          }
        } else {
          _this
              .$http
              .get("/authentication/getPrincipalProfile?type=Console&id=" + json.data.id)
              .then((r) => {
                json.data.title = r.data.data.username || r.data.data.realName;
                json.data.avatar = r.data.data.avatar;
                _this.contacts.unshift(json.data);
                localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(_this.contacts));
                _this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
                this.$emit('messageCountChange', _this.messageCount);
                if (_this.current && contact.id === _this.current.id && _this.hasFocus && _this.visible) {
                  _this.readMessage(_this.current.id);
                }
              });
        }
      }
    });
  },
  methods:{
    send() {
      let param = {
        recipientId:this.current.id,
        content:this.inputContent
      };

      let contact = this.contacts.find(c => c.id === param.recipientId);
      contact.messages = contact.messages || [];

      let msg = {
        senderId: this.principal.details.id,
        creationTime: this.currentTimeStamp,
        status: "sending",
        tooltip:"发送中。。",
        content:param.content,
      }

      contact.messages.push(msg);

      let index = contact.messages.indexOf(msg);

      this
          .$http
          .post("/socket-server/chat/sendMessage", this.formUrlencoded(param))
          .then((r) =>{
            contact.messages[index].id = r.data.data;
            contact.messages[index].status = "success";
            contact.messages[index].tooltip = "待查阅";
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(this.contacts));
          })
          .catch((r) => {
            contact.messages[index].status = "fail";
            contact.messages[index].tooltip = r.data.message;
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(this.contacts));
          });

      this.$refs["editor"].setContents("");
      this.inputContent = "";
      this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
    },
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
        id:selectedKeys[0].replaceAll("user-","") * 1,
        title: info.node.dataRef.name,
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

      this.readMessage(record.key);
    },
    readMessage(id) {

      if (!this.visible) {
        return ;
      }

      this.current = this.contacts.find(c => c.id === id);
      this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);

      let unreadMessages = this.current.messages.filter(m => m.status === "unread")
      if (unreadMessages.length > 0) {
        let unreadMessageIds = [];

        unreadMessages.forEach(m => unreadMessageIds.push(m.id));
        let param = {senderId:this.current.id,messageIds:unreadMessageIds};

        this
            .$http
            .post("/socket-server/chat/readMessage", this.formUrlencoded(param))
            .then(() => {
              unreadMessages.forEach(m => {
                m.status = "read";
                m.tooltip = "已阅";
              });
              localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME, JSON.stringify(this.contacts));
              this.$emit('messageCountChange', this.messageCount);
            })

      }
    }
  },
  data() {
    return {
      hasFocus:true,
      selectedToolBar:["message"],
      current: undefined,
      visible: false,
      contacts: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME)) || [],
      inputContent:"",
      tab:"message",
      groupData:[{ name: '联系人', id: 'root', slots : { icon: 'root' }}]
    }
  }
}
</script>