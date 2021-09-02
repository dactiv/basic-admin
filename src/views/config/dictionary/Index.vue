<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-dictionary" /> 数据字典管理</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="数据字典管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-dictionary" />
    </template>

    <a-input v-model:value="form['filter_[code_like]']" placeholder="请输入名称进行查询" class="margin-bottom-20">
      <template #addonAfter>
        <a-button type="text" @click="search()" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </template>
      <template #addonBefore>
        <a-button type="text" @click="edit()" v-if="this.principal.hasPermission('perms[dictionary_type:save]')">
          <icon-font class="icon" type="icon-add"/>
          <span class="hidden-xs">添加</span>
        </a-button>
        <a-button type="text" danger @click="remove(null)" v-if="this.principal.hasPermission('perms[dictionary_type:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </template>
    </a-input>

    <a-spin :spinning="spinning">

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange: selectChange}" :rowKey="record=>record.id" :scroll="{ x: 875 }" :pagination="false" :data-source="data" :columns="columns" bordered>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="edit(record)" v-if="this.principal.hasPermission('perms[dictionary_type:get]')">
                <icon-font class="icon" type="icon-edit" />
                <span class="hidden-xs">编辑</span>
              </a-button>
              <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[dictionary_type:delete]')">
                <icon-font class="icon" type="icon-ashbin" />
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
  name:"ConfigDictionaryIndex",
  data() {
    return {
      form: {
        "filter_[code_like]":"",
        "mergeTree":true
      },
      columns:[
        {
          title: "代码",
          dataIndex: "code",
          ellipsis: true,
          width: 300
        },{
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },{
          title: "备注",
          dataIndex: "remark",
          ellipsis: true,
          width: 250
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" },
        }
      ],
      selectedIds:[],
      data: [],
      spinning:false
    }
  },
  methods:{
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    edit(record) {

      let to = {
        name: "config_dictionary_type_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    remove(record) {

      let ids = [];

      let confirmMessage, deleteMessage;

      if (record) {
        ids.push(record.id);
        confirmMessage = "确定要删除 [" + record.name + "] 字典类型吗?"
        deleteMessage = "删除 [" + record.name + "] 字典类型成功";
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
            .post("/config/dictionary/deleteDictionaryType",_this.formUrlencoded({ids:ids})).then(() => {
              _this.$message.success(deleteMessage);
              _this.selectedIds = [];
              _this.search();
            })
            .catch(() => _this.spinning = false);
      });

    },
    search() {
      let _this = this;

      this.spinning = true;

      _this
          .$http
          .post("/config/dictionary/findDictionaryType",_this.formUrlencoded(this.form))
          .then(r => {
            _this.data = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>