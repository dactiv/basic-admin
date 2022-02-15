<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-group" /> 部门管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="部门管理" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-group" />
    </template>

    <a-input v-model:value="form['filter_[name_like]']" placeholder="请输入名称进行查询" class="margin-lg-bottom">
      <template #addonAfter>
        <a-button type="text" @click="$refs['department-table'].search(this.form)" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </template>
      <template #addonBefore>
        <a-button type="text" @click="$refs['department-table'].edit()" v-if="principal.hasPermission('perms[department:save]')">
          <icon-font class="icon" type="icon-add"/>
          <span class="hidden-xs">添加</span>
        </a-button>
        <a-button type="text" danger @click="$refs['department-table'].remove(null)" v-if="principal.hasPermission('perms[department:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </template>
    </a-input>

    <department-table ref="department-table" :enable-disabled-checkbox="true" @searching="spinning=true" @search="spinning=false"/>

  </a-card>

</template>

<script>

import DepartmentTable from '@/components/DepartmentTable';

export default {
  name:"AuthenticationDepartmentIndex",
  components: {DepartmentTable},
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