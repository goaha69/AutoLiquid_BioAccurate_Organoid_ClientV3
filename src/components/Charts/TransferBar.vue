<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <v-chart
      height="254"
      :data="data"
      :scale="scale"
      :forceFit="true"
      :padding="['auto', 'auto', '40', '50']">
      <v-tooltip />
      <v-axis />
      <v-bar position="x*y" />
    </v-chart>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'

defineOptions({
  name: 'Bar'
})

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const instance = getCurrentInstance()
const { proxy } = instance

const data = ref([])

const tooltip = [
  'x*y',
  (x, y) => ({
    name: x,
    value: y
  })
]

const scale = [{
  dataKey: 'x',
  title: '日期(:',
  alias: '日期(:',
  min: 2
}, {
  dataKey: 'y',
  title: '流量(Gb)',
  alias: '流量(Gb)',
  min: 1
}]

const getMonthBar = () => {
  proxy.$http.get('/analysis/month-bar')
    .then(res => {
      data.value = res.result
    })
}

onMounted(() => {
  getMonthBar()
})
</script>
