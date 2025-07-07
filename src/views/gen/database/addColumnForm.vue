<template>
  <a-modal title="新增列" :width="900" :open="visible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-divider orientation="left">数据列信息</a-divider>
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="列名" name="dbColumnName">
          <a-input v-model:value="formState.dbColumnName" placeholder="请输入列名" />
        </a-form-item>
        <a-form-item label="描述" name="columnDescription">
          <a-input v-model:value="formState.columnDescription" placeholder="请输入描述" />
        </a-form-item>
        <a-form-item label="主键" name="isPrimarykey">
          <a-select v-model:value="formState.isPrimarykey" placeholder="请选择">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="自增" name="isIdentity">
          <a-select v-model:value="formState.isIdentity" :disabled="!formState.isPrimarykey" placeholder="请选择">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="可空" name="isNullable">
          <a-select v-model:value="formState.isNullable" :disabled="formState.isPrimarykey" placeholder="请选择">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="类型" name="dataType">
          <a-select v-model:value="formState.dataType" placeholder="请选择">
            <a-select-option v-for="item in dataTypeSelectData" :key="item.value" :value="item.value">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="长度" name="length">
          <a-input-number v-model:value="formState.length" :disabled="!hasLength" placeholder="请输入长度" style="width: 100%" />
        </a-form-item>
        <a-form-item label="保留小数" name="decimalDigits">
          <a-input-number v-model:value="formState.decimalDigits" :disabled="!hasDecimalDigits" placeholder="请输入位数" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { columnAdd } from '@/api/modular/gen/databaseManage';

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const tableName = ref('');

const formState = reactive({
  dbColumnName: '',
  columnDescription: '',
  isPrimarykey: false,
  isIdentity: false,
  isNullable: true,
  dataType: 'varchar',
  length: 255,
  decimalDigits: 0,
});

const dataTypeSelectData = [
  { value: 'text', hasLength: false, hasDecimalDigits: false },
  { value: 'varchar', hasLength: true, hasDecimalDigits: false },
  { value: 'nvarchar', hasLength: true, hasDecimalDigits: false },
  { value: 'char', hasLength: true, hasDecimalDigits: false },
  { value: 'nchar', hasLength: true, hasDecimalDigits: false },
  { value: 'timestamp', hasLength: false, hasDecimalDigits: false },
  { value: 'int', hasLength: false, hasDecimalDigits: false },
  { value: 'smallint', hasLength: false, hasDecimalDigits: false },
  { value: 'tinyint', hasLength: false, hasDecimalDigits: false },
  { value: 'bigint', hasLength: false, hasDecimalDigits: false },
  { value: 'bit', hasLength: false, hasDecimalDigits: false },
  { value: 'decimal', hasLength: true, hasDecimalDigits: true },
  { value: 'datetime', hasLength: false, hasDecimalDigits: false },
];

const hasLength = computed(() => {
    const type = dataTypeSelectData.find(t => t.value === formState.dataType);
    return type ? type.hasLength : false;
});

const hasDecimalDigits = computed(() => {
    const type = dataTypeSelectData.find(t => t.value === formState.dataType);
    return type ? type.hasDecimalDigits : false;
});

const rules = computed(() => ({
  dbColumnName: [{ required: true, message: '请输入列名!' }],
  columnDescription: [{ required: true, message: '请输入描述!' }],
  isPrimarykey: [{ required: true, message: '请选择是否为主键!' }],
  isIdentity: [{ required: true, message: '请选择是否自增!' }],
  isNullable: [{ required: true, message: '请选择是否可空!' }],
  dataType: [{ required: true, message: '请选择类型!' }],
  length: [{ required: hasLength.value, message: '请输入长度!' }],
}));


watch(() => formState.isPrimarykey, (isPrimary) => {
  if (isPrimary) {
    formState.isNullable = false;
  } else {
    formState.isIdentity = false;
  }
});

watch(() => formState.dataType, () => {
    formRef.value?.clearValidate(['length', 'decimalDigits']);
});

const add = (name) => {
  tableName.value = name;
  visible.value = true;
  formRef.value?.resetFields();
   Object.assign(formState, {
        dbColumnName: '',
        columnDescription: '',
        isPrimarykey: false,
        isIdentity: false,
        isNullable: true,
        dataType: 'varchar',
        length: 255,
        decimalDigits: 0,
    });
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    const params = {
      ...formState,
      tableName: tableName.value,
    };
    confirmLoading.value = true;
    await columnAdd(params);
    message.success('新增成功');
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
  add,
});
</script>
