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
        console.log('🔄 [BasicLayout] mainMenu 发生变化，重新设置菜单')
        this.setMenus()
      },
      deep: true
    },
    // 监听权限模块的菜单变化
    permissionMenus: {
      handler(val) {
        console.log('🔄 [BasicLayout] permissionMenus 发生变化:', val)
        if (val && val.length > 0) {
          console.log('🔄 [BasicLayout] 从permissionMenus更新左侧菜单')
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
          console.error('保存应用设置失败:', error)
        }
      },
      immediate: true,
      deep: true
    }
  },
  created () {
    console.log('🚀🚀🚀 [BasicLayout] 组件 created 开始执行')
    console.log('🚀🚀🚀 [BasicLayout] 当前路由:', this.$route.path, this.$route.name)
    this.loadSettings()
    this.collapsed = !this.sidebarOpened
    
    // 设置菜单
    console.log('🚀🚀🚀 [BasicLayout] 准备设置菜单')
    
    // 检查是否有permission菜单数据
    if (this.permissionMenus && this.permissionMenus.length > 0) {
      console.log('🚀🚀🚀 [BasicLayout] 使用permission菜单数据')
      this.updateSideMenus()
    } else {
      console.log('🚀🚀🚀 [BasicLayout] 使用mainMenu设置菜单')
      this.setMenus()
    }
    
    console.log('🚀🚀🚀 [BasicLayout] created 执行完成，menus长度:', this.menus?.length)
  },
  mounted () {
    console.log('🚀🚀🚀 [BasicLayout] 组件 mounted 开始执行')
    console.log('🚀🚀🚀 [BasicLayout] 当前 menus 数据:', this.menus)
    console.log('🚀🚀🚀 [BasicLayout] 当前 mainMenu 数据:', this.mainMenu)
    
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
    console.log('🚀🚀🚀 [BasicLayout] mounted 执行完成')
  },
  methods: {
    ...mapActions(['setSidebar']),
    // 重新生成菜单 - 与旧版项目保持一致
    setMenus () {
      console.log('🔧 [BasicLayout] setMenus 开始执行')
      console.log('🔧 [BasicLayout] mainMenu:', this.mainMenu)
      
      // 检查permission模块中是否有菜单数据
      if (this.permissionMenus && this.permissionMenus.length > 0) {
        console.log('🔍 [BasicLayout] 发现permission模块中有菜单数据，优先使用')
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
          console.log('🔍 [BasicLayout] 找到根路由:', rootRoute)
          // 强制显示菜单容器，即使没有有效菜单
          document.querySelector('.ant-layout-sider')?.setAttribute('style', 'display: block !important; position: fixed; left: 0; top: 0; height: 100vh; z-index: 100;')
          
          const routes = convertRoutes(rootRoute)
          console.log('🔍 [BasicLayout] 转换后的路由:', routes)

          if (routes && routes.children) {
            this.menus = routes.children
          } else {
            console.warn('⚠️ [BasicLayout] 转换后的路由没有 children，设置空菜单')
            this.menus = []
          }
        } else {
          console.warn('⚠️ [BasicLayout] 未找到根路由，设置空菜单')
          this.menus = []
        }
      } else {
        console.warn('⚠️ [BasicLayout] mainMenu 为空或未定义，检查 permissionMenus')
        
        // 尝试从permissionMenus获取菜单数据
        if (this.permissionMenus && this.permissionMenus.length > 0) {
          this.updateSideMenus()
        } else {
          console.warn('⚠️ [BasicLayout] permissionMenus 也为空，设置空菜单')
          this.menus = []
        }
      }

      console.log("📋 [BasicLayout] setMenus - 设置菜单完成:", this.menus)

      if (!this.menus || this.menus.length === 0) {
        console.error('❌ [BasicLayout] menus 为空，可能导致侧边栏和顶部菜单无法渲染')
        // 尝试从路由中获取菜单
        try {
          const routes = this.$router.getRoutes()
          console.log('🔍 [BasicLayout] 尝试从路由中获取菜单:', routes)
          const layoutRoute = routes.find(r => r.name === 'MenuIndex.vue' || r.name === 'BasicLayout')
          if (layoutRoute && layoutRoute.children) {
            console.log('✅ [BasicLayout] 从路由中找到布局路由:', layoutRoute)
            this.menus = layoutRoute.children.map(child => ({
              ...child,
              meta: child.meta || { title: child.name }
            }))
            console.log('✅ [BasicLayout] 从路由生成的菜单:', this.menus)
          }
        } catch (err) {
          console.error('❌ [BasicLayout] 从路由生成菜单失败:', err)
        }
      }

      this.validateMenuData(this.menus)
    },
    
    // 验证菜单数据结构
    validateMenuData(menus) {
      console.log('🔍 [BasicLayout] 验证菜单数据结构...')
      if (!Array.isArray(menus)) {
        console.error('❌ [BasicLayout] 菜单数据不是数组:', menus)
        return
      }
      
      menus.forEach((menu, index) => {
        console.log(`🔍 [BasicLayout] 菜单项 ${index + 1}:`, menu)
        
        // 检查必要的字段
        if (!menu.path && !menu.name) {
          console.error(`❌ [BasicLayout] 菜单项 ${index + 1} 缺少 path 或 name 字段:`, menu)
        }
        
        if (!menu.meta || !menu.meta.title) {
          console.warn(`⚠️ [BasicLayout] 菜单项 ${index + 1} 缺少 meta.title:`, menu)
        }
        
        // 检查子菜单
        if (menu.children && Array.isArray(menu.children)) {
          console.log(`🔍 [BasicLayout] 菜单项 ${index + 1} 有 ${menu.children.length} 个子菜单`)
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
        console.error('获取应用设置失败:', error)
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
      console.log('🚀 [BasicLayout] 收到应用准备切换事件:', appCode)
      console.log('🔄 [BasicLayout] 应用切换开始')
      // 清空当前菜单，避免过时数据
      this.menus = []
    },
    // 处理应用切换事件
    onAppChanged(appCode) {
      console.log('🎯 [BasicLayout] 收到应用切换事件:', appCode)
      console.log('✅ [BasicLayout] 应用切换完成，立即重新设置菜单')
      
      // 直接调用更新侧边菜单，不需要nextTick
      this.updateSideMenus()
      
      // 备份措施：如果直接更新失败，延迟再次尝试
      setTimeout(() => {
        console.log('🔄 [BasicLayout] 延迟执行菜单更新')
        this.updateSideMenus()
        
        // 强制刷新DOM，以防菜单状态不更新
        this.$forceUpdate()
      }, 300)
    },
    
    // 从permissionMenus更新左侧菜单
    updateSideMenus() {
      console.log('🔄 [BasicLayout] updateSideMenus 执行...')
      
      // 先强制刷新DOM显示侧边栏
      document.querySelector('.ant-layout-sider')?.setAttribute('style', 'display: block !important; position: fixed; left: 0; top: 0; height: 100vh; z-index: 100;')
      
      if (this.permissionMenus && this.permissionMenus.length > 0) {
        console.log('📋 [BasicLayout] 从permission模块获取菜单数据，长度:', this.permissionMenus.length)
        
        // 从permission模块的menus生成左侧菜单
        try {
          // 创建一个根路由对象
          const rootRoute = { 
            path: '/', 
            component: 'RouteView',
            children: this.permissionMenus
          }
          
          console.log('🔄 [BasicLayout] 转换菜单的根路由对象:', rootRoute)
          
          const routes = convertRoutes(rootRoute)
          console.log('🔄 [BasicLayout] 转换后的路由:', routes)
          
          if (routes && routes.children) {
            // 更新菜单前先保存菜单项数量
            const oldMenuCount = this.menus ? this.menus.length : 0
            
            // 清空并重新设置菜单
            this.menus = []
            this.$nextTick(() => {
              this.menus = routes.children
              console.log(`✅ [BasicLayout] 左侧菜单更新成功: 从${oldMenuCount}项更新到${this.menus.length}项`)
              
              // 更新DOM以确保菜单立即显示
              this.$forceUpdate()
            })
          } else {
            console.warn('⚠️ [BasicLayout] 转换后的路由没有children属性')
            this.menus = []
          }
        } catch (error) {
          console.error('❌ [BasicLayout] 转换路由失败:', error)
          this.menus = []
        }
      } else {
        console.warn('⚠️ [BasicLayout] permissionMenus为空，尝试从mainMenu获取菜单')
        
        // 尝试从mainMenu获取菜单作为后备
        this.setMenus()
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