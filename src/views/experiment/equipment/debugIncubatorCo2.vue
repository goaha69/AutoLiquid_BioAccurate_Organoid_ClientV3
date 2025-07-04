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
            </a-form-item>            
          </a-col>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="InitializeDevice()">初始化</a-button>  
          </div>          
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="塔数" :labelWidth="40"  :min="1" :max="9" :step="1"  v-model:value="params.tower" allow-clear ></sp>
            <a-button type="primary" @click="SetTowerNumber()">设置塔数</a-button>
            <a-divider type="vertical"></a>
            <sp-input-number label="层数" :labelWidth="40"  :min="1" :max="25" :step="1"  v-model:value="params.layer" allow-clear ></sp>
            <a-button type="primary" @click="SetLayerNumber()">设置层数</a-button>
            <sp-input label="名称" :labelWidth="80" :inputWidth="80" v-model:value="params.code" allow-clear ></sp>
            <sp-input-number label="时间" :labelWidth="40"  :min="1" :step="1"  v-model:value="params.time" allow-clear ></sp>
          </div>
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
                <a-button type="primary" @click="SetAutoFeed()">自动上料</a-button>  
                <a-button type="primary" @click="SetAutoBlank()">自动下料</a-button>
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
        params:{tower:1,layer:1,time:0},
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
      btnInitCmd(cmd) {
        const data = this.form
        data.cmd=cmd+'I'
        doCmd(data).then((res) => {
          if (res.success) {
          } else {
            this.$message.error('执行命令失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('执行命令错误::' + err.message)
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
      handleCancel() {
        this.form.id = ''
        this.visible = false
      },
      InitializeDevice(){
        var param={"cmd":"initializedevice","value":"0"}
        this.doCmd(param)
      },
      SetTowerNumber(){
        var param={"cmd":"settowernumber","value":this.params.tower}
        this.doCmd(param)
      },
      SetLayerNumber(){
        var param={"cmd":"setlayernumber","value":this.params.layer}
        this.doCmd(param)
      },
      SetAutoFeed(){
        var param={"cmd":"setautofeed","value":"0","tower":this.params.tower,"layer":this.params.layer,"code":this.params.code,"time":this.params.time}
        this.doCmd(param)
      },
      SetAutoBlank(){
        var param={"cmd":"setautoblank","value":"0","tower":this.params.tower,"layer":this.params.layer,"time":this.params.time}
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
