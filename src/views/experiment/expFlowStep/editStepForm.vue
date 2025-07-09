<template>
  <a-modal :title="title" :width="(attributeData.type === 3 || attributeData.type === 4 || attributeData.type === 5 || attributeData.type === 7 || attributeData.type === 9) ? (600 + (currentConsumableTag?.colCount + 1) * 37) : 800" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <consumable-edit-form ref="consumableEditFormRef" @ok="handleOk" />
    <a-spin :spinning="formLoading">
      <div style="display: flex; clear: both;">
        <div style="float:left;height:auto;">
          <a-row :gutter="8">
            <div>
              <sp-input label="步骤名称" :required="true" :isError="errors.name" :labelWidth="90" :inputWidth="200" v-model="attributeData.name" />
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type <= 101 || attributeData.type === 801 || attributeData.type === 901 || attributeData.type === 1001">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">设备：</span>
              <a-select style="width: 200px" placeholder="请选择设备" v-model:value="attributeData.equipmentId" @change="equipmentChange">
                <a-select-option v-for="item in equipmentData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 取枪头 -->
          <a-row :gutter="8" v-if="attributeData.type === 1">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">枪头类型：</span>
              <a-select style="width: 100px" v-model:value="attributeData.liquidRange">
                <a-select-option v-for="item in liquidRanges" :key="item.code" :value="item.code">{{ item.value }}</a-select-option>
              </a-select>
              <span class="span-unit">(μl)</span>
            </div>
          </a-row>

          <!-- 退枪头 -->
          <a-row :gutter="8" v-if="attributeData.type===2">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:200px;">枪头是否退回原位：</span>
              <a-radio-group  v-model="attributeData.releaseTipSourcePos">
                <a-radio v-for="(item, index) in yesnos" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label" style="width:200px;">退回原位枪头是否复用：</span>
              <a-radio-group  v-model="attributeData.useReleaseTipSourcePos">
                <a-radio v-for="(item, index) in yesnos" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

            </div>
          </a-row>

          <!-- 吸喷液,混合 -->
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">耗材：</span>
              <a-select style="width: 200px" placeholder="请选择耗材" v-model:value="attributeData.consumableTagId" @change="consumableTagChange">
                <a-select-option v-for="item in consumableTagData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
               <a-button type="primary" style="margin-left:5px;" @click="btnGetConsumable()">耗材参数</a-button>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3">
            <div style="margin-top:10px;">
                <span class="span-label" style="width:100px;">关闭液面探测：</span>
                <a-checkbox v-model="attributeData.isStepStopDetectLiquid" />
              </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===4">
            <div style="margin-top:10px;">
                <span class="span-label" style="width:100px;">喷液完成后吸喷：</span>
                <a-checkbox v-model="attributeData.isStepAbsorAndJet" />
              </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===1 || attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">通道数：</span>
              <a-select style="width: 80px" v-model="attributeData.channelRow">
                <a-select-option v-for="item in channelRows" :key="item" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">行</span>
              <a-select style="width: 80px;margin-left:10px;" v-model="attributeData.channelCol">
                <a-select-option v-for="item in channelRows" :key="item" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">列</span>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">试剂：</span>
              <a-select style="width: 200px" placeholder="请选择试剂" v-model:value="attributeData.liquidId">
                <a-select-option v-for="item in liquidData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="体积" :labelWidth="90" :inputWidth="80" unit="μl" v-model="attributeData.volume"/>

              <sp-input-number label="混合次数" :labelWidth="70" :inputWidth="70" :rightEmpty="true" v-if="attributeData.type===5" v-model="attributeData.mixTime" :step="1" />

             </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="混合间隔" :labelWidth="70" :inputWidth="70" :rightEmpty="true" v-if="attributeData.type===5" v-model="attributeData.mixInterval" :step="1" />

              <sp-input-number label="X偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.xOffset"/>
             </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="等待时间" :labelWidth="80" :inputWidth="70" unit="min" :rightEmpty="true" v-if="attributeData.type===5" v-model="attributeData.waitTime" :step="1" />

              <sp-input-number label="Y偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.yOffset"/>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="Z偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.zOffset"/>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">特殊方法：</span>
              <a-select style="width: 180px" v-model:value="attributeData.specialMethod">
                <a-select-option v-for="item in specialMethods" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===1">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">特殊方法：</span>
              <a-select style="width: 180px" v-model:value="attributeData.specialMethod">
                <a-select-option v-for="item in tipSpecialMethods" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 等待 -->
          <a-row :gutter="8" v-if="attributeData.type===6">
            <div style="margin-top:10px;">
              <sp-input-number label="等待时间" :labelWidth="90" unit="秒" v-model="attributeData.waitTime" :step="1"/>

              <sp-input label="等待提醒" v-model="attributeData.waitTip" />
            </div>
          </a-row>

          <!-- 夹取 -->
          <a-row :gutter="8" v-if="attributeData.type===7">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">夹抓源盘：</span>
              <a-select style="width: 200px" placeholder="请选择夹抓源盘" v-model:value="attributeData.consumableTagId"  @change="consumableTagChange">
                <a-select-option v-for="item in consumableTagData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 放置  -->
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">夹抓源盘：</span>
              <a-select style="width: 200px" placeholder="请选择夹抓源盘" v-model:value="attributeData.consumableTagId"  @change="consumableTagChange">
                <a-select-option v-for="item in consumableTagData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">目标舱位：</span>
              <a-select style="width: 250px" placeholder="请选择目标舱位" v-model:value="attributeData.targetSpaceId" @change="targetSpaceChange">
                <a-select-option v-for="item in shippingSpaceData" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">松开夹抓：</span>
              <a-checkbox v-model="attributeData.isClipRelease" />
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="X偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.xOffset"/>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="Y偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.yOffset"/>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="Z偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.zOffset"/>
            </div>
          </a-row>

          <!-- 脚本命令  -->
          <a-row :gutter="8" v-if="attributeData.type===0" style="height:335px;">
            <div style="margin-top:10px;display: flex; align-items: flex-start;">
              <span class="span-label" style="width:100px;">脚本命令：</span>
              <a-textarea placeholder="请输入脚本命令" style="width:500px;font-size:16px;color:black;" rows="15" v-model:value="attributeData.cmdScript" allow-clear/>
              <a-button type="primary" style="margin-left:5px;" @click="btnDoCmd()" :loading="scriptRunning">执行</a-button>
            </div>
          </a-row>

          <!-- 第三方控制器  -->
          <a-row :gutter="8" v-if="attributeData.type>100">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">设备事件：</span>
              <a-select style="width: 250px" placeholder="请选择设备事件" v-model:value="attributeData.executeMethod" @change="methodChange">
                <a-select-option v-for="item in controlMethodData" :key="item.methodName" :value="item.methodName">{{ item.summary }}</a-select-option>
              </a-select>
              <a-button type="primary" style="margin-left:5px;" @click="doMethod()" :loading="scriptRunning">执行</a-button>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type>100 && selectMethod!=null" style="height: auto;">
            <div style="margin-top:10px;">
              <a-table size="middle" :columns="columns" :dataSource="selectMethod.parameters" style="margin-left:100px;"
              :pagination="false" rowKey="paramName">
                <template #value="{ text, record }">
                   <sp-input v-model="record.value" :labelEmpty="true" placeholder="请输入值"/>
                </template>
              </a-table>
            </div>
          </a-row>

          <a-row :gutter="8">
            <div style="margin-top:10px;">
              <sp-input-number label="排序" :labelWidth="90" :inputWidth="80"  v-model="attributeData.sort" :step="1"/>
            </div>
          </a-row>

          <!-- <a-row :gutter="8" style="height:100px;">
            <div style="margin-top:10px;display: flex; align-items: flex-start;">
              <span class="span-label" style="width:140px;">备注：</span>
              <a-textarea placeholder="请输入备注" style="width:250px;font-size:16px;color:black;" rows="3" v-model="attributeData.remark" allow-clear/>
            </div>
          </a-row> -->
        </div>

        <div v-if="(attributeData.type === 3 || attributeData.type === 4 || attributeData.type === 5 || attributeData.type === 7 || attributeData.type === 9) && currentConsumableTag!=null"
        style="float:right;height:100%;margin-left:20px;padding:10px;padding-right:20px;background-color:#EBEEF5">
          <a-row :gutter="8"
            :style="{
              height:(32*(currentConsumableTag.rowCount+1))+'px'
            }">
            <table>
              <tr v-for="(r, i) in holes" :key="i">
                  <td v-for="(c, j) in r" :key="j">
                      <a-button
                          v-if=" i > 0  && j > 0"
                          style="width:30px;height:30px;border:0px;"
                          :class="{holecolorselected:holes[i][j].isSelected}"
                          shape="circle"
                          @click="selectHole(i,j)"></a-button>
                      <a-button style="width:30px;height:30px;background-color:#EBEEF5;color:black;border:0px;" shape="circle" type="text" disabled v-if="i === 0 && j> 0">{{numbers[j-1]}}</a-button>
                      <a-button style="width:30px;height:30px;background-color:#EBEEF5;color:black;border:0px;" shape="circle" type="text" disabled v-if="j === 0 && i> 0">{{letters[i-1]}}</a-button>
                  </td>
              </tr>
            </table>
          </a-row>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {doMethod as doApiMethod, doCmd} from '@/api/modular/experiment/debug'
