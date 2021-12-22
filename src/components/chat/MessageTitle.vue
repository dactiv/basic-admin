<template>
  <a-row>
    <a-col :span="20">
      <a-space v-if="data.id > 0" :size="10" class="padding-left">
        <a-avatar :src="data.type === 10 ? getPrincipalAvatarByUserId(data.id) : null" :shape="data.type === 10 ? 'circle' : 'square'" >
          {{ data.title.substring(0,1) }}
        </a-avatar>
        <a-typography-text strong>{{ data.title }}</a-typography-text>
      </a-space>
    </a-col>
    <a-col :span="4" class="text-right">
      <a-button type="text" @click="onToolbarClick">
        <icon-font class="icon" :type="data.type === 10 ? 'icon-user-groups' : 'icon-image-text'" />
      </a-button>
    </a-col>
  </a-row>
</template>

<script>

export default {
  name:"ChatMessageTitle",
  props:["data"],
  emits: ["toolbarClick"],
  data() {
    return {

    }
  },
  methods:{
    onToolbarClick() {
      this.$emit('toolbarClick', this.contact);
    }
  }
}

</script>