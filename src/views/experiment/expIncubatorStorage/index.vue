<template>
  <div class="container">
    <div class="table-wrapper">
      <table class="incubator-table">
        <thead>
          <tr>
            <th class="header-cell corner">层\列</th>
            <th v-for="column in 9" :key="column" class="header-cell">
              {{ column }}列
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in incubatorData" :key="rowIndex">
            <td class="row-header">{{ rowIndex + 1 }}层</td>
            <td 
              v-for="(col, colIndex) in row" 
              :key="colIndex"
              :class="['data-cell', { 'has-data': col.sampleCode }]"
            >
              <div class="cell-content" @click="getDataDetail(col)">
                <div class="coordinates">{{ col.rowIndex + 1 }}-{{ col.colIndex + 1 }}</div>
                <div v-if="col.sampleCode" class="sample-code">
                  {{ col.sampleCode }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <a-modal 
      title="实验数据"
      v-model:open="visible" 
      :footer="null" 
      :maskClosable="false"
      @cancel="cancelEditForm"
    >
      <a-row type="flex">
        <a-col :span="24">
          <a-row :gutter="16">
            <a-col :span="24">
              <div>
                <sp-input label="流程" v-model="incubator.flowId" class="input-field"/>
                <a-button type="primary" class="copy-btn" @click="deleteData">
                  删除
                </a-button>
              </div>
            </a-col>
            <a-col :span="24">
              <div>
                <sp-input label="样品编码" v-model="incubator.sampleCode" class="input-field"/>
                <a-button type="primary" class="copy-btn" @click="handleCopy">
                  复制
                </a-button>
              </div>
            </a-col>
            <a-col :span="24"><sp-input label="节点" v-model="incubator.nodeId" class="input-field"/></a-col>
            <a-col :span="24"><sp-input label="步骤" v-model="incubator.stepId" class="input-field"/></a-col>
            <a-col :span="24"><sp-input label="开始时间" v-model="incubator.startTime" class="input-field"/></a-col>
            <a-col :span="24"><sp-input label="结束时间" v-model="incubator.endTime" class="input-field"/></a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { exp_incubator_storage_list, exp_incubator_storage_DeleteData } from '@/api/modular/experiment/expIncubatorStorageManage'
import SpInput from '@/components/spInput.vue'

const incubatorData = ref([])
const incubator = ref({})
const visible = ref(false)
let refreshTimer = null

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
})

const loadData = () => {
  exp_incubator_storage_list().then((res) => {
    // 先创建一个包含所有位置信息的完整表格
    const tableData = Array.from({ length: 25 }, (_, rowIndex) => 
      Array.from({ length: 9 }, (_, colIndex) => ({
        rowIndex: rowIndex,
        colIndex: colIndex,
        flowId: '',
        sampleCode: '',
        nodeId: '',
        stepId: '',
        startTime: '',
        endTime: '',
        id: null
      }))
    )
    
    // 然后用实际数据覆盖对应位置
    const data = res.data
    for (let k = 0; k < data.length; k++) {
      const e = data[k]
      tableData[e.rowIndex][e.colIndex] = e
    }
    incubatorData.value = tableData
  }).catch(err => {
    console.error('加载数据失败:', err)
    message.error('加载数据失败: ' + err.message)
  })
  
  // 设置5秒后自动刷新
  refreshTimer = setTimeout(() => {
    loadData()
  }, 5000)
}

const getDataDetail = (item) => {
  incubator.value = { ...item }
  visible.value = true
}

const cancelEditForm = () => {
  visible.value = false
}

// 复制功能
const handleCopy = async () => {
  const text = incubator.value.sampleCode

  if (!text) {
    message.warning('没有可复制的内容')
    return
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      await fallbackCopyTextToClipboard(text)
    }
    message.success('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
    message.error('复制失败，请手动复制')
  }   
}

// 降级复制方法
const fallbackCopyTextToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (successful) {
        resolve()
      } else {
        reject(new Error('复制命令失败'))
      }
    } catch (err) {
      document.body.removeChild(textArea)
      reject(err)
    }
  })
}

// 删除数据
const deleteData = async () => {
  if (!incubator.value.sampleCode && !incubator.value.startTime && !incubator.value.endTime && !incubator.value.flowId) {
    message.warning('没有可删除的数据')
    return
  }
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除Id为 ${incubator.value.id} 的数据吗？`,
    okText: '确认删除',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await exp_incubator_storage_DeleteData({ 
          id: incubator.value.id 
        })
        if (res.code === 200) {
          message.success('删除成功')
          visible.value = false
          loadData()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除数据时出错:', error)
        message.error('删除数据时发生错误')
      }
    }
  })
}
</script>

<style scoped>
.header-cell.corner {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
}

.incubator-table {
  table-layout: fixed;
}

.container {
  height: 100vh;
  padding: 20px;
  background: #f0f2f5;
}

.table-wrapper {
  height: calc(100vh - 100px);
  overflow: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.incubator-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 1000px;
}

.header-cell {
  background: #fafafa;
  color: rgba(0,0,0,.85);
  font-weight: 600;
  padding: 16px;
  border: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 2;
}

.corner {
  background: #fafafa;
  z-index: 3;
}

.row-header {
  text-align: center;
  width: 100px;
  height: 130px;
  background: #fafafa;
  font-weight: 500;
  padding: 12px;
  border: 1px solid #e8e8e8;
  position: sticky;
  left: 0;
  z-index: 1;
}

.data-cell {
  padding: 8px;
  border: 1px solid #e8e8e8;
  text-align: center;
  transition: all 0.3s;
  min-width: 120px;
}

.data-cell:hover {
  background-color: #f5f5f5;
}

.has-data {
  background-color: #e6f7ff;
}

.cell-content {
  cursor: pointer;
  padding: 8px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coordinates {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.sample-code {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
  word-break: break-all;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-field {
  margin: 12px 0;
}

.copy-btn {
  height: 40px;
  margin-left: 10px;
}
</style>
