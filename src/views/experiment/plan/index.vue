<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <a-radio-group v-model:value="viewMode" @change="handleModeChange" style="display: none;">
        <a-radio-button value="week">周视图</a-radio-button>
        <a-radio-button value="month">月视图</a-radio-button>
        <a-radio-button value="year">年视图</a-radio-button>
      </a-radio-group>
      
      <div class="calendar-nav">
        <a-button @click="prev">
          <template #icon><LeftOutlined /></template>
          上一{{ viewMode === 'week' ? '周' : viewMode === 'month' ? '月' : '年' }}
        </a-button>
        <a-button @click="next">
          <template #icon><RightOutlined /></template>
          下一{{ viewMode === 'week' ? '周' : viewMode === 'month' ? '月' : '年' }}
        </a-button>
      </div>      
      <a-button type="primary" @click="showAddEventModal" style="margin-left: 10px;">
        <template #icon><PlusOutlined /></template>
        添加计划任务
      </a-button>
    </div>
    
    <div class="calendar-content">
      <a-calendar 
        v-model:value="currentDate" 
        :mode="viewMode" 
        @panelChange="handlePanelChange"
      >
        <template #dateCellRender="{ current }">
          <div class="calendar-date-cell">
            <div 
              v-for="item in filerData" 
              :key="item.id" 
              v-if="checkSameDay(item.planStartTime, current)"  
              class="event-item" 
              :style="{ backgroundColor: item.color }" 
              @click.stop="showEventDetail(item)"
            >
              {{ item.sampleCode }}
            </div>
          </div>
        </template>
        
        <template #monthCellRender="{ current }">
          <div class="calendar-month-cell">
            <div 
              v-for="item in filerData" 
              :key="item.id" 
              v-if="checkSameMonth(item.planStartTime, current)"  
              class="event-item" 
              :style="{ backgroundColor: item.color }" 
              @click.stop="showEventDetail(item)"
            >
              {{ item.sampleCode }}
            </div>
          </div>
        </template>
      </a-calendar>
    </div> 
    
    <!-- 添加日程弹窗 -->
    <a-modal 
      v-model:open="editForm.visible" 
      :title="editForm.title" 
      width="35%" 
      :maskClosable="false"
    >
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">实验流程：</span>
          <a-select 
            style="width: 230px;color:black;" 
            v-model:value="editForm.record.flowId" 
            @change="flowChange" 
            :disabled="editForm.record.status != 0"
          >
            <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>

          <span class="span-label" style="width:100px;">执行类型：</span>
          <a-select 
            style="width: 230px;color:black;" 
            placeholder="请选择执行类型" 
            v-model:value="editForm.record.executeType" 
            :disabled="editForm.record.status != 0"
          >
            <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">样品编号：</span>
          <a-input 
            style="width: 230px;" 
            v-model:value="editForm.record.sampleCode" 
            :disabled="editForm.record.status != 0"
            placeholder="请输入样品编号"
          />

          <span class="span-label" style="width:100px;">执行时间：</span>
          <a-date-picker 
            v-model:value="editForm.record.planStartTime" 
            style="width: 230px;" 
            show-time  
            :disabled="editForm.record.status != 0"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">流程优先级：</span>
          <a-select 
            style="width: 230px;color:black;" 
            placeholder="请选择流程优先级" 
            v-model:value="editForm.record.priority" 
            :disabled="editForm.record.status != 0"
          >
            <a-select-option v-for="(item, index) in flowPrioritys" :key="index" :value="item.code">
              {{ item.value }}
            </a-select-option>
          </a-select>
          
          <span class="span-label" style="width:100px;">流程类型：</span>
          <a-select 
            style="width: 230px;color:black;" 
            placeholder="请选择流程类型" 
            v-model:value="editForm.record.type"  
            :disabled="true"
          >
            <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">备注：</span>
          <a-input 
            style="width: 560px;" 
            v-model:value="editForm.record.remark" 
            :disabled="editForm.record.status != 0"
            placeholder="请输入备注"
          />
        </div>
      </a-row>

      <template #footer>
        <a-button @click="editForm.visible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmit()" v-if="editForm.record.status === 0">确定</a-button>
        <a-popconfirm placement="topRight" title="确认删除当前计划任务？" @confirm="handleDelete">
          <a-button type="danger" v-if="editForm.record.status === 0 && editForm.isAdd === false">删除</a-button>
        </a-popconfirm>          
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons-vue'
import moment from 'moment'
import { 
  exp_flow_case_getPlanList,
  exp_flow_case_addPlan,
  exp_flow_case_editPlan,
  exp_flow_case_deletePlan
} from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

// 响应式数据
const viewMode = ref('month')
const currentDate = ref(moment())
const filerData = ref([])
const flowData = ref([])
const flowTypes = ref([])
const executeTypes = ref([])
const flowPrioritys = ref([])

const eventColors = [
  '#1890ff', '#52c41a', '#fa8c16', '#722ed1', 
  '#facc33', '#eeccff', '#aa66bb', '#8aaff'
]

const editForm = reactive({
  title: '编辑',
  isAdd: true,
  visible: false,
  canEdit: false,
  record: {
    id: 0,
    flowId: 0,
    code: '',
    name: '',
    sampleCode: '',
    status: 0,
    type: 1,
    executeType: 1,
    priority: 1,
    remark: '',
    planStartTime: null,
    attributes: []
  },
  errors: {
    code: false,
    name: false,
    sampleCode: false
  }
})

