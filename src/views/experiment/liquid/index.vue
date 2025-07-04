<template>
  <div>
    <a-card v-if="hasPerm('exp_liquid:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="12">
              <a-form-item label="试剂编号">
                <a-input
                  v-model="queryParam.code"
                  allow-clear
                  placeholder="请输入试剂编号"
                ></a>
              </a-form-item>
            </a-col>
            <a-col  md="8" : sm="12">
              <a-form-item label="试剂名称">
                <a-input
                  v-model="queryParam.name"
                  allow-clear
                  placeholder="请输入试剂名称"
                ></a>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <a-card :bordered="false">
      <div style="margin-bottom: 10px; color : #666;">
        调试信息: 表格列数: {{ columns.length }}, 操作列: {{ columns.find(col => col.key === 'action') : '已添加' : '未找到' }}
      </div>
      <a-table
        :dataSource="liquidData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        :scroll="{ x: 1200 }"
        @change="onTableChange"
        style="overflow-x: auto;"
      >
        <template #title>
          <a-button
            v-if="true || hasPerm('exp_liquid:add')"
            type="primary"
            @click="addLiquid"
          >
            <PlusOutlined ></PlusOutlined>
            新增试剂
          </a-button>
        </template>
        
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status == 0  'green' : 'red'">
              {{ statusFilter(record.status) }}
            </a-tag>
          </template>
          <!-- 操作列使用customRender,不需要模板 -->
        </template>
      </a-table>

      <!-- 新增/编辑表单 -->
      <a-modal
        v-model:open="addFormVisible"
        title="新增试剂"
        :width="800"
        :mask-closable="false"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <a-spin :spinning="formLoading">
          <a-form :model="attributeData" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="试剂编号" :required="true">
                  <a-input v-model="attributeData.code" placeholder="请输入试剂编号" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="试剂名称" :required="true">
                  <a-input v-model="attributeData.name" placeholder="请输入试剂名称" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="吸液偏移(mm)" :required="true">
                  <a-input-number v-model="attributeData.absorbOffset" :min="0" :step="0.1" style="width: 100%" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="喷液偏移(mm)" :required="true">
                  <a-input-number v-model="attributeData.jetOffset" :min="0" :step="0.1" style="width: 100%" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="吸液前吸空气量(%)" :required="true">
                  <a-input-number v-model="attributeData.absorbAirBeforePercent" :min="0" :max="100" :step="0.1" style="width: 100%" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="吸液后吸空气量(%)" :required="true">
                  <a-input-number v-model="attributeData.absorbAirAfterPercent" :min="0" :max="100" :step="0.1" style="width: 100%" ></a>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="状态">
                  <a-select v-model  value="attributeData.status" style="width : 100%">
                    <a-select-option :value="0">正常</a-select-option>
                    <a-select-option :value="1">停用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注">
                  <a-textarea v-model  value="attributeData.remark" placeholder="请输入备注" : rows="3" ></a>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
      </a-modal>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, h } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { hasPerm } from '@/utils/permissions'
import { exp_liquid_page } from '@/api/modular/experiment/liquidManage'

