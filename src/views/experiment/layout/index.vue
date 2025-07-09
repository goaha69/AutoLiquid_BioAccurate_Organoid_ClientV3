<template>
  <div>
    <x-card v-if="hasPerm('exp_layout:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="24">
              <a-col :md="8" :sm="12">
                <a-form-item label="布局编号">
                  <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入布局编号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="12">
                <a-form-item label="布局名称">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入布局名称" />
                </a-form-item>
              </a-col>
                          <a-col :md="8" :sm="24">
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
              <a-button style="margin-left: 8px" @click="refreshTable">
                <ReloadOutlined />
                刷新
              </a-button>
            </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>
    
    <a-card :bordered="false">
      <a-row style="display: flex; height: calc(100vh - 200px);">
        <a-col :span="isCollapsed ? 0 : 5" style="display: flex; flex-direction: column;">
          <div class="table-operator" v-if="hasPerm('exp_layout:add')" style="margin-bottom: 16px;">
            <a-button @click="$refs.addFormRef.add()" type="primary">
              <PlusOutlined />
              新增布局
            </a-button>
            <a-button @click="forceRefresh()" style="margin-left: 8px">
              <ReloadOutlined />
              刷新
            </a-button>
          </div>
          
          <div style="flex: 1; overflow: hidden;">
            <a-table 
              ref="table" 
              :columns="columns" 
              :data-source="tableData" 
              :loading="tableLoading"
              :row-key="(record) => record.id" 
              :custom-row="customRow"
              :pagination="pagination"
              @change="handleTableChange"
              size="middle"
              :scroll="{ y: 'calc(100vh - 350px)' }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'serial'">
                  {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
                </template>
                <template v-else-if="column.key === 'status'">
                  {{ statusFilter(record.status) }}
                </template>
                <template v-else-if="column.key === 'action'">
                  <a v-if="hasPerm('exp_layout:edit')" @click="$refs.editFormRef.edit(record)">编辑</a>
                  <a-divider type="vertical" v-if="hasPerm('exp_layout:edit')" />
                  <a v-if="hasPerm('exp_layout:edit')" @click="showImportModal(record)">导入</a>
                  <a-divider type="vertical" v-if="hasPerm('exp_layout:edit')" />
                  <a-popconfirm 
                    v-if="hasPerm('exp_layout:delete')" 
                    placement="topRight" 
                    title="确认删除？" 
                    @confirm="() => handleDelete(record)"
                  >
                    <a>删除</a>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </div>
        </a-col>
        
        <div class="separator" @click="toggleCollapse" v-if="!isCollapsed">
          <span>◀</span>
        </div>
        
        <div class="separator-collapsed" @click="toggleCollapse" v-if="isCollapsed">
          <span>▶</span>
        </div>
        
        <a-col :span="isCollapsed ? 24 : 19" style="display: flex; flex-direction: column; padding-left: 10px;">
          <!-- 耗材库区域 -->
          <div style="flex-shrink: 0; padding: 10px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size:21px;color:black;">耗材库</span>
              <a-button type="text" style="margin-left:10px;border:0px;" @click="getConsumableData">
                <ReloadOutlined />
              </a-button>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <a-button 
                v-for="(item,index) in consumableData" 
                :key="index" 
                draggable="true" 
                @dragstart="(event) => onDragAdd(event, item)" 
                style="font-size:14px;min-width:100px;"
              >
                {{ item.name }}
              </a-button>
            </div>
          </div>

          <a-divider style="margin: 16px 0;" />
          
          <!-- 舱位布局图区域 -->
          <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <h2 style="margin: 0 0 10px 0;" v-show="currentLayout.name!=''">
              {{currentLayout.name}}--舱位布局图
            </h2>
            
            <a-spin :spinning="layoutLoading" style="flex: 1;">
              <div 
                :style="{
                  background:'#99CCFF',
                  position: 'relative',
                  overflow: 'auto', 
                  width:'100%',
                  height:'100%',
                  minHeight: '500px',
                  maxWidth: (currentLayout.name!='' ? currentLayout.xSize : 1800) + 'px',
                  maxHeight: (currentLayout.name!='' ? currentLayout.ySize : 800) + 'px'
                }"
                @drop="onDivDrop" 
                @dragover.prevent
              >
                <div 
                  v-for="(item,index) in shippingSpaces" 
                  :key="index" 
                  :style="{
                    background:'#ffffff',
                    position: 'absolute',
                    left: item.xOffset + 'px',
                    top: item.yOffset + 'px', 
                    width: item.xSize + 'px',
                    height: item.ySize + 'px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: item.consumableData?.length <= 2 ? 'center' : 'flex-start',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'background-color 0.3s',
                    overflowY: 'auto'
                  }" 
                  class="highLighSpace custom-scrollbar"
                >  
                  <span 
                    v-if="!item.consumableData || item.consumableData.length === 0" 
                    :style="{
                      position: 'absolute', 
                      maxWidth: item.xSize+'px', 
                      visibility: 'visible'
                    }" 
                    @dragover="(event) => mouseEnterEvent(event)"
                    @dragleave="(event) => mouseLeaveEvent(event)"
                  >
                    {{ item.name ? item.name : '舱位'+(index+1) }}
                  </span>

                  <a-tooltip 
                    v-for="(cc, cindex) in item.consumableData || []" 
                    :key="cindex"  
                    :title="cc.name"
                    placement="top"
                  >
                    <a-button 
                      :style="{
                        marginLeft: '5px',
                        maxWidth: (item.xSize-5) + 'px',
                        whiteSpace: 'normal',
                        textOverflow: 'ellipsis',                        
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height:'auto'
                      }" 
                      @dblclick="(event) => onDbClickConsumable(event, item, cc)" 
                      draggable="true" 
                      @dragstart="(event) => onDragDelete(event, item, cc)"
                    >
                      {{ cc.name }}
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </a-spin>
          </div>
        </a-col>
      </a-row>

      <add-form ref="addFormRef" @ok="handleOk" />
      <edit-form ref="editFormRef" @ok="handleUpdateCallback" />

      <a-modal 
        :title="importModalTitle" 
        :width="400" 
        :height="200" 
        v-model:open="importModalVisible" 
        :maskClosable="false" 
        @cancel="importModalVisible=false"
        @ok="importShippingSpaces"
      >
        <a-row :gutter="12">          
          <a-col :span="24">
            <a-form-item label="源盘面布局" :labelCol="{span:7}" :wrapperCol="{span:17}">
              <a-select 
                style="width: 100%" 
                placeholder="请选择源盘面布局" 
                v-model:value="importForm.sourceId"
              >
                <a-select-option 
                  v-for="(item, index) in layoutData" 
                  :key="index" 
                  :value="item.id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>   
        </a-row> 
      </a-modal>
      
      <a-modal 
        :title="editTagTitle" 
        :width="450" 
        :height="300" 
        v-model:open="editTagVisible" 
        :maskClosable="false" 
        @ok="onEditTagOk" 
        @cancel="editTagVisible=false"
      >
        <div>
          <span class="span-label">标签名字：</span>
          <a-input class="my-input-speed" placeholder="请输入标签名字" v-model:value="editTagValue" />
        </div>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { XCard } from '@/components'
