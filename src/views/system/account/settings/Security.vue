<template>
  <div>
    <a-list
      itemLayout="horizontal"
      :dataSource="data"
    >
      <template #renderItem="{ item, index }">
        <a-list-item :key="index">
          <a-list-item-meta>
            <template #title>
              <a>{{ item.title }}</a>
            </template>
            <template #description>
              <span>
                <span class="security-list-description">{{ item.description }}</span>
                <span v-if="item.value"> : </span>
                <span class="security-list-value">{{ item.value }}</span>
              </span>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a v-if="item.actions" @click="item.actions.callback">{{ item.actions.title }}</a>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <upd-pwd ref="updPwdRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import UpdPwd from './securityItem/updPwd.vue'

const store = useStore()
const updPwdRef = ref()

const data = ref([])

const userInfo = computed(() => store.getters.userInfo)

// Mock permission check function - replace with actual implementation
const hasPerm = (permission) => {
  // This should be replaced with actual permission checking logic
  return true
}

onMounted(() => {
  if (hasPerm('sysUser:updatePwd')) {
    const updPwdMenu = {
      title: '账户密码',
      description: '当前密码强度',
      value: '强',
      actions: { 
        title: '修改',
        callback: () => {
          updPwdRef.value.open(userInfo.value.id)
        }
      }
    }
    data.value.push(updPwdMenu)
  }
  
  const encryptedPhone = { 
    title: '密保手机', 
    description: '已绑定手机', 
    value: '138****8293', 
    actions: { 
      title: '修改', 
      callback: () => { 
        message.success('This is a message of success') 
      } 
    } 
  }
  
  const encryptedProblem = { 
    title: '密保问题', 
    description: '未设置密保问题,密保问题可有效保护账户安全', 
    value: '', 
    actions: { 
      title: '设置', 
      callback: () => { 
        message.error('This is a message of error') 
      } 
    } 
  }
  
  const encryptedEmail = { 
    title: '备用邮箱', 
    description: '已绑定邮箱', 
    value: 'ant***sign.com', 
    actions: { 
      title: '修改', 
      callback: () => { 
        message.warning('This is message of warning') 
      } 
    } 
  }
  
  const encryptedMfa = { 
    title: 'MFA 设备', 
    description: '未绑定MFA 设备,绑定后,可以进行二次确认', 
    value: '', 
    actions: { 
      title: '绑定', 
      callback: () => { 
        message.info('This is a normal message') 
      } 
    } 
  }
  
  data.value.push(encryptedPhone)
  data.value.push(encryptedProblem)
  data.value.push(encryptedEmail)
  data.value.push(encryptedMfa)
})
</script>

<style scoped>
.security-list-description {
  color: rgba(0, 0, 0, 0.45);
}

.security-list-value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}
</style>
