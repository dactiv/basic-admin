export const router = [{
    path: "authentication/console/user",
    component: () => import("@/views/authentication/console/user/Index.vue"),
    name: "authentication_console_user",
    meta: {
        title: "后台用户管理",
        parent: "system"

    }
},{
    path: "authentication/console/user/edit",
    component: () => import("@/views/authentication/console/user/Edit.vue"),
    name: "authentication_console_user_edit",
    meta: {
        title: "编辑后台用户",
        parent: "system",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/console/user"
    }
}]