import { exp_flow_step_add, exp_flow_step_edit } from '@/api/modular/experiment/expFlowStepManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { exp_liquid_list } from '@/api/modular/experiment/liquidManage'
import { exp_equipment_list, exp_equipment_getControlMethods, exp_equipment_getPipetteAttribute } from '@/api/modular/experiment/equipmentManage'
import { exp_consumable_list, exp_consumable_getConsumableTags, exp_getConsumable_Param } from '@/api/modular/experiment/consumableManage'
import { exp_layout_getShippingSpaces } from '@/api/modular/experiment/layoutManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'
import ConsumableEditForm from '../consumable/editForm.vue'

const emit = defineEmits(['ok'])

const visible = ref(false)
const title = ref('实验步骤')
const formLoading = ref(false)
const scriptRunning = ref(false)

const attributeData = ref({
  type: -1,
  pid: '0',
  name: '',
  volume: 0,
  mixTime: 1,
  mixInterval: 1,
  waitTime: 0,
  waitTip: '',
  liquidId: null,
  targetSpaceId: null,
  consumableTagId: null,
  cmdScript: '',
  sort: 0,
  controlClass: '',
  executeMethod: '',
  methodDescription: '',
  executeParam: '',
  holeIndex: 0,
  holeIndexStr: '',
  liquidRange: null,
  releaseTipSourcePos: false,
  useReleaseTipSourcePos: false,
  description: '',
  remark: '',
  channelRow: 1,
  channelCol: 1,
  xOffset: 0,
  yOffset: 0,
  zOffset: 0,
  isClipRelease: true,
  isSpecialAction: false,
  specialMethod: '',
  isStepStopDetectLiquid: false,
  isStepAbsorAndJet: false,
})

