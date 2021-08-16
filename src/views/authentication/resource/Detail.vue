<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home"></icon-font> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'resource'}"><icon-font type="icon-attachment" /> 資源管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-file"></icon-font> {{ '[' + form.name + ']' + '資源明细' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="'[' + form.name + ']' + '資源明细'" class="basic-box-shadow">

    <template #extra>
      <icon-font type="icon-file"></icon-font>
    </template>

    <a-spin :spinning="spinning">
      <a-descriptions
          title="详情信息"
          bordered
          :column="{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
      >

        <a-descriptions-item label="名称"><icon-font v-if="form.icon" :type="form.icon" ></icon-font> {{form.name}} </a-descriptions-item>
        <a-descriptions-item label="来源">{{ form.sourceName}}</a-descriptions-item>
        <a-descriptions-item label="代码">{{ form.code }}</a-descriptions-item>
        <a-descriptions-item label="資源值">{{ form.value ? form.value : ""}}</a-descriptions-item>
        <a-descriptions-item label="权限值">{{ form.authority ? form.authority : ""}}</a-descriptions-item>
        <a-descriptions-item label="所属应用">{{ form.applicationName }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ form.typeName }}</a-descriptions-item>
        <a-descriptions-item label="状态" :span="3" ><a-badge :status="form.status === 1 ? 'success' : form.status === 2 ? 'default' : 'warning'" :text="form.statusName" /></a-descriptions-item>
        <a-descriptions-item label="版本号">{{ form.version }}</a-descriptions-item>
        <a-descriptions-item label="顺序值">{{ form.sort ? form.sort : "" }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ form.remark ? form.remark : "" }}</a-descriptions-item>-->

      </a-descriptions>
    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"ResourceDetail",
  data() {
    return {
      spinning:true,
      form: {
        name: "",
        value: "",
        authority: "",
        sourceName: "",
        code:"",
        applicationName: "",
        typeName: "",
        statusName: "",
        version: "",
        icon:"",
        sort:"",
        remark: "",
      }
    }
  },
  created() {

    let _this = this;

    this
        .$http
        .get("/authentication/resource/get?id=" + this.$route.query.id)
        .then(r => {
          _this.form = r.data.data;
          _this.spinning = false
        })
        .catch(() => _this.spinning = false);

  }
}
</script>