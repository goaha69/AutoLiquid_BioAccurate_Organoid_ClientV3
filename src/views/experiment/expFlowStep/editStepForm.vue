<template>
  <a-modal :title="title" :width="(this.attributeData.type === 3 || this.attributeData.type === 4 || this.attributeData.type === 5 || this.attributeData.type === 7 || this.attributeData.type === 9):(600+(this.currentConsumableTag.colCount+1)*37):800" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <consumableedit-form ref="consumableeditForm" @ok="handleOk" ></consumableedit>
    <a-spin :spinning="formLoading">
      <div style="display: flex; clear : both;">
        <div style="float: left;height : auto;">
          <a-row :gutter="8">
            <div>            
              <sp-input label="步骤编号" :required="true" :isError="errors.code" v-model  value="attributeData.code" style="display : none"></sp>
              <sp-input label="步骤名称" :required="true" :isError="errors.name" :labelWidth="90" :inputWidth="200" v-model="attributeData.name" ></sp>
            </div>          
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type<=101 || attributeData.type==801 || attributeData.type==901  || attributeData.type==1001">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">设备::</span> 
              <a-select style="width: 200px" placeholder="请选择设备:" v-model="attributeData.equipmentId" @change="equipmentChange">
                <a-select-option v-for="(item, index) in equipmentData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 取枪:-->
          <a-row :gutter="8" v-if="attributeData.type===1">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">枪头类型::</span>
              <a-select style="width: 100px" v-model : value="attributeData.liquidRange">
                <a-select-option v-for="(item, index) in liquidRanges" :key="index" :value="item.code">{{ item.value }}</a-select-option>
              </a-select>
              <span class="span-unit">(μl)</span>
              <!-- <span class="span-label">试剂:::</span> -->              
            </div>
          </a-row>

          <!-- 退枪头 -->
          <a-row :gutter="8" v-if="attributeData.type===2">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:200px;">枪头是否退回原位::</span>
              <a-radio-group  v-model="attributeData.releaseTipSourcePos">
                <a-radio v-for="(item, index) in yesnos" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>  

              <span class="span-label" style="width:200px;">退回原位枪头是否复用::</span>
              <a-radio-group  v-model="attributeData.useReleaseTipSourcePos">
                <a-radio v-for="(item, index) in yesnos" :key="index" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
              
            </div>
          </a-row>

          <!-- 吸喷:混合 -->
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">耗材::</span>
              <a-select style="width: 200px" placeholder="请选择耗材:" v-model="attributeData.consumableTagId" @change="consumableTagChange">
                <a-select-option v-for="(item, index) in consumableTagData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
               <a-button type="primary" style="margin-left: 5px;" @click="btnGetConsumable()">耗材 : 参数</a-button>
            </div>
          </a-row> 
          <a-row :gutter="8" v-if="attributeData.type===3">
            <div style="margin-top:10px;">
                <span class="span-label" style="width:100px;">关闭液面探测::</span>
                <a-checkbox v-model="attributeData.isStepStopDetectLiquid" ></a>
              </div>  
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===4">
            <div style="margin-top:10px;">
                <span class="span-label" style="width:100px;">喷液完成后吸喷::</span>
                <a-checkbox v-model="attributeData.isStepAbsorAndJet" ></a>
              </div>  
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===1 || attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">通道数::</span>
              <a-select style="width: 80px" v-model : value="attributeData.channelRow">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">:</span>
              <a-select style="width: 80px;margin-left: 10px;" v-model : value="attributeData.channelCol">
                <a-select-option v-for="(item, index) in channelRows" :key="index" :value="item">{{ item }}</a-select-option>
              </a-select>
              <span class="span-unit">:</span>
            </div>
          </a-row>   
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">试剂:::</span>
              <a-select style="width: 200px" placeholder="请选择试剂::" v-model="attributeData.liquidId">
                <a-select-option v-for="(item, index) in liquidData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>     
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="体积" :labelWidth="90" :inputWidth="80" unit="μl" v-model="attributeData.volume"></sp>

              <sp-input-number label="混合次数" :labelWidth="70" :inputWidth="70" :rightEmpty="true" v-if="attributeData.type===5" v-model  value="attributeData.mixTime" : step="1" ></sp>
              
             </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="混合间隔" :labelWidth="70" :inputWidth="70" :rightEmpty="true" v-if="attributeData.type===5" v-model  value="attributeData.mixInterval" : step="1" ></sp>
              
              <sp-input-number label="X偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.xOffset"></sp>
             </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="等待时间" :labelWidth="80" :inputWidth="70" unit="min" :rightEmpty="true" v-if="attributeData.type===5" v-model  value="attributeData.waitTime" : step="1" ></sp>
              
              <sp-input-number label="Y偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.yOffset"></sp>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <sp-input-number label="Z偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.zOffset"></sp>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===3 || attributeData.type===4 || attributeData.type===5">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">特殊方法:::</span>
              <a-select style="width: 180px" v-model : value="attributeData.specialMethod">
                <a-select-option v-for="(item, index) in specialMethods" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===1">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">特殊方法:::</span>
              <a-select style="width: 180px" v-model : value="attributeData.specialMethod">
                <a-select-option v-for="(item, index) in tipSpecialMethods" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 等待 -->
          <a-row :gutter="8" v-if="attributeData.type===6">
            <div style="margin-top:10px;">
              <sp-input-number label="等待时间" :labelWidth="90" unit="秒" v-model  value="attributeData.waitTime" : step="1"></sp>

              <sp-input label="等待提醒" v-model="attributeData.waitTip" ></sp>
            </div>
          </a-row>

          <!-- 夹取 -->
          <a-row :gutter="8" v-if="attributeData.type===7">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">夹抓源盘:::</span>
              <a-select style="width: 200px" placeholder="请选择夹抓源盘::" v-model="attributeData.consumableTagId"  @change="consumableTagChange">
                <a-select-option v-for="(item, index) in consumableTagData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>

          <!-- 放置  -->
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">夹抓源盘:::</span>
              <a-select style="width: 200px" placeholder="请选择夹抓源盘::" v-model="attributeData.consumableTagId"  @change="consumableTagChange">
                <a-select-option v-for="(item, index) in consumableTagData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">目标舱位::</span>
              <a-select style="width: 250px" placeholder="请选择目标舱位:" v-model="attributeData.targetSpaceId" @change="targetSpaceChange">
                <a-select-option v-for="(item, index) in shippingSpaceData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type===9">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">松开夹抓::</span>
              <a-checkbox v-model="attributeData.isClipRelease" ></a>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="X偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.xOffset"></sp>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="Y偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.yOffset"></sp>
            </div>
          </a-row>

          <a-row :gutter="8" v-if="attributeData.type===7 ||attributeData.type===9">
            <div style="margin-top:10px;">
              <sp-input-number label="Z偏移" :labelWidth="90" :inputWidth="70" v-model="attributeData.zOffset"></sp>
            </div>
          </a-row>
          
          <!-- 脚本命令:  -->
          <a-row :gutter="8" v-if="attributeData.type===0" style="height:335px;">
            <div style="margin-top: 10px;display: flex; align-items : flex-start;">
              <span class="span-label" style="width:100px;">脚本命令::</span>
              <a-textarea placeholder="请输入脚本命令:" style="width: 500px;font-size : 16px;color: black;" rows="15" v-model : value="attributeData.cmdScript" allow-clear></a>
              <a-button type="primary" style="margin-left: 5px;" @click="btnDoCmd()" : loading="scriptRunning">执行</a-button>
            </div>
          </a-row>

          <!-- 第三方控制器  -->
          <a-row :gutter="8" v-if="attributeData.type>100">
            <div style="margin-top:10px;">
              <span class="span-label" style="width:100px;">设备:事件:</span>
              <a-select style="width: 250px" placeholder="请选择设备:事件" v-model="attributeData.executeMethod" @change="methodChange">
                <a-select-option v-for="(item, index) in controlMethodData" :key="index" :value="item.methodName">{{ item.summary }}</a-select-option>
              </a-select>
              <a-button type="primary" style="margin-left: 5px;" @click="doMethod()" : loading="scriptRunning">执行</a-button>
            </div>
          </a-row>
          <a-row :gutter="8" v-if="attributeData.type>100 && selectMethod!=null" style="height: auto;">
            <div style="margin-top:10px;">
              <a-table size="middle" :columns="columns" :dataSource="selectMethod.parameters" style="margin-left: 100px;" : pagination="false" rowKey="paramName"> 
                <span #value #default="text, record">
                   <sp-input v-model  value="record.value" : labelEmpty="true" placeholder="请输入值"></sp>
                </span>
              </a-table>
            </div>
          </a-row>          

          <a-row :gutter="8">
            <div style="margin-top:10px;">
              <sp-input-number label="排序" :labelWidth="90" :inputWidth="80"  v-model  value="attributeData.sort" : step="1"></sp>
            </div>
          </a-row>

          <!-- <a-row :gutter="8" style="height:100px;">
            <div style="margin-top: 10px;display: flex; align-items : flex-start;">
              <span class="span-label" style="width:140px;">备注::</span>
              <a-textarea placeholder="请输入备注:" style="width: 250px;font-size : 16px;color: black;" rows="3" v-model : value="attributeData.remark" allow-clear></a>
            </div>
          </a-row> -->
        </div>

        <div v-if="(attributeData.type === 3 || attributeData.type === 4 || attributeData.type === 5 || attributeData.type === 7 || attributeData.type === 9) && currentConsumableTag!=null" 
        style="float: right;height : 100%;margin-left: 20px;padding: 10px;padding-right : 20px;background-color:#EBEEF5">
          <a-row :gutter="8"
            :style="{
              height:(32*(currentConsumableTag.rowCount+1))+'px'
            }">
            <table>
              <tr v-for="(r, i) in holes" :key="i">
                  <td v-for="(c, j) in r" :key="j">
                      <a-button 
                          v-if=" i > 0  && j > 0"
                          style="width: 30px;height: 30px;border : 0px;"
                          :class="{holecolorselected:holes[i][j].isSelected}"
                          shape="circle"
                          @click="selectHole(i,j)"></a-button>  
                      <a-button style="width: 30px;height : 30px;background-color: #EBEEF5;color : black;border:0px;" shape="circle" type="text" disabled v-if="i === 0 && j> 0">{{numbers[j-1]}}</a-button>
                      <a-button style="width: 30px;height : 30px;background-color: #EBEEF5;color : black;border:0px;" shape="circle" type="text" disabled v-if="j === 0 && i> 0">{{letters[i-1]}}</a-button>
                  </td>
              </tr>
            </table>
          </a-row>
        </div>
      </div>
    </a-spin>
  </a-modal>

