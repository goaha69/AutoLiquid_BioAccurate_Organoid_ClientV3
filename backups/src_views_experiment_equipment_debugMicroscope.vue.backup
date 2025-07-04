<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" ></a>
        </a-form-item>

        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" @click.stop="btnConnect">连接设备</a-button>
              <a-divider type="vertical"></a>
              <a-button type="primary" @click="btnInitMachine">全部复位</a-button>
            </a-form-item>            
          </a-col>          
        </a-row>

        <sp-input label="模板名称" :labelWidth="80" :inputWidth="80" v-model:value="params.template" allow-clear ></sp>
        <sp-input label="实验名称" :labelWidth="80" :inputWidth="80" v-model:value="params.experiment" allow-clear ></sp>
        <sp-input label="耗材id" :labelWidth="80" :inputWidth="80" v-model:value="params.time" allow-clear ></sp>
        <sp-input label="名称" :labelWidth="80" :inputWidth="80" v-model:value="params.code" allow-clear ></sp>
        <sp-input label="步骤" :labelWidth="80" :inputWidth="80" v-model:value="params.step" allow-clear ></sp>
              <a-button type="primary" @click="BtnStart()">开</a-button> 

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnStop()">停止</a-button>  
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnMoveFile()">转移文件</a-button>  
                <a-button type="primary" @click="BtnReadCellCount()">读取计数</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="BtnDoorOpen()">开</a-button>  
                <a-button type="primary" @click="BtnDoorClose()">关门</a-button>
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input label="图片路径" :labelWidth="80" :inputWidth="400" v-model:value="params.photopath" allow-clear ></sp>
            <a-button type="primary" @click="BtnAnalysisPhoto()">分析图片</a-button>
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
    },    data() {
      return {
        visible: false,
        confirmLoading: false,
        formLoading: false,
        form: ref({}),
        equipmentName:'',
        cmdParam:'',
        params:{template:'通用类器官BF',experiment:'',time:'1,,',code:'photo',step:1,photopath:''},
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
            this.$message.error('执行命令失败:' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误:' + err.message)
        })
      }, 
      handleCancel() {
        this.form.resetFields()
        this.visible = false
      },
      BtnDoorOpen(){
        var param={"cmd":"open","value":"0"}
        this.doCmd(param)
      },
      BtnDoorClose(){
        var param={"cmd":"close","value":"0"}
        this.doCmd(param)
      },
      BtnStart(){
        var param={"cmd":"start","template":this.params.template, "experiment":this.params.experiment, "time":this.params.time, "code":this.params.code, "step":this.params.step}
        this.doCmd(param)
      },
      BtnStop(){
        var param={"cmd":"stop","value":"0"}
        this.doCmd(param)
      },
      BtnMoveFile(){
        var param={"cmd":"movefile","value":"0"}
        this.doCmd(param)
      },
      BtnReadCellCount(){
        var param={"cmd":"readcellcount","step":this.params.step}
        this.doCmd(param)
      },

      BtnAnalysisPhoto(){
        var param={"cmd":"analysisphoto","photopath":this.params.photopath}
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
