export const router = [{
    path: "authentication/department",
    component: () => import("@/views/authentication/department/Index.vue"),
    name: "authentication_department",
    meta: {
        title: "部门管理",
        parent: "organization"

    }
},{
    path: "authentication/department/edit",
    component: () => import("@/views/authentication/department/Edit.vue"),
    name: "authentication_department_edit",
    meta: {
        title: "编辑部门",
        parent: "organization",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/department"
    }
}]