<template>
  <div class="flow-design-page">
    <a-card :bordered="false">
      <div class="page-header">
        <h2>流程设计</h2>
        <p>在这里可以创建和管理各种业务流程</p>
      </div>
      
      <div class="action-bar">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <plus-outlined ></plus>
            </template>
            新建流程
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon>
              <reload-outlined ></reload>
            </template>
            刷新
          </a-button>
        </a-space>
      </div>

      <div class="flow-list">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="flow in flowList" :key="flow.id">
            <a-card 
              hoverable 
              :bodyStyle="{ padding: '16px' }"
              @click="handleEdit(flow)"
            >
              <template #cover>
                <div class="flow-cover">
                  <apartment-outlined style="font-size: 48px; color: #1890ff;" ></apartment>
                </div>
              </template>
              
              <a-card-meta 
                :title="flow.name" 
                :description="flow.description"
              ></a>
              
              <template #actions>
                <edit-outlined @click.stop="handleEdit(flow)" title="编辑" ></edit>
                <copy-outlined @click.stop="handleCopy(flow)" title="复制" ></copy>
                <delete-outlined @click.stop="handleDelete(flow)" title="删除" ></delete>
              </template>
            </a-card>
          </a-col>
        </a-row>

        <!-- 空状态 -->
        <a-empty 
          v-if="flowList.length === 0" 
          description="暂无流程设计"
          style="margin: 40px 0;"
        >
          <a-button type="primary" @click="handleCreate">立即创建</a-button>
        </a-empty>
      </div>
    </a-card>
    
    <!-- 新建/编辑流程弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingFlow : '编辑流程' : '新建流程'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="流程名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入流程名称" ></a>
        </a-form-item>
        
        <a-form-item label="流程描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请输入流程描述"
            :rows="3"
          ></a>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { 
  PlusOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  ApartmentOutlined 
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

export default {
  name: 'FlowDesign',
  components: {
    PlusOutlined,
    ReloadOutlined,
    EditOutlined,
    CopyOutlined,
    DeleteOutlined,
    ApartmentOutlined
  },
  data() {
    return {
      flowList: [
        {
          id: 1,
          name: '实验审批流程',
          description: '实验项目申请和审批的标准流程'
        },
        {
          id: 2,
          name: '设备使用流程',
          description: '实验设备申请使用的管理流程'
        },
        {
          id: 3,
          name: '样本处理流程',
          description: '生物样本采集、处理和存储流程'
        }
      ],
      modalVisible: false,
      editingFlow: null,
      submitLoading: false,
      formData: {
        name: '',
        description: ''
      },
      formRules: {
        name: [
          { required: true, message: '请输入流程名称', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    console.log('🔍 FlowDesign 页面已加载')
    this.loadFlowList()
  },
  methods: {
    // 加载流程列表
    loadFlowList() {
      // 这里应该调用API获取流程列表
      console.log('🔍 加载流程列表')
    },
    
    // 新建流程
    handleCreate() {
      this.editingFlow = null
      this.formData = {
        name: '',
        description: ''
      }
      this.modalVisible = true
    },
    
    // 编辑流程
    handleEdit(flow) {
      console.log('🔍 编辑流程:', flow)
      this.editingFlow = flow
      this.formData = {
        name: flow.name,
        description: flow.description
      }
      this.modalVisible = true
    },
    
    // 复制流程
    handleCopy(flow) {
      console.log('🔍 复制流程:', flow)
      message.success('流程复制成功')
    },
    
    // 删除流程
    handleDelete(flow) {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除流程 "${flow.name}" 吗`,
        onOk: () => {
          console.log('🔍 删除流程:', flow)
          message.success('流程删除成功')
          // 这里应该调用API删除流程
        }
      })
    },
    
    // 刷新列表
    handleRefresh() {
      console.log('🔍 刷新流程列表')
      this.loadFlowList()
      message.success('刷新成功')
    },
    
    // 提交表单
    async handleSubmit() {
      try {
        await this.$refs.formRef.validateFields()
        this.submitLoading = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (this.editingFlow) {
          console.log('🔍 更新流程:', this.formData)
          message.success('流程更新成功')
        } else {
          console.log('🔍 创建流程:', this.formData)
          message.success('流程创建成功')
        }
        
        this.modalVisible = false
        this.loadFlowList()
      } catch (error) {
        console.error('表单验证失败:', error)
      } finally {
        this.submitLoading = false
      }
    },
    
    // 取消编辑
    handleCancel() {
      this.modalVisible = false
      this.editingFlow = null
    }
  }
}
</script>

<style lang="less" scoped>
.flow-design-page {
  .page-header {
    margin-bottom: 24px;
    
    h2 {
      margin-bottom: 8px;
      color: #262626;
    }
    
    p {
      color: #8c8c8c;
      margin-bottom: 0;
    }
  }
  
  .action-bar {
    margin-bottom: 24px;
  }
  
  .flow-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: #f5f5f5;
  }
  
  .flow-list {
    .ant-card {
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
