import router from './router'
import store from './store'

import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN, ALL_APPS_MENU } from '@/store/mutation-types'

import { Modal, notification } from 'ant-design-vue' // NProgress Configuration
import { timeFix } from '@/utils/util'

console.log('🔍 Permission.js - Router实例:', router)
console.log('🔍 Permission.js - Store实例:', store)

// 确保router存在且有beforeEach方法
if (!router) {
  console.error('❌ Router实例为空')
  throw new Error('Router instance is null')
}

if (typeof router.beforeEach !== 'function') {
  console.error('❌ Router实例没有beforeEach方法:', router)
  throw new Error('Router instance does not have beforeEach method')
}

console.log('✅ Router实例验证通过')

NProgress.configure({ showSpinner: false })
const whiteList = ['login', 'register', 'registerResult'] // no redirect whitelist
// 修改默认首页为welcome页面
const defaultRoutePath = '/welcome'

// Vue3兼容的localStorage访问器
const ls = {
  get: (key) => {
    const item = localStorage.getItem('pro__' + key)
    if (!item) return null
    
    try {
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem('pro__' + key)
        return null
      }
      return data.value
    } catch (e) {
      // 兼容旧格式
      return item
    }
  },
  set: (key, value, expire = null) => {
    const data = {
      value: value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem('pro__' + key, JSON.stringify(data))
  }
}

router.beforeEach(async (to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${domTitle} - ${to.meta.title}`))
  
  const token = ls.get(ACCESS_TOKEN)
  console.log('🔍 路由守卫检查token:', token)
  console.log('🔍 当前路由:', to.path)
  console.log('🔍 来源路由:', from.path)
  
  if (token) {
    /* has token */
    if (to.path === '/user/login') {
      console.log('🚀 已有token，跳转到工作台')
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        console.log('🔄 获取用户信息...')
        try {
          const res = await store.dispatch('GetInfo')
          if (res.menus.length < 1) {
            Modal.error({
              title: '提示：',
              content: '无菜单权限，请联系管理员',
              okText: '确定',
              onOk: () => {
                store.dispatch('Logout').then(() => {
                  window.location.reload()
                })
              }
            })
            return
          }
          
          // eslint-disable-next-line camelcase
          const all_app_menu = ls.get(ALL_APPS_MENU)
          let antDesignmenus
          // eslint-disable-next-line camelcase
          if (all_app_menu == null) {
            const applocation = []
            res.apps.forEach(item => {
              const apps = { 'code': '', 'name': '', 'active': '', 'menu': '' }
              if (item.active) {
                apps.code = item.code
                apps.name = item.name
                apps.active = item.active
                apps.menu = res.menus
                antDesignmenus = res.menus
              } else {
                apps.code = item.code
                apps.name = item.name
                apps.active = item.active
                apps.menu = ''
              }
              applocation.push(apps)
            })
            ls.set(ALL_APPS_MENU, applocation, 7 * 24 * 60 * 60 * 1000)
            // 延迟 1 秒显示欢迎信息
            setTimeout(() => {
              notification.success({
                message: '欢迎',
                description: `${timeFix()}，欢迎回来`
              })
            }, 1000)
          } else {
            antDesignmenus = ls.get(ALL_APPS_MENU)[0].menu
          }
          console.log("后端返回的路由", antDesignmenus)
          
          await store.dispatch('GenerateRoutes', { antDesignmenus })
          // Vue3中使用addRoute而不是addRoutes
          const addRouters = store.getters.addRouters
          console.log('🔍 准备添加的路由:', addRouters)
          addRouters.forEach(route => {
            console.log('🔍 添加路由:', route.path, route.name)
            router.addRoute(route)
          })
          
          // 等待一个微任务周期，确保路由注册完成
          await new Promise(resolve => setTimeout(resolve, 0))
          
          // 请求带有 redirect 重定向时，登录自动重定向到该地址
          const redirect = decodeURIComponent(from.query.redirect || to.path)
          if (to.path === redirect) {
            // hack方法 确保addRoute已完成 ,set the replace: true so the navigation will not leave a history record
            console.log('🔍 路由重定向: 使用replace模式')
            next({ ...to, replace: true })
          } else {
            // 跳转到目的路由
            console.log('🔍 路由重定向: 跳转到', redirect)
            next({ path: redirect })
          }
          
          // 加载通知列表
          store.dispatch("getNoticReceiveList").catch(err => {
            console.warn('加载通知列表失败:', err)
          })
        } catch (error) {
          console.error('获取用户信息失败:', error)
          store.dispatch('Logout').then(() => {
            next({ path: '/user/login', query: { redirect: to.fullPath } })
          })
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      // 在免登录白名单，直接进入
      console.log('✅ 在白名单中，允许访问:', to.name)
      next()
    } else {
      console.log('❌ 无token，跳转到登录页')
      next({ path: '/user/login', query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

// 导出工具函数，供组件使用
export function getToken() {
  return ls.get(ACCESS_TOKEN) || ''
}

export function clearToken() {
  ls.set(ACCESS_TOKEN, '', -1) // 设置过期时间为负数，立即过期
  store.commit('SET_TOKEN', '')
}

export function getUserInfo() {
  return store.getters.userInfo || {}
}
