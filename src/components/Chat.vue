<template >
  <a-drawer :width="950" placement="right" :closable="false" :afterVisibleChange="visibleChange" v-model:visible="visible" class="chat">

    <a-drawer :width="250" :closable="false" :visible="room.info.visible" :bodyStyle="{'padding':'0px'}">
      <div class="text-right">
        <a-button type="text" @click="room.info.visible = false" class="padding-xss-left padding-xss-right">
          <icon-font class="icon" type="icon-close" />
        </a-button>
      </div>

      <div class="padding">
        <a-divider class="font-size-sm" orientation="left">名称</a-divider>

        <a-space>
          <a-button type="text" class="padding-none" @click="renameRoom()">
            <icon-font class="icon" :type="room.info.editable ? 'icon-select' : 'icon-edit'" />
          </a-button>
          <a-input v-if="room.info.editable" v-model:value="current.contact.title" />
          <a-typography-text v-else :ellipsis="true" v-model:content="current.contact.title" style="width: 175px"/>
        </a-space>

        <a-divider class="font-size-sm" orientation="left">备注</a-divider>
        <a-empty v-if="!current.contact.remark"></a-empty>
        <p v-else>{{current.contact.remark}}</p>

        <a-divider class="font-size-sm" orientation="left">成员信息</a-divider>

        <a-row type="flex" justify="space-around" align="middle" class="margin-bottom">
          <a-col :span="24">
            <a-input-search placeholder="搜索" v-model:value="room.info.searchText" />
          </a-col>
        </a-row>

        <a-row type="flex" justify="space-around" align="middle" class="margin-bottom" :gutter="[12,0]">
          <a-col :span="12">
            <a-button @click="room.info.visible = true" block>
              <icon-font class="icon" type="icon-add" /> 添加
            </a-button>
          </a-col>
          <a-col :span="12">
            <a-button type="primary" @click="exitRoom" danger block>
              <icon-font class="icon" type="icon-ashbin" />
              <span v-if="current.contact.type === 20 && current.contact.participants.find(r => r.userId === principal.details.id).role.value === 20">解散</span>
              <span v-else>退出</span>
            </a-button>
          </a-col>
        </a-row>

        <a-space direction="vertical">
          <a-space v-for="p of current.contact.participants" :key="p.id">
              <a-avatar :src="getPrincipalAvatarByUserId(p.userId)">
                {{ getUsernameById(p.userId, "用户 [" + p.userId + "]").substring(0,1) }}
              </a-avatar>
              <a-typography-text strong>{{ getUsernameById(p.userId, "用户 [" + p.userId + "]") }}</a-typography-text>
          </a-space>
        </a-space>
      </div>
    </a-drawer>

    <a-layout class="height-100-percent">
      <a-layout-sider class="main-aside border-right" :width="280">
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
              <a-input placeholder="搜索" v-model:value="tree.searchText" />
            </div>
            <div class="left-content">
              <a-menu v-show="tab === 'message'" @click="selectContact" :selectedKeys="selectedKeys" mode="vertical">
                <a-menu-item v-for="c of contacts" :key="c.type + '-' + c.id" >
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
                        <a-menu-item :key="c.id + '-' + c.type + '-read'"><icon-font class="icon" type="icon-survey" /> 设置为已读</a-menu-item>
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
                <a-tree @select="selectTreeContact" show-icon :load-data="loadTreeData" :replaceFields="{title:'name', key:'id'}" :tree-data="groupData">
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
      </a-layout-sider>
      <a-layout class="overflow-hidden">
        <a-layout-header class="border-bottom">
          <a-row>
            <a-col :span="20">
              <a-space v-if="current.contact.id > 0" :size="10" class="padding-left">
                <a-avatar :src="current.contact.type === 10 ? getPrincipalAvatarByUserId(this.current.contact.id) : null" :shape="current.contact.type === 10 ? 'circle' : 'square'" >
                  {{ current.contact.title.substring(0,1) }}
                </a-avatar>
                <a-typography-text strong>{{ current.contact.title }}</a-typography-text>
              </a-space>
            </a-col>
            <a-col :span="4" class="text-right">
              <a-button type="text" @click="openTarget">
                <icon-font class="icon" :type="current.contact.id >= 0 && current.contact.type === 10 ? 'icon-user-groups' : 'icon-image-text'" />
              </a-button>
            </a-col>
          </a-row>
        </a-layout-header>
        <a-layout>
          <a-layout-content class="height-100-percent">
            <div id="message-content" class="message" ref="message-content" @scroll="messageContentScroll">
              <template v-if="current.contact.id > 0">
                <a-divider class="font-size-sm margin-none" v-if="!current.contact.lastLoadMessage">
                  <a-typography-text type="secondary">
                    <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
                  </a-typography-text>
                </a-divider>
                <div v-for="m of current.contact.messages" :key="m.id">

                  <div class="text-center margin-top margin-bottom">
                    <a-typography-text type="secondary">{{ timestampFormat(m.creationTime) }}</a-typography-text>
                  </div>

                  <div v-for="c of m.contents" :key="c" :class="c.senderId !== principal.details.id ? 'margin-bottom' : 'margin-bottom text-right'">
                    <a-space align="start">
                        <a-avatar v-if="c.senderId !== principal.details.id" :src="getPrincipalAvatarByUserId(current.contact.id)" class="basic-box-shadow" >
                          {{ current.contact.title.substring(0,1) }}
                        </a-avatar>
                        <a-space>
                          <a-tooltip v-if="c.senderId === principal.details.id">
                            <template #title><a-button v-if="c.status === 'fail'" type="link" class="padding-none" @click="retrySend(c.id)">[重试]</a-button>{{c.tooltip}} </template>
                            <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                              <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                            </a-typography-text>
                          </a-tooltip>
                          <a-card :class="c.senderId === principal.details.id ? 'border-radius basic-box-shadow self' : 'border-radius basic-box-shadow'" v-html="c.content">
                          </a-card>
                          <a-tooltip v-if="c.senderId !== principal.details.id">
                            <template #title>{{c.tooltip}}</template>
                            <a-typography-text :type="c.status === 'sending' || c.status === 'success' || c.status === 'unread' ? 'secondary' : c.status === 'read' ? 'success' : 'danger'">
                              <icon-font :spin="c.status === 'sending'" class="icon" :type="c.status === 'sending' ? 'icon-refresh' : c.status === 'fail' ? 'icon-error' :  'icon-success'" />
                            </a-typography-text>
                          </a-tooltip>
                        </a-space>
                        <a-avatar v-if="c.senderId === principal.details.id" :src="principal.details.avatar" class="basic-box-shadow">
                          我
                        </a-avatar>
                    </a-space>
                  </div>
                </div>

              </template>
            </div>
            <div class="input border-top" v-if="current.contact.id > 0">
              <QuillEditor toolbar="#chat-toolbar" ref="editor" v-model:content="inputContent" @keyup.ctrl.enter="sendMessage()" content-type="html">
                <template #toolbar>
                  <div id="chat-toolbar" class="border-bottom">
                        <button class="ql-bold" />
                        <button class="ql-italic" />
                        <button class="ql-link" />
                        <button class="ql-image" />
                        <button class="ql-video" />
                        <button class="ql-list" value="ordered" />
                        <button class="custom ql-contact-history" @click="showContactHistory">
                          <icon-font class="icon" type="icon-history" />
                        </button>
                  </div>
                </template>
              </QuillEditor>
            </div>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-drawer>

  <a-modal v-model:visible="room.visible" @cancel="room.selectedUser = []" @ok="createRoom" :destroyOnClose="true" :mask="false" :maskClosable="false" title="创建多人聊天" class="room">
    <a-row class="height-100-percent">
      <a-col :span="8" class="border-right padding height-100-percent">
        <a-row>
          <a-col :span="24" >
            <a-input placeholder="搜索" />
          </a-col>
        </a-row>
        <a-divider class="font-size-sm"> <icon-font class="icon" type="icon-user-groups" /> 选择用户</a-divider>
        <div class="tree-content">
          <a-tree checkable @check="selectRoomUser" show-icon :load-data="loadTreeData" :replaceFields="{title:'name', key:'id'}" :tree-data="room.contactData">
            <template #group>
              <icon-font class="icon" type="icon-folder-close" />
            </template>
            <template #contact>
              <icon-font class="icon" type="icon-profile" />
            </template>
            <template #title="{name, id}">
              <div v-if="id.includes('user-')" class="group-user">
                <a-avatar size="small" :src="getPrincipalAvatarByUserId(id.replace('user-',''))">
                  {{name.substring(0,1) }}
                </a-avatar>
                <a-typography-text strong class="margin-left" :content="name" />
              </div>
              <a-typography-text v-else :content="name" />
            </template>
          </a-tree>
        </div>
      </a-col>
      <a-col :span="16" class="padding height-100-percent overflow-auto">
        <a-card v-if="room.selectedUser.length > 0">
          <a-card-grid v-for="u of room.selectedUser" :key="u.key" style="width: 25%; text-align: center">
            <a-avatar :src="getPrincipalAvatarByUserId(u.key.replaceAll('user-',''))" >
              {{ u.props.name.substring(0,1) }}
            </a-avatar>
            <div>
              <a-typography-text :ellipsis="true" wid strong>{{ u.props.name }}</a-typography-text>
            </div>
          </a-card-grid>
        </a-card>
        <a-empty v-else class="margin-lg-top padding-lg-top"/>
      </a-col>
    </a-row>
  </a-modal>

  <a-modal v-model:visible="current.history.visible" :destroyOnClose="true" :mask="false" :maskClosable="false" :footer="null" class="history" title="聊天记录" width="500px">
    <a-input v-model:value="current.history.search.text">
      <template #addonAfter>
        <a-popover v-model:visible="current.history.calendar.visible" title="选择时间" trigger="click">
          <template #content>
            <a-calendar :fullscreen="false" @select="selectCalendar" :disabled-date="disabledHistoryDate" />
          </template>
          <icon-font class="icon" type="icon-time" />
        </a-popover>
      </template>
    </a-input>
    <a-divider class="font-size-sm">
      <a-tag v-if="current.history.search.date !== ''" closable @close="clearSearch">
        <icon-font class="icon" type="icon-calendar" />
        {{ dateFormat(this.current.history.search.date) }}
      </a-tag>
      消息内容
    </a-divider>

    <div id="history-content" class="message-content" ref="history-content" @scroll="messageContentScroll">
      <a-divider class="font-size-sm margin-none" v-if="!current.history.lastLoadMessage">
        <a-typography-text type="secondary">
          <icon-font spin class="icon" type="icon-refresh" /> 数据加载中...
        </a-typography-text>
      </a-divider>
      <a-empty v-if="current.history.messages.length === 0"></a-empty>
      <div v-for="c of current.history.messages" :key="c.id" :class="c.senderId === principal.details.id ? 'self' : ''">
        <p>
          <a-typography-paragraph>
            <a-typography-text strong >{{ getUsernameById(c.senderId, "用户 [" + p.userId + "]") + " "}}</a-typography-text>
            <a-typography-text class="font-size-sm">{{ timestampFormat(c.creationTime) }}</a-typography-text>
          </a-typography-paragraph>
        </p>
        <div class="margin-xss-left" v-html="c.content"/>
      </div>
    </div>
  </a-modal>

