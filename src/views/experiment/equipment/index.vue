<template>
  <div>
    <a-card v-if="hasPerm('exp_equipment:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="12">
              <a-form-item label="设备编号">
                <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入设备编号" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="设备名称">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入设备名称" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="主机">
                <a-input v-model:value="queryParam.host" allow-clear placeholder="请输入主机" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <a-card :bordered="false">
      <div class="table-operator" style="margin-bottom: 16px;">
        <a-button @click="handleAdd" type="primary" v-if="hasPerm('exp_equipment:add')">
          <template #icon><PlusOutlined /></template>
          新增设备
        </a-button>
      </div>
      
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :loading="loading"
        :pagination="{
          total: total,
          current: pageNum,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }"
        @change="handleTableChange"
        :customRow="customRow"
        rowKey="id"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ (pageNum - 1) * pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'port'">
            {{ record.port === 0 ? '' : record.port }}
          </template>
          <template v-else-if="column.key === 'baudRate'">
            {{ record.baudRate === 0 ? '' : record.baudRate }}
          </template>
          <template v-else-if="column.key === 'manufactureDate'">
            {{ formatDate(record.manufactureDate) }}
          </template>
          <template v-else-if="column.key === 'status'">
            {{ statusFilter(record.status) }}
          </template>
          <template v-else-if="column.key === 'isConnected'">
            {{ isConnectedFilter(record.isConnected) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a v-if="hasPerm('exp_equipment:edit')" @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_equipment:edit')" />

            <a-dropdown v-if="hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete') || hasPerm('exp_equipment:debug') || hasPerm('exp_equipment:scale')">
              <a class="ant-dropdown-link">
                更多<DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPerm('exp_equipment:debug')">
                    <a v-if="record.paramsPage?.includes('debugView')" @click="handleDebug(record, 'debugView')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugCentrifuge')" @click="handleDebug(record, 'debugCentrifuge')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugCamera')" @click="handleDebug(record, 'debugCamera')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugIncubatorCo2')" @click="handleDebug(record, 'debugIncubatorCo2')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugMicroplateReader')" @click="handleDebug(record, 'debugMicroplateReader')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugMicroscope')" @click="handleDebug(record, 'debugMicroscope')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugKeyto')" @click="handleDebug(record, 'debugKeyto')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugMisumi')" @click="handleDebug(record, 'debugMisumi')">调试</a>
                    <a v-if="record.paramsPage?.includes('debugBarcode')" @click="handleDebug(record, 'debugBarcode')">调试</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:scale') && record.isThirdParty === false">
                    <a @click="handleSetScale(record)">设置scale</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:delete')">
                    <a-popconfirm placement="topRight" title="确认删除？" @confirm="handleDelete(record)">
                      <a>删除</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增表单 -->
    <AddForm ref="addFormRef" @ok="handleOk" />
    
    <!-- 编辑表单 -->
    <EditForm ref="editFormRef" @ok="handleOk" />
    
    <!-- Scale设置 -->
    <ScaleView ref="scaleViewRef" @ok="handleOk" />
    
    <!-- 调试组件 -->
    <DebugView ref="debugViewRef" @ok="handleOk" />
    <DebugCentrifuge ref="debugCentrifugeRef" @ok="handleOk" />
    <DebugCamera ref="debugCameraRef" @ok="handleOk" />
    <DebugIncubatorCo2 ref="debugIncubatorCo2Ref" @ok="handleOk" />
    <DebugMicroplateReader ref="debugMicroplateReaderRef" @ok="handleOk" />
    <DebugMicroscope ref="debugMicroscopeRef" @ok="handleOk" />
    <DebugMisumi ref="debugMisumiRef" @ok="handleOk" />
    <DebugKeyto ref="debugKeytoRef" @ok="handleOk" />
    <DebugBarcode ref="debugBarcodeRef" @ok="handleOk" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import moment from 'moment'
import { hasPerm } from '@/utils/permissions'
import { exp_equipment_page, exp_equipment_delete } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

// 导入子组件
import AddForm from './addForm.vue'
import EditForm from './editForm.vue'
import ScaleView from './scaleView.vue'
import DebugView from './debugView.vue'
import DebugCentrifuge from './debugCentrifuge.vue'
import DebugCamera from './debugCamera.vue'
import DebugIncubatorCo2 from './debugIncubatorCo2.vue'
import DebugMicroplateReader from './debugMicroplateReader.vue'
import DebugMicroscope from './debugMicroscope.vue'
import DebugMisumi from './debugMisumi.vue'
import DebugKeyto from './debugKeyto.vue'
import DebugBarcode from './debugBarcode.vue'

// 响应式数据
const loading = ref(false)
const queryParam = reactive({
  code: '',
  name: '',
  host: ''
})

const dataSource = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const selectedRow = ref(null)
const statusDictTypeDropDown = ref([])
const isConnectedDictTypeDropDown = ref([])

// 子组件引用
const addFormRef = ref(null)
const editFormRef = ref(null)
const scaleViewRef = ref(null)
const debugViewRef = ref(null)
const debugCentrifugeRef = ref(null)
const debugCameraRef = ref(null)
const debugIncubatorCo2Ref = ref(null)
const debugMicroplateReaderRef = ref(null)
const debugMicroscopeRef = ref(null)
const debugMisumiRef = ref(null)
const debugKeytoRef = ref(null)
const debugBarcodeRef = ref(null)

// 表格列配置
const columns = computed(() => {
  const baseColumns = [
    {
      title: '序号',
      key: 'serial',
      align: 'center',
      width: 60
    },
    {
      title: '设备编号',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host'
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: 'Com口',
      dataIndex: 'comPort',
      key: 'comPort'
    },
    {
      title: '波特率',
      dataIndex: 'baudRate',
      key: 'baudRate'
    },
    {
      title: '生产厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: '生产日期',
      dataIndex: 'manufactureDate',
      key: 'manufactureDate'
    },
    {
      title: '配置url',
      dataIndex: 'paramsPage',
      key: 'paramsPage'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '连接状态',
      dataIndex: 'isConnected',
      key: 'isConnected'
    }
  ]

  // 根据权限添加操作列
  if (hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete')) {
    baseColumns.push({
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center'
    })
  }

  return baseColumns
})

// 生命周期
onMounted(() => {
  loadSysDictTypeDropDown()
  loadData()
})

// 方法
function loadData() {
  loading.value = true
  const params = {
    ...queryParam,
    current: pageNum.value,
    size: pageSize.value
  }
  
  exp_equipment_page(params).then((res) => {
    if (res.success) {
      dataSource.value = res.data.records || res.data.rows || []
      total.value = res.data.total || res.data.totalCount || 0
    } else {
      message.error('数据加载失败')
    }
  }).catch((error) => {
    message.error('数据加载失败: ' + error.message)
  }).finally(() => {
    loading.value = false
  })
}

function loadSysDictTypeDropDown() {
  // 加载状态字典
  sysDictTypeDropDown({ code: 'common_status' }).then((res) => {
    if (res.success) {
      statusDictTypeDropDown.value = res.data
    }
  })

  // 加载连接状态字典
  sysDictTypeDropDown({ code: 'equipment_isconnected' }).then((res) => {
    if (res.success) {
      isConnectedDictTypeDropDown.value = res.data
    }
  })
}

function handleQuery() {
  pageNum.value = 1
  loadData()
}

function handleReset() {
  Object.assign(queryParam, {
    code: '',
    name: '',
    host: ''
  })
  pageNum.value = 1
  loadData()
}

function handleTableChange(pagination) {
  pageNum.value = pagination.current
  pageSize.value = pagination.pageSize
  loadData()
}

function customRow(record) {
  return {
    onClick: () => {
      selectedRow.value = record
    },
    style: {
      backgroundColor: selectedRow.value === record ? '#f0f0f0' : ''
    }
  }
}

function formatDate(date) {
  if (!date) return ''
  return moment(date).format('YYYY-MM-DD')
}

function statusFilter(status) {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
  return ''
}

function isConnectedFilter(status) {
  const values = isConnectedDictTypeDropDown.value.filter(item => JSON.parse(item.code) == status)
  if (values.length > 0) {
    return values[0].value
  }
  return ''
}

function handleAdd() {
  addFormRef.value?.add()
}

function handleEdit(record) {
  editFormRef.value?.edit(record)
}

function handleDelete(record) {
  exp_equipment_delete(record).then((res) => {
    if (res.success) {
      message.success('删除成功')
      loadData()
    } else {
      message.error('删除失败：' + res.message)
    }
  }).catch((err) => {
    message.error('删除错误：' + err.message)
  })
}

function handleDebug(record, debugType) {
  const refMap = {
    'debugView': debugViewRef,
    'debugCentrifuge': debugCentrifugeRef,
    'debugCamera': debugCameraRef,
    'debugIncubatorCo2': debugIncubatorCo2Ref,
    'debugMicroplateReader': debugMicroplateReaderRef,
    'debugMicroscope': debugMicroscopeRef,
    'debugKeyto': debugKeytoRef,
    'debugMisumi': debugMisumiRef,
    'debugBarcode': debugBarcodeRef
  }
  
  const ref = refMap[debugType]
  if (ref?.value) {
    ref.value.debug(record)
  }
}

function handleSetScale(record) {
  scaleViewRef.value?.setScale(record)
}

function handleOk() {
  loadData()
}
</script>

<style lang="less" scoped>
.table-operator {
  margin-bottom: 18px;
}

.table-page-search-wrapper {
  margin-bottom: 16px;
}

.ant-btn {
  margin-right: 8px;
}

.ant-dropdown-link {
  color: #1890ff;
}
</style>
