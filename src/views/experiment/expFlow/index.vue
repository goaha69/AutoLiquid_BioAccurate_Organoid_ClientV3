<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
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
              <a-button type="primary" @click="loadTableData">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </x-card>
    <a-card :bordered="false" style="height: 90vh;">
      <a-spin :spinning="flowLoading">
        <a-row style="display: flex;">
          <a-col :span="isCollapsed ? 0 : 6">
            <div class="table-operator" v-if="hasPerm('exp_flow:add')">
                <a-button @click="addFormRef.add()" icon="plus" type="primary">新增实验流程
                </a-button>
                <a-button style="float: right" type="primary" @click="ImportandExport">导入/导出</a-button>
                <a-modal :visible="importExportModal.visible" @cancel="importExportModal.visible = false"
                  title="导入/导出设置" width="50%">
                  <div style="margin-bottom: 16px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">选择流程</span>
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
            </div>
            <a-table
              ref="tableRef"
              :columns="columns"
              :data-source="tableData"
              :pagination="pagination"
              :loading="tableLoading"
              :rowKey="(record) => record.id"
              @change="handleTableChange"
              :customRow="customRow"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'serial'">
                  {{ index + 1 }}
                </template>
                <template v-if="column.key === 'action'">
                  <a v-if="hasPerm('exp_flow:edit')" @click="editFormRef.edit(record)">编辑</a>
                  <a-divider type="vertical" v-if="hasPerm('exp_flow:delete')" />
                  <a-popconfirm v-if="hasPerm('exp_flow:delete')" placement="topRight" title="确认删除本实验流程？"
                    @confirm="() => exp_flow_delete(record)">
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
          <a-col :span="isCollapsed ? 18 : 14" style="padding-left:10px;">
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
              <div style="position: absolute;right:5px;top:15px;">
                <span v-if="selectedRow != null" style="color:black;font-size:16px;margin-right:10px;">当前流程：{{
                  selectedRow.name
                }}</span>
                <a-button icon="save" type="primary" @click="handleSubmit">保存</a-button>
              </div>
            </div>
            <div class="container" ref="containerRef" @mousemove="drag" @mouseup="endDrag">
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
                  <g @click.stop="deleteLine(line)" style="cursor: pointer;">
                    <rect
                      :x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2 - 10"
                      :y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 - 10"
                      width="20" height="20" fill="#c6c6c6" />
                    <text
                      :x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2"
                      :y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 + 5"
                      fill="white" font-size="12" text-anchor="middle">X</text>
                  </g>
                </g>
              </svg>
            </div>
          </a-col>
          <a-col :span="isCollapsed ? 6 : 4">
            <div style="padding-top:21px;padding-left:1px;" v-if="selectedNode != null">
              <span style="font-size:18px;color:black;padding-left:10px;">节点属性</span>
              <a-divider type="horizontal" />

              <sp-input label="节点名称" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                v-model="selectedNode.label" />

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">执行后挂起：</span>
                <a-checkbox v-model:checked="selectedNode.afterPending" style="width:130px;" />
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <sp-input-number label="挂起时间" :disabled="!selectedNode.afterPending" :labelWidth="80" unit="分"
                  v-model="selectedNode.pendingDuration" />
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">驳回到节点：</span>
                <a-select style="width: 250px;color:black;" v-model:value="selectedNode.rejectNodeId">
                  <a-select-option v-for="(item, index) in nodes.filter(u => u.type == 'process')" :key="index"
                    :value="item.id">{{ item.label }}</a-select-option>
                </a-select>
              </div>

              <div v-if="selectedNode.type === 'process'">
                <div style="margin-top:5px;">
                  <span class="span-label">程序集：</span>
                  <a-select style="width: 250px;color:black;" v-model:value="selectedNode.stepParentId"
                    @change="stepParentChange">
                    <a-select-option v-for="(item, index) in stepParentData" :key="index" :value="item.id">{{ item.name
                    }}</a-select-option>
                  </a-select>
                </div>

                <a-table style="margin:5px;overflow: auto;" ref="stepTable" size="middle" :pagination="false"
                  :row-key="(record, index) => record.id" :columns="stepColumns" :dataSource="stepData"
                  :loading="stepLoading" :customRow="stepCustomRow" draggable="true">
                  <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'serial'">
                      {{ index + 1 }}
                    </template>
                    <template v-else-if="column.key === 'description'">
                      {{ getFlowStepDesc(record) }}
                    </template>
                    <template v-else-if="column.key === 'action'">
                      <a v-if="hasPerm('exp_flow_step:edit')" @click="editStepFormRef.edit(record)">编辑</a>
                    </template>
                  </template>
                </a-table>
              </div>
              <a-modal :title="editTagTitle" :width="400" :height="300" v-model:visible="editTagVisible"
                :maskClosable="false" @ok="onEditTagOk" @cancel="onEditTagCancel">
                <div>
                  <span class="span-label" style="width: 120px;">返回值绑定属性：</span>
                  <a-select style="width: 160px;color:black;" v-model:value="stepAttribute"
                    @change="stepAttributeChange">
                    <a-select-option v-for="(item, index) in stepAttributeData" :key="index" :value="item.id">{{
                      item.name
                    }}</a-select-option>
                  </a-select>
                </div>
              </a-modal>
            </div>

            <div style="padding-top:21px;padding-left:1px;" v-if="selectedLine != null">
              <span style="font-size:18px;color:black;padding-left:10px;">线段属性</span>
              <a-divider type="horizontal" />

              <sp-input label="开始节点" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model="selectedLine.start.label" />
              <sp-input label="结束节点" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model="selectedLine.end.label" style="margin-top:5px;" />

              <div style="margin-top:5px;">
                <span class="span-label" style="width:85px;">添加条件：</span>
                <a-button icon="plus" @click="addCondition()" />
              </div>

              <div :key="i" v-for="(item, i) in selectedLine.conditions" style="margin-top:5px;">
                <div style="height:auto;">
                  <span class="span-label" style="width:75px;">{{ '条件' + (i + 1) + ':' }}</span>
                  <a-select placeholder="关系" style="margin-left:10px;width:65px;"
                    v-model:value="selectedLine.conditions[i].condition">
                    <a-select-option v-for="(condition, index) in conditions" :key="index" :value="condition.id">{{
                      condition.name
                    }}</a-select-option>
                  </a-select>
                  <a-select placeholder="属性" style="width:85px;" v-model:value="selectedLine.conditions[i].attributeId">
                    <a-select-option v-for="(attribute, index) in attributeData" :key="index" :value="attribute.id">{{
                      attribute.name }}</a-select-option>
                  </a-select>
                  <a-button icon="minus" style="width:20px;" @click="subCondition(i)"
                    v-if="selectedLine.conditions.length > 0" />
                </div>
                <div style="height:auto;margin-top:5px;margin-left:85px;">
                  <a-select placeholder="比较" style="width:65px;" v-model:value="selectedLine.conditions[i].operation">
                    <a-select-option v-for="(operation, index) in operations" :key="index" :value="operation.id">{{
                      operation.name
                    }}</a-select-option>
                  </a-select>
                  <a-input v-model:value="selectedLine.conditions[i].value" style="width:85px;" clearable
                    placeholder="值" />
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-spin>
    </a-card>

    <add-form ref="addFormRef" @ok="handleOk" @preview-layout="handlePreviewLayout" />
    <edit-form ref="editFormRef" @ok="handleOk" @preview-layout="handlePreviewLayout" />
    <design-form ref="designFormRef" @ok="handleOk" />
    <a-modal :title="layoutTitle" :width="currentLayout.xSize" :height="currentLayout.ySize + 80"
      v-model:visible="previewLayoutVisible" :footer="null" :maskClosable="false">
      <div style="overflow: scroll;">
        <canvas ref="canvasRef" :width="currentLayout.xSize" :height="currentLayout.ySize"
          style="background-color:#99CCFF;"></canvas>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { STable, XCard, spInput, spInputNumber } from '@/components'
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
import addForm from './addForm.vue'
import editForm from './editForm.vue'
import designForm from './designForm'
import { useStore } from 'vuex';

