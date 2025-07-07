<template>
  <a-modal
    title="新增菜单"
    :width="1000"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroy-on-close="true"
  >
    <a-spin :spinning="formLoading">
      <a-form :model="formState" :rules="rules" ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单名称" name="name">
              <a-input v-model:value="formState.name" placeholder="请输入菜单名称" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单编号" name="code">
              <a-input v-model:value="formState.code" placeholder="请输入菜单编号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="所属应用" name="application">
              <a-select v-model:value="formState.application" placeholder="请选择应用分类" @change="onAppChange">
                <a-select-option v-for="item in appData" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单层级" name="type">
              <a-radio-group v-model:value="formState.type" @change="onTypeChange">
                <a-radio v-for="item in typeData" :key="item.code" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item v-if="pidShow" label="父级菜单" name="pid">
              <a-tree-select
                v-model:value="formState.pid"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                :tree-data="menuTreeData"
                placeholder="请选择父级菜单"
                tree-default-expand-all
                :field-names="{ children: 'children', label: 'name', value: 'id' }"
              />
            </a-form-item>
            <a-form-item v-if="redirectShow" label="重定向">
               <template #label>
                  <span>
                    <a-tooltip title="如需打开首页加载此目录下菜单,请填写加载菜单路由,设为首页后其他设置的主页将被替:">
                      <QuestionCircleOutlined />
                    </a-tooltip>
                    重定向
                  </span>
                </template>
              <a-input v-model:value="formState.redirect" placeholder="请输入重定向地址" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="打开方式">
               <template #label>
                  <span>
                    <a-tooltip title="按钮:无,菜单:内链、外链、组:">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                     打开方式
                  </span>
                </template>
              <a-radio-group v-model:value="formState.openType" :disabled="openTypeDisabled">
                <a-radio v-for="item in openTypeData" :key="item.code" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider />

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item v-if="componentShow" label="前端组件" name="component">
               <template #label>
                  <span>
                    <a-tooltip title="前端vue组件 views文件夹下路径,例:system/menu/index.注:目录级填写:RouteView(不带面包:,PageView(带面包屑),菜单级内链打开http链接填写:Iframe">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                    前端组件
                  </span>
                </template>
              <a-input v-model:value="formState.component" placeholder="请输入前端组件" :disabled="componentDisabled" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item v-if="routerShow" label="路由地址" name="router">
               <template #label>
                  <span>
                    <a-tooltip title="浏览器显示的URL,例:menu,对应打开页面为菜单页:">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                    路由地址
                  </span>
                </template>
              <a-input v-model:value="formState.router" placeholder="请输入路由地址" />
            </a-form-item>
            <a-form-item v-if="permissionShow" label="权限标识" name="permission">
              <a-input v-model:value="formState.permission" placeholder="请输入权限标识" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item v-if="linkShow" label="内外链地址" name="link">
              <template #label>
                  <span>
                    <a-tooltip title="当选择了需要内链或外链打开的选项,此处输入要打开的链接地址,例:http:// www.dilon.vip">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                    内外链地址
                  </span>
                </template>
              <a-input v-model:value="formState.link" placeholder="请输入链接地址" :disabled="linkDisabled" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item v-if="iconShow" label="图标">
              <a-input v-model:value="formState.icon" placeholder="请选择图标" disabled>
                <template #addonAfter>
                  <SettingOutlined @click="openIconSelector" />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
             <a-form-item>
                <template #label>
                  <span>
                    <a-tooltip title="系统权重:菜单可分配给任何角色,业务权重:菜单对超级管理员不可见">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                    权重
                  </span>
                </template>
              <a-radio-group v-model:value="formState.weight">
                <a-radio v-for="item in weightData" :key="item.code" :value="item.code">{{ item.value }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="是否可见">
              <a-switch v-model:checked="formState.visible" checked-children="是" un-checked-children="否" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :md="12">
            <a-form-item v-if="keepAliveShow" label="是否缓存">
               <template #label>
                  <span>
                    <a-tooltip title="多标签模式下,默认缓存所有页:">
                       <QuestionCircleOutlined />
                    </a-tooltip>
                    是否缓存
                  </span>
                </template>
              <a-switch v-model:checked="formState.keepAlive" checked-children="是" un-checked-children="否" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="排序">
              <a-input-number v-model:value="formState.sort" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="备注">
              <a-input v-model:value="formState.remark" placeholder="请输入备注" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
    <a-modal :width="850" :open="visibleIcon" @cancel="handleCancelIcon" :footer="null" :mask="false">
      <icon-selector v-model:value="formState.icon" @change="handleIconChange" />
    </a-modal>
  </a-modal>
</template>

<script setup>
import { ref, reactive, toRaw, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { getAppList } from '@/api/modular/system/appManage';
import { getMenuTree, sysMenuAdd } from '@/api/modular/system/menuManage';
import IconSelector from '@/components/IconSelector/IconSelector.vue'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';

const labelCol = { xs: { span: 24 }, sm: { span: 6 } };
const wrapperCol = { xs: { span: 24 }, sm: { span: 16 } };

const visible = ref(false);
const confirmLoading = ref(false);
const formLoading = ref(true);
const formRef = ref();

const appData = ref([]);
const menuTreeData = ref([]);
const typeData = ref([]);
const openTypeData = ref([]);
const weightData = ref([]);

// Form state
const formState = reactive({
  name: '',
  code: '',
  application: '',
  type: 'MENU',
  pid: '0',
  redirect: '',
  openType: 'NONE',
  component: '',
  router: '',
  permission: '',
  link: '',
  icon: '',
  weight: 'SYSTEM',
  visible: true,
  keepAlive: false,
  sort: 100,
  remark: '',
});

// Conditional visibility
const pidShow = ref(true);
const redirectShow = ref(false);
const componentShow = ref(true);
const routerShow = ref(true);
const iconShow = ref(true);
const keepAliveShow = ref(true);
const openTypeShow = ref(true);
const permissionShow = ref(true);
const linkShow = ref(false);
const openTypeDisabled = ref(false);
const componentDisabled = ref(false);
const linkDisabled = ref(true);

// Validation rules
const rules = reactive({
  name: [{ required: true, message: '请输入菜单名称!' }],
  code: [{ required: true, message: '请输入菜单编号!' }],
  application: [{ required: true, message: '请选择应用分类!' }],
  type: [{ required: true, message: '请选择菜单层级!' }],
  pid: [{ required: true, message: '请选择父级菜单!' }],
  component: [{ required: true, message: '请输入前端组件!' }],
  router: [{ required: true, message: '请输入路由地址!' }],
  permission: [{ required: true, message: '请输入权限标识!' }],
  link: [{ required: true, message: '请输入链接地址!' }],
});


const emit = defineEmits(['ok']);

onMounted(() => {
  loadInitialData();
});

const loadInitialData = () => {
  formLoading.value = true;
  Promise.all([
    sysDictTypeDropDown({ code: 'menu_type' }),
    sysDictTypeDropDown({ code: 'menu_open_type' }),
    sysDictTypeDropDown({ code: 'system_weight_type' }),
    getAppList(),
  ]).then(([typeRes, openTypeRes, weightRes, appRes]) => {
    typeData.value = typeRes.data;
    openTypeData.value = openTypeRes.data;
    weightData.value = weightRes.data;
    appData.value = appRes.data;
  }).finally(() => {
    formLoading.value = false;
  });
};

const add = (appCode) => {
  visible.value = true;
  formState.application = appCode;
  onAppChange(appCode);
  onTypeChange({ target: { value: 'MENU' } });
};

const onAppChange = (appCode) => {
  getMenuTree({ application: appCode }).then(res => {
    menuTreeData.value = [{ id: '0', name: '顶级', children: res.data }];
  });
};

watch(() => formState.type, (newType) => {
    pidShow.value = newType !== 'DIR';
    redirectShow.value = newType === 'DIR';
    componentShow.value = newType !== 'BUTTON';
    routerShow.value = newType !== 'BUTTON';
    iconShow.value = newType !== 'BUTTON';
    keepAliveShow.value = newType === 'MENU';
    permissionShow.value = newType === 'BUTTON';
    openTypeDisabled.value = newType === 'BUTTON';

    rules.pid.required = newType !== 'DIR';
    rules.component.required = newType !== 'BUTTON';
    rules.router.required = newType !== 'BUTTON';
    rules.permission.required = newType === 'BUTTON';

    if (newType === 'BUTTON') {
      formState.openType = 'NONE';
    }
});

watch(() => formState.openType, (newOpenType) => {
    componentDisabled.value = newOpenType === 'IFRAME' || newOpenType === 'LINK';
    linkDisabled.value = newOpenType !== 'IFRAME' && newOpenType !== 'LINK';
    linkShow.value = newOpenType === 'IFRAME' || newOpenType === 'LINK';

    rules.link.required = newOpenType === 'IFRAME' || newOpenType === 'LINK';

    if(newOpenType === 'IFRAME') {
        formState.component = 'Iframe'
    }
});


const handleSubmit = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    sysMenuAdd(toRaw(formState)).then(res => {
      if (res.success) {
        message.success('新增成功');
        handleCancel();
        emit('ok');
      } else {
        message.error('新增失败：' + res.message);
      }
    }).finally(() => {
      confirmLoading.value = false;
    });
  });
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

// Icon Selector
const visibleIcon = ref(false);
const openIconSelector = () => {
  visibleIcon.value = true;
};
const handleIconChange = (icon) => {
  formState.icon = icon;
  visibleIcon.value = false;
};
const handleCancelIcon = () => {
  visibleIcon.value = false;
};

defineExpose({ add });
</script>
