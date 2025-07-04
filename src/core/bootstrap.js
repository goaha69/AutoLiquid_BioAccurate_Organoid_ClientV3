import store from '@/store/'
import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_TAB,
  DEFAULT_HEADER_COLOR,
  DEFAULT_MENU_COLOR,
  DEFAULT_VERSION_CODE
} from '@/store/mutation-types'
import config from '@/config/defaultSettings'

// localStorage辅助函数
const ls = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`vuejs__${key}`)
      if (!item) return defaultValue
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem(`vuejs__${key}`)
        return defaultValue
      }
      return data.value
    } catch {
      return defaultValue
    }
  }
}

export default function Initializer() {
  // console.log(`API_URL: ${process.env.VUE_APP_API_BASE_URL}`)

  store.commit('SET_SIDEBAR_TYPE', ls.get(SIDEBAR_TYPE, true))
  store.commit('TOGGLE_THEME', ls.get(DEFAULT_THEME, config.navTheme))
  store.commit('TOGGLE_LAYOUT_MODE', ls.get(DEFAULT_LAYOUT_MODE, config.layout))
  store.commit('TOGGLE_FIXED_HEADER', ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
  store.commit('TOGGLE_FIXED_SIDERBAR', ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
  store.commit('TOGGLE_CONTENT_WIDTH', ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
  store.commit('TOGGLE_FIXED_HEADER_HIDDEN', ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
  store.commit('TOGGLE_WEAK', ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
  store.commit('TOGGLE_COLOR', ls.get(DEFAULT_COLOR, config.primaryColor))
  store.commit('TOGGLE_MULTI_TAB', ls.get(DEFAULT_MULTI_TAB, config.multiTab))
  store.commit('SET_TOKEN', ls.get(ACCESS_TOKEN))
  store.commit('TOGGLE_HEADER_COLOR', ls.get(DEFAULT_HEADER_COLOR, config.headerColor))
  store.commit('TOGGLE_MENU_COLOR', ls.get(DEFAULT_MENU_COLOR, config.menuColor))
  store.commit('TOGGLE_VERSION_CODE', ls.get(DEFAULT_VERSION_CODE, config.versionCode))
  // last step
}