const store = useStore()
const hasPerm = (p) => {
  return store.getters.permissions.includes(p)
}

// Refs for components
const tableRef = ref(null);
const addFormRef = ref(null);
const editFormRef = ref(null);
const designFormRef = ref(null);
const containerRef = ref(null);
const canvasRef = ref(null);

const flowId = ref('');
const stepId = ref('');
const isCollapsed = ref(false);
const formLoading = ref(true);

const nodes = ref([]);
const lines = ref([]);
const connecting = ref(false);
const startNode = ref(null);
const draggingNode = ref(null);
const offsetX = ref(0);
const offsetY = ref(0);
const selectedLine = ref(null);
const selectedNode = ref(null);
const stepParentData = ref([]);
const deleteNodes = ref([]);
const flowLoading = ref(false);

const queryParam = reactive({});

const tableData = ref([]);
const tableLoading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = ref([
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: '45px',
  },
  {
    title: '流程名称',
    dataIndex: 'name'
  },
]);

const loadTableData = () => {
  tableLoading.value = true;
  const params = {
    ...queryParam,
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
  };
  exp_flow_page(params).then((res) => {
    tableLoading.value = false;
    if (res.success) {
      tableData.value = res.data.records;
      pagination.total = res.data.total;
    } else {
      message.error(res.message);
    }
  });
};

