<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
      <template #content>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="12">
                <a-form-item label="实验流程编号">
                  <a-input v-model:value="queryParam.code" allow-clear placeholder="请输入实验流程编号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="12">
                <a-form-item label="实验流程名称">
                  <a-input v-model:value="queryParam.name" allow-clear placeholder="请输入实验流程名称" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
    </x-card>
    
    <a-card :bordered="false" style="height: 90vh;">
      <a-spin :spinning="flowLoading">
        <a-row style="display: flex;">
          <a-col :span="isCollapsed ? 0 : 6">
            <s-table ref="table" :columns="columns" :data="loadData" :alert="true" :rowKey="(record) => record.id"
              :customRow="customRow">
              <template #operator v-if="hasPerm('exp_flow:add')">
                <a-button @click="$refs.addForm.add()" type="primary" v-if="hasPerm('exp_flow:add')">
                  <template #icon><plus-outlined /></template>
                  新增实验流程
                </a-button>
                <a-button style="float: right" type="primary" @click="ImportandExport">导入/导出</a-button>
                <a-modal :open="importExportModal.visible" @cancel="importExportModal.visible = false"
                  title="导入/导出设置" width="50%">
                  <div style="margin-bottom: 16px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">选择流程:</span>
                    <a-select v-model:value="selectedFlow" style="width: 200px;">
                      <a-select-option v-for="(flow, index) in flows" :key="index" :value="flow.id">
                        {{ flow.name }}
                      </a-select-option>
                    </a-select>
                  </div>

                  <a-card title="数据迁移" :bordered="false" class="card-container">
                    <!-- 导入区域 -->
                    <div class="action-section">
                      <a-upload name="sqlFile" accept=".sql" :beforeUpload="beforeImportUpload" :showUploadList="false">
                        <a-button type="primary">
                          导入SQL
                        </a-button>
                      </a-upload>
                      <span class="tip-text">支持最大100MB的SQL文件</span>
                    </div>

                    <!-- 导出区域 -->
                    <div class="action-section">
                      <a-button type="primary" @click="handleExport" :loading="exportLoading">
                        导出SQL
                      </a-button>
                      <span class="tip-text">生成当前系统数据快照</span>
                    </div>

                    <!-- 状态提示 -->
                    <a-alert v-if="importResult.visible" :message="importResult.message" :type="importResult.type"
                      show-icon closable @close="() => importResult.visible = false" />
                  </a-card>
                </a-modal>
              </template>
              
              <template #serial="{ text, record, index }">
                <span>{{ index + 1 }}</span>
              </template>
              
              <template #action="text, record">
                <a v-if="hasPerm('exp_flow:edit')" @click="$refs.editForm.edit(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('exp_flow:delete')" />
                <a-popconfirm v-if="hasPerm('exp_flow:delete')" placement="topRight" title="确认删除本实验流程"
                  @confirm="() => exp_flow_delete(record)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </s-table>
          </a-col>
          
          <div class="separator" @click="toggleCollapse">
            <span v-if="isCollapsed">▶</span>
            <span v-else>◀</span>
          </div>
          
          <a-col :span="isCollapsed ? 18 : 14" style="padding-left: 10px;">
            <div class="toolbar">
              <div class="node" @dragstart="dragStart($event, 'start')" draggable="true">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" />
                  <polygon points="30,5 30,30 17,17" fill="green" />
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">开始</text>
                </svg>
              </div>
              <div class="node" @dragstart="dragStart($event, 'process')" draggable="true">
                <svg width="110" height="36">
                  <rect x="0" y="0" width="110" height="35" fill="white" stroke="#666" stroke-width="1" />
                  <rect x="8" y="5" width="25" height="25" fill="#ccc" />
                  <text x="70" y="24" text-anchor="middle" font-size="16" fill="black">普通节点</text>
                </svg>
              </div>
              <div class="node" @dragstart="dragStart($event, 'end')" draggable="true">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" />
                  <rect x="8" y="5" width="25" height="25" fill="red" />
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">结束</text>
                </svg>
              </div>
              <div class="node" @click="toggleConnecting" style="cursor: pointer;">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" :fill="connecting ? 'lightgreen' : 'white'" stroke="#666"
                    stroke-width="1" />
                  <rect x="8" y="16" width="25" height="3" fill="#333" />
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">线段</text>
                </svg>
              </div>
              <div style="position: absolute;right: 5px;top: 15px;">
                <span v-if="selectedRow != null" style="color: black;font-size: 16px;margin-right: 10px;">
                  当前流程: {{ selectedRow.name }}
                </span>
                <a-button type="primary" @click="handleSubmit">
                  <template #icon><save-outlined /></template>
                  保存
                </a-button>
              </div>
            </div>
            
            <div class="container" ref="container">
              <svg class="canvas" @drop="drop" @dragover.prevent>
                <g v-for="node in nodes" :key="node.id" @click="selectNode(node)" @mousedown="startDrag(node, $event)"
                  style="cursor: pointer;">
                  <template v-if="node.type === 'start'">
                    <circle :cx="node.x + node.w / 2" :cy="node.y + node.r" :r="node.r"
                      :fill="node.selected ? 'lightgreen' : 'white'" stroke="green" stroke-width="3" />
                    <text :x="node.x + node.w / 2" :y="node.y + node.r + 5" text-anchor="middle">{{ node.label }}</text>
                  </template>
                  <template v-else-if="node.type === 'end'">
                    <circle :cx="node.x + node.w / 2" :cy="node.y + node.r" :r="node.r"
                      :fill="node.selected ? 'lightgreen' : 'white'" stroke="red" stroke-width="3" />
                    <text :x="node.x + node.w / 2" :y="node.y + node.r + 5" text-anchor="middle">{{ node.label }}</text>
                  </template>
                  <template v-else>
                    <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h"
                      :fill="node.selected ? 'lightgreen' : 'white'" stroke="#ccc" stroke-width="3">
                      <title>{{ node.label }}</title>
                    </rect>
                    <text :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 5" fill="black"
                      :font-size="calcFontSize(node)" text-anchor="middle">{{ node.label }}</text>
                  </template>
                  <!-- 删除按钮 -->
                  <g @click.stop="deleteNode(node)">
                    <rect
                      :x="node.type === 'start' || node.type === 'end' ? node.x + node.w - 10 : node.x + node.w - 10" 
                      :y="node.y - 10" width="20" height="20" fill="#c6c6c6" />
                    <text :x="node.type === 'start' || node.type === 'end' ? node.x + node.w : node.x + node.w" 
                      :y="node.y + 5" fill="white" font-size="12" text-anchor="middle">X</text>
                  </g>
                </g>
                <g v-for="line in lines" :key="line.id">
                  <defs>
                    <marker id="arrow" markerWidth="5.5" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <polygon points="0 0, 5.5 3.5, 0 7" fill="black" />
                    </marker>
                  </defs>
                  <line :x1="getNearestPoints(line.start, line.end).startPoint.x"
                    :y1="getNearestPoints(line.start, line.end).startPoint.y"
                    :x2="getNearestPoints(line.start, line.end).endPoint.x"
                    :y2="getNearestPoints(line.start, line.end).endPoint.y" marker-end="url(#arrow)"
                    style="cursor: pointer;" stroke-width="3" :stroke="line.selected ? 'blue' : 'black'"
                    @click.stop="selectLine(line)" />
                  <!-- 删除按钮 -->
                  <g @click.stop="deleteLine(line)" style="cursor: pointer;">
                    <rect :x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2 - 10" 
                      :y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 - 10"
                      width="20" height="20" fill="#c6c6c6" />
                    <text :x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2" 
                      :y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 + 5"
                      fill="white" font-size="12" text-anchor="middle">X</text>
                  </g>
                </g>
              </svg>
            </div>
          </a-col>
          
          <a-col :span="isCollapsed ? 6 : 4">
            <div style="padding-top: 21px;padding-left: 1px;" v-if="selectedNode != null">
              <span style="font-size: 18px;color: black;padding-left: 10px;">节点属性</span>
              <a-divider type="horizontal" />

              <sp-input label="节点名称" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                v-model:value="selectedNode.label" />

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">执行后挂起:</span>
                <a-checkbox v-model:checked="selectedNode.afterPending" style="width:130px;" />
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <sp-input-number label="挂起时间" :disabled="!selectedNode.afterPending" :labelWidth="80" unit="分钟" v-model:value="selectedNode.pendingDuration" />
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">驳回到节点:</span>
                <a-select style="width: 250px;color: black;" v-model:value="selectedNode.rejectNodeId">
                  <a-select-option v-for="(item, index) in nodes.filter(u => u.type == 'process')" :key="index"
                    :value="item.id">{{ item.label }}</a-select-option>
                </a-select>
              </div>

              <div v-if="selectedNode.type === 'process'">
                <div style="margin-top:5px;">
                  <span class="span-label">程序集:</span>
                  <a-select style="width: 250px;color: black;" v-model:value="selectedNode.stepParentId"
                    @change="stepParentChange">
                    <a-select-option v-for="(item, index) in stepParentData" :key="index" :value="item.id">{{ item.name
                    }}</a-select-option>
                  </a-select>
                </div>

                <a-table style="margin: 5px;overflow: auto;" ref="stepTable" size="middle" :pagination="false"
                  :row-key="(record, index) => record.id" :columns="stepColumns" :dataSource="stepData"
                  :loading="stepLoading" :customRow="stepCustomRow" draggable="true">
                  <template #serial="{ text, record, index }">
                    <span>{{ index + 1 }}</span>
                  </template>
                  <template #description="{ text, record }">
                    <span>{{ getFlowStepDesc(record) }}</span>
                  </template>
                  <template #action="text, record">
                    <a v-if="hasPerm('exp_flow_step:edit')" @click="$refs.editStepForm.edit(record)">编辑</a>
                  </template>
                </a-table>
              </div>
              
              <a-modal :title="editTagTitle" :width="400" :height="300" :open="editTagVisible" :maskClosable="false"
                @ok="onEditTagOk" @cancel="onEditTagCancel">
                <div>
                  <span class="span-label" style="width: 120px;">返回值绑定属性:</span>
                  <a-select style="width: 160px;color: black;" v-model:value="stepAttribute" @change="stepAttributeChange">
                    <a-select-option v-for="(item, index) in stepAttributeData" :key="index" :value="item.id">{{
                      item.name
                    }}</a-select-option>
                  </a-select>
                </div>
              </a-modal>
            </div>

            <div style="padding-top: 21px;padding-left: 1px;" v-if="selectedLine != null">
              <span style="font-size: 18px;color: black;padding-left: 10px;">线段属性</span>
              <a-divider type="horizontal" />

              <sp-input label="开始节点" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model:value="selectedLine.start.label" />
              <sp-input label="结束节点" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model:value="selectedLine.end.label" style="margin-top: 5px;" />

              <div style="margin-top:5px;">
                <span class="span-label" style="width: 85px;">添加条件:</span>
                <a-button @click="addCondition()">
                  <template #icon><plus-outlined /></template>
                </a-button>
              </div>

              <div :key="i" v-for="(item, i) in selectedLine.conditions" style="margin-top: 5px;">
                <div style="height:auto;">
                  <span class="span-label" style="width: 75px;">{{ '条件' + (i + 1) + ':' }}</span>
                  <a-select placeholder="关系" style="margin-left: 10px;width: 65px;"
                    v-model:value="selectedLine.conditions[i].condition" @change="e => conditionChange(i, e)">
                    <a-select-option v-for="(condition, index) in conditions" :key="index" :value="condition.id">{{
                      condition.name
                    }}</a-select-option>
                  </a-select>
                  <a-select placeholder="属性" style="width: 85px;" v-model:value="selectedLine.conditions[i].attributeId"
                    @change="e => fieldNameChange(i, e)">
                    <a-select-option v-for="(attribute, index) in attributeData" :key="index" :value="attribute.id">{{
                      attribute.name }}</a-select-option>
                  </a-select>
                  <a-button icon="minus" style="width:20px;" @click="subCondition(i)"
                    v-if="selectedLine.conditions.length > 0" />
                </div>
                <div style="height: auto;margin-top: 5px;margin-left: 85px;">
                  <a-select placeholder="比较" style="width: 65px;" v-model:value="selectedLine.conditions[i].operation"
                    @change="e => operationChange(i, e)">
                    <a-select-option v-for="(operation, index) in operations" :key="index" :value="operation.id">{{
                      operation.name
                    }}</a-select-option>
                  </a-select>
                  <a-input v-model:value="selectedLine.conditions[i].value" style="width:85px;" clearable placeholder="值" @change="e => valueChange(i, e)" />
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-spin>
    </a-card>

    <add-form ref="addForm" @ok="handleOk" @preview-layout="handlePreviewLayout" />
    <edit-form ref="editForm" @ok="handleOk" @preview-layout="handlePreviewLayout" />
    <design-form ref="designForm" @ok="handleOk" />
    <a-modal :title="layoutTitle" :width="currentLayout.xSize" :height="currentLayout.ySize + 80"
      :open="previewLayoutVisible" :footer="null" :maskClosable="false" @cancel="previewLayoutVisible = false">
      <div style="overflow: scroll;">
        <canvas ref="canvas" :width="currentLayout.xSize" :height="currentLayout.ySize"
          style="background-color:#99CCFF;"></canvas>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { STable, Ellipsis, XCard } from '@/components'
