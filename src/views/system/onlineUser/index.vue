<template>
  <div>
    <x-card v-if="hasPerm('sysOnlineUser:list')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="关键字">
                  <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入姓名、账号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="handleQuery">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam.searchValue = ''">重置</a-button>
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
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'lastLoginAddress'">
            <ellipsis :length="20" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'lastLoginBrowser'">
            <ellipsis :length="20" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-popconfirm
              v-if="hasPerm('sysOnlineUser:forceExist')"
              placement="topRight"
              title="是否强制下线该用户"
              @confirm="() => forceExist(record)"
            >
              <a>强制下线</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { XCard, Ellipsis } from '@/components'
import { sysOnlineUserForceExist, sysOnlineUserList } from '@/api/modular/system/onlineUserManage'
import { hasPerm } from '@/utils/permission/index'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'sys_monitor_mgr_online_user'
})

const queryParam = reactive({
  searchValue: ''
})

const columns = [
  { title: '用户Id', dataIndex: 'userId' },
  { title: '账号', dataIndex: 'account' },
  { title: '昵称', dataIndex: 'name' },
  { title: '登录IP', dataIndex: 'lastLoginIp' },
  { title: '登录时间', dataIndex: 'lastTime' }
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

onMounted(() => {
  if (hasPerm('sysOnlineUser:forceExist')) {
    columns.push({
      title: '操作',
      width: '150px',
      dataIndex: 'action'
    })
  }
  loadData()
})

const loadData = () => {
  loading.value = true
  const params = {
    ...queryParam,
    current: pagination.current,
    size: pagination.pageSize
  }
  sysOnlineUserList(params).then(res => {
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

const forceExist = (record) => {
  sysOnlineUserForceExist(record).then(res => {
    if (res.success) {
      message.success('强制下线成功')
      loadData()
    } else {
      message.error('强制下线失败: ' + res.message)
    }
  }).catch(err => {
    message.error('强制下线错误: ' + err.message)
  })
}

const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys
  selectedRows.value = rows
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
