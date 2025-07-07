<template>
  <div id="top-header">
    <dv-decoration-8 class="header-left-decoration" />
    <dv-decoration-5 class="header-center-decoration" />
    <dv-decoration-8 class="header-right-decoration" :reverse="true" />
    <div class="center-title">智慧养老服务数据中心</div>
    <div class="title-time">{{ dateFormat(date) }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'TopHeader'
})

const date = ref(new Date())
let timer = null

const dateFormat = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-Hans-CN', {
    weekday: 'long',
    hours12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  timer = setInterval(() => {
    date.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="less">
#top-header {
  position: relative;
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;

  .header-center-decoration {
    width: 40%;
    height: 80px;
    margin-top: 30px;
  }

  .header-left-decoration,
  .header-right-decoration {
    width: 25%;
    height: 60px;
  }

  .center-title {
    position: absolute;
    font-size: 28px;
    font-weight: bold;
    left: 50%;
    top: 15px;
    transform: translateX(-50%);
    color: #40FAEE;
  }

  .title-time {
    position: absolute;
    font-size: 10px;
    left: 50%;
    top: 55px;
    color: #6BD4E0;
    transform: translateX(-50%);
  }
}
</style>
