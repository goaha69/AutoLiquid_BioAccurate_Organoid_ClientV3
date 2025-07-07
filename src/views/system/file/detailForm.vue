<template>
  <a-modal
    title="文件信息详情"
    :footer="null"
    :width="900"
    :open="visible"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning">
      <a-descriptions bordered>
        <a-descriptions-item label="文件存储位置">{{ fileDetail.fileLocation }}</a-descriptions-item>
        <a-descriptions-item label="文件仓库">{{ fileDetail.fileBucket }}</a-descriptions-item>
        <a-descriptions-item label="文件名称">{{ fileDetail.fileOriginName }}</a-descriptions-item>
        <a-descriptions-item label="文件后缀">{{ fileDetail.fileSuffix }}</a-descriptions-item>
        <a-descriptions-item label="文件大小">{{ fileDetail.fileSizeKb }}</a-descriptions-item>
        <a-descriptions-item label="唯一标识">{{ fileDetail.fileObjectName }}</a-descriptions-item>
        <a-descriptions-item label="存储路径" :span="2">{{ fileDetail.filePath }}</a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </a-modal>
</template>
<script setup>
import { ref, defineExpose } from 'vue';

const visible = ref(false);
const spinning = ref(false);
const fileDetail = ref({});

const detail = (record) => {
  fileDetail.value = record;
  visible.value = true;
};

const handleCancel = () => {
  visible.value = false;
  fileDetail.value = {};
};

defineExpose({
  detail,
});
</script>
