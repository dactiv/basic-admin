import io from 'socket.io-client';

const defaultStatus = {
    connected: false,
    clientDisconnect:false,
    socket:undefined
};

export const SOCKET_EVENT_TYPE = {
    CONNECT:"connect",
    DISCONNECT:"disconnect",
    ERROR:"error",
    CONNECT_ERROR:"connect_error",
    CONNECT_TIMEOUT:"connect_timeout",
    CLIENT_DISCONNECT:"client_disconnect",
    GROUP_SAVE:"group_save",
    GROUP_DELETE:"group_delete",
    CONSOLE_USER_SAVE:"console_user_save",
    CONSOLE_USER_DELETE:"console_user_delete",
    CHAT_MESSAGE:"chat_message",
    CHAT_READ_MESSAGE:"chat_read_message",
    ROOM_CREATE:"room_create",
    ROOM_JOIN:"room_join",
    ROOM_DELETE:"room_delete"
}

export const SOCKET_IO_ACTION_TYPE = {
    CONNECT:"socketIo/connect",
    IS_CONNECTED:"socketIo/isConnected",
    DISCONNECT:"socketIo/disconnect",
    SUBSCRIBE:"socketIo/subscribe",
    UNSUBSCRIBE:"socketIo/unsubscribe"
}

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(defaultStatus)),
    mutations: {
        setSocket(state, socket) {
            state.socket = socket;
        },
        setConnected(state, value) {
            state.connected = value;
            if (!state.connected && state.socket) {
                state.socket.disconnect();
                state.socket = undefined;
            }
        },
        setClientConnected(state, value) {
            state.clientDisconnect = value;
            if (state.clientDisconnect && state.socket) {
                state.socket.disconnect();
                state.socket = undefined;
            }
        },
        subscribe(state, options) {
            state.socket.on(options.name, options.callback);
        },
        unsubscribe(state, value) {
            state.socket.off(value);
        }
    },
    actions: {
        isConnected(context) {
            return new Promise((resolve, reject) => {
                let count = 0;
                let timeout = setTimeout(function() {
                    if (context.state.connected) {
                        resolve(context.state.socket);
                    } else {
                        count++;
                    }

                    if (count >= process.env.VUE_APP_SOCKET_RETRY_COUNT) {
                        clearTimeout(timeout);
                        reject(count);
                    }
                }, process.env.VUE_APP_SOCKET_RETRY_TIMEOUT * 1);
            });

        },
        subscribe(context, options) {
            let count = 0;
            let timeout = setTimeout(function() {
                if (context.state.socket) {
                    context.commit("subscribe", options);
                    if (options.success && typeof options.success === "function") {
                        options.success();
                    }
                } else {
                    count++;
                    if (options.fail && typeof options.fail === "function") {
                        options.fail(count);
                    }
                }

                if (count >= process.env.VUE_APP_SOCKET_RETRY_COUNT) {
                    clearTimeout(timeout);
                }
            }, process.env.VUE_APP_SOCKET_RETRY_TIMEOUT * 1);
        },
        unsubscribe(context, name) {
            let count = 0;
            let timeout = setTimeout(function() {
                if (context.state.socket) {
                    context.commit("unsubscribe", name);
                } else {
                    count++;
                }

                if (count >= process.env.VUE_APP_SOCKET_RETRY_COUNT) {
                    clearTimeout(timeout);
                }

            }, process.env.VUE_APP_SOCKET_RETRY_TIMEOUT * 1);
        },
        connect(context, options) {
            return new Promise((resolve) => {
                if (context.state.connected) {
                    resolve(context.state.socket);
                    return;
                }
                let socket = io(process.env.VUE_APP_SERVER_URL, options);
                context.commit("setSocket", socket);
                resolve(socket);

                socket.on(SOCKET_EVENT_TYPE.CONNECT, () => {
                    context.commit("setConnected", true);
                    context.commit("setClientConnected", false);
                });

                socket.on(SOCKET_EVENT_TYPE.DISCONNECT, () => {
                    context.commit("setConnected", false);
                });

                socket.on(SOCKET_EVENT_TYPE.CLIENT_DISCONNECT, () => {
                    context.commit("setConnected", false);
                    context.commit("setClientConnected", true);
                    socket.disconnect();
                });

                socket.open();
            });
        },
        disconnect(context) {
            return new Promise((resolve) => {
                if (context.state.disconnected) {
                    resolve();
                    return;
                }
                context.commit("setConnected", false);
                resolve();
            });
        }
    }
}