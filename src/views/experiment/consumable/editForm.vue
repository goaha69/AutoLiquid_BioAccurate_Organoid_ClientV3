<template>
  <a-modal title="编辑耗材" :width="1300" :open="visible" :maskClosable="false" @ok="handleSubmit"
    @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <a-row :gutter="8">
          <div>
            <sp-input label="耗材编号" :required="true" :isError="errors.code" v-model="attributeData.code" />
            <sp-input label="耗材名称" :labelWidth="80" :required="true" :isError="errors.name" :inputWidth="200"
              v-model="attributeData.name" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number :step="1" label="行数" :required="true" v-model="attributeData.rowCount" />
            <sp-input-number :step="1" label="列数" :labelWidth="100" :required="true" v-model="attributeData.colCount" />
            <sp-input-number label="行距" unit="mm" :labelWidth="100" :required="true" v-model="attributeData.rowSpace" />
            <sp-input-number label="列距" unit="mm" :labelWidth="100" :required="true" v-model="attributeData.colSpace" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="X尺寸" unit="mm" :required="true" v-model="attributeData.xSize" />
            <sp-input-number label="Y尺寸" :labelWidth="100" unit="mm" :required="true" v-model="attributeData.ySize" />
            <sp-input-number label="X偏移" :labelWidth="100" unit="mm" :required="true" v-model="attributeData.xOffset" />
            <sp-input-number label="Y偏移" :labelWidth="100" unit="mm" :required="true" v-model="attributeData.yOffset" />
          </div>
          <div style="margin-top:10px;">
            <span class="span-label" style="width:140px;">是否枪头盒::</span>
            <a-checkbox v-model="attributeData.isTipBox" style="width:60px;" />

            <span class="span-label" style="margin-left:60px;">量程::</span>
            <a-select style="width: 100px" v-model:value="attributeData.liquidRange" :disabled="!attributeData.isTipBox">
              <a-select-option v-for="(item, index) in liquidRanges" :key="index" :value="item.code">{{ item.value
                }}</a-select-option>
            </a-select>
            <span class="span-unit">(μl)</span>

            
            <sp-input-number :step="0.001" label="耗材底面" :labelWidth="140"
              v-model="attributeData.consumableBasalAreaCoefficient" />

          </div>
          <div style="margin-top:10px;">
            <span class="span-label" style="width:140px;">使用夹抓::</span>
            <a-checkbox v-model="attributeData.useArm" style="width:100px;" />
            <span class="span-label" style="width: 140px; margin-left: 10px;">机械臂::</span>
            <a-select style="width: 140px;" v-model:value="armAttribute.equipmentId" :disabled="!attributeData.useArm">
              <a-select-option v-for="(item, index) in armEquipmentData" :key="index" :value="item.id">{{ item.name
                }}</a-select-option>
            </a-select>
            <sp-input-number :step="100" label="最大体" :labelWidth="100" unit="μl" v-model="attributeData.maxVolume" />
            <a-checkbox v-model="attributeData.isRemainingVolume"
              style="margin-left: 20px;color: #000;">剩余体积</a-checkbox>
            <sp-input-number :step="100" label="" :labelWidth="-10" unit="μl" v-model="attributeData.remainingVolume" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number :step="0.5" label="底面积系" :labelWidth="140" :right-empty="true"
              v-model="attributeData.basalAreaCoefficient" />
            <sp-input-number :step="0.5" label="耗材高度" :labelWidth="90" unit="mm"
              v-model="attributeData.consumableHeight" />
            <sp-input-number :step="0.5" label="混胶修正系数" :labelWidth="100"
              v-model="attributeData.mixBMEModifiedCoefficient" />
            <sp-input-number :step="0.5" label="大容量高度修正系" :labelWidth="150"
              v-model="attributeData.heightModifiedCoefficient" />
          </div>
        </a-row>

        <a-row :gutter="8">
          <a-tabs type="editable-card" hide-add style="margin-left: 0px; margin-top: 10px;">
            <a-tab-pane v-for="(item,index) in attributeData.pToZSpeedLiquidJson" :tab="index=='fifty'?'50ul':index=='oneThousand'?'1000ul':'200ul'" :key="index" :closable="false">
              <div>
                <sp-input-number label="吸液速度" v-model="item.absorbSpeed" />
                <sp-input-number label="P-Z吸液速度转换系数" :labelWidth="150" :step="3" unit="mm"
                  v-model="item.pToZSpeedCoefficient" />
              </div>

            </a-tab-pane>
          </a-tabs>
        </a-row>
        <a-row :gutter="8">
          <a-tabs type="editable-card" hide-add style="margin-left: 0px; margin-top: 10px;">
            <a-tab-pane v-for="item in params" :key="item.id" :tab="item.name" :closable="false">
              <div>
                <sp-input-number label="行走高度" :labelWidth="120" unit="mm" :required="true"
                  :isError="errors.normalHeight" v-model="item.normalHeight" />
                <sp-input-number label="变距步数" :step="1" :rightEmpty="true" v-model="item.variableDistanceStep" />
                <sp-input-number label="吸前混合高度" unit="mm" v-model="item.absorbMixingHeight" />
                <sp-input-number label="自主变距恢复步长" :step="1" :rightEmpty="true" v-model="item.isAutoVariableRenewStep" />
                <span class="span-label" style="width:80px;">液面检测::</span>
                <a-checkbox v-model="item.isDetectLiquid" />
              </div>
              <div style="margin-top:10px;" v-if="!attributeData.isTipBox">
                <div>
                  <sp-input-number label="预吸液高" :labelWidth="120" unit="mm" v-model="item.prepareAbsorbHeight" />
                  <sp-input-number label="吸液高度" unit="mm" v-model="item.absorbHeight" />
                  <sp-input-number label="喷后混合高度" unit="mm" v-model="item.jetMixingHeight" />
                  <sp-input-number label="变距相邻补偿" v-model="item.variableRenewAdjacent" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input-number label="预喷液高" :labelWidth="120" unit="mm" v-model="item.prepareJetHeight" />
                  <sp-input-number label="喷液高度" unit="mm" v-model="item.jetHeight" />
                  <span class="span-label" style="margin-left: 10px;">是否自主变距::</span>
                  <a-checkbox v-model="item.isAutoVariable" style="width:100px;" />
                </div>
              </div>
              <div style="margin-top:10px;">
                <div>
                  <sp-input-number label="粘滞系数" :labelWidth="120" :step="0.5"
                    v-model="item.viscousFrictionCoefficient" />
                  <sp-input-number label="喷胶系数" :labelWidth="120" style="margin-left: 10px;" :step="0.5"
                    v-model="item.jetBMECoefficient" />
                  <sp-input-number label="自主变距步长" :step="1" :rightEmpty="true" v-model="item.isAutoVariableStep" />
                  <sp-input-number label="一吸多喷行走高度" :labelWidth="130" unit="mm" v-model="item.one2MoreNormalHeight" />
                </div>
              </div>
              <div style="margin-top:10px;" v-if="attributeData.isTipBox">
                <div>
                  <sp-input-number label="预取枪头高度" :labelWidth="120" unit="mm" v-model="item.prepareTakeTipHeight" />
                  <sp-input-number label="取枪头高度" :labelWidth="120" unit="mm" v-model="item.takeTipHeight" />
                  <sp-input label="取枪头速度" :labelWidth="138" v-model="item.takeTipSpeedCmd" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input-number label="重复取枪头次数" :labelWidth="120" :step="1" v-model="item.takeTipRepeatTime" />
                  <sp-input-number label="重复取枪头高度" :labelWidth="152" style="margin-left:40px;" unit="mm"
                    v-model="item.takeTipRepeatHeight" />
                  <sp-input-number label="取枪头后预提高度" :labelWidth="126" style="margin-left:10px;" unit="mm"
                    v-model="item.takeTipAfterPrepareHeight" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input label="预提高度后执行指令" :labelWidth="140" v-model="item.takeTipAfterPrepareHeightCmd" />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-row>
        <a-row :gutter="8" v-if="attributeData.useArm">
          <a-card title="夹抓参数" :bordered="false">
            <div>
              <sp-input-number label="行走高度" :labelWidth="90" unit="mm" v-model="armAttribute.normalHeight" />
              <sp-input-number label="X偏移" :labelWidth="90" unit="mm" v-model="armAttribute.xOffset" />
              <sp-input-number label="Y偏移" :labelWidth="90" unit="mm" v-model="armAttribute.yOffset" />
              <sp-input-number label="Z偏移" :labelWidth="90" unit="mm" v-model="armAttribute.zOffset" />
            </div>
            <div style="margin-top:10px;">
              <sp-input-number label="松开高度" :labelWidth="90" unit="mm" v-model="armAttribute.clipReleaseHeight" />
              <sp-input-number label="夹紧高度" :labelWidth="90" unit="mm" v-model="armAttribute.clipCloseHeight" />
              <sp-input-number label="开盖高度" :labelWidth="90" unit="mm" v-model="armAttribute.clipOpenHeight" />
            </div>
            <div style="margin-top:10px;">
              <sp-input-number label="夹子松开" :labelWidth="90" v-model="armAttribute.clipRelease" />
              <sp-input-number label="夹子夹紧" :labelWidth="90" v-model="armAttribute.clipClose" />
              <sp-input-number label="夹子开启" :labelWidth="90" v-model="armAttribute.clipOpen" />
            </div>
          </a-card>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { exp_consumable_edit, exp_consumable_getArmAttribute, exp_consumable_getParams } from '@/api/modular/experiment/consumableManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'
