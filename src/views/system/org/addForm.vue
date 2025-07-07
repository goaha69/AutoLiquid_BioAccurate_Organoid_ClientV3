<template>
  <a-modal
    title="新增机构"
    :width="900"
    :open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="机构类型" name="orgtype">
          <a-radio-group v-model:value="form.orgtype" placeholder="请选择机构类型">
            <a-radio
              v-for="item in typeEnumDataDropDown"
              :key="item.code"
              :value="parseInt(item.code)"
            >
              {{ item.value }}
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="机构名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入机构名称" />
        </a-form-item>

        <a-form-item label="唯一编码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入唯一编码" />
        </a-form-item>

        <a-form-item label="上级机构" name="pid">
          <a-tree-select
            v-model:value="form.pid"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
            :tree-data="orgTree"
            placeholder="请选择上级机构"
            tree-default-expand-all
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
          />
        </a-form-item>

        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="form.sort"
            placeholder="请输入排序"
            style="width: 100%"
            :min="1"
            :max="1000"
          />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { sysOrgAdd, getOrgTree } from '@/api/modular/system/orgManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'ok']);

const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 15 },
};

const orgTree = ref([]);
const confirmLoading = ref(false);
const formLoading = ref(true);
const typeEnumDataDropDown = ref([]);

const formRef = ref();
const form = reactive({
  orgtype: undefined,
  name: '',
  code: '',
  pid: '',
  sort: 100,
  remark: '',
});

const rules = {
  orgtype: [{ required: true, message: '请选择机构类型' }],
  name: [{ required: true, message: '请输入机构名称!' }],
  code: [{ required: true, message: '请输入唯一编码' }],
  pid: [{ required: true, message: '请选择上级机构' }],
};

onMounted(async () => {
  await loadDictData();
  await loadOrgTree();
  formLoading.value = false;
});

const add = async () => {
  formRef.value?.resetFields();
  emit('update:visible', true);
};

const loadDictData = async () => {
  const res = await sysDictTypeDropDown({ code: 'org_type' });
  typeEnumDataDropDown.value = res.data;
};

const loadOrgTree = async () => {
  const res = await getOrgTree();
  if (res.success) {
    orgTree.value = [
      {
        id: '0',
        name: '顶级',
        children: res.data,
      },
    ];
  }
};

const handleSubmit = () => {
  confirmLoading.value = true;
  formRef.value
    .validate()
    .then(async () => {
      try {
        const res = await sysOrgAdd(form);
        if (res.success) {
          message.success('新增成功');
          emit('ok');
          handleCancel();
        } else {
          message.error(`新增失败：${res.message}`);
        }
      } finally {
        confirmLoading.value = false;
      }
    })
    .catch(() => {
      confirmLoading.value = false;
    });
};

const handleCancel = () => {
  formRef.value.resetFields();
  emit('update:visible', false);
};

defineExpose({
  add,
});
</script>
