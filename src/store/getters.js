const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  color: state => state.app.color,
  headerColor: state => state.app.headerColor,
  menuColor: state => state.app.menuColor,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  nickname: state => state.user.name,
  welcome: state => state.user.welcome,
  roles: state => state.user.roles,
  buttons: state => state.user.buttons,
  admintype: state => state.user.admintype,
  userInfo: state => state.user.info,
  userNotices: state => state.user.notices,
  addRouters: state => state.permission.addRouters,
  multiTab: state => state.app.multiTab,
  lang: state => state.i18n.lang,
  routeExclude:state=>state.permission.routeExclude,
  versionCode:state=>state.app.versionCode,
  menus: state => state.permission.menus
}

export default getters
