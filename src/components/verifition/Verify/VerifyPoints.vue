<template>
  <div style="position: relative;">
    <div class="verify-img-out" :style="{height: (parseInt(setSize.imgHeight) + vSpace) + 'px'}">
      <div class="verify-img-panel" :style="{width: setSize.imgWidth, height: setSize.imgHeight}">
        <img :src="'data:image/png;base64,' + pointBackImgBase" alt="" style="width: 100%; height: 100%; display: block;">
        <div class="verify-refresh" @click="refresh" v-show="showRefresh">
          <i class="iconfont icon-refresh"></i>
        </div>
        <canvas
          ref="canvas"
          :width="parseInt(setSize.imgWidth)"
          :height="parseInt(setSize.imgHeight)"
          @click="bindingClick ? canvasClick($event) : undefined"
          style="position: absolute; top: 0; left: 0; z-index: 3; cursor: pointer;"
        ></canvas>
        <div
          v-for="(tempPoint, index) in tempPoints"
          :key="index"
          :style="{
            position: 'absolute',
            top: (tempPoint.y - 10) + 'px',
            left: (tempPoint.x - 10) + 'px',
            width: '20px',
            height: '20px',
            background: '#1abd6c',
            color: '#fff',
            'border-radius': '50%',
            'text-align': 'center',
            'line-height': '20px',
            'font-size': '12px',
            'z-index': 4
          }"
          class="point-area"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>
    <!-- 公共部分 -->
    <div
      class="verify-bar-area"
      :style="{
        width: setSize.imgWidth,
        height: barSize.height,
        'line-height': barSize.height,
        'background-color': barAreaColor,
        'border-color': barAreaBorderColor
      }"
    >
      <span class="verify-msg" v-text="text"></span>
    </div>
  </div>
</template>

<script>
import { aesEncrypt } from './../utils/ase'
import { resetSize } from './../utils/util'
import { reqGet, reqCheck } from '@/api/modular/system/loginManage'

