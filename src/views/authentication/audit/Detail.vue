<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'audit'}"><icon-font type="icon-audit" /> 操作审计</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-file" /> 审计详情</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="审计详情" class="basic-box-shadow">

    <template #extra>
      <icon-font type="icon-file"></icon-font>
    </template>

    <a-spin :spinning="spinning">
      <a-descriptions
          bordered
          :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
      >

        <a-descriptions-item label="操作人">{{ form.principal}} </a-descriptions-item>
        <a-descriptions-item label="操作模块">{{ form.type}}</a-descriptions-item>
        <a-descriptions-item label="操作时间" :span="2">{{ this.timestampFormat(form.timestamp.toString().replace(".","") * 1) }}</a-descriptions-item>
        <a-descriptions-item label="参数信息" :span="2">
          <pre>{{ JSON.stringify(form.data,null,2)}}</pre>
        </a-descriptions-item>

      </a-descriptions>
    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"AuditDetail",
  data() {
    return {
      spinning:true,
      form: {
        principal: "",
        type: "",
        timestamp: "",
        data: ""
      }
    }
  },
  created() {

    let _this = this;

    let param = {
      id:this.$route.query.id,
      after: this.convertFormUrlencoded(this.$moment(this.$route.query.after * 1))
    };

    _this
        .$http
        .get("/authentication/getAudit?id=" + param.id + "&after=" + param.after)
        .then(r => {
          _this.form = r.data.data;
          _this.spinning = false
        })
        .catch(() => _this.spinning = false);

  }
}
</script>