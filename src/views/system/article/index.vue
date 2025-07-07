<template>
  <div>
    <x-card v-if="hasPerm('sysArticle:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @finish="handleQuery">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="关键字">
                  <a-input v-model:value="queryParam.searchValue" allow-clear placeholder="请输入标题或内容" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="类型">
                  <a-select v-model:value="queryParam.type" placeholder="请选择类型" allow-clear>
                    <a-select-option v-for="item in typeDictTypeDropDown" :key="item.code" :value="item.code">
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
        </div>
      </template>
    </x-card>
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="handleAdd" v-if="hasPerm('sysArticle:add')">
          <template #icon><plus-outlined /></template>
          新增文章
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'type'">
            {{ typeFilter(text) }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleDetail(record)" v-if="hasPerm('sysArticle:detail')">查看</a>
            <a-divider type="vertical" v-if="hasPerm('sysArticle:detail') && hasPerm('sysArticle:edit')" />
            <a @click="handleEdit(record)" v-if="hasPerm('sysArticle:edit')">编辑</a>
            <a-divider type="vertical" v-if="hasPerm('sysArticle:edit') && hasPerm('sysArticle:delete')" />
            <a-popconfirm
              v-if="hasPerm('sysArticle:delete')"
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
      <detail-form ref="detailFormRef" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { XCard } from '@/components';
import { sysArticlePage, sysArticleDelete } from '@/api/modular/system/articleManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import AddForm from './addForm.vue';
import EditForm from './editForm.vue';
import DetailForm from './detailForm.vue';
import { message } from 'ant-design-vue';
import { hasPerm } from '@/utils/permission/index';
import { PlusOutlined } from '@ant-design/icons-vue';

const queryParam = ref({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const typeDictTypeDropDown = ref([]);
const addFormRef = ref();
const editFormRef = ref();
const detailFormRef = ref();

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '类型',
    dataIndex: 'type',
  },
];

if (hasPerm('sysArticle:edit') || hasPerm('sysArticle:delete')) {
  columns.push({
    title: '操作',
    width: '300px',
    dataIndex: 'action',
  });
}

const loadData = () => {
  loading.value = true;
  sysArticlePage({ ...queryParam.value, ...pagination })
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

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const handleAdd = () => {
  addFormRef.value.add();
};

const handleEdit = (record) => {
  editFormRef.value.edit(record);
};

const handleDetail = (record) => {
  detailFormRef.value.detail(record);
};

const handleOk = () => {
  loadData();
};

const handleDelete = (record) => {
  sysArticleDelete(record).then((res) => {
    if (res.success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败：' + res.message);
    }
  });
};

const loadDict = () => {
  sysDictTypeDropDown({ code: 'article_type' }).then((res) => {
    typeDictTypeDropDown.value = res.data;
  });
};

const typeFilter = (type) => {
  const values = typeDictTypeDropDown.value.filter((item) => item.code === type);
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
