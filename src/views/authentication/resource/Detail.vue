<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'authentication_resource'}"><icon-font class="icon" type="icon-attachment" /> 資源管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> {{ '[' + form.name + ']' + '資源明细' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="'[' + form.name + ']資源明细'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-file" />
    </template>

    <a-spin :spinning="spinning">
      <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }">

        <a-descriptions-item label="名称"><icon-font class="icon" :type="!form.icon ? 'icon-unkown' : form.icon" /> {{form.name}} </a-descriptions-item>
        <a-descriptions-item label="所属应用">{{ form.applicationName }}</a-descriptions-item>
        <a-descriptions-item label="来源" :span="2">
          <a-space>
            <a-tag v-for="name of form.sources" :key="name.value" color="success">
              {{ name.value }}
            </a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="資源值" :span="2">{{ form.value ? form.value : ""}}</a-descriptions-item>
        <a-descriptions-item label="权限值">{{ form.authority ? form.authority : ""}}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ form.type.value }}</a-descriptions-item>
        <a-descriptions-item label="版本号">{{ form.version }}</a-descriptions-item>
        <a-descriptions-item label="顺序值">{{ form.sort ? form.sort : "" }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ form.remark ? form.remark : "" }}</a-descriptions-item>

      </a-descriptions>
    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"AuthenticationResourceDetail",
  data() {
    return {
      spinning:true,
      form: {
        name: "",
        value: "",
        authority: "",
        sources: [{
          name:"",
          value:""
        }],
        code:"",
        applicationName: "",
        type: {
          name:"",
          value:""
        },
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