import {
  exp_flow_page, exp_flow_delete, exp_flow_getNodeList, exp_flow_saveNodeList, exp_flow_detail, exp_flow_saveAttribute,
  exp_flow_ImportFlow, exp_flow_ExportFlow
} from '@/api/modular/experiment/expFlowManage'
import { exp_flow_step_list } from '@/api/modular/experiment/expFlowStepManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { exp_layout_list } from '@/api/modular/experiment/layoutManage'
import { exp_liquid_list } from '@/api/modular/experiment/liquidManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { exp_consumable_list, exp_consumable_getConsumableTags } from '@/api/modular/experiment/consumableManage'
import { exp_layout_getShippingSpaces } from '@/api/modular/experiment/layoutManage'
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
import addForm from './addForm.vue'
import editForm from './editForm.vue'
import designForm from './designForm'
import previewForm from './previewForm'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons-vue';

export default {
  components: {
    XCard,
    STable,
    Ellipsis,
    addForm,
    editForm,
    designForm,
    previewForm,
    SpInputNumber,
    SpInput,
    PlusOutlined,
    SaveOutlined
  },
  data() {
    return {
      flowId: '',
      stepId: '',
      isCollapsed: false,
      formLoading: true,
      nodes: [],
      lines: [],
      connecting: false,
      startNode: null,
      draggingNode: null,
      offsetX: 0,
      offsetY: 0,
      selectedLine: null,
      selectedNode: null,
      stepParentData: [],
      deleteNodes: [],
      flowLoading: false,
      queryParam: {},
      columns: [
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '45px',
          slots: { customRender: 'serial' }
        },
        {
          title: '流程名称',
          dataIndex: 'name'
        },
      ],
      tstyle: { 'padding-bottom': '0px', 'margin-bottom': '10px' },
      loadData: parameter => {
        return exp_flow_page(Object.assign(parameter, this.queryParam)).then((res) => {
          return res.data
        })
      },
      editTagTitle: '',
      stepAttribute: null,
      editTagVisible: false,
      stepAttributeData: [],
      layoutData: [],
      currentLayout: { name: '', xSize: 1800, ySize: 800 },
      layoutTitle: '',
      previewLayoutVisible: false,
      selectedRow: null,
      liquidRanges: [],
      consumableTagData: [],
      equipmentData: [],
      liquidData: [],
      shippingSpaceData: [],
      selectedStepRow: null,
      stepLoading: false,
      stepData: [],
      stepColumns: [
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '45px',
          slots: { customRender: 'serial' }
        },
        {
          title: '步骤描述',
          key: 'description',
          slots: { customRender: 'description' }
        },
        {
          title: '操作',
          key: 'action',
          width: '120px',
          slots: { customRender: 'action' }
        }
      ],
      attributeData: [],
      conditions: [],
      operations: [],
      flows: [],
      selectedFlow: null,
      importExportModal: {
        visible: false
      },
      exportLoading: false,
      importResult: {
        visible: false,
        message: '',
        type: 'info'
      }
    }
  },
  created() {
    this.sysDictTypeDropDown()
    this.getLayoutData()
    this.getEquipmentData()
    this.getLiquidData()
    if (this.hasPerm('exp_flow  design') || this.hasPerm('exp_flow : preview') || this.hasPerm('exp_flow  edit') || this.hasPerm('exp_flow : delete')) {
      this.columns.push({
        title: '操作',
        width: '95px',
        dataIndex: 'action',
        slots: { customRender: 'action' }
      })
    }
  },
  methods: {
    hasPerm(permission) {
      // Permission check logic
      return true
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    ImportandExport() {
      this.importExportModal.visible = true
    },
    handleExport() {
      this.exportLoading = true
      // Export logic here
      setTimeout(() => {
        this.exportLoading = false
      }, 2000)
    },
    beforeImportUpload(file) {
      // Import logic here
      return false
    },
    exp_flow_delete(record) {
      // Delete logic here
    },
    handleOk() {
      // Handle OK logic
    },
    handlePreviewLayout() {
      // Preview layout logic
    },
    handleSubmit() {
      // Submit logic
    },
    customRow(record) {
      return {
        onClick: () => {
          this.selectedRow = record
        }
      }
    },
    stepCustomRow(record) {
      return {
        onClick: () => {
          this.selectedStepRow = record
        }
      }
    },
    dragStart(event, nodeType) {
      // Drag start logic
    },
    drop(event) {
      // Drop logic
    },
    selectNode(node) {
      // Select node logic
    },
    selectLine(line) {
      // Select line logic
    },
    deleteNode(node) {
      // Delete node logic
    },
    deleteLine(line) {
      // Delete line logic
    },
    startDrag(node, event) {
      // Start drag logic
    },
    toggleConnecting() {
      this.connecting = !this.connecting
    },
    calcFontSize(node) {
      return Math.min(14, node.w / 8)
    },
    getNearestPoints(startNode, endNode) {
      // Calculate nearest points logic
      return {
        startPoint: { x: startNode.x, y: startNode.y },
        endPoint: { x: endNode.x, y: endNode.y }
      }
    },
    stepParentChange() {
      // Step parent change logic
    },
    onEditTagOk() {
      this.editTagVisible = false
    },
    onEditTagCancel() {
      this.editTagVisible = false
    },
    stepAttributeChange() {
      // Step attribute change logic
    },
    addCondition() {
      if (this.selectedLine && this.selectedLine.conditions) {
        this.selectedLine.conditions.push({
          condition: null,
          attributeId: null,
          operation: null,
          value: ''
        })
      }
    },
    subCondition(index) {
      if (this.selectedLine && this.selectedLine.conditions) {
        this.selectedLine.conditions.splice(index, 1)
      }
    },
    conditionChange(index, value) {
      // Condition change logic
    },
    fieldNameChange(index, value) {
      // Field name change logic
    },
    operationChange(index, value) {
      // Operation change logic
    },
    valueChange(index, value) {
      // Value change logic
    },
    getFlowStepDesc(record) {
      return record.description || '无描述'
    }
  }
}
</script>

<style scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
}

.separator {
  width: 4px;
  background-color: #5685dd;
  height: 100%;
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

.toolbar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  position: relative;
}

.node {
  margin-right: 10px;
  cursor: grab;
}

.node:active {
  cursor: grabbing;
}

.container {
  height: calc(100vh - 200px);
  overflow: auto;
}

.canvas {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
}

.span-label {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 8px;
}

.action-section {
  margin-bottom: 16px;
}

.tip-text {
  margin-left: 8px;
  color: #666;
  font-size: 12px;
}

.card-container {
  margin-top: 16px;
}
</style>
