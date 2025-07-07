<template>
  <a-modal
    title="新增定时任务"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item :label="jobNameLabel" name="jobName">
              <a-select
                v-model:value="formState.jobName"
                :placeholder="jobNamePlaceholder"
                show-arrow
                :mode="jobNameMode"
                @change="onChangeJobName"
              >
                <a-select-option v-for="item in jobNameData" :key="item.jobName" :value="item.jobName">
                  {{ item.jobName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="请求地址" name="requestUrl">
              <template #label>
                <a-tooltip title="Run类型:类型方法名,http类型:URL地址">
                  <question-circle-outlined />
                </a-tooltip>
                &nbsp;请求地址
              </template>
              <a-input v-model:value="formState.requestUrl" placeholder="请输入请求地址" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item label="请求类型" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG" name="requestType">
              <a-radio-group v-model:value="formState.requestType" @change="onChangeRequestType">
                <a-radio v-for="item in requestTypeEnumDataDropDown" :key="item.code" :value="item.code">
                  {{ item.value }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24" v-show="showHeaders">
          <a-col :md="24" :sm="24">
            <a-form-item label="请求头" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG" name="headers">
              <a-input v-model:value="formState.headers" placeholder="请输入请求头" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item :label="requestParametersLabel" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG" name="requestParameters">
              <a-textarea v-model:value="formState.requestParameters" :rows="1" :placeholder="requestParametersPlaceholder" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="定时器类型" name="timerType">
              <a-select v-model:value="formState.timerType" placeholder="请选择定时器类型" @change="onChangeTimerType">
                <a-select-option v-for="item in spareTimeTypeDropDown" :key="item.code" :value="item.code">
                  {{ item.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item v-if="visibleTimerType" label="执行间隔(秒)" name="interval">
              <a-input-number v-model:value="formState.interval" placeholder="请输入执行间隔" style="width: 100%" :min="1" />
            </a-form-item>
            <a-form-item v-else label="任务表达式" name="cron">
              <a-input v-model:value="formState.cron" placeholder="请输入任务表达式" />
              <a href="https://www.bejson.com/othertools/cron/" target="_blank">参考</a>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item>
              <template #label>
                <a-tooltip title="新增任务后立即执行,项目启动后立即执行">
                  <question-circle-outlined />
                </a-tooltip>
                &nbsp;立即执行
              </template>
              <a-switch v-model:checked="formState.startNow" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="只执行一次">
              <a-switch v-model:checked="formState.doOnce" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item name="executeType">
               <template #label>
                <a-tooltip title="并行执行不会等待当前任务完成,发起执行后立即开始下次任务的倒计时.串行执行会等待当前任务完成才开始下次任务的倒计时">
                  <question-circle-outlined />
                </a-tooltip>
                &nbsp;执行类型
              </template>
              <a-select v-model:value="formState.executeType" placeholder="请选择执行类型">
                <a-select-option v-for="item in executeTypeDropDown" :key="item.code" :value="item.code">
                  {{ item.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
           <a-col :md="12" :sm="24">
            <a-form-item label="备注" name="remark">
              <a-input v-model:value="formState.remark" placeholder="请输入备注" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { sysTimersAdd, sysTimersLocalJobList } from '@/api/modular/system/timersManage'
import { sysEnumDataList, sysEnumDataListByField } from '@/api/modular/system/enumManage'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['ok'])

const labelCol = { xs: { span: 24 }, sm: { span: 6 } }
const wrapperCol = { xs: { span: 24 }, sm: { span: 16 } }
const labelCol_JG = { xs: { span: 24 }, sm: { span: 3 } }
const wrapperCol_JG = { xs: { span: 24 }, sm: { span: 20 } }

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const visibleTimerType = ref(true)
const showHeaders = ref(true)

const jobNameLabel = ref('任务名称')
const jobNameMode = ref('combobox')
const jobNamePlaceholder = ref('请输入任务名')
const requestParametersLabel = ref('请求参数')
const requestParametersPlaceholder = ref('请输入请求参数')

const requestTypeEnumDataDropDown = ref([])
const spareTimeTypeDropDown = ref([])
const executeTypeDropDown = ref([])
const localJobsDropDown = ref([])
const jobNameData = ref([])

const formRef = ref()
const formState = reactive({
  jobName: '',
  requestUrl: '',
  requestType: 2,
  headers: '',
  requestParameters: '',
  timerType: 0,
  interval: null,
  cron: '',
  startNow: false,
  doOnce: false,
  executeType: 0,
  remark: ''
})

const rules = {
  jobName: [{ required: true, message: '请输入任务名称!' }],
  requestUrl: [{ required: true, message: '请输入请求地址' }],
  requestType: [{ required: true, message: '请选择请求类别' }],
  timerType: [{ required: true, message: '请选择定时器类型!' }],
  executeType: [{ required: true, message: '请选择执行类型' }],
  interval: [{ required: true, message: '请输入执行间隔!' }],
  cron: [{ required: true, message: '请输入任务表达式' }]
}

const add = () => {
  visible.value = true
  formLoading.value = false
  fetchEnumData()
  resetForm()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formState, {
    jobName: '',
    requestUrl: '',
    requestType: 2,
    headers: '',
    requestParameters: '',
    timerType: 0,
    interval: null,
    cron: '',
    startNow: false,
    doOnce: false,
    executeType: 0,
    remark: ''
  })
}

const fetchEnumData = async () => {
  try {
    formLoading.value = true
    const [requestTypeRes, spareTimeTypeRes, executeTypeRes] = await Promise.all([
      sysEnumDataList({ enumName: 'RequestTypeEnum' }),
      sysEnumDataListByField({ EntityName: 'SuperH2.Entity.System.SysTimer', FieldName: 'TimerType' }),
      sysEnumDataListByField({ EntityName: 'SuperH2.Entity.System.SysTimer', FieldName: 'ExecuteType' })
    ])
    requestTypeEnumDataDropDown.value = requestTypeRes.data
    spareTimeTypeDropDown.value = spareTimeTypeRes.data
    executeTypeDropDown.value = executeTypeRes.data
  } finally {
    formLoading.value = false
  }
}

watch(() => formState.timerType, (newVal) => {
  visibleTimerType.value = newVal === 0
  if(formRef.value){
    formRef.value.clearValidate(visibleTimerType.value ? 'cron' : 'interval')
  }
})

watch(() => formState.requestType, async (newVal) => {
  showHeaders.value = newVal !== 0
  if (!showHeaders.value) { // 选择了Run类型
    jobNameLabel.value = '任务方法'
    jobNameMode.value = 'default'
    jobNamePlaceholder.value = '请选择任务方法'
    requestParametersLabel.value = '程序集'
    requestParametersPlaceholder.value = '请输入任务所在程序集'

    if (localJobsDropDown.value.length === 0) {
      const res = await sysTimersLocalJobList()
      localJobsDropDown.value = res.data
    }
    jobNameData.value = localJobsDropDown.value
  } else { // 选择了Http/https类型
    jobNameLabel.value = '任务名称'
    jobNameMode.value = 'combobox'
    jobNamePlaceholder.value = '请输入任务名'
    requestParametersLabel.value = '请求参数'
    requestParametersPlaceholder.value = '请输入请求参数'
    jobNameData.value = []
  }
   if (formRef.value) {
    formRef.value.clearValidate(['jobName', 'requestUrl', 'requestParameters']);
  }
  formState.jobName = ''
  formState.requestUrl = ''
  formState.requestParameters = ''
})


const onChangeJobName = (value, option) => {
  const selectedJob = jobNameData.value.find(item => item.jobName === value)
  if(selectedJob){
      formState.requestUrl = selectedJob.requestUrl
      formState.requestParameters = selectedJob.requestParameters
  }
}

const onChangeRequestType = (e) => {
    // handled by watch
}

const onChangeTimerType = (e) => {
    // handled by watch
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    await sysTimersAdd(formState)
    message.success('新增成功')
    visible.value = false
    emit('ok')
  } catch (error) {
    // console.error('validate error:', error)
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

defineExpose({
  add
})
</script>
