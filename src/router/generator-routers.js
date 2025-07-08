// 修复版本 generator-routers.js - 简化组件导入逻辑
import { BasicLayout, BlankLayout, PageView, RouteView, Iframe } from '@/layouts'
import { markRaw, defineAsyncComponent } from 'vue'

// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: markRaw(BasicLayout),
  BlankLayout: markRaw(BlankLayout),
  RouteView: markRaw(RouteView),
  PageView: markRaw(PageView),
  Iframe: markRaw(Iframe),
  '403': markRaw(() => import('@/views/system/exception/403.vue')),
  '404': markRaw(() => import('@/views/system/exception/404.vue')),
  '500': markRaw(() => import('@/views/system/exception/500.vue')),

  'Workplace': markRaw(() => import('@/views/system/dashboard/Workplace.vue')),
  'welcome': markRaw(() => import('@/views/system/index/welcome.vue')),
  // account
  'AccountCenter': markRaw(() => import('@/views/system/account/center/Index.vue')),
  'AccountSettings': markRaw(() => import('@/views/system/account/settings/Index.vue')),
  'BaseSettings': markRaw(() => import('@/views/system/account/settings/BaseSetting.vue')),
  'SecuritySettings': markRaw(() => import('@/views/system/account/settings/Security.vue')),
  'CustomSettings': markRaw(() => import('@/views/system/account/settings/Custom.vue')),
  'BindingSettings': markRaw(() => import('@/views/system/account/settings/Binding.vue')),
  'NotificationSettings': markRaw(() => import('@/views/system/account/settings/Notification.vue')),

  // 实验管理相关页面 - 根据后端实际返回的component字段精确匹配
  // 后端返回的完整路径格式：experiment/xxx/index 或 experiment/xxx/newIndex
  'experiment/equipment/index': markRaw(() => import('@/views/experiment/equipment/index.vue')),
  'experiment/layout/index': markRaw(() => import('@/views/experiment/layout/index.vue')),
  'experiment/consumable/index': markRaw(() => import('@/views/experiment/consumable/index.vue')),
  'experiment/liquid/index': markRaw(() => import('@/views/experiment/liquid/index.vue')),
  'experiment/expFlowStep/newIndex': markRaw(() => import('@/views/experiment/expFlowStep/index.vue')),
  'experiment/expFlow/newIndex': markRaw(() => import('@/views/experiment/expFlow/index.vue')),
  'experiment/expFlowCase/index': markRaw(() => import('@/views/experiment/expFlowCase/index.vue')),
  'experiment/gantt/ganttView': markRaw(() => import('@/views/experiment/gantt/index.vue')),
  'experiment/expIncubatorStorage/index': markRaw(() => import('@/views/experiment/expIncubatorStorage/index.vue')),
  'experiment/plan/index': markRaw(() => import('@/views/experiment/plan/index.vue')),
  'experiment/expVideo/index': markRaw(() => import('@/views/experiment/expVideo/index.vue')),
  'experiment/sampleInformation/index': markRaw(() => import('@/views/experiment/sampleInformation/index.vue')),
  'experiment/expVersion/index': markRaw(() => import('@/views/experiment/expVersion/index.vue')),
  
  // 兼容性映射 - 短路径格式
  'equipment': markRaw(() => import('@/views/experiment/equipment/index.vue')),
  'layout': markRaw(() => import('@/views/experiment/layout/index.vue')),
  'consumable': markRaw(() => import('@/views/experiment/consumable/index.vue')),
  'liquid': markRaw(() => import('@/views/experiment/liquid/index.vue')),
  'expFlowStep': markRaw(() => import('@/views/experiment/expFlowStep/index.vue')),
  'expFlow': markRaw(() => import('@/views/experiment/expFlow/index.vue')),
  'expFlowCase': markRaw(() => import('@/views/experiment/expFlowCase/index.vue')),
  'gantt': markRaw(() => import('@/views/experiment/gantt/index.vue')),
  'expIncubatorStorage': markRaw(() => import('@/views/experiment/expIncubatorStorage/index.vue')),
  'plan': markRaw(() => import('@/views/experiment/plan/index.vue')),
  'expVideo': markRaw(() => import('@/views/experiment/expVideo/index.vue')),
  'sampleInformation': markRaw(() => import('@/views/experiment/sampleInformation/index.vue')),
  'expVersion': markRaw(() => import('@/views/experiment/expVersion/index.vue')),
  
  // Index后缀格式兼容
  'EquipmentIndex': markRaw(() => import('@/views/experiment/equipment/index.vue')),
  'LayoutIndex': markRaw(() => import('@/views/experiment/layout/index.vue')),
  'ConsumableIndex': markRaw(() => import('@/views/experiment/consumable/index.vue')),
  'LiquidIndex': markRaw(() => import('@/views/experiment/liquid/index.vue')),
  'ExpFlowStepIndex': markRaw(() => import('@/views/experiment/expFlowStep/index.vue')),
  'ExpFlowIndex': markRaw(() => import('@/views/experiment/expFlow/index.vue')),
  'ExpFlowCaseIndex': markRaw(() => import('@/views/experiment/expFlowCase/index.vue')),
  'GanttIndex': markRaw(() => import('@/views/experiment/gantt/index.vue')),
  'ExpIncubatorStorageIndex': markRaw(() => import('@/views/experiment/expIncubatorStorage/index.vue')),
  'PlanIndex': markRaw(() => import('@/views/experiment/plan/index.vue')),
  'ExpVideoIndex': markRaw(() => import('@/views/experiment/expVideo/index.vue')),
  'SampleInformationIndex': markRaw(() => import('@/views/experiment/sampleInformation/index.vue')),
  'ExpVersionIndex': markRaw(() => import('@/views/experiment/expVersion/index.vue')),
  'SampleInformationIndex': markRaw(() => import('@/views/experiment/sampleInformation/index.vue')),
  'ExpVersionIndex': markRaw(() => import('@/views/experiment/expVersion/index.vue')),

  // 系统管理相关页面
  'UserIndex': markRaw(() => import('@/views/system/user/index.vue')),
  'RoleIndex': markRaw(() => import('@/views/system/role/index.vue')),
  'MenuIndex': markRaw(() => import('@/views/system/menu/index.vue')),
  // 兼容后端返回短名称
  'app': markRaw(() => import('@/views/system/app/index.vue')),
  'app/index': markRaw(() => import('@/views/system/app/index.vue')),
  'menu': markRaw(() => import('@/views/system/menu/index.vue')),
  'menu/index': markRaw(() => import('@/views/system/menu/index.vue')),
  'OrgIndex': markRaw(() => import('@/views/system/org/index.vue')),
  'PosIndex': markRaw(() => import('@/views/system/pos/index.vue')),
  'DictIndex': markRaw(() => import('@/views/system/dict/index.vue')),
  'DictTypeIndex': markRaw(() => import('@/views/system/dict/index.vue')), // v3项目中没有独立的dictType目录
  'NoticeIndex': markRaw(() => import('@/views/system/notice/index.vue')),
  'ConfigIndex': markRaw(() => import('@/views/system/config/index.vue')),
  'LogIndex': markRaw(() => import('@/views/system/log/exlog/index.vue')), // v3项目中log分为exlog/oplog/vislog
  'VisLogIndex': markRaw(() => import('@/views/system/log/vislog/index.vue')),
  'OpLogIndex': markRaw(() => import('@/views/system/log/oplog/index.vue')),
  'OnlineUserIndex': markRaw(() => import('@/views/system/onlineUser/index.vue')),
  'TimersIndex': markRaw(() => import('@/views/system/timers/index.vue')),
  'SmsIndex': markRaw(() => import('@/views/system/sms/index.vue')),
  'AppIndex': markRaw(() => import('@/views/system/app/index.vue')),
  'TenantIndex': markRaw(() => import('@/views/system/tenant/index.vue')),
  'sys_app_mgr': markRaw(() => import('@/views/system/app/index.vue')),
  'sys_menu_mgr': markRaw(() => import('@/views/system/menu/index.vue')),
  'system/app/index': markRaw(() => import('@/views/system/app/index.vue')),
  'system/menu/index': markRaw(() => import('@/views/system/menu/index.vue')),

  // 默认首页
  'Console': markRaw(() => import('@/views/system/index/welcome.vue')),
  
  // 测试页面
  'TestPage': markRaw(() => import('@/views/test-page.vue'))
}

