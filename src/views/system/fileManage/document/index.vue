<template>
  <a-row :gutter="24">
    <a-col :md="4" :sm="24" style="padding: 0 0 0 0;">
      <a-card :bordered="false" :loading="treeLoading" class="leftTree">
        <div v-if="docTree.length > 0">
          <a-tree
            style="scroll: true"
            :tree-data="docTree"
            @select="handleClick"
            :default-expand-all="false"
            :default-expanded-keys="defaultExpandedKeys"
            :replace-fields="replaceFields"
          />
        </div>
        <div v-else>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </a-card>
    </a-col>
    <a-col :md="20" :sm="24">
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
              <a-button type="primary" v-if="hasPerm('Document:add')" @click="handleAdd">
                <template #icon><folder-add-outlined /></template>
                新建文件夹
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="handleUploadFiles">上传文件</a-menu-item>
                    <a-menu-item key="2" @click="handleUploadFolder">上传文件夹</a-menu-item>
                  </a-menu>
                </template>
                <a-button v-if="hasPerm('Document:add')">
                  <template #icon><upload-outlined /></template>
                  上传
                  <down-outlined />
                </a-button>
              </a-dropdown>
              <a-button type="danger" v-if="hasPerm('Document:delete')" :disabled="!hasSelected" @click="handleMassDelete" :loading="loading">
                <template #icon><delete-outlined /></template>
                删除
              </a-button>
              <a-button v-if="hasPerm('Document:edit')" :disabled="!hasSelected" @click="handleMassEdit" :loading="loading">
                <template #icon><edit-outlined /></template>
                移动
              </a-button>
              <a-button type="dashed" :disabled="!hasSelected" @click="clearSelected" :loading="loading">
                清空选择
              </a-button>
            </div>
            <div class="path-tool">
              <template v-if="pathStack.length">
                <a @click="goBack">返回上一级</a>
                <a-divider type="vertical" />
              </template>
              <a @click="goHome" style="margin-right: 6px">全部文件</a>
              <template v-for="item in pathStack" :key="item.id">
                <right-outlined />
                <a @click="go(item.id)" style="margin: 0 6px;">{{ item.name }}</a>
              </template>
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
                <a @click="handleNextFolder(record)" style="margin-left: 5px;">{{ text }}</a>
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
              <a-tag v-if="text === '文件夹'" color="#ffcc00">{{text}}</a-tag>
              <a-tag v-else-if="text === '文档'" color="#3399ff">{{text}}</a-tag>
              <a-tag v-else-if="text === '图片'" color="#ff3333">{{text}}</a-tag>
              <a-tag v-else-if="text === '应用程序'" color="#A2A2A2">{{text}}</a-tag>
              <a-tag v-else-if="text === '压缩包'" color="#76CD76">{{text}}</a-tag>
              <a-tag v-else color="grey">{{text}}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'label'">
               <a-tag v-if="text > 0" color="geekblue">{{ getDocLabel(text) }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-space>
                <a @click="handleRename(record)" v-if="hasPerm('Document:edit')">重命名</a>
                <a-dropdown>
                   <a class="ant-dropdown-link">更多 <down-outlined /></a>
                   <template #overlay>
                     <a-menu>
                        <a-menu-item v-if="hasPerm('Document:download') && (record.fileType ==='文档'||record.fileType ==='图片')">
                          <a @click="handlePreview(record)">预览</a>
                        </a-menu-item>
                        <a-menu-item v-if="hasPerm('Document:download') && (record.fileSuffix === 'doc' || record.fileSuffix === 'docx')">
                          <a @click="handleEdit(record)">编辑</a>
                        </a-menu-item>
                        <a-menu-item v-if="hasPerm('Document:download')">
                          <a @click="handleDownload(record)">下载</a>
                        </a-menu-item>
                        <a-menu-item v-if="hasPerm('Document:delete')">
                           <a-popconfirm placement="topRight" title="确认删除" @confirm="() => handleDelete(record)">
                             <a>删除</a>
                           </a-popconfirm>
                        </a-menu-item>
                     </a-menu>
                   </template>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>

        <add-form ref="addFormRef" @ok="handleOk" />
        <edit-form ref="editFormRef" @ok="handleOk" />
        <upload-files ref="uploadFilesRef" @ok="handleOk" />
        <upload-folder ref="uploadFolderRef" @ok="handleOk" />
        <mass-edit-form ref="massEditFormRef" @ok="handleOk" />
        <preview-form ref="previewFormRef" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  DocumentPage,
  DocumentTree,
  DocumentDelete,
  DocumentDeletes,
  DocumentDownload,
  DocumentPreview
} from '@/api/modular/system/fileManage/documentManage';
import { dictTypeData } from '@/api/modular/system/dictTypeManage';
import { message, Modal, Empty } from 'ant-design-vue';
import { hasPerm } from '@/core/permission/permission';
import { findParents } from '@/utils/treeUtils';
import { downloadfile } from '@/utils/util';
import addForm from './addForm.vue';
import editForm from './editForm.vue';
import uploadFiles from './upload/uploadFiles.vue';
import uploadFolder from './upload/uploadFolder.vue';
import massEditForm from './massEditForm.vue';
import previewForm from './previewForm.vue';
import {
  FolderAddOutlined,
  UploadOutlined,
  DownOutlined,
  RightOutlined,
  FolderOpenTwoTone,
  FileTextOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';

const tstyle = {
  'padding-bottom': '0px',
  'margin-bottom': '10px',
};

const queryParam = reactive({});
const docTree = ref([]);
const treeLoading = ref(false);
const defaultExpandedKeys = ref([]);
const replaceFields = { children: 'children', title: 'name', key: 'id' };

const dataSource = ref([]);
const tableLoading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedRowKeys = ref([]);
const loading = ref(false);
const pathStack = ref([]);
const pId = ref(0);

const fileTypeData = ref([]);
const documentlabelData = ref([]);

const addFormRef = ref();
const editFormRef = ref();
const uploadFilesRef = ref();
const uploadFolderRef = ref();
const massEditFormRef = ref();
const previewFormRef = ref();

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
  { title: '操作', dataIndex: 'action', width: '200px' },
];

