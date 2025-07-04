<template>
  <transition name="showHeader">
    <div v-if="visible" class="header-animat">
      <a-layout-header
        v-if="visible"
        :class="[fixedHeader && 'ant-header-fixedHeader', sidebarOpened ? 'ant-header-side-opened' : 'ant-header-side-closed', ]"
        :style="{ padding: '0', height: '55px'}"
      >
        <div class="header">
          <!-- 强制显示顶部导航，不再依赖 mode 属性 -->
          <a-menu
            :style="{ height: '55px', lineHeight: '55px', backgroundColor: headerColor, width: '100%' }"
            mode="horizontal"
            :selected-keys="defApp"
          >
            <menu-unfold-outlined v-if="device==='mobile'" class="trigger" @click="toggle"></menu-unfold-outlined>
            <menu-fold-outlined v-else class="trigger" @click="toggle"></menu-fold-outlined>

            <!-- 调试信息：显示appMenus数量 -->
            <!-- <div style="color: white; position: absolute; top: 0; left: 80px; font-size: 12px;">
              菜单数量: {{ appMenus ? appMenus.length : 0 }}
            </div> -->

            <!-- 固定显示顶部应用导航菜单，无论布局模式如何 -->
            <a-menu-item 
              v-for="(item) in appMenus" 
              :key="item.code" 
              class="app-menu-item" 
              :style="{ lineHeight: '55px', paddingLeft: '15px', paddingRight: '15px', height: '55px', display: 'inline-block', color: 'white', background: headerColor }"
              @click="switchApp(item.code)"
            >
              {{ item.name }}
            </a-menu-item>
            
            <!-- 添加固定的菜单项，测试是否能显示 -->
            <a-menu-item key="test-menu" class="app-menu-item" :style="{ lineHeight: '55px', paddingLeft: '15px', paddingRight: '15px', height: '55px', display: 'inline-block', color: 'white', background: headerColor }">
              测试菜单
            </a-menu-item>
            
            <div class="right-menu" style="position: absolute; right: 20px; top: 0;">
              <user-menu class="user-menu-container"></user-menu>
            </div>
          </a-menu>
        </div>
        <!-- 不再使用v-else，确保不会被隐藏 -->
        <div v-if="false" :class="['top-nav-header-index', theme]">
          <div class="header-index-wide">
            <div class="header-index-left">
              <logo class="top-nav-header" :show-title="device !== 'mobile'"></logo>
              <s-menu v-if="device !== 'mobile'" mode="horizontal" :menu="menus" :theme="theme"></s-menu>
              <menu-fold-outlined v-else class="trigger" @click="toggle"></menu-fold-outlined>
            </div>
            <user-menu class="header-index-right"></user-menu>
          </div>
        </div>
      </a-layout-header>
    </div>
  </transition>
</template>

<script>
import UserMenu from '../tools/UserMenu'
import SMenu from '../Menu/'
import Logo from '../tools/Logo'
import { message } from 'ant-design-vue/es'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { mapGetters, mapActions } from 'vuex'
import { ALL_APPS_MENU } from '@/store/mutation-types'

// localStorage辅助函数
const ls = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem('pro__' + key)
      if (!item) return defaultValue
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem('pro__' + key)
        return defaultValue
      }
      return data.value
    } catch {
      return defaultValue
    }
  },
  set: (key, value, expire) => {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem('pro__' + key, JSON.stringify(data))
  }
}

