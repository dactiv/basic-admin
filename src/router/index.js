import { createRouter, createWebHistory} from 'vue-router' ;

import Login from '@/views/Login'
import Index from '@/views/Index'
import store from '@/store'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css';
import RecursionMenu from "@/components/RecursionMenu";
import {PRINCIPAL_MUTATION_TYPE} from '@/store/principal'

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
        r.router.forEach(r => router.addRoute("index", r));
        // eslint-disable-next-line no-empty
      } catch (e) {}

    }
  });

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

    store.commit(PRINCIPAL_MUTATION_TYPE.ClearPrincipal);

    next();

  } else {

    if (!store.state.principal.authentication) {
      next("/login");
    } else {

      if (router.getRoutes().length === routes.length) {

        reload();

        if (routes.find(r => r.path === to.path)) {
          next();
        } else {
          next({ ...to, replace: true });
        }

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
