import router from './router'
import store from './store'
import { h } from 'vue' // 用于创建虚拟DOM元素

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
// 修改默认首页路径，与旧版保持一致
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
  try {
    // 避免重复进入导航守卫
    if (to._handled) {
      console.log('⚠️ 路由已被处理过，避免循环重定向');
      next();
      return;
    }
    to._handled = true;
    
    NProgress.start() // start progress bar
    to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${domTitle} - ${to.meta.title}`))
    
    const token = ls.get(ACCESS_TOKEN)
    console.log('🔍 路由守卫检查token:', token)
    console.log('🔍 当前路由:', to.path, to.name)
    console.log('🔍 来源路由:', from.path, from.name)
  
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
            
            // 检查后端是否返回了菜单数据
            if (res.apps && res.apps.length > 0) {
              console.log('🔍 使用后端返回的菜单数据')
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
            } else {
              console.log('⚠️ 后端未返回菜单数据，使用本地路由配置作为 fallback')
              // 使用本地路由配置作为 fallback
              const defaultApp = {
                'code': 'default',
                'name': '默认应用',
                'active': true,
                'menu': null // 使用 null 表示使用本地路由
              }
              applocation.push(defaultApp)
              antDesignmenus = null // 这将触发使用本地路由配置
            }
            
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
          
          // 确保后端返回的菜单数据结构正确
          if (!Array.isArray(res.menus) || res.menus.length === 0) {
            console.error('❌ 后端返回的菜单数据无效:', res.menus);
            Modal.error({
              title: '提示：',
              content: '无有效菜单数据，请联系管理员',
              okText: '确定',
              onOk: () => {
                store.dispatch('Logout').then(() => {
                  window.location.reload();
                });
              }
            });
            return;
          }

          // 生成 antDesignmenus
          antDesignmenus = res.menus.map(menu => {
            return {
              ...menu,
              path: menu.path.startsWith('/') ? menu.path : `/${menu.path}` // 确保路径以 '/' 开头
            };
          });

          console.log('🔍 处理后的菜单数据:', antDesignmenus);

          // 修复 antDesignmenus 数据的 path 字段，确保子路由 path 不以 '/' 开头
          function fixMenuPaths(menus) {
            return menus.map(menu => {
              if (menu.path && menu.path.startsWith('/') && menu.pid !== 0) {
                menu.path = menu.path.substring(1);
              }
              if (menu.children && menu.children.length > 0) {
                menu.children = fixMenuPaths(menu.children);
              }
              return menu;
            });
          }

          // 在 GenerateRoutes 调用前修复菜单数据
          antDesignmenus = fixMenuPaths(antDesignmenus);
          console.log('🔍 修复后的菜单数据:', antDesignmenus);

          // 调用 GenerateRoutes 动态生成路由
          await store.dispatch('GenerateRoutes', { antDesignmenus });

          // 修复动态路由注册逻辑，确保 /welcome 路由正确挂载到 BasicLayout 的子路由中，并修复组件加载问题
          const addRouters = store.getters.addRouters;
          console.log('🔍 准备添加的路由:', JSON.parse(JSON.stringify(addRouters)));

          // 先获取当前所有路由
          const currentRoutes = router.getRoutes();
          console.log('🔍 添加路由前的所有路由:', JSON.stringify(currentRoutes, null, 2));
          
          // 安全地动态查找 BasicLayout 的 name
          let rootRouteName = '';
          try {
            // 确保 currentRoutes 存在且是数组
            if (currentRoutes && Array.isArray(currentRoutes)) {
              // 查找 BasicLayout 路由
              const rootRoute = currentRoutes.find(route => 
                route && (route.name === 'BasicLayout' || 
                         route.name === 'MenuIndex.vue' || 
                         route.path === '/' || 
                         (route.name && route.name.includes('Layout'))));
              rootRouteName = rootRoute ? rootRoute.name : '';
              console.log('🔍 找到根路由:', rootRouteName || '未找到');
            } else {
              console.warn('⚠️ currentRoutes 不是有效数组，无法查找根路由');
            }
          } catch (err) {
            console.error('❌ 查找根路由时出错:', err);
          }

          // 先添加常规路由，后添加 welcome 路由，确保依赖关系正确
          try {
            // 安全地检查 addRouters 是否存在
            if (!addRouters || !Array.isArray(addRouters)) {
              console.error('❌ addRouters 不是有效数组');
              // 创建一个紧急路由作为备用
              const emergencyRoute = {
                path: '/',
                name: 'MenuIndex.vue',
                component: BasicLayout,
                meta: { title: '首页' },
                children: [
                  {
                    path: 'welcome',
                    name: 'welcome',
                    component: () => import('@/views/system/index/welcome.vue'),
                    meta: { title: '首页' }
                  }
                ]
              };
              router.addRoute(emergencyRoute);
              console.log('✅ 紧急路由添加成功');
            } else {
              console.log(`🔍 处理 ${addRouters.length} 个动态路由...`);
              
              // 检查是否有根路由
              const rootRouter = addRouters.find(route => 
                route.path === '/' || 
                route.name === 'MenuIndex.vue' || 
                route.name === 'BasicLayout');
              
              if (!rootRouter) {
                console.warn('⚠️ 未找到根路由，尝试自动创建');
                // 创建根路由
                const newRootRouter = {
                  path: '/',
                  name: 'MenuIndex.vue',
                  component: BasicLayout,
                  meta: { title: '首页' },
                  children: []
                };
                
                // 把所有其他路由作为根路由的子路由
                addRouters.forEach(route => {
                  if (route.path.startsWith('/')) {
                    route.path = route.path.substring(1);
                  }
                  newRootRouter.children.push(route);
                });
                
                // 添加根路由
                router.addRoute(newRootRouter);
                console.log('✅ 创建并添加根路由成功');
              } else {
                // 有根路由，直接添加
                console.log('🔍 找到根路由:', rootRouter);
                
                // 先添加根路由
                router.addRoute(rootRouter);
                console.log('✅ 根路由添加成功');
                
                // 再添加其他路由
                addRouters.forEach((route, index) => {
                  if (route !== rootRouter) {
                    try {
                      router.addRoute(route);
                      console.log(`✅ 路由 '${route.path}' 添加成功`);
                    } catch (err) {
                      console.error(`❌ 路由 '${route.path}' 添加失败:`, err);
                    }
                  }
                });
              }
            }
          } catch (err) {
            console.error('❌ 处理路由时发生错误:', err);
          }

          console.log('🔍 所有路由已添加完成');

          // 验证动态路由是否正确注册
          console.log('🔍 验证动态路由注册...')
          const updatedRoutes = router.getRoutes();
          console.log('🔍 当前所有路由:', JSON.stringify(updatedRoutes, null, 2));

          // 进行最终的路由验证
          console.log('🔍 进行最终路由验证...');
          let welcomeRouteExists = false;
          let finalRedirect = '/welcome'; // 默认重定向目标
          
          try {
            // 获取最新路由列表
            const finalRoutes = router.getRoutes();
            console.log(`🔍 最终路由数量: ${finalRoutes.length}`);
            
            // 尝试查找 welcome 相关路由
            const welcomeRoutes = finalRoutes.filter(r => 
              r.path === '/welcome' || 
              r.path.endsWith('/welcome') || 
              (r.name && String(r.name).toLowerCase().includes('welcome'))
            );
            
            if (welcomeRoutes.length > 0) {
              console.log('✅ 找到 welcome 相关路由:', welcomeRoutes.map(r => r.path));
              welcomeRouteExists = true;
              
              // 使用找到的第一个 welcome 路由作为跳转目标
              finalRedirect = welcomeRoutes[0].path;
            } else {
              console.warn('⚠️ 未找到任何 welcome 相关路由');
              
              // 尝试查找首页或仪表盘相关路由
              const homeRoutes = finalRoutes.filter(r => 
                r.path === '/' || 
                r.path === '/index' || 
                r.path === '/dashboard' || 
                r.path.includes('workplace')
              );
              
              if (homeRoutes.length > 0) {
                console.log('✅ 找到备用首页路由:', homeRoutes[0].path);
                finalRedirect = homeRoutes[0].path;
              } else {
                console.warn('⚠️ 未找到任何合适的首页路由，尝试使用任意有效路由');
                
                // 选择第一个不是登录页的路由
                const anyValidRoute = finalRoutes.find(r => 
                  !r.path.includes('login') && 
                  r.path !== '/' && 
                  !r.path.includes('404')
                );
                
                if (anyValidRoute) {
                  console.log('✅ 找到应急路由:', anyValidRoute.path);
                  finalRedirect = anyValidRoute.path;
                }
              }
            }
            
            // 如果仍然没有找到可用路由，最后的手段是动态创建一个
            if (!welcomeRouteExists) {
              console.log('🔧 尝试最后的应急方案: 创建临时 welcome 路由');
              try {
                const lastResortRoute = {
                  path: '/welcome',
                  name: 'welcome_last_resort',
                  component: { render: () => h('div', '欢迎页面 - 临时应急页面') },
                  meta: { title: '首页' }
                };
                router.addRoute(lastResortRoute);
                console.log('✅ 最终应急路由添加成功');
                finalRedirect = '/welcome';
              } catch (err) {
                console.error('❌ 最终应急路由添加失败:', err);
              }
            }
            
            // 确保最终重定向路径以 / 开头
            if (!finalRedirect.startsWith('/')) {
              finalRedirect = '/' + finalRedirect;
            }
            
          } catch (err) {
            console.error('❌ 路由验证过程出错:', err);
          }
          
          // 处理重定向逻辑
          console.log(`🚀 准备跳转到: ${finalRedirect}`);
          
          // 防止无限重定向
          if (to.path === finalRedirect) {
            console.log('⚠️ 检测到可能的重定向循环，尝试使用 replace 模式');
            try {
              // 执行替换式导航
              next({ path: finalRedirect, replace: true });
              return; // 重要：阻止后续代码执行
            } catch (err) {
              console.error('❌ replace 模式导航失败:', err);
            }
          } else {
            try {
              // 执行普通导航
              console.log(`🔍 正常导航到 ${finalRedirect}`);
              next({ path: finalRedirect });
              return; // 重要：阻止后续代码执行
            } catch (err) {
              console.error('❌ 导航执行失败:', err);
            }
          }
          
          // 如果上述所有逻辑都失败，尝试最简单的导航方式
          console.warn('⚠️ 尝试最基本的导航方法');
          next();
        } catch (error) {
          console.error('❌ 获取用户信息或生成路由时出错:', error)
          
          // 尝试创建紧急欢迎路由作为最后的手段
          try {
            console.log('🔧 尝试在错误处理中创建紧急欢迎路由');
            const emergencyWelcomeRoute = {
              path: '/welcome',
              name: 'welcome_emergency_error',
              component: { 
                render: () => h('div', [
                  h('h2', '系统正在初始化'),
                  h('p', '路由加载出现问题，但您可以继续使用系统基本功能。请联系管理员报告此问题。')
                ])
              },
              meta: { title: '系统初始化中' }
            };
            router.addRoute(emergencyWelcomeRoute);
            
            // 显示提示但不强制退出登录
            notification.warning({
              message: '系统提示',
              description: '初始化菜单时遇到问题，已启用基本导航。如遇到功能问题，请刷新页面或重新登录。'
            });
            
            // 尝试正常导航
            next({ path: '/welcome', replace: true });
            
          } catch (emergencyErr) {
            console.error('❌ 紧急处理失败，将退出登录:', emergencyErr);
            notification.error({
              message: '错误',
              description: '系统初始化失败，请重新登录'
            });
            
            // 退出登录
            store.dispatch('Logout').then(() => {
              next({ path: '/user/login', query: { redirect: to.fullPath } });
            });
          }
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: '/user/login', query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
  } catch (globalErr) {
    console.error('❌ 路由导航守卫全局错误:', globalErr);
    // 确保导航能继续，尽管发生了错误
    next({ path: '/user/login' });
    NProgress.done();
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
