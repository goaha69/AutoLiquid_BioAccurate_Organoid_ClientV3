<template>
  <a-modal
    title="文章详情"
    :width="1000"
    :confirmLoading="confirmLoading"
    :open="visible"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <div style="text-align: center; font-size: 30px">{{ contentRecord.title }}</div>
      <br>
      <div style="text-align: right; font-size: 10px">
        <span>发布人: {{ contentRecord.createdUserName }}</span>
        <span>发布时间: {{ contentRecord.createdTime }}</span>
      </div>
      <a-divider style="margin-top: 5px" />
      <div>
        <div v-html="contentRecord.content"></div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { sysArticleDetail } from '@/api/modular/system/articleManage'

defineOptions({
  name: 'DetailForm'
})

const visible = ref(false)
const confirmLoading = ref(false)
const contentRecord = reactive({
  title: '',
  createdUserName: '',
  createdTime: '',
  content: ''
})

const detail = (record) => {
  confirmLoading.value = true
  visible.value = true
  fetchArticleDetail(record.id)
}

const fetchArticleDetail = (id) => {
  sysArticleDetail({ id: id }).then((res) => {
    confirmLoading.value = false
    Object.assign(contentRecord, res.data)
  }).catch(() => {
    confirmLoading.value = false
  })
}

const handleCancel = () => {
  visible.value = false
  Object.assign(contentRecord, {
    title: '',
    createdUserName: '',
    createdTime: '',
    content: ''
  })
}

defineExpose({
  detail
})
</script>

<style scoped>
</style>
