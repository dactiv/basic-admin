import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from './http/index'
import VueAxios from 'vue-axios'

import {
    DatePicker,
    Button,
    Layout,
    Form,
    Image,
    Input,
    Checkbox,
    Row,
    Col,
    Spin,
    Menu,
    Avatar,
    Select,
    PageHeader,
    Breadcrumb,
    Card,
    Table,
    Dropdown,
    Space,
    Modal,
    ConfigProvider
} from "ant-design-vue";

import { createFromIconfontCN } from '@ant-design/icons-vue';
import moment from "moment";

import '@/assets/less/style.css';
import '@/assets/less/basic.css';

const app = createApp(App);

const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2732722_p2ovf7ovr2.js',
});

app.component('IconFont', IconFont);

app.use(store)
    .use(router)
    .use(VueAxios, axios)
    .use(DatePicker)
    .use(Button)
    .use(Layout)
    .use(Form)
    .use(Image)
    .use(Input)
    .use(Checkbox)
    .use(Row)
    .use(Col)
    .use(Spin)
    .use(Menu)
    .use(Select)
    .use(Avatar)
    .use(PageHeader)
    .use(Breadcrumb)
    .use(Card)
    .use(Table)
    .use(Dropdown)
    .use(Space)
    .use(Modal)
    .use(ConfigProvider)
    .mount('#app');

moment.locale("zh-cn")

app.config.globalProperties.$moment = moment;

app.config.globalProperties.formUrlencoded = function(json) {
    let param = new URLSearchParams();

    for (let j in json) {
        param.append(j, json[j]);
    }

    return param;
}

app.config.globalProperties.loadConfig = function(params, callback) {
    this.$http.get(process.env.VUE_APP_SERVER_CONFIG_URI_SUFFIX,{params: params}).then(callback);
}