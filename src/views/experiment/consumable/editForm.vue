<template>
  <a-modal
    title="编辑耗材"
    :width="1300"
    :open="visible"
    :mask-closable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <!-- 表单开始 -->
      <a-form :model="attributeData" layout="vertical" ref="formRef">
        <!-- ========== 基本信息区 ========== -->
        <a-row :gutter="8">
          <sp-input
            label="耗材编号"
            required
            :is-error="errors.code"
            v-model="attributeData.code"
            :disabled="true"
          />
          <sp-input
            label="耗材名称"
            :label-width="80"
            required
            :is-error="errors.name"
            :input-width="200"
            v-model="attributeData.name"
          />
        </a-row>

        <!-- 规格尺寸 -->
        <a-row :gutter="8" style="margin-top: 10px">
          <sp-input-number
            label="行数"
            :step="1"
            required
            v-model="attributeData.rowCount"
          />
          <sp-input-number
            label="列数"
            :label-width="100"
            :step="1"
            required
            v-model="attributeData.colCount"
          />
          <sp-input-number
            label="行距"
            unit="mm"
            :label-width="100"
            required
            v-model="attributeData.rowSpace"
          />
          <sp-input-number
            label="列距"
            unit="mm"
            :label-width="100"
            required
            v-model="attributeData.colSpace"
          />
        </a-row>

        <a-row :gutter="8" style="margin-top: 10px">
          <sp-input-number label="X尺寸" unit="mm" required v-model="attributeData.xSize" />
          <sp-input-number
            label="Y尺寸"
            :label-width="100"
            unit="mm"
            required
            v-model="attributeData.ySize"
          />
          <sp-input-number
            label="X偏移"
            :label-width="100"
            unit="mm"
            required
            v-model="attributeData.xOffset"
          />
          <sp-input-number
            label="Y偏移"
            :label-width="100"
            unit="mm"
            required
            v-model="attributeData.yOffset"
          />
        </a-row>

        <!-- 变距与量程 -->
        <a-row :gutter="8" style="margin-top: 10px">
          <sp-input-number
            label="变距步数"
            :step="1"
            right-empty
            v-model="attributeData.variableDistanceStep"
          />

          <span class="span-label">是否枪头盒：</span>
          <a-checkbox v-model:checked="attributeData.isTipBox" style="width: 60px" />

          <span class="span-label" style="margin-left: 40px">量程：</span>
          <a-select
            style="width: 100px"
            v-model:value="attributeData.liquidRange"
            :disabled="!attributeData.isTipBox"
          >
            <a-select-option
              v-for="item in liquidRanges"
              :key="item.code"
              :value="item.code"
              >{{ item.value }}</a-select-option
            >
          </a-select>
          <span class="span-unit">(μl)</span>
        </a-row>

        <!-- 机械臂 / 最大体积 -->
        <a-row :gutter="8" style="margin-top: 10px">
          <span class="span-label" style="width: 140px">使用夹抓：</span>
          <a-checkbox v-model:checked="attributeData.useArm" style="width: 100px" />

          <span
            class="span-label"
            style="width: 140px; margin-left: 10px"
            >机械臂：</span
          >
          <a-select
            style="width: 140px"
            v-model:value="armAttribute.equipmentId"
            :disabled="!attributeData.useArm"
            @change="armChange"
          >
            <a-select-option
              v-for="item in armEquipmentData"
              :key="item.id"
              :value="item.id"
              >{{ item.name }}</a-select-option
            >
          </a-select>

          <sp-input-number
            :step="100"
            label="最大体积"
            :label-width="100"
            unit="μl"
            v-model="attributeData.maxVolume"
          />
          <a-checkbox
            v-model:checked="attributeData.isRemainingVolume"
            style="margin-left: 10px; color: #000"
            >剩余体积</a-checkbox
          >
          <sp-input-number
            :step="100"
            label=""
            :label-width="-10"
            unit="μl"
            v-model="attributeData.remainingVolume"
          />
        </a-row>

        <!-- 底面积系数 -->
        <a-row :gutter="8" style="margin-top: 10px">
          <sp-input-number
            label="底面积系数"
            :label-width="140"
            right-empty
            v-model="attributeData.basalAreaCoefficient"
          />
          <sp-input-number
            label="耗材高度"
            :label-width="90"
            unit="mm"
            v-model="attributeData.consumableHeight"
          />
          <sp-input-number
            label="混胶修正系数"
            :label-width="100"
            v-model="attributeData.mixBMEModifiedCoefficient"
          />
          <sp-input-number
            label="大容量高度修正系"
            :label-width="150"
            v-model="attributeData.heightModifiedCoefficient"
          />
        </a-row>

        <!-- 吸液速度与P-Z吸液速度转换系数 -->
        <a-row :gutter="8" style="margin-top: 10px">
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

        <!-- 参数 -->
        <a-row :gutter="8" style="margin-top: 10px">
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

        <!-- 夹抓参数 -->
        <a-row :gutter="8" v-if="attributeData.useArm">
          <a-card title="夹抓参数" :bordered="false">
            <div>
              <sp-input-number
                label="行走高度"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.normalHeight"
              />
              <sp-input-number
                label="X偏移"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.xOffset"
              />
              <sp-input-number
                label="Y偏移"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.yOffset"
              />
              <sp-input-number
                label="Z偏移"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.zOffset"
              />
            </div>

            <div style="margin-top: 10px">
              <sp-input-number
                label="松开高度"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.clipReleaseHeight"
              />
              <sp-input-number
                label="夹紧高度"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.clipCloseHeight"
              />
              <sp-input-number
                label="开盖高度"
                :labelWidth="90"
                unit="mm"
                v-model="armAttribute.clipOpenHeight"
              />
            </div>

            <div style="margin-top: 10px">
              <sp-input-number
                label="夹子松开"
                :labelWidth="90"
                v-model="armAttribute.clipRelease"
              />
              <sp-input-number
                label="夹子夹紧"
                :labelWidth="90"
                v-model="armAttribute.clipClose"
              />
              <sp-input-number
                label="夹子开启"
                :labelWidth="90"
                v-model="armAttribute.clipOpen"
              />
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
import {
  exp_consumable_edit,
  exp_consumable_getArmAttribute,
  exp_consumable_getParams
} from '@/api/modular/experiment/consumableManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'
import { doCmd } from '@/api/modular/experiment/debug'

