/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { constantRouterMap } from '@/config/router.config'
import { generatorDynamicRouter } from '@/router/generator-routers'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    routeExclude:null,
    menus: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
      console.log("SET_ROUTERS",routers);
    },
    SET_ROUTE_EXCLUDE:(state,routers)=>{
      console.log("exclude",routers)
      let excludes=[];
      routers.forEach(item => {
        if(item.meta && !item.meta.keepAlive){
          excludes.push(item.name);
        }
      });
      state.routeExclude = excludes
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus
      // 使用与旧项目一致的日志格式
      console.log("setMenus", menus)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      console.log("GenerateRoutes1",data)
      return new Promise((resolve, reject) => {
        generatorDynamicRouter(data).then(routers => {
          console.log("GenerateRoutes2",routers)
          commit('SET_ROUTERS', routers)
          resolve(routers)
        }).catch(err => {
          console.error('生成路由失败:', err)
          reject(err)
        })
      })
    },
    SetRouteExClude ({ commit }, routers){
      console.log("SetRouteClude",routers)
      commit('SET_ROUTE_EXCLUDE', routers)
    },
    setMenus ({ commit }, menus) {
      console.log("setMenus", menus)
      commit('SET_MENUS', menus)
    }
  }
}

export default permission
