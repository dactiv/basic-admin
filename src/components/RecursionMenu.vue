<template>
  <template v-for="(d,idx) of data" :key="d.id">
    <a-menu-item :key="getPath(d.value)" v-if="!hasChildren(d)">
      <router-link :to='getPath(d.value)'>
        <icon-font :type="d.icon" v-if="d.icon !== null" />
        <span>{{d.name}}</span>
      </router-link>
    </a-menu-item>
    <a-sub-menu v-else :key="parent === undefined ? idx + '' : parent + '-' + idx">
      <template #title>
        <icon-font :type="d.icon" v-if="d.icon !== null" />
        <span>{{ d.name }}</span>
      </template>
      <!-- 调用自身递归数据 -->
      <recursion-menu :data="d.children" :parent="idx" />
    </a-sub-menu>
  </template>
</template>

<script>

/**
 * 递归菜单，
 */
export default {
  name: "RecursionMenu",
  props: ["data","parent"],
  methods: {
    /**
     * 判断是否存在子节点
     *
     * @param d 当前后台菜单数据
     *
     * @returns {boolean} true 是，否则 false
     */
    hasChildren:function(d) {
      return d.children !== undefined && d.children.length > 0;
    },
    /**
     * 替换后台菜单 value 值
     *
     * @param v 值
     *
     * @returns {*} 替换后的值
     */
    replaceValue:function(v) {
      return v.replace("/**","");
    },
    /**
     * 获取路由路径
     *
     * @param v 值
     *
     * @returns {string} 路由路径值
     */
    getPath:function(v) {
      return "/index/" + this.replaceValue(v);
    }
  }
}
</script>