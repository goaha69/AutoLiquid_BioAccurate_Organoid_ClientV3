<template>
  <a-modal title="日志详情" :width="900" :open="visible" :footer="null" @cancel="handleCancel">
    <a-spin :spinning="loading">
      <a-form :model="formState">
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="方法名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.methodName" readonly />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="类名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.className" readonly />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="异常名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.exceptionName" readonly />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="异常信息" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model:value="formState.exceptionMsg" :rows="4" readonly />
            </a-form-item>
          </a-col>
        </a-row>
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
  methodName: '',
  className: '',
  exceptionName: '',
  exceptionMsg: '',
});

const details = (record) => {
  visible.value = true;
  loading.value = true;
  nextTick(() => {
    Object.assign(formState, record);
    loading.value = false;
  });
};

const handleCancel = () => {
  visible.value = false;
  Object.keys(formState).forEach(key => {
    formState[key] = '';
  });
};

defineExpose({
  details,
});
</script>
