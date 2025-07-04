<template>
  <a-modal
    :title="'ʵ : '+schemeName" :width="'100%'" :open="visible" :maskClosable="false" :confirmLoading="confirmLoading" :destroyOnClose="true"  @ok="handleSubmit"  @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <a-form-item v-show="false">
          <a-input v-decorator="['id']" ></a>
        </a-form-item>
        <a-form-item v-show="false">
          <a-input v-decorator="['content',{rules: [{ required: true}]}]" ></a>
        </a-form-item>
        <a-form-item>
          <expvfd ref="expvfd" style="background-color: white;" :needShow="true" :fieldNames="fieldNames" @openUser="openUser()" @openRole="openRole()"></expvfd>
        </a-form-item>
      </a-form>
    </a-spin>
    <user-list-form ref="userListForm" @ok="handleOkUser"></user>
    <role-list-form ref="roleListForm" @ok="handleOkRole"></role>
  </a-modal>
</template>

<script>
  import { expvfd } from '@/components'
  import { exp_flow_edit } from '@/api/modular/experiment/expFlowManage'
  import userListForm from '@/views/system/user/userListForm'
  import roleListForm from '@/views/system/role/roleListForm'
  export default {
    components: {
      expvfd,
      userListForm,
      roleListForm
    },
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
        schemeName:null,
        fieldNames:[],
        form: this.$form.createForm(this)
      }
    },
    methods: {
      /**
       * ʼ
       */
      edit (record) {
        this.visible = true
        this.formLoading = false
        this.schemeName=record.name
        setTimeout(() => {
          this.form.setFieldsValue(
            {
              id: record.id,
              name: record.name,
              content: record.content,
              code: record.code,
              sort: record.sort,
              remark: record.remark
            }
          )
          // this.fieldNames=JSON.parse(record.contentParse)

        this.importData(record.content)
        }, 100)
      },
      importData(value){
        if(!!value)
        {
          this.$refs.expvfd.loadFlow(value)
        }
        else
        {
          this.$refs.expvfd.clear()
        }  
      },
      getDesignData(){
        const expvfd = this.$refs.expvfd
        const flowData=expvfd.saveFlow()
        this.content = flowData
        this.form.setFieldsValue(
        {
          content: this.content,
        })
      },
      /**
       * ѡû
       */
      openUser(value)
      {
        this.$refs.userListForm.userList(value);
      },
      /**
       * ѡɫ
       */
      openRole(value) {
        this.$refs.roleListForm.roleList(value);
      },  
      /**
       * ûȷϻص
       */
      handleOkUser(value) {
        this.$refs.expvfd.setFlowAttrForm(value);
      },
      /**
       * ɫȷϻص
       */
      handleOkRole(value) {
        this.$refs.expvfd.setFlowAttrForm(value);
      },
      handleSubmit () {
        this.confirmLoading = true
        this.getDesignData();
        const { form: { validateFields } } = this
        validateFields((errors, values) => {
          if (!errors) {
            exp_flow_edit(values).then((res) => {
              if (res.success) {
                this.$message.success('Ƴɹ')
                this.visible = false
                this.confirmLoading = false
                this.$emit('ok', values)
                this.form.resetFields()
                this.$refs.expvfd.clear()
              } else {
                this.$message.error('ʧܣ' + res.message)
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
        this.$refs.expvfd.clear()
        this.visible = false
        this.$refs.expvfd.clear()
      }
    }
  }
</script>
<style scoped>
.ant-modal-body {
  height: 100%;
}
</style>
