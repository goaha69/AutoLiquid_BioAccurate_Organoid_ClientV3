<template>
  <a-layout :class="['layout', device]">
    <!-- SideMenu -->
    <a-drawer
      v-if="isMobile()"
      placement="left"
      :wrapClassName="`drawer-sider ${navTheme}`"
      :closable="false"
      :open="collapsed"
      @close="drawerClose"
    >
      <side-menu
        mode="inline"
        :menus="menus"
        :theme="navTheme"
        :collapsed="false"
        :collapsible="true"
        @menuSelect="menuSelect"
      ></side-menu>
    </a-drawer>

    <side-menu
      v-if="isSideMenu()"
      mode="inline"
      :menus="menus"
      :theme="navTheme"
      :collapsed="collapsed"
      :collapsible="true"
      style="position: fixed; left: 0; top: 0; height: 100vh; z-index: 100; background: #001529;"
    ></side-menu>

    <div :style="{minWidth: placeholderDivMinWidth}" v-if="!isMobile()"></div>
    <a-layout :class="[layoutMode, `content-width-${contentWidth}`]" :style="{ minHeight: '100vh' }">
      <!-- layout header -->
      <global-header
        mode="sidemenu"
        :menus="menus"
        :theme="navTheme"
        :collapsed="collapsed"
        :device="device"
        @toggle="toggle"
        @app-changing="onAppChanging"
        @app-changed="onAppChanged"
      ></global-header>

      <!-- layout content -->
      <a-layout-content :style="{ height: '100%', margin: '24px 24px 0', paddingTop: fixedHeader ? '55px' : '0' }">
        <multi-tab v-if="$store.state.app.multiTab" style="margin-bottom: 16px;"></multi-tab>
        <div class="content-container">
          <!-- 使用router-view确保Vue 3正确渲染 -->
          <router-view v-slot="{ Component }">
            <transition name="page-transition" mode="out-in">
              <keep-alive v-if="keepAliveRoute">
                <component :is="Component" />
              </keep-alive>
              <component v-else :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <!-- layout footer -->
      <a-layout-footer>
        <global-footer :currentVersion="versionCode"></global-footer>
      </a-layout-footer>

    </a-layout>
  </a-layout>

</template>

<script>
import { triggerWindowResizeEvent } from '@/utils/util'
import { mapState, mapActions, mapGetters } from 'vuex'
import { mixin, mixinDevice } from '@/utils/mixin'
import { DEVICE_TYPE } from '@/utils/device'
import RouteView from './RouteView'
import SideMenu from '@/components/Menu/SideMenu'
// 从components/GlobalHeader导入，而不是直接从GlobalHeader.vue导入，避免重复组件
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import MultiTab from '@/components/MultiTab/MultiTab.vue'
import { convertRoutes } from '@/utils/routeConvert'

