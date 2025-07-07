<template>
  <a-modal
    title="耗材"
    :width="1300"
    :open="visible"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="8">
          <div>
            <sp-input label="耗材编号" :required="true" :isError="errors.code" v-model:value="attributeData.code" />
            <sp-input label="耗材名称" :labelWidth="80" :required="true" :isError="errors.name" :inputWidth="200" v-model:value="attributeData.name" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number :step="1" label="行数" :required="true" v-model:value="attributeData.rowCount" />
            <sp-input-number :step="1" label="列数" :labelWidth="100" :required="true" v-model:value="attributeData.colCount" />
            <sp-input-number label="行间距" unit="mm" :labelWidth="100" :required="true" v-model:value="attributeData.rowSpace" />
            <sp-input-number label="列间距" unit="mm" :labelWidth="100" :required="true" v-model:value="attributeData.colSpace" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="X尺寸" unit="mm" :required="true" v-model:value="attributeData.xSize" />
            <sp-input-number label="Y尺寸" :labelWidth="100" unit="mm" :required="true" v-model:value="attributeData.ySize" />
            <sp-input-number label="X偏移" :labelWidth="100" unit="mm" :required="true" v-model:value="attributeData.xOffset" />
            <sp-input-number label="Y偏移" :labelWidth="100" unit="mm" :required="true" v-model:value="attributeData.yOffset" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="变距步长" :step="1" :rightEmpty="true" v-model:value="attributeData.variableDistanceStep" />
            <span class="span-label">是否枪头盒：</span>
            <a-checkbox v-model:checked="attributeData.isTipBox" style="width:60px;"></a-checkbox>

            <span class="span-label" style="margin-left:40px;">液体范围：</span>
            <a-select style="width: 100px" v-model:value="attributeData.liquidRange" :disabled="!attributeData.isTipBox">
              <a-select-option v-for="(item, index) in liquidRanges" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
            <span class="span-unit">(μl)</span>
          </div>
          <div style="margin-top:10px;">
            <span class="span-label" style="width:140px;">使用机械爪：</span>
            <a-checkbox v-model:checked="attributeData.useArm" style="width:100px;"></a-checkbox>
            <span class="span-label" style="width: 140px; margin-left : 10px;">机械爪设备：</span>
            <a-select style="width: 140px;" v-model:value="armAttribute.equipmentId" :disabled="!attributeData.useArm">
              <a-select-option v-for="(item, index) in armEquipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
            <sp-input-number :step="100" label="最大体积" :labelWidth="100" unit="μl" v-model:value="attributeData.maxVolume" />
            <a-checkbox v-model:checked="attributeData.isRemainingVolume" style="margin-left: 10px;color: #000;">剩余体积</a-checkbox>
            <sp-input-number :step="100" label="剩余体积" :labelWidth="-10" unit="μl" v-model:value="attributeData.remainingVolume" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number :step="0.5" label="底面积系数" :labelWidth="140" :right-empty="true" v-model:value="attributeData.basalAreaCoefficient" />
            <sp-input-number :step="0.5" label="耗材高度" :labelWidth="90" unit="mm" v-model:value="attributeData.consumableHeight" />
            <sp-input-number :step="0.5" label="混合BME系数" :labelWidth="100" v-model:value="attributeData.mixBMEModifiedCoefficient" />
            <sp-input-number :step="0.5" label="高度修正系数" :labelWidth="150" v-model:value="attributeData.heightModifiedCoefficient" />
          </div>
        </a-row>

        <a-row :gutter="8">
          <a-tabs type="editable-card" hide-add style="margin-left: 0px; margin-top : 10px;">
            <a-tab-pane v-for="item in params" :key="item.id" :tab="item.name" :closable="false">
              <div>
                <sp-input-number label="正常高度" :labelWidth="120" unit="mm" :required="true"
                  :isError="errors.normalHeight" v-model:value="item.normalHeight" />
                <sp-input-number label="变距步长" :step="1" :rightEmpty="true" v-model:value="item.variableDistanceStep" />
                <sp-input-number label="吸取前混合高度" unit="mm" v-model:value="item.absorbMixingHeight" />
                <sp-input-number label="自动变距指令" :step="1" :rightEmpty="true" v-model:value="item.isAutoVariableRenewStep" />
                <span class="span-label" style="width:80px;">液面检测：</span>
                <a-checkbox v-model:checked="item.isDetectLiquid"></a-checkbox>
              </div>
              <div style="margin-top:10px;" v-if="!attributeData.isTipBox">
                <div>
                  <sp-input-number label="预吸取高度" :labelWidth="120" unit="mm" v-model:value="item.prepareAbsorbHeight" />
                  <sp-input-number label="吸取高度" unit="mm" v-model:value="item.absorbHeight" />
                  <sp-input-number label="混合高度" unit="mm" v-model:value="item.jetMixingHeight" />
                  <sp-input-number label="邻位变距" v-model:value="item.variableRenewAdjacent" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input-number label="预喷液高度" :labelWidth="120" unit="mm" v-model:value="item.prepareJetHeight" />
                  <sp-input-number label="喷液高度" unit="mm" v-model:value="item.jetHeight" />
                  <span class="span-label" style="margin-left: 10px;">是否自动变距：</span>
                  <a-checkbox v-model:checked="item.isAutoVariable" style="width:100px;"></a-checkbox>
                </div>
              </div>
              <div style="margin-top:10px;">
                <div>
                  <sp-input-number label="粘性摩擦系数" :labelWidth="120" :step="0.5"
                    v-model:value="item.viscousFrictionCoefficient" />
                  <sp-input-number label="喷液BME系数" :labelWidth="120" style="margin-left: 10px;" :step="0.5"
                    v-model:value="item.jetBMECoefficient" />
                  <sp-input-number label="自动变距步长" :step="1" :rightEmpty="true" v-model:value="item.isAutoVariableStep" />
                  <sp-input-number label="一对多正常高度" :labelWidth="130" unit="mm" v-model:value="item.one2MoreNormalHeight" />
                </div>
              </div>
              <div style="margin-top:10px;" v-if="attributeData.isTipBox">
                <div>
                  <sp-input-number label="预取枪头高度" :labelWidth="120" unit="mm" v-model:value="item.prepareTakeTipHeight" />
                  <sp-input-number label="取枪头高度" :labelWidth="120" unit="mm" v-model:value="item.takeTipHeight" />
                  <sp-input label="取枪头速度指令" :labelWidth="138" v-model:value="item.takeTipSpeedCmd" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input-number label="重复取枪头次数" :labelWidth="120" :step="1" v-model:value="item.takeTipRepeatTime" />
                  <sp-input-number label="重复取枪头高度" :labelWidth="152" style="margin-left:40px;" unit="mm"
                    v-model:value="item.takeTipRepeatHeight" />
                  <sp-input-number label="取枪头后预备高度" :labelWidth="126" style="margin-left:10px;" unit="mm"
                    v-model:value="item.takeTipAfterPrepareHeight" />
                </div>
                <div style="margin-top:10px;">
                  <sp-input label="预备高度后执行指令" :labelWidth="140" v-model:value="item.takeTipAfterPrepareHeightCmd" />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-row>
        <a-row :gutter="8" v-if="attributeData.useArm">
          <a-card title="机械爪" :bordered="false">
            <div>
              <sp-input-number label="正常高度" :labelWidth="90" unit="mm" v-model:value="armAttribute.normalHeight" />
              <sp-input-number label="X偏移" :labelWidth="90" unit="mm" v-model:value="armAttribute.xOffset" />
              <sp-input-number label="Y偏移" :labelWidth="90" unit="mm" v-model:value="armAttribute.yOffset" />
              <sp-input-number label="Z偏移" :labelWidth="90" unit="mm" v-model:value="armAttribute.zOffset" />
            </div>
            <div style="margin-top:10px;">
              <sp-input-number label="释放高度" :labelWidth="90" unit="mm" v-model:value="armAttribute.clipReleaseHeight" />
              <sp-input-number label="闭合高度" :labelWidth="90" unit="mm" v-model:value="armAttribute.clipCloseHeight" />
              <sp-input-number label="张开高度" :labelWidth="90" unit="mm" v-model:value="armAttribute.clipOpenHeight" />
            </div>
            <div style="margin-top:10px;">
              <sp-input-number label="释放" :labelWidth="90" v-model:value="armAttribute.clipRelease" />
              <sp-input-number label="夹紧闭合" :labelWidth="90" v-model:value="armAttribute.clipClose" />
              <sp-input-number label="夹紧张开" :labelWidth="90" v-model:value="armAttribute.clipOpen" />
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
import { exp_consumable_add, exp_consumable_getArmAttribute, exp_consumable_getParams } from '@/api/modular/experiment/consumableManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'
import { doCmd } from '@/api/modular/experiment/debug'

