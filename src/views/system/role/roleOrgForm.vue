<template>
  <a-modal
    title="授权数据"
    :width="600"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form :model="form">
        <a-form-item label="授权范围" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-select
            v-model:value="form.dataScopeType"
            style="width: 100%"
            placeholder="请选择授权范围"
            @change="handleChange"
          >
            <a-select-option
              v-for="item in dataScopeTypeData"
              :key="item.code"
              :value="item.code"
            >
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <div v-show="orgTreeShow">
          <a-form-item label="选择机构" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-tree
              v-model:checkedKeys="checkedKeys"
              checkable
              check-strictly
              :auto-expand-parent="autoExpandParent"
              :expanded-keys="expandedKeys"
              :tree-data="orgTreeData"
              :replace-fields="replaceFields"
              @expand="onExpand"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { getOrgTree } from '@/api/modular/system/orgManage';
import { sysRoleOwnData, sysRoleGrantData } from '@/api/modular/system/roleManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'ok']);

const labelCol = {
  style: { 'padding-right': '20px' },
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const orgTreeData = ref([]);
const expandedKeys = ref([]);
const checkedKeys = ref({ checked: [], halfChecked: [] });
const confirmLoading = ref(false);
const formLoading = ref(false);
const autoExpandParent = ref(true);
const roleEntity = ref(null);
const dataScopeTypeData = ref([]);
const orgTreeShow = ref(false);
const replaceFields = { key: 'id', title: 'name' };
const form = reactive({
  dataScopeType: undefined,
});

const roleOrg = async (record) => {
  roleEntity.value = record;
  await loadDataScopeTypes();
  form.dataScopeType = record.dataScopeType.toString();
  handleChange(form.dataScopeType);
  emit('update:visible', true);
};

const loadDataScopeTypes = async () => {
  formLoading.value = true;
  try {
    const res = await sysDictTypeDropDown({ code: 'data_scope_type' });
    dataScopeTypeData.value = res.data;
  } finally {
    formLoading.value = false;
  }
};

const handleChange = async (value) => {
  if (value === '5') {
    orgTreeShow.value = true;
    formLoading.value = true;
    try {
      await loadOrgTree();
      await loadRoleOwnData(roleEntity.value);
    } finally {
      formLoading.value = false;
    }
  } else {
    orgTreeShow.value = false;
    checkedKeys.value = { checked: [], halfChecked: [] };
  }
};

const loadOrgTree = async () => {
  const res = await getOrgTree();
  if (res.success) {
    orgTreeData.value = res.data;
    expandedKeys.value = res.data.map((item) => item.id);
  }
};

const loadRoleOwnData = async (record) => {
  const res = await sysRoleOwnData({ id: record.id });
  if (res.success) {
    checkedKeys.value = { checked: res.data, halfChecked: [] };
  }
};

const onExpand = (keys) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    const grantOrgIdList = checkedKeys.value.checked;
    const res = await sysRoleGrantData({
      id: roleEntity.value.id,
      grantOrgIdList,
      dataScopeType: parseInt(form.dataScopeType),
    });
    if (res.success) {
      message.success('授权成功');
      emit('ok');
      handleCancel();
    } else {
      message.error(`授权失败: ${res.message}`);
    }
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  form.dataScopeType = undefined;
  checkedKeys.value = { checked: [], halfChecked: [] };
  expandedKeys.value = [];
  orgTreeShow.value = false;
  emit('update:visible', false);
};

defineExpose({
  roleOrg,
});
</script>
