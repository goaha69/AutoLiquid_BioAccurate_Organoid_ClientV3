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
                <a-button type="primary" @click="BtnRead()">判读</a-button>  
                <a-button type="primary" @click="BtnStopRead()">停止判读</a-button>
                <a-button type="primary" @click="BtngetRluResult()">获取数据</a-button>
          </div>   
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="孔位" :labelWidth="60" :placeholder="1" :min="1" :max="384" v-model:value="params.Hole1" allow-clear />
            <span>-</span>
            <sp-input-number :labelWidth="60" :placeholder="1" :min="1" :max="384" v-model:value="params.Hole2" allow-clear />
              <a-button type="primary" @click="BtnSetReadHole()">设置</a-button>                   
            </div>

                               
        </a-row>
        

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnDoorOpen()">开</a-button>  
                <a-button type="primary" @click="BtnDoorClose()">关门</a-button>
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
  name: 'DebugMicroplateReader'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')
const myInputNumberStep = ref(1)

const params = reactive({
  Hole1: 1,
  Hole2: 1
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

const BtnDoorOpen = () => {
  var param = { "cmd": "open", "value": "0" }
  doCommand(param)
}

const BtnDoorClose = () => {
  var param = { "cmd": "close", "value": "0" }
  doCommand(param)
}

const BtnRead = () => {
  var param = { "cmd": "read", "value": "0" }
  doCommand(param)
}

const BtnStopRead = () => {
  var param = { "cmd": "stopread", "value": "0" }
  doCommand(param)
}

const BtnSetReadHole = () => {
  var holestr = ""
  for (let i = params.Hole1; i <= params.Hole2; i++) {
    holestr += i + ","
  }
  holestr = holestr.slice(0, holestr.length - 1)
  console.log(holestr)
  var param = { "cmd": "setreadhole", "value": holestr }
  doCommand(param)
}

const BtngetRluResult = () => {
  var param = { "cmd": "getrluresult", "value": "0" }
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
