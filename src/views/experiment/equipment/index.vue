<template>
  <div class="equipment-manage">
    <!-- 搜索表单 -->
    <SearchForm 
      v-if="hasPerm('exp_equipment:page')"
      :query-param="queryParam"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <!-- 设备列表 -->
    <EquipmentTable
      :data="equipmentData"
      :loading="loading"
      :pagination="pagination"
      :selected-row="selectedRow"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @debug="handleDebug"
      @set-scale="handleSetScale"
      @table-change="handleTableChange"
      @row-select="handleRowSelect"
    />

    <!-- 新增/编辑表单模态框 -->
    <EquipmentFormModal
      v-model:visible="formModal.visible"
      :form-data="formModal.data"
      :loading="formModal.loading"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- 调试模态框 -->
    <DebugModal
      v-model:visible="debugModal.visible"
      :equipment="debugModal.equipment"
      @close="debugModal.visible = false"
    />

    <!-- 设置Scale模态框 -->
    <ScaleModal
      v-model:visible="scaleModal.visible"
      :equipment="scaleModal.equipment"
      @close="scaleModal.visible = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { hasPerm } from '@/utils/permissions'
import { useEquipmentData } from './composables/useEquipmentData'
import { useEquipmentForm } from './composables/useEquipmentForm'
import { useEquipmentOperations } from './composables/useEquipmentOperations'
import SearchForm from './components/SearchForm.vue'
import EquipmentTable from './components/EquipmentTable.vue'
import EquipmentFormModal from './components/EquipmentFormModal.vue'
import DebugModal from './components/DebugModal.vue'
import ScaleModal from './components/ScaleModal.vue'
import moment from 'moment'

// 定义组件名称
defineOptions({
  name: 'EquipmentManage'
})

// 搜索参数
const queryParam = reactive({
  code: '',
  name: '',
  host: ''
})

// 选中的行
const selectedRow = ref(null)

// 使用组合式函数
const {
  equipmentData,
  loading,
  pagination,
  loadData,
  refreshData
} = useEquipmentData(queryParam)

const {
  formModal,
  resetForm,
  setFormData
} = useEquipmentForm()

const {
  debugModal,
  scaleModal,
  deleteEquipment,
  submitForm
} = useEquipmentOperations()

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  Object.assign(queryParam, {
    code: '',
    name: '',
    host: ''
  })
  pagination.current = 1
  loadData()
}

// 表格操作处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleRowSelect = (record) => {
  selectedRow.value = record
}

// CRUD操作处理
const handleAdd = () => {
  resetForm()
  formModal.visible = true
}

const handleEdit = (record) => {
  setFormData(record)
  formModal.visible = true
}

const handleDelete = async (record) => {
  try {
    await deleteEquipment(record)
    message.success('删除成功')
    await refreshData()
  } catch (error) {
    message.error('删除失败：' + error.message)
  }
}

const handleDebug = (record) => {
  debugModal.equipment = record
  debugModal.visible = true
}

const handleSetScale = (record) => {
  scaleModal.equipment = record
  scaleModal.visible = true
}

// 表单提交处理
const handleFormSubmit = async (formData) => {
  try {
    formModal.loading = true
    
    // 处理日期格式，确保提交给API的是字符串格式
    const submitData = { ...formData }
    if (submitData.manufactureDate) {
      if (moment.isMoment(submitData.manufactureDate)) {
        submitData.manufactureDate = submitData.manufactureDate.format('YYYY-MM-DD')
      } else if (submitData.manufactureDate instanceof Date) {
        submitData.manufactureDate = moment(submitData.manufactureDate).format('YYYY-MM-DD')
      }
    }
    
    await submitForm(submitData)
    message.success(formData.id ? '编辑成功' : '新增成功')
    formModal.visible = false
    await refreshData()
  } catch (error) {
    message.error('操作失败：' + error.message)
  } finally {
    formModal.loading = false
  }
}

const handleFormCancel = () => {
  formModal.visible = false
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.equipment-manage {
  .table-page-search-wrapper {
    margin-bottom: 16px;
  }

  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }
}
</style>
