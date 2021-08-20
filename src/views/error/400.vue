<template>

  <div class="margin-top-20 margin-bottom-20 display-flex align-items-center justify-content-center">
    <a-image :src="require('@/assets/400.svg')" />
  </div>

  <h1 class="text-center margin-top-20 margin-bottom-20">您提交的参数不正确.</h1>

  <a-row>
    <a-col :span="12" :offset="6">
      <a-table class="ant-table-striped basic-box-shadow" :pagination="false" :data-source="dataSource" :columns="columns" bordered>

      </a-table>
    </a-col>
  </a-row>

  <div class="text-center margin-top-20">
    <a-button onclick="this.$router.back();">
      <icon-font class="icon" type="icon-arrow-left-circle" />
      <span>返回</span>
    </a-button>
  </div>

</template>

<script>

export default {
  name: "400",
  computed: {
      dataSource() {
        let json = JSON.parse(sessionStorage.getItem("400"));
        return json.data || [];
      }
  },
  data() {
    return {
      columns:[
        {
          title: "字段信息",
          dataIndex: "field",
          ellipsis: true,
          width: 200
        },
        {
          title: "错误信息",
          dataIndex: "defaultMessage",
          ellipsis: true,
          width: 200
        },
        {
          title: "错误信息",
          dataIndex: "code",
          ellipsis: true,
          width: 200
        }
      ],
    }
  }
}

</script>