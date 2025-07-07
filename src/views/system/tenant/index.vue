<template>
  <div>
    <x-card v-if="hasPerm('sysTenant:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @finish="handleQuery">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="公司名称">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入租户名称" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" html-type="submit">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>

    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysTenant:add')">
          <template #icon><plus-outlined /></template>
          新增租户
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
            <a @click="handleEdit(record)" v-if="hasPerm('sysTenant:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysTenant:edit') && hasPerm('simulationTenantLogin')" />
            <a @click="simulationTenantLogin(record)" v-if="hasPerm('simulationTenantLogin')">模拟登录</a>
            <a-divider type="vertical" v-if="hasPerm('simulationTenantLogin') && (hasPerm('sysTenant:grantMenu') || hasPerm('sysTenant:delete'))" />
            <a-dropdown v-if="hasPerm('sysTenant:grantMenu') || hasPerm('sysTenant:delete')">
              <a class="ant-dropdown-link">
                更多 <down-outlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPerm('sysTenant:grantMenu')">
                    <a @click="handleMenu(record)">授权菜单</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('sysTenant:resetPwd')">
                    <a-popconfirm placement="topRight" title="确认重置密码？" @confirm="() => resetPwd(record)">
                      <a>重置密码</a>
                    </a-popconfirm>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('sysTenant:delete')">
                    <a-popconfirm placement="topRight" title="确认删除？" @confirm="() => deleteRecord(record)">
                      <a>删除</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleOk" />
      <tenant-menu-form ref="tenantMenuFormRef" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { XCard } from '@/components';
import {
  sysTenantPage,
  sysTenantDelete,
  sysTenantResetPwd,
} from '@/api/modular/system/tenantManage';
import { simulationTenantLogin as apiSimulationTenantLogin } from '@/api/modular/system/loginManage';
import { ACCESS_TOKEN, ALL_APPS_MENU } from '@/store/mutation-types';
import { useStore } from 'vuex';
import { ls } from '@/utils/storage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import TenantMenuForm from './tenantMenuForm.vue';
import { DownOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { hasPerm } from '@/utils/permission/index';

const store = useStore();

const columns = [
  { title: '公司名称', dataIndex: 'name' },
  { title: '账号(邮箱)', dataIndex: 'email' },
  { title: '姓名', dataIndex: 'adminName' },
  { title: '电话', dataIndex: 'phone' },
  { title: '创建时间', dataIndex: 'createdTime' },
  { title: '备注', dataIndex: 'remark' },
  { title: '操作', dataIndex: 'action' },
];

const queryParam = ref({ name: '' });
const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const addFormRef = ref();
const editFormRef = ref();
const tenantMenuFormRef = ref();

const loadData = async () => {
  loading.value = true;
  const params = {
    current: pagination.current,
    size: pagination.pageSize,
    ...queryParam.value,
  };
  try {
    const res = await sysTenantPage(params);
    tableData.value = res.data.records;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

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
  queryParam.value = { name: '' };
  handleQuery();
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleMenu = (record) => {
  tenantMenuFormRef.value.tenantMenu(record);
};

const handleOk = () => {
  handleQuery();
};

const deleteRecord = async (record) => {
  try {
    const res = await sysTenantDelete(record);
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

const resetPwd = async (record) => {
  try {
    const res = await sysTenantResetPwd({ id: record.id });
    if (res.success) {
      Modal.success({
        title: '重置成功',
        content: `新密码为：${res.data}`,
      });
    } else {
      message.error(`重置失败：${res.message}`);
    }
  } catch (err) {
    message.error(`重置错误：${err.message}`);
  }
};

const simulationTenantLogin = async (record) => {
  try {
    const res = await apiSimulationTenantLogin({
      tenantId: record.id,
    });
    if (res.success) {
      const token = res.data;
      ls.remove(ALL_APPS_MENU);
      ls.set(ACCESS_TOKEN, token, 7 * 24 * 60 * 60 * 1000);
      window.open(`${window.location.origin}/`, '_blank');
    } else {
      message.error(`登录失败：${res.message}`);
    }
  } catch (err) {
    message.error(`登录错误：${err.message}`);
  }
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
