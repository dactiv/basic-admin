export const router = [{
    path: "message/batch",
    component: () => import("@/views/message/batch/Index.vue"),
    name: "message_batch",
    meta: {
        title: "批量消息管理",
        parent: "message"
    }
},{
    path: "message/batch/detail",
    component: () => import("@/views/message/batch/Detail.vue"),
    name: "message_batch_detail",
    meta: {
        title: "批量消息明细",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/batch"
    }
}]