import { doCmd } from '@/api/modular/experiment/debug'

defineOptions({
  name: 'ConsumableEditForm'
})

const emit = defineEmits(['ok'])

const statusData = ref([])
const Data = ref([])
const visible = ref(false)
const formLoading = ref(false)
const liquidRanges = ref([])
const attributeData = ref({})
const params = ref([])
const armEquipmentData = ref([])
const equipmentData = ref([])
const clipEquipmentData = ref([])

const errors = reactive({
  code: false,
  name: false,
})

const armAttribute = reactive({
  consumableId: 0,
  xOffset: 0.0,
  yOffset: 0.0,
  zOffset: 0.0,
  clipOpen: 0.0,
  clipClose: 0.0,
  clipEquipmentId: null,
  equipmentId: null,
  clipRelease: 0.0,
  clipReleaseHeight: 0.0,
  clipCloseHeight: 0.0,
  clipOpenHeight: 0.0,
  normalHeight: 0.0,
  clipCloseAfterWait: 0.0,
  clipReleaseBeforeWait: 0.0,
  variableDistanceStep: 0,
  ConsumableBasalAreaCoefficient: 0.0
})

const clipOpenVisible = ref(false)
const loadingButton = ref('')

onMounted(() => {
  sysDictTypeDropDownFunc()
})

