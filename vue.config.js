const webpack = require('webpack');

module.exports = {
    devServer: {
        proxy: process.env.VUE_APP_SERVER_URL
    },
    configureWebpack: {
        plugins:[
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
        ]
    },
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        "menu-inline-submenu-bg":"#fff",
                        "menu-item-height":"42px",
                        "card-padding-base": "20px",
                        "primary-color":"#1196da",
                        "heading-color": "rgba(94, 88, 115, 0.8)",
                        "text-color": "rgba(94, 88, 115, 0.8)",
                        "text-color-secondary": "rgba(94, 88, 115, 0.6)",
                        "disabled-color":"rgba(94, 88, 115, 0.4)"
                    },
                    javascriptEnabled: true
                },
            },
        },
    }
};
