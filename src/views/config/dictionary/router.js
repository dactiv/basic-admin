export const router = [{
    path: "config/dictionary",
    component: () => import("@/views/config/dictionary/Index.vue"),
    name: "dictionary",
    meta: {
        title: "数据字典管理",
        parent: "config"

    }
},{
    path: "config/dictionary/edit",
    component: () => import("@/views/config/dictionary/Edit.vue"),
    name: "dictionary_edit",
    meta: {
        title: "编辑组",
        parent: "cofnig",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
}]