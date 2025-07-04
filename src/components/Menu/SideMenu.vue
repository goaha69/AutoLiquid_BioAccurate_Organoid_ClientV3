<template>
  <a-layout-sider
    :class="['sider', isDesktop() ? null : 'shadow', theme, fixSiderbar ? 'ant-fixed-sidemenu' : null ]"
    width="230px"
    :collapsible="collapsible"
    :collapsed="collapsed"
    @collapse="onCollapse"
    :trigger="null">
    
    <logo></logo>
    <s-menu 
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
