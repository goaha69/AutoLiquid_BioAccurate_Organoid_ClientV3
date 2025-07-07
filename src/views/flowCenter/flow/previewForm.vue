<template>
  <a-modal 
    :title="'预览流程:'+schemeName" 
    :width="'90%'" 
    :height="100" 
    :open="visible" 
    :confirmLoading="confirmLoading" 
    :destroyOnClose="true" 
    @ok="handleSubmit"  
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-tabs :default-active-key="defaultActive" @change="callback">
        <a-tab-pane key="1" tab="表单信息" :force-render="true">
          <a-form ref="formRef" :model="formData" :style="{ width: '900px' }">
            <a-form-item name="id" style="display: none;">
              <a-input v-model:value="formData.id" />
            </a-form-item>
            <a-form-item name="schemeName" style="display: none;">
              <a-input v-model:value="formData.schemeName" />
            </a-form-item>
            <a-form-item name="frmId" style="display: none;">
              <a-input v-model:value="formData.frmId" />
            </a-form-item>
            <a-form-item v-show="webId == 'kfp'" v-if="frmType == 0">
              <k-form-build :value="jsonData" ref="kfp" />
            </a-form-item>
            <a-form-item v-else>
              <component :value="jsonData" :is="webId" ref="cfp" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="流程信息" :force-render="true">
          <vfd ref="vfd" style="background-color: white;" :needShow="false" :fieldNames="fieldNames" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <user-list-form ref="userListForm" @ok="handleOk" />
    <role-list-form ref="roleListForm" @ok="handleOk" />
  </a-modal>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { vfd } from '@/components'
import 'k-form-design/styles/k-form-design.less'
import userListForm from '@/views/system/user/userListForm'
import roleListForm from '@/views/system/role/roleListForm'
import { getFlcFlowscheme } from '@/api/modular/flowCenter/flowManage'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'PreviewForm'
})

const { proxy } = getCurrentInstance()

// 批量引用
const ctx = require.context('@/views/flowCenter/custom/', true, /\.vue$/)
const routes = {}
ctx.keys().forEach(key => {
  const name = key.split('/')[1].split('.')[0]
  routes[name] = ctx(key).default || ctx(key)
})

const defaultActive = ref(1)
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(true)
const jsonData = ref({})
const frmType = ref(0)
const fieldNames = ref([])
const nextNodeDesignates = ref('')
const nextMakerName = ref('')
const webId = ref(null)
const nextNodeDesignateType = ref(null)
const schemeName = ref(null)
const schemeContent = ref(null)
const formRef = ref(null)

const formData = reactive({
  id: null,
  schemeName: '',
  frmId: null
})

const edit = (record) => {
  schemeName.value = record.schemeName
  frmType.value = record.frmType
  webId.value = record.webId
  
  if (record.frmType == 0) {
    webId.value = 'kfp'
  }
  
  schemeContent.value = record.schemeContent
  const queryParam = {}
  queryParam.id = record.id
  
  getFlcFlowscheme(queryParam).then(res => {
    if (!res.success) {
      return
    }
    if (!res.data.nextNodeDesignateType) {
      message.error('请先设计流程')
      return
    }
    
    record.nextNodeDesignateType = res.data.nextNodeDesignateType
    record.nextNodeDesignates = res.data.nextNodeDesignates
    record.NextMakerName = res.data.nextMakerName
    visible.value = true
    formLoading.value = false
    nextNodeDesignateType.value = record.nextNodeDesignateType
    
    switch (nextNodeDesignateType.value) {
      case 'ALL_USER':
        nextMakerName.value = '所有人'
        break
      case 'RUNTIME_SPECIAL_USER':
        nextMakerName.value = ''
        break
      case 'RUNTIME_SPECIAL_ROLE':
        nextMakerName.value = ''
        break
      default:
        nextMakerName.value = record.nextMakerName
        break
    }
    
    jsonData.value = !!record.content ? JSON.parse(record.content) : {}
    
    setTimeout(() => {
      formData.id = record.id
      formData.schemeName = record.schemeName
      formData.frmId = record.frmId
      
      importData(record.schemeContent)
      fieldNames.value = JSON.parse(record.contentParse)
    }, 100)
  })
}

const importData = (value) => {
  if (defaultActive.value == 2 && !!value) {
    proxy.$refs.vfd.loadFlow(value)
  } else {
    if (proxy.$refs.vfd) {
      proxy.$refs.vfd.clear()
    }
  }
}

const callback = (key) => {
  defaultActive.value = key
  setTimeout(() => {
    importData(schemeContent.value)
  }, 100)
}

const getPreviewData = () => {
  let webIdRef = webId.value
  if (webIdRef != 'kfp') {
    webIdRef = 'cfp'
  }
  
  proxy.$refs[webIdRef].getData().then(values => {
    message.success('验证通过:' + JSON.stringify(values))
    visible.value = false
    if (proxy.$refs.vfd) {
      proxy.$refs.vfd.clear()
    }
  }).catch(() => {
    message.error('验证未通过,获取失败')
  })
}

const setUser = () => {
  if (nextNodeDesignateType.value == 'RUNTIME_SPECIAL_USER') {
    proxy.$refs.userListForm.userList()
  } else if (nextNodeDesignateType.value == 'RUNTIME_SPECIAL_ROLE') {
    proxy.$refs.roleListForm.roleList()
  }
}

const handleOk = (value) => {
  if (value) {
    const nodeDesignateData = []
    const nodeDesignateName = []
    value.forEach(item => {
      nodeDesignateData.push(item.id)
      nodeDesignateName.push(item.name)
    })

    if (nodeDesignateName.length > 0) {
      nextMakerName.value = nodeDesignateName.join(',')
      nextNodeDesignates.value = nodeDesignateData.join(',')
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
  if (proxy.$refs.vfd) {
    proxy.$refs.vfd.clear()
  }
}

defineExpose({
  edit
})
</script>
