<template>
  <a-modal
    :title="'处理申请:'+customName"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <x-card>
        <template #content>
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-col :md="12" :sm="12">
                <a-form-item
                  label="审核结果"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  has-feedback
                >
                  <a-select placeholder="审核结果"
                    v-model:value="verificationFinally" @change="e => conditionChange(e)">
                    <a-select-option
                      v-for="(condition,index) in conditions"
                      :key="index"
                      :value="condition.id">{{ condition.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="12" :sm="12">
                <a-form-item
                  label="审核意见"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  has-feedback
                >
                  <a-input placeholder="审核意见" v-model:value="verificationOpinion" />
                </a-form-item>
              </a-col>
              <a-col :md="24" :sm="24">
                <a-form-item v-if="(nextNodeDesignateType=='RUNTIME_SPECIAL_USER'||nextNodeDesignateType=='RUNTIME_SPECIAL_ROLE') && verificationFinally =='1'"
                  label="下一步审核人" :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  has-feedback
                >
                  <a-col :md="18" :sm="18">
                    <a-input :disabled="true" placeholder="请选择下一步审核人:" v-model:value="nextMakerName" />
                  </a-col>
                  <a-col v-show="nextNodeDesignateType=='RUNTIME_SPECIAL_USER'||nextNodeDesignateType=='RUNTIME_SPECIAL_ROLE'" :md="6" :sm="6">
                    <a-button @click="setUser()">
                      <template #icon><search-outlined /></template>
                    </a-button>
                  </a-col>
                </a-form-item>
              </a-col>
            </a-form>
          </div>
        </template>
      </x-card>
      <a-tabs :default-active-key="defaultActive" @change="callback">
        <a-tab-pane key="1" tab="表单信息" :force-Render="true">
          <a-form :form="form">
            <a-form-item v-show="webId == 'kfp'" v-if="frmType == 0">
              <k-form-build :value="jsonData" ref='kfp' />
            </a-form-item>
            <a-form-item v-else>
              <component :is="webId" ref="cfp" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="流程信息" :force-Render="true">
          <a-card :bordered="false">
            <vfd ref="vfd" style="background-color: white;" :needShow="false" :activityId="activityId" :fieldNames="fieldNames" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="3" tab="流转信息" :force-Render="true">
          <a-table :columns="columns" :data-source="hisList" />
        </a-tab-pane>
      </a-tabs>      
    </a-spin>
    <user-list-form ref="userListForm" @ok="handleOk" />
    <role-list-form ref="roleListForm" @ok="handleOk" />
  </a-modal>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { vfd, XCard } from '@/components'
import 'k-form-design/styles/k-form-design.less'
import userListForm from '@/views/system/user/userListForm'
import roleListForm from '@/views/system/role/roleListForm'
import { flowinstanceVerification, getFlowinstance } from '@/api/modular/flowCenter/flowinstanceManage'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'VerificationForm'
})

const emit = defineEmits(['ok'])
const { proxy } = getCurrentInstance()

// 批量引用
const ctx = require.context('@/views/flowCenter/custom/', true, /\.vue$/)
const routes = {}
ctx.keys().forEach(key => {
  const name = key.split("/")[1].split(".")[0]
  routes[name] = ctx(key).default || ctx(key)
})

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 }
})

const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 15 }
})

const defaultActive = ref(1)
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(true)
const jsonData = ref({})
const frmData = ref({})
const frmContentData = ref([])
const frmType = ref(0)
const fieldNames = ref([])
const nextNodeDesignates = ref([])
const nextMakerName = ref('')
const webId = ref(null)
const nextNodeDesignateType = ref(null)
const customName = ref(null)
const schemeContent = ref(null)
const activityId = ref(null)
const schemeId = ref(null)
const frmId = ref(null)
const form = ref(null)
const verificationFinally = ref("1")
const verificationOpinion = ref(null)
const flowInstanceId = ref(null)
const hisList = ref([])
const nodeRejectStep = ref(null)
const nodeRejectType = ref(null)

const conditions = ref([
  { id: '1', name: '同意' },
  { id: '2', name: '不同意' },
  { id: '3', name: '驳回' }
])

const columns = ref([
  {
    title: '操作信息',
    dataIndex: 'content'
  },
  {
    title: '操作时间',
    dataIndex: 'createdTime'
  },
  {
    title: '操作人',
    dataIndex: 'createdUserName'
  }
])