const handleTableChange = (p) => {
  pagination.current = p.current;
  pagination.pageSize = p.pageSize;
  loadTableData();
};

const editTagTitle = ref('');
const stepAttribute = ref(null);
const editTagVisible = ref(false);
const stepAttributeData = ref([]);
const layoutData = ref([]);
const currentLayout = ref({ name: '', xSize: 1800, ySize: 800 });
const layoutTitle = ref('');
const previewLayoutVisible = ref(false);
const selectedRow = ref(null);

const liquidRanges = ref([]);
const consumableTagData = ref([]);
const equipmentData = ref([]);
const liquidData = ref([]);
const shippingSpaceData = ref([]);
const selectedStepRow = ref(null);
const stepLoading = ref(false);
const stepData = ref([]);
const stepColumns = ref([
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: '50px',
  },
  {
    title: '步骤名称',
    width: '130px',
    dataIndex: 'name'
  },
  {
    title: '步骤详述',
    width: '300px',
    key: 'description'
  }
]);
const attributeData = ref([]);
const conditionData = ref([]);
const operations = ref([
  { id: '>', name: '>' },
  { id: '<', name: '<' },
  { id: '>=', name: '>=' },
  { id: '<=', name: '<=' },
  { id: '=', name: '=' },
  { id: '!=', name: '!=' },
  { id: 'in', name: 'in' },
  { id: 'not in', name: 'not in' },
]);
const conditions = ref([
  { id: 'and', name: '并且' },
  { id: 'or', name: '或者' }
]);
const importExportModal = reactive({
  visible: false
});
const selectedFlow = ref(null);
const flows = ref([]);
const exportLoading = ref(false);
const importResult = reactive({
  visible: false,
  type: 'info',
  message: ''
});

onMounted(() => {
  loadTableData();
  loadSysDictTypeDropDown()
  getLayoutData()
  getEquipmentData()
  getLiquidData()
  if (hasPerm('exp_flow:design') || hasPerm('exp_flow:preview') || hasPerm('exp_flow:edit') || hasPerm('exp_flow:delete')) {
    columns.value.push({
      title: '操作',
      width: '95px',
      key: 'action',
    })
  }
});

const calcFontSize = (node) => {
  const textLength = [...node.label].reduce((acc, char) =>
    acc + (char.charCodeAt(0) > 255 ? 1.5 : 1), 0);
  const widthLimit = node.w / (textLength * 0.65);
  const heightLimit = node.h * 0.45;
  const calculatedSize = Math.min(widthLimit, heightLimit);
  return Math.min(16, Math.max(8, Math.round(calculatedSize)));
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getFlowDetail = (record) => {
  exp_flow_detail({ id: record.id }).then((res) => {
    formLoading.value = false
    if (res.success) {
      attributeData.value = res.data.attributes
      conditionData.value = res.data.conditions
    }
    else {
      message.error('数据加载失败')
    }
  })
}

const addCondition = () => {
  if (selectedLine.value.conditions == null)
    selectedLine.value.conditions = []

  selectedLine.value.conditions.push({
    flowId: selectedRow.value.id,
    attributeId: 0,
    lineId: selectedLine.value.id,
    operation: '=',
    condition: 'and',
    value: '',
  });
};

const subCondition = (i) => {
  selectedLine.value.conditions.splice(i, 1);
};

const loadSysDictTypeDropDown = () => {
  sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
    liquidRanges.value = res.data
    liquidRanges.value.forEach((item) => {
      item.code = parseInt(item.code)
    })
  })
};

