<template>
  <a-modal
    title="新增字典类型"
    :width="900"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="从枚举生成" name="enumType">
          <a-select style="width: 100%" placeholder="请选择枚举" v-model:value="form.enumType" @change="getEnumDataList">
            <a-select-option
              v-for="item in enumTypeList"
              :key="item.code"
              :value="item.code"
            >
              {{ item.name }}({{ item.code }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="类型名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入类型名称" />
        </a-form-item>
        <a-form-item label="唯一编码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入唯一编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="form.sort" placeholder="请输入排序" style="width: 100%" :min="1" :max="1000" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, defineExpose, defineEmits } from 'vue';
import { sysDictTypeAdd } from '@/api/modular/system/dictManage';
import { getEnumTypeList, sysEnumDataList } from '@/api/modular/system/enumManage';
import { message } from 'ant-design-vue';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const visible = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const form = reactive({
  name: '',
  code: '',
  sort: 100,
  remark: '',
  enumType: undefined,
});
const enumTypeList = ref([]);
let dictDataList = [];

const rules = {
  name: [{ required: true, message: '请输入类型名称!' }],
  code: [{ required: true, message: '请输入唯一编码' }],
};

const emit = defineEmits(['ok']);

const add = () => {
  visible.value = true;
  loadEnumTypeList();
};

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    const params = { ...form, dictDataList };
    sysDictTypeAdd(params)
      .then((res) => {
        if (res.success) {
          message.success('新增成功');
          visible.value = false;
          emit('ok');
          formRef.value.resetFields();
        } else {
          message.error('新增失败：' + res.message);
        }
      })
      .finally(() => {
        confirmLoading.value = false;
      });
  });
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const loadEnumTypeList = () => {
  getEnumTypeList().then((res) => {
    if (res.success) {
      enumTypeList.value = res.data;
    } else {
      message.error('获取系统枚举失败：' + res.message);
    }
  });
};

const getEnumDataList = (value) => {
  const selectedEnum = enumTypeList.value.find(item => item.code === value);
  if (selectedEnum) {
    form.name = selectedEnum.name;
    form.code = selectedEnum.code;
    form.remark = selectedEnum.remark;

    sysEnumDataList({ enumName: selectedEnum.code }).then((res) => {
      if (res.success) {
        dictDataList = res.data.map((item, index) => ({
          ...item,
          code: String(item.code),
          remark: item.value,
          sort: index + 1,
        }));
      } else {
        message.error('获取枚举数据失败：' + res.message);
      }
    });
  }
};

defineExpose({
  add,
});
</script>
