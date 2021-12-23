<template>
  <a-drawer :width="950" placement="right" :closable="false" v-model:visible="visible" class="chat">
    <a-layout class="height-100-percent">

      <a-layout-sider class="main-aside border-right" :width="280">
        <chat-contact ref="contact" @selectMessageContact="onSelectMessageContact" @selectTreeContact="onSelectTreeContact" :contact-data="contacts"/>
      </a-layout-sider>

      <a-layout class="overflow-hidden">
        <a-layout-header class="border-bottom">
          <chat-message-title ref="contact" :data="current" />
        </a-layout-header>
        <a-layout>
          <a-layout-content class="height-100-percent">
            <chat-message-content ref="message-content" :render-username="getUsername" :data="current.messages" :last-load-message="current.lastLoadMessage" />

            <chat-message-input ref="message-input" :render-username="getUsername" :visible="current.id > 0" :date-pattern="message.datePattern" :enabled-date="current.history.enabledDate" :history-messages="current.messages.flatMap(m => m.contents)" :last-load-message="current.lastLoadMessage" @sendMessage="onSendMessage"/>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-drawer>
</template>

<script>

import ChatContact from "@/components/chat/Contact";
import ChatMessageTitle from "@/components/chat/MessageTitle";
import ChatMessageContent from "@/components/chat/MessageContent";
import ChatMessageInput from "@/components/chat/MessateInput";
import {SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE} from "@/store/socketIo";

