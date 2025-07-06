<template>
  <div class="gantt-container">
    <a-card title="实验跟踪" style="margin-bottom: 16px;">
      <div class="search-form">
        <a-form layout="inline">
          <a-form-item label="案例编号">
            <a-input v-model:value="queryParam.code" placeholder="请输入案例编号" />
          </a-form-item>
          <a-form-item label="案例名称">
            <a-input v-model:value="queryParam.name" placeholder="请输入案例名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <a-card :bordered="false">
      <a-row :gutter="16" style="height: 70vh;">
        <!-- 任务列表 -->
        <a-col :span="isCollapsed ? 0 : 8">
          <div class="task-list" style="height: 100%; overflow-y: auto;">
            <h4>实验任务列表</h4>
            <a-table
              :data-source="taskData"
              :columns="taskColumns"
              :pagination="false"
              :loading="loading"
              size="small"
              :scroll="{ y: 'calc(100vh - 300px)' }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'progress'">
                  <a-progress :percent="record.progress" size="small" />
                </template>
              </template>
            </a-table>
          </div>
        </a-col>
        
        <!-- 分隔线 -->
        <div class="separator" @click="toggleCollapse">
          <span v-if="isCollapsed">▶</span>
          <span v-else>◀</span>
        </div>

        <!-- 甘特图区域 -->
        <a-col :span="isCollapsed ? 24 : 16">
          <div class="gantt-chart" style="height: 100%; overflow: auto;">
            <h4>甘特图视图</h4>
            <div class="chart-container">
              <!-- 时间轴 -->
              <div class="time-axis">
                <div 
                  v-for="(day, index) in timeRange" 
                  :key="index" 
                  class="time-cell"
                  :style="{ width: cellWidth + 'px' }"
                >
                  {{ formatDate(day) }}
                </div>
              </div>
              
              <!-- 任务条 -->
              <div class="task-rows">
                <div 
                  v-for="task in taskData" 
                  :key="task.id" 
                  class="task-row"
                  :style="{ height: '40px' }"
                >
                  <div 
                    class="task-bar"
                    :style="getTaskBarStyle(task)"
                  >
                    <div class="task-progress" :style="getProgressStyle(task)"></div>
                    <span class="task-text">{{ task.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'ExpGanttView',
  data() {
    return {
      loading: false,
      isCollapsed: false,
      queryParam: {
        code: '',
        name: ''
      },
      taskColumns: [
        {
          title: '任务名称',
          dataIndex: 'name',
          key: 'name',
          width: 150
        },
        {
          title: '状态',
          key: 'status',
          width: 80,
          align: 'center'
        },
        {
          title: '进度',
          key: 'progress',
          width: 100,
          align: 'center'
        }
      ],
      taskData: [
        {
          id: 1,
          name: '实验案例1',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
          status: 1,
          progress: 60
        },
        {
          id: 2,
          name: '实验案例2',
          startDate: '2024-01-05',
          endDate: '2024-01-15',
          status: 0,
          progress: 30
        },
        {
          id: 3,
          name: '实验案例3',
          startDate: '2024-01-08',
          endDate: '2024-01-20',
          status: 2,
          progress: 100
        }
      ],
      cellWidth: 80, // 每个时间单元格的宽度
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    }
  },
  computed: {
    timeRange() {
      const days = []
      const current = new Date(this.startDate)
      while (current <= this.endDate) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      return days
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        // 这里应该调用真实的API获取甘特图数据
        // const response = await exp_gantt_data(this.queryParam)
        
        // 模拟数据加载
        setTimeout(() => {
          console.log('实验跟踪 - 数据加载完成')
          this.loading = false
        }, 1000)
        
      } catch (error) {
        console.error('实验跟踪 - 数据加载失败:', error)
        message.error('数据加载失败: ' + error.message)
        this.loading = false
      }
    },

    handleQuery() {
      this.loadData()
    },

    handleReset() {
      this.queryParam = {
        code: '',
        name: ''
      }
      this.loadData()
    },

    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },

    getStatusColor(status) {
      const colorMap = {
        0: 'blue',    // 待执行
        1: 'orange',  // 执行中
        2: 'green',   // 已完成
        3: 'red'      // 已取消
      }
      return colorMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        0: '待执行',
        1: '执行中',
        2: '已完成',
        3: '已取消'
      }
      return textMap[status] || '未知'
    },

    formatDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}`
    },

    getTaskBarStyle(task) {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      const totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))
      const startDays = Math.ceil((taskStart - this.startDate) / (1000 * 60 * 60 * 24))
      const duration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1
      
      const left = (startDays / totalDays) * 100
      const width = (duration / totalDays) * 100
      
      return {
        position: 'absolute',
        left: `${left}%`,
        width: `${width}%`,
        height: '30px',
        backgroundColor: '#1890ff',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        margin: '5px 0'
      }
    },

    getProgressStyle(task) {
      return {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${task.progress}%`,
        backgroundColor: '#52c41a',
        borderRadius: '4px',
        opacity: 0.8
      }
    }
  }
})
</script>

<style scoped>
.gantt-container {
  height: 100%;
}

.search-form {
  margin-bottom: 16px;
}

.separator {
  width: 20px;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  user-select: none;
}

.separator:hover {
  background-color: #e6f7ff;
}

.chart-container {
  position: relative;
  min-width: 800px;
}

.time-axis {
  display: flex;
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;
  height: 40px;
}

.time-cell {
  border-right: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.task-rows {
  position: relative;
}

.task-row {
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.task-bar {
  position: relative;
  overflow: hidden;
}

.task-progress {
  z-index: 1;
}

.task-text {
  position: relative;
  z-index: 2;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-list h4,
.gantt-chart h4 {
  margin-bottom: 16px;
  color: #1890ff;
}
</style>
