import {
  login,
  getLoginUser,
  logout
} from '@/api/modular/system/loginManage'
import {
  sysDictTypeTree
} from '@/api/modular/system/dictManage'
import {
  sysMenuChange
} from '@/api/modular/system/menuManage'
import {
  ACCESS_TOKEN,
  ALL_APPS_MENU,
  DICT_TYPE_TREE_DATA,
  NOTICE_RECEIVED
} from '@/store/mutation-types'
import {
  sysFileInfoPreview
} from '@/api/modular/system/fileManage'
import {
  unReadNotice
} from '@/api/modular/system/noticeReceivedManage'
import {
  welcome,dateFormat
} from '@/utils/util'
import store from '../index'
import router from '../../router'

// localStorage辅助函数
const ls = {
  set: (key, value, expire) => {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem('pro__' + key, JSON.stringify(data))
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem('pro__' + key)
      if (!item) return defaultValue
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem('pro__' + key)
        return defaultValue
      }
      return data.value
    } catch {
      return defaultValue
    }
  },
  remove: (key) => {
    localStorage.removeItem('pro__' + key)
  }
}

const user = {
  state: {
    token: (() => {
      const token = ls.get(ACCESS_TOKEN, '')
      return token
    })(),
    name: '',
    welcome: '',
    avatar: '',
    buttons: [], // 按钮权限
    admintype: '', // 是否是超管
    roles: [],
    info: {},
    notices: [] //接收的通知公告
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, {
      name,
      welcome
    }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_BUTTONS: (state, buttons) => {
      state.buttons = buttons
    },
    SET_ADMINTYPE: (state, admintype) => {
      state.admintype = admintype
    },
    SET_NOTICES: (state, notices) => {
      state.notices = notices
    },
    APPEND_NOTICE:(state,notice)=>{
      notice.publicTime=dateFormat(notice.publicTime,'YYYY-mm-dd HH:MM:SS')
      let notices=state.notices;
      let temp=notices.rows.filter(m=>{return m.value==notice.type})[0]
      let other=notices.rows.filter(m=>{return m.value!=notice.type})
      temp.noticeData.unshift(notice);
      notices.totalRows++;
      if(temp.noticeData.length>6){
        temp.noticeData.pop();
      }
      notices.rows=[];
      notices.rows.push(temp);
      notices.rows.push.apply(notices.rows,other);
      notices.rows.sort((obj1,obj2)=>{
        return obj1.index-obj2.index
      })
      state.notices=notices;
    }
  },

  actions: {
    // 登录
    Login({
      commit
    }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (!response.success) {
            reject(response.message)
            return
          }
          const result = response.data
          
          // 保存到 localStorage
          ls.set(ACCESS_TOKEN, result, 7 * 24 * 60 * 60 * 1000)
          
          // 验证是否保存成功
          const savedToken = ls.get(ACCESS_TOKEN)
          
          // 提交到 store
          commit('SET_TOKEN', result)
          
          resolve()
        }).catch(error => {
          reject('后端未启动或代理错误')
        })
      })
    },

    // 获取用户信息
    GetInfo({
      commit
    }) {
      return new Promise((resolve, reject) => {
        getLoginUser().then(response => {
          if (response.success) {
            const data = response.data
            commit('SET_ADMINTYPE', data.adminType)
            commit('SET_ROLES', ['user']) // 修复：设置为数组而不是数字
            commit('SET_BUTTONS', data.permissions)
            commit('SET_INFO', data)
            commit('SET_NAME', {
              name: data.name,
              welcome: welcome()
            })
            if (data.avatar != null) {
              sysFileInfoPreview({
                id: data.avatar
              }).then((res) => {
                commit('SET_AVATAR', window.URL.createObjectURL(new Blob([res])))
              }).catch((err) => {
                // 头像预览失败，继续执行
              })
            }
            
            // 设置默认应用列表
            if (data.apps && Array.isArray(data.apps) && data.apps.length > 0) {
              // 确保第一个应用是激活状态
              const appList = data.apps.map((app, index) => ({
                ...app,
                active: index === 0
              }))
              ls.set(ALL_APPS_MENU, appList, 7 * 24 * 60 * 60 * 1000)
            } else {
              // 使用默认应用列表
              const defaultApps = [
                { code: 'platform', name: '平台管理', active: true, path: '/welcome' },
                { code: 'system', name: '系统管理', active: false, path: '/system' },
                { code: 'operation', name: '运营管理', active: false, path: '/operation' },
                { code: 'business', name: '业务应用', active: false, path: '/business' },
                { code: 'experiment', name: '实验管理', active: false, path: '/experiment' },
                { code: 'workflow', name: '流程中心', active: false, path: '/workflow' }
              ]
              ls.set(ALL_APPS_MENU, defaultApps, 7 * 24 * 60 * 60 * 1000)
            }
            
            resolve(data)
          } else {
            reject(new Error(response.message))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({
      commit,
      state
    }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          // 登出成功
        }).catch(err => {
          // 登出接口调用失败，但继续清理本地数据
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          ls.remove(ACCESS_TOKEN)
          ls.remove(ALL_APPS_MENU)
          resolve()
        })
      })
    },

    // 字典树
    dictTypeData() {
      return new Promise((resolve, reject) => {
        sysDictTypeTree().then(response => {
          if (response.success) {
            const result = response.data
            ls.set(DICT_TYPE_TREE_DATA, result, 7 * 24 * 60 * 60 * 1000)
            resolve()
          } else {
            reject(response.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取接收的通知公告
    getNoticReceiveList({
      commit
    }) {
      return new Promise((resolve, reject) => {
        unReadNotice().then(response => {
          if (response.success) {
            const data = response.data
            commit('SET_NOTICES', data)
            ls.set(NOTICE_RECEIVED, data, 7 * 24 * 60 * 60 * 1000)
            resolve(data)
          } else {
            reject(response.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 切换应用菜单
    MenuChange({
      commit
    }, application) {
      return new Promise((resolve, reject) => {
        console.log('🔄 [user.js] 切换应用菜单开始:', application)
        
        // 验证参数
        if (!application || !application.code) {
          const errorMsg = '应用参数无效，缺少 code 属性'
          console.error('❌ [user.js]', errorMsg, application)
          reject(new Error(errorMsg))
          return
        }
        
        sysMenuChange({ application: application.code }).then(response => {
          console.log('📱 [user.js] 菜单切换响应:', response)
          if (response.success) {
            const menuData = response.data
            console.log('📋 [user.js] 收到菜单数据:', menuData)
            
            // 验证菜单数据
            if (!menuData || !Array.isArray(menuData)) {
              const errorMsg = '菜单数据格式无效，应该是数组'
              console.error('❌ [user.js]', errorMsg, menuData)
              reject(new Error(errorMsg))
              return
            }
            
            // 构建当前应用的更新对象
            const currentApp = {
              'code': application.code,
              'name': application.name,
              'active': true,
              'menu': menuData
            }
            
            // 获取所有应用，将它们设为非活跃状态
            let allAppMenu = ls.get(ALL_APPS_MENU, [])
            
            // 如果localStorage中没有应用列表，创建一个包含默认应用的列表
            if (!allAppMenu || allAppMenu.length === 0) {
              allAppMenu = [
                { code: 'platform', name: '平台管理', active: false },
                { code: 'system', name: '系统管理', active: false },
                { code: 'operation', name: '运营管理', active: false },
                { code: 'business', name: '业务应用', active: false },
                { code: 'experiment', name: '实验管理', active: false },
                { code: 'workflow', name: '流程中心', active: false }
              ]
            }
            
            // 更新应用列表 - 保留所有应用，只更新激活状态和当前应用的信息
            const updatedAppMenu = allAppMenu.map(app => {
              // 如果是当前应用，更新它的信息和激活状态
              if (app.code === currentApp.code) {
                return currentApp
              }
              // 否则将其他应用设置为非激活状态
              return { ...app, active: false }
            })
            
            // 如果应用列表中没有当前应用，添加它
            if (!updatedAppMenu.some(app => app.code === currentApp.code)) {
              updatedAppMenu.push(currentApp)
            }
            
            // 保存更新后的应用列表到localStorage
            ls.set(ALL_APPS_MENU, updatedAppMenu, 7 * 24 * 60 * 60 * 1000)
            
            console.log('💾 [user.js] 更新 localStorage 应用菜单完成，所有应用:', updatedAppMenu)
            
            // 重新生成路由
            console.log('🔄 [user.js] 开始重新生成路由，菜单数据:', menuData)
            store.dispatch('GenerateRoutes', { antDesignmenus: menuData }).then((newRouters) => {
              // 获取新的路由并添加到 router
              const addRouters = store.getters.addRouters
              console.log('🔄 [user.js] 生成的新路由:', newRouters)
              console.log('🔄 [user.js] 从 getters 获取的路由:', addRouters)
              
              // 验证路由数据
              if (!Array.isArray(addRouters) || addRouters.length === 0) {
                console.warn('⚠️ [user.js] 生成的路由为空或格式无效')
              }
              
              // 使用 router.addRoute 逐个添加路由（Vue 3 方式）
              try {
                // 先重置路由，清除所有非基础路由
                const resetRouter = () => {
                  // 获取所有路由
                  const routes = router.getRoutes()
                  
                  // 找出动态添加的路由并移除
                  routes.forEach(route => {
                    const name = route.name
                    if (name && name !== 'login' && name !== '404' && name !== '403' && name !== 'BasicLayout') {
                      router.removeRoute(name)
                    }
                  })
                  console.log('🔄 [user.js] 路由已重置')
                }
                
                // 重置路由后添加新路由
                resetRouter()
                
                // 首先提交菜单数据，确保菜单更新在路由更新之前
                console.log('📋 [user.js] 首先提交菜单数据到 SET_MENUS:', menuData)
                store.commit('SET_MENUS', menuData)
                
                // 添加新的路由
                addRouters.forEach((route, index) => {
                  console.log(`🔄 [user.js] 添加路由 ${index + 1}:`, route)
                  router.addRoute(route)
                })
                
                // 强制触发当前路由更新以反映菜单变化
                const currentPath = router.currentRoute.value.path
                console.log('� [user.js] 当前路径:', currentPath)
                
                // 触发一个路由刷新，让组件重新获取更新后的菜单
                router.replace({ path: '/refresh-router', query: { redirect: currentPath } })
                  .catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                      console.error('路由刷新失败:', err)
                    }
                  })
                
                console.log('✅ [user.js] 应用菜单切换成功')
                resolve(response)
              } catch (routerError) {
                console.error('❌ [user.js] 添加路由失败:', routerError)
                reject(routerError)
              }
            }).catch(error => {
              console.error('❌ [user.js] 生成路由失败:', error)
              reject(error)
            })
          } else {
            const errorMsg = response.message || '菜单切换接口返回失败'
            console.error('❌ [user.js]', errorMsg)
            reject(new Error(errorMsg))
          }
        }).catch(error => {
          console.error('❌ [user.js] 菜单切换接口调用失败:', error)
          reject(error)
        })
      })
    }
  }
}

export default user
