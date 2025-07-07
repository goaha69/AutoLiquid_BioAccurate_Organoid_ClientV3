<template>
  <a-spin :spinning="spinning">
    <a-card>
      <a-form
        :model="queryParam"
        layout="inline"
        @finish="handleQuery"
      >
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="存储位置">
              <a-select v-model:value="queryParam.fileLocation" placeholder="请选择存储位置" allow-clear>
                <a-select-option v-for="item in fileLocationDictTypeDropDown" :key="item.code" :value="item.code">
                  {{ item.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="文件仓库">
              <a-input v-model:value="queryParam.fileBucket" placeholder="请输入文件仓库" allow-clear />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="文件名称">
                <a-input v-model:value="queryParam.fileOriginName" placeholder="请输入文件名称" allow-clear />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span
              class="table-page-search-submitButtons"
              :style="advanced && { float: 'right', overflow: 'hidden' } || {}"
            >
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
    </a-card>
    <a-card :bordered="false">
      <template #title>
        <a-upload
          :customRequest="customRequest"
          :multiple="true"
          :showUploadList="false"
          name="file"
          v-if="hasPerm('sysFileInfo:upload')"
        >
          <a-button type="primary">
            <UploadOutlined />
            上传文件
          </a-button>
        </a-upload>
        <a-progress v-if="isUpload" :percent="percent" style="width: 200px; margin-left: 10px;" />
      </template>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'fileOriginName'">
            <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'fileObjectName'">
            <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'fileLocation'">
            {{ fileLocationFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'fileSuffix'">
            <a-tag color="blue">{{ text }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a v-if="hasPerm('sysFileInfo:download')" @click="sysFileInfoDownloadHandler(record)">下载</a>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysFileInfo:download') && hasPerm('sysFileInfo:detail')"
            />
            <a v-if="hasPerm('sysFileInfo:detail')" @click="detailFormRef.detail(record)">详情</a>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysFileInfo:detail') && hasPerm('sysFileInfo:delete')"
            />
            <a-popconfirm
              v-if="hasPerm('sysFileInfo:delete')"
              placement="topRight"
              title="确认删除？"
              @confirm="() => sysFileInfoDeleteHandler(record)"
            >
              <a>删除</a>
            </a-popconfirm>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysFileInfo:preview') && isImage(record.fileSuffix) && hasPerm('sysFileInfo:delete')"
            />
            <a v-if="hasPerm('sysFileInfo:preview') && isImage(record.fileSuffix)" @click="previewFormRef.preview(record)">预览</a>
            <a-divider
              type="vertical"
              v-if="hasPerm('sysFileInfo:preview') && isMicrosoft(record.fileSuffix) && hasPerm('sysFileInfo:delete')"
            />
            <a v-if="hasPerm('sysFileInfo:preview') && isMicrosoft(record.fileSuffix)" @click="previewMicrosoft(record)">预览</a>
          </template>
        </template>
      </a-table>

      <detail-form ref="detailFormRef" @ok="handleOk" v-if="hasPerm('sysFileInfo:detail')" />
      <preview-form ref="previewFormRef" v-if="hasPerm('sysFileInfo:preview')" />
    </a-card>
  </a-spin>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Ellipsis } from '@/components';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { sysFileInfoPage, sysFileInfoDelete, sysFileInfoUpload, sysFileInfoDownload } from '@/api/modular/system/fileManage';
import detailForm from './detailForm.vue';
import previewForm from './previewForm.vue';
import { downloadfile } from '@/utils/util';
import { message } from 'ant-design-vue';
import { UploadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { hasPerm } from '@/utils/permission/index';

const spinning = ref(false);
const advanced = ref(false);
const queryParam = ref({});
const fileLocationDictTypeDropDown = ref([]);
const selectedRowKeys = ref([]);
const selectedRows = ref([]);
const isUpload = ref(false);
const percent = ref(0);
const detailFormRef = ref();
const previewFormRef = ref();

const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  {
    title: '存储位置',
    dataIndex: 'fileLocation',
  },
  {
    title: '文件仓库',
    dataIndex: 'fileBucket',
  },
  {
    title: '文件名称',
    dataIndex: 'fileOriginName',
  },
  {
    title: '文件后缀',
    dataIndex: 'fileSuffix',
  },
  {
    title: '文件大小',
    dataIndex: 'fileSizeInfo',
  },
  {
    title: '唯一标识id',
    dataIndex: 'fileObjectName',
  },
];

if (hasPerm('sysPos:edit') || hasPerm('sysPos:delete')) {
  columns.push({
    title: '操作',
    width: '200px',
    dataIndex: 'action',
  });
}

const loadData = () => {
  loading.value = true;
  const params = {
    ...queryParam.value,
    current: pagination.current,
    size: pagination.pageSize,
  };
  sysFileInfoPage(params)
    .then((res) => {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    })
    .finally(() => {
      loading.value = false;
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
  queryParam.value = {};
  handleQuery();
};

const toggleAdvanced = () => {
  advanced.value = !advanced.value;
};

const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleOk = () => {
  loadData();
};

const fileLocationFilter = (fileLocation) => {
  const values = fileLocationDictTypeDropDown.value.filter(item => item.code == fileLocation);
  if (values.length > 0) {
    return values[0].value;
  }
};

const previewMicrosoft = (record) => {
  window.open('https://view.officeapps.live.com/op/view.aspx?src=' + process.env.VUE_APP_API_BASE_URL + '/sysFileInfo/download?id=' + record.id);
};

const loadDict = () => {
  sysDictTypeDropDown({ code: 'file_storage_location' }).then((res) => {
    fileLocationDictTypeDropDown.value = res.data;
  });
};

const sysFileInfoDownloadHandler = (record) => {
  spinning.value = true;
  sysFileInfoDownload({ id: record.id })
    .then((res) => {
      downloadfile(res);
    })
    .catch(() => {
      message.error('下载错误：获取文件流错误');
    })
    .finally(() => {
      spinning.value = false;
    });
};

const sysFileInfoDeleteHandler = (record) => {
  spinning.value = true;
  sysFileInfoDelete(record)
    .then((res) => {
      if (res.success) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + res.message);
      }
    })
    .catch((err) => {
      message.error('删除错误：' + err.message);
    })
    .finally(() => {
      spinning.value = false;
    });
};

const setUploadProcess = (p) => {
  percent.value = p;
  if (percent.value === 100) {
    setTimeout(() => {
      isUpload.value = false;
      percent.value = 0;
    }, 1000);
  }
};

const customRequest = (data) => {
  isUpload.value = true;
  percent.value = 0;
  const formData = new FormData();
  formData.append('file', data.file);
  sysFileInfoUpload(formData, (p) => setUploadProcess(p)).then((res) => {
    if (res.success) {
      message.success('上传成功');
      loadData();
    } else {
      message.error('上传失败：' + res.message);
    }
  });
};

const isImage = (suffix) => {
  return ['png', 'jpeg', 'jpg', 'gif', 'tif', 'bmp'].includes(suffix);
};

const isMicrosoft = (suffix) => {
  return ['doc', 'docx', 'xls', 'xlsx'].includes(suffix);
};

onMounted(() => {
  loadDict();
  loadData();
});
</script>
