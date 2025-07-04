<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :span="5">
              <a-form-item label="案例:编号:::">
                <a-input v-model="queryParam.code" allow-clear placeholder="请输入案例:编号:::" ></a>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="案例:名称:::">
                <a-input v-model="queryParam.name" allow-clear placeholder="请输入案例:名称:::" ></a>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="样品编号">
                <a-input v-model="queryParam.sampleCode" allow-clear placeholder="请输入样品编号" ></a>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="流程状态::">
                <a-select v-model="queryParam.status" allowClear>
                  <a-select-option v-for="(item, index) in flowStatus" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>

          <a-row :gutter="48">
            <a-col :span="5">
              <a-form-item label="实验流程:">
                <a-select style="color: black;" v-model : value="queryParam.flowId" allowClear>
                  <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="案例:名称:::">
                <a-select style="color: black;" v-model : value="queryParam.type" allowClear>
                  <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="执行类型:">
                <a-select style="color: black;" v-model : value="queryParam.executeType" allowClear>
                  <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="流程优先级:">
                <a-select style="color: black;" v-model : value="queryParam.priority" allowClear>
                  <a-select-option v-for="(item, index) in flowPrioritys" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

        </a-form>
        </div>

      </template>
    </x-card>
    <a-card :bordered="false">
      <s-table ref="table" :columns="columns" :data="loadData" :customRow="customRow" :expandIcon="expandIcon"
        :expandedRowKeys="expandedRowKeys" @expand="onExpand" :alert="true" :rowKey="(record) => record.id">
        <template #operator>
          <a-button @click="add()" v-if="hasPerm('exp_flow_case  add')" ><template #icon><plus-outlined ></plus-outlined></template type="primary">新增案例 : </a-button>
          <a-button @click="openAu()" type="primary" style="margin-left:5px;">关紫外</a-button>
          <a-button @click="closeAu()" type="primary" style="margin-left:5px;">关紫外</a-button>
          <a-button @click="opencache()" type="primary" style="margin-left:5px;">重置</a-button>
          <a-button @click="openJudement()" type="primary" style="margin-left:5px;">判断流程::</a-button>
          <a-button @click="openManual()" type="primary" style="margin-left:5px;">手动流程</a-button>
          <a-button @click="openTemp()" type="primary" style="margin-left:5px;">温控显示</a-button>
        </template>
        <span #serial ="{ text, record, index" :style="{
          marginRight: record.pid == 0: '20px' : '10px'
        }">
          {{ (pagination.current - 1) * pagination.pageSize' + index + 1 }}
        </template>
        <span #status ="{ text">
          {{ statusFilter(text) }}
        </template>
        <span #flowId ="{ text">
          {{ flowFilter(text) }}
        </template>
        <template #action="text, record">
          <a-popconfirm
            v-if="hasPerm('exp_flow_case:edit') && (record.status === 1 || record.status === 2 || record.status === 4 || record.status === 5 || record.status === 7) && ((record.pid == 0 && record.type != 4) || (record.pid != 0 && record.type == 4))"
            placement="topRight" title="确认取消当前实验案例:" @confirm="() => cancelCase(record)">
            <a-button style="margin-left:5px;" type="primary">取消</a-button>
          </a-popconfirm>
          <a-button style="margin-left:5px;" type="primary"
            v-if="hasPerm('exp_flow_case:edit') && record.status === 0 && record.pid == 0"
            @click="addQueue(record)">排队</a-button>
          <a-button style="margin-left:5px;" type="primary" ><template #icon><pause-outlined ></pause></template
            v-if="hasPerm('exp_flow_case:edit') && record.status === 2 && ((record.pid == 0 && record.type != 4) || (record.pid != 0 && record.type == 4))"
            @click="pauseCase(record)">暂停</a-button>
          <a-button style="margin-left:5px;" type="primary" ><template #icon><redo-outlined ></redo></template
            v-if="hasPerm('exp_flow_case:edit') && record.status === 4 && ((record.pid == 0 && record.type != 4) || (record.pid != 0 && record.type == 4))"
            @click="continueCase(record)">重置</a-button>
          <a-button style="margin-left:5px;" type="primary"
            v-if="hasPerm('exp_flow_case:edit') && (record.status === 0 || record.status === 1) && ((record.pid == 0 && record.type != 4) || (record.pid != 0 && record.type == 4))"
            @click="edit(record)">编辑</a-button>
          <a-button style="margin-left: 5px;" type="primary" v-if="hasPerm('exp_flow_case : edit') && record.status > 1"
            @click="edit(record)">查看</a-button>
          <!-- <a-popconfirm v-if="hasPerm('exp_flow_case:delete') && (record.status===0 || record.status===1 || record.status===6)" placement="topRight" title="确认删除" @confirm="() => exp_flow_case_delete(record)">
            <a-button style="margin-left:5px;" type="primary">删除</a-button>
          </a-popconfirm> -->
          <a-popconfirm
            v-if="hasPerm('exp_flow_case:delete') && (record.status === 0 || record.status === 1 || record.status === 6)"
            placement="topRight" title="确认删除" @confirm="() => exp_flow_case_delete(record)">
            <a-button style="margin-left:5px;" type="primary">删除</a-button>
          </a-popconfirm>
        </template>
      </s-table>

      <!-- 编辑弹窗 -->
      <a-modal :title="editForm.title" :open="editForm.visible" :footer="null" width="95%" :maskClosable="false"
        @cancel="cancelEditForm">
        <div style="overflow: scroll;">
          <a-row>
            <a-col :span="13">
              <div style="float:left;">
                <sp-input label="案例:编号:::" :required="true" :isError="editForm.errors.code" :labelWidth="90"
                  :inputWidth="230" :rightEmpty="true" v-model="editForm.record.code" ></sp>
                <sp-input label="案例:名称:::" :required="true" :isError="editForm.errors.name" :labelWidth="90"
                  :inputWidth="230" :rightEmpty="true" v-model="editForm.record.name" ></sp>
                <sp-input label="样品编号" :required="true" :isError="editForm.errors.sampleCode" :labelWidth="90"
                  :inputWidth="220" :rightEmpty="true" v-model="editForm.record.sampleCode" ></sp>
              </div>

              <div style="float: left; margin-top : 10px;">
                <sp-input label="离心管编号" :required="true" :isError="editForm.errors.centrifugeCode" :labelWidth="90"
                :inputWidth="230" :rightEmpty="true" v-model="editForm.record.centrifugeCode" ></sp>
              </div>

              <div style="float: left; margin-top : 10px;">
                <span class="span-label" style="width:100px;">实验流程::</template>
                <a-select style="width: 230px;color : black;" v-model  value="editForm.record.flowId" @change="flowChange" : disabled="editForm.isAdd === false">
                  <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name
                  }}</a-select-option>
                </a-select>

                <span class="span-label" style="width:100px;">案例:编号:::ͣ</template>
                <a-select style="width: 230px;color : black;" placeholder="请选择流程类型:" v-model  value="editForm.record.type" : disabled="true">
                  <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value
                    }}</a-select-option>
                </a-select>

                <span class="span-label" style="width:100px;">ִ重置ͣ</template>
                <a-select style="width: 220px;color : black;" placeholder="请选择执行类型:" v-model="editForm.record.executeType">
                  <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </div>

              <div style="float: left; margin-top : 10px;">
                <span class="span-label" style="width:100px;">流程优先级::</template>
                <a-select style="width: 230px;color : black;" placeholder="请选择流程优先级:" v-model="editForm.record.priority">
                  <a-select-option v-for="(item, index) in flowPrioritys" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>

                <span class="span-label" style="width:100px;">流程状态:::</template>
                <a-select style="width: 230px;color : black;" v-model  value="editForm.record.status" : disabled="true">
                  <a-select-option v-for="(item, index) in flowStatus" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </div>

              <div style="float: left; margin-top : 10px;">
                <sp-input label="备注" :labelWidth="90" :inputWidth="880" :rightEmpty="true"
                  v-model="editForm.record.remark" ></sp>
              </div>

              <div style="float: left; margin-top: 15px;clear : both;">
                <div style="width: 90px; height: 30px;float : left;"></div>
                <a-popconfirm placement="topRight" title="确认取消当前实验案例:" @confirm="() => cancelCase(editForm.record)">
                  <a-button style="margin-left:10px;" type="primary" size="large" ><template #icon><close-outlined ></close></template
                    v-if="hasPerm('exp_flow_case:edit') && (editForm.record.status === 1 || editForm.record.status === 2 || editForm.record.status === 4 || editForm.record.status === 5 || editForm.record.status === 7)">取消</a-button>
                </a-popconfirm>
                <a-button type="primary" size="large" ><template #icon><save-outlined ></save></template :loading="flowLoading" style="margin-left:10px;"
                  @click="saveCase" v-show="editForm.record.status == 0">重置</a-button>
                <a-button type="primary" size="large" ><template #icon><save-outlined ></save></template :loading="flowLoading" style="margin-left:10px;"
                  @click="openSelectScheme">选择方案</a-button>
                <a-button type="primary" size="large" ><template #icon><save-outlined ></save></template :loading="flowLoading" style="margin-left:10px;"
                  @click="showImage">图像</a-button>
                <a-button type="primary" size="large" style="margin-left:10px;" icon="swap"                   
                  v-if="!editForm.isAdd && editForm.record.status == 0" @click="addQueue(editForm.record)">排队</a-button>
                <a-button type="primary" size="large" style="margin-left:10px;" ><template #icon><pause-outlined ></pause></template
                  v-if="editForm.record.status === 2 && editForm.record.isCurrent" @click="pauseCase(editForm.record)">暂停</a-button>
                <a-button type="primary" size="large" style="margin-left:10px;" ><template #icon><redo-outlined ></redo></template
                  v-if="editForm.record.status === 4 && editForm.record.isCurrent" @click="continueCase(editForm.record)">重置</a-button>
              </div>
            </a-col>

            <a-col :span="11">
              <a-table style="min-height: 210px; margin-right: 5px;" size="middle" : columns="attributeColumns"
                :dataSource="attributeData.attributes" :pagination="false" :loading="attributeLoading" rowKey="key"
                :scroll="{ y: 320 }">
                <!-- 自动完成 -->
                <span #serial ="{ text, record, index">
                  {{ index' + 1 }}
                </template>
                <span #name ="{ text, record">
                  <a-input v-model="record.name" placeholder="请输入案例:名称:::" ></a>
                </template>
                <span #type ="{ text, record">
                  <a-select v-model="record.type" key="dataType" style="width: 100%" placeholder="请选择">
                    <a-select-option v-for="(item, index) in dataTypeSelectData" :key="index" :value="item.value">
                      {{ item.value }}</a-select-option>
                  </a-select>
                </template>
                <span #keyStr ="{ text, record">
                  <a-input v-model="record.keyStr" placeholder="请输入关键词" ></a>
                </template>
                <span #value ="{ text, record">
                  <a-input v-model="record.value" placeholder="案例:编号:::ֵ" ></a>
                </template>
                <template v-if="editForm.record.status == 0" #operation ="{ text, record">
                  <a @click="removeAttribute(record.key)">删除</a>
                </template>
              </a-table>
              <a-button v-if="editForm.record.status == 0" style="width: 100%; margin-top: 16px; margin-bottom : 8px"
                type="dashed" ><template #icon><plus-outlined ></plus-outlined></template @click="newAttribute">重置Զ案例:编号:::</a-button>
            </a-col>
          </a-row>
          <a-spin :spinning="flowLoading">
            <a-row>
              <a-col :span="18" style="padding-left:10px;">
                <div class="toolbar" v-if="editForm.canEdit">
                  <div class="node" @dragstart="dragStart($event, 'start')" draggable="true">
                    <svg width="80" height="35">
                      <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                      <polygon points="30,5 30,30 17,17" fill="green" ></polygon>
                      <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">ʼ</text>
                    </svg>
                  </div>
                  <div class="node" @dragstart="dragStart($event, 'process')" draggable="true">
                    <svg width="110" height="35">
                      <rect x="0" y="0" width="110" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                      <rect x="8" y="5" width="25" height="25" fill="#ccc" ></rect>
                      <text x="70" y="24" text-anchor="middle" font-size="16" fill="black">ͨڵ</text>
                    </svg>
                  </div>
                  <div class="node" @dragstart="dragStart($event, 'end')" draggable="true">
                    <svg width="80" height="35">
                      <rect x="0" y="0" width="80" height="35" fill="white" stroke="#666" stroke-width="1" ></rect>
                      <rect x="8" y="5" width="25" height="25" fill="red" ></rect>
                      <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">重置</text>
                    </svg>
                  </div>
                  <div class="node" @click="toggleConnecting" style="cursor: pointer;">
                    <svg width="80" height="35">
                      <rect x="0" y="0" width="80" height="35" :fill="connecting  'lightgreen' : 'white'" stroke="#666"
                        stroke-width="1" ></rect>
                      <rect x="8" y="16" width="25" height="3" fill="#333" ></rect>
                      <text x="55" y="24" text-anchor="middle" font-size="16" fill="black">߶</text>
                    </svg>
                  </div>
                  <div style="position: absolute;right: 5px;top : 15px;">
                    <span v-if="selectedRow != null" style="color: black;font-size: 16px;margin-right : 10px;">ǰ̣{{
                      selectedRow.name }}</template>
                    <a-button ><template #icon><save-outlined ></save></template type="primary" @click="handleSubmit">重置</a-button>
                  </div>
                </div>
                <div class="container" ref="container">
                  <svg class="canvas" @drop="drop" @dragover.prevent>
                    <g v-for="node in nodes" :key="node.id" @click="selectNode(node)"
                      @mousedown="startDrag(node, $event)" style="cursor: pointer;">
                      <template v-if="node.type === 'start'">
                        <circle :cx="node.x' + node.w / 2" :cy="node.y + node.r" :r="node.r"
                          :fill="node.selected  'lightgreen' : 'white'" stroke="green" stroke-width="3" ></circle>
                        <text  x="node.x' + node.w / 2" : y="node.y + node.r + 5" text-anchor="middle">{{ node.label
                        }}</text>
                      </template>
                      <template v-else-if="node.type === 'end'">
                        <circle :cx="node.x' + node.w / 2" :cy="node.y + node.r" :r="node.r"
                          :fill="node.selected  'lightgreen' : 'white'" stroke="red" stroke-width="3" ></circle>
                        <text  x="node.x' + node.w / 2" : y="node.y + node.r + 5" text-anchor="middle">{{ node.label
                        }}</text>
                      </template>
                      <template v-else>
                        <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h"
                          :fill="node.selected  'lightgreen' : 'white'" stroke="#ccc" stroke-width="3" ></rect>
                        <text :x="node.x' + node.w / 2" :y="node.y + node.h / 2 + 5" fill="black" :font-size="calcFontSize(node)"
                          text-anchor="middle">{{ node.label }}</text>
                      </template>
                      <!-- ɾ重置ť -->
                      <g @click.stop="deleteNode(node)" v-if="editForm.canEdit">
                        <rect
                          :x="node.type === 'start' || node.type === 'end' : node.x' + node.w - 10  node.x + node.w - 10" : y="node.y - 10" width="20" height="20" fill="#c6c6c6" ></rect>
                        <text :x="node.type === 'start' || node.type === 'end' : node.x' + node.w  node.x + node.w" : y="node.y + 5" fill="white" font-size="12" text-anchor="middle">X</text>
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
                      <!-- ɾ重置ť -->
                      <g @click.stop="deleteLine(line)" style="cursor: pointer;" v-if="editForm.canEdit">
                        <rect  x="(getNearestPoints(line.start, line.end).startPoint.x' + getNearestPoints(line.start, line.end).endPoint.x) / 2 - 10" : y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 - 10"
                          width="20" height="20" fill="#c6c6c6" ></rect>
                        <text  x="(getNearestPoints(line.start, line.end).startPoint.x + getNearestPoints(line.start, line.end).endPoint.x) / 2" : y="(getNearestPoints(line.start, line.end).startPoint.y + getNearestPoints(line.start, line.end).endPoint.y) / 2 + 5"
                          fill="white" font-size="12" text-anchor="middle">X</text>
                      </g>
                    </g>
                  </svg>
                </div>
              </a-col>
              <a-col :span="6">
                <div style="padding-top: 21px;padding-left : 5px;" v-if="selectedNode != null">
                  <span style="font-size: 18px;color: black;padding-left : 10px;">ڵ重置</template>
                  <a-divider type="horizontal" ></a>
                  <sp-input label="ڵ重置" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                    v-model="selectedNode.label" ></sp>

                  <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                    <span class="span-label">ִк重置</template>
                    <a-checkbox v-model="selectedNode.afterPending" style="width:130px;" ></a>
                  </div>

                  <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                    <sp-input-number label="重置ʱ" :disabled="!selectedNode.afterPending" :labelWidth="90" unit=""
                      v-model="selectedNode.pendingDuration" ></sp>
                  </div>

                  <div v-if="selectedNode.type === 'process'" style="margin-top:5px;">
                    <span class="span-label">صڵ㣺</template>
                    <a-select style="width: 160px;color: black;" v-model : value="selectedNode.rejectNodeId">
                      <a-select-option v-for="(item, index) in nodes.filter(u => u.type == 'process')" :key="index"
                        :value="item.id">{{ item.label }}</a-select-option>
                    </a-select>
                  </div>

                  <div v-if="selectedNode.type === 'process'">
                    <div style="margin-top:5px;">
                      <span class="span-label">򼯣</template>
                      <a-select style="width: 160px;color: black;" v-model : value="selectedNode.stepParentId"
                        @change="stepParentChange" :disabled="true">
                        <a-select-option v-for="(item, index) in stepParentData" :key="index" :value="item.id">{{
                          item.name
                        }}</a-select-option>
                      </a-select>
                    </div>

                    <a-table style="margin: 5px;" ref="stepTable" size="middle" : pagination="false"
                      :row-key="(record, index) => record.id" :columns="stepColumns" :dataSource="stepData"
                      :loading="stepLoading" :customRow="stepCustomRow" draggable="true">
                      <span #serial ="{ text, record, index">
                        {{ index' + 1 }}
                      </template>
                      <span #description ="{ text, record">
                        {{ getFlowStepDesc(record) }}
                      </template>
                      <template #action="text, record">
                        <a v-if="hasPerm('exp_flow_step:edit')" @click="$refs.editStepForm.edit(record)">编辑</a>
                      </template>
                    </a-table>
                  </div>
                </div>

                <div style="padding-top: 21px;padding-left : 5px;" v-if="selectedLine != null">
                  <span style="font-size: 18px;color: black;padding-left : 10px;">߶重置</template>
                  <a-divider type="horizontal" ></a>

                  <sp-input label="ʼڵ" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                    v-model="selectedLine.start.label" ></sp>
                  <sp-input label="重置ڵ" :labelWidth="80" :inputWidth="160" :rightEmpty="true"
                    v-model  value="selectedLine.end.label" style="margin-top : 5px;" ></sp>

                  <div style="margin-top:5px;">
                    <span class="span-label" style="width: 85px;margin-left : 5px;">案例:编号:::</template>
                    <a-button ><template #icon><plus-outlined ></plus-outlined></template @click="addCondition()" />
                  </div>
                  <!--  -->
                  <div :key="i" v-for="(item, i) in selectedLine.conditions" style="margin-top:5px;">
                    <div style="height:auto;">
                      <span class="span-label" style="width: 75px;">{{ '重置' + (i + 1) + ' : ' }}</template>
                      <a-select placeholder="ϵ" style="margin-left: 10px;width : 65px;"
                        v-model="selectedLine.conditions[i].condition" @change="e => conditionChange(i, e)">
                        <a-select-option v-for="(condition, index) in conditions" :key="index" :value="condition.id">{{
                          condition.name }}</a-select-option>
                      </a-select>
                      <a-select placeholder="重置" style="width: 85px;" v-model : value="selectedLine.conditions[i].attributeId"
                        @change="e => fieldNameChange(i, e)">
                        <a-select-option v-for="(attributes, index) in attributeData.attributes" :key="index"
                          :value="attributes.id">{{ attributes.name }}</a-select-option>
                      </a-select>
                      <a-button icon="minus" style="width:20px;" @click="subCondition(i)"
                        v-if="selectedLine.conditions.length > 0" />
                    </div>
                    <div style="height: auto;margin-top: 5px;margin-left : 85px;">
                      <a-select placeholder="Ƚ" style="width: 65px;" v-model : value="selectedLine.conditions[i].operation"
                        @change="e => operationChange(i, e)">
                        <a-select-option v-for="(operation, index) in operations" :key="index" :value="operation.id">{{
                          operation.name }}</a-select-option>
                      </a-select>
                      <a-input v-model="selectedLine.conditions[i].value" style="width:85px;" clearable placeholder="ֵ"
                        @change="e => valueChange(i, e)" />
                    </div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </a-spin>
        </div>
      </a-modal>

      <!-- 浯 -->
      <a-modal bordered="true" :head-style="{ backgroundColor: '#f0f5ff', borderBottom: 'none' }"
        :body-style="{ padding: '16px 24px' }" :title="cacheForm.title" :open="cacheForm.visible"
        :maskClosable="false" width="95%" @cancel="cancelCacheForm" @ok="handleCacheList">
        <div aria-hidden="true" style="overflow: scroll;">
          <a-row :gutter="[16, 16]">
            <a-col v-for="(item, index) in cacheForm.cachedatalist" :key="index" :span="8">
              <a-card v-if="item.name !== ''" style="font-size: larger;" : title="item.name" hoverable>
                <div class="plate-container">
                  <!-- 重置б -->
                  <div class="top-header">
                    <span class="header-cell"></template>
                    <!-- 重置 name ж重置 -->
                    <span v-for="col in item.key=='TipCache'&&item''.name === 'Ĺ' : 8 : item.key.includes('CellCount') : 4  12" : key="col"
                      class='header-cell'>{{ col }}</template>
                  </div>
                  <!-- 案例:编号::: -->
                  <div v-for="(row,rowIndex) in getRows(item.name, item.key)" :key="row" class="row-container">
                    <span class="row-label">{{ row }}</template>
                    <!-- 重置 name ж重置 -->
                    <span v-for="col in item.key=='TipCache'&&item.name === 'Ĺ' : 8 : item.key.includes('CellCount')  4  12" : key="`${row}-${col}-${index}`" class="cell"
                      :class="{ active: getActiveCellsForIndex(item.value, item.name,item.key)[`${row}-${col}`] }"
                      @mousedown="startTipDrag(row, col, index)"
                      @mouseenter="handleTipDrag(row, col, index)"
                      @mouseup="endTipDrag"
                      @click="handleCellClick(row, col, index)"
                      @contextmenu.prevent
                      ></template>
                      <span  class='header-cell'>{{rowIndex' + 1}}</template>
                      
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col v-for="record in recordData" :key="record.id" :span="8">
              <a-card v-if="record.name !== ''" style="font-size: larger;" hoverable>
                <template #title>
                  <div style="display: flex; align-items: center; gap : 8px;">
                    <label style="flex-shrink: 0;">{{ record.name }}</label>
                    <label style="color: grey;">重置(l) : {{ record.maxVolume }}</label>
                    <label style="color: grey;">ʣ重置(l) : </label>
                    <sp-input-number style="height: 25px;" :step="100" :min="0" v-model  value="record.remainingVolume" : max="record.maxVolume" ></sp>
                  </div>
                </template>
                <div class="plate-container">
                  <!-- 案例:编号:::ȥаٷֱTip -->
                  <!-- ޸ĺƿ案例:编号::: -->
                  <div class="cache-modal-bottle-container">
                    <div class="cache-modal-bottle-cap"></div>
                    <div class="cache-modal-bottle-neck"></div>
                    <div class="cache-modal-bottle">
                      <div class="cache-modal-liquid"
                        :style="{ height: record.remainingVolume / record.maxVolume * 100 + '%' }"></div>
                      <div class="cache-modal-scale">
                        <!-- ̶ -->
                        <div v-for="mark in scaleMarks" :key="mark.value" class="scale-mark"
                          :style="{ bottom: mark.position + '%' }">
                          <span class="scale-value">{{ mark.value }}%</template> <!-- ̶ֵ -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </a-modal>

      <!-- ˹Ԥʾ -->
      <a-modal :open="interventionModal.visible" :title="interventionModal.title" width="50%" :maskClosable="false"
        @ok="handleIntervention" @cancel="interventionModal.visible = false">
        <div>
          <span class="span-label">重置ţ</template>
          <span class="span-text">{{ interventionModal.flowCode }}</template>

          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ interventionModal.flowName }}</template>
        </div>
        <div style="margin-top:10px;">
          <span class="span-label">ڵ重置ƣ</template>
          <span class="span-text">{{ interventionModal.nodeName }}</template>

          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ interventionModal.stepName }}</template>
        </div>
        <div style="margin-top:10px;">
          <span class="span-label">关紫外</template>
          <span class="span-text">{{ interventionModal.content }}</template>
        </div>
        <div style="margin-top: 10px;display : flex; align-items: flex-start;margin-bottom : 10px;">
          <span class="span-label">案例:编号:::</template>
          <a-textarea placeholder="重置봦重置" style="width: 660px;font-size: 16px;color : black;" rows="2"
            v-model="interventionModal.remark" allow-clear ></a>
        </div>
        <a-table size="middle" :columns="interventionColumnes" :dataSource="attributeData.attributes"
          :pagination="false" :loading="attributeLoading" rowKey="key" :scroll="{ y: 320 }">
          <!-- 自动完成 -->
          <span #serial ="{ text, record, index">
            {{ index' + 1 }}
          </template>
          <span #name ="{ text, record">
            <a-input v-model="record.name" placeholder="请输入案例:名称:::" ></a>
          </template>
          <span #type ="{ text, record">
            <a-select v-model="record.type" key="dataType" style="width: 100%" placeholder="请选择">
              <a-select-option v-for="(item, index) in dataTypeSelectData" :key="index" :value="item.value">
                {{ item.value }}</a-select-option>
            </a-select>
          </template>
          <span #keyStr ="{ text, record">
            <a-input v-model="record.keyStr" placeholder="请输入关键词" ></a>
          </template>
          <span #value ="{ text, record">
            <a-input v-model="record.value" placeholder="案例:编号:::ֵ" ></a>
          </template>
        </a-table>
      </a-modal>

      <!-- 쳣重置ʾ -->
      <a-modal :open="errorModal.visible" :title="errorModal.title" width="40%" :closable="false"
        :maskClosable="false" @cancel="errorModal.visible = false">
        <div>
          <span class="span-label">重置ţ</template>
          <span class="span-text">{{ errorModal.flowCode }}</template>
          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ errorModal.flowName }}</template>
        </div>
        <div style="margin-top:10px;">
          <span class="span-label">ڵ重置ƣ</template>
          <span class="span-text">{{ errorModal.nodeName }}</template>

          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ errorModal.stepName }}</template>
        </div>
        <div style="margin-top:10px;">
          <span class="span-label">关紫外</template>
          <span class="span-text">{{ errorModal.content }}</template>
        </div>
        <div style="margin-top: 10px;display : flex; align-items: flex-start;margin-bottom : 10px;">
          <span class="span-label">案例:编号:::</template>
          <a-textarea placeholder="重置봦重置" style="width: 660px;font-size: 16px;color : black;" rows="2"
            v-model="errorModal.errorHandleMsg" allow-clear ></a>
        </div>

        <template #footer>
          <a-button type="primary" @click="handleError(1)">重置</a-button>
          <a-button type="primary" @click="handleError(2)">ֹ</a-button>
          <a-button type="primary" @click="handleError(3)">重置ǰ重置</a-button>
        </template>
      </a-modal>

      <!-- 重置Ĳʾ -->
      <a-modal :open="changeConsumableModal.visible" :title="changeConsumableModal.title" width="40%"
        :closable="false" :maskClosable="false" @cancel="changeConsumableModal.visible = false">
        <div>
          <span class="span-label">重置ţ</template>
          <span class="span-text">{{ changeConsumableModal.flowCode }}</template>
          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ changeConsumableModal.flowName }}</template>
        </div>
        <div style="margin-top:10px;">
          <!-- <span class="span-label">ڵ重置ƣ</template>
          <span class="span-text">{{changeConsumableModal.nodeName}}</template> -->

          <span class="span-label">案例:编号:::ƣ</template>
          <span class="span-text">{{ changeConsumableModal.stepName }}</template>
        </div>
        <div style="margin-top:10px;">
          <span class="span-label">关紫外</template>
          <span class="span-text">{{ changeConsumableModal.content }}</template>
        </div>

        <template #footer>
          <a-button type="primary" @click="handleChangeConsumable(4)">Ѹ</a-button>
          <a-button type="primary" @click="handleError(2)">ֹ</a-button>
        </template>
      </a-modal>

      <!-- ƷϢб -->
      <a-modal :open="sampleModal.visible" :title="sampleModal.title" width="80%" :closable="false"
        :maskClosable="false" @cancel="sampleModal.visible = false">
        <div style="height: 40px;">
          <div style="float:left;">
            <span class="span-label" style="width:100px;">ж重置̣</template>
            <a-select style="width: 230px;color: black;" v-model : value="sampleModal.judementFlowId">
              <a-select-option v-for="(item, index) in flowData.filter(item => item.type == 6)" :key="index"
                :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </div>
          <div style="float: left;margin-left: 30px;padding-top : 5px;">
            <a-checkbox class="my-checkbox" v-model="sampleModal.isGeneration"
              @change="filterFlowType(1)">案例:编号:::Һ案例:编号:::</a-checkbox>
          </div>
          <div style="float: left;margin-left: 20px;padding-top : 5px;">
            <a-checkbox class="my-checkbox" v-model="sampleModal.isSusceptibility"
              @change="filterFlowType(2)">ҩ重置</a-checkbox>
          </div>
        </div>

        <a-table ref="tableSample" size="middle" :loading="sampleModal.loading" :pagination="false"
          :columns="sampleModal.columns" :dataSource="sampleModal.sampleData" :expandIcon="expandIcon"
          :rowSelection="{ selectedRowKeys: sampleModal.selectedRowKeys, onChange: onSampleChange }" :alert="true"
          :rowKey="(record) => record.id">
          <span #serial ="{ text, record, index">
            {{ index + 1 }}
          </template>
          <span #type ="{ text">
            {{ typeFilter(text) }}
          </template>
          <span #status ="{ text">
            {{ sampleStatusFilter(text) }}
          </template>
          <span #flowId ="{ text">
            {{ flowFilter(text) }}
          </template>
          <span #cultivateOrGenerationTime ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility1Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility2Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility3Time ="{ text">
            {{ formatDate(text) }}
          </template>
        </a-table>

        <template #footer>
          <a-button type="primary"  @click="sampleModal.visible=false">取消</a-button>
          <a-button type="primary" @click="submitJudement()">ȷ</a-button>
        </template>
      </a-modal>

      <!-- ִֶб -->
      <a-modal :open="manualModal.visible" :title="manualModal.title" width="80%" :closable="false"
        :maskClosable="false" @cancel="manualModal.visible = false">
        <div style="height: 40px;">
          <div style="float:left;">
            <span class="span-label" style="width:100px;">ִ重置̣</template>
            <a-select style="width: 230px;color: black;" v-model : value="manualModal.judementFlowId">
              <a-select-option v-for="(item, index) in flowData.filter(item => item.type > 1 && item.type < 8)" :key="index"
                :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </div>
          <div style="float: left;margin-left: 30px;padding-top : 5px;">
            <a-checkbox class="my-checkbox" v-model="manualModal.isGeneration"
              @change="filterFlowType(1)">案例:编号:::Һ案例:编号:::</a-checkbox>
          </div>
          <div style="float: left;margin-left: 20px;padding-top : 5px;">
            <a-checkbox class="my-checkbox" v-model="manualModal.isSusceptibility"
              @change="filterFlowType(2)">ҩ重置</a-checkbox>
          </div>
        </div>

        <a-table ref="tableManual" size="middle" :loading="manualModal.loading" :pagination="false"
          :columns="manualModal.columns" :dataSource="manualModal.sampleData" :expandIcon="expandIcon"
          :rowSelection="{ selectedRowKeys: manualModal.selectedRowKeys, onChange: onManualChange }" :alert="true"
          :rowKey="(record) => record.id">
          <span #serial ="{ text, record, index">
            {{ index + 1 }}
          </template>
          <span #type ="{ text">
            {{ typeFilter(text) }}
          </template>
          <span #status ="{ text">
            {{ sampleStatusFilter(text) }}
          </template>
          <span #flowId ="{ text">
            {{ flowFilter(text) }}
          </template>
          <span #cultivateOrGenerationTime ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility1Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility2Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility3Time ="{ text">
            {{ formatDate(text) }}
          </template>
        </a-table>

        <template #footer>
          <a-button type="primary"  @click="manualModal.visible=false">取消</a-button>
          <a-button type="primary" @click="submitManual()">ȷ</a-button>
        </template>
      </a-modal>

      <!-- жϽб -->
      <a-modal :open="judementModal.visible" :title="judementModal.title" width="80%" :closable="false"
        :maskClosable="false" @cancel="judementModal.visible = false">
        <div style="height: 40px;">
          <div style="float:left;">
            <span class="span-label" style="width:100px;">ж重置̣</template>
            <a-select style="width: 230px;color : black;" v-model  value="judementModal.judementFlowId" : disabled="true">
              <a-select-option v-for="(item, index) in flowData" :key="index"
                :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </div>
        </div>

        <a-table ref="tableJudement" size="middle" :loading="judementModal.loading" :pagination="false"
          :columns="judementModal.columns" :dataSource="judementModal.sampleData" :expandIcon="expandIcon"
          :rowSelection="{ selectedRowKeys: judementModal.selectedRowKeys, onChange: onJudementChange }" :alert="true"
          :rowKey="(record) => record.id">
          <span #serial ="{ text, record, index">
            {{ index + 1 }}
          </template>
          <span #type ="{ text">
            {{ typeFilter(text) }}
          </template>
          <span #status ="{ text">
            {{ sampleStatusFilter(text) }}
          </template>
          <!-- <span #status ="{ text">
            {{ statusFilter(text) }}
          </template> -->
          <span #flowId ="{ text">
            {{ flowFilter(text) }}
          </template>
          <span #cultivateOrGenerationTime ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility1Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility2Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #susceptibility3Time ="{ text">
            {{ formatDate(text) }}
          </template>
          <span #nextFlowId ="{ text, record">
            <a-select style="width: 200px;color: black;" v-model : value="record.nextFlowId" clearable>
              <a-select-option v-for="(item, index) in flowData.filter(item => item.type < 8 && item.type>1 && item.type!=6)" :key="index"
                :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </template>
        </a-table>
        <template #footer>
          <a-button type="primary"  @click="judementModal.visible=false">取消</a-button>
          <a-button type="primary" @click="handleJudement()">ȷ</a-button>
        </template>
      </a-modal>

      <!-- 重置ѡ񵯴 -->
      <a-modal bordered="true" :head-style="{ backgroundColor: '#f0f5ff', borderBottom: 'none' }"
        :body-style="{ padding: '16px 24px' }" 
        :title="schemeForm.title" :open="schemeForm.visible"
        :maskClosable="false"
        width="50%"
        @cancel="cancelSchemeForm"
        @ok="handleSchemeList"
      >
      <div aria-hidden="true"
        style="display: flex; justify-content : center;"
            v-for="(row,index) in schemeForm.rows" v-bind:key="index">
            <span
              class="cell"
              v-for="col in schemeForm.cols"
              :key="`${row}-${col}`"
              :v-model="schemeForm.groupList"
              :class="{active:schemeForm.groupList.includes(`${row}-${col}`) }"
              @click="SelectPlaning(row,col)"
              style="width: 20px; margin : 1px;"
            ></template>
        </div>
      </a-modal>

      <!--΢ͼ !-->
      <a-modal :title="imageModal.title" :open="imageModal.visible" :footer="null" :width="1100" @cancel="clearImageData" @close="clearImageData">
        <image-thumbnail ref="imageThumbnail" :images="imageModal.imageData" ></image>
      </a-modal>

      <!--ʾ !-->
      <a-modal :title="thermometerModal.title" :open="thermometerModal.visible" :footer="null" :width="1580" @cancel="clearTempData" @close="clearTempData">
        <thermometer ref="thermometer" :temps="thermometerModal.temps" ></thermometer>
      </a-modal>
    </a-card>
  </div>
