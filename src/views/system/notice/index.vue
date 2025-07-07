<template>
  <div>
    <x-card v-if="hasPerm('sysNotice:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="关键字">
                  <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入标题、内容" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="类型">
                  <a-select v-model:value="queryParam.type" placeholder="请选择类型" allow-clear>
                    <a-select-option
                      v-for="item in typeDictTypeDropDown"
                      :key="item.code"
                      :value="item.code"
                    >
                      {{ item.value }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="handleQuery">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>

    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysNotice:add')">
          <template #icon><plus-outlined /></template>
          新增公告
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :row-key="(record) => record.id"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'status'">{{ statusFilter(text) }}</template>
          <template v-if="column.dataIndex === 'type'">{{ typeFilter(text) }}</template>
          <template v-if="column.dataIndex === 'action'">
            <div v-if="record.status === 0">
              <a @click="handleDetail(record)" v-if="hasPerm('sysNotice:detail')">查看</a>
              <a-divider type="vertical" v-if="hasPerm('sysNotice:edit')" />
              <a @click="handleEdit(record)" v-if="hasPerm('sysNotice:edit')">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysNotice:changeStatus')" />
              <a-popconfirm
                v-if="hasPerm('sysNotice:changeStatus')"
                placement="topRight"
                title="确认发布该信息"
                @confirm="() => editNoticeStatus(1, record)"
              >
                <a>发布</a>
              </a-popconfirm>
            </div>
            <div v-if="record.status === 1">
              <a @click="handleDetail(record)" v-if="hasPerm('sysNotice:detail')">查看</a>
              <a-divider type="vertical" v-if="hasPerm('sysNotice:changeStatus')" />
              <a-popconfirm
                v-if="hasPerm('sysNotice:changeStatus')"
                placement="topRight"
                title="确认撤回该信息"
                @confirm="() => editNoticeStatus(2, record)"
              >
                <a>撤回</a>
              </a-popconfirm>
            </div>
            <div v-if="record.status === 2">
              <a @click="handleDetail(record)" v-if="hasPerm('sysNotice:detail')">查看</a>
              <a-divider type="vertical" v-if="hasPerm('sysNotice:delete')" />
              <a-popconfirm
                v-if="hasPerm('sysNotice:delete')"
                placement="topRight"
                title="确认删除"
                @confirm="() => deleteNotice(record)"
              >
                <a>删除</a>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" v-model:visible="addFormVisible" @ok="handleOk" v-if="hasPerm('sysNotice:add')" />
      <edit-form ref="editFormRef" v-model:visible="editFormVisible" @ok="handleOk" v-if="hasPerm('sysNotice:edit')" />
      <detail-form ref="detailFormRef" v-model:visible="detailFormVisible" v-if="hasPerm('sysNotice:detail')" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { XCard } from '@/components';
import { sysNoticePage, sysNoticeDelete, sysNoticeChangeStatus } from '@/api/modular/system/noticeManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import DetailForm from './detailForm.vue';
import { useStore } from 'vuex';
import { PlusOutlined } from '@ant-design/icons-vue';

const store = useStore();
const hasPerm = (p) => store.getters.hasPerm(p);

const queryParam = reactive({ searchValue: '', type: undefined });
const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const statusDictTypeDropDown = ref([]);
const typeDictTypeDropDown = ref([]);

const addFormRef = ref();
const editFormRef = ref();
const detailFormRef = ref();

const addFormVisible = ref(false);
const editFormVisible = ref(false);
const detailFormVisible = ref(false);

const columns = ref([
  { title: '标题', dataIndex: 'title' },
  { title: '类型', dataIndex: 'type' },
  { title: '状态', dataIndex: 'status' },
]);

if (hasPerm('sysNotice:changeStatus') || hasPerm('sysNotice:edit') || hasPerm('sysNotice:delete')) {
  columns.value.push({
    title: '操作',
    width: '300px',
    dataIndex: 'action',
  });
}

const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter((item) => item.code == status);
  if (values.length > 0) {
    return values[0].value;
  }
};

const typeFilter = (type) => {
  const values = typeDictTypeDropDown.value.filter((item) => item.code == type);
  if (values.length > 0) {
    return values[0].value;
  }
};

const loadData = async (params = {}) => {
  loading.value = true;
  try {
    const res = await sysNoticePage({ ...params, ...queryParam });
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

const loadDictData = async () => {
  const statusRes = await sysDictTypeDropDown({ code: 'notice_status' });
  statusDictTypeDropDown.value = statusRes.data;
  const typeRes = await sysDictTypeDropDown({ code: 'notice_type' });
  typeDictTypeDropDown.value = typeRes.data;
};

onMounted(async () => {
  await loadDictData();
  loadData({ current: pagination.current, size: pagination.pageSize });
});

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData({ current: pag.current, size: pag.pageSize });
};

const handleQuery = () => {
  pagination.current = 1;
  loadData({ current: 1, size: pagination.pageSize });
};

const resetQuery = () => {
  queryParam.searchValue = '';
  queryParam.type = undefined;
  handleQuery();
};

const handleAdd = () => {
  addFormVisible.value = true;
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormVisible.value = true;
  editFormRef.value.edit(record);
};

const handleDetail = (record) => {
  detailFormVisible.value = true;
  detailFormRef.value.detail(record);
};

const editNoticeStatus = async (code, record) => {
  try {
    const res = await sysNoticeChangeStatus({ id: record.id, status: code });
    if (res.success) {
      message.success('操作成功');
      handleQuery();
    } else {
      message.error(`操作失败：${res.message}`);
    }
  } catch (err) {
    message.error(`操作错误：${err.message}`);
  }
};

const deleteNotice = async (record) => {
  try {
    const res = await sysNoticeDelete(record);
    if (res.success) {
      message.success('删除成功');
      handleQuery();
    } else {
      message.error(`删除失败：${res.message}`);
    }
  } catch (err) {
    message.error(`删除错误：${err.message}`);
  }
};

const handleOk = () => {
  handleQuery();
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
