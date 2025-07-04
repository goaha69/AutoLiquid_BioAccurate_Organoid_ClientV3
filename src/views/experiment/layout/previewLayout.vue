<template>
  <a-modal :title="layoutTitle" :width="currentLayout.xSize" :height="currentLayout.ySize+80" :open="visible" :maskClosable="false" @cancel="handleCancel">
    <canvas ref="canvas" :width="currentLayout.xSize" :height="currentLayout.ySize"></canvas>
  </a-modal>
</template>
<script>
  import {STable, Ellipsis,XCard} from '@/components'
  import {exp_layout_getShippingSpaces} from '@/api/modular/experiment/layoutManage'   
  export default {
    components: {
      XCard,
      STable,
      Ellipsis,
    },
    data() {
      return {
        visible: false,
        shippingSpaces:[],
        layoutTitle:'',
        currentLayout:{name:'',xSize:1800,ySize:800},
      }
    },
    created() {

    },
    methods: {
      preview(record){
        console.log(record)
        this.currentLayout=record
        this.layoutTitle=record.name+' -- 舱位布局'
        var dd={id:record.id}
        console.log('==============exp_layoutGetShippingSpaces===============')
        exp_layout_getShippingSpaces(dd).then((res) => {
          if (res.success) {
            this.shippingSpaces=res.data
            const canvas = this.$refs.canvas;  
            console.log(canvas)
            // const canvas = document.getElementById('canvas')

          const ctx = canvas.getContext('2d');   
            ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height); // 清除画布
   
          this.shippingSpaces.forEach((rect,index) => {  
              // 绘制白色背景
  
            ctx.fillStyle = 'white';  
              ctx.fillRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);  
        
              // 绘制蓝色边框
  
            ctx.strokeStyle = 'blue';  
              ctx.lineWidth = 2; // 边框宽度
  
            ctx.strokeRect(rect.xOffset, rect.yOffset, rect.xSize, rect.ySize);  
        
              // 计算文本位置(居中)
  
            const textX = rect.xOffset + rect.xSize / 2;  
              const textY = rect.yOffset + rect.ySize / 2 + 5; // 稍微向下偏移一点以避免与边框重 
        
              // 绘制文本
  
            ctx.fillStyle = 'black'; // 文本颜色  
              ctx.textAlign = 'center'; // 文本居中
  
            ctx.textBaseline = 'middle'; // 文本基线为中 
              ctx.font="16px arial";
              const name = rect.name ? rect.name : '舱位'+(index+1);
              ctx.fillText(name, textX, textY);  
            });          
          }
        })                      
      },
      handleCancel () {
        this.visible = false
      }
    }
  }
</script>
<style scoped>

  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }

</style>

