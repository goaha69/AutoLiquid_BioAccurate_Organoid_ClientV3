<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="[16,24]">
          <a-col :span="8">
            <a-button type="primary" @click="btnConnect()">连接设备</a-button>  
          </a-col>
          <a-col :span="8">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <a-input v-model:value="resultcode" style="margin-right:10px;"></a-input>
              <a-button type="primary" @click="beginScan()">开始扫描</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { connect, doCmd } from '@/api/modular/experiment/debug'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

// 定义emits
const emit = defineEmits(['ok'])

// 响应式数据
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const equipmentName = ref('')
const resultcode = ref('')

const form = reactive({
  id: ''
})

// 方法
function debug(record) {
  visible.value = true
  equipmentName.value = record.name
  form.id = record.id
}

function handleCancel() {
  visible.value = false
  form.id = ''
  resultcode.value = ''
}

function btnConnect() {
  const data = { ...form }
  console.log('连接设备ID：' + data.id)
  connect(data).then((res) => {
    console.log(res.data)
    if (res.success) {
      message.success('设备连接成功')
      emit('ok')
    } else {
      message.error('设备连接失败：' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误：' + err.message)
  })
}

function beginScan() {
  const data = { ...form }
  data.param = { "cmd": "beginScan" }
  doCmd(data).then((res) => {
    resultcode.value = res.data
  })
}

// 暴露方法给父组件
defineExpose({
  debug
})
</script>

<style scoped>
.form-footer {
  text-align: right; /* 使按钮居右 */
}
</style>