// 使用 webpack 提供的 `require.context` 递归扫描 `src/views` 目录下的所有 .vue 文件
// 这样可以在不依赖 Vite `import.meta.glob` 的情况下，同样获得批量组件映射能力
// ⚠️ 注意：此文件位于  src/router  目录下，因此相对路径为  ../views
// 返回值是一个函数，key 形如 "./experiment/liquid/index.vue"
const dynamicViewsModules = require.context('../views', true, /\.vue$/);

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '/:pathMatch(.*)*', 
  redirect: '/welcome', 
  hidden: true
}
// 个人中心页面
const userAccount = [
  // account
  {
    'name': 'account',
    'pid': 0,
    'id': 10028,
    'meta': {
      'title': '个人页',
      'icon': 'user',
      'show': false
    },
    'redirect': '/account/center',
    'component': 'RouteView'
  },
  {
    'name': 'center',
    'pid': 10028,
    'id': 10029,
    'meta': {
      'title': '个人中心',
      'show': false
    },
    'component': 'AccountCenter'
  },
  // 特殊三级菜单
  {
    'name': 'settings',
    'pid': '10028',
    'id': '10030',
    'meta': {
      'title': '个人设置',
      'hideHeader': true,
      'hideChildren': true,
      'show': false
    },
    'redirect': '/account/settings/base',
    'component': 'AccountSettings'
  },
  {
    'name': 'BaseSettings',
    'path': '/account/settings/base',
    'pid': 10030,
    'id': 10031,
    'meta': {
      'title': '基本设置',
      'show': false
    },
    'component': 'BaseSettings'
  },
  {
    'name': 'SecuritySettings',
    'path': '/account/settings/security',
    'pid': 10030,
    'id': 10032,
    'meta': {
      'title': '安全设置',
      'show': false
    },
    'component': 'SecuritySettings'
  },
  {
    'name': 'CustomSettings',
    'path': '/account/settings/custom',
    'pid': 10030,
    'id': 10033,
    'meta': {
      'title': '个性化设置',
      'show': false
    },
    'component': 'CustomSettings'
  },
  {
    'name': 'BindingSettings',
    'path': '/account/settings/binding',
    'pid': 10030,
    'id': 10034,
    'meta': {
      'title': '账户绑定',
      'show': false
    },
    'component': 'BindingSettings'
  },
  {
    'name': 'NotificationSettings',
    'path': '/account/settings/notification',
    'pid': 10030,
    'id': 10034,
    'meta': {
      'title': '新消息通知',
      'show': false
    },
    'component': 'NotificationSettings'
  },
  {
    'name': 'Console',
    'path': 'welcome', // 不能以/开头
    'pid': 0,
    'id': 183183,
    'meta': {
      'title': '首页',
      'show': false
    },
    'component': 'Console'
  }
]

