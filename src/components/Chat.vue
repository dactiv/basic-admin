<template >
  <a-drawer :width="950" placement="right" :closable="false" :afterVisibleChange="visibleChange" v-model:visible="this.visible" class="chat">
    <a-layout class="height-100-percent">
      <a-layout-sider class="main-aside border-right" :width="280">
        <a-row class="height-100-percent">
          <a-col :span="4" class="tool-bar border-right">
            <div class="text-center margin-md-top">
              <a-avatar :src="this.principal.details.avatar">
                {{ this.getPrincipalName(this.principal.details).substring(0, 1) }}
              </a-avatar>
              <a-menu mode="vertical" class="margin-top" @select="toolbarSelect" :selectedKeys="selectedToolBar">
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
          <a-col :span="20" class="height-100-percent">
            <div class="search">
              <a-input placeholder="搜索" />
            </div>
            <div class="left-content">
              <a-menu v-show="this.tab === 'message'" @click="selectContact" mode="vertical">
                <a-menu-item v-for="c of this.contacts" :key="c.id" >
                  <a-dropdown :trigger="['contextmenu']">
                    <a-row type="flex" justify="space-around" align="middle">
                      <a-col :span="4">
                        <a-badge :count="c.messages.reduce((s, m) => s + m.contents.filter(c => c.status === 'unread').length, 0)" :offset="[x=-25, y=0]">
                          <a-avatar :src="this.getPrincipalAvatarByUserId(c.id)" >
                            {{ c.title.substring(0, 1) }}
                          </a-avatar>
                        </a-badge>
                      </a-col>
                      <a-col :span="20">
                        <a-row>
                          <a-col :span="16">
                            <a-typography-text strong :ellipsis="true" class="contacts-name display-block" >
                              <icon-font v-if="c.top" class="icon" type="icon-star" />
                              <icon-font v-else-if="c.disturb" class="icon" type="icon-stop" />
                              {{c.title}}
                            </a-typography-text>
                          </a-col>
                          <a-col :span="8" class="text-right">
                            <a-typography-text v-if="c.lastSendTime" type="secondary" class="contacts-name display-block font-size-sm" :content="this.$moment(c.lastSendTime).fromNow()" />
                          </a-col>
                        </a-row>
                        <a-row type="flex" justify="space-around" align="middle">
                          <a-col :span="24">
                            <a-typography-text :ellipsis="true" type="secondary" class="contacts-message display-block" :content="c.lastMessage" />
                          </a-col>
                        </a-row>
                      </a-col>
                    </a-row>
                    <template #overlay>
                      <a-menu @click="contextMenuClick">
                        <a-menu-item :key="c.id + '-top'"><icon-font class="icon" :type="c.top ? 'icon-unstar' : 'icon-star'" /> {{c.top ? '取消置顶' : '置顶'}}</a-menu-item>
                        <a-menu-item :key="c.id + '-read'"><icon-font class="icon" type="icon-survey" /> 设置为已读</a-menu-item>
                        <a-menu-item v-if="!c.top" :key="c.id + '-disturb'">
                          <icon-font class="icon" :type="c.disturb ? 'icon-success' : 'icon-stop'" /> {{c.disturb ? '取消免打扰' : '消息免打扰'}}
                        </a-menu-item>
                        <a-menu-divider />
                        <a-menu-item :key="c.id + '-delete'"><icon-font class="icon" type="icon-error" /> 删除</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </a-menu-item>
              </a-menu>
              <div v-show="this.tab === 'group'">
                <a-tree @select="selectTreeContact" show-icon :load-data="loadGroupData" :replaceFields="{title:'name', key:'id'}" :tree-data="this.groupData">
                  <template #group>
                    <icon-font class="icon" type="icon-folder-close" />
                  </template>
                  <template #root>
                    <icon-font class="icon" type="icon-profile" />
                  </template>
                  <template #title="{name, id}">
                    <div v-if="id.includes('user-')" class="group-user">
                      <a-avatar size="small" :src="this.getPrincipalAvatarByUserId(id.replace('user-',''))">
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
      <a-layout class="overflow-hidden">
        <a-layout-header class="border-bottom">
          <a-row>
            <a-col :span="20">
              <a-space v-if="this.current.contact.id > 0" :size="10" class="padding-left">
                <a-avatar :src="this.getPrincipalAvatarByUserId(current.contact.id)" >
                  {{ this.current.contact.title.substring(0,1) }}
                </a-avatar>
                <a-typography-text strong>{{ this.current.contact.title }}</a-typography-text>
              </a-space>
            </a-col>
            <a-col :span="4" class="text-right">
              <a-button type="text">
                <icon-font class="icon" type="icon-all" />
              </a-button>
            </a-col>
          </a-row>
        </a-layout-header>
        <a-layout>
          <a-layout-content class="height-100-percent">
            <div id="message-content" class="message" ref="message-content" @scroll="messageContentScroll">
              <template v-if="this.current.contact.id > 0">
                <a-divider class="font-size-sm margin-none" v-if="!this.current.contact.lastLoadMessage">
                  <a-typography-text type="secondary">
                    <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
                  </a-typography-text>
                </a-divider>
                <div v-for="m of this.current.contact.messages" :key="m.id">

                  <div class="text-center margin-top margin-bottom">
                    <a-typography-text type="secondary">{{this.timestampFormat(m.creationTime)}}</a-typography-text>
                  </div>

                  <div v-for="c of m.contents" :key="c" :class="c.senderId !== this.principal.details.id ? 'margin-bottom' : 'margin-bottom text-right'">
                    <a-space align="start">
                        <a-avatar v-if="c.senderId !== this.principal.details.id" :src="this.getPrincipalAvatarByUserId(this.current.contact.id)" class="basic-box-shadow" >
                          {{this.current.contact.title.substring(0,1)}}
                        </a-avatar>
                        <a-space>
                          <a-tooltip :title="c.tooltip" v-if="c.senderId === this.principal.details.id">
                            <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                              <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                            </a-typography-text>
                          </a-tooltip>
                          <a-card :class="c.senderId === this.principal.details.id ? 'border-radius-4 basic-box-shadow self' : 'border-radius-4 basic-box-shadow'" v-html="c.content">
                          </a-card>
                          <a-tooltip :title="c.tooltip" v-if="c.senderId !== this.principal.details.id">
                            <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                              <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                            </a-typography-text>
                          </a-tooltip>
                        </a-space>
                        <a-avatar v-if="c.senderId === this.principal.details.id" :src="this.principal.details.avatar" class="basic-box-shadow">
                          我
                        </a-avatar>
                    </a-space>
                  </div>
                </div>

              </template>
            </div>
            <div class="input border-top" v-if="this.current.contact.id > 0">
              <QuillEditor toolbar="#chat-toolbar" ref="editor" v-model:content="this.inputContent" @keyup.ctrl.enter="send()" content-type="html">
                <template #toolbar>
                  <div id="chat-toolbar" class="border-bottom">
                    <a-row>
                      <a-col :span="18">
                        <button class="ql-bold" />
                        <button class="ql-italic" />
                        <button class="ql-link" />
                        <button class="ql-image" />
                        <button class="ql-video" />
                        <button class="ql-list" value="ordered" />
                      </a-col>
                      <a-col :span="6" class="text-right">
                        <button class="custom ql-contact-history" @click="showContactHistory">
                          <icon-font class="icon" type="icon-time" />
                        </button>
                      </a-col>
                    </a-row>
                  </div>
                </template>
              </QuillEditor>
            </div>
          </a-layout-content>
          <a-layout-sider v-if="this.current.history.show" class="contact-history height-100-percent border-left" :width="300">
            <a-input class="padding" v-model:value="this.current.history.search.text">
              <template #addonAfter>
                <a-popover v-model:visible="this.current.history.calendar.show" title="选择时间" trigger="click">
                  <template #content>
                    <a-calendar v-model:value="this.current.history.search.date" :fullscreen="false" @select="this.selectCalendar" :disabled-date="this.disabledHistoryDate">

                    </a-calendar>
                  </template>
                  <icon-font class="icon" type="icon-time" />
                </a-popover>
              </template>
            </a-input>
            <a-divider class="font-size-sm">
              <a-tag v-if="this.current.history.search.date !== ''" closable @close="this.clearSearch">
                <icon-font class="icon" type="icon-calendar" />
                {{this.dateFormat(this.current.history.search.date)}}
              </a-tag>
              消息内容
            </a-divider>
            <div id="history-content" class="history padding" ref="history-content" @scroll="messageContentScroll">
              <a-divider class="font-size-sm margin-none" v-if="this.current.history.lastLoadMessage">
                <a-typography-text type="secondary">
                  <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
                </a-typography-text>
              </a-divider>
              <div v-for="c of this.current.history.messages" :key="c.id" :class="c.senderId === this.principal.details.id ? 'self' : ''">
                <p>
                  <a-typography-paragraph>
                    <a-typography-text strong >{{this.getUsernameById(c.senderId) + " "}}</a-typography-text>
                    <a-typography-text class="font-size-sm">{{this.timestampFormat(c.creationTime)}}</a-typography-text>
                  </a-typography-paragraph>

                </p>
                <div class="margin-xss-left" v-html="c.content"></div>
              </div>
            </div>
          </a-layout-sider>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-drawer>
