<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'config_dictionary'}"> <icon-font class="icon" type="icon-dictionary" /> 数据字典管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'config_dictionary_type_edit', query:{id:typeEntity.id}}"><icon-font class="icon" type="icon-dictionary" /> {{ '编辑 [' + typeEntity.name + '] ' + '字典类型' }}</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '数据字典' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '数据字典'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-edit" />
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row>
          <a-col :span="24">
            <a-form-item has-feedback label="代码:" name="code">
              <a-input ref="code" :addon-before="parentCode" :disabled="form.id !== null" v-model:value="form.code"></a-input>
            </a-form-item>
          </a-col>
        </a-row>


        <a-row :gutter="[24]">

          <a-col :span="12">
            <a-form-item has-feedback label="名称:" name="name">
              <a-input v-model:value="form.name" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="等级:" name="level">
              <a-input v-model:value="form.level" />
            </a-form-item>
          </a-col>

        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="状态:" name="enabled">
              <a-select class="width-100-percent" v-model:value="form.enabled">
                <a-select-option v-for="(value, name) of statusOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item show-search label="上级:" name="parentId">
              <a-select class="width-100-percent" v-model:value="form.parentId">
                <a-select-option v-for="p of parentOptions" :key="p.name" :value="p.id + ''" @change="parentChange" optionFilterProp="key">
                  {{p.name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item has-feedback label="值:" name="value">
              <a-textarea v-model:value="form.value" :auto-size="{ minRows: 5, maxRows: 5 }"/>
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

      <a-divider></a-divider>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[data_dictionary:save]')">
          <icon-font class="icon" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="this.refs['edit-form'].resetFields();">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"ConfigDataDictionaryEdit",
  data() {
    return {
      spinning:true,
      parentOptions:[],
      statusOptions:[],
      parentCode:"",
      typeEntity: {
        code:""
      },
      form: {
        id: null,
        code: "",
        name: "",
        enabled:"1",
        value: "",
        typeId: "",
        level: "",
        remark: "",
        parentId: ""
      },
      rules: {
        code: [
          { required: true, message: "请输入代码", trigger: "change" },
          { validator:this.validateRemoteCode, trigger: "change"}
        ],
        value: [{ required: true, message: "请输入值", trigger: "blur" }],
        name: [{ required: true, message: "请输入名称", trigger: "change" }]
      }
    }
  },
  methods: {
    validateRemoteCode() {
      return new Promise((resolve, reject) => {
        this.$http.get("/config/dictionary/isDataDictionaryCodeUnique?code=" + this.parentCode + this.form.code).then(r => {
          return r.data.data ? resolve() : reject("类型代码已存在");
        });
      });
    },
    parentChange(v) {

      let code = "";

      if (v !== "") {
        let parent = this.parentOptions.find(o => o.id === v * 1);
        code = this.typeEntity.code + "." + parent.code + ".";
      } else {
        code = this.typeEntity.code + ".";
      }

      this.parentCode = code;

    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this
            .$http
            .post("/config/dictionary/saveDataDictionary",_this.formUrlencoded(_this.form))
            .then((r) => {
              let id = r.data.data;

              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"config_data_dictionary_edit", query:{id:id,typeId:_this.typeEntity}, replace:true});
                _this.form.id = r.data.data;
              }

              _this.spinning = false;

            })
            .catch(() => _this.spinning = false);

      });
    }
  },
  watch: {
    parentCode() {
      this.form.code = this.form.code.replace(this.parentCode, "");
    }
  },
  created() {

    let _this = this;

    this.form.typeId = this.$route.query.typeId;

    let findParentParam = {
      "mergeTree":false,
      "filter_[type_id_eq]":this.form.typeId
    };

    _this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r => _this.statusOptions = r.data.data);

    if (this.$route.query.id !== undefined) {
      findParentParam["filter_[id_ne]"] = this.$route.query.id;
    } else {
      this.spinning = false
    }

    _this
        .$http
        .get("/config/dictionary/getDictionaryType?id=" + this.form.typeId)
        .then(r => {

          _this.typeEntity = r.data.data;
          _this.parentCode = _this.typeEntity.code + ".";

          _this
              .$http
              .post("/config/dictionary/findDataDictionary",_this.formUrlencoded(findParentParam))
              .then(r => {

                _this.parentOptions = r.data.data;

                if (this.$route.query.id !== undefined) {

                  this
                      .$http
                      .get("/config/dictionary/getDataDictionary?id=" + this.$route.query.id)
                      .then(r => {

                        _this.form = r.data.data;
                        _this.form.parentId = _this.form.parentId ? _this.form.parentId + "" : "";
                        _this.form.enabled = _this.form.enabled ? _this.form.enabled + "" : "";

                        _this.spinning = false;

                        _this.parentChange(_this.form.parentId);

                      })
                      .catch(() => _this.spinning = false);

                }

              });
        });
  }
}
</script>