<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-crypto-currency-bitcoin-imac" /> 访问加解密</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="访问加解密" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-crypto-currency-bitcoin-imac" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-bottom-20">
        <a-button @click="this.searchDialogVisible=true;" :loading="spinning">
          <icon-font class="icon" v-if="!spinning" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
        <a-button @click="edit" v-if="this.principal.hasPermission('perms[access_crypto:save]')">
          <icon-font class="icon" type="icon-add" />
          <span class="hidden-xs">添加</span>
        </a-button>

        <a-button type="primary" @click="remove(null)" danger v-if="this.principal.hasPermission('perms[access_crypto:delete]')">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">删除选中</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange:selectChange }" :rowKey="record=>record.id" :scroll="{ x: 1120 }" :pagination="false" :data-source="page.content" :columns="columns" bordered>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="edit(record)" v-if="this.principal.hasPermission('perms[access_crypto:get]')">
                <icon-font class="icon" type="icon-edit" />
                <span class="hidden-xs">编辑</span>
              </a-button>
              <a-button size="small" type="primary" danger @click="remove(record)" v-if="this.principal.hasPermission('perms[access_crypto:delete]')">
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

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询访问加解密" @ok="search(null)" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="名称:">
            <a-input v-model:value="form['filter_[name_like]']" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="类型:">
            <a-input v-model:value="form['filter_[real_type_eq]']" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="值:">
            <a-input v-model:value="form['filter_[value_like]']" />
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
  name:"ConfigCryptoIndex",
  data() {
    return {
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 200
        },
        {
          title: "拦截值",
          dataIndex: "value",
          ellipsis: true,
          width: 200
        },
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 120
        },{
          title: "请求加密",
          dataIndex: "requestDecryptName",
          ellipsis: true,
          width: 150
        },{
          title: "响应加密",
          dataIndex: "responseEncryptName",
          ellipsis: true,
          width: 150
        },{
          title: "状态",
          dataIndex: "statusName",
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
        "filter_[name_like]":"",
        "filter_[type_eq]":"",
        "filter_[value_like]":"",
        "filter_[status_eq]":""
      },
      page: {
        content:[],
        first:false,
        last:false,
        number:1
      },
      spinning: false,
      statusOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r=> this.statusOptions = r.data.data);
  },
  methods:{
    edit(record) {

      let to = {
        name: "config_access_crypto_edit"
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
        confirmMessage = "确定要删除 [" + record.username + "] 访问加解密吗?"
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.spinning = true;
        _this
            .$http
            .post("/config/access/crypto/delete",_this.formUrlencoded({ids:ids})).then((r) => {
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
          .post("/config/access/crypto/page",_this.formUrlencoded(param))
          .then(r => {
            _this.page = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>