// 替代 vue-clipboard2，提供剪贴板功能
import { useClipboard } from '@vueuse/core'

const VueClipboard = {
  install(app) {
    // 添加全局方法
    app.config.globalProperties.$copyText = (text) => {
      const { copy, copied, isSupported } = useClipboard({ legacy: true })
      
      if (!isSupported.value) {
        console.warn('Clipboard API not supported')
        return Promise.reject(new Error('Clipboard API not supported'))
      }
      
      return copy(text)
        .then(() => {
          return Promise.resolve({ text, success: true })
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }
  }
}

// 保持与vue-clipboard2相同的配置接口
VueClipboard.config = {
  autoSetContainer: true
}

export default VueClipboard
