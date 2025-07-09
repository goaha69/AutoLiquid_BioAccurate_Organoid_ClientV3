<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item>
              <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
              <a-divider type="vertical"/>
              <a-button type="primary" @click="btnInitMachine">全部复位</a-button>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item>
              <a-button type="primary" @click="btnInitCmd('xi')" :loading="isLoading('xi')" :disabled="isAnyLoading()">X轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('yi')" :loading="isLoading('yi')" :disabled="isAnyLoading()">Y轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('zi')" :loading="isLoading('zi')" :disabled="isAnyLoading()">Z轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('pi')" :loading="isLoading('pi')" :disabled="isAnyLoading()">P轴复位</a-button>

              <a-divider type="vertical"/>
              
              <a-button type="primary" @click="btnInitCmd('qi')" :loading="isLoading('qi')" :disabled="isAnyLoading()">Q轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('wi')" :loading="isLoading('wi')" :disabled="isAnyLoading()">W轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('mi')" :loading="isLoading('mi')" :disabled="isAnyLoading()">M轴复位</a-button>
              <a-button type="primary" @click="btnInitCmd('ni')" :loading="isLoading('ni')" :disabled="isAnyLoading()">N轴复位</a-button>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:10px;">
            <sp-input-number label="X轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.xPos" allow-clear/>
            <a-button type="primary" @click="btnGoPos('xa')" :loading="isLoading('xa')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="Y轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.yPos" allow-clear/>
            <a-button type="primary" @click="btnGoPos('ya')" :loading="isLoading('ya')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="Z轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.zPos" allow-clear/>
            <a-button type="primary" @click="btnGoPos('za')" :loading="isLoading('za')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="P轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.pPos" allow-clear/>
            <a-button type="primary" @click="btnGoPos('pa')" :loading="isLoading('pa')" :disabled="isAnyLoading()">执行</a-button>
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="Q轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.qPos" allow-clear />
            <a-button type="primary" @click="btnGoPos('qa')" :loading="isLoading('qa')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="W轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.wPos" allow-clear />
            <a-button type="primary" @click="btnGoPos('wa')" :loading="isLoading('wa')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="M轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.mPos" allow-clear />
            <a-button type="primary" @click="btnGoPos('ma')" :loading="isLoading('ma')" :disabled="isAnyLoading()">执行</a-button>
            <sp-input-number label="N轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.nPos" allow-clear />
            <a-button type="primary" @click="btnGoPos('na')" :loading="isLoading('na')" :disabled="isAnyLoading()">执行</a-button>
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="@轴" :labelWidth="40" placeholder="0.00" :max="10000" unit="mm" v-model="paramsPos.atPos" allow-clear />
            <a-select style="width: 100px" v-model:value="atName" placeholder="选择轴">
              <a-select-option v-for="(item, index) in atRows" :key="index" :value="item">{{ item }}</a-select-option>
            </a-select>
            <a-button type="primary" @click="btnGoPosAt()" :loading="isLoading('at')" :disabled="isAnyLoading()">执行</a-button> 
          </div>
          <div style="margin-top:10px;">
            <a-form-item label="命令">
              <a-textarea placeholder="请输入命令" v-model:value="cmdParam" allow-clear :auto-size="{ minRows: 10, maxRows: 15 }"/>
              <a-button type="primary" @click="btnDoCmd()" :loading="isLoading('cmd')" :disabled="isAnyLoading()">DoCmd</a-button> 
            </a-form-item>
          </div>
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
const cmdParam = ref('')
const myInputNumberStep = 0.5
const myInputNumberPrecision = 2
const loadingButton = ref('')
const atName = ref('@PO1')

const form = reactive({
  id: ''
})

const paramsPos = reactive({
  xPos: 0.00,
  yPos: 0.00,
  zPos: 0.00,
  pPos: 0.00,
  qPos: 0.00,
  wPos: 0.00,
  mPos: 0.00,
  nPos: 0.00,
  atPos: 0.00
})

const atRows = ['@PO1', '@PO2', '@PO3', '@PO4', '@PO5', '@PO6', '@PO7', '@PO8']

// 方法
function btnInitMachine() {
  // 全部复位逻辑
}

function setLoading(button) {
  loadingButton.value = button
}

function resetLoading() {
  loadingButton.value = ''
}

function isLoading(button) {
  return loadingButton.value === button
}

function isAnyLoading() {
  return loadingButton.value !== ''
}

function debug(record) {
  visible.value = true
  equipmentName.value = record.name
  form.id = record.id
}

function btnConnect() {
  const data = { ...form }
  console.log('连接设备ID：' + data.id)
  connect(data).then((res) => {
    if (res.success) {
      message.success('设备连接成功')
      emit('ok', null)
    } else {
      message.error('设备连接失败：' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误：' + err.message)
  })
}

function btnInitCmd(cmd) {
  const data = { ...form }
  data.cmd = cmd
  setLoading(data.cmd)
  doCmd(data).then((res) => {
    resetLoading()
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    resetLoading()
    message.error('执行命令错误：' + err.message)
  })
}

function btnDoCmd() {
  const data = { ...form }
  data.cmd = cmdParam.value
  console.log(cmdParam.value)
  if (!cmdParam.value || cmdParam.value.trim().length === 0) {
    message.error('请输入命令！')
    return
  }
  setLoading('cmd')
  doCmd(data).then((res) => {
    resetLoading()
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    resetLoading()
    message.error('执行命令错误：' + err.message)
  })
}

function btnGoPos(axle) {
  const data = { ...form }
  let value = 0.0
  const aa = axle.substring(0, 1)
  setLoading(aa)
  console.log(aa)
  
  switch (aa) {
    case 'x': value = paramsPos.xPos; break
    case 'y': value = paramsPos.yPos; break
    case 'z': value = paramsPos.zPos; break
    case 'p': value = paramsPos.pPos; break
    case 'q': value = paramsPos.qPos; break
    case 'w': value = paramsPos.wPos; break
    case 'm': value = paramsPos.mPos; break
    case 'n': value = paramsPos.nPos; break
  }
  
  data.cmd = aa + 'A' + value.toFixed(2)
  console.log(data.cmd)
  doCmd(data).then((res) => {
    resetLoading()
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    resetLoading()
    message.error('执行命令错误：' + err.message)
  })
}

function btnGoPosAt() {
  const data = { ...form }
  const value = paramsPos.atPos
  setLoading('at')
  data.cmd = 'X' + 'A' + value.toFixed(2) + atName.value
  doCmd(data).then((res) => {
    resetLoading()
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    resetLoading()
    message.error('执行命令错误：' + err.message)
  })
}

function handleCancel() {
  visible.value = false
  // 重置表单数据
  Object.assign(form, { id: '' })
  Object.assign(paramsPos, {
    xPos: 0.00,
    yPos: 0.00,
    zPos: 0.00,
    pPos: 0.00,
    qPos: 0.00,
    wPos: 0.00,
    mPos: 0.00,
    nPos: 0.00,
    atPos: 0.00
  })
  cmdParam.value = ''
  atName.value = '@PO1'
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

.ant-btn {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