const errors = reactive({
  code: false,
  name: false,
})

const typeData = ref([])
const liquidRanges = ref([])
const yesnos = ref([])
const channelRows = ref([1,2,3,4,5,6,7,8,9,10,11,12])
const consumableData = ref([])
const consumableTagData = ref([])
const equipmentData = ref([])
const controlMethodData = ref([])
const liquidData = ref([])
const shippingSpaceData = ref([])
const letters = ref(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'])
const numbers = ref([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26])
const holes = ref([])
const currentConsumableTag = ref({
  rowCount: 1, // Initialize with default values
  colCount: 1,
})
const columns = ref([
  {
    title: '参数名',
    width:'100px',
    dataIndex: 'paramName'
  },
  {
    title: '类型',
    width:'120px',
    dataIndex: 'paramType'
  },
  {
    title: '值',
    width:'100px',
    editable: true,
    dataIndex: 'value',
    scopedSlots: { customRender: 'value' }
  }
])
const specialMethods = ref([
  {id:'',name:'无'},
  {id:'JetAction343',name:'种胶喷液'},
  {id:'RemoveSupernatant',name:'弃上清'},
  {id:'MixBME',name:'混胶'},
  {id:'HighVolumeAction',name:'大容量吸液喷液'},
  {id:'JetBME',name:'吸胶喷胶'},
  {id:'JetCultureMedium',name:'吸培养基喷培养基'},
  {id:'AfterAction343Remove',name:'种胶后弃液'},
  {id:'AfterAction343JetCultureMedium',name:'种胶后喷培养基'},
  {id:'JetCellCount',name:'计数片吸喷液'},
  {id:'Jet96Hole',name:'96孔板吸喷液'},
  {id:'Jet384HoleRemoveVolume',name:'384孔板弃液'},
  {id:'Jet384HoleSaltWater',name:'384生理盐水'},
  {id:'Jet384HoleLight', name:'384加发光试剂'},
  {id:'Jet384Planking', name:'384孔板铺板'},
  {id:'Jet384Dosing', name:'384孔板加药'},
  {id:'Jet6HoleClean',name:'6孔板摇床洗板'},
  {id:"Mix6Hole", name:'6孔板混合'},
  {id:"Jet384ATP", name:'384加ATP'},
  {id:"Hole6PiPetting", name:'6孔板补液'},
  {id:"Hole6TiltPiPetting", name:'6孔板倾斜补液'},
  {id:"Hole6TiltRemove", name:'6孔板倾斜废液'},
])
const tipSpecialMethods = ref([
  {id:'',name:'无'},
  {id:'TakeTipByBMEVolume',name:'种胶枪头'},
  {id:'TakeTipByCultureMediumVolume',name:'培养基枪头'},
  {id:'Jet384TakeTip',name:'384枪头'},
  {id:'Jet384SaltWaterTakeTip',name:'384生理盐水枪头'},
  {id:'Jet384ATPTakeTip',name:'384ATP枪头计算'},
])

const consumableEditFormRef = ref(null)

const selectMethod = ref(null)

const edit = (record) => {
  visible.value = true
  // Deep copy to avoid mutating the original record
  attributeData.value = JSON.parse(JSON.stringify(record))
  loadDefaultData()
  title.value = `编辑实验步骤-[${getTypeName(attributeData.value.type)}]`
}

const getTypeName = (type) => {
  const typeItem = typeData.value.find(item => item.code === type)
  return typeItem ? typeItem.value : '未知'
}

const loadDefaultData = async () => {
  formLoading.value = true
  await Promise.all([
    getEquipmentData(),
    getConsumableTagData(),
    getConsumableData(),
    getLiquidData(),
    getShippingSpaceData(),
    getControlMethods()
  ])
  formLoading.value = false
}

const equipmentChange = (value) => {
  attributeData.value.equipmentId = value
  refreshHoles()
}

const consumableTagChange = (id) => {
  const record = consumableTagData.value.find(item => item.id === id)
  if (record) {
    currentConsumableTag.value = record
    refreshHoles()
  }
}

const btnGetConsumable = () => {
  const data = { id: attributeData.value.consumableTagId }
  exp_getConsumable_Param(data).then((res) => {
    consumableEditFormRef.value.edit(res.data)
  })
}

const handleOk = () => {
  // This method is now handled by the parent component's @ok event
}

const refreshHoles = () => {
  holes.value = []
  const sHoles = []
  for (let i = 0; i < currentConsumableTag.value.rowCount + 1; i++) {
    holes.value[i] = []
    for (let j = 0; j < currentConsumableTag.value.colCount + 1; j++) {
      if (holes.value[i] == null) {
        holes.value[i] = []
      }
      if (i === 0 || j === 0) {
        holes.value[i][j] = { name: 'none', isSelected: false }
      } else {
        const ln = getHoleId(i - 1, j - 1)
        if (attributeData.value.holeIndexStr && attributeData.value.holeIndexStr.length > 0) {
          if (attributeData.value.holeIndexStr.includes(ln)) {
            holes.value[i][j] = { name: ln, isSelected: true }
            sHoles.push({ name: ln, row: i + 1, col: j })
          } else {
            const shole = sHoles.find(item => item.col === j)
            if (shole) {
              const sRowIndex = shole.row
              if ((i + 1) - sRowIndex < attributeData.value.channelRow) {
                holes.value[i][j] = { name: ln, isSelected: true }
              } else {
                holes.value[i][j] = { name: ln, isSelected: false }
              }
            } else {
              holes.value[i][j] = { name: ln, isSelected: false }
            }
          }
        } else {
          holes.value[i][j] = { name: ln, isSelected: false }
        }
      }
    }
  }
}

const getHoleId = (i, j) => {
  const l = letters.value[i]
  const n = numbers.value[j]
  //所有组合
  const ln = l + n
  return ln
}

const selectHole = (i, j) => {
  const channelRow = attributeData.value.channelRow
  // var channelRow = this.pipetteAttribute.channelRow;
  if (i > 0 && j > 0) {
    if (attributeData.value.type === 3 || attributeData.value.type === 7 || attributeData.value.type === 9) {
      //单选 可添加选框改变状态
      refreshHoles()
    }
    if (i + channelRow >= currentConsumableTag.value.rowCount + 1) {
      if (holes.value[i][j].isSelected) {
        for (let local = currentConsumableTag.value.rowCount; local > currentConsumableTag.value.rowCount - channelRow; local--) {
          if (holes.value[local][j].isSelected) {
            attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort().filter(a => a !== holes.value[local + 1 - channelRow][j].name)).join(',')
            for (let k = local + 1 - channelRow; k <= local; k++) {
              holes.value[k][j].isSelected = !holes.value[k][j].isSelected
            }
            break
          }
        }
      } else {
        if (attributeData.value.holeIndexStr === '') {
          attributeData.value.holeIndexStr = holes.value[currentConsumableTag.value.rowCount + 1 - channelRow][j].name
        } else {
          attributeData.value.holeIndexStr += ',' + holes.value[currentConsumableTag.value.rowCount + 1 - channelRow][j].name
          attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort()).join(',')
        }
        for (let item = currentConsumableTag.value.rowCount + 1 - channelRow; item < currentConsumableTag.value.rowCount + 1; item++) {
          holes.value[item][j].isSelected = !holes.value[item][j].isSelected
        }
      }
    } else {
      if (!holes.value[i][j].isSelected) {
        for (let local = i; local <= i + channelRow; local++) {
          if (holes.value[local][j].isSelected) {
            attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort().filter(a => a !== holes.value[local][j].name)).join(',')
            for (let item = local; item < local + channelRow; item++) {
              holes.value[item][j].isSelected = !holes.value[item][j].isSelected
            }
            break
          }
        }
        if (attributeData.value.holeIndexStr === '') {
          attributeData.value.holeIndexStr = holes.value[i][j].name
        } else {
          attributeData.value.holeIndexStr += ',' + holes.value[i][j].name
          attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort()).join(',')
        }
        for (let item = i; item < i + channelRow; item++) {
          holes.value[item][j].isSelected = !holes.value[item][j].isSelected
        }
      } else {
        for (let local = 1; local <= i; local++) {
          if (holes.value[local][j].isSelected) {
            if (i - local >= channelRow) {
              attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort().filter(a => a !== holes.value[i - ((i - local) % channelRow)][j].name)).join(',')
              for (let item = i - ((i - local) % channelRow); item < i - ((i - local) % channelRow) + channelRow; item++) {
                holes.value[item][j].isSelected = !holes.value[item][j].isSelected
              }
              break
            } else {
              attributeData.value.holeIndexStr = (attributeData.value.holeIndexStr.split(',').sort().filter(a => a !== holes.value[local][j].name)).join(',')
              for (let item = local; item < local + channelRow; item++) {
                holes.value[item][j].isSelected = !holes.value[item][j].isSelected
              }
              break
            }
          }
        }
      }
    }
  }
}

