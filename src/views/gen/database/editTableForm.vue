<template>
  <a-modal title="编辑数据源" :width="900" :open="visible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-divider orientation="left">数据表信息</a-divider>
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="oldName" v-show="false">
          <a-input v-model:value="formState.oldName" />
        </a-form-item>
        <a-form-item label="表名" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入表名" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-input v-model:value="formState.description" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { tableEdit } from '@/api/modular/gen/databaseManage';

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();

const formState = reactive({
  oldName: '',
  name: '',
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入表名!' }],
  description: [{ required: true, message: '请输入描述!' }],
};

const edit = (record) => {
  visible.value = true;
  formRef.value?.resetFields();
  Object.assign(formState, {
      oldName: record.name,
      name: record.name,
      description: record.description
  });
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    await tableEdit(formState);
    message.success('编辑成功');
    visible.value = false;
    emit('ok');
  } catch (error) {
    // validation will be displayed on form
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  edit,
});
</script>
