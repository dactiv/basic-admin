export const router = [{
    path: "group",
    component: () => import("@/views/group/Index.vue"),
    name: "group",
    meta: {
        title: "组管理",
        parent: "system"

    }
},{
    path: "group/edit",
    component: () => import("@/views/group/Edit.vue"),
    name: "group_edit",
    meta: {
        title: "编辑组",
        parent: "system",
        selectMenu: "/index/group"
    }
}]