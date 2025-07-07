<template>
  <a-modal
    v-model:open="modalVisible"
    title="设备调试"
    :width="600"
    :mask-closable="false"
    @ok="handleClose"
    @cancel="handleClose"
  >
    <div class="debug-container">
      <a-descriptions title="设备信息" :column="2" bordered>
        <a-descriptions-item label="设备编号">
          {{ equipment?.code }}
        </a-descriptions-item>
        <a-descriptions-item label="设备名称">
          {{ equipment?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="主机">
          {{ equipment?.host }}
        </a-descriptions-item>
        <a-descriptions-item label="端口">
          {{ equipment?.port }}
        </a-descriptions-item>
        <a-descriptions-item label="Com口">
          {{ equipment?.comPort }}
        </a-descriptions-item>
        <a-descriptions-item label="波特率">
          {{ equipment?.baudRate }}
        </a-descriptions-item>
      </a-descriptions>
      
      <a-divider />
      
      <div class="debug-actions">
        <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" @click="testConnection">
            测试连接
          </a-button>
          <a-button @click="sendCommand">
            发送命令
          </a-button>
          <a-button @click="resetDevice">
            重置设备
          </a-button>
        </a-space>
      </div>
      
      <a-divider />
      
      <div class="debug-log">
        <h4>调试日志</h4>
        <a-textarea 
          v-model:value="debugLog" 
          :rows="8" 
          readonly 
          placeholder="调试日志将显示在这里..."
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  equipment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'close'])

const debugLog = ref('')

// 计算属性
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 调试功能方法
const testConnection = async () => {
  try {
    addLog('开始测试连接...')
    // 这里应该调用实际的测试连接API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    addLog('连接测试成功')
    message.success('连接测试成功')
  } catch (error) {
    addLog(`连接测试失败: ${error.message}`)
    message.error('连接测试失败')
  }
}

const sendCommand = async () => {
  try {
    addLog('发送测试命令...')
    // 这里应该调用实际的发送命令API
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
    addLog('命令发送成功')
    message.success('命令发送成功')
  } catch (error) {
    addLog(`命令发送失败: ${error.message}`)
    message.error('命令发送失败')
  }
}

const resetDevice = async () => {
  try {
    addLog('重置设备...')
    // 这里应该调用实际的重置设备API
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟API调用
    addLog('设备重置成功')
    message.success('设备重置成功')
  } catch (error) {
    addLog(`设备重置失败: ${error.message}`)
    message.error('设备重置失败')
  }
}

const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  debugLog.value += `[${timestamp}] ${message}\n`
}

const handleClose = () => {
  debugLog.value = ''
  emit('close')
}
</script>

<style lang="less" scoped>
.debug-container {
  .debug-actions {
    text-align: center;
  }
  
  .debug-log {
    h4 {
      margin-bottom: 12px;
    }
  }
}
</style> 