<template>
  <a-modal
    title="预览图片"
    :footer="null"
    :width="900"
    :open="visible"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning">
      <div style="text-align: center">
        <img :src="src" style="max-width: 99%" />
      </div>
    </a-spin>
  </a-modal>
</template>
<script setup>
import { ref, defineExpose } from 'vue';
import { sysFileInfoPreview } from '@/api/modular/system/fileManage';
import { message } from 'ant-design-vue';

const visible = ref(false);
const src = ref('');
const spinning = ref(false);

const preview = (record) => {
  visible.value = true;
  spinning.value = true;
  fetchPreview(record);
};

const fetchPreview = (record) => {
  sysFileInfoPreview({ id: record.id })
    .then((res) => {
      const blob = new Blob([res]);
      src.value = window.URL.createObjectURL(blob);
    })
    .catch((err) => {
      message.error('预览错误：' + err.message);
    })
    .finally(() => {
      spinning.value = false;
    });
};

const handleCancel = () => {
  src.value = '';
  visible.value = false;
};

defineExpose({
  preview,
});
</script>
