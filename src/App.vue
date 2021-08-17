<template>
  <a-config-provider :locale="this.$store.state.locale.app">
    <transition name="slide-left">
      <router-view/>
    </transition>
  </a-config-provider>
</template>

<script>

export default {
  name:"App"
}
</script>