const stepCustomRow = (record) => {
  return {
    onClick: () => {
      selectedStepRow.value = record;
    },
    onDblclick: () => {
      getStepAttributeData(record)
      for (let i = 0; i < stepAttributeData.value.length; i++) {
        const ele = stepAttributeData.value[i];
        if (ele.stepId == stepId.value) {
          stepAttribute.value = ele.id
        }
      }
    },
    style: {
      backgroundColor: selectedStepRow.value == record ? ('#' + store.getters.color.slice(1) + '15') : '',
    },
  };
};

const getStepAttributeData = (record) => {
  editTagVisible.value = true
  editTagTitle.value = '编辑步骤 -- ' + record.name
  stepAttributeData.value = attributeData.value
  stepId.value = record.id
};

const onEditTagOk = () => {
  var data = { flowId: flowId.value, stepId: stepId.value, stepAttributeId: stepAttribute.value }
  exp_flow_saveAttribute(data).then((res) => {
    if (res.success) {
      message.success('步骤绑定成功')
    } else {
      message.error('步骤绑定失败')
    }
  })
  editTagVisible.value = false
};

const onEditTagCancel = () => {
  editTagVisible.value = false
  stepAttribute.value = null
};

const stepAttributeChange = () => { };

const getConsumableTagData = () => {
  var data = { id: selectedRow.value.layoutId }
  exp_consumable_getConsumableTags(data).then((res) => {
    consumableTagData.value = res.data
  })
};

const getEquipmentData = () => {
  exp_equipment_list({}).then((res) => {
    equipmentData.value = res.data
  })
};

const getLiquidData = () => {
  exp_liquid_list({}).then((res) => {
    liquidData.value = res.data
  })
};

const getShippingSpaceData = () => {
  var data = { id: selectedRow.value.layoutId }
  exp_layout_getShippingSpaces(data).then((res) => {
    shippingSpaceData.value = res.data
  })
};

const getFlowStepDesc = (record) => {
  var remark = ''
  var tagName = ''
  var spaceName = ''
  var liquidName = ''
  var equipmentName = ''
  var tag = consumableTagData.value.filter(item => item.id == record.consumableTagId)
  if (tag.length > 0)
    tagName = tag[0].name
  var space = shippingSpaceData.value.filter(item => item.id == record.targetSpaceId)
  if (space.length > 0)
    spaceName = space[0].name
  var liquid = liquidData.value.filter(item => item.id == record.liquidId)
  if (liquid.length > 0)
    liquidName = liquid[0].name
  var equipment = equipmentData.value.filter(item => item.id == record.equipmentId)
  if (equipment.length > 0)
    equipmentName = equipment[0].name

  switch (record.type) {
    case 0:
      remark = equipmentName.concat(' ').concat(record.cmdScript);
      break;
    case 1:
      var fl = liquidRanges.value.filter(item => item.code == record.liquidRange)
      if (fl.length > 0)
        remark = equipmentName.concat(' ').concat(fl[0].value).concat(' ul').concat(' 枪头');
      break;
    case 2:
      var f1 = (record.releaseTipSourcePos) ? '退回原位' : '丢弃'
      var f2 = (record.useReleaseTipSourcePos) ? '复用' : '不复用'
      remark = equipmentName.concat(' ').concat(f1).concat(' ').concat(f2);
      break;
    case 3:
      remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr);
      break;
    case 4:
      remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr);
      break;
    case 5:
      remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr).concat(' ').concat(record.mixTime).concat(' 次');
      break;
    case 6:
      remark = '等待时间 : '.concat(record.waitTime).concat('秒');
      break;
    case 7:
      remark = equipmentName.concat(' 源耗材 : ').concat(tagName).concat(' ').concat(record.holeIndexStr);
      break;
    case 8:
      remark = record.remark;
      break;
    case 9:
      remark = equipmentName.concat(' 目标舱位 : ').concat(spaceName).concat(' ').concat(record.holeIndexStr);
      break;
    default:
      remark = '控制方法 : '.concat(record.executeMethod).concat(' 参数 : ').concat(formatExecuteParam(record.executeParam));
      break;
  }
  return remark;
};

