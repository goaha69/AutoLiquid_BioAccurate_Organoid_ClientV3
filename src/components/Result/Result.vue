<template>
  <div class="result">
    <check-circle-outlined v-if="localIsSuccess" :class="{ 'icon': true, [`${type}`]: true }" />
    <close-circle-outlined v-else :class="{ 'icon': true, [`${type}`]: true }" />
    <div class="title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="description">
      <slot name="description">{{ description }}</slot>
    </div>
    <div class="extra">
      <slot name="extra"></slot>
    </div>
    <div class="action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'

defineOptions({
  name: 'Result'
})

const props = defineProps({
  /** @Deprecated */
  isSuccess: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'success',
    validator (val) {
      return ['success', 'error'].includes(val)
    }
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})

const localIsSuccess = computed(() => {
  return props.type === 'success'
})
</script>

<style lang="less" scoped>
  .result {
    text-align: center;
    width: 72%;
    margin: 0 auto;
    padding: 24px 0 8px;

    .icon {
      font-size: 72px;
      line-height: 72px;
      margin-bottom: 24px;
    }
    .success {
      color: #52c41a;
    }
    .error {
      color: red;
    }
    .title {
      font-size: 24px;
      color: rgba(0, 0, 0, .85);
      font-weight: 500;
      line-height: 32px;
      margin-bottom: 16px;
    }
    .description {
      font-size: 14px;
      line-height: 22px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 24px;
    }
    .extra {
      background: #fafafa;
      padding: 24px 40px;
      border-radius: 2px;
      text-align: left;
    }
    .action {
      margin-top: 32px;
    }
  }

  .mobile {
    .result {
      width: 100%;
      margin: 0 auto;
      padding: unset;
    }
  }
</style>
