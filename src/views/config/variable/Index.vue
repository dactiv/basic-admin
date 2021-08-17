<template>

  <a-breadcrumb class="hidden-xs">
    <a-breadcrumb-item><router-link to='/'><icon-font type="icon-home" /> 首页</router-link></a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
    <a-breadcrumb-item><icon-font type="icon-variable" /> 环境变量查询</a-breadcrumb-item>
  </a-breadcrumb>

  <a-card title="环境变量查询" class="basic-box-shadow margin-top-20">

    <template #extra>
      <icon-font type="icon-variable" />
    </template>

    <a-spin :spinning="spinning">

      <a-tabs>

        <a-tab-pane v-for="(value, key) of variableData" :key="key" :tab="key">

          <a-collapse>

            <a-collapse-panel v-for="source of value.propertySources" :key="source.name" :header="source.name">

              <a-descriptions v-if="source.properties" bordered :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }">

                <a-descriptions-item v-for="(propertyValue, propertyKey) of source.properties" :key="propertyKey" :label="propertyKey">{{ propertyValue.value }}</a-descriptions-item>

              </a-descriptions>

              <a-empty v-else />

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
      spinning:false,
      variableData:{}
    }
  },
  created() {

    let _this = this;

    _this.spinning = true;

    _this
        .$http
        .get("/config/getAllServiceVariable")
        .then(r => {
          _this.variableData = r.data.data;
          _this.spinning = false;
        })
        .catch(() => _this.spinning = false);
  }
}

</script>