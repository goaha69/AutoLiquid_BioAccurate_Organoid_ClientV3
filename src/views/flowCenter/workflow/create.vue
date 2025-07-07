<template>
  <a-row :gutter="24">
    <a-col :md="24" :sm="24" style="padding: 0 0 0 0;">
      <x-card v-if="hasPerm('flcFlowscheme:page')">
        <template #content>
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="流程名称">
                    <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入流程名称" />
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                </a-col>
                <a-col :md="8" :sm="24">
                </a-col>
              </a-row>
            </a-form>
          </div>
        </template>
      </x-card>
      <a-card :bordered="false">
        <a-table
          ref="table"
          :columns="columns"
          :data-source="loadData"
          :row-key="(record) => record.id"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <a v-if="hasPerm('flcFlowinstance:add')" @click="$refs.addForm.edit(record)">创建申请</a>
            </template>
          </template>
        </a-table>
        <add-form ref="addForm" @ok="handleOk" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { STable, XCard } from '@/components'
import { Empty } from 'ant-design-vue'
import { getFlcFlowschemePage } from '@/api/modular/flowCenter/flowManage'
import addForm from './addForm'

defineOptions({
  name: 'flc_center_create'
})

const props = defineProps(['data'])
const { proxy } = getCurrentInstance()

const queryParam = reactive({ status: 0 })
const selectedRowKeys = ref([])
const selectedRows = ref([])
const orgTree = ref([])
const defaultExpandedKeys = ref([])
const expandedKeys = ref([])
const searchValue = ref('')
const autoExpandParent = ref(true)
const treeLoading = ref(true)
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const replaceFields = reactive({
  key: 'id'
})

const columns = ref([
  {
    title: '流程编号',
    dataIndex: 'schemeCode'
  },
  {
    title: '流程名称',
    dataIndex: 'schemeName'
  },
  {
    title: '排序',
    dataIndex: 'sort'
  },
  {
    title: '备注',
    dataIndex: 'remark'
  }
])

const loadData = (parameter) => {
  return getFlcFlowschemePage(Object.assign(parameter, queryParam)).then((res) => {
    return res.data
  })
}

const handleOk = () => {
  proxy.$refs.table.refresh()
}

const onSelectChange = (selectedRowKeysVal, selectedRowsVal) => {
  selectedRowKeys.value = selectedRowKeysVal
  selectedRows.value = selectedRowsVal
}

onMounted(() => {
  if (hasPerm('flcFlowinstance:add')) {
    columns.value.push({
      title: '操作',
      width: '100px',
      dataIndex: 'action'
    })
  }
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
