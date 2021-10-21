<template >
  <a-drawer :width="950" placement="right" :closable="false" :afterVisibleChange="visibleChange" v-model:visible="this.visible" class="chat">
    <a-layout class="height-100-percent">
      <a-layout-sider class="main-aside border-right" :width="250">
        <a-row class="height-100-percent">
          <a-col :span="6" class="tool-bar border-right">
            <div class="text-center margin-top-15">
              <a-avatar :src="this.principal.details.avatar">
                {{ this.principal.getName(this.principal.details).substring(0, 1) }}
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

    _this
        .$http
        .get("/socket-server/chat/getRecentContacts")
        .then((r) => {

          let data = r.data.data;
          if (!data || data.length <= 0) {
            return ;
          }
          this.getRecentContactsProfile(data);
        });

    window.onfocus = () => {
      _this.hasFocus = true;
      if (!_this.current && !_this.visible) {
        return ;
      }
      _this.readMessage(_this.current.id);
    };

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

        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(_this.contacts));
        if (this.visible) {
          this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
        }
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
          localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(_this.contacts));

          if (_this.current && contact.id === _this.current.id && _this.hasFocus) {
            _this.readMessage(_this.current.id)
          }

          this.$emit('messageCountChange', _this.messageCount);
        } else {
          _this
              .$http
              .get("/authentication/getPrincipalProfile?type=Console&ids=" + json.data.id)
              .then((r) => {
                let data = r.data.data[0];
                json.data.title = this.principal.getName(data);
                json.data.avatar = data.avatar;

                _this.contacts.unshift(json.data);
                localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(_this.contacts));

                if (_this.current && contact.id === _this.current.id && _this.hasFocus) {
                  _this.readMessage(_this.current.id);
                }

                this.$emit('messageCountChange', _this.messageCount);
              });
        }

        if (this.visible) {
          this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
        }
      }
    });
  },
  methods:{
    getRecentContactsProfile(data) {
      let param = {
        type:"Console",
        ids:data
      }
      this
          .$http
          .post("/authentication/getPrincipalProfile",this.formUrlencoded(param))
          .then(r => {
            let data = r.data.data;
            data.forEach(d => {
              this.contacts = this.contacts || [];
              let current = this.contacts.find(c => c.id === d.id);
              if (current) {
                let index = this.contacts.indexOf(current);
                this.contacts[index].title = this.principal.getName(d);
              } else {
                this.contacts.push({
                  id:d.id,
                  title:this.principal.getName(d),
                  messages:[],
                  lastMessage:""
                })
              }
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
              this.getUnreadMessages();
            })
          })
    },
    getLocalStorageContactName(id) {
      return process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME +"_" + id;
    },
    getUnreadMessages() {
      this
          .$http
          .get("/socket-server/chat/getUnreadMessages")
          .then(r => {
            let messages = r.data.data;
            messages.forEach(m => {
              let exist = this.contacts.find(c => c.id === m.id);
              if (exist) {
                let index = this.contacts.indexOf(exist);
                m.messages.forEach(record => {
                  let currentMessages = this.contacts[index].messages;
                  if (currentMessages.find(cm => cm.id === record.id)) {
                    return ;
                  }
                  record.status = "unread";
                  record.tooltip = "待查阅";
                  this.contacts[index].messages.push(record);

                });
                this.contacts[index].lastMessage = m.lastMessage;
                this.contacts[index].lastSendTime = m.lastSendTime;
              } else {
                this.contacts.unshift(m);
              }
              this.$emit('messageCountChange', this.messageCount);
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            });
          });
    },
    visibleChange(visible) {
      if (visible && this.current) {
        this.readMessage(this.current.id);
      }
    },
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
            contact.messages[index] = r.data.data;
            contact.messages[index].status = "success";
            contact.messages[index].tooltip = "待查阅";
            localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
          })
          .catch((r) => {
            contact.messages[index].status = "fail";
            contact.messages[index].tooltip = r.data.message;
            localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

            this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
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
                          name : this.principal.getName(u),
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
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
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

      let unreadMessages = this.current.messages.filter(m => m.status === "unread");
      if (unreadMessages.length > 0) {
        let messages = {};

        unreadMessages.forEach(m => messages[m.id] = m.filenames);

        let param = {senderId:this.current.id,messages:messages};

        this
            .$http
            .post("/socket-server/chat/readMessage", param)
            .then(() => {
              unreadMessages.forEach(m => {
                m.status = "read";
                m.tooltip = "已阅";
              });
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
              this.$emit('messageCountChange', this.messageCount);
            });

      }
    }
  },
  data() {
    return {
      hasFocus:true,
      selectedToolBar:["message"],
      current: undefined,
      visible: false,
      contacts: JSON.parse(localStorage.getItem(this.getLocalStorageContactName(this.principal.details.id))) || [],
      inputContent:"",
      tab:"message",
      groupData:[{ name: '联系人', id: 'root', slots : { icon: 'root' }}]
    }
  }
}
</script>