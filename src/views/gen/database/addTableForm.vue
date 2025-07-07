<template>
  <a-modal title="新增数据源" :width="1200" :open="visible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-divider orientation="left">数据表信息</a-divider>
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="表名" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入表名" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-input v-model:value="formState.description" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
      <a-divider orientation="left">数据列信息</a-divider>
      <a-table size="middle" :columns="columnShowColumns" :data-source="columnInfo" :pagination="false" row-key="key">
         <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'dbColumnName'">
              <a-input v-model:value="record.dbColumnName" style="width: 120px" />
            </template>
            <template v-if="column.dataIndex === 'columnDescription'">
              <a-input v-model:value="record.columnDescription" style="width: 120px" />
            </template>
            <template v-if="column.dataIndex === 'isPrimarykey'">
               <a-select v-model:value="record.isPrimarykey" style="width: 80px" @change="e => primarykeyHandleChange(e, record.key)">
                <a-select-option :value="true">是</a-select-option>
                <a-select-option :value="false">否</a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'isIdentity'">
               <a-select v-model:value="record.isIdentity" style="width: 80px" :disabled="!record.isPrimarykey">
                <a-select-option :value="true">是</a-select-option>
                <a-select-option :value="false">否</a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'isNullable'">
              <a-select v-model:value="record.isNullable" style="width: 80px" :disabled="record.isPrimarykey">
                <a-select-option :value="true">是</a-select-option>
                <a-select-option :value="false">否</a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'dataType'">
              <a-select v-model:value="record.dataType" style="width: 120px" placeholder="请选择" @change="e => dataTypeHandleChange(e, record.key)">
                <a-select-option v-for="item in dataTypeSelectData" :key="item.value" :value="item.value">
                  {{ item.value }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'length'">
              <a-input-number v-model:value="record.length" :disabled="!record.hasLength" />
            </template>
            <template v-if="column.dataIndex === 'decimalDigits'">
              <a-input-number v-model:value="record.decimalDigits" :disabled="!record.hasDecimalDigits" />
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a @click="remove(record.key)">删除</a>
            </template>
          </template>
      </a-table>
      <a-row type="flex" :gutter="16">
        <a-col :span="6">
          <a-button style="width: 100%; margin-top: 16px;" type="dashed" @click="addPrimaryColumn"><plus-outlined /> 新增主键字段</a-button>
        </a-col>
        <a-col :span="6">
          <a-button style="width: 100%; margin-top: 16px;" type="dashed" @click="addColumn"><plus-outlined /> 新增普通字段</a-button>
        </a-col>
        <a-col :span="6">
          <a-button style="width: 100%; margin-top: 16px;" type="dashed" @click="addTenantColumn"><plus-outlined /> 新增租户字段</a-button>
        </a-col>
        <a-col :span="6">
          <a-button style="width: 100%; margin-top: 16px;" type="dashed" @click="addBaseColumn"><plus-outlined /> 新增基础字段</a-button>
        </a-col>
      </a-row>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { tableAdd } from '@/api/modular/gen/databaseManage';
import { PlusOutlined } from '@ant-design/icons-vue';

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();

const formState = reactive({
  name: '',
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入表名!' }],
  description: [{ required: true, message: '请输入描述!' }],
};

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

const columnInfo = ref([]);
let nextKey = 0;

const columnShowColumns = [
  { title: '字段', dataIndex: 'dbColumnName' },
  { title: '描述', dataIndex: 'columnDescription' },
  { title: '主键', dataIndex: 'isPrimarykey' },
  { title: '自增', dataIndex: 'isIdentity' },
  { title: '可空', dataIndex: 'isNullable' },
  { title: '类型', dataIndex: 'dataType' },
  { title: '长度', dataIndex: 'length' },
  { title: '小数位', dataIndex: 'decimalDigits' },
  { title: '操作', dataIndex: 'operation' },
];

const createColumn = (options = {}) => {
  return reactive({
    key: nextKey++,
    dbColumnName: '',
    columnDescription: '',
    isPrimarykey: false,
    isIdentity: false,
    isNullable: true,
    dataType: 'varchar',
    length: 255,
    decimalDigits: 0,
    hasLength: true,
    hasDecimalDigits: false,
    ...options,
  });
};

const primarykeyHandleChange = (value, key) => {
  const record = columnInfo.value.find(item => item.key === key);
  if (record) {
    if (value) { // is primary key
      record.isNullable = false;
      record.isIdentity = false;
    }
  }
};

const dataTypeHandleChange = (value, key) => {
  const record = columnInfo.value.find(item => item.key === key);
  const dataType = dataTypeSelectData.find(item => item.value === value);
  if (record && dataType) {
    record.hasLength = dataType.hasLength;
    record.hasDecimalDigits = dataType.hasDecimalDigits;
  }
};

const remove = (key) => {
  columnInfo.value = columnInfo.value.filter(item => item.key !== key);
};

const addPrimaryColumn = () => {
    columnInfo.value.push(createColumn({ dbColumnName: 'Id', columnDescription: 'Id', isPrimarykey: true, isNullable: false, dataType: 'bigint' }));
};

const addColumn = () => {
  columnInfo.value.push(createColumn());
};

const addTenantColumn = () => {
    columnInfo.value.push(createColumn({ dbColumnName: 'TenantId', columnDescription: '租户Id', isNullable: false, dataType: 'bigint' }));
}

const addBaseColumn = () => {
    columnInfo.value.push(...[
        createColumn({ dbColumnName: 'CreateUserId', columnDescription: '创建者Id', isNullable: true, dataType: 'bigint' }),
        createColumn({ dbColumnName: 'CreateTime', columnDescription: '创建时间', isNullable: true, dataType: 'datetime' }),
        createColumn({ dbColumnName: 'CreateUserName', columnDescription: '创建者名称', isNullable: true, dataType: 'varchar', length: 255 }),
        createColumn({ dbColumnName: 'UpdateUserId', columnDescription: '修改者Id', isNullable: true, dataType: 'bigint' }),
        createColumn({ dbColumnName: 'UpdateTime', columnDescription: '修改时间', isNullable: true, dataType: 'datetime' }),
        createColumn({ dbColumnName: 'UpdateUserName', columnDescription: '修改者名称', isNullable: true, dataType: 'varchar', length: 255 }),
        createColumn({ dbColumnName: 'IsDeleted', columnDescription: '软删除标记', isNullable: true, dataType: 'bit' })
    ]);
};


const add = () => {
  visible.value = true;
  formRef.value?.resetFields();
  columnInfo.value = [];
  nextKey = 0;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    if(columnInfo.value.length === 0){
        message.warning('至少需要添加一列');
        return;
    }
    const params = {
      ...formState,
      databaseColumnInfo: columnInfo.value,
    };
    confirmLoading.value = true;
    await tableAdd(params);
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
