import { createRouter, createWebHistory} from 'vue-router' ;

import axios from 'axios'

import Login from '@/views/Login'
import Index from '@/views/Index'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css';

const routes = [
  {
    path: '/',
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
    },
    children: [{
      path: "console/user",
      component: () => import("@/views/console/user/Index.vue"),
      name: "console_user",
      meta: {
        title: "后台用户管理",
        parent: "system"

      }
    },{
      path: "console/user/edit",
      component: () => import("@/views/console/user/Edit.vue"),
      name: "console_user_edit",
      meta: {
        title: "编辑后台用户管理",
        parent: "system",
        selectMenu: "/index/console/user"
      }
    }]
  }
];

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

    axios.post("/authentication/logout").then(function () {
      localStorage.removeItem(process.env.VUE_APP_PRINCIPAL_NAME);
      localStorage.removeItem(process.env.VUE_APP_MENU_NAME);
    });

    next();

  } else {

    let principal = JSON.parse(localStorage.getItem(process.env.VUE_APP_PRINCIPAL_NAME));

    if (principal === null) {
      next("/login");
    } else {
      next();
    }

  }

});

router.afterEach(() => {
  NProgress.done()
})

export default router
