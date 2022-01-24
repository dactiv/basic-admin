<template>
  <a-row>
    <a-col :span="20">
      <a-space v-if="data.id > 0" :size="10" class="padding-left">
        <a-avatar :src="data.type === 10 ? getPrincipalAvatarByUserId(data.id) : null" :shape="data.type === 10 ? 'circle' : 'square'" />
        <a-typography-text strong>{{ data.name }}</a-typography-text>
      </a-space>
    </a-col>
    <a-col :span="4" class="text-right">
      <a-button type="text" @click="onToolbarClick">
        <icon-font class="icon" :type="data.type === 10 ? 'icon-user-groups' : 'icon-image-text'" />
      </a-button>
    </a-col>
  </a-row>

  <a-drawer :width="250" :closable="false" v-model:visible="room.visible" :bodyStyle="{'padding':'0px'}">

    <div class="padding">
      <a-divider class="font-size-sm" orientation="left">名称</a-divider>

      <a-space>
        <a-button type="text" class="padding-none" @click="renameRoom()">
          <icon-font class="icon" :type="room.editable.name.edit ? 'icon-select' : 'icon-edit'" />
        </a-button>
        <a-input v-if="room.editable.name.edit" v-model:value="room.editable.name.text" />
        <a-typography-text v-else :ellipsis="true" v-model:content="room.editable.name.text" style="width: 175px"/>
      </a-space>

      <a-divider class="font-size-sm" orientation="left">备注</a-divider>
      <a-empty v-if="!room.editable.remark.text"></a-empty>
      <p v-else>{{room.editable.remark.text}}</p>

      <a-divider class="font-size-sm" orientation="left">成员信息</a-divider>

      <a-row type="flex" justify="space-around" align="middle" class="margin-bottom">
        <a-col :span="24">
          <a-input-search placeholder="搜索" v-model:value="room.searchText" />
        </a-col>
      </a-row>

      <a-row type="flex" justify="space-around" align="middle" class="margin-bottom" :gutter="[12,0]">
        <a-col :span="12">
          <a-button @click="room.visible = true" block>
            <icon-font class="icon" type="icon-add" /> 添加
          </a-button>
        </a-col>
        <a-col :span="12">
          <a-button type="primary" @click="exitRoom" danger block>
            <icon-font class="icon" type="icon-ashbin" />
            <span v-if="data.type === 20 && data.participantList.find(r => r.userId === principal.details.id).role.value === 20">解散</span>
            <span v-else>退出</span>
          </a-button>
        </a-col>
      </a-row>

      <a-space direction="vertical">
        <template v-for="p of data.participantList" :key="p.id">
          <a-space>
            <a-avatar :src="getPrincipalAvatarByUserId(p.userId)" />
            <a-typography-text strong>{{ getUsername(p).name }}</a-typography-text>
          </a-space>
        </template>
      </a-space>
    </div>
  </a-drawer>

  <a-modal v-model:visible="group.visible" @cancel="clearCurrentRecord" @ok="createGroup" :mask="false" :maskClosable="false" title="创建多人聊天" class="room">
    <a-row class="height-100-percent">
      <a-col :span="8" class="border-right padding height-100-percent">
        <a-row>
          <a-col :span="24" >
            <a-input placeholder="搜索" v-model:value="group.searchText" />
          </a-col>
        </a-row>
        <a-divider class="font-size-sm"> <icon-font class="icon" type="icon-user-groups" /> 选择用户</a-divider>
        <div class="tree-content">
          <a-tree checkable @check="selectGroupUser" v-model:checkedKeys="group.checkedKeys" show-icon :load-data="loadTreeData" :replaceFields="{title:'name', key:'id'}" :tree-data="group.data">
            <template #group>
              <icon-font class="icon" type="icon-folder-close" />
            </template>
            <template #contact>
              <icon-font class="icon" type="icon-profile" />
            </template>
            <template #title="{name, id}">
              <div v-if="id.includes('user-')" class="group-user">
                <a-avatar size="small" :src="getPrincipalAvatarByUserId(id.replace('user-',''))" />
                <a-typography-text strong class="margin-left" :content="name" />
              </div>
              <a-typography-text v-else :content="name" />
            </template>
          </a-tree>
        </div>
      </a-col>
      <a-col :span="16" class="padding height-100-percent overflow-auto">
        <a-card v-if="group.selectedUser.length > 0">
          <a-card-grid v-for="u of group.selectedUser" :key="u.id" style="width: 25%; text-align: center">
            <a-avatar :src="getPrincipalAvatarByUserId(u.id)" />
            <div>
              <a-typography-text :ellipsis="true" wid strong>{{ u.name }}</a-typography-text>
            </div>
          </a-card-grid>
        </a-card>
        <a-empty v-else class="margin-lg-top padding-lg-top"/>
      </a-col>
    </a-row>
  </a-modal>

</template>

<script>

