<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'authentication_department'}"><icon-font class="icon" type="icon-group" /> 部门管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '部门' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '部门'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-edit"/>
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="组名称:" name="name">
              <a-input ref="name" v-model:value="form.name" :disabled="form.id !== null" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上级部门:" name="parentId">
              <a-select class="width-100-percent" v-model:value="form.parentId">
                <a-select-option value="">
                  无
                </a-select-option>
                <a-select-option v-for="p of parentOptions" :key="p.id" :value="p.id">
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

      <a-divider />

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="principal.hasPermission('perms[department:save]')" :loading="spinning" >
          <icon-font class="icon" v-if="!spinning" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="$refs['edit-form'].resetFields();">
          <icon-font class="icon" type="icon-ashbin" />
          <span class="hidden-xs">重置</span>
        </a-button>
      </a-space>

    </a-spin>

  </a-card>

</template>

<script>


export default {
  name:"AuthenticationDepartmentEdit",
  data() {
    return {
      spinning:true,
      parentOptions:[],
      form: {
        id:null,
        name: "",
        parentId:"",
        remark: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入部门名称", trigger: "change" },
          { validator:this.validateRemoteName, trigger: "change" }
        ]
      }
    }
  },
  methods: {

    validateRemoteName() {
      if (this.$refs["name"].disabled) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/authentication/group/isNameUnique?name=" + this.form.name).then(r => {
          return r.data.data ? resolve() : reject("部门名称已存在");
        });
      });
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this
            .$http
            .post("/authentication/department/save", _this.form)
            .then((r) => {
              let id = r.data.data;
              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"authentication_department_edit", query:{id}, replace:true});
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

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {
      _this
          .$http
          .get("/authentication/department/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;
            _this.spinning = false;

          })
          .catch(() => _this.spinning = false);

      findParentParam["filter_[id_ne]"] = this.$route.query.id;
    } else {
      this.spinning = false
    }

    _this
        .$http
        .post("/authentication/department/find",_this.formUrlencoded(findParentParam))
        .then(r => _this.parentOptions = r.data.data);
  }
}
</script>