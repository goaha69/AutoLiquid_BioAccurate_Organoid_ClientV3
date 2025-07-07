<template>
  <a-modal title="日志详情" :width="900" :open="visible" :footer="null" @cancel="handleCancel">
    <a-spin :spinning="loading">
      <a-form :model="formState">
        <a-form-item label="具体消息" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea v-model:value="formState.message" :rows="4" readonly />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script setup>
import { ref, reactive, nextTick } from 'vue';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const visible = ref(false);
const loading = ref(false);
const formState = reactive({
  message: '',
});

const details = (record) => {
  visible.value = true;
  loading.value = true;
  nextTick(() => {
    formState.message = record.message;
    loading.value = false;
  });
};

const handleCancel = () => {
  visible.value = false;
  formState.message = '';
};

defineExpose({
  details,
});
</script>
