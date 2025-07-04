import { deviceEnquire, DEVICE_TYPE } from '@/utils/device'

// 应用配置的默认值
const getAppSettings = () => {
  try {
    const appSettings = localStorage.getItem('appSettings')
    if (appSettings) {
      return JSON.parse(appSettings)
    }
  } catch (error) {
    console.error('获取应用设置失败:', error)
  }
  
  // 返回默认设置
  return {
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
    versionCode: '2.1.0',
    device: DEVICE_TYPE.DESKTOP
  }
}

const mixin = {
  computed: {
    layoutMode() {
      return getAppSettings().layout
    },
    navTheme() {
      return getAppSettings().theme
    },
    primaryColor() {
      return getAppSettings().color
    },
    colorWeak() {
      return getAppSettings().weak
    },
    fixedHeader() {
      return getAppSettings().fixedHeader
    },
    fixSiderbar() {
      return getAppSettings().fixSiderbar
    },
    fixSidebar() {
      return getAppSettings().fixSiderbar
    },
    contentWidth() {
      return getAppSettings().contentWidth
    },
    autoHideHeader() {
      return getAppSettings().autoHideHeader
    },
    sidebarOpened() {
      return getAppSettings().sidebar
    },
    multiTab() {
      return getAppSettings().multiTab
    },
    headerColor() {
      return getAppSettings().headerColor
    },
    menuColor() {
      return getAppSettings().menuColor
    },
    versionCode() {
      return getAppSettings().versionCode
    }
  },
  methods: {
    isTopMenu () {
      return this.layoutMode === 'topmenu'
    },
    isSideMenu () {
      return !this.isTopMenu()
    }
  }
}

const mixinDevice = {
  computed: {
    device() {
      return getAppSettings().device
    }
  },
  methods: {
    isMobile () {
      return this.device === DEVICE_TYPE.MOBILE
    },
    isDesktop () {
      return this.device === DEVICE_TYPE.DESKTOP
    },
    isTablet () {
      return this.device === DEVICE_TYPE.TABLET
    }
  }
}

const AppDeviceEnquire = {
  mounted () {
    // 设备检测逻辑，不依赖 Vuex
    deviceEnquire(deviceType => {
      const currentSettings = getAppSettings()
      const newSettings = { ...currentSettings, device: deviceType }
      
      switch (deviceType) {
        case DEVICE_TYPE.DESKTOP:
          newSettings.sidebar = true
          break
        case DEVICE_TYPE.TABLET:
          newSettings.sidebar = false
          break
        case DEVICE_TYPE.MOBILE:
        default:
          newSettings.sidebar = true
          break
      }
      
      // 保存新的设置到 localStorage
      localStorage.setItem('appSettings', JSON.stringify(newSettings))
    })
  }
}

// 创建组合式API版本的mixin
export function useAppSettings() {
  return {
    layoutMode: () => getAppSettings().layout,
    navTheme: () => getAppSettings().theme,
    primaryColor: () => getAppSettings().color,
    colorWeak: () => getAppSettings().weak,
    fixedHeader: () => getAppSettings().fixedHeader,
    fixSiderbar: () => getAppSettings().fixSiderbar,
    fixSidebar: () => getAppSettings().fixSiderbar,
    contentWidth: () => getAppSettings().contentWidth,
    autoHideHeader: () => getAppSettings().autoHideHeader,
    sidebarOpened: () => getAppSettings().sidebar,
    multiTab: () => getAppSettings().multiTab,
    headerColor: () => getAppSettings().headerColor,
    menuColor: () => getAppSettings().menuColor,
    versionCode: () => getAppSettings().versionCode,
    device: () => getAppSettings().device,
    isTopMenu: () => getAppSettings().layout === 'topmenu',
    isSideMenu: () => getAppSettings().layout !== 'topmenu',
    isMobile: () => getAppSettings().device === DEVICE_TYPE.MOBILE,
    isDesktop: () => getAppSettings().device === DEVICE_TYPE.DESKTOP,
    isTablet: () => getAppSettings().device === DEVICE_TYPE.TABLET,
  }
}

export { mixin, AppDeviceEnquire, mixinDevice }