const doMethod = () => {
  scriptRunning.value = true
  var param = {
    "controlClass": attributeData.value.controlClass,
    "executeMethod": attributeData.value.executeMethod,
    "parameters": selectMethod.value ? selectMethod.value.parameters : [],
    "type": attributeData.value.type
  }

  console.log('=========doMethod==========')
  console.log(param)
  var data = {
    id: attributeData.value.equipmentId,
    param: param
  };
  doApiMethod(data).then((res) => {
    scriptRunning.value = false
    if (!res.success) {
      message.error('执行控制器方法失败：' + res.message)
    }
  }).catch((err) => {
    message.error('执行控制器方法错误：' + err.message)
  })
}

const btnDoCmd = () => {
  if (!attributeData.value.cmdScript || attributeData.value.cmdScript.trim().length === 0) {
    message.error('请输入脚本命令！')
    return
  }
  scriptRunning.value = true
  const data = {
    id: attributeData.value.equipmentId,
    cmd: attributeData.value.cmdScript
  };
  doCmd(data).then((res) => {
    scriptRunning.value = false
    if (!res.success) {
      message.error('执行脚本命令失败：' + res.message)
    }
  }).catch((err) => {
    message.error('执行脚本命令错误：' + err.message)
  })
}

const methodChange = (name) => {
  selectMethod.value = controlMethodData.value.find(item => item.methodName === name)
  console.log('============methodChange===========')
  console.log(selectMethod.value)
}

