<template>
  <a-layout-sider
    :class="['sider', isDesktop() ? null : 'shadow', theme, fixSiderbar ? 'ant-fixed-sidemenu' : null ]"
    width="230px"
    :collapsible="collapsible"
    :collapsed="collapsed"
    @collapse="onCollapse"
    :trigger="null"
    style="background: #001529 !important; position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000; display: block !important;">
    
    <logo></logo>
    
    <!-- 添加调试信息显示 -->
    <div v-if="!menus || menus.length === 0" style="color: #fff; padding: 20px; background: red;">
      <div>❌ 菜单数据为空</div>
      <div>menus: {{ menus }}</div>
      <div>menus.length: {{ menus?.length }}</div>
    </div>
    
    <!-- 添加静态菜单作为备用，当动态菜单为空时显示 -->
    <template v-if="!menus || menus.length === 0">
      <div style="color: #fff; padding: 10px;">
        <h3>系统菜单</h3>
      </div>
      <a-menu theme="dark" mode="inline" :selectedKeys="['welcome']">
        <a-menu-item key="welcome">
          <router-link to="/welcome">
            <span>首页</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="dashboard">
          <router-link to="/dashboard/workplace">
            <span>工作台</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </template>
    
    <s-menu 
      v-else
      :collapsed="collapsed" 
      :menu="menus"
      :theme="theme"
      :mode="mode"
      @select="onSelect"
    ></s-menu>
  </a-layout-sider>

</template>

<script>
import Logo from '@/components/tools/Logo'
import SMenu from './index'
import { DEVICE_TYPE } from '@/utils/device'

export default {
  name: 'SideMenu',
  components: { Logo, SMenu },
  props: {
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    menus: {
      type: Array,
      required: true
    }
  },
  computed: {
    fixSiderbar() {
      return true // 默认固定侧边栏
    }
  },
  mounted() {
    console.log('🔍 [SideMenu] 组件挂载，接收到的 menus:', this.menus)
    console.log('🔍 [SideMenu] menus 是否为数组:', Array.isArray(this.menus))
    console.log('🔍 [SideMenu] menus 长度:', this.menus?.length)
  },
  watch: {
    menus: {
      handler(newMenus) {
        console.log('🔍 [SideMenu] menus 数据变化:', newMenus)
      },
      immediate: true
    }
  },
  methods: {
    isDesktop() {
      return true // 简化处理,假设是桌面设备
    },
    onSelect (obj) {
      this.$emit('menuSelect', obj)
    },
    onCollapse (collapsed) {
      this.$emit('update:collapsed', collapsed)
    }
  }
}
</script>
