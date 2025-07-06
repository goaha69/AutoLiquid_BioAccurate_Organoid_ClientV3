<template>
  <div style="padding: 20px;">
    <h2>计划任务</h2>
    
    <!-- 搜索区域 -->
    <a-card title="搜索条件" style="margin-bottom: 16px;">
      <a-form layout="inline">
        <a-form-item label="样品编号">
          <a-input v-model:value="queryParam.sampleCode" placeholder="请输入样品编号" allow-clear />
        </a-form-item>
        <a-form-item label="执行状态">
          <a-select v-model:value="queryParam.status" placeholder="请选择执行状态" allow-clear style="width: 150px;">
            <a-select-option value="0">待执行</a-select-option>
            <a-select-option value="1">执行中</a-select-option>
            <a-select-option value="2">已完成</a-select-option>
            <a-select-option value="3">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 日历视图切换 -->
    <a-card title="计划日历" style="margin-bottom: 16px;">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <a-radio-group v-model:value="viewMode" @change="handleViewModeChange">
          <a-radio-button value="month">月视图</a-radio-button>
          <a-radio-button value="year">年视图</a-radio-button>
        </a-radio-group>
        
        <a-button type="primary" @click="showAddModal" v-if="hasPerm('exp_plan:add')">
          <template #icon><plus-outlined /></template>
          新增计划任务
        </a-button>
      </div>
      
      <!-- 日历组件 -->
      <a-calendar 
        v-model:value="selectedDate" 
        :mode="viewMode"
        @select="onDateSelect"
        @panelChange="onPanelChange"
      >
        <template #dateCellRender="{ current }">
          <div class="calendar-cell">
            <div 
              v-for="plan in getPlansForDate(current)" 
              :key="plan.id"
              class="plan-item"
              :class="getStatusClass(plan.status)"
              @click="showPlanDetail(plan)"
            >
              {{ plan.sampleCode }}
            </div>
          </div>
        </template>
        
        <template #monthCellRender="{ current }">
          <div class="calendar-month-cell">
            <div 
              v-for="plan in getPlansForMonth(current)" 
              :key="plan.id"
              class="plan-item-small"
              :class="getStatusClass(plan.status)"
              @click="showPlanDetail(plan)"
            >
              {{ plan.sampleCode }}
            </div>
          </div>
        </template>
      </a-calendar>
    </a-card>

    <!-- 任务列表 -->
    <a-card title="任务列表">
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
        rowKey="id"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pageNum - 1) * pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'planStartTime'">
            {{ formatDateTime(record.planStartTime) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="editRecord(record)" v-if="hasPerm('exp_plan:edit') && record.status === 0">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_plan:edit') && hasPerm('exp_plan:delete') && record.status === 0" />
            <a-popconfirm title="确认删除？" @confirm="deleteRecord(record)" v-if="hasPerm('exp_plan:delete') && record.status === 0">
              <a style="color: red;">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleOk"
      @cancel="handleCancel"
      width="800px"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="样品编号" required>
              <a-input v-model:value="formData.sampleCode" placeholder="请输入样品编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="实验流程" required>
              <a-select v-model:value="formData.flowId" placeholder="请选择实验流程" style="width: 100%;">
                <a-select-option v-for="flow in flowList" :key="flow.id" :value="flow.id">
                  {{ flow.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计划开始时间" required>
              <a-date-picker
                v-model:value="formData.planStartTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择计划开始时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="执行类型" required>
              <a-select v-model:value="formData.executeType" placeholder="请选择执行类型" style="width: 100%;">
                <a-select-option value="auto">自动执行</a-select-option>
                <a-select-option value="manual">手动执行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="优先级">
              <a-select v-model:value="formData.priority" placeholder="请选择优先级" style="width: 100%;">
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="流程类型">
              <a-select v-model:value="formData.type" placeholder="请选择流程类型" style="width: 100%;">
                <a-select-option value="normal">普通流程</a-select-option>
                <a-select-option value="urgent">紧急流程</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 任务详情模态框 -->
    <a-modal
      v-model:open="detailVisible"
      title="任务详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="2" v-if="selectedPlan">
        <a-descriptions-item label="样品编号">{{ selectedPlan.sampleCode }}</a-descriptions-item>
        <a-descriptions-item label="实验流程">{{ selectedPlan.flowName }}</a-descriptions-item>
        <a-descriptions-item label="计划开始时间">{{ formatDateTime(selectedPlan.planStartTime) }}</a-descriptions-item>
        <a-descriptions-item label="执行类型">{{ selectedPlan.executeType === 'auto' ? '自动执行' : '手动执行' }}</a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(selectedPlan.priority)">
            {{ getPriorityText(selectedPlan.priority) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(selectedPlan.status)">
            {{ getStatusText(selectedPlan.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedPlan.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { exp_flow_case_getPlanList, exp_flow_case_addPlan, exp_flow_case_editPlan, exp_flow_case_deletePlan } from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { hasPerm } from '@/utils/permissions'
import dayjs from 'dayjs'

export default {
  name: 'PlanManagement',
  components: {
    PlusOutlined
  },
  data() {
    return {
      loading: false,
      viewMode: 'month',
      selectedDate: dayjs(),
      queryParam: {
        sampleCode: '',
        status: undefined
      },
      dataSource: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      columns: [
        {
          title: '序号',
          key: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '样品编号',
          dataIndex: 'sampleCode',
          key: 'sampleCode',
          align: 'center'
        },
        {
          title: '实验流程',
          dataIndex: 'flowName',
          key: 'flowName',
          align: 'center'
        },
        {
          title: '计划开始时间',
          key: 'planStartTime',
          align: 'center'
        },
        {
          title: '执行类型',
          dataIndex: 'executeType',
          key: 'executeType',
          align: 'center'
        },
        {
          title: '优先级',
          key: 'priority',
          align: 'center'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center'
        }
      ],
      modalVisible: false,
      modalTitle: '新增计划任务',
      isEdit: false,
      formData: {
        id: null,
        sampleCode: '',
        flowId: null,
        planStartTime: null,
        executeType: 'auto',
        priority: 'medium',
        type: 'normal',
        remark: ''
      },
      detailVisible: false,
      selectedPlan: null,
      flowList: []
    }
  },
  mounted() {
    // 根据权限动态添加操作列
    if (this.hasPerm('exp_plan:edit') || this.hasPerm('exp_plan:delete')) {
      const hasActionColumn = this.columns.some(col => col.key === 'action')
      if (!hasActionColumn) {
        this.columns.push({
          title: '操作',
          key: 'action',
          align: 'center',
          width: 120
        })
      }
    }
    this.loadData()
    this.loadFlowList()
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        const params = {
          ...this.queryParam,
          page: this.pageNum,
          pageSize: this.pageSize
        }
        console.log('计划任务 - 请求参数:', params)
        
        const response = await exp_flow_case_getPlanList(params)
        console.log('计划任务 - API响应:', response)
        
        if (response && response.data) {
          this.dataSource = response.data.rows || response.data.records || response.data.data || []
          this.total = response.data.totalRows || response.data.totalCount || response.data.total || 0
          
          console.log('计划任务 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total
          })
          
          if (this.dataSource.length === 0) {
            console.log('计划任务 - 没有找到数据')
            this.$message.info('暂无计划任务数据')
          } else {
            console.log('计划任务 - 成功加载数据，共', this.dataSource.length, '条记录')
          }
        } else {
          console.warn('计划任务 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
        }
      } catch (error) {
        console.error('计划任务 - 数据加载失败:', error)
        this.$message.error('数据加载失败: ' + (error.response?.data?.message || error.message || error))
        this.dataSource = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async loadFlowList() {
      try {
        const response = await exp_flow_list()
        if (response && response.data) {
          this.flowList = response.data.rows || response.data.records || response.data || []
          console.log('计划任务 - 流程列表加载成功:', this.flowList)
        }
      } catch (error) {
        console.error('计划任务 - 流程列表加载失败:', error)
        this.flowList = []
      }
    },
    
    handleQuery() {
      this.pageNum = 1
      this.loadData()
    },
    
    handleReset() {
      this.queryParam = {
        sampleCode: '',
        status: undefined
      }
      this.pageNum = 1
      this.loadData()
    },
    
    handleTableChange(pagination) {
      this.pageNum = pagination.current
      this.pageSize = pagination.pageSize
      this.loadData()
    },

    handleViewModeChange() {
      console.log('视图模式切换到:', this.viewMode)
    },

    onDateSelect(date) {
      console.log('选择日期:', date.format('YYYY-MM-DD'))
      this.selectedDate = date
    },

    onPanelChange(date, mode) {
      console.log('面板切换:', date.format('YYYY-MM'), mode)
    },

    getPlansForDate(date) {
      return this.dataSource.filter(plan => {
        if (!plan.planStartTime) return false
        const planDate = dayjs(plan.planStartTime)
        return planDate.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      })
    },

    getPlansForMonth(date) {
      return this.dataSource.filter(plan => {
        if (!plan.planStartTime) return false
        const planDate = dayjs(plan.planStartTime)
        return planDate.format('YYYY-MM') === date.format('YYYY-MM')
      })
    },

    showPlanDetail(plan) {
      this.selectedPlan = plan
      this.detailVisible = true
    },
    
    showAddModal() {
      this.modalTitle = '新增计划任务'
      this.isEdit = false
      this.resetForm()
      this.modalVisible = true
    },
    
    editRecord(record) {
      this.modalTitle = '编辑计划任务'
      this.isEdit = true
      this.formData = {
        ...record,
        planStartTime: record.planStartTime ? dayjs(record.planStartTime) : null
      }
      this.modalVisible = true
    },
    
    async deleteRecord(record) {
      try {
        const response = await exp_flow_case_deletePlan(record)
        console.log('计划任务 - 删除响应:', response)
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error('删除失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('计划任务 - 删除失败:', error)
        this.$message.error('删除失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    async handleOk() {
      try {
        // 转换时间格式
        const submitData = {
          ...this.formData,
          planStartTime: this.formData.planStartTime ? this.formData.planStartTime.format('YYYY-MM-DD HH:mm:ss') : null
        }
        
        let response
        if (this.isEdit) {
          response = await exp_flow_case_editPlan(submitData)
          console.log('计划任务 - 编辑响应:', response)
        } else {
          response = await exp_flow_case_addPlan(submitData)
          console.log('计划任务 - 新增响应:', response)
        }
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success(this.isEdit ? '更新成功' : '新增成功')
          this.modalVisible = false
          this.loadData()
        } else {
          this.$message.error('保存失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('计划任务 - 保存失败:', error)
        this.$message.error('保存失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    handleCancel() {
      this.modalVisible = false
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        id: null,
        sampleCode: '',
        flowId: null,
        planStartTime: null,
        executeType: 'auto',
        priority: 'medium',
        type: 'normal',
        remark: ''
      }
    },

    getStatusClass(status) {
      const classMap = {
        0: 'plan-pending',
        1: 'plan-running',
        2: 'plan-completed',
        3: 'plan-cancelled'
      }
      return classMap[status] || 'plan-pending'
    },

    getStatusColor(status) {
      const colorMap = {
        0: 'blue',
        1: 'orange',
        2: 'green',
        3: 'red'
      }
      return colorMap[status] || 'blue'
    },

    getStatusText(status) {
      const textMap = {
        0: '待执行',
        1: '执行中',
        2: '已完成',
        3: '已取消'
      }
      return textMap[status] || '待执行'
    },

    getPriorityColor(priority) {
      const colorMap = {
        'high': 'red',
        'medium': 'orange',
        'low': 'green'
      }
      return colorMap[priority] || 'orange'
    },

    getPriorityText(priority) {
      const textMap = {
        'high': '高',
        'medium': '中',
        'low': '低'
      }
      return textMap[priority] || '中'
    },

    formatDateTime(dateTime) {
      return dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') : ''
    },

    // 权限检查方法
    hasPerm(permission) {
      return hasPerm(permission)
    }
  }
}
</script>

<style scoped>
.calendar-cell {
  min-height: 50px;
}

.plan-item {
  background: #1890ff;
  color: white;
  padding: 2px 6px;
  margin: 1px 0;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-item-small {
  background: #1890ff;
  color: white;
  padding: 1px 4px;
  margin: 1px;
  border-radius: 2px;
  font-size: 10px;
  cursor: pointer;
  display: inline-block;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-pending {
  background: #1890ff !important;
}

.plan-running {
  background: #fa8c16 !important;
}

.plan-completed {
  background: #52c41a !important;
}

.plan-cancelled {
  background: #f5222d !important;
}

.ant-card {
  margin-bottom: 16px;
}
</style>