const formatExecuteParam = (params) => {
  if (params == null || params == '')
    return [];
  else {
    var temp = JSON.parse(params)
    var data = [];
    temp.forEach(item => {
      data.push("" + item.paramName + ":" + item.value + "")
    })
    var str = "(" + data.map(item => item).join(',') + ")"
    return str;
  }
};

const getNodeFlowStepData = () => {
  if (selectedNode.value.stepParentId == null || selectedNode.value.stepParentId == 0) {
    stepData.value = []
    return;
  }
  var data = { pid: selectedNode.value.stepParentId };
  exp_flow_step_list(data).then((res) => {
    if (res.success) {
      stepData.value = res.data
      removeEmptyChildren(stepData.value)
    } else {
      message.error('数据加载失败')
    }
  })
};

const getFlowStepData = (layoutId) => {
  var data = { layoutId: layoutId, pid: 0 };
  exp_flow_step_list(data).then((res) => {
    if (res.success) {
      stepParentData.value = res.data
      removeEmptyChildren(stepParentData.value)
    } else {
      message.error('数据加载失败')
    }
  })
};

const removeEmptyChildren = (data) => {
  if (data == null || data.length === 0) return
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    item.children = null
    if (item.children != null && item.children.length === 0) {
    } else {
      removeEmptyChildren(item.children)
    }
  }
};

const customRow = (record) => {
  return {
    onClick: () => {
      selectedRow.value = record
      nodes.value = []
      lines.value = []
      deleteNodes.value = []
      selectedNode.value = null
      selectedLine.value = null
      connecting.value = false
      stepParentData.value = []
      startNode.value = null
      draggingNode.value = null
      offsetX.value = 0
      offsetY.value = 0

      getFlowStepData(record.layoutId)
      getNodeList(record.id)
      getConsumableTagData()
      getShippingSpaceData()
      getFlowDetail(record)
    },
    style: {
      backgroundColor: selectedRow.value == record ? ('#' + store.getters.color.slice(1) + '15') : '',
    },
  };
};

const getNodeList = (flowId) => {
  flowLoading.value = true
  var data = { id: flowId };
  exp_flow_getNodeList(data).then((res) => {
    if (res.success) {
      nodes.value = []
      lines.value = []
      var temps = res.data
      temps.forEach((item) => {
        if (item.type != 'line') {
          var w = 130;
          var h = 60;
          var r = 25;
          if (item.type === 'start' || item.type === 'end')
            w = 50;

          item.modifyMode = 2
          nodes.value.push({
            id: item.id,
            type: item.type,
            label: item.label,
            x: item.x,
            y: item.y,
            w,
            h,
            r,
            modifyMode: 2,
            flowId: item.flowId,
            stepParentId: item.stepParentId,
            afterPending: item.afterPending,
            pendingDuration: item.pendingDuration,
            rejectNodeId: item.rejectNodeId,
          })
        }
      })

      temps.forEach((item) => {
        if (item.type === 'line') {
          item.modifyMode = 2
          var startNodeVal = nodes.value.find(a => a.id === item.startNodeId);
          var endNodeVal = nodes.value.find(a => a.id === item.endNodeId);

          if (startNodeVal && endNodeVal) {
            lines.value.push({
              id: item.id,
              type: item.type,
              label: item.label,
              startNodeId: startNodeVal.id,
              endNodeId: endNodeVal.id,
              start: startNodeVal,
              end: endNodeVal,
              modifyMode: 2,
              flowId: item.flowId
            })
          }
        }
      })
    }
    else {
      message.error('数据加载失败')
    }
  }).finally(() => {
    flowLoading.value = false
  })
};

const handleOk = () => {
  loadTableData();
};

const exp_flow_delete_api = (record) => {
  exp_flow_delete(record).then((res) => {
    if (res.success) {
      message.success('删除成功')
      loadTableData();
    } else {
      message.error('删除失败: ' + res.message)
    }
  })
};

