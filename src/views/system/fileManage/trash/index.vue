<template>
  <div>
    <a-card :bordered="false" :bodyStyle="tstyle">
      <a-form layout="inline" :model="queryParam" v-if="hasPerm('Document:page')">
        <a-row :gutter="48">
          <a-col :md="6" :sm="24">
            <a-form-item label="名称">
              <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入名称" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="类型">
              <a-select v-model:value="queryParam.fileType" placeholder="请选择类型" style="width: 100%">
                <a-select-option v-for="item in fileTypeData" :key="item.name" :value="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="标签">
              <a-select v-model:value="queryParam.label" placeholder="请选择标签" style="width: 100%">
                <a-select-option v-for="item in documentlabelData" :key="item.code" :value="item.code">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <template #title>
        <div class="file-tool">
          <div class="btn-tool">
            <a-button
              type="primary"
              v-if="hasPerm('Trash:edit')"
              @click="handleEmpty"
            ><delete-outlined />清空回收站</a-button>
            <a-button
              v-if="hasPerm('Trash:edit')"
              :disabled="!hasSelected"
              @click="handleMassRecovers"
              :loading="loading"
            ><redo-outlined />恢复</a-button>
            <a-button
              type="danger"
              v-if="hasPerm('Trash:delete')"
              :disabled="!hasSelected"
              @click="handleMassDelete"
              :loading="loading"
            ><delete-outlined />删除</a-button>
            <a-button type="dashed" :disabled="!hasSelected" @click="clearSelected" :loading="loading">清空选择</a-button>
          </div>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="tableLoading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'name'">
            <template v-if="record.fileType === '文件夹'">
              <folder-open-two-tone two-tone-color="#F7C709" />
              <a style="margin-left: 5px;">{{ text }}</a>
            </template>
            <template v-else>
              <file-text-outlined v-if="record.fileType === '文档'" />
              <file-image-outlined v-else-if="record.fileType === '图片'" />
              <file-zip-outlined v-else-if="record.fileType === '压缩包'" />
              <file-outlined v-else-if="record.fileType === '应用程序'" />
              <file-outlined v-else />
              <a-tooltip placement="top">
                <template #title><span>{{ text }}</span></template>
                <span style="margin-left: 5px;">{{ text }}</span>
              </a-tooltip>
            </template>
          </template>
          <template v-if="column.dataIndex === 'fileType'">
            <a-tag v-if="text === '文件夹'" color="#ffcc00" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '文档'" color="#3399ff" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '图片'" color="#ff3333" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '应用程序'" color="#A2A2A2" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else-if="text === '压缩包'" color="#76CD76" style="margin: 0;font-size : 14px">{{text}}</a-tag>
            <a-tag v-else color="grey" style="margin: 0;font-size : 14px">{{text}}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'label'">
            <a-tag v-if="text > 0" color="geekblue" style="margin: 0;font-size : 14px">{{ getDocLabel(text) }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-popconfirm placement="topRight" title="确认恢复？" @confirm="() => handleRecover(record)">
              <a>恢复</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a-popconfirm placement="topRight" title="确认删除？" @confirm="() => handleDelete(record)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  TrashPage,
  TrashDelete,
  TrashDeletes,
  TrashRecover,
  TrashRecovers,
  TrashEmpty
} from '@/api/modular/system/fileManage/trashManage';
import { message } from 'ant-design-vue';
import { hasPerm } from '@/core/permission/permission';
import {
  DeleteOutlined,
  RedoOutlined,
  FolderOpenTwoTone,
  FileTextOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import { dictTypeData } from '@/api/modular/system/dictTypeManage';

const tstyle = {
  'padding-bottom': '0px',
  'margin-bottom': '10px',
};

const queryParam = reactive({});
const dataSource = ref([]);
const tableLoading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedRowKeys = ref([]);
const loading = ref(false);
const fileTypeData = ref([]);
const documentlabelData = ref([]);

const columns = [
  { title: '名称', dataIndex: 'name', width: '240px', ellipsis: true },
  { title: '类型', dataIndex: 'fileType' },
  { title: '创建时间', dataIndex: 'createdTime', ellipsis: true },
  { title: '创建者', dataIndex: 'createdUserName', ellipsis: true },
  { title: '修改时间', dataIndex: 'updatedTime', ellipsis: true },
  { title: '修改者', dataIndex: 'updatedUserName', ellipsis: true },
  { title: '大小', dataIndex: 'fileSize' },
  { title: '标签', dataIndex: 'label' },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
];

if (hasPerm('Trash:edit') || hasPerm('Trash:delete')) {
  columns.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
  });
}

const hasSelected = computed(() => selectedRowKeys.value.length > 0);

const getDocLabel = (code) => {
  const label = documentlabelData.value.find(item => item.code === code.toString());
  return label ? label.name : '';
};

const fetchData = async () => {
  tableLoading.value = true;
  const params = {
    ...queryParam,
    current: pagination.value.current,
    size: pagination.value.pageSize,
  };
  try {
    const res = await TrashPage(params);
    dataSource.value = res.data.records;
    pagination.value.total = res.data.total;
  } finally {
    tableLoading.value = false;
  }
};

const loadDicts = async () => {
  fileTypeData.value = await dictTypeData({ dictTypeCode: 'file_type' });
  documentlabelData.value = await dictTypeData({ dictTypeCode: 'doc_label' });
};

onMounted(() => {
  fetchData();
  loadDicts();
});

const handleTableChange = (pag) => {
  pagination.value = pag;
  fetchData();
};

const handleQuery = () => {
  pagination.value.current = 1;
  fetchData();
};

const resetQuery = () => {
  Object.keys(queryParam).forEach(key => delete queryParam[key]);
  handleQuery();
};

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

const clearSelected = () => {
  selectedRowKeys.value = [];
};

const handleEmpty = async () => {
  loading.value = true;
  try {
    const res = await TrashEmpty();
    if (res.success) {
      message.success('清空成功');
      fetchData();
      clearSelected();
    } else {
      message.error('清空失败：' + res.message);
    }
  } finally {
    loading.value = false;
  }
};

const handleMassRecovers = async () => {
  loading.value = true;
  try {
    const res = await TrashRecovers({ ids: selectedRowKeys.value.join(',') });
    if (res.success) {
      message.success('恢复成功');
      fetchData();
      clearSelected();
    } else {
      message.error('恢复失败：' + res.message);
    }
  } finally {
    loading.value = false;
  }
};

const handleMassDelete = async () => {
  loading.value = true;
  try {
    const res = await TrashDeletes({ ids: selectedRowKeys.value.join(',') });
    if (res.success) {
      message.success('删除成功');
      fetchData();
      clearSelected();
    } else {
      message.error('删除失败：' + res.message);
    }
  } finally {
    loading.value = false;
  }
};

const handleRecover = async (record) => {
  try {
    const res = await TrashRecover({ id: record.id });
    if (res.success) {
      message.success('恢复成功');
      fetchData();
    } else {
      message.error('恢复失败：' + res.message);
    }
  } catch (e) {
    message.error('恢复出错');
  }
};

const handleDelete = async (record) => {
  try {
    const res = await TrashDelete({ id: record.id });
    if (res.success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('删除失败：' + res.message);
    }
  } catch (e) {
    message.error('删除出错');
  }
};
</script>

<style scoped>
.file-tool {
  display: flex;
  justify-content: space-between;
}
.btn-tool > .ant-btn {
  margin-right: 8px;
}
</style>
