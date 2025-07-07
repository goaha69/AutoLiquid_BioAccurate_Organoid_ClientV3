<template>
	<div>
		<a-tabs size="small" defaultActiveKey="flow-attr" :activeKey="activeKey">
			<a-tab-pane key="flow-attr">
				<template #tab>
					<a-icon type="cluster" />
					流程属性
				</template>
				<a-form layout="horizontal">
					<a-form-item label="流程id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-input :value="flowData.attr.id" disabled />
					</a-form-item>
				</a-form>
			</a-tab-pane>
			<a-tab-pane key="node-attr">
				<template #tab>
					<a-icon type="profile" />
					节点属性
				</template>
				<template v-if="currentSelect.type == 'start round mix'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
					</a-form>
				</template>
				<template v-if="currentSelect.type == 'end round'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
					</a-form>
				</template>
				<template v-if="currentSelect.type == 'node'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
						<a-form-item label="驳回类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select v-model="setInfo.nodeRejectType"  @change="e => nodeRejectTypeChange(e)">
								<a-select-option v-for="(item,index) in nodeRejectType" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item label="会签方式" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select v-model="setInfo.nodeConfluenceType"  @change="e => nodeConfluenceTypeChange(e)">
								<a-select-option v-for="(item,index) in nodeConfluenceType" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item label="回调URL" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="setInfo.thirdPartyUrl" @change="linkThirdPartyUrlChange" />
						</a-form-item>
						<a-form-item label="执行权限" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select default-value="setInfo.nodeDesignate" v-model:value="setInfo.nodeDesignate" @change="e => nodeDesignateChange(e)">
								<a-select-option v-for="(item,index) in nodeDesignateData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item  v-show="specialShow" v-if="setInfo.nodeDesignate=='SPECIAL_USER'" label="指定用户" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-col md="18" sm="18">
								<a-input disabled="disabled" v-model="specialName" />
							</a-col>
							<a-col md="6" sm="6">
								<a-button @click="setUser()">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
						</a-form-item>
						<a-form-item  v-show="specialShow" v-else label="指定角色" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-col md="18" sm="18">
								<a-input disabled="disabled" v-model="specialName" />
							</a-col>
							<a-col md="6" sm="6">
								<a-button @click="setRole()">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
						</a-form-item>
						<a-form-item label="当前部门" v-if="setInfo.nodeDesignate=='SPECIAL_ROLE'"  :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
 							<a-switch checkedChildren="是" unCheckedChildren="否" v-model="currentDepart" @click="currentDepartChange" />
						</a-form-item>
					</a-form>
				</template>
				<template v-else-if="currentSelect.type == 'fork'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
					</a-form>
				</template>
				<template v-else-if="currentSelect.type == 'join'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
						<a-form-item label="驳回类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select v-model="setInfo.nodeRejectType"  @change="e => nodeRejectTypeChange(e)">
								<a-select-option v-for="(item,index) in nodeRejectType" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item label="会签方式" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select v-model="setInfo.nodeConfluenceType"  @change="e => nodeConfluenceTypeChange(e)">
								<a-select-option v-for="(item,index) in nodeConfluenceType" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item label="回调URL" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="setInfo.thirdPartyUrl" @change="linkThirdPartyUrlChange" />
						</a-form-item>
						<a-form-item label="执行权限" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-select default-value="setInfo.nodeDesignate" v-model:value="setInfo.nodeDesignate" @change="e => nodeDesignateChange(e)">
								<a-select-option v-for="(item,index) in nodeDesignateData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
							</a-select>
						</a-form-item>
						<a-form-item  v-show="specialShow" v-if="setInfo.nodeDesignate=='SPECIAL_USER'" label="指定用户" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-col md="18" sm="18">
								<a-input disabled="disabled" v-model="specialName" />
							</a-col>
							<a-col md="6" sm="6">
								<a-button @click="setUser()">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
						</a-form-item>
						<a-form-item  v-show="specialShow" v-else label="指定角色" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-col md="18" sm="18">
								<a-input disabled="disabled" v-model="specialName" />
							</a-col>
							<a-col md="6" sm="6">
								<a-button @click="setRole()">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
						</a-form-item>
						<a-form-item label="当前部门" v-if="setInfo.nodeDesignate=='SPECIAL_ROLE'"  :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
 							<a-switch checkedChildren="是" unCheckedChildren="否" v-model="currentDepart" @click="currentDepartChange" />
						</a-form-item>
					</a-form>
				</template>
				<template v-else-if="currentSelect.type == 'x-lane' || currentSelect.type == 'y-lane'">
					<a-form layout="horizontal">
						<a-form-item label="类型" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-tag color="purple">{{ currentSelect.type }}</a-tag>
						</a-form-item>
						<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input :value="currentSelect.id" disabled />
						</a-form-item>
						<a-form-item label="名称" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-input placeholder="请输入节点名:" :value="currentSelect.name" @change="nameChange" />
						</a-form-item>
					</a-form>
				</template>
			</a-tab-pane>
			<a-tab-pane key="link-attr">
				<template #tab>
					<a-icon type="branches" />
					连线属性
				</template>
				<a-form layout="horizontal">
					<a-form-item label="id" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-input :value="currentSelect.id" disabled />
					</a-form-item>
					<a-form-item label="源节点" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-input :value="currentSelect.sourceId" disabled />
					</a-form-item>
					<a-form-item label="目标节点" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-input :value="currentSelect.targetId" disabled />
					</a-form-item>
					<a-form-item label="文本" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-input :value="currentSelect.label" @change="linkLabelChange" />
					</a-form-item>
					<a-form-item label="添加条件" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
						<a-button @click="addList()">
							<template #icon><plus-outlined /></template>
						</a-button>
					</a-form-item>
					<div :key="i"  v-for="(item,i) in compares">
						<a-form-item :label="'条件'+i" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
							<a-col md="10" sm="10">
								<a-select placeholder="关系" v-model="compares[i].condition" @change="e => conditionChange(i,e)">
									<a-select-option v-for="(condition,index) in conditions" :key="index" :value="condition.id">{{ condition.name }}</a-select-option>
								</a-select>
							</a-col>
							<a-col md="10" sm="10">
								<a-select placeholder="属性" v-model="compares[i].fieldName" @change="e => fieldNameChange(i,e)">
									<a-select-option v-for="(fieldName,index) in fieldNames" :key="index" :value="fieldName.id">{{ fieldName.name }}</a-select-option>
								</a-select>
							</a-col>
							<a-col :md="4" :sm="4">		
								<a-button icon="minus" @click="subList(i)" v-if="compares.length>0"/>
							</a-col>
							<a-col md="10" sm="10">
							<a-select placeholder="比较" v-model="compares[i].operation" @change="e => operationChange(i,e)">
								<a-select-option v-for="(operation,index) in operations" :key="index" :value="operation.id">{{ operation.name }}</a-select-option>
								</a-select>
							</a-col>
							<a-col :md="10" :sm="10" v-if="compares[i].fieldName=='CreatedUserId'||compares[i].fieldName=='CreatedOrgId'">
								<a-tooltip placement="topLeft">
									<template #title>
										<span v-if="compares[i].valueName">{{ compares[i].valueName }}</span>
									</template>
									<div>	
										<a-input :disabled="true" v-model:value="compares[i].valueName" placeholder="请选择" />	
									</div>
								</a-tooltip>
							</a-col>
							<a-col :md="10" :sm="10" v-else>
								<a-input v-model:value="compares[i].value" placeholder="请输入值" @change="e => valueChange(i,e)" />
							</a-col>
							<a-col md="4" sm="4" v-if="compares[i].fieldName=='CreatedUserId'">		
								<a-button @click="setUser(i)" v-if="compares.length>0">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
							<a-col :md="4" :sm="4" v-if="compares[i].fieldName=='CreatedOrgId'">		
								<a-button @click="setRole(i)" v-if="compares.length>0">
									<template #icon><search-outlined /></template>
								</a-button>
							</a-col>
						</a-form-item>
					</div>
				</a-form>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { exp_flow_step_tree } from '@/api/modular/experiment/expFlowStepManage'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps({
	plumb: Object,
	flowData: Object,
	select: Object,
	fieldNames: Array
})

