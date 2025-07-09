<template>
  <a-modal
    title="编辑试剂"
    :width="1300"
    v-model:open="visible"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form>
        <a-row :gutter="8">
          <div>
            <SpInput
              label="耗材编号"
              :labelWidth="150"
              :required="true"
              :isError="errors.code"
              v-model="attributeData.code"
            />
            <SpInput
              label="耗材名称"
              :required="true"
              :isError="errors.name"
              :inputWidth="300"
              v-model="attributeData.name"
            />

            <span
              class="span-label"
              style="margin-left:0px;width:100px;"
            >体积：</span>
            <a-select
              style="width: 100px"
              v-model:value="attributeData.liquidRange"
            >
              <a-select-option
                v-for="(item, index) in liquidRanges"
                :key="index"
                :value="item.code"
              >{{ item.value }}</a-select-option>
            </a-select>
            <span class="span-unit">(μl)</span>
          </div>

          <div style="margin-top:10px;">
            <SpInput
              label="批次号（包括浓度）"
              :labelWidth="150"
              v-model="attributeData.barcode"
            />
          </div>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title="吸液属性"
            :bordered="false"
          >
            <div>
              <SpInputNumber
                label="吸液偏移"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.absorbOffset"
              />
              <SpInput
                label="吸液速度"
                :labelWidth="130"
                v-model="attributeData.absorbSpeed"
              />
              <SpInputNumber
                label="吸液后等待"
                :labelWidth="110"
                unit="s"
                v-model="attributeData.absorbDelay"
              />
              <SpInput
                label="吸液提起速度"
                :labelWidth="120"
                v-model="attributeData.absorbHeight2NormalHeightSpeed"
              />
            </div>

            <div style="margin-top:10px;">
              <SpInputNumber
                label="吸液提起高度"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.absorbHeight2LiftingHeight"
              />
              <SpInputNumber
                label="吸液提起后等待"
                :labelWidth="130"
                unit="s"
                v-model="attributeData.absorbDelayAfterLift"
              />
              <SpInput
                label="吸前混合速度"
                :labelWidth="170"
                v-model="attributeData.absorbMixingSpeed"
              />
            </div>
            <div style="margin-top:10px;">
              <SpInput
                label="P-Z吸液速度转换系数"
                :labelWidth="170"
                unit="mm"
                v-model="attributeData.pToZSpeedCoefficient"
              />
            </div>
          </a-card>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title="喷液属性"
            :bordered="false"
          >
            <div>
              <SpInputNumber
                label="喷液偏移"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetOffset"
              />
              <SpInput
                label="喷液速度"
                :labelWidth="120"
                v-model="attributeData.jetSpeed"
              />
              <SpInputNumber
                label="喷液后等待"
                :labelWidth="120"
                unit="s"
                v-model="attributeData.jetDelay"
              />
              <SpInput
                label="喷液提起速度"
                :labelWidth="120"
                v-model="attributeData.jetHeight2NormalHeightSpeed"
              />
            </div>

            <div style="margin-top:10px;">
              <SpInputNumber
                label="靠壁高度"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetWallHeight"
              />
              <SpInputNumber
                label="靠壁偏移"
                :labelWidth="120"
                unit="mm"
                v-model="attributeData.jetWallOffset"
              />
              <SpInputNumber
                label="靠壁触发条件"
                :labelWidth="180"
                unit="mm"
                v-model="attributeData.jetWallTrigger"
              />

              <span
                class="span-label"
                style="width:130px;"
              >靠壁喷液：</span>
              <a-radio-group v-model:value="attributeData.jetWall">
                <a-radio
                  v-for="(item, index) in jetWalls"
                  :key="index"
                  :value="item.code"
                >{{ item.value }}</a-radio>
              </a-radio-group>
            </div>

            <div style="margin-top:10px;">
              <SpInput
                label="喷后混合速度"
                :labelWidth="120"
                v-model="attributeData.jetMixingSpeed"
              />
            </div>
          </a-card>
        </a-row>

        <a-row :gutter="8">
          <a-card
            title="其他参数"
            :bordered="false"
          >
            <div>
              <SpInputNumber
                label="吸液前吸空气量"
                :labelWidth="110"
                unit="%"
                v-model="attributeData.absorbAirBeforePercent"
              />
              <SpInputNumber
                label="吸液后吸空气量"
                :labelWidth="110"
                unit="%"
                v-model="attributeData.absorbAirAfterPercent"
              />
              <SpInputNumber
                label="一吸多喷吸液后多吸体积"
                :labelWidth="175"
                unit="%"
                v-model="attributeData.absorbLiquidMoreOne2MorePercent"
              />
              <SpInputNumber
                label="一吸多喷吸液后喷出体积比例"
                :labelWidth="205"
                unit="%"
                v-model="attributeData.jetLiquidMoreOne2MoreScale"
              />
              <div style="margin-top:10px;">
                <span class="span-label" style="width:100px;">是否吸入大量空气：</span>
                <a-checkbox v-model:checked="attributeData.isAmountAir" />
              </div> 
            </div>
          </a-card>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { exp_liquid_edit } from '@/api/modular/experiment/liquidManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

