export const router = [{
    path: "config/access/crypto",
    component: () => import("@/views/config/access/crypto/Index.vue"),
    name: "config_access_crypto",
    meta: {
        title: "访问加解密",
        parent: "config"

    }
},{
    path: "config/access/crypto/edit",
    component: () => import("@/views/config/access/crypto/Edit.vue"),
    name: "config_access_crypto_edit",
    meta: {
        title: "编辑访问加解密",
        parent: "cofnig",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/access/crypto"
    }
}]