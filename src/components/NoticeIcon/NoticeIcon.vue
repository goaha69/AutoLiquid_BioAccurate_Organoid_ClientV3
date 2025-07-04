<template>
  <div>
    <a-popover placement="bottomRight" trigger="click">
      <template #content>
        <div style="width: 300px; padding: 16px;">
          <div v-if="userNotices.totalRows > 0">
            <p>您有 {{ userNotices.totalRows }} 条通知</p>
            <a-list :dataSource="userNotices.records" size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>{{ item.title }}</template>
                    <template #description>{{ item.createTime }}</template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
          <div v-else style="text-align: center; color: #999;">
            暂无通知
          </div>
        </div>
      </template>
      <span @click="fetchNotice" class="header-notice" ref="noticeRef" style="padding: 0 18px">
        <a-badge 
          :count="userNotices.totalRows" 
          :overflowCount="999">
          <bell-outlined style="font-size: 16px; padding: 4px"></bell-outlined>
        </a-badge>
      </span>
    </a-popover>
  </div>
</template>

<script>
import { BellOutlined } from '@ant-design/icons-vue'
import { mapGetters } from 'vuex'

export default {
  name: 'NoticeIcon',
  components: {
    BellOutlined
  },
  data() {
    return {
      loading: false,
      visible: false
    }
  },
  mounted() {},
  computed: {
    userNotices () {
      // 返回默认的通知数据结构
      return {
        totalRows: 0,
        rows: [
          {
            key: '通知',
            value: 'notice',
            noticeData: []
          },
          {
            key: '消息',
            value: 'message',
            noticeData: []
          }
        ]
      }
    }
  },
  methods: {
    fetchNotice() {
      // if (!this.visible) {
      //   this.loading = true
      //   setTimeout(() => {
      //     this.loading = false
      //   }, 100)
      // } else {
      //   this.loading = false
      // }
      this.visible = !this.visible
    },
    goMore() {
      this.visible = !this.visible
      this.$router.push('/noticeReceived')
    }
  }
}
</script>

<style lang="css">
.header-notice-wrapper {
  top: 50px !important;
}
</style>
<style lang="less" scoped>
.header-notice {
  display: inline-block;
  transition: all 0.3s;

  span {
    vertical-align: initial;
  }
}
</style>
