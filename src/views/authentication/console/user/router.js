export const router = [{
    path: "authentication/console/user",
    component: () => import("@/views/authentication/console/user/Index.vue"),
    name: "console_user",
    meta: {
        title: "后台用户管理",
        parent: "system"

    }
},{
    path: "authentication/console/user/edit",
    component: () => import("@/views/authentication/console/user/Edit.vue"),
    name: "console_user_edit",
    meta: {
        title: "编辑后台用户",
        parent: "system",
        selectMenu: "/index/console/user"
    }
}]