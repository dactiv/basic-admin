export const router = [{
    path: "message/site",
    component: () => import("@/views/message/site/Index.vue"),
    name: "message_site",
    meta: {
        title: "站内信管理",
        parent: "message"

    }
},{
    path: "message/site/send",
    component: () => import("@/views/message/site/Send.vue"),
    name: "message_site_send",
    meta: {
        title: "发送站内信",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/site"
    }
},{
    path: "message/site/detail",
    component: () => import("@/views/message/site/Detail.vue"),
    name: "message_site_detail",
    meta: {
        title: "站内信详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/site"
    }
}]