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
          },
          {
            path: 'welcome',
            name: 'Welcome',
            component: () => import('@/views/system/index/welcome.vue'),
            meta: { title: '欢迎页', keepAlive: false }
          }
        ]
      },
      // 实验管理 - 按照Vue2项目顺序
      {
        path: 'experiment',
        name: 'experiment',
        redirect: '/experiment/equipment',
        component: RouteView,
        meta: { title: '实验管理', keepAlive: true, icon: 'experiment' },
        children: [
          {
            path: 'equipment',
            name: 'equipment',
            component: () => import('@/views/experiment/equipment/index.vue'),
            meta: { title: '设备管理', keepAlive: false }
          },
          {
            path: 'layout',
            name: 'layout',
            component: () => import('@/views/experiment/layout/index.vue'),
            meta: { title: '布局管理', keepAlive: false }
          },
          {
            path: 'consumable',
            name: 'consumable',
            component: () => import('@/views/experiment/consumable/index.vue'),
            meta: { title: '耗材管理', keepAlive: false }
          },
          {
            path: 'liquid',
            name: 'liquid',
            component: () => import('@/views/experiment/liquid/index.vue'),
            meta: { title: '试剂管理', keepAlive: false }
          },
          {
            path: 'expFlowStep',
            name: 'expFlowStep',
            component: () => import('@/views/experiment/expFlowStep/newIndex.vue'),
            meta: { title: '实验步骤管理', keepAlive: false }
          },
          {
            path: 'expFlow',
            name: 'expFlow',
            component: () => import('@/views/experiment/expFlow/newIndex.vue'),
            meta: { title: '实验流程设置', keepAlive: false }
          },
          {
            path: 'expFlowCase',
            name: 'expFlowCase',
            component: () => import('@/views/experiment/expFlowCase/index.vue'),
            meta: { title: '实验案例管理', keepAlive: false }
          },
          {
            path: 'gantt',
            name: 'gantt',
            component: () => import('@/views/experiment/gantt/index.vue'),
            meta: { title: '实验跟踪', keepAlive: false }
          },
          {
            path: 'expIncubatorStorage',
            name: 'expIncubatorStorage',
            component: () => import('@/views/experiment/expIncubatorStorage/index.vue'),
            meta: { title: '培养箱存储', keepAlive: false }
          },
          {
            path: 'plan',
            name: 'plan',
            component: () => import('@/views/experiment/plan/index.vue'),
            meta: { title: '计划任务', keepAlive: false }
          },
          {
            path: 'expVideo',
            name: 'expVideo',
            component: () => import('@/views/experiment/expVideo/index.vue'),
            meta: { title: '视频监控', keepAlive: false }
          },
          {
            path: 'sampleInformation',
            name: 'sampleInformation',
            component: () => import('@/views/experiment/sampleInformation/index.vue'),
            meta: { title: '样品信息表', keepAlive: false }
          }
        ]
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/404'
  }
]
