<template>
  <div>
    <x-card v-if="hasPerm('sysSms:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="手机号">
                  <a-input v-model:value="queryParam.phoneNumbers" placeholder="请输入手机号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="发送状态">
                  <a-select v-model:value="queryParam.status" placeholder="请选择发送状态">
                    <a-select-option v-for="item in statusDictTypeDropDown" :key="item.code" :value="item.code">
                      {{ item.value }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <template v-if="advanced">
                <a-col :md="8" :sm="24">
                  <a-form-item label="来源">
                    <a-select v-model:value="queryParam.source" placeholder="请选择来源">
                      <a-select-option v-for="item in sourceDictTypeDropDown" :key="item.code" :value="item.code">
                        {{ item.value }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </template>
              <a-col :md="!advanced ? 8 : 24" :sm="24">
                <span class="table-page-search-submitButtons" :style="advanced ? { float: 'right', overflow: 'hidden' } : {}">
                  <a-button type="primary" @click="handleSearch">查询</a-button>
                  <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
                  <a @click="toggleAdvanced" style="margin-left: 8px">
                    {{ advanced ? '收起' : '展开' }}
                    <up-outlined v-if="advanced" />
                    <down-outlined v-else />
                  </a>
                </span>
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
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'status'">
            {{ statusFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'source'">
            {{ sourceFilter(text) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { XCard } from '@/components'
import { smsPage } from '@/api/modular/system/smsManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

defineOptions({
  name: 'sys_sms_mgr'
})

const advanced = ref(false)
const loading = ref(false)
const dataSource = ref([])
const selectedRowKeys = ref([])
const selectedRows = ref([])
const statusDictTypeDropDown = ref([])
const sourceDictTypeDropDown = ref([])

const queryParam = reactive({
  phoneNumbers: '',
  status: '',
  source: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

const columns = [
  {
    title: '手机号',
    dataIndex: 'phoneNumbers'
  },
  {
    title: '短信验证码',
    dataIndex: 'validateCode'
  },
  {
    title: '短信模板ID',
    dataIndex: 'templateCode'
  },
  {
    title: '发送状态',
    dataIndex: 'status'
  },
  {
    title: '来源',
    dataIndex: 'source'
  },
  {
    title: '失效时间',
    dataIndex: 'invalidTime'
  }
]

// Mock permission check function
const hasPerm = (permission) => {
  return true
}

const loadData = (params = {}) => {
  loading.value = true
  const parameter = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryParam,
    ...params
  }
  
  return smsPage(parameter).then((res) => {
    dataSource.value = res.data.records || []
    pagination.total = res.data.total || 0
    loading.value = false
    return res.data
  }).catch(() => {
    loading.value = false
  })
}

const sourceFilter = (source) => {
  const values = sourceDictTypeDropDown.value.filter(item => item.code == source)
  if (values.length > 0) {
    return values[0].value
  }
  return source
}

const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
  return status
}

const fetchDictData = () => {
  sysDictTypeDropDown({ code: 'send_type' }).then((res) => {
    statusDictTypeDropDown.value = res.data
  })
  sysDictTypeDropDown({ code: 'sms_send_source' }).then((res) => {
    sourceDictTypeDropDown.value = res.data
  })
}

const toggleAdvanced = () => {
  advanced.value = !advanced.value
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  Object.assign(queryParam, {
    phoneNumbers: '',
    status: '',
    source: ''
  })
  pagination.current = 1
  loadData()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const onSelectChange = (selectedKeys, selectedRowsData) => {
  selectedRowKeys.value = selectedKeys
  selectedRows.value = selectedRowsData
}

onMounted(() => {
  fetchDictData()
  loadData()
})
</script>

<style lang="less">
.table-operator {
  margin-bottom: 18px;
}

button {
  margin-right: 8px;
}

.table-page-search-wrapper {
  .ant-form-inline {
    .ant-form-item {
      display: flex;
      margin-bottom: 24px;
      margin-right: 0;

      .ant-form-item-control-wrapper {
        flex: 1 1;
        display: inline-block;
        vertical-align: middle;
      }

      > .ant-form-item-label {
        line-height: 32px;
        padding-right: 8px;
        width: auto;
      }

      .ant-form-item-control {
        height: 32px;
        line-height: 32px;
      }
    }
  }

  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
</style>
