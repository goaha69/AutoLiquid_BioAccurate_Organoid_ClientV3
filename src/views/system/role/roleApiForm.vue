<template>
  <a-modal
    title="授权Api"
    :width="600"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form>
        <a-form-item label="应用名称" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-select v-model:value="selectValue" @change="appChange">
            <a-select-option v-for="item in appList" :key="item.appCode" :value="item.appCode">
              {{ item.appName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="菜单权限" :label-col="labelCol" :wrapper-col="wrapperCol" class="grantMenuScrollbar">
          <a-tree
            v-model:checkedKeys="checkedKeys"
            v-model:expandedKeys="expandedKeys"
            multiple
            checkable
            auto-expand-parent
            :tree-data="menuTreeData"
            :replace-fields="replaceFields"
            @check="onCheck"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { SysMenuTreeForGrant } from '@/api/modular/system/menuManage';
import { sysRoleOwnMenu, sysRoleGrantMenu } from '@/api/modular/system/roleManage';

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

const menuTreeData = ref([]);
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const confirmLoading = ref(false);
const formLoading = ref(true);
const replaceFields = { key: 'id', title: 'name' };
const roleEntity = ref(null);
const appList = ref([]);
const menuList = ref([]);
const selectValue = ref(null);
const commitKeys = ref([]);
const leastChild = ref([]);

const roleMenu = async (record) => {
  formLoading.value = true;
  roleEntity.value = record;
  try {
    const menuRes = await SysMenuTreeForGrant({ type: 3 });
    if (menuRes.success) {
      appList.value = menuRes.data.appList;
      menuList.value = menuRes.data.menuTree;
      if (appList.value.length > 0) {
        selectValue.value = appList.value[0].appCode;
      }
    }
    const ownMenuRes = await sysRoleOwnMenu({ id: record.id, type: 3 });
    if (ownMenuRes.success) {
      commitKeys.value = ownMenuRes.data;
      if (selectValue.value) {
        appChange(selectValue.value);
      }
    }
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    formLoading.value = false;
  }
};

const appChange = (value) => {
  formLoading.value = true;
  const currentMenuList = menuList.value.filter((f) => f.appCode === value);
  menuTreeData.value = currentMenuList;

  leastChild.value = [];
  getLeastChild(currentMenuList);

  expandedKeys.value = currentMenuList.map((item) => item.id);

  let menuInfo = commitKeys.value.find((f) => f.appCode === value);
  if (!menuInfo) {
    menuInfo = { appCode: value, menuIdList: [] };
    commitKeys.value.push(menuInfo);
  }

  const currentChecked = [];
  menuInfo.menuIdList.forEach((item) => {
    if (leastChild.value.includes(item)) {
      currentChecked.push(item);
    }
  });
  checkedKeys.value = currentChecked;
  formLoading.value = false;
};

const getLeastChild = (data) => {
  data.forEach((item) => {
    pushLeastChild(item);
  });
};

const pushLeastChild = (e) => {
  if (e.children && e.children.length > 0) {
    getLeastChild(e.children);
    return;
  }
  leastChild.value.push(e.id);
};

const onCheck = (keys, event) => {
  let index = commitKeys.value.findIndex((f) => f.appCode === selectValue.value);
  if (index !== -1) {
    commitKeys.value[index].menuIdList = keys.concat(event.halfCheckedKeys);
  }
};

const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    let menuIdList = [];
    commitKeys.value.forEach((item) => {
      item.menuIdList.forEach((menuId) => {
        menuIdList.push(menuId);
      });
    });

    const res = await sysRoleGrantMenu({
      id: roleEntity.value.id,
      grantMenuIdList: menuIdList,
      type: 3,
    });

    if (res.success) {
      message.success('授权成功');
      emit('ok');
      handleCancel();
    } else {
      message.error('授权失败: ' + res.message);
    }
  } catch (error) {
    message.error('授权出错');
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  checkedKeys.value = [];
  expandedKeys.value = [];
  selectValue.value = null;
  emit('update:visible', false);
};

defineExpose({
  roleMenu,
});
</script>

<style scoped>
.grantMenuScrollbar {
  height: 60vh;
  overflow-y: auto;
}
</style>