defineOptions({
  name: 'ConsumableAddForm'
})

const visible = ref(false)
const formLoading = ref(false)
const form = ref({})
const params = ref([])
const armEquipmentData = ref([])
const equipmentData = ref([])
const clipEquipmentData = ref([])
const liquidRanges = ref([])
const errors = ref({})

const attributeData = reactive({
  id: 0,
  code: '',
  name: '',
  normalHeight: 0.0,
  rowCount: 1,
  colCount: 1,
  rowSpace: 0.0,
  colSpace: 0.0,
  xSize: 0.0,
  ySize: 0.0,
  xOffset: 0.0,
  yOffset: 0.0,
  prepareAbsorbHeight: 0.0,
  absorbHeight: 0.0,
  absorbMixingHeight: 0.0,
  prepareJetHeight: 0.0,
  jetHeight: 0,
  jetMixingHeight: 0.0,
  variableDistanceStep: 0,
  isTipBox: false,
  useArm: false,
  remark: '',
  prepareTakeTipHeight: 0.0,
  takeTipHeight: 0.0,
  takeTipSpeedCmd: '',
  takeTipRepeatTime: 1,
  takeTipRepeatHeight: 0.0,
  takeTipAfterPrepareHeight: 0.0,
  takeTipAfterPrepareHeightCmd: '',
  liquidRange: 0,
  mixBMEModifiedCoefficient: 0.0,
  heightModifiedCoefficient: 0.0,
  remainingVolume: 0.0,
  isRemainingVolume: false,
  maxVolume: 0.0,
  consumableHeight: 0.0,
  basalAreaCoefficient: 0.0,
  viscousFrictionCoefficient: 0.0,
  jetBMECoefficient: 0.0,
  isAutoVariableRenewStep: 0,
  isAutoVariableStep: 0,
  one2MoreNormalHeight: 0.0,
  variableRenewAdjacent: 0.0,
  isDetectLiquid: false,
  isAutoVariable: false
})

