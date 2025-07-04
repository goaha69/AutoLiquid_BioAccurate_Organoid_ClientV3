<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" ></a>
        </a-form-item>

        <a-row :gutter="8">
          <div style="margin-top:20px;">
              <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
                <a-divider type="vertical"></a>
                <a-button type="primary" @click="btnInitMachine" >全部复位</a-button>
          </div>      
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnOpenCamera()">打开相机</a-button>  
                <a-button type="primary" @click="BtnCloseCamera()">关闭相机</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="曝光" :labelWidth="40"  :min="0"  v-model:value="params.exposure" allow-clear ></sp>
            <sp-input-number label="增益" :labelWidth="40"  :min="0"  v-model:value="params.gain" allow-clear ></sp>
            <sp-input-number label="帧率" :labelWidth="40"  :min="0"  v-model:value="params.framerate" allow-clear ></sp>
              <a-button type="primary" @click="BtnSetCameraParam()">设置相机参数</a-button> 
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnStartGrap()">开始采集</a-button>  
                <a-button type="primary" @click="BtnStopGrap()">停止采集</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnOnceSoftTrigger()">拍照一次/a-button>  
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
        myInputNumberStep:1,
        params:{exposure:'',gain:'',framerate:'',sno:''},
      }
    },
    methods: {
      btnInitMachine()
      {

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
            this.$refs.table.refresh()
          } else {
            this.$message.error('设备连接失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('设备连接错误:' + err.message)
        })
      },
      doCmd(param) {
        const data = this.form
        data.param=param
        doCmd(data).then((res) => {
          if (res.success) {
          } else {
            this.$message.error('执行命令失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误::' + err.message)
        })
      }, 
      getValue(param){
        const data = this.form
        data.param=param
        doCmd(data).then((res) => {
          if (res.success) {
            console.log(res.data)
            console.log(res)
          } else {
            this.$message.error('执行命令失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误::' + err.message)
        })
      },
      handleCancel() {
        this.form.id = ''
        this.visible = false
      },
      BtnOpenCamera(){
        var param={"cmd":"opencamera","value":"0"}
        
        this.doCmd(param)
      },
      BtnCloseCamera(){
        var param={"cmd":"closecamera","value":"0"}
        this.doCmd(param)
      },
      BtnStartGrap(){
        var param={"cmd":"startgrap","value":"0"}
        this.doCmd(param)
      },
      BtnStopGrap(){
        var param={"cmd":"closegrap","value":"0"}
        this.doCmd(param)
      },
      BtnOnceSoftTrigger(){
        var param={"cmd":"oncesofttrigger","sno":this.params.sno}
        this.doCmd(param)
      },
      BtnSetCameraParam(){
        var param={"cmd":"setcameraparam","exposure":this.params.exposure, "gain":this.params.gain, "framerate":this.params.framerate}
        this.doCmd(param)
      },
    }
  }
</script>
<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
}
</style>
