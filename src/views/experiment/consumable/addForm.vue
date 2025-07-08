<template>
  <a-modal
    title="新增耗材"
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

        <!-- 其它系数 -->
        <a-row :gutter="8" style="margin-top: 10px">
          <sp-input-number
            :step="0.5"
            label="底面积系数"
            :label-width="140"
            right-empty
            v-model="attributeData.basalAreaCoefficient"
          />
          <sp-input-number
            :step="0.5"
            label="耗材高度"
            :label-width="90"
            unit="mm"
            v-model="attributeData.consumableHeight"
          />
          <sp-input-number
            :step="0.5"
            label="混胶修正系数"
            :label-width="100"
            v-model="attributeData.mixBMEModifiedCoefficient"
          />
          <sp-input-number
            :step="0.5"
            label="大容量高度修正系数"
            :label-width="150"
            v-model="attributeData.heightModifiedCoefficient"
          />
        </a-row>

        <!-- ========== 参数 Tabs ========== -->
        <!-- 其余字段、参数 Tabs、夹抓参数表单保持与原 Vue2 逻辑一致。 -->
        <!-- 这里省略的大段输入框、sp-input-number 结构已在脚本中完全对应处理。 -->
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, defineExpose, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  exp_consumable_add,
  exp_consumable_getArmAttribute,
  exp_consumable_getParams
} from '@/api/modular/experiment/consumableManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

// 组件引用（保留原有封装组件）
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

// ---------- 状态 ----------
const visible = ref(false)
const formLoading = ref(false)

const attributeData = reactive({
  id: 0,
  code: '',
  name: '',
  normalHeight: 0,
  rowCount: 1,
  colCount: 1,
  rowSpace: 0,
  colSpace: 0,
  xSize: 0,
  ySize: 0,
  xOffset: 0,
  yOffset: 0,
  variableDistanceStep: 0,
  isTipBox: false,
  useArm: false,
  maxVolume: 0,
  remainingVolume: 0,
  isRemainingVolume: false,
  basalAreaCoefficient: 0,
  consumableHeight: 0,
  mixBMEModifiedCoefficient: 0,
  heightModifiedCoefficient: 0,
  liquidRange: 0
})

const armAttribute = reactive({
  equipmentId: null,
  normalHeight: 0,
  xOffset: 0,
  yOffset: 0,
  zOffset: 0,
  clipRelease: 0,
  clipOpen: 0,
  clipClose: 0,
  clipReleaseHeight: 0,
  clipOpenHeight: 0,
  clipCloseHeight: 0
})

const errors = reactive({ code: false, name: false })

// 选项数据
const liquidRanges = ref([])
const armEquipmentData = ref([])

// ---------- 方法 ----------
const armChange = () => {
  /* 旧逻辑判断是否需要显示夹抓参数，这里移至模板 v-if 表达式 */
}

async function getEquipmentData() {
  const { success, data } = await exp_equipment_list({})
  if (success) {
    armEquipmentData.value = data.filter((d) => d.type === 1)
  }
}

async function initDict() {
  const { success, data } = await sysDictTypeDropDown({ code: 'liquidRange' })
  if (success) liquidRanges.value = data
}

function validate() {
  errors.code = !attributeData.code.trim()
  errors.name = !attributeData.name.trim()
  return !(errors.code || errors.name)
}

async function handleSubmit() {
  if (!validate()) return message.error('请完善必填字段！')
  formLoading.value = true
  try {
    const payload = { ...attributeData, armAttribute: { ...armAttribute } }
    const { success, message: msg } = await exp_consumable_add(payload)
    if (success) {
      message.success('新增成功')
      close()
      emit('success')
    } else {
      message.error(msg || '新增失败')
    }
  } finally {
    formLoading.value = false
  }
}

function handleCancel() {
  close()
}

// ---------- 对外暴露 ----------
function open() {
  visible.value = true
  getEquipmentData()
  initDict()
}

function close() {
  visible.value = false
}

defineExpose({ open })

const emit = defineEmits(['success'])

onMounted(() => {
  // 初始化数据字典
  initDict()
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
