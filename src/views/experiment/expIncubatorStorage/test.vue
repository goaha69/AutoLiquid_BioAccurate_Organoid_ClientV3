<template>
  <div>
    <h2>培养箱存储</h2>
    <p>这是一个简化的培养箱存储页面，用于测试路由是否正常工作。</p>
    <a-card title="培养箱存储" :bordered="false">
      <p>如果您能看到这个页面，说明路由配置已经正常工作。</p>
      <p>接下来我们需要修复原始页面的Vue 3语法错误。</p>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log('✅ 培养箱存储页面加载成功')
</script>

<style scoped>
h2 {
  color: #1890ff;
  margin-bottom: 16px;
}
</style>
