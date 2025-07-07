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
						<a-button type="primary" @click="btnDisConnect()">断开设备</a-button>

					</div>     
				</a-row>
				
				<a-row :gutter="24">
					<div style="margin-top:20px;">夹爪
						<a-button type="primary" @click="btnEnableClamp()">使能</a-button> 
						<sp-input-number label="力矩" :labelWidth="60" :min="0" :max="255" v-model:value="params.torque1" allow-clear />
						<sp-input-number label="速度" :labelWidth="60" :min="0" :max="255" v-model:value="params.speed1" allow-clear />
						<sp-input-number label="位置" :labelWidth="60" unit="mm" :min="0" :max="32" v-model:value="params.loca1" allow-clear />
						<a-button type="primary" @click="btnDoClamp()">执行</a-button> 
					</div>
				</a-row>

				<a-row :gutter="24">
					<div style="margin-top:20px;">旋转
						<a-button type="primary" @click="btnEnableRotate()">使能</a-button> 
						<sp-input-number label="力矩" :labelWidth="60" :min="0" :max="255" v-model:value="params.torque2" allow-clear />
						<sp-input-number label="速度" :labelWidth="60" :min="0" :max="255" v-model:value="params.speed2" allow-clear />
						<sp-input-number label="角度" :labelWidth="60" :width="500" unit="ang" :min="-32768" :max="32767" v-model:value="params.loca2" allow-clear />		
						<a-button type="primary" @click="btnDoRotate()">执行</a-button> 
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
  name: 'DebugMisumi'
})

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentName = ref('')
const cmdParam = ref('')
const myInputNumberStep = ref(0.5)
const myInputNumberPrecision = ref(2)

const params = reactive({
  torque1: 127,
  speed1: 127,
  loca1: 0,
  torque2: 127,
  speed2: 127,
  loca2: 0
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

const btnConnect = () => {
  const data = form.value
  console.log('连接设备ID:' + data.id)
  connect(data).then((res) => {
    if (res.success) {
      message.success('设备连接成功')
    } else {
      message.error('设备连接失败::' + res.message)
    }
  }).catch((err) => {
    message.error('设备连接错误::' + err.message)
  })
}

const btnDisConnect = () => {
  const data = form.value
  data.param = { "cmd": "disconnect", "value": 0 }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::' + res.message)
    }
  })
}

const btnEnableClamp = () => {
  const data = form.value
  data.param = { "cmd": "enableclamp", "value": 0 }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::' + res.message)
    }
  })
}

const btnEnableRotate = () => {
  const data = form.value
  data.param = { "cmd": "enablerotate", "value": 0 }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::' + res.message)
    }
  })
}

const btnDoClamp = () => {
  var value = [params.torque1, params.speed1, params.loca1]
  const data = form.value
  data.param = { "cmd": "doclamp", "value": value }
  doCmd(data).then((res) => {
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::' + res.message)
    }
  })
}

const btnDoRotate = () => {
  var value = [params.torque2, params.speed2, params.loca2]
  const data = form.value
  data.param = { "cmd": "dorotate", "value": value }
  doCmd(data).then((res) => {
    console.log(res)
    if (res.success) {
      message.success('执行成功')
    } else {
      message.error('执行失败::::::' + res.message)
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
