<template>
  <div id="message-content" class="message" ref="message-content" @scroll="messageContentScroll">
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

        <div v-for="c of m.contents" :key="c" :class="c.senderId !== principal.details.id ? 'margin-bottom' : 'margin-bottom text-right'">
          <a-space align="start">
            <a-avatar v-if="c.senderId !== principal.details.id" :src="getPrincipalAvatarByUserId(c.senderId)" class="basic-box-shadow" >
              {{ getUsername(c) }}
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
</template>

<script>


export default {
  name:"ChatMessageContent",
  props:["data", "lastLoadMessage", "recipientId", "renderUsername"],
  emits: ["retrySendClick","messageContentScroll"],
  computed:{
    messages() {
      return this.data;
    }
  },
  watch:{
    messages(newValue, oldValue) {
      console.log(newValue, oldValue);
    }
  },
  data() {
    return {

    }
  },
  methods:{
    retrySend(id){
      let content = this.contact.messages.flatMap(m => m.contents).find(c => c.id === id);
      this.$emit('retrySendClick', content);
    },
    messageContentScroll(d) {
      if (d.target.scrollTop !== 0) {
        return ;
      }
      this.$emit("messageContentScroll", d)
    },
    getUsername(c) {
      let username = "用户 [" + c.senderId + "]";
      if (this.renderUsername) {
        username = this.renderUsername(c);
      }
      return username;
    }
  }
}

</script>