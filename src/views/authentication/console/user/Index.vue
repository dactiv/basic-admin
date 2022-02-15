<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-system-user" /> 系统用户管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="系统用户管理" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-system-user" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-lg-bottom">
        <a-button @click="searchDialogVisible=true;" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
        <a-button @click="edit" v-if="principal.hasPermission('perms[console_user:save]')">
          <icon-font class="icon" type="icon-add" />
          <span class="hidden-xs">添加</span>
        </a-button>

        <a-button type="primary" @click="remove(null)" danger v-if="principal.hasPermission('perms[console_user:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:selectChange }" :rowKey="record=>record.id" :scroll="{ x: 1170 }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="edit(record)" v-if="principal.hasPermission('perms[console_user:get]')">
                <icon-font class="icon" type="icon-edit" />
                <span class="hidden-xs">编辑</span>
              </a-button>
              <a-button size="small" type="primary" danger @click="remove(record)" v-if="principal.hasPermission('perms[console_user:delete]')">
                <icon-font class="icon" type="icon-ashbin" />
                <span class="hidden-xs">删除</span>
              </a-button>
            </a-space>
          </div>
        </template>

      </a-table>

      <div class="margin-md-top text-right" >

        <a-space>
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

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询后台用户" @ok="search(null)" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="登陆账户:">
            <a-input v-model:value="form['filter_[username_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="真是姓名:">
            <a-input v-model:value="form['filter_[real_name_like]']" />
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

    </a-form>
  </a-modal>

</template>

<script>

export default {
  name:"AuthenticationConsoleUserIndex",
  data() {
    return {
      columns:[
        {
          title: "登陆账号",
          dataIndex: "username",
          ellipsis: true,
          width: 200
        },
        {
          title: "真是姓名",
          dataIndex: "realName",
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
          title: "备注",
          dataIndex: "remark",
          ellipsis: true,
          width: 320
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" },
        }
      ],
      selectedIds:[],
      form:{
        "filter_[username_eq]":"",
        "filter_[real_name_like]":"",
        "filter_[email_like]":"",
        "filter_[status_eq]":""
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      spinning: false,
      statusOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> this.statusOptions = r.data.data);
  },
  methods:{
    edit(record) {

      let to = {
        name: "authentication_console_user_edit"
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
        confirmMessage = "确定要删除 [" + record.username + "] 系统用户吗?"
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.spinning = true;
        _this
            .$http
            .post("/authentication/console/user/delete",_this.formUrlencoded({ids:ids})).then((r) => {
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
          .post("/authentication/console/user/page",_this.formUrlencoded(param))
          .then(r => {
            _this.page = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>