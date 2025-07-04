import Menu from 'ant-design-vue/es/menu'
import { message } from 'ant-design-vue/es'
import { 
  HomeOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  UserOutlined, 
  TeamOutlined, 
  AppstoreOutlined,
  FileOutlined,
  FolderOutlined
} from '@ant-design/icons-vue'

// 图标映射表，用于将字符串类型的图标名称映射到相应的组件
const iconMap = {
  'home': HomeOutlined,
  'dashboard': DashboardOutlined,
  'setting': SettingOutlined,
  'user': UserOutlined,
  'team': TeamOutlined,
  'appstore': AppstoreOutlined,
  'file': FileOutlined,
  'folder': FolderOutlined
}

export default {
  name: 'SMenu',
  props: {
    menu: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  computed: {
    rootSubmenuKeys () {
      const keys = []
      const menuArray = Array.isArray(this.menu) ? this.menu : []
      menuArray.forEach(item => keys.push(item.path))
      return keys
    }
  },
  mounted () {
    this.updateMenu()
  },
  watch: {
    collapsed (val) {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    },
    $route: function () {
      this.updateMenu()
    }
  },
  methods: {
    // select menu item
    onOpenChange (openKeys) {
      // 在水平模式下时执行，并且不再执行后续
      if (this.mode === 'horizontal') {
        this.openKeys = openKeys
        return
      }
      // 非水平模式时
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key))
      if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    onSelect ({ item, key, selectedKeys }) {
      console.log('🎯 [Menu] 菜单点击事件:', { item, key, selectedKeys })
      console.log('🎯 [Menu] 当前路由:', this.$route.path)
      
      this.selectedKeys = selectedKeys
      this.$emit('select', { item, key, selectedKeys })
      
      // 手动处理路由跳转
      if (key && key !== this.$route.path) {
        console.log('🔄 [Menu] 准备跳转到路由:', key)
        
        // 检查路由是否存在
        const router = this.$router
        const routes = router.getRoutes()
        const targetRoute = routes.find(route => route.path === key)
        
                 if (!targetRoute) {
           console.error('❌ [Menu] 路由不存在:', key)
           console.log('📋 [Menu] 当前所有路由:', routes.map(r => r.path))
           message.error(`路由不存在: ${key}`)
           return
         }
        
        console.log('✅ [Menu] 找到目标路由:', targetRoute)
        
        this.$router.push(key).catch(err => {
          console.error('❌ [Menu] 路由跳转失败:', err)
          
          // 如果是重复导航错误，忽略
          if (err.name === 'NavigationDuplicated') {
            console.log('⚠️ [Menu] 重复导航，忽略错误')
            return
          }
          
          // 尝试使用 name 进行路由跳转
          if (targetRoute.name) {
            console.log('🔄 [Menu] 尝试使用 name 跳转:', targetRoute.name)
                         this.$router.push({ name: targetRoute.name }).catch(nameErr => {
               console.error('❌ [Menu] 使用 name 跳转也失败:', nameErr)
               message.error(`页面跳转失败: ${err.message}`)
             })
           } else {
             console.error('❌ [Menu] 路由跳转失败且无法使用 name 跳转:', err)
             message.error(`页面跳转失败: ${err.message}`)
           }
        })
      }
    },
    updateMenu () {
      const routes = this.$route.matched.concat()
      const { hidden } = this.$route.meta || {}
      if (routes.length >= 3 && hidden) {
        routes.pop()
        this.selectedKeys = [routes[routes.length - 1].path]
      } else {
        this.selectedKeys = routes.length > 0 ? [routes.pop().path] : []
      }
      const openKeys = []
      if (this.mode === 'inline') {
        routes.forEach(item => {
          openKeys.push(item.path)
        })
      }

      this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
    },

    // render
    renderItem (menu) {
      // 检查菜单项是否应该隐藏
      if (menu.hidden || menu.hideInMenu) {
        return null
      }
      return menu.children && !menu.hideChildrenInMenu ? this.renderSubMenu(menu) : this.renderMenuItem(menu)
    },
    renderMenuItem (menu) {
      const target = (menu.meta && menu.meta.target) || null
      const CustomTag = target && 'a' || 'router-link'
      
      // 优先使用path进行跳转，如果没有path则使用name
      const routeTarget = menu.path ? { path: menu.path } : { name: menu.name }
      const props = { to: routeTarget }
      const attrs = { href: menu.path, target: (menu.meta && menu.meta.target) }

      if (menu.children && menu.hideChildrenInMenu) {
        // 把有子菜单的 并且 父菜单是要隐藏子菜单的
        // 都给子菜单增加一个 hidden 属性
        // 用来给刷新页面时， selectedKeys 做控制用
        menu.children.forEach(item => {
          item.meta = Object.assign(item.meta || {}, { hidden: true })
        })
      }

      return (
        <Menu.Item key={menu.path}>
          <CustomTag {...(target ? { attrs } : { props })}>
            {this.renderIcon(menu.meta && menu.meta.icon)}
            <span>{menu.meta && menu.meta.title}</span>
          </CustomTag>
        </Menu.Item>
      )
    },
    renderSubMenu (menu) {
      const itemArr = []
      if (!menu.hideChildrenInMenu) {
        menu.children.forEach(item => {
          // 过滤隐藏的子菜单项
          if (!item.hidden && !item.hideInMenu) {
            itemArr.push(this.renderItem(item))
          }
        })
      }
      return (
        <Menu.SubMenu key={menu.path}>
          {{
            title: () => (
              <span>
                {this.renderIcon(menu.meta && menu.meta.icon)}
                <span>{menu.meta && menu.meta.title}</span>
              </span>
            ),
            default: () => itemArr
          }}
        </Menu.SubMenu>
      )
    },
    renderIcon (icon) {
      if (icon === 'none' || icon === undefined) {
        return null
      }
      
      // 处理字符串类型的图标
      if (typeof icon === 'string') {
        const IconComponent = iconMap[icon.toLowerCase()]
        if (IconComponent) {
          return <IconComponent />
        } else {
          // 默认图标
          return <AppstoreOutlined />
        }
      }
      
      // 处理对象类型的图标（自定义组件）
      if (typeof icon === 'object') {
        const Component = icon
        return <Component />
      }
      
      return null
    }
  },

  render () {
    const dynamicProps = {
      mode: this.mode,
      theme: this.theme,
      openKeys: this.openKeys,
      selectedKeys: this.selectedKeys,
      onOpenChange: this.onOpenChange,
      onSelect: this.onSelect
    }

    // 确保menu是数组
    const menuArray = Array.isArray(this.menu) ? this.menu : []

    const menuTree = menuArray.map(item => {
      // 过滤隐藏的菜单项
      if (item.hidden || item.hideInMenu) {
        return null
      }
      return this.renderItem(item)
    }).filter(Boolean) // 过滤掉null值

    return (<Menu {...dynamicProps}>{menuTree}</Menu>)
  }
}
