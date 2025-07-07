<template>
  <a-modal
    title="编辑代码生成配置"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="id" v-show="false">
          <a-input v-model:value="formState.id" />
        </a-form-item>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="数据库表" name="tableName">
              <a-select v-model:value="formState.tableName" placeholder="请选择数据库表" @change="handleTableChange">
                <a-select-option v-for="item in tableNameData" :key="item.entityName" :value="item.tableName" :item="item">
                  {{ item.tableName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="业务名" name="busName">
              <a-input v-model:value="formState.busName" placeholder="请输入业务名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单分类" name="menuApplication">
              <a-select v-model:value="formState.menuApplication" placeholder="请选择应用分类">
                <a-select-option v-for="item in appData" :key="item.code" :value="item.code">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="父级菜单" name="menuPid">
              <a-tree-select
                v-model:value="formState.menuPid"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                :tree-data="menuTreeData"
                placeholder="请选择父级菜单"
                tree-default-expand-all
                :field-names="{ children: 'children', label: 'title', value: 'id' }"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="命名空间" name="nameSpace">
              <a-input v-model:value="formState.nameSpace" placeholder="请输入代码包名" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="作者姓名" name="authorName">
              <a-input v-model:value="formState.authorName" placeholder="请输入作者姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="生成方式" name="generateType">
              <a-radio-group v-model:value="formState.generateType">
                <a-radio v-for="item in generateTypeData" :key="item.code" :value="item.code">
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import { getAppList } from '@/api/modular/system/appManage';
import { getMenuTree } from '@/api/modular/system/menuManage';
import { codeGenerateInformationList, codeGenerateEdit } from '@/api/modular/gen/codeGenerateManage';
import { dictType } from '@/utils/dict'

const emit = defineEmits(['ok']);

const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 15 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formLoading = ref(false);
const formRef = ref();

const appData = ref([]);
const menuTreeData = ref([]);
const tableNameData = ref([]);
const generateTypeData = ref([]);

const formState = reactive({
  id: '',
  tableName: undefined,
  busName: '',
  menuApplication: undefined,
  menuPid: undefined,
  nameSpace: '',
  authorName: '',
  generateType: '2',
});

const rules = {
  tableName: [{ required: true, message: '请选择数据库表' }],
  busName: [{ required: true, message: '请输入业务名' }],
  menuApplication: [{ required: true, message: '请选择应用分类' }],
  menuPid: [{ required: true, message: '请选择父级菜单' }],
  nameSpace: [{ required: true, message: '请输入命名空间' }],
  authorName: [{ required: true, message: '请输入作者姓名' }],
  generateType: [{ required: true, message: '请选择生成方式' }],
};

watch(() => formState.menuApplication, (appCode) => {
  if (appCode) {
    getMenuTree({ application: appCode }).then((res) => {
      menuTreeData.value = res.data;
    });
  } else {
    menuTreeData.value = [];
  }
});

const handleTableChange = (value, option) => {
  if (option && option.item) {
    formState.busName = option.item.busName;
    formState.nameSpace = `SuperH2.Service.Dto.${option.item.busName}`;
  }
};

const edit = async (record) => {
  visible.value = true;
  formLoading.value = true;
  formRef.value?.resetFields();
  Object.assign(formState, record);
  try {
    const [tables, apps] = await Promise.all([
      codeGenerateInformationList(),
      getAppList(),
    ]);
    tableNameData.value = tables.data;
    appData.value = apps.data;
    generateTypeData.value = dictType('code_gen_create_type').filter(d => d.code !== '1');
    
    // Trigger initial menu load
    if (formState.menuApplication) {
        const menuRes = await getMenuTree({ application: formState.menuApplication });
        menuTreeData.value = menuRes.data;
    }
  } catch (error) {
    message.error('加载基础数据失败');
  } finally {
    formLoading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    await codeGenerateEdit(formState);
    message.success('编辑成功');
    visible.value = false;
    emit('ok');
  } catch (error) {
    // validation error
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

defineExpose({
  edit,
});
</script>
