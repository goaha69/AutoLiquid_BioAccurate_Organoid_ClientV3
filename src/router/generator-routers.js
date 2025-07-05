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

  // 实验管理相关页面
  'ConsumableIndex': markRaw(() => import('@/views/experiment/consumable/index.vue')),
  'EquipmentIndex': markRaw(() => import('@/views/experiment/equipment/index.vue')),
  'equipment': markRaw(() => import('@/views/experiment/equipment/index.vue')), // 设备管理特殊处理
  'LiquidIndex': markRaw(() => import('@/views/experiment/liquid/index.vue')),
  'LayoutIndex': markRaw(() => import('@/views/experiment/layout/index.vue')),
  'ExpFlowIndex': markRaw(() => import('@/views/experiment/expFlow/newIndex.vue')),
  'ExpFlowCaseIndex': markRaw(() => import('@/views/experiment/expFlowCase/index.vue')),
  'ExpFlowStepIndex': markRaw(() => import('@/views/experiment/expFlowStep/newIndex.vue')),
  'ExpIncubatorStorageIndex': markRaw(() => import('@/views/experiment/expIncubatorStorage/index.vue')),
  'PlanIndex': markRaw(() => import('@/views/experiment/plan/index.vue')),
  'ExpVersionIndex': markRaw(() => import('@/views/experiment/expVersion/index.vue')),
  'ExpVideoIndex': markRaw(() => import('@/views/experiment/expVideo/index.vue')),
  'SampleInformationIndex': markRaw(() => import('@/views/experiment/sampleInformation/index.vue')),

  // 系统管理相关页面
  'UserIndex': markRaw(() => import('@/views/system/user/index.vue')),
  'RoleIndex': markRaw(() => import('@/views/system/role/index.vue')),
  'MenuIndex': markRaw(() => import('@/views/system/menu/index.vue')),
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

  // 默认首页
  'Console': markRaw(() => import('@/views/system/index/welcome.vue')),
  
  // 测试页面
  'TestPage': markRaw(() => import('@/views/test-page.vue'))
}

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
  path: '/', // 确保根路径为 '/'
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
        listToTree(antDesignmenus, childrenNav, 0);
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

      resolve(routers)
    } catch (error) {
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
    // 修复路径拼接逻辑
    let currentPath
    if (item.path) {
      currentPath = item.path
    } else if (parent && parent.path) {
      currentPath = parent.path === '/' ? item.key : `${parent.path}/${item.key}`
    } else {
      currentPath = item.key
    }
    const currentRouter = {
      path: currentPath,
      name: item.name || item.key || '',
      component: (constantRouterComponents[item.component || item.key]) || (item.component === 'RouteView' ? constantRouterComponents['RouteView'] : item.component === 'PageView' ? constantRouterComponents['PageView'] : markRaw(defineAsyncComponent({
        loader: () => {
          // 特别处理设备管理页面
          if (item.component === 'experiment/equipment' || item.component === 'equipment') {
            return import('@/views/experiment/equipment/index.vue')
          }
          
          // 改进的路径处理逻辑：支持多种路径格式和嵌套模式
          if (item.component && item.component.includes('/')) {
            // 处理形如 'system/user' 的路径
            return new Promise((resolve, reject) => {
              import(`@/views/${item.component}.vue`)
                .then(component => resolve(component))
                .catch(() => {
                  // 尝试加载 index.vue
                  import(`@/views/${item.component}/index.vue`)
                    .then(component => resolve(component))
                    .catch(() => {
                      // 最后尝试404
                      import('@/views/system/exception/404.vue').then(resolve)
                    })
                })
            })
          } else if (item.component) {
            // 处理形如 'user' 的路径
            return new Promise((resolve, reject) => {
              import(`@/views/${item.component}/index.vue`)
                .then(component => resolve(component))
                .catch(() => {
                  // 尝试直接加载.vue文件
                  import(`@/views/${item.component}.vue`)
                    .then(component => resolve(component))
                    .catch(() => {
                      // 最后尝试404
                      import('@/views/system/exception/404.vue').then(resolve)
                    })
                })
            })
          } else {
            return import('@/views/system/exception/404.vue')
          }
        },
        // 添加错误处理和加载状态
        onError: (error) => {
          // 组件加载错误处理
        },
        loadingComponent: {
          template: '<div class="loading-component">正在加载组件...</div>'
        },
        delay: 200, // 延迟显示加载组件的时间
        timeout: 10000 // 超时时间
      }))),
      meta: {
        title: title,
        icon: icon || undefined,
        target: target,
        link: link,
        keepAlive: keepAlive
      },
      hidden: item.hidden
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
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId) => {
  // 过滤当前父级下的菜单项
  const currentLevelMenus = list.filter(item => item.pid == parentId);
  
  if (currentLevelMenus.length === 0) {
    return;
  }
  
  // 不进行分组，直接处理每个菜单项，避免路径冲突导致的分组错误
  // 按照菜单项的优先级排序
  const sortedMenus = currentLevelMenus.sort((a, b) => {
    // 首先按hidden排序，显示的菜单优先
    if (a.hidden !== b.hidden) {
      return a.hidden ? 1 : -1;
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

  // 用于记录已经处理过的菜单ID，避免重复
  const processedIds = new Set();
  
  // 处理每个菜单项
  sortedMenus.forEach((item, index) => {
    // 如果已经处理过，跳过
    if (processedIds.has(item.id)) {
      return;
    }
    
    // 标记为已处理
    processedIds.add(item.id);
    
    // 构建当前菜单项
    const menuItem = {
      ...item,
      key: item.key || item.name || item.id,
      children: []
    };
    
    // 递归查找子菜单
    listToTree(list, menuItem.children, item.id);
    
    // 如果没有子菜单，删除 children 属性
    if (menuItem.children.length === 0) {
      delete menuItem.children;
    }
    
    // 添加到当前树中
    tree.push(menuItem);
  });
}
