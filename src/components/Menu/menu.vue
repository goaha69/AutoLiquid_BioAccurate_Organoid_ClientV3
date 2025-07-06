<template>
  <div>
    <!-- 菜单为空时的提示 -->
    <div v-if="!menuTree || menuTree.length === 0" style="color: #fff; padding: 10px; margin: 10px;">
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
      <MenuItem
        v-for="menu in menuTree"
        :key="menu.path"
        :item="menu"
      />
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

// =======================  递归菜单组件  =======================

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

    const renderItem = (item) => {
      if (item.hidden || item.hideInMenu) return null

      // 如果有子菜单并且不隐藏
      if (item.children && !item.hideChildrenInMenu) {
        return h(
          Menu.SubMenu,
          { key: item.path },
          {
            title: () => h('span', {}, [
              renderIcon(item.meta?.icon),
              h('span', {}, item.meta?.title)
            ]),
            default: () => item.children.map(child => renderItem(child))
          }
        )
      }

      // 普通菜单项
      return h(
        Menu.Item,
        { key: item.path },
        {
          default: () => h(RouterLink, { to: { path: item.path } }, {
            default: () => [
              renderIcon(item.meta?.icon),
              h('span', {}, item.meta?.title)
            ]
          })
        }
      )
    }

    // 返回渲染函数
    return () => renderItem(props.item)
  }
})
// =======================  递归菜单组件  =======================

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
    
    const rootSubmenuKeys = computed(() => {
      const keys = []
      const menuArray = Array.isArray(props.menu) ? props.menu : []
      menuArray.forEach(item => keys.push(item.path))
      return keys
    })
    
    // 过滤菜单，只显示不隐藏的菜单项
    const menuTree = computed(() => {
      const menuArray = Array.isArray(props.menu) ? props.menu : []
      const filteredMenu = menuArray.filter(item => !item.hidden && !item.hideInMenu)
      return filteredMenu
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
    
    // 获取图标组件
    const getIconComponent = (icon) => {
      if (!icon || icon === 'none') return null
      
      // 处理字符串类型的图标
      if (typeof icon === 'string') {
        return iconMap[icon.toLowerCase()] || AppstoreOutlined
      }
      
      // 处理对象类型的图标（自定义组件）
      return icon
    }
    
    return {
      openKeys,
      selectedKeys,
      menuTree,
      onOpenChange,
      onSelect,
      getIconComponent
    }
  }
}

</script>
