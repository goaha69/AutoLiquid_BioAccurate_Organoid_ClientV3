<template>
  <a-modal
    title="编辑表单"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="formData" :rules="formRules">
        <a-form-item name="id" style="display: none;">
          <a-input v-model:value="formData.id" />
        </a-form-item>
        <a-form-item
          label="机构"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          name="orgId"
        >
          <a-tree-select
            v-model:value="formData.orgId"
            style="width: 100%"
            :dropdownStyle="{ maxHeight: '300px', overflow: 'auto' }"
            :treeData="orgTree"
            placeholder="请选择机构"
            treeDefaultExpandAll
            @change="e => initrOrgName(e)"
          >
            <template #title="{ id }"><span>{{ id }}</span></template>
          </a-tree-select>
        </a-form-item>
        <a-form-item
          label="表单名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          name="name"
        >
          <a-input placeholder="请输入表单名:" v-model:value="formData.name" />
        </a-form-item>

        <a-form-item
          label="表单类型"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          name="frmType"
        >
          <a-select
            style="width: 100%"
            placeholder="请选择表单类型"
            @change="e => handleChange(e)"
            v-model:value="formData.frmType"
          >
            <a-select-option v-for="(item,indexs) in formTypeList" :key="indexs" :value="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="自定义表单路径"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          name="webId"
          v-show="webIdShow"
        >
          <a-input placeholder="请输入自定义表单路径" v-model:value="formData.webId" />
        </a-form-item>
        
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="排序"
          name="sort"
        >
          <a-input-number placeholder="请输入排序" style="width: 100%" v-model:value="formData.sort" :min="1" :max="1000" />
        </a-form-item>

        <a-form-item
          label="备注"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          name="remark"
        >
          <a-textarea :rows="4" placeholder="请输入备注" v-model:value="formData.remark" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { getOrgTree, getOrgList } from '@/api/modular/system/orgManage'
import { flcFormEdit } from '@/api/modular/flowCenter/formManage'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'EditForm'
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

const orgTree = ref([])
const orgList = ref([])
const selfForms = ref([])
const frmType = ref(0)
const formTypeList = ref([
  { id: 0, name: "动态表单" },
  { id: 1, name: "自定义表单" }
])
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(true)
const webIdShow = ref(false)
const formRef = ref(null)

const formData = reactive({
  id: null,
  name: '',
  frmType: 0,
  webId: '',
  orgId: null,
  sort: 100,
  active: 1,
  remark: ''
})

const formRules = reactive({
  name: [
    { required: true, message: '请输入表单名称!', trigger: 'blur' }
  ],
  frmType: [
    { required: true, message: '请选择表单类型', trigger: 'change' }
  ]
})

const edit = (record) => {
  visible.value = true
  getOrgDate()
  handleChange(record.frmType)
  
  setTimeout(() => {
    formData.id = record.id
    formData.name = record.name
    formData.frmType = record.frmType
    formData.webId = record.webId
    formData.orgId = (!!record.orgId && record.orgId != 0) ? record.orgId : null
    formData.sort = record.sort
    formData.active = record.active
    formData.remark = record.remark
  }, 100)
}

const handleChange = (value) => {
  if (value) {
    frmType.value = value
  }
  webIdShow.value = !!value
}

const getOrgDate = () => {
  formLoading.value = false
  getOrgTree().then((res) => {
    orgTree.value = res.data
  })
  getOrgList().then((res) => {
    orgList.value = res.data
  })
}

const initrOrgName = (value) => {
  // Initialize org name logic if needed
}

const getSelfForms = () => {
  selfForms.value = []
}

const handleSubmit = async () => {
  try {
    await formRef.value.validateFields()
    confirmLoading.value = true
    
    const res = await flcFormEdit(formData)
    if (res.success) {
      message.success('编辑成功')
      visible.value = false
      emit('ok', formData)
    } else {
      message.error('编辑失败::' + res.message)
    }
  } catch (error) {
    console.error('Form validation failed:', error)
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
