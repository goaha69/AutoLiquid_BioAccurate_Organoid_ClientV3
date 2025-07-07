<template>
  <a-modal
    title="新增"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="文档类型" name="documentType">
          <a-input-number v-model:value="formState.documentType" placeholder="请输入文档类型" style="width: 100%" />
        </a-form-item>
        <a-form-item label="文件后缀" name="fileSuffix">
          <a-input v-model:value="formState.fileSuffix" placeholder="请输入文件后缀" />
        </a-form-item>
        <a-form-item label="文件大小(KB)" name="fileSizeKb">
          <a-input-number v-model:value="formState.fileSizeKb" placeholder="请输入文件大小(KB)" style="width: 100%" />
        </a-form-item>
        <a-form-item label="存储文件名" name="fileObjectName">
          <a-input v-model:value="formState.fileObjectName" placeholder="请输入存储文件名" />
        </a-form-item>
        <a-form-item label="标签" name="label">
          <a-input-number v-model:value="formState.label" placeholder="请输入标签" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { TrashAdd } from '@/api/modular/system/fileManage/trashManage';
import { message } from 'ant-design-vue';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 6 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 16 },
};

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const formState = reactive({
  name: '',
  documentType: null,
  fileSuffix: '',
  fileSizeKb: null,
  fileObjectName: '',
  label: null,
  remark: '',
});

const emit = defineEmits(['ok']);

const add = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validateFields();
    confirmLoading.value = true;
    const res = await TrashAdd(values);
    if (res.success) {
      message.success('新增成功');
      emit('ok', values);
      handleCancel();
    } else {
      message.error('新增失败：' + res.message);
    }
  } catch (err) {
    // validation error
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

defineExpose({
  add,
});
</script>
