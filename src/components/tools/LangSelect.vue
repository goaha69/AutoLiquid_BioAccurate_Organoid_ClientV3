<template>
  <a-dropdown placement="bottomRight">
    <global-outlined style="font-size: 16px"></global>
    <template #overlay>
      <a-menu class="menu" :selectedKeys="[currentLang]" @click="changeLocale">
        <a-menu-item key="zh-CN">
          <span role="img" aria-label="简体中:>🇨🇳</span>
          简体中:        </a-menu-item>
        <a-menu-item key="zh-TW">
          <span role="img" aria-label="繁体中文">🇭🇰</span>
          繁体中文
        </a-menu-item>
        <a-menu-item key="en-US">
          <span role="img" aria-label="English">🇺🇸</span>
          English
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script>
// import { mixin as langMixin } from '@/store/i18n-mixin'
import { GlobalOutlined } from '@ant-design/icons-vue'

export default {
  name: 'LangSelect',
  // mixins: [langMixin],
  components: {
    GlobalOutlined
  },
  data () {
    return {}
  },
  methods: {
    // SwitchLang (row) {
    //   this.setLang(row.key)
    // }
  }
}
</script>
