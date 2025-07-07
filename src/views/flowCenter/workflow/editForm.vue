<template>
  <a-modal
    :title="'修改申请:'+customName"
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
              <a-form-item
                label="下一步审核人"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
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
            </a-form>
          </div>
        </template>
      </x-card> 
      <a-tabs :default-active-key="defaultActive" @change="callback">
        <a-tab-pane key="1" tab="表单信息" :force-render="true">
          <a-form ref="formRef" :model="formData">
            <a-form-item v-show="webId == 'kfp'" v-if="frmType == 0">
              <k-form-build :value="jsonData" :config="config" ref="kfp" />
            </a-form-item>
            <a-form-item v-else>
              <component :is="webId" ref="cfp" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="流程信息" :force-render="true">
          <a-card :bordered="false">
            <vfd ref="vfd" style="background-color: white;" :needShow="false" :fieldNames="fieldNames" />
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <user-list-form ref="userListForm" @ok="handleOk" />
    <role-list-form ref="roleListForm" @ok="handleOk" />
  </a-modal>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import store from '@/store'
import { vfd, XCard } from '@/components'
import 'k-form-design/styles/k-form-design.less'
import userListForm from '@/views/system/user/userListForm'
import roleListForm from '@/views/system/role/roleListForm'
import { flowinstanceEdit, getFlowinstance } from '@/api/modular/flowCenter/flowinstanceManage'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'EditForm'
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

const config = reactive({
  uploadFileHeaders: { Authorization: 'Bearer ' + store.getters.token },
  uploadImageHeaders: { Authorization: 'Bearer ' + store.getters.token }
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
const frmType = ref(0)
const fieldNames = ref([])
const nextNodeDesignates = ref([])
const nextMakerName = ref('')
const webId = ref(null)
const nextNodeDesignateType = ref(null)
const code = ref(null)
const customName = ref(null)
const schemeContent = ref(null)
const schemeId = ref(null)
const frmId = ref(null)
const id = ref(null)
const formRef = ref(null)

const formData = reactive({})

const edit = (record) => {
  code.value = record.code
  customName.value = record.customName
  frmType.value = record.frmType
  schemeContent.value = record.schemeContent
  
  const queryParam = {}
  queryParam.id = record.id
  id.value = record.id
  frmId.value = record.frmId
  schemeId.value = record.schemeId
  
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
    record.NextMakerName = res.data.nextMakerName
    visible.value = true
    formLoading.value = false
    nextNodeDesignateType.value = record.nextNodeDesignateType
    
    switch (nextNodeDesignateType.value) {
      case "ALL_USER":
        nextMakerName.value = "所有人"
        break
      case "RUNTIME_SPECIAL_USER":
        nextMakerName.value = ""
        break
      case "RUNTIME_SPECIAL_ROLE":
        nextMakerName.value = ""
        break
      default:
        nextMakerName.value = record.nextMakerName
        break
    }
    
    jsonData.value = record.frmContent ? JSON.parse(record.frmContent) : {}
    frmData.value = JSON.parse(record.frmData)
    
    setTimeout(() => {
      importData()
      fieldNames.value = JSON.parse(record.frmContentParse)
    }, 100)
  })
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
      } else {
        setTimeout(() => {
          proxy.$refs.kfp.setData(frmData.value)
        }, 100)
      }
    } else {
      if (!!proxy.$refs.cfp) {
        proxy.$refs.cfp.setData(frmData.value)
      } else {
        setTimeout(() => {
          proxy.$refs.cfp.setData(frmData.value)
        }, 100)
      }
    }
  } else {
    if (!!proxy.$refs.vfd) {
      proxy.$refs.vfd.clear()
    }
  }
}

const callback = (key) => {
  defaultActive.value = key
  setTimeout(() => {
    importData()
  }, 100)
}

const getPreviewData = () => {
  let webIdRef = webId.value
  if (webIdRef != 'kfp') {
    webIdRef = 'cfp'
  }
  
  proxy.$refs[webIdRef].getData().then(values => {
    const frmDataStr = JSON.stringify(values)
    const input = {}
    input.frmId = frmId.value
    input.schemeId = Number(schemeId.value)
    input.frmData = frmDataStr
    input.id = id.value
    input.nextNodeDesignateType = nextNodeDesignateType.value
    input.nextNodeDesignates = nextNodeDesignates.value
    input.code = code.value
    input.customName = customName.value
    
    flowinstanceEdit(input).then((res) => {
      if (res.success) {
        message.success('修改成功')
        emit('ok', values)
        handleCancel()
        if (webId.value == 'kfp') {
          proxy.$refs['kfp'].reset()
        }
      } else {
        message.error('修改失败::' + res.message)
      }
    })
  }).catch(() => {
    message.error('验证未通过,获取失败')
  })
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

const handleSubmit = () => {
  confirmLoading.value = true
  getPreviewData()
  confirmLoading.value = false
}

const handleCancel = () => {
  if (formRef.value) {
    formRef.value.resetFields()
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
