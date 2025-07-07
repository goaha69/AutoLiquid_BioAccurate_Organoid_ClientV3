<template>
  <div>
    <x-card v-if="hasPerm('sysRole:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="角色名">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入角色名" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="唯一编码">
                  <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入唯一编码" />
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
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysRole:add')">
          <template #icon><plus-outlined /></template>
          新增角色
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'action'">
            <template v-if="record.roleType !== 1">
              <a @click="handleEdit(record)" v-if="hasPerm('sysRole:edit')">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysRole:edit')" />
              <a-dropdown v-if="hasPerm('sysRole:grantMenu') || hasPerm('sysRole:grantData') || hasPerm('sysRole:delete')">
                <a class="ant-dropdown-link"> 更多 <down-outlined /> </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="hasPerm('sysRole:grantMenu')">
                      <a @click="handleRoleMenu(record)">授权菜单</a>
                    </a-menu-item>
                     <a-menu-item v-if="hasPerm('sysRole:grantMenu')">
                      <a @click="handleRoleApi(record)">授权Api</a>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('sysRole:grantData')">
                      <a @click="handleRoleOrg(record)">授权数据</a>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('sysRole:delete')">
                      <a-popconfirm placement="topRight" title="确认删除" @confirm="() => deleteRole(record)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" v-model:visible="addFormVisible" @ok="handleOk" />
      <edit-form ref="editFormRef" v-model:visible="editFormVisible" @ok="handleOk" />
      <role-menu-form ref="roleMenuFormRef" v-model:visible="roleMenuFormVisible" @ok="handleOk" />
      <role-org-form ref="roleOrgFormRef" v-model:visible="roleOrgFormVisible" @ok="handleOk" />
      <role-api-form ref="roleApiFormRef" v-model:visible="roleApiFormVisible" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { XCard } from '@/components';
import { getRolePage, sysRoleDelete } from '@/api/modular/system/roleManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import RoleMenuForm from './roleMenuForm.vue';
import RoleApiForm from './roleApiForm.vue';
import RoleOrgForm from './roleOrgForm.vue';
import { useStore } from 'vuex';
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue';

const store = useStore();
const hasPerm = (p) => store.getters.hasPerm(p);

const columns = ref([
  { title: '角色', dataIndex: 'name' },
  { title: '唯一编码', dataIndex: 'code' },
  { title: '排序', dataIndex: 'sort' },
]);

if (hasPerm('sysRole:edit') || hasPerm('sysRole:grantMenu') || hasPerm('sysRole:grantData') || hasPerm('sysRole:delete')) {
  columns.value.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  });
}

const queryParam = reactive({ name: '', code: '' });
const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const addFormRef = ref();
const editFormRef = ref();
const roleMenuFormRef = ref();
const roleApiFormRef = ref();
const roleOrgFormRef = ref();

const addFormVisible = ref(false);
const editFormVisible = ref(false);
const roleMenuFormVisible = ref(false);
const roleApiFormVisible = ref(false);
const roleOrgFormVisible = ref(false);


const loadData = async (params = {}) => {
  loading.value = true;
  try {
    const res = await getRolePage({ ...params, ...queryParam });
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
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
  queryParam.code = '';
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

const handleRoleMenu = (record) => {
  roleMenuFormVisible.value = true;
  roleMenuFormRef.value.roleMenu(record);
};

const handleRoleApi = (record) => {
  roleApiFormVisible.value = true;
  roleApiFormRef.value.roleMenu(record);
};

const handleRoleOrg = (record) => {
  roleOrgFormVisible.value = true;
  roleOrgFormRef.value.roleOrg(record);
};

const deleteRole = async (record) => {
  try {
    const res = await sysRoleDelete(record);
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
