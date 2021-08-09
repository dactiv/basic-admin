<template>

  <a-breadcrumb>
    <a-breadcrumb-item><router-link to='/'>首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>系统管理</a-breadcrumb-item>
    <a-breadcrumb-item><router-link to='/index/console/user'>系统用户管理</router-link></a-breadcrumb-item>
    <a-breadcrumb-item>编辑系统用户</a-breadcrumb-item>
  </a-breadcrumb>

<!--  <el-card>
    <template #header>
      <span>编辑后台用户</span>
    </template>

    <el-form ref="search-form" :model="form" label-position="top" v-loading="formLoading">

      <el-row>
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="登陆账户:">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="真是姓名:">
            <el-input v-model="form.realName"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="query.id === undefined">
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="登陆密码:">
            <el-input v-model="form.password"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="确认密码:">
            <el-input v-model="form.confirmPassword"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="电子邮箱:">
            <el-input v-model="form.email"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" class="padding-left-10 padding-right-10">
          <el-form-item label="状态:" prop="status">
            <el-select style="width: 100%" v-model="form.status" placeholder="请选择">
              <el-option v-for="(value, name) in statusOptions" :key="value" :label="name" :value="value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

      </el-row>

      <el-row>
        <el-col :span="24" class="padding-left-10 padding-right-10">

          <el-tabs>
            <el-tab-pane label="所在用户组">

              <el-input class="margin-bottom-15" prefix-icon="el-icon-search" placeholder="请输入要查询的内容">

                <template #prepend>
                    <el-button size="medium" icon="el-icon-edit">添加</el-button>
                    <el-button size="medium" icon="el-icon-delete" type="danger">删除</el-button>
                </template>

              </el-input>

              <GroupTable :userId="this.$route.query.id" />

            </el-tab-pane>
            <el-tab-pane label="独立权限">

              <el-input class="margin-bottom-15" prefix-icon="el-icon-search" placeholder="请输入要查询的内容"></el-input>

              <ResourceTable :userId="this.$route.query.id" />

            </el-tab-pane>
          </el-tabs>

        </el-col>
      </el-row>

      <el-row>

        <el-col :span="24" class="padding-left-10 padding-right-10">
          <el-divider/>
        </el-col>

      </el-row>

    </el-form>

    <el-button-group>
      <el-button icon="el-icon-check" type="success">保存</el-button>
      <el-button icon="el-icon-delete" type="warning">重置</el-button>
    </el-button-group>

  </el-card>-->

</template>

<script>

export default {
  name:"ConsoleUserEdit",
  data() {
    return {
      formLoading:true,
      statusOptions:[],
      query:null,
      form: {
        username: "",
        realName: "",
        password: "",
        confirmPassword:"",
        email: "",
        status:""
      }
    }
  },
  created() {
    this.loadConfig({service:"config", enumerateName:"UserStatus"}, r=> this.statusOptions = r);
    this.query = this.$route.query;

    if (this.query.id !== undefined) {

      this
          .$http
          .get("/authentication/console/user/get?id=" + this.query.id)
          .then(r => {
            this.form = r;
            this.formLoading = false
          });

    } else {
      this.formLoading = false
    }
  }
}
</script>