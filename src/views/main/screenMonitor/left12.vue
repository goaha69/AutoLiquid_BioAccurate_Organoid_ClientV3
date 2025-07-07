<template>
  <div id="left12">
    <div class="ranking-board-title">
      机构评估等级
      <dv-decoration-6 style="width: 200px;height: 20px;" />
    </div>
    <dv-scroll-ranking-board class="board" :config="config" />
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineOptions({
  name: 'Left12'
})

const config = reactive({
  data: [
    {
      name: 'XXX养老院',
      value: 5
    },
    {
      name: 'XXX老年公寓',
      value: 4
    },
    {
      name: 'XXX护理院',
      value: 5
    },
    {
      name: 'XXX康养中心',
      value: 3
    },
    {
      name: 'XXX老年服务中心',
      value: 4
    },
    {
      name: 'XXX颐养院',
      value: 5
    },
    {
      name: 'XXX敬老院',
      value: 3
    },
    {
      name: 'XXX老年之家',
      value: 4
    },
    {
      name: 'XXX养护院',
      value: 5
    }
  ],
  rowNum: 9
})
</script>

<style lang="less">
#left12 {
  width: 100%;
  box-shadow: 0 0 3px blue;
  display: flex;
  flex-direction: column;
  background-color: rgba(6, 30, 93, 0.5);
  border-top: 2px solid rgba(1, 153, 209, .5);
  box-sizing: border-box;
  padding: 0px 30px;

  .ranking-board-title {
    font-weight: bold;
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 20px;
  }

  .board {
    flex: 1;
  }
}
</style>
