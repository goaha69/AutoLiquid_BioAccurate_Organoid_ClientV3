<template>
  <div style="padding: 20px; background: #f0f2f5; min-height: 400px;">
    <h1>🎉 路由系统测试页面</h1>
    <p>如果您看到这个页面,说明Vue路由系统正在正常工作!</p>
    
    <div style="background: white; padding: 16px; border-radius: 6px; margin-top: 20px;">
      <h3>调试信息:</h3>
      <p><strong>当前路由:</strong> {{ $route.path }}</p>
      <p><strong>路由名称:</strong> {{ $route.name }}</p>
      <p><strong>时间:</strong> {{ currentTime }}</p>
    </div>

    <div style="margin-top: 20px;">
      <a-button type="primary" @click="goToWelcome">前往欢迎页</a-button>
      <a-button style="margin-left: 10px;" @click="checkRoutes">检查路由</a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestPage',
  data() {
    return {
      currentTime: new Date().toLocaleString()
    }
  },
  methods: {
    goToWelcome() {
      this.$router.push('/welcome')
    },
    checkRoutes() {
      console.log('🔍 所有注册的路由:', this.$router.getRoutes())
      console.log('🔍 当前路由对象:', this.$route)
    }
  }
}
</script>
