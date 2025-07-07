<template>
  <a-modal title="新建文件夹" :width="600" :open="visible" :confirmLoading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="pId" style="display: none;">
          <a-input v-model:value="formState.pId" />
        </a-form-item>
        <a-form-item
          label="名称"
          name="name"
          :rules="[{ required: true, message: '请输入名称' }]"
        >
          <a-input v-model:value="formState.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="标签" name="label">
          <a-select v-model:value="formState.label" placeholder="请选择标签" style="width: 100%">
            <a-select-option v-for="item in docLabelData" :key="item.code" :value="item.code">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { DocumentAdd } from '@/api/modular/system/fileManage/documentManage';
import { dictTypeData } from '@/api/modular/system/dictTypeManage';
import { message } from 'ant-design-vue';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 6 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 16 },
};

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const formState = reactive({
  pId: '',
  name: '新建文件夹',
  label: null,
  remark: '',
});
const docLabelData = ref([]);

const emit = defineEmits(['ok']);

const loadDocLabelData = async () => {
  docLabelData.value = await dictTypeData({ dictTypeCode: 'doc_label' });
};

const add = (pId) => {
  visible.value = true;
  loadDocLabelData();
  nextTick(() => {
    formState.pId = pId;
  });
};

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validateFields();
    confirmLoading.value = true;
    const res = await DocumentAdd(values);
    if (res.success) {
      message.success('新增成功');
      emit('ok', values);
      handleCancel();
    } else {
      message.error('新增失败：' + res.message);
    }
  } catch (err) {
    // validation error
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  formState.name = '新建文件夹';
  visible.value = false;
};

defineExpose({
  add,
});
</script>
