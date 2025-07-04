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
						<a-button type="primary" @click="btnDisConnect()">断开设备</a-button>

					</div>     
				</a-row>
				
				<a-row :gutter="24">
					<div style="margin-top:20px;">夹爪
						<a-button type="primary" @click="btnEnableClamp()">使能</a-button> 
						<sp-input-number label="力矩" :labelWidth="60" :min="0" :max="255" v-model:value="params.torque1" allow-clear ></sp>
						<sp-input-number label="速度" :labelWidth="60" :min="0" :max="255" v-model:value="params.speed1" allow-clear ></sp>
						<sp-input-number label="位置" :labelWidth="60" unit="mm" :min="0" :max="32" v-model:value="params.loca1" allow-clear ></sp>
						<a-button type="primary" @click="btnDoClamp()">执行</a-button> 
					</div>
				</a-row>

				<a-row :gutter="24">
					<div style="margin-top:20px;">旋转
						<a-button type="primary" @click="btnEnableRotate()">使能</a-button> 
						<sp-input-number label="力矩" :labelWidth="60" :min="0" :max="255" v-model:value="params.torque2" allow-clear ></sp>
						<sp-input-number label="速度" :labelWidth="60" :min="0" :max="255" v-model:value="params.speed2" allow-clear ></sp>
						<sp-input-number label="角度" :labelWidth="60" :width="500" unit="ang" :min="-32768" :max="32767" v-model:value="params.loca2" allow-clear ></sp>		
						<a-button type="primary" @click="btnDoRotate()">执行</a-button> 
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
					params:{torque1:127,speed1:127,loca1:0,torque2:127,speed2:127,loca2:0},
				}
		},
		methods: {
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
      handleCancel() {
        this.form.id = ''
        this.visible = false
      },
      btnConnect() {
        const data = this.form
        console.log('连接设备ID:'+data.id)
        connect(data).then((res) => {
          if (res.success) {
            this.$message.success('设备连接成功')
			this.$refs.table.refresh()
          } else {
            this.$message.error('设备连接失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('设备连接错误::' + err.message)
        })
      },
			btnDisConnect(){
        const data = this.form
        data.param = {"cmd":"disconnect","value":0}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::' + res.message)
          }
        })
			},
			btnEnableClamp(){
        const data = this.form
        data.param = {"cmd":"enableclamp","value":0}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::' + res.message)
          }
        })

			},
			btnEnableRotate(){
        const data = this.form
        data.param = {"cmd":"enablerotate","value":0}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::' + res.message)
          }
        })
			},
			btnDoClamp(){
        var value = [this.params.torque1,this.params.speed1,this.params.loca1]
        const data = this.form
        data.param = {"cmd":"doclamp","value":value}
				doCmd(data).then((res) => {
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::' + res.message)
          }
				})
			},
			btnDoRotate(){
        var value = [this.params.torque2,this.params.speed2,this.params.loca2]
        const data = this.form
        data.param = {"cmd":"dorotate","value":value}
				doCmd(data).then((res) => {
					console.log(res)
					if (res.success) {
            this.$message.success('执行成功')
          } 
					else {
            this.$message.error('执行失败::::::' + res.message)
          }
				})
			},
		},
	}
</script>
