<template>
  <a-list item-layout="horizontal">
    <a-list-item>
      <a-list-item-meta>
        <template #title>
          <a>风格配色</a>
        </template>
        <template #description>
          <span>整体风格配色设置</span>
        </template>
      </a-list-item-meta>
      <template #actions>
        <div>
          <a-switch 
            checked-children="暗色" 
            un-checked-children="白色" 
            :default-checked="navTheme === 'dark'" 
            @change="onChange" 
          />
        </div>
      </template>
    </a-list-item>
    <a-list-item>
      <a-list-item-meta>
        <template #title>
          <a>主题</a>
        </template>
        <template #description>
          <span>
            页面风格配色: <span v-html="colorFilter(primaryColor)"></span>
          </span>
        </template>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { colorList } from '@/components/SettingDrawer/settingConfig'

const store = useStore()

const navTheme = computed(() => store.state.app.theme)
const primaryColor = computed(() => store.state.app.primaryColor)

const colorFilter = (color) => {
  const c = colorList.find(o => o.color === color)
  return c && c.key
}

const onChange = (checked) => {
  if (checked) {
    store.dispatch('ToggleTheme', 'dark')
  } else {
    store.dispatch('ToggleTheme', 'light')
  }
}
</script>

<style scoped>
</style>
