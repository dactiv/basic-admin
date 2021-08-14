export const router = [{
    path: "resource",
    component: () => import("@/views/resource/Index.vue"),
    name: "resource",
    meta: {
        title: "資源管理",
        parent: "system"

    }
},{
    path: "resource/edit",
    component: () => import("@/views/resource/Edit.vue"),
    name: "resource_edit",
    meta: {
        title: "编辑資源",
        parent: "system",
        selectMenu: "/index/resource"
    }
}]