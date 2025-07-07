<template>
	<div>
		<a-drawer
			title="JSON"
			placement="right"
			:width="600"
			:open="testVisible"
			@close="onClose">
			
			<div>当前的flowData:</div>
			<vue-json-pretty
				:data="flowData"
				:deep="2"
				:show-double-quotes="true"
				:highlight-mouseover-node="true"
				:highlight-selected-node="true"
				:expand-depth="3"
				boxed
				copyable />
			
			<div style="margin-top: 12px;">暂存数据:</div>
			<a-textarea :autosize="{ minRows: 10, maxRows: 100 }" :value="flowDataJson" @change="editFlowDataJson" />
			
			<a-divider />
			<a-button @click="onLoad">加载</a-button>
			<a-button @click="tempSave" :style="{ marginRight: '8px' }" type="primary"> 暂存</a-button>
		</a-drawer>
	</div>
</template>

<script>
	import JsonView from 'vue-json-viewer-next'
	import { flowConfig } from '../config/args-config.js'
	
	export default {
		components: {
			JsonView
		},
		data () {
			return {
				testVisible: false,
				flowData: null,
				flowDataJson: ''
			}
		},
		methods: {
			onClose () {
				this.testVisible = false;
			},
			editFlowDataJson (e) {
				this.flowDataJson = e.target.value;
			},
			tempSave () {
				let tempObj = Object.assign({}, this.flowData);
				tempObj.status = flowConfig.flowStatus.SAVE;
				this.flowDataJson = JSON.stringify(tempObj);
			},		
			clearData () {
				this.$emit('clear123',this.flowDataJson);
			},
			onLoad () {
				this.clearData();
				setTimeout(() => {
					this.$emit('loadFlow', this.flowDataJson);
					this.onClose();
				}, 100)
			}
		}
	}
</script>

<style>
</style>
