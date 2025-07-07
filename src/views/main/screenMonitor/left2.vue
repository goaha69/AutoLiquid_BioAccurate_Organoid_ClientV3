<template>
  <div class="left2">
    <div class="lc1-header">
      服务数据
      <dv-decoration-3 style="width: 200px;height: 20px;" />
    </div>
    <dv-capsule-chart class="lc1-chart" :config="config" />
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineOptions({
  name: 'Left2'
})

const config = reactive({
  data: [
    {
      name: '健康管理',
      value: 3000
    },
    {
      name: '生活照料',
      value: 1000
    },
    {
      name: '康复护理',
      value: 5000
    },
    {
      name: '精神慰藉',
      value: 200
    },
    {
      name: '紧急救援',
      value: 1000
    }
  ],
  colors: ['#00baff', '#3de7c9', '#ffc530', '#FA3600', '#44934b'],
  showValue: true,
  unit: ''
})
</script>

<style lang="less">
.left2 {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: rgba(6, 30, 93, 0.5);

  .lc1-header {
    position: absolute;
    left: 10px;
    font-size: 14px;
    top: 10px;
    color: #6BD4E0;
  }

  .lc1-chart {
    width: 98%;
    position: absolute;
    top: 20%;
    left: 1%;
    bottom: 0px;
  }
}
</style>
