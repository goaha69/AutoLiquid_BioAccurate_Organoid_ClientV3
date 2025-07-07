<template>
  <a-modal
    title="修改密码"
    :open="visible_updPwd"
    :confirm-loading="confirmLoading"
    @ok="handleOkUpdPwd"
    @cancel="handleCancel"
  >
    <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item 
        label="原密:" 
        name="password" 
        has-feedback
        :rules="[{required: true, message: '请输入原密码'}]"
      >
        <a-input
          placeholder="请输入原密码"
          type="password"
          v-model:value="formState.password"
        />
      </a-form-item>
      <a-form-item 
        label="新密:" 
        name="newPassword" 
        has-feedback
        :rules="[
          {required: true, min: 5, message: '请输入至少五个字符的密码'},
          {validator: validateToNextPassword}
        ]"
      >
        <a-input
          placeholder="请输入新密码"
          type="password"
          v-model:value="formState.newPassword"
        />
      </a-form-item>
      <a-form-item 
        label="重复新密:" 
        name="confirm" 
        has-feedback
        :rules="[
          {required: true, message: '请再次输入新密码'},
          {validator: compareToFirstPassword}
        ]"
      >
        <a-input
          placeholder="请再次输入新密码"
          type="password"
          v-model:value="formState.confirm"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { sysUserUpdatePwd } from '@/api/modular/system/userManage'
import { message } from 'ant-design-vue'

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 }
}

const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 16 }
}

const confirmLoading = ref(false)
const visible_updPwd = ref(false)
const userId = ref('')
const confirmDirty = ref(false)

const formState = reactive({
  password: '',
  newPassword: '',
  confirm: ''
})

const open = (id) => {
  userId.value = id
  visible_updPwd.value = true
  // Reset form
  formState.password = ''
  formState.newPassword = ''
  formState.confirm = ''
}

const handleOkUpdPwd = () => {
  // Basic validation
  if (!formState.password) {
    message.error('请输入原密码')
    return
  }
  if (!formState.newPassword || formState.newPassword.length < 5) {
    message.error('请输入至少五个字符的新密码')
    return
  }
  if (!formState.confirm) {
    message.error('请再次输入新密码')
    return
  }
  if (formState.newPassword !== formState.confirm) {
    message.error('请确认两次输入密码的一致性!')
    return
  }

  confirmLoading.value = true
  const values = {
    id: userId.value,
    password: formState.password,
    newPassword: formState.newPassword,
    confirm: formState.confirm
  }
  
  sysUserUpdatePwd(values).then((res) => {
    if (res.success) {
      message.success('修改成功')
      handleCancel()
    } else {
      message.error('修改失败: ' + res.message)
    }
  }).finally(() => {
    confirmLoading.value = false
  })
}

const handleCancel = () => {
  visible_updPwd.value = false
  // Reset form
  formState.password = ''
  formState.newPassword = ''
  formState.confirm = ''
}

const compareToFirstPassword = (rule, value) => {
  if (value && value !== formState.newPassword) {
    return Promise.reject('请确认两次输入密码的一致性!')
  }
  return Promise.resolve()
}

const validateToNextPassword = (rule, value) => {
  if (value && confirmDirty.value) {
    // Trigger validation for confirm field
    confirmDirty.value = false
  }
  return Promise.resolve()
}

defineExpose({
  open
})
</script>

<style scoped>
</style>
