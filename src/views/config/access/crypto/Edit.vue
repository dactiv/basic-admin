<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link :to="{name:'config_access_crypto'}"> <icon-font class="icon" type="icon-crypto-currency-bitcoin-imac"/> 访问加解密管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '访问加解密' }}</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '访问加解密'" class="basic-box-shadow">

    <template #extra>
      <icon-font class="icon" type="icon-edit" />
    </template>

    <a-spin :spinning="spinning">
      <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item has-feedback label="名称:" name="name">
              <a-input v-model:value="form.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item has-feedback label="拦截值:" name="value">
              <a-input v-model:value="form.name" />
            </a-form-item>
          </a-col>
        </a-row>


        <a-row :gutter="[24]">

          <a-col :span="12">
            <a-form-item has-feedback label="类型:" name="type">
              <a-input v-model:value="form.type" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="状态:" name="enabled">
              <a-select class="width-100-percent" v-model:value="form.enabled">
                <a-select-option v-for="(value, name) of statusOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="是否请求解密:" name="requestDecrypt">
              <a-select class="width-100-percent" v-model:value="form.requestDecrypt">
                <a-select-option v-for="(value, name) of yesOrNoOptions" :key="value + ''" :value="value + ''">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item show-search label="是否响应解密:" name="responseEncrypt">
              <a-select class="width-100-percent" v-model:value="form.responseEncrypt">
                <a-select-option v-for="(value, name) of yesOrNoOptions" :key="value + ''" :value="value + ''">
                  {{name}}
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

        <a-space :size="10" class="margin-bottom-20">
          <a-button @click="editPredicate(null)" v-if="this.principal.hasPermission('perms[access_crypto:save]')">
            <icon-font class="icon" type="icon-add"/>
            <span class="hidden-xs">添加断言</span>
          </a-button>
          <a-button type="primary" danger @click="removePredicate(null)" v-if="this.principal.hasPermission('perms[access_crypto:delete]')">
            <icon-font class="icon" type="icon-ashbin" />
            <span class="hidden-xs">删除选中</span>
          </a-button>
        </a-space>

        <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: predicate.selectedIds, onChange: selectPredicateChange}" :rowKey="record=>record.id" :scroll="{ x: 835 }" :pagination="false" :data-source="form.predicates" :columns="predicate.columns" bordered>

          <template #title>断言规则</template>

          <template v-for="col of ['name', 'value', 'remark']" #[col]="{ text, record }" :key="col">
            <div>
              <a-form-item v-if="editableData[record.id]" has-feedback :name="record.id + '-' + col">
                <a-input v-model:value="editableData[record.id][col]"/>
              </a-form-item>
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>

          <template #action="{ record }">
            <div class="text-center">
              <a-space :size="10">

                <a-button size="small" @click="savePredicate(record)" v-if="this.principal.hasPermission('perms[access_crypto:save]') && editableData[record.id]">
                  <icon-font class="icon" type="icon-select" />
                  <span class="hidden-xs">确定</span>
                </a-button>

                <a-button size="small" v-if="editableData[record.id]" @click="cancelPredicate(record)">
                  <icon-font class="icon" type="icon-close" />
                  <span class="hidden-xs">取消</span>
                </a-button>

                <a-button size="small" @click="editPredicate(record)" v-if="this.principal.hasPermission('perms[access_crypto:get]') && !editableData[record.id]">
                  <icon-font class="icon" type="icon-edit" />
                  <span class="hidden-xs">编辑</span>
                </a-button>

                <a-button size="small" type="primary" danger @click="removePredicate(record)" v-if="this.principal.hasPermission('perms[access_crypto:delete]')">
                  <icon-font class="icon" type="icon-ashbin" />
                  <span class="hidden-xs">删除</span>
                </a-button>

              </a-space>
            </div>
          </template>
        </a-table>

      </a-form>

      <a-divider></a-divider>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[access_crypto:save]')">
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
  name:"ConfigCryptoEdit",
  data() {
    return {
      spinning:true,
      yesOrNoOptions:[],
      statusOptions:[],
      editableData:{},
      predicate: {
        columns:[
          {
            title: "名称",
            dataIndex: "name",
            ellipsis: true,
            width: 100,
            slots: { customRender: 'name' }
          },
          {
            title: "拦截值",
            dataIndex: "value",
            ellipsis: true,
            width: 300,
            slots: { customRender: 'value' }
          },
          {
            title: "备注",
            dataIndex: "remark",
            ellipsis: true,
            width: 260,
            slots: { customRender: 'remark' }
          },{
            title: "操作",
            fixed: "right",
            width: 175,
            slots: { customRender: "action" },
          }
        ],
        selectedIds:[]
      },
      form: {
        id: null,
        name: "",
        enabled:"1",
        value: "",
        requestDecrypt: "",
        responseEncrypt: "",
        predicates:[],
        remark: ""
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        value: [{ required: true, message: "请输入拦截值", trigger: "blur" }],
        type: [{ required: true, message: "请输入类型", trigger: "blur" }]
      }
    }
  },
  methods: {
    cancelPredicate(record) {
      delete this.editableData[record.id];
    },
    savePredicate(record) {
      let index = this.form.predicates.findIndex(p => p.id === record.id);

      this.form.predicates[index] = JSON.parse(JSON.stringify(this.editableData[record.id]));

      delete this.editableData[record.id];
    },
    removePredicate(record) {

      let ids = [];

      if (record) {
        ids.push(record.id);
      } else {
        this.predicate.selectedIds.forEach(o => ids.push(o));
      }

      this.form.predicates = this.form.predicates.filter(o => !ids.includes(o.id));

      ids.forEach(id => delete this.editableData[id]);
      // FIXME 动态验证有问题.
      /*this.editableData.forEach(o => {
        let newRule = ["name", "value"];

        for (let key in newRule) {
          if (this.rules[o.id + '-' + newRule[key]]) {
            delete this.rules[o.id + '-' + newRule[key]];
          }
        }
      });*/

    },
    editPredicate(record) {
      let id = "gen-" + this.$moment().unix();

      if (record) {
        id = record.id;
        this.editableData[id] = JSON.parse(JSON.stringify(record));
      } else {

        let add = {
          id:id,
          name:"",
          value:"",
          remark:"",
        };

        // 点太快不给添加
        if (this.form.predicates.filter(o => o.id === id).length > 0) {
          return ;
        }

        this.form.predicates.push(add);

        this.editableData[id] = add;
      }

      // FIXME 动态验证有问题.
      /*let newRule = ["name", "value"];

      for (let key in newRule) {
        this.rules[id + '-' + newRule[key]] = [{ required: true, message: "该值不能为空", trigger: "blur" }];
      }*/

    },
    selectPredicateChange(values) {
      this.predicate.selectedIds = values;
    },
    submitForm() {

      let _this = this;

      _this.$refs['edit-form'].validate().then(() => {

        _this.spinning = true;

        _this.form.predicates.forEach(o => delete o.id);

        _this
            .$http
            .post("/config/access/crypto/save",_this.form)
            .then((r) => {
              let id = r.data.data;

              _this.$message.success(r.data.message);

              if (id !== _this.form.id) {
                _this.$router.push({name:"config_access_crypto_edit", query:{id}});
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

    _this.loadConfig({service:"config", enumerateName:"DisabledOrEnabled"}, r=> _this.statusOptions = r.data.data);
    _this.loadConfig({service:"config", enumerateName:"YesOrNo"}, r=> _this.yesOrNoOptions = r.data.data);

    if (this.$route.query.id !== undefined) {

      _this
          .$http
          .get("/config/access/crypto/get?id=" + this.$route.query.id)
          .then(r => {
            _this.form = r.data.data;

            _this.form.enabled = _this.form.enabled + '';
            _this.form.requestDecrypt = _this.form.requestDecrypt + '';
            _this.form.responseEncrypt = _this.form.responseEncrypt + '';

            _this.spinning = false;

          })
          .catch(() => _this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>