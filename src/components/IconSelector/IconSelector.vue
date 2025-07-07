<template>
  <div>
    <a-input
      @click="showModal"
      :placeholder="placeholder"
      :value="icon"
      readonly>
      <template #addonAfter>
        <component :is="getIconComponent(icon)" v-if="icon" :style="{ fontSize: '16px' }" />
        <question-circle-outlined v-else :style="{ fontSize: '16px' }" />
      </template>
    </a-input>
    
    <a-modal v-model:open="visible" title="选择图标" @ok="handleOk" @cancel="handleCancel" width="80%">
      <div class="icon-selector">
        <div class="icon-list">
          <div 
            v-for="iconName in iconList" 
            :key="iconName"
            class="icon-item"
            :class="{ active: iconName === selectedIcon }"
            @click="selectIcon(iconName)">
            <component :is="getIconComponent(iconName)" :style="{ fontSize: '24px' }" />
            <div class="icon-name">{{ iconName }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { getIconComponent } from '@/utils/iconUtil'

defineOptions({
  name: 'IconSelector'
})

const props = defineProps({
  prefixCls: {
    type: String,
    default: 'ant-pro-icon-selector'
  },
  modelValue: {
    type: String
  }
})

const emit = defineEmits(['change'])

const selectedIcon = ref(props.modelValue || '')
const currentTab = ref('directional')
const icons = ref([])
const visible = ref(false)
const placeholder = ref('请选择图标')
const icon = ref(props.modelValue || '')
const iconList = ref([])

watch(() => props.modelValue, (val) => {
  selectedIcon.value = val
  autoSwitchTab()
})

const showModal = () => {
  visible.value = true
}

const handleOk = () => {
  selectedIcon.value = selectedIcon.value
  emit('change', selectedIcon.value)
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
}

const selectIcon = (iconName) => {
  selectedIcon.value = iconName
  visible.value = false
}

const autoSwitchTab = () => {
  icons.value.some(item => item.icons.some(icon => icon === props.modelValue) && (currentTab.value = item.key))
}

onMounted(() => {
  if (props.modelValue) {
    autoSwitchTab()
  }
})
</script>

<style lang="less" scoped>
  @import "../index.less";

  ul{
    list-style: none;
    padding: 0;
    overflow-y: scroll;
    height: 250px;

    li{
      display: inline-block;
      padding: @padding-sm;
      margin: 3px 0;
      border-radius: @border-radius-base;

      &:hover, &.active{
        // box-shadow: 0px 0px 5px 2px @primary-color;
        cursor: pointer;
        color: white;
        background-color: @primary-color;
      }
    }
  }
</style>
