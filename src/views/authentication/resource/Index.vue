<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-attachment" /> 資源管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="資源管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font type="icon-attachment" />
    </template>

    <a-input v-model:value="form['filter_[name_like]']" placeholder="请输入名称进行查询" class="margin-bottom-20">
      <template #addonAfter>
        <a-button type="text" @click="$refs['resource-table'].search(this.form)">
          <icon-font type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </template>
      <template #addonBefore>
        <a-button type="text" :loading="sync" @click="syncResource" v-if="this.principal.hasPermission('perms[group:save]')">
          <icon-font v-if="!sync" type="icon-history"/>
          <span class="hidden-xs">同步資源</span>
        </a-button>
      </template>
    </a-input>

    <resourceTable ref="resource-table"/>

  </a-card>

</template>

<script>

import ResourceTable from "@/components/ResourceTable";

export default {
  name:"GroupIndex",
  components: {ResourceTable},
  data() {
    return {
      sync:false,
      form:{
        "mergeTree":true,
        "filter_[name_like]":""
      }
    }
  },
  methods:{
    syncResource() {
      let _this = this;
      _this.sync = true;

      _this
          .$http
          .post("/authentication/resource/syncPluginResource")
          .then(r => {
            _this.sync = false;
            _this.$message.success(r.data.message);
          })
          .catch(() => _this.spinning = false);

    }
  }
}

</script>