export const router = [{
    path: "message/email",
    component: () => import("@/views/message/email/Index.vue"),
    name: "email",
    meta: {
        title: "邮件管理",
        parent: "message"

    }
},{
    path: "message/email/send",
    component: () => import("@/views/message/email/Send.vue"),
    name: "email_send",
    meta: {
        title: "发送邮件",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/email"
    }
}]