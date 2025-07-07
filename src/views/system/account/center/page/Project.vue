<template>
  <div class="ant-pro-pages-account-projects-cardList">
    <a-list :loading="loading" :data-source="data" :grid="{ gutter: 24, xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card class="ant-pro-pages-account-projects-card" hoverable>
            <template #cover>
              <img :src="item.cover" :alt="item.title" />
            </template>
            <a-card-meta :title="item.title">
              <template #description>
                <ellipsis :length="50">{{ item.description }}</ellipsis>
              </template>
            </a-card-meta>
            <div class="cardItemContent">
              <span>{{ formatFromNow(item.updatedAt) }}</span>
              <div class="avatarList">
                <avatar-list size="mini">
                  <avatar-list-item
                    v-for="(member, i) in item.members"
                    :key="`${item.id}-avatar-${i}`"
                    :src="member.avatar"
                    :tips="member.name"
                  />
                </avatar-list>
              </div>
            </div>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import moment from 'moment'
import { TagSelect, StandardFormRow, Ellipsis, AvatarList } from '@/components'

defineOptions({
  name: 'Project'
})

const { proxy } = getCurrentInstance()

const data = ref([])
const loading = ref(true)

const formatFromNow = (date) => {
  return moment(date).fromNow()
}

const handleChange = (value) => {
  console.log(`selected ${value}`)
}

const getList = () => {
  if (proxy.$http) {
    proxy.$http.get('/list/article', { params: { count: 8 } }).then(res => {
      console.log('res', res)
      data.value = res.result
      loading.value = false
    })
  } else {
    // Fallback for mock data
    setTimeout(() => {
      data.value = [
        {
          id: 1,
          title: 'Sample Project',
          description: 'This is a sample project description for testing purposes',
          cover: 'https://via.placeholder.com/300x200',
          updatedAt: new Date().toISOString(),
          members: [
            { avatar: 'https://via.placeholder.com/32', name: 'User 1' },
            { avatar: 'https://via.placeholder.com/32', name: 'User 2' }
          ]
        }
      ]
      loading.value = false
    }, 1000)
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="less" scoped>
.ant-pro-pages-account-projects-cardList {
  margin-top: 24px;

  :deep(.ant-card-meta-title) {
    margin-bottom: 4px;
  }

  :deep(.ant-card-meta-description) {
    height: 44px;
    overflow: hidden;
    line-height: 22px;
  }

  .cardItemContent {
    display: flex;
    height: 20px;
    margin-top: 16px;
    margin-bottom: -4px;
    line-height: 20px;

    > span {
      flex: 1 1;
      color: rgba(0,0,0,.45);
      font-size: 12px;
    }

    :deep(.ant-pro-avatar-list) {
      flex: 0 1 auto;
    }
  }
}
</style>
