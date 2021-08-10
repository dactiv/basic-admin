<template>

  <a-breadcrumb>
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item>系统用户管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="后台用户管理">

    <template #extra>
      <icon-font type="icon-system-user"></icon-font>
    </template>

    <a-space :size="10" class="margin-bottom-15">
      <a-button @click="this.searchDialogVisible=true;"><icon-font type="icon-search" />搜索</a-button>
      <a-button @click="edit" v-if="this.principal.hasPermission('perms[console_user:save]')">
        <icon-font type="icon-add" />添加
      </a-button>

      <a-button type="primary" danger v-if="this.principal.hasPermission('perms[console_user:delete]')">
        <icon-font type="icon-ashbin" /> 删除选中
      </a-button>
    </a-space>

    <a-table class="ant-table-striped" :rowKey="record=>record.id" :row-selection="{ onChange: onSelectChange }" :data-source="page.content" :columns="columns" :loading="loading" bordered>
      <template #action="{ record }">
        <a-space :size="10">
          <a-button size="small" @click="edit(record)">
            <icon-font type="icon-edit" v-if="this.principal.hasPermission('perms[console_user:get]')"/>编辑
          </a-button>
          <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[console_user:delete]')">
            <icon-font type="icon-ashbin" /> 删除
          </a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询后台用户" @ok="search" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="登陆账户:">
            <a-input v-model:value="form['filter_[username_eq]']"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="真是姓名:">
            <a-input v-model:value="form['filter_[real_name_like]']"></a-input>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="12" class="padding-left-10 padding-right-10">
          <a-form-item label="电子邮箱:">
            <a-input v-model:value="form['filter_[email_like]']"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12" class="padding-left-10 padding-right-10">
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
          title: '登陆账号',
          dataIndex: 'username',
          key:"id"
        },
        {
          title: '真是姓名',
          dataIndex: 'realName',
        },
        {
          title: '邮箱',
          dataIndex: 'email',
        },{
          title: '状态',
          dataIndex: 'statusName',
        },{
          title: '备注',
          dataIndex: 'remark',
        },{
          title: '操作',
          fixed: 'right',
          slots: { customRender: 'action' },
        }
      ],
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
      loading:false,
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
    remove:function(record) {

      let _this = this;

      let ids = [];

      if (record !== undefined) {
        ids.push(record.id);
      }

      _this.loading = true;

      _this.$http.post("/authentication/console/user/delete",_this.formUrlencoded({ids:ids})).then(r => {
        _this.page = r;
        _this.loading = false;
      });

    },
    onSelectChange:function(selected) {
      console.log(selected);
    },
    search:function() {
      let _this = this;
      _this.searchDialogVisible = false;

      _this.$http.post("/authentication/console/user/page",_this.formUrlencoded(this.form)).then(r => {
        _this.page = r;
        _this.loading = false;
      });
    }
  }
}

</script>