<template>
  <div>
    <a-card v-if="hasPerm('sysExLog:page')" :bordered="false">
      <a-form layout="inline" :model="queryParam">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="类名">
              <a-input v-model:value="queryParam.className" allow-clear placeholder="请输入类名" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="方法名">
              <a-input v-model:value="queryParam.methodName" allow-clear placeholder="请输入方法名" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="异常信息">
                <a-input v-model:value="queryParam.exceptionMsg" allow-clear placeholder="请输入异常信息关键字" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作人">
                <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入操作人姓名" />
              </a-form-item>
            </a-col>
            <a-col :md="10" :sm="24">
              <a-form-item label="操作时间">
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
            v-if="hasPerm('sysExLog:delete')"
            placement="top"
            title="确认清空所有日志？"
            @confirm="handleDelete"
          >
            <a-button>清空日志</a-button>
          </a-popconfirm>
          <a-button @click="handleExport" v-if="hasPerm('sysExLog:export')">导出日志</a-button>
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
          <template v-if="['className', 'methodName', 'exceptionName', 'exceptionMsg', 'exceptionTime'].includes(column.dataIndex)">
            <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a @click="handleDetail(record)">查看详情</a>
          </template>
        </template>
      </a-table>
      <details-exlog ref="detailsExlogRef" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { sysExLogPage, sysExLogDelete, sysExLogExport } from '@/api/modular/system/logManage';
import { message } from 'ant-design-vue';
import { Ellipsis } from '@/components';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import detailsExlog from './details.vue';
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
const detailsExlogRef = ref();

const columns = [
  { title: '类名', dataIndex: 'className' },
  { title: '方法名', dataIndex: 'methodName' },
  { title: '异常名称', dataIndex: 'exceptionName' },
  { title: '异常信息', dataIndex: 'exceptionMsg' },
  { title: '异常时间', dataIndex: 'exceptionTime' },
  { title: '操作人', dataIndex: 'name' },
  { title: '详情', dataIndex: 'action', width: '150px' },
];

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
    const res = await sysExLogPage(params);
    dataSource.value = res.data.records;
    pagination.value.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

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
    const res = await sysExLogDelete();
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
    await sysExLogExport(switchingDate());
  } catch (err) {
    message.error('导出错误：' + err.message);
  }
};

const handleDetail = (record) => {
  detailsExlogRef.value.details(record);
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
