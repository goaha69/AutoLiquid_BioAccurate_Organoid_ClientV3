<template>
  <a-modal
    title="新增角色"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="角色名" name="name">
          <a-input v-model:value="form.name" placeholder="请输入角色名" />
        </a-form-item>

        <a-form-item label="唯一编码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入唯一编码" />
        </a-form-item>

        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="form.sort" placeholder="请输入排序" style="width: 100%" :min="1" :max="1000" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { sysRoleAdd } from '@/api/modular/system/roleManage'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:visible', 'ok'])

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
}
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
}

const formRef = ref()
const confirmLoading = ref(false)

const form = reactive({
  name: '',
  code: '',
  sort: 100,
  remark: '',
})

const rules = {
  name: [{ required: true, message: '请输入角色名' }],
  code: [{ required: true, message: '请输入唯一编码' }],
}

const add = () => {
  // Reset form fields when the modal is opened
  form.name = ''
  form.code = ''
  form.sort = 100
  form.remark = ''
}

const handleSubmit = () => {
  confirmLoading.value = true
  formRef.value
    .validate()
    .then(() => {
      sysRoleAdd(form)
        .then((res) => {
          if (res.success) {
            message.success('新增成功')
            emit('update:visible', false)
            emit('ok')
            formRef.value.resetFields()
          } else {
            message.error('新增失败：' + res.message)
          }
        })
        .finally(() => {
          confirmLoading.value = false
        })
    })
    .catch(() => {
      confirmLoading.value = false
    })
}

const handleCancel = () => {
  formRef.value.resetFields()
  emit('update:visible', false)
}

defineExpose({
  add,
})
</script>
