<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="modalVisible"
      title="设备管理"
      :width="1200"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-spin :spinning="loading">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          layout="vertical"
        >
          <!-- 基础信息 -->
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="设备编号" name="code" :rules="[{required:true,message:'必填'}]">
                <a-input v-model:value="formData.code" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="设备名称" name="name" :rules="[{required:true,message:'必填'}]">
                <a-input v-model:value="formData.name" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="通讯协议" name="communicatioProtocol">
                <a-select v-model:value="formData.communicatioProtocol" allow-clear>
                  <a-select-option v-for="p in dicts.protocol_type" :key="p.code" :value="p.code">{{ p.value }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="是否第三方" name="isThirdParty">
                <a-radio-group v-model:value="formData.isThirdParty">
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="主机" name="host" v-if="formData.communicatioProtocol < 3">
                <a-input v-model:value="formData.host" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="端口" name="port" v-if="formData.communicatioProtocol < 3">
                <a-input-number v-model:value="formData.port" style="width:100%" :min="0" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="Com口" name="comPort" v-if="formData.communicatioProtocol >= 3">
                <a-input v-model:value="formData.comPort" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="波特率" name="baudRate" v-if="formData.communicatioProtocol >= 3">
                <a-input-number v-model:value="formData.baudRate" style="width:100%" :min="0" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="设备类型" name="type">
                <a-select v-model:value="formData.type">
                  <a-select-option v-for="t in dicts.equipment_type" :key="t.code" :value="t.code">{{ t.value }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="坐标方向" name="coordinateType">
                <a-select v-model:value="formData.coordinateType">
                  <a-select-option v-for="c in dicts.coordinate_type" :key="c.code" :value="c.code">{{ c.value }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="生产厂商" name="manufacturer">
                <a-input v-model:value="formData.manufacturer" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="生产日期" name="manufactureDate">
                <a-date-picker v-model:value="formData.manufactureDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="X偏移 (mm)" name="xOffset">
                <a-input-number v-model:value="formData.xOffset" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="Y偏移 (mm)" name="yOffset">
                <a-input-number v-model:value="formData.yOffset" style="width:100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="配置URL" name="paramsPage">
                <a-input v-model:value="formData.paramsPage" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="控制类" name="controlClass">
                <a-input v-model:value="formData.controlClass" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="备注" name="remark">
                <a-textarea v-model:value="formData.remark" rows="3" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 其他高级区块（pipette / arm / third party）将在后续迭代补充 -->
        </a-form>
      </a-spin>
    </a-modal>
  </a-config-provider>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useEquipmentDicts } from '../composables/useEquipmentDicts'

dayjs.locale('zh-cn')

const { dicts } = useEquipmentDicts()

const props = defineProps({
  visible: Boolean,
  formData: Object,
  loading: Boolean
})

const emit = defineEmits(['update:visible', 'submit', 'cancel'])

const formRef = ref()

const modalVisible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

const rules = {
  code: [{ required: true, message: '必填' }],
  name: [{ required: true, message: '必填' }]
}

watch(() => props.visible, (val) => {
  if (val) {
    setTimeout(() => formRef.value?.clearValidate(), 50)
  }
})

const handleSubmit = async () => {
  await formRef.value.validate()
  emit('submit', { ...props.formData })
}

const handleCancel = () => emit('cancel')
</script>

<style scoped>
</style> 