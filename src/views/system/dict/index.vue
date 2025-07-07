<template>
  <div>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @finish="handleSearch">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="类型名称">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入类型名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="唯一编码">
                <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入唯一编码" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" html-type="submit">查询</a-button>
                <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" @click="handleAddClick">
          <template #icon><PlusOutlined /></template>
          新增类型
        </a-button>
        <a-button @click="refreshDicCache" type="primary">
          <template #icon><RedoOutlined /></template>
          刷新缓存
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ statusFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleDictClick(record)">字典</a>
            <a-divider type="vertical" />
            <a @click="handleEditClick(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm placement="topRight" title="确认删除？" @confirm="() => handleDelete(record)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleOk" />
      <dict-data-form ref="dictDataFormRef" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { sysDictTypePage, sysDictTypeDelete, sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons-vue';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import DictDataForm from './dictData.vue';

const queryParam = ref({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
});

const columns = [
  {
    title: '类型名称',
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
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  },
];

const statusDict = ref([]);
const addFormRef = ref();
const editFormRef = ref();
const dictDataFormRef = ref();
const store = useStore();

const loadData = () => {
  loading.value = true;
  const params = {
    ...queryParam.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  sysDictTypePage(params)
    .then((res) => {
      if (res.success) {
        dataSource.value = res.data.records || [];
        pagination.total = res.data.total || 0;
      } else {
        message.error('加载数据失败：' + res.message);
      }
    })
    .catch((err) => {
      message.error('加载数据错误：' + err.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

const loadStatusDict = () => {
  sysDictTypeDropDown({ code: 'common_status' })
    .then((res) => {
      if (res.success) {
        statusDict.value = res.data || [];
      }
    })
    .catch((err) => {
      console.warn('加载状态字典失败：', err);
    });
};

const statusFilter = (status) => {
  const values = statusDict.value.filter((item) => item.code == status);
  if (values.length > 0) {
    return values[0].value;
  }
  return status;
};

const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

const handleReset = () => {
  queryParam.value = {};
  pagination.current = 1;
  loadData();
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const handleDelete = (record) => {
  sysDictTypeDelete(record)
    .then((res) => {
      if (res.success) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + res.message);
      }
    })
    .catch((err) => {
      message.error('删除错误：' + err.message);
    });
};

const refreshDicCache = () => {
  store.dispatch('dictTypeData')
    .then(() => {
      message.success('刷新成功');
    })
    .catch((err) => {
      message.error('刷新失败：' + err.message);
    });
};

const handleAddClick = () => {
  addFormRef.value.add();
};

const handleEditClick = (record) => {
  editFormRef.value.edit(record);
};

const handleDictClick = (record) => {
  dictDataFormRef.value.dictData(record);
};

const handleOk = () => {
  loadData();
};

onMounted(() => {
  loadStatusDict();
  loadData();
});
</script>

<style lang="less" scoped>
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
