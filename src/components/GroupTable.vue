<template>

  <a-spin :spinning="spinning">

    <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange: selectChange, getCheckboxProps: disabledCheckbox}" :rowKey="record=>record.id" :scroll="{ x: 855 }" :pagination="false" :data-source="data" :columns="columns" bordered>

      <template #sourceName="{ text: sourceName }">
        <a-space :size="10">
          <a-tag v-for="name of sourceName" :key="name" color="success">
            {{ name }}
          </a-tag>
        </a-space>
      </template>

      <template #action="{ record }">
        <div class="text-center">
          <a-space :size="10">
            <a-button size="small" @click="edit(record)" v-if="this.principal.hasPermission('perms[group:get]') && record.modifiable === 1">
              <icon-font class="icon" type="icon-edit"/>
              <span class="hidden-xs">编辑</span>
            </a-button>
            <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[group:delete]') && record.removable === 1">
              <icon-font class="icon" type="icon-ashbin" />
              <span class="hidden-xs">删除</span>
            </a-button>
          </a-space>
        </div>
      </template>

    </a-table>

  </a-spin>

</template>

<script>

export default {
  name:"GroupTable",
  props:["enableDisabledCheckbox"],
  data() {
    return {
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },
        {
          title: "权限名",
          dataIndex: "authority",
          ellipsis: true,
          width: 130
        },
        {
          title: "来源",
          dataIndex: "sourceName",
          ellipsis: true,
          slots: { customRender: 'sourceName' },
          width: 320
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
      data: [],
      spinning:false
    }
  },
  methods:{
    edit(record) {

      let to = {
        name: "group_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    disabledCheckbox(r) {
      return {disabled: r.removable !== 1 && this.enableDisabledCheckbox}
    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    remove(record) {

      let ids = [];

      let confirmMessage;

      if (record) {
        ids.push(record.id);
        confirmMessage = "确定要删除 [" + record.name + "] 组吗?"
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.spinning = true;
        _this
            .$http
            .post("/authentication/group/delete",_this.formUrlencoded({ids:ids})).then((r) => {
              this.$message.success(r.data.message);
              _this.selectedIds = [];
              _this.search();
            })
            .catch(() => _this.spinning = false);
      });

    },
    search(form) {
      let _this = this;

      this.spinning = true;

      _this
          .$http
          .post("/authentication/group/find",_this.formUrlencoded(form))
          .then(r => {
            _this.data = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>