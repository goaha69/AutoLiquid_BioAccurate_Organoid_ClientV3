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
      <div class="calendar-wrapper">
        <div class="calendar-month-header">
          <h2>{{ currentDate.format('YYYY年MM月') }}</h2>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div class="weekday">日</div>
            <div class="weekday">一</div>
            <div class="weekday">二</div>
            <div class="weekday">三</div>
            <div class="weekday">四</div>
            <div class="weekday">五</div>
            <div class="weekday">六</div>
          </div>
          
          <div class="calendar-days">
            <div 
              v-for="day in calendarDays" 
              :key="day.date" 
              class="calendar-day"
              :class="{
                'today': day.isToday,
                'other-month': !day.isCurrentMonth,
                'selected': day.isSelected
              }"
              @click="selectDate(day)"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-events">
                <div 
                  v-for="event in day.events" 
                  :key="event.id"
                  class="event-item"
                  :style="{ backgroundColor: event.color }"
                  @click.stop="showEventDetail(event)"
                >
                  {{ event.sampleCode }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 统计信息区域 -->
      <div class="calendar-statistics">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card size="small">
              <a-statistic title="本月计划任务" :value="monthlyTaskCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic title="已完成任务" :value="completedTaskCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic title="进行中任务" :value="inProgressTaskCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic title="待执行任务" :value="pendingTaskCount" />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
    
    <!-- 添加/编辑日程弹窗 -->
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
          <sp-input 
            label="样品编号" 
            :required="true" 
            :isError="editForm.errors.sampleCode" 
            :labelWidth="90" 
            :inputWidth="230" 
            :rightEmpty="true" 
            v-model:value="editForm.record.sampleCode" 
            :disabled="editForm.record.status != 0"
          />

          <span class="span-label" style="width:100px;">执行时间：</span>
          <a-date-picker 
            v-model:value="editForm.record.planStartTime" 
            style="width: 230px;" 
            showTime  
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
          <sp-input 
            label="备注" 
            :labelWidth="90" 
            :inputWidth="560" 
            :rightEmpty="true" 
            v-model:value="editForm.record.remark" 
            :disabled="editForm.record.status != 0"
          />
        </div>
      </a-row>

      <template #footer>
        <a-button @click="editForm.visible = false">取消</a-button>
        <a-button type="primary" @click="handleSubmit()" v-if="editForm.record.status === 0">
          确定
        </a-button>
        <a-popconfirm 
          placement="topRight" 
          title="确认删除当前计划任务？" 
          @confirm="handleDelete"
        >
          <a-button type="danger" v-if="editForm.record.status === 0 && editForm.isAdd === false">
            删除
          </a-button>
        </a-popconfirm>          
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { 
  exp_flow_case_getPlanList,
  exp_flow_case_addPlan,
  exp_flow_case_editPlan,
  exp_flow_case_deletePlan
} from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInput from '@/components/spInput.vue'
import moment from 'moment'

const viewMode = ref('month') // 默认月视图
const currentDate = ref(moment()) // 当前选中的日期
const eventColors = ['#1890ff','#52c41a','#fa8c16','#722ed1','#facc33','#eeccff','#aa66bb','#88aaff']
const cultivateFlows = ref([])
const filerData = ref([])
const flowData = ref([])
const flowTypes = ref([])
const executeTypes = ref([])
const flowPrioritys = ref([])

// 计算统计数据
const monthlyTaskCount = computed(() => {
  return filerData.value.filter(item => 
    moment(item.planStartTime).isSame(currentDate.value, 'month')
  ).length
})

const completedTaskCount = computed(() => {
  return filerData.value.filter(item => 
    moment(item.planStartTime).isSame(currentDate.value, 'month') && item.status === 2
  ).length
})

const inProgressTaskCount = computed(() => {
  return filerData.value.filter(item => 
    moment(item.planStartTime).isSame(currentDate.value, 'month') && item.status === 1
  ).length
})

const pendingTaskCount = computed(() => {
  return filerData.value.filter(item => 
    moment(item.planStartTime).isSame(currentDate.value, 'month') && item.status === 0
  ).length
})

// 生成日历天数数据
const calendarDays = computed(() => {
  const days = []
  const startOfMonth = currentDate.value.clone().startOf('month')
  const endOfMonth = currentDate.value.clone().endOf('month')
  const startOfCalendar = startOfMonth.clone().startOf('week')
  const endOfCalendar = endOfMonth.clone().endOf('week')
  
  const current = startOfCalendar.clone()
  
  while (current.isSameOrBefore(endOfCalendar)) {
    const dayEvents = filerData.value.filter(event => 
      moment(event.planStartTime).isSame(current, 'day')
    )
    
    days.push({
      date: current.format('YYYY-MM-DD'),
      day: current.date(),
      isToday: current.isSame(moment(), 'day'),
      isCurrentMonth: current.isSame(currentDate.value, 'month'),
      isSelected: false,
      events: dayEvents
    })
    
    current.add(1, 'day')
  }
  
  return days
})

const selectDate = (day) => {
  // 可以在这里添加日期选择逻辑
  console.log('选择日期:', day.date)
}

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

onMounted(() => {
  // 添加一些测试数据确保日历显示
  filerData.value = [
    {
      id: 1,
      planStartTime: moment(),
      sampleCode: '测试任务1',
      color: '#1890ff',
      status: 0,
      type: 1,
      flowId: 1
    },
    {
      id: 2,
      planStartTime: moment().add(1, 'day'),
      sampleCode: '测试任务2',
      color: '#52c41a',
      status: 1,
      type: 2,
      flowId: 2
    }
  ]
  
  getFilterData()
  sysDictTypeDropDown_load()
  getFlowData()
})

const handleDelete = () => {
  console.log('=================handleDelete=================')
  exp_flow_case_deletePlan({ id: editForm.record.id }).then((res) => {
    if (res.success) {
      message.success('删除成功')
      editForm.visible = false
      getFilterData()
      resetAttribute()
    } else {
      message.error(res.message)
    }
  }).catch(err => {
    message.error('删除失败：' + err.message)
  })
}

const handleSubmit = () => {
  console.log('=================handleSubmit=================')

  if (editForm.record.sampleCode === '') {
    message.error('请先填写样品编号!')
    return
  }
  if (!editForm.record.planStartTime) {
    message.error('请先填写执行时间!')
    return
  }

  const submitData = {
    ...editForm.record,
    planStartTime: moment(editForm.record.planStartTime).format('YYYY-MM-DD HH:mm:ss')
  }

  console.log('提交数据:', submitData)

  if (editForm.record.id == 0) {
    exp_flow_case_addPlan(submitData).then((res) => {
      if (res.success) {
        message.success('新增成功')
        editForm.visible = false
        getFilterData()
        resetAttribute()
      } else {
        message.error(res.message)
      }
    }).catch(err => {
      message.error('新增失败：' + err.message)
    })
  } else {
    exp_flow_case_editPlan(submitData).then((res) => {
      if (res.success) {
        message.success('编辑成功')
        editForm.visible = false
        getFilterData()
      } else {
        message.error(res.message)
      }
    }).catch(err => {
      message.error('编辑失败：' + err.message)
    })
  }
}

const resetAttribute = () => {
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
}

const flowChange = (id) => {
  if (editForm.isAdd) {
    const flow = flowData.value.find(item => item.id == id)
    if (flow) {
      const key = Date.now()
      editForm.record.code = flow.code + '_' + key
      editForm.record.name = flow.name + '_' + key
      editForm.record.sampleCode = key.toString()
      editForm.record.type = flow.type
      editForm.record.executeType = flow.executeType
      editForm.record.priority = flow.priority
    }
  }
}

const getFlowData = () => {
  const data = {}
  exp_flow_list(data).then((res) => {
    if (res.success) {
      flowData.value = res.data  
      console.log('===>>>getFlowData')
      const datas = flowData.value.filter(item => item.type === 3)
      console.log(datas)
      datas.forEach(item => {
        if (cultivateFlows.value.length == 0) {
          cultivateFlows.value.push({ id: item.id, color: eventColors[4] })
        } else if (!cultivateFlows.value.find(cf => cf.id === item.id)) {
          cultivateFlows.value.push({ 
            id: item.id, 
            color: eventColors[4 + cultivateFlows.value.length] 
          })
        }
      })
      console.log(cultivateFlows.value)
    } else {
      message.error('数据加载失败')
    }
  }).catch(err => {
    message.error('加载流程数据失败：' + err.message)
  })
}

const sysDictTypeDropDown_load = () => {
  sysDictTypeDropDown({ code: 'flow_type' }).then((res) => {
    flowTypes.value = res.data
    flowTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  }).catch(err => {
    message.error('加载流程类型失败：' + err.message)
  })

  sysDictTypeDropDown({ code: 'flow_execute_type' }).then((res) => {
    executeTypes.value = res.data
    executeTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })          
  }).catch(err => {
    message.error('加载执行类型失败：' + err.message)
  })

  sysDictTypeDropDown({ code: 'flow_priority' }).then((res) => {
    flowPrioritys.value = res.data
    flowPrioritys.value.forEach((item) => {
      item.code = parseInt(item.code)
    })          
  }).catch(err => {
    message.error('加载流程优先级失败：' + err.message)
  })
}

