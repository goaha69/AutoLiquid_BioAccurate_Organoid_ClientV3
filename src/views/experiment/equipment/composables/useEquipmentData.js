import { ref, reactive } from 'vue'
import { exp_equipment_page } from '@/api/modular/experiment/equipmentManage'

export function useEquipmentData(queryParam) {
  const equipmentData = ref([])
  const loading = ref(false)
  
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条,共 ${total} 条`
  })

  const loadData = async () => {
    loading.value = true
    try {
      const params = {
        ...queryParam,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      
      const res = await exp_equipment_page(params)
      
      if (res && res.data) {
        equipmentData.value = res.data.rows || []
        pagination.total = res.data.totalRows || 0
      } else {
        equipmentData.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('加载设备数据失败:', error)
      equipmentData.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  const refreshData = async () => {
    pagination.current = 1
    await loadData()
  }

  return {
    equipmentData,
    loading,
    pagination,
    loadData,
    refreshData
  }
} 