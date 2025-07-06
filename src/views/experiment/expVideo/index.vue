<template>
  <div class="video-monitor">
    <a-card title="视频监控" style="margin-bottom: 16px;">
      <div class="control-panel">
        <a-space>
          <a-button type="primary" @click="startMonitoring" :disabled="isMonitoring">
            <template #icon><play-circle-outlined /></template>
            开始监控
          </a-button>
          <a-button @click="stopMonitoring" :disabled="!isMonitoring">
            <template #icon><pause-circle-outlined /></template>
            停止监控
          </a-button>
          <a-button @click="takeScreenshot">
            <template #icon><camera-outlined /></template>
            截图
          </a-button>
          <a-select v-model:value="selectedCamera" style="width: 200px;" @change="switchCamera">
            <a-select-option value="camera1">摄像头1 - 主实验区</a-select-option>
            <a-select-option value="camera2">摄像头2 - 培养箱</a-select-option>
            <a-select-option value="camera3">摄像头3 - 储存区</a-select-option>
          </a-select>
        </a-space>
      </div>
    </a-card>

    <a-row :gutter="16">
      <!-- 主视频区域 -->
      <a-col :span="16">
        <a-card title="实时监控" :bordered="false">
          <div class="video-container">
            <div class="video-wrapper">
              <video 
                ref="mainVideo" 
                :width="videoWidth" 
                :height="videoHeight"
                autoplay 
                muted 
                playsinline
                @loadedmetadata="onVideoLoaded"
              >
                您的浏览器不支持视频播放
              </video>
              <div v-if="!isMonitoring" class="video-placeholder">
                <div class="placeholder-content">
                  <video-camera-outlined style="font-size: 48px; color: #ccc;" />
                  <p>点击开始监控按钮启动视频监控</p>
                </div>
              </div>
              <div class="video-info">
                <a-tag color="green" v-if="isMonitoring">监控中</a-tag>
                <a-tag color="red" v-else>已停止</a-tag>
                <span class="camera-name">{{ getCameraName(selectedCamera) }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 控制面板和历史记录 -->
      <a-col :span="8">
        <a-card title="监控状态" style="margin-bottom: 16px;">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="当前状态">
              <a-badge :status="isMonitoring ? 'processing' : 'default'" :text="isMonitoring ? '监控中' : '已停止'" />
            </a-descriptions-item>
            <a-descriptions-item label="当前摄像头">
              {{ getCameraName(selectedCamera) }}
            </a-descriptions-item>
            <a-descriptions-item label="分辨率">
              {{ videoWidth }} × {{ videoHeight }}
            </a-descriptions-item>
            <a-descriptions-item label="开始时间">
              {{ startTime || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="运行时长">
              {{ formatDuration(monitoringDuration) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="截图记录">
          <div class="screenshot-list" style="max-height: 300px; overflow-y: auto;">
            <div 
              v-for="screenshot in screenshots" 
              :key="screenshot.id" 
              class="screenshot-item"
              @click="viewScreenshot(screenshot)"
            >
              <img :src="screenshot.thumbnail" :alt="screenshot.name" />
              <div class="screenshot-info">
                <div class="screenshot-name">{{ screenshot.name }}</div>
                <div class="screenshot-time">{{ screenshot.time }}</div>
              </div>
            </div>
            <a-empty v-if="screenshots.length === 0" description="暂无截图记录" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 截图预览模态框 -->
    <a-modal
      v-model:open="screenshotModalVisible"
      title="截图预览"
      width="80%"
      :footer="null"
    >
      <div class="screenshot-preview" v-if="currentScreenshot">
        <img 
          :src="currentScreenshot.url" 
          :alt="currentScreenshot.name" 
          style="width: 100%; height: auto;"
        />
        <div class="screenshot-details">
          <p><strong>截图时间：</strong>{{ currentScreenshot.time }}</p>
          <p><strong>摄像头：</strong>{{ currentScreenshot.camera }}</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  CameraOutlined, 
  VideoCameraOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'ExpVideoMonitor',
  components: {
    PlayCircleOutlined,
    PauseCircleOutlined,
    CameraOutlined,
    VideoCameraOutlined
  },
  data() {
    return {
      isMonitoring: false,
      selectedCamera: 'camera1',
      videoWidth: 640,
      videoHeight: 480,
      startTime: '',
      monitoringDuration: 0,
      screenshotModalVisible: false,
      currentScreenshot: null,
      durationTimer: null,
      mediaStream: null,
      screenshots: [
        {
          id: 1,
          name: '截图_001',
          time: '2024-01-01 10:30:15',
          camera: '摄像头1 - 主实验区',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7miKrlm608L3RleHQ+PC9zdmc+',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjMyMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuaIquWbvTwvdGV4dD48L3N2Zz4='
        }
      ]
    }
  },
  beforeUnmount() {
    this.stopMonitoring()
  },
  methods: {
    async startMonitoring() {
      try {
        // 尝试获取摄像头权限
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: this.videoWidth, 
            height: this.videoHeight 
          },
          audio: false 
        })
        
        if (this.$refs.mainVideo) {
          this.$refs.mainVideo.srcObject = this.mediaStream
        }
        
        this.isMonitoring = true
        this.startTime = new Date().toLocaleString()
        this.monitoringDuration = 0
        
        // 开始计时
        this.durationTimer = setInterval(() => {
          this.monitoringDuration++
        }, 1000)
        
        message.success('视频监控已启动')
        console.log('视频监控 - 监控已启动')
      } catch (error) {
        console.error('视频监控 - 启动监控失败:', error)
        if (error.name === 'NotAllowedError') {
          message.error('摄像头权限被拒绝，请检查浏览器设置')
        } else if (error.name === 'NotFoundError') {
          message.error('未找到摄像头设备')
        } else {
          message.error('启动监控失败: ' + error.message)
        }
      }
    },

    stopMonitoring() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }
      
      if (this.$refs.mainVideo) {
        this.$refs.mainVideo.srcObject = null
      }
      
      this.isMonitoring = false
      
      if (this.durationTimer) {
        clearInterval(this.durationTimer)
        this.durationTimer = null
      }
      
      message.info('视频监控已停止')
      console.log('视频监控 - 监控已停止')
    },

    takeScreenshot() {
      if (!this.isMonitoring || !this.$refs.mainVideo) {
        message.warning('请先启动监控')
        return
      }

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = this.videoWidth
        canvas.height = this.videoHeight
        
        ctx.drawImage(this.$refs.mainVideo, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/png')
        
        const screenshot = {
          id: Date.now(),
          name: `截图_${String(this.screenshots.length + 1).padStart(3, '0')}`,
          time: new Date().toLocaleString(),
          camera: this.getCameraName(this.selectedCamera),
          thumbnail: dataUrl,
          url: dataUrl
        }
        
        this.screenshots.unshift(screenshot)
        message.success('截图成功')
        console.log('视频监控 - 截图成功:', screenshot.name)
      } catch (error) {
        console.error('视频监控 - 截图失败:', error)
        message.error('截图失败: ' + error.message)
      }
    },

    switchCamera(cameraId) {
      console.log('视频监控 - 切换摄像头:', cameraId)
      if (this.isMonitoring) {
        message.info('切换摄像头: ' + this.getCameraName(cameraId))
      }
    },

    getCameraName(cameraId) {
      const cameraMap = {
        camera1: '摄像头1 - 主实验区',
        camera2: '摄像头2 - 培养箱',
        camera3: '摄像头3 - 储存区'
      }
      return cameraMap[cameraId] || '未知摄像头'
    },

    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },

    viewScreenshot(screenshot) {
      this.currentScreenshot = screenshot
      this.screenshotModalVisible = true
    },

    onVideoLoaded() {
      console.log('视频监控 - 视频加载完成')
    }
  }
})
</script>

<style scoped>
.video-monitor {
  height: calc(100vh - 100px);
}

.control-panel {
  margin-bottom: 16px;
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
}

.placeholder-content {
  text-align: center;
}

.video-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.camera-name {
  margin-left: 8px;
}

.screenshot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.screenshot-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.screenshot-item:hover {
  background-color: #f5f5f5;
  border-color: #1890ff;
}

.screenshot-item img {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.screenshot-info {
  flex: 1;
}

.screenshot-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.screenshot-time {
  font-size: 12px;
  color: #666;
}

.screenshot-preview {
  text-align: center;
}

.screenshot-details {
  margin-top: 16px;
  text-align: left;
}
</style>
