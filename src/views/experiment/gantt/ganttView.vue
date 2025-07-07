<template>
  <div id="app">
    <a-row style="height: 100vh; display : flex;">
      <a-col :span="isCollapsed ? 0 : 6" style="overflow : auto;">
        <a-table  :data-source="taskData" :columns="columns"
          rowKey="id"
          :expandable="expandable"
          :pagination="false"
          :row-class-name="rowClassName"
          :defaultExpandAllRows="true"
        />
      </a-col>
      <div class="separator" @click="toggleCollapse">
        <span v-if="isCollapsed">▶</span>
        <span v-else>◀</span>
      </div>
      <a-col :span="isCollapsed ? 24 : 18" style="height : 100%;">
        <div class="gantt-chart" style="height: calc(100% - 40px); position : relative;">
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
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { h } from 'vue'

export default {
  data() {
    return {
      isCollapsed: false,
      tasks: [
        {
          id: 1,
          name: '实验(原代)1',
          start: '2024-09-03',
          end: '2024-09-09',
          progress: 60,
          children: [
            {
              id: 11,
              name: '组织过滤、离心',
              start: '2024-09-03',
              end: '2024-09-03',
              progress: 100,
            },
            {
              id: 12,
              name: '裂解红细胞',
              start: '2024-09-03',
              end: '2024-09-03',
              progress: 90,
            },
            {
              id: 13,
              name: '进行细胞计数',
              start: '2024-09-04',
              end: '2024-09-04',
              progress: 80,
            },
            {
              id: 14,
              name: '制作细胞悬液',
              start: '2024-09-04',
              end: '2024-09-04',
              progress: 70,
            },
            {
              id: 15,
              name: '混胶、滴胶',
              start: '2024-09-04',
              end: '2024-09-06',
              progress: 60,
            },
            {
              id: 16,
              name: '放培养箱静置',
              start: '2024-09-06',
              end: '2024-09-06',
              progress: 50,
            },
            {
              id: 17,
              name: '取出加培养基',
              start: '2024-09-06',
              end: '2024-09-06',
              progress: 40,
            },
            {
              id: 18,
              name: '拍照记录',
              start: '2024-09-06',
              end: '2024-09-06',
              progress: 30,
            },
            {
              id: 19,
              name: '放回培养箱培养',
              start: '2024-09-06',
              end: '2024-09-09',
              progress: 20,
            },
          ],
        },
        {
          id: 2,
          name: '实验(换液、传代)1',
          start: '2024-09-04',
          end: '2024-09-13',
          progress: 40,
          children: [
            {
              id: 21,
              name: '取出拍照、识别',
              start: '2024-09-04',
              end: '2024-09-04',
              progress: 60,
            },
            {
              id: 22,
              name: '弃旧液、加新液',
              start: '2024-09-04',
              end: '2024-09-04',
              progress: 50,
            },
            {
              id: 23,
              name: '放回培养箱培养',
              start: '2024-09-04',
              end: '2024-09-06',
              progress: 40,
            },
            {
              id: 24,
              name: '取出拍照、识别',
              start: '2024-09-06',
              end: '2024-09-06',
              progress: 30,
            },
            {
              id: 25,
              name: '弃旧液、加消化液',
              start: '2024-09-06',
              end: '2024-09-06',
              progress: 20,
            },
            {
              id: 26,
              name: '放培养箱消化',
              start: '2024-09-06',
              end: '2024-09-07',
              progress: 20,
            },
            {
              id: 27,
              name: '取出终止消化',
              start: '2024-09-07',
              end: '2024-09-07',
              progress: 10,
            },
            {
              id: 28,
              name: '离心、洗涤细胞',
              start: '2024-09-07',
              end: '2024-09-07',
              progress: 10,
            },
            {
              id: 29,
              name: '进行细胞计数',
              start: '2024-09-07',
              end: '2024-09-07',
              progress: 10,
            },
            {
              id: 30,
              name: '制作细胞悬液',
              start: '2024-09-07',
              end: '2024-09-07',
              progress: 10,
            },
            {
              id: 31,
              name: '混胶、滴胶',
              start: '2024-09-07',
              end: '2024-09-07',
              progress: 10,
            },
            {
              id: 32,
              name: '放培养箱静置',
              start: '2024-09-07',
              end: '2024-09-10',
              progress: 0,
            },
            {
              id: 33,
              name: '取出加培养基',
              start: '2024-09-10',
              end: '2024-09-10',
              progress: 0,
            },
            {
              id: 34,
              name: '拍照记录',
              start: '2024-09-10',
              end: '2024-09-10',
              progress: 0,
            },
            {
              id: 35,
              name: '放回培养箱培养',
              start: '2024-09-10',
              end: '2024-09-13',
              progress: 0,
            },
          ],
        },
        {
          id: 3,
          name: '实验(铺板、加药、检测)1',
          start: '2024-09-08',
          end: '2024-09-15',
          progress: 10,
          children: [
            {
              id: 31,
              name: '样本接收、拍照',
              start: '2024-09-08',
              end: '2024-09-08',
              progress: 20,
            },
            {
              id: 32,
              name: '样本消化、终止',
              start: '2024-09-08',
              end: '2024-09-08',
              progress: 0,
            },
            {
              id: 33,
              name: '细胞计数',
              start: '2024-09-08',
              end: '2024-09-08',
              progress: 0,
            },
            {
              id: 34,
              name: '制作细胞悬液',
              start: '2024-09-08',
              end: '2024-09-08',
              progress: 0,
            },
            {
              id: 35,
              name: '进行384孔板铺板',
              start: '2024-09-08',
              end: '2024-09-08',
              progress: 0,
            },
            {
              id: 36,
              name: '放培养箱静置',
              start: '2024-09-08',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 37,
              name: '取出加培养基',
              start: '2024-09-11',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 38,
              name: '铺板拍照记录',
              start: '2024-09-11',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 39,
              name: '加药前拍照记录',
              start: '2024-09-11',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 40,
              name: '加药前换液',
              start: '2024-09-11',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 41,
              name: '按方案加药',
              start: '2024-09-11',
              end: '2024-09-11',
              progress: 0,
            },
            {
              id: 42,
              name: '放回培养箱培养',
              start: '2024-09-11',
              end: '2024-09-13',
              progress: 0,
            },
            {
              id: 43,
              name: '检测前拍照',
              start: '2024-09-13',
              end: '2024-09-13',
              progress: 0,
            },
            {
              id: 44,
              name: '加发光增强液',
              start: '2024-09-13',
              end: '2024-09-13',
              progress: 0,
            },
            {
              id: 45,
              name: '放冰箱静置',
              start: '2024-09-13',
              end: '2024-09-15',
              progress: 0,
            },
            {
              id: 46,
              name: '加发光试剂',
              start: '2024-09-15',
              end: '2024-09-15',
              progress: 0,
            },
            {
              id: 47,
              name: '酶标仪检测',
              start: '2024-09-15',
              end: '2024-09-15',
              progress: 0,
            },
            {
              id: 48,
              name: '孔板、试剂回收',
              start: '2024-09-15',
              end: '2024-09-15',
              progress: 0,
            },
          ],
        },
      ]
    };
  },
  computed: {
    startDate() {
      if (this.tasks.length === 0) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const earliestStart = new Date(Math.min(...this.tasks.map(task => new Date(task.start))));
      earliestStart.setDate(earliestStart.getDate() - 2);
      return earliestStart;
    },
    endDate() {
      if (this.tasks.length === 0) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      return new Date(Math.max(...this.tasks.map(task => new Date(task.end))));
    },
    totalDays() {
      return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
    },
    taskData() {
      return this.tasks.map(task => ({
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
    },
    columns() {
      return [
        {
          title: '任务名称',
          dataIndex: 'name',
          key: 'name',
          ellipsis: true,
        },
        {
          title: '开始日期',
          dataIndex: 'start',
          key: 'start',
          ellipsis: true,
        },
        {
          title: '结束日期',
          dataIndex: 'end',
          key: 'end',
          ellipsis: true,
        },
        {
          title: '进度(%)',
          dataIndex: 'progress',
          key: 'progress',
        },
      ];
    },
    expandable() {
      return {
        expandedRowRender: (record) => {
          return h('ul', 
            record.children.map(subTask => 
              h('li', { key: subTask.id }, `${subTask.name} (进度: ${subTask.progress}%)`)
            )
          );
        },
        defaultExpandAllRows: true,
      };
    },
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    formatDate(date) {
      return date.getDate();
    },
    formatMonth(date) {
      return date.toLocaleString('default', { month: 'long' });
    },
    isFirstDayOfMonth(date) {
      return date.getDate() === 1;
    },
    getTaskStyle(task) {
      const startDate = new Date(task.start);
      const endDate = new Date(task.end);
      const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
      const offsetDays = (startDate - this.startDate) / (1000 * 60 * 60 * 24);
      
      const overlapCount = this.tasks.filter(t => t.start === task.start && t.end === task.end).length;
      
      return {
        width: `${(totalDays / this.totalDays) * 100}%`,
        marginLeft: `${(offsetDays / this.totalDays) * 100}%`,
        zIndex: 10 - overlapCount,
        position: 'relative',
        left: `${(overlapCount - 1) * 5}px`,
      };
    },
    getProgressStyle(task) {
      return {
        width: `${task.progress}%`,
        backgroundColor: 'green',
        height: '100%',
      };
    },
    getDayColor(index) {
      const currentDate = new Date();
      const currentDay = new Date(this.startDate.getTime() + index * 24 * 60 * 60 * 1000);
      
      if (currentDate.toDateString() === currentDay.toDateString()) {
        return '#ffeb3b';
      }
      return index % 2 === 0 ? '#f9f9f9' : '#ffffff';
    },
    rowClassName(record, index) {
      return index % 2 === 0 ? 'even-row' : 'odd-row';
    },
  },
};
</script>

<style>
#gantt-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.time-axis {
  display: flex;
  height: 30px;
  background-color: #f0f0f0;
}

.day {
  text-align: center;
  padding: 5px 0;
  position: relative;
}

.vertical-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: #ccc;
}

.task {
  margin: 10px 10px 0;
}

.task-name {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.60);
}

.task-bar {
  background-color: #e0e0e0;
  position: relative;
  height: 20px;
  border-radius: 5px;
  margin-top: -22px;
}

.progress {
  background-color: green;
  height: 100%;
  border-radius: 5px;
}

.sub-tasks {
  margin-left: 20px;
}

.sub-task {
  margin: 5px 5px 0;  
}

.sub-task-name {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.60);
}

.sub-task-bar {
  background-color: #e0e0e0;
  position: relative;
  height: 15px;
  border-radius: 5px;
  margin-top: -20px;
}

.sub-progress {
  background-color: blue;
  height: 100%;
  border-radius: 5px;
}

.separator {
  width: 4px;
  background-color: #5685dd;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.separator:hover {
  background-color: #588000;
}

.even-row {
  background-color: #f9f9f9;
}

.odd-row {
  background-color: #ffffff;
}
</style>
