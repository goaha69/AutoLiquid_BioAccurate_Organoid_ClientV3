<template>
  <div class="antv-chart-mini">
    <div class="chart-wrapper" :style="{ height: '46px' }">
      <div ref="containerRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from '@antv/g2plot';
import moment from 'moment';

const data = [];
const beginDay = new Date().getTime();

for (let i = 0; i < 10; i++) {
  data.push({
    x: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
    y: Math.round(Math.random() * 10),
  });
}

const containerRef = ref(null);

onMounted(() => {
  const bar = new Bar(containerRef.value, {
    data,
    xField: 'y',
    yField: 'x',
    height: 46,
    padding: [36, 5, 18, 5],
    xAxis: false,
    yAxis: false,
    legend: false,
    tooltip: {
      showTitle: false,
      formatter: (datum) => ({ name: datum.x, value: datum.y }),
    },
  });

  bar.render();
});
</script>

<style lang="less" scoped>
@import 'chart';
</style>
