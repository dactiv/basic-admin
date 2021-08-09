module.exports = {
    devServer: {
        proxy: process.env.VUE_APP_SERVER_URL
    },
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        'btn-height-base': '36px',
                        'btn-height-lg': '44px',
                        'btn-height-sm': '28px'
                    },
                    javascriptEnabled: true
                },
            },
        },
    }
};