import { usePermission } from '@/hooks/usePermission'
import {
  exp_layout_page,
  exp_layout_list,
  exp_layout_delete,
  exp_layout_getShippingSpaces,
  exp_layout_importShippingSpaces,
  exp_layout_addShippingSpace,
  exp_layout_updateShippingSpace,
  exp_layout_deleteConsumable
} from '@/api/modular/experiment/layoutManage'
import { exp_consumable_list } from '@/api/modular/experiment/consumableManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import addForm from './addForm.vue'
import editForm from './editForm.vue'

const { hasPerm } = usePermission()

// 响应式数据
const isCollapsed = ref(false)
const queryParam = reactive({})
const shippingSpaces = ref([])
const consumableData = ref([])
const draggedData = ref(null)
const dragConsumable = ref(null)
const editTagTitle = ref('')
const editTagValue = ref('')
const editTagVisible = ref(false)
const layoutLoading = ref(false)
const currentLayout = reactive({ name: '', xSize: 1800, ySize: 800 })
const dragAdd = ref(true)
const statusDictTypeDropDown = ref([])
const importModalVisible = ref(false)
const importModalTitle = ref('')
const importForm = reactive({
  currentId: null,
  sourceId: null
})
const layoutData = ref([])
const selectedRow = ref(null)

