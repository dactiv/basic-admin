import axios from "axios";

const defaultStatus = {
    id: 0,
    username: "未认证用户",
    roleAuthorityStrings: [],
    type: 'Anonymous',
    status: 1,
    statusName: '启用',
    authentication: false,
    resourceAuthorityStrings: []
};

export const PRINCIPAL_MUTATION_TYPE = {
    SetPrincipal:'principal/setPrincipal',
    ClearPrincipal:'principal/clearPrincipal',
}

export const PRINCIPAL_ACTION_TYPE = {
    Login:'principal/login',
    Logout:'principal/logout',
}

export const PRINCIPAL_GETTER_TYPE = {
    HasPermission:'principal/hasPermission',
    HasRole:'principal/hasRole',
}

export default {
    namespaced:true,
    state: defaultStatus,
    getters: {
        hasPermission: (state) => (permission) => {
            return state.resourceAuthorityStrings.find(r => r === permission);
        },
        hasRole: (state) => (role) => {
            return state.roleAuthorityStrings.find(r => r === role);
        }
    },
    mutations: {
        setPrincipal(state, principal) {
            state.authentication = true;

            for (let key in principal) {

                if (state[key]) {
                    state[key] = principal[key];
                }

            }

        },
        clearPrincipal(state, defaultStatus) {
            state.authentication = false;

            for (let key in defaultStatus) {

                if (state[key]) {
                    state[key] = defaultStatus[key];
                }

            }
        }
    },
    actions: {
        login: function (context, payload) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/authentication/login", payload, {headers: {"X-AUTHENTICATION-TYPE": "Console"}})
                    .then(response => {
                        context.commit("setPrincipal", response);
                        resolve(response)
                    })
                    .catch(e => reject(e));
            });
        },
        logout: function(context) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/authentication/logout")
                    .then(r => {
                        context.commit("clearPrincipal", defaultStatus);
                        resolve(r);
                    })
                    .catch(e => reject(e));
            });
        }
    }
}