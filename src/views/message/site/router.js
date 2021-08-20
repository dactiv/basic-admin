export const router = [{
    path: "message/site",
    component: () => import("@/views/message/site/Index.vue"),
    name: "site",
    meta: {
        title: "站内信管理",
        parent: "message"

    }
},{
    path: "message/site/send",
    component: () => import("@/views/message/site/Send.vue"),
    name: "site_send",
    meta: {
        title: "发送站内信",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/site"
    }
}]