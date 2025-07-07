<template>
  <a-row :gutter="24">
    <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
      <a-card :bordered="true" style="min-height: 850px;">
        <a-table
          size="middle"
          :columns="appColumns"
          :data-source="appData"
          :loading="loading"
          :pagination="false"
          :row-key="record => record.code"
          :custom-row="customAppRow"
          style="cursor: pointer;"
        />
      </a-card>
    </a-col>
    <a-col :md="19" :sm="24">
      <a-card :bordered="false" style="min-height: 850px;">
        <div class="table-operator" v-if="hasPerm('sysMenu:add')">
          <a-button type="primary" @click="handleAddMenu">
            <template #icon><PlusOutlined /></template>
            新增菜单
          </a-button>
        </div>
        <a-table
          :scroll="{ y: '70vh' }"
          size="middle"
          :columns="columns"
          :data-source="menuData"
          :loading="menuLoading"
          :pagination="false"
          :row-key="record => record.id"
          :default-expand-all-rows="true"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'type'">
              {{ typeFilter(text) }}
            </template>
            <template v-if="column.dataIndex === 'icon'">
              <component :is="text" v-if="text" />
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a v-if="hasPerm('sysMenu:edit')" @click="handleEditMenu(record)">编辑</a>
              <a-divider type="vertical" v-if="hasPerm('sysMenu:edit') && hasPerm('sysMenu:delete')" />
              <a-popconfirm
                v-if="hasPerm('sysMenu:delete')"
                placement="topRight"
                title="删除本菜单与下级？"
                @confirm="() => handleDeleteMenu(record)"
              >
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
        <add-form ref="addFormRef" @ok="refreshMenus" />
        <edit-form ref="editFormRef" @ok="refreshMenus" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, onMounted, computed, watch, h } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import * as Icons from '@ant-design/icons-vue';
import { hasPerm } from '@/utils/permissions';
import { getAppList } from '@/api/modular/system/appManage';
import { getMenuList, sysMenuDelete } from '@/api/modular/system/menuManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';

const loading = ref(true);
const menuLoading = ref(false);
const appData = ref([]);
const menuData = ref([]);
const typeDict = ref([]);
const selectedAppCode = ref('');

const addFormRef = ref();
const editFormRef = ref();

const appColumns = [{ title: '应用名称', align: 'center', dataIndex: 'name' }];
const columns = computed(() => {
  const baseColumns = [
    { title: '菜单名称', dataIndex: 'name', width: '20%' },
    { title: '菜单类型', dataIndex: 'type' },
    { title: '图标', dataIndex: 'icon' },
    { title: '组件', dataIndex: 'component', width: '20%', ellipsis: true },
    { title: '路由地址', dataIndex: 'router', key: 'router', ellipsis: true },
    { title: '排序', dataIndex: 'sort' },
  ];
  if (hasPerm('sysMenu:edit') || hasPerm('sysMenu:delete')) {
    baseColumns.push({
      title: '操作',
      dataIndex: 'action',
      width: '150px',
    });
  }
  return baseColumns;
});

onMounted(() => {
  loadApps();
  loadDicts();
});

const loadApps = () => {
  loading.value = true;
  getAppList().then(res => {
    if (res.success) {
      appData.value = res.data;
      if (appData.value.length > 0) {
        selectedAppCode.value = appData.value[0].code;
      }
    }
  }).finally(() => {
    loading.value = false;
  });
};

const loadMenus = (appCode) => {
  if (!appCode) {
    menuData.value = [];
    return;
  }
  menuLoading.value = true;
  getMenuList({ application: appCode }).then(res => {
    if (res.success) {
      menuData.value = res.data;
    }
  }).finally(() => {
    menuLoading.value = false;
  });
};

const loadDicts = () => {
  sysDictTypeDropDown({ code: 'menu_type' }).then(res => {
    typeDict.value = res.data;
  });
};

watch(selectedAppCode, (newVal) => {
  loadMenus(newVal);
});

const typeFilter = (type) => {
  const item = typeDict.value.find(item => item.code == type);
  return item ? item.value : type;
};

const customAppRow = (record) => {
  return {
    onClick: () => {
      selectedAppCode.value = record.code;
    },
    style: {
      backgroundColor: selectedAppCode.value === record.code ? '#e6f7ff' : '',
    },
  };
};

const handleAddMenu = () => {
  if (!selectedAppCode.value) {
    message.warning('请先选择一个应用');
    return;
  }
  addFormRef.value.add(selectedAppCode.value);
};

const handleEditMenu = (record) => {
  editFormRef.value.edit(record);
};

const handleDeleteMenu = (record) => {
  sysMenuDelete({ id: record.id }).then(res => {
    if (res.success) {
      message.success('删除成功');
      refreshMenus();
    } else {
      message.error('删除失败：' + res.message);
    }
  });
};

const refreshMenus = () => {
  loadMenus(selectedAppCode.value);
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
