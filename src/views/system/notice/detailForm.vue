<template>
  <a-modal
    title="通知公告详情"
    :width="1000"
    :confirm-loading="confirmLoading"
    :open="visible"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <div style="text-align: center; font-size: 30px">{{ contentRecord.title }}</div>
      <br />
      <div style="text-align: right; font-size: 10px">
        <span>(发布人:{{ contentRecord.publicUserName }}:</span>
        <span>发布时间:{{ contentRecord.publicTime }} </span>
      </div>
      <a-divider style="margin-top: 5px" />
      <div>
        <label v-html="contentRecord.content"></label>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import { sysNoticeDetail } from '@/api/modular/system/noticeManage';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible']);

const confirmLoading = ref(false);
const contentRecord = ref({});

const detail = async (record) => {
  emit('update:visible', true);
  confirmLoading.value = true;
  try {
    const res = await sysNoticeDetail({ id: record.id });
    if (res.success) {
      contentRecord.value = res.data;
    }
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  contentRecord.value = {};
  emit('update:visible', false);
};

defineExpose({
  detail,
});
</script>
