<template>
  <div id="message-content" class="message" ref="message-content" @scroll="messageContentScroll">
    <template v-if="data.id > 0">
      <a-divider class="font-size-sm margin-none" v-if="!data.lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <div v-for="m of data.messages" :key="m.id">

        <div class="text-center margin-top margin-bottom">
          <a-typography-text type="secondary">{{ timestampFormat(m.creationTime) }}</a-typography-text>
        </div>

        <div v-for="c of m.contents" :key="c" :class="c.senderId !== principal.details.id ? 'margin-bottom' : 'margin-bottom text-right'">
          <a-space align="start">
            <a-avatar v-if="c.senderId !== principal.details.id" :src="getPrincipalAvatarByUserId(data.id)" class="basic-box-shadow" >
              {{ contact.title.substring(0,1) }}
            </a-avatar>
            <a-space>
              <a-tooltip v-if="c.senderId === principal.details.id">
                <template #title><a-button v-if="c.status === 'fail'" type="link" class="padding-none" @click="retrySend(c.id)">[重试]</a-button>{{c.tooltip}} </template>
                <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                  <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                </a-typography-text>
              </a-tooltip>
              <a-card :class="c.senderId === principal.details.id ? 'border-radius basic-box-shadow self' : 'border-radius basic-box-shadow'" v-html="c.content">
              </a-card>
              <a-tooltip v-if="c.senderId !== principal.details.id">
                <template #title>{{c.tooltip}}</template>
                <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                  <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                </a-typography-text>
              </a-tooltip>
            </a-space>
            <a-avatar v-if="c.senderId === principal.details.id" :src="principal.details.avatar" class="basic-box-shadow">
              我
            </a-avatar>
          </a-space>
        </div>
      </div>

    </template>
  </div>
  <chat-message-input ref="message-input" :data="data" :contacts="contacts" :users="users" :load-history-message-page="this.loadHistoryMessage" :date-format="dateFormat" @messageSend="onMessageSend" />
</template>

<script>

import ChatMessageInput from "@/components/chat/MessateInput";

export default {
  name:"ChatMessageContent",
  components:{ChatMessageInput},
  props:["data", "intervalTime", "loadHistoryMessagePage", "dateFormat", "contacts", "users"],
  emits: ["retrySendClick", "messageSend"],
  data() {
    return {

    }
  },
  methods:{
    onMessageSend(content){
      this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      this.$emit("messageSend", content);
    },
    retrySend(id){
      let content = this.contact.messages.flatMap(m => m.contents).find(c => c.id === id);
      this.$emit('retrySendClick', content);
    },
    messageContentScroll(d) {
      if (d.target.scrollTop !== 0) {
        return ;
      }

      let param = this.createLoadHistoryMessageParam();
      let messageInput = this.$refs["message-input"];

      messageInput.loadHistoryMessage(param, d);
    },
    createLoadHistoryMessageParam(){
      let time = this.$moment.now();

      if (this.data.messages.length > 0) {
        let message = this.data.messages[0];
        if (message.contents.length > 0) {
          time = this.$moment(message.contents[0].creationTime);
        }
      }

      return {
        targetId: this.data.id,
        time: time,
        size: this.loadHistoryMessagePage * 1
      };
    },
    loadHistoryMessage() {
      let param = this.createLoadHistoryMessageParam()
      let messageInput = this.$refs["message-input"];
      messageInput.loadHistoryMessage(param, this.$refs["message-content"]);
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
        let currentIntervalTime = unshift ?
            this.$moment(lastMessage.creationTime).diff(content.creationTime, this.intervalTime.unit) :
            content.creationTime.diff(this.$moment(lastMessage.creationTime), this.intervalTime.unit);

        if (currentIntervalTime >= this.intervalTime.value) {
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
    installContactHistory() {
      let messageInput = this.$refs["message-input"];
      messageInput.clearCurrentHistory();
      messageInput.installHistoryMessageDateList();
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
    }
  }
}

</script>