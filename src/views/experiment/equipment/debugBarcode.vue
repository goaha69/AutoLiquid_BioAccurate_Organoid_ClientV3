<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-row :gutter="[16,24]">
          <a-col :span="8">
						<a-button type="primary" @click="btnConnect()">连接设备</a-button>  
          </a-col>
          <a-col :span="8" >
            <div style="display: flex; flex-direction: row; align-items: center;">
              <a-input v-model:value="resultcode" style="margin-right:10px;" />
              <a-button type="primary" @click="beginScan()">开始扫描</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { connect, doCmd } from '@/api/modular/experiment/debug'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

defineOptions({
  name: 'DebugBarcode'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const resultcode = ref('')

const debug = (record) => {
  visible.value = true
  equipmentName.value = record.name
  setTimeout(() => {
    form.value.id = record.id
  }, 100)     
}

const handleCancel = () => {
  form.value.id = ''
  visible.value = false
}

const btnConnect = () => {
  const data = form.value
  console.log('连接设备ID:' + data.id)
  connect(data).then((res) => {
    console.log(res.data)
    if (res.success) {
      message.success('设备连接成功')
    } else {
      message.error('设备连接失败:' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误:' + err.message)
  })
}

const beginScan = () => {
  const data = form.value
  data.param = { "cmd": "beginScan" }
  doCmd(data).then((res) => {
    resultcode.value = res.data
  })
}

defineExpose({
  debug
})
</script>

<style scoped>
.form-footer {
  text-align: right;
}
</style>
