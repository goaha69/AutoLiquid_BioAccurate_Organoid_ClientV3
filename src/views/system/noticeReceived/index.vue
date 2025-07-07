<template>
  <div>
    <x-card v-if="hasPerm('sysNotice:received')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="关键字" v-if="hasPerm('sysNotice:received')">
                  <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入标题、内容" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="类型" v-if="hasPerm('sysNotice:received')">
                  <a-select v-model:value="queryParam.type" placeholder="请选择类型" allow-clear>
                    <a-select-option v-for="item in typeDictTypeDropDown" :key="item.code" :value="item.code">{{ item.value }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="!advanced && 8 || 24" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="handleQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                </span>
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
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ statusFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'type'">
            {{ typeFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a v-if="hasPerm('sysNotice:received')" @click="detailFormRef.detail(record)">查看</a>
          </template>
        </template>
      </a-table>
      <detail-form ref="detailFormRef" @ok="handleOk" />
      <div ref="editor"></div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { XCard } from '@/components'
import { sysNoticeReceived } from '@/api/modular/system/noticeReceivedManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import detailForm from './detailForm.vue'
import { hasPerm } from '@/utils/permission/index'

defineOptions({
  name: 'sys_notice_mgr_received'
})

const advanced = ref(false)
const queryParam = reactive({})
const columns = [
  {
    title: '标题',
    dataIndex: 'title'
  },
  {
    title: '类型',
    dataIndex: 'type'
  },
  {
    title: '状态',
    dataIndex: 'status'
  }
]

const dataSource = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})
const selectedRowKeys = ref([])
const selectedRows = ref([])
const statusDictTypeDropDown = ref([])
const typeDictTypeDropDown = ref([])
const detailFormRef = ref()

onMounted(() => {
  loadDicts()
  if (hasPerm('sysNotice:received')) {
    columns.push({
      title: '操作',
      width: '200px',
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
  sysNoticeReceived(params).then((res) => {
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

const loadDicts = () => {
  sysDictTypeDropDown({ code: 'notice_status' }).then((res) => {
    statusDictTypeDropDown.value = res.data
  })
  sysDictTypeDropDown({ code: 'notice_type' }).then((res) => {
    typeDictTypeDropDown.value = res.data
  })
}

const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
}

const typeFilter = (type) => {
  const values = typeDictTypeDropDown.value.filter(item => item.code == type)
  if (values.length > 0) {
    return values[0].value
  }
}

const handleOk = () => {
  loadData()
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
