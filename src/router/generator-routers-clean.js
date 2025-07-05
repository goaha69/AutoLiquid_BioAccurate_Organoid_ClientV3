import { constantRouterMap } from '@/config/router.config'
import { BACKEND_MENU_DATA } from '@/store/mutation-types'
import ls from '@/utils/storage'

// 前端组件列表
const constantRouterComponents = {
  // 基础布局
  'BasicLayout': () => import('@/layouts/BasicLayout'),
  'BlankLayout': () => import('@/layouts/BlankLayout'),
  'UserLayout': () => import('@/layouts/UserLayout'),
  'RouteView': () => import('@/layouts/RouteView'),
  'PageView': () => import('@/layouts/PageView'),

  // 仪表盘
  'DashboardWorkplace': () => import('@/views/dashboard/Workplace'),
  'DashboardAnalysis': () => import('@/views/dashboard/Analysis'),
  'DashboardMonitor': () => import('@/views/dashboard/Monitor'),

  // 设备管理相关组件
  'Equipment': () => import('@/views/equipment/equipment'),
  'EquipmentList': () => import('@/views/equipment/equipment'),
  'device': () => import('@/views/equipment/equipment'),
  'equipment': () => import('@/views/equipment/equipment'),

  // 默认首页
  'welcome': () => import('@/views/dashboard/welcome'),
  'Welcome': () => import('@/views/dashboard/welcome'),
  'Workplace': () => import('@/views/dashboard/Workplace'),

  // 系统设置
  'settings': () => import('@/views/system/account/settings/Index'),
  'Settings': () => import('@/views/system/account/settings/Index')
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = (data) => {
  return new Promise((resolve, reject) => {
    // 从 localStorage 获取菜单数据
    let antDesignmenus = []
    try {
      const menuData = ls.get(BACKEND_MENU_DATA)
      if (menuData && Array.isArray(menuData)) {
        antDesignmenus = menuData
      } else {
        // 使用默认菜单
        const defaultMenus = [{
          id: 1,
          pid: 0,
          level: 1,
          name: '首页',
          key: 'welcome',
          path: '/welcome',
          component: 'RouteView',
          icon: 'dashboard',
          children: []
        }]
        antDesignmenus = defaultMenus
      }
      
      if (antDesignmenus && antDesignmenus.length > 0) {
        // 构建树形结构
        const childrenNav = listToTree(antDesignmenus, {
          idKey: 'id',
          parentKey: 'pid',
          childrenKey: 'children'
        })

        // 如果没有一级菜单，添加默认welcome路由
        if (childrenNav.length === 0) {
          childrenNav.push({
            name: 'welcome',
            path: '/welcome',
            component: 'welcome',
            meta: { title: '首页', icon: 'home' }
          })
        }

        // 转换为router格式
        const routers = generator(childrenNav)
        const routersWithoutBasic = routers

        resolve(routersWithoutBasic)
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, parent) => {
  return routerMap.map(item => {
    const { title, show, hideChildren, hiddenHeaderContent, target, icon } = item.meta || {}
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.path || `${parent && parent.path || ''}/${item.key}`,
      // 路由名称，建议唯一
      name: item.name || item.key || '',
      // 该路由对应页面的 组件 :方案1
      // component: constantRouterComponents[item.component || item.key],
      // 该路由对应页面的 组件 :方案2 (动态加载)
      component: (constantRouterComponents[item.component || item.key]) || (() => import(`@/views/${item.component}`)),

      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: title || item.name,
        icon: icon || item.icon || undefined,
        hiddenHeaderContent: hiddenHeaderContent,
        target: target,
        permission: item.name
      }
    }
    // 是否设置了隐藏菜单
    if (show === false) {
      currentRouter.hidden = true
    }
    // 是否设置了隐藏子菜单
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param options 配置
 * @returns {*} 树形结构数据
 */
export const listToTree = (list, options = {}) => {
  const { idKey = 'id', parentKey = 'pid', childrenKey = 'children' } = options
  
  if (!Array.isArray(list)) {
    return []
  }

  // 创建id到item的映射
  const itemMap = {}
  list.forEach(item => {
    itemMap[item[idKey]] = { ...item, [childrenKey]: [] }
  })

  const tree = []
  
  list.forEach(item => {
    const currentItem = itemMap[item[idKey]]
    const parentId = item[parentKey]
    
    if (parentId === 0 || parentId === null || parentId === undefined) {
      // 根节点
      tree.push(currentItem)
    } else if (itemMap[parentId]) {
      // 找到父节点，添加到父节点的children中
      itemMap[parentId][childrenKey].push(currentItem)
    }
  })
  
  return tree
}
