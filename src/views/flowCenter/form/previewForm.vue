<template>
  <a-modal
    :title="'预览表单:'+name"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="formData">
        <a-form-item name="id" style="display: none;">
          <a-input v-model:value="formData.id" />
        </a-form-item>
        <a-form-item name="name" style="display: none;">
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item name="content" style="display: none;">
          <a-input v-model:value="formData.content" />
        </a-form-item>
        <a-form-item name="contentData" style="display: none;">
          <a-input v-model:value="formData.contentData" />
        </a-form-item>
        <a-form-item name="fields" style="display: none;">
          <a-input v-model:value="formData.fields" />
        </a-form-item>
        <a-form-item v-show="webId == 'kfp'" v-if="frmType == 0">
          <k-form-build :value="jsonData" ref="kfp" />
        </a-form-item>
        <a-form-item v-else>
          <component :value="jsonData" :is="webId" ref="cfp" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import 'k-form-design/styles/k-form-design.less'
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

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 }
})

const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 15 }
})

const visible = ref(false)
const confirmLoading = ref(false)
const frmType = ref(0)
const formLoading = ref(true)
const webId = ref(null)
const jsonData = ref({})
const name = ref(null)
const formRef = ref(null)

const formData = reactive({
  id: null,
  name: '',
  content: '',
  contentParse: '',
  contentData: '',
  fields: ''
})

const edit = (record) => {
  visible.value = true
  formLoading.value = false
  name.value = record.name
  frmType.value = record.frmType
  webId.value = record.webId
  jsonData.value = JSON.parse(record.content)
  
  if (record.frmType == 0) {
    webId.value = 'kfp'
  }
  
  setTimeout(() => {
    formData.id = record.id
    formData.name = record.name
    formData.content = record.content
    formData.contentParse = record.contentParse
    formData.contentData = record.contentData
    formData.fields = record.fields
  }, 100)
}

const getPreviewData = () => {
  // 使用getData函数获取数据
  let webIdRef = webId.value
  if (webIdRef != 'kfp') {
    webIdRef = 'cfp'
  }
  
  proxy.$refs[webIdRef].getData().then(values => {
    message.success('验证通过:' + JSON.stringify(values))
  }).catch(() => {
    message.error('验证未通过,获取失败')
  })
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
}

defineExpose({
  edit
})
</script>
