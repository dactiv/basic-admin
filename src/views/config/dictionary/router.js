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
    component: () => import("@/views/config/dictionary/DictionaryTypeEdit.vue"),
    name: "dictionary_type_edit",
    meta: {
        title: "编辑字典类型",
        parent: "cofnig",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
},{
    path: "config/dictionary/data/edit",
    component: () => import("@/views/config/dictionary/DataDictionaryEdit.vue"),
    name: "data_dictionary_edit",
    meta: {
        title: "编辑数据字典",
        parent: "cofnig",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
}]