export default {
    name: 'VerifyPoints',
    props: {
        // 弹出式pop,固定fixed
        mode: {
            type: String,
            default: 'fixed'
        },
        // eslint-disable-next-line vue/require-default-prop
        captchaType: {
            type: String
        },
        // 间隔
        vSpace: {
            type: Number,
            default: 5
        },
        imgSize: {
            type: Object,
            default() {
                return {
                    width: '310px',
                    height: '155px'
                }
            }
        },
        barSize: {
            type: Object,
            default() {
                return {
                    width: '310px',
                    height: '40px'
                }
            }
        }
    },
    data() {
        return {
            secretKey: '', // 后端返回的ase加密秘钥
            checkNum: 3, // 默认需要点击的字数
            fontPos: [], // 选中的坐标信息
            checkPosArr: [], // 用户点击的坐标
            num: 1, // 点击的记录
            pointBackImgBase: '', // 后端获取到的背景图片
            poinTextList: [], // 后端返回的点击字体顺序
            backToken: '', // 后端返回的token
            setSize: {
                imgHeight: 0,
                imgWidth: 0,
                barHeight: 0,
                barWidth: 0
            },
            tempPoints: [],
            text: '',
            barAreaColor: undefined,
            barAreaBorderColor: undefined,
            showRefresh: true,
            bindingClick: true
        }
    },
    computed: {
        resetSize() {
            return resetSize
        }
    },
    methods: {
        init() {
            // 加载页面
            this.fontPos.splice(0, this.fontPos.length)
            this.checkPosArr.splice(0, this.checkPosArr.length)
            this.num = 1
            this.getPictrue()
            this.$nextTick(() => {
                this.setSize = this.resetSize(this) // 重新设置宽度高度
                this.$parent.$emit('ready', this)
            })
        },
        canvasClick(e) {
            this.checkPosArr.push(this.getMousePos(this.$refs.canvas, e))
            /**
             * eslint-disable-next-line eqeqeq
             */
            if (this.num == this.checkNum) {
                this.num = this.createPoint(this.getMousePos(this.$refs.canvas, e))
                // 按比例转换坐标
                this.checkPosArr = this.pointTransfrom(this.checkPosArr, this.setSize)
                // 等创建坐标执行完
                setTimeout(() => {
                    // var flag = this.comparePos(this.fontPos, this.checkPosArr);
                    // 发送后端请求
                    var captchaVerification = this.secretKey ? aesEncrypt(this.backToken + '---' + JSON.stringify(this.checkPosArr), this.secretKey) : this.backToken + '---' + JSON.stringify(this.checkPosArr)
                    const data = {
                        captchaType: this.captchaType,
                        'pointJson': this.secretKey ? aesEncrypt(JSON.stringify(this.checkPosArr), this.secretKey) : JSON.stringify(this.checkPosArr),
                        'token': this.backToken
                    }
                    reqCheck(data).then(res => {
                        /**
                         * eslint-disable-next-line eqeqeq
                         */
                        if (res.repCode == '0000') {
                            this.barAreaColor = '#4cae4c'
                            this.barAreaBorderColor = '#5cb85c'
                            this.text = '验证成功'
                            this.bindingClick = false
                            /**
                             * eslint-disable-next-line eqeqeq
                             */
                            if (this.mode == 'pop') {
                                setTimeout(() => {
                                    this.$parent.clickShow = false
                                    this.refresh()
                                }, 1500)
                            }
                            this.$parent.$emit('success', { captchaVerification })
                        } else {
                            this.$parent.$emit('error', this)
                            this.barAreaColor = '#d9534f'
                            this.barAreaBorderColor = '#d9534f'
                            this.text = '验证失败'
                            setTimeout(() => {
                                this.refresh()
                            }, 700)
                        }
                    })
                }, 400)
            }
            if (this.num < this.checkNum) {
                this.num = this.createPoint(this.getMousePos(this.$refs.canvas, e))
            }
        },

        // 获取坐标
        getMousePos: function (obj, e) {
            var x = e.offsetX
            var y = e.offsetY
            return { x, y }
        },
        // 创建坐标
        createPoint: function (pos) {
            this.tempPoints.push(Object.assign({}, pos))
            return ++this.num
        },
        refresh: function () {
            this.tempPoints.splice(0, this.tempPoints.length)
            this.barAreaColor = '#000'
            this.barAreaBorderColor = '#ddd'
            this.bindingClick = true
            this.fontPos.splice(0, this.fontPos.length)
            this.checkPosArr.splice(0, this.checkPosArr.length)
            this.num = 1
            this.getPictrue()
            this.text = '验证失败'
            this.showRefresh = true
        },

        /**
         * 请求背景图片和验证图
         */
        getPictrue() {
            // const data = {
            //     captchaType: this.captchaType
            // }
            // reqGet(data).then(res => {
            //     // eslint-disable-next-line eqeqeq
            //     if (res.repCode == '0000') {
            //         this.pointBackImgBase = res.repData.originalImageBase64
            //         this.backToken = res.repData.token
            //         this.secretKey = res.repData.secretKey
            //         this.poinTextList = res.repData.wordList
            //         this.text = '请依次点击' + this.poinTextList.join(',')
            //     } else {
            //         this.text = res.repMsg
            //     }
            // })
        },
        /**
         * 坐标转换函数
         */
        pointTransfrom(pointArr, imgSize) {
            var newPointArr = pointArr.map(p => {
                const x = Math.round(310 * p.x / parseInt(imgSize.imgWidth))
                const y = Math.round(155 * p.y / parseInt(imgSize.imgHeight))
                return { x, y }
            })
            // console.log(newPointArr,"newPointArr");
            return newPointArr
        }
    },
    watch: {
        // type变化则全面刷新
        type: {
            immediate: true,
            handler() {
                this.init()
            }
        }
    },
    mounted() {
        // 禁止拖拽
        this.$el.onselectstart = function () {
            return false
        }
    }
}
</script>

<style scoped>
.verify-img-out {
    position: relative;
    overflow: hidden;
}

.verify-img-panel {
    position: relative;
    border: 1px solid #e4e7eb;
    border-radius: 2px;
}

.verify-refresh {
    position: absolute;
    right: 5px;
    top: 5px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.verify-bar-area {
    position: relative;
    background: #f7f9fa;
    text-align: center;
    border: 1px solid #e4e7eb;
    border-radius: 2px;
}

.verify-msg {
    font-size: 14px;
    color: #45494c;
}

.point-area {
    border: 1px solid #fff;
}
</style>
