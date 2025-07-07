<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
            </a-form-item>            
          </a-col>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="InitializeDevice()">初始化</a-button>  
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="塔数" :labelWidth="40"  :min="1" :max="9" :step="1"  v-model:value="params.tower" allow-clear />
            <a-button type="primary" @click="SetTowerNumber()">设置塔数</a-button>
            <a-divider type="vertical" />
            <sp-input-number label="层数" :labelWidth="40"  :min="1" :max="25" :step="1"  v-model:value="params.layer" allow-clear />
            <a-button type="primary" @click="SetLayerNumber()">设置层数</a-button>
            <sp-input label="名称" :labelWidth="80" :inputWidth="80" v-model:value="params.code" allow-clear />
            <sp-input-number label="时间" :labelWidth="40"  :min="1" :step="1"  v-model:value="params.time" allow-clear />
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="SetAutoFeed()">自动上料</a-button>  
                <a-button type="primary" @click="SetAutoBlank()">自动下料</a-button>
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
  name: 'DebugIncubatorCo2'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')

const params = reactive({
  tower: 1,
  layer: 1,
  time: 0,
  code: ''
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

const btnInitCmd = (cmd) => {
  const data = form.value
  data.cmd = cmd + 'I'
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

const handleCancel = () => {
  form.value.id = ''
  visible.value = false
}

const InitializeDevice = () => {
  var param = { "cmd": "initializedevice", "value": "0" }
  doCommand(param)
}

const SetTowerNumber = () => {
  var param = { "cmd": "settowernumber", "value": params.tower }
  doCommand(param)
}

const SetLayerNumber = () => {
  var param = { "cmd": "setlayernumber", "value": params.layer }
  doCommand(param)
}

const SetAutoFeed = () => {
  var param = {
    "cmd": "setautofeed",
    "value": "0",
    "tower": params.tower,
    "layer": params.layer,
    "code": params.code,
    "time": params.time
  }
  doCommand(param)
}

const SetAutoBlank = () => {
  var param = {
    "cmd": "setautoblank",
    "value": "0",
    "tower": params.tower,
    "layer": params.layer,
    "time": params.time
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
