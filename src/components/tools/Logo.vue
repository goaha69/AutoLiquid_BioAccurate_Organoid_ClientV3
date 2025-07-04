<template>
  <div class="logo" style="background:#FFFFFF">
    <router-link  to="{name : 'Console'}">
     <img src="~@/assets/logo.png" alt="logo">
      <h1 v-if="showTitle" style="color:#000000">{{ this.titles }}</h1>
    </router-link>
  </div>
</template>

<script>
// import LogoSvg from '@/assets/logo.svginline'

export default {
  name: 'Logo',
  // components: {
  //   LogoSvg
  // },
  props: {
    title: {
      type: String,
      default: '创芯国际',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  data () {
    return {
      titles: '',
      layoutMode: 'sidemenu' // 默认布局模式
    }
  },
  created () {
    // 从localStorage加载布局模式
    try {
      const appSettings = localStorage.getItem('appSettings')
      if (appSettings) {
        const settings = JSON.parse(appSettings)
        this.layoutMode = settings.layout || 'sidemenu'
      }
    } catch (error) {
      console.error('获取应用设置失败:', error)
    }

    if (this.layoutMode === 'topmenu') {
      if (this.title.length > 8) {
        this.titles = this.title.substring(0, 8) + '...'
      } else {
        this.titles = this.title
      }
    } else {
      if (this.title.length > 10) {
        this.titles = this.title.substring(0, 8) + '...'
      } else {
        this.titles = this.title
      }
    }
  }
}
</script>

