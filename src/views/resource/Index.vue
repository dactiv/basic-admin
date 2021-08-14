<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item>组管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="组管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font type="icon-group"></icon-font>
    </template>

    <a-spin :spinning="spinning">

      <a-input v-model:value="form['filter_[name_like]']" placeholder="请输入名称进行查询" size="large" class="margin-bottom-20">
        <template #addonAfter>
          <a-button type="text" @click="search">
            <icon-font type="icon-search" />
            <span class="hidden-xs">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-button type="text" @click="edit()" v-if="this.principal.hasPermission('perms[group:save]')">
            <icon-font type="icon-add"/>
            <span class="hidden-xs">添加</span>
          </a-button>
          <a-button type="text" danger @click="remove(null)" v-if="this.principal.hasPermission('perms[group:delete]')">
            <icon-font type="icon-ashbin" />
            <span class="hidden-xs">删除选中</span>
          </a-button>
        </template>
      </a-input>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange: selectChange, getCheckboxProps: disabledCheckbox}" :rowKey="record=>record.id" :scroll="{ x: 1170 }" :pagination="false" :data-source="data" :columns="columns" bordered>

        <template #sourceName="{ text: sourceName }">
          <a-space :size="10">
            <a-tag v-for="name in sourceName" :key="name" color="success">
              {{ name }}
            </a-tag>
          </a-space>
        </template>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="edit(record)" v-if="this.principal.hasPermission('perms[group:get]') && record.modifiable === 1">
                <icon-font type="icon-edit"/>
                <span class="hidden-xs">编辑</span>
              </a-button>
              <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[group:delete]') && record.removable === 1">
                <icon-font type="icon-ashbin" />
                <span class="hidden-xs">删除</span>
              </a-button>
            </a-space>
          </div>
        </template>

      </a-table>

    </a-spin>
  </a-card>

</template>

<script>

export default {
  name:"ConsoleUserIndex",
  data() {
    return {
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
        },
        {
          title: "权限名",
          dataIndex: "authority",
          ellipsis: true,
        },
        {
          title: "来源",
          dataIndex: "sourceName",
          ellipsis: true,
          slots: { customRender: 'sourceName' },
        },{
          title: "状态",
          dataIndex: "statusName",
          ellipsis: true,
          width: 80
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" },
        }
      ],
      selectedIds:[],
      form:{
        "mergeTree":true,
        "filter_[name_like]":""
      },
      data: [],
      spinning:true,
      statusOptions:[]
    }
  },
  created() {
    this.search();
  },
  methods:{
    edit:function (record) {

      let to = {
        name: "group_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    disabledCheckbox:function(r) {
      return {disabled: r.removable !== 1}
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
        _this
            .$http
            .post("/authentication/group/delete",_this.formUrlencoded({ids:ids})).then(() => {
              this.$message.success(deleteMessage);
              _this.selectedIds = [];
              _this.search();
            })
            .catch(() => _this.spinning = false);
      });

    },
    search:function() {
      let _this = this;

      this.spinning = true;

      _this
          .$http
          .post("/authentication/group/find",_this.formUrlencoded(this.form))
          .then(r => {
            _this.data = r;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>