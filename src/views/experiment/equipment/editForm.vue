<template>
  <a-modal title="编辑设备" :width="1400" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <!-- <a-form-item style="display: none;"><a-input v-decorator="['id']" ></a></a-form-item> -->

        <a-row :gutter="8">
          <div>            
            <sp-input label="设备编号" :required="true" :isError="errors.code" :labelWidth="120" v-model="attributeData.code" />
            <sp-input label="设备名称" :required="true" :isError="errors.name" :labelWidth="120" :inputWidth="250" v-model="attributeData.name" />

            <span class="span-label">是否第三方::</span>
            <a-radio-group v-model="attributeData.isThirdParty" class="my-radio-group">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </div>

          <div style="margin-top:10px;">  
            <span class="span-label">通讯协议::</span>
            <a-select class="my-select" placeholder="请选择通讯协议:" v-model="attributeData.communicatioProtocol" @change="changeProtocolType">
              <a-select-option v-for="(item, index) in protocolTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input label="主机" v-if="attributeData.communicatioProtocol<3" style="margin-left:40px;" :required="true" :isError="errors.host" :labelWidth="120" v-model="attributeData.host" />
            <sp-input-number label="端口" :step="1" v-if="attributeData.communicatioProtocol<3" style="margin-left:40px;" :required="true" :isError="errors.port" :labelWidth="120" v-model="attributeData.port" />

            <sp-input label="Com口" v-if="attributeData.communicatioProtocol>=3" style="margin-left:40px;" :required="true" :isError="errors.comPort" :labelWidth="120" v-model="attributeData.comPort" />
            <sp-input-number label="波特率" :step="1" v-if="attributeData.communicatioProtocol>=3" style="margin-left:40px;" :required="true" :isError="errors.baudRate" :labelWidth="120" v-model="attributeData.baudRate" />
          
            <sp-input-number label="X偏移" :labelWidth="100" unit="mm" :required="true" v-model="attributeData.xOffset" />            
          </div>          

          <div style="margin-top:10px;">   
            <sp-input label="生产厂商" :labelWidth="120" v-model="attributeData.manufacturer" />

            <span class="span-label">生产日期::</span>
            <a-date-picker placeholder="请选择生产日期:" class="my-data-picker" v-model="attributeData.manufactureDate" @change="onDateChange" />            

            <span class="span-label" style="margin-left:80px;">设备类型::</span>
            <a-select class="my-select" placeholder="请选择设备类型:" v-model="attributeData.type" @change="equipmentTypeFunc">
              <a-select-option v-for="(item, index) in equipmentTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input-number label="Y偏移" :labelWidth="80" unit="mm" :required="true" v-model="attributeData.yOffset" />
          </div>

          <div style="margin-top:10px;">   
            <span class="span-label">坐标方向::</span>
            <!-- <a-radio-group  v-model="attributeData.coordinateType">
              <a-radio v-for="(item, index) in coordinateTypes" :key="index" :value="item.code">{{ item.value }}</a-radio>
            </a-radio-group> -->
            <a-select class="my-select" placeholder="请选择坐标方向::" v-model="attributeData.coordinateType">
              <a-select-option v-for="(item, index) in coordinateTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>

            <sp-input label="配置url" :labelWidth="90" :inputWidth="300" v-model="attributeData.paramsPage" />

            <sp-input label="控制类" :labelWidth="90" :inputWidth="250" v-model="attributeData.controlClass" />
          </div>
        </a-row>

        <a-row :gutter="8" v-if="!attributeData.isThirdParty && attributeData.type===0">
          <a-card title="移液头属性" :bordered="false">
            <div>
              <span class="span-label">通道数:::</span>
              <a-select style="width: 60px" v-model:value="pipetteAttribute.channelRow">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">列</span>
              <a-select style="width: 60px;margin-left : 10px;" v-model:value="pipetteAttribute.channelCol" :disabled="true">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">行</span>

              <span class="span-label">可变距::</span>
              <a-radio-group  v-model="pipetteAttribute.isVariable">
                <a-radio v-for="(item, index) in variables" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">行走逻辑::</span>
              <a-radio-group  v-model="pipetteAttribute.walkingLogic">
                <a-radio v-for="(item, index) in walkingLogics" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </div>            

            <a-divider type="horizontal" />            

            <div>
              <span class="span-label">吸喷液装置::</span>
              <a-select style="width: 150px" v-model:value="pipetteAttribute.jetEquipmentId" @change="getJEid()">
                <a-select-option v-for="(item, index) in equipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>

              <span class="span-label">取枪头方式::</span>
              <a-radio-group  v-model="pipetteAttribute.takeTipEachCol">
                <a-radio v-for="(item, index) in takeTipEachCols" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">取枪头方向::</span>
              <a-radio-group  v-model="pipetteAttribute.takeTipLeft2Right">
                <a-radio v-for="(item, index) in takeTipLeft2Rights" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </div>
             <!-- 通道/偏移  -->
            <div>
              <div style="margin-top: 10px;margin-left : 50px;" v-if="pipetteAttribute.jetEquipmentId!=''">
                <a-checkbox-group v-model="selectedChannels">
                  <div v-for="(item, index) in pipetteAttribute.pipetteChannels" :key="index" style="float:left;">
                    <a-checkbox  value="item.index" style="color: black;width : 80px;">{{ '通道' + (item.index + 1) }}</a-checkbox>
                    <sp-input-number style="margin-top: 10px;" :disabled="!selectedChannels.includes(item.index)" :label="'x偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true"  v-model="item.xOffset" />
                    <sp-input-number style="margin-top: 10px;" :disabled="!selectedChannels.includes(item.index)" :label="'y偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true"  v-model="item.yOffset" />
                    <sp-input-number style="margin-top: 10px;" :disabled="!selectedChannels.includes(item.index)" :label="'z偏移'+(item.index+1)" :labelWidth="60" :inputWidth="65" :rightEmpty="true"  v-model="item.zOffset" />
                  </div>
                </a-checkbox-group>
              </div>
            </div>
            
          </a-card>
        </a-row>

        <a-row :gutter="8" v-if="!attributeData.isThirdParty && attributeData.type===0">
          <a-card title="退枪头" :bordered="false">
            <div>
              <span class="span-label">退枪头方式::</span>
              <a-radio-group  v-model="pipetteAttribute.releaseTipUsePush">
                <a-radio v-for="(item, index) in releaseTipUsePushs" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">推脱板轴::</span>
              <a-radio-group  v-model="pipetteAttribute.releaseTipAxis" :disabled="!pipetteAttribute.releaseTipUsePush">
                <a-radio v-for="(item, index) in releaseTipAxiss" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>

              <span class="span-label">推脱板次数::</span>
              <a-select style="width: 100px" v-model:value="pipetteAttribute.releaseTipUsePushCount" :disabled="!pipetteAttribute.releaseTipUsePush">
                <a-select-option v-for="(item, index) in releaseTipUsePushCounts" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>

              <sp-input-number label="推脱板偏移" unit="mm" :disabled="!pipetteAttribute.releaseTipUsePush" v-model="pipetteAttribute.releaseTipOffset" />
              <sp-input-number label="挡板行程" :step="1"  :disabled="!pipetteAttribute.releaseTipUsePush" v-model="pipetteAttribute.baffleItinerary" />
            </div>

            <a-divider type="horizontal" />

            <table>
              <tr>
                <td class="table-col-label"><div>预退枪头位置</div></td>
                <td colspan="3" class="table-col-value-3">
                  <sp-input-number label="X" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosX" />
                  <!-- <a-button type="primary" @click="btnGoPos('x0')" :loading="isLoading('x0')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                  <sp-input-number label="Y" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosY" />
                  <!-- <a-button type="primary" @click="btnGoPos('y0')" :loading="isLoading('y0')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                  <sp-input-number label="Z" :labelWidth="50" unit="mm" v-model="pipetteAttribute.prepareReleaseTipPosZ" />
                  <!-- <a-button type="primary" @click="btnGoPos('z0')" :loading="isLoading('z0')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                </td>
              </tr>
              <tr>
                <td class="table-col-label"><div>退枪头位置</div></td>
                <td colspan="3" class="table-col-value-3">
                  <sp-input-number label="X" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosX" />
                  <!-- <a-button type="primary" @click="btnGoPos('x1')" :loading="isLoading('x1')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                  <sp-input-number label="Y" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosY" />
                  <!-- <a-button type="primary" @click="btnGoPos('y1')" :loading="isLoading('y1')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                  <sp-input-number label="Z" :labelWidth="50" unit="mm" v-model="pipetteAttribute.releaseTipPosZ" />
                  <!-- <a-button type="primary" @click="btnGoPos('z1')" :loading="isLoading('z1')"  :disabled="isAnyLoading()"  >执行</a-button> -->
                </td>
              </tr>
            </table>

            <a-divider type="horizontal" />

            <div>
              <a-checkbox v-model="pipetteAttribute.prepareReleaseTipAxisXGoFirst" class="my-checkbox">预退枪头先走X</a-checkbox>
              <a-checkbox v-model="pipetteAttribute.prepareReleaseTipAxisYGoFirst" class="my-checkbox">预退枪头先走Y</a-checkbox>
              <a-checkbox v-model="pipetteAttribute.releaseTipBack2TakePos" class="my-checkbox">返回取枪头位置退枪头</a-checkbox>
              <a-checkbox v-model="pipetteAttribute.releaseTipZa0Before" class="my-checkbox">退枪头前高度回零</a-checkbox>
              <span class="span-label" style="width: auto; margin-left : 20px;">退枪头速度指令::</span>
              <a-input class="my-input-speed" v-model="pipetteAttribute.releaseTipSpeedCmd" />
              <span class="span-label" style="width: auto; margin-left : 20px;">退枪头后指令::</span>
              <a-input class="my-input-speed" v-model="pipetteAttribute.releaseTipAfterCmd" />
            </div>
            
          </a-card>
        </a-row>

        <a-row :gutter="8" v-show="!attributeData.isThirdParty && attributeData.type===1">
          <a-card title="机械臂参数" :bordered="false">
            <span class="span-label" style="width:130px;">夹抓::</span>
            <a-select style="width: 150px" v-model:value="attributeData.clipEquipmentId">
              <a-select-option v-for="(item, index) in clipEquipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </a-card>
        </a-row>

        <a-row :gutter="8" v-show="attributeData.isThirdParty && attributeData.type===2">
          <a-card title="移液枪参数" :bordered="false">
            <div>
              <span class="span-label">通道数:::</span>
              <a-select style="width: 60px" v-model:value="pipetteAttribute.channelRow">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">列</span>
              <a-select style="width: 60px;margin-left : 10px;" v-model:value="pipetteAttribute.channelCol" :disabled="true">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">行</span>
            </div>
          </a-card>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { ref, reactive } from 'vue';
