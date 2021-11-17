<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-audit" /> 操作审计</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="操作审计管理" class="basic-box-shadow margin-lg-top">

    <template #extra>
      <icon-font class="icon" type="icon-audit" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-lg-bottom">
        <a-button @click="this.searchDialogVisible=true">
          <icon-font class="icon" type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: 775 }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>

        <template #timestamp="{ text:timestamp }">
          {{ this.timestampFormat(timestamp.toString().replace(".","") * 1)}}
        </template>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[audit:get]')">
                <icon-font class="icon" type="icon-file" />
                <span class="hidden-xs">详情</span>
              </a-button>
            </a-space>
          </div>
        </template>

      </a-table>

      <div class="margin-md-top text-right" >

        <a-space :size="10">
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

  <a-modal v-model:visible="searchDialogVisible" width="400px" title="查询操作审计" @ok="search(null)" layout="vertical">
    <a-form ref="search-form" :rules="rules" :model="form" layout="vertical">

      <a-row>

        <a-col :span="24">
          <a-form-item label="操作人:" name="principal">
            <a-input v-model:value="form.principal" />
          </a-form-item>
        </a-col>

      </a-row>

      <a-row>

        <a-col :span="24">
          <a-form-item label="操作模块:" name="type">
            <a-input v-model:value="form.type" />
          </a-form-item>
        </a-col>

      </a-row>

      <a-row>
        <a-col :span="24">
          <a-form-item label="操作时间:" name="after">
            <a-date-picker class="width-100-percent" show-time v-model:value="form.after" />
          </a-form-item>
        </a-col>
      </a-row>

    </a-form>
  </a-modal>

</template>

<script>

export default {
  name:"AuthenticationAuditIndex",
  data() {
    return {
      columns:[
        {
          title: "操作时间",
          dataIndex: "timestamp",
          ellipsis: true,
          width: 200,
          slots: { customRender: "timestamp" }
        },
        {
          title: "操作人",
          dataIndex: "principal",
          ellipsis: true,
          width: 200
        },
        {
          title: "操作模块",
          dataIndex: "type",
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" },
        }
      ],
      rules:{
        after: [{ required: true, message: "请选择操作时间", trigger: 'change', type: 'object' }]
      },
      form:{
        principal:"",
        type:"",
        after:""
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      spinning: false,
      searchDialogVisible: false
    }
  },
  methods:{
    detail(record) {

      let to = {
        name: "authentication_audit_detail"
      }

      if (record !== undefined) {
        to["query"] = { id:record.id, after:record.timestamp.toString().replace(".","") };
      }

      this.$router.push(to);

    },
    search(number) {
      let _this = this;

      _this.$refs['search-form'].validate().then(() => {

        this.spinning = true;

        _this.searchDialogVisible = false;

        let param = _this.form;

        param.size = _this.page.size || 10;
        param.number = number || _this.page.number;

        _this
            .$http
            .post("/authentication/audit", _this.formUrlencoded(param))
            .then(r => {
              _this.page = r.data.data;
              _this.spinning = false;
            })
            .catch(() => _this.spinning = false);
      });

    }
  }
}

</script>