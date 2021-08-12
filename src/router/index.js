import { createRouter, createWebHistory} from 'vue-router' ;

import Login from '@/views/Login'
import Index from '@/views/Index'
import store from '@/store/index'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css';
import RecursionMenu from "@/components/RecursionMenu";

const routes = [
  {
    path: "/",
    name: "root",
    redirect: "/index"
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      title: "用户登陆"
    }
  },
  {
    path: "/index",
    name: "index",
    component: Index,
    meta: {
      title: "首页"
    }
  }
];

export function reloadRouter(menus) {

  if (router.getRoutes().length !== routes.length) {

    router.getRoutes().forEach(r => router.removeRoute(r.name));

    routes.forEach(r => router.addRoute(r));

  }

  setRouter(menus);
}

const setRouter = function(menus) {

  menus.forEach(m => {
    if (m.children && m.children.length > 0) {
      setRouter(m.children);
    } else {
      let path = RecursionMenu.methods.replaceValue(m.value);
      import("@/views/" + path + "/router").then(m => addRoute(m.router));
    }
  });

}

const addRoute = function(routers) {
  routers.forEach(r => router.addRoute("index", r));
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

/**
 * 添加导航卫士
 */
router.beforeEach((to, from, next) => {

  NProgress.start();

  // 如果路径为"登陆", 跳用服务器登出，并把所有的本地数据清除
  if (to.path === "/login") {

    store.commit("principal/clearPrincipal");

    next();

  } else {

    if (!store.state.principal.authentication) {
      next("/login");
    } else {
      next();
    }

  }

});

router.afterEach(() => {
  NProgress.done()
});

export default router
