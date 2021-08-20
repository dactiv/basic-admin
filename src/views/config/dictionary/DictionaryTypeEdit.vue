<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon"  type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon"  type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'dictionary'}"> <icon-font class="icon"  type="icon-dictionary" /> 数据字典管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon"  type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '字典类型' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '字典类型'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon"  type="icon-edit" />
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="代码:" name="code">
              <a-input ref="code" :addon-before="parentCode" v-model:value="form.code" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item has-feedback label="名称:" name="name">
              <a-input v-model:value="form.name" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="上级:" name="parentId">
              <a-select show-search class="width-100-percent" v-model:value="form.parentId" @change="parentChange" optionFilterProp="key">
                <a-select-option key="" value="">无</a-select-option>
                <a-select-option v-for="p of parentOptions" :key="p.name" :value="p.id + ''">
                  {{p.name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="form.remark" :auto-size="{ minRows: 2, maxRows: 5 }"/>
            </a-form-item>
          </a-col>
        </a-row>

        <a-card title="数据字典内容" v-if="this.form.id !== null">

          <template #extra>
            <icon-font class="icon"  type="icon-database" />
          </template>

          <a-input v-model:value="dataDictionary.form['filter_[code_like]']" placeholder="请输入名称进行查询" class="margin-bottom-20">
            <template #addonAfter>
              <a-button type="text" @click="searchDataDictionary()">
                <icon-font class="icon"  type="icon-search" />
                <span class="hidden-xs">搜索</span>
              </a-button>
            </template>
            <template #addonBefore>
              <a-button type="text" @click="editDataDictionary()" v-if="this.principal.hasPermission('perms[dictionary_type:save]')">
                <icon-font class="icon"  type="icon-add"/>
                <span class="hidden-xs">添加</span>
              </a-button>
              <a-button type="text" danger @click="removeDataDictionary(null)" v-if="this.principal.hasPermission('perms[dictionary_type:delete]')">
                <icon-font class="icon"  type="icon-ashbin" />
                <span class="hidden-xs">删除选中</span>
              </a-button>
            </template>
          </a-input>

          <a-spin :spinning="dataDictionary.spinning">
            <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: dataDictionary.selectedIds, onChange: selectDataDictionaryChange}" :rowKey="record=>record.id" :scroll="{ x: 775 }" :pagination="false" :data-source="dataDictionary.page.content" :columns="dataDictionary.columns" bordered>
              <template #action="{ record }">
                <div class="text-center">
                  <a-space :size="10">
                    <a-button size="small" @click="editDataDictionary(record)" v-if="this.principal.hasPermission('perms[data_dictionary:get]')">
                      <icon-font class="icon"  type="icon-edit" />
                      <span class="hidden-xs">编辑</span>
                    </a-button>
                    <a-button size="small" type="primary" danger @click="removeDataDictionary(record)" v-if="this.principal.hasPermission('perms[data_dictionary:delete]')">
                      <icon-font class="icon"  type="icon-ashbin" />
                      <span class="hidden-xs">删除</span>
                    </a-button>
                  </a-space>
                </div>
              </template>
            </a-table>

            <div class="margin-top-15 text-right" >

              <a-space :size="10">
                <span class="hidden-xs">每页</span>
                <a-input v-model:value="dataDictionary.page.size" size="small" @pressEnter="searchDataDictionary" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
                <span class="hidden-xs">条 / 第 1 页</span>
                <a-button size="small" @click="searchDataDictionary(dataDictionary.page.number - 1)" :disabled="dataDictionary.page.first"><icon-font class="icon"  type="icon-arrow-left-bold" /></a-button>
                {{dataDictionary.page.number}}
                <a-button size="small" @click="searchDataDictionary(dataDictionary.page.number + 1)" :disabled="dataDictionary.page.last"><icon-font class="icon"  type="icon-arrow-right-bold" /></a-button>

              </a-space>

            </div>

          </a-spin>

        </a-card>

      </a-form>

      <a-divider></a-divider>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[dictionary_type:save]')">
          <icon-font class="icon"  type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font class="icon"  type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"DictionaryTypeEdit",
  data() {
    return {
      dataDictionary: {
        spinning:false,
        selectedIds:[],
        columns:[{
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
          title: "值",
          dataIndex: "value",
          ellipsis: true,
          width: 150
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          slots: { customRender: "action" },
        }],
        page: {
          content:[],
          first:false,
          last:false,
          number:1
        },
        form:{
          typeId:0
        }
      },
      parentCode:"",
      spinning:true,
      parentOptions:[],
      form: {
        id: null,
        code: "",
        name: "",
        remark: "",
        parentId: ""
      },
      rules: {
        code: [
          { required: true, message: "请输入代码", trigger: "blur" },
          { validator:this.validateRemoteCode, trigger: "change"}
        ],
        name: [{ required: true, message: "请输入名称", trigger: "blur" }]
      }
    }
  },
  watch: {
    parentCode() {
      this.form.code = this.form.code.replace(this.parentCode, "");
    }
  },
  methods: {
    validateRemoteCode() {
      if (this.form.code === this.$refs.code.defaultValue) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        this.$http.get("/config/dictionary/isDictionaryTypeCodeUnique?code=" + this.parentCode + this.form.code).then(r => {
          return r.data.data ? resolve() : reject("类型代码已存在");
        });
      });
    },
    parentChange(v) {

      let code = "";

      if (v !== "") {
        let parent = this.parentOptions.find(o => o.id === v * 1);
        code = parent.code + ".";
      }

      this.parentCode = code;

    },
    searchDataDictionary(number) {

      let _this = this;

      _this.dataDictionary.spinning = true;

      let param = _this.dataDictionary.form;

      param.size = this.dataDictionary.page.size || 10;
      param.number = number || this.dataDictionary.page.number;

      if (_this.form.id) {
        param["filter_[type_id_eq]"] = _this.form.id;
      }

      _this
          .$http
          .post("/config/dictionary/getDataDictionaryPage",_this.formUrlencoded(param))
          .then(r => {
            _this.dataDictionary.page = r.data.data;
            _this.dataDictionary.spinning = false;
          })
          .catch(() => _this.spinning = false);
    },
    editDataDictionary(record) {
      let to = {
        name: "data_dictionary_edit"
      }

      let query = {};

      if (this.form.id) {
        query["typeId"] = this.form.id;
      }

      if (record !== undefined) {
        query["id"] = record.id;
      }

      to["query"] = query;

      this.$router.push(to);
    },
    removeDataDictionary(record) {
      let ids = [];

      let confirmMessage;

      if (record) {
        ids.push(record.id);
        confirmMessage = "确定要删除 [" + record.name + "] 数据字典吗?"
      } else {
        ids = this.selectedIds;
        confirmMessage = "确定要删除" + ids.length + "条记录吗?"
      }

      let _this = this;

      this.confirm(confirmMessage, () => {
        _this.dataDictionary.spinning = true;
        _this
            .$http
            .post("/config/dictionary/deleteDataDictionary",_this.formUrlencoded({ids:ids})).then((r) => {
              _this.$message.success(r.data.message);
              _this.dataDictionary.selectedIds = [];
              _this.searchDataDictionary();
            })
            .catch(() => _this.dataDictionary.spinning = false);
      });
    },
    selectDataDictionaryChange(values) {
      this.selectedIds = values;
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this
            .$http
            .post("/config/dictionary/saveDictionaryType",_this.formUrlencoded(_this.form))
            .then((r) => {

              let id = r.data.data;

              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"dictionary_type_edit", query:{id}, replace:true});
                _this.form.id = r.data.data;
              }

              _this.spinning = false;

            })
            .catch(() => _this.spinning = false);

      });
    }
  },
  created() {

    let _this = this;

    _this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r=> _this.statusOptions = r.data.data);

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {

      findParentParam["filter_[id_ne]"] = this.$route.query.id;

    } else {
      this.spinning = false
    }

    _this
        .$http
        .post("/config/dictionary/findDictionaryType",_this.formUrlencoded(findParentParam))
        .then(r => {

          _this.parentOptions = r.data.data;

          if (this.$route.query.id !== undefined) {
            _this
                .$http
                .get("/config/dictionary/getDictionaryType?id=" + this.$route.query.id)
                .then(r => {

                  _this.form = r.data.data;
                  _this.form.parentId = _this.form.parentId ? _this.form.parentId + "" : "";

                  _this.parentChange(_this.form.parentId);

                  _this.spinning = false;

                  _this.searchDataDictionary(null);
                })
                .catch(() => _this.spinning = false);
          }

        });
  }
}
</script>