<template>
  <a-modal
    :title="'设计表单:'+name"
    :width="'90%'"
    :height="100"
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
        <a-form-item name="orgId" style="display: none;">
          <a-input v-model:value="formData.orgId" />
        </a-form-item>
        <a-form-item name="sort" style="display: none;">
          <a-input v-model:value="formData.sort" />
        </a-form-item>
        <a-form-item name="remark" style="display: none;">
          <a-input v-model:value="formData.remark" />
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
        <a-form-item name="contentParse" style="display: none;">
          <a-input v-model:value="formData.contentParse" />
        </a-form-item>
        <a-form-item name="fields" style="display: none;">
          <a-input v-model:value="formData.fields" />
        </a-form-item>
        <a-form-item>
          <k-form-design 
            :showHead="false" 
            :toolbars="['reset', 'importJson','exportJson', 'preview','exportCode']" 
            style="background-color: white;" 
            ref="kfd" 
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<style scoped>
.centered-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-modal) {
  top: 0;
  padding-bottom: 0;
  margin: 0 auto;
}

:deep(.ant-modal-content) {
  margin-top: 0;
}
</style>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import 'k-form-design/styles/k-form-design.less'
import { flcFormEdit } from '@/api/modular/flowCenter/formManage'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'DesignForm'
})

const emit = defineEmits(['ok'])
const { proxy } = getCurrentInstance()

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
const formLoading = ref(true)
const name = ref(null)
const formRef = ref(null)
const content = ref(null)
const contentData = ref(null)
const contentParse = ref(null)
const fields = ref(null)

const formData = reactive({
  id: null,
  name: '',
  content: '',
  contentParse: '',
  contentData: '',
  frmType: 0,
  webId: '',
  orgId: null,
  sort: 100,
  active: 1,
  remark: '',
  fields: 0
})

const edit = (record) => {
  visible.value = true
  formLoading.value = false
  name.value = record.name
  
  setTimeout(() => {
    formData.id = record.id
    formData.name = record.name
    formData.content = record.content
    formData.contentParse = record.contentParse
    formData.contentData = record.contentData
    formData.frmType = record.frmType
    formData.webId = record.webId
    formData.orgId = (!!record.orgId && record.orgId != 0) ? record.orgId : null
    formData.sort = record.sort
    formData.active = record.active
    formData.remark = record.remark
    
    importData(record.content)
  }, 100)
}

const importData = (value) => {
  if (!!value) {
    proxy.$refs.kfd.handleSetData(JSON.parse(value))
  }
}

const getDesignData = () => {
  const kfd = proxy.$refs.kfd
  const fieldData = kfd.getFieldSchema()
  const fieldsArray = []
  const fieldsParse = []
  
  fieldData.forEach(item => {
    const tempData = {}
    tempData.id = item.key
    if (!!item.model) {
      tempData.id = item.model
    }
    tempData.name = item.label
    fieldsParse.push(tempData)
    fieldsArray.push(tempData.id)
  })
  
  content.value = fieldsArray.length > 0 ? JSON.stringify(kfd.getValue()) : null
  contentData.value = fieldsArray.length > 0 ? fieldsArray.join(",") : null
  contentParse.value = fieldsParse.length > 0 ? JSON.stringify(fieldsParse) : null
  fields.value = fieldData.length
  
  formData.content = content.value
  formData.contentData = contentData.value
  formData.contentParse = contentParse.value
  formData.fields = fields.value
}

const handleSubmit = async () => {
  try {
    confirmLoading.value = true
    getDesignData()
    
    const res = await flcFormEdit(formData)
    if (res.success) {
      message.success('设计成功')
      visible.value = false
      emit('ok', formData)
      if (formRef.value) {
        formRef.value.resetFields()
      }
    } else {
      message.error('设计失败::' + res.message)
    }
  } catch (error) {
    console.error('Form submission failed:', error)
  } finally {
    confirmLoading.value = false
  }
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
