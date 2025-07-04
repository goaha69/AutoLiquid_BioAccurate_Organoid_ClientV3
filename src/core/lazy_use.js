import Storage from '@/utils/storage'
import config from '@/config/defaultSettings'

// base library
import { components, globalProperties, icons } from '@/core/lazy_lib/components_use'
import Viser from 'viser-vue'

// ext library
import VueClipboard from '@/utils/clipboard'
import VueCropper from 'vue-cropper'
import MultiTab from '@/components/MultiTab'
import PageLoading from '@/components/PageLoading'
import PermissionHelper from '@/utils/helper/permission'
import './directives/action'

// 创建兼容的表单创建器
const createFormCompat = (component) => {
  // 在Vue 3中，我们返回一个包装器，让组件可以直接使用响应式数据
  return {
    getFieldDecorator: (name, options = {}) => {
      // 返回一个函数，用于包装表单项
      return (element) => {
        // 在Vue 3中，直接返回元素，表单验证由ant-design-vue 3.x的Form组件处理
        return element
      }
    },
    validateFields: (fields, options, callback) => {
      // 兼容性函数，在实际使用中需要组件自己处理验证
      if (typeof fields === 'function') {
        callback = fields
        fields = undefined
        options = {}
      }
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      // 这里需要实际的表单验证逻辑，暂时返回空对象
      if (callback) {
        callback(null, {})
      }
    },
    resetFields: () => {
      // 重置表单字段的兼容性函数
    },
    setFieldsValue: (values) => {
      // 设置表单值的兼容性函数
    },
    getFieldsValue: () => {
      // 获取表单值的兼容性函数
      return {}
    }
  }
}

// 导出配置函数，供main.js使用
export function setupPlugins(app) {
  // 注册ant-design-vue组件
  components.forEach(component => {
    app.use(component)
  })
  
  // 注册图标组件
  Object.keys(icons).forEach(key => {
    app.component(key, icons[key])
  })
  
  // 设置全局属性
  Object.keys(globalProperties).forEach(key => {
    app.config.globalProperties[key] = globalProperties[key]
  })
  
  // 添加兼容的表单创建器
  app.config.globalProperties.$form = {
    createForm: createFormCompat
  }
  
  // 注册其他插件
  app.use(Viser)
  app.use(MultiTab)
  app.use(PageLoading)
  app.use(Storage, config.storageOptions)
  app.use(VueClipboard)
  app.use(PermissionHelper)
  app.use(VueCropper)
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[antd-pro] NOTICE: Antd use lazy-load.')
  }
}
