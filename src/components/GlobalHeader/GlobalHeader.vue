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
            <!-- 隐藏 Vue 渲染的菜单图标，只使用静态生成的图标 -->
            <!-- 
            <menu-unfold-outlined v-if="collapsed" class="trigger" style="font-size: 18px; padding: 0 10px;" @click="toggle"></menu-unfold-outlined>
            <menu-fold-outlined v-else class="trigger" style="font-size: 18px; padding: 0 10px;" @click="toggle"></menu-fold-outlined>
            -->

            <!-- 调试信息：显示appMenus数量 -->
            <!-- <div style="color: white; position: absolute; top: 0; left: 80px; font-size: 12px;">
              菜单数量: {{ appMenus ? appMenus.length : 0 }}
            </div> -->

            <!-- 由于我们使用了静态生成的菜单，这里隐藏 Vue 渲染的菜单项 -->
            <!-- 
            <a-menu-item 
              v-for="(item) in appMenus" 
              :key="item.code" 
              class="app-menu-item" 
              :style="{ lineHeight: '55px', paddingLeft: '15px', paddingRight: '15px', height: '55px', display: 'inline-block', color: 'white', background: headerColor }"
              @click="switchApp(item.code)"
            >
              {{ item.name }}
            </a-menu-item>
             -->
            
            <!-- 隐藏测试菜单项 -->
            <!-- 
            <a-menu-item key="test-menu" class="app-menu-item" :style="{ lineHeight: '55px', paddingLeft: '15px', paddingRight: '15px', height: '55px', display: 'inline-block', color: 'white', background: headerColor }">
              测试菜单
            </a-menu-item>
             -->
            
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
      
      // 如果仍然没有，强制使用默认的应用列表
      if (!allApps || allApps.length === 0) {
        console.warn('⚠️ [GlobalHeader] 没有找到应用数据，强制使用默认值')
        
        // 保存默认应用到 localStorage
        ls.set(ALL_APPS_MENU, testApps, 7 * 24 * 60 * 60 * 1000)
        
        console.log('📱 [GlobalHeader] 返回默认应用:', testApps)
        return testApps
      }
      
      // 确保返回的数据每个项都有 code 和 name 属性
      const validApps = allApps.filter(app => app && app.code && app.name)
      if (validApps.length !== allApps.length) {
        console.warn('⚠️ [GlobalHeader] 发现无效的应用数据，已过滤')
        console.log('原始数据:', allApps)
        console.log('过滤后数据:', validApps)
      }
      
      console.log('📱 [GlobalHeader] 返回应用列表:', validApps.length > 0 ? validApps : testApps)
      return validApps.length > 0 ? validApps : testApps
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
    },
    // 监听appMenus变化，重新创建静态菜单
    appMenus: {
      handler(newVal) {
        console.log('🔄 [GlobalHeader] appMenus 数据变化，重新创建静态菜单')
        console.log('🔄 [GlobalHeader] newVal:', newVal)
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.createStaticMenu()
          })
        }
      },
      immediate: true,  // 改为立即执行
      deep: true
    }
  },
  created () {
    this.loadSettings()
    
    // 强制确保加载默认应用
    let allApps = ls.get(ALL_APPS_MENU, null)
    console.log('📱 [GlobalHeader] created - 检查应用列表:', allApps)
    
    if (!allApps || allApps.length === 0) {
      console.log('📱 [GlobalHeader] created - 创建默认应用列表')
      const defaultApps = [
        { code: 'platform', name: '平台管理', active: true, path: '/welcome' },
        { code: 'system', name: '系统管理', active: false, path: '/system' },
        { code: 'operation', name: '运营管理', active: false, path: '/operation' },
        { code: 'business', name: '业务应用', active: false, path: '/business' },
        { code: 'experiment', name: '实验管理', active: false, path: '/experiment' },
        { code: 'workflow', name: '流程中心', active: false, path: '/workflow' }
      ]
      ls.set(ALL_APPS_MENU, defaultApps, 7 * 24 * 60 * 60 * 1000)
    }
    
    this.$nextTick(() => {
      this.setDefaultApp()
    })
  },
  mounted () {
    // 确保我们总是能看到至少一个顶部菜单
    // 不要立即处理，等待DOM完全渲染
    setTimeout(() => {
      console.log('🚀 [GlobalHeader] mounted 完成，检查状态')
      
      // 检查DOM，确保没有多余的header
      const headers = document.querySelectorAll('.header-animat')
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
      
      // 等待数据准备好后再创建静态菜单
      this.$nextTick(() => {
        // 延迟一些时间，确保计算属性appMenus已经准备好
        setTimeout(() => {
          console.log('🔧 [GlobalHeader] 准备创建静态菜单，当前appMenus:', this.appMenus)
          this.createStaticMenu()
        }, 500)
      })
      
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
      console.log('🖱️ [GlobalHeader] switchApp 被调用，appCode:', appCode)
      console.log('🔍 [GlobalHeader] 当前 appMenus:', this.appMenus)
      console.log('🔍 [GlobalHeader] appMenus 长度:', this.appMenus ? this.appMenus.length : 0)
      
      // 详细输出每个应用的code，帮助调试
      if (this.appMenus && this.appMenus.length > 0) {
        console.log('🔍 [GlobalHeader] 所有可用的应用代码:')
        this.appMenus.forEach((app, index) => {
          console.log(`  ${index}: { code: "${app.code}", name: "${app.name}" }`)
        })
      }
      
      this.defApp = []
      const applicationData = this.appMenus.filter(item => item.code === appCode)
      console.log('🔍 [GlobalHeader] 过滤后的 applicationData:', applicationData)
      
      if (!applicationData || applicationData.length === 0) {
        console.error('❌ [GlobalHeader] 找不到对应的应用:', appCode)
        console.error('❌ [GlobalHeader] 可用的应用列表:', this.appMenus.map(app => app.code))
        
        // 尝试备用匹配方案：通过名称匹配
        const nameMap = {
          'platform': '平台管理',
          'system': '系统管理', 
          'operation': '运营管理',
          'business': '业务应用',
          'experiment': '实验管理',
          'workflow': '流程中心'
        }
        
        const targetName = nameMap[appCode]
        if (targetName) {
          const fallbackApp = this.appMenus.find(app => app.name === targetName)
          if (fallbackApp) {
            console.log('✅ [GlobalHeader] 通过名称找到备用应用:', fallbackApp)
            applicationData.push(fallbackApp)
          }
        }
        
        // 如果仍然找不到，报错并返回
        if (!applicationData || applicationData.length === 0) {
          message.error('找不到对应的应用: ' + appCode)
          return
        }
      }
      
      console.log('✅ [GlobalHeader] 找到应用数据:', applicationData[0])
      
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
        console.error('❌ [GlobalHeader] MenuChange 失败:', err)
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
      menuContainer.style.cssText = 'position: absolute; top: 0; left: 40px; height: 55px; display: flex; z-index: 999;'
      
      // 先创建菜单折叠/展开图标
      const triggerIcon = document.createElement('div')
      triggerIcon.className = 'static-trigger'
      triggerIcon.style.cssText = `
        display: inline-block;
        height: 55px;
        line-height: 55px;
        padding: 0 10px;
        margin-right: 5px;
        font-size: 18px;
        cursor: pointer;
        color: white;
      `
      // 根据当前折叠状态设置图标
      triggerIcon.innerHTML = this.collapsed ? 
        '<svg viewBox="64 64 896 896" focusable="false" data-icon="menu-unfold" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 000-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0014.4 7z"></path></svg>' :
        '<svg viewBox="64 64 896 896" focusable="false" data-icon="menu-fold" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"></path></svg>';
      
      // 添加点击事件处理折叠/展开侧边栏
      triggerIcon.addEventListener('click', () => {
        this.toggle();
        // 切换图标
        setTimeout(() => {
          triggerIcon.innerHTML = this.collapsed ? 
            '<svg viewBox="64 64 896 896" focusable="false" data-icon="menu-unfold" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 000-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0014.4 7z"></path></svg>' :
            '<svg viewBox="64 64 896 896" focusable="false" data-icon="menu-fold" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"></path></svg>';
        }, 100);
      });        // 将折叠/展开图标添加到菜单容器
      menuContainer.appendChild(triggerIcon)
      
      // 添加一个小的间隔元素
      const spacer = document.createElement('div')
      spacer.style.width = '10px'
      menuContainer.appendChild(spacer)
      
      // 使用动态的 appMenus 数据，如果没有数据则使用默认值
      const menuItems = this.appMenus && this.appMenus.length > 0 ? this.appMenus : [
        { code: 'platform', name: '平台管理', active: true },
        { code: 'system', name: '系统管理', active: false },
        { code: 'operation', name: '运营管理', active: false },
        { code: 'business', name: '业务应用', active: false },
        { code: 'experiment', name: '实验管理', active: false },
        { code: 'workflow', name: '流程中心', active: false }
      ]
      
      console.log('🔍 [GlobalHeader] createStaticMenu 使用的菜单数据:', menuItems)
      
      // 输出用于调试的菜单代码对比
      console.log('🔍 [GlobalHeader] 静态菜单将使用的代码:')
      menuItems.forEach((item, index) => {
        console.log(`  静态菜单 ${index}: { code: "${item.code}", name: "${item.name}" }`)
      })
      
      // 创建菜单项
      menuItems.forEach(item => {
        const menuItem = document.createElement('div')
        menuItem.className = 'static-menu-item'
        menuItem.style.cssText = `
          display: inline-block;
          height: 55px;
          line-height: 55px;
          padding: 0 20px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: ${item.active ? 'bold' : 'normal'};
          transition: background 0.3s;
          ${item.active ? 'background: rgba(255,255,255,0.2);' : ''}
          border-bottom: ${item.active ? '2px solid white' : 'none'};
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