</template>
<script>
import { h } from 'vue'
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, RedoOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { STable, Ellipsis, XCard } from '@/components'
import {
  exp_flow_case_delete, exp_flow_case_list, exp_flow_case_addJudement, exp_flow_case_afterJudement,
  exp_flow_case_add, exp_flow_case_edit, exp_flow_case_detail,exp_flow_case_addManual,
  exp_flow_case_getStepList, exp_flow_case_getNodeList,exp_flow_case_getFlowCaseFiles,
  exp_flow_case_handleIntervention, exp_flow_case_addQueue, exp_flow_case_handleError,
  exp_flow_case_cancelCase,
  exp_flow_case_pauseCase, exp_flow_case_continueCase, exp_flow_case_getcachelist, exp_flow_case_savecacheinput,
  exp_flow_case_getSamplelist, exp_flow_case_getAfterJudementList, exp_flow_case_getLastNotice,exp_flow_case_QuerySampleCentrifugeCode
} from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list, exp_flow_getNodeList, exp_flow_detail } from '@/api/modular/experiment/expFlowManage'
import { exp_flow_step_list } from '@/api/modular/experiment/expFlowStepManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { exp_liquid_list } from '@/api/modular/experiment/liquidManage'
import { exp_equipment_list, exp_equipment_au } from '@/api/modular/experiment/equipmentManage'
import { exp_consumable_page, exp_consumable_getConsumableTags, exp_consumable_edit, exp_consumable_getArmAttribute, exp_consumable_getParams } from '@/api/modular/experiment/consumableManage'
import { exp_layout_getShippingSpaces } from '@/api/modular/experiment/layoutManage'
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
import store from '@/store'
import * as SignalR from '@microsoft/signalr'
import ImageThumbnail from "@/components/ImageThumbnail.vue";
import Thermometer from "@/components/thermometer.vue";

