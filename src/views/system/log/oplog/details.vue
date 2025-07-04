<template>
  <a-modal title="日志详情" :width="900" :open="visible" :confirmLoading="confirmLoading" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row :gutter="24">
          <a-col  md="12" : sm="24">
            <a-form-item label="方法名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['methodName']" ></a>
            </a-form-item>
          </a-col>
          <a-col  md="12" : sm="24">
            <a-form-item label="地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['location']" ></a>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col  md="12" : sm="24">
            <a-form-item label="浏览:" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['browser']" ></a>
            </a-form-item>
          </a-col>
          <a-col  md="12" : sm="24">
            <a-form-item label="操作系统" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['os']" ></a>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col  md="12" : sm="24">
            <a-form-item label="类名:" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="4" v-decorator="['className']" ></a>
            </a-form-item>
          </a-col>
          <a-col  md="12" : sm="24">
            <a-form-item label="具体消息" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="4" v-decorator="['message']" ></a>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col  md="12" : sm="24">
            <a-form-item label="请求参数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="4" v-decorator="['param']" ></a>
            </a-form-item>
          </a-col>
          <a-col  md="12" : sm="24">
            <a-form-item label="返回结果" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="4" v-decorator="['result']" ></a>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
  export default {
    data() {
      return {
        labelCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 5
          }
        },
        wrapperCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 15
          }
        },
        visible: false,
        confirmLoading: false,
        form: this.$form.createForm(this)
      }
    },
    methods: {
      /**
       * 初始化方法
       */
      details(record) {
        this.visible = true
        setTimeout(() => {
          this.form.setFieldsValue({
            location: record.location,
            browser: record.browser,
            os: record.os,
            className: record.className,
            methodName: record.methodName,
            param: record.param,
            result: record.result,
            message: record.message
          })
        }, 100)
      },
      handleCancel() {
        this.form.resetFields()
        this.visible = false
      }
    }
  }
</script>
