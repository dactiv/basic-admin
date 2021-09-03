export const router = [{
    path: "message/sms",
    component: () => import("@/views/message/sms/Index.vue"),
    name: "message_sms",
    meta: {
        title: "短信管理",
        parent: "message"

    }
},{
    path: "message/sms/send",
    component: () => import("@/views/message/sms/Send.vue"),
    name: "message_sms_send",
    meta: {
        title: "发送短信",
        parent: "message",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/sms"
    }
},{
    path: "message/sms/detail",
    component: () => import("@/views/message/sms/Detail.vue"),
    name: "message_sms_detail",
    meta: {
        title: "短信详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/sms"
    }
}]