// 表格相关数据
const tableData = ref([])
const tableLoading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表格列配置
const columns = reactive([
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: '50px'
  },   
  {
    title: '布局编号',
    align: 'center',
    dataIndex: 'code'
  },
  {
    title: '布局名称',
    align: 'left',
    dataIndex: 'name'
  }
])

// 加载数据方法
const loadData = (page = 1, pageSize = 10) => {
  tableLoading.value = true
  
  const parameter = {
    current: page,
    size: pageSize,
    ...queryParam
  }
  
  exp_layout_page(parameter).then((res) => {
    if (res && res.success) {
      let dataList = []
      let total = 0
      
      // 处理不同的数据格式
      if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
        // 分页格式 (rows)
        dataList = res.data.rows
        total = res.data.totalRows || 0
        pagination.current = res.data.pageNo || page
        pagination.pageSize = res.data.pageSize || pageSize
      } else if (res.data && res.data.records && Array.isArray(res.data.records)) {
        // 分页格式 (records)
        dataList = res.data.records
        total = res.data.total || 0
        pagination.current = page
        pagination.pageSize = pageSize
      } else if (Array.isArray(res.data)) {
        // 直接数组格式
        dataList = res.data
        total = res.data.length
        pagination.current = page
        pagination.pageSize = pageSize
      } else {
        console.warn('未知的数据格式:', res.data)
        dataList = []
        total = 0
      }
      
      // 确保数据格式正确，为每个项目添加默认的consumableData
      tableData.value = dataList.map(item => ({
        ...item,
        consumableData: item.consumableData || []
      }))
      
      pagination.total = total
      
      console.log('成功加载', dataList.length, '条布局数据')
    } else {
      console.error('API调用失败:', res?.message)
      message.error('加载数据失败：' + (res?.message || '未知错误'))
      tableData.value = []
      pagination.total = 0
    }
  }).catch((err) => {
    console.error('API调用失败:', err)
    message.error('加载数据失败: ' + (err.response?.data?.message || err.message))
    tableData.value = []
    pagination.total = 0
  }).finally(() => {
    tableLoading.value = false
  })
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  loadData(pag.current, pag.pageSize)
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadData(1, pagination.pageSize)
}

// 重置处理
const handleReset = () => {
  Object.keys(queryParam).forEach(key => {
    delete queryParam[key]
  })
  pagination.current = 1
  loadData(1, pagination.pageSize)
}

// 状态过滤器
const statusFilter = (status) => {
  const values = statusDictTypeDropDown.value.filter(item => item.code == status)
  if (values.length > 0) {
    return values[0].value
  }
  return status === 0 ? '正常' : '停用'
}

// 方法定义
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const customRow = (record) => {
  return {
    onClick: () => {
      selectedRow.value = record
      loadCanvas(record)
    },
    style: {
      backgroundColor: selectedRow.value === record ? '#e6f7ff' : ''
    }
  }
}

const getConsumableData = () => {
  exp_consumable_list({}).then((res) => {
    consumableData.value = res.data
  })
}