defineOptions({
  name: 'ConsumableEditForm'
})

const emit = defineEmits(['ok'])

/* ------- 数据定义 ------- */
const visible = ref(false)
const formLoading = ref(false)

const liquidRanges = ref([])
const attributeData = ref({})

const params = ref([])

const armEquipmentData = ref([])
const equipmentData = ref([])

const errors = reactive({
  code: false,
  name: false
})

/* 夹抓参数 */
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
  one2MoreNormalHeight: 0.0
})

/* 其他 UI 辅助状态 */
const clipOpenVisible = ref(false)

/* ------- 生命周期 ------- */
onMounted(() => {
  fetchLiquidRanges()
})

/* ------- API 调用 ------- */
function fetchLiquidRanges() {
  sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
    liquidRanges.value = res.data.map((i) => ({
      ...i,
      code: Number(i.code)
    }))
  })
}

function fetchEquipment() {
  exp_equipment_list({}).then((res) => {
    if (res.success) {
      equipmentData.value = res.data
      armEquipmentData.value = equipmentData.value.filter((i) => i.type === 1)
    }
  })
}

/* ------- 业务函数 ------- */
function armChange(value) {
  const arm = armEquipmentData.value.find((i) => i.id === value)
  clipOpenVisible.value = !!(arm && arm.clipEquipmentId)
}

function resetState() {
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
    one2MoreNormalHeight: 0.0
  })

  Object.assign(errors, { code: false, name: false })
  params.value = []
  clipOpenVisible.value = false
}

/* 打开编辑弹窗并加载数据 */
function edit(record) {
  visible.value = true
  resetState()
  fetchEquipment()

  attributeData.value = { ...record }

  /* 夹抓属性 */
  if (attributeData.value.useArm) {
    exp_consumable_getArmAttribute({ id: record.id }).then((res) => {
      Object.assign(armAttribute, res.data)
    })
  }

  /* 参数列表 */
  exp_consumable_getParams({ id: record.id }).then((res) => {
    params.value = res.data
  })
}

/* 表单校验 */
function validate() {
  errors.code = !attributeData.value.code
  errors.name = !attributeData.value.name
  return !Object.values(errors).some(Boolean)
}

/* 保存 */
function handleSubmit() {
  if (!validate()) return

  formLoading.value = true

  const payload = {
    ...attributeData.value,
    armAttribute: { ...armAttribute },
    params: params.value
  }

  exp_consumable_edit(payload)
    .then((res) => {
      if (res.success) {
        message.success('编辑成功')
        emit('ok')
        handleCancel()
      }
    })
    .finally(() => {
      formLoading.value = false
    })
}

function handleCancel() {
  resetState()
  visible.value = false
}

/* 示例：运动调试按钮 */
function btnGoPos(axle, value) {
  if (!attributeData.value.id) return
  const cmd = `${axle} ${value}`
  doCmd({ cmd }).then(() => {
    message.success('运动完成')
  })
}

/* 向父组件暴露方法 */
defineExpose({ edit })
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
