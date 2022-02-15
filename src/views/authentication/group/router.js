export const router = [{
    path: "authentication/group",
    component: () => import("@/views/authentication/group/Index.vue"),
    name: "authentication_group",
    meta: {
        title: "组管理",
        parent: "authority"

    }
},{
    path: "authentication/group/edit",
    component: () => import("@/views/authentication/group/Edit.vue"),
    name: "authentication_group_edit",
    meta: {
        title: "编辑组",
        parent: "authority",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/group"
    }
}]