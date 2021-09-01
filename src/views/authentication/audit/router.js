export const router = [{
    path: "authentication/audit",
    component: () => import("@/views/authentication/audit/Index.vue"),
    name: "authentication_audit",
    meta: {
        title: "操作审计",
        parent: "system"
    }
},{
    path: "authentication/audit/detail",
    component: () => import("@/views/authentication/audit/Detail.vue"),
    name: "authentication_audit_detail",
    meta: {
        title: "查看操作审计",
        parent: "system",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/audit"
    }
}]