</template>

<script>

import {QuillEditor} from "@vueup/vue-quill";
import { SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE } from "@/store/socketIo"

import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name: "Chat",
  components: {QuillEditor},
  emits: ['messageCountChange'],
  computed:{
    messageCount() {
      return this.contacts.reduce((sum, o) => sum + o.messages.reduce((s, m) => s + m.contents.filter(c => c.status === "unread").length, 0), 0);
    }
  },
  created() {
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.IS_CONNECTED).then(this.onSocketConnect);

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CONNECT,
      callback:this.onSocketConnect
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE,
      callback:this.onReadMessage
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.CHAT_MESSAGE,
      callback:this.onChatMessage
    });

    this.current.contact = JSON.parse(JSON.stringify(this.defaultContactValue));
  },
  mounted() {
    let _this = this;

    window.onfocus = () => {
      _this.hasFocus = true;
      if (_this.current.contact.id === 0 || !_this.visible) {
        return ;
      }
      _this.readMessage(_this.current.contact);
    };

    window.onblur = () => _this.hasFocus = false;
  },
  methods:{
    showContactHistory() {
      if (this.current.contact.id === 0) {
        return ;
      }
      this.current.history.show = !this.current.history.show;

      if (this.current.history.show) {

        if (this.current.contact.messages && this.current.contact.messages.length > 0) {
          this.current.contact.messages.flatMap(m => m.contents).forEach((d) => {
            this.current.history.messages.push(d)
            this.current.history.loadMessages.unshift(d);
          });
        }

        this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
      }
    },
    onSocketConnect() {
      if (!this.contacts || this.contacts.length <= 0) {
        this
            .$http
            .get("/socket-server/chat/getRecentContacts")
            .then((r) => {

              let data = r.data.data;
              if (!data || data.length <= 0) {
                return ;
              }
              this.getRecentContactsProfile(data);
            });
      } else {
        this.getSocketTempMessages()
      }
    },
    onReadMessage(data) {
      let json = data;
      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }
      let contact = this.contacts.find(c => c.id === json.id);
      let contents = contact.messages.flatMap(m => m.contents)

      json.messageIds.forEach(id => {
        let content = contents.find(m => m.id === id);
        if (content) {
          content.status = "read";
          content.tooltip = content.senderId === this.principal.detail.id ? "对方已查阅" : "您已查阅";
        }
      });

      localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      if (this.visible) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }
    },
    onChatMessage(data) {
      let json = data;
      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }
      let contact = this.contacts.find(c => c.id === json.id);

      json.messages.forEach(m => {
        m.status = "unread";
        m.tooltip = "待查阅";
      });

      if (contact) {
        json.messages.forEach(m => this.addMessage(contact, m));

        contact.lastMessage = json.lastMessage;
        contact.lastSendTime = json.lastSendTime;
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

        if (this.current.contact.id > 0 && contact.id === this.current.contact.id && this.hasFocus) {
          this.readMessage(this.current.contact)
        }

        this.$emit('messageCountChange', this.messageCount);
      } else {
        this
            .$http
            .get("/authentication/getPrincipalProfile?type=Console&ids=" + json.id)
            .then((r) => {

              let data = r.data.data[0];

              json.title = this.getPrincipalName(data);
              json.avatar = data.avatar;
              json.lastLoadMessage = false;

              let messages = json.messages
              json.messages = [];
              this.contacts.unshift(json);

              messages.forEach(m => this.addMessage(json, m));
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

              if (this.current.contact.id > 0 && contact.id === this.current.contact.id && this.hasFocus) {
                this.readMessage(this.current.contact);
              }

              this.$emit('messageCountChange', this.messageCount);
            });
      }

      if (this.visible) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }
    },
    contextMenuClick(o) {
      let id = o.key.substring(0, o.key.indexOf("-")) * 1;
      let key = o.key.substring(o.key.indexOf("-") + 1, o.key.length);

      let target = this.contacts.find(c => c.id === id);
      if (!target) {
        return ;
      }

      if (key === "delete") {

        let index = this.contacts.indexOf(target);
        this.contacts.splice(index, 1);

        if (this.current.contact.id > 0 && this.current.contact.id === id) {
          this.current.contact = JSON.parse(JSON.stringify(this.defaultContactValue));
          this.clearCurrentHistory();
        }

        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      } else if (key === "read") {
        this.readMessage(target);
      } else if (key === "disturb") {
        target.disturb = !target.disturb;
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      } else if (key === "top") {
        target.top = !target.top;
        if (target.top) {
          target.disturb = false;
        }
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      }
    },
    clearCurrentHistory() {
      this.current.history.lastLoadMessage = false;
      this.current.history.calendar.show = false;
      this.current.history.calendar.enabledDate = [];
      this.current.history.messages = [];
      this.current.history.search.text = '';
      this.current.history.search.date = '';
      this.current.history.search.status = false;
    },
    messageContentScroll(d) {
      if (d.target.scrollTop !== 20) {
        return ;
      }
      if (this.current.contact.id > 0) {
        this.loadHistoryMessage(this.current.contact, d.target);
      }
    },
    installContactHistory(contact) {
      let targetId = contact.id;

      if (contact.id === this.current.contact.id) {
        this.clearCurrentHistory();
      }

      if (contact.messages && contact.messages.length > 0) {
        contact.messages.flatMap(m => m.contents).forEach((d) => {
          this.current.history.messages.push(d);
          this.current.history.loadMessages.unshift(d);
        });
      }

      if (this.current.history.show) {
        this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
      }

      if (contact.historyDateList && this.current.contact.id > 0 && this.current.contact.id === contact.id) {
        this.current.history.calendar.enabledDate = contact.historyDateList;
        return;
      }

      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId}))
          .then((r) => {
            contact.historyDateList = r.data.data || [];
            if (this.current.contact.id > 0 && this.current.contact.id === contact.id) {
              this.current.history.calendar.enabledDate = contact.historyDateList;
            }
          });
    },
    loadHistoryMessage(contact, el) {

      if (contact.lastLoadMessage) {
        return ;
      }

      let time = this.$moment.now();

      if ((!el || el.id === "message-content") && contact.messages.length > 0) {
        let message = contact.messages[0];
        if (message.contents.length > 0) {
          time = this.$moment(message.contents[0].creationTime);
        }
      } else if (this.current.contact.id === contact.id && this.current.history.show) {
        time = this.current.history.search.status && this.current.history.messages.length === 0 ? this.current.history.search.date : undefined;
        if (!time) {
          let message = this.current.history.messages[0];
          if (message) {
            time = this.$moment(message.creationTime);
          }
        }
      }

      let param = {
        targetId: contact.id,
        time: time,
        size: 10
      };

      this
          .$http
          .post("/socket-server/chat/getHistoryMessagePage", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;
            let c = this.contacts.find(c => c.id === contact.id);

            let beforeHeight = 0;

            if (this.visible) {
              beforeHeight = el.scrollHeight;
            }

            if (c && (!el || el.id === "message-content")) {
              c.lastLoadMessage = data.last;

              if (data.elements && data.elements.length > 0) {

                data.elements.forEach(d => {
                  d.status = d.read ? "read" : d.senderId === this.principal.details.id ? "success" : "unread";
                  d.tooltip = d.read ? d.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅" : "待查阅";
                  this.addMessage(c, d, true);
                });

                if (c.lastSendTime === "") {
                  c.lastSendTime = this.$moment(data.lastSendTime);
                  c.lastMessage = data.lastMessage;
                }
              }

              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            }

            if (beforeHeight === 0 || (this.current.contact.id === contact.id && this.current.history.show)) {
              data.elements.forEach(d => {
                this.current.history.messages.unshift(d)
                if (!this.current.history.search.status) {
                  this.current.history.loadMessages.push(d);
                }
              });
            }

            if (this.visible) {
              this.$nextTick(() => el.scrollTop = el.scrollHeight - beforeHeight);

              if (beforeHeight === 0) {
                this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
              }
            }
          });
    },
    retrySend(current, content) {
      console.log(current, content);
    },
    addMessage(contact, message, unshift) {

      let content = {
        senderId:message.senderId,
        content:message.content,
        tooltip:message.tooltip,
        status:message.status
      };

      if (message.id) {
        let currentContents = contact.messages.flatMap(m => m.contents);
        if (currentContents.find(c => c.id === message.id)) {
          return ;
        }
        content.id = message.id;
      }

      content.creationTime = this.$moment.isMoment(message.creationTime) ?
          message.creationTime :
          this.$moment(message.creationTime);

      let result = {
        creationTime:content.creationTime,
        contents:[content],
        currentIndex:0,
      };

      if (contact.messages.length <= 0) {
          contact.messages.push(result);
      } else {
        let lastMessage = unshift ? contact.messages[0] : contact.messages[contact.messages.length - 1];
        let intervalTimeUnit = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME_UNIT;
        let currentIntervalTime = unshift ?
            this.$moment(lastMessage.creationTime).diff(content.creationTime, intervalTimeUnit) :
            content.creationTime.diff(this.$moment(lastMessage.creationTime), intervalTimeUnit);

        let intervalTime = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME * 1;

        if (currentIntervalTime >= intervalTime) {
          if (unshift) {
            contact.messages.unshift(result)
          } else {
            contact.messages.push(result);
          }
        } else {
          if (unshift) {
            lastMessage.contents.unshift(result.contents[0]);
            result.currentIndex = 0;
          } else {
            lastMessage.contents.push(result.contents[0]);
            result.currentIndex = lastMessage.contents.length - 1;
          }
        }
      }

      result.messageIndex = contact.messages.length - 1;

      return result;
    },
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
              this.addContact({
                id:d.id,
                title:this.getPrincipalName(d),
              });
              this.getSocketTempMessages();
            })
          })
    },
    getLocalStorageContactName(id) {
      return process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME +"_" + id;
    },
    getSocketTempMessages() {
      let param = {types:[SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE, SOCKET_EVENT_TYPE.CHAT_MESSAGE]};
      this
          .$http
          .post("/socket-server/getTempMessageMap", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;

            if (!data) {
              return ;
            }

            let chatMessages = data[SOCKET_EVENT_TYPE.CHAT_MESSAGE];
            if (chatMessages && chatMessages.length > 0) {
              chatMessages.forEach(m => this.onChatMessage(m));
            }

            let readMessages = data[SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE];
            if (readMessages && readMessages.length > 0) {
              readMessages.forEach(m => this.onReadMessage(m));
            }
            this.$http.post("/socket-server/clearTempMessage", this.formUrlencoded(param));
          });
    },
    visibleChange(visible) {
      if (visible && this.current.contact.id > 0) {
        this.readMessage(this.current.contact);
      }
    },
    send() {
      let param = {
        recipientId:this.current.contact.id,
        content:this.inputContent
      };

      let contact = this.contacts.find(c => c.id === param.recipientId);
      contact.messages = contact.messages || [];

      let content = this.addMessage(contact, {
        senderId: this.principal.details.id,
        creationTime: this.$moment.now(),
        status: "sending",
        tooltip:"发送中...",
        content:param.content,
      });

      let current = contact.messages[content.messageIndex].contents[content.currentIndex];

      this
          .$http
          .post("/socket-server/chat/sendMessage", this.formUrlencoded(param))
          .then((r) =>{
            current.id = r.data.data.id;
            current.status = "success";
            current.tooltip = "待查阅";

            contact.lastMessage = param.content.replace(/<[^<>]+>/g, '');
            contact.lastSendTime = content.creationTime;

            localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
          })
          .catch((r) => {
            current.status = "fail";
            current.tooltip = r.data.message;
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

        let currentGroups = this.tree.groups[treeNode.eventKey];

        if (currentGroups) {
          treeNode.dataRef.children = currentGroups;
          resolve();
        } else {
          let param = {};

          if (treeNode.eventKey === "root") {
            param["filter_[parent_id_eqn]"] = "true";
          } else {
            param["filter_[parent_id_eq]"] = treeNode.eventKey.replace("group-","");
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

                this.tree.groups[treeNode.eventKey] = treeNode.dataRef.children;
                localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));

                if (treeNode.eventKey !== "root") {
                  this.loadGroupUser(treeNode);
                }

                resolve();

              });
        }

      });
    },
    loadGroupUser(treeNode) {

      this
          .$http
          .get("/authentication/console/user/findByGroup?groupId=" + treeNode.eventKey.replace("group-",""))
          .then(u => {
            let users = u.data.data;
            users.forEach(u => {
              if (u.id === this.principal.details.id) {
                return ;
              }

              let data = {
                name : this.getPrincipalName(u),
                id: u.id,
                group: treeNode.eventKey
              };

              treeNode.dataRef.children.push({
                name : data.name,
                id: "user-" + data.id,
                isLeaf: true
              });

              let current = this.tree.users.find(user => user.id === data.id);
              if (current) {
                this.tree.users[this.tree.users.indexOf(current)] = data;
              } else {
                this.tree.users.push(data);
              }

            });
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_USER_NAME, JSON.stringify(this.tree.users));

            this.tree.groups[treeNode.eventKey] = treeNode.dataRef;
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));
          });

    },
    getUsernameById(id) {
      if (id === this.principal.details.id) {
        return this.getPrincipalName(this.principal.details);
      }

      let contact = this.contacts.find(u => u.id === id);

      if (contact) {
        return contact.title;
      }

      let user = this.tree.users.find(u => u.id === id);

      if (user) {
        return user.name;
      }

      return "用户 [" + id + "]";
    },
    addContact(contact) {
      let currentContact = this.contacts.find(c => c.id === contact.id);
      if (currentContact) {
        this.contacts.splice(this.contacts.indexOf(currentContact),1);
        currentContact.title = contact.title;
      } else {
        currentContact = contact;
        currentContact.lastLoadMessage = false;
        currentContact.messages = [];
        currentContact.lastMessage = "";
        currentContact.lastSendTime = "";
        currentContact.disturb = false;
        currentContact.top = false;
        this.loadHistoryMessage(currentContact, this.$refs["message-content"]);
      }
      this.contacts.unshift(currentContact);
      localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

      this.installContactHistory(currentContact);
      return currentContact;
    },
    selectTreeContact(selectedKeys, info) {
      if (!info.node.dataRef.isLeaf) {
        return ;
      }

      let contact = {
        id:selectedKeys[0].replaceAll("user-","") * 1,
        title: info.node.dataRef.name,
      }

      this.current.contact = this.addContact(contact);
      this.current.history.lastLoadMessage = this.current.contact.lastLoadMessage;
      this.readMessage(this.current.contact);
      this.tab = "message";
      this.selectedToolBar = ["message"];
    },
    selectContact(record){

      if (this.current.contact.id > 0 && this.current.contact.id === record.key) {
        return ;
      }

      this.current.contact = this.contacts.find(c => c.id === record.key * 1);

      if (this.current.contact.messages.length <= 0 && !this.current.contact.lastLoadMessage) {
        this.loadHistoryMessage(this.current.contact, this.$refs["message-content"]);
      }
      this.installContactHistory(this.current.contact);

      this.readMessage(this.current.contact);
    },
    readMessage(contact) {

      if (!this.visible || !contact.messages) {
        return ;
      }

      let unreadMessages = contact.messages.flatMap(m => m.contents).filter(m => m.status === "unread");

      if (this.$refs["message-content"].scrollTop === 0 || unreadMessages.length > 0) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }

      if (unreadMessages.length > 0) {
        let messages = [];

        unreadMessages.forEach(m => messages.push(m.id));

        let param = {senderId:contact.id, messageIds:messages};

        this
            .$http
            .post("/socket-server/chat/readMessage", param)
            .then(() => {
              unreadMessages.forEach(m => {
                m.status = "read";
                m.tooltip = m.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅";
              });
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
              this.$emit('messageCountChange', this.messageCount);
            });
      }
    },
    disabledHistoryDate(value) {
      if (!this.current.history.calendar.enabledDate) {
        return true;
      }

      let source = value.format(process.env.VUE_APP_POST_DATE_FORMAT);
      let array = this.current.history.calendar.enabledDate.map((v) => this.$moment(v).format(process.env.VUE_APP_POST_DATE_FORMAT));

      return !array.includes(source);
    },
    selectCalendar() {

      this.current.history.search.status = true;
      this.current.history.calendar.show = false;
      this.current.history.lastLoadMessage = false;

      this.current.history.messages = [];

      this.loadHistoryMessage(this.current.contact, this.$refs["history-content"]);
    },
    clearSearch() {
      this.current.history.messages = [];
      this.current.history.search.status = false;
      this.current.history.search.date = this.$moment.now();
      this.current.history.search.text = '';
      this.current.history.lastLoadMessage = false;
      this.current.history.loadMessages.forEach((d) => this.current.history.messages.unshift(d));
      this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
    }
  },
  data() {
    return {
      tree: {
        users: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_USER_NAME)) || [],
        groups: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME)) || {},
      },
      hasFocus:true,
      selectedToolBar:["message"],
      defaultContactValue:{
        title:"",
        lastLoadMessage: true,
        id:0,
        messages:[]
      },
      current: {
        contact:this.defaultContactValue,
        history: {
          show:false,
          search: {
            text:'',
            date:'',
            status: false,
          },
          messages:[],
          loadMessages:[],
          lastLoadMessage:false,
          calendar: {
            show:false,
            enabledDate:[]
          }
        }
      },
      visible: false,
      contacts: JSON.parse(localStorage.getItem(this.getLocalStorageContactName(this.principal.details.id))) || [],
      inputContent:"",
      tab:"message",
      groupData:[{ name: '联系人', id: 'root', slots : { icon: 'root' }}]
    }
  }
}
</script>