export default defineComponent({
  name: 'LiquidManage',
  components: {
    PlusOutlined
  },
  setup() {
    // 响应式数据
    const queryParam = reactive({
      code: '',
      name: ''
    })

    const loading = ref(false)
    const addFormVisible = ref(false)
    const formLoading = ref(false)
    const selectedRow = ref(null)
    
    const liquidData = ref([])
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条,共 ${total} 条`
    })

    const attributeData = reactive({
      id: 0,
      code: '',
      name: '',
      absorbOffset: 0.0,
      jetOffset: 0.0,
      absorbAirBeforePercent: 0.0,
      absorbAirAfterPercent: 0.0,
      status: 0,
      remark: ''
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
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        align: 'center',
        width: 100
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 120
      },
      {
        title: '吸液偏移',
        dataIndex: 'absorbOffset',
        key: 'absorbOffset',
        align: 'center',
        width: 100
      },
      {
        title: '喷液偏移',
        dataIndex: 'jetOffset',
        key: 'jetOffset',
        align: 'center',
        width: 100
      },
      {
        title: '吸液前空气',
        dataIndex: 'absorbAirBeforePercent',
        key: 'absorbAirBeforePercent',
        align: 'center',
        width: 110
      },
      {
        title: '吸液后空气',
        dataIndex: 'absorbAirAfterPercent',
        key: 'absorbAirAfterPercent',
        align: 'center',
        width: 110
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 80
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        width: 200,
        customRender: ({ record }) => {
          return h('div', { style: 'background-color: #f0f0f0; padding: 4px; border-radius: 4px;' }, [
            h('a', { 
              style: 'color: #1890ff; margin-right: 8px; cursor: pointer;',
              onClick: () => editLiquid(record)
            }, '编辑'),
            h('a-divider', { type: 'vertical' }),
            h('a-popconfirm', {
              title: '确认删除',
              onConfirm: () => deleteLiquid(record)
            }, [
              h('a', { style: 'color: #ff4d4f; cursor: pointer;' }, '删除')
            ])
          ])
        }
      }
    ])

    // 状态过滤器
    const statusFilter = (status) => {
      return status === 0  '正常' : '停用'
    }

    // 加载数据(调用后端接口)
    const loadData = () => {
      loading.value = true
      const params = {
        ...queryParam,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      exp_liquid_page(params).then(res => {
        if (res && res.data) {
          liquidData.value = res.data.rows || []
          pagination.total = res.data.totalRows || 0
        } else {
          liquidData.value = []
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

    const customRow = (record) => {
      return {
        onClick: () => {
          selectedRow.value = record
        },
        style: {
          backgroundColor: selectedRow.value === record  '#e6f7ff' : ''
        }
      }
    }

    const onTableChange = (pag) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      loadData()
    }

    const addLiquid = () => {
      Object.assign(attributeData, {
        id: 0,
        code: '',
        name: '',
        absorbOffset: 0.0,
        jetOffset: 0.0,
        absorbAirBeforePercent: 0.0,
        absorbAirAfterPercent: 0.0,
        status: 0,
        remark: ''
      })
      addFormVisible.value = true
    }

    const editLiquid = (record) => {
      Object.assign(attributeData, record)
      addFormVisible.value = true
    }

    const deleteLiquid = (record) => {
      // This function will be implemented in a subsequent edit
      // For now, it will just show a message
      message.warning('删除功能待实现')
    }

    const handleSubmit = () => {
      formLoading.value = true
      // This function will be implemented in a subsequent edit
      // For now, it will just show a message
      setTimeout(() => {
        message.success('新增/编辑功能待实现')
        formLoading.value = false
        addFormVisible.value = false
        loadData()
      }, 1000)
    }

    const handleCancel = () => {
      addFormVisible.value = false
    }

    // 权限检查日志
    console.log('🔍 液体权限检查:', {
      edit: hasPerm('exp_liquid:edit'),
      delete: hasPerm('exp_liquid:delete')
    })

    onMounted(() => {
      loadData()
    })

    return {
      queryParam,
      loading,
      addFormVisible,
      formLoading,
      selectedRow,
      liquidData,
      pagination,
      attributeData,
      columns,
      statusFilter,
      refreshTable,
      customRow,
      onTableChange,
      addLiquid,
      editLiquid,
      deleteLiquid,
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

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff;
}

:deep(.ant-card-head-title) {
  font-weight: 600;
}

/* 确保表格操作列可见 */
:deep(.ant-table-tbody > tr > td:last-child) {
  background-color: #fafafa;
  border-right: 1px solid #f0f0f0;
}

:deep(.ant-table-thead > tr > th:last-child) {
  background-color: #fafafa;
  border-right: 1px solid #f0f0f0;
}
</style>
