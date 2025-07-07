<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" />
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
						<a-button type="primary" @click="btnConnect()">连接设备</a-button>
					</div>     
        </a-row>
        
        <a-row :gutter="8">
          <div style="margin-top:20px;">
            通道1数据复制至已选择通道
            <a-switch v-model:checked="choose.checked0" @change="SwitchChange()"/>
					</div>     
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked1">通道1</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol1" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol1" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed1" allow-clear />
            <sp-input label="枪头1" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists1" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
					</div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked2">通道2</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol2" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol2" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed2" allow-clear />
            <sp-input label="枪头2" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists2" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked3">通道3</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol3" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol3" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed3" allow-clear />
            <sp-input label="枪头3" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists3" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked4">通道4</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol4" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol4" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed4" allow-clear />
            <sp-input label="枪头4" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists4" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked5">通道5</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol5" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol5" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed5" allow-clear />
            <sp-input label="枪头5" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists5" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked6">通道6</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol6" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol6" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed6" allow-clear />
            <sp-input label="枪头6" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists6" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked7">通道7</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol7" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol7" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed7" allow-clear />
            <sp-input label="枪头7" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists7" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked8">通道8</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol8" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol8" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed8" allow-clear />
            <sp-input label="枪头8" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists8" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked9">通道9</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol9" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol9" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed9" allow-clear />
            <sp-input label="枪头9" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists9" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked10">通道10</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol10" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol10" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed10" allow-clear />
            <sp-input label="枪头10" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists10" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked11">通道11</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol11" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol11" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed11" allow-clear />
            <sp-input label="枪头11" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists11" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked12">通道12</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol12" allow-clear />
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol12" allow-clear />
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed12" allow-clear />
            <sp-input label="枪头12" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists12" allow-clear />
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
            <a-button type="primary" @click="btnInit()">复位</a-button>  
						<a-button type="primary" @click="btnAspirate()">吸液</a-button> 
            <a-button type="primary" @click="btnDispense()">喷液</a-button> 
            <a-button type="primary" @click="btnDropDiti()">退枪头</a-button>
            <a-button type="primary" @click="btnDetectLiquid()">液面检测</a-button>
            <a-button type="primary" @click="btnGetDeviceID()">查看版本</a-button>
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
  name: 'DebugKeyto'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')
const myInputNumberStep = ref(0.5)
const myInputNumberPrecision = ref(2)

const choose = reactive({
  checked0: false,
  checked1: true,
  checked2: false,
  checked3: false,
  checked4: false,
  checked5: false,
  checked6: true,
  checked7: false,
  checked8: false,
  checked9: false,
  checked10: true,
  checked11: false,
  checked12: false
})

const params = reactive({
  AspirateVol1: 100, DispenseVol1: 100, Speed1: 300, IsTipExists1: "",
  AspirateVol2: 100, DispenseVol2: 100, Speed2: 300, IsTipExists2: "",
  AspirateVol3: 100, DispenseVol3: 100, Speed3: 300, IsTipExists3: "",
  AspirateVol4: 100, DispenseVol4: 100, Speed4: 300, IsTipExists4: "",
  AspirateVol5: 100, DispenseVol5: 100, Speed5: 300, IsTipExists5: "",
  AspirateVol6: 100, DispenseVol6: 100, Speed6: 300, IsTipExists6: "",
  AspirateVol7: 100, DispenseVol7: 100, Speed7: 300, IsTipExists7: "",
  AspirateVol8: 100, DispenseVol8: 100, Speed8: 300, IsTipExists8: "",
  AspirateVol9: 100, DispenseVol9: 100, Speed9: 300, IsTipExists9: "",
  AspirateVol10: 100, DispenseVol10: 100, Speed10: 300, IsTipExists10: "",
  AspirateVol11: 100, DispenseVol11: 100, Speed11: 300, IsTipExists11: "",
  AspirateVol12: 100, DispenseVol12: 100, Speed12: 300, IsTipExists12: ""
})

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

