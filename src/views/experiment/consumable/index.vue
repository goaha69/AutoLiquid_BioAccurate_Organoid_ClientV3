<template>
  <div>
    <!-- ====== 查询表单 ====== -->
    <a-card v-if="hasPerm('exp_consumable:page')">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="12">
              <a-form-item label="耗材编号">
                <a-input
                  v-model:value="queryParam.code"
                  placeholder="请输入耗材编号"
                  allow-clear
                />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="12">
              <a-form-item label="耗材名称">
                <a-input
                  v-model:value="queryParam.name"
                  placeholder="请输入耗材名称"
                  allow-clear
                />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              <a-button type="primary" @click="toggleTable">{{ consumableTitle }}</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- ====== 耗材信息表格 ====== -->
    <a-card :bordered="false">
      <a-table
        v-show="isConsumable"
        :dataSource="consumableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        :customRow="customRow"
        @change="onTableChange"
      >
        <!-- 表头插槽：新增按钮 -->
        <template #title>
          <a-button type="primary" @click="openAddForm">
            <PlusOutlined /> 新增耗材
          </a-button>
        </template>

        <!-- 单元格插槽 -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">
              {{ statusFilter(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a v-if="hasPerm('exp_consumable:edit')" @click="editConsumable(record)">编辑</a>
            <a-divider v-if="hasPerm('exp_consumable:delete')" type="vertical" />
            <a-popconfirm
              v-if="hasPerm('exp_consumable:delete')"
              title="确认删除？"
              @confirm="deleteConsumable(record)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <!-- ====== 剩余体积表格 ====== -->
      <a-table
        v-show="isRemainingVolume"
        :dataSource="remainingVolumeData"
        :columns="volumeColumns"
        :loading="loading"
        :pagination="pagination"
        :row-key="record => record.id"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'serial'">
            {{ index + 1 }}
          </template>

          <template v-else-if="column.key === 'remainingVolume'">
            <div class="volume-cell">
              <a-input-number
                v-model:value="record.remainingVolume"
                :step="100"
                :min="0"
                :max="record.maxVolume"
                style="width: 120px"
              />
              <!-- 液体刻度瓶 -->
              <VolumeBottle
                :current="record.remainingVolume"
                :max="record.maxVolume"
              />
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
            <a @click="saveRemainingVolume(record)">保存</a>
          </template>
        </template>
      </a-table>

      <!-- ====== 新增 / 编辑表单组件占位 ====== -->
      <AddForm ref="addFormRef" @ok="handleOk" />
      <EditForm ref="editFormRef" @ok="handleOk" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineComponent, h } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { exp_consumable_page, exp_consumable_delete } from '@/api/modular/experiment/consumableManage'
import { hasPerm } from '@/utils/permissions'

import AddForm from './addForm.vue'
import EditForm from './editForm.vue'

// 查询参数
const queryParam = reactive({
  code: '',
  name: ''
})

// 表格与分页状态
const loading = ref(false)
const consumableData = ref([])
const remainingVolumeData = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条, 共 ${total} 条`
})

// 视图切换
const isConsumable = ref(true)
const isRemainingVolume = ref(false)

const consumableTitle = computed(() => (isConsumable.value ? '切换体积界面' : '切换耗材界面'))

// 刻度配置
const scaleMarks = ref([
  { value: 0, position: 0 },
  { value: 250, position: 25 },
  { value: 500, position: 50 },
  { value: 750, position: 75 },
  { value: 1000, position: 100 }
])

// 表格列
const columns = reactive([
  { title: '序号', key: 'serial', align: 'center', width: 60 },
  { title: '编号', dataIndex: 'code', key: 'code', align: 'center', width: 100 },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'left', width: 120 },
  { title: '行数', dataIndex: 'rowCount', key: 'rowCount', align: 'center', width: 60 },
  { title: '列数', dataIndex: 'colCount', key: 'colCount', align: 'center', width: 60 },
  { title: '行距', dataIndex: 'rowSpace', key: 'rowSpace', align: 'center', width: 80 },
  { title: '列距', dataIndex: 'colSpace', key: 'colSpace', align: 'center', width: 80 },
  { title: 'X尺寸', dataIndex: 'xSize', key: 'xSize', align: 'center', width: 80 },
  { title: 'Y尺寸', dataIndex: 'ySize', key: 'ySize', align: 'center', width: 80 },
  { title: 'X偏移', dataIndex: 'xOffset', key: 'xOffset', align: 'center', width: 80 },
  { title: 'Y偏移', dataIndex: 'yOffset', key: 'yOffset', align: 'center', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center', width: 80 },
  { title: '操作', key: 'action', align: 'center', width: 160 }
])

const volumeColumns = reactive([
  { title: '序号', key: 'serial', align: 'center', width: 60 },
  { title: '耗材编号', dataIndex: 'code', key: 'code', align: 'center', width: 120 },
  { title: '耗材名称', dataIndex: 'name', key: 'name', align: 'center', width: 120 },
  { title: '最大体积(μl)', dataIndex: 'maxVolume', key: 'maxVolume', align: 'center', width: 120 },
  { title: '剩余体积(μl)', dataIndex: 'remainingVolume', key: 'remainingVolume', align: 'left', width: 280 },
  { title: '操作', key: 'action', align: 'center', width: 120 }
])

// 选中行高亮
const selectedRow = ref(null)

function customRow(record) {
  return {
    onClick: () => {
      selectedRow.value = record
    },
    style: {
      backgroundColor: selectedRow.value === record ? '#e6f7ff' : ''
    }
  }
}

// API 加载
function loadData() {
  loading.value = true
  const params = {
    ...queryParam,
    page: pagination.current,
    pageSize: pagination.pageSize
  }
  exp_consumable_page(params)
    .then((res) => {
      if (res && res.data) {
        consumableData.value = res.data.rows || []
        remainingVolumeData.value = consumableData.value.filter((i) => i.maxVolume > 0)
        pagination.total = res.data.totalRows || 0
      } else {
        consumableData.value = []
        remainingVolumeData.value = []
        pagination.total = 0
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function refreshTable() {
  pagination.current = 1
  loadData()
}

function onTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

function toggleTable() {
  isConsumable.value = !isConsumable.value
  isRemainingVolume.value = !isRemainingVolume.value
}

function resetQuery() {
  queryParam.code = ''
  queryParam.name = ''
  refreshTable()
}

// 新增/编辑引用
const addFormRef = ref(null)
const editFormRef = ref(null)

function openAddForm() {
  addFormRef.value && addFormRef.value.add({ id: 0 })
}

function editConsumable(record) {
  editFormRef.value && editFormRef.value.edit(record)
}

function deleteConsumable(record) {
  exp_consumable_delete({ id: record.id }).then((res) => {
    if (res.success) {
      message.success('删除成功')
      refreshTable()
    }
  })
}

function saveRemainingVolume(record) {
  message.warning('保存剩余体积功能待实现')
}

function handleOk() {
  refreshTable()
}

// 状态标签
function statusFilter(status) {
  return status === 0 ? '正常' : '停用'
}

// 体积瓶子组件
const VolumeBottle = defineComponent({
  name: 'VolumeBottle',
  props: {
    current: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  setup(props) {
    const height = computed(() => {
      if (!props.max) return '0%'
      return `${(props.current / props.max) * 100}%`
    })
    const marks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      value: Math.round(props.max * ratio),
      pos: ratio * 100
    }))
    return () =>
      h('div', { class: 'container' }, [
        h('div', { class: 'bottle-container' }, [
          h('div', { class: 'bottle-cap' }),
          h('div', { class: 'bottle-neck' }),
          h('div', { class: 'bottle' }, [
            h('div', { class: 'liquid', style: { height: height.value } }),
            h(
              'div',
              { class: 'scale' },
              marks.map((m) =>
                h('div', { class: 'scale-mark', style: { bottom: `${m.pos}%` } }, [
                  h('span', { class: 'scale-value' }, `${m.value}ml`)
                ])
              )
            )
          ])
        ])
      ])
  }
})

onMounted(loadData)
</script>

<style lang="less">
.volume-cell {
  display: flex;
  height: 45px;
  cursor: pointer;
}

// 进度条样式
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.bottle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
}

.bottle {
  position: relative;
  width: 20px;
  height: 50px;
  background-color: rgba(200, 200, 200, 0.3);
  border: 1px solid #999;
  border-radius: 0 0 5px 5px;
  overflow: hidden;
}

.bottle-neck {
  width: 8px;
  height: 6px;
  background-color: rgba(200, 200, 200, 0.3);
  border-left: 1px solid #999;
  border-right: 1px solid #999;
  margin-top: -1px;
}

.bottle-cap {
  width: 10px;
  height: 3px;
  background-color: #666;
  border-radius: 2px 2px 0 0;
  margin-top: -1px;
}

.liquid {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(19, 179, 207, 0.7);
  transition: height 0.5s ease-in-out;
}

.scale {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
}

.scale-mark {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.3);
}

.scale-value {
  position: absolute;
  left: -30px;
  font-size: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
</style>
