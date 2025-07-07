<template>
  <a-modal
    title="新增职位"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item
          label="职位名称"
          name="name"
          :rules="[{ required: true, message: '请输入职位名称!' }]"
          has-feedback
        >
          <a-input v-model:value="formState.name" placeholder="请输入职位名称" />
        </a-form-item>

        <a-form-item
          label="唯一编码"
          name="code"
          :rules="[{ required: true, message: '请输入唯一编码' }]"
          has-feedback
        >
          <a-input v-model:value="formState.code" placeholder="请输入唯一编码" />
        </a-form-item>

        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formState.sort" placeholder="请输入排序" style="width: 100%" :min="1" :max="1000" />
        </a-form-item>

        <a-form-item label="备注" name="remark" has-feedback>
          <a-textarea v-model:value="formState.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { sysPosAdd } from '@/api/modular/system/posManage';
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
const formState = reactive({
  name: '',
  code: '',
  sort: 100,
  remark: '',
});

const emit = defineEmits(['ok']);

const add = () => {
  visible.value = true;
};

const handleSubmit = () => {
  confirmLoading.value = true;
  formRef.value
    .validate()
    .then(() => {
      sysPosAdd(formState)
        .then((res) => {
          if (res.success) {
            message.success('新增成功');
            visible.value = false;
            emit('ok', formState);
            formRef.value.resetFields();
          } else {
            message.error('新增失败：' + res.message);
          }
        })
        .finally(() => {
          confirmLoading.value = false;
        });
    })
    .catch(() => {
      confirmLoading.value = false;
    });
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

defineExpose({
  add,
});
</script>