export default {
  name: 'BasicLayout',
  mixins: [mixin, mixinDevice],
  components: {
    RouteView,
    SideMenu,
    GlobalHeader,
    GlobalFooter,
    MultiTab
  },
  data () {
    return {
      production: process.env.NODE_ENV === 'production' && process.env.VUE_APP_PREVIEW !== 'true',
      collapsed: false,
      menus: [],
      // 应用设置的默认值
      settings: {
        layout: 'sidemenu',
        theme: 'dark',
        color: '#1890FF',
        weak: false,
        fixedHeader: true,
        fixSiderbar: true,
        contentWidth: 'Fluid',
        autoHideHeader: false,
        sidebar: true,
        headerColor: '#1890FF',
        menuColor: '#1890FF',
        sidebarOpened: true,
        version: '3.1.0'
      }
    }
  },
  computed: {
    ...mapState({
      // 动态主路由 - 与旧版项目保持一致
      mainMenu: state => state.permission.addRouters,
      // 从permission模块获取菜单
      permissionMenus: state => state.permission.menus
    }),
    ...mapGetters(['userInfo']),
    
    // 从 Vuex store 中获取配置
    navTheme() {
      return this.$store.state.app.theme || this.settings.theme
    },
    layoutMode() {
      return this.$store.state.app.layout || this.settings.layout
    },
    fixedHeader() {
      return this.$store.state.app.fixedHeader !== undefined ? this.$store.state.app.fixedHeader : this.settings.fixedHeader
    },
    fixSiderbar() {
      return this.$store.state.app.fixSiderbar !== undefined ? this.$store.state.app.fixSiderbar : this.settings.fixSiderbar
    },
    contentWidth() {
      return this.$store.state.app.contentWidth || this.settings.contentWidth
    },
    // 检查当前路由是否需要keep-alive
    keepAliveRoute() {
      return this.$route.meta && this.$route.meta.keepAlive
    },
    autoHideHeader() {
      return this.$store.state.app.autoHideHeader !== undefined ? this.$store.state.app.autoHideHeader : this.settings.autoHideHeader
    },
    sidebarOpened() {
      return this.$store.state.app.sidebar !== undefined ? this.$store.state.app.sidebar : this.settings.sidebarOpened
    },
    headerColor() {
      return this.$store.state.app.headerColor || this.settings.headerColor
    },
    versionCode() {
      return this.settings.version
    },
    
    // 设备相关
    device () {
      return this.$store.state.app.device
    },
    theme () {
      return this.$store.getters.theme
    },
    
    contentPaddingLeft () {
      if (!this.fixSiderbar || this.isMobile()) {
        return '0'
      }
      if (this.sidebarOpened) {
        return '230px'
      }
      return '80px'
    },
    placeholderDivMinWidth(){
      let width = this.collapsed ? '80px' : '230px'
      return width
    }
  },
  watch: {
    sidebarOpened (val) {
      this.collapsed = !val
    },
    // 监听主菜单变化
    mainMenu: {
      handler(val) {
        this.setMenus()
      },
      deep: true
    },
    // 监听权限模块的菜单变化
    permissionMenus: {
      handler(val) {
        if (val && val.length > 0) {
          this.updateSideMenus()
        }
      },
      deep: true
    },
    $route: function(val) {
      // 可以在这里处理路由变化
    },
    // 监听设备变化
    device (val) {
      if (val === DEVICE_TYPE.MOBILE) {
        // 移动设备处理
      }
    },
    // 监听设置变化
    settings: {
      handler(newSettings) {
        // 可以在这里保存设置到localStorage
        try {
          localStorage.setItem('appSettings', JSON.stringify(newSettings))
        } catch (error) {
          // 保存失败时静默处理
        }
      },
      immediate: true,
      deep: true
    },
    // 监听多标签状态变化
    multiTab: {
      handler(newVal) {
        console.log('✅ [BasicLayout] multiTab 状态变化:', newVal)
      },
      immediate: true
    }
  },
  created () {
    this.loadSettings()
    this.collapsed = !this.sidebarOpened
    
    // 设置菜单
    // 检查是否有permission菜单数据
    if (this.permissionMenus && this.permissionMenus.length > 0) {
      this.updateSideMenus()
    } else {
      this.setMenus()
    }
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // this.updateTheme()

    this.autoHideHeader && this.triggerResizeEvent()
  },
  methods: {
    ...mapActions(['setSidebar']),
    
    // 加载设置
    loadSettings() {
      try {
        const savedSettings = localStorage.getItem('appSettings')
        if (savedSettings) {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
        }
      } catch (error) {
        // 加载失败时使用默认设置
      }
    },
    
    // 设置菜单 - 从动态路由或permission路由生成菜单
    setMenus() {
      if (this.mainMenu && this.mainMenu.length > 0) {
        // 过滤出需要在菜单中显示的路由
        const menuRoutes = this.mainMenu.filter(item => {
          // 过滤掉hidden的路由和重定向路由
          return !item.hidden && item.path !== '*'
        })
        
        // 使用转换工具将路由转换为菜单项
        this.menus = convertRoutes(menuRoutes)
      } else {
        // 如果没有动态路由，使用默认菜单
        this.menus = []
      }
    },
    
    // 更新侧边菜单 - 从permission模块获取
    updateSideMenus() {
      if (this.permissionMenus && this.permissionMenus.length > 0) {
        this.menus = this.permissionMenus
      }
    },
    
    onAppChanging(activeApp) {
      // 应用切换中的处理
    },
    
    onAppChanged(activeApp) {
      // 应用切换完成的处理
      if (activeApp && activeApp.menu) {
        this.menus = activeApp.menu
      }
    },

    toggle () {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()
    },
    paddingCalc () {
      let left = ''
      if (this.sidebarOpened) {
        left = this.isDesktop() ? '230px' : '0'
      } else {
        left = (this.isMobile() && '0') || ((this.fixSiderbar && '80px') || '0')
      }
      return left
    },
    menuSelect () {
      if (!this.isDesktop()) {
        this.collapsed = false
      }
    },
    drawerClose () {
      this.collapsed = false
    },
    triggerResizeEvent () {
      triggerWindowResizeEvent()
    }
  }
}
</script>

<style lang="less">
/*
 * The following styles are auto-applied to components with
 * <style scoped> attribute. Update them if you change something.
 */
.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
}

.trigger.trigger {
  color: #fff;
}

.layout {
  min-height: 100vh;
  overflow-x: hidden;

  &.ant-layout-has-sider {
    flex-direction: row;
  }

  .trigger {
    font-size: 20px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .header {
    height: 64px;
    padding: 0 12px 0 0;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    position: relative;
  }

  .layout {
    padding: 0 24px 24px;

    .content {
      background: #fff;
      margin: 0;
      padding: 24px;
      min-height: 280px;
    }
  }

  // 兼容性
  .ant-layout-sider-collapsed .anticon {
    font-size: 16px;
  }

  .ant-layout-sider-collapsed .nav-text {
    display: none;
  }

  .ant-layout-sider-collapsed .ant-menu-submenu-vertical > .ant-menu-submenu-title:after {
    display: none;
  }

  .drawer-sider {
    .sider {
      box-shadow: none;
    }

    &.dark {
      .ant-menu-dark .ant-menu-inline.ant-menu-sub {
        background: #000c17;
      }
    }

    &.light {
      .ant-menu-light .ant-menu-inline.ant-menu-sub {
        background: #fff;
      }

      .ant-menu-light .ant-menu-item-group-title {
        color: rgba(0, 0, 0, 0.43);
      }
    }

    .ant-menu-item .sider-menu-item-icon + span {
      transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      opacity: 1;
    }
  }
}

/* 页面切换动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.2s;
}

.page-transition-enter,
.page-transition-leave-to {
  opacity: 0;
}

.content-container {
  min-height: calc(100vh - 134px);
}
</style>
