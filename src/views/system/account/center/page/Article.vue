<template>
  <a-list
    size="large"
    rowKey="id"
    :loading="loading"
    itemLayout="vertical"
    :dataSource="data"
  >
    <template #renderItem="{ item }">
      <a-list-item :key="item.id">
        <a-list-item-meta>
          <template #title>
            <a href="https://vue.ant.design/">{{ item.title }}</a>
          </template>
          <template #description>
            <span>
              <a-tag>Ant Design</a-tag>
              <a-tag>设计语言</a-tag>
              <a-tag>蚂蚁金服</a-tag>
            </span>
          </template>
        </a-list-item-meta>
        <article-list-content 
          :description="item.description" 
          :owner="item.owner" 
          :avatar="item.avatar" 
          :href="item.href" 
          :updateAt="item.updatedAt" 
        />
      </a-list-item>
    </template>
    <template #footer>
      <div v-if="data.length > 0" style="text-align: center; margin-top: 16px;">
        <a-button @click="loadMore" :loading="loadingMore">加载更多</a-button>
      </div>
    </template>
  </a-list>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ArticleListContent } from '@/components'

defineOptions({
  name: 'Article'
})

const { proxy } = getCurrentInstance()

const loading = ref(true)
const loadingMore = ref(false)
const data = ref([])

const getList = () => {
  if (proxy.$http) {
    proxy.$http.get('/list/article').then(res => {
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
          title: 'Sample Article',
          description: 'This is a sample article description',
          owner: 'Admin',
          avatar: '',
          href: '#',
          updatedAt: new Date().toISOString()
        }
      ]
      loading.value = false
    }, 1000)
  }
}

const loadMore = () => {
  loadingMore.value = false
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
</style>
