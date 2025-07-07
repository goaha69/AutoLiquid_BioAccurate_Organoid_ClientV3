<template>
  <a-modal
    title="编辑租户"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="id" style="display: none">
          <a-input v-model:value="form.id" />
        </a-form-item>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="公司名称" name="name">
              <a-input v-model:value="form.name" placeholder="请输入公司名称" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="管理员姓名" name="adminName">
              <a-input v-model:value="form.adminName" placeholder="请输入管理员姓名" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="邮箱(账号)" name="email">
              <a-input v-model:value="form.email" placeholder="请输入电子邮箱" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="电话号码" name="phone">
              <a-input v-model:value="form.phone" placeholder="请输入电话号码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item label="备注" name="remark" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG">
              <a-textarea v-model:value="form.remark" :rows="2" placeholder="请输入备注" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { message } from 'ant-design-vue';
import { sysTenantEdit } from '@/api/modular/system/tenantManage';

const emit = defineEmits(['ok']);

const labelCol = {
  xs: { span: 24 },
  sm: { span: 6 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 16 },
};
const labelCol_JG = {
  xs: { span: 24 },
  sm: { span: 3 },
};
const wrapperCol_JG = {
  xs: { span: 24 },
  sm: { span: 20 },
};

const formRef = ref();
const visible = ref(false);
const confirmLoading = ref(false);

const form = reactive({
  id: '',
  name: '',
  adminName: '',
  email: '',
  phone: '',
  remark: '',
});

const rules = {
  name: [{ required: true, message: '请输入公司名称' }],
  adminName: [{ required: true, message: '请输入管理员姓名' }],
};

const edit = (record) => {
  visible.value = true;
  Object.assign(form, record);
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const res = await sysTenantEdit(form);
    if (res.success) {
      message.success('编辑成功');
      visible.value = false;
      emit('ok');
    } else {
      message.error(`编辑失败：${res.message}`);
    }
  } catch (error) {
    // validation failed
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  formRef.value.resetFields();
};

defineExpose({
  edit,
});
</script>
