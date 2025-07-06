<template>
  <a-layout>
    <!-- 左侧搜索和列表 -->
    <a-layout-sider width="500" style="background: #fff; padding: 20px">
      <a-form layout="inline">
        <a-form-item v-if="hasPerm('exp_video:page')">
          <a-input v-model:value="name" placeholder="测试用：请输入实验步骤名称" allow-clear />
          <a-button type="primary" @click="startRecording" :disabled="isRecording">开始录制</a-button>
          <a-button type="danger" style="margin-left: 8px" @click="stopRecording"
            :disabled="!isRecording">结束录制</a-button>
        </a-form-item>

        <a-form-item label="相机名称" v-if="hasPerm('exp_video:page')">
          <a-select v-model:value="queryParam.cameraId" allow-clear style="width: 200px" placeholder="请选择相机">
            <a-select-option v-for="(camera, index) in cameras" :key="index" :value="index + 1">
              {{ camera }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="录制日期" v-if="hasPerm('exp_video:page')">
          <a-date-picker v-model:value="queryParam.videoDate" allow-clear style="width: 200px" placeholder="请选择日期" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>

      <s-table ref="table" :columns="columns" :data="loadData" :alert="true" :rowKey="(record) => record.id"
        :customRow="customRow">
        <template #serial="{ text, record, index }">
          {{ index + 1 }}
        </template>
        <template #createdTime="{ text }">
          {{ formatDate(text) }}
        </template>
        <template #action="{ text, record }">
          <a @click="playVideo(record)">播放</a>
        </template>
      </s-table>
    </a-layout-sider>

    <!-- 右侧视频播放区域 -->
    <a-layout-content style="padding-left: 12px">
      <a-card title="录像回放" :bordered="false">
        <div v-if="selectedVideo" class="video-player">
          <video controls style="width:100%" @error="handleVideoError" :key="selectedVideo.id" autoplay>
            <source :src="selectedVideo.url" type="video/mp4">
            您的浏览器不支持视频播放
          </video>
          <div class="video-info">
            <h3>{{ selectedVideo.name }}</h3>
            <p>录像开始时间：{{ formatDate(selectedVideo.createdTime) }}</p>
            <!-- <p>文件大小：{{ selectedVideo.fileSize }}</p> -->
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

<script>
import { STable, XCard } from '@/components'
import { exp_video_page } from '@/api/modular/experiment/expVideoManage'
import { exp_video_start } from '@/api/modular/experiment/expVideoManage'
import { exp_video_stop } from '@/api/modular/experiment/expVideoManage'
import { exp_video_play } from '@/api/modular/experiment/expVideoManage'
import { VideoCamera } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import moment from 'moment'

export default {
  name: "exp_video_mgr",
  components: {
    XCard,
    STable,
    VideoCameraOutlined: VideoCamera
  },
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      // 录像名称
      name: '',
      isRecording: false,
      queryParam: {},
      selectedVideo: null,
      selectedRow: null,
      videoDateString: '',
      cameras: ['1号相机', '2号相机', '3号相机'],
      columns: [
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '50px',
          slots: { customRender: 'serial' }
        },
        {
          title: '录像名称',
          dataIndex: 'name',
          align: 'center'
        },
        {
          title: '录像开始时间',
          dataIndex: 'createdTime',
          align: 'center',
          slots: {
            customRender: 'createdTime'
          }
        }
      ]
    }
  },
  methods: {
    startRecording() {
      if (!this.name) {
        this.$message.warning('请先输入步骤名称')
        return
      }
      this.isRecording = true
      console.log('开始录制:', this.name)
      // 实际应调用录制接口，例如：
      exp_video_start({ name: this.name }).then((res) => {
        if(res.success){
          this.$refs.table.refresh(true);
        }
        else {
          this.$message.error('录视频出错了!');
        }
      }).catch((err) => {
        this.$message.error('异常：' + err.message)
      })
    },
    stopRecording() {
      this.isRecording = false
      console.log('结束录制:', this.name)
      exp_video_stop().then((res) => {
        if(res.success){
          this.$refs.table.refresh(true);
        }
        else {
          this.$message.error('录视频出错了!');
        }
      }).catch((err) => {
        this.$message.error('异常：' + err.message)
      })
      this.name = ''
    },
    customRow(record) {
        return {
            onClick: () => {
                this.selectedRow = record;
                this.playVideo(record);
            },                
            style: {
                backgroundColor: this.selectedRow == record ? ('#' + this.store.getters.color.slice(1) + '15') : '', // Change background color based on age
            },
        };
    },
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    playVideo(record) {
      this.selectedVideo = record
      // 创建一个新对象而不是直接修改原有对象
      this.selectedVideo = {
        ...record,
        url: record.url
      }
      console.log('播放录像路径:', this.selectedVideo.url)
      // exp_video_play({ url: this.selectedVideo.url })
    },
    handleVideoError(e) {
      this.$message.error('视频加载失败，请检查文件路径是否正确');
      console.error('视频播放错误:', e);
    },
    // 新增的查询处理方法
    handleQuery() {
      // 格式化日期参数
      if (this.queryParam.videoDate) {
        this.queryParam.videoDate = moment(this.queryParam.videoDate).format('YYYY-MM-DD');
      }
      // 传递处理后的参数
      this.$refs.table.refresh(true, this.queryParam);
    },
    handleReset() {
      this.queryParam = {};
      this.$nextTick(() => {
        this.$refs.table.refresh(true);
      });
    },
    // 加载数据方法 必须为 Promise 对象
    loadData(parameter) {
      return exp_video_page(Object.assign(parameter, this.queryParam)).then((res) => {
        return res.data
      })
    },
  }
}
</script>

<style scoped>
.video-placeholder {
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
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

:deep(.ant-list-item) {
  transition: all 0.3s;
}

:deep(.ant-list-item:hover) {
  background-color: #fafafa;
}
</style>
