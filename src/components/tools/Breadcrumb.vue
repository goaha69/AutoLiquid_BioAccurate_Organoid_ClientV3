<template>
  <a-breadcrumb class="breadcrumb">
    <a-breadcrumb-item v-for="(item, index) in breadList" :key="item.name">
      <router-link
        v-if="item.name != name && index != 1"
        :to="{ path: item.path === '' ? '/' : item.path }"
      >{{ item.meta.title }}</router-link>
      <span v-else>{{ item.meta.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'Breadcrumb'
})

const route = useRoute()
const name = ref('')
const breadList = ref([])

const getBreadcrumb = () => {
  breadList.value = []
  // breadList.value.push({name: 'index', path: '/dashboard/', meta: {title: '首页'}})

  name.value = route.name
  route.matched.forEach(item => {
    // item.name !== 'index' && breadList.value.push(item)
    breadList.value.push(item)
  })
}

watch(() => route, () => {
  getBreadcrumb()
})

onMounted(() => {
  getBreadcrumb()
})
</script>

<style scoped>
</style>
