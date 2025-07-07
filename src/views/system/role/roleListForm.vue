<template>
  <a-modal
    title="选择角色"
    :width="900"
    :open="visible"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <x-card v-if="hasPerm('sysRole:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="角色名">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入角色名" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="唯一编码">
                  <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入唯一编码" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="handleQuery">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      />
    </a-card>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { XCard } from '@/components'
import { getRolePage } from '@/api/modular/system/roleManage'
import { hasPerm } from '@/utils/permission'

const visible = ref(false)
const queryParam = reactive({})
const columns = [
  { title: '角色', dataIndex: 'name' },
  { title: '唯一编码', dataIndex: 'code' },
  { title: '排序', dataIndex: 'sort' }
]
const dataSource = ref([])
const loading = ref(true)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})
const selectedRowKeys = ref([])
const selectedRows = ref([])
const emits = defineEmits(['ok'])

const roleList = () => {
  visible.value = true
  loadData()
}

const loadData = () => {
  loading.value = true
  const params = {
    ...queryParam,
    current: pagination.current,
    size: pagination.pageSize
  }
  getRolePage(params).then(res => {
    dataSource.value = res.data.records
    pagination.total = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

const handleQuery = () => {
  pagination.current = 1
  loadData()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys
  selectedRows.value = rows
}

const handleSubmit = () => {
  visible.value = false
  emits('ok', selectedRows.value)
}

const handleCancel = () => {
  visible.value = false
}

defineExpose({
  roleList
})
</script>

<style lang="less">
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
