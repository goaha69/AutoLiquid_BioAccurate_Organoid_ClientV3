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
      console.log('🔍 Store初始化时读取的token:', token)
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
      console.log('🔧 Store SET_TOKEN:', token)
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
        console.log('🔐 开始登录请求...', userInfo)
        login(userInfo).then(response => {
          console.log('🔐 登录接口返回:', response)
          if (!response.success) {
            console.log('❌ 登录失败，原因:', response.message)
            reject(response.message)
            return
          }
          const result = response.data
          console.log('🔑 提取的 token 数据:', result)
          
          // 保存到 localStorage
          ls.set(ACCESS_TOKEN, result, 7 * 24 * 60 * 60 * 1000)
          
          // 验证是否保存成功
          const savedToken = ls.get(ACCESS_TOKEN)
          console.log('💾 保存后立即读取的 token:', savedToken)
          
          // 提交到 store
          commit('SET_TOKEN', result)
          console.log('✅ 已提交 token 到 store')
          
          resolve()
        }).catch(error => {
          console.error('❌ 登录接口调用失败:', error)
          reject('后端未启动或代理错误')
        })
      })
    },

    // 获取用户信息
    GetInfo({
      commit
    }) {
      return new Promise((resolve, reject) => {
        console.log('🔄 开始获取用户信息...')
        getLoginUser().then(response => {
          console.log('👤 获取用户信息响应:', response)
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
                console.error('预览头像错误：' + err.message)
              })
            }
            console.log('✅ 用户信息设置完成')
            resolve(data)
          } else {
            console.error('❌ 获取用户信息失败:', response.message)
            reject(new Error(response.message))
          }
        }).catch(error => {
          console.error('❌ 获取用户信息接口调用失败:', error)
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
        console.log('🚪 开始登出...')
        logout(state.token).then(() => {
          console.log('✅ 登出接口调用成功')
        }).catch(err => {
          console.log('⚠️ 登出接口调用失败，但继续清理本地数据:', err.message)
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          ls.remove(ACCESS_TOKEN)
          ls.remove(ALL_APPS_MENU)
          console.log('🧹 本地数据清理完成')
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
            
            // 参考旧项目的逻辑：构建新的应用对象
            const apps = {
              'code': application.code,
              'name': application.name,
              'active': true,
              'menu': menuData
            }
            
            // 参考旧项目：先获取所有应用，将它们设为非活跃状态
            const allAppMenu = ls.get(ALL_APPS_MENU, [])
            const newFalseAllAppMenu = []
            allAppMenu.forEach(item => {
              if (item.active) {
                item.active = false
              }
              newFalseAllAppMenu.push(item)
            })
            
            // 参考旧项目：设置为非活跃状态
            ls.set(ALL_APPS_MENU, newFalseAllAppMenu, 7 * 24 * 60 * 60 * 1000)
            
            // 参考旧项目：创建新的当前应用数组并覆盖 ALL_APPS_MENU
            const applicationR = []
            applicationR.push(apps)
            ls.set(ALL_APPS_MENU, applicationR, 7 * 24 * 60 * 60 * 1000)
            
            console.log('💾 [user.js] 更新 localStorage 应用菜单完成，当前应用:', applicationR)
            
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
                addRouters.forEach((route, index) => {
                  console.log(`🔄 [user.js] 添加路由 ${index + 1}:`, route)
                  router.addRoute(route)
                })
                
                console.log('✅ [user.js] 应用菜单切换成功')
                resolve(response)
              } catch (routerError) {
                console.error('❌ [user.js] 添加路由失败:', routerError)
                reject(routerError)
              }
            }).catch(err => {
              console.error('❌ [user.js] 生成路由失败:', err)
              reject(err)
            })
          } else {
            const errorMsg = response.message || '菜单切换失败'
            console.error('❌ [user.js] 菜单切换失败:', errorMsg)
            reject(new Error(errorMsg))
          }
        }).catch(error => {
          console.error('❌ [user.js] 菜单切换接口调用失败:', error)
          // 提供更友好的错误信息
          let errorMessage = '菜单切换失败'
          if (error.response) {
            errorMessage = `服务器错误: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`
          } else if (error.request) {
            errorMessage = '网络连接失败，请检查网络或后端服务'
          } else {
            errorMessage = error.message || '未知错误'
          }
          reject(new Error(errorMessage))
        })
      })
    }
  }
}

export default user
