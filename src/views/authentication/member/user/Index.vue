<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-user-groups" /> 会员用户管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="会员用户管理" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-user-groups" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-lg-bottom">
        <a-button @click="searchDialogVisible=true;" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:selectChange }" :rowKey="record=>record.id" :scroll="{ x: 960 }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="detail(record)">
                <icon-font class="icon" type="icon-file" />
                <span class="hidden-xs">详情</span>
              </a-button>
            </a-space>
          </div>
        </template>

        <template #registrationTime="{ text:registrationTime }">
          {{ timestampFormat(registrationTime) }}
        </template>

      </a-table>

      <div class="margin-md-top text-right" >

        <a-space align="center" >
          <span class="hidden-xs">每页</span>
          <a-input v-model:value="page.size" size="small" @pressEnter="search" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
          <span class="hidden-xs">条 / 第 1 页</span>
          <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          {{page.number}}
          <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

        </a-space>

      </div>

    </a-spin>
  </a-card>

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询会员用户" @ok="search(null)" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="登陆账户:">
            <a-input v-model:value="form['filter_[username_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="手机号码:">
            <a-input v-model:value="form['filter_[phone_like]']" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="电子邮箱:">
            <a-input v-model:value="form['filter_[email_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态:">
            <a-select v-model:value="form['filter_[status_eq]']">
              <a-select-option value="">
                全部
              </a-select-option>
              <a-select-option v-for="(value, name) of statusOptions" :key="value" :value="value">
                {{name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <a-form-item label="注册时间:">
            <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[registration_time_between]']">
              <template #suffixIcon>
                <icon-font class="icon" type="icon-calendar" />
              </template>
            </a-range-picker>
          </a-form-item>
        </a-col>
      </a-row>

    </a-form>
  </a-modal>

</template>

<script>

export default {
  name:"AuthenticationMemberUserIndex",
  data() {
    return {
      columns:[
        {
          title: "注册时间",
          dataIndex: "registrationTime",
          ellipsis: true,
          width: 200,
          slots: { customRender: "registrationTime" }
        },
        {
          title: "登陆账号",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },
        {
          title: "手机号码",
          dataIndex: "phone",
          ellipsis: true,
          width: 200
        },
        {
          title: "电子邮箱",
          dataIndex: "email",
          ellipsis: true,
          width: 200
        },{
          title: "状态",
          dataIndex: "status.name",
          ellipsis: true,
          width: 80
        },{
          title: "操作",
          fixed: "right",
          width: 80,
          slots: { customRender: "action" }
        }
      ],
      selectedIds:[],
      form:{
        "filter_[username_like]":"",
        "filter_[phone_like]":"",
        "filter_[email_like]":"",
        "filter_[status_eq]":"",
        "filter_[registration_time_between]":[]
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      spinning:false,
      statusOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> this.statusOptions = r.data.data);
  },
  methods:{
    detail(record) {

      let to = {
        name: "authentication_member_user_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    search(number) {
      let _this = this;

      this.spinning = true;

      _this.searchDialogVisible = false;

      let data = this.form;

      data.size = this.page.size || 10;
      data.number = number || _this.page.number;

      _this
          .$http
          .post("/authentication/member/user/page",_this.formUrlencoded(data))
          .then(r => {
            _this.page = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>