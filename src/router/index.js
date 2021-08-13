import { createRouter, createWebHistory} from 'vue-router' ;

import Login from '@/views/Login'
import Index from '@/views/Index'
import store from '@/store'

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

export function reload() {

  if (router.getRoutes().length !== routes.length) {

    router.getRoutes().forEach(r => router.removeRoute(r.name));

    routes.forEach(r => router.addRoute(r));

  }

  setRouter(store.state.principal.menus);
}

const setRouter = function(menus) {

  menus.forEach(m => {
    if (m.children && m.children.length > 0) {
      setRouter(m.children);
    } else {
      let path = RecursionMenu.methods.replaceValue(m.value);

      try {
        let r = require("@/views/" + path + "/router");
        addRoute(r.router);
        // eslint-disable-next-line no-empty
      } catch (e) {}

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

  if (to.path === "/login") {

    store.commit("principal/clearPrincipal");

    next();

  } else {

    if (!store.state.principal.authentication) {
      next("/login");
    } else {

      if (router.getRoutes().length === routes.length) {
        reload();
        next({ ...to, replace: true })
      } else {
        next();
      }

    }

  }

});

router.afterEach(() => {
  NProgress.done()
});

export default router