const hasSelected = computed(() => selectedRowKeys.value.length > 0);

const getDocLabel = (code) => {
  const label = documentlabelData.value.find(item => item.code === code.toString());
  return label ? label.name : '';
};

const loadTreeData = async () => {
  treeLoading.value = true;
  try {
    const res = await DocumentTree();
    docTree.value = res.data;
    if (res.data.length > 0) {
      defaultExpandedKeys.value = [res.data[0].id];
    }
  } finally {
    treeLoading.value = false;
  }
};

const fetchData = async () => {
  tableLoading.value = true;
  const params = {
    pId: pId.value,
    ...queryParam,
    current: pagination.value.current,
    size: pagination.value.pageSize,
  };
  try {
    const res = await DocumentPage(params);
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
  loadTreeData();
  fetchData();
  loadDicts();
});

const handleOk = () => {
  fetchData();
  loadTreeData();
};

const handleClick = (selectedKeys, e) => {
  pId.value = selectedKeys[0];
  pathStack.value = findParents(docTree.value, pId.value);
  handleQuery();
};

const handleQuery = () => {
  pagination.value.current = 1;
  fetchData();
};

const resetQuery = () => {
  Object.keys(queryParam).forEach(key => delete queryParam[key]);
  handleQuery();
};

const handleTableChange = (pag) => {
  pagination.value = pag;
  fetchData();
};

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

const clearSelected = () => {
  selectedRowKeys.value = [];
};

const handleAdd = () => {
  addFormRef.value.add(pId.value);
};

const handleUploadFiles = () => {
  uploadFilesRef.value.upload(pId.value);
};

const handleUploadFolder = () => {
  uploadFolderRef.value.upload(pId.value);
};

const handleMassDelete = async () => {
  loading.value = true;
  try {
    const res = await DocumentDeletes({ ids: selectedRowKeys.value.join(',') });
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

const handleMassEdit = () => {
  massEditFormRef.value.edit(selectedRowKeys.value);
};

const goBack = () => {
  if (pathStack.value.length > 0) {
    pId.value = pathStack.value[pathStack.value.length - 1].pId;
    pathStack.value.pop();
    handleQuery();
  }
};

const goHome = () => {
  pId.value = 0;
  pathStack.value = [];
  handleQuery();
};

const go = (id) => {
  pId.value = id;
  pathStack.value = findParents(docTree.value, id);
  handleQuery();
};

const handleNextFolder = (record) => {
  pId.value = record.id;
  pathStack.value = findParents(docTree.value, record.id);
  handleQuery();
};

const handleRename = (record) => {
  editFormRef.value.edit(record);
};

const handlePreview = (record) => {
  previewFormRef.value.preview(record);
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleDownload = async (record) => {
  try {
    const res = await DocumentDownload({ id: record.id });
    downloadfile(res);
  } catch(e) {
    message.error('下载失败');
  }
};

const handleDelete = async (record) => {
  try {
    const res = await DocumentDelete({ id: record.id });
    if (res.success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('删除失败：' + res.message);
    }
  } catch(e) {
    message.error('删除失败');
  }
};
</script>

<style scoped>
.leftTree {
  height: calc(100vh - 100px);
  overflow: auto;
}
.file-tool {
  display: flex;
  justify-content: space-between;
}
.btn-tool > .ant-btn {
  margin-right: 8px;
}
</style>
