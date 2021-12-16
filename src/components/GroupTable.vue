<template>

  <a-spin :spinning="spinning">

    <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange: selectChange, getCheckboxProps: disabledCheckbox}" :rowKey="record=>record.id" :scroll="{ x: 855 }" :pagination="false" :data-source="data" :columns="columns" bordered>

      <template #sources="{ text: sources }">
        <a-space>
          <a-tag v-for="name of sources" :key="name.value" color="success">
            {{ name.value }}
          </a-tag>
        </a-space>
      </template>

      <template #action="{ record }">
        <div class="text-center">
          <a-space :size="10">
            <a-button size="small" @click="edit(record)" v-if="principal.hasPermission('perms[group:get]') && record.modifiable === 1">
              <icon-font class="icon" type="icon-edit"/>
              <span class="hidden-xs">编辑</span>
            </a-button>
            <a-button size="small" type="primary" danger @click="remove(record)" v-if="principal.hasPermission('perms[group:delete]') && record.removable === 1">
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
// FIXME 表格没办法全选
export default {
  name:"AuthenticationGroupTable",
  props:["enableDisabledCheckbox", "searchData"],
  emits: ["searching", "search"],
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
          dataIndex: "sources",
          ellipsis: true,
          slots: { customRender: 'sources' },
          width: 320
        },{
          title: "状态",
          dataIndex: "status.name",
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
        name: "authentication_group_edit"
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
    getSelectedRecords() {
      return this.selectedIds.map(id => this.findRecordById(id));
    },
    findRecordById(id) {
      for (let i = 0; i < this.data.length; i++) {
        let r = this.data[i];
        if (r.id === id) {
          return r;
        } else if (r.children) {
          r = this.getRecordById(id, r.children);
          if (r) {
            return r;
          }
        }
      }
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

      _this.spinning = true;
      this.$emit('searching');

      if (!form) {
        form = this.searchData;
      }

      _this
          .$http
          .post("/authentication/group/find",_this.formUrlencoded(form))
          .then(r => {
            _this.data = r.data.data;
            _this.spinning = false;
            this.$emit('search');
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>