const checkSameDay = (date1, date2) => {
  return moment(date1).isSame(date2, 'day')
}

const checkSameMonth = (date1, date2) => {
  return moment(date1).isSame(date2, 'month')
}

const checkSameWeek = (date1, date2) => {
  return moment(date1).isSame(date2, 'week')
}

// 获取指定日期的日程
const getFilterData = () => {
  const data = {}
  if (viewMode.value === 'year') {
    data.date = currentDate.value.year()
    data.dateType = 1
  } else if (viewMode.value === 'month') {
    data.date = currentDate.value.month() + 1
    data.dateType = 2
  } else {
    data.dateType = 3      
  }

  console.log('正在加载数据，参数:', data)
  
  exp_flow_case_getPlanList(data).then((res) => {
    if (res.success && res.data != null) {
      filerData.value = res.data
      filerData.value.forEach(item => {
        item.planStartTime = moment(item.planStartTime)
        if (item.type < 3) {
          item.color = eventColors[item.type - 1]
        } else if (item.type > 3) {
          item.color = eventColors[item.type - 2]
        } else {
          const cf = cultivateFlows.value.find(it => it.id == item.flowId)
          if (cf) {
            item.color = cf.color
          }
        }
      })
      console.log('加载数据成功:', filerData.value)
    } else {
      console.log('API返回无数据或失败')
    }
  }).catch((err) => {
    console.error('加载数据失败:', err)
    message.error('异常：' + err.message)
  })
}