const edit = (record) => {
  customName.value = record.customName
  frmType.value = record.frmType
  schemeContent.value = record.schemeContent
  const queryParam = {}
  queryParam.id = record.id
  flowInstanceId.value = record.id
  frmId.value = record.frmId
  schemeId.value = record.id
  activityId.value = record.activityId
  nodeRejectStep.value = record.nodeRejectStep
  nodeRejectType.value = record.nodeRejectType
  
  getFlowinstance(queryParam).then(res => {
    if (!res.success) {
      return
    }
    webId.value = res.data.webId
    if (record.frmType == 0) {
      webId.value = 'kfp'
    }
    record.nextNodeDesignateType = res.data.nextNodeDesignateType
    record.nextNodeDesignates = res.data.nextNodeDesignates
    record.nextMakerName = res.data.nextMakerName
    visible.value = true
    formLoading.value = false
    nextNodeDesignateType.value = record.nextNodeDesignateType
    hisList.value = res.data.hisList
    
    switch (nextNodeDesignateType.value) {
      case "ALL_USER":
        nextMakerName.value = "所有人"
        break
      default:
        nextMakerName.value = record.nextMakerName
        break
    }
    
    jsonData.value = record.frmContent ? JSON.parse(record.frmContent) : {}
    frmData.value = JSON.parse(record.frmData)
    frmContentData.value = record.frmContentData.split(",")
    
    setTimeout(() => {
      importData()
      fieldNames.value = JSON.parse(record.frmContentParse)
    }, 100)
  })
}

const conditionChange = (e) => {
  // Handle condition change
}

const importData = () => {
  if (defaultActive.value == 2) {
    if (!!schemeContent.value) {
      if (!!proxy.$refs.vfd) {
        proxy.$refs.vfd.loadFlow(schemeContent.value)
      } else {
        setTimeout(() => {
          proxy.$refs.vfd.loadFlow(schemeContent.value)
        }, 100)
      }
    } else {
      proxy.$refs.vfd.clear()
    }
  } else if (defaultActive.value == 1) {
    if (!!proxy.$refs.vfd) {
      proxy.$refs.vfd.clear()
    }
    if (webId.value == 'kfp') {
      if (!!proxy.$refs.kfp) {
        proxy.$refs.kfp.setData(frmData.value)
        proxy.$refs.kfp.disable(frmContentData.value)
      } else {
        setTimeout(() => {
          proxy.$refs.kfp.setData(frmData.value)
          proxy.$refs.kfp.disable(frmContentData.value)
        }, 100)
      }
    } else {
      if (!!proxy.$refs.cfp) {
        proxy.$refs.cfp.setData(frmData.value)
        proxy.$refs.cfp.disable(frmContentData.value)
      } else {
        setTimeout(() => {
          proxy.$refs.cfp.setData(frmData.value)
          proxy.$refs.cfp.disable(frmContentData.value)
        }, 100)
      }
    }
  } else {
    if (!!proxy.$refs.vfd) {
      proxy.$refs.vfd.clear()
    }
  }
}

const setUser = () => {
  if (nextNodeDesignateType.value == "RUNTIME_SPECIAL_USER") {
    proxy.$refs.userListForm.userList()
  } else if (nextNodeDesignateType.value == "RUNTIME_SPECIAL_ROLE") {
    proxy.$refs.roleListForm.roleList()
  }
}

const handleOk = (record) => {
  if (!!record) {
    const nodeDesignateData = []
    const nodeDesignateName = []
    record.forEach(item => {
      nodeDesignateData.push(item.id.toString())
      nodeDesignateName.push(item.name)
    })

    if (nodeDesignateName.length > 0) {
      nextMakerName.value = nodeDesignateName.join(',')
      nextNodeDesignates.value = nodeDesignateData
    }
  }
}

const callback = (key) => {
  defaultActive.value = key
  setTimeout(() => {
    importData()
  }, 100)
}

const handleSubmit = () => {
  confirmLoading.value = true
  const input = {}
  input.flowInstanceId = flowInstanceId.value
  input.verificationFinally = verificationFinally.value
  input.verificationOpinion = verificationOpinion.value
  input.nodeRejectStep = nodeRejectStep.value
  input.nodeRejectType = nodeRejectType.value
  input.nodeDesignateType = nextNodeDesignateType.value
  input.nodeDesignates = nextNodeDesignates.value
  
  flowinstanceVerification(input).then((res) => {
    if (res.success) {
      message.success('审核成功')
      emit('ok')
      handleCancel()
      if (webId.value == 'kfp') {
        proxy.$refs['kfp'].reset()
      }
    } else {
      message.error('审核失败::' + res.message)
    }
  })
  confirmLoading.value = false
}

const handleCancel = () => {
  if (form.value) {
    form.value.resetFields()
  }
  visible.value = false
  if (!!proxy.$refs.vfd) {
    proxy.$refs.vfd.clear()
  }
}

defineExpose({
  edit
})
</script>
