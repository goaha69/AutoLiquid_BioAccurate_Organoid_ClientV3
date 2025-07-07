<template>
  <a-modal
    title="选择用户"
    :width="1000"
    :open="visible"
    :destroy-on-close="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-row :gutter="24">
      <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
        <a-card :bordered="false" :loading="treeLoading">
          <div v-if="orgTree.length > 0">
            <a-tree
              :tree-data="orgTree"
              @select="handleTreeSelect"
              :default-expand-all="true"
              :field-names="{ children: 'children', title: 'name', key: 'id' }"
            />
          </div>
          <div v-else>
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </a-card>
      </a-col>
      <a-col :md="19" :sm="24">
        <a-form layout="inline" :model="queryParam" @finish="handleQuery">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="关键字">
                <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入姓名、账号、手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model:value="queryParam.searchStatus" allow-clear placeholder="请选择状态" default-value="0">
                  <a-select-option v-for="item in statusDictTypeDropDown" :key="item.code" :value="item.code">
                    {{ item.value }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" html-type="submit">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :pagination="pagination"
          :row-key="(record) => record.id"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'sex'">{{ sexFilter(text) }}</template>
            <template v-if="column.dataIndex === 'status'">{{ statusFilter(text) }}</template>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits, defineExpose } from 'vue';
import { Empty } from 'ant-design-vue';
import { getOrgTree } from '@/api/modular/system/orgManage';
import { getUserPage } from '@/api/modular/system/userManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';

const emit = defineEmits(['ok']);
const visible = ref(false);
const treeLoading = ref(true);
const orgTree = ref([]);
const queryParam = reactive({ searchStatus: '0' });
const sexDictTypeDropDown = ref([]);
const statusDictTypeDropDown = ref([]);
const tableData = ref([]);
const tableLoading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedRowKeys = ref([]);
const selectedRows = ref([]);

const columns = [
  { title: '账号', dataIndex: 'account' },
  { title: '姓名', dataIndex: 'name' },
  { title: '性别', dataIndex: 'sex' },
  { title: '手机', dataIndex: 'phone' },
  { title: '状态', dataIndex: 'status' },
];

const open = () => {
  visible.value = true;
  loadOrgTree();
  loadDicts();
  loadData();
};

const loadOrgTree = () => {
  treeLoading.value = true;
  getOrgTree().then(res => {
    if (res.success) {
      orgTree.value = res.data;
    }
  }).finally(() => {
    treeLoading.value = false;
  });
};

const loadDicts = () => {
  sysDictTypeDropDown({ code: 'sex' }).then(res => sexDictTypeDropDown.value = res.data);
  sysDictTypeDropDown({ code: 'common_status' }).then(res => statusDictTypeDropDown.value = res.data);
};

const loadData = (params = {}) => {
  tableLoading.value = true;
  const requestParams = {
    ...queryParam,
    ...params,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  getUserPage(requestParams).then(res => {
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  }).finally(() => {
    tableLoading.value = false;
  });
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const handleQuery = () => {
  pagination.current = 1;
  loadData();
};

const resetQuery = () => {
  Object.assign(queryParam, { searchValue: '', searchStatus: '0', orgId: null });
  handleQuery();
};

const handleTreeSelect = (selectedKeys) => {
  queryParam.orgId = selectedKeys.length > 0 ? selectedKeys[0] : null;
  handleQuery();
};

const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleSubmit = () => {
  emit('ok', selectedRows.value);
  handleCancel();
};

const handleCancel = () => {
  visible.value = false;
  selectedRowKeys.value = [];
  selectedRows.value = [];
  resetQuery();
};

const sexFilter = (text) => {
  const entry = sexDictTypeDropDown.value.find(item => item.code == text);
  return entry ? entry.value : text;
};

const statusFilter = (text) => {
  const entry = statusDictTypeDropDown.value.find(item => item.code == text);
  return entry ? entry.value : text;
};

defineExpose({
  open,
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
