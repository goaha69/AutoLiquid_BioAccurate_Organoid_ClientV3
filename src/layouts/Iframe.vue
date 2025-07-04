<template>
  <div v-if="!link">404</div>
  <iframe 
    v-else
    id="iframe" 
    :height="height" 
    :src="url" 
    style="width: 100%;overflow : hidden;" 
    frameBorder="0"
  ></iframe>
</template>

<script>
import { ACCESS_TOKEN } from '@/store/mutation-types'

// localStorage辅助函数
const ls = {
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
  }
}

export default {
  name: 'Iframe',
  data () {
    return {
    }
  },
  computed: {
    link() {
      return this.$route.meta.link
    },
    url() {
      if (!this.link) return ''
      
      if (this.link.indexOf('token=') > -1) {
        return this.link + ls.get(ACCESS_TOKEN)
      } else {
        return this.link
      }
    },
    height() {
      const deviceHeight = document.documentElement.clientHeight
      return (Number(deviceHeight) - 260) + 'px'
    }
  }
}
</script>
