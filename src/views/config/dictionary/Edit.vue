<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home"></icon-font> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-un-config-o"></icon-font> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'dictionary'}"> <icon-font type="icon-dictionary"></icon-font> 数据字典管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-edit"></icon-font> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '字典类型' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '字典类型'" class="basic-box-shadow">

    <template #extra>
      <icon-font type="icon-edit"></icon-font>
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="代码:" name="username">
              <a-input v-model:value="form.code" :disabled="form.id !== null"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称:" name="realName">
              <a-input v-model:value="form.name"></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item label="上级:" name="parentId">
              <a-select class="width-100-percent" v-model:value="form.parentId">
                <a-select-option v-for="p in parentOptions" :key="p.id + ''" :value="p.id + ''">
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

      </a-form>

      <a-space :size="10" class="margin-top-20">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[dictionary_type:save]')">
          <icon-font type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"DictionaryEdit",
  data() {
    return {
      spinning:true,
      parentOptions:[],
      form: {
        id:null,
        code: "",
        name: "",
        remark: "",
        parentId: ""
      },
      rules: {

      }
    }
  },
  methods: {
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this
            .$http
            .post("/config/dictionary/save",_this.formUrlencoded(_this.form))
            .then(() => _this.$router.push({name: "dictionary"}))
            .catch(() => _this.spinning = false);

      });
    }
  },
  created() {

    let _this = this;

    _this
        .$http
        .post("/config/dictionary/findDictionaryType",_this.formUrlencoded({mergeTree:false}))
        .then(r => _this.parentOptions = r);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/config/dictionary/getDictionaryType?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>