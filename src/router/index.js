import { createRouter, createWebHistory} from 'vue-router' ;

import Login from '@/views/Login'
import Index from '@/views/Index'

import NotFound from '@/views/error/404'
import Forbidden from '@/views/error/403'
import BadRequest from '@/views/error/400'

import Profile from '@/views/authentication/console/user/Profile'

import store from '@/store'

import RecursionMenu from "@/components/RecursionMenu";
import {PRINCIPAL_ACTION_TYPE} from '@/store/principal'

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

  let defaultLength = routes.length + childrenRoutes.length

  if (router.getRoutes().length !== defaultLength) {
    clearRoute();
  }

  setRouter(store.state.principal.menus);

  router.addRoute({
    path: "/:pathMatch(.*)*",
    name: 'NotFound',
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

  if (to.path === process.env.VUE_APP_LOGIN_PAGE) {

    store.dispatch(PRINCIPAL_ACTION_TYPE.Logout).then(() => {
      clearRoute();
      next();
    });

  } else if (!store.state.principal.authentication) {
    next(process.env.VUE_APP_LOGIN_PAGE);
  } else if (store.state.principal.rememberMe && to.meta.authentication) {
    sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME, to.fullPath);
    next(process.env.VUE_APP_LOGIN_PAGE);
  } else {

    let defaultLength = routes.length + childrenRoutes.length

    let isReload = false;

    if (router.getRoutes().length === defaultLength && store.state.principal.menus.length > 0) {
      reloadRoute();
      isReload = true;
    }

    if (routes.find(r => r.path === to.path)) {
      next();
    } else if (isReload){
      next({ ...to, replace: true });
    } else {
      next();
    }

  }


});

export default router