</template>

<script>

import {QuillEditor} from "@vueup/vue-quill";
import { SOCKET_EVENT_TYPE, SOCKET_IO_ACTION_TYPE } from "@/store/socketIo"

import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name: "Chat",
  components: {QuillEditor},
  emits: ['messageCountChange'],
  computed:{
    messageCount() {
      return this.contacts.reduce((sum, o) => sum + o.messages.reduce((s, m) => s + m.contents.filter(c => c.status === "unread").length, 0), 0);
    }
  },
  created() {
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.IS_CONNECTED).then(this.onSocketConnect);

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CONNECT,
      callback:this.onSocketConnect
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE, {
      name: SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE,
      callback:this.onReadMessage
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.CHAT_MESSAGE,
      callback:this.onChatMessage
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_CREATE,
      callback:this.onRoomCreate
    });

    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_DELETE,
      callback:this.onRoomDelete
    });
    this.$store.dispatch(SOCKET_IO_ACTION_TYPE.SUBSCRIBE,{
      name:SOCKET_EVENT_TYPE.ROOM_RENAME,
      callback:this.onRoomRename
    });

    this.current.contact = JSON.parse(JSON.stringify(this.defaultContactValue));
  },
  mounted() {
    let _this = this;

    window.onfocus = () => {
      _this.hasFocus = true;
      if (_this.current.contact.id === 0 || !_this.visible) {
        return ;
      }
      _this.readMessage(_this.current.contact);
    };

    window.onblur = () => _this.hasFocus = false;
  },
  methods:{
    openTarget(){
      if (this.current.contact.id >= 0 && this.current.contact.type === 10) {
        this.room.visible = true;
      } else {
        this.room.info.visible = true;
      }
    },
    renameRoom(){
      this.room.info.editable = !this.room.info.editable;
      if (!this.room.info.editable) {
        let param = {
          name: this.current.contact.title,
          id: this.current.contact.id
        };

        this
            .$http
            .post("/socket-server/room/renameRoom", this.formUrlencoded(param))
            .then((r) =>  {
              this.$message.success(r.data.message);
              let c = this.contacts.find(r => r.id === this.current.contact.id && r.type === 20);
              this.contacts[this.contacts.indexOf(c)].name = this.current.contact.title;
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            });

      }
    },
    exitRoom() {

      let confirmMessage = "确定要";

      if (this.current.contact.participants.find(r => r.userId === this.principal.details.id).role.value === 20) {
        confirmMessage += "解散";
      } else {
        confirmMessage += "退出";
      }
      confirmMessage += " [ " + this.current.contact.title + " ] 群聊吗?";

      this.confirm(confirmMessage, () => {
        this.room.info.visible = false;
        this
            .$http
            .post("/socket-server/room/exitRoom", this.formUrlencoded({id: this.current.contact.id}))
            .then((r) => this.$message.success(r.data.message));
      });
    },
    onRoomRename(data) {
      let json = JSON.parse(data).data;
      if (json.userId === this.principal.details.id) {
        return ;
      }

      let c = this.contacts.find(c => c.id === json.id && c.type === 20);
      if (!c) {
        return ;
      }

      let current = this.contacts[this.contacts.indexOf(c)];
      let username = this.getUsernameById(json.userId);

      if (username) {
        this.$message.success("用户 [" + username + "] 更改了 [" + current.title + "] 群聊名称为 [ " + json.name + " ]" )
      }

      current.title = json.name;
    },
    onRoomDelete(data) {

      let id = JSON.parse(data).data;
      let c = this.contacts.find(c => c.id === id && c.type === 20);

      if (!c) {
        return ;
      }
      // FIXME 先随便写写。
      this.$message.success("群聊 [" + c.title + "] 已移除");

      this.deleteContact(c);
      if (this.tree.groups.room) {
        let room = this.tree.groups.room.find(r => r.id === "room-" + c.id);

        if (room) {
          let index = this.tree.groups.room.indexOf(room);
          this.tree.groups.room.splice(index, 1);
          localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));
        }
      }
    },
    onRoomCreate(data) {
      let json = JSON.parse(data).data;
      this.addContact({
        id: json.id,
        title: json.name,
        type: 20,
        remark:json.remark,
        participants: json.participantList
      });
      this.$message.success("您加入了 [" + json.name + "] 群聊");
      if (this.tree.groups.room) {
        this.tree.groups.room.push({
          id: "room-" + json.id,
          name:json.name,
          isLeaf: true,
          remark:json.remark,
          participants: json.participantList,
          slots : { icon: 'room-children' }
        });
        localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));
      }
    },
    selectRoomUser(checkedKeys, e) {
      this.room.selectedUser = e.checkedNodes.filter(c => c.key.indexOf('group-') < 0 && c.key !== 'contact');
    },
    createRoom() {
      if (!this.room.selectedUser || this.room.selectedUser.length <= 0) {
        return ;
      }

      let userIds = this.room.selectedUser.map((v) => v.key.replaceAll("user-",""));
      let array = [];
      let defaultNameSize = process.env.VUE_APP_SOCKET_CHAT_ROOM_DEFAULT_NAME_SIZE * 1;
      for (let i = 0; i < Math.min(this.room.selectedUser.length, defaultNameSize); i++) {
        array.push(this.room.selectedUser[i].props.name);
      }

      let name = array.join(process.env.VUE_APP_SOCKET_CHAT_ROOM_DEFAULT_NAME_SEPARATOR);
      let param = {name, userIds};
      this
          .$http
          .post("/socket-server/room/createRoom", this.formUrlencoded(param))
          .then((r) => {
            this.room.visible = false;
            this.room.selectedUser = [];
            this.$message.success(r.data.message);
          });
    },
    showContactHistory() {
      if (this.current.contact.id === 0) {
        return ;
      }
      this.current.history.visible = !this.current.history.visible;

      if (this.current.history.visible) {

        if (this.current.contact.messages && this.current.contact.messages.length > 0) {
          this.current.contact.messages.flatMap(m => m.contents).forEach((d) => {
            this.current.history.messages.push(d)
            this.current.history.loadMessages.unshift(d);
          });
        }
        this.current.history.lastLoadMessage = this.current.contact.lastLoadMessage;

        this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
      }
    },
    onSocketConnect() {
      if (!this.contacts || this.contacts.length <= 0) {
        this
            .$http
            .get("/socket-server/chat/getRecentContacts")
            .then((r) => {

              let data = r.data.data;
              if (!data || data.length <= 0) {
                return ;
              }
              data.forEach(d => d.type = d.type.value);
              this.getRecentContactsProfile(data);
            });
      } else {
        this.getSocketTempMessages()
      }
    },
    onReadMessage(data) {
      let json = data;
      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }
      let contact = this.contacts.find(c => c.id === json.id && c.type === json.type);
      let contents = contact.messages.flatMap(m => m.contents)

      json.messageIds.forEach(id => {
        let content = contents.find(m => m.id === id);
        if (content) {
          content.status = "read";
          content.tooltip = content.senderId === this.principal.detail.id ? "对方已查阅" : "您已查阅";
        }
      });

      localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      if (this.visible) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }
    },
    onChatMessage(data) {
      let json = data;
      if (typeof(data) === 'string') {
        json = JSON.parse(data).data;
      }
      let contact = this.contacts.find(c => c.id === json.id && c.type === json.type);

      json.messages.forEach(m => {
        m.status = "unread";
        m.tooltip = "待查阅";
      });

      if (contact) {
        json.messages.forEach(m => this.addMessage(contact, m));

        contact.lastMessage = json.lastMessage;
        contact.lastSendTime = json.lastSendTime;
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

        if (this.current.contact.id > 0 && contact.id === this.current.contact.id && this.hasFocus) {
          this.readMessage(this.current.contact)
        }

        this.$emit('messageCountChange', this.messageCount);
      } else {
        this
            .$http
            .get("/authentication/getPrincipalProfile?type=CONSOLE&ids=" + json.id)
            .then((r) => {

              let data = r.data.data[0];

              json.title = this.getPrincipalName(data);
              json.avatar = data.avatar;
              json.lastLoadMessage = false;

              let messages = json.messages
              json.messages = [];
              this.contacts.unshift(json);

              messages.forEach(m => this.addMessage(json, m));
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

              if (this.current.contact.id > 0 && contact.id === this.current.contact.id && this.hasFocus) {
                this.readMessage(this.current.contact);
              }

              this.$emit('messageCountChange', this.messageCount);
            });
      }

      if (this.visible) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }
    },
    contactContextMenuClick(o) {
      let button = o.key.substring(0, o.key.lastIndexOf("-"));
      let id = button.substring(0, o.key.indexOf("-")) * 1;
      let type = button.substring(o.key.indexOf("-") + 1, button.length) * 1;
      let key = o.key.substring(o.key.lastIndexOf("-") + 1, o.key.length);

      let target = this.contacts.find(c => c.id === id && c.type === type);
      if (!target) {
        return ;
      }

      if (key === "delete") {
        this.deleteContact(target);
      } else if (key === "read") {
        this.readMessage(target);
      } else if (key === "disturb") {
        target.disturb = !target.disturb;
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      } else if (key === "top") {
        target.top = !target.top;
        if (target.top) {
          target.disturb = false;
        }
        localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
      }
    },
    deleteContact(target) {
      let index = this.contacts.indexOf(target);
      this.contacts.splice(index, 1);

      if (this.current.contact.id > 0 && this.current.contact.id === target.id) {
        this.current.contact = JSON.parse(JSON.stringify(this.defaultContactValue));
        this.clearCurrentHistory();
      }

      localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
    },
    clearCurrentHistory() {
      this.current.history.lastLoadMessage = false;
      this.current.history.calendar.visible = false;
      this.current.history.calendar.enabledDate = [];
      this.current.history.messages = [];
      this.current.history.lastLoadMessage = [];
      this.current.history.search.text = '';
      this.current.history.search.date = '';
      this.current.history.search.status = false;
    },
    messageContentScroll(d) {
      if (d.target.scrollTop !== 0) {
        return ;
      }
      if (this.current.contact.id > 0) {
        this.loadHistoryMessage(this.current.contact, d.target);
      }
    },
    installContactHistory(contact) {
      let targetId = contact.id;

      if (contact.id === this.current.contact.id) {
        this.clearCurrentHistory();
      }

      if (contact.messages && contact.messages.length > 0) {
        contact.messages.flatMap(m => m.contents).forEach((d) => {
          this.current.history.messages.push(d);
          this.current.history.loadMessages.unshift(d);
        });
      }

      if (this.current.history.visible) {
        this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
      }

      if (contact.historyDateList && this.current.contact.id > 0 && this.current.contact.id === contact.id) {
        this.current.history.calendar.enabledDate = contact.historyDateList;
        return;
      }

      this.$http
          .post("/socket-server/chat/getHistoryMessageDateList", this.formUrlencoded({targetId}))
          .then((r) => {
            contact.historyDateList = r.data.data || [];
            if (this.current.contact.id > 0 && this.current.contact.id === contact.id) {
              this.current.history.calendar.enabledDate = contact.historyDateList;
            }
          });
    },
    loadHistoryMessage(contact, el) {

      if (contact.lastLoadMessage && this.current.history.lastLoadMessage) {
        return ;
      }

      let time = this.$moment.now();

      if ((!el || el.id === "message-content") && contact.messages.length > 0) {
        let message = contact.messages[0];
        if (message.contents.length > 0) {
          time = this.$moment(message.contents[0].creationTime);
        }
      } else if (this.current.contact.id === contact.id && this.current.history.visible) {
        time = this.current.history.search.status && this.current.history.messages.length === 0 ? this.current.history.search.date : undefined;
        if (!time) {
          let message = this.current.history.messages[0];
          if (message) {
            time = this.$moment(message.creationTime);
          }
        }
      }

      let param = {
        targetId: contact.id,
        time: time,
        size: process.env.VUE_APP_SOCKET_CHAT_MESSAGE_PAGE_SIZE * 1
      };

      this
          .$http
          .post("/socket-server/chat/getHistoryMessagePage", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;
            let c = this.contacts.find(c => c.id === contact.id  && c.type === contact.type);

            let beforeHeight = 0;

            if (this.visible) {
              beforeHeight = el.scrollHeight;
            }

            if (c && (!el || el.id === "message-content")) {
              c.lastLoadMessage = data.last;

              if (data.elements && data.elements.length > 0) {

                data.elements.forEach(d => {
                  d.status = d.read ? "read" : d.senderId === this.principal.details.id ? "success" : "unread";
                  d.tooltip = d.read ? d.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅" : "待查阅";
                  this.addMessage(c, d, true);
                });

                if (c.lastSendTime === "") {
                  c.lastSendTime = this.$moment(data.lastSendTime);
                  c.lastMessage = data.lastMessage;
                }
              }

              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            } else if (this.current.contact.id === contact.id && this.current.history.visible) {

              this.current.history.lastLoadMessage = data.last;

              if (data.elements && data.elements.length > 0) {
                data.elements.forEach(d => {
                  this.current.history.messages.unshift(d)
                  if (!this.current.history.search.status) {
                    this.current.history.loadMessages.push(d);
                  }
                });
              }
            }

            if (this.visible) {
              this.$nextTick(() => el.scrollTop = el.scrollHeight - beforeHeight);

              if (beforeHeight === 0) {
                this.$nextTick(() => this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight);
              }
            }
          });
    },
    retrySend(id) {

      let message = this.current.contact.messages.find(m => m.contents.find(c => c.id === id));

      if (!message) {
        return ;
      }

      let content = message.contents.find(c => c.id === id);
      if (!content) {
        return ;
      }

      let index = message.contents.indexOf(content);
      if (index < 0) {
        return ;
      }

      message.contents.splice(index, 1);
      if (message.contents.length === 0) {
        this.current.contact.messages.splice(this.current.contact.messages.indexOf(message), 1);
      }

      this.inputContent = content.content;
      this.send();
    },
    addMessage(contact, message, unshift) {

      let content = {
        senderId:message.senderId,
        content:message.content,
        tooltip:message.tooltip,
        status:message.status
      };

      if (message.id) {
        let currentContents = contact.messages.flatMap(m => m.contents);
        if (currentContents.find(c => c.id === message.id)) {
          return ;
        }
        content.id = message.id;
      }

      content.creationTime = this.$moment.isMoment(message.creationTime) ?
          message.creationTime :
          this.$moment(message.creationTime);

      let result = {
        creationTime:content.creationTime,
        contents:[content],
        currentIndex:0,
      };

      if (contact.messages.length <= 0) {
          contact.messages.push(result);
      } else {
        let lastMessage = unshift ? contact.messages[0] : contact.messages[contact.messages.length - 1];
        let intervalTimeUnit = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME_UNIT;
        let currentIntervalTime = unshift ?
            this.$moment(lastMessage.creationTime).diff(content.creationTime, intervalTimeUnit) :
            content.creationTime.diff(this.$moment(lastMessage.creationTime), intervalTimeUnit);

        let intervalTime = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_GROUP_INTERVAL_TIME * 1;

        if (currentIntervalTime >= intervalTime) {
          if (unshift) {
            contact.messages.unshift(result)
          } else {
            contact.messages.push(result);
          }
        } else {
          if (unshift) {
            lastMessage.contents.unshift(result.contents[0]);
            result.currentIndex = 0;
          } else {
            lastMessage.contents.push(result.contents[0]);
            result.currentIndex = lastMessage.contents.length - 1;
          }
        }
      }

      result.messageIndex = contact.messages.length - 1;

      return result;
    },
    getRecentContactsProfile(data) {
      let param = {
        type:"CONSOLE",
        ids:data.map((v) => v.id)
      }
      this
          .$http
          .post("/authentication/getPrincipalProfile",this.formUrlencoded(param))
          .then(r => {
            let profile = r.data.data;
            profile.forEach(p => {
              let current = data.find((d) => d.id === p.id);
              this.addContact({
                id:p.id,
                title:this.getPrincipalName(p),
                type: current.type
              });
              this.getSocketTempMessages();
            })
          })
    },
    getLocalStorageContactName(id) {
      return process.env.VUE_APP_LOCAL_STORAGE_CHAT_CONTACT_NAME +"_" + id;
    },
    getSocketTempMessages() {
      let param = {types:[SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE, SOCKET_EVENT_TYPE.CHAT_MESSAGE]};
      this
          .$http
          .post("/socket-server/getTempMessageMap", this.formUrlencoded(param))
          .then((r) => {
            let data = r.data.data;

            if (!data) {
              return ;
            }

            let chatMessages = data[SOCKET_EVENT_TYPE.CHAT_MESSAGE];
            if (chatMessages && chatMessages.length > 0) {
              chatMessages.forEach(m => this.onChatMessage(m));
            }

            let readMessages = data[SOCKET_EVENT_TYPE.CHAT_READ_MESSAGE];
            if (readMessages && readMessages.length > 0) {
              readMessages.forEach(m => this.onReadMessage(m));
            }
            this.$http.post("/socket-server/clearTempMessage", this.formUrlencoded(param));
          });
    },
    visibleChange(visible) {
      if (visible && this.current.contact.id > 0) {
        this.readMessage(this.current.contact);
      }
    },
    sendMessage() {
      let contact = this.contacts.find(c => c.id === this.current.contact.id && c.type === this.current.contact.type);
      contact.messages = contact.messages || [];

      let content = this.addMessage(contact, {
        senderId: this.principal.details.id,
        creationTime: this.$moment.now(),
        status: "sending",
        tooltip:"发送中...",
        content: this.inputContent,
      });

      if (this.current.contact.type === 10) {
        this.sendPersonMessage(contact,content);
      } else {
        this.sendGroupMessage(contact,content)
      }

      this.$refs["editor"].setContents("");
      this.inputContent = "";

      this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
    },
    sendGroupMessage(contact, content) {
      console.log(contact, content);
    },
    sendPersonMessage(contact, content) {
      let param = {
        recipientId:contact.id,
        content:content.contents[0].content
      };

      let current = contact.messages[content.messageIndex].contents[content.currentIndex];

      this
          .$http
          .post("/socket-server/chat/sendMessage", this.formUrlencoded(param))
          .then((r) =>{
            current.id = r.data.data.id;
            current.status = "success";
            current.tooltip = "待查阅";

            contact.lastMessage = param.content.replace(/<[^<>]+>/g, '');
            contact.lastSendTime = content.creationTime;

            localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            //this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
          })
          .catch((r) => {
            current.status = "fail";
            current.tooltip = r.data.message;
            localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
            //this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
          });
    },
    toolbarSelect(info) {
      this.tab = info.key;
      this.selectedToolBar = [info.key];
    },
    loadTreeData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.dataRef.children) {
          resolve();
          return;
        }

        let currentGroups = this.tree.groups[treeNode.eventKey];

        if (currentGroups && currentGroups.length > 0) {
          treeNode.dataRef.children = currentGroups;
          resolve();
          return;
        }

        if (treeNode.eventKey === "room") {
          let rooms = this.tree.groups[treeNode.eventKey];

          if (rooms) {
            treeNode.dataRef.children = rooms;
          }

          let headers = {};
          headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_CHAT_ID_VALUE;
          let config = {
            url:"/socket-server/room/getCurrentPrincipalRooms",
            method: "GET",
            headers: headers
          }

          this.$http
              .request(config)
              .then(r => {
                this.tree.groups[treeNode.eventKey] = [];
                let data = r.data.data || [];
                data.forEach(d => {
                  this.tree.groups[treeNode.eventKey].push({
                    id:"room-" + d.id,
                    name:d.name,
                    isLeaf:true,
                    remark:d.remark,
                    participants: d.participantList,
                    slots:{icon: "room-children"}
                  })
                });
                treeNode.dataRef.children = this.tree.groups[treeNode.eventKey];
                localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));
                resolve();
              })
        } else {

          let param = {};

          if (treeNode.eventKey === "contact") {
            param["filter_[parent_id_eqn]"] = "true";
          } else {
            param["filter_[parent_id_eq]"] = treeNode.eventKey.replace("group-","");
          }

          let headers = {};
          headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_CHAT_ID_VALUE;
          let config = {
            url:"/authentication/group/find",
            params: param,
            method: "POST",
            headers: headers
          }

          this.$http
              .request(config)
              .then(r => {

                treeNode.dataRef.children = r.data.data || [];

                if (treeNode.dataRef.children.length > 0) {
                  treeNode.dataRef.children.forEach(c => {
                    c.slots = { icon: 'group' };
                    c.id = "group-" + c.id;
                  });
                }

                this.tree.groups[treeNode.eventKey] = treeNode.dataRef.children;
                localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));

                if (treeNode.eventKey !== "contact") {
                  this.loadTreeUser(treeNode);
                }

                resolve();

              });
        }
      });
    },
    loadTreeUser(treeNode) {
      let headers = {};
      headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_CHAT_ID_VALUE;
      let config = {
        url:"/authentication/console/user/find",
        params: this.formUrlencoded({
          "filter_[groups_info.id_jin]": treeNode.eventKey.replace("group-","") * 1
        }),
        method: "POST",
        headers: headers
      }

      this
          .$http
          .request(config)
          .then(u => {
            let users = u.data.data;

            if (!users) {
              return ;
            }

            users.forEach(u => {
              if (u.id === this.principal.details.id) {
                return ;
              }

              let data = {
                name : this.getPrincipalName(u),
                id: u.id,
                group: treeNode.eventKey
              };

              treeNode.dataRef.children.push({
                name : data.name,
                id: "user-" + data.id,
                isLeaf: true
              });

              let current = this.tree.users.find(user => user.id === data.id);
              if (current) {
                this.tree.users[this.tree.users.indexOf(current)] = data;
              } else {
                this.tree.users.push(data);
              }

            });
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_USER_NAME, JSON.stringify(this.tree.users));

            this.tree.groups[treeNode.eventKey] = treeNode.dataRef;
            localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME, JSON.stringify(this.tree.groups));
          });

    },
    getUsernameById(id, defaultValue) {
      if (id === this.principal.details.id) {
        return this.getPrincipalName(this.principal.details);
      }

      let contact = this.contacts.find(u => u.id === id && u.type === 10);

      if (contact) {
        return contact.title;
      }

      let user = this.tree.users.find(u => u.id === id);

      if (user) {
        return user.name;
      }

      return defaultValue;
    },
    addContact(contact) {

      let currentContact = this.contacts.find(c => c.id === contact.id && c.type === contact.type);
      if (currentContact) {
        this.contacts.splice(this.contacts.indexOf(currentContact),1);
        currentContact.title = contact.title;
      } else {
        currentContact = contact;
        currentContact.lastLoadMessage = false;
        currentContact.messages = [];
        currentContact.lastMessage = "";
        currentContact.lastSendTime = "";
        currentContact.disturb = false;
        currentContact.top = false;
        this.loadHistoryMessage(currentContact, this.$refs["message-content"]);
      }
      this.contacts.unshift(currentContact);
      localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));

      this.installContactHistory(currentContact);
      return currentContact;
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
      this.current.history.visible = false;

      this.current.contact = this.addContact(contact);
      this.readMessage(this.current.contact);
      this.tab = "message";
      this.selectedToolBar = ["message"];
    },
    selectContact(record){
      let id = record.key.substring(record.key.indexOf("-") + 1, record.key.length) * 1;
      let type = record.key.substring(0, record.key.indexOf("-")) * 1;

      if (this.current.contact.id > 0 && this.current.contact.id === id) {
        return ;
      }

      this.selectedKeys = [record.key];

      this.current.history.visible = false;
      this.current.contact = this.contacts.find(c => c.id === id && c.type === type);

      let pageSize = process.env.VUE_APP_SOCKET_CHAT_MESSAGE_PAGE_SIZE * 1

      if (this.current.contact.messages.length < pageSize && !this.current.contact.lastLoadMessage) {
        this.loadHistoryMessage(this.current.contact, this.$refs["message-content"]);
      }

      this.installContactHistory(this.current.contact);

      this.readMessage(this.current.contact);
    },
    readMessage(contact) {

      if (!this.visible || !contact.messages) {
        return ;
      }

      let unreadMessages = contact.messages.flatMap(m => m.contents).filter(m => m.status === "unread");

      if (this.$refs["message-content"].scrollTop === 0 || unreadMessages.length > 0) {
        this.$nextTick(() => this.$refs["message-content"].scrollTop = this.$refs["message-content"].scrollHeight);
      }

      if (unreadMessages.length > 0) {
        let messages = [];

        unreadMessages.forEach(m => messages.push(m.id));

        let param = {senderId:contact.id, messageIds:messages};

        this
            .$http
            .post("/socket-server/chat/readMessage", param)
            .then(() => {
              unreadMessages.forEach(m => {
                m.status = "read";
                m.tooltip = m.senderId === this.principal.details.id ? "对方已查阅" : "您已查阅";
              });
              localStorage.setItem(this.getLocalStorageContactName(this.principal.details.id), JSON.stringify(this.contacts));
              this.$emit('messageCountChange', this.messageCount);
            });
      }
    },
    disabledHistoryDate(value) {
      if (!this.current.history.calendar.enabledDate) {
        return true;
      }

      let source = value.format(process.env.VUE_APP_POST_DATE_FORMAT);
      let array = this.current.history.calendar.enabledDate.map((v) => this.$moment(v).format(process.env.VUE_APP_POST_DATE_FORMAT));

      return !array.includes(source);
    },
    selectCalendar(date) {

      this.current.history.search.status = true;
      this.current.history.search.date = date;
      this.current.history.calendar.visible = false;
      this.current.history.lastLoadMessage = false;

      this.current.history.messages = [];

      this.loadHistoryMessage(this.current.contact, this.$refs["history-content"]);
    },
    clearSearch() {
      this.current.history.messages = [];
      this.current.history.search.status = false;
      this.current.history.search.date = "";
      this.current.history.search.text = "";
      this.current.history.lastLoadMessage = false;
      this.$nextTick(() => {
        this.current.history.loadMessages.forEach((d) => this.current.history.messages.unshift(d));
        this.$refs["history-content"].scrollTop = this.$refs["history-content"].scrollHeight
      });
    }
  },
  data() {
    return {
      tree: {
        users: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_USER_NAME)) || [],
        groups: JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_CHAT_GROUP_NAME)) || {},
        searchText: "",
      },
      room: {
        visible:false,
        selectedUser:[],
        hiddenUser:[],
        contactData:[{
          name: '联系人',
          id: 'contact',
          slots : { icon: 'contact' }
        }],
        info:{
          visible:false,
          editable:false,
          searchText:''
        },
      },
      hasFocus:true,
      selectedToolBar:["message"],
      selectedKeys:[],
      defaultContactValue:{
        title:"",
        lastLoadMessage: true,
        type:10,
        id:0,
        messages:[]
      },
      current: {
        contact:this.defaultContactValue,
        history: {
          visible:false,
          search: {
            text:'',
            date:null,
            status: false,
          },
          messages:[],
          loadMessages:[],
          lastLoadMessage:false,
          calendar: {
            visible:false,
            enabledDate:[]
          }
        }
      },
      visible: false,
      contacts: JSON.parse(localStorage.getItem(this.getLocalStorageContactName(this.principal.details.id))) || [],
      inputContent:"",
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
  }
}
</script>