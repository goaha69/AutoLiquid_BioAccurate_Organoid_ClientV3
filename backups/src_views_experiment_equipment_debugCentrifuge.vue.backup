<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" ></a>
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
              <a-button type="primary" @click="btnConnect">连接设备</a-button>
                <a-divider type="vertical"></a>
              <a-button type="primary" @click="btnDisConnect">断开设备</a-button>
          </div>     
        </a-row>
        
        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnSectionLoc(1)">1号杯</a-button>            
                <a-button type="primary" @click="BtnSectionLoc(2)">2号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(3)">3号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(4)">4号杯</a-button>
                <a-divider type="vertical"></a>
                <a-button type="primary" @click="BtnSectionLoc(5)">5号杯</a-button>  
                <a-button type="primary" @click="BtnSectionLoc(6)">6号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(7)">7号杯</a-button>
                <a-button type="primary" @click="BtnSectionLoc(8)">8号杯</a-button>
              </div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="转速" :labelWidth="40" unit="rpm" :min="0" :max="4000" v-model:value="params.Speed" allow-clear ></sp>
            <a-button type="primary" @click="BtnSetSpeed()">设置</a-button>
            <sp-input-number label="时间" :labelWidth="40" unit="min" :min="1" :max="99" v-model:value="params.Time" allow-clear ></sp>
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="上升速度" :labelWidth="40" :min="10" :max="300" v-model:value="params.UpSp" allow-clear ></sp>
            <a-button type="primary" @click="BtnSetUpSp()">设置</a-button>
            <sp-input-number label="下降速度" :labelWidth="40" :min="10" :max="300" v-model:value="params.DownSp" allow-clear ></sp>
            <a-button type="primary" @click="BtnSetDownSp()">设置</a-button>
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="转速" :labelWidth="60" :inputWidth="80" unit="rpm" v-model:value="params.ReadSpeed" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadSpeed()" >读取</a-button>
            <sp-input label="倒计" :labelWidth="60" :inputWidth="80" unit="min" v-model:value="params.ReadMin" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadMin()" >读取</a-button>
            <sp-input label="倒计" :labelWidth="60" :inputWidth="80" unit="sec" v-model:value="params.ReadSec" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadSec()" >读取</a-button>
            <sp-input label="离心力" :labelWidth="60" :inputWidth="80" unit="g" v-model:value="params.ReadForce" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadForce()" >读取</a-button>
          </div>
        </a-row>
        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="运行状态" :labelWidth="80" :inputWidth="80" v-model:value="params.ReadRun" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadRun()" >读取</a-button>
            <sp-input label="杯位" :labelWidth="60" :inputWidth="80" v-model:value="params.ReadCup" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadCup()" >读取</a-button>
            <sp-input label="门状态" :labelWidth="60" :inputWidth="80" v-model:value="params.ReadDoor" allow-clear ></sp>
            <a-button type="primary" @click="BtnReadDoor()" >读取</a-button>
          </div>
        </a-row>

        <a-row :gutter="24">
            <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnRun()">启动</a-button>            
                <a-button type="primary" @click="BtnStop()">停止</a-button>
                <a-divider type="vertical"></a>
                <a-button type="primary" @click="BtnDoorOpen()">开</a-button>  
                <a-button type="primary" @click="BtnDoorClose()">关门</a-button>
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
        labelCol: { xs: { span: 24},sm: { span: 6}},
        wrapperCol: {xs: {span: 24},sm: {span: 16}},
        labelCol_JG: { xs: {span: 24},sm: {span: 3}},
        wrapperCol_JG: {xs: {span: 24}, sm: { span: 20}},
        visible: false,
        confirmLoading: false,
        formLoading: false,
        form: ref({}),
        equipmentName:'',
        cmdParam:'',
        myInputNumberStep:0.5,
        myInputNumberPrecision:2,
        params:{Speed:1000,Time:1,UpSp:9,DownSp:9,ReadSpeed:"0",ReadMin:"0",ReadSec:"0",ReadForce:"0",ReadRun:"",ReadDoor:"",ReadCup:""},
        SendPar:{"cmd":"","value":0,"time":0,"speed":0}
      }
    },
    methods: {
      btnDisConnect(){
        this.SendPar.cmd = "disconnect"
        this.doCmd(this.SendPar)
      },
      /**
       * 初始化方法
       */
      debug(record) {
        this.visible = true
        this.equipmentName=record.name
        setTimeout(() => {
          this.form.id = record.id
        }, 100)     
      },
      btnConnect() {
        const data = this.form
        console.log('连接设备ID:' + data.id)
        connect(data).then((res) => {
          if (res.success) {
            this.$message.success('设备连接成功')
          } else {
            this.$message.error('设备连接失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('设备连接错误:' + err.message)
        })
      },
      doCmd(param) {
        const data = this.form
        data.param = param
        doCmd(data).then((res) => {
          if (res.success) {
            this.$message.success('执行命令成功::' + res.message)
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
        
      }, 
      handleCancel() {
        this.form.resetFields()
        this.visible = false
      },
      BtnSectionLoc(num){
        this.SendPar.cmd = "goto"
        this.SendPar.value = num
        this.doCmd(this.SendPar)
      },
      BtnSetSpeed(){
        this.SendPar.cmd = "SetSpeed"
        this.SendPar.speed = this.params.Speed
        this.doCmd(this.SendPar)          
      },
      BtnSetTime(){
        this.SendPar.cmd = "SetTime"
        this.SendPar.time = this.params.Time
        this.doCmd(this.SendPar)
      },
      BtnSetUpSp(){
        this.SendPar.cmd = "SetUpSp"
        this.SendPar.value = this.params.UpSp
        this.doCmd(this.SendPar)
      },
      BtnSetDownSp(){
        this.SendPar.cmd = "SetDownSp"
        this.SendPar.value = this.params.DownSp
        this.doCmd(this.SendPar)
      },
      BtnRun(){
        this.SendPar.cmd = "run"
        this.SendPar.speed = this.params.Speed
        this.SendPar.time = this.params.Time
        this.doCmd(this.SendPar)
      },
      BtnStop(){
        this.SendPar.cmd = "stop"
        this.doCmd(this.SendPar)
      },
      BtnDoorOpen(){
        this.SendPar.cmd = "open"
        this.doCmd(this.SendPar)
      },
      BtnDoorClose(){
        this.SendPar.cmd = "close"
        this.doCmd(this.SendPar)
      },
      
      BtnReadStatus() {
        const data = this.form
        this.SendPar.cmd = "getstatus"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            this.params.ReadSpeed = res.data.speed 
            this.params.ReadMin   = res.data.min 
            this.params.ReadSec   = res.data.sec
            this.params.ReadForce = res.data.force 
            switch(res.data.door){ 
              case "0000": this.params.ReadDoor = "运动"; break; 
              case "0001": this.params.ReadDoor = "已关"; break;
              case "0002": this.params.ReadDoor = "已开"; break;
            }
            switch(res.data.cup){ 
              case "0000": this.params.ReadCup = "未定"; break; 
              case "0001": this.params.ReadCup = "1号杯" ; break;
              case "0002": this.params.ReadCup = "2号杯" ; break;
              case "0003": this.params.ReadCup = "3号杯" ; break;
              case "0004": this.params.ReadCup = "4号杯" ; break;
              case "0005": this.params.ReadCup = "5号杯" ; break;
              case "0006": this.params.ReadCup = "6号杯" ; break;
              case "0007": this.params.ReadCup = "7号杯" ; break;
              case "0008": this.params.ReadCup = "8号杯" ; break;
              case "0009": this.params.ReadCup = "定位"; break;
            }
            switch(res.data.run){ 
              case "0000": this.params.ReadRun = "空闲"; break; 
              case "0001": this.params.ReadRun = "运动"; break;
              case "0002": this.params.ReadRun = "停止"; break;
              case "0003": this.params.ReadRun = "未定"; break;
            }
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      }, 
      BtnReadSpeed() {
        const data = this.form
        this.SendPar.cmd = "readspeed"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            this.params.ReadSpeed = res.data 
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      }, 
      BtnReadMin(){
        const data = this.form
        this.SendPar.cmd = "readmin"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            this.params.ReadMin = res.data 
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      },
      BtnReadSec(){
        const data = this.form
        this.SendPar.cmd = "readsec"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            this.params.ReadSec = res.data 
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      },
      BtnReadForce(){
        const data = this.form
        this.SendPar.cmd = "readforce"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            this.params.ReadForce= res.data 
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      },
      BtnReadDoor(){
        const data = this.form
        this.SendPar.cmd = "readdoor"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            switch(res.data){ 
              case "0000": this.params.ReadDoor = "运动"; break; 
              case "0001": this.params.ReadDoor = "已关"; break;
              case "0002": this.params.ReadDoor = "已开"; break;
            }
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      },
      BtnReadCup(){
        const data = this.form
        this.SendPar.cmd = "readcup"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {            
            switch(res.data){ 
              case "0000": this.params.ReadCup = "未定"; break; 
              case "0001": this.params.ReadCup = "1号杯" ; break;
              case "0002": this.params.ReadCup = "2号杯" ; break;
              case "0003": this.params.ReadCup = "3号杯" ; break;
              case "0004": this.params.ReadCup = "4号杯" ; break;
              case "0005": this.params.ReadCup = "5号杯" ; break;
              case "0006": this.params.ReadCup = "6号杯" ; break;
              case "0007": this.params.ReadCup = "7号杯" ; break;
              case "0008": this.params.ReadCup = "8号杯" ; break;
              case "0009": this.params.ReadCup = "定位"; break;
            }
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
        })
      },
      BtnReadRun(){
        const data = this.form
        this.SendPar.cmd = "readrun"
        data.param = this.SendPar
        doCmd(data).then((res) => {
          console.log(res)
          if (res.success) {
            switch(res.data){ 
              case "0000": this.params.ReadRun = "空闲"; break; 
              case "0001": this.params.ReadRun = "运动"; break;
              case "0002": this.params.ReadRun = "停止"; break;
              case "0003": this.params.ReadRun = "未定"; break;
            }
          } else {
            this.$message.error('执行命令失败:::::::::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:::::::::' + err.message)
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