export default {
  name:"ChatMessageTitle",
  props:["data", "renderUsername"],
  watch:{
    data:{
      handler (newValue) {
        this.room.editable.name.text = newValue.name;
        this.room.editable.remark.text = newValue.remark;
      },
      deep:true
    }
  },
  data() {
    return {
      group: {
        visible:false,
        selectedUser:[],
        checkedKeys:[],
        searchText:"",
        data:[{
          name: '联系人',
          id: 'contact',
          slots : { icon: 'contact' },
          children:[]
        }]
      },
      room: {
        searchText:"",
        editable:{
          name: {
            text:"",
            edit:false
          },
          remark: {
            text:"",
            edit:false
          },
        },
        visible:false
      }
    }
  },
  methods:{
    setSelectedKeys(data) {
      let existUser = this.group.selectedUser.find(s => s.id === data.id);

      if (!existUser) {
        this.group.selectedUser.push(data);
        this.group.checkedKeys = ["user-" + data.id]
      }
    },
    clearCurrentRecord() {
      this.group.selectedUser = [];
      this.group.checkedKeys = [];
    },
    loadTreeData(treeNode) {
      return new Promise((resolve) => this.loadGroupTreeNode(resolve, treeNode));
    },
    loadUserTreeNode(group, resolve) {
      let param = {};
      param["filter_[groups_info.id_jin]"] = group.id.replace("group-","");
      param["filter_[status_eq]"] = 1;
      param["filter_[id_ne]"] = this.principal.details.id;

      let headers = {};
      headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_CHAT_ID_VALUE;

      this.$http
          .post("/authentication/console/user/find", this.formUrlencoded(param), {headers: headers})
          .then(r => {
            let data = r.data.data || [];

            data.forEach(d => {
              group.children.push({
                name : this.getPrincipalName(d),
                id: "user-" + d.id,
                isLeaf: true
              });
            });
            resolve();
          });
    },
    loadGroupTreeNode(resolve, treeNode) {
      let param = {};
      param["filter_[sources_jin]"] = ["\"CONSOLE\""];
      param["filter_[status_eq]"] = 1;

      if (treeNode.eventKey.includes("group-")) {
        param["filter_[parent_id_eq]"] = treeNode.eventKey.replace("group-","");
      } else {
        param["filter_[parent_id_eqn]"] = "true";
      }

      let headers = {};
      headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_CHAT_ID_VALUE;

      this.$http
          .post("/authentication/group/find", this.formUrlencoded(param), {headers: headers})
          .then(r => {
            let data = r.data.data || [];

            data.forEach(d => {
              let newOne = d;

              newOne.id = "group-" + d.id;
              newOne.slots = { icon: 'group' }
              newOne.children = [];

              treeNode.dataRef.children.push(newOne);
            });

            if (treeNode.eventKey.includes("group-")) {
              this.loadUserTreeNode(treeNode.dataRef, resolve);
            } else {
              resolve();
            }
          });
    },
    onToolbarClick() {
      if (this.data.type === 20) {
        this.room.visible = !this.room.visible;
      } else {
        this.group.visible = !this.group.visible;
      }
    },
    getUsername(c) {

      c.name = c.name || "加载中..";

      if (this.renderUsername) {
        return this.renderUsername(c, c.userId);
      }

      return c;
    },
    selectGroupUser(checkedKeys, e) {
      let nodes = e.checkedNodes.filter(c => c.key.indexOf('group-') < 0 && c.key !== 'contact');
      this.group.selectedUser = [];
      nodes.forEach(node => {
        let id = node.key.replace("user-", "") * 1;
        this.group.selectedUser.push({id:id, name:node.props.name});
      });
    },
    renameRoom(){
      this.room.editable.name.edit = !this.room.editable.name.edit;
      if (!this.room.editable.name.edit) {
        let param = {
          name: this.room.editable.name.text,
          id: this.data.id
        };

        this
            .$http
            .post("/socket-server/room/renameRoom", this.formUrlencoded(param))
            .then((r) =>  this.$message.success(r.data.message));
      }
    },
    createGroup() {
      if (!this.group.selectedUser || this.group.selectedUser.length <= 0) {
        return ;
      }

      let userIds = this.group.selectedUser.map((v) => v.id);
      let array = [];
      let defaultNameSize = process.env.VUE_APP_SOCKET_CHAT_ROOM_DEFAULT_NAME_SIZE * 1;
      for (let i = 0; i < Math.min(this.group.selectedUser.length, defaultNameSize); i++) {
        array.push(this.group.selectedUser[i].name);
      }

      let name = array.join(process.env.VUE_APP_SOCKET_CHAT_ROOM_DEFAULT_NAME_SEPARATOR);
      let param = {name, userIds};

      this.group.visible = false;

      this.group.selectedUser = [];
      this.group.checkedKeys = [];

      this
          .$http
          .post("/socket-server/room/createRoom", this.formUrlencoded(param))
          .then((r) => this.$message.success(r.data.message));
    },
    exitRoom() {

      let confirmMessage = "确定要";

      if (this.data.participantList.find(r => r.userId === this.principal.details.id).role.value === 20) {
        confirmMessage += "解散";
      } else {
        confirmMessage += "退出";
      }
      confirmMessage += " [ " + this.data.name + " ] 群聊吗?";

      this.confirm(confirmMessage, () => {
        this.room.visible = false;
        this
            .$http
            .post("/socket-server/room/exitRoom", this.formUrlencoded({id: this.data.id}))
            .then((r) => this.$message.success(r.data.message));
      });
    },
  }
}

</script>