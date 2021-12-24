<template>
  <div class="input border-top" v-if="visible">
    <QuillEditor toolbar="#chat-toolbar" ref="editor" v-model:content="inputContent" @keyup.ctrl.enter="sendMessage()" content-type="html">
      <template #toolbar>
        <div id="chat-toolbar" class="border-bottom">
          <button class="ql-bold" />
          <button class="ql-italic" />
          <button class="ql-link" />
          <button class="ql-image" />
          <button class="ql-video" />
          <button class="ql-list" value="ordered" />
          <button class="custom ql-contact-history" @click="history.visible = !history.visible">
            <icon-font class="icon" type="icon-history" />
          </button>
        </div>
      </template>
    </QuillEditor>
  </div>

  <a-modal v-model:visible="history.visible" :destroyOnClose="true" @cancel="onHistoryModalClose" :mask="false" :maskClosable="false" :footer="null" class="history" title="聊天记录" width="500px">
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
      <a-divider class="font-size-sm margin-none" v-if="!lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <a-empty v-if="historyMessages.length === 0"></a-empty>
      <div v-for="c of historyMessages" :key="c.id" :class="c.senderId === principal.details.id ? 'self' : ''">
        <p>
          <a-typography-paragraph>
            <a-typography-text strong >{{ getUsername(c) }}</a-typography-text>
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
  props:["lastLoadMessage", "historyMessages", "renderUsername", "enabledDate", "visible", "datePattern"],
  emits: ["sendMessage", "historyMessageContentScroll", "selectCalendar"],
  watch:{
    historyMessages:{
      handler (newContents) {

        if (!this.index.first) {
          this.index.first = newContents[0];
        }

        if (newContents.indexOf(this.index.first) > 0 && this.history.visible) {
          this.fixedScrollPosition();
        } else if ((!this.index.last || newContents.indexOf(this.index.last) <= newContents.length - 1) && this.history.visible) {
          this.setScrollBottom();
        }

        this.index.first = newContents[0];
        this.index.last = newContents[newContents.length - 1];
      },
      deep:true
    }
  },
  data() {
    return {
      inputContent:"",
      index: {
        last:null,
        first:null
      },
      scroll: {
        top:0,
        height:0
      },
      history: {
        visible:false,
        search: {
          text:'',
          date:'',
          status: false,
        },
        calendar: {
          visible:false
        }
      }
    }
  },
  methods:{
    onHistoryModalClose() {
      this.setScrollBottom();
    },
    fixedScrollPosition(){
      let el = this.$refs["history-content"];
      if (!el) {
        return ;
      }
      this.$nextTick(() => {
        el.scrollTop = this.scroll.top + el.scrollHeight - this.scroll.height;
        this.scroll.top = el.scrollTop;
        this.scroll.height = el.scrollHeight;
      });
    },
    setScrollBottom() {
      let el = this.$refs["history-content"];
      if (!el) {
        return ;
      }
      this.$nextTick(() => {
        el.scrollTop = el.scrollHeight;
        this.scroll.top = el.scrollTop;
        this.scroll.height = el.scrollHeight;
      });
    },
    messageContentScroll(d) {
      if (d.target.scrollTop !== 0) {
        this.scroll.top = d.target.scrollTop
        this.scroll.height = d.target.scrollHeight
        return ;
      }
      this.$emit("historyMessageContentScroll", d);
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

      this.$emit("selectCalendar", time);
    },
    disabledHistoryDate(value) {
      if (!this.enabledDate) {
        return true;
      }
      let source = value.format(this.datePattern);
      let array = this.enabledDate.map((v) => this.$moment(v).format(this.datePattern));

      return !array.includes(source);
    },
    clearSearch() {
      this.history.messages = [];
      this.history.search.status = false;
      this.history.search.date = null;
      this.history.search.text = "";

      this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
    },
    clearCurrentHistory() {
      this.history.calendar.visible = false;
      this.history.messages = [];
      this.history.search.text = '';
      this.history.search.date = '';
      this.history.search.status = false;
    },
    sendMessage() {
      let content = {
        senderId: this.principal.details.id,
        creationTime: this.$moment.now(),
        status: "sending",
        tooltip:"发送中...",
        content: this.inputContent,
      };

      this.$emit("sendMessage", content);

      this.$refs["editor"].setContents("");
      this.inputContent = "";
    },
    getUsername(c) {
      let username = "用户 [" + c.senderId + "] ";
      if (this.renderUsername) {
        username = this.renderUsername(c);
      }
      return username;
    }
  }
}

</script>