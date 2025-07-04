<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :form="form" >
         <a-form-item style="display: none;" has-feedback>
          <a-input v-decorator="['id']" ></a>
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

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import {connect,doCmd} from '@/api/modular/experiment/debug'
  export default {
    data() {
      return {
        visible: false,
        confirmLoading: false,
        formLoading: false,
        form: this.$form.createForm(this),
        equipmentName:'',
        cmdParam:''
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
          this.form.setFieldsValue({
            id: record.id,
          })
        }, 100)     
      },
      btnConnect() {
        const data = this.form.getFieldsValue()
        console.log('连接设备ID:'+data.id)
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
        const data = this.form.getFieldsValue()
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
      btnDoCmd() {
        const data = this.form.getFieldsValue()
        data.cmd=this.cmdParam
        if(!this.cmdParam || this.cmdParam.trim().length === 0)
        {
          this.$message.error('请输入命令!')
            return;
        }
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
        this.form.resetFields()
        this.visible = false
      }
    }
  }
</script>
<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
       */
}
</style>
