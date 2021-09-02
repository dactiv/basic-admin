import { createApp, createVNode } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import {PRINCIPAL_GETTER_TYPE} from '@/store/principal'

import axios from '@/http/index'
import VueAxios from 'vue-axios'

import { createFromIconfontCN, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import moment from "moment";

import '@/assets/css/style.css';
import '@/assets/css/basic.css';

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
    Badge,
    Descriptions,
    Collapse,
    Empty,
    Upload,
    Tooltip,
    List,
    Progress,
    Switch,
    notification,
    message
} from "ant-design-vue";

const app = createApp(App);

app.config.globalProperties.timestampFormat = function (timestamp) {
    return moment(timestamp).format(process.env.VUE_APP_TIMESTAMP_FORMAT);
}

app.config.globalProperties.convertFormUrlencoded = function (val) {

    if (this.$moment.isMoment(val)) {
        return val.format(process.env.VUE_APP_POST_DATE_FORMAT);
    }

    return val;
}

app.config.globalProperties.formUrlencoded = function(json, ignoreProperties, valueConvert) {

    let param = new URLSearchParams();

    let ignore = [];

    if (typeof ignoreProperties === 'string') {
        ignore.push(ignoreProperties);
    } else {
        ignore = ignoreProperties || [];
    }

    for (let j in json) {

        if (ignore.includes(j)) {
            continue;
        }

        let val = json[j];

        if (val === undefined || val === null) {
            continue;
        }

        if (valueConvert) {
            val = valueConvert(j, val);
        }

        if(Array.isArray(val)) {
            val.forEach(v => param.append(j, this.convertFormUrlencoded(v)))
        } else {
            param.append(j, this.convertFormUrlencoded(val));
        }

    }

    return param;
}

app.config.globalProperties.loadConfig = function(params, callback) {
    this.$http.get(process.env.VUE_APP_SERVER_CONFIG_URI_SUFFIX,{params: params}).then(callback);
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

app.config.globalProperties.getFileIcon = function(filename) {

    let index = filename.lastIndexOf(".");

    if (index < 0) {
        return "icon-unkown";
    }

    let suffix = filename.substring(index + 1, filename.length);

    let icon = this.attachmentFileSupport.find(a => a.name === suffix);

    if (!icon) {
        return "icon-unkown";
    }

    return icon.icon
}

const IconFont = createFromIconfontCN({
    scriptUrl: ["//at.alicdn.com/t/font_2732722_7a25f7furcn.js","//at.alicdn.com/t/font_2783178_o30jvdzd5vo.js"]
});

app.component('IconFont', IconFont);

app.config.globalProperties.principal = {
    details: store.state.principal,
    hasPermission: store.getters[PRINCIPAL_GETTER_TYPE.HasPermission],
    hasRole: store.getters[PRINCIPAL_GETTER_TYPE.HasRole]
}

app.config.globalProperties.$message = message;

app.config.globalProperties.$notification = notification;

app.config.globalProperties.$moment = moment;

app.config.globalProperties.attachmentFileSupport = [
    {name:"7z",icon:"icon-z"},
    {name:"avi",icon:"icon-AVI"},
    {name:"bat",icon:"icon-BAT"},
    {name:"ai",icon:"icon-AI"},
    {name:"bmp",icon:"icon-BMP"},
    {name:"css",icon:"icon-CSS"},
    {name:"conf",icon:"icon-CONF"},
    {name:"eot",icon:"icon-EOT"},
    {name:"docx",icon:"icon-DOCX"},
    {name:"doc",icon:"icon-DOC"},
    {name:"htm",icon:"icon-HTM"},
    {name:"html",icon:"icon-HTML"},
    {name:"ico",icon:"icon-ICO"},
    {name:"ini",icon:"icon-INI"},
    {name:"jar",icon:"icon-JAR"},
    {name:"java",icon:"icon-JAVA"},
    {name:"jpeg",icon:"icon-JPEG"},
    {name:"jpg",icon:"icon-JPG"},
    {name:"js",icon:"icon-JS"},
    {name:"md",icon:"icon-MD"},
    {name:"mp3",icon:"icon-MP"},
    {name:"mp4",icon:"icon-MP1"},
    {name:"mp5",icon:"icon-MP2"},
    {name:"mpge",icon:"icon-MPGE"},
    {name:"pdf",icon:"icon-PDF"},
    {name:"pl",icon:"icon-PL"},
    {name:"png",icon:"icon-PNG"},
    {name:"ppt",icon:"icon-PPT"},
    {name:"psd",icon:"icon-PSD"},
    {name:"py",icon:"icon-PY"},
    {name:"rar",icon:"icon-RAR"},
    {name:"rm",icon:"icon-RM"},
    {name:"sh",icon:"icon-SH"},
    {name:"svg",icon:"icon-SVG"},
    {name:"ttf",icon:"icon-TTF"},
    {name:"tar",icon:"icon-TAR"},
    {name:"text",icon:"icon-TEXT"},
    {name:"xlsx",icon:"icon-XLSX"},
    {name:"woff",icon:"icon-WOFF"},
    {name:"xml",icon:"icon-XML"},
    {name:"yml",icon:"icon-YML"},
    {name:"yaml",icon:"icon-YAML"},
    {name:"zip",icon:"icon-ZIP"},
    {name:"bin",icon:"icon-BIN"}
]

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
    .use(Descriptions)
    .use(Badge)
    .use(Collapse)
    .use(Empty)
    .use(Upload)
    .use(Tooltip)
    .use(List)
    .use(Progress)
    .use(Switch)
    .mount('#app');