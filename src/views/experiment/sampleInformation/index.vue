<template>
  <div style="padding: 20px;">
    <h2>样品信息表</h2>
    
    <!-- 搜索区域 -->
    <a-card title="搜索条件" style="margin-bottom: 16px;">
      <a-form layout="inline">
        <a-form-item label="样品编号">
          <a-input v-model:value="queryParam.sampleCode" placeholder="请输入样品编号" allow-clear />
        </a-form-item>
        <a-form-item label="样品状态">
          <a-select v-model:value="queryParam.status" placeholder="请选择样品状态" allow-clear style="width: 150px;">
            <a-select-option value="0">培养中</a-select-option>
            <a-select-option value="1">已完成</a-select-option>
            <a-select-option value="2">已暂停</a-select-option>
            <a-select-option value="3">已终止</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="实验流程">
          <a-select v-model:value="queryParam.flowId" placeholder="请选择实验流程" allow-clear style="width: 200px;">
            <a-select-option v-for="flow in flowList" :key="flow.id" :value="flow.id">
              {{ flow.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card title="样品信息列表">
      <div style="margin-bottom: 16px;">
        <a-button type="primary" @click="showAddModal" v-if="hasPerm('exp_sample:add')">新增样品</a-button>
      </div>
      
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :loading="loading"
        :pagination="{
          total: total,
          current: pageNum,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pageNum - 1) * pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'cultivateOrGenerationTime'">
            {{ formatDateTime(record.cultivateOrGenerationTime) }}
          </template>
          <template v-else-if="column.key === 'susceptibility1Time'">
            {{ formatDateTime(record.susceptibility1Time) }}
          </template>
          <template v-else-if="column.key === 'susceptibility2Time'">
            {{ formatDateTime(record.susceptibility2Time) }}
          </template>
          <template v-else-if="column.key === 'susceptibility3Time'">
            {{ formatDateTime(record.susceptibility3Time) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="showDetail(record)">查看详情</a>
            <a-divider type="vertical" />
            <a @click="showStatusModal(record)" v-if="hasPerm('exp_sample:edit')">修改状态</a>
            <a-divider type="vertical" v-if="hasPerm('exp_sample:edit') && hasPerm('exp_sample:delete')" />
            <a-popconfirm title="确认删除？" @confirm="deleteRecord(record)" v-if="hasPerm('exp_sample:delete')">
              <a style="color: red;">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleOk"
      @cancel="handleCancel"
      width="800px"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="样品编号" required>
              <a-input v-model:value="formData.sampleCode" placeholder="请输入样品编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="实验流程" required>
              <a-select v-model:value="formData.flowId" placeholder="请选择实验流程" style="width: 100%;">
                <a-select-option v-for="flow in flowList" :key="flow.id" :value="flow.id">
                  {{ flow.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="培养/产生时间">
              <a-date-picker
                v-model:value="formData.cultivateOrGenerationTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择培养/产生时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="感受态制备1时间">
              <a-date-picker
                v-model:value="formData.susceptibility1Time"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择感受态制备1时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="感受态制备2时间">
              <a-date-picker
                v-model:value="formData.susceptibility2Time"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择感受态制备2时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="感受态制备3时间">
              <a-date-picker
                v-model:value="formData.susceptibility3Time"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择感受态制备3时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="样品状态">
              <a-select v-model:value="formData.status" style="width: 100%;">
                <a-select-option :value="0">培养中</a-select-option>
                <a-select-option :value="1">已完成</a-select-option>
                <a-select-option :value="2">已暂停</a-select-option>
                <a-select-option :value="3">已终止</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="流程类型">
              <a-select v-model:value="formData.type" placeholder="请选择流程类型" style="width: 100%;">
                <a-select-option value="normal">普通流程</a-select-option>
                <a-select-option value="urgent">紧急流程</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 样品详情模态框 -->
    <a-modal
      v-model:open="detailVisible"
      title="样品详情"
      :footer="null"
      width="1200px"
    >
      <a-descriptions :column="2" v-if="selectedSample">
        <a-descriptions-item label="样品编号">{{ selectedSample.sampleCode }}</a-descriptions-item>
        <a-descriptions-item label="实验流程">{{ selectedSample.flowName }}</a-descriptions-item>
        <a-descriptions-item label="培养/产生时间">{{ formatDateTime(selectedSample.cultivateOrGenerationTime) }}</a-descriptions-item>
        <a-descriptions-item label="感受态制备1时间">{{ formatDateTime(selectedSample.susceptibility1Time) }}</a-descriptions-item>
        <a-descriptions-item label="感受态制备2时间">{{ formatDateTime(selectedSample.susceptibility2Time) }}</a-descriptions-item>
        <a-descriptions-item label="感受态制备3时间">{{ formatDateTime(selectedSample.susceptibility3Time) }}</a-descriptions-item>
        <a-descriptions-item label="样品状态">
          <a-tag :color="getStatusColor(selectedSample.status)">
            {{ getStatusText(selectedSample.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="流程类型">{{ selectedSample.type || '普通流程' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ selectedSample.remark || '无' }}</a-descriptions-item>
      </a-descriptions>
      
      <!-- 样品跟踪时间轴 -->
      <a-divider>样品跟踪记录</a-divider>
      <a-timeline v-if="selectedSample.tracks && selectedSample.tracks.length > 0">
        <a-timeline-item v-for="(track, index) in selectedSample.tracks" :key="index">
          <template #dot>
            <clock-circle-outlined style="font-size: 16px;" />
          </template>
          <div>
            <div style="font-weight: bold;">{{ track.flowCase?.name || '未知步骤' }}</div>
            <div style="color: #666; font-size: 12px;">{{ formatDateTime(track.flowCase?.startTime) }}</div>
            <div v-if="track.flowCase?.description" style="margin-top: 4px;">{{ track.flowCase.description }}</div>
          </div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无跟踪记录" />
    </a-modal>

    <!-- 修改状态模态框 -->
    <a-modal
      v-model:open="statusModalVisible"
      title="修改样品状态"
      @ok="handleStatusOk"
      @cancel="handleStatusCancel"
      width="400px"
    >
      <a-form layout="vertical">
        <a-form-item label="当前状态">
          <a-tag :color="getStatusColor(statusForm.currentStatus)">
            {{ getStatusText(statusForm.currentStatus) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="新状态" required>
          <a-select v-model:value="statusForm.newStatus" style="width: 100%;">
            <a-select-option :value="0">培养中</a-select-option>
            <a-select-option :value="1">已完成</a-select-option>
            <a-select-option :value="2">已暂停</a-select-option>
            <a-select-option :value="3">已终止</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="statusForm.remark" placeholder="请输入状态变更原因" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import { exp_flow_case_page, exp_flow_case_add, exp_flow_case_edit, exp_flow_case_delete, exp_flow_case_updateStatus } from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { hasPerm } from '@/utils/permissions'
import dayjs from 'dayjs'

export default {
  name: 'SampleInformation',
  components: {
    ClockCircleOutlined
  },
  data() {
    return {
      loading: false,
      queryParam: {
        sampleCode: '',
        status: undefined,
        flowId: undefined
      },
      dataSource: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      columns: [
        {
          title: '序号',
          key: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '样品编号',
          dataIndex: 'sampleCode',
          key: 'sampleCode',
          align: 'center'
        },
        {
          title: '实验流程',
          dataIndex: 'flowName',
          key: 'flowName',
          align: 'center'
        },
        {
          title: '培养/产生时间',
          key: 'cultivateOrGenerationTime',
          align: 'center'
        },
        {
          title: '感受态制备1时间',
          key: 'susceptibility1Time',
          align: 'center'
        },
        {
          title: '感受态制备2时间',
          key: 'susceptibility2Time',
          align: 'center'
        },
        {
          title: '感受态制备3时间',
          key: 'susceptibility3Time',
          align: 'center'
        },
        {
          title: '样品状态',
          key: 'status',
          align: 'center'
        }
      ],
      modalVisible: false,
      modalTitle: '新增样品',
      isEdit: false,
      formData: {
        id: null,
        sampleCode: '',
        flowId: null,
        cultivateOrGenerationTime: null,
        susceptibility1Time: null,
        susceptibility2Time: null,
        susceptibility3Time: null,
        status: 0,
        type: 'normal',
        remark: ''
      },
      detailVisible: false,
      selectedSample: null,
      statusModalVisible: false,
      statusForm: {
        id: null,
        currentStatus: null,
        newStatus: null,
        remark: ''
      },
      flowList: []
    }
  },
  mounted() {
    // 根据权限动态添加操作列
    if (this.hasPerm('exp_sample:edit') || this.hasPerm('exp_sample:delete')) {
      const hasActionColumn = this.columns.some(col => col.key === 'action')
      if (!hasActionColumn) {
        this.columns.push({
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200
        })
      }
    }
    this.loadData()
    this.loadFlowList()
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        const params = {
          ...this.queryParam,
          page: this.pageNum,
          pageSize: this.pageSize
        }
        console.log('样品信息表 - 请求参数:', params)
        
        const response = await exp_flow_case_page(params)
        console.log('样品信息表 - API响应:', response)
        
        if (response && response.data) {
          this.dataSource = response.data.rows || response.data.records || response.data.data || []
          this.total = response.data.totalRows || response.data.totalCount || response.data.total || 0
          
          console.log('样品信息表 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total
          })
          
          if (this.dataSource.length === 0) {
            console.log('样品信息表 - 没有找到数据')
            this.$message.info('暂无样品信息数据')
          } else {
            console.log('样品信息表 - 成功加载数据，共', this.dataSource.length, '条记录')
          }
        } else {
          console.warn('样品信息表 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
        }
      } catch (error) {
        console.error('样品信息表 - 数据加载失败:', error)
        this.$message.error('数据加载失败: ' + (error.response?.data?.message || error.message || error))
        this.dataSource = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async loadFlowList() {
      try {
        const response = await exp_flow_list()
        if (response && response.data) {
          this.flowList = response.data.rows || response.data.records || response.data || []
          console.log('样品信息表 - 流程列表加载成功:', this.flowList)
        }
      } catch (error) {
        console.error('样品信息表 - 流程列表加载失败:', error)
        this.flowList = []
      }
    },
    
    handleQuery() {
      this.pageNum = 1
      this.loadData()
    },
    
    handleReset() {
      this.queryParam = {
        sampleCode: '',
        status: undefined,
        flowId: undefined
      }
      this.pageNum = 1
      this.loadData()
    },
    
    handleTableChange(pagination) {
      this.pageNum = pagination.current
      this.pageSize = pagination.pageSize
      this.loadData()
    },

    showDetail(record) {
      this.selectedSample = record
      this.detailVisible = true
    },

    showStatusModal(record) {
      this.statusForm = {
        id: record.id,
        currentStatus: record.status,
        newStatus: record.status,
        remark: ''
      }
      this.statusModalVisible = true
    },

    async handleStatusOk() {
      try {
        const response = await exp_flow_case_updateStatus(this.statusForm)
        console.log('样品信息表 - 状态更新响应:', response)
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success('状态更新成功')
          this.statusModalVisible = false
          this.loadData()
        } else {
          this.$message.error('状态更新失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('样品信息表 - 状态更新失败:', error)
        this.$message.error('状态更新失败: ' + (error.response?.data?.message || error.message || error))
      }
    },

    handleStatusCancel() {
      this.statusModalVisible = false
      this.statusForm = {
        id: null,
        currentStatus: null,
        newStatus: null,
        remark: ''
      }
    },
    
    showAddModal() {
      this.modalTitle = '新增样品'
      this.isEdit = false
      this.resetForm()
      this.modalVisible = true
    },
    
    editRecord(record) {
      this.modalTitle = '编辑样品'
      this.isEdit = true
      this.formData = {
        ...record,
        cultivateOrGenerationTime: record.cultivateOrGenerationTime ? dayjs(record.cultivateOrGenerationTime) : null,
        susceptibility1Time: record.susceptibility1Time ? dayjs(record.susceptibility1Time) : null,
        susceptibility2Time: record.susceptibility2Time ? dayjs(record.susceptibility2Time) : null,
        susceptibility3Time: record.susceptibility3Time ? dayjs(record.susceptibility3Time) : null
      }
      this.modalVisible = true
    },
    
    async deleteRecord(record) {
      try {
        const response = await exp_flow_case_delete(record)
        console.log('样品信息表 - 删除响应:', response)
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error('删除失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('样品信息表 - 删除失败:', error)
        this.$message.error('删除失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    async handleOk() {
      try {
        // 转换时间格式
        const submitData = {
          ...this.formData,
          cultivateOrGenerationTime: this.formData.cultivateOrGenerationTime ? this.formData.cultivateOrGenerationTime.format('YYYY-MM-DD HH:mm:ss') : null,
          susceptibility1Time: this.formData.susceptibility1Time ? this.formData.susceptibility1Time.format('YYYY-MM-DD HH:mm:ss') : null,
          susceptibility2Time: this.formData.susceptibility2Time ? this.formData.susceptibility2Time.format('YYYY-MM-DD HH:mm:ss') : null,
          susceptibility3Time: this.formData.susceptibility3Time ? this.formData.susceptibility3Time.format('YYYY-MM-DD HH:mm:ss') : null
        }
        
        let response
        if (this.isEdit) {
          response = await exp_flow_case_edit(submitData)
          console.log('样品信息表 - 编辑响应:', response)
        } else {
          response = await exp_flow_case_add(submitData)
          console.log('样品信息表 - 新增响应:', response)
        }
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success(this.isEdit ? '更新成功' : '新增成功')
          this.modalVisible = false
          this.loadData()
        } else {
          this.$message.error('保存失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('样品信息表 - 保存失败:', error)
        this.$message.error('保存失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    handleCancel() {
      this.modalVisible = false
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        id: null,
        sampleCode: '',
        flowId: null,
        cultivateOrGenerationTime: null,
        susceptibility1Time: null,
        susceptibility2Time: null,
        susceptibility3Time: null,
        status: 0,
        type: 'normal',
        remark: ''
      }
    },

    getStatusColor(status) {
      const colorMap = {
        0: 'blue',
        1: 'green',
        2: 'orange',
        3: 'red'
      }
      return colorMap[status] || 'blue'
    },

    getStatusText(status) {
      const textMap = {
        0: '培养中',
        1: '已完成',
        2: '已暂停',
        3: '已终止'
      }
      return textMap[status] || '培养中'
    },

    formatDateTime(dateTime) {
      return dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') : ''
    },

    // 权限检查方法
    hasPerm(permission) {
      return hasPerm(permission)
    }
  }
}
</script>

<style scoped>
.ant-card {
  margin-bottom: 16px;
}

.timeline-container {
  margin: 20px 0;
}
</style>