export default {
  name:"Chat",
  components: {ChatMessageContent, ChatMessageTitle, ChatContact, ChatMessageInput},
  emits: ['messageCountChange','update:visible'],
  computed: {
    visible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  created() {
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.IS_CONNECTED).then(this.onSocketConnect);
  },
  mounted() {
    let _this = this;

    window.onfocus = () => {
      _this.hasFocus = true;
      if (_this.current.id === 0 || !_this.visible) {
        return ;
      }
      _this.readMessage(_this.current);
    };

    window.onblur = () => _this.hasFocus = false;
  },
  data() {
    return {
      message: {
        datePattern:process.env.VUE_APP_POST_DATE_FORMAT,
        pageSize: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_PAGE_SIZE * 1,
        intervalTime:{
          value: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME * 1,
          unit: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME_UNIT
        }
      },
      hasFocus:true,
      contacts: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME + "_" + this.principal.details.id)) || [],
      current:{
        name:"",
        lastLoadMessage: true,
        type:10,
        id:0,
        messages:[],
        history: {
          enabledDate:[]
        }
      }
    }
  },
  methods:{
    onSocketConnect() {
      if (!this.contacts || this.contacts.length <= 0) {
        this
            .$http
            .get("/socket-server/chat/getRecentContacts")
            .then((r) => {

              let data = r.data.data || [];
              if (data.length <= 0) {
                return ;
              }
              data.forEach(d => d.type = d.type.value);
              this.getRecentContactsProfile(data);
            });
      } else {
        this.getSocketTempMessages()
      }
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
    getRecentContactsProfile(data) {
      let param = {
        type:"CONSOLE",
        ids:data.map((v) => v.id)
      }
      this
          .$http
          .post("/authentication/getPrincipalProfile",this.formUrlencoded(param))
          .then(r => {
            let profile = r.data.data;
            profile.forEach(p => {
              let current = data.find((d) => d.id === p.id);
              this.addContact({
                id:p.id,
                name:this.getPrincipalName(p),
                type: current.type
              });
              this.getSocketTempMessages();
            })
          })
    },
    addContact(contact) {

      let currentContact = this.contacts.find(c => c.id === contact.id && c.type === contact.type);
      if (currentContact) {
        this.contacts.splice(this.contacts.indexOf(currentContact),1);
        currentContact.name = contact.name;
      } else {
        currentContact = contact;
        currentContact.lastLoadMessage = false;
        currentContact.messages = [];
        currentContact.lastMessage = "";
        currentContact.lastSendTime = "";
        currentContact.disturb = false;
        currentContact.top = false;
      }

      this.saveContact(currentContact)

      return currentContact;
    },
    addMessage(message, appendMessages, unshift) {

      let content = {
        senderId:message.senderId,
        content:message.content,
        tooltip:message.tooltip,
        status:message.status
      };

      if (message.id) {
        let currentContents = appendMessages.flatMap(m => m.contents);
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

      if (appendMessages.length <= 0) {
        appendMessages.push(result);
      } else {
        let lastMessage = unshift ? appendMessages[0] : appendMessages[this.current.messages.length - 1];
        let intervalTimeUnit = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME_UNIT;
        let currentIntervalTime = unshift ?
            this.$moment(lastMessage.creationTime).diff(content.creationTime, intervalTimeUnit) :
            content.creationTime.diff(this.$moment(lastMessage.creationTime), intervalTimeUnit);

        let intervalTime = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME * 1;

        if (currentIntervalTime >= intervalTime) {
          if (unshift) {
            appendMessages.unshift(result)
          } else {
            appendMessages.push(result);
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

      result.messageIndex = this.current.messages.length - 1;

      return result;
    },
    sendGroupMessage(content) {
      console.log(content);
    },
    sendPersonMessage(message) {
      let param = {
        recipientId:this.current.id,
        content:message.contents[0].content
      };

      let currentMessage = this.current.messages[message.messageIndex].contents[message.currentIndex];

      this
          .$http
          .post("/socket-server/chat/sendMessage", this.formUrlencoded(param))
          .then((r) =>{
            currentMessage.id = r.data.data.id;
            currentMessage.status = "success";
            currentMessage.tooltip = "待查阅";

            this.current.lastMessage = param.content.replace(/<[^<>]+>/g, '');
            this.current.lastSendTime = message.creationTime;

            this.saveContact(this.current);
          })
          .catch((r) => {
            currentMessage.status = "fail";
            currentMessage.tooltip = r.data.message;
            this.saveContact(this.current);
          });
    },
    onSendMessage(content) {
      let message = this.addMessage(content, this.current.messages);

      if (this.current.type === 10) {
        this.sendPersonMessage(message);
      } else {
        this.sendGroupMessage(message);
      }
    },
    installContactHistory() {
      let targetId = this.current.id;

      this.clearCurrentHistory();

      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId}))
          .then((r) => this.current.history.calendar.enabledDate = r.data.data || []);
    },
    onSelectTreeContact(contact) {
      console.log(contact);

      let exist = this.contacts.find(c => c.id === contact.id);

      if (!exist) {
        exist = JSON.parse(JSON.stringify(contact));
        exist.lastLoadMessage = true;
        exist.messages = [];
      }
      this.addContact(exist);
      this.onSelectMessageContact(exist);
    },
    onSelectMessageContact(contact) {
      if (this.current.id === contact.id) {
        return ;
      }

      let selected = JSON.parse(JSON.stringify(contact));
      selected.history = {
        enabledDate:[]
      }

      this.current = selected;

      this.$refs["message-input"].clearCurrentHistory();

      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId: this.current.id}))
          .then((r) => this.current.history.enabledDate = r.data.data || []);

      this.$nextTick(() => {
        if (this.current.messages.length < this.message.pageSize && !this.current.lastLoadMessage) {
          this.loadHistoryMessage();
        }
        this.readMessage(this.current);
      });

    },
    loadHistoryMessage(time) {

      if (this.current.lastLoadMessage) {
        return ;
      }

      if (!time) {
        time = this.$moment.now();
      }

      let param = {
        targetId: this.current.id,
        time: time,
        size: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_PAGE_SIZE * 1
      };

      this
          .$http
          .post("/socket-server/chat/getHistoryMessagePage", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;
            this.current.lastLoadMessage = data.last;

            if (data.elements && data.elements.length > 0) {
              data.elements.forEach(d => {
                d.status = d.read ? "read" : d.senderId === this.principal.details.id ? "success" : "unread";
                d.tooltip = d.read ? d.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅" : "待查阅";
                this.addMessage(d, this.current.messages, true);
              });

              if (this.current.lastSendTime === "") {
                this.current.lastSendTime = this.$moment(data.lastSendTime);
                this.current.lastMessage = data.lastMessage;
              }
            }

            this.saveContact(this.current);
          });
    },
    saveContact(contact){
      let exist = this.contacts.find(c => c.id === contact.id);
      if (exist) {
        this.contacts[this.contacts.indexOf(exist)] = contact;
      } else {
        this.contacts.unshift(contact);
      }
      let key = process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME + "_" + this.principal.details.id;
      localStorage.setItem(key, JSON.stringify(this.contacts));
    },
    readMessage() {

      if (!this.visible || !this.current.messages) {
        return ;
      }

      let unreadMessages = this.current.messages.flatMap(m => m.contents).filter(m => m.status === "unread");

      if (unreadMessages.length > 0) {
        let messages = [];

        unreadMessages.forEach(m => messages.push(m.id));

        let param = {senderId:this.current.id, messageIds:messages};

        this
            .$http
            .post("/socket-server/chat/readMessage", param)
            .then(() => {
              unreadMessages.forEach(m => {
                m.status = "read";
                m.tooltip = m.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅";
              });
              this.saveContact(this.current);
              this.$emit('messageCountChange', this.messageCount);
            });
      }
    },
    getUsername(c) {
      if (c.senderId === this.principal.details.id) {
        return this.getPrincipalName(this.principal.details) + " ";
      }

      let contact = this.contacts.find(u => u.id === c.senderId && u.type === 10);

      if (contact) {
        return contact.name + " ";
      }

      return "用户 [" + c.senderId + "] ";
    }
  }
}

</script>