const showImportModal = (record) => {
  importModalTitle.value = "选择源盘面布局导入到 [" + record.name + "]"
  importModalVisible.value = true
  importForm.currentId = record.id
  
  exp_layout_list({}).then((res) => {
    if (res.success) {
      layoutData.value = res.data
    } 
  })
}

const importShippingSpaces = () => {
  if (!importForm.sourceId) {
    message.error('请选择源盘面布局')
    return
  }
  
  exp_layout_importShippingSpaces(importForm).then((res) => {
    if (res.success) {
      message.success('导入成功')
      loadShippingSpaces(importForm.currentId)
      importModalVisible.value = false
    } else {
      message.error('导入失败')
    }
  }).catch(() => {
    importModalVisible.value = false
  })
}

const loadShippingSpaces = (layoutId) => {
  const dd = { id: layoutId }
  console.log('==============exp_layoutGetShippingSpaces===============')
  layoutLoading.value = true
  
  exp_layout_getShippingSpaces(dd).then((res) => {
    layoutLoading.value = false
    if (res.success) {
      shippingSpaces.value = res.data
      shippingSpaces.value.forEach((rect) => {
        const ids = rect.consumableIds ? rect.consumableIds.split(',') : []
        const names = rect.consumableTags ? rect.consumableTags.split(',') : []
        rect.consumableData = []
        
        for (let i = 0; i < ids.length; i++) {
          if (ids[i] !== '') {
            let sourceName = names[i] || ''
            const source = consumableData.value.filter(c => c.id == ids[i])
            if (source && source.length > 0) {
              sourceName = source[0].name
            }
            rect.consumableData.push({
              id: ids[i],
              name: names[i] || sourceName,
              sourceName: sourceName
            })
          }
        }
      })           
    }
  }).catch(() => {
    layoutLoading.value = false
  })
}

const onDragAdd = (event, item) => {
  dragAdd.value = true
  draggedData.value = item
  event.dataTransfer.setData('application/json', JSON.stringify(item))
}

const onDragDelete = (event, item, cc) => {
  dragAdd.value = false
  draggedData.value = item
  dragConsumable.value = cc
  event.dataTransfer.setData('application/json', JSON.stringify(item))
}

const mouseEnterEvent = (event) => {
  event.target.style.visibility = 'hidden'
}

const mouseLeaveEvent = (event) => {
  setTimeout(() => {
    event.target.style.visibility = 'visible'
  }, 1500)
}

const onDivDrop = (event) => {
  let parentRect = event.target.parentElement.getBoundingClientRect()
  if (event.target.nodeName === 'BUTTON') {
    parentRect = event.target.parentElement.parentElement.getBoundingClientRect()
  }

  if (dragAdd.value === true) {
    // 从耗材库拖拽到布局的某个舱位
    const x = event.clientX - parentRect.left
    const y = event.clientY - parentRect.top

    shippingSpaces.value.forEach((space) => {
      if (x >= space.xOffset && x <= space.xOffset + space.xSize &&
          y >= space.yOffset && y <= space.yOffset + space.ySize) {
        
        const data = {
          parentId: space.id,
          consumableId: draggedData.value.id,
          tag: draggedData.value.name
        }
        
        exp_layout_addShippingSpace(data).then((res) => {
          if (res.success) {
            loadShippingSpaces(currentLayout.id)
          } else {
            message.error(res.message)
          }
        }).catch((err) => {
          message.error('出错：' + err.message)
        })
        
        draggedData.value = null
      }
    })
  } else {
    // 从舱位拖拽某个耗材出去，即删除
    const space = draggedData.value
    const x = event.clientX - parentRect.left
    const y = event.clientY - parentRect.top
    
    if (x < space.xOffset || x > space.xOffset + space.xSize ||
        y < space.yOffset || y > space.yOffset + space.ySize) {
      
      const data = {
        parentId: space.id,
        consumableId: dragConsumable.value.id,
        tag: dragConsumable.value.name
      }
      
      exp_layout_deleteConsumable(data).then((res) => {
        if (res.success) {
          loadShippingSpaces(currentLayout.id)
        } else {
          message.error(res.message)
        }
      }).catch((err) => {
        message.error('出错：' + err.message)
      })
      
      draggedData.value = null
      dragConsumable.value = null
    }
  }
}