// 修复 /welcome 路由注册逻辑
const rootRouter = {
  key: '',
  name: 'MenuIndex.vue',
  path: '', // 与Vue2项目保持一致，使用空字符串
  component: 'BasicLayout',
  redirect: '/welcome',
  meta: {
    title: '首页'
  },
  children: [
    {
      name: 'Console',
      path: 'welcome', // 子路由 path 不以 '/' 开头
      component: 'Console',
      meta: {
        title: '首页',
        show: true
      }
    }
  ]
};

/**
 * 将菜单数据转换为菜单组件需要的格式
 * @param {Array} menuData 菜单数据
 * @returns {Array} 转换后的菜单数据
 */
const convertToMenuFormat = (menuData) => {
  if (!Array.isArray(menuData)) return []
  
  return menuData.map(item => {
    const converted = {
      path: item.path,
      name: item.name,
      meta: {
        title: item.meta?.title || item.title,
        icon: item.meta?.icon || item.icon,
        target: item.meta?.target,
        link: item.meta?.link,
        keepAlive: item.meta?.keepAlive
      },
      hidden: item.hidden
    }
    
    // 如果有子菜单，递归转换
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      converted.children = convertToMenuFormat(item.children)
    }
    
    return converted
  })
}

/**
 * 动态生成菜单
 * @param data
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const { antDesignmenus } = data
      const menuNav = []
      const childrenNav = []

      // 验证输入数据
      if (!antDesignmenus || !Array.isArray(antDesignmenus)) {
        // 如果没有菜单数据，创建默认菜单
        const defaultMenus = [
          {
            name: 'welcome',
            path: '/welcome',
            component: 'welcome',
            meta: { title: '首页', icon: 'home' },
            pid: 0
          },
          {
            name: 'dashboard',
            path: '/dashboard',
            component: 'RouteView',
            meta: { title: '仪表盘', icon: 'dashboard' },
            pid: 0,
            children: [
              {
                name: 'workplace',
                path: '/dashboard/workplace',
                component: 'Workplace',
                meta: { title: '工作台' }
              }
            ]
          }
        ]
        
        listToTree(defaultMenus, childrenNav, 0)
      } else {
        // 遍历后端返回的菜单数据，按 PID 构建树形结构
        console.log('🔍 [generatorDynamicRouter] 后端菜单数据:', antDesignmenus);
        console.log('🔍 [generatorDynamicRouter] 开始构建树形结构...');
        listToTree(antDesignmenus, childrenNav, 0);
        console.log('🔍 [generatorDynamicRouter] 构建完成，childrenNav:', childrenNav);
      }
  
      // 添加静态个人中心页面
      listToTree(userAccount, childrenNav, 0)
      
      // 确保welcome路由存在
      const hasWelcome = childrenNav.some(nav => 
        nav.path === '/welcome' || 
        nav.path === 'welcome' || 
        (nav.children && nav.children.some(child => child.path === 'welcome' || child.path === '/welcome'))
      )
      
      if (!hasWelcome) {
        childrenNav.unshift({
          name: 'welcome',
          path: 'welcome', // 不要以 / 开头，因为会作为rootRouter的子路由
          component: 'Console',
          meta: { title: '首页', icon: 'home' }
        })
      }

      rootRouter.children = childrenNav
      menuNav.push(rootRouter)

      const routers = generator(menuNav)
      routers.push(notFoundRouter)

      // 同时设置菜单数据到store中，供BasicLayout使用
      import('@/store').then(storeModule => {
        const store = storeModule.default
        if (store && store.commit) {
          // 直接使用childrenNav，保持原始的层级结构
          console.log('📋 [generator-routers] 原始childrenNav数据:', childrenNav)
          store.commit('SET_MENUS', childrenNav)
          console.log('📋 [generator-routers] 设置菜单数据到store:', childrenNav)
        }
      }).catch(err => {
        console.warn('⚠️ [generator-routers] 无法导入store:', err)
      })

      resolve(routers)
    } catch (error) {
      console.error('❌ [generator-routers] 生成路由时出错:', error)
      reject(error);
    }
  });
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
    // eslint-disable-next-line no-unused-vars
    const { title, show, hideChildren, hiddenHeaderContent, target, icon, link, keepAlive } = item.meta || {}
    // 使用与Vue2项目完全相同的路径生成逻辑
    const currentPath = item.path || `${parent && parent.path || ''}/${item.key}`
    const currentRouter = {
      path: currentPath,
      name: item.name || item.key || '',
      component: (() => {
        const compKey = item.component || item.key

        // 1. 首先检查是否在显式预定义映射中（布局组件 / 手动登记组件）
        const predefined = constantRouterComponents[compKey]
        if (predefined) {
          return predefined
        }

        // 2. 尝试基于文件系统的自动匹配（支持两种常见路径格式）
        const possiblePaths = [
          `./${compKey}.vue`, 
          `./${compKey}/index.vue`,
          `./system/${compKey}.vue`,
          `./system/${compKey}/index.vue`
        ]
        
        // 如果 compKey 已经包含路径分隔符，直接尝试
        if (compKey.includes('/')) {
          possiblePaths.unshift(`./${compKey}.vue`)
          // 如果不是以 index 结尾，也尝试添加 index
          if (!compKey.endsWith('/index')) {
            possiblePaths.unshift(`./${compKey}/index.vue`)
          }
        }
        
        for (const p of possiblePaths) {
          if (dynamicViewsModules.keys().includes(p)) {
            const asyncComp = markRaw(defineAsyncComponent(() => Promise.resolve(dynamicViewsModules(p)).then(m => m.default || m)))
            // 缓存，避免下次重复遍历
            constantRouterComponents[compKey] = asyncComp
            return asyncComp
          }
        }

        // 3. 未匹配到组件，回退到 404
        console.warn('⚠️ [generator-routers] 未找到组件, 返回404:', compKey)
        return constantRouterComponents['404']
      })(),
      meta: {
        title: title,
        icon: icon || undefined,
        target: target,
        link: link,
        keepAlive: keepAlive
      },
      hidden: item.hidden
    }
    
    // 调试：打印路由信息
    if (item.name === 'sys_app_mgr' || item.name === 'sys_menu_mgr') {
      console.log('🚀 [generator-routers] 生成路由:', {
        name: currentRouter.name,
        path: currentRouter.path,
        component: item.component,
        parent: parent ? parent.path : 'none'
      })
    }
    
    // 调试：打印所有生成的路由路径
    if (currentRouter.path && !currentRouter.path.startsWith('http')) {
      console.log('📍 [generator-routers] 路由路径:', currentRouter.path, 'name:', currentRouter.name)
    }
    if (show === false) {
      currentRouter.hidden = true
    }
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    item.redirect && (currentRouter.redirect = item.redirect)
    if (item.children && item.children.length > 0) {
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构 - 基于Vue2项目的实现，保持简洁和递归逻辑
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId) => {
  console.log(`🌲 [listToTree] 处理parentId=${parentId}`);
  
  // 先过滤出当前层级的菜单
  const currentLevelMenus = list.filter(item => item.pid == parentId);
  
  // 对当前层级的菜单进行排序
  const sortedMenus = currentLevelMenus.sort((a, b) => {
    // 首先按hidden排序，显示的菜单优先
    if (a.hidden !== b.hidden) {
      return a.hidden ? 1 : -1;
    }
    
    // 特殊处理实验管理模块的菜单排序
    const experimentMenuOrder = {
      'equipment': 1,      // 设备管理
      'EquipmentIndex': 1, // 设备管理（可能的组件名）
      'layout': 2,         // 布局管理
      'LayoutIndex': 2,    // 布局管理（可能的组件名）
      'consumable': 3,     // 耗材管理
      'ConsumableIndex': 3, // 耗材管理（可能的组件名）
      'liquid': 4,         // 试剂管理
      'LiquidIndex': 4,    // 试剂管理（可能的组件名）
      'expFlowStep': 5,    // 实验步骤管理
      'ExpFlowStepIndex': 5, // 实验步骤管理（可能的组件名）
      'expFlow': 6,        // 实验流程设置
      'ExpFlowIndex': 6,   // 实验流程设置（可能的组件名）
      'expFlowCase': 7,    // 实验案例管理
      'ExpFlowCaseIndex': 7, // 实验案例管理（可能的组件名）
      'gantt': 8,          // 实验跟踪
      'GanttIndex': 8,     // 实验跟踪（可能的组件名）
      'expIncubatorStorage': 9, // 培养箱存储
      'ExpIncubatorStorageIndex': 9, // 培养箱存储（可能的组件名）
      'plan': 10,          // 计划任务
      'PlanIndex': 10,     // 计划任务（可能的组件名）
      'expVideo': 11,      // 视频监控
      'ExpVideoIndex': 11, // 视频监控（可能的组件名）
      'sampleInformation': 12,  // 样品信息表
      'SampleInformationIndex': 12  // 样品信息表（可能的组件名）
    };
    
    // 检查多个可能的字段
    const getMenuKey = (item) => {
      return item.component || item.key || item.name || item.path;
    };
    
    const aKey = getMenuKey(a);
    const bKey = getMenuKey(b);
    
    // 如果两个菜单都是实验管理模块的，按照预定义顺序排序
    if (experimentMenuOrder[aKey] && experimentMenuOrder[bKey]) {
      return experimentMenuOrder[aKey] - experimentMenuOrder[bKey];
    }
    
    // 其次按应用类型排序
    const appPriority = { 'system': 1, 'manage': 2, 'expapp': 3, 'busiapp': 4, 'platform': 5, 'flowcenter': 6 };
    const aPriority = appPriority[a.application] || 999;
    const bPriority = appPriority[b.application] || 999;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    // 最后按ID排序，保证稳定性
    return (a.id || 0) - (b.id || 0);
  });

  // 使用Vue2的简洁递归逻辑
  sortedMenus.forEach(item => {
    const child = {
      ...item,
      key: item.key || item.name,
      children: []
    };
    
    // 递归查找子菜单
    listToTree(list, child.children, item.id);
    
    console.log(`📁 [listToTree] 菜单项 ${item.name || item.meta?.title} 有 ${child.children.length} 个子菜单`);
    
    // 如果没有子菜单，删除 children 属性
    if (child.children.length <= 0) {
      delete child.children;
    }
    
    // 添加到树中
    tree.push(child);
  });
}
