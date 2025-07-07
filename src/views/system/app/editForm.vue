<template>
  <a-modal
    title="编辑应用"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :model="formState" :rules="rules" ref="formRef">
        <a-form-item label="应用名称" name="name" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-model:value="formState.name" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item label="唯一编码" name="code" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-model:value="formState.code" placeholder="请输入唯一编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input-number v-model:value="formState.sort" :min="1" :max="1000" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, toRaw, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { sysAppEdit } from '@/api/modular/system/appManage';

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();

const formState = reactive({
  id: '',
  name: '',
  code: '',
  sort: 100,
  active: 'N',
});

const rules = {
  name: [{ required: true, message: '请输入应用名称!' }],
  code: [{ required: true, message: '请输入唯一编码!' }],
};

const emit = defineEmits(['ok']);

const edit = (record) => {
  visible.value = true;
  nextTick(() => {
    Object.assign(formState, record);
  });
};

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    sysAppEdit(toRaw(formState)).then(res => {
      confirmLoading.value = false;
      if (res.success) {
        message.success('编辑成功');
        handleCancel();
        emit('ok');
      } else {
        message.error('编辑失败：' + res.message);
      }
    }).catch(() => {
      confirmLoading.value = false;
    });
  });
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

defineExpose({ edit });
</script>
