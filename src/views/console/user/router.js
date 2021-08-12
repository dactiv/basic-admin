export const router = [{
    path: "console/user",
    component: () => import("@/views/console/user/Index.vue"),
    name: "console_user",
    meta: {
        title: "后台用户管理",
        parent: "system"

    }
},{
    path: "console/user/edit",
    component: () => import("@/views/console/user/Edit.vue"),
    name: "console_user_edit",
    meta: {
        title: "编辑后台用户管理",
        parent: "system",
        selectMenu: "/index/console/user"
    }
}]