// 组件事件
const emit = defineEmits(['ok'])

// 响应式数据
const visible = ref(false)
const formLoading = ref(false)
const liquidRanges = ref([])
const jetWalls = ref([])

// 表单数据
const attributeData = reactive({
  id: 0,
  code: '',
  name: '',
  remark: '',
  absorbHeight: 0,
  absorbSpeed: '',
  absorbDelay: 0,
  absorbHeight2NormalHeightSpeed: '',
  absorbMixingHeight: 0,
  absorbMixingSpeed: '',
  jetHeight: 0,
  jetSpeed: '',
  jetDelay: 0,
  jetHeight2NormalHeightSpeed: '',
  jetWallHeight: 0,
  jetWallOffset: 0,
  jetWallTrigger: 0,
  jetMixingHeight: 0,
  jetMixingSpeed: '',
  jetOffset: 0,
  jetWall: false,
  absorbOffset: 0,
  absorbAirBeforePercent: 0,
  absorbAirAfterPercent: 0,
  absorbLiquidMoreOne2MorePercent: 0,
  jetLiquidMoreOne2MoreScale: 0,
  liquidRange: 0,
  pToZSpeedCoefficient: 0,
  absorbHeight2LiftingHeight: 0,
  absorbDelayAfterLift: 0,
  barcode: '',
  isAmountAir: false
})

// 错误状态
const errors = reactive({
  code: false,
  name: false
})

// 重置属性
const resetAttribute = () => {
  Object.assign(attributeData, {
    id: 0,
    code: '',
    name: '',
    remark: '',
    absorbHeight: 0,
    absorbSpeed: '',
    absorbDelay: 0,
    absorbHeight2NormalHeightSpeed: '',
    absorbMixingHeight: 0,
    absorbMixingSpeed: '',
    jetHeight: 0,
    jetSpeed: '',
    jetDelay: 0,
    jetHeight2NormalHeightSpeed: '',
    jetWallHeight: 0,
    jetWallOffset: 0,
    jetWallTrigger: 0,
    jetMixingHeight: 0,
    jetMixingSpeed: '',
    jetOffset: 0,
    jetWall: false,
    absorbOffset: 0,
    absorbAirBeforePercent: 0,
    absorbAirAfterPercent: 0,
    absorbLiquidMoreOne2MorePercent: 0,
    jetLiquidMoreOne2MoreScale: 0,
    liquidRange: 0,
    pToZSpeedCoefficient: 0,
    absorbHeight2LiftingHeight: 0,
    absorbDelayAfterLift: 0,
    barcode: '',
    isAmountAir: false
  })
  
  Object.assign(errors, {
    code: false,
    name: false
  })
}

/**
 * 获取字典数据
 */
const loadDictData = async () => {
  try {
    // 获取是否选项
    const jetWallRes = await sysDictTypeDropDown({ code: 'yes_true_false' })
    jetWalls.value = jetWallRes.data.map(item => ({
      ...item,
      code: item.code === 'true'
    }))

    // 获取液体范围选项
    const liquidRangeRes = await sysDictTypeDropDown({ code: 'liquid_range' })
    liquidRanges.value = liquidRangeRes.data.map(item => ({
      ...item,
      code: parseInt(item.code)
    }))
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 验证字段
const validateFields = () => {
  let result = true
  errors.code = !attributeData.code
  errors.name = !attributeData.name
  
  console.log(errors)
  for (const key in errors) {
    if (errors[key]) {
      result = false
      break
    }
  }
  return result
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  console.log('=================handleSubmit=================')
  if (!validateFields()) {
    return
  }

  formLoading.value = true
  
  try {
    // 处理布尔值转换
    const submitData = {
      ...attributeData,
      jetWall: attributeData.jetWall === true ? 1 : 0
    }

    const res = await exp_liquid_edit(submitData)
    if (res.success) {
      message.success('编辑成功')
      emit('ok', attributeData)
      handleCancel()
    } else {
      message.error(res.message)
    }
  } catch (error) {
    message.error('编辑失败：' + error.message)
  } finally {
    formLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  resetAttribute()
}

// 编辑方法
const edit = (record) => {
  visible.value = true
  loadDictData()
  
  // 复制记录数据到表单
  Object.assign(attributeData, {
    ...record,
    jetWall: record.jetWall === 1 || record.jetWall === true,
    isAmountAir: record.isAmountAir === 1 || record.isAmountAir === true
  })
  
  // 重置错误状态
  Object.assign(errors, {
    code: false,
    name: false
  })
}

// 暴露方法给父组件
defineExpose({
  edit
})
</script>

<style scoped>
.span-unit {
  margin-left: 5px;
}

.span-label {
  width: 130px;
  text-align: right;
  display: inline-block;
  color: black;
  padding-right: 5px;
}
</style>
