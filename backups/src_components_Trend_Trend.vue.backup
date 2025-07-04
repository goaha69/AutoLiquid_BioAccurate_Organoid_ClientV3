<template>
  <div :class="[prefixCls, reverseColor && 'reverse-color' ]">
    <span>
      <slot name="term"></slot>
      <span class="item-text">
        <slot></slot>
      </span>
    </span>
    <span :class="[flag]">
      <caret-up-outlined v-if="flag === 'up'" ></caret>
      <caret-down-outlined v-else-if="flag === 'down'" ></caret>
    </span>
  </div>
</template>

<script>
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Trend',
  components: {
    CaretUpOutlined,
    CaretDownOutlined
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-trend'
    },
    /**
       * 上升下降标识:up|down
       */
    flag: {
      type: String,
      required: true
    },
    /**
       * 颜色反转
       */
    reverseColor: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="less" scoped>
  @import "index";
</style>
