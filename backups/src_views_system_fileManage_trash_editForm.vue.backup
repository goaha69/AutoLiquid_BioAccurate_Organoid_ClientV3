<template>
	<a-modal
	  title="༭վ"
	  :width="900"
	  :open="visible"
	  :confirmLoading="confirmLoading"
	  @ok="handleSubmit"
	  @cancel="handleCancel">
		<a-spin :spinning="confirmLoading">
			<a-form :form="form">
				<a-form-item v-show="false">
					<a-input v-decorator="['id']" ></a>
				</a-form-item>
					<a-form-item label="" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input placeholder="" v-decorator="['name']" ></a>
						
					</a-form-item>
					<a-form-item label="" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input-number placeholder="" style="width: 100%" v-decorator="['documentType']" ></a>
						
					</a-form-item>
					<a-form-item label="ļ׺" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input placeholder="ļ׺" v-decorator="['fileSuffix']" ></a>
						
					</a-form-item>
					<a-form-item label="ļСkb" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input-number placeholder="ļСkb" style="width: 100%" v-decorator="['fileSizeKb']" ></a>
						
					</a-form-item>
					<a-form-item label="洢ļ" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input placeholder="洢ļ" v-decorator="['fileObjectName']" ></a>
						
					</a-form-item>
					<a-form-item label="ǩ" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input-number placeholder="ǩ" style="width: 100%" v-decorator="['label']" ></a>
						
					</a-form-item>
					<a-form-item label="ע" :labelCol="labelCol" :wrapperCol="wrapperCol" has-feedback="">
						<a-input placeholder="뱸ע" v-decorator="['remark']" ></a>
						
					</a-form-item>
				</a-form>
		</a-spin>
	</a-modal>
</template>

<script>
	import {
	TrashEdit
	} from '@/api/modular/system/fileManage/trashManage'
	export default {
	data () {
	return {
	labelCol: {
	xs: { span: 24 },
	sm: { span: 6 }
	},
	wrapperCol: {
	xs: { span: 24 },
	sm: { span: 16 }
	},
	visible: false,
	confirmLoading: false,
	form: this.$form.createForm(this)
	}
	},
	methods: {
	// ʼ
	edit (record) {
	this.visible = true
	setTimeout(() => {
	this.form.setFieldsValue(
	{
	id: record.id,
	name: record.name,
	documentType: record.documentType,
	fileSuffix: record.fileSuffix,
	fileSizeKb: record.fileSizeKb,
	fileObjectName: record.fileObjectName,
	label: record.label,
	remark: record.remark
	}
	)
	}, 100)
	},
	handleSubmit () {
	const { form: { validateFields } } = this
	this.confirmLoading = true
	validateFields((errors, values) => {
	if (!errors) {
	for (const key in values) {
	if (typeof (values[key]) === 'object') {
	values[key] = JSON.stringify(values[key])
	}

	}
	for (const prop in values) {
	if (values[prop] === 'null') {
	values[prop] = ''
	}
	}

	TrashEdit(values).then((res) => {
	if (res.success) {
	this.$message.success('༭ɹ')
	this.confirmLoading = false
	this.$emit('ok', values)
	this.handleCancel()
	} else {
	this.$message.error('༭ʧ:'+ JSON.stringify(res.message))//  + res.message
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
