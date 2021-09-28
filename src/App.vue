<template>
  <a-config-provider :locale="this.$store.state.locale.app">
    <router-view v-slot="{ Component }">
        <component :is="Component" />
    </router-view>
  </a-config-provider>
</template>

<script>

export default {
  name:"App"
}
</script>
