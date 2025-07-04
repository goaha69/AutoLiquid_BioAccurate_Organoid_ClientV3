<template>
  <a-modal :title="'调试设备--' + equipmentName" :width="1200" :open="visible" :maskClosable="false" @cancel="handleCancel" :footer="null">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item style="display: none;" has-feedback>
          <a-input v-model:value="form.id" ></a>
        </a-form-item>

        <a-row :gutter="[16,24]">
          <a-col :span="8">
						<a-button type="primary" @click="btnConnect()">连接设备</a-button>  
          </a-col>
          <a-col :span="8" >
            <div style="display: flex; flex-direction: row; align-items : center;">
              <a-input v-model:value="resultcode" style="margin-right:10px;"></a-input>
              <a-button type="primary" @click="beginScan()">开始扫描</a-button>
            </div>
          </a-col>
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
          resultcode:'',
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
			btnConnect() {
        const data = this.form
        console.log('连接设备ID:' + data.id)
        connect(data).then((res) => {
          console.log(res.data)
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
      beginScan(){
        const data = this.form
        data.param = {"cmd":"beginScan"}
        doCmd(data).then((res)=>{
          this.resultcode = res.data
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
