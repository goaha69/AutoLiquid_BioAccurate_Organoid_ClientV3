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
      <div style="text-align: center;font-size : 30px">{{ this.contentRecord.title }}</div>
      <br>
      <div style="text-align: right;font-size : 10px">
        <span>(发布人:{{ this.contentRecord.createdUserName }}:</span>
        <span>发布时间:{{ this.contentRecord.createdTime }} </span>
      </div>
      <a-divider style="margin-top: 5px"></a>
      <div >
        <label v-html="this.contentRecord.content"></label>
      </div>
    </a-spin>
  </a-modal>
</template>
<script>
  import { sysArticleDetail } from '@/api/modular/system/articleManage'

  export default {
    name: 'DetailForm',
    components: {
    },
    data () {
      return {
        visible: false,
        confirmLoading: false,
        contentRecord: {}
      }
    },
    methods: {
      /**
       * 初始化方法
       */
      detail (record) {
        this.confirmLoading = true
        this.visible = true
        this.sysArticleDetail(record.id)
      },
      /**
       * 查看详情
       */
      sysArticleDetail (id) {
        sysArticleDetail({ id: id }).then((res) => {
          this.confirmLoading = false
          this.contentRecord = res.data
        })
      },
      handleCancel () {
        this.visible = false
        this.contentRecord = {}
      }
    }
  }
</script>
