<template>
  <div>
    <a-alert message="该功能只适配了SqlServer、MySQL数据库，其他数据库请自行研究" banner closable type="info" show-icon />
    <a-row :gutter="24">
      <a-col :md="9" :sm="24" style="padding: 0 0 0 0;">
        <a-card :bordered="false">
          <template #title>
            <a-button type="primary" @click="handleAddTable" v-if="hasPerm('table:add')">
              <template #icon><plus-outlined /></template>
              新增数据源
            </a-button>
          </template>
          <a-table
            ref="tableRef"
            :columns="tableColumns"
            :data-source="tableDataSource"
            :loading="tableLoading"
            :row-key="record => record.name"
            :show-pagination="false"
            :custom-row="customRow"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'action'">
                <a v-if="hasPerm('table:edit')" @click.stop="handleEditTable(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('table:delete')" />
                <a-popconfirm v-if="hasPerm('table:delete')" placement="topRight" title="确认删除？" @confirm="() => handleDeleteTable(record)">
                  <a>删除</a>
                </a-popconfirm>
                <a-divider type="vertical" v-if="hasPerm('table:createEntity')" />
                <a v-if="hasPerm('table:createEntity')" @click.stop="showCreateEntityModal(record.name)">生成实体</a>
              </template>
            </template>
          </a-table>
          <add-table-form ref="addTableFormRef" @ok="refreshTable" />
          <edit-table-form ref="editTableFormRef" @ok="refreshTable" />
        </a-card>
      </a-col>
      <a-col :md="15" :sm="24">
        <a-card :bordered="false">
           <template #title>
              <a-button type="primary" @click="handleAddColumn" v-if="hasPerm('column:add') && selectedTableName">
                <template #icon><plus-outlined /></template>
                新增列 ({{ selectedTableName }})
              </a-button>
           </template>
          <a-table
            ref="columnTableRef"
            :columns="columnColumns"
            :data-source="columnDataSource"
            :loading="columnLoading"
            :row-key="record => record.dbColumnName"
            :show-pagination="false"
          >
            <template #bodyCell="{ column, record }">
               <template v-if="column.dataIndex === 'isPrimarykey'">
                <span>{{ record.isPrimarykey ? '是' : '否' }}</span>
              </template>
              <template v-if="column.dataIndex === 'isIdentity'">
                <span>{{ record.isIdentity ? '是' : '否' }}</span>
              </template>
              <template v-if="column.dataIndex === 'isNullable'">
                <span>{{ record.isNullable ? '是' : '否' }}</span>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <a v-if="hasPerm('column:edit')" @click="handleEditColumn(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('column:delete')" />
                <a-popconfirm v-if="hasPerm('column:delete')" placement="topRight" title="确认删除？" @confirm="() => handleDeleteColumn(record)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
          <add-column-form ref="addColumnFormRef" @ok="refreshColumnTable" />
          <edit-column-form ref="editColumnFormRef" @ok="refreshColumnTable" />
        </a-card>
      </a-col>
    </a-row>

    <a-modal :open="createEntityVisible" title="配置实体" ok-text="确认" cancel-text="取消" @cancel="modalCancel" @ok="handleCreateEntity">
      <a-form ref="createEntityFormRef" :model="createEntityFormState" :rules="createEntityRules">
        <span style="color: red;">会覆盖同一路径下的同名文件，慎重。生成完需要重新编译!</span>
        <br />
        <span style="color: red;">基类不知道什么意思的去看项目里面这四个类型</span>
        <a-form-item name="tableName" v-show="false">
            <a-input v-model:value="createEntityFormState.tableName" />
        </a-form-item>
        <a-form-item label="实体名称" name="entityName">
          <a-input v-model:value="createEntityFormState.entityName" placeholder="请输入实体名称" />
        </a-form-item>
        <a-form-item label="基类" name="baseClassName">
          <a-select v-model:value="createEntityFormState.baseClassName" placeholder="请选择">
            <a-select-option v-for="item in baseClassOptions" :key="item.value" :value="item.value">{{ item.key }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="存放位置" name="position">
          <a-select v-model:value="createEntityFormState.position" placeholder="请选择">
            <a-select-option v-for="item in positionOption" :key="item" :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { getTableInfoList, getColumnInfoList, tableDelete, columnDelete, createEntity } from '@/api/modular/gen/databaseManage'
import { PlusOutlined } from '@ant-design/icons-vue'
import { hasPerm } from '@/utils/permission/index.js'
import addTableForm from './addTableForm.vue'
import editTableForm from './editTableForm.vue'
import addColumnForm from './addColumnForm.vue'
import editColumnForm from './editColumnForm.vue'

// Refs for tables and forms
const tableRef = ref()
const columnTableRef = ref()
const addTableFormRef = ref()
const editTableFormRef = ref()
const addColumnFormRef = ref()
const editColumnFormRef = ref()
const createEntityFormRef = ref()

// Table states
const tableDataSource = ref([])
const tableLoading = ref(false)
const columnDataSource = ref([])
const columnLoading = ref(false)
const selectedTableName = ref(null)

const tableColumns = ref([
  { title: '表名', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description' }
])

const columnColumns = ref([
  { title: '字段', dataIndex: 'dbColumnName' },
  { title: '描述', dataIndex: 'columnDescription' },
  { title: '主键', dataIndex: 'isPrimarykey' },
  { title: '自增', dataIndex: 'isIdentity' },
  { title: '可空', dataIndex: 'isNullable' },
  { title: '类型', dataIndex: 'dataType' }
])

// Create Entity Modal
const createEntityVisible = ref(false)
const createEntityFormState = reactive({
    tableName: '',
    entityName: '',
    baseClassName: undefined,
    position: undefined
})
const createEntityRules = {
  entityName: [{ required: true, message: '请输入实体名称' }],
  position: [{ required: true, message: '请选择存放位置' }]
}
const baseClassOptions = [
    { key: 'PrimaryKeyEntity (带雪花Id主键)', value: 'PrimaryKeyEntity' },
    { key: 'AutoIncrementEntity (带自增Id主键)', value: 'AutoIncrementEntity' },
    { key: 'DEntityBase (带雪花Id主键与基础字段)', value: 'DEntityBase' },
    { key: 'DBEntityTenant (带雪花Id、租户id与基础字段)', value: 'DBEntityTenant' }
]
const positionOption = ['SuperH2.Entity', 'SuperH2.Core']


onMounted(() => {
  fetchTableData()
  if (hasPerm('table:edit') || hasPerm('table:delete') || hasPerm('table:createEntity')) {
    tableColumns.value.push({ title: '操作', dataIndex: 'action', width: '200px' })
  }
  if (hasPerm('column:edit') || hasPerm('column:delete')) {
    columnColumns.value.push({ title: '操作', dataIndex: 'action', width: '200px' })
  }
})

watch(selectedTableName, (newTableName) => {
  if (newTableName) {
    fetchColumnData(newTableName)
  } else {
    columnDataSource.value = []
  }
})

const fetchTableData = async () => {
  tableLoading.value = true
  try {
    const res = await getTableInfoList()
    tableDataSource.value = res.data
  } finally {
    tableLoading.value = false
  }
}

const fetchColumnData = async (tableName) => {
  columnLoading.value = true
  try {
    const res = await getColumnInfoList({ tableName })
    columnDataSource.value = res.data
  } finally {
    columnLoading.value = false
  }
}

const customRow = (record) => {
  return {
    onClick: () => {
      selectedTableName.value = record.name
    }
  }
}

// Table Handlers
const handleAddTable = () => addTableFormRef.value.add()
const handleEditTable = (record) => editTableFormRef.value.edit(record)
const handleDeleteTable = async (record) => {
  await tableDelete({ tableName: record.name })
  message.success('删除成功')
  fetchTableData()
  if (selectedTableName.value === record.name) {
      selectedTableName.value = null
  }
}
const refreshTable = () => fetchTableData()

// Column Handlers
const handleAddColumn = () => addColumnFormRef.value.add(selectedTableName.value)
const handleEditColumn = (record) => editColumnFormRef.value.edit(record)
const handleDeleteColumn = async (record) => {
  await columnDelete({ tableName: selectedTableName.value, columnName: record.dbColumnName })
  message.success('删除成功')
  fetchColumnData(selectedTableName.value)
}
const refreshColumnTable = () => fetchColumnData(selectedTableName.value)

// Create Entity Handlers
const showCreateEntityModal = (tableName) => {
  Object.assign(createEntityFormState, {
      tableName: tableName,
      entityName: tableName,
      baseClassName: undefined,
      position: undefined
  })
  createEntityVisible.value = true
}

const modalCancel = () => {
  createEntityVisible.value = false
  if(createEntityFormRef.value) {
      createEntityFormRef.value.resetFields()
  }
}

const handleCreateEntity = async () => {
  try {
    if(createEntityFormRef.value) {
      await createEntityFormRef.value.validate()
    }
    await createEntity(createEntityFormState)
    message.success('生成成功')
    modalCancel()
  } catch (e) {
      // The validation failure will be displayed on the form, no need for an extra message.
  }
}
</script>
