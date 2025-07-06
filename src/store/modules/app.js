import {
  SIDEBAR_TYPE,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR,
  DEFAULT_COLOR_WEAK,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_TAB,
  DEFAULT_HEADER_COLOR,
  DEFAULT_MENU_COLOR,
  DEFAULT_VERSION_CODE,
  ROUTE_EXCLUDE
} from '@/store/mutation-types'

// localStorage辅助函数
const ls = {
  set: (key, value, expire) => {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem(key, JSON.stringify(data))
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem(key)
        return defaultValue
      }
      return data.value
    } catch {
      return defaultValue
    }
  },
  remove: (key) => {
    localStorage.removeItem(key)
  }
}

const app = {
  state: {
    sidebar: ls.get(SIDEBAR_TYPE, true),
    device: 'desktop',
    theme: ls.get(DEFAULT_THEME, 'dark'),
    layout: ls.get(DEFAULT_LAYOUT_MODE, 'sidemenu'),
    contentWidth: ls.get(DEFAULT_CONTENT_WIDTH_TYPE, 'Fluid'),
    fixedHeader: ls.get(DEFAULT_FIXED_HEADER, false),
    fixSiderbar: ls.get(DEFAULT_FIXED_SIDEMENU, false),
    autoHideHeader: ls.get(DEFAULT_FIXED_HEADER_HIDDEN, false),
    color: ls.get(DEFAULT_COLOR, '#1890ff'),
    weak: ls.get(DEFAULT_COLOR_WEAK, false),
    multiTab: ls.get(DEFAULT_MULTI_TAB, true),
    headerColor: ls.get(DEFAULT_HEADER_COLOR, '#FFFFFF'),
    menuColor: ls.get(DEFAULT_MENU_COLOR, '#FFFFFF'),
    versionCode: ls.get(DEFAULT_VERSION_CODE, '2.0.0.2')
  },
  mutations: {
    SET_SIDEBAR_TYPE: (state, type) => {
      state.sidebar = type
      ls.set(SIDEBAR_TYPE, type)
    },
    CLOSE_SIDEBAR: (state) => {
      ls.set(SIDEBAR_TYPE, true)
      state.sidebar = false
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    TOGGLE_THEME: (state, theme) => {
      ls.set(DEFAULT_THEME, theme)
      state.theme = theme
    },
    TOGGLE_LAYOUT_MODE: (state, layout) => {
      ls.set(DEFAULT_LAYOUT_MODE, layout)
      state.layout = layout
    },
    TOGGLE_FIXED_HEADER: (state, fixed) => {
      ls.set(DEFAULT_FIXED_HEADER, fixed)
      state.fixedHeader = fixed
    },
    TOGGLE_FIXED_SIDERBAR: (state, fixed) => {
      ls.set(DEFAULT_FIXED_SIDEMENU, fixed)
      state.fixSiderbar = fixed
    },
    TOGGLE_FIXED_HEADER_HIDDEN: (state, show) => {
      ls.set(DEFAULT_FIXED_HEADER_HIDDEN, show)
      state.autoHideHeader = show
    },
    TOGGLE_CONTENT_WIDTH: (state, type) => {
      ls.set(DEFAULT_CONTENT_WIDTH_TYPE, type)
      state.contentWidth = type
    },
    TOGGLE_COLOR: (state, color) => {
      ls.set(DEFAULT_COLOR, color)
      state.color = color
    },
    TOGGLE_WEAK: (state, flag) => {
      ls.set(DEFAULT_COLOR_WEAK, flag)
      state.weak = flag
    },
    TOGGLE_MULTI_TAB: (state, bool) => {
      console.log('🔧 [Store] TOGGLE_MULTI_TAB:', bool)
      ls.set(DEFAULT_MULTI_TAB, bool)
      state.multiTab = bool
    },
    TOGGLE_HEADER_COLOR: (state, color) => {
      ls.set(DEFAULT_HEADER_COLOR, color)
      state.headerColor = color
    },
    TOGGLE_MENU_COLOR: (state, color) => {
      ls.set(DEFAULT_MENU_COLOR, color)
      state.menuColor = color
    },
    TOGGLE_VERSION_CODE: (state, code) => {
      ls.set(DEFAULT_VERSION_CODE, code)
      state.versionCode = code
    },
  },
  actions: {
    setSidebar ({ commit }, type) {
      commit('SET_SIDEBAR_TYPE', type)
    },
    CloseSidebar ({ commit }) {
      commit('CLOSE_SIDEBAR')
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    ToggleTheme ({ commit }, theme) {
      commit('TOGGLE_THEME', theme)
    },
    ToggleLayoutMode ({ commit }, mode) {
      commit('TOGGLE_LAYOUT_MODE', mode)
    },
    ToggleFixedHeader ({ commit }, fixedHeader) {
      if (!fixedHeader) {
        commit('TOGGLE_FIXED_HEADER_HIDDEN', false)
      }
      commit('TOGGLE_FIXED_HEADER', fixedHeader)
    },
    ToggleFixSiderbar ({ commit }, fixSiderbar) {
      commit('TOGGLE_FIXED_SIDERBAR', fixSiderbar)
    },
    ToggleFixedHeaderHidden ({ commit }, show) {
      commit('TOGGLE_FIXED_HEADER_HIDDEN', show)
    },
    ToggleContentWidth ({ commit }, type) {
      commit('TOGGLE_CONTENT_WIDTH', type)
    },
    ToggleColor ({ commit }, color) {
      commit('TOGGLE_COLOR', color)
    },
    ToggleWeak ({ commit }, weakFlag) {
      commit('TOGGLE_WEAK', weakFlag)
    },
    ToggleMultiTab ({ commit }, bool) {
      commit('TOGGLE_MULTI_TAB', bool)
    },
    ToggleHeaderColor ({ commit }, color) {
      commit('TOGGLE_HEADER_COLOR', color)
    },
    ToggleMenuColor ({ commit }, color) {
      commit('TOGGLE_MENU_COLOR', color)
    },
    ToggleVersionCode ({ commit }, code) {
      commit('TOGGLE_VERSION_CODE', code)
    },
  }
}

export default app
