<template>
  <div>
    <a-card v-if="hasPerm('exp_flow_case:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="12">
              <a-form-item label="案例编号">
                <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入案例编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="案例名称">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入案例名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <a-card :bordered="false" style="margin-top: 16px;">
      <div class="table-operator" style="margin-bottom: 16px;">
        <a-button @click="handleAdd" type="primary" v-if="hasPerm('exp_flow_case:add')">
          <template #icon><plus-outlined /></template>
          新增案例
        </a-button>
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
          <template v-else-if="column.key === 'action'">
            <a @click="handleEdit(record)" v-if="hasPerm('exp_flow_case:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_flow_case:edit') && hasPerm('exp_flow_case:delete')" />
            <a-popconfirm title="确认删除本案例？" @confirm="handleDelete(record)" v-if="hasPerm('exp_flow_case:delete')">
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
            <a-form-item label="案例编号" required>
              <a-input v-model:value="formData.code" placeholder="请输入案例编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="案例名称" required>
              <a-input v-model:value="formData.name" placeholder="请输入案例名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="样品编号">
              <a-input v-model:value="formData.sampleCode" placeholder="请输入样品编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="formData.status" style="width: 100%">
                <a-select-option :value="0">待执行</a-select-option>
                <a-select-option :value="1">执行中</a-select-option>
                <a-select-option :value="2">已完成</a-select-option>
                <a-select-option :value="3">已取消</a-select-option>
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
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { exp_flow_case_page, exp_flow_case_add, exp_flow_case_edit, exp_flow_case_delete } from '@/api/modular/experiment/expFlowCaseManage'
import { hasPerm } from '@/utils/permissions'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'ExpFlowCaseManage',
  components: {
    PlusOutlined
  },
  data() {
    return {
      loading: false,
      queryParam: {
        code: '',
        name: ''
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
          title: '案例编号',
          dataIndex: 'code',
          key: 'code',
          align: 'center'
        },
        {
          title: '案例名称',
          dataIndex: 'name',
          key: 'name',
          align: 'center'
        },
        {
          title: '样品编号',
          dataIndex: 'sampleCode',
          key: 'sampleCode',
          align: 'center'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 100
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          align: 'center',
          width: 150
        }
      ],
      modalVisible: false,
      modalTitle: '新增案例',
      isEdit: false,
      formData: {
        id: null,
        code: '',
        name: '',
        sampleCode: '',
        status: 0,
        remark: ''
      }
    }
  },
  mounted() {
    // 根据权限动态添加操作列
    if (this.hasPerm('exp_flow_case:edit') || this.hasPerm('exp_flow_case:delete')) {
      const hasActionColumn = this.columns.some(col => col.key === 'action')
      if (!hasActionColumn) {
        this.columns.push({
          title: '操作',
          key: 'action',
          align: 'center',
          width: 120
        })
      }
    }
    this.loadData()
  },
  methods: {
    hasPerm,
    async loadData() {
      try {
        this.loading = true
        const params = {
          ...this.queryParam,
          page: this.pageNum,
          pageSize: this.pageSize
        }
        console.log('实验案例管理 - 请求参数:', params)
        
        const response = await exp_flow_case_page(params)
        console.log('实验案例管理 - API响应:', response)
        
        if (response && response.data) {
          this.dataSource = response.data.rows || response.data.records || response.data.data || []
          this.total = response.data.totalRows || response.data.totalCount || response.data.total || 0
          
          console.log('实验案例管理 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total,
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
          
          if (this.dataSource.length === 0) {
            console.log('实验案例管理 - 没有找到数据')
            message.info('暂无案例数据')
          } else {
            console.log('实验案例管理 - 成功加载数据，共', this.dataSource.length, '条记录')
          }
        } else {
          console.warn('实验案例管理 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
          if (response && response.message) {
            message.warning('API返回: ' + response.message)
          } else {
            message.warning('数据格式异常')
          }
        }
      } catch (error) {
        console.error('实验案例管理 - 数据加载失败:', error)
        message.error('数据加载失败: ' + (error.response?.data?.message || error.message || error))
        
        this.dataSource = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    
    handleQuery() {
      this.pageNum = 1
      this.loadData()
    },
    
    handleReset() {
      this.queryParam = {
        code: '',
        name: ''
      }
      this.pageNum = 1
      this.loadData()
    },
    
    handleTableChange(pagination) {
      this.pageNum = pagination.current
      this.pageSize = pagination.pageSize
      this.loadData()
    },
    
    handleAdd() {
      this.modalTitle = '新增案例'
      this.isEdit = false
      this.resetForm()
      this.modalVisible = true
    },
    
    handleEdit(record) {
      this.modalTitle = '编辑案例'
      this.isEdit = true
      this.formData = { ...record }
      this.modalVisible = true
    },
    
    async handleDelete(record) {
      try {
        const response = await exp_flow_case_delete(record)
        console.log('实验案例管理 - 删除响应:', response)
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          message.success('删除成功')
          this.loadData()
        } else {
          message.error('删除失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('实验案例管理 - 删除失败:', error)
        message.error('删除失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    async handleOk() {
      try {
        let response
        if (this.isEdit) {
          response = await exp_flow_case_edit(this.formData)
          console.log('实验案例管理 - 编辑响应:', response)
        } else {
          response = await exp_flow_case_add(this.formData)
          console.log('实验案例管理 - 新增响应:', response)
        }
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          message.success(this.isEdit ? '更新成功' : '新增成功')
          this.modalVisible = false
          this.loadData()
        } else {
          message.error('保存失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('实验案例管理 - 保存失败:', error)
        message.error('保存失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    handleCancel() {
      this.modalVisible = false
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        id: null,
        code: '',
        name: '',
        sampleCode: '',
        status: 0,
        remark: ''
      }
    },

    getStatusColor(status) {
      const colorMap = {
        0: 'blue',
        1: 'orange', 
        2: 'green',
        3: 'red'
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
    }
  }
})
</script>

<style scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
}

.table-operator {
  margin-bottom: 16px;
}
</style>
