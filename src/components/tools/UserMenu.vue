<template>
  <div class="user-wrapper">
    <div class="content-box">
      <!-- Setting Drawer (show in development mode) -->
      <setting-drawer ref="settingDrawer" v-if="!production"></setting-drawer>
      <a href="javascript:;" @click="$refs.settingDrawer.toggle()" v-if="!production">
        <span class="action">
          <setting-outlined></setting-outlined>
        </span>
      </a>

      <notice-icon class="action"></notice-icon>

      <a-dropdown>
        <span class="action ant-dropdown-link user-dropdown-menu">
          <a-avatar v-if="avatar" class="avatar" size="small" :src="avatar" :loadError="loadError"></a-avatar>
          <a-avatar v-else class="avatar" size="small" style="background-color: #1890ff;">
            <template #icon><user-outlined></user-outlined></template>
          </a-avatar>
          <span v-if="nickname">{{ nickname }}</span>
          <span v-else>用户</span>
        </span>
        <template #overlay>
          <a-menu class="user-dropdown-menu-wrapper">
            <a-menu-item v-if="!production" key="2">
              <a href="javascript:;" @click="$refs.settingDrawer.toggle()">
                <appstore-outlined></appstore-outlined>
                <span>界面设置</span>
              </a>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="1">
              <router-link :to="{ name: 'settings' }">
                <setting-outlined></setting-outlined>
                <span>账户设置</span>
              </router-link>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="3">
              <a href="javascript:;" @click="handleLogout">
                <logout-outlined></logout-outlined>
                <span>退出登录</span>
              </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script>
import config from '@/config/defaultSettings'
import NoticeIcon from '@/components/NoticeIcon'
import { message } from 'ant-design-vue/es'
import { mapGetters, mapActions } from 'vuex'
import SettingDrawer from '@/components/SettingDrawer'
import { 
  SettingOutlined, 
  AppstoreOutlined, 
  UserOutlined,
  LogoutOutlined 
} from '@ant-design/icons-vue'

export default {
  name: 'UserMenu',
  components: {
    NoticeIcon,
    SettingDrawer,
    SettingOutlined,
    AppstoreOutlined,
    UserOutlined,
    LogoutOutlined
  },
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu'
    }
  },
  data () {
    return {
      production: config.production,
      confirmLoading: false
    }
  },
  computed: {
    ...mapGetters(['nickname', 'avatar', 'userInfo'])
  },
  methods: {
    ...mapActions(['Logout']),
    loadError() {
      this.$store.commit('SET_AVATAR', '/avatar2.jpg');
    },
    handleLogout () {
      this.confirmLoading = true
      this.Logout().then(() => {
        this.confirmLoading = false
        this.$router.push({ path: '/user/login' })
      }).catch(err => {
        this.confirmLoading = false
        message.error('退出登录失败:' + err.message)
      })
    }
  },
  mounted() {
    // 延迟执行，确保DOM已完全加载
    setTimeout(() => {
      const userMenus = document.querySelectorAll('.user-wrapper')
      
      // 检查可见的用户菜单数量
      const visibleUserMenus = Array.from(userMenus).filter(menu => {
        const style = window.getComputedStyle(menu)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
      
      if (visibleUserMenus.length > 1) {
        console.warn(`检测到${visibleUserMenus.length}个可见的UserMenu组件！`)
        // 保留第一个，隐藏其他所有的
        for (let i = 1; i < visibleUserMenus.length; i++) {
          visibleUserMenus[i].style.display = 'none'
          console.log(`隐藏额外的UserMenu ${i+1}`)
        }
      }
    }, 300)
  },
}
</script>

<style lang="less" scoped>
    .appRedio {
    border:1px solid #91d5ff;
    padding:10px 20px;
    background: #e6f7ff;
    border-radius:2px;
    margin-bottom:10px;
      color: #91d5ff;
    }
</style>
