<template>
  <a-modal
    title="租户授权菜单"
    :width="600"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form>
        <a-form-item label="应用名称" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-select v-model:value="selectValue" @change="appChange" placeholder="请选择应用">
            <a-select-option v-for="item in appList" :key="item.appCode" :value="item.appCode">
              {{ item.appName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="菜单权限" :label-col="labelCol" :wrapper-col="wrapperCol" class="grantMenuScrollbar">
          <a-tree
            v-if="menuTreeData.length > 0"
            v-model:checkedKeys="checkedKeys"
            v-model:expandedKeys="expandedKeys"
            multiple
            checkable
            auto-expand-parent
            :tree-data="menuTreeData"
            :field-names="replaceFields"
            @check="onCheck"
          />
          <a-empty v-else />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, defineExpose, defineEmits } from 'vue';
import { message } from 'ant-design-vue';
import { SysMenuTreeForGrant } from '@/api/modular/system/menuManage';
import { sysTenantOwnMenu, sysTenantGrantMenu } from '@/api/modular/system/tenantManage';

const emit = defineEmits(['ok']);

const labelCol = {
  style: { 'padding-right': '20px' },
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const visible = ref(false);
const menuTreeData = ref([]);
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const confirmLoading = ref(false);
const formLoading = ref(false);
const replaceFields = { key: 'id', title: 'name' };
const tenantEntity = ref(null);
const appList = ref([]);
const menuList = ref([]);
const selectValue = ref(null);
const allGrantedMenuIds = ref(new Set());

const tenantMenu = async (record) => {
  visible.value = true;
  formLoading.value = true;
  tenantEntity.value = record;

  try {
    const menuRes = await SysMenuTreeForGrant();
    if (menuRes.success) {
      appList.value = menuRes.data.appList;
      menuList.value = menuRes.data.menuTree;
      if (appList.value.length > 0) {
        selectValue.value = appList.value[0].appCode;
      }
    }

    const ownMenuRes = await sysTenantOwnMenu({ id: record.id });
    if (ownMenuRes.success) {
      allGrantedMenuIds.value = new Set(ownMenuRes.data);
    }

    if (selectValue.value) {
      appChange(selectValue.value);
    }
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    formLoading.value = false;
  }
};

const appChange = (appCode) => {
  const currentAppMenus = menuList.value.filter((f) => f.appCode === appCode);
  menuTreeData.value = currentAppMenus;

  const allNodeIds = [];
  const leafNodeIds = new Set();
  const getKeys = (data) => {
    data.forEach((item) => {
      allNodeIds.push(item.id);
      if (!item.children || item.children.length === 0) {
        leafNodeIds.add(item.id);
      } else {
        getKeys(item.children);
      }
    });
  };
  getKeys(currentAppMenus);

  expandedKeys.value = allNodeIds;

  const currentChecked = [...allGrantedMenuIds.value].filter(id => leafNodeIds.has(id));
  checkedKeys.value = { checked: currentChecked, halfChecked: [] };
};

const onCheck = (keys, event) => {
  const currentAppCode = selectValue.value;
  const otherAppMenuIds = [...allGrantedMenuIds.value].filter(id => {
      // Find which app this menu id belongs to
      for(const menu of menuList.value) {
          if(menu.id === id && menu.appCode !== currentAppCode) return true;
          // A more robust check might be needed if IDs are not unique across apps
      }
      return false;
  });

  const currentAppMenuIds = [...keys.checked, ...keys.halfChecked];
  allGrantedMenuIds.value = new Set([...otherAppMenuIds, ...currentAppMenuIds]);
};

const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    const res = await sysTenantGrantMenu({
      id: tenantEntity.value.id,
      grantMenuIdList: [...allGrantedMenuIds.value],
    });

    if (res.success) {
      message.success('授权成功');
      emit('ok');
      handleCancel();
    } else {
      message.error(`授权失败: ${res.message}`);
    }
  } catch (error) {
    message.error('授权出错');
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  checkedKeys.value = [];
  expandedKeys.value = [];
  selectValue.value = null;
  menuTreeData.value = [];
  allGrantedMenuIds.value = new Set();
};

defineExpose({
  tenantMenu,
});
</script>

<style scoped>
.grantMenuScrollbar {
  height: 60vh;
  overflow-y: auto;
}
</style>
