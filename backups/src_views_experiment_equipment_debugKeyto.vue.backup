<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" ></a>
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
						<a-button type="primary" @click="btnConnect()">连接设备</a-button>
					</div>     
        </a-row>
        
        <a-row :gutter="8">
          <div style="margin-top:20px;">
            通道1数据复制至已选择通道
            <a-switch v-model:checked="choose.checked0" @change="SwitchChange()"></a>
					</div>     
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked1">通道1</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol1" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol1" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed1" allow-clear ></sp>
            <sp-input label="枪头1" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists1" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
					</div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked2">通道2</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol2" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol2" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed2" allow-clear ></sp>
            <sp-input label="枪头2" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists2" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <a-checkbox v-model:checked="choose.checked3">通道3</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol3" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol3" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed3" allow-clear ></sp>
            <sp-input label="枪头3" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists3" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked4">通道4</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol4" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol4" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed4" allow-clear ></sp>
            <sp-input label="枪头4" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists4" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked5">通道5</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol5" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol5" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed5" allow-clear ></sp>
            <sp-input label="枪头5" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists5" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked6">通道6</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol6" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol6" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed6" allow-clear ></sp>
            <sp-input label="枪头6" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists6" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked7">通道7</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol7" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol7" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed7" allow-clear ></sp>
            <sp-input label="枪头7" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists7" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked8">通道8</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol8" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol8" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed8" allow-clear ></sp>
            <sp-input label="枪头8" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists8" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked9">通道9</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol9" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol9" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed9" allow-clear ></sp>
            <sp-input label="枪头9" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists9" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked10">通道10</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol10" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol10" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed10" allow-clear ></sp>
            <sp-input label="枪头10" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists10" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked11">通道11</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol11" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol11" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed11" allow-clear ></sp>
            <sp-input label="枪头11" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists11" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;"> 
            <a-checkbox v-model:checked="choose.checked12">通道12</a-checkbox>
            <sp-input-number label="吸液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.AspirateVol12" allow-clear ></sp>
            <sp-input-number label="喷液量" :labelWidth="60" unit="uL" :min="0.01" :max="1040" v-model:value="params.DispenseVol12" allow-clear ></sp>
            <sp-input-number label="速度" :labelWidth="60" unit="uL/s" :min="100" :max="2000" v-model:value="params.Speed12" allow-clear ></sp>
            <sp-input label="枪头12" :labelWidth="60" :inputWidth="60" unit="存在" v-model:value="params.IsTipExists12" allow-clear ></sp>
						<a-button type="primary" @click="btnTipExists()">检测</a-button> 
          </div>
        </a-row>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
            <a-button type="primary" @click="btnInit()">复位</a-button>  
						<a-button type="primary" @click="btnAspirate()">吸液</a-button> 
            <a-button type="primary" @click="btnDispense()">喷液</a-button> 
            <a-button type="primary" @click="btnDropDiti()">退枪头</a-button>
            <a-button type="primary" @click="btnDetectLiquid()">液面检测</a-button>
            <a-button type="primary" @click="btnGetDeviceID()">查看版本</a-button>
					</div>     
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
  import {connect,doCmd} from '@/api/modular/experiment/debug'
  import SpInputNumber from '@/components/spInputNumber.vue';
  import SpInput from '@/components/spInput.vue';
  import { ref } from 'vue';

	export default {
		components: {
			SpInputNumber,
			SpInput
    },
			data() {
				return {
					visible: false,
					confirmLoading: false,
					formLoading: false,
					form: ref({}),
					equipmentName:'',
					cmdParam:'',
					myInputNumberStep:0.5,
					myInputNumberPrecision:2,
          choose:{checked0:false,
                  checked1:true,checked2:false,checked3:false,checked4:false,
                  checked5:false,checked6:true,checked7:false,checked8:false,
                  checked9:false,checked10:true,checked11:false,checked12:false,
          },
					params:{AspirateVol1:100,DispenseVol1:100,Speed1:300,IsTipExists1:"",
                  AspirateVol2:100,DispenseVol2:100,Speed2:300,IsTipExists2:"",
                  AspirateVol3:100,DispenseVol3:100,Speed3:300,IsTipExists3:"",
                  AspirateVol4:100,DispenseVol4:100,Speed4:300,IsTipExists4:"",
                  AspirateVol5:100,DispenseVol5:100,Speed5:300,IsTipExists1:"",
                  AspirateVol6:100,DispenseVol6:100,Speed6:300,IsTipExists2:"",
                  AspirateVol7:100,DispenseVol7:100,Speed7:300,IsTipExists3:"",
                  AspirateVol8:100,DispenseVol8:100,Speed8:300,IsTipExists4:"",
                  AspirateVol9:100,DispenseVol9:100,Speed9:300,IsTipExists2:"",
                  AspirateVol10:100,DispenseVol10:100,Speed10:300,IsTipExists3:"",
                  AspirateVol11:100,DispenseVol11:100,Speed11:300,IsTipExists4:"",
                  AspirateVol12:100,DispenseVol12:100,Speed12:300,IsTipExists1:"",
        },
				}
		},
		methods: {
			// 初始化方法			debug(record) {

      this.visible = true
        this.equipmentName=record.name
        setTimeout(() => {
          this.form.id = record.id
        }, 100)     
      },
      handleCancel() {
        this.form.id = ''
        this.visible = false
      },
      SwitchChange(){
        switch (this.choose.checked0) {
          case true:
            if(this.choose.checked2){
              this.params.AspirateVol2=this.params.AspirateVol1
              this.params.DispenseVol2=this.params.DispenseVol1
              this.params.Speed2=this.params.Speed1
            }
            if(this.choose.checked3){
              this.params.AspirateVol3=this.params.AspirateVol1
              this.params.DispenseVol3=this.params.DispenseVol1
              this.params.Speed3=this.params.Speed1
            }
            if(this.choose.checked4){
              this.params.AspirateVol4=this.params.AspirateVol1
              this.params.DispenseVol4=this.params.DispenseVol1
              this.params.Speed4=this.params.Speed1
            }
            if(this.choose.checked5){
              this.params.AspirateVol5=this.params.AspirateVol1
              this.params.DispenseVol5=this.params.DispenseVol1
              this.params.Speed5=this.params.Speed1
            }
            if(this.choose.checked6){
              this.params.AspirateVol6=this.params.AspirateVol1
              this.params.DispenseVol6=this.params.DispenseVol1
              this.params.Speed6=this.params.Speed1
            }
            if(this.choose.checked7){
              this.params.AspirateVol7=this.params.AspirateVol1
              this.params.DispenseVol7=this.params.DispenseVol1
              this.params.Speed7=this.params.Speed1
            }
            if(this.choose.checked8){
              this.params.AspirateVol8=this.params.AspirateVol1
              this.params.DispenseVol8=this.params.DispenseVol1
              this.params.Speed8=this.params.Speed1
            }
            if(this.choose.checked9){
              this.params.AspirateVol9=this.params.AspirateVol1
              this.params.DispenseVol9=this.params.DispenseVol1
              this.params.Speed9=this.params.Speed1
            }
            if(this.choose.checked10){
              this.params.AspirateVol10=this.params.AspirateVol1
              this.params.DispenseVol10=this.params.DispenseVol1
              this.params.Speed10=this.params.Speed1
            }
            if(this.choose.checked11){
              this.params.AspirateVol11=this.params.AspirateVol1
              this.params.DispenseVol11=this.params.DispenseVol1
              this.params.Speed11=this.params.Speed1
            }
            if(this.choose.checked12){
              this.params.AspirateVol12=this.params.AspirateVol1
              this.params.DispenseVol12=this.params.DispenseVol1
              this.params.Speed12=this.params.Speed1
            }
            else

            break;
          default:
            break;
        }
      },
			btnConnect() {
        const data = this.form
        console.log('连接设备ID:' + data.id)
        connect(data).then((res) => {
          if (res.success) {
            this.$message.success('设备连接成功')
            this.$refs.table.refresh()
          } else {
            this.$message.error('设备连接失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('设备连接错误:' + err.message)
        })
      },
			// 初始化			btnInit(){

      var channels = []
            if(this.choose.checked1){
              channels.push(1)
            }
            if(this.choose.checked2){
              channels.push(2)
            }
            if(this.choose.checked3){
              channels.push(3)
            }
            if(this.choose.checked4){
              channels.push(4)
            }
            if(this.choose.checked5){
              channels.push(5)
            }
            if(this.choose.checked6){
              channels.push(6)
            }
            if(this.choose.checked7){
              channels.push(7)
            }
            if(this.choose.checked8){
              channels.push(8)
            }
            if(this.choose.checked9){
              channels.push(9)
            }
            if(this.choose.checked10){
              channels.push(10)
            }
            if(this.choose.checked11){
              channels.push(11)
            }
            if(this.choose.checked12){
              channels.push(12)
            }
        const data = this.form
        data.param = {"cmd":"init","channels":channels}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},
			// 退			btnDropDiti(){

      var channels = []
            if(this.choose.checked1){
              channels.push(1)
            }
            if(this.choose.checked2){
              channels.push(2)
            }
            if(this.choose.checked3){
              channels.push(3)
            }
            if(this.choose.checked4){
              channels.push(4)
            }
            if(this.choose.checked5){
              channels.push(5)
            }
            if(this.choose.checked6){
              channels.push(6)
            }
            if(this.choose.checked7){
              channels.push(7)
            }
            if(this.choose.checked8){
              channels.push(8)
            }
            if(this.choose.checked9){
              channels.push(9)
            }
            if(this.choose.checked10){
              channels.push(10)
            }
            if(this.choose.checked11){
              channels.push(11)
            }
            if(this.choose.checked12){
              channels.push(12)
            }
        const data = this.form
        data.param = {"cmd":"dropditi","channels":channels}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},
      			/**
       * 液面检
       */
      btnDetectLiquid(){
        var channels = []
            if(this.choose.checked1){
              channels.push(1)
            }
            if(this.choose.checked2){
              channels.push(2)
            }
            if(this.choose.checked3){
              channels.push(3)
            }
            if(this.choose.checked4){
              channels.push(4)
            }
            if(this.choose.checked5){
              channels.push(5)
            }
            if(this.choose.checked6){
              channels.push(6)
            }
            if(this.choose.checked7){
              channels.push(7)
            }
            if(this.choose.checked8){
              channels.push(8)
            }
            if(this.choose.checked9){
              channels.push(9)
            }
            if(this.choose.checked10){
              channels.push(10)
            }
            if(this.choose.checked11){
              channels.push(11)
            }
            if(this.choose.checked12){
              channels.push(12)
            }
        const data = this.form
        data.param = {"cmd":"detectliquid","channels":channels}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},			/**
       * 获取版本
       */
      btnGetDeviceID(){
        var channels = []
            if(this.choose.checked1){
              channels.push(1)
            }
            if(this.choose.checked2){
              channels.push(2)
            }
            if(this.choose.checked3){
              channels.push(3)
            }
            if(this.choose.checked4){
              channels.push(4)
            }
            if(this.choose.checked5){
              channels.push(5)
            }
            if(this.choose.checked6){
              channels.push(6)
            }
            if(this.choose.checked7){
              channels.push(7)
            }
            if(this.choose.checked8){
              channels.push(8)
            }
            if(this.choose.checked9){
              channels.push(9)
            }
            if(this.choose.checked10){
              channels.push(10)
            }
            if(this.choose.checked11){
              channels.push(11)
            }
            if(this.choose.checked12){
              channels.push(12)
            }
        const data = this.form
        data.param = {"cmd":"getdeviceid","channels":channels}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},
			// 吸液

	btnAspirate(){
        var channels = []
        var aspVols =[]
        var speeds = []
            if(this.choose.checked1){
              channels.push(1)
              aspVols.push(this.params.AspirateVol1)
              speeds.push(this.params.Speed1)
            }
            if(this.choose.checked2){
              channels.push(2)
              aspVols.push(this.params.AspirateVol2)
              speeds.push(this.params.Speed2)
            }
            if(this.choose.checked3){
              channels.push(3)
              aspVols.push(this.params.AspirateVol3)
              speeds.push(this.params.Speed3)
            }
            if(this.choose.checked4){
              channels.push(4)
              aspVols.push(this.params.AspirateVol4)
              speeds.push(this.params.Speed4)
            }
            if(this.choose.checked5){
              channels.push(5)
              aspVols.push(this.params.AspirateVol5)
              speeds.push(this.params.Speed5)
            }
            if(this.choose.checked6){
              channels.push(6)
              aspVols.push(this.params.AspirateVol6)
              speeds.push(this.params.Speed6)
            }
            if(this.choose.checked7){
              channels.push(7)
              aspVols.push(this.params.AspirateVol7)
              speeds.push(this.params.Speed7)
            }
            if(this.choose.checked8){
              channels.push(8)
              aspVols.push(this.params.AspirateVol8)
              speeds.push(this.params.Speed8)
            }
            if(this.choose.checked9){
              channels.push(9)
              aspVols.push(this.params.AspirateVol9)
              speeds.push(this.params.Speed9)
            }
            if(this.choose.checked10){
              channels.push(10)
              aspVols.push(this.params.AspirateVol10)
              speeds.push(this.params.Speed10)
            }
            if(this.choose.checked11){
              channels.push(11)
              aspVols.push(this.params.AspirateVol11)
              speeds.push(this.params.Speed11)
            }
            if(this.choose.checked12){
              channels.push(12)
              aspVols.push(this.params.AspirateVol12)
              speeds.push(this.params.Speed12)
            }
        const data = this.form
        data.param = {"cmd":"aspirate","channels":channels,"aspVols":aspVols,"speeds":speeds}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},
			// 喷液

	btnDispense(){
        var channels = []
        var disVols =[]
        var speeds = []
            if(this.choose.checked1){
              channels.push(1)
              disVols.push(this.params.DispenseVol1)
              speeds.push(this.params.Speed1)
            }
            if(this.choose.checked2){
              channels.push(2)
              disVols.push(this.params.DispenseVol2)
              speeds.push(this.params.Speed2)
            }
            if(this.choose.checked3){
              channels.push(3)
              disVols.push(this.params.DispenseVol3)
              speeds.push(this.params.Speed3)
            }
            if(this.choose.checked4){
              channels.push(4)
              disVols.push(this.params.DispenseVol4)
              speeds.push(this.params.Speed4)
            }
            if(this.choose.checked5){
              channels.push(5)
              disVols.push(this.params.DispenseVol5)
              speeds.push(this.params.Speed5)
            }
            if(this.choose.checked6){
              channels.push(6)
              disVols.push(this.params.DispenseVol6)
              speeds.push(this.params.Speed6)
            }
            if(this.choose.checked7){
              channels.push(7)
              disVols.push(this.params.DispenseVol7)
              speeds.push(this.params.Speed7)
            }
            if(this.choose.checked8){
              channels.push(8)
              disVols.push(this.params.DispenseVol8)
              speeds.push(this.params.Speed8)
            }
            if(this.choose.checked9){
              channels.push(9)
              disVols.push(this.params.DispenseVol9)
              speeds.push(this.params.Speed9)
            }
            if(this.choose.checked10){
              channels.push(10)
              disVols.push(this.params.DispenseVol10)
              speeds.push(this.params.Speed10)
            }
            if(this.choose.checked11){
              channels.push(11)
              disVols.push(this.params.DispenseVol11)
              speeds.push(this.params.Speed11)
            }
            if(this.choose.checked12){
              channels.push(12)
              disVols.push(this.params.DispenseVol12)
              speeds.push(this.params.Speed12)
            }
        const data = this.form
        data.param = {"cmd":"dispense","channels":channels,"disVols":disVols,"speeds":speeds}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			},
			btnTipExists(){
        var channels = []
            if(this.choose.checked1){
              channels.push(1)
            }
            if(this.choose.checked2){
              channels.push(2)
            }
            if(this.choose.checked3){
              channels.push(3)
            }
            if(this.choose.checked4){
              channels.push(4)
            }
            if(this.choose.checked5){
              channels.push(5)
            }
            if(this.choose.checked6){
              channels.push(6)
            }
            if(this.choose.checked7){
              channels.push(7)
            }
            if(this.choose.checked8){
              channels.push(8)
            }
            if(this.choose.checked9){
              channels.push(9)
            }
            if(this.choose.checked10){
              channels.push(10)
            }
            if(this.choose.checked11){
              channels.push(11)
            }
            if(this.choose.checked12){
              channels.push(12)
            }
        const data = this.form
        data.param = {"cmd":"tipexists","channels":channels}
				doCmd(data).then((res) => {
					if (res.success) {
            console.log(res)
						switch(res.data){
							case 0:this.params.IsTipExists = "false" ;break;
							case 1:this.params.IsTipExists = "true"  ;break;
						}
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::::' + res.message)
          }
				})
			}
		}
	}
</script>

<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
}
</style>
