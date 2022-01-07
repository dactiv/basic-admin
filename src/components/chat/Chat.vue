<template>

  <a-drawer :width="950" placement="right" :closable="false" v-model:visible="show" class="chat">
    <a-layout class="height-100-percent">

      <a-layout-sider class="main-aside border-right" :width="280">
        <chat-contact ref="contact" :unread-message-count="messageCount" @selectMessageContact="onSelectMessageContact" @contactContextMenuClick="onContactContextMenuClick" @selectTreeContact="onSelectTreeContact" :contact-data="contacts"/>
      </a-layout-sider>

      <a-layout class="overflow-hidden">
        <a-layout-header class="border-bottom">
          <chat-message-title ref="message-title" v-model:data="current" :render-username="getUsername" />
        </a-layout-header>
        <a-layout>
          <a-layout-content class="height-100-percent">
            <chat-message-content ref="message-content" @retry-send="onRetrySend" @message-content-scroll="onMessageContentScroll" :render-username="getUsername" :data="current" :last-load-message="current.lastLoadMessage" />
            <chat-message-input ref="message-input" @history-message-content-scroll="onMessageContentScroll" :render-username="getUsername" :visible="current.id > 0" :date-pattern="message.datePattern" :enabled-date="current.history.enabledDate" :history-messages="current.messages.flatMap(m => m.contents)" :last-load-message="current.lastLoadMessage" @sendMessage="onSendMessage"/>
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
  props:["visible"],
  emits: ["messageCountChange","update:visible"],
  computed: {
    messageCount() {
      return this.contacts.reduce((sum, o) => sum + o.messages.reduce((s, m) => s + m.contents.filter(c => c.status === "unread").length, 0), 0);
    },
    show: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  created() {
    this.current = JSON.parse(JSON.stringify(this.defaultContactValue));
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.IS_CONNECTED).then(this.onSocketConnect);

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CONNECT,
      callback:this.onSocketConnect
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_CREATE,
      callback:this.onRoomCreate
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_DELETE,
      callback:this.onRoomDelete
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_RENAME,
      callback:this.onRoomRename
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE,
      callback:this.onReadMessage
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.CHAT_MESSAGE,
      callback:this.onChatMessage
    });

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

    this.$nextTick(() => this.$emit('messageCountChange', this.messageCount));
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
      cache:JSON.parse(localStorage.getItem(process.env.VUE_APP_SOCKET_CHAT_CACHE)) || {profiles:[]},
      hasFocus:true,
      contacts: JSON.parse(localStorage.getItem(this.getContactStorageKey(this.principal.details.id))) || [],
      install:JSON.parse(localStorage.getItem(this.getInstallStorageKey(this.principal.details.id))) || {recentContacts: false},
      defaultContactValue:{
        name:"",
        lastLoadMessage: true,
        type:10,
        id:0,
        messages:[],
        history: {
          enabledDate:[]
        }
      },
      current: null
    }
  },
  methods:{
    onRetrySend(content) {

      let message = this.current.messages.find(m => m.contents.find(c => c.id === content.id));
      let index = message.contents.indexOf(content);

      message.contents.splice(index, 1);
      if (message.contents.length === 0) {
        this.current.messages.splice(this.current.messages.indexOf(message), 1);
      }

      this.onSendMessage(content);
    },
    onRoomDelete(data) {

      let id = JSON.parse(data).data;
      let c = this.contacts.find(c => c.id === id && c.type === 20);

      if (!c) {
        return ;
      }
      this.$message.success("群聊 [" + c.name + "] 已移除");
      this.deleteContact(c);
    },
    onReadMessage(data) {

      let json = data;

      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }

      let targetId = json.id;
      if (json.type === 20) {
        targetId = json.targetId;
      }

      let contact = this.contacts.find(c => c.id === targetId && c.type === json.type);
      let contents = contact.messages.flatMap(m => m.contents)

      json.messageIds.forEach(id => {
        let content = contents.find(m => m.id === id);
        if (content) {
          content.status = "read";
          if (json.type === 20 && !content.readerInfo.find(r => r.id === json.id)) {
            content.readerInfo.push({creationTime: this.$moment(json.creationTime), id: json.id})
          } else if (json.type === 10){
            content.readTime = this.$moment(json.creationTime);
          }
        }
      });

      this.saveContact(contact);
    },
    onChatMessage(data) {

      let json = data;

      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }

      if (json.id === this.principal.details.id) {
        return ;
      }

      json.messages.forEach(m => {
        m.type = m.type.value;
        m.status = "unread";
        if (m.type === 20) {
          m.readerInfo = m.readerInfo || [];
        }
      });

      let targetId = json.id;
      if (json.type.value === 20) {
        targetId = json.targetId;
      }

      let contact = this.contacts.find(c => c.id === targetId && c.type === json.type.value);

      if (contact) {
        json.messages.forEach(m => this.addMessage(m, contact.messages));

        contact.lastMessage = json.lastMessage;
        contact.lastSendTime = json.lastSendTime;

        this.saveContact(contact);

        let isReadMessage = this.hasFocus && this.visible;
        let isCurrentContact = this.current.id === contact.id && this.current.type === contact.type;
        if (isReadMessage && isCurrentContact) {
          this.readMessage();
        }

        this.$nextTick(() => this.$emit('messageCountChange', this.messageCount));
        return ;
      }

      this.getPrincipalProfiles([targetId], json.type.value).then(result => {
        let data = result[0];

        data.lastLoadMessage = false;
        data.lastMessage = json.lastMessage;
        data.lastSendTime = json.lastSendTime;
        data.messages = [];

        json.messages.forEach(m => this.addMessage(m, data.messages));
        this.addContact(data);
        this.$nextTick(() => this.$emit('messageCountChange', this.messageCount));
      });

    },
    onRoomRename(data) {
      let json = JSON.parse(data);

      let c = this.contacts.find(c => c.id === json.data.id && c.type === 20);
      if (!c) {
        return ;
      }

      let contact = this.contacts[this.contacts.indexOf(c)];
      contact.name = json.data.name;

      if (this.principal.details.id !== json.data.userId) {
        let nameModel = this.getUsername({}, json.data.userId);
        let message = {
          type:900,
          creationTime:json.timestamp,
        }
        if (nameModel.name) {
          message.content = "用户 [ " + nameModel.name + " ] 将群聊改名为 [" + contact.name + "]";
          this.addMessage(message, contact.messages);
        } else {
          this.getPrincipalProfiles([json.data.userId], 10).then(r => {
            message.content = "用户 [ " + r[0].name + " ] 将群聊改名为 [" + contact.name + "]";
            this.addMessage(message, contact.messages);
          });
        }

      }
      this.saveContact(contact);
    },
    onRoomCreate(data) {

      let json = JSON.parse(data).data;

      this.addContact({
        id: json.id,
        name: json.name,
        type: 20,
        remark:json.remark,
        participantList: json.participantList
      });

      this.$message.success("您加入了 [" + json.name + "] 群聊");
    },
    onContactContextMenuClick(event){
      if (event.key === "delete") {
        this.deleteContact(event.target);
      } else if (event.key === "disturb") {
        let index = this.contacts.indexOf(event.target);
        let contact = this.contacts[index];
        contact.disturb = !contact.disturb;
        this.saveContact(contact);
      } else if (event.key === "top") {
        let index = this.contacts.indexOf(event.target);
        let contact = this.contacts[index];
        contact.top = !contact.top;
        if (contact.top) {
          contact.disturb = false;
        }
        this.saveContact(contact);
      }
    },
    onSocketConnect() {

      if ((!this.contacts || this.contacts.length <= 0) && !this.install.recentContacts) {
        this
            .$http
            .get("/socket-server/chat/getRecentContacts")
            .then((r) => {

              let data = r.data.data || [];
              data.forEach(d => d.type = d.type.value);
              this.getRecentContactsProfile(data);
              this.install.recentContacts = true;
              this.saveInstall();
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
      if (data.length > 0) {
        this
            .getPrincipalProfiles(data.map((v) => v.id), 10)
            .then(result => {
              result.forEach(r => this.addContact(r));
              this.getSocketTempMessages();
            });
      } else {
        this.getSocketTempMessages();
      }
    },
    getPrincipalProfiles(targetIds, type) {
      return new Promise((resolve) => {
        // TODO 这里要不要用多态
        if (type === 10) {
          let param = {
            type:"CONSOLE",
            ids:targetIds
          };
          this
              .$http
              .post("/authentication/getPrincipalProfile", this.formUrlencoded(param))
              .then(r => {
                let result = this.resolveProfile(r.data.data, type, this.getPrincipalName)
                resolve(result);
              });
        } else if (type === 20) {
          let param = {
            ids:targetIds
          };
          this
              .$http
              .post("/socket-server/room/getRooms", this.formUrlencoded(param))
              .then(r => {
                let result = this.resolveProfile(r.data.data, type, (p) => p.name)
                resolve(result);
              })
        }

      });
    },
    resolveProfile(profile, type, renderName) {

      let result = [];

      profile.forEach(p => {

        let cache = p;

        cache.name = renderName(p)
        cache.type = type;

        let exist = this.cache.profiles.find(p => p.id === cache.id && p.type === type);

        if (exist) {
          this.cache.profiles[this.cache.profiles.indexOf(exist)] = cache;
        } else {
          this.cache.profiles.push(cache);
        }

        localStorage.setItem(process.env.VUE_APP_SOCKET_CHAT_CACHE, JSON.stringify(this.cache));
        result.push(cache);
      });

      return result;
    },
    addContact(contact) {

      let currentContact = this.contacts.find(c => c.id === contact.id && c.type === contact.type);
      if (currentContact) {
        this.contacts.splice(this.contacts.indexOf(currentContact),1);
        currentContact.name = contact.name;
      } else {
        currentContact = contact;
        currentContact.lastLoadMessage = false;
        currentContact.disturb = false;
        currentContact.top = false;
        if (!currentContact.messages) {
          currentContact.messages = [];
        }
        if (!currentContact.lastMessage) {
          currentContact.lastMessage = "";
        }
        if (!currentContact.lastSendTime) {
          currentContact.lastSendTime = "";
        }
      }

      this.saveContact(currentContact)

      return currentContact;
    },
    addMessage(message, appendMessages, unshift) {

      let currentContents = appendMessages.flatMap(m => m.contents);
      if (currentContents.find(c => c.id === message.id)) {
        return ;
      }

      let content = message;

      if (!content.id) {
        content.id = this.$moment().valueOf();
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

        let currentIntervalTime = this.message.intervalTime.value;

        if (lastMessage) {
          currentIntervalTime = unshift ?
              this.$moment(lastMessage.creationTime).diff(content.creationTime, this.message.intervalTime.unit) :
              content.creationTime.diff(this.$moment(lastMessage.creationTime), this.message.intervalTime.unit);
        }

        if (currentIntervalTime >= this.message.intervalTime.value) {
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
    onSendMessage(content) {
      let message = this.addMessage(content, this.current.messages);

      let param = {
        recipientId:this.current.id,
        content:message.contents[0].content,
        type:this.current.type
      };

      let currentMessage = this.current.messages[message.messageIndex].contents[message.currentIndex];

      this
          .$http
          .post("/socket-server/chat/sendMessage", this.formUrlencoded(param))
          .then((r) =>{

            currentMessage.id = r.data.data.id;
            currentMessage.status = "success";
            currentMessage.type = this.current.type;

            if (currentMessage.type === 20) {
              currentMessage.readerInfo = r.data.data.readerInfo || [];
            }

            this.current.lastMessage = param.content.replace(/<[^<>]+>/g, '');
            this.current.lastSendTime = message.creationTime;

            this.saveContact(this.current);
          }).catch(() => {
            currentMessage.status = "fail";
            this.saveContact(this.current);
          });
    },
    onSelectTreeContact(contact) {

      let exist = this.contacts.find(c => c.id === contact.id && c.type === contact.type);

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

      contact.history = {
        enabledDate:[]
      }

      this.current = contact;

      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId: this.current.id, type:this.current.type}))
          .then((r) => this.current.history.enabledDate = r.data.data || []);

      let messageTitle = this.$refs["message-title"];

      this.$nextTick(() => {

        this.$refs["message-input"].clearCurrentHistory();
        this.$refs["message-content"].clearCurrentRecord();

        messageTitle.clearCurrentRecord();
        messageTitle.setSelectedKeys({id:this.current.id, name:this.current.name})

        if (this.current.messages.length < this.message.pageSize && !this.current.lastLoadMessage) {
          this.loadHistoryMessage(this.current.type).then(this.readMessage);
        } else {
          this.readMessage();
        }

      });

    },
    onMessageContentScroll() {
      if (this.current.messages.length <= 0) {
        return ;
      }

      let time = this.$moment.now();
      let contents = this.current.messages[0].contents;
      if (contents.length > 0) {
        time = this.$moment(contents[0].creationTime);
      }
      this.loadHistoryMessage(this.current.type, time);
    },
    loadHistoryMessage(type, time) {

      if (this.current.lastLoadMessage) {
        return ;
      }

      if (!time) {
        time = this.$moment.now();
      }

      let param = {
        targetId: this.current.id,
        time: time,
        size: this.message.pageSize,
        type: type
      };

      return this
          .$http
          .post("/socket-server/chat/getHistoryMessagePage", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;
            this.current.lastLoadMessage = data.last;

            if (data.elements && data.elements.length > 0) {
              data.elements.forEach(d => {
                d.type = d.type.value;
                if (d.type === 10) {
                  d.status = d.read ? "read" : d.senderId === this.principal.details.id ? "success" : "unread";
                  d.readTime = this.$moment(d.readTime);
                } else if (d.type === 20) {
                  d.readerInfo = d.readerInfo || [];
                  let reader = d.readerInfo.find(r => r.id === this.principal.details.id);
                  d.status = reader ? "read" : d.senderId === this.principal.details.id ? "success" : "unread";
                }
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
      let key = this.getContactStorageKey(this.principal.details.id);
      localStorage.setItem(key, JSON.stringify(this.contacts));
    },
    deleteContact(contact) {
      let exist = this.contacts.find(c => c.id === contact.id && c.type === contact.type);
      if (!exist) {
        return;
      }

      let index = this.contacts.indexOf(exist);
      this.contacts.splice(index, 1);

      if (contact.id === this.current.id) {
        this.current = JSON.parse(JSON.stringify(this.defaultContactValue));
      }

      let key = this.getContactStorageKey(this.principal.details.id);
      localStorage.setItem(key, JSON.stringify(this.contacts));
    },
    saveInstall() {
      let key = this.getInstallStorageKey(this.principal.details.id);
      localStorage.setItem(key, JSON.stringify(this.install));
    },
    getInstallStorageKey(id) {
      return process.env.VUE_APP_LOCAL_STORAGE_CHAT_INSTALL_NAME + "_" + id;
    },
    getContactStorageKey(id) {
      return process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME + "_" + id;
    },
    readMessage() {

      if (!this.visible || !this.current.messages) {
        return ;
      }

      let unreadMessages = this.current.messages.flatMap(m => m.contents).filter(m => m.status === "unread");

      if (unreadMessages.length <= 0) {
        return ;
      }

      let messageIds = [];

      unreadMessages.forEach(m => {
        if (m.type === 20) {
          let reader = m.readerInfo.find(r => r.id === this.principal.details.id);
          if (!reader) {
            messageIds.push(m.id);
          }
        } else {
          messageIds.push(m.id);
        }
      });

      if (messageIds.length <= 0 ){
        return ;
      }

      let param = {targetId:this.current.id, type: this.current.type, messageIds:messageIds};

      this
          .$http
          .post("/socket-server/chat/readMessage", param)
          .then((r) => {
            unreadMessages.forEach(m => {
              m.status = "read"
              if (this.current.type === 20) {
                m.readerInfo = [];
              } else {
                m.readTime = this.$moment(r.data.timestamp);
              }
            });
            this.saveContact(this.current);
            this.$nextTick(() => this.$emit('messageCountChange', this.messageCount));
          });
    },
    getUsername(c, userId, unload) {

      if (userId === this.principal.details.id) {
        c.name = this.getPrincipalName(this.principal.details);
        return c;
      }

      let contact = this.contacts.find(u => u.id === userId && u.type === 10);

      if (contact) {
        c.name = contact.name;
        return c;
      }

      let profile = this.cache.profiles.find(u => u.id === userId);

      if (profile) {
        c.name = profile.name;
      } else if (!unload) {
        this.getPrincipalProfiles([userId], 10).then(result => c.name = result[0].name);
      }

      return c;
    }
  }
}

</script>