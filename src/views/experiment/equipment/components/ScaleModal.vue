<template>
  <a-modal
    v-model:open="modalVisible"
    title="设置Scale"
    :width="500"
    :mask-closable="false"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <div class="scale-container">
      <a-descriptions title="设备信息" :column="1" bordered>
        <a-descriptions-item label="设备编号">
          {{ equipment?.code }}
        </a-descriptions-item>
        <a-descriptions-item label="设备名称">
          {{ equipment?.name }}
        </a-descriptions-item>
      </a-descriptions>
      
      <a-divider />
      
      <a-form 
        ref="formRef"
        :model="scaleForm" 
        :rules="rules"
        :label-col="{ span: 6 }" 
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="X轴比例" name="scaleX">
          <a-input-number 
            v-model:value="scaleForm.scaleX" 
            :min="0.1" 
            :max="10" 
            :step="0.1"
            style="width: 100%" 
          />
        </a-form-item>
        
        <a-form-item label="Y轴比例" name="scaleY">
          <a-input-number 
            v-model:value="scaleForm.scaleY" 
            :min="0.1" 
            :max="10" 
            :step="0.1"
            style="width: 100%" 
          />
        </a-form-item>
        
        <a-form-item label="Z轴比例" name="scaleZ">
          <a-input-number 
            v-model:value="scaleForm.scaleZ" 
            :min="0.1" 
            :max="10" 
            :step="0.1"
            style="width: 100%" 
          />
        </a-form-item>
        
        <a-form-item label="应用范围" name="applyRange">
          <a-select v-model:value="scaleForm.applyRange" style="width: 100%">
            <a-select-option value="all">全部轴</a-select-option>
            <a-select-option value="xy">XY轴</a-select-option>
            <a-select-option value="z">Z轴</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="备注" name="remark">
          <a-textarea 
            v-model:value="scaleForm.remark" 
            :rows="3" 
            placeholder="请输入备注信息" 
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { exp_equipment_getScales, exp_equipment_editScales } from '@/api/modular/experiment/equipmentManage'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  equipment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'close'])

const formRef = ref()
const loading = ref(false)

// 表单数据
const scaleForm = reactive({
  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
  applyRange: 'all',
  remark: ''
})

// 表单验证规则
const rules = {
  scaleX: [
    { required: true, message: '请输入X轴比例', trigger: 'blur' }
  ],
  scaleY: [
    { required: true, message: '请输入Y轴比例', trigger: 'blur' }
  ],
  scaleZ: [
    { required: true, message: '请输入Z轴比例', trigger: 'blur' }
  ],
  applyRange: [
    { required: true, message: '请选择应用范围', trigger: 'change' }
  ]
}

// 计算属性
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 监听visible变化，加载数据
watch(() => props.visible, async (newVal) => {
  if (newVal && props.equipment) {
    await loadScaleData()
    setTimeout(() => {
      formRef.value?.clearValidate()
    }, 100)
  }
})

// 加载Scale数据
const loadScaleData = async () => {
  if (!props.equipment) return
  
  try {
    loading.value = true
    const res = await exp_equipment_getScales(props.equipment)
    if (res.success && res.data) {
      Object.assign(scaleForm, {
        scaleX: res.data.scaleX || 1.0,
        scaleY: res.data.scaleY || 1.0,
        scaleZ: res.data.scaleZ || 1.0,
        applyRange: res.data.applyRange || 'all',
        remark: res.data.remark || ''
      })
    } else {
      resetForm()
    }
  } catch (error) {
    console.error('加载Scale数据失败:', error)
    resetForm()
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(scaleForm, {
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    applyRange: 'all',
    remark: ''
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    const res = await exp_equipment_editScales({
      ...props.equipment,
      ...scaleForm
    })
    
    if (res.success) {
      message.success('Scale设置成功')
      handleClose()
    } else {
      message.error(res.message || 'Scale设置失败')
    }
  } catch (error) {
    console.error('Scale设置失败:', error)
    if (error.errorFields) {
      // 表单验证失败
      return
    }
    message.error('Scale设置失败')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style lang="less" scoped>
.scale-container {
  .ant-descriptions {
    margin-bottom: 16px;
  }
}
</style> 