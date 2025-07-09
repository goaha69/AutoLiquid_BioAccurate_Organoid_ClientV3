<template>
  <a-modal 
    title="编辑布局" 
    :width="1300" 
    v-model:open="visible" 
    :maskClosable="false" 
    @ok="handleSubmit" 
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-row :gutter="8">
        <div>            
          <sp-input 
            label="布局编号" 
            :labelWidth="120" 
            :isError="errors.code" 
            :inputWidth="300" 
            :required="true" 
            v-model="attributeData.code" 
          />
          <sp-input 
            label="布局名称" 
            :labelWidth="120" 
            :isError="errors.name" 
            :inputWidth="300" 
            :required="true" 
            v-model="attributeData.name" 
          />
        </div>
        <div style="margin-top:10px;">
          <sp-input-number 
            label="X尺寸" 
            :labelWidth="120" 
            unit="mm" 
            :required="true" 
            v-model="attributeData.xSize" 
          />
          <sp-input-number 
            label="Y尺寸" 
            :labelWidth="120" 
            unit="mm" 
            :required="true" 
            v-model="attributeData.ySize" 
          />
          <sp-input-number 
            label="X偏移" 
            :labelWidth="120" 
            unit="mm" 
            :required="true" 
            v-model="attributeData.xOffset" 
          />
          <sp-input-number 
            label="Y偏移" 
            :labelWidth="120" 
            unit="mm" 
            :required="true" 
            v-model="attributeData.yOffset" 
          />
        </div>
      </a-row>

      <a-divider orientation="left">舱位信息</a-divider>
      <a-row :gutter="8">
        <a-col :span="24">
          <a-table 
            size="middle" 
            :columns="columns" 
            :dataSource="shippingSpaces" 
            :pagination="false" 
            :loading="shippingSpaceLoading" 
            rowKey="key" 
            :scroll="{ y: 320 }"
          >   
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'serial'">
                {{ index + 1 }}
              </template>
              <template v-else-if="column.key === 'name'">
                <a-input v-model:value="record.name" placeholder="请输入名称"/>
              </template>
              <template v-else-if="column.key === 'isStorage'">
                <a-checkbox v-model:checked="record.isStorage" />
              </template>
              <template v-else-if="column.key === 'xSize'">
                <sp-input-number v-model="record.xSize" placeholder="请输入X尺寸"/>
              </template>
              <template v-else-if="column.key === 'ySize'">
                <sp-input-number v-model="record.ySize" placeholder="请输入Y尺寸"/>
              </template>
              <template v-else-if="column.key === 'xOffset'">
                <sp-input-number v-model="record.xOffset" placeholder="请输入X偏移"/>
              </template>
              <template v-else-if="column.key === 'yOffset'">
                <sp-input-number v-model="record.yOffset" placeholder="请输入Y偏移"/>
              </template>
              <template v-else-if="column.key === 'zOffset'">
                <sp-input-number v-model="record.zOffset" placeholder="请输入舱位高度"/>
              </template>
              <template v-else-if="column.key === 'operation'">
                <a @click="removeShippingSpace(record.key)">删除</a>
              </template>
            </template>
          </a-table>
          <a-button 
            style="width: 100%; margin-top: 16px; margin-bottom: 8px" 
            type="dashed" 
            @click="newShippingSpace"
          >
            <PlusOutlined />
            添加舱位
          </a-button>
        </a-col>
      </a-row>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { exp_layout_edit, exp_layout_getShippingSpaces } from '@/api/modular/experiment/layoutManage'
import SpInputNumber from '@/components/spInputNumber.vue'
import SpInput from '@/components/spInput.vue'

const emit = defineEmits(['ok'])

const visible = ref(false)
const confirmLoading = ref(false)
const formLoading = ref(false)
const shippingSpaceLoading = ref(false)

const attributeData = reactive({})

const errors = reactive({
  code: false,
  name: false
})

const shippingSpaces = ref([])

const columns = [
  {
    title: '序号',
    key: 'serial',
    align: 'center',
    width: '50',
  },
  {
    title: '名称',
    align: 'center',
    key: 'name',
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: '存储位置',
    align: 'center',
    key: 'isStorage',
    width: '100',
    dataIndex: 'isStorage',
  },
  {
    title: 'X尺寸(mm)',
    align: 'center',
    key: 'xSize',
    dataIndex: 'xSize',
  },
  {
    title: 'Y尺寸(mm)',
    align: 'center',
    key: 'ySize',
    dataIndex: 'ySize',
  },
  {
    title: 'X偏移(mm)',
    align: 'center',
    key: 'xOffset',
    dataIndex: 'xOffset',
  },
  {
    title: 'Y偏移(mm)',
    align: 'center',
    key: 'yOffset',
    dataIndex: 'yOffset',
  },
  {
    title: '舱位高度(mm)',
    align: 'center',
    key: 'zOffset',
    dataIndex: 'zOffset',
  },
  {
    title: '操作',
    key: 'operation',
    width: 100,
  }
]

const removeShippingSpace = (key) => {
  const newData = shippingSpaces.value.filter(item => item.key !== key)
  shippingSpaces.value = newData
}

const newShippingSpace = () => {
  const length = shippingSpaces.value.length
  shippingSpaces.value.push({
    key: length === 0 ? '1' : (parseInt(shippingSpaces.value[length - 1].key) + 1).toString(),
    xSize: 0.00,
    ySize: 0.00,
    xOffset: 0.00,
    yOffset: 0.00,
    zOffset: 0.00,
    name: '',
    consumableIds: '',
    consumableTags: '',
    isStorage: false,
  })
}

const edit = (record) => {
  visible.value = true
  formLoading.value = true
  Object.assign(attributeData, { ...record })

  const dd = { id: record.id }
  exp_layout_getShippingSpaces(dd).then((res) => {
    formLoading.value = false
    if (res.success) {
      shippingSpaces.value = res.data
    } else {
      message.error('获取舱位信息失败：' + res.message)
    }
  }).catch(err => {
    formLoading.value = false
    message.error('获取舱位信息失败：' + err.message)
  })
}

const validateFields = () => {
  let result = true
  errors.code = !attributeData.code
  errors.name = !attributeData.name
  
  for (const key in errors) {
    if (errors[key]) {
      result = false
      break
    }
  }
  return result
}

const handleSubmit = () => {
  if (!validateFields()) {
    message.error('请填写必填字段')
    return
  }
  
  formLoading.value = true
  const formData = {
    ...attributeData,
    shippingSpaces: shippingSpaces.value
  }
  
  exp_layout_edit(formData).then((res) => {
    formLoading.value = false
    if (res.success) {
      message.success('编辑成功')
      visible.value = false
      emit('ok')
    } else {
      message.error('编辑失败：' + res.message)
    }
  }).catch(err => {
    formLoading.value = false
    message.error('编辑失败：' + err.message)
  })
}

const handleCancel = () => {
  visible.value = false
  Object.assign(attributeData, {})
  shippingSpaces.value = []
  Object.assign(errors, {
    code: false,
    name: false,
  })
}

defineExpose({
  edit
})
</script>
<style scoped>
.ant-form-item-label {
  width: 120px; /* Set your desired width */
  text-align: right; /* Align text to the right for better appearance */
}

/* Optional: Adjust the wrapper column to align with the label width */
.ant-form-item-control {
  margin-left: 10px; /* Adjust margin as needed */
}

.my-input-number1{
  width: 120px;
}

.my-input-number{
  width: 120px;
}
</style>
