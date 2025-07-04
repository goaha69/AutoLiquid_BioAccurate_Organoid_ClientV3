<template>
  <a-modal
    :title="'设计表单:'+name"
    :width="'90%'"
    :height="100"
    :open="visible"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <a-form-item v-show="false">
          <a-input v-decorator="['id']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['orgId']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['sort']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['remark']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['name']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['content']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['contentData']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['contentParse']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['fields']" ></a>
        </a-form-item>
        <a-form-item>
          <k-form-design :showHead="false" :toolbars="['reset', 'importJson','exportJson', 'preview','exportCode']" style="background-color: white;" ref='kfd' ></k>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<style scoped>
.centered-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-modal) {
  top: 0;
  padding-bottom: 0;
  margin: 0 auto;
}

:deep(.ant-modal-content) {
  margin-top: 0;
}
</style>
<script>
  import 'k-form-design/styles/k-form-design.less'
  import { flcFormEdit } from '@/api/modular/flowCenter/formManage'
  export default {
    data () {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 15 }
        },
        visible: false,
        confirmLoading: false,
        formLoading: true,
        name:null,
        form: this.$form.createForm(this)
      }
    },
    methods: {
      /**
       * 初始化方法
       */
      edit (record) {
        this.visible = true
        this.formLoading = false
        this.name=record.name
        setTimeout(() => {
          this.form.setFieldsValue(
            {
              id: record.id,
              name: record.name,
              content: record.content,
              contentParse: record.contentParse,
              contentData: record.contentData,
              frmType: record.frmType,
              webId: record.webId,
              orgId: !!record.orgId&&record.orgId!=0  record.orgId : null,
              sort: record.sort,
              active: record.active,
              remark: record.remark
            }
          )
          this.importData(record.content)
        }, 100)
      },
      importData(value){
        if(!!value)
        {
          this.$refs.kfd.handleSetData(JSON.parse(value));
        }
      },
      getDesignData(){
        const kfd = this.$refs.kfd
        const fieldData= kfd.getFieldSchema()
        const fields = []
        const fieldsParse = []
        fieldData.forEach(item=>{
          const tempData={}
          tempData.id=item.key
          if(!!item.model)
          {
            tempData.id=item.model
          }
          tempData.name=item.label
          fieldsParse.push(tempData)
          fields.push( tempData.id)
        })
        this.content = fields.length>0  JSON.stringify(kfd.getValue()) : null;
        this.contentData = fields.length>0  fields.join(",") : null
        this.contentParse = fieldsParse.length>0  JSON.stringify(fieldsParse) : null
        this.fields = fieldData.length
        this.form.setFieldsValue(
        {
          content: this.content,
          contentData: this.contentData,
          contentParse: this.contentParse,
          fields:this.fields,
        })
      },
      handleSubmit () {
        this.confirmLoading = true
        this.getDesignData();
        const { form: { validateFields } } = this
        validateFields((errors, values) => {
          if (!errors) {
            flcFormEdit(values).then((res) => {
              if (res.success) {
                this.$message.success('设计成功')
                this.visible = false
                this.confirmLoading = false
                this.$emit('ok', values)
                this.form.resetFields()
              } else {
                this.$message.error('设计失败::' + res.message)
              }
            }).finally((res) => {
              this.confirmLoading = false
            })
          } else {
            this.confirmLoading = false
          }
        })
      },
      handleCancel () {
        this.form.resetFields()
        this.visible = false
      }
    }
  }
</script>
