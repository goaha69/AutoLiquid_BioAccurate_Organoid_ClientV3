<template>
  <div class="main user-layout-register">
    <h3><span>注册</span></h3>
    <a-form ref="formRef" :model="formState" @finish="handleSubmit">
      <a-form-item name="email" :rules="[{ required: true, type: 'email', message: '请输入邮箱地址' }]">
        <a-input size="large" type="text" placeholder="邮箱" v-model:value="formState.email">
          <template #prefix>
            <mail-outlined :style="{ color: 'rgba(0,0,0,.25)' }" />
          </template>
        </a-input>
      </a-form-item>

      <a-popover
        placement="rightTop"
        :trigger="['focus']"
        :getPopupContainer="(trigger) => trigger.parentElement"
        v-model:visible="state.passwordLevelChecked"
      >
        <template #content>
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor="passwordLevelColor" />
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item name="password" :rules="[{ required: true, message: '至少6位密码，区分大小写' }, { validator: handlePasswordLevel }]">
          <a-input
            size="large"
            type="password"
            @click="handlePasswordInputClick"
            autocomplete="false"
            placeholder="至少6位密码，区分大小写"
            v-model:value="formState.password"
          />
        </a-form-item>
      </a-popover>

      <a-form-item name="password2" :rules="[{ required: true, message: '至少6位密码，区分大小写' }, { validator: handlePasswordCheck }]">
        <a-input
          size="large"
          type="password"
          autocomplete="false"
          placeholder="确认密码"
          v-model:value="formState.password2"
        />
      </a-form-item>

      <a-form-item name="mobile" :rules="[{ required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ }]">
        <a-input size="large" placeholder="11 位手机号" v-model:value="formState.mobile">
          <template #addonBefore>
            <a-select size="large" v-model:value="formState.prefix" style="width: 70px">
              <a-select-option value="+86">+86</a-select-option>
              <a-select-option value="+87">+87</a-select-option>
            </a-select>
          </template>
        </a-input>
      </a-form-item>

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item name="captcha" :rules="[{ required: true, message: '请输入验证码' }]">
            <a-input size="large" type="text" placeholder="验证码" v-model:value="formState.captcha">
              <template #prefix>
                <mail-outlined :style="{ color: 'rgba(0,0,0,.25)' }" />
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha"
            size="large"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
          >{{ !state.smsSendBtn ? '获取验证码' : `${state.time} s` }}</a-button>
        </a-col>
      </a-row>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          html-type="submit"
          class="register-button"
          :loading="state.registerBtn"
          :disabled="state.registerBtn"
        >注册</a-button>
        <router-link class="login" :to="{ name: 'login' }">使用已有账户登录</router-link>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
// import { useMessage } from '@/hooks/useMessage'
import { getSmsCaptcha } from '@/api/modular/system/loginManage'
import { MailOutlined } from '@ant-design/icons-vue'
import { message as $message, notification as $notification } from 'ant-design-vue'

const router = useRouter()
// const { createMessage, createNotification } = useMessage()

const levelNames = {
  0: '强度：',
  1: '强度：弱',
  2: '强度：中',
  3: '强度：强'
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success'
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a'
}

const formRef = ref()
const formState = reactive({
  email: '',
  password: '',
  password2: '',
  mobile: '',
  captcha: '',
  prefix: '+86'
})

const state = reactive({
  time: 60,
  smsSendBtn: false,
  passwordLevel: 0,
  passwordLevelChecked: false,
  percent: 10,
  registerBtn: false
})

const passwordLevelClass = computed(() => levelClass[state.passwordLevel])
const passwordLevelName = computed(() => levelNames[state.passwordLevel])
const passwordLevelColor = computed(() => levelColor[state.passwordLevel])

const handlePasswordLevel = async (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  let level = 0
  if (/[0-9]/.test(value)) {
    level++
  }
  if (/[a-zA-Z]/.test(value)) {
    level++
  }
  if (/[^0-9a-zA-Z_]/.test(value)) {
    level++
  }
  state.passwordLevel = level
  state.percent = level * 30
  if (level >= 2) {
    if (level >= 3) {
      state.percent = 100
    }
    return Promise.resolve()
  } else {
    if (level === 0) {
      state.percent = 10
    }
    return Promise.reject(new Error('密码强度不够'))
  }
}

const handlePasswordCheck = async (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  if (value && formState.password && value.trim() !== formState.password.trim()) {
    return Promise.reject(new Error('两次密码不一致'))
  }
  return Promise.resolve()
}

const handlePasswordInputClick = () => {
  state.passwordLevelChecked = true
}

const handleSubmit = (values) => {
  state.registerBtn = true
  // Your submission logic here
  console.log('Received values of form: ', values)
  setTimeout(() => {
    state.registerBtn = false
    router.push({ name: 'registerResult', params: { ...values } })
  }, 1000)
}

const getCaptcha = (e) => {
  e.preventDefault()
  formRef.value.validateFields(['mobile']).then(values => {
    state.smsSendBtn = true
    const interval = window.setInterval(() => {
      if (state.time-- <= 0) {
        state.time = 60
        state.smsSendBtn = false
        window.clearInterval(interval)
      }
    }, 1000)
    const hide = $message.loading('验证码发送中..', 0)
    getSmsCaptcha({ mobile: values.mobile }).then(res => {
      setTimeout(hide, 2500)
      if (res.success) {
        $notification.success({
          message: '提示',
          description: '验证码获取成功,您的验证码为:' + res.data,
          duration: 8
        })
      } else {
        $notification.error({
          message: '提示',
          description: res.message,
          duration: 4
        })
        setTimeout(hide, 1)
      }
    }).catch(err => {
      setTimeout(hide, 1)
      clearInterval(interval)
      state.time = 60
      state.smsSendBtn = false
      requestFailed(err)
    })
  }).catch(err => {
    console.log('error', err)
  })
}

const requestFailed = (err) => {
  $notification.error({
    message: '错误',
    description: ((err.response || {}).data || {}).message || '请求出现错误,请稍后再试',
    duration: 4
  })
  state.registerBtn = false
}
</script>

<style lang="less" scoped>
.user-layout-register {
  & > h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .register-button {
    width: 50%;
  }

  .login {
    float: right;
    line-height: 40px;
  }
}
</style>
<style lang="less">
.user-layout-register {
  .header {
    height: 44px;
    line-height: 44px;
    .badge {
      position: absolute;
      display: inline-block;
      line-height: 1;
      vertical-align: middle;
      margin-left: -12px;
      margin-top: -10px;
      opacity: 0.8;
    }
    .logo {
      height: 44px;
      vertical-align: top;
      margin-right: 16px;
      border-style: none;
    }
    .title {
      font-size: 33px;
      color: rgba(0, 0, 0, 0.85);
      font-family: 'Chinese Quote', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
        'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
        'Segoe UI Symbol';
      font-weight: 600;
      position: relative;
      top: 2px;
    }
  }
  .user-register {
    &.error {
      color: #ff0000;
    }
    &.warning {
      color: #ff7e05;
    }
    &.success {
      color: #52c41a;
    }
  }
  .ant-input-group-addon:first-child {
    background-color: #fff;
  }
}
</style>
