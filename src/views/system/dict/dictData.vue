<template>
  <div>
    <dict-data-index ref="dictDataRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DictDataIndex from './dictdata/index.vue'

const dictDataRef = ref()

const dictData = (record) => {
  dictDataRef.value.dictData(record)
}

defineExpose({
  dictData
})
</script> 