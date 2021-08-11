import zhCn from 'ant-design-vue/es/locale/zh_CN'
import enUs from 'ant-design-vue/es/locale/en_US'

import moment from "moment";

export const LOCALE_MUTATION_TYPE = {
    SetLocal:'locale/setLocale'
}

export const LOCALE_TYPE = [
    {
        app: zhCn,
        moment: "zh-cn",
        name: "简体中文",
        id: 1
    }, {
        app: enUs,
        moment: "en-us",
        name: "english",
        id: 2
    }
]

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(LOCALE_TYPE[0])),
    mutations: {
        setLocale(state, id) {

            let locale = LOCALE_TYPE.find(d => d.id === id );

            for (let key in locale) {
                if (state[key]) {
                    state[key] = locale[key];
                }
            }

            moment.locale(state.moment);
        }
    }
}