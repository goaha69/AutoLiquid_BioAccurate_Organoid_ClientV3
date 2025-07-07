import { reactive, onMounted } from 'vue'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

// 所有字典 code 常量
const DICT_CODES = [
  'protocol_type',
  'equipment_type',
  'coordinate_type',
  'yes_true_false',
  'walking_logic',
  'liquid_range',
  'a1_pos'
]

export function useEquipmentDicts () {
  const dicts = reactive({})

  const loadDicts = async () => {
    const promises = DICT_CODES.map(code => sysDictTypeDropDown({ code }))
    const results = await Promise.allSettled(promises)
    results.forEach((res, idx) => {
      const code = DICT_CODES[idx]
      if (res.status === 'fulfilled') {
        dicts[code] = (res.value.data || []).map(item => ({
          ...item,
          // 把 code 转数字 / 布尔 与旧系统逻辑一致
          code: convertCode(item.code)
        }))
      } else {
        dicts[code] = []
        // eslint-disable-next-line no-console
        console.error('加载字典失败:', code, res.reason)
      }
    })
  }

  // 旧系统里很多字典 code 需要数字或布尔
  const convertCode = (value) => {
    if (value === 'true') return true
    if (value === 'false') return false
    if (/^\d+$/.test(value)) return Number(value)
    return value
  }

  onMounted(loadDicts)

  return {
    dicts,
    reloadDicts: loadDicts
  }
} 