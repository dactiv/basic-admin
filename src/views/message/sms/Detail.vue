<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'message_site'}"><icon-font class="icon" type="icon-notification" /> 短信消息</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 短信消息明细</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="短信消息明细" class="basic-box-shadow">
    <template #extra>
      <a-button @click="reload" :loading="spinning">
        <icon-font class="icon" v-if="!spinning" type="icon-refresh" />
        <span class="hidden-xs">刷新</span>
      </a-button>
    </template>

    <a-spin :spinning="spinning">
      <a-descriptions
          bordered
          :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
      >

        <a-descriptions-item label="类型">{{ form.typeName }}</a-descriptions-item>
        <a-descriptions-item label="状态"><a-badge :status="form.status === 0 ? 'processing' : form.status === 1 ? 'success' : 'error'" :text="form.statusName" /></a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ this.timestampFormat(form.creationTime) }} </a-descriptions-item>
        <a-descriptions-item label="下次重试时间">{{ this.timestampFormat(form.nextRetryTime) }} </a-descriptions-item>
        <a-descriptions-item label="最后发送时间">{{ this.timestampFormat(form.lastSendTime) }} </a-descriptions-item>
        <a-descriptions-item label="发送完成时间">{{ this.timestampFormat(form.successTime) }} </a-descriptions-item>
        <a-descriptions-item label="重试次数">{{ form.retryCount}}</a-descriptions-item>
        <a-descriptions-item label="最大重试次数">{{ form.maxRetryCount}}</a-descriptions-item>
        <a-descriptions-item label="异常信息" :span="2"><pre>{{ form.exception }}</pre></a-descriptions-item>

      </a-descriptions>

      <a-divider><a-typography-text type="secondary">短信数据</a-typography-text></a-divider>

      <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }">

        <a-descriptions-item label="发送渠道">{{ form.channel }}</a-descriptions-item>
        <a-descriptions-item label="收信号码">{{ form.phoneNumber }}</a-descriptions-item>
        <a-descriptions-item label="标题" :span="2">{{ form.title}}</a-descriptions-item>
        <a-descriptions-item label="内容" :span="2"><p v-html="form.content"></p></a-descriptions-item>
      </a-descriptions>

    </a-spin>
  </a-card>

</template>

<script>

export default {
  name:"MessageEmailDetail",
  methods:{
    reload(){

      let _this = this;

      _this.spinning = true;

      _this
          .$http
          .get("/message/sms/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;
            _this.spinning = false
          })
          .catch(() => _this.spinning = false);

    }
  },
  computed: {
    tableScrollX() {

      if (this.columns.length > 0) {
        return this.columns.filter(c => c.width).reduce((sum, c) =>sum + c.width, 0);
      }

      return 0;
    }
  },
  data() {
    return {
      spinning:true,
      form: {
        id:"",
        creationTime: "",
        type:"",
        typeName: "",
        status:"",
        statusName: "",
        lastSendTime: "",
        successTime:"",
        nextRetryTime:"",
        channel: "",
        phoneNumber: "",
        retryCount:"",
        maxRetryCount:"",
        exception:""
      }
    }
  },
  created() {
    this.reload();
  }
}
</script>