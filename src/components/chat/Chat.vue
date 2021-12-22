<template>
  <a-drawer :width="950" placement="right" :closable="false" v-model:visible="visible" class="chat">
    <a-layout class="height-100-percent">

      <a-layout-sider class="main-aside border-right" :width="280">
        <chat-contact ref="contact" @selectMessageContact="onSelectMessageContact"/>
      </a-layout-sider>

      <a-layout class="overflow-hidden">
        <a-layout-header class="border-bottom">
          <chat-message-title ref="contact" :data="current" />
        </a-layout-header>
        <a-layout>
          <a-layout-content class="height-100-percent">
            <chat-message-content ref="message-content" @messageSend="onMessageSend" :date-format="messageContent.dateFormat" :data="current" :load-history-message-page="messageContent.pageSize" :interval-time="messageContent.intervalTime" />
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

export default {
  name:"Chat",
  components: {ChatMessageContent, ChatMessageTitle, ChatContact},
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
  data() {
    return {
      messageContent: {
        pageSize: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_PAGE_SIZE * 1,
        intervalTime:{
          value: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME * 1,
          unit: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME_UNIT
        },
        dateFormat:process.env.VUE_APP_POST_DATE_FORMAT
      },
      current:{
        title:"",
        lastLoadMessage: true,
        type:10,
        id:0,
        messages:[]
      }
    }
  },
  methods:{
    onMessageSend() {
      this.$refs["contact"].get
    },
    onSelectMessageContact(contact) {
      if (this.current.id === contact.id) {
        return ;
      }

      this.current = contact;

      let messageContent = this.$refs["message-content"];

      this.$nextTick(() => {
        messageContent.installContactHistory(this.current);
        if (this.current.messages.length < this.messageContent.pageSize) {
          messageContent.loadHistoryMessage(this.current);
        }
        messageContent.readMessage(this.current);
      });
    }
  }
}

</script>