const getControlMethods = async () => {
  if (attributeData.value.type > 100) {
    const res = await exp_equipment_getControlMethods({ stepType: attributeData.value.type })
    if (res.success) {
      controlMethodData.value = res.data.executeMethod

      console.log('===========getControlMethods============')
      console.log(res.data)

      attributeData.value.controlClass = res.data.controlClass
      if (attributeData.value.type > 100 && attributeData.value.equipmentId === null) {
        attributeData.value.equipmentId = res.data.equipmentId
      }

      if (attributeData.value.executeMethod === '') {
        attributeData.value.executeMethod = res.data.executeMethod[0].methodName
        attributeData.value.methodDescription = res.data.executeMethod[0].summary
      } else {
        selectMethod.value = controlMethodData.value.find(item => item.methodName === attributeData.value.executeMethod)
      }
      if (attributeData.value.executeParam !== '') {
        selectMethod.value.parameters = JSON.parse(attributeData.value.executeParam)
      }
      console.log(selectMethod.value)
    } else {
      message.error('获取设备事件失败：' + res.message)
    }
  }
}

const add = (record) => {
  visible.value = true
  resetAttribute()
  console.log(record)
  attributeData.value = { ...record }
  loadDefaultData()
  title.value = `新增实验步骤-[${getTypeName(attributeData.value.type)}]`
  console.log(attributeData.value)
}

