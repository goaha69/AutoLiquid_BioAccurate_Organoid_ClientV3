<template>
  <div id="data-view">
    <dv-full-screen-container><!-- 有这个会显示全屏 -->
      <top-header />
      <div class="main-container">
        <div class="left1" style="width: 20%;display: flex;flex-direction: column">
          <dv-border-box-12>
            <left1 />
          </dv-border-box-12>
          <dv-border-box-12>
            <left12 />
          </dv-border-box-12>
        </div>
        <div class="left2" style="width: 20%;display: flex;flex-direction: column">
          <dv-border-box-12>
            <left2 />
          </dv-border-box-12>
          <dv-border-box-12>
            <left22 />
          </dv-border-box-12>
          <dv-border-box-12>
            <left23 />
          </dv-border-box-12>
        </div>
        <div class="middle" style="width: 40%;display: flex;flex-direction: column">
          <dv-border-box-1 style="height: 15%;">
            <middle1 />
          </dv-border-box-1>
          <dv-border-box-8 style="height: 60%;">
            <middle2 />
          </dv-border-box-8>
          <dv-border-box-1 style="height: 25%;">
            <middle3 />
          </dv-border-box-1>
        </div>
        <div class="right" style="width: 20%;display: flex;flex-direction: column">
          <dv-border-box-12>
            <right1 />
          </dv-border-box-12>
          <dv-border-box-12>
            <right2 />
          </dv-border-box-12>
          <dv-border-box-12>
            <right3 />
          </dv-border-box-12>
          <dv-border-box-12>
            <right4 />
          </dv-border-box-12>
        </div>
      </div>
    </dv-full-screen-container>
  </div>
</template>

<script setup>
import topHeader from './topHeader.vue'
import left1 from './left1.vue'
import left12 from './left12.vue'
import left2 from './left2.vue'
import left22 from './left22.vue'
import left23 from './left23.vue'
import right1 from './right1.vue'
import right2 from './right2.vue'
import right3 from './right3.vue'
import right4 from './right4.vue'
import middle1 from './middle1.vue'
import middle2 from './middle2.vue'
import middle3 from './middle3.vue'

defineOptions({
  name: 'MainScreenMonitor',
  components: {
    topHeader,
    left1,
    left12,
    left2,
    left22,
    left23,
    right1,
    right2,
    right3,
    right4,
    middle1,
    middle2,
    middle3
  }
})
</script>

<style lang="less">
#data-view {
  width: 100%;
  height: 100%;
  background-color: #030409;
  color: #fff;

  #dv-full-screen-container {
    background-image: url('./img/bg.png');
    background-size: 100% 100%;
    box-shadow: 0 0 3px blue;
    display: flex;
    flex-direction: column;
  }

  .main-container {
    height: 100%;
    padding: 5px;
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
  }
}
</style>
