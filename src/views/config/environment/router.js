export const router = [{
    path: "config/environment",
    component: () => import("@/views/config/environment/Index.vue"),
    name: "config_environment",
    meta: {
        title: "环境变量查询",
        parent: "config"
    }
}]