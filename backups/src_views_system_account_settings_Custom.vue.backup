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
          ></a>
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
            页面风格配色::<a v-html="colorFilter(primaryColor)"></a>
          </span>
        </template>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script>
import { colorList } from '@/components/SettingDrawer/settingConfig'
import { mixin } from '@/utils/mixin'

export default {
  mixins: [mixin],
  data () {
    return {
    }
  },
  filters: {
    themeFilter (theme) {
      const themeMap = {
        'dark': '暗色',
        'light': '白色'
      }
      return themeMap[theme]
    }
  },
  methods: {
    colorFilter (color) {
      const c = colorList.find(o => o.color === color)
      return c && c.key
    },

    onChange (checked) {
      if (checked) {
        this.$store.dispatch('ToggleTheme', 'dark')
      } else {
        this.$store.dispatch('ToggleTheme', 'light')
      }
    }
  }
}
</script>

<style scoped>
</style>
