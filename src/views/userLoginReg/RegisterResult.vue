<template>
  <result
    :isSuccess="true"
    :content="false"
    :title="title"
    :description="description"
  >
    <template #action>
      <a-button size="large" type="primary" @click="openMail">查看邮箱</a-button>
      <a-button size="large" style="margin-left: 8px" @click="goHome">返回首页</a-button>
    </template>
  </result>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Result } from '@/components'

// 注册局部组件 (script setup 语法糖)
const components = { Result }

const route = useRoute()
const router = useRouter()

const email = computed(() => route.params?.email || 'unknown@example.com')

const title = computed(() => `你的账户 ${email.value} 注册成功`)

const description =
  '激活邮件已发送到你的邮箱中，邮件有效期为 24 小时，请及时登录邮箱并点击邮件中的链接激活账户。'

function openMail() {
  window.open('https://mail.' + email.value.split('@')[1], '_blank')
}

function goHome() {
  router.push({ name: 'login' })
}
</script>

<style scoped></style>
