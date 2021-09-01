<template>
  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'message_site'}"><icon-font class="icon" type="icon-sms" /> 站内信消息</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-send" /> 发送站内信</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="发送站内信" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-notification" />
    </template>

    <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

      <a-row>
        <a-col :span="24">
          <a-form-item has-feedback label="类型:" name="type">
            <a-select class="width-100-percent" v-model:value="form.type">
              <a-select-option v-for="(value, name) of typeOptions" :key="name" :value="name">
                {{value}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row >
        <a-col :span="24">
          <a-form-item label="发送给:" name="toUserIds">
            <a-row type="flex">
              <a-col flex="auto" class="margin-right-10">
                <a-select class="width-100-percent" :max-tag-count="2" ref="select-multiple" :disabled="form.toUserIds.includes('ALL_USER')" mode="multiple" :token-separators="[',']" v-model:value="form.toUserIds" :filter-option="false" :not-found-content="searching ? undefined : null" :options="data" @search="searchSelectUser">
                </a-select>
              </a-col>
              <a-col>
                <a-space :size="10">
                  <a-switch checked-children="推送 APP" un-checked-children="不推送 APP" v-model:checked="form.isPush" />
                  <a-button ref="btn-all-user" @click="sendAll">
                    <icon-font class="icon" :type="form.toUserIds.includes('ALL_USER') ? 'icon-ashbin' : 'icon-all'" />
                    <span class="hidden-xs">{{form.toUserIds.includes('ALL_USER') ? '取消选择' : '全网站内信'}}</span>
                  </a-button>
                  <a-button :disabled="form.toUserIds.includes('ALL_USER')" ref="btn-search-user" @click="search.dialogVisible = true">
                    <icon-font class="icon" type="icon-filter"/>
                    <span class="hidden-xs">条件搜索站内信</span>
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="标题:" name="title">
            <a-input v-model:value="form.title" :default-value="form.title" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-list class="margin-bottom-20 attachment" item-layout="horizontal" bordered v-if="fileList.length > 0" :data-source="fileList">
        <template #renderItem="{ item }">
          <a-list-item :key="item.uid">
            <template #actions>
              <a-button danger @click="removeAttachment(item.uid)">
                <icon-font class="icon" type="icon-ashbin" />
                <span class="hidden-xs">删除</span>
              </a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <a-typography-text :type="item.status !== 'done' ? 'secondary' : item.status === 'error' ? 'danger' : 'success'">{{ item.name }}</a-typography-text>
              </template>
              <template #description>
                <a-progress :percent="item.percent" />
              </template>
              <template #avatar>
                <a-typography-text :type="item.status !== 'done' ? 'secondary' : item.status === 'error' ? 'danger' : 'success'">
                  <icon-font class="icon file" :type="'icon-' + item.type.substring(item.type.indexOf('/') + 1,item.type.length).toUpperCase()" />
                </a-typography-text>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <a-row >
        <a-col :span="24">
          <a-form-item label="内容:" name="content">
            <QuillEditor toolbar="full" theme="snow" v-model:content="form.content" content-type="html" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider></a-divider>

      <a-space :size="10">

        <a-button type="primary" :loading="sending" @click="submitForm" v-if="this.principal.hasPermission('perms[message:send]')">
          <icon-font class="icon" v-if="!sending" type="icon-send" />
          <span class="hidden-xs">发送</span>
        </a-button>

        <a-upload v-if="this.principal.hasPermission('perms[message:send]')" :showUploadList="false" :multiple="true" v-model:file-list="fileList" action="/file-manager/upload/site-attachment" @change="fileListChange">
          <a-button>
            <icon-font class="icon" type="icon-attachment" />
            <span class="hidden-xs">上传附件</span>
          </a-button>
        </a-upload>

      </a-space>

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
            {{ this.timestampFormat(registrationTime)}}
          </template>

        </a-table>
      </a-spin>

    </a-form>

    <template #footer>
      <a-button key="search" @click="searchTableUser">
        <icon-font class="icon" type="icon-search" />
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

import { QuillEditor } from '@vueup/vue-quill'

import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@/assets/css/quill.css'

const defaultData = {
  value: 'ALL_USER',
  label: '全网用户',
}

export default {
  name:"MessageSiteSend",
  components:{
    QuillEditor
  },
  methods:{
    sendAll() {

      if (this.form.toUserIds.includes("ALL_USER")) {
        this.form.toUserIds = this.getSelectedUserIds();
      } else {
        this.form.toUserIds = ["ALL_USER"];
      }

    },
    userTableSelectChange(selectedIds) {
      this.search.selectedIds = selectedIds;
      this.form.toUserIds = this.getSelectedUserIds();
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
        "filter_[username_like]":value,
        "size":10,
        "number":1
      }

      _this
          .$http
          .post("/authentication/member/user/page",_this.formUrlencoded(searchFrom))
          .then(r => {
            r.data.data.content.forEach(v => _this.data.push({label:v.username, value:v.id}));
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
            r.data.data.forEach(v => _this.data.push({label:v.username, value:v.id}));
            _this.search.spinning = false;
          })
          .catch(() => _this.search.spinning = false);
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.sending = true;

        if (_this.form.isPush === true) {
          _this.form.isPush = 1;
        } else {
          _this.form.isPush = 0;
        }

        _this
            .$http
            .post("/message/send", _this.form)
            .then((r) => {

              _this.sending = false;
              _this.$message.success(r.data.message);

              let to = {};

              if (r.data.data.batchId) {
                to["name"] = "message_batch_detail";
                to["query"] = {id:r.data.data.batchId};
              } else {
                to["name"] = "message_site_detail";
                to["query"] = {id:r.data.data.id[0]};
              }

              _this.$router.push(to);

            }).catch(() => _this.sending = false)
      });
    },
    removeAttachment(uid) {

      let file = this.fileList.find(f => f.uid === uid);

      if (file.status !== "done") {
        return ;
      }

      let _this = this;

      if (!_this.principal.hasPermission('perms[file_manager:delete]')) {
        _this.$message.error("您没有删除文件的权限");
        return false;
      }

      _this
          .$http
          .post("/file-manager/delete", _this.formUrlencoded({bucketName:file.response.data.bucket, filename:file.name}))
          .then(r => {

            _this.$message.success(r.data.message);

            let fileIndex = _this.fileList.indexOf(a => a.uid === uid);
            _this.fileList.splice(fileIndex, 1);

            let attachmentIndex = this.form.attachmentList.indexOf(a => a.uid === uid);
            this.form.attachmentList.splice(attachmentIndex, 1);

          });

    },
    fileListChange(info) {

      if (info.file.status === "done") {

        let attachment = {
          name: info.file.name,
          contentType: info.file.type,
          uid: info.file.uid,
          meta: {
            link:info.file.response.data.url,
            bucket:info.file.response.data.bucket
          }
        };

        this.form.attachmentList.push(attachment);

      }

    }
  },
  created() {
    this.loadConfig({service:"message", enumerateName:"MessageType"}, r=> this.typeOptions = r.data.data);
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
        messageType:"site",
        toUserIds:[],
        isPush:0,
        type:"",
        content:"",
        title:"",
        attachmentList:[]
      },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        toUserIds: [{ required: true, message: "请输入用户", trigger: "blur", type: "array"}],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      }
    }
  }
}
</script>