// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'MenuIndex.vue',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/welcome',
    children: [
      // dashboard
      {
        path: 'dashboard',
        name: 'dashboard',
        redirect: '/dashboard/workplace',
        component: RouteView,
        // eslint-disable-next-line standard/object-curly-even-spacing
        meta: { title: '仪表盘', keepAlive: true, icon: bxAnaalyse /* permission: [ 'dashboard' ] */ },
        children: [
          {
            path: 'analysis/:pageNo([1-9]\\d*)?',
            name: 'Analysis',
            component: () => import('@/views/system/dashboard/Analysis'),
            // eslint-disable-next-line standard/object-curly-even-spacing
            meta: { title: '分析页', keepAlive: true /* permission: [ 'dashboard' ] */ }
          },
          {
            path: 'workplace',
            name: 'Workplace',
            component: () => import('@/views/system/dashboard/Workplace'),
            // eslint-disable-next-line standard/object-curly-even-spacing
            meta: { title: '工作台', keepAlive: false/*, permission: [ 'dashboard' ] */ }
          }
        ]
      },
      {
        path: 'welcome',
        name: 'welcome',
        component: () => import('@/views/system/index/welcome.vue'),
        meta: { title: '欢迎页', keepAlive: true }
      },
      {
        path: 'test',
        name: 'test',
        component: () => import('@/views/test-page.vue'),
        meta: { title: '测试页', keepAlive: false }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    redirect: '/welcome'
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/userLoginReg/Login.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/userLoginReg/Register.vue')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/userLoginReg/RegisterResult.vue')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue')
  },
  {
    path: '/',
    redirect: '/welcome'
  }
]