// 生命周期
onMounted(() => {
  getFilterData()
  sysDictTypeDropDownFunc()
  getFlowData()
})

// 方法
function handleModeChange(mode) {
  viewMode.value = mode
}

function prev() {
  const newDate = moment(currentDate.value)
  if (viewMode.value === 'week') {
    newDate.subtract(1, 'week')
  } else if (viewMode.value === 'month') {
    newDate.subtract(1, 'month')
  } else {
    newDate.subtract(1, 'year')
  }
  currentDate.value = newDate
}

function next() {
  const newDate = moment(currentDate.value)
  if (viewMode.value === 'week') {
    newDate.add(1, 'week')
  } else if (viewMode.value === 'month') {
    newDate.add(1, 'month')
  } else {
    newDate.add(1, 'year')
  }
  currentDate.value = newDate
}

function handlePanelChange(value, mode) {
  currentDate.value = value
  viewMode.value = mode
}

function showAddEventModal() {
  editForm.title = '添加计划任务'
  editForm.isAdd = true
  editForm.visible = true
  resetAttribute()
}

function showEventDetail(item) {
  editForm.title = '编辑计划任务'
  editForm.isAdd = false
  editForm.visible = true
  editForm.record = { ...item }
  if (item.planStartTime) {
    editForm.record.planStartTime = moment(item.planStartTime)
  }
}

function resetAttribute() {
  editForm.record = {
    id: 0,
    flowId: 0,
    code: '',
    name: '',
    sampleCode: '',
    status: 0,
    type: 1,
    executeType: 1,
    priority: 1,
    remark: '',
    planStartTime: null,
    attributes: []
  }
  editForm.errors = {
    code: false,
    name: false,
    sampleCode: false
  }
}

function checkSameDay(date1, date2) {
  if (!date1 || !date2) return false
  return moment(date1).isSame(moment(date2), 'day')
}

function checkSameWeek(date1, date2) {
  if (!date1 || !date2) return false
  return moment(date1).isSame(moment(date2), 'week')
}

function checkSameMonth(date1, date2) {
  if (!date1 || !date2) return false
  return moment(date1).isSame(moment(date2), 'month')
}

function getFilterData() {
  exp_flow_case_getPlanList({}).then((res) => {
    if (res.success) {
      filerData.value = res.data.map((item, index) => ({
        ...item,
        color: eventColors[index % eventColors.length]
      }))
    } else {
      message.error('数据加载失败')
    }
  })
}

function getFlowData() {
  exp_flow_list({}).then((res) => {
    if (res.success) {
      flowData.value = res.data
    } else {
      message.error('流程数据加载失败')
    }
  })
}

function sysDictTypeDropDownFunc() {
  // 流程类型
  sysDictTypeDropDown({ code: 'flow_type' }).then((res) => {
    flowTypes.value = res.data
    flowTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  // 执行类型
  sysDictTypeDropDown({ code: 'flow_execute_type' }).then((res) => {
    executeTypes.value = res.data
    executeTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  // 优先级
  sysDictTypeDropDown({ code: 'flow_priority' }).then((res) => {
    flowPrioritys.value = res.data
    flowPrioritys.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })
}

function flowChange(value) {
  const flow = flowData.value.find(item => item.id === value)
  if (flow) {
    editForm.record.code = flow.code
    editForm.record.name = flow.name
    editForm.record.type = flow.type
  }
}

function handleSubmit() {
  if (!editForm.record.sampleCode) {
    message.error('请输入样品编号')
    return
  }
  if (!editForm.record.flowId) {
    message.error('请选择实验流程')
    return
  }
  if (!editForm.record.planStartTime) {
    message.error('请选择执行时间')
    return
  }

  const submitData = {
    ...editForm.record,
    planStartTime: editForm.record.planStartTime ? moment(editForm.record.planStartTime).format('YYYY-MM-DD HH:mm:ss') : null
  }

  const apiCall = editForm.isAdd ? exp_flow_case_addPlan : exp_flow_case_editPlan
  
  apiCall(submitData).then((res) => {
    if (res.success) {
      message.success(editForm.isAdd ? '添加成功' : '编辑成功')
      editForm.visible = false
      getFilterData()
      resetAttribute()
    } else {
      message.error(res.message)
    }
  })
}

function handleDelete() {
  exp_flow_case_deletePlan({ id: editForm.record.id }).then((res) => {
    if (res.success) {
      message.success('删除成功')
      editForm.visible = false
      getFilterData()
      resetAttribute()
    } else {
      message.error(res.message)
    }
  })
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.calendar-date-cell {
  min-height: 40px;
  padding: 2px;
}

.calendar-month-cell {
  min-height: 60px;
  padding: 4px;
}

.event-item {
  background: #1890ff;
  color: white;
  padding: 2px 6px;
  margin: 1px 0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-item:hover {
  opacity: 0.8;
}

.span-label {
  display: inline-block;
  text-align: right;
  margin-right: 10px;
  font-weight: 500;
}

.ant-row {
  margin-bottom: 10px;
}

.ant-modal-footer {
  text-align: right;
}
</style>
