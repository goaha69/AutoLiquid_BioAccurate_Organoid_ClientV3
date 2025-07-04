// Vue3需要改用createRouter和createWebHistory
import { createRouter, createWebHistory } from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

// hack router push callback (Vue3版本的兼容处理)
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRouterMap
})

// 添加一个刷新路由，用于菜单切换后刷新
router.addRoute({
  path: '/refresh-router',
  name: 'RefreshRouter',
  component: {
    render() {
      return null
    },
    beforeRouteEnter(to, from, next) {
      // 获取重定向目标
      const redirect = to.query.redirect || '/'
      next(redirect)
    }
  }
})

// 处理路由错误
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
