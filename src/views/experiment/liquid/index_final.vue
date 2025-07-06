<template>
  <div style="padding: 20px;">
    <h2>试剂管理</h2>
    
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
        <a-button type="primary" @click="showModal" v-if="hasPerm('exp_liquid:add')">新增试剂</a-button>
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
              {{ record.status == 0 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="editRecord(record)" v-if="hasPerm('exp_liquid:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('exp_liquid:edit') && hasPerm('exp_liquid:delete')" />
            <a-popconfirm title="确认删除？" @confirm="deleteRecord(record)" v-if="hasPerm('exp_liquid:delete')">
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
            <a-form-item label="试剂编号" required>
              <a-input v-model:value="formData.code" placeholder="请输入试剂编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="试剂名称" required>
              <a-input v-model:value="formData.name" placeholder="请输入试剂名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="吸液偏移(mm)">
              <a-input-number v-model:value="formData.absorbOffset" :min="0" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="喷液偏移(mm)">
              <a-input-number v-model:value="formData.jetOffset" :min="0" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="吸液前吸空气量(%)">
              <a-input-number v-model:value="formData.absorbAirBeforePercent" :min="0" :max="100" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="吸液后吸空气量(%)">
              <a-input-number v-model:value="formData.absorbAirAfterPercent" :min="0" :max="100" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="formData.status" style="width: 100%">
                <a-select-option :value="0">正常</a-select-option>
                <a-select-option :value="1">停用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { exp_liquid_page, exp_liquid_add, exp_liquid_edit, exp_liquid_delete } from '@/api/modular/experiment/liquidManage'
import { hasPerm } from '@/utils/permissions'

export default {
  name: 'LiquidManagementFixed',
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
          title: '吸液前空气量(%)',
          dataIndex: 'absorbAirBeforePercent',
          key: 'absorbAirBeforePercent',
          align: 'center'
        },
        {
          title: '吸液后空气量(%)',
          dataIndex: 'absorbAirAfterPercent',
          key: 'absorbAirAfterPercent',
          align: 'center'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 80
        }
        // 操作列将在mounted中根据权限动态添加
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
        absorbAirBeforePercent: 0,
        absorbAirAfterPercent: 0,
        status: 0,
        remark: ''
      }
    }
  },
  mounted() {
    // 根据权限动态添加操作列
    if (this.hasPerm('exp_liquid:edit') || this.hasPerm('exp_liquid:delete')) {
      // 检查是否已经有操作列
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
    async loadData() {
      try {
        this.loading = true
        // 根据旧项目的参数格式构建请求参数
        const params = {
          ...this.queryParam,
          page: this.pageNum,  // 旧项目使用 page 参数
          pageSize: this.pageSize
        }
        console.log('试剂管理 - 请求参数:', params)
        
        const response = await exp_liquid_page(params)
        console.log('试剂管理 - API响应:', response)
        
        // 根据旧项目的数据格式处理响应
        if (response && response.data) {
          // 旧项目数据格式: res.data.rows 和 res.data.totalRows
          this.dataSource = response.data.rows || response.data.records || response.data.data || []
          this.total = response.data.totalRows || response.data.totalCount || response.data.total || 0
          
          console.log('试剂管理 - 解析数据:', {
            dataSource: this.dataSource,
            total: this.total,
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
          
          // 如果没有数据，显示提示
          if (this.dataSource.length === 0) {
            console.log('试剂管理 - 没有找到数据')
            this.$message.info('暂无试剂数据')
          } else {
            console.log('试剂管理 - 成功加载数据，共', this.dataSource.length, '条记录')
          }
        } else {
          console.warn('试剂管理 - API响应格式异常:', response)
          this.dataSource = []
          this.total = 0
          if (response && response.message) {
            this.$message.warning('API返回: ' + response.message)
          } else {
            this.$message.warning('数据格式异常')
          }
        }
      } catch (error) {
        console.error('试剂管理 - 数据加载失败:', error)
        this.$message.error('数据加载失败: ' + (error.response?.data?.message || error.message || error))
        
        // 清空数据
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
        const response = await exp_liquid_delete(record)
        console.log('试剂管理 - 删除响应:', response)
        
        // 检查响应格式（可能是 success 字段或直接成功）
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error('删除失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('试剂管理 - 删除失败:', error)
        this.$message.error('删除失败: ' + (error.response?.data?.message || error.message || error))
      }
    },
    
    async handleOk() {
      try {
        let response
        if (this.isEdit) {
          response = await exp_liquid_edit(this.formData)
          console.log('试剂管理 - 编辑响应:', response)
        } else {
          response = await exp_liquid_add(this.formData)
          console.log('试剂管理 - 新增响应:', response)
        }
        
        // 检查响应格式（可能是 success 字段或直接成功）
        if (response && (response.success !== false || response.code === 200 || response.status === 'success')) {
          this.$message.success(this.isEdit ? '更新成功' : '新增成功')
          this.modalVisible = false
          this.loadData()
        } else {
          this.$message.error('保存失败: ' + (response.message || response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('试剂管理 - 保存失败:', error)
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
        code: '',
        name: '',
        absorbOffset: 0,
        jetOffset: 0,
        absorbAirBeforePercent: 0,
        absorbAirAfterPercent: 0,
        status: 0,
        remark: ''
      }
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
</style>
