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
              <a-divider type="vertical" />
              <a-button type="primary" @click="btnInitMachine">全部复位</a-button>
            </a-form-item>            
          </a-col>          
        </a-row>

        <sp-input label="模板名称" :labelWidth="80" :inputWidth="80" v-model:value="params.template" allow-clear />
        <sp-input label="实验名称" :labelWidth="80" :inputWidth="80" v-model:value="params.experiment" allow-clear />
        <sp-input label="耗材id" :labelWidth="80" :inputWidth="80" v-model:value="params.time" allow-clear />
        <sp-input label="名称" :labelWidth="80" :inputWidth="80" v-model:value="params.code" allow-clear />
        <sp-input label="步骤" :labelWidth="80" :inputWidth="80" v-model:value="params.step" allow-clear />
              <a-button type="primary" @click="BtnStart()">开</a-button> 

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnStop()">停止</a-button>  
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnMoveFile()">转移文件</a-button>  
                <a-button type="primary" @click="BtnReadCellCount()">读取计数</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnDoorOpen()">开</a-button>  
                <a-button type="primary" @click="BtnDoorClose()">关门</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="图片路径" :labelWidth="80" :inputWidth="400" v-model:value="params.photopath" allow-clear />
            <a-button type="primary" @click="BtnAnalysisPhoto()">分析图片</a-button>
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
  name: 'DebugMicroscope'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')

const params = reactive({
  template: '通用类器官BF',
  experiment: '',
  time: '1,,',
  code: 'photo',
  step: 1,
  photopath: ''
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
      message.error('执行命令失败:' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:' + err.message)
  })
}

const handleCancel = () => {
  form.value = {}
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

const BtnStart = () => {
  var param = {
    "cmd": "start",
    "template": params.template,
    "experiment": params.experiment,
    "time": params.time,
    "code": params.code,
    "step": params.step
  }
  doCommand(param)
}

const BtnStop = () => {
  var param = { "cmd": "stop", "value": "0" }
  doCommand(param)
}

const BtnMoveFile = () => {
  var param = { "cmd": "movefile", "value": "0" }
  doCommand(param)
}

const BtnReadCellCount = () => {
  var param = { "cmd": "readcellcount", "step": params.step }
  doCommand(param)
}

const BtnAnalysisPhoto = () => {
  var param = { "cmd": "analysisphoto", "photopath": params.photopath }
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
