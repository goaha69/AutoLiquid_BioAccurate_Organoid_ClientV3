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
        <template #isFinish="{ text, record }">
          <a-tag :color="tags[record.isFinish]">
            {{ statusFilter(text) }}
          </a-tag>
        </template>
        <template #action="{ text, record }">
          <template v-if="hasPerm('flcFlowinstance:cancel') && record.isFinish == 0">
            <a-popconfirm placement="topRight" title="确认撤回:" @confirm="() => flcFlowinstanceCancel(record)">
              <a>撤回</a>
            </a-popconfirm>
          </template>
          <a-divider type="vertical" v-if="hasPerm('flcFlowinstance:cancel') && record.isFinish == 0" />
          <template v-if="hasPerm('flcFlowinstance:detail')">
            <a @click="$refs.previewForm.edit(record)">查看</a>
          </template>
          <a-divider type="vertical" v-if="hasPerm('flcFlowinstance:detail') && ((hasPerm('flcFlowinstance:edit') || hasPerm('flcFlowinstance:delete'))) && (record.isFinish == 2 || record.isFinish == 4)" />
          <a-dropdown v-if="(hasPerm('flcFlowinstance:edit') || hasPerm('flcFlowinstance:delete')) && (record.isFinish == 2 || record.isFinish == 4)">
            <a class="ant-dropdown-link">
              更多 <down-outlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPerm('flcFlowinstance:edit')">
                  <a @click="openEdit(record)">编辑</a>
                </a-menu-item>
                <a-menu-item v-if="hasPerm('flcFlowinstance:delete')">
                  <a-popconfirm placement="topRight" title="确认删除" @confirm="() => flcFlowinstanceDelete(record)">
                    <a>删除</a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-table>
      <edit-form ref="editForm" @ok="handleOk" />
      <preview-form ref="previewForm" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { STable, XCard } from '@/components'
import { flowinstancePage, flowinstanceDelete, flowinstanceCancel } from '@/api/modular/flowCenter/flowinstanceManage'
import editForm from './editForm'
import previewForm from './previewForm'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'flc_center_my'
})

const props = defineProps(['data'])

const queryParam = reactive({ lookType: 0 })
const selectedRowKeys = ref([])
const selectedRows = ref([])
const statusDict = ref([])
const tags = reactive({
  0: "#5bc0de", // 正在处理
  1: "#7ccb7c", // 已完成
  2: "#faad14", // 被撤回
  3: "#d9534f", // 不同意
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
    dataIndex: 'isFinish',
    slots: {
      customRender: 'isFinish'
    }
  }
])

const loadData = (parameter) => {
  return flowinstancePage(Object.assign(parameter, queryParam)).then((res) => {
    return res.data
  })
}

const openEdit = (record) => {
  $refs.editForm.edit(record)
  setTimeout(() => {
    $refs.editForm.importData()
  }, 300)
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

const flcFlowinstanceDelete = (record) => {
  flowinstanceDelete(record).then((res) => {
    if (res.success) {
      message.success('删除成功')
      $refs.table.refresh()
    } else {
      message.error('删除失败::' + res.message)
    }
  }).catch((err) => {
    message.error('删除错误::' + err.message)
  })
}

const flcFlowinstanceCancel = (record) => {
  flowinstanceCancel(record).then((res) => {
    if (res.success) {
      message.success('撤销成功')
      $refs.table.refresh()
    } else {
      message.error('撤销失败::' + res.message)
    }
  }).catch((err) => {
    message.error('撤销错误::' + err.message)
  })
}

const handleOk = () => {
  $refs.table.refresh()
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
      width: '120px',
      dataIndex: 'action',
      slots: { customRender: 'action' }
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
