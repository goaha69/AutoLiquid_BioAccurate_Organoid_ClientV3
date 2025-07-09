<template>
  <div style="padding: 20px; background: #f0f0f0; border: 1px solid #ccc;">
    <h1>布局管理测试页面</h1>
    <p>如果你能看到这个页面，说明路由配置正确。</p>
    <p>当前路由: {{ $route.path }}</p>
    <p>当前时间: {{ new Date().toLocaleString() }}</p>
    
    <div style="margin-top: 20px;">
      <h3>测试链接：</h3>
      <ul>
        <li><router-link to="/experiment/layout">布局管理</router-link></li>
        <li><router-link to="/experiment/consumable">耗材管理</router-link></li>
        <li><router-link to="/experiment/sampleInformation">样本信息</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestLayout'
}
</script> 