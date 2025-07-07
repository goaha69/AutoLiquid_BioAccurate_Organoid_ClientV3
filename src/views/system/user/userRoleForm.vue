<template>
  <a-modal
    title="授权角色"
    :width="800"
    :open="visible"
    :confirm-loading="confirmLoading"
    :destroy-on-close="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-table
        size="middle"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :columns="columns"
        :data-source="roleListData"
        :pagination="false"
        :row-key="record => record.id"
      />
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { sysRoleDropDown } from '@/api/modular/system/roleManage';
import { sysUserOwnRole, sysUserGrantRole } from '@/api/modular/system/userManage';

const columns = [
  { title: '角色名称', dataIndex: 'name' },
  { title: '唯一编码', dataIndex: 'code' },
];

const visible = ref(false);
const loading = ref(true);
const confirmLoading = ref(false);
const roleListData = ref([]);
const selectedRowKeys = ref([]);
const currentUser = ref(null);

const emit = defineEmits(['ok']);

const userRole = (record) => {
  currentUser.value = record;
  visible.value = true;
  loading.value = true;

  Promise.all([
    sysRoleDropDown(),
    sysUserOwnRole({ id: record.id })
  ]).then(([roleRes, ownRoleRes]) => {
    if (roleRes.success) {
      roleListData.value = roleRes.data;
    }
    if (ownRoleRes.success) {
      selectedRowKeys.value = ownRoleRes.data;
    }
  }).finally(() => {
    loading.value = false;
  });
};

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

const handleSubmit = () => {
  confirmLoading.value = true;
  sysUserGrantRole({ id: currentUser.value.id, grantRoleIdList: selectedRowKeys.value }).then(res => {
    if (res.success) {
      message.success('授权成功');
      handleCancel();
      emit('ok');
    } else {
      message.error('授权失败：' + res.message);
    }
  }).finally(() => {
    confirmLoading.value = false;
  });
};

const handleCancel = () => {
  visible.value = false;
  currentUser.value = null;
  selectedRowKeys.value = [];
  roleListData.value = [];
};

defineExpose({ userRole });
</script>