import moment from 'moment';
import { exp_equipment_edit,exp_equipment_getPipetteAttribute,exp_equipment_list } from '@/api/modular/experiment/equipmentManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import {doCmd} from '@/api/modular/experiment/debug';  
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
export default {
  components: {
    SpInputNumber,
    SpInput
  },
  data() {
    return {
      labelCol: { xs: { span: 24},sm: { span: 6}},
      wrapperCol: {xs: {span: 24},sm: {span: 16}},
      labelCol_JG: { xs: {span: 24},sm: {span: 3}},
      wrapperCol_JG: {xs: {span: 24}, sm: { span: 20}},
      visible: false,
      formLoading: false,
      // 升级为 ref 对象
      form: ref({}),
      equipmentData:[],
      protocolTypes:[],
      equipmentTypes:[],    
      coordinateTypes:[],    
      clipEquipmentData:[],
      manufactureDateString: '',
      loadingButton:'',
      paramsPos:{xPos:0.00,yPos:0.00,zPos:0.00,pPos:0.00,qPos:0.00,wPos:0.00,mPos:0.00,nPos:0.00,atPos:0.00},
      attributeData:{
        id:0,
        code:'',
        name:'',          
        type:3,
        communicatioProtocol:1,
        remark:'',
        controlClass:'',
        host:'',
        port:'',
        comPort:'',
        baudRate:'',
        manufacturer:'',
        paramsPage:'',  
        isThirdParty:false,
        coordinateType:0,  
        clipEquipmentId:null,
        manufactureDate:'',
        xOffset:0.0,
        yOffset:0.0,
      },
      errors:{
        code:false,
        name:false,
        host:false,
        port:false,
        comPort:false,
        baudRate:false
      },
      pipetteAttribute:{
        equipmentId:0,
        prepareReleaseTipPosX:0.0,
        prepareReleaseTipPosY:0.0,
        prepareReleaseTipPosZ:0.0,
        releaseTipPosX:0.0,
        releaseTipPosY:0.0,
        releaseTipPosZ:0.0,
        channelRow:1,
        channelCol:1,
        headLiquidRange:0,
        isVariable:false,
        walkingLogic:0,
        takeTipEachCol:true,          
        takeTipLeft2Right:true,
        releaseTipUsePush:true,
        releaseTipUsePushCount:1,
        releaseTipOffset:0.0,
        releaseTipAxis:4,      
        prepareReleaseTipAxisXGoFirst:false,
        prepareReleaseTipAxisYGoFirst:false,
        releaseTipBack2TakePos:false,
        releaseTipZa0Before:false,
        releaseTipSpeedCmd:'',
        releaseTipAfterCmd:'',
        a1Pos:0,
        absorbAirBeforePercent:0.0,
        absorbAirAfterPercent:0.0,
        absorbLiquidMoreOne2MorePercent:0.0,
        jetLiquidMoreOne2MoreScale:0.0,
        jetEquipmentId:'',
        pipetteChannels:'',
        yMoveWithHead:true,
        yAvailable:true,
        baffleItinerary:0.0,
      },        
      channelRows:[1,2,3,4,5,6,7,8,9,10,11,12],
      liquidRanges:[],
      variables:[],
      walkingLogics:[],
      takeTipEachCols:[{code:true,value:'逐列'},{code:false,value:'逐行'}],
      takeTipLeft2Rights:[{code:true,value:'从左往'},{code:false,value:'从右往'}],
      releaseTipUsePushs:[{code:true,value:'推脱'},{code:false,value:'卡扣'}],
      releaseTipAxiss:[{code:4,value:'P'},{code:6,value:'Q'}],
      releaseTipUsePushCounts:[1,2,3],
      a1Poss:[],

      selectedChannels:[],
    }
  },
  mounted() {
      this.manufactureDateString = moment().format('YYYY-MM-DD')
  },
  created() {
      this.sysDictTypeDropDown()      
    },
    methods: { 
      getEquipmentData() {
        exp_equipment_list({}).then((res) => {          
          var data=res.data;
          data=data.filter(item => item.type===2 && item.isThirdParty===true);
          this.equipmentData.push({id:'',name:'自带装置'})
          data.forEach((item) => {
            this.equipmentData.push(item)
          })


          var data1=res.data;
          data1=data1.filter(item => item.type===3 && item.isThirdParty === true);
          this.clipEquipmentData.push({id:0,name:'自带装置'})        
          data1.forEach((item) => {
            this.clipEquipmentData.push(item)
          })
        })
      },
      resetAttribute(){
        this.pipetteAttribute={
          equipmentId:0,
          prepareReleaseTipPosX:0.0,
          prepareReleaseTipPosY:0.0,
          prepareReleaseTipPosZ:0.0,
          releaseTipPosX:0.0,
          releaseTipPosY:0.0,
          releaseTipPosZ:0.0,
          channelRow:1,
          channelCol:1,
          headLiquidRange:0,
          isVariable:false,
          walkingLogic:0,
          takeTipEachCol:true,          
          takeTipLeft2Right:true,
          releaseTipUsePush:true,
          releaseTipUsePushCount:1,
          releaseTipOffset:0.0,
          releaseTipAxis:4,      
          prepareReleaseTipAxisXGoFirst:false,
          prepareReleaseTipAxisYGoFirst:false,
          releaseTipBack2TakePos:false,
          releaseTipZa0Before:false,
          releaseTipSpeedCmd:'',
          releaseTipAfterCmd:'',
          a1Pos:0,
          absorbAirBeforePercent:0.0,
          absorbAirAfterPercent:0.0,
          absorbLiquidMoreOne2MorePercent:0.0,
          jetLiquidMoreOne2MoreScale:0.0,
          jetEquipmentId:'',
          pipetteChannels:'',
          xOffset:0.0,
          yOffset:0.0,
          baffleItinerary:0.0,
        }

        this.equipmentData=[]
        this.clipEquipmentData=[]
        this.selectedChannels=[]
      }, 
      getFiledRules(flag)
      {
        if(flag===1)
          return this.communicatioProtocol<3 ? [{ required: true, message: '' }] : []; 
        else if(flag===2)
          return this.communicatioProtocol<3 ? [{ required: true, message: '' }] : []; 
        else if(flag===3)
          return this.communicatioProtocol>=3 ? [{ required: true, message: '' }] : []; 
        else if(flag===4)
          return this.communicatioProtocol>=3 ? [{ required: true, message: '' }] : []; 
      },
       onDateChange(date) {
        this.manufactureDateString = moment(date).format('YYYY-MM-DD')
      },
      changeProtocolType(value)
      {
        // this.form.setFieldsValue({ communicatioProtocol: parseInt(value) }); 
        // this.communicatioProtocol=value

    },
      equipmentTypeFunc(record){
        // this.form.setFieldsValue({ type: value }); 
        // this.equipmentType=value;

        // this.edit()


    },
      getJEid(){
        /**
       * 构造判断pipetteChannels是否为空 为空则使用默认值并且重新遍历
       */
      if (this.pipetteAttribute.pipetteChannels == '') {
          this.pipetteAttribute.pipetteChannels = [
            {
              equipmentId: 610801807540293, id: 610801807540001, index: 0, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540002, index: 1, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540003, index: 2, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540004, index: 3, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540005, index: 4, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540006, index: 5, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540007, index: 6, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540008, index: 7, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540009, index: 8, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540010, index: 9, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540011, index: 10, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            },
            {
              equipmentId: 610801807540293, id: 610801807540012, index: 11, name: '@Z1', parentId: 590289472188485,
              status: 0, xOffset: 0, yOffset: 0, zOffset: 0
            }
          ]
        }
      },
       /**
       * 获取字典数据
       */
      sysDictTypeDropDown() {
        sysDictTypeDropDown({code: 'protocol_type' }).then((res) => {
          this.protocolTypes = res.data
          this.protocolTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })

        sysDictTypeDropDown({code: 'equipment_type'}).then((res) => {
          this.equipmentTypes = res.data
          console.log('==========this.equipmentTypes===========')
          console.log(this.equipmentTypes)
          this.equipmentTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })          
        })


        sysDictTypeDropDown({code: 'liquid_range'}).then((res) => {
          this.liquidRanges = res.data
          this.liquidRanges.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })


        sysDictTypeDropDown({code: 'yes_true_false'}).then((res) => {
          this.variables = res.data
          this.variables.forEach((item) => {
            item.code=item.code==='true'?true:false
          })
        })

        sysDictTypeDropDown({code: 'walking_logic'}).then((res) => {
          this.walkingLogics = res.data
          this.walkingLogics.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })

        sysDictTypeDropDown({code: 'a1_pos'}).then((res) => {
          this.a1Poss = res.data
          this.a1Poss.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })

        sysDictTypeDropDown({code: 'coordinate_type'}).then((res) => {
          this.coordinateTypes = res.data
          this.coordinateTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })
      },
      /**
       * 初始化方法
       */
      edit(record) {
        this.visible = true
        console.log('====================')
        console.log(record)

        this.getEquipmentData()

        this.attributeData= { ...record };

        if (record.manufactureDate != null) {
          // this.form.getFieldDecorator('manufactureDate', { initialValue: moment(record.manufactureDate, 'YYYY-MM-DD') })

        this.manufactureDateString = moment(record.manufactureDate).format('YYYY-MM-DD')
        }

        if((!this.attributeData.isThirdParty && this.attributeData.type === 0) || (this.attributeData.isThirdParty && this.attributeData.type === 2))
        {
          this.formLoading = true
          var dd={id:record.id}
          exp_equipment_getPipetteAttribute(dd).then((res) => {   
            this.formLoading = false 
            if(res.data!==null)
            {
              this.pipetteAttribute = res.data
              if(this.pipetteAttribute.pipetteChannels!=null)
              {
                this.pipetteAttribute.pipetteChannels.forEach((item) => {
                  if(item.parentId==this.attributeData.id)
                    this.selectedChannels.push(item.index)
                 })
                 console.log('============this.selectedChannels============');
                 console.log(this.selectedChannels);
              }
              console.log('============exp_equipment_getPipetteAttribute============');
              console.log(this.pipetteAttribute);
            }
          })
        }

        
        // this.sysDictTypeDropDown()

    },
      validateFields()
      {
        var result=true;
        this.errors.code=!this.attributeData.code;
        this.errors.name=!this.attributeData.name;
        this.errors.host=this.attributeData.communicatioProtocol< 3 ? !this.attributeData.host : false;
        this.errors.port=this.attributeData.communicatioProtocol< 3 ? !this.attributeData.port : false;
        this.errors.comPort=this.attributeData.communicatioProtocol>=3 ? !this.attributeData.comPort : false;
        this.errors.baudRate=this.attributeData.communicatioProtocol>=3 ? !this.attributeData.baudRate : false;
        console.log(this.errors)
        for (const key in this.errors) {          
          if (this.errors[key]) {            
            result=false
            break;
          }
        }
        return result
      },
      handleSubmit() {   
        console.log('=================handleSubmit=================')
        if(!this.validateFields())
          return;

        this.formLoading = true
        const host=this.attributeData.communicatioProtocol>=3 ? '' : this.attributeData.host
        const port=this.attributeData.communicatioProtocol>=3 ? 0 : this.attributeData.port
        const comPort=this.attributeData.communicatioProtocol>=3 ? this.attributeData.comPort : ''
        const baudRate=this.attributeData.communicatioProtocol>=3 ? this.attributeData.baudRate : 0

        this.attributeData.baudRate=baudRate
        this.attributeData.comPort=comPort
        this.attributeData.host=host
        this.attributeData.port=port
        this.attributeData.manufactureDate=this.manufactureDateString    
        if((!this.attributeData.isThirdParty && this.attributeData.type === 0) || (this.attributeData.isThirdParty && this.attributeData.type === 2))
        {
          if(this.attributeData.type===0 && this.pipetteAttribute.pipetteChannels!=null)
          {
            this.pipetteAttribute.pipetteChannels.forEach((item) => {
              if(this.selectedChannels.includes(item.index)===false)
              {
                console.log('item.parentId=null');
                item.parentId=null
              }
              else
              {
                console.log('item.parentId=this.attributeData.id');
                item.parentId=this.attributeData.id
              }
            })
          }
          console.log('============this.pipetteAttribute.pipetteChannels============');
          console.log(this.pipetteAttribute.pipetteChannels);
          this.attributeData.pipetteAttribute=this.pipetteAttribute
        } 

        exp_equipment_edit(this.attributeData).then((res) => {
          console.log(this.attributeData);
          
          if (res.success) {
            this.$message.success('编辑成功')
            this.visible = false
            this.resetAttribute()
            this.$emit('ok', this.attributeData)
            this.form.resetFields()
          } else {
            this.$message.error(res.message)
          }
        }).finally((res) => {
          this.formLoading = false
        })
      },
      handleCancel() {
        this.resetAttribute()
        this.form.resetFields()
        this.visible = false
      },    
      btnGoPos(axle) {
        const data = this.form.getFieldsValue()
        var value=0.0
        this.setLoading(axle)
        switch(axle.substring(0,1))
        {
          case 'x':value=this.paramsPos.xPos;break
          case 'y':value=this.paramsPos.yPos;break
          case 'z':value=this.paramsPos.zPos;break
          case 'p':value=this.paramsPos.pPos;break

          case 'q':value=this.paramsPos.qPos;break
          case 'w':value=this.paramsPos.wPos;break
          case 'm':value=this.paramsPos.mPos;break
          case 'n':value=this.paramsPos.nPos;break
        }
        data.cmd = axle.substring(0,2) + value.toFixed(2);
        doCmd(data).then((res) => {
          this.resetLoading()
          if (res.success) {
          } else {
            this.$message.error('执行命令失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:' + err.message)
        })
      },
      /**
       * 设置loading状
       */
      setLoading(button) {this.loadingButton = button},
      /**
       * 重置loading状
       */
      resetLoading() {this.loadingButton = ''},
      /**
       * 判断特定按钮是否在loading状
       */
      isLoading(button) {return this.loadingButton == button},
      /**
       * 判断是否有按钮在loading状
       */
      isAnyLoading() {return this.loadingButton != ''}
    }
  }
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
