<template>
  <div>
    <a-card v-if="hasPerm('sysVisLog:page')" :bordered="false">
      <a-form layout="inline" :model="queryParam">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="日志名称">
              <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入日志名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="访问类型">
              <a-select v-model:value="queryParam.visType" allow-clear placeholder="请选择访问类型">
                <a-select-option v-for="(item, index) in visTypeDict" :key="index" :value="item.code">
                  {{ item.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="是否成功">
                <a-select v-model:value="queryParam.success" placeholder="请选择是否成功">
                  <a-select-option v-for="(item, index) in successDict" :key="index" :value="item.code">
                    {{ item.value }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="10" :sm="24">
              <a-form-item label="访问时间">
                <a-range-picker
                  v-model:value="queryParam.dates"
                  :show-time="{
                    hideDisabledOptions: true,
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }"
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <up-outlined v-if="advanced" />
                <down-outlined v-else />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <a-popconfirm
            v-if="hasPerm('sysVisLog:delete')"
            placement="top"
            title="确认清空所有日志？"
            @confirm="handleDelete"
          >
            <a-button>清空日志</a-button>
          </a-popconfirm>
          <a-button @click="handleExport" v-if="hasPerm('sysVisLog:export')">导出日志</a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="['name', 'visTime'].includes(column.dataIndex)">
            <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'visType'">{{ visTypeFilter(text) }}</template>
          <template v-if="column.dataIndex === 'success'">
            <a-tag :color="text === 'SUCCESS' ? 'success' : 'error'">{{ successFilter(text) }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleDetail(record)">查看详情</a>
          </template>
        </template>
      </a-table>
      <details-vislog ref="detailsVislogRef" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { sysVisLogPage, sysVisLogDelete, sysVisLogExport } from '@/api/modular/system/logManage';
import { sysEnumDataList } from '@/api/modular/system/enumManage';
import { message } from 'ant-design-vue';
import { Ellipsis } from '@/components';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import detailsVislog from './details.vue';
import moment from 'moment';
import { hasPerm } from '@/core/permission/permission';

const advanced = ref(false);
const queryParam = reactive({});
const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const visTypeDict = ref([]);
const successDict = ref([]);
const detailsVislogRef = ref();

const columns = [
  { title: '日志名称', dataIndex: 'name' },
  { title: '访问类型', dataIndex: 'visType' },
  { title: '是否成功', dataIndex: 'success' },
  { title: 'IP', dataIndex: 'ip' },
  { title: '浏览器', dataIndex: 'browser' },
  { title: '时间', dataIndex: 'visTime' },
  { title: '访问人', dataIndex: 'account' },
  { title: '详情', dataIndex: 'action', width: '150px' },
];

const visTypeFilter = (visType) => {
  const value = visTypeDict.value.find((item) => item.code === visType);
  return value ? value.value : visType;
};

const successFilter = (success) => {
  const value = successDict.value.find((item) => item.code === success);
  return value ? value.value : success;
};

const getEnumData = async () => {
  const [visTypeRes, successRes] = await Promise.all([
    sysEnumDataList({ enumName: 'LoginType' }),
    sysEnumDataList({ enumName: 'YesOrNot' }),
  ]);
  if (visTypeRes.success) visTypeDict.value = visTypeRes.data;
  if (successRes.success) successDict.value = successRes.data;
};

const switchingDate = () => {
  const params = { ...queryParam };
  if (params.dates) {
    params.searchBeginTime = moment(params.dates[0]).format('YYYY-MM-DD HH:mm:ss');
    params.searchEndTime = moment(params.dates[1]).format('YYYY-MM-DD HH:mm:ss');
    delete params.dates;
  }
  return params;
};

const fetchData = async () => {
  loading.value = true;
  const params = {
    ...switchingDate(),
    current: pagination.value.current,
    size: pagination.value.pageSize,
  };
  try {
    const res = await sysVisLogPage(params);
    dataSource.value = res.data.records;
    pagination.value.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getEnumData();
  fetchData();
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
  for (const key in queryParam) {
    delete queryParam[key];
  }
  handleQuery();
};

const toggleAdvanced = () => {
  advanced.value = !advanced.value;
};

const handleDelete = async () => {
  try {
    const res = await sysVisLogDelete();
    if (res.success) {
      message.success('清空成功');
      fetchData();
    } else {
      message.error('清空失败：' + res.message);
    }
  } catch (err) {
    message.error('清空错误：' + err.message);
  }
};

const handleExport = async () => {
  try {
    await sysVisLogExport(switchingDate());
  } catch (err) {
    message.error('导出错误：' + err.message);
  }
};

const handleDetail = (record) => {
  detailsVislogRef.value.details(record);
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
