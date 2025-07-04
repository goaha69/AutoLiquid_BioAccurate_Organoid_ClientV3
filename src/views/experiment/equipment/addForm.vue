<template>
  <a-modal title="新增设备" :width="800" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">  
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <!-- <a-form-item v-show="false"><a-input v-decorator="['id']" ></a></a-form-item> -->

        <a-row :gutter="8">
          <div>            
            <sp-input label="设备编号" :required="true" :isError="errors.code" :labelWidth="120" v-model="attributeData.code" ></sp>
            <sp-input label="设备名称" :required="true" :isError="errors.name" :labelWidth="120" :inputWidth="250" v-model="attributeData.name" ></sp>
          </div>

          <div style="margin-top:10px;">            
            <span class="span-label">是否第三方::</span>
            <a-radio-group v-model="attributeData.isThirdParty" class="my-radio-group">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>

            <span class="span-label" style="margin-left:40px;">通讯协议::</span>
            <a-select class="my-select" placeholder="请选择通讯协议:" v-model="attributeData.communicatioProtocol" @change="changeProtocolType">
              <a-select-option v-for="(item, index) in protocolTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;" v-if="attributeData.isThirdParty">
            <sp-input label="控制类::" :labelWidth="120" :inputWidth="580" v-model="attributeData.controlClass"></sp>
          </div>

          <div style="margin-top:10px;" v-if="attributeData.communicatioProtocol<3">            
            <sp-input label="主机" :required="true" :isError="errors.host" :labelWidth="120" v-model="attributeData.host" ></sp>
            <sp-input-number label="端口" :step="1" :required="true" :isError="errors.port" :labelWidth="120" v-model="attributeData.port" ></sp>
          </div>

          <div style="margin-top:10px;" v-if="attributeData.communicatioProtocol>=3">            
            <sp-input label="Com口" :required="true" :isError="errors.comPort" :labelWidth="120" v-model="attributeData.comPort" ></sp>
            <sp-input-number label="波特率" :step="1" :required="true" :isError="errors.baudRate" :labelWidth="120" v-model="attributeData.baudRate" ></sp>
          </div>

          <div style="margin-top:10px;">   
            <sp-input label="生产厂商" :labelWidth="120" v-model="attributeData.manufacturer" ></sp>
            <span class="span-label">生产日期::</span>
            <a-date-picker placeholder="请选择生产日期:" class="my-data-picker" v-model="attributeData.manufactureDate" @change="onDateChange"></a>
          </div>

          <div style="margin-top:10px;">   
            <sp-input label="配置url" :labelWidth="120" v-model="attributeData.paramsPage" ></sp>
            <span class="span-label">设备类型::</span>
            <a-select class="my-select" placeholder="请选择设备类型:" v-model="attributeData.type" @change="equipmentTypeFunc">
              <a-select-option v-for="(item, index) in equipmentTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>
        </a-row>

        <!-- <a-row :gutter="24">
          <a-col  md="24" : sm="24">
            <a-form :form="form">
              <a-form-item label="备注" :labelCol="labelCol_JG" :wrapperCol="wrapperCol_JG">
                <a-textarea :rows="2" placeholder="请输入备注" v-decorator="['remark']"></a-textarea>
              </a-form-item>
            </a-form>
          </a-col>
        </a-row> -->
        
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { ref } from 'vue';
import moment from 'moment';
import { exp_equipment_add } from '@/api/modular/experiment/equipmentManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
export default {
  components: {
    SpInputNumber,
    SpInput
  },
  data() {
    return {
      labelCol_JG: { xs: {span: 24},sm: {span: 3}},
      wrapperCol_JG: {xs: {span: 24}, sm: { span: 20}},
      visible: false,
      formLoading: false,
      // 升级为ref对象
      form: ref({}),
      protocolTypes:[],
      equipmentTypes:[],
      manufactureDateString: '',
      attributeData:{
        id:0,
        code:'',
        name:'',          
        type:0,
        communicatioProtocol:1,
        remark:'',
        controlClass:'',
        host:'',
        port:0,
        comPort:'',
        baudRate:0,
        manufacturer:'',
        paramsPage:'',  
        isThirdParty:false        
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
        jetEquipmentId:null,
      },  
      errors:{
        code:false,
        name:false,
        host:false,
        port:false,
        comPort:false,
        baudRate:false
      }
    }
  },
  mounted() {      
    this.manufactureDateString = moment().format('YYYY-MM-DD')
  },
  created() {
      this.sysDictTypeDropDown()
    },
    methods: {
      resetAttribute()
      {
        this.attributeData={
          id:0,
          code:'',
          name:'',          
          type:0,
          communicatioProtocol:1,
          manufactureDate:this.manufactureDateString,
          remark:'',
          controlClass:'',
          host:'',
          port:0,
          comPort:'',
          baudRate:0,
          manufacturer:'',
          paramsPage:'',   
          isThirdParty:false           
        }
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
          jetEquipmentId:null,
        }
        this.errors={
          code:false,
          name:false,
          host:false,
          port:false,
          comPort:false,
          baudRate:false
        }
      },
      onDateChange(date) {
        this.manufactureDateString = moment(date).format('YYYY-MM-DD')
      },
      changeProtocolType(value)
      {
        // this.form.setFieldsValue({ communicatioProtocol: parseInt(value) }); 
        // this.communicatioProtocol=value

    },
      equipmentTypeFunc(value){
        // this.form.setFieldsValue({ type: value }); 
        // this.equipmentType=value;

    },
       /**
       * 获取字典数据
       */
      sysDictTypeDropDown(text) {
        sysDictTypeDropDown({code: 'protocol_type' }).then((res) => {
          this.protocolTypes = res.data
          this.protocolTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })

        sysDictTypeDropDown({code: 'equipment_type'}).then((res) => {
          this.equipmentTypes = res.data
          this.equipmentTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })
        })
      },
      /**
       * 初始化方法
       */
      add(record) {
        this.visible = true
        this.formLoading = false
        this.resetAttribute() 
      },
      validateFields()
      {
        var result=true;
        this.errors.code=!this.attributeData.code;
        this.errors.name=!this.attributeData.name;
        this.errors.host=this.attributeData.communicatioProtocol< 3  !this.attributeData.host : false;
        this.errors.port=this.attributeData.communicatioProtocol< 3  !this.attributeData.port : false;
        this.errors.comPort=this.attributeData.communicatioProtocol>=3  !this.attributeData.comPort : false;
        this.errors.baudRate=this.attributeData.communicatioProtocol>=3  !this.attributeData.baudRate : false;
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

        this.formLoading=true
        const host=this.attributeData.communicatioProtocol>=3  '' : this.attributeData.host
        const port=this.attributeData.communicatioProtocol>=3  0 : this.attributeData.port
        const comPort=this.attributeData.communicatioProtocol>=3  this.attributeData.comPort : ''
        const baudRate=this.attributeData.communicatioProtocol>=3  this.attributeData.baudRate : 0

        this.attributeData.baudRate=baudRate
        this.attributeData.comPort=comPort
        this.attributeData.host=host
        this.attributeData.port=port
        this.attributeData.manufactureDate=this.manufactureDateString    
        
        if((!this.attributeData.isThirdParty && this.attributeData.type === 0) || (this.attributeData.isThirdParty===true && this.attributeData.type===2))
          this.attributeData.pipetteAttribute=this.pipetteAttribute;   
        
        exp_equipment_add(this.attributeData).then((res) => {
          if (res.success) {
            this.$message.success('新增成功')
            this.visible = false
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
        this.form.resetFields()
        this.visible = false
      }
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
  width: 120px;
}

.my-input-speed{
  width: 160px;
}
.table-col-label
{
  width:100px;
  padding: 10px;
}
.table-col-label div
{
  width:100%;
  text-align:right;
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
