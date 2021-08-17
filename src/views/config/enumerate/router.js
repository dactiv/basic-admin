export const router = [{
    path: "config/enumerate",
    component: () => import("@/views/config/enumerate/Index.vue"),
    name: "enumerate",
    meta: {
        title: "系统枚举查询",
        parent: "config"

    }
}]