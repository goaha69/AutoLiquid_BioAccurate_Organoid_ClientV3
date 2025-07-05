import { asyncRouterMap, constantRouterMap } from '@/config/router.config'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
function hasPermission (permission, route) {
  // if (route.meta && route.meta.permission) {
  //   let flag = false
  //   for (let i = 0, len = permission.length; i < len; i++) {
  //     flag = route.meta.permission.includes(permission[i])
  //     if (flag) {
  //       return true
  //     }
  //   }
  //   return false
  // }
  return true
}

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter (routerMap, roles) {
  const accessedRouters = routerMap.filter(route => {
    if (hasPermission(roles.permissionList, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    menus: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_MENUS: (state, menus) => {
      // 确保menus是数组
      if (menus && Array.isArray(menus)) {
        // 直接更新state.menus，确保立即生效
        state.menus = [...menus]
      } else {
        state.menus = []
      }
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        const { roles, antDesignmenus } = data
        
        if (antDesignmenus && Array.isArray(antDesignmenus) && antDesignmenus.length > 0) {
          // 如果有后端菜单数据，使用generator-routers.js生成路由
          
          import('@/router/generator-routers').then(module => {
            module.generatorDynamicRouter(data).then(routers => {
              commit('SET_ROUTERS', routers)
              resolve()
            }).catch(err => {
              resolve()
            })
          })
        } else {
          // 如果没有后端菜单数据或为空，使用本地路由配置 - 与旧版项目保持一致
          const mockRoles = roles || { permissionList: [] }
          const accessedRouters = filterAsyncRouter(asyncRouterMap, mockRoles)
          commit('SET_ROUTERS', accessedRouters)
          resolve()
        }
      })
    }
  }
}

export default permission
