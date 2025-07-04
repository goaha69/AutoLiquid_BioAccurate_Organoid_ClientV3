<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="12">
              <a-form-item label="实验流程编号">
                <a-input v-model  value="queryParam.code" allow-clear placeholder="请输入实验流程编 : " ></a>
              </a-form-item>
            </a-col>
            <a-col  md="8" : sm="12">
              <a-form-item label="实验流程名称">
                <a-input v-model  value="queryParam.name" allow-clear placeholder="请输入实验流程名 : " ></a>
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
          <a-col :span="isCollapsed  0 : 6">
            <s-table ref="table" :columns="columns" :data="loadData" :alert="true" :rowKey="(record) => record.id"
              :customRow="customRow">
              <template #operator v-if="hasPerm('exp_flow:add')">
                <a-button @click="$refs.addForm.add()" ><template #icon><plus-outlined ></plus-outlined></template type="primary" v-if="hasPerm('exp_flow:add')">新增实验流程
                </a-button>
                <a-button style="float: right" type="primary" @click="ImportandExport">导入/导出</a-button>
                <a-modal :open="importExportModal.visible" @cancel="importExportModal.visible = false"
                  title="导入/导出设置" width="50%">
                  <div style="margin-bottom: 16px; display: flex; align-items : center;">
                    <span style="margin-right: 8px;">选择流程</template>
                    <a-select v-model="selectedFlow" style="width: 200px;">
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
                      <span class="tip-text">支持最:00MB的SQL文件</template>
                    </div>

                    <!-- 导出区域 -->
                    <div class="action-section">
                      <a-button type="primary" @click="handleExport" :loading="exportLoading">
                         导出SQL
                      </a-button>
                      <span class="tip-text">生成当前系统数据快照</template>
                    </div>

                    <!-- 状态提:-->
                    <a-alert v-if="importResult.visible" :message="importResult.message" :type="importResult.type"
                      show-icon closable @close="() => importResult.visible = false" />
                  </a-card>
                </a-modal>

              </template>
              <span #serial #default="text, record, index">
                {{ index + 1}}
              </template>
              <template #action="text, record">
                <a v-if="hasPerm('exp_flow:edit')" @click="$refs.editForm.edit(record)">编辑</a>
                <a-divider type="vertical" v-if="hasPerm('exp_flow:delete')" ></a>
                <a-popconfirm v-if="hasPerm('exp_flow:delete')" placement="topRight" title="确认删除本实验流程"
                  @confirm="() => exp_flow_delete(record)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </s-table>
          </a-col>
          <div class="separator" @click="toggleCollapse">
            <span v-if="isCollapsed"></template>
            <span v-else>◀</template>
          </div>
          <a-col :span="isCollapsed : 18  14" style="padding-left : 10px;">
            <div class="toolbar">
              <div class="node" @dragstart="dragStart($event, 'start')" draggable="true">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                  <polygon points="30,5 30,30 17,17" fill="green" ></polygon>
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">开</text>
                </svg>
              </div>
              <div class="node" @dragstart="dragStart($event, 'process')" draggable="true">
                <svg width="110" height="36">
                  <rect x="0" y="0" width="110" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                  <rect x="8" y="5" width="25" height="25" fill="#ccc" ></rect>
                  <text x="70" y="24" text-anchor="middle" font-size="16" fill="black">普通节</text>
                </svg>
              </div>
              <div class="node" @dragstart="dragStart($event, 'end')" draggable="true">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                  <rect x="8" y="5" width="25" height="25" fill="red" ></rect>
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">结束</text>
                </svg>
              </div>
              <div class="node" @click="toggleConnecting" style="cursor: pointer;">
                <svg width="80" height="36">
                  <rect x="0" y="0" width="80" height="35" :fill="connecting  'lightgreen' : 'white'" stroke="#666"
                    stroke-width="1" ></rect>
                  <rect x="8" y="16" width="25" height="3" fill="#333" ></rect>
                  <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">线段</text>
                </svg>
              </div>
              <div style="position: absolute;right: 5px;top : 15px;">
                <span v-if="selectedRow != null" style="color: black;font-size : 16px;margin-right: 10px;">当前流程 : {{
                  selectedRow.name
                }}</template>
                <a-button ><template #icon><save-outlined ></save></template type="primary" @click="handleSubmit">保存</a-button>
              </div>
            </div>
            <div class="container" ref="container">
              <svg class="canvas" @drop="drop" @dragover.prevent>
                <g v-for="node in nodes" :key="node.id" @click="selectNode(node)" @mousedown="startDrag(node, $event)"
                  style="cursor: pointer;">
                  <template v-if="node.type === 'start'">
                    <circle :cx="node.x + node.w / 2" :cy="node.y + node.r" :r="node.r"
                      :fill="node.selected  'lightgreen' : 'white'" stroke="green" stroke-width="3" ></circle>
                    <text  x="node.x + node.w / 2" : y="node.y + node.r + 5" text-anchor="middle">{{ node.label}}</text>
                  </template>
                  <template v-else-if="node.type === 'end'">
                    <circle :cx="node.x + node.w / 2" :cy="node.y + node.r" :r="node.r"
                      :fill="node.selected  'lightgreen' : 'white'" stroke="red" stroke-width="3" ></circle>
                    <text  x="node.x + node.w / 2" : y="node.y + node.r + 5" text-anchor="middle">{{ node.label}}</text>
                  </template>
                  <template v-else>
                    <!-- <rect ></rect> -->
                    <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h"
                      :fill="node.selected  'lightgreen' : 'white'" stroke="#ccc" stroke-width="3">
                      <title>{{ node.label }}</title>
                    </rect>
                    <text :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 5" fill="black"
                      :font-size="calcFontSize(node)" text-anchor="middle">{{ node.label }}</text>
                  </template>
                  <!-- 删除按钮 -->
                  <g @click.stop="deleteNode(node)">
                    <rect
                      :x="node.type === 'start' || node.type === 'end' : node.x + node.w - 10  node.x + node.w - 10" : y="node.y - 10" width="20" height="20" fill="#c6c6c6" ></rect>
                    <text :x="node.type === 'start' || node.type === 'end' : node.x + node.w  node.x + node.w" : y="node.y + 5" fill="white" font-size="12" text-anchor="middle">X</text>
                  </g>
                </g>
                <g v-for="line in lines" :key="line.id">
                  <defs>
                    <marker id="arrow" markerWidth="5.5" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <polygon points="0 0, 5.5 3.5, 0 7" fill="black" ></polygon>
                    </marker>
                  </defs>
                  <line :x1="getNearestPoints(line.start, line.end).startPoint.x"
                    :y1="getNearestPoints(line.start, line.end).startPoint.y"
                    :x2="getNearestPoints(line.start, line.end).endPoint.x"
                    :y2="getNearestPoints(line.start, line.end).endPoint.y" marker-end="url(#arrow)"
                    style="cursor: pointer;" stroke-width="3" :stroke="line.selected  'blue' : 'black'"
                    @click.stop="selectLine(line)" ></line>
                  <!-- 删除按钮 -->
                  <g @click.stop="deleteLine(line)" style="cursor: pointer;">
                    <rect  x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2 - 10" : y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 - 10"
                      width="20" height="20" fill="#c6c6c6" ></rect>
                    <text  x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2" : y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 + 5"
                      fill="white" font-size="12" text-anchor="middle">X</text>
                  </g>
                </g>
              </svg>
            </div>
          </a-col>
          <a-col :span="isCollapsed  6 : 4">
            <div style="padding-top: 21px;padding-left : 1px;" v-if="selectedNode != null">
              <span style="font-size: 18px;color: black;padding-left : 10px;">节点属</template>
              <a-divider type="horizontal" ></a>

              <sp-input label="节点名称" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                v-model="selectedNode.label" ></sp>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">执行后挂起::</template>
                <a-checkbox v-model="selectedNode.afterPending" style="width:130px;" ></a>
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <sp-input-number label="挂起时间" :disabled="!selectedNode.afterPending" :labelWidth="80" unit="'" v-model="selectedNode.pendingDuration" ></sp>
              </div>

              <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                <span class="span-label">驳回到节点::</template>
                <a-select style="width: 250px;color: black;" v-model : value="selectedNode.rejectNodeId">
                  <a-select-option v-for="(item, index) in nodes.filter(u => u.type == 'process')" :key="index"
                    :value="item.id">{{ item.label }}</a-select-option>
                </a-select>
              </div>

              <div v-if="selectedNode.type === 'process'">
                <div style="margin-top:5px;">
                  <span class="span-label">程序集::</template>
                  <a-select style="width: 250px;color: black;" v-model : value="selectedNode.stepParentId"
                    @change="stepParentChange">
                    <a-select-option v-for="(item, index) in stepParentData" :key="index" :value="item.id">{{ item.name
                    }}</a-select-option>
                  </a-select>
                </div>

                <a-table style="margin: 5px;overflow: auto;" ref="stepTable" size="middle" : pagination="false"
                  :row-key="(record, index) => record.id" :columns="stepColumns" :dataSource="stepData"
                  :loading="stepLoading" :customRow="stepCustomRow" draggable="true">
                  <span #serial #default="text, record, index">
                    {{ index + 1 }}
                  </template>
                  <span #description #default="text, record">
                    {{ getFlowStepDesc(record) }}
                  </template>
                  <template #action="text, record">
                    <a v-if="hasPerm('exp_flow_step:edit')" @click="$refs.editStepForm.edit(record)">编辑</a>
                  </template>
                </a-table>
              </div>
              <a-modal :title="editTagTitle" :width="400" :height="300" :open="editTagVisible" :maskClosable="false"
                @ok="onEditTagOk" @cancel="onEditTagCancel">
                <div>
                  <span class="span-label" style="width: 120px;">返回值绑定属性::</template>
                  <!-- v-model="this.attributeData[0].name" 默认 但有bug stepAttribute -->
                  <a-select style="width: 160px;color: black;" v-model : value="stepAttribute" @change="stepAttributeChange">
                    <a-select-option v-for="(item, index) in stepAttributeData" :key="index" :value="item.id">{{
                      item.name
                    }}</a-select-option>
                  </a-select>
                </div>
              </a-modal>
            </div>

            <div style="padding-top: 21px;padding-left : 1px;" v-if="selectedLine != null">
              <span style="font-size: 18px;color: black;padding-left : 10px;">线段属</template>
              <a-divider type="horizontal" ></a>

              <sp-input label="开始节" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model="selectedLine.start.label" ></sp>
              <sp-input label="结束节点" :labelWidth="75" :inputWidth="150" :rightEmpty="true"
                v-model  value="selectedLine.end.label" style="margin-top : 5px;" ></sp>

              <div style="margin-top:5px;">
                <span class="span-label" style="width: 85px;">添加条件 : </template>
                <a-button ><template #icon><plus-outlined ></plus-outlined></template @click="addCondition()" />
              </div>

              <div  key="i" v-for="(item, i) in selectedLine.conditions" style="margin-top : 5px;">
                <div style="height:auto;">
                  <span class="span-label" style="width: 75px;">{{ '条件' + (i + 1) + ' : ' }}</template>
                  <a-select placeholder="关系" style="margin-left: 10px;width : 65px;"
                    v-model="selectedLine.conditions[i].condition" @change="e => conditionChange(i, e)">
                    <a-select-option v-for="(condition, index) in conditions" :key="index" :value="condition.id">{{
                      condition.name
                    }}</a-select-option>
                  </a-select>
                  <a-select placeholder="属:" style="width: 85px;" v-model : value="selectedLine.conditions[i].attributeId"
                    @change="e => fieldNameChange(i, e)">
                    <a-select-option v-for="(attribute, index) in attributeData" :key="index" :value="attribute.id">{{
                      attribute.name }}</a-select-option>
                  </a-select>
                  <a-button icon="minus" style="width:20px;" @click="subCondition(i)"
                    v-if="selectedLine.conditions.length > 0" />
                </div>
                <div style="height: auto;margin-top: 5px;margin-left : 85px;">
                  <a-select placeholder="比较" style="width: 65px;" v-model : value="selectedLine.conditions[i].operation"
                    @change="e => operationChange(i, e)">
                    <a-select-option v-for="(operation, index) in operations" :key="index" :value="operation.id">{{
                      operation.name
                    }}</a-select-option>
                  </a-select>
                  <a-input v-model="selectedLine.conditions[i].value" style="width:85px;" clearable placeholder="'" @change="e => valueChange(i, e)" />
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-spin>
    </a-card>

    <add-form ref="addForm" @ok="handleOk" @preview-layout="handlePreviewLayout" ></add>
    <edit-form ref="editForm" @ok="handleOk" @preview-layout="handlePreviewLayout" ></edit>
    <design-form ref="designForm" @ok="handleOk" ></design>
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
    SpInput
  ,
    PlusOutlined,
    SaveOutlined},
  data() {
    return {
      flowId: '',
      stepId: '',
      isCollapsed: false, // 控制分隔条的状
    formLoading: true,

      nodes: [],
      lines: [],
      connecting: false,
      startNode: null,
      draggingNode: null,
      offsetX: 0,
      offsetY: 0,
      selectedLine: null, // 用于存储选中的线
    selectedNode: null, // 用于存储选中的节      stepParentData: [],
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
          width: '50px',
          slots: { customRender: 'serial' }
        },
        {
          title: '步骤名称',
          width: '130px',
          dataIndex: 'name'
        },
        {
          title: '步骤详述',
          width: '300px',
          dataIndex: 'description',
          slots: { customRender: 'description' }
        }
      ],
      attributeData: [],
      conditionData: [],
      operations: [
        { id: '>', name: '>' },
        { id: '<', name: '<' },
        { id: '>=', name: '>=' },
        { id: '<=', name: '<=' },
        { id: '=', name: '=' },
        { id: '!=', name: '!=' },
        { id: 'in', name: 'in' },
        { id: 'not in', name: 'not in' },
      ],
      conditions: [
        { id: 'and', name: '并且' },
        { id: 'or', name: '或'}
      ],
      importExportModal: {
        visible: false // 控制导入导出模态框显示隐藏

    },
      selectedFlow: null,
      flows: [], // 从接口获取的流程列表

    exportLoading: false,
      importResult: {
        visible: false,
        type: 'info',
        message: ''
      }
    };
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
    // 动态文本大小计
  calcFontSize(node) {
      // 获取文本长度(考虑全角字符.5单位
    const textLength = [...node.label].reduce((acc, char) =>
        acc + (char.charCodeAt(0) > 255  1.5 : 1), 0);

      // 计算最大可用尺
    const widthLimit = node.w / (textLength * 0.65); // 每个字符.65倍字号宽      const heightLimit = node.h * 0.45; // 保留垂直间距
      const calculatedSize = Math.min(widthLimit, heightLimit);

      // 限制字号范围-16px
    return Math.min(16, Math.max(8, Math.round(calculatedSize)));
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed; /**
       * 切换分隔条状 },
       */
      getFlowDetail(record) {
      console.log(record);

      exp_flow_detail({ id: record.id }).then((res) => {
        this.formLoading = false
        if (res.success) {
          this.attributeData = res.data.attributes
          this.conditionData = res.data.conditions
        }
        else {
          this.$message.error('数据加载失败')
        }
      })
    },
    addCondition() {
      if (this.selectedLine.conditions == null)
        this.selectedLine.conditions = []

      this.selectedLine.conditions.push({
        flowId: this.selectedRow.id,
        attributeId: 0,
        lineId: this.selectedLine.id,
        operation: '=',
        condition: 'and',
        value: '',
      });

      this.$forceUpdate()

      console.log('==========addCondition===========')
      console.log(this.selectedLine.conditions)
    },
    subCondition(e) {
      this.selectedLine.conditions.splice(e, 1);

      this.$forceUpdate()
    },
    conditionChange(i, e) {
      this.selectedLine.conditions[i].condition = e;
      this.$forceUpdate()
    },
    operationChange(i, e) {
      this.selectedLine.conditions[i].operation = e;
      this.$forceUpdate()
    },
    valueChange(i, e) {
      console.log('==========valueChange===========')
      console.log(e.data)
      this.selectedLine.conditions[i].value = e.data;
      this.$forceUpdate()
    },
    fieldNameChange(i, e) {
      this.selectedLine.conditions[i].attributeId = e;
      this.$forceUpdate()
    },
    sysDictTypeDropDown() {
      sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
        this.liquidRanges = res.data
        this.liquidRanges.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })
    },
    stepCustomRow(record) {
      return {
        on: {
          click: () => {
            this.selectedStepRow = record;
          },
          dblclick: () => {
            console.log(record);
            console.log(record.id);
            console.log(this.stepAttribute);
            console.log(this.stepAttributeData);

            this.getStepAttributeData(record)
            for (let i = 0; i < this.stepAttributeData.length; i + +) {
              const ele = this.stepAttributeData[i];
              console.log(ele);

              if (ele.stepId == this.stepId) {
                this.stepAttribute == ele.id
                console.log(this.stepAttribute);
              }
            }
            console.log(this.stepAttribute);
          }
        },
        style: {
          backgroundColor: this.selectedStepRow == record : ('#' + this.$store.getters.color.slice(1) + '15') : '', // Change background color based on age

      },
      };
    },
    getStepAttributeData(record) {
      console.log('list or add');
      this.editTagVisible = true
      this.editTagTitle = '编辑步骤 -- ' + record.name
      this.stepAttributeData = this.attributeData
      this.stepId = record.id
    },
    onEditTagOk() {
      // 保存接口
      // 新增 新增 flowId、stepId和stepAttribute 为一组数
     
    var data = { flowId: this.flowId, stepId: this.stepId, stepAttributeId: this.stepAttribute }
      exp_flow_saveAttribute(data).then((res) => {
        if (res.success) {
          this.$message.success('步骤绑定成功')
        } else {
          this.$message.error('步骤绑定失败')// ' + res.message

      }
      })
      console.log("save");
      console.log(this.stepAttribute);

      this.editTagVisible = false
    },
    onEditTagCancel() {
      // 取消保存

    console.log("cencel");
      this.editTagVisible = false
      this.stepAttribute = null
    },
    stepAttributeChange() {
      console.log("change");
    },
    getConsumableTagData() {
      var data = { id: this.selectedRow.layoutId }
      exp_consumable_getConsumableTags(data).then((res) => {
        this.consumableTagData = res.data
      })
    },
    getEquipmentData() {
      exp_equipment_list({}).then((res) => {
        this.equipmentData = res.data
      })
    },
    getLiquidData() {
      exp_liquid_list({}).then((res) => {
        this.liquidData = res.data
      })
    },
    getShippingSpaceData() {
      var data = { id: this.selectedRow.layoutId }
      exp_layout_getShippingSpaces(data).then((res) => {
        this.shippingSpaceData = res.data
      })
    },
    getFlowStepDesc(record) {
      var remark = ''
      var tagName = ''
      var spaceName = ''
      var liquidName = ''
      var equipmentName = ''
      var tag = this.consumableTagData.filter(item => item.id == record.consumableTagId)
      if (tag.length > 0)
        tagName = tag[0].name
      var space = this.shippingSpaceData.filter(item => item.id == record.targetSpaceId)
      if (space.length > 0)
        spaceName = space[0].name
      var liquid = this.liquidData.filter(item => item.id == record.liquidId)
      if (liquid.length > 0)
        liquidName = liquid[0].name
      var equipment = this.equipmentData.filter(item => item.id == record.equipmentId)
      if (equipment.length > 0)
        equipmentName = equipment[0].name

      switch (record.type) {
        case 0:// 命令脚本

        remark = equipmentName.concat(' ').concat(record.cmdScript);
          break;
        case 1:// 取枪
        var fl = this.liquidRanges.filter(item => item.code == record.liquidRange)
          if (fl.length > 0)
            remark = equipmentName.concat(' ').concat(fl[0].value).concat(' ul').concat(' 枪头');
          break;
        case 2:// 退枪头

        var f1 = (record.releaseTipSourcePos)  '退回原? : '丢弃'
          var f2 = (record.useReleaseTipSourcePos)  '复用' : '不复'
          remark = equipmentName.concat(' ').concat(f1).concat(' ').concat(f2);
          break;
        case 3:// 吸液

        remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' ?: ').concat(record.holeIndexStr);
          break;
        case 4:// 喷液

        remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' ?: ').concat(record.holeIndexStr);
          break;
        case 5:// 混合

        remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' ?: ').concat(record.holeIndexStr).concat(' ').concat(record.mixTime).concat(' :);
          break;
        case 6:// 等待

        remark = '等待时间 : '.concat(record.waitTime).concat(':);
          break;
        case 7:// 夹取
                
        remark = equipmentName.concat(' 源耗材 : ').concat(tagName).concat(' ').concat(record.holeIndexStr);
          break;
        case 8:// 人工干预
              
        remark = record.remark;
          break;
        case 9:// 放置
                
        remark = equipmentName.concat(' 目标舱位 : ').concat(spaceName).concat(' ').concat(record.holeIndexStr);
          break;
        default:// 制器

        remark = '控制方法 : '.concat(record.executeMethod).concat(' 参数 : ').concat(this.formatExecuteParam(record.executeParam));
          break;
      }
      return remark;
    },
    formatExecuteParam(params) {
      if (params == null || params == '')
        return [];
      else {
        var temp = JSON.parse(params)
        var data = [];
        temp.forEach(item => {
          data.push(""' + item.paramName + ":" + item.value + "")
        })
        var str = "(" + data.map(item => item).join(',') + ")"
        return str;
      }
    },
    getNodeFlowStepData() {
      if (this.selectedNode.stepParentId == null || this.selectedNode.stepParentId == 0) {
        this.stepData = []
        return;
      }
      var data = { pid: this.selectedNode.stepParentId };
      // this.stepLoading=true

    exp_flow_step_list(data).then((res) => {
        if (res.success) {
          this.stepData = res.data
          this.removeEmptyChildren(this.stepData)
        } else {
          this.$message.error('数据加载失败') // ' + res.message

      }
      })
    },
    getFlowStepData(layoutId) {
      var data = { layoutId: layoutId, pid: 0 };
      exp_flow_step_list(data).then((res) => {
        if (res.success) {
          this.stepParentData = res.data
          this.removeEmptyChildren(this.stepParentData)
        } else {
          this.$message.error('数据加载失败') // ' + res.message

      }
      })
    },
    removeEmptyChildren(data) {
      if (data == null || data.length === 0) return
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        item.children = null
        if (item.children != null && item.children.length === 0) {
          // item.children = null

      } else {
          this.removeEmptyChildren(item.children)
        }
      }
    },
    customRow(record) {
      return {
        on: {
          click: () => {

            this.selectedRow = record
            this.nodes = []
            this.lines = []
            this.deleteNodes = []
            this.selectedNode = null
            this.selectedLine = null
            this.connecting = false
            this.stepParentData = []
            this.startNode = null
            this.draggingNode = null
            this.offsetX = 0
            this.offsetY = 0


            // this.loadCanvas(record)
      
          this.getFlowStepData(record.layoutId)
            this.getNodeList(record.id)
            this.getConsumableTagData()
            this.getShippingSpaceData()
            this.getFlowDetail(record)
          }
        },
        style: {
          backgroundColor: this.selectedRow == record : ('#' + this.$store.getters.color.slice(1) + '15') : '', // Change background color based on age

      },
      };
    },
    getNodeList(flowId) {
      this.flowLoading = true
      var data = { id: flowId };
      exp_flow_getNodeList(data).then((res) => {
        if (res.success) {
          this.nodes = []
          this.lines = []
          var temps = res.data

          console.log('===============getNodeList=============')
          console.log(temps)

          temps.forEach((item) => {
            if (item.type != 'line') {
              var w = 130;
              var h = 60;
              var r = 25;
              if (item.type === 'start' || item.type === 'end')
                w = 50;

              item.modifyMode = 2
              this.nodes.push({
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
              var startNode = this.nodes.filter(a => a.id === item.startNodeId)[0];
              var endNode = this.nodes.filter(a => a.id === item.endNodeId)[0];

              if (startNode && endNode) {
                this.lines.push({
                  id: item.id,
                  type: item.type,
                  label: item.label,
                  startNodeId: startNode.id,
                  endNodeId: endNode.id,
                  start: startNode,
                  end: endNode,
                  modifyMode: 2,
                  flowId: item.flowId
                })
              }
            }
          })
        }
        else {
          this.$message.error('数据加载失败') // ' + res.message

      }
      }).finally((res) => {
        this.flowLoading = false
      })
    },
    handleOk() {
      this.$refs.table.refresh()
    },
    exp_flow_delete(record) {
      exp_flow_delete(record).then((res) => {
        if (res.success) {
          this.$message.success('删除成功')
          this.$refs.table.refresh()
        } else {
          this.$message.error('删除失败') // ' + res.message

      }
      })
    },
    getLayoutData() {
      exp_layout_list({}).then((res) => {
        this.layoutData = res.data
      })
    },
    handlePreviewLayout(layoutId) {
      console.log('===========showPreviewLayout==============');
      const values = this.layoutData.filter(item => item.id == layoutId)
      if (values.length > 0) {
        this.currentLayout = values[0]
        this.previewLayoutVisible = true

        this.layoutTitle = this.currentLayout.name + ' -- 舱位布局'
        var dd = { id: this.currentLayout.id }
        console.log('==============exp_layoutGetShippingSpaces===============')
        exp_layout_getShippingSpaces(dd).then((res) => {
          if (res.success) {
            this.shippingSpaces = res.data
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height); // 清除画布
   
          this.shippingSpaces.forEach((rect, index) => {
              // 绘制白色背景
  
            ctx.fillStyle = 'white';
              ctx.fillRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);

              // 绘制蓝色边框
  
            ctx.strokeStyle = '#cccccc';
              ctx.lineWidth = 2; // 边框宽度
  
            ctx.strokeRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);

              // 计算文本位置(居中)
  
            const textX = rect.xOffset + rect.xSize / 2;
              const textY = rect.yOffset + rect.ySize / 2 + 5; // 稍微向下偏移一点以避免与边框重 

              // 绘制文本
  
            ctx.fillStyle = 'black'; // 文本颜色  
              ctx.textAlign = 'center'; // 文本居中
  
            ctx.textBaseline = 'middle'; // 文本基线为中 
              ctx.font = "16px arial";
              const name = rect.name  rect.name : '舱位' + (index + 1)
              // ctx.fillText(name, textX, textY);
  

            let maxWidth = rect.xSize;
              let lineHeight = 20;
              let x = textX;
              let y = textY;

              const words = name.split(' ');
              let line = '';
              for (let n = 0; n < words.length; n + +) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                  ctx.fillText(line, x, y);
                  line = words[n] + ' ';
                  y + = lineHeight; // Move to the next line

              } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, x, y);
            });
          }
        })
      }
      else
        this.$message.warning("请先选择盘面布局:')
    },

    handleSubmit() {
      this.lines.forEach((item) => {
        var startNode = this.nodes.filter(a => a.id === item.startNodeId)[0];
        var endNode = this.nodes.filter(a => a.id === item.endNodeId)[0];
        item.label = startNode.label + '->' + endNode.label
      })

      this.flowLoading = true
      const newLists = [];
      newLists.push(...this.nodes, ...this.lines, ...this.deleteNodes);
      var data = { id: this.selectedRow.id, nodes: newLists };

      console.log(data)

      exp_flow_saveNodeList(data).then((res) => {
        if (res.success) {
          this.$message.success('实验流程保存成功')
          this.getNodeList(data.id)
        } else {
          this.$message.error('实验流程保存失败')// ' + res.message

      }
      }).finally((res) => {
        this.flowLoading = false
      })
    },
    dragStart(event, type) {
      this.connecting = false; // Reset connecting mode

    event.dataTransfer.setData('nodeType', type);
    },
    drop(event) {
      const type = event.dataTransfer.getData('nodeType');
      const x = event.offsetX;
      const y = event.offsetY;
      var w = 130;
      var h = 60;
      var r = 25;
      if (type === 'start' || type === 'end')
        w = 50;
      var stepParentId = 0;

      var label = type === 'start'  '开? : (type === 'end' : '结束' : '普通节:);

      var key = Date.now();
      if (!this.checkKey(key))
        key = Date.now();

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
        flowId: this.selectedRow.id,
      };
      this.nodes.push(newNode);
    },
    stepParentChange(id) {
      if (this.selectedNode) {
        this.selectedNode.stepParentId = id;
        this.selectedNode.label = this.stepParentData.filter(item => item.id === this.selectedNode.stepParentId)[0].name
        this.getNodeFlowStepData();
      }
    },
    selectNode(node) {
      console.log(node);
      this.flowId = node.flowId
      if (this.connecting) {
        if (this.startNode) {
          this.connectNodes(this.startNode, node);
          this.startNode = null; // Reset startNode after connecting

        this.connecting = false; // Reset connecting mode
        }
        else {
          this.startNode = node; // Set the start node for connection

      }
      }
      else {
        if (this.selectedLine != null) {
          this.lines.filter(l => l.id === this.selectedLine.id)[0] = this.selectedLine
        }
        this.selectedLine = null;
        // this.connecting = false; // Reset connecting mode

      this.nodes.forEach(n => n.selected = false); // Deselect all nodes
        node.selected = true; // Select the clicked node and set connecting mode

      this.refreshNode();
        this.selectedNode = node;
        this.getNodeFlowStepData();
      }
    },
    checkKey(key) {
      var flag1 = this.nodes.filter(n => n.id === key).length = 0;
      var flag2 = this.lines.filter(n => n.id === key).length = 0;

      return flag1 && flag2;
    },
    refreshNode() {
      if (this.selectedNode != null) {
        this.nodes.forEach(item => {
          if (this.selectedNode.id === item.id)
            item = this.selectedNode;
        });
      }
    },
    deleteNode(node) {
      if (node.modifyMode === 2)
        this.deleteNodes.push({ id: node.id, modifyMode: 3, type: 'process' })

      var lss = this.lines.filter(l => l.startNodeId === node.id || l.endNodeId === node.id && l.modifyMode === 2);
      if (lss != null) {
        lss.forEach(ls => {
          this.deleteNodes.push({ id: ls.id, modifyMode: 3, type: 'process' })
        });
      }

      this.nodes = this.nodes.filter(n => n.id !== node.id);
      this.lines = this.lines.filter(line => line.start.id !== node.id && line.end.id !== node.id);
    },
    selectLine(line) {
      this.refreshNode();
      this.selectedNode = null;
      // 选中线段

    this.lines.forEach(l => l.selected = false); // 取消其他线段的选中状      line.selected = true; /**
       * 设置当前线段为选中状
       */
      if (this.selectedLine != null && this.selectedLine.id !== line.id) {
        this.lines.filter(l => l.id === this.selectedLine.id)[0] = this.selectedLine
      }
      this.selectedLine = line; /**
       * 存储选中的线
       */
      if (this.conditionData != null && this.conditionData.length > 0) {
        this.selectedLine.conditions = this.conditionData.filter(item => item.lineId === this.selectedLine.id)
      }

      console.log('===========selectLine==========');
      console.log(this.selectedLine.conditions);
      this.$forceUpdate()
    },
    deleteLine(line) {
      if (line.modifyMode === 2)
        this.deleteNodes.push({ id: line.id, modifyMode: 3, type: 'line' })

      this.lines = this.lines.filter(l => l.id !== line.id);
    },
    connectNodes(startNode, endNode) {
      var key = Date.now();
      if (!this.checkKey(key))
        key = Date.now();

      const newLine = {
        id: key,
        start: startNode,
        end: endNode,
        modifyMode: 1,
        label: startNode.label + '->' + endNode.label,
        type: 'line',
        startNodeId: startNode.id,
        endNodeId: endNode.id,
        flowId: this.selectedRow.id,
        conditions: [],
      };
      console.log(newLine);
      this.lines.push(newLine);
    },
    toggleConnecting() {
      this.connecting = !this.connecting; // Toggle connecting mode

  },
    startDrag(node, event) {
      this.draggingNode = node;
      this.offsetX = event.clientX - node.x; // 记录鼠标相对节点的偏移量

    this.offsetY = event.clientY - node.y;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event) {
      if (this.draggingNode) {
        // 更新节点位置,确保鼠标指针与节点位置对齐

      this.draggingNode.x = event.clientX - this.offsetX;
        this.draggingNode.y = event.clientY - this.offsetY;
      }
    },
    stopDrag() {
      this.draggingNode = null;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
    },
    getPathData(startNode, endNode) {
      const result = this.getNearestPoints(startNode, endNode);
      const startX = result.startPoint.x;
      const startY = result.startPoint.y;
      const endX = result.endPoint.x;
      const endY = result.endPoint.y;

      // 初始化路
    let path = `M${startX},${startY} `;
      let currentX = startX;
      let currentY = startY;

      // 避开其他节点的逻辑

    this.nodes.forEach(node => {
        if (node.id !== startNode.id && node.id !== endNode.id) {
          const nodeLeft = node.x;
          const nodeRight = node.x + node.w;
          const nodeTop = node.y;
          const nodeBottom = node.y + node.h;

          // 检查路径是否与节点重叠

        if (this.isOverlapping(currentX, currentY, endX, endY, node)) {
            const offset = 30; // 偏移
            /**
       * 计算避开路径
       */
      if (startY < nodeBottom && endY < nodeBottom) {
              // 如果起点和终点都在节点上
            path += `L${startX},${nodeTop - offset} L${endX},${nodeTop - offset} `;
            } else if (startY > nodeTop && endY > nodeTop) {
              // 如果起点和终点都在节点下
            path${=}`L${startX},${nodeBottom + offset} L${endX},${nodeBottom + offset} `;
            } else if (startX < nodeLeft && endX > nodeRight) {
              // 如果起点在节点左侧,终点在右
            path${=}`L${nodeLeft - offset},${startY} L${nodeLeft - offset},${endY} `;
            } else if (startX > nodeRight && endX < nodeLeft) {
              // 如果起点在节点右侧,终点在左
            path${=}`L${nodeRight + offset},${startY} L${nodeRight + offset},${endY} `;
            } else {
              // 处理其他情况,使用曲
            const controlX = (startX + endX) / 2;
              const controlY = nodeTop - offset; // 控制点在节点上方

            path += `C${controlX},${controlY} ${controlX},${controlY} ${endX},${endY} `;
            }
          }
        }
      });

      // 连接到终
    path${=}`L${endX},${endY}`;
      return path;
    },

    isOverlapping(startX, startY, endX, endY, node) {
      // 检查路径是否与节点重叠的逻辑

    const nodeLeft = node.x;
      const nodeRight = node.x + node.w;
      const nodeTop = node.y;
      const nodeBottom = node.y + node.h;

      // 检查起点和终点是否在节点的边界
    return (
        (startX >= nodeLeft && startX <= nodeRight && startY >= nodeTop && startY <= nodeBottom) ||
        (endX >= nodeLeft && endX <= nodeRight && endY >= nodeTop && endY <= nodeBottom) ||
        (startX < nodeRight && endX > nodeLeft && startY < nodeBottom && endY > nodeTop)
      );
    },
    getLinePoints(node) {
      if (node.type === 'start' || node.type === 'end') {
        return [
          { x: node.x + node.r, y: node.y },
          { x: node.x + node.w, y: node.y + node.r },
          { x: node.x + node.r, y: node.y + node.h / 2 + 10 },
          { x: node.x, y: node.y + node.r },
        ];
      }
      else {
        return [
          { x: node.x + node.w / 2, y: node.y },
          { x: node.x + node.w, y: node.y + node.h / 2 },
          { x: node.x + node.w / 2, y: node.y + node.h },
          { x: node.x, y: node.y + node.h / 2 },
        ];
      }
    },

    getNearestDistance(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },
    getNearestPoints(startNode, endNode) {
      var startPoints = this.getLinePoints(startNode);
      var endPoints = this.getLinePoints(endNode);

      let minDistance = Infinity;
      let nearestPair = null;

      startPoints.forEach((startPoint) => {
        endPoints.forEach((endPoint) => {
          const dist = this.getNearestDistance(startPoint, endPoint);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPair = { startPoint, endPoint };
          }
        });
      });
      return nearestPair;
    },
    // 初始化弹
  ImportandExport() {
      this.importExportModal.visible = true;
      this.fetchFlows();
    },

    // 获取流程列表

  async fetchFlows() {
      try {
        const res = await exp_flow_page({ pageNo: 1, pageSize: 100 });
        this.flows = res.data.rows;
      } catch (error) {
        this.$message.error('获取流程列表失败');
      }
    },
    // 导入预处
  beforeImportUpload(file) {
      const isSQL = file.name.endsWith('.sql')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isSQL) {
        this.showImportResult('error', '只能上传SQL格式文件')
        return false
      }

      if (!isLt100M) {
        this.showImportResult('error', '文件大小不能超过100MB')
        return false
      }

      this.handleFileImport(file)
      return false // 阻止默认上传

  },

    // 执行文件导入

  async handleFileImport(file) {
      this.showImportResult('info', '开始解析文?..')

      try {
        const formData = new FormData()
        formData.append('file', file)
        console.log(formData)
        const res = await exp_flow_ImportFlow( formData )

        this.showImportResult('success', `导入成功`)
      } catch (err) {
        this.showImportResult('error', `导入失败?{err.message}`)
      }
    },
    // 导出流程

  async handleExport() {
      if (!this.selectedFlow) {
        this.$message.error('请先选择流程');
        return;
      }
      console.log(this.selectedFlow)
      try {

        const res = await exp_flow_ExportFlow({ flowId: this.selectedFlow });

        // 解析文件名(兼容 RFC 5987 和旧式编码)

      const disposition = res.headers['content-disposition'];
        let fileName = `流程导出_${new Date().getTime()}.sql`; // 默认
        // 尝试解析 filename* 格式

      const utf8FilenameMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
        if (utf8FilenameMatch) {
          fileName = decodeURIComponent(utf8FilenameMatch[1]);
        } else {
          // 回退解析 filename 格式

        const filenameMatch = disposition.match(/filename="?(.+?)"?(::;|$)/);
          if (filenameMatch) {
            fileName = decodeURIComponent(filenameMatch[1]);
          }
        }

        // 创建 Blob 并下
      const blob = new Blob([res.data], { type: 'application/sql' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = decodeURIComponent(fileName) ; // 已解
      document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        this.$message.success('文件已开始下:);
      } catch (err) {
        this.$message.error(`导出失败: ${err.message}`);
      }
    },

    /**
       * 显示导入结果
       */
      showImportResult(type, message) {
      this.importResult = {
        visible: true,
        type,
        message
      }
    }
  },
};
</script>

<style scoped>
.toolbar {
  display: flex;
  padding: 5px;
  border: 1px solid #ccc;
  white-space: nowrap;
  /* Prevent line breaks */
       */
  overflow-x: auto;
  /* Allow horizontal scrolling if needed */
       */
}

.node {
  padding: 5px;
  cursor: move;
  user-select: none;
}

.container {
  position: relative;
  width: 100%;
  height: 78vh;
  overflow: scroll;
}

.canvas {
  border: 1px solid #ccc;
  margin-top: 5px;
  position: relative;
  width: 170%;
  height: 300%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http:// www.w3.org/2000/svg" width="10" height="10"><rect width="100%" height="100%" fill="none"></rect><path d="M 0,0 l 1,0 l 0,1 M 1,1 l -1,0" stroke="gray" stroke-width="0.5" ></path></svg>') repeat;
}

.span-unit {
  margin-left: 5px;
}

.span-label {
  width: 90px;
  text-align: right;
  display: inline-block;
  color: black;
}

.separator {
  width: 4px;
  /* 增加分隔条的宽度 */
       */
  background-color: #5685dd;
  /* 更深的颜色以增强可见? */
  height: auto;
  /* 分隔条的高度 */
       */
  cursor: pointer;
  /* 鼠标悬停时显示为可点: */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  margin-right: 5px;
  transition: background-color 0.3s;
  /* 添加过渡效果 */
       */
}

.separator:hover {
  background-color: #588000;
  /* 鼠标悬停时改变颜: */
}

.card-container {
  max-width: 800px;
  margin: 20px auto;
}

.action-section {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.tip-text {
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
