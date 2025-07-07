<template>
  <a-card :bordered="false">
    <div class="table-operator">
      <a-button class="but_item" type="dashed" @click="handleCancel">
        <template #icon><rollback-outlined /></template>
        返回
      </a-button>
      <a-button type="primary" @click="handleSubmit">
        <template #icon><save-outlined /></template>
        保存
      </a-button>
    </div>
    <a-table
      ref="table"
      size="middle"
      :columns="columns"
      :data-source="loadData"
      :pagination="false"
      :loading="tableLoading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'columnComment'">
          <a-input v-model:value="record.columnComment" />
        </template>
        <template v-if="column.dataIndex === 'effectType'">
          <a-select v-model:value="record.effectType" style="width: 120px" :disabled="judgeColumns(record)">
            <a-select-option v-for="item in effectTypeData" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex === 'dictTypeCode'">
          <a-select
            v-model:value="record.dictTypeCode"
            style="width: 120px"
            :disabled="!['radio', 'select', 'checkbox'].includes(record.effectType)"
          >
            <a-select-option v-for="item in dictDataAll" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex === 'whetherTable'">
          <a-checkbox v-model:checked="record.whetherTable" />
        </template>
        <template v-if="column.dataIndex === 'whetherAddUpdate'">
          <a-checkbox v-model:checked="record.whetherAddUpdate" :disabled="judgeColumns(record)" />
        </template>
        <template v-if="column.dataIndex === 'whetherRequired'">
          <a-checkbox v-model:checked="record.whetherRequired" :disabled="judgeColumns(record)" />
        </template>
        <template v-if="column.dataIndex === 'queryWhether'">
          <a-switch v-model:checked="record.queryWhether" />
        </template>
        <template v-if="column.dataIndex === 'queryType'">
          <a-select v-model:value="record.queryType" style="width: 100px" :disabled="!record.queryWhether">
            <a-select-option v-for="item in codeGenQueryTypeData" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
          </a-select>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { sysCodeGenerateConfigList, sysCodeGenerateConfigEdit } from '@/api/modular/gen/sysCodeGenerateConfigManage';
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { dictType, dictDataAll as getDictDataAll } from '@/utils/dict';

const emit = defineEmits(['ok']);

const tableLoading = ref(false);
const loadData = ref([]);
const effectTypeData = ref([]);
const dictDataAll = ref([]);
const codeGenQueryTypeData = ref([]);

const columns = [
  { title: '字段', dataIndex: 'columnName' },
  { title: '描述', dataIndex: 'columnComment' },
  { title: '类型', dataIndex: 'netType' },
  { title: '作用类型', dataIndex: 'effectType' },
  { title: '字典', dataIndex: 'dictTypeCode' },
  { title: '列表显示', align: 'center', dataIndex: 'whetherTable' },
  { title: '增改', align: 'center', dataIndex: 'whetherAddUpdate' },
  { title: '必填', align: 'center', dataIndex: 'whetherRequired' },
  { title: '是否查询', align: 'center', dataIndex: 'queryWhether' },
  { title: '查询方式', dataIndex: 'queryType' },
];

const open = async (data) => {
  tableLoading.value = true;
  
  effectTypeData.value = dictType('code_gen_effect_type');
  dictDataAll.value = getDictDataAll();
  codeGenQueryTypeData.value = dictType('code_gen_query_type');

  try {
    const res = await sysCodeGenerateConfigList({ codeGenId: data.id });
    loadData.value = res.data.map(item => {
      const newItem = {};
      for (const key in item) {
        if (item[key] === 'Y') {
          newItem[key] = true;
        } else if (item[key] === 'N') {
          newItem[key] = false;
        } else {
          newItem[key] = item[key];
        }
      }
      return reactive(newItem);
    });
  } finally {
    tableLoading.value = false;
  }
};

const handleSubmit = async () => {
  tableLoading.value = true;
  const params = JSON.parse(JSON.stringify(loadData.value));
  params.forEach(item => {
    for (const key in item) {
      if (item[key] === true) {
        item[key] = 'Y';
      } else if (item[key] === false) {
        item[key] = 'N';
      }
    }
  });
  
  try {
    const res = await sysCodeGenerateConfigEdit(params);
    if (res.success) {
      message.success('编辑成功');
      handleCancel();
    } else {
      message.error('编辑失败: ' + res.message);
    }
  } finally {
    tableLoading.value = false;
  }
};

const judgeColumns = (data) => {
  return (
    data.columnName.includes('createdUserName') ||
    data.columnName.includes('createdTime') ||
    data.columnName.includes('updatedUserName') ||
    data.columnName.includes('updatedTime') ||
    data.columnKey === 'True'
  );
};

const handleCancel = () => {
  loadData.value = [];
  emit('ok');
};

defineExpose({
  open,
});
</script>