const armChange = (value) => {
  console.log('=========armChange=========')
  console.log(value)
  var arm = armEquipmentData.value.filter(item => item.id === armAttribute.equipmentId)[0]
  if (arm != null && arm.clipEquipmentId != null)
    clipOpenVisible.value = true
  else
    clipOpenVisible.value = false
}

const getEquipmentData = () => {
  exp_equipment_list({}).then((res) => {
    if (res.success) {
      equipmentData.value = res.data
      armEquipmentData.value = equipmentData.value.filter(item => item.type === 1)
    }
  })
}

const resetAttribute = () => {
  Object.assign(armAttribute, {
    consumableId: 0,
    xOffset: 0.0,
    yOffset: 0.0,
    zOffset: 0.0,
    clipOpen: 0.0,
    clipClose: 0.0,
    clipEquipmentId: null,
    equipmentId: null,
    clipRelease: 0.0,
    clipReleaseHeight: 0.0,
    clipCloseHeight: 0.0,
    clipOpenHeight: 0.0,
    normalHeight: 0.0,
    one2MoreNormalHeight: 0.0,
  })
  
  Object.assign(errors, {
    code: false,
    name: false,
  })

  armEquipmentData.value = []
  clipEquipmentData.value = []
  params.value = []
  clipOpenVisible.value = false
}

const sysDictTypeDropDownFunc = (text) => {
  sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
    liquidRanges.value = res.data
    liquidRanges.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })
}

const edit = (record) => {
  visible.value = true
  console.log(record)

  getEquipmentData()
  resetAttribute()

  attributeData.value = { ...record }
  console.log('===================================')
  console.log(attributeData.value)

  if (attributeData.value.useArm) {
    var dd = { id: record.id }
    exp_consumable_getArmAttribute(dd).then((res) => {
      Object.assign(armAttribute, res.data)
    })
  }

  var dd1 = { id: record.id }
  exp_consumable_getParams(dd1).then((res) => {
    params.value = res.data
  })
}

const validateFields = () => {
  var result = true
  errors.code = !attributeData.value.code
  errors.name = !attributeData.value.name
  console.log(errors)
  for (const key in errors) {
    if (errors[key]) {
      result = false
      break
    }
  }
  return result
}

const handleSubmit = () => {
  console.log('=================handleSubmit=================')
  if (!validateFields())
    return

  armAttribute.consumableId = attributeData.value.id
  formLoading.value = true
  var obj = {
    ...attributeData.value,
    armAttribute: armAttribute,
    params: params.value,
  }
  console.log('========实际要提交的参数==========')
  console.log(obj)

  exp_consumable_edit(obj).then((res) => {
    if (res.success) {
      message.success('编辑成功')
      resetAttribute()
      emit('ok', obj)
      handleCancel()
    }
  }).finally((res) => {
    formLoading.value = false
  })
}

const handleCancel = () => {
  resetAttribute()
  visible.value = false
}

const btnGoPos = (axle, value) => {
  // Implementation needed
}

defineExpose({
  edit
})
</script>

<style scoped>
.span-label {
  font-weight: bold;
  color: #333;
}

.span-unit {
  margin-left: 5px;
  color: #666;
}

.my-data-picker {
  width: 150px;
}

.my-select {
  width: 140px;
}
</style>
