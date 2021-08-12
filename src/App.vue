<template>
  <a-config-provider :locale="this.$store.state.locale.app">
    <router-view/>
  </a-config-provider>
</template>

<script>

import {setRouter} from '@/router'

export default {
  name:"App",
  mounted() {
    let menus = JSON.parse(sessionStorage.getItem(process.env.VUE_APP_SESSION_STORAGE_MENUS_NAME));

    if (menus) {
      setRouter(menus);
    }
  }
}
</script>
