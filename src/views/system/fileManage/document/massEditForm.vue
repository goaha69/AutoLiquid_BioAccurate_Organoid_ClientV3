<template>
  <a-modal
    title="批量移动"
    :width="600"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="父级文件夹" name="pId" :rules="[{ required: true, message: '请选择父级文件夹!' }]">
          <a-tree-select
            v-model:value="formState.pId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
            :tree-data="docTree"
            placeholder="请选择父级文件夹"
            tree-default-expand-all
            :replace-fields="replaceFields"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { DocumentTree, DocumentMove } from '@/api/modular/system/fileManage/documentManage';
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
  pId: null,
});
const docTree = ref([]);
const replaceFields = {
  key: 'id',
  title: 'name',
  value: 'id',
};
const data = ref([]);

const emit = defineEmits(['ok']);

const loadTreeData = async () => {
  confirmLoading.value = true;
  try {
    const res = await DocumentTree();
    if (res.success) {
      docTree.value = [{ id: 0, name: '全部文件', children: res.data }];
    }
  } finally {
    confirmLoading.value = false;
  }
};

const edit = (selectedIds) => {
  data.value = selectedIds;
  loadTreeData();
  visible.value = true;
};

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validateFields();
    confirmLoading.value = true;
    const params = {
      ...values,
      ids: data.value,
    };
    const res = await DocumentMove(params);
    if (res.success) {
      message.success('批量移动成功');
      emit('ok', values);
      handleCancel();
    } else {
      message.error('批量移动失败：' + res.message);
    }
  } catch (err) {
    // validation error
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

defineExpose({
  edit,
});
</script>
