<template>
  <a-row class="height-100-percent">
    <a-col :span="5" class="tool-bar border-right">
      <div class="text-center margin-md-top">
        <a-avatar :src="principal.details.avatar">
          {{ getPrincipalName(principal.details).substring(0, 1) }}
        </a-avatar>
        <a-menu mode="vertical" class="margin-top" @select="toolbarSelect" :selectedKeys="selectedToolBar">
          <a-menu-item key="message">
            <a-badge :count="messageCount" :offset="[x=-20, y=0]">
              <icon-font class="icon" type="icon-message" />
            </a-badge>
          </a-menu-item>
          <a-menu-item key="group">
            <icon-font class="icon" type="icon-group" />
          </a-menu-item>
        </a-menu>
      </div>
    </a-col>
    <a-col :span="19" class="height-100-percent">
      <div class="search">
        <a-input placeholder="搜索" v-model:value="searchText" />
      </div>
      <div class="left-content">
        <a-menu v-show="tab === 'message'" @click="selectContact" :selectedKeys="selectedKeys" mode="vertical">
          <a-menu-item v-for="c of contactData" :key="c.type + '-' + c.id" >
            <a-dropdown :trigger="['contextmenu']">
              <a-row type="flex" justify="space-around" align="middle">
                <a-col :span="4">
                  <a-badge :count="c.messages.reduce((s, m) => s + m.contents.filter(ct => ct.status === 'unread').length, 0)" :offset="[x = -25, y = 0]">
                    <a-avatar :src="c.type === 10 ? this.getPrincipalAvatarByUserId(c.id) : null" :shape="c.type === 10 ? 'circle' : 'square'">
                      {{ c.title.substring(0, 1) }}
                    </a-avatar>
                  </a-badge>
                </a-col>
                <a-col :span="20" class="padding-left">
                  <a-row>
                    <a-col :span="16">
                      <a-typography-text strong :ellipsis="true" class="contacts-name display-block" >
                        <icon-font v-if="c.top" class="icon" type="icon-star" />
                        <icon-font v-else-if="c.disturb" class="icon" type="icon-stop" />
                        {{c.title}}
                      </a-typography-text>
                    </a-col>
                    <a-col :span="8" class="text-right">
                      <a-typography-text v-if="c.lastSendTime" type="secondary" class="contacts-name display-block font-size-sm" :content="$moment(c.lastSendTime).fromNow()" />
                    </a-col>
                  </a-row>
                  <a-row type="flex" justify="space-around" align="middle">
                    <a-col :span="24">
                      <a-typography-text :ellipsis="true" type="secondary" class="contacts-message display-block" :content="c.lastMessage" />
                    </a-col>
                  </a-row>
                </a-col>
              </a-row>
              <template #overlay>
                <a-menu @click="contactContextMenuClick">
                  <a-menu-item :key="c.id + '-' + c.type + '-top'"><icon-font class="icon" :type="c.top ? 'icon-unstar' : 'icon-star'" /> {{c.top ? '取消置顶' : '置顶'}}</a-menu-item>
                  <a-menu-item v-if="!c.top" :key="c.id + '-' + c.type + '-disturb'">
                    <icon-font class="icon" :type="c.disturb ? 'icon-success' : 'icon-stop'" /> {{c.disturb ? '取消免打扰' : '消息免打扰'}}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item :key="c.id + '-' + c.type + '-delete'"><icon-font class="icon" type="icon-error" /> 删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-menu-item>
        </a-menu>
        <div v-show="tab === 'group'">
          <a-tree @select="selectTreeContact" show-icon :replaceFields="{title:'name', key:'id'}" :tree-data="groupData">
            <template #group>
              <icon-font class="icon" type="icon-folder-close" />
            </template>
            <template #room>
              <icon-font class="icon" type="icon-user-groups" />
            </template>
            <template #contact>
              <icon-font class="icon" type="icon-profile" />
            </template>
            <template #title="{name, id}">
              <div v-if="id.includes('user-') || id.includes('room-')" class="group-user">
                <a-avatar size="small" :src="id.includes('user-') ? getPrincipalAvatarByUserId(id.replace('user-','')) : ''" :shape="id.includes('user-') ? 'circle' : 'square'">
                  {{name.substring(0,1) }}
                </a-avatar>
                <a-typography-text strong :content="name" />
              </div>
              <a-typography-text v-else :content="name" />
            </template>
          </a-tree>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script>

export default {
  name:"ChatContact",
  emits: ["selectMessageContact", "selectTreeContact", "contactContextMenuClick"],
  props: ["contactData"],
  computed:{
    messageCount() {
      return this.contactData.reduce((sum, o) => sum + o.messages.reduce((s, m) => s + m.contents.filter(c => c.status === "unread").length, 0), 0);
    }
  },
  data() {
    return {
      searchText:"",
      selectedKeys:[],
      selectedToolBar:["message"],
      tab:"message",
      groupData:[{
        name: '联系人',
        id: 'contact',
        slots : { icon: 'contact' }
      }, {
        name:'群组',
        id: 'room',
        slots : { icon: 'room' }
      }]
    }
  },
  methods:{
    toolbarSelect(info) {
      this.tab = info.key;
      this.selectedToolBar = [info.key];
    },
    contactContextMenuClick(o) {
      let button = o.key.substring(0, o.key.lastIndexOf("-"));
      let id = button.substring(0, o.key.indexOf("-")) * 1;
      let type = button.substring(o.key.indexOf("-") + 1, button.length) * 1;
      let key = o.key.substring(o.key.lastIndexOf("-") + 1, o.key.length);

      let target = this.contactData.find(c => c.id === id && c.type === type);

      if (!target) {
        return ;
      }

      if (key === "delete") {
        this.$emit("contactContextMenuClick", {key:"delete", target})
      } else if (key === "top") {
        this.$emit("contactContextMenuClick", {key:"top", target})
      }
    },
    selectContact(record){
      let id = record.key.substring(record.key.indexOf("-") + 1, record.key.length) * 1;
      let type = record.key.substring(0, record.key.indexOf("-")) * 1;

      let result = this.contactData.find(c => c.id === id && c.type === type);

      this.selectedKeys = [record.key];
      this.$emit("selectMessageContact", result);
    },
    selectTreeContact(selectedKeys, info) {
      if (!info.node.dataRef.isLeaf) {
        return ;
      }

      let key = selectedKeys[0];
      let type = key.indexOf("user-") >= 0 ? 10: 20;

      let contact = {
        id: (type === 10 ? key.replaceAll("user-", "") : key.replaceAll("room-", ""))  * 1,
        title: info.node.dataRef.name,
        type:type
      }

      if (type === 20) {
        contact.participants = info.node.dataRef.participants;
      }

      this.selectedKeys = [contact.type + "-" + contact.id];
      this.$emit("selectTreeContact", contact);
    }
  }
}

</script>