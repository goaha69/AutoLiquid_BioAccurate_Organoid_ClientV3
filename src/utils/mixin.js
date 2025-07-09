import { deviceEnquire, DEVICE_TYPE } from '@/utils/device'
import { mapState } from 'vuex'
import defaultSettings from '@/config/defaultSettings'

// 获取应用设置的函数
function getAppSettings() {
  const storedSettings = localStorage.getItem('appSettings')
  if (storedSettings) {
    try {
      return { ...defaultSettings, ...JSON.parse(storedSettings) }
    } catch (error) {
      console.warn('Failed to parse stored app settings:', error)
      return defaultSettings
    }
  }
  return defaultSettings
}

const mixin = {
  computed: {
    ...mapState({
      layoutMode: state => state.app.layout,
      navTheme: state => state.app.theme,
      primaryColor: state => state.app.color,
      colorWeak: state => state.app.weak,
      fixedHeader: state => state.app.fixedHeader,
      fixSiderbar: state => state.app.fixSiderbar,
      contentWidth: state => state.app.contentWidth,
      autoHideHeader: state => state.app.autoHideHeader,
      sidebarOpened: state => state.app.sidebar,
      multiTab: state => state.app.multiTab,
      headerColor: state => state.app.headerColor,
      menuColor: state => state.app.menuColor,
      versionCode: state => state.app.versionCode
    }),
    // 兼容性别名
    fixSidebar() {
      return this.fixSiderbar
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
    ...mapState({
      device: state => state.app.device
    })
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

export { mixin, AppDeviceEnquire, mixinDevice, getAppSettings }