const getLayoutData = () => {
  exp_layout_list({}).then((res) => {
    layoutData.value = res.data
  })
};

const handlePreviewLayout = (layoutId) => {
  const values = layoutData.value.filter(item => item.id == layoutId)
  if (values.length > 0) {
    currentLayout.value = values[0]
    previewLayoutVisible.value = true

    layoutTitle.value = currentLayout.value.name + ' -- 舱位布局图'
    var dd = { id: currentLayout.value.id }
    exp_layout_getShippingSpaces(dd).then((res) => {
      if (res.success) {
        let shippingSpaces = res.data
        nextTick(() => {
          const canvas = canvasRef.value;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          shippingSpaces.forEach((rect, index) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);

            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);

            const textX = rect.xOffset + rect.xSize / 2;
            const textY = rect.yOffset + rect.ySize / 2 + 5;

            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = "16px arial";
            const name = rect.name ? rect.name : '舱位' + (index + 1)

            let maxWidth = rect.xSize;
            let lineHeight = 20;
            let x = textX;
            let y = textY;

            const words = name.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;
              if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, x, y);
          });
        })
      }
    })
  }
  else
    message.warning("请先选择盘面布局！")
};

const handleSubmit = () => {
  lines.value.forEach((item) => {
    var startNodeVal = nodes.value.find(a => a.id === item.startNodeId);
    var endNodeVal = nodes.value.find(a => a.id === item.endNodeId);
    item.label = startNodeVal.label + '->' + endNodeVal.label
  })

  flowLoading.value = true
  const newLists = [];
  newLists.push(...nodes.value, ...lines.value, ...deleteNodes.value);
  var data = { id: selectedRow.value.id, nodes: newLists };

  exp_flow_saveNodeList(data).then((res) => {
    if (res.success) {
      message.success('实验流程保存成功')
      getNodeList(data.id)
    } else {
      message.error('实验流程保存失败')
    }
  }).finally(() => {
    flowLoading.value = false
  })
};

const dragStart = (event, type) => {
  connecting.value = false;
  event.dataTransfer.setData('nodeType', type);
};

const drop = (event) => {
  const type = event.dataTransfer.getData('nodeType');
  const x = event.offsetX;
  const y = event.offsetY;
  var w = 130;
  var h = 60;
  var r = 25;
  if (type === 'start' || type === 'end')
    w = 50;
  var stepParentId = 0;

  var label = type === 'start' ? '开始' : (type === 'end' ? '结束' : '普通节点');

  var key = Date.now();

  const newNode = {
    id: key,
    type,
    x,
    y,
    w,
    h,
    r,
    label,
    stepParentId,
    selected: false,
    modifyMode: 1,
    key,
    flowId: selectedRow.value.id,
  };
  nodes.value.push(newNode);
};

const stepParentChange = (id) => {
  if (selectedNode.value) {
    selectedNode.value.stepParentId = id;
    selectedNode.value.label = stepParentData.value.find(item => item.id === selectedNode.value.stepParentId).name
    getNodeFlowStepData();
  }
};

const selectNode = (node) => {
  flowId.value = node.flowId
  if (connecting.value) {
    if (startNode.value) {
      connectNodes(startNode.value, node);
    } else {
      startNode.value = node;
      node.selected = true;
    }
  } else {
    nodes.value.forEach(n => n.selected = false);
    lines.value.forEach(l => l.selected = false);
    node.selected = true;
    selectedNode.value = node;
    selectedLine.value = null;
    stepData.value = [];
    if (node.type == "process" && node.stepParentId > 0)
      getNodeFlowStepData();
  }
};

const startDrag = (node, event) => {
  if (!connecting.value) {
    draggingNode.value = node;
    offsetX.value = event.clientX - node.x;
    offsetY.value = event.clientY - node.y;
  }
};

const drag = (event) => {
  if (draggingNode.value) {
    draggingNode.value.x = event.clientX - offsetX.value;
    draggingNode.value.y = event.clientY - offsetY.value;
  }
};

const endDrag = () => {
  draggingNode.value = null;
};

const toggleConnecting = () => {
  connecting.value = !connecting.value;
  if (!connecting.value) {
    startNode.value = null;
    nodes.value.forEach(n => n.selected = false);
  }
};

