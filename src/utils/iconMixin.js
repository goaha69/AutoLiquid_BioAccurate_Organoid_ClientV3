import { h } from 'vue'
import { getIconComponent } from './iconUtil'

// 全局混入，用于处理a-icon兼容性
export const iconMixin = {
  methods: {
    // 兼容旧的a-icon语法
    renderAIcon(type, props = {}) {
      const IconComponent = getIconComponent(type)
      if (!IconComponent) return null
      return h(IconComponent, props)
    },
    
    // 获取图标组件
    getIcon(type) {
      return getIconComponent(type)
    }
  }
}

// 全局注册a-icon组件（兼容性组件）
export const AIcon = {
  name: 'AIcon',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs }) {
    const IconComponent = getIconComponent(props.type)
    if (!IconComponent) {
      console.warn(`Icon type "${props.type}" not found, using default icon`)
      return () => h('span', { ...attrs }, '?')
    }
    return () => h(IconComponent, attrs)
  }
} 