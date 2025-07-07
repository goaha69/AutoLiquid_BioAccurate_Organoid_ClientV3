<template>
  <a-modal
    title="选择外键关系"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel">
    <a-spin :spinning="loading">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="外键表" name="tableName">
              <a-select v-model:value="formState.tableName" placeholder="请选择数据库表">
                <a-select-option
                  v-for="item in tableNameData"
                  :key="item.entityName"
                  :value="item.entityName">
                  {{ item.tableName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="显示字段" name="columnName">
              <a-select v-model:value="formState.columnName" placeholder="请选择显示字段">
                <a-select-option v-for="item in columnNameData" :key="item.columnName" :value="item.columnName">
                  {{ item.columnName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { codeGenerateInformationList, codeGenerateColumnList } from '@/api/modular/gen/codeGenerateManage';

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const loading = ref(false);
const formRef = ref();
const rowRecord = ref(null);

const tableNameData = ref([]);
const columnNameData = ref([]);

const formState = reactive({
  tableName: undefined,
  columnName: undefined,
});

const rules = {
  tableName: [{ required: true, message: '请选择数据库表' }],
  columnName: [{ required: true, message: '请选择显示字段' }],
};

watch(() => formState.tableName, (newTableName) => {
  formState.columnName = undefined;
  columnNameData.value = [];
  if (newTableName) {
    const selectedTable = tableNameData.value.find(t => t.entityName === newTableName);
    if(selectedTable) {
        loading.value = true;
        codeGenerateColumnList(selectedTable.tableName).then(res => {
            columnNameData.value = res.data;
        }).finally(() => {
            loading.value = false;
        });
    }
  }
});

const show = async (row) => {
  rowRecord.value = row;
  visible.value = true;
  formRef.value?.resetFields();
  loading.value = true;
  try {
    const res = await codeGenerateInformationList();
    tableNameData.value = res.data;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    if (rowRecord.value) {
      rowRecord.value.fkEntityName = formState.tableName;
      rowRecord.value.fkColumnName = formState.columnName;
      const selectedColumn = columnNameData.value.find(c => c.columnName === formState.columnName);
      if(selectedColumn) {
        rowRecord.value.fkColumnNetType = selectedColumn.netType;
      }
    }
    handleCancel();
  } catch (error) {
    // validation error
  }
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  show,
});
</script>