const connectNodes = (start, end) => {
  if (start !== end) {
    var key = Date.now();
    lines.value.push({
      id: key,
      start: start,
      end: end,
      startNodeId: start.id,
      endNodeId: end.id,
      selected: false,
      modifyMode: 1,
      flowId: selectedRow.value.id,
      key,
    });
  }
  start.selected = false;
  connecting.value = false;
  startNode.value = null;
};

const deleteNode = (nodeToDelete) => {
  nodes.value = nodes.value.filter(node => node.id !== nodeToDelete.id);
  lines.value = lines.value.filter(line => line.start !== nodeToDelete && line.end !== nodeToDelete);
  nodeToDelete.modifyMode = 3;
  deleteNodes.value.push(nodeToDelete);
};

const selectLine = (line) => {
  nodes.value.forEach(n => n.selected = false);
  lines.value.forEach(l => l.selected = false);
  line.selected = true;
  selectedLine.value = line;
  selectedNode.value = null;
};

const deleteLine = (lineToDelete) => {
  lines.value = lines.value.filter(line => line.id !== lineToDelete.id);
  lineToDelete.modifyMode = 3;
  deleteNodes.value.push(lineToDelete);
};

const getNearestPoints = (startNode, endNode) => {
  let startPoints = getAttachmentPoints(startNode);
  let endPoints = getAttachmentPoints(endNode);
  let nearestPair = { startPoint: startPoints[0], endPoint: endPoints[0], distance: Infinity };

  startPoints.forEach(sp => {
    endPoints.forEach(ep => {
      const dx = sp.x - ep.x;
      const dy = sp.y - ep.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < nearestPair.distance) {
        nearestPair = { startPoint: sp, endPoint: ep, distance };
      }
    });
  });
  return { startPoint: nearestPair.startPoint, endPoint: nearestPair.endPoint };
};

const getAttachmentPoints = (node) => {
  if (node.type === 'start' || node.type === 'end') {
    const cx = node.x + node.w / 2;
    const cy = node.y + node.r;
    return [
      { x: cx + node.r, y: cy },
      { x: cx - node.r, y: cy },
      { x: cx, y: cy + node.r },
      { x: cx, y: cy - node.r }
    ];
  } else {
    return [
      { x: node.x + node.w / 2, y: node.y },
      { x: node.x + node.w / 2, y: node.y + node.h },
      { x: node.x, y: node.y + node.h / 2 },
      { x: node.x + node.w, y: node.y + node.h / 2 }
    ];
  }
};

const ImportandExport = () => {
  importExportModal.visible = true;
  exp_flow_page({}).then(res => {
    flows.value = res.data.records;
  });
};

const handleExport = () => {
  if (!selectedFlow.value) {
    message.error('请选择一个流程进行导出');
    return;
  }
  exportLoading.value = true;
  exp_flow_ExportFlow({ flowId: selectedFlow.value })
    .then(res => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `flow_${selectedFlow.value}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    })
    .catch(err => {
      message.error('导出失败: ' + err.message);
    })
    .finally(() => {
      exportLoading.value = false;
    });
};

const beforeImportUpload = file => {
  const formData = new FormData();
  formData.append('sqlFile', file);
  exp_flow_ImportFlow(formData)
    .then(res => {
      importResult.visible = true;
      if (res.success) {
        importResult.type = 'success';
        importResult.message = '导入成功';
        loadTableData();
      } else {
        importResult.type = 'error';
        importResult.message = '导入失败: ' + res.message;
      }
    })
    .catch(err => {
      importResult.visible = true;
      importResult.type = 'error';
      importResult.message = '导入出错: ' + err.message;
    });
  return false;
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
}

.node {
  border: 1px solid #ccc;
  padding: 5px;
  cursor: grab;
  background-color: white;
}

.container {
  border: 1px solid #ddd;
  height: calc(90vh - 100px);
  position: relative;
  overflow: hidden;
}

.canvas {
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
}

.span-label {
  color: black;
  margin-left: 10px;
}

.separator {
  width: 10px;
  height: 100%;
  background-color: #f0f2f5;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container {
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  padding: 16px;
}

.action-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.action-section .ant-btn {
  margin-right: 8px;
}

.tip-text {
  font-size: 12px;
  color: #888;
}
</style>
