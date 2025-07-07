<template>
  <a-modal
    title="上传文件"
    :width="600"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="pId" style="display: none;">
          <a-input v-model:value="formState.pId" />
        </a-form-item>
        <a-form-item label="选择文件" name="file">
          <a-upload
            :file-list="fileList"
            :customRequest="customRequest"
            :remove="removeFile"
            :multiple="true"
            :showUploadList="true"
            name="file"
          >
            <a-button :loading="uploading" :disabled="uploading"><upload-outlined />上传</a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { DocumentUpload } from '@/api/modular/system/fileManage/documentManage';
import { message, Modal } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';

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
  pId: 0,
});
const uploading = ref(false);
const fileList = ref([]);

const emit = defineEmits(['ok']);

const upload = (pId) => {
  visible.value = true;
  formState.pId = pId;
};

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validateFields();
    confirmLoading.value = true;

    const formData = new FormData();
    formData.append('pId', values.pId);
    fileList.value.forEach(file => {
      formData.append('files', file.originFileObj);
    });

    const res = await DocumentUpload(formData);
    if (res.success) {
      message.success('上传成功');
      emit('ok', values);
      handleCancel();
    } else {
      message.error('上传失败：' + res.message);
    }
  } catch (err) {
    // validation error
  } finally {
    confirmLoading.value = false;
  }
};

const customRequest = (options) => {
  uploading.value = true;
  options.file.status = 'done';
  fileList.value.push(options.file);
  uploading.value = false;
};

const removeFile = (file) => {
  Modal.confirm({
    title: '提示',
    content: `确定要取消上传 "${file.name}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      fileList.value = fileList.value.filter(item => item.uid !== file.uid);
    },
  });
  return false; // prevent default behavior
};

const handleCancel = () => {
  formRef.value.resetFields();
  fileList.value = [];
  visible.value = false;
};

defineExpose({
  upload,
});
</script>
