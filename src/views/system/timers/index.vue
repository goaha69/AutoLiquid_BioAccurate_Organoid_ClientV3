<template>
  <div>
    <x-card v-if="hasPerm('sysTimers:page')">
      <template #content>
        <a-form class="table-page-search-wrapper" layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="任务名称">
                <a-input v-model:value="queryParam.timerName" allow-clear placeholder="请输入任务名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </template>
    </x-card>
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysTimers:add')">
          <template #icon><plus-outlined /></template>
          新增任务
        </a-button>
      </template>

      <a-table
        ref="table"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :row-key="record => record.id"
        :pagination="pagination"
        @change="handleTableChange"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'requestType'">
            {{ requestTypeFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'timerStatus'">
            <a-popconfirm
              v-if="hasPerm('sysTimers:start') || hasPerm('sysTimers:stop')"
              placement="top"
              :title="text === 0 ? '确定停止该任务' : '确定启动该任务'"
              @confirm="() => editJobStatus(text, record)"
            >
              <a-badge :status="text === 0 ? 'processing' : 'default'" />
              <a>{{ jobStatusFilter(text) }}</a>
            </a-popconfirm>
            <span v-else>
              <a-badge :status="text === 0 ? 'processing' : 'default'" />
              {{ jobStatusFilter(text) }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a v-if="hasPerm('sysTimers:edit')" @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysTimers:edit') && hasPerm('sysTimers:delete')" />
            <a-popconfirm
              v-if="hasPerm('sysTimers:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => handleDelete(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from 'vue'
import { message } from 'ant-design-vue'
import { XCard } from '@/components'
import { sysTimersPage, sysTimersDelete, sysTimersStart, sysTimersStop } from '@/api/modular/system/timersManage'
import { sysEnumDataList } from '@/api/modular/system/enumManage'
import addForm from './addForm.vue'
import editForm from './editForm.vue'
import { hasPerm } from '@/utils/permission/index.js'
import { PlusOutlined } from '@ant-design/icons-vue'

const queryParam = ref({})
const dataSource = ref([])
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})
const selectedRowKeys = ref([])

const columns = ref([
  { title: '任务名称', dataIndex: 'jobName' },
  { title: '请求地址', dataIndex: 'requestUrl' },
  { title: '请求类型', dataIndex: 'requestType' },
  { title: '请求参数', dataIndex: 'requestParameters' },
  { title: '间隔', dataIndex: 'interval' },
  { title: 'Cron', dataIndex: 'cron' },
  { title: '状态', dataIndex: 'timerStatus' },
  { title: '执行次数', dataIndex: 'runNumber' },
  { title: '备注', dataIndex: 'remark', width: 100 }
])

const requestTypeEnumDataDropDown = ref([])

onMounted(() => {
  fetchEnumData()
  fetchData()
  if (hasPerm('sysTimers:edit') || hasPerm('sysTimers:delete')) {
    columns.value.push({
      title: '操作',
      dataIndex: 'action',
      width: '150px'
    })
  }
})

const fetchEnumData = async () => {
  const res = await sysEnumDataList({ enumName: 'RequestTypeEnum' })
  requestTypeEnumDataDropDown.value = res.data
}

const fetchData = async () => {
  loading.value = true
  const params = {
    ...toRaw(queryParam.value),
    current: pagination.value.current,
    size: pagination.value.pageSize
  }
  const res = await sysTimersPage(params)
  dataSource.value = res.data.records
  pagination.value.total = res.data.total
  loading.value = false
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchData()
}

const handleQuery = () => {
  pagination.value.current = 1
  fetchData()
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const requestTypeFilter = (requestType) => {
  const item = requestTypeEnumDataDropDown.value.find(item => item.code == requestType)
  return item ? item.value : ''
}

const jobStatusFilter = (jobStatus) => {
  if (jobStatus === 0) return '运行'
  if (jobStatus === 1) return '已停'
  if (jobStatus === 2) return '执行失败'
  if (jobStatus === 3) return '已取'
  return ''
}

const editJobStatus = async (code, record) => {
  try {
    if (code === 0) {
      const res = await sysTimersStop({ id: record.id, jobName: record.jobName })
      if (res.success) {
        message.success('停止成功')
        fetchData()
      } else {
        message.error('停止失败: ' + res.message)
      }
    } else {
      const res = await sysTimersStart(record)
      if (res.success) {
        message.success('启动成功')
        fetchData()
      } else {
        message.error('启动失败: ' + res.message)
      }
    }
  } catch (err) {
    message.error('操作错误: ' + err.message)
  }
}

const handleDelete = async (record) => {
  try {
    const res = await sysTimersDelete(record)
    if (res.success) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败: ' + res.message)
    }
  } catch (err) {
    message.error('删除错误: ' + err.message)
  }
}

const addFormRef = ref()
const editFormRef = ref()

const handleAdd = () => {
  addFormRef.value.add()
}

const handleEdit = (record) => {
  editFormRef.value.edit(toRaw(record))
}

const handleOk = () => {
  fetchData()
}
</script>

<style lang="less">
  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }
</style>
