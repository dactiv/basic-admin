<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-group" /> 组管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="组管理" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-group" />
    </template>

    <a-input v-model:value="form['filter_[name_like]']" placeholder="请输入名称进行查询" class="margin-lg-bottom">
      <template #addonAfter>
        <a-button type="text" @click="$refs['group-table'].search(this.form)" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </template>
      <template #addonBefore>
        <a-button type="text" @click="$refs['group-table'].edit()" v-if="this.principal.hasPermission('perms[group:save]')">
          <icon-font class="icon" type="icon-add"/>
          <span class="hidden-xs">添加</span>
        </a-button>
        <a-button type="text" danger @click="$refs['group-table'].remove(null)" v-if="this.principal.hasPermission('perms[group:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </template>
    </a-input>

    <group-table ref="group-table" :enable-disabled-checkbox="true" @searching="this.spinning=true" @search="this.spinning=false"/>

  </a-card>

</template>

<script>

import GroupTable from '@/components/GroupTable';

export default {
  name:"AuthenticationGroupIndex",
  components: {GroupTable},
  data() {
    return {
      spinning:false,
      form:{
        "mergeTree":true,
        "filter_[name_like]":""
      }
    }
  },
}

</script>