<template>
  <a-modal title="新增设备" :width="800" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">  
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="8">
          <div>            
            <sp-input label="设备编号" :required="true" :isError="errors.code" :labelWidth="120" v-model="attributeData.code" />
            <sp-input label="设备名称" :required="true" :isError="errors.name" :labelWidth="120" :inputWidth="250" v-model="attributeData.name" />
          </div>

          <div style="margin-top:10px;">            
            <span class="span-label">是否第三方：</span>
            <a-radio-group v-model:value="attributeData.isThirdParty" class="my-radio-group">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>

            <span class="span-label" style="margin-left:40px;">通讯协议：</span>
            <a-select class="my-select" placeholder="请选择通讯协议" v-model:value="attributeData.communicatioProtocol" @change="changeProtocolType">
              <a-select-option v-for="(item, index) in protocolTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;" v-if="attributeData.isThirdParty">
            <sp-input label="控制类：" :labelWidth="120" :inputWidth="580" v-model="attributeData.controlClass"/>
          </div>

          <div style="margin-top:10px;" v-if="attributeData.communicatioProtocol < 3">            
            <sp-input label="主机" :required="true" :isError="errors.host" :labelWidth="120" v-model="attributeData.host" />
            <sp-input-number label="端口" :step="1" :required="true" :isError="errors.port" :labelWidth="120" v-model="attributeData.port" />
          </div>

          <div style="margin-top:10px;" v-if="attributeData.communicatioProtocol >= 3">            
            <sp-input label="Com口" :required="true" :isError="errors.comPort" :labelWidth="120" v-model="attributeData.comPort" />
            <sp-input-number label="波特率" :step="1" :required="true" :isError="errors.baudRate" :labelWidth="120" v-model="attributeData.baudRate" />
          </div>

          <div style="margin-top:10px;">   
            <sp-input label="生产厂商" :labelWidth="120" v-model="attributeData.manufacturer" />

            <span class="span-label">生产日期：</span>
            <a-date-picker placeholder="请选择生产日期" class="my-data-picker" v-model:value="attributeData.manufactureDate" @change="onDateChange"/>
          </div>

          <div style="margin-top:10px;">   
            <sp-input label="配置url" :labelWidth="120" v-model="attributeData.paramsPage" />

            <span class="span-label">设备类型：</span>
            <a-select class="my-select" placeholder="请选择设备类型" v-model:value="attributeData.type" @change="equipmentTypeFunc">
              <a-select-option v-for="(item, index) in equipmentTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import moment from 'moment'
import { exp_equipment_add } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

// 定义emits
const emit = defineEmits(['ok'])

// 响应式数据
const visible = ref(false)
const formLoading = ref(false)
const form = ref({})
const protocolTypes = ref([])
const equipmentTypes = ref([])
const manufactureDateString = ref('')

const attributeData = reactive({
  id: 0,
  code: '',
  name: '',          
  type: 0,
  communicatioProtocol: 1,
  remark: '',
  controlClass: '',
  host: '',
  port: 0,
  comPort: '',
  baudRate: 0,
  manufacturer: '',
  paramsPage: '',  
  isThirdParty: false,
  manufactureDate: null
})

const pipetteAttribute = reactive({
  equipmentId: 0,
  prepareReleaseTipPosX: 0.0,
  prepareReleaseTipPosY: 0.0,
  prepareReleaseTipPosZ: 0.0,
  releaseTipPosX: 0.0,
  releaseTipPosY: 0.0,
  releaseTipPosZ: 0.0,
  channelRow: 1,
  channelCol: 1,
  headLiquidRange: 0,
  isVariable: false,
  walkingLogic: 0,
  takeTipEachCol: true,          
  takeTipLeft2Right: true,
  releaseTipUsePush: true,
  releaseTipUsePushCount: 1,
  releaseTipOffset: 0.0,
  releaseTipAxis: 4,      
  prepareReleaseTipAxisXGoFirst: false,
  prepareReleaseTipAxisYGoFirst: false,
  releaseTipBack2TakePos: false,
  releaseTipZa0Before: false,
  releaseTipSpeedCmd: '',
  releaseTipAfterCmd: '',
  a1Pos: 0,
  absorbAirBeforePercent: 0.0,
  absorbAirAfterPercent: 0.0,
  absorbLiquidMoreOne2MorePercent: 0.0,
  jetLiquidMoreOne2MoreScale: 0.0,
  jetEquipmentId: null,
})

const errors = reactive({
  code: false,
  name: false,
  host: false,
  port: false,
  comPort: false,
  baudRate: false
})

// 生命周期
onMounted(() => {
  manufactureDateString.value = moment().format('YYYY-MM-DD')
  loadSysDictTypeDropDown()
})

