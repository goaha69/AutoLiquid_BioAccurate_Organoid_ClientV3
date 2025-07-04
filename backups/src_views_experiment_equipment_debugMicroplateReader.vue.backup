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
                <a-button type="primary" @click="BtnRead()">判读</a-button>  
                <a-button type="primary" @click="BtnStopRead()">停止判读</a-button>
                <a-button type="primary" @click="BtngetRluResult()">获取数据</a-button>
          </div>   
        </a-row>

        <a-row :gutter="24">
          <div style="margin-top:20px;">
            <sp-input-number label="孔位" :labelWidth="60" :placeholder="1" :min="1" :max="384" v-model:value="params.Hole1" allow-clear ></sp>
            <span>-</span>
            <sp-input-number :labelWidth="60" :placeholder="1" :min="1" :max="384" v-model:value="params.Hole2" allow-clear ></sp>
              <a-button type="primary" @click="BtnSetReadHole()">设置</a-button>                   
            </div>

                               
        </a-row>
        

        <a-row :gutter="24">
          <div style="margin-top:20px;">
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
        visible: false,
        confirmLoading: false,
        formLoading: false,
        form: ref({}),
        equipmentName:'',
        cmdParam:'',
        myInputNumberStep:1,
        params:{Hole1:1,Hole2:1}
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
      BtnDoorOpen(){
        var param={"cmd":"open","value":"0"}
        this.doCmd(param)
      },
      BtnDoorClose(){
        var param={"cmd":"close","value":"0"}
        this.doCmd(param)
      },
      BtnRead() {
        var param={"cmd":"read","value":"0"}
        this.doCmd(param)
      },
      BtnStopRead(){
        var param={"cmd":"stopread","value":"0"}
        this.doCmd(param)
      },
      BtnSetReadHole(){
        var holestr = "";
        for(let i=this.params.Hole1;i<=this.params.Hole2;i++){
          holestr += i+",";
        }
        holestr = holestr.slice(0, holestr.length-1);
        console.log(holestr);
        var param={"cmd":"setreadhole","value":holestr}
        this.doCmd(param)
      },
      BtngetRluResult(){
        var param={"cmd":"getrluresult","value":"0"}
        this.doCmd(param)
      }
    }
  }
</script>
<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
}
</style>
