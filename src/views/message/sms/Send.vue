<template>
  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'message_sms'}"><icon-font class="icon" type="icon-sms" /> 短信消息</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-send" /> 发送站内信</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="发送站内信" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-notification" />
    </template>

    <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

      <a-form-item has-feedback label="类型:" name="type">
        <a-select class="width-100-percent" v-model:value="form.type">
          <a-select-option v-for="(value, name) of typeOptions" :key="name" :value="name">
            {{value}}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="发送给:" name="phoneNumbers">
        <a-row type="flex">
          <a-col flex="auto" class="margin-right">
            <a-select class="width-100-percent" :max-tag-count="2" ref="select-tags" :disabled="form.phoneNumbers.includes(13000000000)" mode="tags" :token-separators="[',']" v-model:value="form.phoneNumbers" :filter-option="false" :not-found-content="searching ? undefined : null" :options="data" @search="searchSelectUser">
            </a-select>
          </a-col>
          <a-col>
            <a-space :size="10">
              <a-button ref="btn-all-user" @click="sendAll">
                <icon-font class="icon" :type="form.phoneNumbers.includes(13000000000) ? 'icon-ashbin' : 'icon-all'" />
                <span class="hidden-xs">{{form.phoneNumbers.includes(13000000000) ? '取消选择' : '全网站内信'}}</span>
              </a-button>
              <a-button :disabled="form.phoneNumbers.includes('ALL_USER')" ref="btn-search-user" @click="search.dialogVisible = true">
                <icon-font class="icon" type="icon-filter"/>
                <span class="hidden-xs">条件搜索站内信</span>
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item label="内容:" name="content">
        <a-textarea v-model:value="form.content" :auto-size="{ minRows: 3, maxRows: 6 }"/>
      </a-form-item>

      <a-divider />

      <a-button type="primary" :loading="sending" @click="submitForm" v-if="principal.hasPermission('perms[message:send]')">
        <icon-font class="icon" v-if="!sending" type="icon-send" />
        <span class="hidden-xs">发送</span>
      </a-button>

    </a-form>

  </a-card>

  <a-modal v-model:visible="search.dialogVisible" width="850px" title="查询会员用户" layout="vertical">
    <a-form ref="search-form" :model="search.form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="登陆账户:">
            <a-input v-model:value="search.form['filter_[username_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="手机号码:">
            <a-input v-model:value="search.form['filter_[phone_like]']" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <a-form-item label="注册时间:">
            <a-range-picker show-time class="width-100-percent" v-model:value="search.form['filter_[registration_time_between]']">
              <template #suffixIcon>
                <icon-font class="icon" type="icon-calendar" />
              </template>
            </a-range-picker>
          </a-form-item>
        </a-col>
      </a-row>

      <a-spin :spinning="search.spinning" tip="数据加载中...">
        <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: search.selectedIds, onChange:userTableSelectChange }" :rowKey="record=>record.id" :scroll="{ x: 800, y: 300 }" :pagination="false" :data-source="search.data" :columns="search.columns" bordered>

          <template #registrationTime="{ text:registrationTime }">
            {{ timestampFormat(registrationTime) }}
          </template>

        </a-table>
      </a-spin>

    </a-form>

    <template #footer>
      <a-button key="search" :loading="search.spinning" @click="searchTableUser">
        <icon-font class="icon" v-if="!search.spinning"  type="icon-search" />
        <span class="hidden-xs">查询</span>
      </a-button>
      <a-button key="confirm" type="primary" @click="search.dialogVisible = false">
        <icon-font class="icon" type="icon-select" />
        <span class="hidden-xs">确定</span>
      </a-button>
    </template>

  </a-modal>

</template>

<script>

const defaultData = {
  value: 13000000000,
  label: '全网用户',
}

export default {
  name:"MessageSmsSend",
  methods:{
    sendAll() {

      if (this.form.phoneNumbers.includes("ALL_USER")) {
        this.form.phoneNumbers = this.getSelectedUserIds();
      } else {
        this.form.phoneNumbers = ["ALL_USER"];
      }

    },
    userTableSelectChange(selectedIds) {
      this.search.selectedIds = selectedIds;
      this.form.phoneNumbers = this.getSelectedUserIds();
    },
    getSelectedUserIds() {
      return this.search.data.filter(d => this.search.selectedIds.includes(d.id)).map(value => value.id);
    },
    searchSelectUser(value) {

      let _this = this;

      _this.searching = true;
      _this.search.data = [];

      _this.data = [JSON.parse(JSON.stringify(defaultData))];

      let searchFrom = {
        "filter_[phone_rlike]":value,
        "size":10,
        "number":1
      }

      _this
          .$http
          .post("/authentication/member/user/page",_this.formUrlencoded(searchFrom))
          .then(r => {
            r.data.data.content.forEach(v => _this.data.push({label:v.phone, value:v.phone}));
            _this.searching = false;
          })
          .catch(() => _this.searching = false);
    },
    searchTableUser() {
      let _this = this;

      _this.search.spinning = true;

      _this.data = [JSON.parse(JSON.stringify(defaultData))];

      _this
          .$http
          .post("/authentication/member/user/find",_this.formUrlencoded(this.search.form))
          .then(r => {
            _this.search.data = r.data.data;
            r.data.data.forEach(v => _this.data.push({label:v.phone, value:v.phone}));
            _this.search.spinning = false;
          })
          .catch(() => _this.search.spinning = false);
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.sending = true;

        let data = JSON.parse(JSON.stringify(_this.form));

        if (data.phoneNumbers.length === 1 && data.phoneNumbers.includes(defaultData.value)) {
          data.phoneNumbers = ["ALL_USER"]
        }

        _this
            .$http
            .post("/message/send", data)
            .then((r) => {

              _this.sending = false;
              _this.$message.success(r.data.message);

              let to = {};

              if (r.data.data.batchId) {
                to["name"] = "message_batch_detail";
                to["query"] = {id:r.data.data.batchId};
              } else {
                to["name"] = "message_sms_detail";
                to["query"] = {id:r.data.data.id[0]};
              }

              _this.$router.push(to);

            }).catch(() => _this.sending = false)
      });
    },
  },
  created() {
    this.loadConfig({service:"message", enumerateName:"MessageTypeEnum"}, r=> this.typeOptions = r.data.data);
  },
  data() {
    return {
      sending: false,
      searching: false,
      fileList:[],
      typeOptions:[],
      data:[JSON.parse(JSON.stringify(defaultData))],
      search:{
        dialogVisible:false,
        spinning:false,
        form: {
          "filter_[phone_like]":"",
          "filter_[registration_time_between]":[],
          "filter_[username_like]":"",
          "filter_[status_eq]":"1"
        },
        data:[],
        selectedIds:[],
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
            fixed: "right",
            width: 200
          }
        ]
      },
      form: {
        messageType:"sms",
        phoneNumbers:[],
        type:"",
        content:""
      },
      rules: {
        content: [{ required: true, message: "请输入内容", trigger: "change" }],
        phoneNumbers: [{ required: true, message: "请输入手机号码", trigger: "change", type: "array", defaultField:{type:"integer", pattern: /^1[3|4|5|8][0-9]\d{4,8}$/, message:"手机号码格式不正确"}}],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      }
    }
  }
}
</script>