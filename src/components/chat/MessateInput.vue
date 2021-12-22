<template>
  <div class="input border-top" v-if="data.id > 0">
    <QuillEditor toolbar="#chat-toolbar" ref="editor" v-model:content="inputContent" @keyup.ctrl.enter="sendMessage()" content-type="html">
      <template #toolbar>
        <div id="chat-toolbar" class="border-bottom">
          <button class="ql-bold" />
          <button class="ql-italic" />
          <button class="ql-link" />
          <button class="ql-image" />
          <button class="ql-video" />
          <button class="ql-list" value="ordered" />
          <button class="custom ql-contact-history" @click="showContactHistory">
            <icon-font class="icon" type="icon-history" />
          </button>
        </div>
      </template>
    </QuillEditor>
  </div>

  <a-modal v-model:visible="history.visible" :destroyOnClose="true" :mask="false" :maskClosable="false" :footer="null" class="history" title="聊天记录" width="500px">
    <a-input v-model:value="history.search.text">
      <template #addonAfter>
        <a-popover v-model:visible="history.calendar.visible" title="选择时间" trigger="click">
          <template #content>
            <a-calendar :fullscreen="false" @select="selectCalendar" :disabled-date="disabledHistoryDate" />
          </template>
          <icon-font class="icon" type="icon-time" />
        </a-popover>
      </template>
    </a-input>
    <a-divider class="font-size-sm">
      <a-tag v-if="history.search.date !== ''" closable @close="clearSearch">
        <icon-font class="icon" type="icon-calendar" />
        {{ dateFormat(this.history.search.date) }}
      </a-tag>
      消息内容
    </a-divider>

    <div id="history-content" class="message-content" ref="history-content" @scroll="messageContentScroll">
      <a-divider class="font-size-sm margin-none" v-if="!history.lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <a-empty v-if="history.messages.length === 0"></a-empty>
      <div v-for="c of history.messages" :key="c.id" :class="c.senderId === principal.details.id ? 'self' : ''">
        <p>
          <a-typography-paragraph>
            <a-typography-text strong >{{ getUsernameById(c.senderId, "用户 [" + c.senderId + "]") + " "}}</a-typography-text>
            <a-typography-text class="font-size-sm">{{ timestampFormat(c.creationTime) }}</a-typography-text>
          </a-typography-paragraph>
        </p>
        <div class="margin-xss-left" v-html="c.content"/>
      </div>
    </div>
  </a-modal>
  
</template>

<script>
import {QuillEditor} from "@vueup/vue-quill";
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name:"ChatMessageInput",
  components: {QuillEditor},
  props:["data", "loadHistoryMessagePage", "dateFormat", "contacts", "users"],
  emits: ["messageSend"],
  data() {
    return {
      inputContent:"",
      history: {
        visible:false,
        search: {
          text:'',
          date:null,
          status: false,
        },
        messages:[],
        loadMessages:[],
        lastLoadMessage:false,
        calendar: {
          visible:false,
          enabledDate:[]
        }
      }
    }
  },
  methods:{
    messageContentScroll(d) {
      if (d.target.scrollTop !== 0) {
        return ;
      }
      if (this.data.id > 0) {
        this.loadHistoryMessage(this.createLoadHistoryMessageParam(), d.target);
      }
    },
    createLoadHistoryMessageParam(){
      let time = this.history.search.status && this.history.messages.length === 0 ? this.history.search.date : undefined;
      if (!time) {
        let message = this.history.messages[0];
        if (message) {
          time = this.$moment(message.creationTime);
        }
      }

      return {
        targetId: this.data.id,
        time: time,
        size: this.loadHistoryMessagePage * 1
      };
    },
    selectCalendar(date) {

      this.history.search.status = true;
      this.history.search.date = date;
      this.history.calendar.visible = false;
      this.history.lastLoadMessage = false;

      this.history.messages = [];

      let time = this.history.search.status && this.history.messages.length === 0 ? this.history.search.date : undefined;
      if (!time) {
        let message = this.history.messages[0];
        if (message) {
          time = this.$moment(message.creationTime);
        }
      }

      let param = {
        targetId: this.data.id,
        time: time,
        size: this.loadHistoryMessagePage * 1
      };

      this.loadHistoryMessage(param, this.$refs["history-content"]);
    },
    disabledHistoryDate(value) {
      if (!this.history.calendar.enabledDate) {
        return true;
      }
      let source = value.format(this.dateFormat);
      let array = this.history.calendar.enabledDate.map((v) => this.$moment(v).format(this.dateFormat));

      return !array.includes(source);
    },
    installHistoryMessageDateList() {
      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId: this.data.id}))
          .then((r) => this.history.calendar.enabledDate = r.data.data || []);
    },
    clearSearch() {
      this.history.messages = [];
      this.history.search.status = false;
      this.history.search.date = "";
      this.history.search.text = "";
      this.history.lastLoadMessage = false;
      this.$nextTick(() => {
        this.history.loadMessages.forEach((d) => this.history.messages.unshift(d));
        this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight
      });
    },
    clearCurrentHistory() {
      this.history.lastLoadMessage = false;
      this.history.calendar.visible = false;
      this.history.calendar.enabledDate = [];
      this.history.messages = [];
      this.history.lastLoadMessage = [];
      this.history.search.text = '';
      this.history.search.date = '';
      this.history.search.status = false;
    },
    loadHistoryMessage(param, el){

      if (this.history.lastLoadMessage) {
        return ;
      }

      this
          .$http
          .post("/socket-server/chat/getHistoryMessagePage", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;

            let beforeHeight = 0;

            if (this.visible) {
              beforeHeight = el.scrollHeight;
            }

            this.history.lastLoadMessage = data.last;

            if (data.elements && data.elements.length > 0) {
              data.elements.forEach(d => {
                this.history.messages.unshift(d)
                if (!this.history.search.status) {
                  this.history.loadMessages.push(d);
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
    sendMessage() {
      let content = this.addMessage(this.data, {
        senderId: this.principal.details.id,
        creationTime: this.$moment.now(),
        status: "sending",
        tooltip:"发送中...",
        content: this.inputContent,
      });

      if (this.contact.type === 10) {
        this.sendPersonMessage(this.data, content);
      } else {
        this.sendGroupMessage(this.data, content)
      }

      this.$refs["editor"].setContents("");
      this.inputContent = "";

      this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
    },
    sendGroupMessage(contact, content) {
      console.log(contact, content);
    },
    sendPersonMessage(contact, content) {
      let param = {
        recipientId:contact.id,
        content:content.contents[0].content
      };

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

            this.$emit("messageSend", current, contact);
          })
          .catch((r) => {
            current.status = "fail";
            current.tooltip = r.data.message;
            this.$emit("messageSend", current, contact);
          });
    },
    showContactHistory() {
      if (this.data.id === 0) {
        return ;
      }

      this.history.visible = !this.history.visible;

      if (this.history.visible) {
        if (this.data.messages) {
          this.data.messages.flatMap(m => m.contents).forEach((d) => {
            this.history.messages.push(d);
            this.history.loadMessages.unshift(d);
          });
        }
        this.history.lastLoadMessage = this.data.lastLoadMessage;
        this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
      }
    },
    getUsernameById(id, defaultValue) {
      if (id === this.principal.details.id) {
        return this.getPrincipalName(this.principal.details);
      }

      let contact = this.contacts.find(u => u.id === id && u.type === 10);

      if (contact) {
        return contact.title;
      }

      let user = this.users.find(u => u.id === id);

      if (user) {
        return user.name;
      }

      return defaultValue;
    }
  }
}

</script>