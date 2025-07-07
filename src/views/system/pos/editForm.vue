<template>
  <a-modal
    title="职位编辑"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item style="display: none" name="id">
          <a-input v-model:value="formState.id" />
        </a-form-item>

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

        <a-form-item label="排序" name="sort" has-feedback>
          <a-input-number
            v-model:value="formState.sort"
            style="width: 100%"
            placeholder="请输入排序"
            :min="1"
            :max="1000"
          />
        </a-form-item>

        <a-form-item label="备注" name="remark" has-feedback>
          <a-textarea v-model:value="formState.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { sysPosEdit } from '@/api/modular/system/posManage';
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
  id: '',
  name: '',
  code: '',
  sort: 100,
  remark: '',
});

const emit = defineEmits(['ok']);

const edit = (record) => {
  visible.value = true;
  nextTick(() => {
    Object.assign(formState, record);
  });
};

const handleSubmit = () => {
  confirmLoading.value = true;
  formRef.value
    .validate()
    .then(() => {
      sysPosEdit(formState)
        .then((res) => {
          if (res.success) {
            message.success('编辑成功');
            visible.value = false;
            emit('ok', formState);
            formRef.value.resetFields();
          } else {
            message.error('编辑失败：' + res.message);
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
  edit,
});
</script>
