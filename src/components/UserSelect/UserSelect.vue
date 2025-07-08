<template>
  <a-select
    :mode="selectMode"
    show-search
    v-model:value="selected"
    :filter-option="false"
    :placeholder="placeholder"
    :not-found-content="loading ? undefined : null"
    @search="onSearch"
    @change="onChange"
    :loading="loading"
    allowClear
  >
    <a-select-option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
    >
      {{ opt.label }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import debounce from 'lodash/debounce'
import { getUserPage } from '@/api/modular/system/userManage'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请选择用户'
  },
  modelValue: {
    type: [String, Array]
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selected = ref(props.modelValue)
watch(() => props.modelValue, (val) => (selected.value = val))

function updateValue(val) {
  emit('update:modelValue', val)
  emit('change', val)
}

const selectMode = computed(() => (props.multiple ? 'multiple' : undefined))

const loading = ref(false)
const options = ref([])

const fetchUsers = async (keyword = '') => {
  loading.value = true
  try {
    const { data } = await getUserPage({ pageNo: 1, pageSize: 10, searchValue: keyword.trim() })
    options.value = (data?.rows || []).map((u) => ({
      label: `${u.name} ${u.account}`,
      value: u.id
    }))
  } catch (e) {
    options.value = []
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce(fetchUsers, 500)

function onSearch(val) {
  // 每次搜索触发防抖
  debouncedFetch(val)
}

function onChange(val) {
  updateValue(val)
}

// 首次加载默认数据
fetchUsers('')
</script>

<style scoped>
/* 可根据需要自定义样式 */
</style>
