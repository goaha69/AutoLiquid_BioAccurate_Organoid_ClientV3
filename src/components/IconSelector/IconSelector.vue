<template>
  <div>
    <a-input
      @click="showModal"
      :placeholder="placeholder"
      :value="icon"
      readonly>
      <template #addonAfter>
        <component :is="getIconComponent(icon)" v-if="icon" :style="{ fontSize: '16px' }" ></component>
        <question-circle-outlined v-else :style="{ fontSize: '16px' }" ></question>
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
            <component :is="getIconComponent(iconName)" :style="{ fontSize: '24px' }" ></component>
            <div class="icon-name">{{ iconName }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { getIconComponent } from '@/utils/iconUtil'

export default {
  name: 'IconSelector',
  components: {
    QuestionCircleOutlined
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-icon-selector'
    },
    // eslint-disable-next-line
    modelValue: {
      type: String
    }
  },
  data () {
    return {
      selectedIcon: this.modelValue || '',
      currentTab: 'directional',
      icons: [],
      visible: false,
      placeholder: '请选择图标',
      icon: this.modelValue || '',
      iconList: []
    }
  },
  watch: {
    modelValue(val) {
      this.selectedIcon = val
      this.autoSwitchTab()
    }
  },
  created () {
    if (this.modelValue) {
      this.autoSwitchTab()
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleOk() {
      this.selectedIcon = this.selectedIcon
      this.$emit('change', this.selectedIcon)
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
    selectIcon(iconName) {
      this.selectedIcon = iconName
      this.visible = false
    },
    autoSwitchTab() {
      this.icons.some(item => item.icons.some(icon => icon === this.modelValue) && (this.currentTab = item.key))
    },
    getIconComponent(iconName) {
      return getIconComponent(iconName)
    }
  }
}
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
        color: @white;
        background-color: @primary-color;
      }
    }
  }
</style>
