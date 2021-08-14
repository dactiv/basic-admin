import axios from 'axios'
import router from '@/router'
import { message } from 'ant-design-vue';

/**
 * 错误代码对应消息
 *
 * @type {{"401": string, "403": string}}
 */
const errorMessage = {"403":"您没有权限访问", "401":"请重新认证账户"};

/**
 * 要忽略的的错误状态
 * @type {number[]}
 */
const ignoreErrorStatus = [404];


/**
 * 异常管理
 *
 * @param error 错误信息
 */
function httpError(error) {

    if (error.response && !ignoreErrorStatus.includes(error.response.status)) {

        let serverMessage = error.response.data[process.env.VUE_APP_SERVER_ERROR_MESSAGE_FIELD];

        if (!serverMessage) {
            serverMessage = errorMessage[error.response.status]
        }

        if (!serverMessage) {
            serverMessage = process.env.VUE_APP_HTTP_ERROR_MESSAGE;
        }

        if (error.response.status === 401) {
            router.push("/login");
        }

        let serverCode = error.response.data[process.env.VUE_APP_SERVER_ERROR_CODE_FIELD];

        if (serverCode) {
            serverCode = "[executeCode:" + serverCode + "] ";
        } else {
            serverCode = "[responseStatus:" + error.response.status + "]";
        }

        message.error(serverCode + serverMessage);

    }

    return Promise.reject(error.response || error.request);
}

/**
 * http 响应拦截器
 *
 * @param response 响应信息
 *
 * @returns {*} 拦截信息
 */
function responseInterceptor(response) {

    if (response.status === 200 && response.data.executeCode === "200") {
        return response.data.data;
    }

    return response
}

/**
 * 添加 http 响应拦截器
 */
axios.interceptors.response.use(responseInterceptor, httpError);

/**
 * http 请求拦截器
 */
function requestInterceptor(config) {
    config.headers["X-FILTER-RESULT-ID"] = process.env.VUE_APP_X_FILTER_RESULT_ID;
    config.headers["X-DATA-VERSION"] = process.env.VUE_APP_X_DATA_VERSION;
    return config;
}

/**
 * 添加 http 请求拦截器
 */
axios.interceptors.request.use(requestInterceptor, httpError);

export default axios;