module.exports = {
    devServer: {
        proxy: process.env.VUE_APP_SERVER_URL
    },
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        "menu-inline-submenu-bg":"#ffffff",
                        "menu-item-height":"42px",
                        "card-padding-base": "20px"
                    },
                    javascriptEnabled: true
                },
            },
        },
    }
};
