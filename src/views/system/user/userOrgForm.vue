<template>
  <a-modal
    title="授权数据范围"
    :width="600"
    :open="visible"
    :confirm-loading="confirmLoading"
    :destroy-on-close="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <div class="grant-org-scrollbar">
          <a-tree
            v-if="orgTreeData.length > 0"
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="orgTreeData"
            :field-names="replaceFields"
            default-expand-all
          />
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getOrgTree } from '@/api/modular/system/orgManage';
import { sysUserOwnData, sysUserGrantData } from '@/api/modular/system/userManage';

const visible = ref(false);
const confirmLoading = ref(false);
const formLoading = ref(true);
const orgTreeData = ref([]);
const checkedKeys = ref([]);
const currentUser = ref(null);
const replaceFields = { key: 'id', title: 'name' };

const emit = defineEmits(['ok']);

const userOrg = (record) => {
  currentUser.value = record;
  visible.value = true;
  formLoading.value = true;

  Promise.all([
    getOrgTree(),
    sysUserOwnData({ id: record.id })
  ]).then(([orgRes, ownDataRes]) => {
    if (orgRes.success) {
      orgTreeData.value = orgRes.data;
    }
    if (ownDataRes.success) {
      checkedKeys.value = ownDataRes.data;
    }
  }).finally(() => {
    formLoading.value = false;
  });
};

const handleSubmit = () => {
  confirmLoading.value = true;
  
  sysUserGrantData({ id: currentUser.value.id, grantOrgIdList: checkedKeys.value }).then(res => {
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
  orgTreeData.value = [];
  checkedKeys.value = [];
  currentUser.value = null;
};

defineExpose({ userOrg });
</script>

<style scoped>
.grant-org-scrollbar {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
