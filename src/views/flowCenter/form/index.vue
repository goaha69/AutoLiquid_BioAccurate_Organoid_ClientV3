<template>
  <a-row :gutter="24">
    <a-col :md="5" :sm="24" style="padding: 0 0 0 0;">
      <a-card :bordered="false" :loading="treeLoading" class="leftTree">
        <div v-if="orgTree.length > 0">
          <a-tree
            style="overflow: auto"
            :tree-data="orgTree"
            v-if="orgTree.length"
            @select="handleClick"
            :defaultExpandAll="true"
            :defaultExpandedKeys="defaultExpandedKeys"
            :field-names="replaceFields"
          />
        </div>
        <div v-else>
          <a-empty :image="simpleImage" />
        </div>
      </a-card>
    </a-col>
    <a-col :md="19" :sm="24">
      <x-card v-if="hasPerm('flcForm:page')">
        <template #content>
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="表单名称">
                    <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入表单名称" />
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                </a-col>
                <a-col :md="8" :sm="24">
                </a-col>
              </a-row>
            </a-form>
          </div>
        </template>
      </x-card>
      <a-card :bordered="false">
        <a-table
          ref="table"
          :columns="columns"
          :data-source="loadData"
          :row-key="(record) => record.id"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'operator' && hasPerm('flcForm:add')">
              <a-button @click="$refs.addForm.add()" type="primary" v-if="hasPerm('flcForm:add')">
                <template #icon><plus-outlined /></template>
                新增表单
              </a-button>
            </template>
          </template>
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'status'">
              <template v-if="hasPerm('flcForm:changeStatus')">
                <a-popconfirm
                  placement="top"
                  :title="text === 0 ? '确定停用该表单' : '确定启用该表单'"
                  @confirm="() => changeStatus(text, record)"
                >
                  <a>{{ statusFilter(text) }}</a>
                </a-popconfirm>
              </template>
              <template v-else>
                {{ statusFilter(text) }}
              </template>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <a :disabled="record.frmType == 1" v-if="hasPerm('flcForm:design')" @click="$refs.designForm.edit(record)">设计</a>
              <a-divider type="vertical" v-if="hasPerm('flcForm:design')" />
              <template v-if="hasPerm('flcForm:preview')">
                <a @click="$refs.previewForm.edit(record)">预览</a>
              </template>
              <a-divider type="vertical" v-if="hasPerm('flcForm:preview') && (hasPerm('flcForm:edit') || hasPerm('flcForm:delete'))" />
              <a-dropdown v-if="hasPerm('flcForm:edit') || hasPerm('flcForm:delete')">
                <a class="ant-dropdown-link">
                  更多 <down-outlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="hasPerm('flcForm:edit')">
                      <a @click="$refs.editForm.edit(record)">编辑</a>
                    </a-menu-item>
                    <a-menu-item v-if="hasPerm('flcForm:delete')">
                      <a-popconfirm placement="topRight" title="确认删除" @confirm="() => flcFormDelete(record)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
        </a-table>
        <add-form ref="addForm" @ok="handleOk" />
        <edit-form ref="editForm" @ok="handleOk" />
        <design-form ref="designForm" @ok="handleOk" />
        <preview-form ref="previewForm" @ok="handleOk" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { STable, XCard } from '@/components'
import { Empty } from 'ant-design-vue'
import { getOrgTree } from '@/api/modular/system/orgManage'
import { getFormPage, flcFormDelete, flcFormEdit } from '@/api/modular/flowCenter/formManage'
import addForm from './addForm'
import editForm from './editForm'
import designForm from './designForm'
import previewForm from './previewForm'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { message } from 'ant-design-vue'
import { DownOutlined, PlusOutlined } from '@ant-design/icons-vue'

defineOptions({
  name: 'flc_form_mgr'
})

const props = defineProps(['data'])
const { proxy } = getCurrentInstance()

const queryParam = reactive({})
const orgTree = ref([])
const selectedRowKeys = ref([])
const selectedRows = ref([])
const defaultExpandedKeys = ref([])
const statusDictTypeDropDown = ref([])
const expandedKeys = ref([])
const searchValue = ref('')
const autoExpandParent = ref(true)
const treeLoading = ref(true)
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const replaceFields = reactive({
  key: 'id'
})

const columns = ref([
  {
    title: '表单名称',
    dataIndex: 'name'
  },
  {
    title: '排序',
    dataIndex: 'sort'
  },
  {
    title: '状态',
    dataIndex: 'status'
  },
  {
    title: '备注',
    dataIndex: 'remark'
  }
])

const loadData = (parameter) => {
  return getFormPage(Object.assign(parameter, queryParam)).then((res) => {
    return res.data
  })
}

const getOrgTreeFn = () => {
  getOrgTree(Object.assign(queryParam)).then(res => {
    treeLoading.value = false
    if (!res.success) {
      return
    }
    orgTree.value = res.data
    queryParam.parentId = orgTree.value[0].id
    
    // 全部展开
    for (var item of res.data) {
      if (item.parentId == 0) {
        defaultExpandedKeys.value.push(item.id)
      }
    }
    proxy.$refs.table.refresh()
  })
}

const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
}

const sysDictTypeDropDownFn = () => {
  sysDictTypeDropDown({
    code: 'common_status'
  }).then((res) => {
    statusDictTypeDropDown.value = res.data
  })
}

const changeStatus = (code, record) => {
  let status = 0
  if (code == 0) {
    status = 1
  } else if (code == 1) {
    status = 0
  }
  
  flcFormEdit({
    id: record.id,
    status: status
  }).then(res => {
    if (res.success) {
      message.success('操作成功')
      proxy.$refs.table.refresh()
    } else {
      message.error('操作失败::' + res.message)
    }
  })
}

const flcFormDeleteFn = (record) => {
  flcFormDelete(record).then((res) => {
    if (res.success) {
      message.success('删除成功')
      proxy.$refs.table.refresh()
    } else {
      message.error('删除失败::' + res.message)
    }
  }).catch((err) => {
    message.error('删除错误::' + err.message)
  })
}

const handleClick = (e) => {
  queryParam.orgId = e.toString()
  proxy.$refs.table.refresh(true)
}

const handleOk = () => {
  getOrgTreeFn()
  proxy.$refs.table.refresh()
}

const onSelectChange = (selectedRowKeysVal, selectedRowsVal) => {
  selectedRowKeys.value = selectedRowKeysVal
  selectedRows.value = selectedRowsVal
}

onMounted(() => {
  getOrgTreeFn()
  sysDictTypeDropDownFn()
  
  if (hasPerm('flcForm:design') || hasPerm('flcForm:preview') || hasPerm('flcForm:edit') || hasPerm('flcForm:delete')) {
    columns.value.push({
      title: '操作',
      width: '160px',
      dataIndex: 'action'
    })
  }
})
</script>

<style lang="less">
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>
