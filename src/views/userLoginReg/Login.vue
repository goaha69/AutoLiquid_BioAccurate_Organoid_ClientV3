<template>
  <a-form 
    id="formLogin" 
    class="user-layout-login" 
    ref="formLogin" 
    :model="formData"
    @finish="handleSubmit"
  >
    <a-tabs 
      v-model:activeKey="customActiveKey" 
      :tab-bar-style="{ textAlign: 'center', borderBottom: 'unset' }" 
      @change="handleTabClick"
    >
      <a-tab-pane key="tab1" tab="账号密码登录">
        <a-alert 
          v-if="isLoginError" 
          type="error" 
          show-icon 
          style="margin-bottom: 24px;" 
          :message="accountLoginErrMsg" 
        />
        
        <a-form-item 
          name="account"
          :rules="[
            { required: true, message: '请输入帐户名' },
            { validator: handleUsernameOrEmail, trigger: 'change' }
          ]"
        >
          <a-input
            v-model:value="formData.account"
            size="large"
            type="text"
            placeholder="账号"
          >
            <template #prefix>
              <UserOutlined :style="{ color: 'rgba(0,0,0,.25)' }" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item 
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formData.password"
            size="large"
            autocomplete="false"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined :style="{ color: 'rgba(0,0,0,.25)' }" />
            </template>
          </a-input-password>
        </a-form-item>
      </a-tab-pane>
    </a-tabs>

    <a-form-item>
      <a-checkbox v-model:checked="formData.rememberMe">自动登录</a-checkbox>
    </a-form-item>

    <a-form-item>
      <Verify 
        @success="verifySuccess" 
        :mode="'pop'" 
        :captchaType="'clickWord'" 
        :imgSize="{ width: '330px', height: '155px' }" 
        ref="verify"
      />
    </a-form-item>

    <a-form-item style="margin-top:24px">
      <a-button 
        size="large" 
        type="primary" 
        html-type="submit" 
        class="login-button" 
        :loading="state.loginBtn" 
        :disabled="state.loginBtn"
      >
        确定
      </a-button>
    </a-form-item>

    <div class="user-login-other">
      <!-- 其他登录方式预留 -->
    </div>
  </a-form>

  <TwoStepCaptcha 
    v-if="requiredTwoStepCaptcha" 
    :visible="stepCaptchaVisible" 
    @success="stepCaptchaSuccess" 
    @cancel="stepCaptchaCancel"
  />
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message, notification } from 'ant-design-vue'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import Verify from '@/components/verifition/Verify'
import { getSmsCaptcha, getCaptchaOpen } from '@/api/modular/system/loginManage'
import { exp_deviceversion_getLastVersion } from '@/api/modular/experiment/expDeviceVersionManage'

export default {
  name: 'Login',
  components: {
    TwoStepCaptcha,
    Verify,
    UserOutlined,
    LockOutlined
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const verify = ref(null)
    
    const customActiveKey = ref('tab1')
    const isLoginError = ref(false)
    const requiredTwoStepCaptcha = ref(false)
    const stepCaptchaVisible = ref(false)
    const accountLoginErrMsg = ref('')
    const captchaOpen = ref(false)
    const loginParams = ref({})
    
    const formData = reactive({
      account: '',
      password: '',
      rememberMe: false
    })
    
    const state = reactive({
      time: 60,
      loginBtn: false,
      loginType: 0,
      smsSendBtn: false
    })

    const getCaptchaOpen = () => {
      getCaptchaOpen().then((res) => {
        if (res.success) {
          captchaOpen.value = res.data
        }
      })
    }

    const handleUsernameOrEmail = (rule, value) => {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      return Promise.resolve()
    }

    const handleTabClick = (key) => {
      isLoginError.value = false
      customActiveKey.value = key
    }

    const handleSubmit = (values) => {
      state.loginBtn = true
      loginParams.value = values
      
      // 是否开启验证码
      if (captchaOpen.value) {
        verify.value.show()
        state.loginBtn = false
        return
      }
      
      const loginData = { ...values }
      delete loginData.account
      loginData[!state.loginType ? 'account' : 'account'] = values.account
      loginData.password = values.password
      
      store.dispatch('Login', loginData)
        .then((res) => loginSuccess(res))
        .catch(err => requestFailed(err))
        .finally(() => {
          state.loginBtn = false
        })
    }

    const verifySuccess = (params) => {
      loginParams.value.code = params.captchaVerification
      store.dispatch('Login', loginParams.value)
        .then((res) => loginSuccess(res))
        .catch(err => requestFailed(err))
        .finally(() => {
          state.loginBtn = false
        })
    }

    const stepCaptchaSuccess = () => {
      loginSuccess()
    }

    const stepCaptchaCancel = () => {
      store.dispatch('Logout').then(() => {
        state.loginBtn = false
        stepCaptchaVisible.value = false
      })
    }

    const loginSuccess = (res) => {
      exp_deviceversion_getLastVersion().then((rr) => { 
        if(rr.success) {
          console.log('==========######$$$$$$==========')
          console.log(rr.data)
          store.dispatch('ToggleVersionCode', rr.data.currentVersion)
        }
      })
      
      console.log('==========123456789==========')
      console.log(store.getters.versionCode)
      router.push({ path: '/welcome' })
      isLoginError.value = false
      // 加载字典所有字典到缓存中
      store.dispatch('dictTypeData').then((res) => { })
    }

    const requestFailed = (err) => {
      accountLoginErrMsg.value = err
      isLoginError.value = true
    }

    onMounted(() => {
      getCaptchaOpen()
    })

    return {
      customActiveKey,
      isLoginError,
      requiredTwoStepCaptcha,
      stepCaptchaVisible,
      accountLoginErrMsg,
      captchaOpen,
      loginParams,
      formData,
      state,
      verify,
      handleUsernameOrEmail,
      handleTabClick,
      handleSubmit,
      verifySuccess,
      stepCaptchaSuccess,
      stepCaptchaCancel,
      loginSuccess,
      requestFailed
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  max-width: 368px;
  width: 100%;
  
  // 去掉tab的蓝色条
  :deep(.ant-tabs-tab-active) {
    border-bottom: none !important;
  }
  
  :deep(.ant-tabs-ink-bar) {
    display: none !important;
  }
  
  :deep(.ant-tabs-nav::before) {
    border-bottom: none !important;
  }
  
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>

