<template>
  <div :class="mode === 'pop' ? 'mask' : ''" v-show="showBox">
    <div :class="mode === 'pop' ? 'verifybox' : ''" :style="{ maxWidth: parseInt(imgSize.width) + 30 + 'px' }">
      <div class="verifybox-top" v-if="mode === 'pop'">
        请完成安全验证
        <span @click="closeBox" class="verifybox-close">
          <i class="iconfont icon-close"></i>
        </span>
      </div>
      <div :style="{ padding: mode === 'pop' ? '15px' : '0' }" class="verifybox-bottom">
        <!-- 验证码容器 -->
        <component
          v-if="componentType"
          :is="componentType"
          :arith="arith"
          :barSize="barSize"
          :blockSize="blockSize"
          :captchaType="captchaType"
          :explain="explain"
          :figure="figure"
          :imgSize="imgSize"
          :mode="mode"
          :type="verifyType"
          :vSpace="vSpace"
          ref="instance"
        />
      </div>
    </div>
  </div>
</template>

<script>
import VerifySlide from './Verify/VerifySlide'
import VerifyPoints from './Verify/VerifyPoints'

export default {
  name: 'Verify',
  components: {
    VerifySlide,
    VerifyPoints
  },
  props: {
    locale: {
      type: String,
      default() {
        return navigator.language || navigator.browserLanguage || 'en-US'
      }
    },
    captchaType: {
      type: String,
      required: true
    },
    figure: {
      type: Number
    },
    arith: {
      type: Number
    },
    mode: {
      type: String,
      default: 'pop'
    },
    vSpace: {
      type: Number
    },
    explain: {
      type: String
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
    blockSize: {
      type: Object
    },
    barSize: {
      type: Object
    }
  },
  data() {
    return {
      clickShow: false,
      verifyType: undefined,
      componentType: undefined
    }
  },
  computed: {
    instance() {
      return this.$refs.instance || {}
    },
    showBox() {
      if (this.mode === 'pop') {
        return this.clickShow
      } else {
        return true
      }
    }
  },
  watch: {
    captchaType: {
      immediate: true,
      handler(captchaType) {
        switch (captchaType.toString()) {
          case 'blockPuzzle':
            this.verifyType = '2'
            this.componentType = 'VerifySlide'
            break
          case 'clickWord':
            this.verifyType = ''
            this.componentType = 'VerifyPoints'
            break
        }
      }
    }
  },
  methods: {
    i18n(text) {
      if (this.$t) {
        return this.$t(text)
      } else {
        const i18n = this.$options.i18n?.messages?.[this.locale] || this.$options.i18n?.messages?.['en-US'] || {}
        return i18n[text] || text
      }
    },
    refresh() {
      if (this.instance.refresh) {
        this.instance.refresh()
      }
    },
    closeBox() {
      this.clickShow = false
      this.refresh()
    },
    show() {
      if (this.mode === 'pop') {
        this.clickShow = true
      }
    }
  }
}
</script>

<style scoped>
.verifybox {
  position: relative;
  box-sizing: border-box;
  border-radius: 2px;
  border: 1px solid #e4e7eb;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.verifybox-top {
  padding: 0 15px;
  height: 50px;
  line-height: 50px;
  text-align: left;
  font-size: 16px;
  color: #45494c;
  border-bottom: 1px solid #e4e7eb;
  box-sizing: border-box;
}

.verifybox-bottom {
  padding: 15px;
  box-sizing: border-box;
}

.verifybox-close {
  position: absolute;
  top: 13px;
  right: 9px;
  width: 24px;
  height: 24px;
  text-align: center;
  cursor: pointer;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.5s;
}

.verify-tips {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 30px;
  line-height: 30px;
  color: #fff;
}

.suc-bg {
  background-color: rgba(92, 184, 92, 0.5);
}

.err-bg {
  background-color: rgba(217, 83, 79, 0.5);
}

.tips-enter,
.tips-leave-to {
  bottom: -30px;
}

.tips-enter-active,
.tips-leave-active {
  transition: bottom 0.5s;
}

/* 常规验证 */
.verify-code {
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 5px;
  border: 1px solid #ddd;
}

.cerify-code-panel {
  height: 100%;
  overflow: hidden;
}

.verify-code-area {
  float: left;
}

.verify-input-area {
  float: left;
  width: 60%;
  padding-right: 10px;
}

.verify-change-area {
  line-height: 30px;
  float: left;
}

.varify-input-code {
  display: inline-block;
  width: 100%;
  height: 25px;
}

.verify-change-code {
  color: #337AB7;
  cursor: pointer;
}

.verify-btn {
  width: 200px;
  height: 30px;
  background-color: #337AB7;
  color: #FFFFFF;
  border: none;
  margin-top: 10px;
}

/* 滑动验证 */
.verify-bar-area {
  position: relative;
  background: #FFFFFF;
  text-align: center;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  border: 1px solid #ddd;
  -webkit-border-radius: 4px;
}

.verify-bar-area .verify-move-block {
  position: absolute;
  top: 0px;
  left: 0;
  background: #fff;
  cursor: pointer;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  box-shadow: 0 0 2px #888888;
  -webkit-border-radius: 1px;
}

.verify-bar-area .verify-move-block:hover {
  background-color: #337ab7;
  color: #FFFFFF;
}

.verify-bar-area .verify-left-bar {
  position: absolute;
  top: -1px;
  left: -1px;
  background: #f0fff0;
  cursor: pointer;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  border: 1px solid #ddd;
}

.verify-img-panel {
  margin: 0;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-radius: 3px;
  position: relative;
}

.verify-img-panel .verify-refresh {
  width: 25px;
  height: 25px;
  text-align: center;
  padding: 5px;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}

.verify-img-panel .icon-refresh {
  font-size: 20px;
  color: #fff;
}

.verify-img-panel .verify-gap {
  background-color: #fff;
  position: relative;
  z-index: 2;
  border: 1px solid #fff;
}
</style> 