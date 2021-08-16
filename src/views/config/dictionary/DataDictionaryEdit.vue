<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home"></icon-font> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-un-config-o"></icon-font> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'dictionary'}"> <icon-font type="icon-dictionary"></icon-font> 数据字典管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-edit"></icon-font> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '数据字典' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '数据字典'" class="basic-box-shadow">

    <template #extra>
      <icon-font type="icon-edit"></icon-font>
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="名称:" name="name">
              <a-input v-model:value="form.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="代码:" name="code">
              <a-input v-model:value="form.code" :disabled="form.id !== null"></a-input>
            </a-form-item>
          </a-col>
        </a-row>


        <a-row :gutter="[24]">

          <a-col :span="12">
            <a-form-item label="值:" name="value">
              <a-input v-model:value="form.value"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="等级:" name="level">
              <a-input v-model:value="form.level"></a-input>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="状态:" name="status">
              <a-select class="width-100-percent" v-model:value="form.status">
                <a-select-option v-for="(value, name) in statusOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
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
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[data_dictionary:save]')">
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
  name:"DataDictionaryEdit",
  data() {
    return {
      spinning:true,
      parentOptions:[],
      statusOptions:[],
      form: {
        id: null,
        code: "",
        name: "",
        value: "",
        typeId: "",
        level: "",
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

    this.form.typeId = this.$route.query.typeId;

    _this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r => _this.statusOptions = r.data.data);

    _this
        .$http
        .post("/config/dictionary/findDataDictionary",_this.formUrlencoded({"mergeTree": false, "filter_[type_id_eq]": this.form.typeId}))
        .then(r => _this.parentOptions = r.data.data);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/config/dictionary/getDataDictionary?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;
            _this.spinning = false;
          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>