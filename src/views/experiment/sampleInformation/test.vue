<template>
  <div>
    <h2>样品信息表</h2>
    <p>这是一个简化的样品信息表页面，用于测试路由是否正常工作。</p>
    <a-card title="样品信息表" :bordered="false">
      <p>如果您能看到这个页面，说明路由配置已经正常工作。</p>
      <p>接下来我们需要修复原始页面的Vue 3语法错误。</p>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log('✅ 样品信息表页面加载成功')
</script>

<style scoped>
h2 {
  color: #1890ff;
  margin-bottom: 16px;
}
</style>