// 方法
function resetAttribute() {
  Object.assign(attributeData, {
    id: 0,
    code: '',
    name: '',          
    type: 0,
    communicatioProtocol: 1,
    manufactureDate: null,
    remark: '',
    controlClass: '',
    host: '',
    port: 0,
    comPort: '',
    baudRate: 0,
    manufacturer: '',
    paramsPage: '',   
    isThirdParty: false           
  })
  
  Object.assign(pipetteAttribute, {
    equipmentId: 0,
    prepareReleaseTipPosX: 0.0,
    prepareReleaseTipPosY: 0.0,
    prepareReleaseTipPosZ: 0.0,
    releaseTipPosX: 0.0,
    releaseTipPosY: 0.0,
    releaseTipPosZ: 0.0,
    channelRow: 1,
    channelCol: 1,
    headLiquidRange: 0,
    isVariable: false,
    walkingLogic: 0,
    takeTipEachCol: true,          
    takeTipLeft2Right: true,
    releaseTipUsePush: true,
    releaseTipUsePushCount: 1,
    releaseTipOffset: 0.0,
    releaseTipAxis: 4,      
    prepareReleaseTipAxisXGoFirst: false,
    prepareReleaseTipAxisYGoFirst: false,
    releaseTipBack2TakePos: false,
    releaseTipZa0Before: false,
    releaseTipSpeedCmd: '',
    releaseTipAfterCmd: '',
    a1Pos: 0,
    absorbAirBeforePercent: 0.0,
    absorbAirAfterPercent: 0.0,
    absorbLiquidMoreOne2MorePercent: 0.0,
    jetLiquidMoreOne2MoreScale: 0.0,
    jetEquipmentId: null,
  })
  
  Object.assign(errors, {
    code: false,
    name: false,
    host: false,
    port: false,
    comPort: false,
    baudRate: false
  })
}

function onDateChange(date) {
  manufactureDateString.value = moment(date).format('YYYY-MM-DD')
}

function changeProtocolType(value) {
  // 协议类型改变时的处理
}

function equipmentTypeFunc(value) {
  // 设备类型改变时的处理
}

function loadSysDictTypeDropDown() {
  // 加载协议类型字典
  sysDictTypeDropDown({ code: 'protocol_type' }).then((res) => {
    if (res.success) {
      protocolTypes.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载设备类型字典
  sysDictTypeDropDown({ code: 'equipment_type' }).then((res) => {
    if (res.success) {
      equipmentTypes.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })
}

function add(record) {
  visible.value = true
  formLoading.value = false
  resetAttribute()
}

function validateFields() {
  let result = true
  errors.code = !attributeData.code
  errors.name = !attributeData.name
  errors.host = attributeData.communicatioProtocol < 3 ? !attributeData.host : false
  errors.port = attributeData.communicatioProtocol < 3 ? !attributeData.port : false
  errors.comPort = attributeData.communicatioProtocol >= 3 ? !attributeData.comPort : false
  errors.baudRate = attributeData.communicatioProtocol >= 3 ? !attributeData.baudRate : false
  
  for (const key in errors) {          
    if (errors[key]) {            
      result = false
      break
    }
  }
  return result
}

function handleSubmit() {
  if (!validateFields()) {
    return
  }

  formLoading.value = true
  
  const host = attributeData.communicatioProtocol >= 3 ? '' : attributeData.host
  const port = attributeData.communicatioProtocol >= 3 ? 0 : attributeData.port
  const comPort = attributeData.communicatioProtocol >= 3 ? attributeData.comPort : ''
  const baudRate = attributeData.communicatioProtocol >= 3 ? attributeData.baudRate : 0

  const submitData = {
    ...attributeData,
    baudRate,
    comPort,
    host,
    port,
    manufactureDate: manufactureDateString.value
  }
  
  if ((!attributeData.isThirdParty && attributeData.type === 0) || (attributeData.isThirdParty === true && attributeData.type === 2)) {
    submitData.pipetteAttribute = pipetteAttribute
  }
  
  exp_equipment_add(submitData).then((res) => {
    if (res.success) {
      message.success('新增成功')
      visible.value = false
      emit('ok', submitData)
      resetAttribute()
    } else {
      message.error(res.message)
    }
  }).finally(() => {
    formLoading.value = false
  })
}

function handleCancel() {
  resetAttribute()
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  add
})
</script>

<style scoped>
.my-input {
  width: 160px;
}
.my-select {
  width: 160px;
}
.my-radio-group {
  width: 160px;
}
.my-data-picker{
  width: 160px;
}
.my-input-number{
  width: 120px;
}

.my-input-speed{
  width: 160px;
}
.table-col-label
{
  width:100px;
  padding: 10px;
}
.table-col-label div
{
  width:100%;
  text-align:right;
}
.table-col-value
{
  width:35%;
  padding: 10px;
}
.table-col-value input
{
  width:100%;
}
.table-col-value-3
{
  width:85%;
}
.span-unit{
  margin-left: 5px;
}
.span-label{
  width: 130px;
  text-align: right;
  display:inline-block;
  color: black;
}
</style>
