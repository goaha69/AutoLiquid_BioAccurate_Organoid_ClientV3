<template>
  <a-modal title="编辑设备" :width="1400" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="8">
          <div>            
            <sp-input label="设备编号" :required="true" :isError="errors.code" :labelWidth="120" v-model="attributeData.code" />
            <sp-input label="设备名称" :required="true" :isError="errors.name" :labelWidth="120" :inputWidth="250" v-model="attributeData.name" />

            <span class="span-label">是否第三方：</span>
            <a-radio-group v-model:value="attributeData.isThirdParty" class="my-radio-group">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </div>

          <div style="margin-top:10px;">  
            <span class="span-label">通讯协议：</span>
            <a-select class="my-select" placeholder="请选择通讯协议" v-model:value="attributeData.communicatioProtocol" @change="changeProtocolType">
              <a-select-option v-for="(item, index) in protocolTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input label="主机" v-if="attributeData.communicatioProtocol < 3" style="margin-left:40px;" :required="true" :isError="errors.host" :labelWidth="120" v-model="attributeData.host" />
            <sp-input-number label="端口" :step="1" v-if="attributeData.communicatioProtocol < 3" style="margin-left:40px;" :required="true" :isError="errors.port" :labelWidth="120" v-model="attributeData.port" />

            <sp-input label="Com口" v-if="attributeData.communicatioProtocol >= 3" style="margin-left:40px;" :required="true" :isError="errors.comPort" :labelWidth="120" v-model="attributeData.comPort" />
            <sp-input-number label="波特率" :step="1" v-if="attributeData.communicatioProtocol >= 3" style="margin-left:40px;" :required="true" :isError="errors.baudRate" :labelWidth="120" v-model="attributeData.baudRate" />
          
            <sp-input-number label="X偏移" :labelWidth="100" unit="mm" :required="true" v-model="attributeData.xOffset" />            
          </div>          

          <div style="margin-top:10px;">   
            <sp-input label="生产厂商" :labelWidth="120" v-model="attributeData.manufacturer" />

            <span class="span-label">生产日期：</span>
            <a-date-picker placeholder="请选择生产日期" class="my-data-picker" v-model:value="attributeData.manufactureDate" @change="onDateChange"/>            

            <span class="span-label" style="margin-left:80px;">设备类型：</span>
            <a-select class="my-select" placeholder="请选择设备类型" v-model:value="attributeData.type" @change="equipmentTypeFunc">
              <a-select-option v-for="(item, index) in equipmentTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input-number label="Y偏移" :labelWidth="80" unit="mm" :required="true" v-model="attributeData.yOffset" />
          </div>

          <div style="margin-top:10px;">   
            <span class="span-label">坐标方向：</span>
            <a-select class="my-select" placeholder="请选择坐标方向：" v-model:value="attributeData.coordinateType">
              <a-select-option v-for="(item, index) in coordinateTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input label="配置url" :labelWidth="90" :inputWidth="300" v-model="attributeData.paramsPage" />

            <sp-input label="控制类" :labelWidth="90" :inputWidth="250" v-model="attributeData.controlClass"/>
          </div>
        </a-row>

        <a-row :gutter="8" v-if="!attributeData.isThirdParty && attributeData.type === 0">
          <a-card title="移液头属性" :bordered="false">
            <div>
              <span class="span-label">通道数：</span>
              <a-select style="width: 60px" v-model:value="pipetteAttribute.channelRow">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">行</span>
              <a-select style="width: 60px;margin-left:10px;" v-model:value="pipetteAttribute.channelCol" :disabled="true">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">列</span>

              <span class="span-label">可变距：</span>
              <a-radio-group v-model:value="pipetteAttribute.isVariable">
                <a-radio v-for="(item, index) in variables" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">行走逻辑：</span>
              <a-radio-group v-model:value="pipetteAttribute.walkingLogic">
                <a-radio v-for="(item, index) in walkingLogics" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </div>            

            <a-divider type="horizontal" />            

            <div>
              <span class="span-label">吸喷液装置：</span>
              <a-select style="width: 150px" v-model:value="pipetteAttribute.jetEquipmentId" @change="getJEid">
                <a-select-option v-for="(item, index) in equipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>

              <span class="span-label">取枪头方式：</span>
              <a-radio-group v-model:value="pipetteAttribute.takeTipEachCol">
                <a-radio v-for="(item, index) in takeTipEachCols" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">取枪头方向：</span>
              <a-radio-group v-model:value="pipetteAttribute.takeTipLeft2Right">
                <a-radio v-for="(item, index) in takeTipLeft2Rights" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </div>
            
            <!-- 通道/偏移 -->
            <div>
              <div style="margin-top:10px;margin-left:50px;" v-if="pipetteAttribute.jetEquipmentId !== ''">
                <a-checkbox-group v-model:value="selectedChannels">
                  <div v-for="(item, index) in pipetteAttribute.pipetteChannels" :key="index" style="float:left;">
                    <a-checkbox :value="item.index" style="color: black;width:80px;">{{ '通道' + (item.index + 1) }}</a-checkbox>
                    <sp-input-number style="margin-top:10px;" :disabled="!selectedChannels.includes(item.index)" :label="'x偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true" v-model="item.xOffset"/>
                    <sp-input-number style="margin-top:10px;" :disabled="!selectedChannels.includes(item.index)" :label="'y偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true" v-model="item.yOffset"/>
                    <sp-input-number style="margin-top:10px;" :disabled="!selectedChannels.includes(item.index)" :label="'z偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true" v-model="item.zOffset"/>
                  </div>
                </a-checkbox-group>
              </div>
            </div>
          </a-card>
        </a-row>

        <a-row :gutter="8" v-if="!attributeData.isThirdParty && attributeData.type === 0">
          <a-card title="退枪头" :bordered="false">
            <div>
              <span class="span-label">退枪头方式：</span>
              <a-radio-group v-model:value="pipetteAttribute.releaseTipUsePush">
                <a-radio v-for="(item, index) in releaseTipUsePushs" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">推脱板轴：</span>
              <a-radio-group v-model:value="pipetteAttribute.releaseTipAxis" :disabled="!pipetteAttribute.releaseTipUsePush">
                <a-radio v-for="(item, index) in releaseTipAxiss" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">推脱板次数：</span>
              <a-select style="width: 100px" v-model:value="pipetteAttribute.releaseTipUsePushCount" :disabled="!pipetteAttribute.releaseTipUsePush">
                <a-select-option v-for="(item, index) in releaseTipUsePushCounts" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>

              <sp-input-number label="推脱板偏移" unit="mm" :disabled="!pipetteAttribute.releaseTipUsePush" v-model="pipetteAttribute.releaseTipOffset" />
              <sp-input-number label="挡板行程" :step="1" :disabled="!pipetteAttribute.releaseTipUsePush" v-model="pipetteAttribute.baffleItinerary" />
            </div>

            <a-divider type="horizontal" />

            <table>
              <tr>
                <td class="table-col-label"><div>预退枪头位置</div></td>
                <td colspan="3" class="table-col-value-3">
                  <sp-input-number label="X" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosX" />
                  <sp-input-number label="Y" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosY" />
                  <sp-input-number label="Z" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosZ" />
                </td>
              </tr>
              <tr>
                <td class="table-col-label"><div>退枪头位置</div></td>
                <td colspan="3" class="table-col-value-3">
                  <sp-input-number label="X" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosX" />
                  <sp-input-number label="Y" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosY" />
                  <sp-input-number label="Z" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosZ" />
                </td>
              </tr>
            </table>

            <a-divider type="horizontal" />

            <div>
              <a-checkbox v-model:checked="pipetteAttribute.prepareReleaseTipAxisXGoFirst" class="my-checkbox">预退枪头先走X轴</a-checkbox>
              <a-checkbox v-model:checked="pipetteAttribute.prepareReleaseTipAxisYGoFirst" class="my-checkbox">预退枪头先走Y轴</a-checkbox>
              <a-checkbox v-model:checked="pipetteAttribute.releaseTipBack2TakePos" class="my-checkbox">返回取枪头位置退枪头</a-checkbox>
              <a-checkbox v-model:checked="pipetteAttribute.releaseTipZa0Before" class="my-checkbox">退枪头前高度回零</a-checkbox>
              <span class="span-label" style="width:auto; margin-left:20px;">退枪头速度指令：</span>
              <a-input class="my-input-speed" v-model:value="pipetteAttribute.releaseTipSpeedCmd" />
              <span class="span-label" style="width:auto; margin-left:20px;">退枪头后指令：</span>
              <a-input class="my-input-speed" v-model:value="pipetteAttribute.releaseTipAfterCmd" />
            </div>
          </a-card>
        </a-row>

        <a-row :gutter="8" v-show="!attributeData.isThirdParty && attributeData.type === 1">
          <a-card title="机械臂参数" :bordered="false">
            <span class="span-label" style="width:130px;">夹抓：</span>
            <a-select style="width: 150px" v-model:value="attributeData.clipEquipmentId">
              <a-select-option v-for="(item, index) in clipEquipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </a-card>
        </a-row>

        <a-row :gutter="8" v-show="attributeData.isThirdParty && attributeData.type === 2">
          <a-card title="移液枪参数" :bordered="false">
            <div>
              <span class="span-label">通道数：</span>
              <a-select style="width: 60px" v-model:value="pipetteAttribute.channelRow">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">行</span>
              <a-select style="width: 60px;margin-left:10px;" v-model:value="pipetteAttribute.channelCol" :disabled="true">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">列</span>
            </div>
          </a-card>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import moment from 'moment'
