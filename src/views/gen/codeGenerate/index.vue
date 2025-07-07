<template>
  <div>
    <template v-if="indexOpenShow">
      <a-card :bordered="false" :body-style="{ 'padding-bottom': '0px', 'margin-bottom': '10px' }">
        <a-spin :spinning="loading">
          <a-form class="table-page-search-wrapper" layout="inline" v-if="hasPerm('codeGenerate:page')">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="表名">
                  <a-input v-model:value="queryParam.tableName" allow-clear placeholder="请输入表名称" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="handleQuery">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam.tableName = ''">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
      </a-card>
      <a-card :bordered="false">
        <a-spin :spinning="loading">
            <template #title>
                <a-button type="primary" @click="handleAdd" v-if="hasPerm('codeGenerate:add')">
                    <template #icon><plus-outlined /></template>
                    新增
                </a-button>
            </template>
          <a-table
            ref="table"
            :columns="columns"
            :data-source="dataSource"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            :row-key="record => record.id"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="['tableName', 'busName', 'nameSpace'].includes(column.dataIndex)">
                <ellipsis :length="30" tooltip>{{ text }}</ellipsis>
              </template>
              <template v-if="column.dataIndex === 'generateType'">
                <ellipsis :length="30" tooltip>{{ generateTypeFilter(text) }}</ellipsis>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <span v-if="record.generateType === '1'">
                  <a v-if="hasPerm('codeGenerate:runDown')" @click="runDownCodeGenerate(record)">开始生成</a>
                </span>
                <span v-else>
                  <a-popconfirm v-if="hasPerm('codeGenerate:runLocal')" placement="topRight" title="确定生成代码到本项目？" @confirm="() => runLocalCodeGenerate(record)">
                    <a>开始生成</a>
                  </a-popconfirm>
                </span>
                <a-divider type="vertical" v-if="(hasPerm('codeGenerate:config') && hasPerm('codeGenerate:runLocal')) || hasPerm('codeGenerate:runDown')" />
                <a v-if="hasPerm('codeGenerate:config')" @click="indexConfigOpen(record)">配置</a>
                <a-divider type="vertical" v-if="hasPerm('codeGenerate:config') && hasPerm('codeGenerate:edit')" />
                <a v-if="hasPerm('codeGenerate:edit')" @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('codeGenerate:edit') && hasPerm('codeGenerate:delete')" />
                <a-popconfirm v-if="hasPerm('codeGenerate:delete')" placement="topRight" title="确认删除？" @confirm="() => handleDelete(record)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
          <add-form ref="addFormRef" @ok="handleOk" v-if="hasPerm('codeGenerate:add')" />
          <edit-form ref="editFormRef" @ok="handleOk" v-if="hasPerm('codeGenerate:edit')" />
        </a-spin>
      </a-card>
    </template>
    <index-config v-else ref="indexConfigRef" @ok="handleResetOpen" v-if="hasPerm('codeGenerate:config')" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from 'vue';
import { message } from 'ant-design-vue';
import { Ellipsis } from '@/components';
import { codeGeneratePage, codeGenerateDelete, codeGenerateRunDown, codeGenerateRunLocal } from '@/api/modular/gen/codeGenerateManage';
import { downloadfile } from '@/utils/util';
import { hasPerm } from '@/utils/permission/index.js';
import addForm from './addForm.vue';
import editForm from './editForm.vue';
import indexConfig from './indexConfig.vue';
import { PlusOutlined } from '@ant-design/icons-vue';

const queryParam = reactive({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
});
const selectedRowKeys = ref([]);
const indexOpenShow = ref(true);

const addFormRef = ref();
const editFormRef = ref();
const indexConfigRef = ref();

const columns = ref([
  { title: '表名', dataIndex: 'tableName' },
  { title: '业务名', dataIndex: 'busName' },
  { title: '命名空间', dataIndex: 'nameSpace' },
  { title: '作者姓名', dataIndex: 'authorName' },
  { title: '生成方式', dataIndex: 'generateType' },
]);

onMounted(() => {
  fetchData();
  if (hasPerm('codeGenerate:edit') || hasPerm('codeGenerate:delete') || hasPerm('codeGenerate:config')) {
    columns.value.push({
      title: '操作',
      dataIndex: 'action',
      width: '230px',
    });
  }
});

const fetchData = async () => {
  loading.value = true;
  const params = {
    ...toRaw(queryParam),
    current: pagination.value.current,
    size: pagination.value.pageSize,
  };
  try {
    const res = await codeGeneratePage(params);
    dataSource.value = res.data.records;
    pagination.value.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchData();
};

const handleQuery = () => {
  pagination.value.current = 1;
  fetchData();
};

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

const generateTypeFilter = (type) => {
  const map = { '1': '生成压缩包', '2': '生成到本项目' };
  return map[type] || '';
};

const runDownCodeGenerate = async (record) => {
  loading.value = true;
  try {
    const res = await codeGenerateRunDown({ id: record.id });
    downloadfile(res);
  } catch (err) {
    message.error('下载错误: 获取文件流错误');
  } finally {
    loading.value = false;
  }
};

const runLocalCodeGenerate = async (record) => {
  try {
    const res = await codeGenerateRunLocal(record);
    if (res.success) {
      message.success('生成成功');
      fetchData();
    } else {
      message.error('生成失败: ' + res.message);
    }
  } catch (err) {
      message.error('生成失败: ' + err.message);
  }
};

const handleDelete = async (record) => {
  loading.value = true;
  try {
    const res = await codeGenerateDelete([{ id: record.id }]);
    if (res.success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('删除失败: ' + res.message);
    }
  } catch (err) {
    message.error('删除错误: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const indexConfigOpen = (record) => {
  indexOpenShow.value = false;
  setTimeout(() => indexConfigRef.value.open(record), 100)
};

const handleResetOpen = () => {
  indexOpenShow.value = true;
  fetchData();
};

const handleAdd = () => addFormRef.value.add();
const handleEdit = (record) => editFormRef.value.edit(toRaw(record));

const handleOk = () => {
  fetchData();
};
</script>
<style lang="less">
  .table-operator {
    margin-bottom: 18px;
  }
  button {
    margin-right: 8px;
  }
</style>
