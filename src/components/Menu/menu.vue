<template>
  <div>
    <!-- 菜单为空时的提示 -->
    <div v-if="!menu || menu.length === 0" style="color: #fff; padding: 10px; margin: 10px;">
      <div>暂无可用菜单</div>
    </div>
    
    <a-menu
      :mode="mode"
      :theme="theme"
      :openKeys="openKeys"
      :selectedKeys="selectedKeys"
      @update:openKeys="onOpenChange"
      @update:selectedKeys="onSelect"
    >
      <template v-for="item in menu" :key="item.path">
        <MenuItem :item="item" v-if="!item.hidden" />
      </template>
    </a-menu>
  </div>
</template>

<script>
import { ref, computed, watch, defineComponent, h } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Menu } from 'ant-design-vue'
import { 
  HomeOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  UserOutlined, 
  TeamOutlined, 
  AppstoreOutlined,
  FileOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
  EuroOutlined,
  DeploymentUnitOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  QrcodeOutlined,
  BoxPlotOutlined,
  // 实验管理相关图标
  ExperimentOutlined,
  DesktopOutlined,
  LayoutOutlined,
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  BranchesOutlined,
  FlowChartOutlined,
  BookOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  TableOutlined,
  DatabaseOutlined,
  // 新增图标
  ApartmentOutlined,
  BarChartOutlined,
  ProjectOutlined
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
  'folder': FolderOutlined,
  'safety-certificate': SafetyCertificateOutlined,
  'euro': EuroOutlined,
  'deployment-unit': DeploymentUnitOutlined,
  'radar-chart': RadarChartOutlined,
  'thunderbolt': ThunderboltOutlined,
  'robot': RobotOutlined,
  'qrcode': QrcodeOutlined,
  'box-plot': BoxPlotOutlined,
  // 实验管理相关图标映射
  'experiment': ExperimentOutlined,
  'desktop': DesktopOutlined,           // 设备管理
  'layout': LayoutOutlined,             // 布局管理
  'shopping-cart': ShoppingCartOutlined, // 耗材管理
  'medicine-box': MedicineBoxOutlined,   // 试剂管理
  'branches': BranchesOutlined,          // 实验步骤管理
  'flow-chart': FlowChartOutlined,       // 实验流程设置（备用）
  'apartment': ApartmentOutlined,        // 实验流程设置
  'book': BookOutlined,                  // 实验案例管理
  'bar-chart': BarChartOutlined,         // 实验跟踪/运营管理
  'calendar': CalendarOutlined,          // 计划任务
  'video-camera': VideoCameraOutlined,   // 视频监控
  'table': TableOutlined,                // 样品信息表
  'database': DatabaseOutlined,          // 培养箱存储
  'project': ProjectOutlined             // 业务应用
}

// =======================  递归菜单组件 - 基于Vue2的渲染逻辑  =======================
const MenuItem = defineComponent({
  name: 'MenuItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    const renderIcon = (icon) => {
      if (!icon || icon === 'none') return null
      if (typeof icon === 'string') {
        const IconComp = iconMap[icon.toLowerCase()] || AppstoreOutlined
        return h(IconComp)
      }
      return h(icon)
    }

    // 根据菜单标题自动推断图标
    const getIconByTitle = (title) => {
      const titleIconMap = {
        '设备管理': 'desktop',
        '布局管理': 'layout',
        '耗材管理': 'shopping-cart',
        '试剂管理': 'medicine-box',
        '实验步骤管理': 'branches',
        '实验流程设置': 'flow-chart',
        '实验案例管理': 'book',
        '计划任务': 'calendar',
        '视频监控': 'video-camera',
        '样品信息表': 'table',
        '培养箱存储': 'database'
      }
      return titleIconMap[title] || null
    }

    const renderMenuItem = (menu) => {
      const target = menu.meta?.target || null
      const CustomTag = target ? 'a' : RouterLink
      const props = target ? { href: menu.path, target: menu.meta.target } : { to: { path: menu.path } }

      if (menu.children && menu.hideChildrenInMenu) {
        // 把有子菜单的 并且 父菜单是要隐藏子菜单的
        // 都给子菜单增加一个 hidden 属性
        // 用来给刷新页面时， selectedKeys 做控制用
        menu.children.forEach(item => {
          item.meta = Object.assign(item.meta || {}, { hidden: true })
        })
      }

      // 如果没有设置图标，尝试根据标题推断
      const iconName = menu.meta?.icon || getIconByTitle(menu.meta?.title)

      return h(
        Menu.Item,
        { key: menu.path },
        {
          default: () => h(CustomTag, props, {
            default: () => [
              renderIcon(iconName),
              h('span', {}, menu.meta?.title)
            ]
          })
        }
      )
    }

    const renderSubMenu = (menu) => {
      const itemArr = []
      if (!menu.hideChildrenInMenu && menu.children) {
        menu.children.forEach(item => {
          if (!item.hidden) {
            itemArr.push(renderItem(item))
          }
        })
      }
      
      // 如果没有设置图标，尝试根据标题推断
      const iconName = menu.meta?.icon || getIconByTitle(menu.meta?.title)
      
      return h(
        Menu.SubMenu,
        { key: menu.path },
        {
          title: () => h('span', {}, [
            renderIcon(iconName),
            h('span', {}, menu.meta?.title)
          ]),
          default: () => itemArr
        }
      )
    }

    const renderItem = (menu) => {
      if (!menu.hidden) {
        const hasChildren = menu.children && menu.children.length > 0 && !menu.hideChildrenInMenu
        console.log(`🔍 [MenuItem] 渲染菜单项 ${menu.name || menu.meta?.title}:`, {
          hasChildren,
          childrenCount: menu.children ? menu.children.length : 0,
          hideChildrenInMenu: menu.hideChildrenInMenu,
          willRenderSubMenu: hasChildren
        })
        
        return hasChildren ? renderSubMenu(menu) : renderMenuItem(menu)
      }
      return null
    }

    // 返回渲染函数
    return () => renderItem(props.item)
  }
})

