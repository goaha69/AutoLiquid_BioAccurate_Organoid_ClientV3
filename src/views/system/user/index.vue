<template>
  <a-row :gutter="24">
    <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
      <a-card :bordered="false" :loading="treeLoading" class="leftTree">
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
      <x-card v-if="hasPerm('sysUser:page')">
        <template #content>
          <a-form layout="inline" :model="queryParam" @finish="handleQuery">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="关键字">
                  <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入姓名、账号、手机号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="状态">
                  <a-select v-model:value="queryParam.searchStatus" allow-clear placeholder="请选择状态">
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
        </template>
      </x-card>
      <a-card :bordered="false">
        <div class="table-operator">
          <a-button type="primary" v-if="hasPerm('sysUser:add')" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增用户
          </a-button>
          <a-upload
            v-if="hasPerm('sysUser:import')"
            name="file"
            :show-upload-list="false"
            :custom-request="handleImport"
          >
            <a-button>
              <template #icon><UploadOutlined /></template>
              导入
            </a-button>
          </a-upload>
          <a-button v-if="hasPerm('sysUser:export')" @click="handleExport">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :pagination="pagination"
          :row-key="record => record.id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'roleList'">
                <a-tag v-for="roleName in record.roleNameList" :key="roleName" color="blue">{{ roleName }}</a-tag>
                <span v-if="!record.roleNameList || record.roleNameList.length === 0">暂未授权</span>
            </template>
            <template v-if="column.dataIndex === 'sex'">
              {{ sexFilter(text) }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-popconfirm
                v-if="hasPerm('sysUser:changeStatus')"
                placement="top"
                :title="text === 0 ? '确定停用该用户？' : '确定启用该用户？'"
                @confirm="() => changeStatus(record)"
              >
                <a><a-badge :status="statusBadgeFilter(text)" :text="statusFilter(text)" /></a>
              </a-popconfirm>
              <span v-else><a-badge :status="statusBadgeFilter(text)" :text="statusFilter(text)" /></span>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a v-if="hasPerm('sysUser:edit')" @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysUser:edit') && (hasPerm('sysUser:resetPwd') || hasPerm('sysUser:grantRole') || hasPerm('sysUser:grantData') || hasPerm('sysUser:delete'))" />
              <a-dropdown>
                <a class="ant-dropdown-link">更多 <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="hasPerm('sysUser:resetPwd')">
                      <a-popconfirm placement="topRight" title="确认重置密码？" @confirm="() => handleResetPwd(record)">
                        <a>重置密码</a>
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('sysUser:grantRole')">
                      <a @click="handleGrantRole(record)">授权角色</a>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('sysUser:grantData')">
                      <a @click="handleGrantData(record)">授权数据</a>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('sysUser:delete')">
                      <a-popconfirm placement="topRight" title="确认删除？" @confirm="() => handleDelete(record)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
        </a-table>
        <add-form ref="addFormRef" @ok="refreshTable" />
        <edit-form ref="editFormRef" @ok="refreshTable" />
        <user-role-form ref="userRoleFormRef" @ok="refreshTable" />
        <user-org-form ref="userOrgFormRef" @ok="refreshTable" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message, Empty, Modal } from 'ant-design-vue';
import { XCard } from '@/components';
import { DownOutlined, PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import { hasPerm } from '@/utils/permission/index';
import { getOrgTree } from '@/api/modular/system/orgManage';
import { getUserPage, sysUserDelete, sysUserChangeStatus, sysUserResetPwd, sysUserExport, sysUserImport } from '@/api/modular/system/userManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { downloadfile } from '@/utils/util';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import UserRoleForm from './userRoleForm.vue';
import UserOrgForm from './userOrgForm.vue';

const queryParam = reactive({
  searchStatus: 0,
});
const treeLoading = ref(true);
const orgTree = ref([]);
const sexDictTypeDropDown = ref([]);
const statusDictTypeDropDown = ref([]);

const tableData = ref([]);
const tableLoading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const addFormRef = ref();
const editFormRef = ref();
const userRoleFormRef = ref();
const userOrgFormRef = ref();

const columns = computed(() => {
  const baseColumns = [
    { title: '账号', dataIndex: 'account', sorter: true },
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'roleList' },
    { title: '性别', dataIndex: 'sex' },
    { title: '手机', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status' },
  ];
  if (hasPerm('sysUser:edit') || hasPerm('sysUser:resetPwd') || hasPerm('sysUser:grantRole') || hasPerm('sysUser:grantData') || hasPerm('sysUser:delete')) {
    baseColumns.push({
      title: '操作',
      width: '150px',
      dataIndex: 'action',
    });
  }
  return baseColumns;
});

onMounted(() => {
  loadOrgTree();
  loadDicts();
  loadData();
});

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

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  const sortParams = {};
  if (sorter.field) {
    sortParams.sortField = sorter.field;
    sortParams.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
  }
  loadData(sortParams);
};

const handleQuery = () => {
  pagination.current = 1;
  loadData();
};

const resetQuery = () => {
  Object.assign(queryParam, { searchValue: '', searchStatus: 0, orgId: null });
  handleQuery();
};

const refreshTable = () => {
  loadData();
};

const handleTreeSelect = (selectedKeys) => {
  queryParam.orgId = selectedKeys.length > 0 ? selectedKeys[0] : null;
  handleQuery();
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleResetPwd = (record) => {
  sysUserResetPwd({ id: record.id }).then(res => {
    if (res.success) {
      Modal.success({
        title: '重置成功',
        content: `新密码为：${res.data}`,
      });
    } else {
      message.error(`重置失败：${res.message}`);
    }
  });
};

const handleGrantRole = (record) => {
  userRoleFormRef.value.userRole(record);
};

const handleGrantData = (record) => {
  userOrgFormRef.value.userOrg(record);
};

const handleDelete = (record) => {
  sysUserDelete({ ids: [record.id] }).then(res => {
    if (res.success) {
      message.success('删除成功');
      refreshTable();
    } else {
      message.error(`删除失败：${res.message}`);
    }
  });
};

const changeStatus = (record) => {
  sysUserChangeStatus({ id: record.id }).then(res => {
    if (res.success) {
      message.success('状态更新成功');
      refreshTable();
    } else {
      message.error(`状态更新失败：${res.message}`);
    }
  });
};

const handleImport = (options) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);
  sysUserImport(formData).then(() => {
    message.success('导入成功');
    refreshTable();
  }).catch(() => {
    message.error('导入失败');
  });
};

const handleExport = () => {
  sysUserExport(queryParam).then(res => {
    downloadfile(res);
  });
};

const sexFilter = (text) => {
  const entry = sexDictTypeDropDown.value.find(item => item.code == text);
  return entry ? entry.value : text;
};

const statusFilter = (text) => {
  const entry = statusDictTypeDropDown.value.find(item => item.code == text);
  return entry ? entry.value : text;
};

const statusBadgeFilter = (text) => {
    const commonStatus = {
        '0': 'processing',
        '1': 'default',
        '2': 'error',
    }
    return commonStatus[text] ?? 'default';
};

</script>
<style lang="less" scoped>
.leftTree {
  height: calc(100vh - 122px);
  overflow: auto;
}
</style>
