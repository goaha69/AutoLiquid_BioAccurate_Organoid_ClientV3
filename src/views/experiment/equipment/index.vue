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
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <a-card :bordered="false">
      <a-table
        :dataSource="equipmentData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        @change="onTableChange"
      >
        <template #title>
          <a-button
            v-if="hasPerm('exp_equipment:add')"
            type="primary"
            @click="addEquipment"
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
            <a v-if="hasPerm('exp_equipment:edit')" @click="editEquipment(record)">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_equipment:edit')" />
            
            <a-dropdown v-if="hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete') || hasPerm('exp_equipment:debug') || hasPerm('exp_equipment:scale')">
              <a class="ant-dropdown-link">
                更多 <DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPerm('exp_equipment:debug')">
                    <a @click="debugEquipment(record)">调试</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:scale') && record.isThirdParty === false">
                    <a @click="setScale(record)">设置scale</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:delete')">
                    <a-popconfirm 
                      placement="topRight" 
                      title="确认删除？" 
                      @confirm="() => deleteEquipment(record)"
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

      <!-- 新增/编辑表单模态框 -->
      <a-modal
        v-model:open="addFormVisible"
        title="设备管理"
        :width="800"
        :mask-closable="false"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <a-spin :spinning="formLoading">
          <a-form :model="equipmentForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="设备编号" :required="true">
                  <a-input v-model:value="equipmentForm.code" placeholder="请输入设备编号" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="设备名称" :required="true">
                  <a-input v-model:value="equipmentForm.name" placeholder="请输入设备名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="主机">
                  <a-input v-model:value="equipmentForm.host" placeholder="请输入主机地址" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="端口">
                  <a-input-number v-model:value="equipmentForm.port" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Com口">
                  <a-input v-model:value="equipmentForm.comPort" placeholder="请输入Com口" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="波特率">
                  <a-input-number v-model:value="equipmentForm.baudRate" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="生产厂商">
                  <a-input v-model:value="equipmentForm.manufacturer" placeholder="请输入生产厂商" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="生产日期">
                  <a-date-picker v-model:value="equipmentForm.manufactureDate" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="配置URL">
                  <a-input v-model:value="equipmentForm.paramsPage" placeholder="请输入配置URL" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="状态">
                  <a-select v-model:value="equipmentForm.status" style="width: 100%">
                    <a-select-option :value="0">正常</a-select-option>
                    <a-select-option :value="1">停用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="备注">
                  <a-textarea v-model:value="equipmentForm.remark" :rows="3" placeholder="请输入备注" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
      </a-modal>

      <!-- 调试模态框 -->
      <a-modal
        v-model:open="debugVisible"
        title="设备调试"
        :width="600"
        :mask-closable="false"
        @ok="debugVisible = false"
        @cancel="debugVisible = false"
      >
        <div>调试功能待实现</div>
      </a-modal>

      <!-- 设置Scale模态框 -->
      <a-modal
        v-model:open="scaleVisible"
        title="设置Scale"
        :width="500"
        :mask-closable="false"
        @ok="scaleVisible = false"
        @cancel="scaleVisible = false"
      >
        <div>Scale设置功能待实现</div>
      </a-modal>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { hasPerm } from '@/utils/permissions'
import { exp_equipment_page, exp_equipment_delete } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import moment from 'moment'

export default defineComponent({
  name: 'EquipmentManage',
  components: {
    PlusOutlined,
    DownOutlined
  },
  setup() {
    // 响应式数据
    const queryParam = reactive({
      code: '',
      name: '',
      host: ''
    })

    const loading = ref(false)
    const addFormVisible = ref(false)
    const debugVisible = ref(false)
    const scaleVisible = ref(false)
    const formLoading = ref(false)
    const selectedRow = ref(null)
    
    const equipmentData = ref([])
    const statusDictTypeDropDown = ref([])
    const isConnectedDictTypeDropDown = ref([])
    
    const equipmentForm = reactive({
      id: null,
      code: '',
      name: '',
      host: '',
      port: 0,
      comPort: '',
      baudRate: 0,
      manufacturer: '',
      manufactureDate: null,
      paramsPage: '',
      status: 0,
      remark: ''
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条,共 ${total} 条`
    })

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
      return moment(date).format('YYYY-MM-DD')
    }

    // 加载数据
    const loadData = () => {
      loading.value = true
      const params = {
        ...queryParam,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      exp_equipment_page(params).then(res => {
        if (res && res.data) {
          equipmentData.value = res.data.rows || []
          pagination.total = res.data.totalRows || 0
        } else {
          equipmentData.value = []
          pagination.total = 0
        }
        loading.value = false
      }).catch(() => {
        loading.value = false
      })
    }

    const refreshTable = () => {
      pagination.current = 1
      loadData()
    }

    const onTableChange = (pag) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      loadData()
    }

    // 获取字典数据
    const getSysDictTypeDropDown = () => {
      sysDictTypeDropDown({
        code: 'common_status'
      }).then((res) => {
        statusDictTypeDropDown.value = res.data || []
      })

      sysDictTypeDropDown({
        code: 'equipment_isconnected'
      }).then((res) => {
        isConnectedDictTypeDropDown.value = res.data || []
      })
    }

    // 自定义行
    const customRow = (record) => {
      return {
        onClick: () => {
          selectedRow.value = record
        },
        style: {
          backgroundColor: selectedRow.value === record ? '#e6f7ff' : ''
        }
      }
    }

    // 操作方法
    const addEquipment = () => {
      Object.assign(equipmentForm, {
        id: null,
        code: '',
        name: '',
        host: '',
        port: 0,
        comPort: '',
        baudRate: 0,
        manufacturer: '',
        manufactureDate: null,
        paramsPage: '',
        status: 0,
        remark: ''
      })
      addFormVisible.value = true
    }

    const editEquipment = (record) => {
      Object.assign(equipmentForm, record)
      addFormVisible.value = true
    }

    const deleteEquipment = (record) => {
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

    const debugEquipment = (record) => {
      debugVisible.value = true
    }

    const setScale = (record) => {
      scaleVisible.value = true
    }

    const handleSubmit = () => {
      formLoading.value = true
      // 这里应该调用新增或编辑API
      message.warning('新增/编辑功能待实现')
      formLoading.value = false
      addFormVisible.value = false
      loadData()
    }

    const handleCancel = () => {
      addFormVisible.value = false
    }

    // 添加操作列
    if (hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete')) {
      columns.push({
        title: '操作',
        width: 200,
        key: 'action',
        align: 'center'
      })
    }

    onMounted(() => {
      getSysDictTypeDropDown()
      loadData()
    })

    return {
      queryParam,
      loading,
      addFormVisible,
      debugVisible,
      scaleVisible,
      formLoading,
      selectedRow,
      equipmentData,
      statusDictTypeDropDown,
      isConnectedDictTypeDropDown,
      equipmentForm,
      pagination,
      columns,
      statusFilter,
      isConnectedFilter,
      formatDate,
      loadData,
      refreshTable,
      onTableChange,
      customRow,
      addEquipment,
      editEquipment,
      deleteEquipment,
      debugEquipment,
      setScale,
      handleSubmit,
      handleCancel,
      hasPerm
    }
  }
})
</script>

<style lang="less" scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
}

.table-operator {
  margin-bottom: 18px;
}

button {
  margin-right: 8px;
}
</style>
