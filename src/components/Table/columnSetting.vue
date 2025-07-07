<template>
  <div class="ant-dropdown-menu s-tool-column ant-dropdown-content">
    <div class="s-tool-column-header s-tool-column-item">
      <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
        列展示
      </a-checkbox>
      <a @click="reset">重置</a>
    </div>
    <a-divider />
    <div class="ant-checkbox-group">
      <div>
        <draggable v-model:value="columnsSetting" animation="300" @end="emitColumnChange">
          <div class="s-tool-column-item" v-for="item in columnsSetting" :key="item.title">
            <div class="s-tool-column-handle" >
              <a-icon type="more" />
              <a-icon type="more" />
            </div>
            <a-checkbox v-model:value="item.checked" @change="onChange">{{ item.title }}</a-checkbox>
          </div>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'

defineOptions({
  name: 'ColumnSetting'
})

const props = defineProps({
  columns: {
    type: Array,
    default: () => ([])
  }
})

const emit = defineEmits(['columnChange'])

const indeterminate = ref(false)
const checkAll = ref(true)
const columnsSetting = ref([])
const originColumns = ref([])

const reset = () => {
  console.log(originColumns.value)
  columnsSetting.value = originColumns.value.map(value => ({ ...value, checked: (value.checked === undefined || value.checked) }))
  columnsSetting.value.forEach(item => {
    item.checked = true;
  })
  console.log(columnsSetting.value)
  indeterminate.value = false
  checkAll.value = true
  emitColumnChange()
}

const onChange = () => {
  const checkedList = columnsSetting.value.filter(value => value.checked)
  indeterminate.value = !!checkedList.length && checkedList.length < columnsSetting.value.length
  checkAll.value = checkedList.length === columnsSetting.value.length
  emitColumnChange()
}

const onCheckAllChange = (e) => {
  const val = e.target.checked
  indeterminate.value = false
  checkAll.value = val
  columnsSetting.value = props.columns.map(value => ({ ...value, checked: val }))
  emitColumnChange()
}

const emitColumnChange = () => {
  emit('columnChange', columnsSetting.value)
}

onMounted(() => {
  columnsSetting.value = props.columns.map(value => ({ ...value, checked: (value.checked === undefined || value.checked) }))
  originColumns.value = columnsSetting.value.map(value => ({ ...value, checked: (value.checked === undefined || value.checked) }))
})
</script>

<style lang="less" scoped>

</style>