// 处理视图模式切换
const handleModeChange = (e) => {
  viewMode.value = e.target.value
  getFilterData()
}

// 处理日历面板变化
const handlePanelChange = (value, mode) => {
  currentDate.value = value
  if (mode) {
    viewMode.value = mode
  }
  getFilterData()
}

// 上一视图
const prev = () => {
  if (viewMode.value === 'week') {
    currentDate.value = currentDate.value.clone().subtract(1, 'week')
  } else if (viewMode.value === 'month') {
    currentDate.value = currentDate.value.clone().subtract(1, 'month')
  } else if (viewMode.value === 'year') {
    currentDate.value = currentDate.value.clone().subtract(1, 'year')
  }
  getFilterData()
}

// 下一视图
const next = () => {
  if (viewMode.value === 'week') {
    currentDate.value = currentDate.value.clone().add(1, 'week')
  } else if (viewMode.value === 'month') {
    currentDate.value = currentDate.value.clone().add(1, 'month')
  } else if (viewMode.value === 'year') {
    currentDate.value = currentDate.value.clone().add(1, 'year')
  }
  getFilterData()
}

// 显示添加日程弹窗
const showAddEventModal = () => {
  editForm.isAdd = true
  editForm.visible = true
  editForm.title = "添加计划任务"
  resetAttribute()

  if (flowData.value.length > 0) {
    const flow = flowData.value[0]
    if (flow) {
      const key = Date.now()
      editForm.record.flowId = flowData.value[0].id
      editForm.record.code = flow.code + '_' + key
      editForm.record.name = flow.name + '_' + key
      editForm.record.sampleCode = key.toString()
      editForm.record.type = flow.type
      editForm.record.executeType = flow.executeType
      editForm.record.priority = flow.priority
    }
  }
}

// 显示日程详情
const showEventDetail = (item) => {
  editForm.visible = true
  editForm.isAdd = false
  editForm.title = "查看计划任务"
  editForm.record = { ...item }
  editForm.record.planStartTime = moment(item.planStartTime)
}
</script>

<style scoped>
.calendar-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-header {
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.calendar-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-month-header {
  text-align: center;
  margin-bottom: 20px;
}

.calendar-month-header h2 {
  margin: 0;
  color: #262626;
  font-size: 24px;
}

.calendar-grid {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #f0f0f0;
  margin-bottom: 1px;
}

.weekday {
  background: #fafafa;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #595959;
  border: 1px solid #f0f0f0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #f0f0f0;
}

.calendar-day {
  background: #fff;
  min-height: 120px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f5f5f5;
}

.calendar-day.today {
  background-color: #e6f7ff;
}

.calendar-day.today .day-number {
  color: #1890ff;
  font-weight: bold;
}

.calendar-day.other-month {
  background-color: #fafafa;
  color: #bfbfbf;
}

.calendar-day.selected {
  background-color: #bae7ff;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  padding: 2px 6px;
  border-radius: 3px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  line-height: 16px;
}

.event-item:hover {
  opacity: 0.8;
}

.span-label {
  width: 100px;
  height: 25px;
  padding: 5px;
  text-align: right;
  display: inline-block;
  color: black;
  clear: both;
}

.calendar-statistics {
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.calendar-statistics :deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}

.calendar-statistics :deep(.ant-statistic-content) {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
}
</style>
