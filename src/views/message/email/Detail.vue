<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'message_email'}"><icon-font class="icon" type="icon-email" /> 邮件消息</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> 邮件消息明细</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="邮件明细" class="basic-box-shadow">
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

      <a-divider><a-typography-text type="secondary">邮件数据</a-typography-text></a-divider>

      <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }">

        <a-descriptions-item label="发送的邮件">{{ form.fromEmail }}</a-descriptions-item>
        <a-descriptions-item label="收取的收件">{{ form.toEmail}}</a-descriptions-item>
        <a-descriptions-item label="标题" :span="2">{{ form.title}}</a-descriptions-item>
        <a-descriptions-item label="内容" :span="2"><p v-html="form.content"></p></a-descriptions-item>
        <a-descriptions-item v-if="form.hasAttachment > 0" label="附件" :span="2">

          <a-list class="attachment" item-layout="horizontal" bordered  :data-source="form.attachmentList">
            <template #renderItem="{ item }">
              <a-list-item :key="item.id">
                <a-list-item-meta>
                  <template #title>
                    <a-typography-link :href="item.meta.link" target="_blank" class="">
                      {{ item.name }}
                    </a-typography-link>
                  </template>
                  <template #avatar>
                    <a-typography-link :href="item.meta.link" target="_blank">
                      <icon-font class="icon" :type="this.getFileIcon(item.name)" />
                    </a-typography-link>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>

        </a-descriptions-item>
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
          .get("/message/email/get?id=" + this.$route.query.id)
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
        fromEmail: "",
        toEmail: "",
        retryCount:"",
        maxRetryCount:"",
        hasAttachment: 0,
        attachmentList:[],
        exception:""
      }
    }
  },
  created() {
    this.reload();
  }
}
</script>