const onDbClickConsumable = (event, item, cc) => {
  console.log('双击了耗材：', cc.name)
  console.log('双击的舱位：', item.id)
  editTagVisible.value = true
  editTagTitle.value = '编辑标签 -- ' + cc.name + ' -- ' + cc.sourceName
  editTagValue.value = cc.name
  dragConsumable.value = cc
  draggedData.value = item
}

const onEditTagOk = () => {
  if (!editTagValue.value) {
    message.error('请输入标签')
    return
  }
  
  const data = {
    parentId: draggedData.value.id,
    consumableId: dragConsumable.value.id,
    tag: editTagValue.value
  }
  
  exp_layout_updateShippingSpace(data).then((res) => {
    if (res.success) {
      loadShippingSpaces(currentLayout.id)
      editTagVisible.value = false
    } else {
      message.error(res.message)
    }
  }).catch((err) => {
    message.error('出错：' + err.message)
  })
  
  dragConsumable.value = null
  draggedData.value = null
}

const loadCanvas = (record) => {
  console.log(record)
  Object.assign(currentLayout, record)
  loadShippingSpaces(record.id)                
}

const sysDictTypeDropDownFunc = () => {
  sysDictTypeDropDown({
    code: 'common_status'
  }).then((res) => {
    statusDictTypeDropDown.value = res.data
  })
}

const handleDelete = (record) => {
  exp_layout_delete(record).then((res) => {
    if (res.success) {
      message.success('删除成功')
      loadData(pagination.current, pagination.pageSize)
    } else {
      message.error('删除失败：' + res.message)
    }
  }).catch((err) => {
    message.error('删除错误：' + err.message)
  })
}

const handleOk = () => {
  loadData(pagination.current, pagination.pageSize)
}

const handleUpdateCallback = (layoutId) => {
  loadData(pagination.current, pagination.pageSize)
  if (layoutId) {
    loadShippingSpaces(layoutId)
  }
}

// 添加操作列
if (hasPerm('exp_layout:edit') || hasPerm('exp_layout:delete')) {
  columns.push({
    title: '操作',
    width: '150px',
    dataIndex: 'action',
    key: 'action'
  })
}

// refs
const table = ref()
const addFormRef = ref()
const editFormRef = ref()

// 刷新表格
const forceRefresh = () => {
  loadData(pagination.current, pagination.pageSize)
}



// 生命周期
onMounted(() => {
  if (hasPerm('exp_layout:page')) {
    sysDictTypeDropDownFunc()
    getConsumableData()
    loadData(1, 10)
  } else {
    message.error('您没有访问布局管理页面的权限')
  }
})
</script>

<style scoped>
.table-operator {
  margin-bottom: 18px;
}

button {
  margin-right: 8px;
}

.my-input-speed {
  width: 180px;
}

.span-label {
  width: 130px;
  padding-left: 10px;
  padding-right: 10px;
  text-align: right;
  display: inline-block;
}

.highLighSpace {
  transition: background-color 0.3s;
}

.highLighSpace:hover {
  background-color: #e0f7fa !important;
}

.separator {
  width: 4px;
  background-color: #5685dd;
  height: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.separator:hover {
  background-color: #588000;
}

.separator-collapsed {
  position: fixed;
  left: 0;
  top: 50%;
  width: 20px;
  height: 60px;
  background-color: #5685dd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0 10px 10px 0;
  transition: background-color 0.3s;
}

.separator-collapsed:hover {
  background-color: #588000;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;
  padding-left: 5px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