const resetAttribute = () => {
  holes.value = []
  currentConsumableTag.value = {
    rowCount: 0, // Initialize with default values
    colCount: 0,
  }
}

const loadDictData = async () => {
  const res = await sysDictTypeDropDown({ code: 'yes_true_false' })
  yesnos.value = res.data
  yesnos.value.forEach((item) => {
    item.code = item.code === 'true' ? true : false
  })

  const res2 = await sysDictTypeDropDown({ code: 'flow_step_type' })
  typeData.value = res2.data
  typeData.value.forEach((item) => {
    item.code = parseInt(item.code)
  })

  const res3 = await sysDictTypeDropDown({ code: 'liquid_range' })
  liquidRanges.value = res3.data
  liquidRanges.value.forEach((item) => {
    item.code = parseInt(item.code)
    if (attributeData.value.liquidRange === 0) {
      attributeData.value.liquidRange = parseInt(item.code)
    }
  })
}

const getConsumableData = async () => {
  const res = await exp_consumable_list()
  consumableData.value = res.data
}

const getConsumableTagData = async () => {
  const data = { id: attributeData.value.layoutId }
  const res = await exp_consumable_getConsumableTags(data)
  consumableTagData.value = res.data
  if (attributeData.value.consumableTagId === null && attributeData.value.type !== 7) {
    if (consumableTagData.value !== null && consumableTagData.value.length > 0) {
      currentConsumableTag.value = consumableTagData.value[0]
      attributeData.value.consumableTagId = currentConsumableTag.value.id
    }
  }
  const record = consumableTagData.value.find(item => item.id === attributeData.value.consumableTagId)
  if (record) {
    currentConsumableTag.value = record
    refreshHoles()
  }
}

