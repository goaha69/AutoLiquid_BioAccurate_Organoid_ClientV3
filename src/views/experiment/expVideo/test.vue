<template>
  <div>
    <h2>视频监控</h2>
    <p>这是一个简化的视频监控页面，用于测试路由是否正常工作。</p>
    <a-card title="视频监控" :bordered="false">
      <p>如果您能看到这个页面，说明路由配置已经正常工作。</p>
      <p>接下来我们需要修复原始页面的Vue 3语法错误。</p>
      
      <div style="margin-top: 20px;">
        <h3>功能说明：</h3>
        <ul>
          <li>视频录制控制</li>
          <li>录像文件管理</li>
          <li>视频播放回放</li>
          <li>相机选择与配置</li>
        </ul>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log('✅ 视频监控页面加载成功')
</script>

<style scoped>
h2 {
  color: #1890ff;
  margin-bottom: 16px;
}

ul {
  padding-left: 20px;
}

li {
  margin: 8px 0;
}
</style>
