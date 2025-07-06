<template>
  <div class="dashboard-analysis-wrapper" style="padding: 24px">
    <!-- 指标概览 -->
    <a-row :gutter="24" style="margin-bottom: 24px">
      <a-col :xs="24" :sm="12" :lg="6">
        <chart-card :loading="loading" title="总销售额" :total="salesTotal">
          <template #action>
            <a-tooltip title="指标说明">
              <InfoCircleOutlined />
            </a-tooltip>
          </template>
          <template #footer>
            日销售额 <span>{{ daySales }}</span>
          </template>
          <mini-area :data="visitTrend" :height="45" />
        </chart-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <chart-card :loading="loading" title="访问人数" :total="visitTotal">
          <template #action>
            <a-tooltip title="指标说明">
              <InfoCircleOutlined />
            </a-tooltip>
          </template>
          <template #footer>
            日访问量 <span>{{ dayVisits }}</span>
          </template>
          <mini-area :data="visitTrend" :height="45" />
        </chart-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <chart-card :loading="loading" title="支付笔数" :total="payCount">
          <template #action>
            <a-tooltip title="指标说明">
              <InfoCircleOutlined />
            </a-tooltip>
          </template>
          <template #footer>
            转化率 <span>{{ payRate }}%</span>
          </template>
          <mini-bar :data="barData" :height="45" />
        </chart-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <chart-card :loading="loading" title="运营活动效果" :total="activityEffect + '%'">
          <template #action>
            <a-tooltip title="指标说明">
              <InfoCircleOutlined />
            </a-tooltip>
          </template>
          <template #footer>
            日同比 <span>{{ dayRate }}%</span>
          </template>
          <mini-progress :target="100" :percentage="activityEffect" stroke-color="#13C2C2" :height="8" />
        </chart-card>
      </a-col>
    </a-row>

    <!-- 销售额排行 -->
    <a-row :gutter="24">
      <a-col :xs="24" :lg="16" :style="{ marginBottom: '24px' }">
        <a-card :loading="loading" bordered title="销售额趋势">
          <bar :data="barData" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card :loading="loading" bordered title="门店销售排行榜">
          <rank-list :list="rankList" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChartCard, MiniArea, MiniBar, MiniProgress, RankList, Bar } from '@/components'
import { InfoCircleOutlined } from '@ant-design/icons-vue'

const loading = ref(false)
const salesTotal = ref('¥ 126,560')
const visitTotal = ref(8846)
const payCount = ref(6560)
const payRate = ref(60)
const activityEffect = ref(78)
const daySales = ref('￥12,423')
const dayVisits = ref(1234)
const dayRate = ref(12)

// mock chart data
const visitTrend = ref(Array.from({ length: 20 }).map((_, i) => ({ x: i + 1, y: Math.round(Math.random() * 100) + 200 })))
const barData = ref(Array.from({ length: 12 }).map((_, i) => ({ x: `${i + 1}月`, y: Math.round(Math.random() * 1000) + 200 })))
const rankList = ref(Array.from({ length: 7 }).map((_, i) => ({ name: `门店 ${i + 1}`, total: 1234.56 - i * 100 })))
</script>

<style scoped>
.dashboard-analysis-wrapper {
  background: #f0f2f5;
}
</style>