</template>

<script>
  import {doMethod,doCmd} from '@/api/modular/experiment/debug'  
  import {exp_flow_step_add,exp_flow_step_edit} from '@/api/modular/experiment/expFlowStepManage'
  import {sysDictTypeDropDown } from '@/api/modular/system/dictManage'
  import { exp_liquid_list } from '@/api/modular/experiment/liquidManage'
  import { exp_equipment_list,exp_equipment_getControlMethods,exp_equipment_getPipetteAttribute} from '@/api/modular/experiment/equipmentManage'
  import { exp_consumable_list,exp_consumable_getConsumableTags,exp_getConsumable_Param } from '@/api/modular/experiment/consumableManage'
  import { exp_layout_getShippingSpaces} from '@/api/modular/experiment/layoutManage'
  import SpInputNumber from '@/components/spInputNumber.vue';
  import SpInput from '@/components/spInput.vue';
  import consumableeditForm from '../consumable/editForm.vue'
  export default {
    components: {
      SpInputNumber,
      SpInput,
      consumableeditForm
    },
    data () {
      return {
        visible: false,
        title: '实验步骤',
        formLoading: false,
        scriptRunning:false,
        isholeselect:false,
        selectMethod:null,
        typeData:[],
        liquidRanges:[],
        yesnos:[],
        channelRows:[1,2,3,4,5,6,7,8,9,10,11,12],
        attributeData:{
          type:-1,
          pid:'0',
          name:'',
          volume:0,
          mixTime:1,
          mixInterval:1,
          waitTime:0,
          waitTip:'',
          liquidId:0,
          targetSpaceId:0,
          consumableTagId:0,
          cmdScript:'',
          sort:0,
          controlClass:'',
          executeMethod:'',
          methodDescription:'',
          executeParam:'',
          holeIndex:0,
          holeIndexStr:'',
          liquidRange:0, 
          releaseTipSourcePos:false,
          useReleaseTipSourcePos:false,
          description:'',
          remark:'',
          channelRow:1,
          channelCol:1,
          xOffset:0,
          yOffset:0,
          zOffset:0,
          isClipRelease: true,
          isSpecialAction:false,
          specialMethod:'',
          isStepStopDetectLiquid:false,
          isStepAbsorAndJet:false,
        },
        errors:{
          code:false,
          name:false,
        },
        consumableData:[],
        consumableTagData:[],
        equipmentData:[],
        controlMethodData:[],
        liquidData:[],
        shippingSpaceData:[],
        letters:['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
        numbers:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],   
        holes:[],
        currentConsumableTag: {
          rowCount: 1, // Initialize with default values

        colCount: 1,
        },
        columns: [ 
          {
            title: '参数',
            width:'100px',
            dataIndex: 'paramName'
          },     
          {
            title: '类型',
            width:'120px',
            dataIndex: 'paramType'
          },
          {
            title: '',
            width:'100px',
            editable: true,
            dataIndex: 'value',
            slots: { customRender: 'value' }
          }
        ],
        specialMethods:[
          {id:'',name:''},
          {id:'JetAction343',name:'种胶喷液'},
          {id:'RemoveSupernatant',name:'弃上'},
          {id:'MixBME',name:'混胶'},
          {id:'HighVolumeAction',name:'大容量吸液喷'},
          {id:'JetBME',name:'吸胶喷胶'},
          {id:'JetCultureMedium',name:'吸培养基喷培养基'},
          {id:'AfterAction343Remove',name:'种胶后弃'},
          {id:'AfterAction343JetCultureMedium',name:'种胶后喷培养'},
          {id:'JetCellCount',name:'计数片吸喷液'},
          {id:'Jet96Hole',name:'96孔板吸喷'},
          {id:'Jet384HoleRemoveVolume',name:'384孔板弃液'},
          {id:'Jet384HoleSaltWater',name:'384生理盐水'},
          {id:'Jet384HoleLight', name:'384加发光试'}, 
          {id:'Jet384Planking', name:'384孔板铺板'},
          {id:'Jet384Dosing', name:'384孔板加药'},
          {id:'Jet6HoleClean',name:'6孔板摇床洗板'},
          {id:"Mix6Hole", name:'6孔板混合'},
          {id:"Jet384ATP", name:'384加ATP'},
          {id:"Hole6PiPetting", name:'6孔板补液'},
          {id:"Hole6TiltPiPetting", name:'6孔板倾斜补液'},
          {id:"Hole6TiltRemove", name:'6孔板倾斜废液'},
        ],
        tipSpecialMethods:[
          {id:'',name:''},
          {id:'TakeTipByBMEVolume',name:'种胶枪头'},
          {id:'TakeTipByCultureMediumVolume',name:'培养基枪'},
          {id:'Jet384TakeTip',name:'384枪头'},
          {id:'Jet384SaltWaterTakeTip',name:'384生理盐水枪头'},
          {id:'Jet384ATPTakeTip',name:'384ATP枪头计算'},
        ],
      }
    },
    created () {
      this.currentConsumableTag=null;
      this.sysDictTypeDropDown()
      // this.getEquipmentData()
      // this.loadDefaultData()

  },
    mounted(){
      // this.loadDefaultData();
      // this.getEquipmentData()

  },
    methods: 
    {
      targetSpaceChange(value)
      {
        this.attributeData.targetSpaceId=value;
        this.$forceUpdate();
      },
      resetAttribute()
      {
        this.holes=[],
        this.currentConsumableTag= {
          rowCount: 0, // Initialize with default values

        colCount: 0,
        }
      },
      equipmentChange(value)
      {
        console.log('====>equipmentChange====>')
        console.log(value)
        this.attributeData.equipmentId=value;

        this.refreshHoles()
        this.$forceUpdate()
      },
      consumableTagChange(id)
      {
        var record=this.consumableTagData.filter(item => item.id == id)[0]        
        if(record!=null)
        {
          this.currentConsumableTag=record
          this.refreshHoles()
        }
      },
      btnGetConsumable(){
        var data={id:this.attributeData.consumableTagId}
        exp_getConsumable_Param(data).then((res)=>{
        this.$refs.consumableeditForm.edit(res.data)
        })    
      },    
      handleOk () {
      this.$refs.table.refresh()
    },
      refreshHoles()
      {
        this.holes=[];
        var sHoles=[];
        for(var i=0;i<this.currentConsumableTag.rowCount' + 1;i++)
        {
            for(var j=0;j<this.currentConsumableTag.colCount+1;j++)
            {
                if(this.holes[i] == null)
                  this.holes[i]=[]
                if(i==0 || j==0)
                  this.holes[i][j]={name:'none',isSelected:false}
                else
                {
                  var ln = this.getHoleId(i-1,j-1)
                  if(this.attributeData.holeIndexStr!=null && this.attributeData.holeIndexStr.length>0 )
                  {
                    if(this.attributeData.holeIndexStr.indexOf(ln)>=0)
                    {
                      this.holes[i][j]={name:ln,isSelected:true}
                      sHoles.push({name:ln,row:i' + 1,col:j})
                    }
                    else
                    {
                      var shole=sHoles.filter(item => item.col==j)[0]
                      if(shole!=null)
                      {
                        var sRowIndex=shole.row;
                        if((i+1)-sRowIndex<this.attributeData.channelRow)
                          this.holes[i][j]={name:ln,isSelected:true}
                        else
                        {
                          this.holes[i][j]={name:ln,isSelected:false}
                        }
                      }
                      else
                        this.holes[i][j]={name:ln,isSelected:false}
                    }
                  }
                  else
                  {
                    this.holes[i][j]={name:ln,isSelected:false}                    
                  }
                }
            }
        }
      },
      getHoleId(i,j)
      {
        var l=this.letters[i]
        var n=this.numbers[j]
        // 所有组
      var ln=l+n
        return ln
      },
      selectHole(i,j)
      {
        var channelRow = this.attributeData.channelRow;
        /**
       * var channelRow = this.pipetteAttribute.channelRow;
       */
      if(i>0 && j>0)
        {
          console.log(i+"+"+j);
          if(this.attributeData.type === 3 || this.attributeData.type === 7 || this.attributeData.type === 9){
          // 单可添加选框改变状
          this.refreshHoles()
          }
          if(i+channelRow >= this.currentConsumableTag.rowCount+1){
            if(this.holes[i][j].isSelected){
              for(var local = this.currentConsumableTag.rowCount;local>this.currentConsumableTag.rowCount-channelRow;local--){
                if(this.holes[local][j].isSelected){
                  this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort().filter(a=>a!==this.holes[local+1-channelRow][j].name)).join(',')
                  for(var k=local' + 1-channelRow;k<=local;k++){
                    this.$set(this.holes[k][j],'isSelected',!this.holes[k][j].isSelected)
                    this.$forceUpdate()
                  }
                  break
                }
              }
            }
            else{
              if(this.attributeData.holeIndexStr==""){
                this.attributeData.holeIndexStr = this.holes[this.currentConsumableTag.rowCount' + 1-channelRow][j].name
              }else{
                this.attributeData.holeIndexStr += "," + this.holes[this.currentConsumableTag.rowCount+1-channelRow][j].name
                this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort()).join(',')
              }
              for(var item=this.currentConsumableTag.rowCount' + 1-channelRow;item<this.currentConsumableTag.rowCount+1;item++){
                this.$set(this.holes[item][j],'isSelected',!this.holes[item][j].isSelected)
                this.$forceUpdate()
              }
            }
          }
          else{
            if(!this.holes[i][j].isSelected){
              for(var local = i;local<=i' + channelRow;local++){
                if(this.holes[local][j].isSelected){
                  this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort().filter(a=>a!==this.holes[local][j].name)).join(',')
                  for(var item=local;item<local' + channelRow;item++){
                    this.$set(this.holes[item][j],'isSelected',!this.holes[item][j].isSelected)
                    this.$forceUpdate()
                  }
                  break
                }
              }
              if(this.attributeData.holeIndexStr==""){
                this.attributeData.holeIndexStr = this.holes[i][j].name
              }else{
                this.attributeData.holeIndexStr' + = "," + this.holes[i][j].name
                this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort()).join(',')
              }
              for(var item=i;item<i' + channelRow;item++){
                this.$set(this.holes[item][j],'isSelected',!this.holes[item][j].isSelected)
                this.$forceUpdate()
              }
            }
            else{
              for(var local = 1;local<=i;local' + +){
                if(this.holes[local][j].isSelected){
                  if(i-local>=channelRow){
                    console.log((i-local)%channelRow)
                    this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort().filter(a=>a!==this.holes[i-((i-local)%channelRow)][j].name)).join(',')
                    for(var item=i-((i-local)%channelRow);item<i-((i-local)%channelRow)' + channelRow;item++){
                      this.$set(this.holes[item][j],'isSelected',!this.holes[item][j].isSelected)
                      this.$forceUpdate()
                    }
                    break
                  }
                  else{
                    this.attributeData.holeIndexStr = (this.attributeData.holeIndexStr.split(",").sort().filter(a=>a!==this.holes[local][j].name)).join(',')
                    for(var item=local;item<local' + channelRow;item++){
                      this.$set(this.holes[item][j],'isSelected',!this.holes[item][j].isSelected)
                      this.$forceUpdate()
                    }
                    break
                  }
                }
              }
            }
          }
        }          
      },
      doMethod()
      {
        this.scriptRunning=true
        var param={
          "controlClass":this.attributeData.controlClass,
          "executeMethod":this.attributeData.executeMethod,
          "parameters":this.selectMethod.parameters:this.selectMethod.parameters:[],
          "type":this.attributeData.type
        }

        console.log('=========doMethod==========')
        console.log(param)
        var data={
          id:this.attributeData.equipmentId,
          param:param
        };
        doMethod(data).then((res) => {
          this.scriptRunning=false
          if (!res.success) {
            this.$message.error('执行控制器方法失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行控制器方法错误::' + err.message)
        })
      },
      btnDoCmd()
      { 
        if(!this.attributeData.cmdScript || this.attributeData.cmdScript.trim().length === 0)
        {
          this.$message.error('请输入脚本命令:!')
            return;
        }
        this.scriptRunning=true
        var data={
          id:this.attributeData.equipmentId,
          cmd:this.attributeData.cmdScript
        };
        doCmd(data).then((res) => {
          this.scriptRunning=false
          if (!res.success) {
            this.$message.error('执行脚本命令:失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行脚本命令:错误:' + err.message)
        })
      },
      getTypeName(){
        return this.typeData.filter(item => item.code == this.attributeData.type)[0].value;
      },
      loadDefaultData() {
        this.formLoading = true
        this.getEquipmentData()
        this.getConsumableTagData()
        this.getConsumableData()        
        this.getLiquidData()
        this.getShippingSpaceData()
        this.getControlMethods()
        this.formLoading = false
      },
      methodChange(name)
      {
          this.selectMethod=this.controlMethodData.filter(item => item.methodName == name)[0]
          console.log('============methodChange===========')
          console.log(this.selectMethod)
      },
      getControlMethods(){
        if(this.attributeData.type>100)
        {
          exp_equipment_getControlMethods({stepType:this.attributeData.type}).then((res) => {
            if (res.success) {
              this.controlMethodData=res.data.executeMethod

              console.log('===========getControlMethods============')
              console.log(res.data)

              this.attributeData.controlClass=res.data.controlClass
              if(this.attributeData.type>100 && this.attributeData.equipmentId==null)
                this.attributeData.equipmentId=res.data.equipmentId

              if(this.attributeData.executeMethod==='')
              {
                this.attributeData.executeMethod=res.data.executeMethod[0].methodName
                this.attributeData.methodDescription=res.data.executeMethod[0].summary
              }
              else
              {
                this.selectMethod=this.controlMethodData.filter(item => item.methodName == this.attributeData.executeMethod)[0]
              }
              if(this.attributeData.executeParam!==''){
                this.selectMethod.parameters = JSON.parse(this.attributeData.executeParam)
              }
              console.log(this.selectMethod)
            } else {
              this.$message.error('获取设备:事件失败:' + res.message);
            }
          })
        }
      },
      add(record) {
        this.visible = true    
        this.resetAttribute()    
        console.log(record)
        this.attributeData= { ...record };
        this.loadDefaultData()
        this.title = '新增实验步骤-['+this.getTypeName()+']'
        console.log(this.attributeData);
      },
      /**
       * 初始化方法
       */
      edit (record) {
        this.visible = true     
        this.resetAttribute()       
        console.log('================record.holeIndexStr===============')
        console.log(record.holeIndexStr)
        this.attributeData= { ...record };   
        this.loadDefaultData()        
        this.title = '编辑实验步骤-['+this.getTypeName()+']'
        console.log(this.attributeData);
      },
      sysDictTypeDropDown() {
          sysDictTypeDropDown({code: 'yes_true_false'}).then((res) => {
            this.yesnos = res.data
            this.yesnos.forEach((item) => {
              item.code=item.code==='true':true:false
            })
          })

          sysDictTypeDropDown({ code: 'flow_step_type' }).then((res) => {
            this.typeData = res.data
            this.typeData.forEach((item) => {
              item.code=parseInt(item.code)
            })
          })

          sysDictTypeDropDown({code: 'liquid_range'}).then((res) => {
          this.liquidRanges = res.data
          this.liquidRanges.forEach((item) => {
            item.code=parseInt(item.code)            
            if(this.attributeData.liquidRange==0)
              this.attributeData.liquidRange=parseInt(item.code)
          })
        })
      },
      getConsumableData() {
          exp_consumable_list({}).then((res) => {
            this.consumableData = res.data
          })
      },
      getConsumableTagData() {
        var data={id:this.attributeData.layoutId}
        exp_consumable_getConsumableTags(data).then((res) => {
          this.consumableTagData = res.data
          if(this.attributeData.consumableTagId==null && this.attributeData.type!=7){
            if(this.consumableTagData!=null && this.consumableTagData.length>0)
            {
              this.currentConsumableTag=this.consumableTagData[0]
              this.attributeData.consumableTagId=this.currentConsumableTag.id
            }
          }
          var record=this.consumableTagData.filter(item => item.id == this.attributeData.consumableTagId)[0]        
          if(record!=null)
          {
            this.currentConsumableTag=record
            this.refreshHoles()
          }
        })
      },
      getEquipmentData() 
      {
        exp_equipment_list({}).then((res) => {
          var data=res.data
          if(this.attributeData.type==0 || this.attributeData.type==6 || this.attributeData.type==101)
            this.equipmentData = data.filter(item => item.isThirdParty==false)
          else if(this.attributeData.type>200)
            this.equipmentData = data.filter(item => item.isThirdParty==true)
          else if(this.attributeData.type>0 && this.attributeData.type<6)
            this.equipmentData = data.filter(item => item.isThirdParty==false && item.type==0)
          else
            this.equipmentData = data.filter(item => item.isThirdParty==false && item.type==1)
        })
      },
      getLiquidData() {
        exp_liquid_list({}).then((res) => {
          this.liquidData = res.data
          if(this.attributeData.liquidId==null)
            this.attributeData.liquidId=this.liquidData[0].id
        })
      },  
      getShippingSpaceData() {
        var data={id:this.attributeData.layoutId}
        exp_layout_getShippingSpaces(data).then((res) => {
          this.shippingSpaceData = res.data
          if(this.attributeData.targetSpaceId==null && this.attributeData.type!=7)
            this.attributeData.targetSpaceId=this.shippingSpaceData[0].id
        })
      },       
      validateFields()
      {
        var result=true;
        this.errors.code=!this.attributeData.code;
        this.errors.name=!this.attributeData.name;
        console.log(this.errors)
        for (const key in this.errors) {          
          if (this.errors[key]) {            
            result=false
            break;
          }
        }
        return result
      },
      handleSubmit () {
        console.log('=================handleSubmit=================')
        console.log(this.attributeData)
        if(!this.validateFields())
          return;
        
        if(this.selectMethod!=null)
        {
          this.attributeData.methodDescription=this.selectMethod.summary
          if(this.selectMethod.parameters!=null && this.selectMethod.parameters.length>0)
            this.attributeData.executeParam = JSON.stringify(this.selectMethod.parameters)
        }
        

        if(this.attributeData.holeIndexStr!=null)
        {
          if(this.attributeData.holeIndexStr.includes('undefined'))
            this.attributeData.holeIndexStr=this.attributeData.holeIndexStr.replace('undefined','')
          if(this.attributeData.holeIndexStr.includes('null'))
            this.attributeData.holeIndexStr=this.attributeData.holeIndexStr.replace('null','')
          if(this.attributeData.holeIndexStr.startsWith(','))
            this.attributeData.holeIndexStr=this.attributeData.holeIndexStr.replace(',','')
        }     
        if(this.attributeData.type===1 || this.attributeData.type===3 || this.attributeData.type===4 || this.attributeData.type===5)   
        {
          // this.attributeData.specialMethod=JSON.stringify(this.attributeData.specialMethod)

      }
        else
          this.attributeData.specialMethod="";

        this.formLoading = true
        if(this.attributeData.id==0)
        {
          exp_flow_step_add(this.attributeData).then((res) => {
            if (res.success) {
              this.$message.success('新增成功')
              this.$emit('ok', this.attributeData)
              this.handleCancel()
            } else {
              this.$message.error(res.message)
            }
          }).finally((res) => {
            this.formLoading = false
          })
        }
        else
        {
          exp_flow_step_edit(this.attributeData).then((res) => {
            if (res.success) {
              this.$message.success('编辑成功')
              this.$emit('ok', this.attributeData)
              this.handleCancel()
            } else {
              this.$message.error(res.message)// ' + res.message

          }
          }).finally((res) => {
            this.formLoading = false
          })
        }
      },
      handleCancel () {
        this.visible = false
      }
    }
  }
</script>
<style scoped>
.ant-row{
  height: 40px;
}
.ant-col{
  height: 40px;
}
.ant-form-item{
  height: 40px;
}
.ant-form-item-control{
  height: 40px;
}
.ant-form-explain{
  height: 0;
}

.span-unit{
  margin-left: 5px;
  color: black;
}
.span-label{
  width: 140px;
  text-align: right;
  display:inline-block;
  color: black;
}
.holecolorselected{
  background-color: #13C2C2;
}
</style>
