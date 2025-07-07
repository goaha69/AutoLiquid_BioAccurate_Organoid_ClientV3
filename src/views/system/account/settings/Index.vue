<template>
  <div class="page-header-index-wide">
    <a-card :bordered="false" :bodyStyle="{ padding: '16px 0', height: '100%' }" :style="{ height: '100%' }">
      <div class="account-settings-info-main" :class="device">
        <div class="account-settings-info-left">
          <a-menu
            :mode="device === 'mobile' ? 'horizontal' : 'inline'"
            :style="{ border: '0', width: device === 'mobile' ? '560px' : 'auto'}"
            :selectedKeys="selectedKeys"
            type="inner"
            @openChange="onOpenChange"
          >
            <a-menu-item key="/account/settings/base">
              <router-link :to="{ name: 'BaseSettings' }">
                基本设置
              </router-link>
            </a-menu-item>
            <a-menu-item key="/account/settings/security">
              <router-link :to="{ name: 'SecuritySettings' }">
                安全设置
              </router-link>
            </a-menu-item>
            <a-menu-item key="/account/settings/custom">
              <router-link :to="{ name: 'CustomSettings' }">
                个性化
              </router-link>
            </a-menu-item>
            <a-menu-item key="/account/settings/binding">
              <router-link :to="{ name: 'BindingSettings' }">
                账户绑定
              </router-link>
            </a-menu-item>
            <a-menu-item key="/account/settings/notification">
              <router-link :to="{ name: 'NotificationSettings' }">
                新消息通知
              </router-link>
            </a-menu-item>
          </a-menu>
        </div>
        <div class="account-settings-info-right">
          <div class="account-settings-info-title">
            <span>{{ $route.meta.title }}</span>
          </div>
          <router-view />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

const openKeys = ref([])
const selectedKeys = ref([])

// Get device type from store or use a simple responsive approach
const device = ref('desktop')

const onOpenChange = (keys) => {
  openKeys.value = keys
}

const updateMenu = () => {
  const routes = route.matched.concat()
  selectedKeys.value = [routes.pop().path]
}

// Watch for route changes
watch(() => route.path, () => {
  updateMenu()
})

onMounted(() => {
  updateMenu()
  
  // Simple device detection
  const checkDevice = () => {
    device.value = window.innerWidth < 768 ? 'mobile' : 'desktop'
  }
  
  checkDevice()
  window.addEventListener('resize', checkDevice)
})
</script>

<style lang="less" scoped>
.account-settings-info-main {
  width: 100%;
  display: flex;
  height: 100%;
  overflow: auto;

  &.mobile {
    display: block;

    .account-settings-info-left {
      border-right: unset;
      border-bottom: 1px solid #e8e8e8;
      width: 100%;
      height: 50px;
      overflow-x: auto;
      overflow-y: scroll;
    }
    .account-settings-info-right {
      padding: 20px 40px;
    }
  }

  .account-settings-info-left {
    border-right: 1px solid #e8e8e8;
    width: 224px;
  }

  .account-settings-info-right {
    flex: 1 1;
    padding: 8px 40px;

    .account-settings-info-title {
      color: rgba(0,0,0,.85);
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      margin-bottom: 12px;
    }
    .account-settings-info-view {
      padding-top: 12px;
    }
  }
}
</style>
