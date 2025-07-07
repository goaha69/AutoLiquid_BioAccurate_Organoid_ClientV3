<template>
  <a-modal
    title="新增参数"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item
          label="参数名称"
          name="name"
          has-feedback
          :rules="[{required: true, message: '请输入参数名称!'}]"
        >
          <a-input placeholder="请输入参数名称" v-model:value="formState.name" />
        </a-form-item>
        <a-form-item
          label="唯一编码"
          name="code"
          has-feedback
          :rules="[{required: true, message: '请输入唯一编码'}]"
        >
          <a-input placeholder="请输入唯一编码" v-model:value="formState.code" />
        </a-form-item>
        <a-form-item
          label="系统参数"
          name="sysFlag"
          :rules="[{required: true, message: '请选择是否为系统参数!'}]"
        >
          <a-radio-group v-model:value="formState.sysFlag">
            <a-radio-button value="Y">是</a-radio-button>
            <a-radio-button value="N">否</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="所属分类"
          name="groupCode"
          has-feedback
          :rules="[{required: true, message: '请选择所属分类!'}]"
        >
          <a-select style="width: 100%" placeholder="请选择所属分类" v-model:value="formState.groupCode">
            <a-select-option v-for="item in groupCodeList" :key="item.code" :value="item.code">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="参数值"
          name="value"
          :rules="[{required: true, message: '请输入参数值!'}]"
        >
          <a-input placeholder="请输入参数值" v-model:value="formState.value" />
        </a-form-item>
        <a-form-item
          label="备注"
          name="remark"
          has-feedback
        >
          <a-textarea :rows="4" placeholder="请输入备注" v-model:value="formState.remark" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { sysDictTypeDropDown, sysConfigAdd } from '@/api/modular/system/configManage'
import { message } from 'ant-design-vue'

const emits = defineEmits(['ok'])

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 }
}

const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 }
}

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(true)
const groupCodeList = ref([])

const formState = reactive({
  name: '',
  code: '',
  sysFlag: '',
  groupCode: '',
  value: '',
  remark: ''
})

const add = () => {
  visible.value = true
  fetchGroupCodeList()
}

const fetchGroupCodeList = () => {
  sysDictTypeDropDown({ code: 'consts_type' }).then((res) => {
    groupCodeList.value = res.data
    formLoading.value = false
  }).catch(() => {
    formLoading.value = false
  })
}

const handleSubmit = () => {
  // Basic validation
  if (!formState.name) {
    message.error('请输入参数名称!')
    return
  }
  if (!formState.code) {
    message.error('请输入唯一编码!')
    return
  }
  if (!formState.sysFlag) {
    message.error('请选择是否为系统参数!')
    return
  }
  if (!formState.groupCode) {
    message.error('请选择所属分类!')
    return
  }
  if (!formState.value) {
    message.error('请输入参数值!')
    return
  }

  confirmLoading.value = true
  sysConfigAdd(formState).then((res) => {
    confirmLoading.value = false
    if (res.success) {
      message.success('新增成功')
      emits('ok', formState)
      handleCancel()
    } else {
      message.error('新增失败: ' + res.message)
    }
  }).catch(() => {
    confirmLoading.value = false
  })
}

const handleCancel = () => {
  // Reset form
  Object.assign(formState, {
    name: '',
    code: '',
    sysFlag: '',
    groupCode: '',
    value: '',
    remark: ''
  })
  visible.value = false
}

defineExpose({
  add
})
</script>

<style scoped>
</style>
