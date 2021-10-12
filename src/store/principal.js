import axios from "axios";

const defaultStatus = {
    id: 0,
    username: "未认证用户",
    roleAuthorityStrings: [],
    type: 'Anonymous',
    status: 1,
    statusName: '启用',
    authentication: false,
    rememberMe: false,
    resourceAuthorityStrings: [],
    avatar: undefined,
    token:"",
    menus:[]
};

export const PRINCIPAL_MUTATION_TYPE = {
    SET_PRINCIPAL:"principal/setPrincipal",
    REFRESH_AVATAR:"principal/refreshAvatar",
    CLEAR_PRINCIPAL:"principal/clearPrincipal"
}

export const PRINCIPAL_ACTION_TYPE = {
    LOGIN:"principal/login",
    Logout:"principal/logout"
}

export const PRINCIPAL_GETTER_TYPE = {
    HAS_PERMISSION:"principal/hasPermission",
    HAS_ROLE:"principal/hasRole"
}

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(defaultStatus)),
    getters: {
        hasPermission: (state) => (permission) => {
            return state.resourceAuthorityStrings.includes(permission);
        },
        hasRole: (state) => (role) => {
            return state.roleAuthorityStrings.includes(role);
        }
    },
    mutations: {
        refreshAvatar(state) {
            state.avatar = process.env.VUE_APP_USER_AVATAR_PREFIX  + "current_" + state.id + "?date=" + new Date().getTime();
        },
        setPrincipal(state, principal) {

            for (let key in principal) {

                if (state[key] !== undefined) {
                    state[key] = principal[key];
                }

            }

            state.avatar = process.env.VUE_APP_USER_AVATAR_PREFIX  + "current_" + state.id + "?date=" + new Date().getTime();

        },
        clearPrincipal(state) {

            for (let key in defaultStatus) {

                if (state[key]) {
                    state[key] = defaultStatus[key];
                }

            }

            localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_DEVICE_IDENTIFIED_NAME);
        }
    },
    actions: {
        login(context, payload) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/authentication/login", payload, {headers: {"X-AUTHENTICATION-TYPE": "Console"}})
                    .then(response => {
                        let data = response.data.data;
                        data.authentication = true;
                        context.commit("setPrincipal", data);
                        resolve(response)
                    })
                    .catch(e => reject(e));
            });
        },
        logout(context) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/authentication/logout")
                    .then(r => {
                        context.commit("clearPrincipal", defaultStatus);
                        resolve(r.data.data);
                    })
                    .catch(e => reject(e));
            });
        }
    }
}