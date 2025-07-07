<template>
  <a-modal :title="'Scale值配置-' + equipmentName" :width="1000" :open="visible" :maskClosable="false" :confirmLoading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item v-show="false"><a-input v-model:value="form.id" /></a-form-item>
        <a-form-item v-show="false"><a-input v-model:value="form.code" /></a-form-item>
        <a-form-item v-show="false"><a-input v-model:value="form.name" /></a-form-item>

        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-table size="middle" :columns="columns" :dataSource="scales" :pagination="false" :loading="scaleLoading" rowKey="key">                
                <!-- 自定义序号列 -->
                <template #serial="{ text, record, index }"><span>
                  {{ index + 1 }}
                </span></template>
                <template #name="{ text, record }"><span>
                   <a-input v-model:value="record.name" style="width : 150px;" placeholder="请输入轴名称"  allow-clear />
                </span></template>
                <template #realName="{ text, record }"><span>
                   <a-input v-model:value="record.realName" style="width : 150px;" placeholder="请输入真正轴名称"  allow-clear />
                </span></template>
                <template #value="{ text, record }"><span>
                   <a-input-number :step="myInputNumberStep" v-model:value="record.value" style="width : 150px;" placeholder="请输入Scale值" />
                </span></template>                
                <template #operation="{ text, record }">
                  <a @click="removeScale(record.key)">删除</a>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" @click="newScale"><template #icon><plus-outlined /></template>增行</a-button>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { exp_equipment_editScales, exp_equipment_getScales } from '@/api/modular/experiment/equipmentManage'

defineOptions({
  name: 'ScaleView'
})

const emit = defineEmits(['ok'])

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const scaleLoading = ref(false)

const form = reactive({
  id: '',
  code: '',
  name: ''
})

const equipmentName = ref('')
const myInputNumberStep = ref(0.05)
const scales = ref([])

const columns = [
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: '50',
    slots: { customRender: 'serial' }
  },
  {
    title: '轴名',
    align: 'center',
    key: 'name',
    dataIndex: 'name',
    editable: true,
    slots: { customRender: 'name' }
  },
  {
    title: '真正轴名',
    align: 'center',
    key: 'realName',
    dataIndex: 'realName',
    editable: true,
    slots: { customRender: 'realName' }
  },
  {
    title: 'Scale',
    align: 'center',
    key: 'value',
    dataIndex: 'value',
    editable: true,
    slots: { customRender: 'value' }
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'operation' }
  }
]

const removeScale = (key) => {
  const newData = scales.value.filter(item => item.key !== key)
  scales.value = newData
}

const newScale = () => {
  const length = scales.value.length
  scales.value.push({
    key: length === 0 ? '1' : (parseInt(scales.value[length - 1].key) + 1).toString(),
    name: '',
    value: 0.00,
  })
}

/**
 * 初始化方法
 */
const setScale = (record) => {
  visible.value = true
  equipmentName.value = record.name

  setTimeout(() => {
    form.id = record.id
    form.code = record.code
    form.name = record.name
  }, 100)

  const dd = { id: record.id }
  exp_equipment_getScales(dd).then((res) => {
    if (res.success) {
      scales.value = res.data
      for (let i = 0; i < res.data.length; i++) {
        scales.value[i].key = i + 1
      }
      console.log('==============exp_equipmentGetScales===============')
      console.log(res.data)
    }
  })
}

const handleSubmit = () => {
  const tt = scales.value.filter(item => item.name === '' || (item.name != null && (item.value === 0 || item.value === null || item.value === '')))
  if (tt.length > 0) {
    message.error('请检查轴名称不能为空,并且Scale值不能为空或0')
    return
  }

  const data = {
    id: form.id,
    code: form.code,
    name: form.name,
    scales: scales.value
  }

  exp_equipment_editScales(data).then((res) => {
    if (res.success) {
      message.success('Scale值保存成功')
      visible.value = false
      confirmLoading.value = false
      emit('ok', data)
      form.id = ''
      form.code = ''
      form.name = ''
    } else {
      message.error('Scale值保存失败::' + res.message)
    }
  }).finally((res) => {
    confirmLoading.value = false
  })
}

const handleCancel = () => {
  visible.value = false
}

defineExpose({
  setScale
})
</script>

<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
}
</style>
