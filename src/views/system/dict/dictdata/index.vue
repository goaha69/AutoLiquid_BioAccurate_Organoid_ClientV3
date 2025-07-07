<template>
  <a-modal
    :title="'字典值管理：' + typeName"
    :width="1200"
    :open="visible"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @finish="handleQuery">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="字典值">
                <a-input v-model:value="queryParam.value" allow-clear placeholder="请输入字典值" />
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
                <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" @click="handleAddClick" v-if="hasPerm('sysDictData:add')">
          <template #icon><PlusOutlined /></template>
          新增数据
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ statusFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleEditClick(record)" v-if="hasPerm('sysDictData:edit')">编辑</a>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysDictData:edit') && hasPerm('sysDictData:delete')"
            />
            <a-popconfirm
              v-if="hasPerm('sysDictData:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => sysDictDataDeleteHandler(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleOk" />
    </a-card>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { sysDictDataPage, sysDictDataDelete } from '@/api/modular/system/dictDataManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { PlusOutlined } from '@ant-design/icons-vue';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import { message } from 'ant-design-vue';
import { hasPerm } from '@/utils/permission/index';

const visible = ref(false);
const typeId = ref('');
const typeName = ref('');
const queryParam = ref({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  {
    title: '字典值',
    dataIndex: 'value',
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
  {
    title: '状态',
    dataIndex: 'status',
  },
];

if (hasPerm('sysDictData:edit') || hasPerm('sysDictData:delete')) {
  columns.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  });
}

const statusDict = ref([]);
const addFormRef = ref();
const editFormRef = ref();

const dictData = (record) => {
  visible.value = true;
  typeId.value = record.id;
  typeName.value = record.name;
  loadData();
};

const loadData = () => {
  loading.value = true;
  const params = {
    ...queryParam.value,
    typeId: typeId.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  sysDictDataPage(params)
    .then((res) => {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleQuery = () => {
  pagination.current = 1;
  loadData();
};

const resetQuery = () => {
  queryParam.value = {};
  handleQuery();
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const handleOk = () => {
  loadData();
};

const handleCancel = () => {
  visible.value = false;
};

const statusFilter = (status) => {
  const values = statusDict.value.filter((item) => item.code == status);
  if (values.length > 0) {
    return values[0].value;
  }
};

const loadDict = () => {
  sysDictTypeDropDown({ code: 'common_status' }).then((res) => {
    statusDict.value = res.data;
  });
};

const handleAddClick = () => {
  addFormRef.value.add(typeId.value);
};

const handleEditClick = (record) => {
  editFormRef.value.edit(record);
};

const sysDictDataDeleteHandler = (record) => {
  sysDictDataDelete(record).then((res) => {
    if (res.success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败：' + res.message);
    }
  });
};

onMounted(() => {
  loadDict();
});

defineExpose({
  dictData,
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
