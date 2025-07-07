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
        <span>(发布人:{{ contentRecord.publicUserName }})</span>
        <span>发布时间:{{ contentRecord.publicTime }}</span>
      </div>
      <a-divider style="margin-top: 5px" />
      <div>
        <label v-html="contentRecord.content"></label>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { sysNoticeDetail } from '@/api/modular/system/noticeManage'

defineOptions({
  name: 'DetailForm'
})

const visible = ref(false)
const confirmLoading = ref(false)
const contentRecord = reactive({})

const detail = (record) => {
  confirmLoading.value = true
  visible.value = true
  fetchNoticeDetail(record.id)
}

const fetchNoticeDetail = (id) => {
  sysNoticeDetail({ id: id }).then((res) => {
    confirmLoading.value = false
    Object.assign(contentRecord, res.data)
  })
}

const handleCancel = () => {
  visible.value = false
}

defineExpose({
  detail
})
</script>

<style>
.subButton {
  float: right;
}

.subForm-item {
  margin-bottom: 0px;
}
</style>
