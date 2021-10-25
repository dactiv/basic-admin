<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-email" /> 邮件消息</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="邮件管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-email" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-bottom-20">
        <a-button @click="this.searchDialogVisible=true;" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
        <a-button @click="send" v-if="this.principal.hasPermission('perms[message:send]')">
          <icon-font class="icon" type="icon-send" />
          <span class="hidden-xs">发送</span>
        </a-button>

        <a-button type="primary" @click="remove(null)" danger v-if="this.principal.hasPermission('perms[email:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:selectChange }" :rowKey="record=>record.id" :scroll="{ x: 1575 }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>
        <template #successTime="{ text:successTime }">
          {{ this.timestampFormat(successTime)}}
        </template>
        <template #lastSendTime="{ text:lastSendTime }">
          {{ this.timestampFormat(lastSendTime)}}
        </template>
        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[email:get]')">
                <icon-font class="icon" type="icon-file" />
                <span class="hidden-xs">详情</span>
              </a-button>
              <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[email:delete]')">
                <icon-font class="icon" type="icon-ashbin" />
                <span class="hidden-xs">删除</span>
              </a-button>
            </a-space>
          </div>
        </template>

      </a-table>

      <div class="margin-top-15 text-right" >

        <a-space :size="10">
          <span class="hidden-xs">每页</span>
          <a-input v-model:value="page.size" size="small" @pressEnter="search" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
          <span class="hidden-xs">条 / 第 1 页</span>
          <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font class="icon" type="icon-arrow-left-bold" /></a-button>
          {{page.number}}
          <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font class="icon" type="icon-arrow-right-bold" /></a-button>

        </a-space>

      </div>

    </a-spin>
  </a-card>

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询邮件消息" @ok="search(null)" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="标题:">
            <a-input v-model:value="form['filter_[title_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="内容:">
            <a-input v-model:value="form['filter_[content_eq]']" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="类型:">
            <a-select v-model:value="form['filter_[type_eq]']">
              <a-select-option value="">
                全部
              </a-select-option>
              <a-select-option v-for="(name, value) of typeOptions" :key="value" :value="value">
                {{name}}
              </a-select-option>
            </a-select>
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

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="发送邮件:">
            <a-input v-model:value="form['filter_[from_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="收取邮件:">
            <a-input v-model:value="form['filter_[to_like]']" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <a-form-item label="最后发送时间:">
            <a-range-picker show-time class="width-100-percent" v-model:value="form['filter_[creation_time_between]']">
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
  name:"MessageEmailIndex",
  data() {
    return {
      columns:[
        {
          title: "状态",
          dataIndex: "statusName",
          ellipsis: true,
          width: 100
        },
        {
          title: "类型",
          dataIndex: "typeName",
          ellipsis: true,
          width: 100
        },
        {
          title: "发送邮件",
          dataIndex: "fromEmail",
          ellipsis: true,
          width: 200
        },
        {
          title: "收取邮件",
          dataIndex: "toEmail",
          ellipsis: true,
          width: 200
        },{
          title: "标题",
          dataIndex: "title",
          ellipsis: true,
          width: 250
        },{
          title: "重试次数",
          dataIndex: "retryCount",
          ellipsis: true,
          width: 150
        },{
          title: "最后发送时间",
          dataIndex: "lastSendTime",
          slots: { customRender: "lastSendTime" },
          ellipsis: true,
          width: 200
        },{
          title: "发送成功时间",
          dataIndex: "successTime",
          slots: { customRender: "successTime" },
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" }
        }
      ],
      selectedIds:[],
      form:{
        "filter_[title_like]":"",
        "filter_[content_eq]":"",
        "filter_[type_eq]":"",
        "filter_[status_eq]":"",
        "filter_[from_like]":"",
        "filter_[to_like]":"",
        "filter_[creation_time_between]":[]
      },
      page: {
        elements:[],
        first:false,
        last:false,
        number:1
      },
      spinning: false,
      statusOptions:[],
      typeOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfig({service:"message", enumerateName:"MessageType"}, r=> this.typeOptions = r.data.data);
    this.loadConfig({service:"config", enumerateName:"ExecuteStatus"}, r=> this.statusOptions = r.data.data);
  },
  methods:{
    send() {
      this.$router.push({name:"message_email_send"});
    },
    detail(record) {

      let to = {
        name: "message_email_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    remove(record) {

      let ids = [];

      let confirmMessage;

      if (record) {
        ids.push(record.id);
        confirmMessage = "确定要删除 [" + record.title + "] 邮件吗?"
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.spinning = true;
        _this
            .$http
            .post("/message/email/delete",_this.formUrlencoded({ids:ids})).then((r) => {
              this.$message.success(r.data.message);
              _this.selectedIds = [];
              _this.search();
            })
            .catch(() => _this.spinning = false);
      });

    },
    search(number) {
      let _this = this;

      this.spinning = true;

      _this.searchDialogVisible = false;

      let param = _this.form;

      param.size = _this.page.size || 10;
      param.number = number || _this.page.number;

      _this
          .$http
          .post("/message/email/page",_this.formUrlencoded(param))
          .then(r => {
            _this.page = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>