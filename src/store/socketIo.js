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
    CLIENT_DISCONNECT: "client_disconnect",
    SAVE_GROUP:"save_group",
    DELETE_GROUP:"delete_group",
    SAVE_CONSOLE_USER:"save_console_user",
    DELETE_CONSOLE_USER:"delete_console_user"
}

export const SOCKET_IO_ACTION_TYPE = {
    CONNECT:"socketIo/connect",
    DISCONNECT:"socketIo/disconnect"
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
        },
        setClientConnected(state, value) {
            state.clientDisconnect = value;
        }
    },
    actions: {
        connect(context, options) {
            return new Promise((resolve) => {
                if (context.state.connected) {
                    resolve(context.state.socket);
                    return;
                }
                let socket = io(process.env.VUE_APP_SERVER_URL, options);
                socket.open();
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
                context.commit("setSocket", socket);
                resolve(socket);
            });
        },
        disconnect(context) {
            return new Promise((resolve) => {
                if (context.state.disconnected) {
                    resolve();
                    return;
                }
                context.state.socket.disconnect();
                context.commit("setSocket", JSON.parse(JSON.stringify(defaultStatus)));
                context.commit("setConnected", false);
                resolve();
            });
        }
    }
}