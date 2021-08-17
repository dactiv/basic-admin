export const router = [{
    path: "config/variable",
    component: () => import("@/views/config/variable/Index.vue"),
    name: "variable",
    meta: {
        title: "环境变量查询",
        parent: "config"
    }
}]