<template>
  <div id="app">
    <a-row style="height: 100vh; display: flex;">
      <a-col :span="isCollapsed ? 0 : 6" style="overflow: auto;">
        <a-table
          :data-source="taskData"
          :columns="columns"
          rowKey="id"
          :pagination="false"
          :row-class-name="rowClassName"
          :defaultExpandAllRows="true"
        >
        </a-table>
      </a-col>
      <div class="separator" @click="toggleCollapse">
        <span v-if="isCollapsed">▶</span>
        <span v-else>◀</span>
      </div>
      <a-col :span="isCollapsed ? 24 : 18" style="height: 100%;">
        <div class="gantt-chart">
          <div class="time-axis">
            <div
              class="day"
              v-for="(day, index) in totalDays"
              :key="index"
              :style="{ width: `${100 / totalDays}%`, backgroundColor: getDayColor(index) }"
            >
              <span v-if="isFirstDayOfMonth(new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000))">
                {{ formatMonth(new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000)) }}
              </span>
              <span v-else>
                {{ formatDate(new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000)) }}
              </span>
            </div>
          </div>
          <div class="vertical-lines">
            <div
              class="line"
              v-for="index in totalDays - 1"
              :key="index"
              :style="{ left: `${(index / totalDays) * 100}%` }"
            ></div>
          </div>
          <div class="tasks-container">
            <div class="task" v-for="task in tasks" :key="task.id">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-bar" :style="getTaskStyle(task)">
                <div class="progress" :style="getProgressStyle(task)"></div>
              </div>
              <div class="sub-tasks">
                <div class="sub-task" v-for="subTask in task.children" :key="subTask.id">
                  <div class="sub-task-name">{{ subTask.name }}</div>
                  <div class="sub-task-bar" :style="getTaskStyle(subTask)">
                    <div class="sub-progress" :style="getProgressStyle(subTask)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { exp_flow_page } from '@/api/modular/experiment/expFlowManage'

const isCollapsed = ref(false)
const tasks = ref([])

onMounted(() => {
  exp_flow_page({}).then((res) => {
    if (res.success && res.data && res.data.rows) {
      tasks.value = res.data.rows.map(item => ({
        id: item.id,
        name: item.name,
        start: item.startTime,
        end: item.endTime,
        progress: item.progress || 0,
        children: item.children ? item.children.map(child => ({
          id: child.id,
          name: child.name,
          start: child.startTime,
          end: child.endTime,
          progress: child.progress || 0
        })) : []
      }));
    }
  })
})

const startDate = computed(() => {
  if (tasks.value.length === 0) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const earliestStart = new Date(Math.min(...tasks.value.map(task => new Date(task.start))));
  earliestStart.setDate(earliestStart.getDate() - 2);
  return earliestStart;
});

const endDate = computed(() => {
  if (tasks.value.length === 0) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return new Date(Math.max(...tasks.value.map(task => new Date(task.end))));
});

const totalDays = computed(() => {
  return Math.ceil((endDate.value - startDate.value) / (1000 * 60 * 60 * 24)) + 1;
});

const flatTasks = computed(() => {
  const result = [];
  tasks.value.forEach(task => {
    result.push({ ...task, isParent: true });
    if (task.children) {
      task.children.forEach(child => {
        result.push({ ...child, isParent: false });
      });
    }
  });
  return result;
});

const taskData = computed(() => {
  return tasks.value.map(task => ({
    id: task.id,
    name: task.name,
    start: task.start,
    end: task.end,
    progress: task.progress,
    children: task.children.map(subTask => ({
      id: subTask.id,
      name: subTask.name,
      start: subTask.start,
      end: subTask.end,
      progress: subTask.progress,
    })),
  }));
});

const columns = computed(() => [
  { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '开始日期', dataIndex: 'start', key: 'start', ellipsis: true },
  { title: '结束日期', dataIndex: 'end', key: 'end', ellipsis: true },
  { title: '进度(%)', dataIndex: 'progress', key: 'progress' },
]);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function formatDate(date) {
  return date.getDate();
}

function formatMonth(date) {
  return date.toLocaleString('default', { month: 'long' });
}

function isFirstDayOfMonth(date) {
  return date.getDate() === 1;
}

function getTaskStyle(task) {
  const taskStart = new Date(task.start);
  const taskEnd = new Date(task.end);
  const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1;
  const offset = (taskStart - startDate.value) / (1000 * 60 * 60 * 24);

  return {
    width: `${(duration / totalDays.value) * 100}%`,
    left: `${(offset / totalDays.value) * 100}%`,
  };
}

function getProgressStyle(task) {
  return {
    width: `${task.progress}%`,
  };
}

function getDayColor(index) {
  const date = new Date(startDate.value.getTime() + index * 24 * 60 * 60 * 1000);
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return 'rgba(211, 211, 211, 0.5)';
  }
  return 'transparent';
}

function rowClassName(record) {
  if (record.children && record.children.length > 0) {
    return 'parent-task-row';
  }
  return '';
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 100%;
}

.separator {
  width: 10px;
  height: 100%;
  background-color: #f0f2f5;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gantt-chart {
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid #ccc;
  overflow-x: auto;
  overflow-y: auto;
  height: 100%;
}

.time-axis {
  display: flex;
  background-color: #f4f4f4;
  border-bottom: 1px solid #ccc;
  position: sticky;
  top: 0;
  z-index: 2;
}

.day {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-right: 1px solid #ccc;
  white-space: nowrap;
  box-sizing: border-box;
}

.day:last-child {
  border-right: none;
}

.vertical-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #ccc;
}

.tasks-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.task-row {
  display:none;
}
.bar-container{
  display:none;
}
.task {
  position: relative;
  margin: 20px 0;
  padding: 0 10px;
}
.task-name,
.sub-task-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub-task-name{
  font-weight: normal;
  padding-left: 20px;
}

.task-bar {
  position: absolute;
  top: 17px; /* vertically center inside 54px row */
}

.progress {
  background-color: #52c41a; /* Antd success color */
  height: 100%;
  border-radius: 5px;
}

.sub-progress {
  background-color: blue;
  height: 100%;
  border-radius: 5px;
}

.sub-tasks {
  margin-left: 20px;
}

.sub-task {
  margin: 5px 0;
}

.sub-task-bar {
  height: 15px;
  border-radius: 5px;
}

::v-deep .parent-task-row {
  background-color: #f0f8ff;
  font-weight: bold;
}
</style>
