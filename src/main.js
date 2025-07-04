// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { VueAxios } from './utils/request'
// WARNING: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.
import './mock'

import bootstrap from './core/bootstrap'
import { setupPlugins } from './core/lazy_use'
import { filters } from './utils/filter' // global filter
import './components/global.less'
import socket from './utils/socket'
import { Dialog } from '@/components'
import { hasBtnPermission } from './utils/permissions' // button permission
import { sysApplication } from './utils/applocation'
// 临时注释k-form-design，因为它可能与Vue 3不兼容
// import 'k-form-design/packages/core/useComponents'
// import KFormDesign from 'k-form-design/packages/use.js'
// import 'k-form-design/lib/k-form-design.css'
import 'ant-design-vue/dist/reset.css'
// 临时注释掉data-view库，因为与Vue 3不兼容
// import dataV from '@jiaminghi/data-view'
import VueContextMenu from 'vue-contextmenu'
import vcolorpicker from 'vcolorpicker'
import { connectWebsocket,heartbeatMethod,heartbeatInstall } from './utils/socket'
import { AIcon } from './utils/iconMixin'
// import { connectWebsocket} from './utils/socket'

console.log('🚀 开始初始化Vue应用...')

const app = createApp(App)

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('❌ Vue全局错误:', err)
  console.error('❌ 错误信息:', info)
  console.error('❌ 组件实例:', instance)
  
  // 如果是组件相关错误，记录更多信息
  if (instance && instance.$options) {
    console.error('❌ 组件名称:', instance.$options.name || 'Unknown')
  }
}

// 添加全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('⚠️ Vue警告:', msg)
  console.warn('⚠️ 组件实例:', instance)
  console.warn('⚠️ 组件堆栈:', trace)
}

// 使用setupPlugins配置所有插件
setupPlugins(app)

app.use(router)
app.use(store)
app.use(VueAxios)
app.use(Dialog)
// app.use(dataV)
app.use(VueContextMenu)
app.use(vcolorpicker)
app.use(socket, '/hubs/chatHub')
// app.use(KFormDesign) // 临时注释

app.config.globalProperties.hasPerm = hasBtnPermission
app.config.globalProperties.applocation = sysApplication
// 组合式API过滤器注册
app.provide('$filters', filters)

// Vue3全局mixin注册
app.mixin({
  created() {
    // console.log('Vue 组件已创建')
  }
})

// 注册全局a-icon兼容组件
app.component('a-icon', AIcon)

console.log('🔧 配置完成，准备导入权限控制...')
console.log('🔍 Router实例:', router)

// 同步导入权限控制
import './permission'

console.log('✅ 权限控制导入成功')

// 挂载应用
console.log('🎯 挂载Vue应用到 #app')
app.mount('#app')
console.log('✅ Vue应用挂载完成')
