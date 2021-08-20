export const router = [{
    path: "message/sms",
    component: () => import("@/views/message/sms/Index.vue"),
    name: "sms",
    meta: {
        title: "短信管理",
        parent: "message"

    }
},{
    path: "message/sms/send",
    component: () => import("@/views/message/sms/Send.vue"),
    name: "sms_send",
    meta: {
        title: "发送短信",
        parent: "message",
        selectMenu: process.env.VUE_APP_sms_ROOT + "/message/sms"
    }
}]