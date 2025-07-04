<template>
  <div class="main">
    <div class="user-layout-login">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="color: #1890ff; font-size: 16px;">账号密码登录</span>
      </div>

      <div v-if="isLoginError" style="margin-bottom: 24px; padding: 15px; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 6px; color: #ff4d4f;">
        {{ accountLoginErrMsg }}
      </div>

      <div style="margin-bottom: 24px;">
        <input
          v-model="loginForm.account"
          size="large"
          type="text"
          placeholder="账号"
          style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px;"
        />
      </div>

      <div style="margin-bottom: 24px;">
        <input
          v-model="loginForm.password"
          size="large"
          type="password"
          placeholder="密码"
          style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px;"
          @keyup.enter="handleLogin"
        />
      </div>

      <div style="margin-bottom: 24px;">
        <label>
          <input type="checkbox" v-model="loginForm.rememberMe" />
          <span style="margin-left: 8px;">自动登录</span>
        </label>
      </div>

      <div style="margin-bottom: 24px;">
        <button 
          @click="handleLogin"
          :disabled="state.loginBtn"
          style="width: 100%; height: 40px; background: #1890ff; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;"
        >
          {{ state.loginBtn ? '登录中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getCaptchaOpen } from '@/api/modular/system/loginManage'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      loginForm: {
        account: 'superAdmin',
        password: '123456',
        rememberMe: false
      },
      isLoginError: false,
      state: {
        loginBtn: false
      },
      accountLoginErrMsg: '',
      captchaOpen: false
    }
  },
  created () {
    this.getCaptchaOpen()
  },
  methods: {
    ...mapActions(['Login']),
    
    getCaptchaOpen () {
      getCaptchaOpen().then((res) => {
        if (res && res.success) {
          this.captchaOpen = res.data
        }
      }).catch(() => {
        // 忽略验证码配置获取失败
        this.captchaOpen = false
      })
    },

    handleLogin () {
      if (!this.loginForm.account || !this.loginForm.password) {
        this.requestFailed('请输入用户名和密码')
        return
      }

      this.state.loginBtn = true
      this.isLoginError = false

      const loginParams = {
        account: this.loginForm.account,
        password: this.loginForm.password
      }

      console.log('🔐 尝试登录:', loginParams.account)

      // 使用 Vuex store 的 Login action
      this.Login(loginParams)
        .then(() => {
          console.log('🎉 登录成功')
          this.loginSuccess()
        })
        .catch(err => {
          console.error('❌ 登录失败:', err)
          const errorMsg = typeof err === 'string' ? err : (err.message || '登录失败')
          this.requestFailed(errorMsg)
        })
        .finally(() => {
          this.state.loginBtn = false
        })
    },

    loginSuccess () {
      console.log('🎉 登录成功')
      this.isLoginError = false
      
      // 参考旧项目,加载字典数据
      this.$store.dispatch('dictTypeData').catch(err => {
        console.warn('加载字典数据失败:', err)
      })
      
      // 加载通知列表
      this.$store.dispatch('getNoticReceiveList').catch(err => {
        console.warn('加载通知列表失败:', err)
      })
      
      // 参考旧项目,直接跳转到welcome页面,而不是dashboard/workplace
      this.$router.push({ path: '/welcome' })
    },

    requestFailed (err) {
      this.accountLoginErrMsg = err || '登录失败'
      this.isLoginError = true
      console.error('❌ 登录错误:', err)
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-layout-login {
  width: 368px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:hover:not(:disabled) {
  background: #40a9ff !important;
}

button:disabled {
  background: #f5f5f5 !important;
  color: rgba(0, 0, 0, 0.25) !important;
  cursor: not-allowed !important;
}
</style>

