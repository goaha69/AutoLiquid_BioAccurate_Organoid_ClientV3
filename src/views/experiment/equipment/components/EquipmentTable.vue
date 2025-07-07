<template>
  <a-card :bordered="false">
    <a-table
      :dataSource="data"
      :columns="tableColumns"
      :loading="loading"
      :pagination="pagination"
      :row-key="record => record.id"
      :customRow="customRow"
      @change="handleTableChange"
    >
      <template #title>
        <a-button
          v-if="hasPerm('exp_equipment:add')"
          type="primary"
          @click="handleAdd"
        >
          <PlusOutlined />
          新增设备
        </a-button>
      </template>
      
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'serial'">
          {{ index + 1 }}
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
          <a-tag :color="record.status == 0 ? 'green' : 'red'">
            {{ statusFilter(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'isConnected'">
          <a-tag :color="record.isConnected ? 'green' : 'red'">
            {{ isConnectedFilter(record.isConnected) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a v-if="hasPerm('exp_equipment:edit')" @click="handleEdit(record)">
            编辑
          </a>
          <a-divider type="vertical" v-if="hasPerm('exp_equipment:edit')" />
          
          <a-dropdown v-if="hasMoreActions">
            <a class="ant-dropdown-link">
              更多 <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPerm('exp_equipment:debug')">
                  <a @click="handleDebug(record)">调试</a>
                </a-menu-item>
                <a-menu-item v-if="hasPerm('exp_equipment:scale') && record.isThirdParty === false">
                  <a @click="handleSetScale(record)">设置scale</a>
                </a-menu-item>
                <a-menu-item v-if="hasPerm('exp_equipment:delete')">
                  <a-popconfirm 
                    placement="topRight" 
                    title="确认删除？" 
                    @confirm="() => handleDelete(record)"
                  >
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
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { hasPerm } from '@/utils/permissions'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import moment from 'moment'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({})
  },
  selectedRow: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add', 'edit', 'delete', 'debug', 'set-scale', 'table-change', 'row-select'])

// 字典数据
const statusDictTypeDropDown = ref([])
const isConnectedDictTypeDropDown = ref([])

// 表格列配置
const columns = reactive([
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: 60
  },   
  {
    title: '设备编号',
    dataIndex: 'code',
    width: 120
  },
  {
    title: '设备名称',
    width: 150,
    dataIndex: 'name'
  },
  {
    title: '主机',
    dataIndex: 'host',
    width: 120
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 80
  },
  {
    title: 'Com口',
    dataIndex: 'comPort',
    width: 80
  },
  {
    title: '波特率',
    dataIndex: 'baudRate',
    key: 'baudRate',
    width: 80
  },
  {
    title: '生产厂商',
    dataIndex: 'manufacturer',
    width: 120
  },
  {
    title: '生产日期',
    dataIndex: 'manufactureDate',
    key: 'manufactureDate',
    width: 120
  },
  {
    title: '配置url',
    dataIndex: 'paramsPage',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '连接状态',
    dataIndex: 'isConnected',
    key: 'isConnected',
    width: 100
  }
])

// 计算属性
const hasMoreActions = computed(() => {
  return hasPerm('exp_equipment:edit') || 
         hasPerm('exp_equipment:delete') || 
         hasPerm('exp_equipment:debug') || 
         hasPerm('exp_equipment:scale')
})

const tableColumns = computed(() => {
  const cols = [...columns]
  if (hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete')) {
    cols.push({
      title: '操作',
      width: 200,
      key: 'action',
      align: 'center'
    })
  }
  return cols
})

// 状态过滤器
const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
  return status === 0 ? '正常' : '停用'
}

const isConnectedFilter = (status) => {
  const values = isConnectedDictTypeDropDown.value.filter(item => JSON.parse(item.code) == status)
  if (values.length > 0) {
    return values[0].value
  }
  return status ? '已连接' : '未连接'
}

const formatDate = (date) => {
  if (!date) return ''
  
  // 安全地处理不同类型的日期数据
  if (moment.isMoment(date)) {
    return date.format('YYYY-MM-DD')
  } else if (typeof date === 'string') {
    const momentDate = moment(date)
    return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : ''
  } else if (date instanceof Date) {
    return moment(date).format('YYYY-MM-DD')
  }
  
  return ''
}

// 自定义行
const customRow = (record) => {
  return {
    onClick: () => {
      emit('row-select', record)
    },
    style: {
      backgroundColor: props.selectedRow === record ? '#e6f7ff' : ''
    }
  }
}

// 事件处理
const handleAdd = () => {
  emit('add')
}

const handleEdit = (record) => {
  emit('edit', record)
}

const handleDelete = (record) => {
  emit('delete', record)
}

const handleDebug = (record) => {
  emit('debug', record)
}

const handleSetScale = (record) => {
  emit('set-scale', record)
}

const handleTableChange = (pag) => {
  emit('table-change', pag)
}

// 获取字典数据
const getSysDictTypeDropDown = async () => {
  try {
    const [statusRes, connectedRes] = await Promise.all([
      sysDictTypeDropDown({ code: 'common_status' }),
      sysDictTypeDropDown({ code: 'equipment_isconnected' })
    ])
    
    statusDictTypeDropDown.value = statusRes.data || []
    isConnectedDictTypeDropDown.value = connectedRes.data || []
  } catch (error) {
    console.error('获取字典数据失败:', error)
  }
}

onMounted(() => {
  getSysDictTypeDropDown()
})
</script>

<style lang="less" scoped>
.ant-dropdown-link {
  color: #1890ff;
}
</style> 