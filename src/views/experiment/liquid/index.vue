<template>
  <div>
    <a-card :bordered="false" v-if="hasPerm('exp_liquid:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="12">
              <a-form-item label="试剂编号">
                <a-input
                  v-model:value="queryParam.code"
                  allow-clear
                  placeholder="请输入试剂编号"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="试剂名称">
                <a-input
                  v-model:value="queryParam.name"
                  allow-clear
                  placeholder="请输入试剂名称"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card :bordered="false">
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        @change="onTableChange"
      >
        <template #title>
          <a-button type="primary" @click="handleAdd" v-if="hasPerm('exp_liquid:add')">
            <template #icon><PlusOutlined /></template>
            新增试剂
          </a-button>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">
              {{ statusFilter(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a v-if="hasPerm('exp_liquid:edit')" @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_liquid:edit') && hasPerm('exp_liquid:delete')" />
            <a-popconfirm
              v-if="hasPerm('exp_liquid:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="handleDelete(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
      <AddForm ref="addFormRef" @ok="handleOk" />
      <EditForm ref="editFormRef" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Form, Input, Button, Card, Table, Row, Col, Tag, Divider, Popconfirm } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { exp_liquid_page, exp_liquid_delete } from '@/api/modular/experiment/liquidManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { usePermission } from '@/hooks/usePermission'
import AddForm from './addForm.vue'
import EditForm from './editForm.vue'

const { hasPerm } = usePermission()

const queryParam = reactive({
  code: '',
  name: ''
})

const loading = ref(false)
const dataSource = ref([])
const statusDictTypeDropDown = ref([])
const addFormRef = ref(null)
const editFormRef = ref(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条, 共 ${total} 条`
})

const columns = [
  { title: '序号', key: 'serial', align: 'center', width: 60 },
  { title: '试剂编号', dataIndex: 'code', align: 'center' },
  { title: '试剂名称', dataIndex: 'name', align: 'left' },
  { title: '吸液偏移(mm)', dataIndex: 'absorbOffset', align: 'center' },
  { title: '喷液偏移(mm)', dataIndex: 'jetOffset', align: 'center' },
  { title: '吸液前吸空气量(%)', dataIndex: 'absorbAirBeforePercent', align: 'center' },
  { title: '吸液后吸空气量(%)', dataIndex: 'absorbAirAfterPercent', align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 160 }
]

const loadData = () => {
  loading.value = true
  const params = {
    ...queryParam,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  }
  exp_liquid_page(params)
    .then((res) => {
      if (res.success && res.data) {
        dataSource.value = res.data.rows || []
        pagination.total = res.data.totalRows || 0
      } else {
        dataSource.value = []
        pagination.total = 0
        message.error(res.message || '加载数据失败')
      }
    })
    .catch(err => {
      message.error(err.message || '加载数据出错')
    })
    .finally(() => {
      loading.value = false
    })
}

const refreshTable = () => {
  pagination.current = 1
  loadData()
}

const resetQuery = () => {
  queryParam.code = ''
  queryParam.name = ''
  refreshTable()
}

const onTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleAdd = () => {
  addFormRef.value.add()
}

const handleEdit = (record) => {
  editFormRef.value.edit(record)
}

const handleDelete = (record) => {
  exp_liquid_delete({ id: record.id }).then((res) => {
    if (res.success) {
      message.success('删除成功')
      refreshTable()
    } else {
      message.error(res.message || '删除失败')
    }
  }).catch(err => {
    message.error(err.message || '删除出错')
  })
}

const handleOk = () => {
  refreshTable()
}

const loadDict = async () => {
  const res = await sysDictTypeDropDown({ code: 'common_status' })
  if (res.success) {
    statusDictTypeDropDown.value = res.data
  }
}

const statusFilter = (status) => {
  const statusObj = statusDictTypeDropDown.value.find(item => item.code == status)
  return statusObj ? statusObj.value : '未知'
}

onMounted(() => {
  loadData()
  loadDict()
})
</script>

<style scoped>
.table-page-search-wrapper {
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
