<template>
  <div>
    <a-card v-if="hasPerm('sysApp:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="应用名称">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入应用名称" />
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
      </div>
    </a-card>

    <a-card :bordered="false">
      <template #title v-if="hasPerm('sysApp:add')">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增应用
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="record => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'active'">
            {{ activeFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-popconfirm
              placement="top"
              :title="text === 0 ? '确定停用该应用？' : '确定启用该应用？'"
              @confirm="() => editAppStatus(record)"
            >
              <a>{{ statusFilter(text) }}</a>
            </a-popconfirm>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a v-if="hasPerm('sysApp:edit')" @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysApp:edit') && hasPerm('sysApp:delete')" />
            <a-popconfirm
              v-if="hasPerm('sysApp:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => deleteApp(record)"
            >
              <a>删除</a>
            </a-popconfirm>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysApp:setAsDefault') && record.active === 'N' && (hasPerm('sysApp:delete') || hasPerm('sysApp:edit'))"
            />
            <a-popconfirm
              v-if="hasPerm('sysApp:setAsDefault') && record.active === 'N'"
              placement="topRight"
              title="设置为默认应用？"
              @confirm="() => setDefault(record)"
            >
              <a>设为默认</a>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { hasPerm } from '@/utils/permissions';
import {
  getAppPage,
  sysAppDelete,
  sysAppSetAsDefault,
  sysAppChangeStatus,
} from '@/api/modular/system/appManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';

const queryParam = reactive({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = computed(() => {
  const baseColumns = [
    { title: '应用名称', dataIndex: 'name' },
    { title: '唯一编码', dataIndex: 'code' },
    { title: '是否默认', dataIndex: 'active' },
    { title: '状态', dataIndex: 'status' },
    { title: '排序', dataIndex: 'sort' },
  ];
  if (hasPerm('sysApp:edit') || hasPerm('sysApp:delete') || hasPerm('sysApp:setAsDefault')) {
    baseColumns.push({
      title: '操作',
      dataIndex: 'action',
      width: '200px',
    });
  }
  return baseColumns;
});

const activeDict = ref([]);
const statusDict = ref([]);

const addFormRef = ref();
const editFormRef = ref();

onMounted(() => {
  fetchData();
  loadDicts();
});

const fetchData = () => {
  loading.value = true;
  const params = {
    ...queryParam,
    current: pagination.current,
    size: pagination.pageSize,
  };
  getAppPage(params).then(res => {
    loading.value = false;
    if (res.success) {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    }
  });
};

const loadDicts = () => {
  sysDictTypeDropDown({ code: 'yes_or_no' }).then(res => {
    activeDict.value = res.data;
  });
  sysDictTypeDropDown({ code: 'common_status' }).then(res => {
    statusDict.value = res.data;
  });
};

const handleTableChange = (page) => {
  pagination.current = page.current;
  pagination.pageSize = page.pageSize;
  fetchData();
};

const handleQuery = () => {
  pagination.current = 1;
  fetchData();
};

const resetQuery = () => {
  for (const key in queryParam) {
    delete queryParam[key];
  }
  handleQuery();
};

const activeFilter = (value) => {
  const item = activeDict.value.find(item => item.code == value);
  return item ? item.value : value;
};

const statusFilter = (value) => {
  const item = statusDict.value.find(item => item.code == value);
  return item ? item.value : value;
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleOk = () => {
  fetchData();
};

const setDefault = (record) => {
  loading.value = true;
  sysAppSetAsDefault({ id: record.id }).then(res => {
    loading.value = false;
    if (res.success) {
      message.success('设置成功');
      fetchData();
    } else {
      message.error('设置失败：' + res.message);
    }
  });
};

const deleteApp = (record) => {
  loading.value = true;
  sysAppDelete({ id: record.id }).then(res => {
    loading.value = false;
    if (res.success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('删除失败：' + res.message);
    }
  }).catch(err => {
    loading.value = false;
    message.error('删除错误：' + err.message);
  });
};

const editAppStatus = (record) => {
  const newStatus = record.status === 0 ? 1 : 0;
  sysAppChangeStatus({ id: record.id, status: newStatus }).then(res => {
    if (res.success) {
      message.success('操作成功');
      fetchData();
    } else {
      message.error('操作失败：' + res.message);
    }
  });
};
</script>

<style scoped>
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