export default {
  name: 'SMenu',
  components: {
    MenuItem
  },
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
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    
    const openKeys = ref([])
    const selectedKeys = ref([])
    const cachedOpenKeys = ref([])
    
    // 添加调试信息
    watch(() => props.menu, (newMenu) => {
      console.log('🔍 [SMenu] 菜单数据变化:', newMenu)
      if (newMenu && Array.isArray(newMenu)) {
        newMenu.forEach(item => {
          console.log(`🔍 [SMenu] 菜单项 ${item.name || item.meta?.title}:`, {
            hasChildren: !!(item.children && item.children.length > 0),
            childrenCount: item.children ? item.children.length : 0,
            children: item.children
          })
        })
      }
    }, { immediate: true, deep: true })
    
    const rootSubmenuKeys = computed(() => {
      const keys = []
      const menuArray = Array.isArray(props.menu) ? props.menu : []
      menuArray.forEach(item => keys.push(item.path))
      return keys
    })
    
    // 监听折叠状态变化
    watch(() => props.collapsed, (val) => {
      if (val) {
        cachedOpenKeys.value = openKeys.value.concat()
        openKeys.value = []
      } else {
        openKeys.value = cachedOpenKeys.value
      }
    })
    
    // 监听路由变化，更新菜单选中状态
    watch(() => route.path, () => {
      updateMenu()
    }, { immediate: true })
    
    // 处理子菜单展开/收起
    const onOpenChange = (keys) => {
      // 在水平模式下时执行，并且不再执行后续
      if (props.mode === 'horizontal') {
        openKeys.value = keys
        return
      }
      // 非水平模式时
      const latestOpenKey = keys.find(key => !openKeys.value.includes(key))
      if (!rootSubmenuKeys.value.includes(latestOpenKey)) {
        openKeys.value = keys
      } else {
        openKeys.value = latestOpenKey ? [latestOpenKey] : []
      }
    }
    
    // 菜单项选中处理
    const onSelect = (keys) => {
      selectedKeys.value = keys
      emit('select', { selectedKeys: keys })
    }
    
    // 更新菜单选中状态
    const updateMenu = () => {
      const routes = route.matched.concat()
      const { hidden } = route.meta || {}
      
      if (routes.length >= 3 && hidden) {
        routes.pop()
        selectedKeys.value = [routes[routes.length - 1].path]
      } else {
        selectedKeys.value = routes.length > 0 ? [routes.pop().path] : []
      }
      
      const newOpenKeys = []
      if (props.mode === 'inline') {
        routes.forEach(item => {
          newOpenKeys.push(item.path)
        })
      }

      props.collapsed ? (cachedOpenKeys.value = newOpenKeys) : (openKeys.value = newOpenKeys)
    }
    
    return {
      openKeys,
      selectedKeys,
      onOpenChange,
      onSelect,
      updateMenu
    }
  },
  mounted() {
    this.updateMenu()
  }
}
</script>
