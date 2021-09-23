import axios from 'axios'
import router from '@/router'
import { message } from 'ant-design-vue';

import store from '@/store'

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
 * http 请求拦截器
 */
function requestInterceptor(config) {

    config.headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = process.env.VUE_APP_HEADER_FILTER_RESULT_ID_VALUE;
    config.headers[process.env.VUE_APP_HEADER_DATA_VERSION_NAME] = process.env.VUE_APP_HEADER_DATA_VERSION_VALUE;

    let deviceId = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_DEVICE_IDENTIFIED_NAME);
    if (deviceId) {
        config.headers[process.env.VUE_APP_HEADER_DEVICE_IDENTIFIED_HEADER_NAME] = deviceId;
    }

    if (store.state.principal.id > 0) {
        config.headers[process.env.VUE_APP_HEADER_ACCESS_USER_ID_NAME] = store.state.principal.id;
    }

    return config;
}

/**
 * http 响应拦截器
 */
function responseInterceptor(response) {

    let errorCode = response.data[process.env.VUE_APP_SERVER_ERROR_CODE_FIELD];

    if (errorCode && errorCode !== "200") {
        let serverMessage = response.data[process.env.VUE_APP_SERVER_ERROR_MESSAGE_FIELD];
        message.error("[executeCode:" + errorCode + "]" + serverMessage);
    }

    return response;
}

/**
 * 异常管理
 *
 * @param error 错误信息
 */
function responseError(error) {

    if (error.response && !ignoreErrorStatus.includes(error.response.status)) {

        let serverMessage = error.response.data[process.env.VUE_APP_SERVER_ERROR_MESSAGE_FIELD];

        if (!serverMessage) {
            serverMessage = errorMessage[error.response.status]
        }

        if (!serverMessage) {
            serverMessage = process.env.VUE_APP_HTTP_ERROR_MESSAGE;
        }

        if (error.response.status === 401) {
            router.push(process.env.VUE_APP_LOGIN_PAGE);
        } else {

            let status = error.response.status.toString();

            if(router.getRoutes().find(r => r.name === status)) {
                sessionStorage.setItem(status, JSON.stringify(error.response.data));
                router.push({name: status});
            }
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
 * 添加 http 请求拦截器
 */
axios.interceptors.request.use(requestInterceptor);

/**
 * 添加 http 详情拦截器
 */
axios.interceptors.response.use(responseInterceptor, responseError)

export default axios;