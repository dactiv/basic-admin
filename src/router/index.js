import { createRouter, createWebHistory} from 'vue-router' ;

import Login from '@/views/Login'
import Index from '@/views/Index'

import NotFound from '@/views/error/404'
import Forbidden from '@/views/error/403'
import BadRequest from '@/views/error/400'

import Profile from '@/views/authentication/console/user/Profile'

import store from '@/store'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css';
import RecursionMenu from "@/components/RecursionMenu";
import {PRINCIPAL_MUTATION_TYPE} from '@/store/principal'

const childrenRoutes = [
  {
    path: '404',
    name: '404',
    component: NotFound
  },{
    path: '403',
    name: '403',
    component: Forbidden
  },{
    path: '400',
    name: '400',
    component: BadRequest
  },{
    path: "profile",
    name: 'profile',
    component: Profile
  }
]

const routes = [
  {
    path: "/",
    name: "root",
    redirect: process.env.VUE_APP_SITE_ROOT
  },
  {
    path: process.env.VUE_APP_LOGIN_PAGE,
    name: process.env.VUE_APP_LOGIN_PAGE.replace("/",""),
    component: Login,
    meta: {
      title: "用户登陆"
    }
  },
  {
    path: process.env.VUE_APP_SITE_ROOT,
    name: process.env.VUE_APP_SITE_ROOT.replace("/",""),
    component: Index,
    meta: {
      title: "首页"
    },
    children:childrenRoutes
  }
];

export function reloadRoute() {

  if (router.getRoutes().length !== routes.length + childrenRoutes.length) {

    clearRoute();

  }

  setRouter(store.state.principal.menus);

  router.addRoute({
    path: "/:pathMatch(.*)*",
    name: 'NotFound',
    //component: NotFound
    redirect: process.env.VUE_APP_SITE_ROOT + "/404"
  });

}

const clearRoute = function() {
  router.getRoutes().forEach(r => router.removeRoute(r.name));

  routes.forEach(r => router.addRoute(r));
}

const setRouter = function(menus) {

  menus.forEach(m => {
    if (m.children && m.children.length > 0) {
      setRouter(m.children);
    } else {
      let path = RecursionMenu.methods.replaceValue(m);
      try {
        let r = require("@/views/" + path + "/router");
        r.router.forEach(r => router.addRoute(process.env.VUE_APP_SITE_ROOT.replace("/",""), r));
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

  if (to.path === process.env.VUE_APP_LOGIN_PAGE) {

    store.commit(PRINCIPAL_MUTATION_TYPE.ClearPrincipal);

    clearRoute();

    next();

  } else {

    if (!store.state.principal.authentication) {
      next(process.env.VUE_APP_LOGIN_PAGE);
    } else {

      if (router.getRoutes().length === routes.length + childrenRoutes.length && store.state.principal.menus.length > 0) {

        reloadRoute();

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
