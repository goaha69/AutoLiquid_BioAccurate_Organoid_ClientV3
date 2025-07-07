<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
              <a-button type="primary" @click="btnConnect">连接设备</a-button>
                <a-divider type="vertical" />
              <a-button type="primary" @click="btnDisConnect">断开设备</a-button>
          </div>     
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnSectionLoc(1)">1号杯</a-button>            
                <a-button type="primary" @click="BtnSectionLoc(2)">2号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(3)">3号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(4)">4号杯</a-button>
                <a-divider type="vertical" />
                <a-button type="primary" @click="BtnSectionLoc(5)">5号杯</a-button>  
                <a-button type="primary" @click="BtnSectionLoc(6)">6号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(7)">7号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(8)">8号杯</a-button>
              </div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="转速" :labelWidth="40" unit="rpm" :min="0" :max="4000" v-model:value="params.Speed" allow-clear />
            <a-button type="primary" @click="BtnSetSpeed()">设置</a-button>
            <sp-input-number label="时间" :labelWidth="40" unit="min" :min="1" :max="99" v-model:value="params.Time" allow-clear />
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="上升速度" :labelWidth="40" :min="10" :max="300" v-model:value="params.UpSp" allow-clear />
            <a-button type="primary" @click="BtnSetUpSp()">设置</a-button>
            <sp-input-number label="下降速度" :labelWidth="40" :min="10" :max="300" v-model:value="params.DownSp" allow-clear />
            <a-button type="primary" @click="BtnSetDownSp()">设置</a-button>
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="转速" :labelWidth="60" :inputWidth="80" unit="rpm" v-model:value="params.ReadSpeed" allow-clear />
            <a-button type="primary" @click="BtnReadSpeed()" >读取</a-button>
            <sp-input label="倒计" :labelWidth="60" :inputWidth="80" unit="min" v-model:value="params.ReadMin" allow-clear />
            <a-button type="primary" @click="BtnReadMin()" >读取</a-button>
            <sp-input label="倒计" :labelWidth="60" :inputWidth="80" unit="sec" v-model:value="params.ReadSec" allow-clear />
            <a-button type="primary" @click="BtnReadSec()" >读取</a-button>
            <sp-input label="离心力" :labelWidth="60" :inputWidth="80" unit="g" v-model:value="params.ReadForce" allow-clear />
            <a-button type="primary" @click="BtnReadForce()" >读取</a-button>
          </div>
        </a-row>
        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="运行状态" :labelWidth="80" :inputWidth="80" v-model:value="params.ReadRun" allow-clear />
            <a-button type="primary" @click="BtnReadRun()" >读取</a-button>
            <sp-input label="杯位" :labelWidth="60" :inputWidth="80" v-model:value="params.ReadCup" allow-clear />
            <a-button type="primary" @click="BtnReadCup()" >读取</a-button>
            <sp-input label="门状态" :labelWidth="60" :inputWidth="80" v-model:value="params.ReadDoor" allow-clear />
            <a-button type="primary" @click="BtnReadDoor()" >读取</a-button>
          </div>
        </a-row>

        <a-row :gutter="24">
            <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnRun()">启动</a-button>            
                <a-button type="primary" @click="BtnStop()">停止</a-button>
                <a-divider type="vertical" />
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
  name: 'DebugCentrifuge'
})

const labelCol = { xs: { span: 24}, sm: { span: 6}}
const wrapperCol = {xs: {span: 24}, sm: {span: 16}}
const labelCol_JG = { xs: {span: 24}, sm: {span: 3}}
const wrapperCol_JG = {xs: {span: 24}, sm: { span: 20}}
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')
const myInputNumberStep = ref(0.5)
const myInputNumberPrecision = ref(2)

const params = reactive({
  Speed: 1000,
  Time: 1,
  UpSp: 9,
  DownSp: 9,
  ReadSpeed: "0",
  ReadMin: "0",
  ReadSec: "0",
  ReadForce: "0",
  ReadRun: "",
  ReadDoor: "",
  ReadCup: ""
})

const SendPar = reactive({
  "cmd": "",
  "value": 0,
  "time": 0,
  "speed": 0
})

