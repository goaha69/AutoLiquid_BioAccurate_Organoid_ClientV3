<template>
  <a-modal
    :title="title" :width="500" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form>
        <a-row :gutter="8">
          <div>            
            <sp-input label="程序集编号" :required="true" :isError="errors.code" v-model:modelValue="attributeData.code" />          
          </div> 
        </a-row>
        <a-row :gutter="8">
          <div style="margin-top:10px;">
            <sp-input label="程序集名称" :required="true" :isError="errors.name" :inputWidth="200" v-model:modelValue="attributeData.name" />            
          </div>   
        </a-row>
        <a-row :gutter="8">
          <div style="margin-top:15px;">
            <sp-input-number label="排序" v-model="attributeData.sort" :step="1"/>
          </div>       
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { defineComponent } from 'vue'
  import { message } from 'ant-design-vue'
  import {exp_flow_step_add,exp_flow_step_edit} from '@/api/modular/experiment/expFlowStepManage'
  import SpInputNumber from '@/components/spInputNumber.vue';
  import SpInput from '@/components/spInput.vue';
  
  export default defineComponent({
    components: {
      SpInputNumber,
      SpInput
    },
    data () {
      return {
        visible: false,
        formLoading: false,
        title: '程序',
        attributeData:{
          id:0,
          type:-1,
          pid:'0',
          controlClass:'',
          executeMethod:''
        },
        errors:{
          code:false,
          name:false,
        },
      }
    },
    methods: {
      add (record) {
        this.visible = true
        this.title = "新增程序"
        console.log(record)
        this.attributeData= { ...record };
      },
      /**
       * 初始化方法
       */
      edit (record) {
        this.visible = true
        this.title = "编辑程序"
        console.log(record)
        this.attributeData= { ...record };
      },
      validateFields()
      {
        var result=true;
        this.errors.code=!this.attributeData.code;
        this.errors.name=!this.attributeData.name;
        console.log(this.errors)
        for (const key in this.errors) {          
          if (this.errors[key]) {            
            result=false
            break;
          }
        }
        return result
      },
      handleSubmit () {
        console.log('=================handleSubmit=================')
        if(!this.validateFields())
          return;

        this.formLoading = true
        if(this.attributeData.id==0)
        {
          exp_flow_step_add(this.attributeData).then((res) => {
            if (res.success) {
              message.success('新增成功')
              this.$emit('ok', this.attributeData)
              this.handleCancel()
            } else {
              message.error(res.message)
            }
          }).finally((res) => {
            this.formLoading = false
          })
        }
        else
        {
          exp_flow_step_edit(this.attributeData).then((res) => {
            if (res.success) {
              message.success('编辑成功')
              this.$emit('ok', this.attributeData)
              this.handleCancel()
            } else {
              message.error(res.message)
            }
          }).finally((res) => {
            this.formLoading = false
          })
        }
      },
      handleCancel () {
        this.visible = false
      }
    }
  })
</script>
<style scoped>
.ant-row{
  height: 40px;
}
.ant-col{
  height: 40px;
}
.ant-form-item{
  height: 40px;
}
.ant-form-item-control{
  height: 40px;
}
.ant-form-explain{
  height: 0;
}

.span-unit{
  margin-left: 5px;
}
.span-label{
  width: 140px;
  text-align: right;
  display:inline-block;
  color: black;
}
</style>
