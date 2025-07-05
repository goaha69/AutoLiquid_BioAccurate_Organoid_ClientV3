<template>
  <div>
    <a-card v-if="hasPerm('exp_consumable:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="12">
              <a-form-item label="耗材编号">
                <a-input
                  v-model:value="queryParam.code"
                  allow-clear
                  placeholder="请输入耗材编号"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="耗材名称">
                <a-input
                  v-model:value="queryParam.name"
                  allow-clear
                  placeholder="请输入耗材名称"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a-button type="primary" @click="toggleTable">{{ consumableTitle }}</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <a-card :bordered="false">
      <!-- 耗材基本信息表格 -->
      <div style="margin-bottom: 10px; color: #666;">
        调试信息: 表格列数: {{ columns.length }}, 操作列: {{ columns.find(col => col.key === 'action') ? '已添加' : '未找到' }}
      </div>
      <a-table
        v-show="isConsumable"
        :dataSource="consumableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        :scroll="{ x: 1500 }"
        @change="onTableChange"
        style="overflow-x: auto;"
      >
        <template #title>
          <a-button
            v-if="true || hasPerm('exp_consumable:add')"
            type="primary"
            @click="addConsumable"
          >
            <PlusOutlined ></PlusOutlined>
            新增耗材
          </a-button>
        </template>
        
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status == 0 ? 'green' : 'red'">
              {{ statusFilter(record.status) }}
            </a-tag>
          </template>
          <!-- 操作列使用customRender,不需要模板 -->
        </template>
      </a-table>

      <!-- 剩余体积表格 -->
      <a-table
        v-show="isRemainingVolume"
        :dataSource="remainingVolumeData"
        :columns="volumeColumns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        :scroll="{ x: 1500 }"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'remainingVolume'">
            <div style="display: flex; height: 45px; cursor: pointer;">
              <div style="margin-top: 10px;">
                <a-input-number
                  v-model:value="record.remainingVolume"
                  :step="100"
                  :min="0"
                  :max="record.maxVolume"
                  style="width: 120px"
                />
              </div>
              <!-- 液体体积显示器 -->
              <div class="container">
                <div class="bottle-container">
                  <div class="bottle-cap"></div>
                  <div class="bottle-neck"></div>
                  <div class="bottle">
                    <div 
                      class="liquid"
                      :style="{ height: record.remainingVolume / record.maxVolume * 100 + '%' }"
                    ></div>
                    <div class="scale">
                      <div 
                        v-for="mark in scaleMarks" 
                        :key="mark.value" 
                        class="scale-mark" 
                        :style="{ bottom: mark.position + '%' }"
                      >
                        <span class="scale-value">{{ mark.value }}ml</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="saveRemainingVolume(record)">保存</a>
          </template>
        </template>
      </a-table>

      <!-- 新增/编辑表单 -->
      <a-modal
        v-model:open="addFormVisible"
        title="新增耗材"
        :width="1300"
        :mask-closable="false"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <a-spin :spinning="formLoading">
          <a-form :model="attributeData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-row :gutter="8">
              <a-col :span="12">
                <a-form-item label="耗材编号" :required="true">
                  <a-input v-model:value="attributeData.code" placeholder="请输入耗材编号" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="耗材名称" :required="true">
                  <a-input v-model:value="attributeData.name" placeholder="请输入耗材名称" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="行数" :required="true">
                  <a-input-number v-model:value="attributeData.rowCount" :min="1" :step="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="列数" :required="true">
                  <a-input-number v-model:value="attributeData.colCount" :min="1" :step="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="行距(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.rowSpace" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="列距(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.colSpace" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="X尺寸(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.xSize" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="Y尺寸(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.ySize" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="X偏移(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.xOffset" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="Y偏移(mm)" :required="true">
                  <a-input-number v-model:value="attributeData.yOffset" :min="0" :step="0.1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最大体积(μl)">
                  <a-input-number v-model:value="attributeData.maxVolume" :min="0" :step="100" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="剩余体积(μl)">
                  <a-input-number v-model:value="attributeData.remainingVolume" :min="0" :step="100" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="状态">
                  <a-select v-model:value="attributeData.status" style="width: 100%">
                    <a-select-option :value="0">正常</a-select-option>
                    <a-select-option :value="1">停用</a-select-option>
                  </a-select>
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
import { defineComponent, ref, reactive, onMounted, computed, h } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { hasPerm } from '@/utils/permissions'
import { exp_consumable_page } from '@/api/modular/experiment/consumableManage'

export default defineComponent({
  name: 'ConsumableManage',
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
    const isConsumable = ref(true)
    const isRemainingVolume = ref(false)
    const selectedRow = ref(null)
    
    const consumableData = ref([])
    const remainingVolumeData = ref([])
    
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
      rowCount: 1,
      colCount: 1,
      rowSpace: 0.0,
      colSpace: 0.0,
      xSize: 0.0,
      ySize: 0.0,
      xOffset: 0.0,
      yOffset: 0.0,
      maxVolume: 0.0,
      remainingVolume: 0.0,
      status: 0
    })

    // 液体体积显示器刻度
    const scaleMarks = ref([
      { value: 0, position: 0 },
      { value: 250, position: 25 },
      { value: 500, position: 50 },
      { value: 750, position: 75 },
      { value: 1000, position: 100 }
    ])

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
        title: '行数',
        dataIndex: 'rowCount',
        key: 'rowCount',
        align: 'center',
        width: 60
      },
      {
        title: '列数',
        dataIndex: 'colCount',
        key: 'colCount',
        align: 'center',
        width: 60
      },
      {
        title: '行距',
        dataIndex: 'rowSpace',
        key: 'rowSpace',
        align: 'center',
        width: 80
      },
      {
        title: '列距',
        dataIndex: 'colSpace',
        key: 'colSpace',
        align: 'center',
        width: 80
      },
      {
        title: 'X尺寸',
        dataIndex: 'xSize',
        key: 'xSize',
        align: 'center',
        width: 80
      },
      {
        title: 'Y尺寸',
        dataIndex: 'ySize',
        key: 'ySize',
        align: 'center',
        width: 80
      },
      {
        title: 'X偏移',
        dataIndex: 'xOffset',
        key: 'xOffset',
        align: 'center',
        width: 80
      },
      {
        title: 'Y偏移',
        dataIndex: 'yOffset',
        key: 'yOffset',
        align: 'center',
        width: 80
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
              onClick: () => editConsumable(record)
            }, '编辑'),
            h('a-divider', { type: 'vertical' }),
            h('a-popconfirm', {
              title: '确认删除',
              onConfirm: () => deleteConsumable(record)
            }, [
              h('a', { style: 'color: #ff4d4f; cursor: pointer;' }, '删除')
            ])
          ])
        }
      }
    ])

    // 剩余体积表格列配置
    const volumeColumns = reactive([
      {
        title: '序号',
        key: 'serial',
        align: 'center',
        width: 80
      },
      {
        title: '耗材编号',
        dataIndex: 'code',
        key: 'code',
        align: 'center',
        width: 120
      },
      {
        title: '耗材名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 120
      },
      {
        title: '最大体积(μl)',
        dataIndex: 'maxVolume',
        key: 'maxVolume',
        align: 'center',
        width: 120
      },
      {
        title: '剩余体积(μl)',
        dataIndex: 'remainingVolume',
        key: 'remainingVolume',
        align: 'left',
        width: 300
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        width: 150,
        dataIndex: 'action'
      }
    ])

    // 计算属性
    const consumableTitle = computed(() => {
      return isConsumable.value ? '切换体积界面' : '切换耗材界面'
    })

    // 状态过滤器
    const statusFilter = (status) => {
      return status === 0 ? '正常' : '停用'
    }

    // 加载数据(调用后端接口)
    const loadData = () => {
      loading.value = true
      const params = {
        ...queryParam,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      exp_consumable_page(params).then(res => {
        if (res && res.data) {
          consumableData.value = res.data.rows || []
          remainingVolumeData.value = (res.data.rows || []).filter(item => item.maxVolume > 0)
          pagination.total = res.data.totalRows || 0
        } else {
          consumableData.value = []
          remainingVolumeData.value = []
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

    const toggleTable = () => {
      isConsumable.value = !isConsumable.value
      isRemainingVolume.value = !isRemainingVolume.value
    }

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

    const onTableChange = (pag) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      loadData()
    }

    const addConsumable = () => {
      Object.assign(attributeData, {
        id: 0,
        code: '',
        name: '',
        rowCount: 1,
        colCount: 1,
        rowSpace: 0.0,
        colSpace: 0.0,
        xSize: 0.0,
        ySize: 0.0,
        xOffset: 0.0,
        yOffset: 0.0,
        maxVolume: 0.0,
        remainingVolume: 0.0,
        status: 0
      })
      addFormVisible.value = true
    }

    const editConsumable = (record) => {
      Object.assign(attributeData, record)
      addFormVisible.value = true
    }

    const deleteConsumable = (record) => {
      // This function will be implemented in a subsequent edit
      // For now, it will just show a message
      message.warning('删除功能待实现')
    }

    const saveRemainingVolume = (record) => {
      // This function will be implemented in a subsequent edit
      // For now, it will just show a message
      message.warning('保存剩余体积功能待实现')
    }

    const handleSubmit = () => {
      formLoading.value = true
      // This function will be implemented in a subsequent edit
      // For now, it will just show a message
      message.warning('新增/编辑功能待实现')
      formLoading.value = false
      addFormVisible.value = false
      loadData()
    }

    const handleCancel = () => {
      addFormVisible.value = false
    }

    // 权限检查日志
    console.log('🔍 权限检查:', {
      edit: hasPerm('exp_consumable:edit'),
      delete: hasPerm('exp_consumable:delete')
    })

    onMounted(() => {
      loadData()
    })

    return {
      queryParam,
      loading,
      addFormVisible,
      formLoading,
      isConsumable,
      isRemainingVolume,
      selectedRow,
      consumableData,
      remainingVolumeData,
      pagination,
      attributeData,
      scaleMarks,
      columns,
      volumeColumns,
      consumableTitle,
      statusFilter,
      refreshTable,
      toggleTable,
      customRow,
      onTableChange,
      addConsumable,
      editConsumable,
      deleteConsumable,
      saveRemainingVolume,
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

// 液体体积显示器样式
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.bottle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
}

.bottle {
  position: relative;
  width: 20px;
  height: 50px;
  background-color: rgba(200, 200, 200, 0.3);
  border: 1px solid #999;
  border-radius: 0 0 5px 5px;
  overflow: hidden;
}

.bottle-neck {
  width: 8px;
  height: 6px;
  background-color: rgba(200, 200, 200, 0.3);
  border-left: 1px solid #999;
  border-right: 1px solid #999;
  margin-top: -1px;
}

.bottle-cap {
  width: 10px;
  height: 3px;
  background-color: #666;
  border-radius: 2px 2px 0 0;
  margin-top: -1px;
}

.liquid {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(19, 179, 207, 0.7);
  transition: height 0.5s ease-in-out;
}

.scale {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
}

.scale-mark {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.3);
}

.scale-value {
  position: absolute;
  left: -30px;
  font-size: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
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
