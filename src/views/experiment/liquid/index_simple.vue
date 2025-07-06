<template>
  <div style="padding: 20px;">
    <h1>试剂管理页面</h1>
    <p>如果您能看到此页面，说明路由工作正常。</p>
    
    <!-- 搜索区域 -->
    <a-card title="搜索条件" style="margin-bottom: 16px;">
      <a-form layout="inline">
        <a-form-item label="试剂编号">
          <a-input v-model:value="queryParam.code" placeholder="请输入试剂编号" allow-clear />
        </a-form-item>
        <a-form-item label="试剂名称">
          <a-input v-model:value="queryParam.name" placeholder="请输入试剂名称" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card title="试剂列表">
      <div style="margin-bottom: 16px;">
        <a-button type="primary" @click="showModal">新增试剂</a-button>
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
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pageNum - 1) * pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status == 0 ? 'green' : 'red'">
              {{ record.status == 0 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="editRecord(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确认删除？" @confirm="deleteRecord(record)">
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
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="试剂编号" required>
          <a-input v-model:value="formData.code" placeholder="请输入试剂编号" />
        </a-form-item>
        <a-form-item label="试剂名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入试剂名称" />
        </a-form-item>
        <a-form-item label="吸液偏移(mm)">
          <a-input-number v-model:value="formData.absorbOffset" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="喷液偏移(mm)">
          <a-input-number v-model:value="formData.jetOffset" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="formData.status" style="width: 100%">
            <a-select-option :value="0">正常</a-select-option>
            <a-select-option :value="1">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { exp_liquid_page, exp_liquid_add, exp_liquid_edit, exp_liquid_delete } from '@/api/modular/experiment/liquidManage'

export default {
  name: 'LiquidManagementSimple',
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
          title: '试剂编号',
          dataIndex: 'code',
          key: 'code',
          align: 'center'
        },
        {
          title: '试剂名称',
          dataIndex: 'name',
          key: 'name',
          align: 'center'
        },
        {
          title: '吸液偏移(mm)',
          dataIndex: 'absorbOffset',
          key: 'absorbOffset',
          align: 'center'
        },
        {
          title: '喷液偏移(mm)',
          dataIndex: 'jetOffset',
          key: 'jetOffset',
          align: 'center'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 80
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 120
        }
      ],
      modalVisible: false,
      modalTitle: '新增试剂',
      isEdit: false,
      formData: {
        id: null,
        code: '',
        name: '',
        absorbOffset: 0,
        jetOffset: 0,
        status: 0,
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
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          ...this.queryParam
        }
        console.log('试剂管理 - 请求参数:', params)
        
        const response = await exp_liquid_page(params)
        console.log('试剂管理 - API响应:', response)
        
        // 根据实际API响应格式处理数据
        if (response && response.success) {
          const data = response.data
          // 支持多种数据格式
          this.dataSource = data.records || data.data || data || []
          this.total = data.totalCount || data.total || data.totalElements || 0
          this.pageNum = data.pageNum || data.current || this.pageNum
          this.pageSize = data.pageSize || data.size || this.pageSize
          
          console.log('试剂管理 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total,
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
        } else {
          console.warn('试剂管理 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
        }
      } catch (error) {
        console.error('试剂管理 - 数据加载失败:', error)
        this.$message.error('数据加载失败: ' + (error.message || error))
        
        // 如果是网络错误或服务器错误，显示一些模拟数据用于测试界面
        console.log('试剂管理 - 使用模拟数据进行界面测试')
        this.dataSource = [
          {
            id: 1,
            code: 'TEST001',
            name: '测试试剂A',
            absorbOffset: 1.5,
            jetOffset: 2.0,
            absorbAirBeforePercent: 5.0,
            absorbAirAfterPercent: 3.0,
            status: 0,
            remark: '这是测试数据'
          },
          {
            id: 2,
            code: 'TEST002', 
            name: '测试试剂B',
            absorbOffset: 1.8,
            jetOffset: 2.2,
            absorbAirBeforePercent: 4.5,
            absorbAirAfterPercent: 3.5,
            status: 1,
            remark: '这是测试数据'
          }
        ]
        this.total = 2
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
    
    showModal() {
      this.modalTitle = '新增试剂'
      this.isEdit = false
      this.resetForm()
      this.modalVisible = true
    },
    
    editRecord(record) {
      this.modalTitle = '编辑试剂'
      this.isEdit = true
      this.formData = { ...record }
      this.modalVisible = true
    },
    
    async deleteRecord(record) {
      try {
        await exp_liquid_delete(record)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        this.$message.error('删除失败: ' + (error.message || error))
      }
    },
    
    async handleOk() {
      try {
        if (this.isEdit) {
          await exp_liquid_edit(this.formData)
          this.$message.success('更新成功')
        } else {
          await exp_liquid_add(this.formData)
          this.$message.success('新增成功')
        }
        this.modalVisible = false
        this.loadData()
      } catch (error) {
        this.$message.error('保存失败: ' + (error.message || error))
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
        absorbOffset: 0,
        jetOffset: 0,
        status: 0,
        remark: ''
      }
    }
  }
}
</script>

<style scoped>
.ant-card {
  margin-bottom: 16px;
}
</style>
