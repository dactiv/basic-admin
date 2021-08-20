<template>
  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-send" /> 发送邮件</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="发送邮件" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-email" />
    </template>

    <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="发送给:" name="toEmail">
            <a-row type="flex">
              <a-col flex="auto" class="margin-right-10">
                <a-select class="width-100-percent" mode="multiple" v-model:value="form.toEmail" :filter-option="false" :not-found-content="searching ? undefined : null" :options="data" @search="searchUser">
                </a-select>
              </a-col>
              <a-col>
                <a-space :size="10">
                  <a-button>
                    <icon-font class="icon" type="icon-all" />
                    <span class="hidden-xs">全网邮件</span>
                  </a-button>
                  <a-button>
                    <icon-font class="icon" type="icon-filter"/>
                    <span class="hidden-xs">条件搜索邮件</span>
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row >
        <a-col :span="24">
          <a-form-item has-feedback label="标题:" name="title">
            <a-input v-model:value="form.title" :default-value="form.title" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider></a-divider>

      <a-space :size="10">
        <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[email:save]')">
          <icon-font class="icon" type="icon-select" />
          <span class="hidden-xs">保存</span>
        </a-button>
        <a-button @click="addAttachment">
          <icon-font class="icon" type="icon-attachment" />
          <span class="hidden-xs">添加附件</span>
        </a-button>
      </a-space>

    </a-form>

  </a-card>

</template>


<script>
export default {
  methods:{
    searchUser(value) {
      console.log(value);
    },
    submitForm() {

    },
    addAttachment() {

    }
  },
  data() {
    return {
      data:[],
      searching:false,
      form: {
        toEmail:[]
      },
      rules: {

      }
    }
  }
}
</script>