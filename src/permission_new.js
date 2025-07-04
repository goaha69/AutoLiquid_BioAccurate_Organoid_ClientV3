import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { generatorDynamicRouter } from '@/router/generator-routers'
// import { i18nRender } from '@/locales' // 暂时注释掉国际化功能

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register', 'registerResult'] // no redirect allowlist
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'

// token key
const ACCESS_TOKEN = 'Access-Token'

// localStorage 辅助函数（使用原生 localStorage）
const getToken = () => {
  try {
    const item = localStorage.getItem(ACCESS_TOKEN)
    return item ? JSON.parse(item).value : null
  } catch {
    return localStorage.getItem(ACCESS_TOKEN)
  }
}
const setToken = (token) => {
  const data = { value: token, expire: null }
  localStorage.setItem(ACCESS_TOKEN, JSON.stringify(data))
}
const removeToken = () => localStorage.removeItem(ACCESS_TOKEN)

// 用户信息管理
const getUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      return JSON.parse(userInfoStr)
    }
  } catch (error) {
    console.error('解析用户信息失败:', error)
  }
  
  // 返回默认用户信息，避免返回 null 或 undefined
  return {
    id: null,
    name: '匿名用户',
    nickname: 'anonymous',
    welcome: '欢迎访问系统',
    account: 'admin',
    avatar: '/avatar2.jpg',
    apps: []
  }
}
const setUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}
const removeUserInfo = () => localStorage.removeItem('userInfo')

// 路由状态标识
let routesLoaded = false

// 导出初始化函数，在 main.js 中调用
export const initPermission = async () => {
  // 动态导入 router，确保在使用时 router 已经完全初始化
  const { default: router } = await import('./router')
  
  console.log('[Permission] 开始初始化路由守卫, router:', router)

  router.beforeEach(async (to, from, next) => {
    console.log('[Permission] 路由守卫触发:', to.path, '-> routesLoaded:', routesLoaded)
    
    NProgress.start() // start progress bar
    
    const token = getToken()
    console.log('[Permission] Token状态:', !!token)
    
    // 如果有 token
    if (token) {
      if (to.path === loginRoutePath) {
        // 已登录用户访问登录页，直接跳转到主页
        console.log('[Permission] 已登录用户访问登录页，跳转到主页')
        next({ path: defaultRoutePath })
        NProgress.done()
        return
      }
      
      // 检查是否已有用户信息和路由
      const userInfo = getUserInfo()
      const hasUserInfo = userInfo && userInfo.id
      console.log('[Permission] 用户信息状态:', !!hasUserInfo, '路由已加载:', routesLoaded)
      
      if (hasUserInfo && routesLoaded) {
        // 已有用户信息且路由已加载，直接放行
        console.log('[Permission] 已有用户信息且路由已加载，直接放行')
        next()
      } else {
        try {
          // 如果没有用户信息，模拟获取（实际项目中这里应该调用API）
          if (!hasUserInfo) {
            console.log('[Permission] 模拟获取用户信息')
            const mockUserInfo = {
              id: 1,
              name: '管理员',
              nickname: 'admin',
              avatar: '/avatar.jpg'
            }
            setUserInfo(mockUserInfo)
          }
          
          // 生成动态路由
          if (!routesLoaded) {
            console.log('[Permission] 开始生成动态路由')
            try {
              // 传递正确的参数格式，等待 Promise 返回
              const routerMap = await generatorDynamicRouter({ antDesignmenus: [] })
              console.log('[Permission] 生成的路由:', routerMap)
              
              // 添加动态路由
              if (routerMap && Array.isArray(routerMap) && routerMap.length > 0) {
                console.log('[Permission] 添加动态路由:', routerMap.length, '个')
                // Vue Router 4 中使用 addRoute 逐个添加路由
                routerMap.forEach(route => {
                  console.log('[Permission] 添加路由:', route.path, route.name)
                  router.addRoute(route)
                })
                routesLoaded = true
                
                // 路由添加后，重新导航到目标页面
                console.log('[Permission] 路由添加完成，重新导航到:', to.path)
                next({ ...to, replace: true })
                return
              } else {
                console.warn('[Permission] 生成的路由为空或无效')
                routesLoaded = true // 即使失败也标记为已加载，避免无限循环
                next()
              }
            } catch (error) {
              console.error('[Permission] 生成动态路由失败:', error)
              routesLoaded = true // 即使失败也标记为已加载，避免无限循环
              next()
            }
          } else {
            next()
          }
        } catch (error) {
          console.error('[Permission] 初始化失败:', error)
          
          // 清除所有信息并跳转到登录页
          removeToken()
          removeUserInfo()
          routesLoaded = false
          
          notification.error({
            message: '错误',
            description: '初始化失败，请重新登录'
          })
          next({ path: loginRoutePath, query: { redirect: to.fullPath } })
          NProgress.done()
        }
      }
    } else {
      // 没有 token，清除状态
      routesLoaded = false
      removeUserInfo()
      
      if (allowList.includes(to.name)) {
        // 在免登录白名单，直接进入
        console.log('[Permission] 免登录页面，直接进入')
        next()
      } else {
        // 其他页面跳转到登录页
        console.log('[Permission] 无token，跳转到登录页')
        next({ path: loginRoutePath, query: { redirect: to.fullPath } })
        NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
      }
    }
  })

  router.afterEach(() => {
    NProgress.done() // finish progress bar
  })
  
  console.log('[Permission] 路由守卫初始化完成')
}

// 导出工具函数供其他地方使用
export {
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
}

// 清除所有认证相关数据
export const clearToken = () => {
  removeToken()
  removeUserInfo()
  routesLoaded = false
}
