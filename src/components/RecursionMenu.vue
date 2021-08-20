<template>
  <template v-for="d of data" :key="d.id">
    <a-menu-item :key="getPath(d)" v-if="!hasChildren(d)">
      <router-link :to='getPath(d)'>
        <icon-font class="icon" :type="d.icon" v-if="d.icon ? d.icon : 'icon-file'" />
        <span>{{d.name}}</span>
      </router-link>
    </a-menu-item>
    <a-sub-menu v-else :key="d.code">
      <template #title>
        <icon-font class="icon" :type="d.icon" v-if="d.icon ? d.icon : 'icon-file'" />
        <span>{{ d.name }}</span>
      </template>
      <!-- 调用自身递归数据 -->
      <recursion-menu :data="d.children" />
    </a-sub-menu>
  </template>
</template>

<script>

/**
 * 递归菜单，
 */
export default {
  name: "RecursionMenu",
  props: ["data"],
  methods: {
    /**
     * 判断是否存在子节点
     *
     * @param d 当前后台菜单数据
     *
     * @returns {boolean} true 是，否则 false
     */
    hasChildren(d) {
      return d.children !== undefined && d.children.length > 0;
    },
    /**
     * 替换后台菜单 value 值
     *
     * @param d 记录
     *
     * @returns {*} 替换后的值
     */
    replaceValue(d) {
      return d.applicationName + "/" + d.value.replace("/**","");
    },
    /**
     * 获取路由路径
     *
     * @param v 值
     *
     * @returns {string} 路由路径值
     */
    getPath(v) {
      return process.env.VUE_APP_SITE_ROOT + "/" + this.replaceValue(v);
    }
  }
}
</script>