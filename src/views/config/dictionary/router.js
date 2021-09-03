export const router = [{
    path: "config/dictionary",
    component: () => import("@/views/config/dictionary/Index.vue"),
    name: "config_dictionary",
    meta: {
        title: "数据字典管理",
        parent: "config"
    }
},{
    path: "config/dictionary/edit",
    component: () => import("@/views/config/dictionary/DictionaryTypeEdit.vue"),
    name: "config_dictionary_type_edit",
    meta: {
        title: "编辑字典类型",
        parent: "config",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
},{
    path: "config/dictionary/data/edit",
    component: () => import("@/views/config/dictionary/DataDictionaryEdit.vue"),
    name: "config_data_dictionary_edit",
    meta: {
        title: "编辑数据字典",
        parent: "config",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
}]