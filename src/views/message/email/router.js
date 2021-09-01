export const router = [{
    path: "message/email",
    component: () => import("@/views/message/email/Index.vue"),
    name: "message_email",
    meta: {
        title: "邮件管理",
        parent: "message"

    }
},{
    path: "message/email/send",
    component: () => import("@/views/message/email/Send.vue"),
    name: "message_email_send",
    meta: {
        title: "发送邮件",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/email"
    }
},{
    path: "message/email/detail",
    component: () => import("@/views/message/email/Detail.vue"),
    name: "message_email_detail",
    meta: {
        title: "邮件详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/email"
    }
}]