const SwitchChange = () => {
  switch (choose.checked0) {
    case true:
      if (choose.checked2) {
        params.AspirateVol2 = params.AspirateVol1
        params.DispenseVol2 = params.DispenseVol1
        params.Speed2 = params.Speed1
      }
      if (choose.checked3) {
        params.AspirateVol3 = params.AspirateVol1
        params.DispenseVol3 = params.DispenseVol1
        params.Speed3 = params.Speed1
      }
      if (choose.checked4) {
        params.AspirateVol4 = params.AspirateVol1
        params.DispenseVol4 = params.DispenseVol1
        params.Speed4 = params.Speed1
      }
      if (choose.checked5) {
        params.AspirateVol5 = params.AspirateVol1
        params.DispenseVol5 = params.DispenseVol1
        params.Speed5 = params.Speed1
      }
      if (choose.checked6) {
        params.AspirateVol6 = params.AspirateVol1
        params.DispenseVol6 = params.DispenseVol1
        params.Speed6 = params.Speed1
      }
      if (choose.checked7) {
        params.AspirateVol7 = params.AspirateVol1
        params.DispenseVol7 = params.DispenseVol1
        params.Speed7 = params.Speed1
      }
      if (choose.checked8) {
        params.AspirateVol8 = params.AspirateVol1
        params.DispenseVol8 = params.DispenseVol1
        params.Speed8 = params.Speed1
      }
      if (choose.checked9) {
        params.AspirateVol9 = params.AspirateVol1
        params.DispenseVol9 = params.DispenseVol1
        params.Speed9 = params.Speed1
      }
      if (choose.checked10) {
        params.AspirateVol10 = params.AspirateVol1
        params.DispenseVol10 = params.DispenseVol1
        params.Speed10 = params.Speed1
      }
      if (choose.checked11) {
        params.AspirateVol11 = params.AspirateVol1
        params.DispenseVol11 = params.DispenseVol1
        params.Speed11 = params.Speed1
      }
      if (choose.checked12) {
        params.AspirateVol12 = params.AspirateVol1
        params.DispenseVol12 = params.DispenseVol1
        params.Speed12 = params.Speed1
      }
      break
    default:
      break
  }
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

const getSelectedChannels = () => {
  var channels = []
  if (choose.checked1) channels.push(1)
  if (choose.checked2) channels.push(2)
  if (choose.checked3) channels.push(3)
  if (choose.checked4) channels.push(4)
  if (choose.checked5) channels.push(5)
  if (choose.checked6) channels.push(6)
  if (choose.checked7) channels.push(7)
  if (choose.checked8) channels.push(8)
  if (choose.checked9) channels.push(9)
  if (choose.checked10) channels.push(10)
  if (choose.checked11) channels.push(11)
  if (choose.checked12) channels.push(12)
  return channels
}

const btnInit = () => {
  const data = form.value
  data.param = { "cmd": "init", "channels": getSelectedChannels() }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnDropDiti = () => {
  const data = form.value
  data.param = { "cmd": "dropditi", "channels": getSelectedChannels() }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnDetectLiquid = () => {
  const data = form.value
  data.param = { "cmd": "detectliquid", "channels": getSelectedChannels() }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnGetDeviceID = () => {
  const data = form.value
  data.param = { "cmd": "getdeviceid", "channels": getSelectedChannels() }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnAspirate = () => {
  var channels = []
  var aspVols = []
  var speeds = []
  if (choose.checked1) {
    channels.push(1)
    aspVols.push(params.AspirateVol1)
    speeds.push(params.Speed1)
  }
  if (choose.checked2) {
    channels.push(2)
    aspVols.push(params.AspirateVol2)
    speeds.push(params.Speed2)
  }
  if (choose.checked3) {
    channels.push(3)
    aspVols.push(params.AspirateVol3)
    speeds.push(params.Speed3)
  }
  if (choose.checked4) {
    channels.push(4)
    aspVols.push(params.AspirateVol4)
    speeds.push(params.Speed4)
  }
  if (choose.checked5) {
    channels.push(5)
    aspVols.push(params.AspirateVol5)
    speeds.push(params.Speed5)
  }
  if (choose.checked6) {
    channels.push(6)
    aspVols.push(params.AspirateVol6)
    speeds.push(params.Speed6)
  }
  if (choose.checked7) {
    channels.push(7)
    aspVols.push(params.AspirateVol7)
    speeds.push(params.Speed7)
  }
  if (choose.checked8) {
    channels.push(8)
    aspVols.push(params.AspirateVol8)
    speeds.push(params.Speed8)
  }
  if (choose.checked9) {
    channels.push(9)
    aspVols.push(params.AspirateVol9)
    speeds.push(params.Speed9)
  }
  if (choose.checked10) {
    channels.push(10)
    aspVols.push(params.AspirateVol10)
    speeds.push(params.Speed10)
  }
  if (choose.checked11) {
    channels.push(11)
    aspVols.push(params.AspirateVol11)
    speeds.push(params.Speed11)
  }
  if (choose.checked12) {
    channels.push(12)
    aspVols.push(params.AspirateVol12)
    speeds.push(params.Speed12)
  }
  const data = form.value
  data.param = { "cmd": "aspirate", "channels": channels, "aspVols": aspVols, "speeds": speeds }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnDispense = () => {
  var channels = []
  var disVols = []
  var speeds = []
  if (choose.checked1) {
    channels.push(1)
    disVols.push(params.DispenseVol1)
    speeds.push(params.Speed1)
  }
  if (choose.checked2) {
    channels.push(2)
    disVols.push(params.DispenseVol2)
    speeds.push(params.Speed2)
  }
  if (choose.checked3) {
    channels.push(3)
    disVols.push(params.DispenseVol3)
    speeds.push(params.Speed3)
  }
  if (choose.checked4) {
    channels.push(4)
    disVols.push(params.DispenseVol4)
    speeds.push(params.Speed4)
  }
  if (choose.checked5) {
    channels.push(5)
    disVols.push(params.DispenseVol5)
    speeds.push(params.Speed5)
  }
  if (choose.checked6) {
    channels.push(6)
    disVols.push(params.DispenseVol6)
    speeds.push(params.Speed6)
  }
  if (choose.checked7) {
    channels.push(7)
    disVols.push(params.DispenseVol7)
    speeds.push(params.Speed7)
  }
  if (choose.checked8) {
    channels.push(8)
    disVols.push(params.DispenseVol8)
    speeds.push(params.Speed8)
  }
  if (choose.checked9) {
    channels.push(9)
    disVols.push(params.DispenseVol9)
    speeds.push(params.Speed9)
  }
  if (choose.checked10) {
    channels.push(10)
    disVols.push(params.DispenseVol10)
    speeds.push(params.Speed10)
  }
  if (choose.checked11) {
    channels.push(11)
    disVols.push(params.DispenseVol11)
    speeds.push(params.Speed11)
  }
  if (choose.checked12) {
    channels.push(12)
    disVols.push(params.DispenseVol12)
    speeds.push(params.Speed12)
  }
  const data = form.value
  data.param = { "cmd": "dispense", "channels": channels, "disVols": disVols, "speeds": speeds }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
  })
}

const btnTipExists = () => {
  const data = form.value
  data.param = { "cmd": "tipexists", "channels": getSelectedChannels() }
  doCmd(data).then((res) => {
    if (res.success) {
      console.log(res)
      switch (res.data) {
        case 0:
          params.IsTipExists = "false"
          break
        case 1:
          params.IsTipExists = "true"
          break
      }
      message.success('执行成功')
    } else {
      message.error('执行失败::::::::' + res.message)
    }
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
