<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="8">
          <div style="margin-top:20px;">
            <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
            <a-divider type="vertical"/>
            <a-button type="primary" @click="btnInitMachine">全部复位</a-button>
          </div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-button type="primary" @click="BtnOpenCamera()">打开相机</a-button>  
            <a-button type="primary" @click="BtnCloseCamera()">关闭相机</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="曝光" :labelWidth="40" :min="0" v-model="params.exposure" allow-clear />
            <sp-input-number label="增益" :labelWidth="40" :min="0" v-model="params.gain" allow-clear />
            <sp-input-number label="帧率" :labelWidth="40" :min="0" v-model="params.framerate" allow-clear />
            <a-button type="primary" @click="BtnSetCameraParam()">设置相机参数</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-button type="primary" @click="BtnStartGrap()">开始采集</a-button>  
            <a-button type="primary" @click="BtnStopGrap()">停止采集</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-button type="primary" @click="BtnOnceSoftTrigger()">拍照一次</a-button>  
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
const myInputNumberStep = 1

const form = reactive({
  id: ''
})

const params = reactive({
  exposure: '',
  gain: '',
  framerate: '',
  sno: ''
})

// 方法
function btnInitMachine() {
  // 全部复位逻辑
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
      emit('ok')
    } else {
      message.error('设备连接失败：' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误：' + err.message)
  })
}

function doCmdInternal(param) {
  const data = { ...form }
  data.param = param
  doCmd(data).then((res) => {
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误：' + err.message)
  })
}

function getValue(param) {
  const data = { ...form }
  data.param = param
  doCmd(data).then((res) => {
    if (res.success) {
      console.log(res.data)
      console.log(res)
    } else {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误：' + err.message)
  })
}

function handleCancel() {
  visible.value = false
  Object.assign(form, { id: '' })
  Object.assign(params, {
    exposure: '',
    gain: '',
    framerate: '',
    sno: ''
  })
}

function BtnOpenCamera() {
  const param = { "cmd": "opencamera", "value": "0" }
  doCmdInternal(param)
}

function BtnCloseCamera() {
  const param = { "cmd": "closecamera", "value": "0" }
  doCmdInternal(param)
}

function BtnStartGrap() {
  const param = { "cmd": "startgrap", "value": "0" }
  doCmdInternal(param)
}

function BtnStopGrap() {
  const param = { "cmd": "closegrap", "value": "0" }
  doCmdInternal(param)
}

function BtnOnceSoftTrigger() {
  const param = { "cmd": "oncesofttrigger", "sno": params.sno }
  doCmdInternal(param)
}

function BtnSetCameraParam() {
  const param = { 
    "cmd": "setcameraparam", 
    "exposure": params.exposure, 
    "gain": params.gain, 
    "framerate": params.framerate 
  }
  doCmdInternal(param)
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
