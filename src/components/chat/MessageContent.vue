<template>
  <div id="message-content" class="message" ref="message-content" @mouseleave="hasFocus = false" @mouseenter="hasFocus = true" @scroll="messageContentScroll">
    <template v-if="data.messages">
      <a-divider class="font-size-sm margin-none" v-if="!lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <div v-for="m of data.messages" :key="m.id">

        <div class="text-center margin-top margin-bottom">
          <a-typography-text type="secondary">{{ timestampFormat(m.creationTime) }}</a-typography-text>
        </div>

        <div v-for="c of m.contents" :key="c" class="margin-bottom">
          <a-row v-if="c.type === 900">
            <a-col :span="24" class="text-center">
              <a-typography-text :code="true" type="secondary">{{c.content}}</a-typography-text>
            </a-col>
          </a-row>
          <div v-else :class="c.senderId !== principal.details.id ? '' : 'text-right'">
            <a-space align="start">
              <a-avatar v-if="c.senderId !== principal.details.id" :src="getPrincipalAvatarByUserId(c.senderId)" class="basic-box-shadow" />
              <a-space>

                <a-tooltip v-if="c.senderId === principal.details.id && !c.type">
                  <template #title v-if="c.status === 'fail'">
                    发送失败 <a-button type="link" class="padding-none" @click="retrySend(c.id)">[点击重试]</a-button>
                  </template>
                  <template #title v-else-if="c.status === 'sending'">消息发送中...</template>
                  <a-typography-text :type="c.status === 'sending' ? 'secondary' : 'danger'">
                    <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : 'icon-error'" />
                  </a-typography-text>
                </a-tooltip>

                <a-tooltip v-else-if="c.senderId === principal.details.id && c.type === 10">
                  <template #title v-if=" c.type === 10">
                    <template v-if="c.status === 'success' || c.status === 'unread'">您在 {{$moment(c.creationTime).fromNow()}}已发送成功</template>
                    <template v-else-if="c.status === 'read'">对方已在 {{$moment(c.readTime).fromNow()}}查阅</template>
                  </template>
                  <a-typography-text :type="c.status === 'success' ? 'secondary' : 'success'">
                    <icon-font  class="icon" type="icon-success" />
                  </a-typography-text>
                </a-tooltip>

                <a-popover title="查询信息情况" trigger="hover" placement="left" v-else-if="c.senderId === principal.details.id && c.type === 20">
                  <template #content>
                    <a-tabs>
                      <a-tab-pane key="read">
                        <template #tab>
                          <icon-font class="icon" type="icon-success" /> {{c.readerInfo.length}} 人已查询
                        </template>
                        <a-list item-layout="horizontal" :data-source="c.readerInfo">
                          <template #renderItem="{ item }">
                            <a-list-item>
                              <a-list-item-meta>
                                <template #title>
                                  <a-typography-text strong>{{ getUsername({senderId:item.id}).name }}</a-typography-text> 在 {{$moment(c.creationTime).fromNow()}}已查询
                                </template>
                                <template #avatar>
                                  <a-avatar :src="getPrincipalAvatarByUserId(item.id)" />
                                </template>
                              </a-list-item-meta>
                            </a-list-item>
                          </template>
                        </a-list>
                      </a-tab-pane>
                      <a-tab-pane key="unread">
                        <template #tab>
                          <icon-font class="icon" type="icon-error" /> {{data.participantList.length - c.readerInfo.length}}人未查询
                        </template>
                        <a-list item-layout="horizontal" :data-source="data.participantList.filter(p => !c.readerInfo.map(r => r.id).includes(p.userId))">
                          <template #renderItem="{ item }">
                            <a-list-item>
                              <a-list-item-meta>
                                <template #title>
                                  {{getUsername({senderId:item.userId}).name}}
                                </template>
                                <template #avatar>
                                  <a-avatar :src="getPrincipalAvatarByUserId(item.userId)" />
                                </template>
                              </a-list-item-meta>
                            </a-list-item>
                          </template>
                        </a-list>
                      </a-tab-pane>
                    </a-tabs>
                  </template>
                <a-badge v-if="c.type === 20" :count="c.readerInfo.length" />
                </a-popover>

                <a-card :class="c.senderId === principal.details.id ? 'border-radius basic-box-shadow self' : 'border-radius basic-box-shadow'" v-html="c.content" />

              </a-space>
              <a-avatar v-if="c.senderId === principal.details.id" :src="principal.details.avatar" class="basic-box-shadow" />
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
  emits: ["retrySend","messageContentScroll"],
  watch:{
    "data.messages":{
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

        if (newContents.indexOf(this.index.first) > 0 && this.scroll.top === 0) {
          this.fixedScrollPosition();
        } else if (!this.index.last || newContents.indexOf(this.index.last) <= newContents.length - 1) {
          if (this.scroll.top + this.scroll.clientHeight === this.scroll.scrollHeight) {
            this.setScrollBottom();
          } else {
            console.log("等等在处理");
          }
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
        height:0,
        clientHeight:0
      },
      index: {
        last:null,
        first:null,
      }
    }
  },
  methods:{
    retrySend(id){
      let content = this.data.messages.flatMap(m => m.contents).find(c => c.id === id);
      this.$emit('retrySend', content);
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
        this.scroll.clientHeight = d.target.clientHeight;
        return ;
      }
      this.$emit("messageContentScroll", d)
    },
    getUsername(c) {

      c.name = c.name || "加载中..";

      if (this.renderUsername) {
        return this.renderUsername(c, c.senderId);
      }

      return c;
    }
  }
}

</script>