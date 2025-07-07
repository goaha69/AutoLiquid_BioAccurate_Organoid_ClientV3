<template>
  <div>
    <a-card v-if="hasPerm('sysPos:page')" :bordered="false">
      <a-form layout="inline" :model="queryParam">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="职位名称">
              <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入职位名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="唯一编码">
              <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入唯一编码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysPos:add')">
          <template #icon><plus-outlined /></template>
          新增职位
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleEdit(record)" v-if="hasPerm('sysPos:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysPos:edit') && hasPerm('sysPos:delete')" />
            <a-popconfirm
              v-if="hasPerm('sysPos:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => handleDelete(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { sysPosPage, sysPosDelete } from '@/api/modular/system/posManage';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import addForm from './addForm.vue';
import editForm from './editForm.vue';
import { hasPerm } from '@/core/permission/permission';

const queryParam = reactive({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = ref([
  {
    title: '职位名称',
    dataIndex: 'name',
  },
  {
    title: '唯一编码',
    dataIndex: 'code',
  },
  {
    title: '排序',
    dataIndex: 'sort',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
]);

if (hasPerm('sysPos:edit') || hasPerm('sysPos:delete')) {
  columns.value.push({
    title: '操作',
    dataIndex: 'action',
    width: '150px',
  });
}

const addFormRef = ref();
const editFormRef = ref();

const fetchData = async () => {
  loading.value = true;
  const params = {
    ...queryParam,
    current: pagination.value.current,
    size: pagination.value.pageSize,
  };
  try {
    const res = await sysPosPage(params);
    dataSource.value = res.data.records;
    pagination.value.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const handleTableChange = (pag) => {
  pagination.value = pag;
  fetchData();
};

const handleQuery = () => {
  pagination.value.current = 1;
  fetchData();
};

const resetQuery = () => {
  for (const key in queryParam) {
    delete queryParam[key];
  }
  handleQuery();
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleDelete = async (record) => {
  try {
    const res = await sysPosDelete(record);
    if (res.success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('删除失败：' + res.message);
    }
  } catch (err) {
    message.error('删除错误：' + err.message);
  }
};

const handleOk = () => {
  fetchData();
};
</script>

<style lang="less" scoped>
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
