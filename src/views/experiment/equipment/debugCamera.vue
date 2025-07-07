<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
              <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
                <a-divider type="vertical" />
                <a-button type="primary" @click="btnInitMachine" >全部复位</a-button>
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
            <sp-input-number label="曝光" :labelWidth="40"  :min="0"  v-model:value="params.exposure" allow-clear />
            <sp-input-number label="增益" :labelWidth="40"  :min="0"  v-model:value="params.gain" allow-clear />
            <sp-input-number label="帧率" :labelWidth="40"  :min="0"  v-model:value="params.framerate" allow-clear />
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

defineOptions({
  name: 'DebugCamera'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')
const myInputNumberStep = ref(1)

const params = reactive({
  exposure: '',
  gain: '',
  framerate: '',
  sno: ''
})

const btnInitMachine = () => {
  // Implementation needed
}

const debug = (record) => {
  visible.value = true
  equipmentName.value = record.name
  setTimeout(() => {
    form.value.id = record.id
  }, 100)     
}

const btnConnect = () => {
  const data = form.value
  console.log('连接设备ID:' + data.id)
  connect(data).then((res) => {
    if (res.success) {
      message.success('设备连接成功')
    } else {
      message.error('设备连接失败:' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误:' + err.message)
  })
}

const doCommand = (param) => {
  const data = form.value
  data.param = param
  doCmd(data).then((res) => {
    if (res.success) {
      // Success handling
    } else {
      message.error('执行命令失败::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误::' + err.message)
  })
}

const getValue = (param) => {
  const data = form.value
  data.param = param
  doCmd(data).then((res) => {
    if (res.success) {
      console.log(res.data)
      console.log(res)
    } else {
      message.error('执行命令失败::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误::' + err.message)
  })
}

const handleCancel = () => {
  form.value.id = ''
  visible.value = false
}

const BtnOpenCamera = () => {
  var param = { "cmd": "opencamera", "value": "0" }
  doCommand(param)
}

const BtnCloseCamera = () => {
  var param = { "cmd": "closecamera", "value": "0" }
  doCommand(param)
}

const BtnStartGrap = () => {
  var param = { "cmd": "startgrap", "value": "0" }
  doCommand(param)
}

const BtnStopGrap = () => {
  var param = { "cmd": "closegrap", "value": "0" }
  doCommand(param)
}

const BtnOnceSoftTrigger = () => {
  var param = { "cmd": "oncesofttrigger", "sno": params.sno }
  doCommand(param)
}

const BtnSetCameraParam = () => {
  var param = { 
    "cmd": "setcameraparam", 
    "exposure": params.exposure, 
    "gain": params.gain, 
    "framerate": params.framerate 
  }
  doCommand(param)
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