const armAttribute = reactive({
  id: 0,
  equipmentId: 0,
  normalHeight: 0.0,
  xOffset: 0.0,
  yOffset: 0.0,
  zOffset: 0.0,
  clipReleaseHeight: 0.0,
  clipCloseHeight: 0.0,
  clipOpenHeight: 0.0,
  clipRelease: 0.0,
  clipClose: 0.0,
  clipOpen: 0.0
})

const emit = defineEmits(['ok', 'close'])

const add = async (record) => {
  visible.value = true
  await getParams()
  await getArmEquipmentData()
  await getLiquidRanges()
  
  if (record) {
    Object.assign(attributeData, record)
    await getArmAttribute()
  }
}

const getParams = async () => {
  try {
    const res = await exp_consumable_getParams()
    if (res.success) {
      params.value = res.data
    }
  } catch (error) {
    console.error('获取参数失败:', error)
  }
}

const getArmEquipmentData = async () => {
  try {
    const res = await exp_equipment_list({ equipmentType: 'ARM' })
    if (res.success) {
      armEquipmentData.value = res.data.records
    }
  } catch (error) {
    console.error('获取机械爪设备失败:', error)
  }
}

const getLiquidRanges = async () => {
  try {
    const res = await sysDictTypeDropDown({ code: 'liquid_range' })
    if (res.success) {
      liquidRanges.value = res.data
    }
  } catch (error) {
    console.error('获取液体范围失败:', error)
  }
}

const getArmAttribute = async () => {
  if (attributeData.id && attributeData.useArm) {
    try {
      const res = await exp_consumable_getArmAttribute({ consumableId: attributeData.id })
      if (res.success && res.data) {
        Object.assign(armAttribute, res.data)
      }
    } catch (error) {
      console.error('获取机械爪属性失败:', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    formLoading.value = true
    const submitData = {
      ...attributeData,
      params: params.value,
      armAttribute: attributeData.useArm ? armAttribute : null
    }
    
    const res = await exp_consumable_add(submitData)
    if (res.success) {
      message.success('添加成功')
      emit('ok')
      handleCancel()
    } else {
      message.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败')
  } finally {
    formLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  emit('close')
  // Reset form data
  Object.assign(attributeData, {
    id: 0,
    code: '',
    name: '',
    normalHeight: 0.0,
    rowCount: 1,
    colCount: 1,
    rowSpace: 0.0,
    colSpace: 0.0,
    xSize: 0.0,
    ySize: 0.0,
    xOffset: 0.0,
    yOffset: 0.0,
    prepareAbsorbHeight: 0.0,
    absorbHeight: 0.0,
    absorbMixingHeight: 0.0,
    prepareJetHeight: 0.0,
    jetHeight: 0,
    jetMixingHeight: 0.0,
    variableDistanceStep: 0,
    isTipBox: false,
    useArm: false,
    remark: '',
    prepareTakeTipHeight: 0.0,
    takeTipHeight: 0.0,
    takeTipSpeedCmd: '',
    takeTipRepeatTime: 1,
    takeTipRepeatHeight: 0.0,
    takeTipAfterPrepareHeight: 0.0,
    takeTipAfterPrepareHeightCmd: '',
    liquidRange: 0,
    mixBMEModifiedCoefficient: 0.0,
    heightModifiedCoefficient: 0.0,
    remainingVolume: 0.0,
    isRemainingVolume: false,
    maxVolume: 0.0,
    consumableHeight: 0.0,
    basalAreaCoefficient: 0.0,
    viscousFrictionCoefficient: 0.0,
    jetBMECoefficient: 0.0,
    isAutoVariableRenewStep: 0,
    isAutoVariableStep: 0,
    one2MoreNormalHeight: 0.0,
    variableRenewAdjacent: 0.0,
    isDetectLiquid: false,
    isAutoVariable: false
  })
  
  Object.assign(armAttribute, {
    id: 0,
    equipmentId: 0,
    normalHeight: 0.0,
    xOffset: 0.0,
    yOffset: 0.0,
    zOffset: 0.0,
    clipReleaseHeight: 0.0,
    clipCloseHeight: 0.0,
    clipOpenHeight: 0.0,
    clipRelease: 0.0,
    clipClose: 0.0,
    clipOpen: 0.0
  })
  
  errors.value = {}
}

defineExpose({
  add
})
</script>

<style scoped>
.span-label {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 8px;
}

.span-unit {
  margin-left: 4px;
}
</style>
