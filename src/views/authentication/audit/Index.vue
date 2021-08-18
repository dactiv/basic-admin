<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home"></icon-font> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-setting" /> 系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-audit" /> 操作审计</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="系统用户管理" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font type="icon-audit" />
    </template>

    <a-spin :spinning="spinning" tip="数据加载中...">

      <a-space :size="10" class="margin-bottom-20">
        <a-button @click="this.searchDialogVisible=true;">
          <icon-font type="icon-search" />
          <span class="hidden-xs">搜索</span>
        </a-button>
      </a-space>

      <a-table class="ant-table-striped" :rowKey="record=>record.id" :scroll="{ x: 775 }" :pagination="false" :data-source="page.content" :columns="columns" bordered>

        <template #action="{ record }">
          <div class="text-center">
            <a-space :size="10">
              <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[audit:get]')">
                <icon-font type="icon-file" />
                <span class="hidden-xs">详情</span>
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
          <a-button size="small" @click="search(page.number - 1)" :disabled="page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          {{page.number}}
          <a-button size="small" @click="search(page.number + 1)" :disabled="page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

        </a-space>

      </div>

    </a-spin>
  </a-card>

  <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询操作审计" @ok="search" layout="vertical">
    <a-form ref="search-form" :model="form" layout="vertical">

      <a-row :gutter="[24]">
        <a-col :span="12">
          <a-form-item label="操作人:">
            <a-input v-model:value="form.principal" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="操作模块:">
            <a-input v-model:value="form.type" />
          </a-form-item>
        </a-col>
      </a-row>

<!--      <a-row>
        <a-col :span="24">
          <a-form-item label="操作时间:">
            <a-picker show-time class="width-100-percent" v-model:value="form.after">
              <template #suffixIcon>
                <icon-font type="icon-calendar" />
              </template>
            </a-picker>
          </a-form-item>
        </a-col>
      </a-row>-->

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
          title: "操作时间",
          dataIndex: "timestamp",
          ellipsis: true,
          width: 200
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
      form:{
        principal:"",
        type:"",
        after:[]
      },
      page: {
        content:[],
        first:false,
        last:false,
        number:1
      },
      spinning: false,
      searchDialogVisible: false
    }
  },
  methods:{
    detail(record) {

      let to = {
        name: "audit_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    search() {
      let _this = this;

      this.spinning = true;

      _this.searchDialogVisible = false;

      let param = _this.form;

      param.size = _this.page.size || 10;
      param.number = _this.page.number || 1;

      _this
          .$http
          .post("/authentication/audit",_this.formUrlencoded(param))
          .then(r => {
            _this.page = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);
    }
  }
}

</script>