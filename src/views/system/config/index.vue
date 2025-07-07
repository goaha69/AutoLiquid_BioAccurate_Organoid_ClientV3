<template>
  <div>
    <x-card v-if="hasPerm('sysConfig:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @finish="handleQuery">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="参数名称">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入参数名称" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="唯一编码">
                  <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入唯一编码" />
                </a-form-item>
              </a-col>
              <template v-if="advanced">
                <a-col :md="8" :sm="24">
                  <a-form-item label="所属分类">
                    <a-select v-model:value="queryParam.groupCode" placeholder="请选择所属分类" allow-clear>
                      <a-select-option v-for="item in groupCodeDictTypeDropDown" :key="item.code" :value="item.code">
                        {{ item.value }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </template>
              <a-col :md="!advanced && 8 || 24" :sm="24">
                <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {}">
                  <a-button type="primary" html-type="submit">查询</a-button>
                  <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
                  <a @click="toggleAdvanced" style="margin-left: 8px">
                    {{ advanced ? '收起' : '展开' }}
                    <UpOutlined v-if="advanced" />
                    <DownOutlined v-else />
                  </a>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysConfig:add')">
          <template #icon><PlusOutlined /></template>
          新增配置
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'name'">
            <ellipsis :length="20" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'code'">
            <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'value'">
            <ellipsis :length="16" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'remark'">
            <ellipsis :length="16" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'groupCode'">
            {{ groupCodeFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleEdit(record)" v-if="hasPerm('sysConfig:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysConfig:edit') && hasPerm('sysConfig:delete')" />
            <a-popconfirm
              v-if="hasPerm('sysConfig:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => handleDelete(record)"
            >
              <a>删除</a>
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
import { ref, onMounted, reactive } from 'vue';
import { Ellipsis, XCard } from '@/components';
import { sysConfigPage, sysConfigDelete } from '@/api/modular/system/configManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import { message } from 'ant-design-vue';
import { hasPerm } from '@/utils/permission/index';
import { PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';

const advanced = ref(false);
const queryParam = ref({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedRowKeys = ref([]);
const selectedRows = ref([]);
const groupCodeDictTypeDropDown = ref([]);
const addFormRef = ref();
const editFormRef = ref();

const columns = [
  {
    title: '参数名称',
    dataIndex: 'name',
  },
  {
    title: '唯一编码',
    dataIndex: 'code',
  },
  {
    title: '参数值',
    dataIndex: 'value',
  },
  {
    title: '所属分类',
    dataIndex: 'groupCode',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

if (hasPerm('sysConfig:edit') || hasPerm('sysConfig:delete')) {
  columns.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  });
}

const loadData = () => {
  loading.value = true;
  sysConfigPage({ ...queryParam.value, ...pagination })
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

const toggleAdvanced = () => {
  advanced.value = !advanced.value;
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleOk = () => {
  loadData();
};

const handleDelete = (record) => {
  sysConfigDelete(record).then((res) => {
    if (res.success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败：' + res.message);
    }
  });
};

const loadDict = () => {
  sysDictTypeDropDown({ code: 'consts_type' }).then((res) => {
    groupCodeDictTypeDropDown.value = res.data;
  });
};

const groupCodeFilter = (groupCode) => {
  const values = groupCodeDictTypeDropDown.value.filter((item) => item.code === groupCode);
  if (values.length > 0) {
    return values[0].value;
  }
};

onMounted(() => {
  loadDict();
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
