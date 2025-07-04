<template>
  <div class="route-view-container">
    <router-view v-slot="{ Component }">
      <transition name="page-transition" mode="out-in">
        <keep-alive v-if="keepAliveEnabled">
          <component :is="Component" :key="$route.fullPath" />
        </keep-alive>
        <component v-else :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'RouteView',
  props: {
    keepAlive: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const multiTab = computed(() => store.getters.multiTab)
    
    // 计算是否需要keepAlive
    const keepAliveEnabled = computed(() => {
      const meta = route.meta || {}
      console.log('🚀 RouteView keepAlive check:', {
        propsKeepAlive: props.keepAlive,
        multiTab: multiTab.value,
        metaKeepAlive: meta.keepAlive,
        path: route.path
      })
      return props.keepAlive || multiTab.value || meta.keepAlive
    })

    onMounted(() => {
      console.log('🔍 RouteView 组件挂载，当前路由:', route.path, route.matched)
    })

    return {
      keepAliveEnabled
    }
  }
}
</script>

<style lang="less" scoped>
.content-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
}

.route-view-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.loading-component {
  padding: 50px;
  text-align: center;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  margin: 20px 0;
}
</style>