const getEquipmentData = async () => {
  const res = await exp_equipment_list()
  if (attributeData.value.type === 0 || attributeData.value.type === 6 || attributeData.value.type === 101) {
    equipmentData.value = res.data.filter(item => item.isThirdParty === false)
  } else if (attributeData.value.type > 200) {
    equipmentData.value = res.data.filter(item => item.isThirdParty === true)
  } else if (attributeData.value.type > 0 && attributeData.value.type < 6) {
    equipmentData.value = res.data.filter(item => item.isThirdParty === false && item.type === 0)
  } else {
    equipmentData.value = res.data.filter(item => item.isThirdParty === false && item.type === 1)
  }
}

const getLiquidData = async () => {
  const res = await exp_liquid_list()
  liquidData.value = res.data
  if (attributeData.value.liquidId === null) {
    attributeData.value.liquidId = liquidData.value[0].id
  }
}

const getShippingSpaceData = async () => {
  const data = { id: attributeData.value.layoutId }
  const res = await exp_layout_getShippingSpaces(data)
  shippingSpaceData.value = res.data
  if (attributeData.value.targetSpaceId === null && attributeData.value.type !== 7) {
    attributeData.value.targetSpaceId = shippingSpaceData.value[0].id
  }
}

const validateFields = () => {
  let result = true
  errors.value.code = !attributeData.value.code
  errors.value.name = !attributeData.value.name
  console.log(errors.value)
  for (const key in errors.value) {
    if (errors.value[key]) {
      result = false
      break
    }
  }
  return result
}

const handleSubmit = async () => {
  console.log('=================handleSubmit=================')
  console.log(attributeData.value)
  if (!validateFields()) {
    return
  }

  if (selectMethod.value) {
    attributeData.value.methodDescription = selectMethod.value.summary
    if (selectMethod.value.parameters !== null && selectMethod.value.parameters.length > 0) {
      attributeData.value.executeParam = JSON.stringify(selectMethod.value.parameters)
    }
  }

  if (attributeData.value.holeIndexStr !== null) {
    if (attributeData.value.holeIndexStr.includes('undefined')) {
      attributeData.value.holeIndexStr = attributeData.value.holeIndexStr.replace('undefined', '')
    }
    if (attributeData.value.holeIndexStr.includes('null')) {
      attributeData.value.holeIndexStr = attributeData.value.holeIndexStr.replace('null', '')
    }
    if (attributeData.value.holeIndexStr.startsWith(',')) {
      attributeData.value.holeIndexStr = attributeData.value.holeIndexStr.replace(',', '')
    }
  }
  if (attributeData.value.type === 1 || attributeData.value.type === 3 || attributeData.value.type === 4 || attributeData.value.type === 5) {
    //this.attributeData.specialMethod=JSON.stringify(this.attributeData.specialMethod)
  } else {
    attributeData.value.specialMethod = ''
  }

  formLoading.value = true
  if (attributeData.value.id === 0) {
    const res = await exp_flow_step_add(attributeData.value)
    if (res.success) {
      message.success('新增成功')
      emit('ok', attributeData.value)
      handleCancel()
    } else {
      message.error(res.message)
    }
  } else {
    const res = await exp_flow_step_edit(attributeData.value)
    if (res.success) {
      message.success('编辑成功')
      emit('ok', attributeData.value)
      handleCancel()
    } else {
      message.error(res.message) //  + res.message
    }
  }
  formLoading.value = false
}

const handleCancel = () => {
  visible.value = false
}

// Expose the edit method to the parent component
defineExpose({
  edit
})

onMounted(() => {
  loadDictData()
  // this.getEquipmentData()
  // this.loadDefaultData()
})

</script>
<style scoped>
.ant-row {
  height: 40px;
}
.ant-col {
  height: 40px;
}
.ant-form-item {
  height: 40px;
}
.ant-form-item-control {
  height: 40px;
}
.ant-form-explain {
  height: 0;
}

.span-unit {
  margin-left: 5px;
  color: black;
}
.span-label {
  width: 130px;
  text-align: right;
  display: inline-block;
  color: black;
  padding-right: 5px;
}
.holecolorselected {
  background-color: #f79a49;
}
</style>