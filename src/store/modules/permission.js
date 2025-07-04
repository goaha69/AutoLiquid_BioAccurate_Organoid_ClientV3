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
      console.log("SET_ROUTERS",routers)
    },
    SET_MENUS: (state, menus) => {
      console.log('📋 [permission.js] SET_MENUS 被调用，新菜单数据:', menus)
      state.menus = menus
      console.log('📋 [permission.js] state.menus 更新完成:', state.menus)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
       console.log("GenerateRoutes",data)
      return new Promise(resolve => {
        const { roles, antDesignmenus } = data
        // 兼容两种传参方式：roles 或 antDesignmenus
        if (roles) {
          // 原有的基于角色权限的路由过滤
          const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
          commit('SET_ROUTERS', accessedRouters)
        } else if (antDesignmenus) {
          // 基于后端返回的菜单直接生成路由
          console.log('🔄 [permission.js] 使用 antDesignmenus 生成路由:', antDesignmenus)
          // 参考旧项目，这里应该传递一个模拟的roles对象
          const mockRoles = { permissionList: [] }
          const accessedRouters = filterAsyncRouter(asyncRouterMap, mockRoles)
          commit('SET_ROUTERS', accessedRouters)
          // 设置菜单数据
          console.log('🔄 [permission.js] 调用 SET_MENUS，菜单数据:', antDesignmenus)
          commit('SET_MENUS', antDesignmenus)
        } else {
          // 默认情况，使用所有异步路由
          const mockRoles = { permissionList: [] }
          const accessedRouters = filterAsyncRouter(asyncRouterMap, mockRoles)
          commit('SET_ROUTERS', accessedRouters)
        }
        resolve()
      })
    },
    setMenus ({ commit }, menus) {
      commit('SET_MENUS', menus)
    }
  }
}

export default permission
