export const router = [{
    path: "authentication/member/user",
    component: () => import("@/views/authentication/member/user/Index.vue"),
    name: "authentication_member_user",
    meta: {
        title: "会员用户管理",
        parent: "system"

    }
},{
    path: "authentication/member/user/detail",
    component: () => import("@/views/authentication/member/user/Detail.vue"),
    name: "authentication_member_user_detail",
    meta: {
        title: "查看会员用户",
        parent: "system",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/member/user"
    }
}]