<template>
  <div>
    <a-card v-if="hasPerm('exp_layout:page')">
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
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <a-card :bordered="false">
      <a-row style="display: flex;">
        <a-col :span="isCollapsed ? 0 : 6">
          <a-table
            :dataSource="layoutData"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            :row-key="record => record.id"
            :customRow="customRow"
            @change="onTableChange"
          >
            <template #title>
              <a-button
                v-if="hasPerm('exp_layout:add')"
                type="primary"
                @click="addLayout"
              >
                <PlusOutlined />
                新增布局
              </a-button>
            </template>
            
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'serial'">
                {{ index + 1 }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status == 0 ? 'green' : 'red'">
                  {{ statusFilter(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a v-if="hasPerm('exp_layout:edit')" @click="editLayout(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('exp_layout:edit')" />
                <a v-if="hasPerm('exp_layout:edit')" @click="showImportModal(record)">导入</a>
                <a-divider type="vertical" v-if="hasPerm('exp_layout:edit')" />
                <a-popconfirm 
                  v-if="hasPerm('exp_layout:delete')" 
                  placement="topRight" 
                  title="确认删除？" 
                  @confirm="() => deleteLayout(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </a-col>
        
        <div class="separator" @click="toggleCollapse">
          <span v-if="isCollapsed">▶</span>
          <span v-else>◀</span>
        </div>
        
        <a-col :span="isCollapsed ? 24 : 18">
          <div style="width:100%;">
            <span style="margin-left:10px; font-size:21px;color:black;">耗材库</span>
            <a-button type="text" @click="getConsumableData" style="margin-left:10px;border:0px;">
              <ReloadOutlined />
            </a-button>
          </div>          
          
          <div style="margin-left:10px;margin-top:10px;">
            <a-button 
              v-for="(item,index) in consumableData" 
              :key="index" 
              draggable="true" 
              @dragstart="(event) => onDragAdd(event, item)" 
              style="font-size:14px;min-width:100px;margin-top:10px;margin-right:8px;"
            >
              {{ item.name }}
            </a-button>
          </div>

          <a-divider type="horizontal" />
          
          <h2 style="margin-left:10px;" v-show="currentLayout.name!=''">
            {{currentLayout.name}}--舱位布局图
          </h2>
          
          <a-spin :spinning="layoutLoading">
            <div 
              :style="{
                background:'#99CCFF',
                position: 'relative',
                margin:'0 10 0 0',
                overflow: 'scroll', 
                width:'100%',
                height:'800px',
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
                  justifyContent: item.consumableData.length <= 2 ? 'center' : 'flex-start',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'background-color 0.3s',
                  overflowY: 'auto'
                }" 
                class="highLighSpace custom-scrollbar"
              >  
                <span 
                  v-if="item.consumableData.length === 0" 
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
                  v-for="(cc, cindex) in item.consumableData" 
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
        </a-col>
      </a-row>

      <!-- 新增/编辑表单模态框 -->
      <a-modal
        v-model:open="addFormVisible"
        title="布局管理"
        :width="800"
        :mask-closable="false"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <div>表单内容待实现</div>
      </a-modal>

      <!-- 导入模态框 -->
      <a-modal 
        v-model:open="importModalVisible"
        :title="importModalTitle" 
        :width="400" 
        :mask-closable="false"
        @ok="importShippingSpaces"
        @cancel="importModalVisible=false"
      >
        <a-form :model="importForm">
          <a-form-item v-show="false">
            <a-input v-model:value="importForm.currentId" />
          </a-form-item>

          <a-row :gutter="12">          
            <a-col :span="24">
              <a-form-item label="源布局" :label-col="{span:7}" :wrapper-col="{span:17}">
                <a-select 
                  v-model:value="importForm.sourceId"
                  style="width: 100%" 
                  placeholder="请选择源布局"
                >
                  <a-select-option 
                    v-for="(item, index) in layoutDataList" 
                    :key="index" 
                    :value="item.id"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>   
          </a-row> 
        </a-form>
      </a-modal>

      <!-- 编辑标签模态框 -->
      <a-modal 
        v-model:open="editTagVisible"
        :title="editTagTitle" 
        :width="450" 
        :mask-closable="false" 
        @ok="onEditTagOk" 
        @cancel="editTagVisible=false"
      >
        <div>
          <span class="span-label">标签名：</span>
          <a-input 
            v-model:value="editTagValue"
            class="my-input-speed" 
            placeholder="请输入标签" 
          />
        </div>
      </a-modal>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { hasPerm } from '@/utils/permissions'
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

export default defineComponent({
  name: 'LayoutManage',
  components: {
    PlusOutlined,
    ReloadOutlined
  },
  setup() {
    // 响应式数据
    const queryParam = reactive({
      code: '',
      name: ''
    })

    const loading = ref(false)
    const addFormVisible = ref(false)
    const importModalVisible = ref(false)
    const editTagVisible = ref(false)
    const layoutLoading = ref(false)
    const isCollapsed = ref(false)
    const selectedRow = ref(null)
    
    const layoutData = ref([])
    const layoutDataList = ref([])
    const shippingSpaces = ref([])
    const consumableData = ref([])
    const statusDictTypeDropDown = ref([])
    
    const importModalTitle = ref('')
    const editTagTitle = ref('')
    const editTagValue = ref('')
    
    const draggedData = ref(null)
    const dragConsumable = ref(null)
    const dragAdd = ref(true)
    
    const currentLayout = reactive({
      name: '',
      xSize: 1800,
      ySize: 800
    })

    const importForm = reactive({
      currentId: null,
      sourceId: null
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条,共 ${total} 条`
    })

    // 表格列配置
    const columns = reactive([
      {
        title: '序号',
        key: 'serial',
        align: 'center',
        width: 60
      },   
      {
        title: '布局编号',
        align: 'center',
        dataIndex: 'code',
        width: 120
      },
      {
        title: '布局名称',
        align: 'left',
        dataIndex: 'name',
        width: 150
      }
    ])

    // 状态过滤器
    const statusFilter = (status) => {
      const values = statusDictTypeDropDown.value.filter(item => item.code == status)
      if (values.length > 0) {
        return values[0].value
      }
      return status === 0 ? '正常' : '停用'
    }

    // 加载数据
    const loadData = () => {
      loading.value = true
      const params = {
        ...queryParam,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      exp_layout_page(params).then(res => {
        if (res && res.data) {
          layoutData.value = res.data.rows || []
          pagination.total = res.data.totalRows || 0
        } else {
          layoutData.value = []
          pagination.total = 0
        }
        loading.value = false
      }).catch(() => {
        loading.value = false
      })
    }

    const refreshTable = () => {
      pagination.current = 1
      loadData()
    }

    const onTableChange = (pag) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      loadData()
    }

    // 获取耗材数据
    const getConsumableData = () => {
      exp_consumable_list({}).then((res) => {
        consumableData.value = res.data || []
      })
    }

    // 获取字典数据
    const getSysDictTypeDropDown = () => {
      sysDictTypeDropDown({
        code: 'common_status'
      }).then((res) => {
        statusDictTypeDropDown.value = res.data || []
      })
    }

    // 自定义行
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

    // 切换折叠状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    // 显示导入模态框
    const showImportModal = (record) => {
      importModalTitle.value = "选择源布局数据导入到 [" + record.name + "]"
      importModalVisible.value = true
      importForm.currentId = record.id
      
      exp_layout_list({}).then((res) => {
        if (res.success) {
          layoutDataList.value = res.data || []
        } 
      })
    }

    // 导入布局空间
    const importShippingSpaces = () => {
      if (!importForm.sourceId) {
        message.error('请选择源布局')
        return
      }
      
      exp_layout_importShippingSpaces(importForm).then((res) => {
        if (res.success) {
          message.success('导入成功')
          loadShippingSpaces(importForm.currentId)
          importModalVisible.value = false
        } else {
          message.error('导入失败: ' + res.message)
        }
      }).catch((err) => {
        message.error('导入失败: ' + err.message)
      })
    }

    // 加载布局空间
    const loadShippingSpaces = (layoutId) => {
      const params = { id: layoutId }
      layoutLoading.value = true
      
      exp_layout_getShippingSpaces(params).then((res) => {
        if (res.success) {
          shippingSpaces.value = res.data || []
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
        layoutLoading.value = false
      }).catch(() => {
        layoutLoading.value = false
      })
    }

    // 拖拽相关方法
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

    const onDivDrop = (event) => {
      const parentRect = event.target.getBoundingClientRect()
      
      if (dragAdd.value === true) {
        // 添加耗材到布局空间
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
              message.error('添加失败: ' + err.message)
            })
            
            draggedData.value = null
          }
        })
      } else {
        // 删除耗材
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
            message.error('删除失败: ' + err.message)
          })
          
          draggedData.value = null
          dragConsumable.value = null
        }
      }
    }

    // 双击耗材编辑标签
    const onDbClickConsumable = (event, item, cc) => {
      editTagVisible.value = true
      editTagTitle.value = '编辑标签 -- ' + cc.name + ' -- ' + cc.sourceName
      editTagValue.value = cc.name
      dragConsumable.value = cc
      draggedData.value = item
    }

    // 确认编辑标签
    const onEditTagOk = () => {
      if (!editTagValue.value) {
        message.error('请输入标签名')
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
        message.error('更新失败: ' + err.message)
      })
      
      dragConsumable.value = null
      draggedData.value = null
    }

    const mouseEnterEvent = (event) => {
      event.target.style.visibility = 'hidden'
    }

    const mouseLeaveEvent = (event) => {
      setTimeout(() => {
        event.target.style.visibility = 'visible'
      }, 1500)
    }

    // 加载画布
    const loadCanvas = (record) => {
      Object.assign(currentLayout, record)
      loadShippingSpaces(record.id)
    }

    // 操作方法
    const addLayout = () => {
      addFormVisible.value = true
    }

    const editLayout = (record) => {
      message.info('编辑功能待实现')
    }

    const deleteLayout = (record) => {
      exp_layout_delete(record).then((res) => {
        if (res.success) {
          message.success('删除成功')
          loadData()
        } else {
          message.error('删除失败: ' + res.message)
        }
      }).catch((err) => {
        message.error('删除失败: ' + err.message)
      })
    }

    const handleSubmit = () => {
      message.info('提交功能待实现')
      addFormVisible.value = false
    }

    const handleCancel = () => {
      addFormVisible.value = false
    }

    // 添加操作列
    if (hasPerm('exp_layout:edit') || hasPerm('exp_layout:delete')) {
      columns.push({
        title: '操作',
        width: 200,
        key: 'action',
        align: 'center'
      })
    }

    onMounted(() => {
      getSysDictTypeDropDown()
      getConsumableData()
      loadData()
    })

    return {
      queryParam,
      loading,
      addFormVisible,
      importModalVisible,
      editTagVisible,
      layoutLoading,
      isCollapsed,
      selectedRow,
      layoutData,
      layoutDataList,
      shippingSpaces,
      consumableData,
      statusDictTypeDropDown,
      importModalTitle,
      editTagTitle,
      editTagValue,
      draggedData,
      dragConsumable,
      dragAdd,
      currentLayout,
      importForm,
      pagination,
      columns,
      statusFilter,
      loadData,
      refreshTable,
      onTableChange,
      getConsumableData,
      customRow,
      toggleCollapse,
      showImportModal,
      importShippingSpaces,
      loadShippingSpaces,
      onDragAdd,
      onDragDelete,
      onDivDrop,
      onDbClickConsumable,
      onEditTagOk,
      mouseEnterEvent,
      mouseLeaveEvent,
      loadCanvas,
      addLayout,
      editLayout,
      deleteLayout,
      handleSubmit,
      handleCancel,
      hasPerm
    }
  }
})
</script>

<style lang="less" scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
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
  margin-left: 5px;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.separator:hover {
  background-color: #588000;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;
  padding-left: 5px;
}
</style>

