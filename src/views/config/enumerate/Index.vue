<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 系统枚举查询</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="系统枚举查询" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font class="icon" type="icon-enum-major-o" />
    </template>

    <a-space :size="10">
      <a-button :loading="sync" @click="syncEnumerate" v-if="this.principal.hasPermission('perms[enumerate:sync]')">
        <icon-font class="icon" v-if="!sync" type="icon-history"/>
        <span class="hidden-xs">同步枚举</span>
      </a-button>
    </a-space>

    <a-spin :spinning="spinning">

      <a-tabs>

        <a-tab-pane class="width-100-percent" v-for="(value, key) of enumData" :key="key" :tab="key + ' 服务'">
          <a-collapse>
            <a-collapse-panel v-for="(enumValue, name) of value" :key="name" :header="'枚举名: ' + name">
              <a-descriptions bordered :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }">

                <a-descriptions-item v-for="(targetValue, targetKey) of enumValue" :key="targetKey" :label="targetKey">{{ targetValue }}</a-descriptions-item>

              </a-descriptions>
            </a-collapse-panel>
          </a-collapse>
        </a-tab-pane>

      </a-tabs>

    </a-spin>

  </a-card>

</template>

<script>

export default {
  name:"EnumerateIndex",
  data() {
    return {
      sync:false,
      spinning:false,
      enumData:{}
    }
  },
  methods:{
    syncEnumerate() {
      let _this = this;
      _this.sync = true;

      _this
          .$http
          .post("/config/syncEnumerate")
          .then(r => {
            _this.sync = false;
            _this.$message.success(r.data.message);
          })
          .catch(() => _this.spinning = false);

    }
  },
  created() {
    let _this = this;

    _this.spinning = true;

    _this
        .$http
        .get("/config/enumerate")
        .then(r => {
          _this.enumData = r.data.data;
          _this.spinning = false;
        })
        .catch(() => _this.spinning = false);
  }
}

</script>