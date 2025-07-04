<template>
  <a-tooltip v-if="tooltip && fullLength > length" :title="fullStr">
    <span>{{ displayText }}</span>
  </a-tooltip>
  <span v-else>{{ displayText }}</span>
</template>

<script>
import { cutStrByFullLength, getStrFullLength } from '@/components/_util/util'
/*
    const isSupportLineClamp = document.body.style.webkitLineClamp !== undefined;

    const TooltipOverlayStyle = {
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
    };
  */

export default {
  name: 'Ellipsis',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-ellipsis'
    },
    tooltip: {
      type: Boolean
    },
    length: {
      type: Number,
      required: true
    },
    lines: {
      type: Number,
      default: 1
    },
    fullWidthRecognition: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    fullStr() {
      // 在Vue 3中,$slots.default是一个函数
      if (!this.$slots.default) {
        return ''
      }
      const slots = this.$slots.default() || []
      return slots.map(vNode => {
        if (!vNode) return ''
        if (typeof vNode.children === 'string') {
          return vNode.children
        }
        if (vNode.props && vNode.props.children) {
          return vNode.props.children
        }
        if (vNode.children && Array.isArray(vNode.children)) {
          return vNode.children.map(child => 
            typeof child === 'string' ? child : (child.children || '')
          ).join('')
        }
        return vNode.children || ''
      }).join('')
    },
    fullLength() {
      return getStrFullLength(this.fullStr)
    },
    displayText() {
      return cutStrByFullLength(this.fullStr, this.length) + (this.fullLength > this.length ? '...' : '')
    }
  }
}
</script>
