<template>
  <a-card>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="6" :sm="12">
            <a-form-item label="设备编号">
              <a-input 
                v-model:value="queryParam.code" 
                allow-clear 
                placeholder="请输入设备编号" 
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="设备名称">
              <a-input 
                v-model:value="queryParam.name" 
                allow-clear 
                placeholder="请输入设备名称" 
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="主机">
              <a-input 
                v-model:value="queryParam.host" 
                allow-clear 
                placeholder="请输入主机" 
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" @click="handleSearch">
              查询
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              重置
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </a-card>
</template>

<script setup>
defineProps({
  queryParam: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['search', 'reset'])

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style lang="less" scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
}
</style> 