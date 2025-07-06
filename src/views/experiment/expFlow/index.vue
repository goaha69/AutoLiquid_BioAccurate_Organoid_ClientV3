<template>
  <div>
    <a-card v-if="hasPerm('exp_flow:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="12">
              <a-form-item label="实验流程编号">
                <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入实验流程编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="实验流程名称">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入实验流程名称" />
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
        <a-button @click="handleAdd" type="primary" v-if="hasPerm('exp_flow:add')">
          <template #icon><plus-outlined /></template>
          新增实验流程
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
            <a-tag :color="record.status == 0 ? 'green' : 'red'">
              {{ record.status == 0 ? '启用' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="handleEdit(record)" v-if="hasPerm('exp_flow:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_flow:edit') && hasPerm('exp_flow:delete')" />
            <a-popconfirm title="确认删除本实验流程？" @confirm="handleDelete(record)" v-if="hasPerm('exp_flow:delete')">
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
            <a-form-item label="流程编号" required>
              <a-input v-model:value="formData.code" placeholder="请输入流程编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="流程名称" required>
              <a-input v-model:value="formData.name" placeholder="请输入流程名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="formData.status" style="width: 100%">
                <a-select-option :value="0">启用</a-select-option>
                <a-select-option :value="1">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序号">
              <a-input-number v-model:value="formData.sort" :min="1" style="width: 100%" />
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
import { exp_flow_page, exp_flow_add, exp_flow_edit, exp_flow_delete } from '@/api/modular/experiment/expFlowManage'
import { hasPerm } from '@/utils/permissions'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'ExpFlowManage',
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
          title: '流程编号',
          dataIndex: 'code',
          key: 'code',
          align: 'center'
        },
        {
          title: '流程名称',
          dataIndex: 'name',
          key: 'name',
          align: 'center'
        },
        {
          title: '排序号',
          dataIndex: 'sort',
          key: 'sort',
          align: 'center',
          width: 80
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 80
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
      modalTitle: '新增实验流程',
      isEdit: false,
      formData: {
        id: null,
        code: '',
        name: '',
        status: 0,
        sort: 1,
        remark: ''
      }
    }
  },
  mounted() {
    // 根据权限动态添加操作列
    if (this.hasPerm('exp_flow:edit') || this.hasPerm('exp_flow:delete')) {
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
        console.log('实验流程管理 - 请求参数:', params)
        
        const response = await exp_flow_page(params)
        console.log('实验流程管理 - API响应:', response)
        
        if (response && response.data) {
          this.dataSource = response.data.rows || response.data.records || response.data.data || []
          this.total = response.data.totalRows || response.data.totalCount || response.data.total || 0
          
          console.log('实验流程管理 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total,
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
          
          if (this.dataSource.length === 0) {
            console.log('实验流程管理 - 没有找到数据')
            message.info('暂无实验流程数据')
          } else {
            console.log('实验流程管理 - 成功加载数据，共', this.dataSource.length, '条记录')
          }
        } else {
          console.warn('实验流程管理 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
          if (response && response.message) {
            message.warning('API返回: ' + response.message)
          } else {
            message.warning('数据格式异常')
          }
        }
      } catch (error) {
        console.error('实验流程管理 - 数据加载失败:', error)
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
      this.modalTitle = '新增实验流程'
      this.isEdit = false
      this.resetForm()
      this.modalVisible = true
    },
    
    handleEdit(record) {
      this.modalTitle = '编辑实验流程'
      this.isEdit = true
      this.formData = { ...record }
      this.modalVisible = true
    },
    
    async handleDelete(record) {
      try {
        const response = await exp_flow_delete(record)
        console.log('实验流程管理 - 删除响应:', response)
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          message.success('删除成功')
          this.loadData()
        } else {
          message.error('删除失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('实验流程管理 - 删除失败:', error)
        message.error('删除失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    async handleOk() {
      try {
        let response
        if (this.isEdit) {
          response = await exp_flow_edit(this.formData)
          console.log('实验流程管理 - 编辑响应:', response)
        } else {
          response = await exp_flow_add(this.formData)
          console.log('实验流程管理 - 新增响应:', response)
        }
        
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          message.success(this.isEdit ? '更新成功' : '新增成功')
          this.modalVisible = false
          this.loadData()
        } else {
          message.error('保存失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('实验流程管理 - 保存失败:', error)
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
        status: 0,
        sort: 1,
        remark: ''
      }
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
