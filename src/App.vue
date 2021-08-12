<template>
  <a-config-provider :locale="this.$store.state.locale.app">
    <router-view/>
  </a-config-provider>
</template>

<script>

export default {
  name:"App"
}
</script>
