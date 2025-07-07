<template>
  <a-modal
    title="新增通知公告"
    :width="1000"
    :footer="null"
    :open="visible"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="标题" name="title">
          <a-input v-model:value="form.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="类型" name="type">
          <a-radio-group v-model:value="form.type">
            <a-radio-button v-for="item in typeDictTypeDropDown" :key="item.code" :value="parseInt(item.code)">
              {{ item.value }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="内容" name="content">
          <antd-editor v-model:value="form.content" :upload-config="editorUploadConfig" @onchange="changeEditor" />
        </a-form-item>
        <a-form-item label="通知对象" name="noticeUserIdList">
          <a-transfer
            :data-source="mockData"
            show-search
            :list-style="{ width: '40%', height: '300px' }"
            :filter-option="filterOption"
            :target-keys="targetKeys"
            :render="(item) => item.title"
            @change="handleChange"
          />
        </a-form-item>
        <a-divider />
        <a-form-item class="subForm-item">
          <a-button type="primary" class="subButton" @click="handleSubmit(1)" :loading="confirmLoading">发布</a-button>
          <a-button type="danger" class="subButton" @click="handleSubmit(0)" :loading="confirmLoading">存为草稿</a-button>
          <a-button class="subButton" @click="handleCancel">取消</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { sysNoticeAdd } from '@/api/modular/system/noticeManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { sysFileInfoUploadEditor } from '@/api/modular/system/fileManage';
import { AntdEditor } from '@/components';
import { sysUserSelector } from '@/api/modular/system/userManage';

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(['update:visible', 'ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 3 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 18 } };

const formRef = ref();
const formLoading = ref(true);
const confirmLoading = ref(false);
const typeDictTypeDropDown = ref([]);
const mockData = ref([]);
const targetKeys = ref([]);

const form = reactive({
  title: '',
  type: undefined,
  content: '',
  noticeUserIdList: [],
});

const rules = {
  title: [{ required: true, message: '请输入标题!' }],
  type: [{ required: true, message: '请选择类型' }],
  content: [{ required: true, message: '请填写内容' }],
  noticeUserIdList: [{ required: true, message: '请选择通知对象' }],
};

const editorUploadConfig = {
  method: 'http',
  callback: async (files, insert) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    try {
      const res = await sysFileInfoUploadEditor(formData);
      if (res.success) {
        insert(`${process.env.VUE_APP_API_BASE_URL}/${res.data}`);
      } else {
        message.error(`编辑器上传图片失败：${res.message}`);
      }
    } catch (err) {
      message.error(`预览错误：${err.message}`);
    }
  },
};

const changeEditor = (html) => {
  form.content = html;
};

const loadDictData = async () => {
  const res = await sysDictTypeDropDown({ code: 'notice_type' });
  typeDictTypeDropDown.value = res.data;
};

const loadUserSelector = async () => {
  const res = await sysUserSelector();
  mockData.value = res.data.map((user) => ({
    key: user.id.toString(),
    title: user.name,
    description: `description of ${user.name}`,
  }));
};

onMounted(async () => {
  await loadDictData();
  await loadUserSelector();
  formLoading.value = false;
});

const add = () => {
  emit('update:visible', true);
};

const filterOption = (inputValue, option) => {
  return option.description.indexOf(inputValue) > -1;
};

const handleChange = (keys) => {
  targetKeys.value = keys;
  form.noticeUserIdList = keys;
};

const handleSubmit = async (status) => {
  try {
    const values = await formRef.value.validate();
    confirmLoading.value = true;
    const params = { ...values, status, noticeUserIdList: targetKeys.value };
    const res = await sysNoticeAdd(params);
    if (res.success) {
      message.success('新增成功');
      emit('ok');
      handleCancel();
    } else {
      message.error(`新增失败：${res.message}`);
    }
  } catch (error) {
    console.error(error)
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  targetKeys.value = [];
  form.content = '';
  emit('update:visible', false);
};

defineExpose({ add });
</script>

<style>
.subButton {
  float: right;
  margin-left: 8px;
}
.subForm-item {
  margin-bottom: 0px;
}
</style>
