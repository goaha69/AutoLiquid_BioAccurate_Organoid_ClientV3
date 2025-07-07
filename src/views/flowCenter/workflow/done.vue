<template>
  <div>
    <x-card v-if="hasPerm('flcFlowinstance:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="申请名称">
                  <a-input v-model:value="queryParam.customName" allow-clear placeholder="请输入申请名称" />
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
          <template v-if="column.dataIndex === 'isFinish'">
            <a-tag :color="tags[record.isFinish]">
              {{ statusFilter(text) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <template v-if="hasPerm('flcFlowinstance:detail')">
              <a @click="$refs.previewForm.edit(record)">查看</a>
            </template>
          </template>
        </template>
      </a-table>
      <preview-form ref="previewForm" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { STable, XCard } from '@/components'
import { flowinstancePage } from '@/api/modular/flowCenter/flowinstanceManage'
import previewForm from './previewForm'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

defineOptions({
  name: 'flc_center_done'
})

const props = defineProps(['data'])
const { proxy } = getCurrentInstance()

const queryParam = reactive({ lookType: 2 })
const selectedRowKeys = ref([])
const selectedRows = ref([])
const statusDict = ref([])

const tags = reactive({
  0: "#5bc0de", // 正在处理
  1: "#7ccb7c", // 已完成
  3: "#d9534f", // 不同意
  2: "#faad14", // 被撤销
  4: "#faad14"  // 被驳回
})

const columns = ref([
  {
    title: '申请编号',
    dataIndex: 'code'
  },
  {
    title: '申请名称',
    dataIndex: 'customName'
  },
  {
    title: '当前节点',
    dataIndex: 'activityName'
  },
  {
    title: '申请时间',
    dataIndex: 'createdTime'
  },
  {
    title: '申请人',
    dataIndex: 'createdUserName'
  },
  {
    title: '流程状态',
    dataIndex: 'isFinish'
  }
])

const loadData = (parameter) => {
  return flowinstancePage(Object.assign(parameter, queryParam)).then((res) => {
    return res.data
  })
}

const statusFilter = (status) => {
  const values = statusDict.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
}

const sysDictTypeDropDownFn = () => {
  sysDictTypeDropDown({
    code: 'flow_status'
  }).then((res) => {
    statusDict.value = res.data
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
  sysDictTypeDropDownFn()
  
  if (hasPerm('flcFlowinstance:cancel') || hasPerm('flcFlowinstance:verification') || hasPerm('flcFlowinstance:detail') || hasPerm('flcFlowinstance:edit') || hasPerm('flcFlowinstance:delete')) {
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
