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
            <a-form-item label="地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.location" readonly />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="浏览器" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.browser" readonly />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="操作系统" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model:value="formState.os" readonly />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="类名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model:value="formState.className" :rows="4" readonly />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="具体消息" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model:value="formState.message" :rows="4" readonly />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="请求参数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model:value="formState.param" :rows="4" readonly />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="返回结果" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model:value="formState.result" :rows="4" readonly />
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
  location: '',
  browser: '',
  os: '',
  className: '',
  message: '',
  param: '',
  result: '',
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
  // Reset form state if needed
  Object.keys(formState).forEach(key => {
    formState[key] = '';
  });
};

defineExpose({
  details,
});
</script>
