<template>
  <a-row :gutter="24">
    <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
      <a-card :bordered="false" :loading="treeLoading" class="leftTree">
        <div v-if="orgTree.length > 0">
          <a-tree
            style="scroll: true"
            :tree-data="orgTree"
            :field-names="replaceFields"
            @select="handleClick"
            :default-expand-all="true"
            :default-expanded-keys="defaultExpandedKeys"
          />
        </div>
        <div v-else>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </a-card>
    </a-col>
    <a-col :md="19" :sm="24">
      <x-card v-if="hasPerm('sysOrg:page')">
        <template #content>
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="机构名称">
                    <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入机构名称" />
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
          <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysOrg:add')">
            <template #icon><plus-outlined /></template>
            新增机构
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
            <template v-if="column.dataIndex === 'orgType'">
              {{ orgTypeFilter(text) }}
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a @click="handleEdit(record)" v-if="hasPerm('sysOrg:edit')">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysOrg:edit') && hasPerm('sysOrg:delete')" />
              <a-popconfirm
                v-if="hasPerm('sysOrg:delete')"
                placement="topRight"
                title="确认删除"
                @confirm="() => deleteOrg(record)"
              >
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>

        <add-form ref="addFormRef" v-model:visible="addFormVisible" @ok="handleOk" />
        <edit-form ref="editFormRef" v-model:visible="editFormVisible" @ok="handleOk" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message, Empty } from 'ant-design-vue';
import { XCard } from '@/components';
import { getOrgPage, sysOrgDelete, getOrgTree } from '@/api/modular/system/orgManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import { useStore } from 'vuex';
import { PlusOutlined } from '@ant-design/icons-vue';

const store = useStore();
const hasPerm = (p) => store.getters.hasPerm(p);

const queryParam = reactive({ name: '', pid: '' });
const tableData = ref([]);
const loading = ref(false);
const treeLoading = ref(true);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const orgTree = ref([]);
const defaultExpandedKeys = ref([]);
const typeDictTypeDropDown = ref([]);
const replaceFields = { key: 'id', title: 'name' };

const addFormRef = ref();
const editFormRef = ref();
const addFormVisible = ref(false);
const editFormVisible = ref(false);

const columns = ref([
  { title: '机构名称', dataIndex: 'name' },
  { title: '机构类型', dataIndex: 'orgType' },
  { title: '唯一编码', dataIndex: 'code' },
  { title: '排序', dataIndex: 'sort' },
  { title: '备注', dataIndex: 'remark' },
]);

if (hasPerm('sysOrg:edit') || hasPerm('sysOrg:delete')) {
  columns.value.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  });
}

const orgTypeFilter = (orgtype) => {
  const values = typeDictTypeDropDown.value.filter((item) => item.code == orgtype);
  if (values.length > 0) {
    return values[0].value;
  }
};

const loadData = async (params = {}) => {
  loading.value = true;
  try {
    const res = await getOrgPage({ ...params, ...queryParam });
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

const loadOrgTree = async () => {
  treeLoading.value = true;
  try {
    const res = await getOrgTree(queryParam);
    if (res.success) {
      orgTree.value = res.data;
      if (res.data.length > 0) {
        queryParam.pid = res.data[0].id;
        defaultExpandedKeys.value = res.data.filter(item => item.parentId === 0).map(item => item.id);
      }
    }
  } finally {
    treeLoading.value = false;
  }
};

const loadDictData = async () => {
  const res = await sysDictTypeDropDown({ code: 'org_type' });
  typeDictTypeDropDown.value = res.data;
};

onMounted(async () => {
  await loadDictData();
  await loadOrgTree();
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
  queryParam.name = '';
  queryParam.pid = orgTree.value.length > 0 ? orgTree.value[0].id : '';
  handleQuery();
};

const handleClick = (selectedKeys) => {
  queryParam.pid = selectedKeys.join(',');
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

const deleteOrg = async (record) => {
  try {
    const res = await sysOrgDelete(record);
    if (res.success) {
      message.success('删除成功');
      await loadOrgTree();
      handleQuery();
    } else {
      message.error(`删除失败：${res.message}`);
    }
  } catch (err) {
    message.error(`删除错误：${err.message}`);
  }
};

const handleOk = async () => {
  await loadOrgTree();
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
.leftTree {
  height: 100%;
}
</style>
