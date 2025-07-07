<template>
  <a-modal
    title="参数编辑"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="id" style="display: none;">
          <a-input v-model:value="form.id" />
        </a-form-item>
        <a-form-item label="参数名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入参数名称" />
        </a-form-item>
        <a-form-item label="唯一编码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入唯一编码" :disabled="editDisabled" />
        </a-form-item>
        <a-form-item label="系统参数" name="sysFlag">
          <a-radio-group v-model:value="form.sysFlag" :disabled="editDisabled">
            <a-radio-button value="Y">是</a-radio-button>
            <a-radio-button value="N">否</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="所属分类" name="groupCode">
          <a-select v-model:value="form.groupCode" style="width: 100%" placeholder="请选择所属分类" :disabled="editDisabled">
            <a-select-option v-for="item in groupCodeList" :key="item.code" :value="item.code">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="参数值" name="value">
          <a-input v-model:value="form.value" placeholder="请输入参数值" />
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
import { sysDictTypeDropDown, sysConfigEdit } from '@/api/modular/system/configManage';
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
const formLoading = ref(true);
const editDisabled = ref(false);
const groupCodeList = ref([]);
const formRef = ref();
const form = reactive({
  id: '',
  name: '',
  code: '',
  sysFlag: '',
  groupCode: '',
  value: '',
  remark: '',
});

const rules = {
  name: [{ required: true, message: '请输入参数名称!' }],
  code: [{ required: true, message: '请输入唯一编码' }],
  sysFlag: [{ required: true, message: '请选择是否为系统参数!' }],
  groupCode: [{ required: true, message: '请选择所属分类!' }],
  value: [{ required: true, message: '请输入参数值!' }],
};

const emit = defineEmits(['ok']);

const edit = (record) => {
  visible.value = true;
  formLoading.value = true;
  loadGroupCodeList();
  nextTick(() => {
    Object.assign(form, record);
  });
  editDisabled.value = record.sysFlag === 'Y';
};

const loadGroupCodeList = () => {
  sysDictTypeDropDown({ code: 'consts_type' }).then((res) => {
    groupCodeList.value = res.data;
    formLoading.value = false;
  });
};

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    sysConfigEdit(form)
      .then((res) => {
        if (res.success) {
          message.success('编辑成功');
          emit('ok');
          handleCancel();
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
  editDisabled.value = false;
};

defineExpose({
  edit,
});
</script>
