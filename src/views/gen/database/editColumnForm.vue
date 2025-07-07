<template>
  <a-modal title="编辑列" :width="900" :open="visible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-divider orientation="left">数据列信息</a-divider>
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="oldName" v-show="false">
          <a-input v-model:value="formState.oldName" />
        </a-form-item>
        <a-form-item name="tableName" v-show="false">
          <a-input v-model:value="formState.tableName" />
        </a-form-item>
        <a-form-item label="列名" name="dbColumnName">
          <a-input v-model:value="formState.dbColumnName" placeholder="请输入列名" />
        </a-form-item>
        <a-form-item label="描述" name="columnDescription">
          <a-input v-model:value="formState.columnDescription" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { columnEdit } from '@/api/modular/gen/databaseManage';

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();

const formState = reactive({
  oldName: '',
  tableName: '',
  dbColumnName: '',
  columnDescription: '',
});

const rules = {
  dbColumnName: [{ required: true, message: '请输入列名!' }],
  columnDescription: [{ required: true, message: '请输入描述!' }],
};

const edit = (record) => {
  visible.value = true;
  formRef.value?.resetFields();
  Object.assign(formState, {
    oldName: record.dbColumnName,
    dbColumnName: record.dbColumnName,
    columnDescription: record.columnDescription,
    tableName: record.tableName,
  });
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    await columnEdit(formState);
    message.success('编辑成功');
    visible.value = false;
    emit('ok');
  } catch (error) {
    // validation error
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
