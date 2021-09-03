<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-attachment" /> 資源管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="資源管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-attachment" />
    </template>

    <a-input v-model:value="form['filter_[name_like]']" placeholder="请输入名称进行查询" class="margin-bottom-20">
      <template #addonAfter>
        <!-- FIXME 怎么获取 resource-table 的 spinning ？-->
        <a-button type="text" @click="$refs['resource-table'].search(this.form)" >
          <icon-font class="icon" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </template>
      <template #addonBefore>
        <a-button type="text" :loading="sync" @click="syncResource" v-if="this.principal.hasPermission('perms[resource:sync_plugin_resource]')">
          <icon-font class="icon" v-if="!sync" type="icon-history"/>
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
  name:"AuthenticationGroupIndex",
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
          .catch(() => _this.sync = false);

    }
  }
}

</script>