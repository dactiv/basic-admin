<template>
  <div id="message-content" class="message" ref="message-content" @mouseleave="hasFocus = false" @mouseenter="hasFocus = true" @scroll="messageContentScroll">
    <template v-if="data">
      <a-divider class="font-size-sm margin-none" v-if="!lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <div v-for="m of data" :key="m.id">

        <div class="text-center margin-top margin-bottom">
          <a-typography-text type="secondary">{{ timestampFormat(m.creationTime) }}</a-typography-text>
        </div>

        <div v-for="c of m.contents" :key="c" class="margin-bottom">
          <a-row v-if="c.type === 'notice'">
            <a-col :span="24" class="text-center">
              <a-typography-text :code="true" type="secondary">{{c.content}}</a-typography-text>
            </a-col>
          </a-row>
          <div v-else :class="c.senderId !== principal.details.id ? '' : 'text-right'">
            <a-space align="start">
              <a-avatar v-if="c.senderId !== principal.details.id" :src="getPrincipalAvatarByUserId(c.senderId)" class="basic-box-shadow" >
                {{ getUsername(c).substring(0,1) }}
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
      </div>

    </template>
  </div>
</template>

<script>


import {SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE} from "@/store/socketIo";

export default {
  name:"ChatMessageContent",
  props:["data", "lastLoadMessage", "recipientId", "renderUsername"],
  emits: ["retrySendClick","messageContentScroll"],
  watch:{
    data:{
      handler (newValue, oldValue) {

        let newContents = newValue.flatMap(o => o.contents);
        let oldContents = oldValue.flatMap(o => o.contents);

        if (!this.hasFocus && oldContents.length > 0) {
          this.fixedScrollPosition();
          return ;
        }
        // FIXME 重复选择时候改值获取不到数据
        if (!this.index.first) {
          this.index.first = newContents[0];
        }

        if (newContents.indexOf(this.index.first) > 0) {
          this.fixedScrollPosition();
        } else if (!this.index.last || newContents.indexOf(this.index.last) <= newContents.length - 1) {
          this.setScrollBottom();
        }

        this.index.first = newContents[0];
        this.index.last = newContents[newContents.length - 1];
      },
      deep:true
    }
  },
  created() {
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE,
      callback:this.onReadMessage
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.CHAT_MESSAGE,
      callback:this.onChatMessage
    });
  },
  data() {
    return {
      hasFocus: false,
      scroll: {
        top:0,
        height:0
      },
      index: {
        last:null,
        first:null,
      }
    }
  },
  methods:{
    retrySend(id){
      let content = this.contact.messages.flatMap(m => m.contents).find(c => c.id === id);
      this.$emit('retrySendClick', content);
    },
    clearCurrentRecord(){
      this.scroll.top = 0;
      this.height = 0;
      this.index.last = null;
      this.index.first = null;
      this.hasFocus = false;
      this.setScrollBottom();
    },
    fixedScrollPosition(){
      let el = this.$refs["message-content"];
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
      let el = this.$refs["message-content"];
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
      this.$emit("messageContentScroll", d)
    },
    getUsername(c) {
      let username = "用户 [" + c.senderId + "]";
      if (this.renderUsername) {
        username = this.renderUsername(c.senderId);
      }
      return username;
    }
  }
}

</script>