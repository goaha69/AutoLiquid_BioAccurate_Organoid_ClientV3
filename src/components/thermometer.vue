<template>
  <div class="thermometers-container">
    <div v-for="(item, index) in temps" :key="index" class="thermometer-item">
      <a-card class="thermometer-container" :bordered="false">
        <!-- 标题 -->
        <div class="thermometer-title">{{ item.title }}</div>
        <div class="thermometer-content">
          <!-- 竖向进度条和刻度 -->
          <div class="progress-with-scale">
            <!-- 竖向进度:-->
            <div class="vertical-progress">
              <div class="progress-background"></div>
              <div class="progress-bar" :style="{ height: `${item.precent}%`, backgroundColor: item.strokeColor, bottom: item.bottom }"></div>
              <!-- <div class="progress-bar" :style="{ height: `${calculatePercent(item)}%`, backgroundColor: calculateStrokeColor(item), bottom: calculateBottom(item) }"></div>               -->
            </div>
            <!-- 刻度 -->
            <div class="thermometer-scale">
              <div v-for="temp in scaleTemps" :key="temp" class="scale-item">
                <div class="scale-text">{{ temp }}°C</div>
              </div>
            </div>
          </div>
          <!-- 当前温度 -->
          <div class="current-temp">{{ item.currentTemp.toFixed(1) }}°C</div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
import { exp_equipment_refreshTemp } from '@/api/modular/experiment/equipmentManage'

export default {
  name: 'Thermometer',
  props: {
    temps: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      timer: null, // 用于存储定时ID
      minTemp: -20,
      maxTemp: 80,
      trailColor: '#eaeaea', // 背景颜色
      scaleTemps: [80, 60, 40, 20, 0, -20], // 刻度温度    };
  },
  created(){
    this.timer = setInterval(() => {
       exp_equipment_refreshTemp().then((res) => {
          if (res.success) {
            console.log("exp_equipment_refreshTemp===###>>>")
            if(this.temps.length>0)
            {
              console.log('===>>>===&&&===###');
              this.temps[0].currentTemp = res.data.heatingResult1
              this.temps[1].currentTemp = res.data.heatingResult2
              this.temps[2].currentTemp = res.data.heatingResult3
              this.temps[3].currentTemp = res.data.heatingResult4
              this.temps[4].currentTemp = res.data.heatingResult5

              this.temps[5].currentTemp = res.data.coolingResult1
              this.temps[6].currentTemp = res.data.coolingResult2
              this.temps[7].currentTemp = res.data.coolingResult3
              this.temps[8].currentTemp = res.data.coolingResult4
              this.temps[9].currentTemp = res.data.coolingResult5
              this.temps[10].currentTemp = res.data.coolingResult6
              this.temps[11].currentTemp = res.data.coolingResult7
              this.temps[12].currentTemp = res.data.coolingResult8
              this.temps[13].currentTemp = res.data.coolingResult9
              this.temps[14].currentTemp = res.data.coolingResult10
              this.temps[15].currentTemp = res.data.coolingResult11
              this.temps[16].currentTemp = res.data.coolingResult12

              this.temps.forEach(item => {
                item.precent=this.calculatePercent(item)
                item.strokeColor=this.calculateStrokeColor(item)
                item.bottom=this.calculateBottom(item)
              });
            }
          }
        }).catch((err) => {
          this.$message.error('异常:: + err.message)
      })   
    }, 2000)
  },
  beforeUnmount() {
    // 组件销毁前清除定时    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    clear(){
       /**
       * 组件销毁前清除定时 */
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    calculatePercent(item) {
      const range = this.maxTemp - this.minTemp;
      const zeroPoint = 0 - this.minTemp; /**
       * 0°C相对于最小值的偏移 const offset = item.currentTemp - this.minTemp;
       */
      if (item.currentTemp >= 0) {
        // 如果当前温度为正数,°C的位置向上增        return ((item.currentTemp-1) / range) * 100;
      } else {
        // 如果当前温度为负数,°C的位置向下增        return (Math.abs(item.currentTemp) / range) * 100;
      }
    },
    calculateStrokeColor(item) {
      if (item.currentTemp > 60) return '#ff4d4f'; // 红色
      if (item.currentTemp > 40) return '#faad14'; // 黄色
      if (item.currentTemp > 0) return '#52c41a'; // 绿色
      return '#00ffcc'; /**
       * 青绿 },
       */
      calculateBottom(item) {
      const range = this.maxTemp - this.minTemp;
      const zeroPoint = 0 - this.minTemp; /**
       * 0°C相对于最小值的偏移 */
      if (item.currentTemp >= 0) {
        // 如果当前温度为正数,°C的位置向上增        return `${(zeroPoint / range) * 100}%`;
      } else {
        // 如果当前温度为负数,°C的位置向下增        return `${((Math.abs(this.minTemp) - Math.abs(item.currentTemp)) / range) * 100}%`;
      }
    },
    calculateLinePosition(temp) {
      const range = this.maxTemp - this.minTemp;
      const zeroPoint = 0 - this.minTemp; /**
       * 0°C相对于最小值的偏移 */
      if (temp >= 0) {
        // 如果刻度温度为正数,°C的位置向上计        return `${((temp - zeroPoint) / (range - zeroPoint)) * 100}%`;
      } else {
        // 如果刻度温度为负数,°C的位置向下计        return `${((zeroPoint - Math.abs(temp)) / zeroPoint) * 100}%`;
      }
    },
  },
};
</script>

<style scoped>
.thermometers-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.thermometer-item {
  width: 150px;
}

.thermometer-container {
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.thermometer-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.thermometer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-with-scale {
  display: flex;
  align-items: flex-end; /* 对齐到进度条的底?*/
  margin-bottom: 10px; /* 与当前温度的间距 */
}

.vertical-progress {
  width: 20px; /* 设置进度条的宽度 */
  height: 250px; /* 设置进度条的高度 */
  position: relative;
  margin-right: 1px; /* 与刻度之间的间距 */
}

.progress-background {
  width: 100%;
  height: 100%;
  background-color: v-bind(trailColor); /* 背景颜色 */
  position: absolute;
  top: 0;
  left: 0;
}

.progress-bar {
  width: 100%;
  position: absolute;
  bottom: 0; /* 从底部开?*/
}

.thermometer-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 均匀分布刻度 */
  height: 250px; /* 与进度条高度一?*/
  align-items: flex-start; /* 靠左对齐 */
  margin-bottom: 3px;
}

.scale-item {
  width: 100%; /* 宽度与进度条一?*/
  position: relative; /* 用于定位下边:*/
  text-align: center; /* 刻度文本居中对齐 */
}

.scale-text {
  font-size: 14px;
  color: #999;
  position: relative; /* 确保文本在下边框上方 */
  z-index: 1; /* 确保文本在下边框上方 */
  margin-left: 5px;
}

.scale-item::after {
  content: ''; /* 创建伪元:*/
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px; /* 下边框的高度 */
  background-color: #999; /* 下边框的颜色 */
  z-index: 0; /* 确保下边框在文本下方 */
}

.current-temp {
  font-size: 20px;
  font-weight: bold;
}
</style>
