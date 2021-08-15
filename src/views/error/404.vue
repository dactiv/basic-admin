<template>
  <div class="margin-top-20 margin-bottom-20 display-flex align-items-center justify-content-center">
    <a-image :src="require('@/assets/404.svg')" />
  </div>
  <h1 class="text-center margin-top-20 margin-bottom-20">找不到你想访问的页面.</h1>
  <div class="text-center">
    <a-button onclick="this.$router.back();">
      <icon-font type="icon-arrow-left-circle" />
      <span>返回</span>
    </a-button>
  </div>
</template>

<script>

export default {
  name: "403",
  methods:{
    logout:function () {

    }
  }
}

</script>