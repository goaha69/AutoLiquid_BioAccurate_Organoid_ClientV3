<template>
  <div>
    <!-- 调试信息 -->
    <div v-if="!menuTree || menuTree.length === 0" style="color: #fff; padding: 10px; background: orange; margin: 10px;">
      <div>🔍 菜单树为空</div>
      <div>props.menu: {{ props.menu }}</div>
      <div>menuTree: {{ menuTree }}</div>
      <div>menuTree.length: {{ menuTree?.length }}</div>
    </div>
    
    <a-menu
      :mode="mode"
      :theme="theme"
      :openKeys="openKeys"
      :selectedKeys="selectedKeys"
      @update:openKeys="onOpenChange"
      @update:selectedKeys="onSelect"
    >
      <template v-for="menu in menuTree" :key="menu.path">
        <template v-if="menu.children && !menu.hideChildrenInMenu">
          <a-sub-menu :key="menu.path">
            <template #title>
              <span>
                <component :is="getIconComponent(menu.meta?.icon)" v-if="menu.meta?.icon" />
                <span>{{ menu.meta?.title }}</span>
              </span>
            </template>
            <a-menu-item v-for="item in menu.children.filter(i => !i.hidden && !i.hideInMenu)" :key="item.path">
              <router-link :to="{ path: item.path }">
                <component :is="getIconComponent(item.meta?.icon)" v-if="item.meta?.icon" />
                <span>{{ item.meta?.title }}</span>
              </router-link>
            </a-menu-item>
          </a-sub-menu>
        </template>
        <template v-else>
          <a-menu-item :key="menu.path">
            <router-link :to="{ path: menu.path }">
              <component :is="getIconComponent(menu.meta?.icon)" v-if="menu.meta?.icon" />
              <span>{{ menu.meta?.title }}</span>
            </router-link>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
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
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    
    const openKeys = ref([])
    const selectedKeys = ref([])
    const cachedOpenKeys = ref([])
    
    // 添加调试信息
    console.log('🔍 [menu.vue] 接收到的 props.menu:', props.menu)
    console.log('🔍 [menu.vue] props.menu 是否为数组:', Array.isArray(props.menu))
    console.log('🔍 [menu.vue] props.menu 长度:', props.menu?.length)
    
    const rootSubmenuKeys = computed(() => {
      const keys = []
      const menuArray = Array.isArray(props.menu) ? props.menu : []
      console.log('🔍 [menu.vue] rootSubmenuKeys 计算中，menuArray:', menuArray)
      menuArray.forEach(item => keys.push(item.path))
      return keys
    })
    
    // 过滤菜单，只显示不隐藏的菜单项
    const menuTree = computed(() => {
      const menuArray = Array.isArray(props.menu) ? props.menu : []
      const filteredMenu = menuArray.filter(item => !item.hidden && !item.hideInMenu)
      console.log('🔍 [menu.vue] menuTree 计算结果:', filteredMenu)
      console.log('🔍 [menu.vue] 原始菜单数组长度:', menuArray.length, '过滤后长度:', filteredMenu.length)
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