export default {
  name: 'GlobalHeader',
  components: {
    UserMenu,
    SMenu,
    Logo,
    MenuFoldOutlined,
    MenuUnfoldOutlined
  },
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu'
    },
    menus: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    device: {
      type: String,
      required: false,
      default: 'desktop'
    }
  },
  data () {
    return {
      visible: true,
      oldScrollTop: 0,
      defApp: [],
      settings: {
        fixedHeader: true,
        sidebarOpened: true,
        autoHideHeader: false, // 强制禁用自动隐藏
        headerColor: '#1890FF'
      },
      // 固定的应用列表，确保即使API没有返回也能显示菜单
      defaultApps: [
        { code: 'platform', name: '平台管理', active: true, path: '/welcome' },
        { code: 'system', name: '系统管理', active: false, path: '/system' },
        { code: 'operation', name: '运营管理', active: false, path: '/operation' },
        { code: 'business', name: '业务应用', active: false, path: '/business' },
        { code: 'experiment', name: '实验管理', active: false, path: '/experiment' },
        { code: 'workflow', name: '流程中心', active: false, path: '/workflow' }
      ]
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    fixedHeader() {
      return this.settings.fixedHeader
    },
    sidebarOpened() {
      return this.settings.sidebarOpened
    },
    autoHideHeader() {
      return this.settings.autoHideHeader
    },
    headerColor() {
      return this.settings.headerColor
    },
    appMenus() {
      console.log('🔍 [GlobalHeader] 计算 appMenus...')
      
      // 优先从 localStorage 获取，如果没有则从 userInfo.apps 获取，最后使用默认值
      let allApps = ls.get(ALL_APPS_MENU, null)
      console.log('🔍 [GlobalHeader] 从 localStorage 获取的应用列表:', allApps)
      
      // 直接使用默认列表，用于测试
      const testApps = [
        { code: 'platform', name: '平台管理', active: true, path: '/welcome' },
        { code: 'system', name: '系统管理', active: false, path: '/system' },
        { code: 'operation', name: '运营管理', active: false, path: '/operation' },
        { code: 'business', name: '业务应用', active: false, path: '/business' },
        { code: 'experiment', name: '实验管理', active: false, path: '/experiment' },
        { code: 'workflow', name: '流程中心', active: false, path: '/workflow' }
      ]
      
      // 如果localStorage中没有数据，检查userInfo
      if ((!allApps || allApps.length === 0) && this.userInfo && this.userInfo.apps) {
        console.log('🔍 [GlobalHeader] 使用 userInfo.apps:', this.userInfo.apps)
        allApps = this.userInfo.apps
        
        // 保存到localStorage
        ls.set(ALL_APPS_MENU, allApps, 7 * 24 * 60 * 60 * 1000)
      }
      
      // 如果仍然没有，使用默认的应用列表
      if (!allApps || allApps.length === 0) {
        console.warn('⚠️ [GlobalHeader] 没有找到应用数据，使用默认值')
        
        // 保存默认应用到 localStorage
        ls.set(ALL_APPS_MENU, testApps, 7 * 24 * 60 * 60 * 1000)
        
        console.log('📱 [GlobalHeader] 返回默认应用:', testApps)
        return testApps
      }
      
      console.log('📱 [GlobalHeader] 返回应用列表:', allApps)
      return allApps
    }
  },
  watch: {
    userInfo: {
      handler(newVal) {
        if (newVal && newVal.apps) {
          this.setDefaultApp()
        }
      },
      immediate: true
    }
  },
  created () {
    this.loadSettings()
    
    // 确保加载默认应用
    const allApps = ls.get(ALL_APPS_MENU, null)
    if (!allApps) {
      console.log('📱 [GlobalHeader] 创建默认应用列表')
      ls.set(ALL_APPS_MENU, this.defaultApps, 7 * 24 * 60 * 60 * 1000)
    }
    
    this.$nextTick(() => {
      this.setDefaultApp()
    })
    
    // 添加创建静态菜单的任务
    setTimeout(() => {
      this.createStaticMenu()
    }, 500)
  },
  mounted () {
    // 确保我们总是能看到至少一个顶部菜单
    // 不要立即处理，等待DOM完全渲染
    setTimeout(() => {
      console.log('🚀 [GlobalHeader] mounted 完成，检查状态')
      console.log('🚀 [GlobalHeader] 当前 appMenus:', this.appMenus)
      console.log('🚀 [GlobalHeader] 菜单项数量:', this.appMenus ? this.appMenus.length : 0)
      
      // 如果appMenus为空，尝试重新加载
      if (!this.appMenus || this.appMenus.length === 0) {
        console.log('⚠️ [GlobalHeader] appMenus为空，尝试使用默认值')
        // 使用默认应用列表
        ls.set(ALL_APPS_MENU, this.defaultApps, 7 * 24 * 60 * 60 * 1000)
      }
      
      // 检查DOM
      const headers = document.querySelectorAll('.header-animat')
      console.log('🔍 [GlobalHeader] 找到 header-animat 元素数量:', headers.length)
      
      if (headers.length > 1) {
        console.warn(`检测到${headers.length}个GlobalHeader组件！`)
        
        // 检查哪些header可见
        let visibleHeaders = Array.from(headers).filter(header => {
          const style = window.getComputedStyle(header)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        
        // 如果有多个可见的header，只保留第一个可见的
        if (visibleHeaders.length > 1) {
          for (let i = 1; i < visibleHeaders.length; i++) {
            visibleHeaders[i].style.display = 'none'
            console.log(`隐藏额外的GlobalHeader ${i+1}`)
          }
        }
      }
      
      // 检查菜单项是否渲染
      const menuItems = document.querySelectorAll('.app-menu-item')
      console.log('🔍 [GlobalHeader] 找到 app-menu-item 元素数量:', menuItems.length)
      
      if (menuItems.length === 0) {
        console.warn('⚠️ [GlobalHeader] 未找到菜单项元素，可能渲染失败')
        
        // 检查 ant-menu 是否正确渲染
        const antMenu = document.querySelector('.ant-menu')
        if (antMenu) {
          console.log('🔍 [GlobalHeader] ant-menu 元素存在，宽度:', antMenu.offsetWidth, '高度:', antMenu.offsetHeight)
          console.log('🔍 [GlobalHeader] ant-menu 样式:', window.getComputedStyle(antMenu))
          
          // 检查是否有隐藏的菜单项
          const hiddenMenuItems = document.querySelectorAll('.ant-menu-item')
          console.log('🔍 [GlobalHeader] 所有 ant-menu-item 元素数量:', hiddenMenuItems.length)
          hiddenMenuItems.forEach((item, index) => {
            const style = window.getComputedStyle(item)
            console.log(`🔍 [GlobalHeader] 菜单项 ${index+1} 可见性:`, style.display, style.visibility)
          })
        } else {
          console.warn('⚠️ [GlobalHeader] ant-menu 元素不存在，可能整个菜单未渲染')
        }
        
        // 尝试强制创建测试菜单项
        const parentMenu = document.querySelector('.ant-menu')
        if (parentMenu) {
          const testMenuItem = document.createElement('li')
          testMenuItem.className = 'ant-menu-item app-menu-item'
          testMenuItem.style.lineHeight = '55px'
          testMenuItem.style.height = '55px'
          testMenuItem.style.display = 'inline-block'
          testMenuItem.style.color = 'white'
          testMenuItem.style.background = this.headerColor
          testMenuItem.style.padding = '0 15px'
          testMenuItem.innerText = '强制测试菜单'
          
          // 添加到菜单的开头
          if (parentMenu.firstChild) {
            parentMenu.insertBefore(testMenuItem, parentMenu.firstChild.nextSibling)
          } else {
            parentMenu.appendChild(testMenuItem)
          }
          
          console.log('✅ [GlobalHeader] 已强制添加测试菜单项')
        }
      }
    }, 200)

    document.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  methods: {
    ...mapActions(['MenuChange']),
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
    setDefaultApp() {
      if (this.appMenus && this.appMenus.length > 0) {
        const activeApp = this.appMenus.find(app => app.active)
        if (activeApp) {
          this.defApp = [activeApp.code]
        } else {
          this.defApp = [this.appMenus[0].code]
        }
      }
    },
    switchApp(appCode) {
      this.defApp = []
      const applicationData = this.appMenus.filter(item => item.code === appCode)
      if (!applicationData || applicationData.length === 0) {
        message.error('找不到对应的应用')
        return
      }
      
      // 发出应用切换开始事件
      console.log('🔄 [GlobalHeader] 触发 app-changing 事件')
      this.$emit('app-changing', appCode)
      
      const hideMessage = message.loading('正在切换应用!', 0)
      this.MenuChange(applicationData[0]).then(() => {
        hideMessage()
        
        console.log('✅ [GlobalHeader] MenuChange 完成，准备更新UI')
        
        // 设置默认选中的菜单并触发左侧菜单更新
        this.$nextTick(() => {
          // 更新顶部菜单选中状态
          this.defApp = [appCode]
          
          console.log('🔄 [GlobalHeader] 触发 app-changed 事件')
          // 发出应用切换完成事件，让BasicLayout更新左侧菜单
          this.$emit('app-changed', appCode)
          
          // 短暂延迟后跳转路由，确保菜单已经更新
          setTimeout(() => {
            // 根据应用代码跳转到对应的默认页面
            const targetRoute = this.getDefaultRouteByApp(appCode)
            console.log('🔄 [GlobalHeader] 准备跳转到', targetRoute)
            
            if (targetRoute) {
              this.$router.push(targetRoute).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                  console.error('路由跳转失败:', err)
                }
              })
            }
          }, 100) // 短暂延迟确保DOM更新
        })
      }).catch((err) => {
        hideMessage()
        message.error('应用切换异常: ' + (err.message || ''))
      })
    },
    getDefaultRouteByApp(appCode) {
      // 根据应用代码返回默认路由路径
      switch (appCode) {
        case 'platform':
          return '/welcome'
        case 'system':
          return '/system'
        case 'operation':
          return '/operation'
        case 'business':
          return '/business'
        case 'experiment':
          return '/experiment'
        case 'workflow':
          return '/workflow'
        default:
          return '/welcome'
      }
    },
    handleScroll () {
      if (!this.autoHideHeader) {
        return
      }
      const scrollTop = document.body.scrollTop + document.documentElement.scrollTop
      if (!this.ticking) {
        this.ticking = true
        requestAnimationFrame(() => {
          if (this.oldScrollTop > scrollTop) {
            this.visible = true
          } else if (scrollTop > 300 && this.visible) {
            this.visible = false
          } else if (scrollTop < 300 && !this.visible) {
            this.visible = true
          }
          this.oldScrollTop = scrollTop
          this.ticking = false
        })
      }
    },
    toggle () {
      this.$emit('toggle')
    },
    
    // 强制创建静态菜单，绕过Vue渲染
    createStaticMenu() {
      console.log('🔧 [GlobalHeader] 准备创建静态菜单')
      
      // 找到需要添加菜单的容器
      const header = document.querySelector('.header')
      if (!header) {
        console.warn('⚠️ [GlobalHeader] 找不到header容器，无法创建静态菜单')
        return
      }
      
      // 清除可能存在的旧菜单
      const oldMenu = header.querySelector('.static-top-menu')
      if (oldMenu) {
        oldMenu.remove()
      }
      
      // 创建一个新的菜单容器
      const menuContainer = document.createElement('div')
      menuContainer.className = 'static-top-menu'
      menuContainer.style.cssText = 'position: absolute; top: 0; left: 150px; height: 55px; display: flex; z-index: 999;'
      
      // 获取菜单数据
      const menuItems = [
        { code: 'platform', name: '平台管理', active: true },
        { code: 'system', name: '系统管理', active: false },
        { code: 'operation', name: '运营管理', active: false },
        { code: 'business', name: '业务应用', active: false },
        { code: 'experiment', name: '实验管理', active: false },
        { code: 'workflow', name: '流程中心', active: false }
      ]
      
      // 创建菜单项
      menuItems.forEach(item => {
        const menuItem = document.createElement('div')
        menuItem.className = 'static-menu-item'
        menuItem.style.cssText = `
          display: inline-block;
          height: 55px;
          line-height: 55px;
          padding: 0 15px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
          ${item.active ? 'background: rgba(255,255,255,0.2);' : ''}
        `
        menuItem.innerText = item.name
        menuItem.dataset.code = item.code
        
        // 添加点击事件
        menuItem.addEventListener('click', () => {
          console.log('🖱️ [GlobalHeader] 点击静态菜单项:', item.code)
          this.switchApp(item.code)
          
          // 更新激活状态
          document.querySelectorAll('.static-menu-item').forEach(el => {
            el.style.background = ''
          })
          menuItem.style.background = 'rgba(255,255,255,0.2)'
        })
        
        menuContainer.appendChild(menuItem)
      })
      
      // 添加到DOM
      header.appendChild(menuContainer)
      console.log('✅ [GlobalHeader] 静态菜单创建完成')
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('scroll', this.handleScroll, true)
  }
}
</script>

<style lang="less">
@import '../index.less';

.header-animat{
  position: relative;
  z-index: @ant-global-header-zindex;
}
.showHeader-enter-active {
  transition: all 0.25s ease;
}
.showHeader-leave-active {
  transition: all 0.5s ease;
}
.showHeader-enter, .showHeader-leave-to {
  opacity: 0;
}

/* 应用菜单项样式 */
.app-menu-item {
  padding: 0 16px !important;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.3s;
  height: 55px !important;
  line-height: 55px !important;
  display: inline-block !important;
  min-width: 80px;
  text-align: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* 右侧用户菜单容器 */
.right-menu {
  float: right;
  margin-right: 12px;
}

/* 用户菜单容器 */
.user-menu-container {
  display: inline-block;
}

/* 确保header类的样式正确 */
.header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #1890FF;
}
</style>
