<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item>系统用户管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="后台用户管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font type="icon-system-user"></icon-font>
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-bottom-15">
        <a-button @click="this.searchDialogVisible=true;">
          <icon-font type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
        <a-button @click="edit" v-if="this.principal.hasPermission('perms[console_user:save]')">
          <icon-font type="icon-add" />
          <span class="hidden-xs">添加</span>
        </a-button>

        <a-button type="primary" @click="remove(null)" danger v-if="this.principal.hasPermission('perms[console_user:delete]')">
          <icon-font type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:selectChange }" :rowKey="record=>record.id" :scroll="{ x: 1170 }" :pagination="false" :data-source="page.content" :columns="columns" bordered>

        <template #action="{ record }">
          <a-space :size="10">
            <a-button size="small" @click="edit(record)">
              <icon-font type="icon-edit" v-if="this.principal.hasPermission('perms[console_user:get]')"/>
              <span class="hidden-xs">编辑</span>
            </a-button>
            <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[console_user:delete]')">
              <icon-font type="icon-ashbin" />
              <span class="hidden-xs">删除</span>
            </a-button>
          </a-space>
        </template>

      </a-table>

      <div class="margin-top-15 text-right" >

        <a-space :size="10">
          <a-input v-model:value="page.size" size="small" @pressEnter="search" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
          <span class="hidden-xs">条 1 页</span>
          <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          {{page.number}}
          <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

        </a-space>

      </div>

    </a-spin>
  </a-card>

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询后台用户" @ok="search" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="登陆账户:">
            <a-input v-model:value="form['filter_[username_eq]']"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="真是姓名:">
            <a-input v-model:value="form['filter_[real_name_like]']"></a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="电子邮箱:">
            <a-input v-model:value="form['filter_[email_like]']"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态:">
            <a-select v-model:value="form['filter_[status_eq]']">
              <a-select-option value="">
                全部
              </a-select-option>
              <a-select-option v-for="(value, name) in statusOptions" :key="value" :value="value">
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
  name:"ConsoleUserIndex",
  data() {
    return {
      columns:[
        {
          title: "登陆账号",
          dataIndex: "username",
          key:"id",
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
          title: "邮箱",
          dataIndex: "email",
          ellipsis: true,
          width: 200
        },{
          title: "状态",
          dataIndex: "statusName",
          ellipsis: true,
          width: 200
        },{
          title: "备注",
          dataIndex: "remark",
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          fixed: "right",
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
        content:[],
        first:false,
        last:false,
        number:1
      },
      spinning:true,
      statusOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.search();
    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> this.statusOptions = r);
  },
  methods:{
    edit:function (record) {

      let to = {
        name: "console_user_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange:function(selectedIds) {
      this.selectedIds = selectedIds;
    },
    remove:function(record) {

      let ids = [];

      let confirmMessage, deleteMessage;

      if (record) {
        ids.push(record.id);
        confirmMessage = "确定要删除 [" + record.username + "] 用户吗?"
        deleteMessage = "删除 [" + record.username + "] 用户成功";
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
        deleteMessage = "删除 " + ids.length + " 条记录成功"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.spinning = true;
        _this.$http.post("/authentication/console/user/delete",_this.formUrlencoded({ids:ids})).then(() => {
          _this.$message.success(deleteMessage);
          _this.selectedIds = [];
          _this.search();
        });
      });

    },
    search:function() {
      let _this = this;

      this.spinning = true;

      _this.searchDialogVisible = false;

      let data = this.form;

      data.size = this.page.size || 10;
      data.number = this.page.number || 1;

      _this.$http.post("/authentication/console/user/page",_this.formUrlencoded(data)).then(r => {
        _this.page = r;
        _this.spinning = false;
      });
    }
  }
}

</script>