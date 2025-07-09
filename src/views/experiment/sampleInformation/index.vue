<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-form-item label="样品编号">
              <a-input 
                v-model:value="queryParam.sampleCode" 
                allow-clear 
                placeholder="请输入样品编号" 
                style="width: 200px;" 
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px;" @click="resetQuery">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
      </template>
    </x-card>
    
    <a-card :bordered="false">
      <a-table 
        ref="table" 
        size="middle" 
        :loading="loading" 
        :pagination="pagination"
        :columns="columns" 
        :data-source="dataSource" 
        :rowKey="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'type'">
            {{ typeFilter(text) }}
          </template>
          <template v-else-if="column.key === 'status'">
            {{ statusFilter(text) }}
          </template>
          <template v-else-if="column.key === 'flowId'">
            {{ flowFilter(text) }}
          </template>
          <template v-else-if="column.key === 'cultivateOrGenerationTime'">
            {{ formatDate(text) }}
          </template>
          <template v-else-if="column.key === 'susceptibility1Time'">
            {{ formatDate(text) }}
          </template>
          <template v-else-if="column.key === 'susceptibility2Time'">
            {{ formatDate(text) }}
          </template>
          <template v-else-if="column.key === 'susceptibility3Time'">
            {{ formatDate(text) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="showDetail(record)">查看明细</a-button>
            <a-button type="link" @click="showStatusModal(record)">修改状态</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!--显微镜图像 !-->
    <a-modal title="显微镜图像" v-model:open="imageModal.visible" :footer="null" :width="1100" @cancel="clearImageData">
      <ImageThumbnail ref="imageThumbnailRef" :images="imageModal.imageData" />
    </a-modal>

    <!--样品明细模态框 !-->
    <a-modal title="样品明细" v-model:open="detailModal.visible" @ok="handleDetailOk" @cancel="handleDetailCancel" :width="1600">
      <div>
        <p>{{"样品编号："+detailModal.detailData.sampleCode  }}</p>
        <p>{{"样品状态："+statusFilter(detailModal.detailData.status) }}</p>
      </div>
      <div class="timeline-container">
        <!-- 时间轴线 -->
        <div class="timeline-line"></div>
        
        <!-- 时间轴节点 -->
        <div
          v-for="(item, index) in detailModal.detailData.tracks" :key="index" :class="[
            'timeline-node',
            { 'timeline-node-top': isEven(index), 'timeline-node-bottom': isOdd(index) }
          ]"
        > 
          <div class="timeline-node-dot"></div>
          <div class="timeline-node-content" >
            <div class="timeline-node-time" v-if="item.flowCase!=null">{{ item.flowCase.startTime}}</div>
            <div class="timeline-node-text" v-if="item.flowCase!=null">{{ item.flowCase.name }}</div>
            <div class="timeline-node-subtext" 
            v-if="item.consumables!=null && item.consumables.length>0"
            v-for="(sitem, sindex) in item.consumables" :key="sindex">
              {{ sitem.name +'('+sitem.barcode+')' }}
            </div>
            <div class="timeline-node-subtext" v-if="item.files!=null && item.files.length>0" @click="showImage(item.files)">
              图像
            </div>
            <div class="timeline-node-subtext" v-if="item.readerData!=null && item.readerData.length>0" @click="show384(item.readerData[0].dataScheme)">
              384孔板数据
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!--修改状态模态框 !-->
    <a-modal title="修改状态" v-model:open="statusModal.visible" @ok="handleStatusConfirm" @cancel="handleStatusCancel">
      <div style="margin-bottom: 16px;">
        <span>样品号：</span>
        <span style="color: #666; font-weight: 500;">
          {{ statusModal.record.sampleCode }}
        </span>
      </div>
      <div style="margin-bottom: 16px;">
        <span>原状态：</span>
        <span style="color: #666; font-weight: 500;">
          {{ statusFilter(statusModal.originalStatus) }}
        </span>
      </div>
      <div>
        <span>新状态：</span>
        <a-select v-model:value="statusModal.record.status" style="width: 200px;" placeholder="请选择新状态">
          <a-select-option v-for="(item, index) in sampleStatus" :key="index" :value="item.code">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>

    <!--384孔板模态框 !-->
    <a-modal v-model:open="modal384.visible" title="384孔位数据" width="1050px" :footer="null">
      <div class="plate-container">
        <!-- 列号展示 -->
        <div class="column-headers">
          <div class="row-header"></div>
          <div v-for="col in 24" :key="col" class="column-header">
            {{ col }}
          </div>
        </div>
        <!-- 主体表格 -->
        <div v-for="(row, rowIndex) in modal384.rows" :key="row" class="plate-row">
          <div class="row-header">{{ row }}</div>
          <div v-for="col in 24" :key="col" class="plate-cell"
          :style="modal384.data[getIndex(rowIndex, col - 1)] == 0 ? '' : 'background-color: #8ad8bc;'">
            {{ modal384.data[getIndex(rowIndex, col - 1)] }}
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import moment from 'moment'
import { hasPerm } from '@/utils/permissions'
import { XCard } from '@/components'
import ImageThumbnail from '@/components/ImageThumbnail.vue'
import {
  exp_flow_case_getSamples,
  exp_flow_case_getSampleDetail,
  exp_flow_case_UpdateSampleStatus
} from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'

// 响应式数据
const queryParam = ref({})
const loading = ref(false)
const table = ref(null)
const imageThumbnailRef = ref(null)

// 表格数据
const dataSource = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`
})

// 表格列定义 - 适配ant-design-vue表格
const columns = [
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: 60,
  },
  {
    title: '样品编号',
    dataIndex: 'sampleCode',
    key: 'sampleCode',
  },
  {
    title: '培养箱位置',
    dataIndex: 'storageLoc',
    key: 'storageLoc',
  },
  {
    title: '案例编号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '流程名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '流程类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '培养日期',
    dataIndex: 'cultivateOrGenerationTime',
    key: 'cultivateOrGenerationTime',
  },
  {
    title: '距上一次换液天数',
    dataIndex: 'lastChangeLiquidDay',
    key: 'lastChangeLiquidDay',
  },
  {
    title: '距上一次传代天数',
    dataIndex: 'lastGenerationDay',
    key: 'lastGenerationDay',
  },
  {
    title: '铺板日期',
    dataIndex: 'susceptibility1Time',
    key: 'susceptibility1Time',
  },
  {
    title: '加药日期',
    dataIndex: 'susceptibility2Time',
    key: 'susceptibility2Time',
  },
  {
    title: '检测日期',
    dataIndex: 'susceptibility3Time',
    key: 'susceptibility3Time',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
  }
]

// 模态框数据
const imageModal = reactive({
  visible: false,
  imageData: []
})

const detailModal = reactive({
  visible: false,
  currentRecord: null,
  detailData: {
    sampleCode: '123',
    status: 0,
    tracks: [],
  },
})

const statusModal = reactive({
  visible: false,
  record: {},
  originalStatus: null
})

const modal384 = reactive({
  visible: false,
  rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  data: [],
  dataList: []
})

// 字典数据
const flowData = ref([])
const flowStatus = ref([])
const liquidRanges = ref([])
const flowTypes = ref([])
const executeTypes = ref([])
const flowPrioritys = ref([])
const sampleStatus = ref([])

// 数据加载函数
const loadData = async (params = {}) => {
  try {
    loading.value = true
    const parameter = {
      pageNo: params.current || pagination.current,
      pageSize: params.pageSize || pagination.pageSize,
      ...queryParam.value
    }
    
    const res = await exp_flow_case_getSamples(parameter)
    
    if (res.success && res.data) {
      dataSource.value = res.data.rows || []
      pagination.current = res.data.pageNo || 1
      pagination.pageSize = res.data.pageSize || 10
      pagination.total = res.data.totalRows || 0
    } else {
      dataSource.value = []
      pagination.total = 0
      message.error(res.message || '数据加载失败')
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    message.error('数据加载失败: ' + error.message)
    dataSource.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 查询处理
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置查询
const resetQuery = () => {
  queryParam.value = {}
  pagination.current = 1
  loadData()
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  loadData({
    current: pag.current,
    pageSize: pag.pageSize
  })
}

// 刷新函数
const refreshFun = () => {
  // 定时刷新逻辑
}

// 清除图像数据
const clearImageData = () => {
  imageModal.visible = false
  if (imageThumbnailRef.value) {
    imageThumbnailRef.value.clearFormData()
  }
}

// 判断索引是否为奇数
const isOdd = (index) => {
  return index % 2 !== 0
}

// 判断索引是否为偶数
const isEven = (index) => {
  return index % 2 === 0
}

// 显示详情
const showDetail = (record) => {
  detailModal.currentRecord = record
  detailModal.visible = true
  const dd = { id: record.id }
  exp_flow_case_getSampleDetail(dd).then((res) => {
    if (res.success) {
      detailModal.detailData = res.data
    } else {
      message.error('明细数据加载失败!')
    }
  })
}

const handleDetailOk = () => {
  detailModal.visible = false
}

const handleDetailCancel = () => {
  detailModal.visible = false
}

// 获取流程数据
const getFlowData = () => {
  const data = {}
  exp_flow_list(data).then((res) => {
    if (res.success) {
      flowData.value = res.data
    } else {
      message.error('数据加载失败')
    }
  })
}

// 获取字典数据
const sysDictTypeDropDownFunc = () => {
  sysDictTypeDropDown({ code: 'expflow_status' }).then((res) => {
    flowStatus.value = res.data
    flowStatus.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
    liquidRanges.value = res.data
    liquidRanges.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  sysDictTypeDropDown({ code: 'flow_type' }).then((res) => {
    flowTypes.value = res.data
    flowTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  sysDictTypeDropDown({ code: 'flow_execute_type' }).then((res) => {
    executeTypes.value = res.data
    executeTypes.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  sysDictTypeDropDown({ code: 'flow_priority' }).then((res) => {
    flowPrioritys.value = res.data
    flowPrioritys.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })

  sysDictTypeDropDown({ code: 'sample_status' }).then((res) => {
    sampleStatus.value = res.data
    sampleStatus.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })
}

// 格式化日期
const formatDate = (text) => {
  if (text != null) {
    return moment(text).format('YYYY-MM-DD')
  } else {
    return ''
  }
}

// 流程过滤器
const flowFilter = (flowId) => {
  const values = flowData.value.filter((item) => item.id === flowId)
  if (values.length > 0) {
    return values[0].name
  }
}

// 类型过滤器
const typeFilter = (status) => {
  const values = flowTypes.value.filter((item) => item.code === status)
  if (values.length > 0) {
    return values[0].value
  }
}

// 状态过滤器
const statusFilter = (status) => {
  const values = sampleStatus.value.filter((item) => item.code === status)
  if (values.length > 0) {
    return values[0].value
  }
}

// 显示状态修改模态框
const showStatusModal = (record) => {
  statusModal.visible = true
  statusModal.record = { ...record }
  statusModal.originalStatus = record.status
}

// 确认状态修改
const handleStatusConfirm = () => {
  const { id, status } = statusModal.record
  exp_flow_case_UpdateSampleStatus({ id, status }).then(res => {
    if (res.success) {
      message.success('状态更新成功')
      loadData() // 刷新表格数据
      statusModal.visible = false
    } else {
      message.error(res.message || '状态更新失败')
    }
  }).catch(err => {
    message.error('请求失败')
  })
}

const handleStatusCancel = () => {
  statusModal.visible = false
}

// 显示384孔板
const show384 = (value) => {
  modal384.visible = true
  modal384.data = value.split(',').map(Number)
}

// 显示图像
const showImage = (files) => {
  imageModal.visible = true
  imageModal.imageData = files
}

// 计算索引位置
const getIndex = (row, column) => {
  return row * 24 + column
}

// 定时器
let refreshTime = null

// 生命周期
onMounted(async () => {
  refreshTime = setInterval(refreshFun, 10000)
  document.addEventListener('mouseup', () => {
    // isDragging = false
  })
  
  // 初始化数据
  await sysDictTypeDropDownFunc()
  await getFlowData()
  
  // 加载表格数据
  loadData()
})

onBeforeUnmount(() => {
  if (refreshTime) {
    clearInterval(refreshTime)
  }
})
</script>

<style scoped>
.table-page-search-wrapper {
  padding: 16px 24px;
}

.table-page-search-wrapper .ant-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.table-page-search-wrapper .ant-form-item:last-child {
  margin-right: 0;
}

.status-modal {
  padding: 24px;
}

.status-modal .status-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-modal .status-item span {
  margin-right: 12px;
  font-weight: 600;
}

.status-modal .ant-select {
  width: 200px;
}

/* 384孔板 */
.plate-container {
  display: flex;
  flex-direction: column;
  overflow: auto;
  max-height: 70vh;
}

.column-headers,
.plate-row {
  display: flex;
  min-width: 1000px;
}

.column-header,
.row-header {
  width: 40px;
  min-width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: #fafafa;
  border: 1px solid #e8e8e8;
}

.plate-cell {
  width: 40px;
  min-width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  font-size: 12px;
  transition: background 0.3s;
}

.plate-cell:hover {
  transform: scale(1.2);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.timeline-container {
  position: relative;
  padding: 100px 0;
  display: flex;
  justify-content: left;
  margin-top: 30px;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #42b983;
}

.timeline-line::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #42b983;
}

.timeline-node {
  display: flex;
  align-items: center;
  position: relative;   
}

.timeline-node-top {
  justify-content: flex-start;
  margin-left: 30px;
}

.timeline-node-bottom {
  justify-content: flex-start;
  margin-left: 30px;
}

.timeline-node-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #42b983;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-node-content {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  position: relative;
  left: 10px;
  min-height: 130px;
}

.timeline-node-time {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  min-width: 100px;
}

.timeline-node-subtext {
  font-size: 16px;
  color: rgb(97, 116, 97);
  cursor: pointer;
  min-width: 100px;
}

.timeline-node-text {
  font-size: 16px;
  min-width: 100px;
  margin-bottom: 8px;
}

.timeline-node-top .timeline-node-content {
  top: -90px;
  left: 5px;
}

.timeline-node-bottom .timeline-node-content {
  bottom: -90px;
  left: 5px;
}
</style>
