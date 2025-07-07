import { reactive } from 'vue'
import { 
  exp_equipment_delete, 
  exp_equipment_add, 
  exp_equipment_edit,
  exp_equipment_getScales,
  exp_equipment_editScales
} from '@/api/modular/experiment/equipmentManage'

export function useEquipmentOperations() {
  const debugModal = reactive({
    visible: false,
    equipment: null
  })

  const scaleModal = reactive({
    visible: false,
    equipment: null
  })

  const deleteEquipment = async (record) => {
    const res = await exp_equipment_delete(record)
    if (!res.success) {
      throw new Error(res.message || '删除失败')
    }
    return res
  }

  const submitForm = async (formData) => {
    // 根据是否有id判断是新增还是编辑
    const apiCall = formData.id ? exp_equipment_edit : exp_equipment_add
    const res = await apiCall(formData)
    
    if (!res.success) {
      throw new Error(res.message || '操作失败')
    }
    return res
  }

  const getScales = async (equipment) => {
    const res = await exp_equipment_getScales(equipment)
    if (!res.success) {
      throw new Error(res.message || '获取Scale失败')
    }
    return res.data
  }

  const setScales = async (equipment, scaleData) => {
    const res = await exp_equipment_editScales({
      ...equipment,
      ...scaleData
    })
    if (!res.success) {
      throw new Error(res.message || '设置Scale失败')
    }
    return res
  }

  return {
    debugModal,
    scaleModal,
    deleteEquipment,
    submitForm,
    getScales,
    setScales
  }
} 