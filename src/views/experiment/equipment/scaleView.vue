<template>
  <a-modal :title="'Scale值配置--' + equipmentName" :width="1000" :open="visible" :maskClosable="false" :confirmLoading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-table size="middle" :columns="columns" :dataSource="scales" :pagination="false" :loading="scaleLoading" rowKey="key">                
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'serial'">
                    {{ index + 1 }}
                  </template>
                  <template v-else-if="column.key === 'name'">
                    <a-input v-model:value="record.name" style="width:150px;" placeholder="请输入轴名称" allow-clear/>
                  </template>
                  <template v-else-if="column.key === 'realName'">
                    <a-input v-model:value="record.realName" style="width:150px;" placeholder="请输入真正轴名称" allow-clear/>
                  </template>
                  <template v-else-if="column.key === 'value'">
                    <a-input-number :step="myInputNumberStep" v-model:value="record.value" style="width:150px;" placeholder="请输入Scale值" />
                  </template>
                  <template v-else-if="column.key === 'operation'">
                    <a @click="removeScale(record.key)">删除</a>
                  </template>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom: 8px" type="dashed" @click="newScale">
                <template #icon><PlusOutlined /></template>
                增行
              </a-button>
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

// 定义emits
const emit = defineEmits(['ok'])

// 响应式数据
const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const scaleLoading = ref(false)
const equipmentName = ref('')
const myInputNumberStep = 0.05
const scales = ref([])

const form = reactive({
  id: '',
  code: '',
  name: ''
})

const columns = [
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: 50
  },
  {
    title: '轴名称',
    align: 'center',
    key: 'name',
    dataIndex: 'name',
    editable: true
  },
  {
    title: '真正轴名称',
    align: 'center',
    key: 'realName',
    dataIndex: 'realName',
    editable: true
  },
  {
    title: 'Scale值',
    align: 'center',
    key: 'value',
    dataIndex: 'value',
    editable: true
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center'
  }
]

// 方法
function removeScale(key) {
  const newData = scales.value.filter(item => item.key !== key)
  scales.value = newData
}

function newScale() {
  const length = scales.value.length
  scales.value.push({
    key: length === 0 ? '1' : (parseInt(scales.value[length - 1].key) + 1).toString(),
    name: '',
    realName: '',
    value: 0.00,
  })
}

function setScale(record) {
  visible.value = true
  equipmentName.value = record.name

  // 设置表单值
  Object.assign(form, {
    id: record.id,
    code: record.code,
    name: record.name
  })

  const dd = { id: record.id }
  exp_equipment_getScales(dd).then((res) => {
    if (res.success) {
      scales.value = res.data.map((item, index) => ({
        ...item,
        key: (index + 1).toString()
      }))
      console.log('==============exp_equipmentGetScales===============')
      console.log(res.data)
    }
  })
}

function handleSubmit() {
  const tt = scales.value.filter(item => item.name === '' || (item.name != null && (item.value === 0 || item.value === null || item.value === '')))
  if (tt.length > 0) {
    message.error('请检查轴名称不能为空，并且Scale值不能为空或为0')
    return
  }

  const data = {
    id: form.id,
    code: form.code,
    name: form.name,
    scales: scales.value
  }

  confirmLoading.value = true
  exp_equipment_editScales(data).then((res) => {
    if (res.success) {
      message.success('Scale值保存成功')
      visible.value = false
      confirmLoading.value = false
      emit('ok', data)
      resetForm()
    } else {
      message.error('Scale值保存失败：' + res.message)
    }
  }).finally(() => {
    confirmLoading.value = false
  })
}

function handleCancel() {
  visible.value = false
}

function resetForm() {
  Object.assign(form, {
    id: '',
    code: '',
    name: ''
  })
  scales.value = []
}

// 暴露方法给父组件
defineExpose({
  setScale
})
</script>

<style scoped>
.form-footer {
  text-align: right; /* 使按钮居右 */
}
</style>
