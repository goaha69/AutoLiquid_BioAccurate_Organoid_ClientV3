<template>
  <div class="incubator-storage">
    <a-card title="培养箱存储管理" style="margin-bottom: 16px;">
      <div class="search-form">
        <a-form layout="inline">
          <a-form-item label="样品编号">
            <a-input v-model:value="queryParam.sampleCode" placeholder="请输入样品编号" />
          </a-form-item>
          <a-form-item label="培养箱">
            <a-select v-model:value="queryParam.incubatorId" style="width: 200px;" allowClear>
              <a-select-option v-for="incubator in incubatorList" :key="incubator.id" :value="incubator.id">
                {{ incubator.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <a-row :gutter="16">
      <!-- 左侧培养箱列表 -->
      <a-col :span="6">
        <a-card title="培养箱列表" size="small">
          <div class="incubator-list">
            <div 
              v-for="incubator in incubatorList" 
              :key="incubator.id"
              :class="['incubator-item', { 'active': selectedIncubator?.id === incubator.id }]"
              @click="selectIncubator(incubator)"
            >
              <div class="incubator-name">{{ incubator.name }}</div>
              <div class="incubator-info">
                <span>温度: {{ incubator.temperature }}°C</span>
                <span>湿度: {{ incubator.humidity }}%</span>
              </div>
              <div class="incubator-status">
                <a-tag :color="incubator.status === 1 ? 'green' : 'red'">
                  {{ incubator.status === 1 ? '运行中' : '停止' }}
                </a-tag>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧存储网格 -->
      <a-col :span="18">
        <a-card :title="selectedIncubator ? `${selectedIncubator.name} - 存储位置` : '请选择培养箱'" size="small">
          <div v-if="selectedIncubator" class="storage-grid">
            <!-- 网格表头 -->
            <div class="grid-header">
              <div class="grid-cell header-corner">位置</div>
              <div 
                v-for="col in gridCols" 
                :key="col" 
                class="grid-cell header-col"
              >
                {{ col }}
              </div>
            </div>
            
            <!-- 网格行 -->
            <div 
              v-for="row in gridRows" 
              :key="row" 
              class="grid-row"
            >
              <div class="grid-cell header-row">{{ row }}</div>
              <div 
                v-for="col in gridCols" 
                :key="`${row}-${col}`"
                :class="['grid-cell', 'storage-cell', getStorageCellClass(row, col)]"
                @click="handleCellClick(row, col)"
              >
                <div class="cell-content">
                  <div class="position-label">{{ row }}-{{ col }}</div>
                  <div v-if="getStorageData(row, col)" class="sample-info">
                    <div class="sample-code">{{ getStorageData(row, col).sampleCode }}</div>
                    <div class="sample-time">{{ formatTime(getStorageData(row, col).createTime) }}</div>
                  </div>
                  <div v-else class="empty-slot">空闲</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="no-incubator">
            <a-empty description="请从左侧选择一个培养箱查看存储情况" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 样品信息模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="modalTitle"
      @ok="handleDetailOk"
      @cancel="handleDetailCancel"
      width="600px"
    >
      <div v-if="selectedStorage">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="位置">{{ selectedStorage.position }}</a-descriptions-item>
          <a-descriptions-item label="样品编号">{{ selectedStorage.sampleCode || '-' }}</a-descriptions-item>
          <a-descriptions-item label="存储时间">{{ formatTime(selectedStorage.createTime) || '-' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedStorage.sampleCode ? 'green' : 'default'">
              {{ selectedStorage.sampleCode ? '已占用' : '空闲' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ selectedStorage.remark || '-' }}</a-descriptions-item>
        </a-descriptions>

        <div v-if="!selectedStorage.sampleCode" style="margin-top: 20px;">
          <h4>添加样品</h4>
          <a-form layout="vertical">
            <a-form-item label="样品编号" required>
              <a-input v-model:value="newSample.sampleCode" placeholder="请输入样品编号" />
            </a-form-item>
            <a-form-item label="备注">
              <a-textarea v-model:value="newSample.remark" placeholder="请输入备注" :rows="3" />
            </a-form-item>
          </a-form>
        </div>

        <div v-else style="margin-top: 20px;">
          <a-space>
            <a-button type="primary" danger @click="removeSample">移除样品</a-button>
            <a-button @click="editSample">编辑信息</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'ExpIncubatorStorage',
  data() {
    return {
      loading: false,
      queryParam: {
        sampleCode: '',
        incubatorId: null
      },
      selectedIncubator: null,
      incubatorList: [
        {
          id: 1,
          name: '培养箱A',
          temperature: 37,
          humidity: 95,
          status: 1
        },
        {
          id: 2,
          name: '培养箱B',
          temperature: 37,
          humidity: 95,
          status: 1
        },
        {
          id: 3,
          name: '培养箱C',
          temperature: 4,
          humidity: 80,
          status: 0
        }
      ],
      gridRows: ['A', 'B', 'C', 'D', 'E', 'F'],
      gridCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      storageData: [
        {
          incubatorId: 1,
          row: 'A',
          col: 1,
          position: 'A-1',
          sampleCode: 'S001',
          createTime: '2024-01-01 10:00:00',
          remark: '细胞培养样品'
        },
        {
          incubatorId: 1,
          row: 'A',
          col: 3,
          position: 'A-3',
          sampleCode: 'S002',
          createTime: '2024-01-01 11:00:00',
          remark: '组织样品'
        },
        {
          incubatorId: 2,
          row: 'B',
          col: 2,
          position: 'B-2',
          sampleCode: 'S003',
          createTime: '2024-01-01 12:00:00',
          remark: '实验样品'
        }
      ],
      detailModalVisible: false,
      modalTitle: '存储位置详情',
      selectedStorage: null,
      newSample: {
        sampleCode: '',
        remark: ''
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        // 这里应该调用真实的API获取培养箱和存储数据
        // const response = await exp_incubator_storage_data(this.queryParam)
        
        console.log('培养箱存储 - 数据加载完成')
        setTimeout(() => {
          this.loading = false
        }, 500)
        
      } catch (error) {
        console.error('培养箱存储 - 数据加载失败:', error)
        message.error('数据加载失败: ' + error.message)
        this.loading = false
      }
    },

    handleQuery() {
      this.loadData()
    },

    handleReset() {
      this.queryParam = {
        sampleCode: '',
        incubatorId: null
      }
      this.selectedIncubator = null
      this.loadData()
    },

    selectIncubator(incubator) {
      this.selectedIncubator = incubator
      console.log('选择培养箱:', incubator.name)
    },

    getStorageData(row, col) {
      if (!this.selectedIncubator) return null
      return this.storageData.find(item => 
        item.incubatorId === this.selectedIncubator.id && 
        item.row === row && 
        item.col === col
      )
    },

    getStorageCellClass(row, col) {
      const data = this.getStorageData(row, col)
      return {
        'occupied': !!data?.sampleCode,
        'empty': !data?.sampleCode
      }
    },

    handleCellClick(row, col) {
      if (!this.selectedIncubator) {
        message.warning('请先选择培养箱')
        return
      }

      const existingData = this.getStorageData(row, col)
      this.selectedStorage = existingData || {
        incubatorId: this.selectedIncubator.id,
        row: row,
        col: col,
        position: `${row}-${col}`,
        sampleCode: '',
        createTime: '',
        remark: ''
      }

      this.modalTitle = `位置 ${row}-${col} 详情`
      this.detailModalVisible = true
      this.newSample = {
        sampleCode: '',
        remark: ''
      }
    },

    async handleDetailOk() {
      if (!this.selectedStorage.sampleCode && this.newSample.sampleCode) {
        // 添加样品
        try {
          const newStorage = {
            ...this.selectedStorage,
            sampleCode: this.newSample.sampleCode,
            remark: this.newSample.remark,
            createTime: new Date().toLocaleString()
          }

          // 这里应该调用API保存数据
          // await exp_incubator_storage_add(newStorage)

          // 更新本地数据
          const existingIndex = this.storageData.findIndex(item => 
            item.incubatorId === newStorage.incubatorId && 
            item.row === newStorage.row && 
            item.col === newStorage.col
          )

          if (existingIndex >= 0) {
            this.storageData[existingIndex] = newStorage
          } else {
            this.storageData.push(newStorage)
          }

          message.success('样品添加成功')
          this.detailModalVisible = false
        } catch (error) {
          console.error('添加样品失败:', error)
          message.error('添加样品失败: ' + error.message)
        }
      } else {
        this.detailModalVisible = false
      }
    },

    handleDetailCancel() {
      this.detailModalVisible = false
      this.selectedStorage = null
    },

    async removeSample() {
      try {
        // 这里应该调用API删除数据
        // await exp_incubator_storage_remove(this.selectedStorage)

        // 更新本地数据
        const index = this.storageData.findIndex(item => 
          item.incubatorId === this.selectedStorage.incubatorId && 
          item.row === this.selectedStorage.row && 
          item.col === this.selectedStorage.col
        )

        if (index >= 0) {
          this.storageData.splice(index, 1)
        }

        message.success('样品移除成功')
        this.detailModalVisible = false
      } catch (error) {
        console.error('移除样品失败:', error)
        message.error('移除样品失败: ' + error.message)
      }
    },

    editSample() {
      // 编辑样品信息
      this.newSample.sampleCode = this.selectedStorage.sampleCode
      this.newSample.remark = this.selectedStorage.remark
    },

    formatTime(timeStr) {
      if (!timeStr) return '-'
      return new Date(timeStr).toLocaleString()
    }
  }
})
</script>

<style scoped>
.incubator-storage {
  height: calc(100vh - 100px);
}

.search-form {
  margin-bottom: 16px;
}

.incubator-list {
  max-height: 70vh;
  overflow-y: auto;
}

.incubator-item {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.incubator-item:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.incubator-item.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.incubator-name {
  font-weight: 500;
  margin-bottom: 8px;
}

.incubator-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.incubator-status {
  text-align: center;
}

.storage-grid {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.grid-header {
  display: flex;
  background-color: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.grid-row {
  display: flex;
  border-bottom: 1px solid #d9d9d9;
}

.grid-row:last-child {
  border-bottom: none;
}

.grid-cell {
  flex: 1;
  min-height: 60px;
  border-right: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.grid-cell:last-child {
  border-right: none;
}

.header-corner {
  background-color: #f0f0f0;
  font-weight: 500;
}

.header-col,
.header-row {
  background-color: #fafafa;
  font-weight: 500;
}

.storage-cell {
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.storage-cell:hover {
  background-color: #f0f8ff;
}

.storage-cell.occupied {
  background-color: #f6ffed;
  border-color: #52c41a;
}

.storage-cell.empty {
  background-color: #fff;
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.position-label {
  font-size: 10px;
  color: #999;
  margin-bottom: 2px;
}

.sample-info {
  text-align: center;
}

.sample-code {
  font-weight: 500;
  color: #52c41a;
  margin-bottom: 2px;
}

.sample-time {
  font-size: 10px;
  color: #666;
}

.empty-slot {
  color: #ccc;
  font-size: 10px;
}

.no-incubator {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
