<template>
  <a-modal title="新增用户" :width="900" :open="visible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="formState" :rules="rules" ref="formRef">
        <a-divider orientation="left">基本信息</a-divider>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="账号" name="account" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.account" placeholder="请输入账号" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="姓名" name="name" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="密码" name="password" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="重复密码" name="confirm" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input-password v-model:value="formState.confirm" placeholder="请再次输入密码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="昵称" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.nickName" placeholder="请输入昵称" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="生日" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-date-picker v-model:value="formState.birthday" value-format="YYYY-MM-DD" style="width: 100%" placeholder="请选择生日" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="性别" name="sex" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-radio-group v-model:value="formState.sex">
                <a-radio value="M">男</a-radio>
                <a-radio value="F">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="邮箱" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="手机" name="phone" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="电话" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.tel" placeholder="请输入电话" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">员工信息</a-divider>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="机构" name="orgId" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-tree-select
                v-model:value="formState.sysEmpParam.orgId"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                :tree-data="orgTree"
                placeholder="请选择机构"
                tree-default-expand-all
                :field-names="{ children: 'children', title: 'name', key: 'id', value: 'id' }"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="工号" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model:value="formState.sysEmpParam.jobNum" placeholder="请输入工号" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item label="职位" name="posIdList" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG">
              <a-select mode="multiple" v-model:value="formState.sysEmpParam.posIdList" placeholder="请选择职位">
                <a-select-option v-for="pos in posList" :key="pos.id" :value="pos.id">{{ pos.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item label="附属信息" :label-col="labelCol_JG" :wrapper-col="wrapperCol_JG">
              <a-table size="middle" :columns="extColumns" :data-source="formState.sysEmpParam.extIds" :pagination="false" row-key="key">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'extOrgId'">
                    <a-tree-select
                      v-model:value="record.extOrgId"
                      style="width: 100%"
                      :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                      :tree-data="orgTree"
                      placeholder="请选择附属机构"
                      tree-default-expand-all
                      :field-names="{ children: 'children', title: 'name', key: 'id', value: 'id' }"
                    />
                  </template>
                  <template v-if="column.dataIndex === 'extPosId'">
                    <a-select v-model:value="record.extPosId" placeholder="请选择附属职位" style="width: 100%">
                      <a-select-option v-for="pos in posList" :key="pos.id" :value="pos.id">{{ pos.name }}</a-select-option>
                    </a-select>
                  </template>
                  <template v-if="column.dataIndex === 'operation'">
                    <a-popconfirm title="确认删除？" @confirm="removeExt(record.key)">
                      <a>删除</a>
                    </a-popconfirm>
                  </template>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom: 8px" type="dashed" @click="addExt">
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
import { ref, reactive, defineEmits, defineExpose } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { sysUserAdd } from '@/api/modular/system/userManage';
import { getOrgTree } from '@/api/modular/system/orgManage';
import { sysPosList } from '@/api/modular/system/posManage';

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 6 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 16 } };
const labelCol_JG = { xs: { span: 24 }, sm: { span: 3 } };
const wrapperCol_JG = { xs: { span: 24 }, sm: { span: 20 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formLoading = ref(false);
const formRef = ref();
const orgTree = ref([]);
const posList = ref([]);

const defaultFormState = () => ({
  account: '',
  name: '',
  password: '',
  confirm: '',
  nickName: '',
  birthday: null,
  sex: 'M',
  email: '',
  phone: '',
  tel: '',
  sysEmpParam: {
    orgId: undefined,
    jobNum: '',
    posIdList: [],
    extIds: [],
  },
});

const formState = reactive(defaultFormState());

const validatePass = async (_rule, value) => {
  if (value === '') {
    return Promise.reject('请输入密码');
  }
  if (formState.confirm) {
    formRef.value.validateFields('confirm');
  }
  return Promise.resolve();
};

const validatePassCheck = async (_rule, value) => {
  if (value === '') {
    return Promise.reject('请再次输入密码');
  }
  if (value !== formState.password) {
    return Promise.reject('两次密码输入不一致!');
  }
  return Promise.resolve();
};

const rules = {
  account: [{ required: true, min: 5, message: '请输入至少五个字符的账号' }],
  name: [{ required: true, message: '请输入姓名!' }],
  password: [{ required: true, validator: validatePass, trigger: 'change' }],
  confirm: [{ required: true, validator: validatePassCheck, trigger: 'change' }],
  sex: [{ required: true, message: '请选择性别' }],
  phone: [{ required: true, message: '请输入手机号' }],
  'sysEmpParam.orgId': [{ required: true, message: '请选择机构' }],
  'sysEmpParam.posIdList': [{ required: true, message: '请选择职位信息' }],
};

const extColumns = [
  { title: '附属机构', dataIndex: 'extOrgId', width: '45%' },
  { title: '附属岗位', dataIndex: 'extPosId', width: '45%' },
  { title: '操作', dataIndex: 'operation' },
];

const add = () => {
  Object.assign(formState, defaultFormState());
  formState.sysEmpParam.extIds = [];
  visible.value = true;
  loadOrgAndPosData();
};

const loadOrgAndPosData = () => {
  formLoading.value = true;
  Promise.all([getOrgTree(), sysPosList()]).then(([orgRes, posRes]) => {
    orgTree.value = orgRes.data;
    posList.value = posRes.data;
  }).finally(() => {
    formLoading.value = false;
  });
};

const addExt = () => {
  formState.sysEmpParam.extIds.push({
    key: Date.now(),
    extOrgId: undefined,
    extPosId: undefined,
  });
};

const removeExt = (key) => {
  formState.sysEmpParam.extIds = formState.sysEmpParam.extIds.filter(item => item.key !== key);
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const res = await sysUserAdd(formState);
    if (res.success) {
      message.success('新增成功');
      visible.value = false;
      emit('ok');
    } else {
      message.error(`新增失败：${res.message}`);
    }
  } catch(error) {
    // validate failed
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  add,
});
</script>