import { exp_equipment_edit, exp_equipment_getPipetteAttribute, exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { doCmd } from '@/api/modular/experiment/debug'  
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

// 定义emits
const emit = defineEmits(['ok'])

// 响应式数据
const visible = ref(false)
const formLoading = ref(false)
const form = ref({})
const equipmentData = ref([])
const protocolTypes = ref([])
const equipmentTypes = ref([])
const coordinateTypes = ref([])
const clipEquipmentData = ref([])
const manufactureDateString = ref('')
const loadingButton = ref('')
const selectedChannels = ref([])

const paramsPos = reactive({
  xPos: 0.00,
  yPos: 0.00,
  zPos: 0.00,
  pPos: 0.00,
  qPos: 0.00,
  wPos: 0.00,
  mPos: 0.00,
  nPos: 0.00,
  atPos: 0.00
})

const attributeData = reactive({
  id: 0,
  code: '',
  name: '',          
  type: 3,
  communicatioProtocol: 1,
  remark: '',
  controlClass: '',
  host: '',
  port: '',
  comPort: '',
  baudRate: '',
  manufacturer: '',
  paramsPage: '',  
  isThirdParty: false,
  coordinateType: 0,  
  clipEquipmentId: null,
  manufactureDate: '',
  xOffset: 0.0,
  yOffset: 0.0,
})

const errors = reactive({
  code: false,
  name: false,
  host: false,
  port: false,
  comPort: false,
  baudRate: false
})

const pipetteAttribute = reactive({
  equipmentId: 0,
  prepareReleaseTipPosX: 0.0,
  prepareReleaseTipPosY: 0.0,
  prepareReleaseTipPosZ: 0.0,
  releaseTipPosX: 0.0,
  releaseTipPosY: 0.0,
  releaseTipPosZ: 0.0,
  channelRow: 1,
  channelCol: 1,
  headLiquidRange: 0,
  isVariable: false,
  walkingLogic: 0,
  takeTipEachCol: true,          
  takeTipLeft2Right: true,
  releaseTipUsePush: true,
  releaseTipUsePushCount: 1,
  releaseTipOffset: 0.0,
  releaseTipAxis: 4,      
  prepareReleaseTipAxisXGoFirst: false,
  prepareReleaseTipAxisYGoFirst: false,
  releaseTipBack2TakePos: false,
  releaseTipZa0Before: false,
  releaseTipSpeedCmd: '',
  releaseTipAfterCmd: '',
  a1Pos: 0,
  absorbAirBeforePercent: 0.0,
  absorbAirAfterPercent: 0.0,
  absorbLiquidMoreOne2MorePercent: 0.0,
  jetLiquidMoreOne2MoreScale: 0.0,
  jetEquipmentId: '',
  pipetteChannels: '',
  yMoveWithHead: true,
  yAvailable: true,
  baffleItinerary: 0.0,
})

// 静态数据
const channelRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const liquidRanges = ref([])
const variables = ref([])
const walkingLogics = ref([])
const takeTipEachCols = [{ code: true, value: '逐列' }, { code: false, value: '逐行' }]
const takeTipLeft2Rights = [{ code: true, value: '从左往右' }, { code: false, value: '从右往左' }]
const releaseTipUsePushs = [{ code: true, value: '推脱板' }, { code: false, value: '卡扣' }]
const releaseTipAxiss = [{ code: 4, value: 'P' }, { code: 6, value: 'Q' }]
const releaseTipUsePushCounts = [1, 2, 3]
const a1Poss = ref([])

// 生命周期
onMounted(() => {
  loadSysDictTypeDropDown()
})

// 方法
function getEquipmentData() {
  exp_equipment_list({}).then((res) => {
    const data = res.data.filter(item => item.type === 2 && item.isThirdParty === true)
    equipmentData.value = [{ id: '', name: '自带装置' }, ...data]

    const data1 = res.data.filter(item => item.type === 3 && item.isThirdParty === true)
    clipEquipmentData.value = [{ id: 0, name: '自带装置' }, ...data1]
  })
}

function resetAttribute() {
  Object.assign(pipetteAttribute, {
    equipmentId: 0,
    prepareReleaseTipPosX: 0.0,
    prepareReleaseTipPosY: 0.0,
    prepareReleaseTipPosZ: 0.0,
    releaseTipPosX: 0.0,
    releaseTipPosY: 0.0,
    releaseTipPosZ: 0.0,
    channelRow: 1,
    channelCol: 1,
    headLiquidRange: 0,
    isVariable: false,
    walkingLogic: 0,
    takeTipEachCol: true,          
    takeTipLeft2Right: true,
    releaseTipUsePush: true,
    releaseTipUsePushCount: 1,
    releaseTipOffset: 0.0,
    releaseTipAxis: 4,      
    prepareReleaseTipAxisXGoFirst: false,
    prepareReleaseTipAxisYGoFirst: false,
    releaseTipBack2TakePos: false,
    releaseTipZa0Before: false,
    releaseTipSpeedCmd: '',
    releaseTipAfterCmd: '',
    a1Pos: 0,
    absorbAirBeforePercent: 0.0,
    absorbAirAfterPercent: 0.0,
    absorbLiquidMoreOne2MorePercent: 0.0,
    jetLiquidMoreOne2MoreScale: 0.0,
    jetEquipmentId: '',
    pipetteChannels: '',
    xOffset: 0.0,
    yOffset: 0.0,
    baffleItinerary: 0.0,
  })

  equipmentData.value = []
  clipEquipmentData.value = []
  selectedChannels.value = []
}

function onDateChange(date) {
  manufactureDateString.value = moment(date).format('YYYY-MM-DD')
}

function changeProtocolType(value) {
  // 协议类型改变时的处理
}

function equipmentTypeFunc(record) {
  // 设备类型改变时的处理
}

function getJEid() {
  // 构思 判断pipetteChannels是否为空 为空则使用默认值 并且重新遍历
  if (pipetteAttribute.pipetteChannels === '') {
    pipetteAttribute.pipetteChannels = [
      { equipmentId: 610801807540293, id: 610801807540001, index: 0, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540002, index: 1, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540003, index: 2, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540004, index: 3, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540005, index: 4, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540006, index: 5, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540007, index: 6, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 },
      { equipmentId: 610801807540293, id: 610801807540008, index: 7, name: '@Z1', parentId: 590289472188485, status: 0, xOffset: 0, yOffset: 0, zOffset: 0 }
    ]
  }
}

function loadSysDictTypeDropDown() {
  // 加载协议类型字典
  sysDictTypeDropDown({ code: 'protocol_type' }).then((res) => {
    if (res.success) {
      protocolTypes.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载设备类型字典
  sysDictTypeDropDown({ code: 'equipment_type' }).then((res) => {
    if (res.success) {
      equipmentTypes.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载液量范围字典
  sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
    if (res.success) {
      liquidRanges.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载变量字典
  sysDictTypeDropDown({ code: 'yes_true_false' }).then((res) => {
    if (res.success) {
      variables.value = res.data.map(item => ({
        ...item,
        code: item.code === 'true'
      }))
    }
  })

  // 加载行走逻辑字典
  sysDictTypeDropDown({ code: 'walking_logic' }).then((res) => {
    if (res.success) {
      walkingLogics.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载A1位置字典
  sysDictTypeDropDown({ code: 'a1_pos' }).then((res) => {
    if (res.success) {
      a1Poss.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })

  // 加载坐标类型字典
  sysDictTypeDropDown({ code: 'coordinate_type' }).then((res) => {
    if (res.success) {
      coordinateTypes.value = res.data.map(item => ({
        ...item,
        code: parseInt(item.code)
      }))
    }
  })
}

function edit(record) {
  visible.value = true
  console.log('====================')
  console.log(record)

  getEquipmentData()

  Object.assign(attributeData, record)

  if (record.manufactureDate != null) {
    manufactureDateString.value = moment(record.manufactureDate).format('YYYY-MM-DD')
  }

  if ((!attributeData.isThirdParty && attributeData.type === 0) || (attributeData.isThirdParty && attributeData.type === 2)) {
    formLoading.value = true
    const dd = { id: record.id }
    exp_equipment_getPipetteAttribute(dd).then((res) => {   
      formLoading.value = false 
      if (res.data !== null) {
        Object.assign(pipetteAttribute, res.data)
        if (pipetteAttribute.pipetteChannels != null) {
          selectedChannels.value = []
          pipetteAttribute.pipetteChannels.forEach((item) => {
            if (item.parentId == attributeData.id) {
              selectedChannels.value.push(item.index)
            }
          })
          console.log('============selectedChannels============')
          console.log(selectedChannels.value)
        }
        console.log('============exp_equipment_getPipetteAttribute============')
        console.log(pipetteAttribute)
      }
    })
  }
}

function validateFields() {
  let result = true
  errors.code = !attributeData.code
  errors.name = !attributeData.name
  errors.host = attributeData.communicatioProtocol < 3 ? !attributeData.host : false
  errors.port = attributeData.communicatioProtocol < 3 ? !attributeData.port : false
  errors.comPort = attributeData.communicatioProtocol >= 3 ? !attributeData.comPort : false
  errors.baudRate = attributeData.communicatioProtocol >= 3 ? !attributeData.baudRate : false
  
  for (const key in errors) {          
    if (errors[key]) {            
      result = false
      break
    }
  }
  return result
}

function handleSubmit() {   
  if (!validateFields()) {
    return
  }

  formLoading.value = true
  
  const host = attributeData.communicatioProtocol >= 3 ? '' : attributeData.host
  const port = attributeData.communicatioProtocol >= 3 ? 0 : attributeData.port
  const comPort = attributeData.communicatioProtocol >= 3 ? attributeData.comPort : ''
  const baudRate = attributeData.communicatioProtocol >= 3 ? attributeData.baudRate : 0

  const submitData = {
    ...attributeData,
    baudRate,
    comPort,
    host,
    port,
    manufactureDate: manufactureDateString.value
  }
  
  if ((!attributeData.isThirdParty && attributeData.type === 0) || (attributeData.isThirdParty && attributeData.type === 2)) {
    if (attributeData.type === 0 && pipetteAttribute.pipetteChannels != null) {
      pipetteAttribute.pipetteChannels.forEach((item) => {
        if (selectedChannels.value.includes(item.index) === false) {
          console.log('item.parentId=null')
          item.parentId = null
        } else {
          console.log('item.parentId=attributeData.id')
          item.parentId = attributeData.id
        }
      })
    }
    console.log('============pipetteAttribute.pipetteChannels============')
    console.log(pipetteAttribute.pipetteChannels)
    submitData.pipetteAttribute = pipetteAttribute
  } 

  exp_equipment_edit(submitData).then((res) => {
    console.log(submitData)
    
    if (res.success) {
      message.success('编辑成功')
      visible.value = false
      resetAttribute()
      emit('ok', submitData)
    } else {
      message.error(res.message)
    }
  }).finally(() => {
    formLoading.value = false
  })
}

function handleCancel() {
  resetAttribute()
  visible.value = false
}

function btnGoPos(axle) {
  let value = 0.0
  setLoading(axle)
  
  switch (axle.substring(0, 1)) {
    case 'x': value = paramsPos.xPos; break
    case 'y': value = paramsPos.yPos; break
    case 'z': value = paramsPos.zPos; break
    case 'p': value = paramsPos.pPos; break
    case 'q': value = paramsPos.qPos; break
    case 'w': value = paramsPos.wPos; break
    case 'm': value = paramsPos.mPos; break
    case 'n': value = paramsPos.nPos; break
  }
  
  const data = {
    ...form.value,
    cmd: axle.substring(0, 2) + value.toFixed(2)
  }
  
  doCmd(data).then((res) => {
    resetLoading()
    if (!res.success) {
      message.error('执行命令失败：' + res.message)
    }
  }).catch((err) => {
    message.error('执行命令错误：' + err.message)
  })
}

function setLoading(button) {
  loadingButton.value = button
}

function resetLoading() {
  loadingButton.value = ''
}

function isLoading(button) {
  return loadingButton.value === button
}

function isAnyLoading() {
  return loadingButton.value !== ''
}

// 暴露方法给父组件
defineExpose({
  edit
})
</script>

<style scoped>
.my-input {
  width: 160px;
}
.my-select {
  width: 160px;
}
.my-radio-group {
  width: 160px;
}
.my-data-picker{
  width: 160px;
}
.my-input-number{
  width: 130px;
}
.my-checkbox{
  color:black;
}
.my-input-speed{
  width: 160px;
}
.table-col-label
{
  width:120px;
  padding: 10px;
}
.table-col-label div
{
  width:100%;
  text-align:right;
  color:black;
}
.table-col-value
{
  width:35%;
  padding: 10px;
}
.table-col-value input
{
  width:100%;
}
.table-col-value-3
{
  width:85%;
}
.span-unit{
  margin-left: 5px;
}
.span-label{
  width: 130px;
  text-align: right;
  display:inline-block;
  color: black;
}
</style>
