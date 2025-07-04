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
            <a-menu-item key="4" v-if="mode === 'sidemenu'">
              <a @click="appToggled()">
                <swap-outlined></swap-outlined>
                <span>切换应用</span>
              </a>
            </a-menu-item>
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
    <a-modal
      title="切换应用"
      v-model:open="visible" 
      :footer="null"
      :confirm-loading="confirmLoading"
      @cancel="handleCancel"
    >
      <a-form :model="form1">
        <a-form-item 
          :label-col="labelCol" 
          :wrapper-col="wrapperCol"
          label="选择应用"
        >
          <a-menu
            mode="inline"
            :default-selected-keys="defApp"
            style="border-bottom: 0px;line-height : 55px;"
          >
            <a-menu-item v-for="(item) in userInfo.apps" :key="item.code" style="top:0px;" @click="switchApp(item.code)">
              {{ item.name }}
            </a-menu-item>
          </a-menu>
        </a-form-item>
      </a-form>
    </a-modal>
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
  SwapOutlined, 
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
    SwapOutlined,
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
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      visible: false,
      confirmLoading: false,
      form1: {},
      defApp: []
    }
  },
  computed: {
    ...mapGetters(['nickname', 'avatar', 'userInfo'])
  },
  methods: {
    ...mapActions(['Logout', 'MenuChange']),
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
    },
    appToggled () {
      this.visible = true
      this.defApp = []
      if (this.userInfo.apps) {
        this.userInfo.apps.forEach(item => {
          if (item.active) {
            this.defApp.push(item.code)
          }
        })
      }
    },
    switchApp (appCode) {
      this.visible = false
      this.defApp = []
      const applicationData = this.userInfo.apps.filter(item => item.code === appCode)
      const hideMessage = message.loading('正在切换应用!', 0)
      this.MenuChange(applicationData[0]).then((res) => {
        hideMessage()
      }).catch((err) => {
        message.error('应用切换异常')
      })
    },
    handleCancel () {
      this.form1 = {}
      this.visible = false
    }
  }
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
