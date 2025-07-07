<template>
	<div>
		<a-drawer
			title="设置"
			placement="left"
			:width="600"
			:open="settingVisible"
			@close="close">
			
			<a-form 
				:form="settingForm"
				layout="horizontal">
				
				<a-divider orientation="left">画布</a-divider>
				<a-form-item label="缩小的倍数" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.containerOnceNarrow"
						:min="0.05"
						:max="0.5"
						:step="0.01"
					/>
				</a-form-item>
				<a-form-item label="放大的倍数" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.containerOnceEnlarge"
						:min="0.05"
						:max="0.5"
						:step="0.01"
					/>
				</a-form-item>
				
				<a-divider orientation="left">连线</a-divider>
				<a-form-item label="连接线类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-select v-model:value="formData.linkType" @change="setFlowType">
						<a-select-option v-for="item in linkTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="连接线颜色" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-select v-model:value="formData.linkColor" @change="setLinkColor">
						<a-select-option v-for="item in linkColorOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="连接线粗细" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.linkThickness"
						:min="1"
						:max="10"
						:step="1"
					/>
				</a-form-item>
				
				<a-divider orientation="left">默认样式</a-divider>
				<a-form-item label="是否开启辅助线" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-switch
						v-model:checked="formData.isOpenAuxiliaryLine"
						checked-children="开"
						un-checked-children="关"
					/>
				</a-form-item>
				<a-form-item label="水平对齐距离" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.alignLevelDistance"
						:min="1"
						:max="50"
						:step="1"
					/>
				</a-form-item>
				<a-form-item label="垂直对齐距离" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.alignVerticalDistance"
						:min="1"
						:max="50"
						:step="1"
					/>
				</a-form-item>
				<a-form-item label="移动像素" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
					<a-slider
						v-model:value="formData.movePx"
						:min="1"
						:max="50"
						:step="1"
					/>
				</a-form-item>
			</a-form>
		</a-drawer>
	</div>
</template>

<script>
	import { flowConfig } from '../config/args-config.js'
	
	export default {
		data () {
			return {
				settingVisible: false,
				formItemLayout: {
					labelCol: { span: 6 },
					wrapperCol: { span: 15 }
				},
				initFlag: false,
				settingForm: this.$form.createForm(this),
				isOpenAuxiliaryLine: flowConfig.defaultStyle.isOpenAuxiliaryLine,
				linkColor: flowConfig.jsPlumbInsConfig.PaintStyle.stroke
			}
		},
		methods: {
			init () {
				const that = this;
				that.$nextTick(() => {
					that.settingForm.setFieldsValue({
						movePx: flowConfig.defaultStyle.movePx,
						linkType: flowConfig.jsPlumbInsConfig.Connector[0],
						linkThickness: flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth,
						alignLevelDistance: flowConfig.defaultStyle.alignSpacing.level,
						alignVerticalDistance: flowConfig.defaultStyle.alignSpacing.vertical,
						containerOnceNarrow: flowConfig.defaultStyle.containerScale.onceNarrow,
						containerOnceEnlarge: flowConfig.defaultStyle.containerScale.onceEnlarge
					});
				});
			},
			open () {
				this.settingVisible = true;
				if (!this.initFlag) {
					this.init();
					this.initFlag = true;
				}
			},
			close () {
				this.settingVisible = false;
			},
			setFlowType (v) {
				flowConfig.jsPlumbInsConfig.Connector[0] = v;
			},
			toggleOpenAuxiliaryLine (flag) {
				this.isOpenAuxiliaryLine = flag;
				flowConfig.defaultStyle.isOpenAuxiliaryLine = flag;
			},
			setMovePx (v) {
				flowConfig.defaultStyle.movePx = v;
			},
			setLinkColor (v) {
				this.linkColor = v;
				flowConfig.jsPlumbInsConfig.PaintStyle.stroke = v;
			},
			setStrokeWidth (v) {
				flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth = v;
			},
			setAlignLevelDistance (v) {
				flowConfig.defaultStyle.alignSpacing.level = v;
			},
			setAlignVerticalDistance (v) {
				flowConfig.defaultStyle.alignSpacing.vertical = v;
			},
			formatterContainerOnceNarrow (v) {
				return `${v*100}%`;
			},
			setContainerOnceNarrow (v) {
				flowConfig.defaultStyle.containerScale.onceNarrow = v;
			},
			formatterContainerOnceEnlarge (v) {
				return `${v*100}%`;
			},
			setContainerOnceEnlarge (v) {
				flowConfig.defaultStyle.containerScale.onceEnlarge = v;
			}
		}
	}
</script>

<style>
	.m-colorPicker .box {
		z-index: 9999 !important;
		width: 220px !important;
	}
	
	.ant-divider-horizontal.ant-divider-with-text, .ant-divider-horizontal.ant-divider-with-text-left, .ant-divider-horizontal.ant-divider-with-text-right {
		font-weight: 800;
		margin: 24px 0 4px;
	}
</style>
