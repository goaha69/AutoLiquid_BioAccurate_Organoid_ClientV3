<template>
  <div id="middle2">
    <dv-flyline-chart-enhanced  config="config" : dev="true" ></dv>
  </div>
</template>

<script>
  export default {
    name: 'Middle2',
    data() {
      return {
        config: {
          points: [{
              name: '运城',
              coordinate: [0.43, 0.66],
              halo: {
                show: true
              },
              icon: {
                src: require('./img/mapCenterPoint.png'),
                width: 30,
                height: 30
              },
              text: {
                // show: false
              }
            },
            {
              name: '平陆',
              coordinate: [0.53, 0.80]
            },
            {
              name: '芮城',
              coordinate: [0.27, 0.91]
            },
            {
              name: '永济',
              coordinate: [0.14, 0.77]
            },
            {
              name: '临猗',
              coordinate: [0.31, 0.54]
            },
            {
              name: '夏县',
              coordinate: [0.55, 0.54]
            },
            {
              name: '垣曲',
              coordinate: [0.78, 0.42]
            },
            {
              name: '闻喜',
              coordinate: [0.55, 0.37]
            },
            {
              name: '万荣',
              coordinate: [0.35, 0.33]
            },
            {
              name: '绛县',
              coordinate: [0.73, 0.26]
            },
            {
              name: '新绛',
              coordinate: [0.55, 0.17]
            },
            {
              name: '稷山',
              coordinate: [0.43, 0.17]
            },
            {
              name: '河津',
              coordinate: [0.28, 0.18]
            }
          ],
          lines: [{
              source: '平陆',
              target: '运城'
            },
            {
              source: '芮城',
              target: '运城'
            },
            {
              source: '永济',
              target: '运城'
            },
            {
              source: '临猗',
              target: '运城'
            },
            {
              source: '夏县',
              target: '运城'
            },
            {
              source: '垣曲',
              target: '运城'
            },
            {
              source: '闻喜',
              target: '运城'
            },
            {
              source: '万荣',
              target: '运城'
            },
            {
              source: '绛县',
              target: '运城'
            },
            {
              source: '新绛',
              target: '运城'
            },
            {
              source: '稷山',
              target: '运城'
            },
            {
              source: '河津',
              target: '运城'
            }
          ],
          icon: {
            show: true,
            src: require('./img/mapPoint.png')
          },
          text: {
            show: true
          },
          bgImgSrc: require('./img/map2.png')
        }
      }
    }
  }
</script>

<style lang="less">
  #middle2 {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(6, 30, 93, 0.5);

    .dv-flyline-chart-enhanced {
      width: 100%;
      height: 100%;
      // position: absolute;
      // top: 5px;
      // right: 5px;
      // bottom: 5px;
      // left: 5px;
    }
  }
</style>
