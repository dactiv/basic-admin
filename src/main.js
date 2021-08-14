import { createApp, createVNode } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import {PRINCIPAL_GETTER_TYPE} from '@/store/principal'

import axios from '@/http/index'
import VueAxios from 'vue-axios'

import '@/assets/less/responsive-utilities.less'

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
    ConfigProvider,
    Typography,
    Tag,
    Tabs,
    Divider,
    notification,
    message
} from "ant-design-vue";

import { createFromIconfontCN, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import moment from "moment";

import '@/assets/css/style.css';
import '@/assets/css/basic.css';

const app = createApp(App);

app.config.globalProperties.$moment = moment;

app.config.globalProperties.formUrlencoded = function(json, ignoreProperties, valueConvert) {

    let param = new URLSearchParams();

    let ignore = [];

    if (typeof ignoreProperties === 'string') {
        ignore.push(ignoreProperties);
    } else {
        ignore = ignoreProperties || [];
    }

    for (let j in json) {

        if (ignore.find(s => s === j)) {
            continue;
        }

        let val = json[j];

        if (!val) {
            continue;
        }

        if (valueConvert) {
            val = valueConvert(val);
        }

        param.append(j, val);
    }

    return param;
}

app.config.globalProperties.loadConfig = function(params, callback) {
    this.$http.get(process.env.VUE_APP_SERVER_CONFIG_URI_SUFFIX,{params: params}).then(callback);
}

const IconFont = createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_2732722_6vo8w3427g3.js"
});

app.component('IconFont', IconFont);

app.config.globalProperties.principal = {
    details: store.state.principal,
    hasPermission: store.getters[PRINCIPAL_GETTER_TYPE.HasPermission],
    hasRole: store.getters[PRINCIPAL_GETTER_TYPE.HasRole]
}

app.config.globalProperties.confirm = function(config, ok, cancel) {

    let props = {
        icon: createVNode(ExclamationCircleOutlined),
        onOk:ok,
        onCancel:cancel
    };

    if (typeof config === 'string') {
        props.title = config;
    } else {
        for (let key in config) {
            props[key] = config[key];
        }
    }

    Modal.confirm(props);

};

app.config.globalProperties.$message = message;

app.config.globalProperties.$notification = notification;

app.use(router)
    .use(store)
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
    .use(Typography)
    .use(Tag)
    .use(Tabs)
    .use(Divider)
    .mount('#app');