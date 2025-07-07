<template>
  <a-modal
    title="字典值编辑"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="id" style="display: none;">
          <a-input v-model:value="form.id" />
        </a-form-item>
        <a-form-item name="typeId" style="display: none;">
          <a-input v-model:value="form.typeId" />
        </a-form-item>
        <a-form-item label="字典值" name="value">
          <a-input v-model:value="form.value" placeholder="请输入字典值" />
        </a-form-item>
        <a-form-item label="唯一编码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入唯一编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="form.sort" style="width: 100%" placeholder="请输入排序" :min="1" :max="1000" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, defineExpose, defineEmits, nextTick } from 'vue';
import { sysDictDataEdit } from '@/api/modular/system/dictDataManage';
import { message } from 'ant-design-vue';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const form = reactive({
  id: '',
  typeId: '',
  value: '',
  code: '',
  sort: 100,
  remark: '',
});

const rules = {
  value: [{ required: true, message: '请输入字典值!' }],
  code: [{ required: true, message: '请输入唯一编码' }],
};

const emit = defineEmits(['ok']);

const edit = (record) => {
  visible.value = true;
  nextTick(() => {
    Object.assign(form, record);
  });
};

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    sysDictDataEdit(form)
      .then((res) => {
        if (res.success) {
          message.success('编辑成功');
          visible.value = false;
          emit('ok');
          formRef.value.resetFields();
        } else {
          message.error('编辑失败：' + res.message);
        }
      })
      .finally(() => {
        confirmLoading.value = false;
      });
  });
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

defineExpose({
  edit,
});
</script>
