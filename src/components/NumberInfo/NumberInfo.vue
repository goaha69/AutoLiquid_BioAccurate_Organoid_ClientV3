<template>
  <div :class="[prefixCls]">
    <slot name="subtitle">
      <div :class="[`${prefixCls}-subtitle`]">{{ typeof subTitle === 'string' ? subTitle : subTitle() }}</div>
    </slot>
    <div class="number-info-value">
      <span>{{ total }}</span>
      <span class="sub-total">
        {{ subTotal }}
        <icon :type="`caret-${status}`" />
      </span>
    </div>
  </div>
</template>

<script setup>
import Icon from 'ant-design-vue/es/icon'

defineOptions({
  name: 'NumberInfo'
})

const props = defineProps({
  prefixCls: {
    type: String,
    default: 'ant-pro-number-info'
  },
  total: {
    type: Number,
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },
  subTitle: {
    type: [String, Function],
    default: ''
  },
  status: {
    type: String,
    default: 'up'
  }
})
</script>

<style lang="less" scoped>
  // @import "index";
</style>
