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
        <multi-tab v-if="multiTab"></multi-tab>
        <div class="content-container">
          <!-- 使用router-view确保Vue 3正确渲染 -->
          <router-view v-slot="{ Component }">
            <transition name="page-transition" mode="out-in">
              <keep-alive v-if="keepAliveRoute">
                <component :is="Component" :key="$route.fullPath" />
              </keep-alive>
              <component v-else :is="Component" :key="$route.fullPath" />
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
import MultiTab from '@/components/MultiTab'
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
        multiTab: false,
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
    
    // 从 settings 中获取配置
    navTheme() {
      return this.settings.theme
    },
    layoutMode() {
      return this.settings.layout
    },
    fixedHeader() {
      return this.settings.fixedHeader
    },
    fixSiderbar() {
      return this.settings.fixSiderbar
    },
    contentWidth() {
      return this.settings.contentWidth
    },
    // 检查当前路由是否需要keep-alive
    keepAliveRoute() {
      return this.$route.meta && this.$route.meta.keepAlive
    },
    autoHideHeader() {
      return this.settings.autoHideHeader
    },
    sidebarOpened() {
      return this.settings.sidebarOpened
    },
    multiTab() {
      return this.settings.multiTab
    },
    headerColor() {
      return this.settings.headerColor
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
  },
  methods: {
    ...mapActions(['setSidebar']),
    // 重新生成菜单 - 与旧版项目保持一致
    setMenus () {
      // 检查permission模块中是否有菜单数据
      if (this.permissionMenus && this.permissionMenus.length > 0) {
        this.updateSideMenus()
        return
      }

      if (this.mainMenu && this.mainMenu.length > 0) {
        // 先尝试找到根路由（path为'/'或''或undefined的路由）
        let rootRoute = this.mainMenu.find(item => item.path === '/' || item.path === '' || item.path === undefined)
        
        // 如果没找到根路由，尝试找到第一个有children的路由作为备选
        if (!rootRoute) {
          rootRoute = this.mainMenu.find(item => item.children && item.children.length > 0)
        }
        
        // 如果还是没找到，就使用第一个路由
        if (!rootRoute && this.mainMenu.length > 0) {
          rootRoute = this.mainMenu[0]
        }

        if (rootRoute) {
          // 强制显示菜单容器，即使没有有效菜单
          document.querySelector('.ant-layout-sider')?.setAttribute('style', 'display: block !important; position: fixed; left: 0; top: 0; height: 100vh; z-index: 100;')
          
          const routes = convertRoutes(rootRoute)

          if (routes && routes.children) {
            this.menus = routes.children
          } else {
            this.menus = []
          }
        } else {
          this.menus = []
        }
      } else {
        // 尝试从permissionMenus获取菜单数据
        if (this.permissionMenus && this.permissionMenus.length > 0) {
          this.updateSideMenus()
        } else {
          this.menus = []
        }
      }

      if (!this.menus || this.menus.length === 0) {
        // 尝试从路由中获取菜单
        try {
          const routes = this.$router.getRoutes()
          const layoutRoute = routes.find(r => r.name === 'MenuIndex.vue' || r.name === 'BasicLayout')
          if (layoutRoute && layoutRoute.children) {
            this.menus = layoutRoute.children.map(child => ({
              ...child,
              meta: child.meta || { title: child.name }
            }))
          }
        } catch (err) {
          // 从路由生成菜单失败时静默处理
        }
      }

      this.validateMenuData(this.menus)
    },
    
    // 验证菜单数据结构
    validateMenuData(menus) {
      if (!Array.isArray(menus)) {
        return
      }
      
      menus.forEach((menu, index) => {
        // 检查子菜单
        if (menu.children && Array.isArray(menu.children)) {
          this.validateMenuData(menu.children)
        }
      })
    },
    // 加载设置
    loadSettings() {
      try {
        const appSettings = localStorage.getItem('appSettings')
        if (appSettings) {
          this.settings = { ...this.settings, ...JSON.parse(appSettings) }
        }
      } catch (error) {
        // 获取应用设置失败时静默处理
      }
    },
    // 设备检测方法
    isTopMenu () {
      return this.layoutMode === 'topmenu'
    },
    isSideMenu () {
      return !this.isTopMenu()
    },
    isMobile () {
      return this.device === DEVICE_TYPE.MOBILE
    },
    isDesktop () {
      return this.device === DEVICE_TYPE.DESKTOP
    },
    isTablet () {
      return this.device === DEVICE_TYPE.TABLET
    },
    toggle () {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()
    },
    paddingCalc () {
      let left = ''
      if (this.sidebarOpened) {
        left = this.isDesktop() ? '256px' : '80px'
      } else {
        left = (this.isMobile() && '0') || ((this.fixSidebar && '80px') || '0')
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
    // 处理应用准备切换事件
    onAppChanging(appCode) {
      // 清空当前菜单，显示加载状态
      this.menus = [];
    },
    // 处理应用切换事件
    onAppChanged(appCode) {
      // 等待一个Vue tick，确保store中的数据已经更新
      this.$nextTick(() => {
        // 检查菜单数据是否已经更新
        if (this.permissionMenus && this.permissionMenus.length > 0) {
          this.updateSideMenus()
        } else {
          // 如果菜单数据还没有更新，等待一段时间后重试
          setTimeout(() => {
            this.updateSideMenus()
          }, 500)
        }
      })
    },
    
    // 从permissionMenus更新左侧菜单
    updateSideMenus() {
      
      if (this.permissionMenus && this.permissionMenus.length > 0) {
        // 直接使用 permissionMenus 作为左侧菜单数据
        // 不需要复杂的转换，因为菜单数据已经在 generator-routers.js 中处理过了
        try {
          // 直接将 permissionMenus 设置为左侧菜单
          this.menus = [...this.permissionMenus]
          

          console.log('� [BasicLayout] 更新后的菜单数据:', this.menus)
          
          // 强制Vue重新渲染菜单组件
          this.$forceUpdate()
          
          // 确保菜单组件收到新数据
          this.$nextTick(() => {
            // 验证菜单状态
          })
          
        } catch (error) {
          this.menus = []
        }
      } else {
        // 尝试从mainMenu获取菜单作为后备
        if (this.mainMenu && this.mainMenu.length > 0) {
          this.setMenus()
        } else {
          this.menus = []
        }
      }
    }
  }
}
</script>

<style lang="less">
/*  
 * The following styles are auto-applied to elements with
 * transition="page-transition" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the page transition by editing
 * these styles.
 */

.page-transition-enter {
  opacity: 0;
}

.page-transition-leave-active {
  opacity: 0;
}

.page-transition-enter .page-transition-container,
.page-transition-leave-active .page-transition-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>