const btnDisConnect = () => {
  SendPar.cmd = "disconnect"
  doCommand(SendPar)
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
      message.success('执行命令成功::' + res.message)
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const handleCancel = () => {
  visible.value = false
}

const BtnSectionLoc = (num) => {
  SendPar.cmd = "goto"
  SendPar.value = num
  doCommand(SendPar)
}

const BtnSetSpeed = () => {
  SendPar.cmd = "SetSpeed"
  SendPar.speed = params.Speed
  doCommand(SendPar)          
}

const BtnSetTime = () => {
  SendPar.cmd = "SetTime"
  SendPar.time = params.Time
  doCommand(SendPar)
}

const BtnSetUpSp = () => {
  SendPar.cmd = "SetUpSp"
  SendPar.value = params.UpSp
  doCommand(SendPar)
}

const BtnSetDownSp = () => {
  SendPar.cmd = "SetDownSp"
  SendPar.value = params.DownSp
  doCommand(SendPar)
}

const BtnRun = () => {
  SendPar.cmd = "run"
  SendPar.speed = params.Speed
  SendPar.time = params.Time
  doCommand(SendPar)
}

const BtnStop = () => {
  SendPar.cmd = "stop"
  doCommand(SendPar)
}

const BtnDoorOpen = () => {
  SendPar.cmd = "open"
  doCommand(SendPar)
}

const BtnDoorClose = () => {
  SendPar.cmd = "close"
  doCommand(SendPar)
}

const BtnReadStatus = () => {
  const data = form.value
  SendPar.cmd = "getstatus"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      params.ReadSpeed = res.data.speed 
      params.ReadMin   = res.data.min 
      params.ReadSec   = res.data.sec
      params.ReadForce = res.data.force 
      switch(res.data.door){ 
        case "0000": params.ReadDoor = "运动"; break; 
        case "0001": params.ReadDoor = "已关"; break;
        case "0002": params.ReadDoor = "已开"; break;
      }
      switch(res.data.cup){ 
        case "0000": params.ReadCup = "未定"; break; 
        case "0001": params.ReadCup = "1号杯" ; break;
        case "0002": params.ReadCup = "2号杯" ; break;
        case "0003": params.ReadCup = "3号杯" ; break;
        case "0004": params.ReadCup = "4号杯" ; break;
        case "0005": params.ReadCup = "5号杯" ; break;
        case "0006": params.ReadCup = "6号杯" ; break;
        case "0007": params.ReadCup = "7号杯" ; break;
        case "0008": params.ReadCup = "8号杯" ; break;
        case "0009": params.ReadCup = "定位"; break;
      }
      switch(res.data.run){ 
        case "0000": params.ReadRun = "空闲"; break; 
        case "0001": params.ReadRun = "运动"; break;
        case "0002": params.ReadRun = "停止"; break;
        case "0003": params.ReadRun = "未定"; break;
      }
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadSpeed = () => {
  const data = form.value
  SendPar.cmd = "readspeed"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      params.ReadSpeed = res.data 
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadMin = () => {
  const data = form.value
  SendPar.cmd = "readmin"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      params.ReadMin = res.data 
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadSec = () => {
  const data = form.value
  SendPar.cmd = "readsec"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      params.ReadSec = res.data 
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadForce = () => {
  const data = form.value
  SendPar.cmd = "readforce"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      params.ReadForce = res.data 
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadDoor = () => {
  const data = form.value
  SendPar.cmd = "readdoor"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      switch(res.data){ 
        case "0000": params.ReadDoor = "运动"; break; 
        case "0001": params.ReadDoor = "已关"; break;
        case "0002": params.ReadDoor = "已开"; break;
      }
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadCup = () => {
  const data = form.value
  SendPar.cmd = "readcup"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {            
      switch(res.data){ 
        case "0000": params.ReadCup = "未定"; break; 
        case "0001": params.ReadCup = "1号杯" ; break;
        case "0002": params.ReadCup = "2号杯" ; break;
        case "0003": params.ReadCup = "3号杯" ; break;
        case "0004": params.ReadCup = "4号杯" ; break;
        case "0005": params.ReadCup = "5号杯" ; break;
        case "0006": params.ReadCup = "6号杯" ; break;
        case "0007": params.ReadCup = "7号杯" ; break;
        case "0008": params.ReadCup = "8号杯" ; break;
        case "0009": params.ReadCup = "定位"; break;
      }
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
  })
}

const BtnReadRun = () => {
  const data = form.value
  SendPar.cmd = "readrun"
  data.param = SendPar
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      switch(res.data){ 
        case "0000": params.ReadRun = "空闲"; break; 
        case "0001": params.ReadRun = "运动"; break;
        case "0002": params.ReadRun = "停止"; break;
        case "0003": params.ReadRun = "未定"; break;
      }
    } else {
      message.error('执行命令失败:::::::::' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误:::::::::' + err.message)
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