export default {
  components: {
    XCard, 
    STable, 
    Ellipsis, 
    SpInputNumber, 
    SpInput,
    ImageThumbnail,
    Thermometer
  },
  data() {
    return {
      formLoading: true,
      attributeLoading: false,
      advanced: false, // ߼重置 չ/ر
      queryParam: {},
      expandedRowKeys: [], // ڿչ重置

    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      columns: [
        {
          title: '',
          key: 'serial',
          align: 'right',
          width: '80px',
          slots: { customRender: 'serial' }
        },
        {
          title: '案例:编号:::',
          dataIndex: 'code',
          width: '180px',
        },
        {
          title: '案例:编号:::',
          dataIndex: 'name',
          width: '180px',
        },
        {
          title: '样品编号',
          dataIndex: 'sampleCode',
          width: '180px',
        },
        {
          title: 'ǰڵ',
          dataIndex: 'active',
        },
        {
          title: '实验流程:',
          dataIndex: 'flowId',
          width: '180px',
          slots: {
            customRender: 'flowId'
          }
        },
        {
          title: '״̬',
          dataIndex: 'status',
          width: '80px',
          slots: {
            customRender: 'status'
          }
        },
        {
          title: 'ʼʱ',
          dataIndex: 'startTime',
          slots: {
            customRender: 'startTime'
          }
        },
        {
          title: '重置ʱ',
          dataIndex: 'endTime',
          slots: {
            customRender: 'endTime'
          }
        }
      ],
      // Զ案例:编号:::

    attributeColumns: [
        {
          title: '',
          key: 'serial',
          align: 'center',
          width: '50',
          slots: { customRender: 'serial' }
        },
        {
          title: '重置',
          align: 'center',
          key: 'name',
          dataIndex: 'name',
          width: '100',
          editable: true,
          slots: { customRender: 'name' }
        },
        {
          title: '重置',
          align: 'center',
          key: 'type',
          width: '100',
          dataIndex: 'type',
          editable: true,
          slots: { customRender: 'type' }
        },
        {
          title: 'ؼ',
          align: 'center',
          key: 'keyStr',
          width: '100',
          dataIndex: 'keyStr',
          editable: true,
          slots: { customRender: 'keyStr' }
        },
        {
          title: 'ֵ',
          align: 'center',
          key: 'value',
          width: '100',
          dataIndex: 'value',
          editable: true,
          slots: { customRender: 'value' }
        }
      ],
      // Զ案例:编号:::

    interventionColumnes: [
        {
          title: '',
          key: 'serial',
          align: 'center',
          width: '50',
          slots: { customRender: 'serial' }
        },
        {
          title: '重置',
          align: 'center',
          key: 'name',
          dataIndex: 'name',
          width: '100',
          editable: true,
          slots: { customRender: 'name' }
        },
        {
          title: '重置',
          align: 'center',
          key: 'type',
          width: '100',
          dataIndex: 'type',
          editable: true,
          slots: { customRender: 'type' }
        },
        {
          title: 'ؼ',
          align: 'center',
          key: 'keyStr',
          width: '100',
          dataIndex: 'keyStr',
          editable: true,
          slots: { customRender: 'keyStr' }
        },
        {
          title: 'ֵ',
          align: 'center',
          key: 'value',
          width: '100',
          dataIndex: 'value',
          editable: true,
          slots: { customRender: 'value' }
        }
      ],
      dataTypeSelectData: [
        {
          value: 'text',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'varchar',
          hasLength: true,
          hasDecimalDigits: false
        },
        {
          value: 'nvarchar',
          hasLength: true,
          hasDecimalDigits: false
        },
        {
          value: 'char',
          hasLength: true,
          hasDecimalDigits: false
        },
        {
          value: 'nchar',
          hasLength: true,
          hasDecimalDigits: false
        },
        {
          value: 'timestamp',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'int',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'smallint',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'tinyint',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'bigint',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'bit',
          hasLength: false,
          hasDecimalDigits: false
        },
        {
          value: 'decimal',
          hasLength: true,
          hasDecimalDigits: true
        },
        {
          value: 'datetime',
          hasLength: false,
          hasDecimalDigits: false
        },
      ],

      tstyle: { 'padding-bottom': '0px', 'margin-bottom': '10px' },
      // 案例:编号:::ݷ 重置Ϊ Promise 重置

    loadData: parameter => {
        return exp_flow_case_list(Object.assign(parameter, this.queryParam)).then((res) => {
          this.pagination.current = res.data.pageNo;
          this.pagination.pageSize = res.data.pageSize;
          return res.data
        })
      },
      layoutData: [],
      currentLayout: { name: '', xSize: 1800, ySize: 800 },
      layoutTitle: '',
      previewLayoutVisible: false,
      flowData: [],

      editForm: {
        title: '༭',
        isAdd: true,
        visible: false,
        canEdit: false,
        record: {
          id:0,
          flowId: 0,
          code: '',
          name: '',
          sampleCode: '',
          susceptibilityPlan:[],
          status: 0,
          type: 1,
          executeType: 1,
          priority: 1,
          remark: '',
          isCurrent:false,
          attributes: [],
        },
        errors: {
          code: false,
          name: false,
          sampleCode: false,
        },
      },

      cacheForm: {
        title: '重置',
        visible: false,
        cachedatalist: [],
      },

      schemeForm: {
        title: '重置',
        rows:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        cols:24,
        visible: false,
        groupList: [],
        groupedCells:[]
      },
      
      nodes: [],
      lines: [],
      connecting: false,
      startNode: null,
      draggingNode: null,
      offsetX: 0,
      offsetY: 0,
      selectedLine: null, // ڴ洢ѡе߶

    selectedNode: null, // ڴ洢ѡеĽڵ
      selectStepNode: null,
      stepParentData: [],
      deleteNodes: [],
      flowLoading: false,
      selectedRow: null,
      conditionData: [],
      attributeData: {
        code: '',
        name: '',
        layoutId: 0,
        sort: 0,
        type: 1,
        executeType: 1,
        priority: 1,
        status: 0,
        attributes: [],
        deletedAttributes: []
      },
      flowTypes: [],
      executeTypes: [],
      flowPrioritys: [],
      flowStatus: [],
      sampleStatus: [],
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
        { id: 'and', name: '重置' },
        { id: 'or', name: '重置' }
      ],

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
          title: '',
          key: 'serial',
          align: 'center',
          width: '50px',
          slots: { customRender: 'serial' }
        },
        {
          title: '案例:编号:::',
          width: '130px',
          dataIndex: 'name'
        },
        {
          title: '案例:编号:::',
          width: '300px',
          dataIndex: 'description',
          slots: { customRender: 'description' }
        }
      ],

      stepRowRunningIndex: 0,
      stepRowRunning: false,
      scriptRunning: false,

      imageModal:{
        visible: false,
        imageData:[]
      },

      interventionModal: {
        visible: false,
        stepId: 0,
        stepName: '',
        status: 0,
        title: '重置[˹Ԥ]',
        content: '˹Ѻ촦1',
        remark: '',
        flowCode: '',
        flowName: '',
        flowId: 0,
        nodeId: 0,
        nodeName: '',
      },

      errorModal: {
        visible: false,
        stepId: 0,
        stepName: '',
        status: 0,
        title: '重置[˹Ԥ]',
        content: '˹Ѻ촦1',
        errorHandleMsg: '',
        flowCode: '',
        flowName: '',
        flowId: 0,
        nodeId: 0,
        nodeName: '',
        errorHandleType: 0,
      },

      changeConsumableModal: {
        visible: false,
        stepId: 0,
        stepName: '',
        status: 0,
        title: '重置[˹Ԥ]',
        content: '˹Ѻ촦1',
        errorHandleMsg: '',
        flowCode: '',
        flowName: '',
        flowId: 0,
        nodeId: 0,
        nodeName: '',
        errorHandleType: 0,
        key: '',
      },

      sampleModal: {
        visible: false,
        loading: false,
        title: 'ִж重置',
        flowCode: '',
        flowName: '',
        flowId: 0,
        judementFlowId: 0,
        generationFlowId: 0,
        susceptibilityFlowId: 0,
        nextFlowType: 1,
        isGeneration: true,
        isSusceptibility: false,
        key: '',
        sampleData: [],
        selectedRowKeys: [],
        columns: [
          {
            title: '',
            key: 'serial',
            align: 'center',
            width: '60px',
            slots: { customRender: 'serial' },
          },
          {
            title: '样品编号',
            dataIndex: 'sampleCode',
          },
          {
            title: '重置λ',
            dataIndex: 'storageLoc',
          },
          {
            title: '案例:编号:::',
            dataIndex: 'code',
            slots: { customRender: 'code' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'name',
            slots: { customRender: 'name' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'type',
            slots: { customRender: 'type' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'cultivateOrGenerationTime',
            slots: { customRender: 'cultivateOrGenerationTime' },
          },
          {
            title: '重置һλҺ重置',
            dataIndex: 'lastChangeLiquidDay',
          },
          {
            title: '重置һδ案例:编号:::',
            dataIndex: 'lastGenerationDay',
          },
          {
            title: '̰重置',
            dataIndex: 'susceptibility1Time',
            slots: { customRender: 'susceptibility1Time' },
          },
          {
            title: 'ҩ重置',
            dataIndex: 'susceptibility2Time',
            slots: { customRender: 'susceptibility2Time' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'susceptibility3Time',
            slots: { customRender: 'susceptibility3Time' },
          },
          {
            title: '״̬',
            dataIndex: 'status',
            slots: {
              customRender: 'status',
            },
          }
        ]
      },

      manualModal: {
        visible: false,
        loading: false,
        title: 'ִֶ重置',
        flowCode: '',
        flowName: '',
        flowId: 0,
        judementFlowId: 0,
        generationFlowId: 0,
        susceptibilityFlowId: 0,
        nextFlowType: 1,
        isGeneration: true,
        isSusceptibility: false,
        key: '',
        sampleData: [],
        selectedRowKeys: [],
        columns: [
          {
            title: '',
            key: 'serial',
            align: 'center',
            width: '60px',
            slots: { customRender: 'serial' },
          },
          {
            title: '样品编号',
            dataIndex: 'sampleCode',
          },
          {
            title: '重置λ',
            dataIndex: 'storageLoc',
          },
          {
            title: '案例:编号:::',
            dataIndex: 'code',
            slots: { customRender: 'code' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'name',
            slots: { customRender: 'name' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'type',
            slots: { customRender: 'type' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'cultivateOrGenerationTime',
            slots: { customRender: 'cultivateOrGenerationTime' },
          },
          {
            title: '重置һλҺ重置',
            dataIndex: 'lastChangeLiquidDay',
          },
          {
            title: '重置һδ案例:编号:::',
            dataIndex: 'lastGenerationDay',
          },
          {
            title: '̰重置',
            dataIndex: 'susceptibility1Time',
            slots: { customRender: 'susceptibility1Time' },
          },
          {
            title: 'ҩ重置',
            dataIndex: 'susceptibility2Time',
            slots: { customRender: 'susceptibility2Time' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'susceptibility3Time',
            slots: { customRender: 'susceptibility3Time' },
          },
          {
            title: '״̬',
            dataIndex: 'status',
            slots: {
              customRender: 'status',
            },
          }
        ]
      },

      thermometerModal:{
        visible: false,
        loading: false,
        title: 'ʾ',
        temps:[
          {currentTemp:68.5,title:'重置1'},
          {currentTemp:20,title:'重置2'},
          {currentTemp:30.3,title:'重置3'},
          {currentTemp:43,title:'重置4'},
          {currentTemp:37,title:'重置5'},
          {currentTemp:8,title:'重置1'},
          {currentTemp:5.8,title:'重置2'},
          {currentTemp:10,title:'重置3'},
          {currentTemp:12,title:'重置4'},
          {currentTemp:-4,title:'重置5'},
          {currentTemp:6,title:'重置6'},
          {currentTemp:3,title:'重置7'},
          {currentTemp:-20,title:'重置8'},
          {currentTemp:-10,title:'重置9'},
          {currentTemp:-15,title:'重置10'},
          {currentTemp:-5,title:'重置11'},
          {currentTemp:5,title:'重置12'},
        ]
      },

      judementModal: {
        visible: false,
        loading: false,
        title: 'жϽб',
        flowCode: '',
        flowName: '',
        flowId: 0,
        judementFlowId: 0,
        generationFlowId: 0,
        susceptibilityFlowId: 0,
        nextFlowType: 1,
        isGeneration: true,
        isSusceptibility: false,
        key: '',
        sampleData: [],
        selectedRowKeys: [],
        columns: [
          {
            title: '',
            key: 'serial',
            align: 'center',
            width: '60px',
            slots: { customRender: 'serial' },
          },
          {
            title: '样品编号',
            dataIndex: 'sampleCode',
          },
          {
            title: '重置λ',
            dataIndex: 'storageLoc',
          },
          {
            title: '案例:编号:::',
            dataIndex: 'code',
            slots: { customRender: 'code' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'name',
            slots: { customRender: 'name' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'type',
            slots: { customRender: 'type' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'cultivateOrGenerationTime',
            slots: { customRender: 'cultivateOrGenerationTime' },
          },
          {
            title: '重置һλҺ重置',
            dataIndex: 'lastChangeLiquidDay',
          },
          {
            title: '重置һδ案例:编号:::',
            dataIndex: 'lastGenerationDay',
          },
          {
            title: '̰重置',
            dataIndex: 'susceptibility1Time',
            slots: { customRender: 'susceptibility1Time' },
          },
          {
            title: 'ҩ重置',
            dataIndex: 'susceptibility2Time',
            slots: { customRender: 'susceptibility2Time' },
          },
          {
            title: '案例:编号:::',
            dataIndex: 'susceptibility3Time',
            slots: { customRender: 'susceptibility3Time' },
          },
          {
            title: '״̬',
            dataIndex: 'status',
            slots: {
              customRender: 'status',
            },
          },
          {
            title: '执行类型:',
            width: '200px',
            dataIndex: 'nextFlowId',
            slots: {
              customRender: 'nextFlowId'
            }
          }
        ]
      },

      isRefreshRecord: false,
      refreshTime: null,
      mySocket: null,
      base_url: site_config.proxy : '' : site_config.api_service,
      // 重置ʾ

    defaultRows: Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]),
      centrifugeTubeRows: Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]),
      cellcacheRows: Object.freeze(["A", "B", "C", "D", "E"]),
      isDragging: false,
      startRow: null,
      startCol: null,
      currentIndex: null,
      startState: false,
      scaleMarks: [  // ̶ȱ

      { value: 0, position: 0 },
        { value: 25, position: 25 },
        { value: 50, position: 50 },
        { value: 75, position: 75 },

      ],
      aqueryParam: {
        isRemainingVolume: true
      },
      aparameter: {
        pageNo: 1,
        pageSize: 10,
      },
      recordData: {},
      armAttribute: {},

    }
  },
  mounted() {
    this.refreshTime = setInterval(this.refreshFun, 10000);
    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  },
  beforeUnmount() {
    // 重置ʱ

  clearInterval(this.refreshTime);
    // 案例:编号:::ʱƳsocket重置Ϣ重置

  this.$socket.off('ReceiveMessage');
  },
  created() {
    this.startSocket();
    this.sysDictTypeDropDown()
    this.getFlowData()
    this.getEquipmentData()
    this.getLiquidData()

    if (this.hasPerm('exp_flow_case  edit') || this.hasPerm('exp_flow_case : delete')) {
      this.columns.push({
        title: '重置',
        dataIndex: 'action',
        slots: { customRender: 'action' }
      })
    }
    console.log('=========created--------->')
    console.log(store.getters.buttons)

    // this.getLastNotice()
  },
  methods:
  {
    showImage()
    {
      exp_flow_case_getFlowCaseFiles({flowId:this.editForm.record.id}).then((res) => {
          if (res.success && res.data != null) {
            console.log("΢ͼ===###>>>")
            this.imageModal.visible=true;
            this.imageModal.imageData=res.data;
          }
        }).catch((err) => {
          this.$message.error('쳣' + err.message)
      })      
    },
    clearTempData(){
      this.thermometerModal.visible=false;
      console.log('===this.imageModal.visible=false===');
      this.$refs.thermometer.clear();
    },
    clearImageData(){
      this.imageModal.visible=false;
      console.log('===this.imageModal.visible=false===');
      this.$refs.imageThumbnail.clearFormData();
    },
    // ̬ıС重置

  calcFontSize(node) {
      // ȡı重置ȣ重置ȫַΪ1.5λ

    const textLength = [...node.label].reduce((acc, char) =>
        acc' + (char.charCodeAt(0) > 255  1.5 : 1), 0);

      // 案例:编号:::óߴ

    const widthLimit = node.w / (textLength * 0.65); // ÿַռ0.65ֺſ
      const heightLimit = node.h * 0.45; // 重置ֱ

    const calculatedSize = Math.min(widthLimit, heightLimit);

      // 重置ֺŷΧ8-16px

    return Math.min(16, Math.max(8, Math.round(calculatedSize)));
    },
    getLastNotice() {
      if (this.errorModal.visible == false) {
        var data = {};
        exp_flow_case_getLastNotice(data).then((res) => {
          if (res.success && res.data != null) {

            var notice=res.data
            this.errorModal.visible = true

            this.errorModal.stepId = notice.stepId
            this.errorModal.stepName = notice.stepName
            this.errorModal.status = notice.status
            this.errorModal.title = notice.title
            this.errorModal.content = notice.content
            this.errorModal.flowCode = notice.flowCode
            this.errorModal.flowName = notice.flowName
            this.errorModal.flowId = notice.flowId
            this.errorModal.nodeName = notice.nodeName
          }
        }).catch((err) => {
          this.$message.error('쳣' + err.message)
        })
      }
    },
    onExpand(expanded, record) {
      /**
       * 重置չ案例:编号:::߼
       */
      if (expanded) {
        this.expandedRowKeys = [record.id];
      } else {
        this.expandedRowKeys = [];
      }
      console.log(this.expandedRowKeys)
    },
    expandIcon(props) {
      if (props.expanded) {
        return h('span', {
          onClick: () => this.onExpand(false, props.record),
          style: { cursor: 'pointer', fontSize: '16px' }
        }, ':'); // ʹUnicodeַ重置ͼ
      }
      else if (props.record.children && props.record.children.length > 0) {
        return h('span', {
          onClick: () => this.onExpand(true, props.record),
          style: { cursor: 'pointer', fontSize: '16px' }
        }, ':'); // ʹUnicodeַ重置ͼ
      }
      else {
        return null; // û案例:编号:::ݣ重置ʾͼ꣨重置ʾӺţ
      }
    },
    onSampleChange(selectedRowKeys, selectedRows) {
      this.sampleModal.selectedRowKeys = selectedRowKeys
      this.sampleModal.selectedRows = selectedRows
    },
    onManualChange(selectedRowKeys, selectedRows) {
      this.manualModal.selectedRowKeys = selectedRowKeys
      this.manualModal.selectedRows = selectedRows
    },
    onJudementChange(selectedRowKeys, selectedRows) {
      this.judementModal.selectedRowKeys = selectedRowKeys
      this.judementModal.selectedRows = selectedRows
    },
    filterFlowType(flag) {
      this.sampleModal.selectedRowKeys = []
      this.sampleModal.nextFlowType = flag
      if (flag == 1) {
        this.sampleModal.isGeneration = true
        this.sampleModal.isSusceptibility = false
      }
      else {
        this.sampleModal.isGeneration = false
        this.sampleModal.isSusceptibility = true
      }

      this.getSmapleData()
    },
    openJudement() {
      this.sampleModal.visible = true
      this.getSmapleData()
    },
    openManual() {
      this.manualModal.visible = true
      this.getSmapleData1()
    },
    openTemp(){
      this.thermometerModal.visible=true
    },
    submitJudement() {
      var nextFlowId = this.sampleModal.nextFlowType == 1  this.sampleModal.generationFlowId : this.sampleModal.susceptibilityFlowId
      var data = {
        judementFlowId: this.sampleModal.judementFlowId,
        nextFlowType: this.sampleModal.nextFlowType,
        nextFlowId: nextFlowId,
        sampleIds: this.sampleModal.selectedRowKeys
      }

      exp_flow_case_addJudement(data).then((res) => {
        this.flowLoading = false
        if (res.success) {
          this.$message.success('重置ж重置̳ɹ')
          this.sampleModal.visible = false
          this.$refs.table.refresh()

          this.sampleModal.selectedRowKeys = []
        } else {
          this.$message.error(res.message)
        }
      })
    },
    submitManual() {
      var nextFlowId = this.manualModal.nextFlowType == 1  this.manualModal.generationFlowId : this.manualModal.susceptibilityFlowId
      var data = {
        judementFlowId: this.manualModal.judementFlowId,
        nextFlowType: this.manualModal.nextFlowType,
        nextFlowId: nextFlowId,
        sampleIds: this.manualModal.selectedRowKeys
      }

      exp_flow_case_addManual(data).then((res) => {
        this.flowLoading = false
        if (res.success) {
          this.$message.success('重置ֶ重置̳ɹ')
          this.manualModal.visible = false
          this.$refs.table.refresh()

          this.manualModal.selectedRowKeys = []
        } else {
          this.$message.error(res.message)
        }
      })
    },
    getSmapleData() {
      this.sampleModal.loading = true
      var data = { nextFlowType: this.sampleModal.nextFlowType }
      console.log(data)
      exp_flow_case_getSamplelist(data).then((res) => {
        this.sampleModal.loading = false
        if (res.success) {
          this.sampleModal.sampleData = res.data
        }
        else {
          this.$message.error('ݼʧ')
        }
      })
    },
    getSmapleData1() {
      this.manualModal.loading = true
      var data = { nextFlowType: this.manualModal.nextFlowType }
      console.log(data)
      exp_flow_case_getSamplelist(data).then((res) => {
        this.manualModal.loading = false
        if (res.success) {
          this.manualModal.sampleData = res.data
        }
        else {
          this.$message.error('ݼʧ')
        }
      })
    },
    handleNextFlowType(flag) {
      this.judementModal.selectedRowKeys = []
      this.judementModal.nextFlowType = flag
      if (flag == 1) {
        this.judementModal.isGeneration = true
        this.judementModal.isSusceptibility = false
      }
      else {
        this.judementModal.isGeneration = false
        this.judementModal.isSusceptibility = true
      }

      this.getSmapleData()
    },
    handleJudement() {
      console.log('=============>>>')
      var data = {
        nextFlowIds: [],
        flowIds: []
      }
      this.judementModal.sampleData.forEach((item) => {
        data.nextFlowIds.push(item.nextFlowId)
        data.flowIds.push(item.id)
      })

      exp_flow_case_afterJudement(data).then((res) => {
        this.flowLoading = false
        if (res.success) {
          this.$message.success('ж重置̳ɹ')
          this.judementModal.visible = false
          this.$refs.table.refresh()

          this.judementModal.selectedRowKeys = []
        } else {
          this.$message.error(res.message)
        }
      })
    },

    openAu() {
      exp_equipment_au({ isOpen: true }).then((res) => {
        if (res.success) {
          this.$message.success('ָͳɹ!')
        }
        else {
          this.$message.error('ָʧ!')
        }
      })
    },
    closeAu() {
      exp_equipment_au({ isOpen: false }).then((res) => {
        if (res.success) {
          this.$message.success('ָͳɹ!')
        }
        else {
          this.$message.error('ָʧ!')
        }
      })
    },
    startSocket() {
      console.log('=========startSocket--------->')
      console.log(this.base_url + '/hubs/chathub')
      const token = store.getters.token;

      this.mySocket = new SignalR.HubConnectionBuilder()
        .configureLogging(SignalR.LogLevel.Information)
        .withUrl(
          `${this.base_url}/hubs/chathub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: SignalR.HttpTransportType.WebSockets,
          keepAliveIntervalInMilliseconds: 10000 // ÿ10뷢һ重置
        }
        ).build()

      this.mySocket.on('AppendNotice', (notice) => {
      })

      this.mySocket.on('PublicMessage', (message) => {
        // console.log('յϢ----->'+message)

    })

      this.mySocket.on('PublicNotice', (notice) => {
        this.editForm.record.isCurrent=this.editForm.record.id==notice.flowId
        if (notice.type == 3) {
          if (notice.status === 8) {
            this.interventionModal.stepId = notice.stepId
            this.interventionModal.stepName = notice.stepName
            this.interventionModal.status = notice.status
            this.interventionModal.title = notice.title
            this.interventionModal.content = notice.content
            this.interventionModal.remark = notice.remark
            this.interventionModal.flowCode = notice.flowCode
            this.interventionModal.flowName = notice.flowName
            this.interventionModal.flowId = notice.flowId
            this.interventionModal.nodeName = notice.nodeName
            this.interventionModal.visible = true
            // console.log('=========ȴ˹重置==========')
            // console.log(this.interventionModal)
          }
          else if (notice.status === 9) {
            this.errorModal.stepId = notice.stepId
            this.errorModal.stepName = notice.stepName
            this.errorModal.status = notice.status
            this.errorModal.title = notice.title
            this.errorModal.content = notice.content
            this.errorModal.flowCode = notice.flowCode
            this.errorModal.flowName = notice.flowName
            this.errorModal.flowId = notice.flowId
            this.errorModal.nodeName = notice.nodeName
            this.errorModal.visible = true
            // console.log('=========ȴ쳣重置==========')
            // console.log(this.errorModal)
          }
          else if (notice.status === 10) {
            this.changeConsumableModal.stepId = notice.stepId
            this.changeConsumableModal.stepName = notice.stepName
            this.changeConsumableModal.status = notice.status
            this.changeConsumableModal.title = notice.title
            this.changeConsumableModal.content = notice.content
            this.changeConsumableModal.flowCode = notice.flowCode
            this.changeConsumableModal.flowName = notice.flowName
            this.changeConsumableModal.flowId = notice.flowId
            // this.changeConsumableModal.nodeName=notice.nodeName

          this.changeConsumableModal.visible = true
            this.changeConsumableModal.key = notice.key
          }
          else {
            if (!this.editForm.visible) {
              this.refreshRecord(notice.flowId);
            }
          }

          console.log('==========ǰ重置==========' + notice.stepName)
          if (this.editForm.visible && this.stepData.length > 0 && this.editForm.record.isCurrent) {
            var steps = this.stepData.filter(item => item.id == notice.stepId)
            if (steps.length > 0) {
              this.stepRowRunningIndex = steps[0].sort
              this.selectStepNode = steps[0]
            }
          }
        }
        else if (notice.type == 1) {
          this.editForm.record.status = notice.status
          this.refreshRecord(notice.flowId);
          /**
       * this.$refs.table.refresh()
       */
      if (notice.status == 2  && this.editForm.record.isCurrent) {
            this.stepRowRunning = true;
            this.stepRowRunningIndex = 0;
          }
          else {
            this.stepRowRunning = false;
            this.stepRowRunningIndex = 0;
          }
        }
        else if (notice.type == 2) {
          // this.stepRowRunning=false;

        this.stepRowRunningIndex = 0;
          this.refreshRecord(notice.flowId);
          if (this.editForm.visible  && this.editForm.record.isCurrent) {
            this.nodes.forEach(node => {
              if (node.id == notice.nodeId) {
                console.log('==========ѡнڵ==========' + node.nodeName)
                node.selected = true;
                // this.refreshNode();

              this.selectedNode = node;
                this.getStepList();
              }
              else
                node.selected = false;
            });
          }
        }
        else if (notice.type == 4) {
          this.judementModal.visible = true
          this.judementModal.loading = true
          var data = { parentFlowId: notice.flowId }
          console.log(data)
          exp_flow_case_getAfterJudementList(data).then((res) => {
            this.judementModal.loading = false
            if (res.success) {
              this.judementModal.sampleData = res.data
              this.judementModal.judementFlowId = this.judementModal.sampleData[0].flowId
              console.log('===========================>>>>>>>>>>>>>>>>>>>>>>>>>')
              console.log(this.judementModal.sampleData)
            }
            else {
              this.$message.error('ݼʧ')
            }
          })
        }
        else if(notice.type==5)
        {
          this.$refs.table.refresh()
        }
      });

      this.mySocket.onclose(() => {
        console.log('----->attempting to reconnect....>>>>>');
        setTimeout(() => {
          this.startSocket();
        }, 5000); // 重置5案例:编号:::

    });

      this.mySocket.start().then(() => {
        console.log('Connected to the hub');
      })
        .catch(err => {
          console.error('Error while connecting:', err);
        });
    },
    refreshFun() {
      this.mySocket.invoke("ClientMethod", 'Heartbeat Message!!!!!!!!!!!!!!')
      // this.$router.go(0);

  },
    removeAttribute(key) {
      const oldatt = this.attributeData.attributes.filter((item) => item.key === key)
      if (oldatt != null) {
        oldatt[0].modifyMode = 3
        if (this.attributeData.deletedAttributes == null)
          this.attributeData.deletedAttributes = []
        this.attributeData.deletedAttributes.push(oldatt[0])
      }

      const newData = this.attributeData.attributes.filter(item => item.key !== key)
      this.attributeData.attributes = newData
    },
    newAttribute() {
      console.log(this.attributeData.attributes);

      const length = this.attributeData.attributes.length
      this.attributeData.attributes.push({
        key: length === 0  '1' : (parseInt(this.attributeData.attributes[length - 1].key)' + 1).toString(),
        flowId: 0,
        name: '',
        type: this.attributeDefaultType,
        value: '',
        modifyMode: 1,
      })
    },
    refreshRecord(id) {
      this.isRefreshRecord = true;
      exp_flow_case_detail({ id: id }).then((res) => {
        if (res.success) {
          var data = res.data
          this.conditionData = data.conditions
          this.attributeData.attributes = data.attributes
          this.attributeData.attributes.forEach((item) => {
            item.key = item.id
            item.modifyMode = 2
          })

          console.log(this.$refs.table)

          this.$refs.table._data.localDataSource.forEach((item) => {
            if (item.children.length > 0) {
              item.children.forEach((subItem) => {
                if (subItem.id == data.id) {
                  this.$set(subItem, 'status', data.status);
                  this.$set(subItem, 'active', data.active);
                  this.$set(subItem, 'startTime', data.startTime);
                  this.$set(subItem, 'endTime', data.endTime);
                  this.$set(subItem, 'currentNodeId', data.currentNodeId);
                  this.$set(subItem, 'currentStepId', data.currentStepId);
                  this.refreshTitle(data)

                  this.$set(item, 'status', data.status);
                  this.$set(item, 'active', data.active);
                  this.$set(item, 'startTime', data.startTime);
                  this.$set(item, 'endTime', data.endTime);
                  this.$set(item, 'currentNodeId', data.currentNodeId);
                  this.$set(item, 'currentStepId', data.currentStepId);
                  // this.refreshTitle(data)
                }
              });
            }
            else {
              if (item.id == data.id) {
                this.$set(item, 'status', data.status);
                this.$set(item, 'active', data.active);
                this.$set(item, 'startTime', data.startTime);
                this.$set(item, 'endTime', data.endTime);
                this.$set(item, 'currentNodeId', data.currentNodeId);
                this.$set(item, 'currentStepId', data.currentStepId);
                this.refreshTitle(data)
              }
            }
          });
        } else {
          this.$message.error('ݼʧ') // ' + res.message
        }
        this.isRefreshRecord = false
      })
    },
    getFlowDetail(record) {
      exp_flow_case_detail({ id: record.id }).then((res) => {
        this.formLoading = false
        if (res.success) {
          this.conditionData = res.data.conditions
          this.attributeData.attributes = res.data.attributes
          this.attributeData.attributes.forEach((item) => {
            item.key = item.id
            item.modifyMode = 2
          })
        }
        else {
          this.$message.error('ݼʧ')
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
      // this.conditionData.condition=e

    this.$forceUpdate()
    },
    operationChange(i, e) {
      this.selectedLine.conditions[i].operation = e;
      // this.conditionData.operation=e

    this.$forceUpdate()
    },
    valueChange(i, e) {
      console.log('==========valueChange===========')
      console.log(e.data)
      this.selectedLine.conditions[i].value = e.data;
      // this.conditionData.value=e.data

    this.$forceUpdate()
    },
    fieldNameChange(i, e) {
      this.selectedLine.conditions[i].attributeId = e;
      // this.attributeData.attributeId=e

    this.$forceUpdate()
    },
    cancelEditForm() {
      this.editForm.visible = false
      this.$refs.table.refresh()
    },
    cancelCacheForm() {
      this.cacheForm.visible = false
    },
    cancelSchemeForm(){
      this.schemeForm.visible = false
    },
    handleIntervention() {
      var data = {
        id: this.interventionModal.stepId,
        status: 2,
        remark: this.interventionModal.remark
      };

      data.attributes = this.attributeData.attributes

      exp_flow_case_handleIntervention(data).then((res) => {
        if (res.success) {
          this.interventionModal.visible = false
          this.$message.success('ͳɹ')
        } else {
          this.$message.error('重置ʧ')
        }
      }).catch((err) => {
        this.$message.error('쳣' + err.message)
      })
    },
    handleError(flag) {
      var data = {
        id: this.errorModal.stepId,
        errorHandleType: flag,
        errorHandleMsg: this.errorModal.errorHandleMsg
      };
      exp_flow_case_handleError(data).then((res) => {
        if (res.success) {
          this.errorModal.visible = false
          this.$message.success('ͳɹ')
        } else {
          this.$message.error('重置ʧ')
        }
      }).catch((err) => {
        this.$message.error('쳣' + err.message)
      })
    },
    handleChangeConsumable(flag) {
      var data = {
        id: this.changeConsumableModal.stepId,
        errorHandleType: flag,
        key: this.changeConsumableModal.key
      };
      exp_flow_case_handleError(data).then((res) => {
        if (res.success) {
          this.changeConsumableModal.visible = false
          this.$message.success('ͳɹ')
        } else {
          this.$message.error('重置ʧ')
        }
      }).catch((err) => {
        this.$message.error('쳣' + err.message)
      })
    },
    customRow(record) {
      return {
        on: {
          click: () => {
            this.selectedRow = record;
            this.getFlowDetail(record)
          },
        },
        style: {
          backgroundColor: this.getRowBackground(record), // Change background color based on age

      },
      };
    },
    stepCustomRow(record) {
      return {
        on: {
          click: () => {
            this.selectStepNode = record;
          },
        },
        style: {
          backgroundColor: this.getStepRowBackground(record),
        },
      };
    },
    getRowBackground(record) {
      if (record.status == 0)
        return "";
      else if (record.status == 1)
        return "#8eb6df30";
      else if (record.status == 2)
        return "#d5eb0b80";
      else if (record.status == 3)
        return "#a6e69830";
      else if (record.status == 4)
        return "#a2aa5530";
      else if (record.status == 5)
        return "#da059530";
      else if (record.status == 6)
        return "#13C2C230";
      else if (record.status == 7)
        return "#2332C230";
      else
        return this.selectedRow == record  ('#' + this.$store.getters.color.slice(1) + '15') : '';
    },
    getStepRowBackground(record) {
      if (this.stepRowRunning) {
        if (record.sort < this.stepRowRunningIndex)
          return "#a6e698";
        else if (this.stepRowRunningIndex == record.sort)
          return "#d5eb0b";
        else
          return "";
      }
      else {
        if (record.status == 0)
          return "";
        else if (record.status == 1)
          return "#8eb6df30";
        else if (record.status == 2)
          return "#d5eb0b80";
        else if (record.status == 3)
          return "#a6e69830";
        else if (record.status == 4)
          return "#a2aa5530";
        else if (record.status == 5)
          return "#da059530";
        else
          return this.selectStepNode == record  ('#' + this.$store.getters.color.slice(1) + '15') : '';
      }
    },
    getConsumableTagData(layoutId) {
      var data = { id: layoutId }
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
    getShippingSpaceData(layoutId) {
      var data = { id: layoutId }
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
        case 0:// 重置ű

        remark = equipmentName.concat(' ').concat(record.cmdScript);
          break;
        case 1:// ȡǹͷ

        var fl = this.liquidRanges.filter(item => item.code == record.liquidRange)
          if (fl.length > 0)
            remark = equipmentName.concat(' ').concat(fl[0].value).concat(' ul').concat(' ǹͷ');
          break;
        case 2:// ǹͷ

        var f1 = (record.releaseTipSourcePos)  '˻ԭλ' : '重置'
          var f2 = (record.useReleaseTipSourcePos)  '重置' : '重置'
          remark = equipmentName.concat(' ').concat(f1).concat(' ').concat(f2);
          break;
        case 3:// Һ

        remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul');
          break;
        case 4:// Һ

        remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul');
          break;
        case 5://
          remark = equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' ').concat(record.mixTime).concat('');

        break;
        case 6:// ȴ

        remark = 'ȴʱ : '.concat(record.waitTime).concat('');
          break;
        case 7:// ȡ
                
        remark = equipmentName.concat(' ԴĲ : ').concat(tagName).concat(' ').concat(record.holeIndexStr);
          break;
        case 8:// ˹Ԥ
              
        remark = record.remark;
          break;
        case 9:// 重置
                
        remark = equipmentName.concat(' Ŀλ : ').concat(spaceName).concat(' ').concat(record.holeIndexStr);
          break;
        default:// 重置

        remark = '样品编号 : '.concat(record.methodDescription).concat(' 重置 : ').concat(this.formatExecuteParam(record.executeParam));
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
        var str = "(" + data.map(item => item).join(',')' + ")"
        return str;
      }
    },
    resetAttribute() {
      this.editForm.record = {
        // id:'',

      flowId: 0,
        code: '',
        name: '',
        sampleCode: '',
        centrifugeCode:'',
        status: 0,
        remark: '',
        susceptibilityPlan:[],
        conditionData: [],
        attributeData: [],
      }

      this.editForm.errors = {
        code: false,
        name: false,
        sampleCode: false,
      }

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
    },
    getRunningNode(nodeId) {
      if (this.stepRowRunning) {
        this.nodes.forEach(node => {
          if (node.id == nodeId) {
            console.log('==========ѡнڵ==========' + node.label)
            this.$set(node, 'selected', true);
            this.selectedNode = node;
            this.getStepList();
          }
          else
            this.$set(node, 'selected', false);
        });
      }
    },
    flowChange(id) {
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
      this.stepData = []

      console.log(this.editForm.record.flowId)

      if (this.editForm.isAdd) {
        var flow = this.flowData.filter(item => item.id == this.editForm.record.flowId)[0]
        var key = Date.now()
        exp_flow_case_QuerySampleCentrifugeCode().then((res)=>{
            this.editForm.record.centrifugeCode = res.data.centrifugeCode
        })
        this.editForm.record.isCurrent=false;
        this.editForm.record.code = flow.code + '_' + key;
        this.editForm.record.name = flow.name + '_' + key;
        this.editForm.record.sampleCode = String(key);
        this.editForm.record.type = flow.type;
        this.editForm.record.executeType = flow.executeType
        this.editForm.record.priority = flow.priority
        this.getNodeList(flow.id)
        this.getFlowStepList(flow.layoutId)
        this.getConsumableTagData(flow.layoutId)
        this.getShippingSpaceData(flow.layoutId)

        exp_flow_detail({ id: flow.id }).then((res) => {
          this.formLoading = false
          if (res.success) {
            this.conditionData = res.data.conditions
            this.attributeData.attributes = res.data.attributes
            this.attributeData.attributes.forEach((item) => {
              item.key = item.id
              item.modifyMode = 2
            })
          }
          else {
            this.$message.error('ݼʧ')
          }
        })
      }
      else {
        // this.editForm.record.isCurrent=true;

      const flow = this.flowData.filter(item => item.id == this.editForm.record.flowId)[0]
        this.getCaseNodeList(id)
        this.getFlowStepList(flow.layoutId)
        this.getConsumableTagData(flow.layoutId)
        this.getShippingSpaceData(flow.layoutId)

        this.getRunningNode(flow.currentNodeId)

        exp_flow_case_detail({ id: id }).then((res) => {
          this.formLoading = false
          if (res.success) {
            console.log('===============getFlowCaseDetail=============')
            console.log(res.data)
            this.conditionData = res.data.conditions
            this.attributeData.attributes = res.data.attributes
            this.attributeData.attributes.forEach((item) => {
              item.key = item.id
              item.modifyMode = 2
            })
          }
          else {
            this.$message.error('ݼʧ')
          }
        })
      }
    },
    getFlowStepList(layoutId) {
      var data = { layoutId: layoutId, pid: 0 };
      exp_flow_step_list(data).then((res) => {
        if (res.success) {
          this.stepParentData = res.data
          // console.log('===============getFlowStepList=============')
          // console.log(this.stepParentData)

        this.removeEmptyChildren(this.stepParentData)
        } else {
          this.$message.error('ݼʧ') // ' + res.message
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
    getNodeList(flowId) {
      this.flowLoading = true
      var data = { id: flowId };
      exp_flow_getNodeList(data).then((res) => {
        if (res.success) {
          var temps = res.data
          // console.log('===============getNodeList=============')
          // console.log(temps)


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
          this.$message.error('ݼʧ') // ' + res.message
        }
      }).finally((res) => {
        this.flowLoading = false
      })
    },
    getStepList() {
      console.log('===============getStepList=============')
      if (this.editForm.isAdd) {
        var data = { pid: this.selectedNode.stepParentId };
        exp_flow_step_list(data).then((res) => {
          if (res.success) {
            this.stepData = res.data
            this.removeEmptyChildren(this.stepData)
          } else {
            this.$message.error('ݼʧ') // ' + res.message
          }
        }).finally(() => {
        })
      }
      else {
        var data = { pid: this.selectedNode.stepParentId, flowId: this.editForm.record.id, nodeId: this.selectedNode.id };
        exp_flow_case_getStepList(data).then((res) => {
          if (res.success) {
            console.log('===============exp_flow_case_getStepList=============')
            console.log(res.data)
            this.stepData = res.data
            this.removeEmptyChildren(this.stepData)
          } else {
            this.$message.error('ݼʧ') // ' + res.message
          }
        }).finally(() => {
        })
      }
    },
    getCaseNodeList(flowId) {
      this.flowLoading = true
      var data = { flowId: flowId };
      exp_flow_case_getNodeList(data).then((res) => {
        if (res.success) {
          var temps = res.data

          console.log('===============getCaseNodeList=============')
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
          this.$message.error('ݼʧ') // ' + res.message
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
      var w = 150;
      var h = 80;
      var r = 25;
      if (type === 'start' || type === 'end')
        w = 50;
      var stepParentId = 0;

      var label = type === 'start' : 'ʼ' : (type === 'end' : '重置' : 'ͨڵ');

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
      // if(this.selectedNode)
      // {
      //   this.selectedNode.stepParentId=id;
      //   this.selectedNode.label=this.stepParentData.filter(item=>item.id===this.selectedNode.stepParentId)[0].name
      // }

  },
    selectNode(node) {
      // 案例:编号:::
      // this.$nextTick(()=>{
      //   this.$refs.container.scrollTop = node.y/1.1
      //   this.$refs.container.scrollLeft = node.x/2
      /**
       * })
       */
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
        this.selectedLine = null;
        // this.connecting = false; // Reset connecting mode

      this.nodes.forEach(n => n.selected = false); // Deselect all nodes
        node.selected = true; // Select the clicked node and set connecting mode

      this.refreshNode();
        this.selectedNode = node;

        console.log('===============selectNode=============')
        console.log(this.selectedNode)
        this.getStepList();
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
        this.deleteNodes.push({ id: node.id, modifyMode: 3 })

      var lss = this.lines.filter(l => l.startNodeId === node.id || l.endNodeId === node.id && l.modifyMode === 2);
      if (lss != null) {
        lss.forEach(ls => {
          this.deleteNodes.push({ id: ls.id, modifyMode: 3 })
        });
      }

      this.nodes = this.nodes.filter(n => n.id !== node.id);
      this.lines = this.lines.filter(line => line.start.id !== node.id && line.end.id !== node.id);
    },
    selectLine(line) {
      this.refreshNode();
      // console.log(this.selectedLine);


    this.selectedNode = null;
      // ѡ߶

    this.lines.forEach(l => l.selected = false); // ȡ案例:编号:::߶εѡ״̬
      line.selected = true; /**
       * õǰ߶Ϊѡ״̬
       */
      if (this.selectedLine != null && this.selectedLine.id !== line.id) {
        this.lines.filter(l => l.id === this.selectedLine.id)[0] = this.selectedLine
      }
      this.selectedLine = line; /**
       * 洢ѡе߶
       */
      if (this.conditionData != null && this.conditionData.length > 0) {
        this.selectedLine.conditions = this.conditionData.filter(item => item.lineId === this.selectedLine.id)
      }
      this.$forceUpdate()
    },
    deleteLine(line) {
      if (line.modifyMode === 2)
        this.deleteNodes.push({ id: line.id, modifyMode: 3 })

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
      };
      // console.log(newLine);

    this.lines.push(newLine);
    },
    toggleConnecting() {
      this.connecting = !this.connecting; // Toggle connecting mode

  },
    startDrag(node, event) {
      if (!this.editForm.canEdit)
        return;
      this.draggingNode = node;
      this.offsetX = event.clientX - node.x; // ¼重置Խڵƫ重置

    this.offsetY = event.clientY - node.y;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event) {
      if (this.draggingNode) {
        // ڵλãȷ重置ָ重置ڵλö

      this.draggingNode.x = event.clientX - this.offsetX;
        this.draggingNode.y = event.clientY - this.offsetY;
      }
    },
    stopDrag() {
      this.draggingNode = null;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
    },
    getLinePoints(node) {
      if (node.type === 'start' || node.type === 'end') {
        return [
          { x: node.x' + node.r, y: node.y },
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
    cancelCase(record) {
      var data = { id: record.id };
      exp_flow_case_cancelCase(data).then((res) => {
        if (res.success) {
          this.selectedNode = null;
          // this.refreshRecord(record.id);
 
        this.$refs.table.refresh(true);
          this.$message.success('ȡ案例:编号:::ɹ')
        } else {
          this.stepRowRunning = false;
          this.stepRowRunningIndex = 0;
          this.$message.error('ȡ重置ʧ') // ' + res.message
        }
      })
    },
    pauseCase(record) {
      var data = { id: record.id };
      exp_flow_case_pauseCase(data).then((res) => {
        if (res.success) {
          this.selectedNode = null;
          this.editForm.record.status = 4;
          // this.refreshRecord(record.id);
 
        this.$refs.table.refresh(true);
          this.$message.success('ͣ重置ɹ')
        } else {
          this.stepRowRunning = false;
          this.stepRowRunningIndex = 0;
          this.$message.error('ͣ重置ʧ') // ' + res.message
        }
      })
    },
    continueCase(record) {
      var data = { id: record.id };
      exp_flow_case_continueCase(data).then((res) => {
        if (res.success) {
          this.selectedNode = null;
          this.editForm.record.status = 2;
          // this.refreshRecord(record.id);
 
        this.$refs.table.refresh(true);
          this.$message.success('案例:编号:::ɹ')
        } else {
          this.stepRowRunning = false;
          this.stepRowRunningIndex = 0;
          this.$message.error('案例:编号:::ʧ') // ' + res.message
        }
      })
    },
    addQueue(record) {
      var data = { id: record.id };
      exp_flow_case_addQueue(data).then((res) => {
        if (res.success) {
          this.selectedNode = null;
          this.editForm.record.status = 1;
          // this.refreshRecord(record.id);
 
        this.$refs.table.refresh(true);
          this.startSocket();
          this.$message.success('ŶӲ重置ɹ')
        } else {
          this.stepRowRunning = false;
          this.stepRowRunningIndex = 0;
          this.$message.error('ŶӲʧ') // ' + res.message
        }
      })
    },
    add() {
      this.resetAttribute()
      this.editForm.title = '案例:编号:::'
      this.editForm.visible = true
      this.editForm.isAdd = true
      this.stepRowRunning = false
      if (this.flowData.length > 0) {
        this.editForm.record.flowId = this.flowData[0].id
        // 查询

      this.flowChange(this.editForm.record.flowId)
      }
    },
    opencache() { 
      this.resetAttribute()
      this.cacheForm.visible = true;
      exp_flow_case_getcachelist().then((res) => {
        this.cacheForm.cachedatalist = res.data;
      });

      exp_consumable_page(Object.assign(this.aparameter, this.aqueryParam)).then((res) => {
        this.recordData = res.data.rows
      })
    },
    async handleCacheList() {
      for (let i = 0; i < this.recordData.length; i++) {

        await exp_consumable_edit(this.recordData[i]).then((res) => {
          if (!res.success) {
            this.$message.error(res.message)
          }
        })
      };
      await exp_flow_case_savecacheinput(this.cacheForm.cachedatalist).then((res) => {
        this.cacheForm.visible = false;
        if (res.success) {
          this.$message.success('重置ɹ')
        }
        else {
          this.$message.error('重置ʧܣ')
        }
      });
    },
    openSelectScheme() {
      this.schemeForm.groupList = [];
      const { allActive, groupedCells } = this.getActiveGroupCells(this.schemeForm.rows, this.schemeForm.cols);
      let keyIndex = 0;
      const keys = Object.keys(allActive);
      this.editForm.record.susceptibilityPlan.forEach(isTrue => {
        if (isTrue) {
          for (let i = 0; i < 6 && keyIndex < keys.length; i++) {
            const key = keys[keyIndex];
            allActive[key] = true;
            this.schemeForm.groupList.push(key);
            keyIndex++;
          }
        } else {
          keyIndex += 6;
        }
      });
      this.schemeForm.groupedCells = groupedCells;
      this.schemeForm.visible = true;
    },
    handleSchemeList() {
      this.editForm.record.susceptibilityPlan = []
      const result = Array.from({ length: 7 }, () => Array(3).fill(false));
      this.schemeForm.groupedCells.forEach((rowGroup, rowIndex) => {
        rowGroup.forEach((cellGroup, colIndex) => {
          const isActive = cellGroup.some(cellKey => this.schemeForm.groupList.includes(cellKey));
          result[rowIndex][colIndex] = isActive;
        });
      });
      this.editForm.record.susceptibilityPlan = []
      this.editForm.record.susceptibilityPlan = result.flat();
      console.log("案例:编号:::飺", this.schemeForm.groupList);
      console.log("ת重置37н重置", this.editForm.record.susceptibilityPlan);
      this.schemeForm.visible = false;
      return result;
    },
    SelectPlaning(row, col) {
      const cellKey = `${row}-${col}`;
      /**
       * 重置37з鷽
       */
      for (let rowIndex = 0; rowIndex < this.schemeForm.groupedCells.length; rowIndex++) {
        for (let colIndex = 0; colIndex < this.schemeForm.groupedCells[rowIndex].length; colIndex++) {
          const cells = this.schemeForm.groupedCells[rowIndex][colIndex];
          if (cells.includes(cellKey)) {
            const isActive = cells.every(key => this.schemeForm.groupList.includes(key));
            if (isActive) {
              this.schemeForm.groupList = this.schemeForm.groupList.filter(key => !cells.includes(key));
            } else {
              for (const key of cells) {
                if (!this.schemeForm.groupList.includes(key)) {
                  this.schemeForm.groupList.push(key);
                }
              }
            }
            return;
          }
        }
      }
    },

    edit(record) {
      console.log('=====edit=====');
      console.log(record);

      this.resetAttribute()
      this.editForm.visible = true
      this.editForm.isAdd = false
      this.editForm.record.id = record.id
      this.editForm.record.flowId = record.flowId
      this.editForm.record.name = record.name
      this.editForm.record.code = record.code
      this.editForm.record.type = record.type
      this.editForm.record.executeType = record.executeType
      this.editForm.record.priority = record.priority
      this.editForm.record.sampleCode = record.sampleCode
      this.editForm.record.centrifugeCode = record.centrifugeCode
      this.editForm.record.susceptibilityPlan = record.susceptibilityPlan
      this.editForm.record.remark = record.remark
      this.editForm.record.status = record.status
      this.editForm.record.conditionData = record.conditionData
      this.editForm.record.attributeData = record.attributeData
      this.refreshTitle(this.editForm.record)

      this.editForm.record.isCurrent=true;

      this.flowChange(record.id)
    },
    refreshTitle(record) {
      var statusName = this.flowStatus.filter(item => item.code == record.status)[0].value
      this.editForm.title = (record.status < 2  '༭' : '鿴') + '重置' + record.sampleCode + ' , ״̬' + statusName
    },
    getFlowData() {
      var data = {};
      exp_flow_list(data).then((res) => {
        if (res.success) {
          this.flowData = res.data
        } else {
          this.$message.error('ݼʧ') // ' + res.message
        }
      })
    },
    sysDictTypeDropDown(text) {
      sysDictTypeDropDown({ code: 'expflow_status' }).then((res) => {
        this.flowStatus = res.data
        this.flowStatus.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })

      sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
        this.liquidRanges = res.data
        this.liquidRanges.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })

      sysDictTypeDropDown({ code: 'flow_type' }).then((res) => {
        this.flowTypes = res.data
        this.flowTypes.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })

      sysDictTypeDropDown({ code: 'flow_execute_type' }).then((res) => {
        this.executeTypes = res.data
        this.executeTypes.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })

      sysDictTypeDropDown({ code: 'flow_priority' }).then((res) => {
        this.flowPrioritys = res.data
        this.flowPrioritys.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })

      sysDictTypeDropDown({ code: 'sample_status' }).then((res) => {
        this.sampleStatus = res.data
        this.sampleStatus.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })
    },
    flowFilter(flowId) {
      const values = this.flowData.filter(item => item.id == flowId)
      if (values.length > 0) {
        return values[0].name
      }
    },
    statusFilter(status) {
      const values = this.flowStatus.filter(item => item.code == status)
      if (values.length > 0) {
        return values[0].value
      }
    },
    typeFilter(status) {
      const values = this.flowTypes.filter(item => item.code == status)
      if (values.length > 0) {
        return values[0].value
      }
    },
    formatDate(text)
    {
      if(text!=null)
        return moment(text).format('YYYY-MM-DD')
      else
        return ''
    },
    // ״̬ж

  sampleStatusFilter(status) {
      const values = this.sampleStatus.filter((item) => item.code === status);
      if (values.length > 0) {
        return values[0].value;
      }
    },
    exp_flow_case_delete(record) {
      exp_flow_case_delete(record).then((res) => {
        if (res.success) {
          this.$message.success('ɾɹ')
          this.$refs.table.refresh()
        } else {
          this.$message.error('ɾʧ') // ' + res.message
        }
      })
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    handleOk() {
      this.$refs.table.refresh()
    },
    validateFields() {
      var result = true;
      this.editForm.errors.code = !this.editForm.record.code;
      this.editForm.errors.name = !this.editForm.record.name;
      this.editForm.errors.sampleCode = !this.editForm.record.sampleCode;
      this.editForm.errors.centrifugeCode = !this.editForm.record.centrifugeCode;
      for (const key in this.errors) {
        if (this.errors[key]) {
          result = false
          break;
        }
      }
      return result
    },
    saveCase() {
      console.log('=================handleSubmit=================')
      if (!this.validateFields())
        return;

      if (this.attributeData.deletedAttributes != null && this.attributeData.deletedAttributes.length > 0)
        this.attributeData.attributes.push(...this.attributeData.deletedAttributes)

      this.flowLoading = true;
      this.editForm.record.conditions = this.conditionData
      this.editForm.record.attributes = this.attributeData.attributes
      console.log(this.editForm.record);

      if (this.editForm.isAdd) {
        // Զ案例:编号:::

      exp_flow_case_add(this.editForm.record).then((res) => {
          this.flowLoading = false
          if (res.success) {
            this.$message.success('ӳɹ')
            this.editForm.visible = false;
            this.$refs.table.refresh()
          } else {
            this.$message.error(res.message)
          }
        })
      }
      else {
        // Զ案例:编号:::

      exp_flow_case_edit(this.editForm.record).then((res) => {
          this.flowLoading = false
          if (res.success) {
            this.$message.success('༭ɹ')
            console.log(this.editForm.record);

            this.editForm.visible = false;
            this.$refs.table.refresh()
          } else {
            this.$message.error(res.message)
          }
        })
      }
    },
    getConvert(value, name, key) {
      // ƥ重置ĸ重置ֵĸʽ重置ĸ重置λ重置

    if (/^[A-Za-z]\d' + $/.test(value)) {
        const letter = value[0].toUpperCase();
        const num = parseInt(value.slice(1));
        const row = letter.charCodeAt(0) - 'A'.charCodeAt(0);
        const col = num - 1;
        const number = key == 'TipCache' && name == 'Ĺ'  12 : key.includes('CellCount')  5 : 8;
        return number * col' + row;
      } else if (/^\d+$/.test(value) || value < 0) {
        // 案例:编号:::重置

      return value;
      }
      return null; // ʽƥʱ重置 null

  },
    getRows(name, key) {
      // 重置 name жϷزͬ案例:编号:::

    return key == 'TipCache' && name == 'Ĺ' : this.centrifugeTubeRows : key.includes('CellCount')  this.cellcacheRows : this.defaultRows;
    },
    getActiveCells(value, rows, cols, name, key) {

      if (key == 'TipCache') {
        value = JSON.parse(value);
        const active = {};
        for (let c = 1; c < = cols; c++) {
          for (let r = 0; r < rows.length; r++) {
            active[`${rows[r]}-${c}`] = !value[(c - 1) * rows.length + r];
          }
        }
        return active;
      }
      else {
        value = this.getConvert(value, name, key);
      }
      if (value == -1) {
        const allActive = {};
        for (let col = 1; col <= cols; col++) {
          for (let r = 0; r < rows.length; r++) {
            allActive[`${rows[r]}-${col}`] = false;
          }
        }
        return allActive;
      }
      if (value == 0) {
        const allActive = {};
        for (let col = 1; col <= cols; col++) {
          for (let r = 0; r < rows.length; r++) {
            allActive[`${rows[r]}-${col}`] = true;
          }
        }
        return allActive;
      }
      if (value < 0 || value > rows.length * cols) return {};
      const col = Math.floor(value / rows.length) + 1;
      const rowIndex = (value) % rows.length;
      const active = {};
      for (let c = col; c <= cols; c++) {
        for (let r = 0; r < rows.length; r++) {
          if (c === col && r < rowIndex) continue;
          active[`${rows[r]}-${c}`] = true;
        }
      }
      return active;
    },
    getActiveGroupCells(rows, cols) {
      const allActive = {};
      const groupedCells = Array.from({ length: 7 }, () => Array(3).fill(null));

      let groupIndex = 0;
      for (let row = 1; row < Math.min(rows.length, 7 * 2); row += 2) {
        let col = 2;
        for (let colIndex = 0; colIndex < 3; colIndex++) {
          const group = [];
          for (let i = 0; i < 6; i++) {
            if (col > cols) break;
            const cellKey = `${rows[row]}-${col}`;
            allActive[cellKey] = false;
            group.push(cellKey);
            col++;
          }
          groupedCells[Math.floor(groupIndex / 3)][colIndex] = group;
          groupIndex++;
          col += 2;
        }
      }
      return { allActive, groupedCells }; // ؼ״̬37еķ重置Ϣ

  },
    getActiveCellsForIndex(value, name, key) {

      const rows = this.getRows(name, key);
      const cols = key == 'TipCache' && name === 'Ĺ'  8 : key.includes('CellCount')  4 : 12;
      return this.getActiveCells(value, rows, cols, name, key);
    },
    handleCellClick(row, col, index) {
      const item = this.cacheForm.cachedatalist[index];
      /**
       * TipCache案例:编号:::⴦
       */
      if (item.key === 'TipCache') {
      return this.handleTipCacheClick(row, col, index);
      }
      const rows = this.getRows(item.name, item.key);
      const cols = item.key == 'TipCache' && item.name === 'Ĺ'  8 : item.key.includes('CellCount')  4 : 12;
      const clickedIndex = (col - 1) * rows.length' + rows.indexOf(row);
      const currentActiveCells = this.getActiveCellsForIndex(item.value, item.name, item.key);

      // 案例:编号:::ԲǰǷѡеԲ

    let hasPreviousActive = false;
      for (let c = 1; c < col; c++) {
        for (let r = 0; r < rows.length; r++) {
          if (currentActiveCells[`${rows[r]}-${c}`]) {
            hasPreviousActive = true;
            break;
          }
        }
        if (hasPreviousActive) break;
      }
      if (!hasPreviousActive) {
        for (let r = 0; r < rows.indexOf(row); r++) {
          if (currentActiveCells[`${rows[r]}-${col}`]) {
            hasPreviousActive = true;
            break;
          }
        }
      }

      if (hasPreviousActive) {
        /**
       * Բǰ重置ѡеԲ㣬Բǰ涼重置ѡУ重置涼ѡ
       */
      if (item.key == 'TipCache') {
          const arr = [];
          for (let c = 1; c < = 96; c++) {
            arr.push(c <= clickedIndex  true : false);
          }
          this.cacheForm.cachedatalist[index].value = JSON.stringify(arr);
        }
        else if (item.key == 'CellCount_HolePos' || item.key == "PCR_HolePos") {
          this.cacheForm.cachedatalist[index].value = row' + col.toString();
        }
        else {
          this.cacheForm.cachedatalist[index].value = clickedIndex;
        }
      } else {
        // ԲǰûѡеԲ㣬Բ重置ȫ重置

      const allCells = cols * rows.length;
        if (clickedIndex <= allCells) {
          if (item.key == 'TipCache') {
            const arr = [];
            for (let c = 1; c < = 96; c++) {
              arr.push(c <= clickedIndex  true : false );
            }
            this.cacheForm.cachedatalist[index].value = JSON.stringify(arr);
          }
          else if (item.key == 'CellCount_HolePos' || item.key == "PCR_HolePos") {
            this.cacheForm.cachedatalist[index].value = row' + col.toString();
          }
          else {
            this.cacheForm.cachedatalist[index].value = clickedIndex;
          }
        }
      }

    },
    // TipCache案例:编号:::重置+ק
  handleTipCacheClick(row, col, index) {
    const item = this.cacheForm.cachedatalist[index];
    const rows = this.getRows(item.name, item.key);
    const clickedIndex = (col - 1) * rows.length + rows.indexOf(row);
    const arr = JSON.parse(item.value);

    // 案例:编号:::ק重置ĵ案例:编号:::

  if (this.tipDrag.isDragging) return;

    // 重置л流程状态::

  arr[clickedIndex] = !arr[clickedIndex];
    this.$set(item, 'value', JSON.stringify(arr));
  },

  // TipCacheקʼ
  startTipDrag(row, col, index) {
    const item = this.cacheForm.cachedatalist[index];
    if (item.key !== 'TipCache') return;

    const rows = this.getRows(item.name, item.key);
    const clickedIndex = (col - 1) * rows.length' + rows.indexOf(row);
    
    this.tipDrag = {
      isDragging: true,
      startRow: row,
      startCol: col,
      currentIndex: index,
      startState: JSON.parse(item.value)[clickedIndex]
    };
  },

  // TipCacheק重置
  handleTipDrag(row, col, index) {
    if (!this.tipDrag.isDragging || index !== this.tipDrag.currentIndex) return;

    const item = this.cacheForm.cachedatalist[index];
    const rows = this.getRows(item.name, item.key);
    const arr = JSON.parse(item.value);

    // 案例:编号:::ѡ

  const minRow = Math.min(rows.indexOf(this.tipDrag.startRow), rows.indexOf(row));
    const maxRow = Math.max(rows.indexOf(this.tipDrag.startRow), rows.indexOf(row));
    const minCol = Math.min(this.tipDrag.startCol, col);
    const maxCol = Math.max(this.tipDrag.startCol, col);

    // 重置ѡ״̬重置תʼ״̬

  for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        const idx = (c - 1) * rows.length + r;
        arr[idx] = !this.tipDrag.startState;
      }
    }

    this.$set(item, 'value', JSON.stringify(arr));
  },

  // ק重置
  endTipDrag() {
    this.tipDrag = {
      isDragging: false,
      startRow: null,
      startCol: null,
      currentIndex: null,
      startState: false
    };
  }
  }
}
</script>
<style scoped>
/* 重置ʽ */
       */
.plate-container {
  border: 1px solid #ddd;
  width: 350px;
  height: 320px;
  padding: 16px;
  background: white;
}

.top-header {
  display: flex;
  height: 22px;
}

.header-cell {
  width: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.row-container {
  display: flex;
  height: 22px;
}

.row-label {
  width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.cell {
  width: 20px;
  height: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 50%;
  margin: 1px;
  transition: background-color 0.2s;
  cursor: pointer;
  /* ޸Ϊɵ */
       */
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell.active {
  background-color: #00bfa5;
  border-color: #009688;
}

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
  height: 800px;
  overflow: scroll;
}

.canvas {
  border: 1px solid #ccc;
  margin-top: 5px;
  position: relative;
  width: 170%;
  height: 300%;
  background: url('data:image/svg'+xml;utf8,<svg xmlns="http:// www.w3.org/2000/svg" width="10" height="10"><rect width="100%" height="100%" fill="none"></rect><path d="M 0,0 l 1,0 l 0,1 M 1,1 l -1,0" stroke="gray" stroke-width="0.5" ></path></svg>') repeat;
}

.span-unit {
  margin-left: 5px;
}

.span-label {
  width: 100px;
  height: 25px;
  padding: 5px;
  text-align: right;
  display: inline-block;
  color: black;
  clear: both;
}

.my-checkbox {
  color: black;
}

.span-text {
  width: 280px;
  height: 25px;
  text-align: left;
  padding: 5px;
  display: inline-block;
  color: black;
  clear: both;
  border: #ccc solid 1px;
}



/* ƿ案例:编号:::ʽ */
       */
.cache-modal-bottle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px auto;
  position: relative;
  width: 80px;
}

.cache-modal-bottle {
  position: relative;
  width: 40px;
  height: 120px;
  background-color: rgba(245, 245, 245, 0.8);
  border: 1px solid #d9d9d9;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.cache-modal-bottle-neck {
  width: 16px;
  height: 12px;
  background: inherit;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
  margin-top: -1px;
}

.cache-modal-bottle-cap {
  width: 20px;
  height: 4px;
  background: #bfbfbf;
  border-radius: 2px 2px 0 0;
}

/* Һ重置ʽ */
       */
.cache-modal-liquid {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #00bfa5;
  transition: height 0.3s ease;
}

/* ̶ʽ */
       */
.cache-modal-scale {
  position: absolute;
  left: calc(100%' + 8px);
  height: 100%;
  width: 20px;
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
  /* 重置̶ֵλ */
       */
  font-size: 8px;
  /* С̶ֵ重置С */
       */
  color: #666;
}


/* 重置ıѡ */
       */
.plate-container {
  user-select: none;
  -webkit-user-select: none;
} 

/* קѡЧ */
       */
.drag-selecting {
  box-shadow: 0 0 0 1px #ff0000;
}

/* Ԫ񼤻״̬ */
       */
.cell.active {
  background-color: #00bfa5;
}
</style>