const emit = defineEmits(['update:select'])

const currentSelect = ref(props.select)
const activeKey = ref('flow-attr')
const formItemLayout = reactive({
	labelCol: { span: 6 },
	wrapperCol: { span: 16 }
})

const compares = ref(props.select.compares || [])
const setInfo = ref(props.select.setInfo || {})
const specialName = ref('')
const currentDepart = ref(false)
const specialShow = ref(false)
const flowStepTreeData = ref([])

const operations = ref([
	{ id: '>', name: '>' },
	{ id: '<', name: '<' },
	{ id: '>=', name: '>=' },
	{ id: '<=', name: '<=' },
	{ id: '=', name: '=' },
	{ id: '!=', name: '!=' },
	{ id: 'in', name: 'in' },
	{ id: 'not in', name: 'not in' }
])

const conditions = ref([
	{ id: 'and', name: '并且' },
	{ id: 'or', name: '或者' }
])

const nodeRejectType = ref([])
const nodeConfluenceType = ref([])
const nodeDesignateData = ref([])

const nameChange = (e) => {
	currentSelect.value.name = e.target.value
	emit('update:select', currentSelect.value)
}

const linkLabelChange = (e) => {
	currentSelect.value.label = e.target.value
	emit('update:select', currentSelect.value)
}

const linkThirdPartyUrlChange = (e) => {
	setInfo.value.thirdPartyUrl = e.target.value
}

const flowStepChange = (value, label) => {
	setInfo.value.flowStepId = value
}

const nodeRejectTypeChange = (value) => {
	setInfo.value.nodeRejectType = value
}

const nodeConfluenceTypeChange = (value) => {
	setInfo.value.nodeConfluenceType = value
}

const nodeDesignateChange = (value) => {
	setInfo.value.nodeDesignate = value
	specialShow.value = value === 'SPECIAL_USER' || value === 'SPECIAL_ROLE'
}

const currentDepartChange = () => {
	// Handle current department change
}

const setUser = (index) => {
	// Handle user selection
}

const setRole = (index) => {
	// Handle role selection
}

const addList = () => {
	compares.value.push({
		condition: '',
		fieldName: '',
		operation: '',
		value: '',
		valueName: ''
	})
}

const subList = (index) => {
	compares.value.splice(index, 1)
}

const conditionChange = (index, value) => {
	compares.value[index].condition = value
}

const fieldNameChange = (index, value) => {
	compares.value[index].fieldName = value
}

const operationChange = (index, value) => {
	compares.value[index].operation = value
}

const valueChange = (index, e) => {
	compares.value[index].value = e.target.value
}

const getFlowStepTree = async () => {
	try {
		const res = await exp_flow_step_tree()
		if (res.success) {
			flowStepTreeData.value = res.data
		}
	} catch (error) {
		console.error('获取流程步骤树失败:', error)
	}
}

watch(() => props.select, (newVal) => {
	currentSelect.value = newVal
	compares.value = newVal.compares || []
	setInfo.value = newVal.setInfo || {}
}, { deep: true })

onMounted(() => {
	getFlowStepTree()
})

defineExpose({
	currentSelect,
	compares,
	setInfo
})
</script>

<style scoped>
.ant-form-item {
	margin-bottom: 16px;
}
</style>
