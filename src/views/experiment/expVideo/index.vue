<template>
  <a-layout>
    <!-- 左侧搜索和列表 -->
    <a-layout-sider width="500" style="background:#fff;padding:20px">
      <div class="search-wrapper">
        <!-- 第一行：录制控制 -->
        <a-form layout="inline" style="margin-bottom: 12px;">
          <a-form-item v-if="hasPerm('exp_video:page')">
            <a-input v-model:value="name" placeholder="测试用：请输入实验步骤名称" allow-clear style="width: 280px;" />
            <a-button type="primary" @click="startRecording" :disabled="isRecording" style="margin-left:8px">开始录制</a-button>
            <a-button danger style="margin-left:8px" @click="stopRecording" :disabled="!isRecording">结束录制</a-button>
          </a-form-item>
        </a-form>
        
        <!-- 第二行：搜索条件 -->
        <a-form layout="inline">
          <a-form-item label="相机名称" v-if="hasPerm('exp_video:page')">
            <a-select v-model:value="queryParam.cameraId" placeholder="请选择相机" allow-clear style="width:120px">
              <a-select-option v-for="(camera,index) in cameras" :key="index" :value="index+1">{{ camera }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="录制日期" v-if="hasPerm('exp_video:page')">
            <a-date-picker 
              v-model:value="queryParam.videoDate" 
              placeholder="请选择日期" 
              allow-clear 
              style="width:120px"
              :locale="locale"
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="handleQuery" style="margin-right:8px">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'createdTime'">
            {{ formatDate(record.createdTime) }}
          </template>
        </template>
      </a-table>
    </a-layout-sider>

    <!-- 右侧视频播放区域 -->
    <a-layout-content style="padding-left:12px">
      <a-card title="录像回放" :bordered="false">
        <div v-if="selectedVideo" class="video-player">
          <video controls style="width:100%" :key="selectedVideo.id" autoplay @error="handleVideoError">
            <source :src="selectedVideo.url" type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
          <div class="video-info">
            <h3>{{ selectedVideo.name }}</h3>
            <p>录像开始时间：{{ formatDate(selectedVideo.createdTime) }}</p>
            <p>录像保存路径：{{ selectedVideo.url }}</p>
          </div>
        </div>
        <div v-else class="video-placeholder">
          <video-camera-outlined style="font-size:48px;color:#ccc" />
          <p>请选择左侧录像文件进行播放</p>
        </div>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  exp_video_page,
  exp_video_start,
  exp_video_stop
} from '@/api/modular/experiment/expVideoManage'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { VideoCameraOutlined } from '@ant-design/icons-vue'
import { usePermission } from '@/hooks/usePermission'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'

// 设置moment为中文
moment.locale('zh-cn')

const { hasPerm } = usePermission()

const name = ref('')
const isRecording = ref(false)
const queryParam = reactive({})
const selectedVideo = ref(null)
const selectedRow = ref(null)
const cameras = ['1号相机', '2号相机', '3号相机']
const loading = ref(false)
const dataSource = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条, 共 ${total} 条`
})

const columns = [
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: 60
  },
  {
    title: '录像名称',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '录像开始时间',
    dataIndex: 'createdTime',
    key: 'createdTime',
    align: 'center'
  }
]

const loadData = () => {
  loading.value = true
  const params = {
    ...queryParam,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  }
  
  console.log('加载数据参数:', params)
  
  exp_video_page(params)
    .then((res) => {
      console.log('API响应:', res)
      if (res.success && res.data) {
        dataSource.value = res.data.rows || []
        pagination.total = res.data.totalRows || 0
      } else {
        dataSource.value = []
        pagination.total = 0
        message.error(res.message || '加载数据失败')
      }
    })
    .catch(err => {
      console.error('加载数据失败:', err)
      message.error('加载数据失败: ' + err.message)
      dataSource.value = []
      pagination.total = 0
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  loadData()
})

function formatDate(val) {
  return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : ''
}

function startRecording() {
  if (!name.value) {
    message.warning('请先输入步骤名称')
    return
  }
  isRecording.value = true
  console.log('开始录制:', name.value)
  
  exp_video_start({ name: name.value })
    .then(res => {
      if (res.success) {
        loadData()
        message.success('录制已开始')
      } else {
        message.error('录视频出错了!')
        isRecording.value = false
      }
    })
    .catch(err => {
      message.error('异常：' + err.message)
      isRecording.value = false
    })
}

function stopRecording() {
  isRecording.value = false
  console.log('结束录制:', name.value)
  
  exp_video_stop()
    .then(res => {
      if (res.success) {
        loadData()
        message.success('录制已结束')
      } else {
        message.error('停止录制出错了!')
      }
    })
    .catch(err => {
      message.error('异常：' + err.message)
    })
  name.value = ''
}

function playVideo(record) {
  selectedVideo.value = { ...record, url: record.url }
  selectedRow.value = record
  console.log('播放录像路径:', selectedVideo.value.url)
}

function handleVideoError(e) {
  message.error('视频加载失败，请检查文件路径是否正确')
  console.error('视频播放错误:', e)
}

function handleQuery() {
  if (queryParam.videoDate) {
    queryParam.videoDate = moment(queryParam.videoDate).format('YYYY-MM-DD')
  }
  console.log('查询参数:', queryParam)
  pagination.current = 1
  loadData()
}

function handleReset() {
  Object.keys(queryParam).forEach(key => {
    delete queryParam[key]
  })
  pagination.current = 1
  loadData()
}

function onTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

function customRow(record) {
  return {
    onClick: () => {
      playVideo(record)
    },
    style: {
      cursor: 'pointer',
      backgroundColor: selectedRow.value === record ? '#e6f7ff' : ''
    }
  }
}
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.search-wrapper .ant-form {
  margin-bottom: 0;
}

.search-wrapper .ant-form-item {
  margin-bottom: 0;
  margin-right: 12px;
}

.search-wrapper .ant-form-item:last-child {
  margin-right: 0;
}

.search-wrapper .ant-form-item-label {
  padding-right: 8px;
}

.video-placeholder {
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}
.video-player {
  width: 100%;
}
.video-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}
.video-info p {
  margin: 8px 0;
}
</style>
