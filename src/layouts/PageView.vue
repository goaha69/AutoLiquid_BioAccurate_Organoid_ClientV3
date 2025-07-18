<template>
  <div :style="!$route.meta.hiddenHeaderContent ? 'margin: -24px -24px 0px;' : null">
    <!-- pageHeader , route meta :true on hide -->
    <page-header v-if="!$route.meta.hiddenHeaderContent" :title="pageTitle" :logo="logo" :avatar="avatar">
      <template #action>
        <slot name="action"></slot>
      </template>
      <template #content>
        <slot name="headerContent"></slot>
        <div v-if="!$slots.headerContent && description">
          <p style="font-size: 14px;color: rgba(0,0,0,.65)">{{ description }}</p>
          <div class="link">
          </div>
        </div>
      </template>
      <template #extra>
        <slot name="extra">
          <div class="extra-img">
            <img v-if="typeof extraImage !== 'undefined'" :src="extraImage"/>
          </div>
        </slot>
      </template>
      <template #pageMenu>
        <div class="page-menu-search" v-if="search">
          <a-input-search
            style="width: 80%; max-width: 522px;"
            placeholder="请输:.."
            size="large"
            enter-button="搜索"
          />
        </div>
        <div class="page-menu-tabs" v-if="tabs && tabs.items">
          <!-- @change="callback" :activeKey="activeKey" -->
          <a-tabs :tab-bar-style="{margin: 0}" :active-key="tabs.active()" @change="tabs.callback">
            <a-tab-pane v-for="item in tabs.items" :tab="item.title" :key="item.key"></a-tab-pane>
          </a-tabs>
        </div>
      </template>
    </page-header>
    <div class="content">
      <div class="page-header-index-wide">
        <slot>
          <!-- Vue 3兼容的router-view实现（优化版） -->
          <router-view v-slot="{ Component }">
            <transition name="page-transition" mode="out-in">
              <keep-alive v-if="keepAliveEnabled">
                <component :is="Component" ref="content" :key="$route.fullPath" />
              </keep-alive>
              <component v-else :is="Component" ref="content" style="margin: -12px -14px 0;" :key="$route.fullPath" />
            </transition>
          </router-view>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PageHeader from '@/components/PageHeader'

export default {
  name: 'PageView',
  components: {
    PageHeader
  },
  props: {
    avatar: {
      type: String,
      default: null
    },
    title: {
      type: [String, Boolean],
      default: true
    },
    logo: {
      type: String,
      default: null
    },
    directTabs: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageTitle: null,
      description: null,
      linkList: [],
      extraImage: '',
      search: false,
      tabs: {}
    }
  },
  computed: {
    ...mapState({
      multiTab: state => state.app.multiTab,
      routeExclude: state => state.permission.routeExclude
    }),
    keepAliveEnabled() {
      const meta = this.$route.meta || {}
      return this.multiTab || meta.keepAlive
    }
  },
  mounted () {
    this.tabs = this.directTabs
    this.getPageMeta()
  },
  updated () {
    this.getPageMeta()
  },
  methods: {
    getPageMeta () {
      // eslint-disable-next-line
      //文字样式//(typeof(this.title) === 'string' || !this.title)  this.title : this.$route.meta.title
      // 为了简洁改为无
      this.pageTitle = ''

      const content = this.$refs.content
      if (content) {
        if (content.pageMeta) {
          Object.assign(this, content.pageMeta)
        } else {
          this.description = content.description
          this.linkList = content.linkList
          this.extraImage = content.extraImage
          this.search = content.search === true
          this.tabs = content.tabs
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .content {
    margin: 24px 24px 0;
    .link {
      margin-top: 16px;
      &:not(:empty) {
        margin-bottom: 16px;
      }
      a {
        margin-right: 32px;
        height: 24px;
        line-height: 24px;
        display: inline-block;
        i {
          font-size: 24px;
          margin-right: 8px;
          vertical-align: middle;
        }
        span {
          height: 24px;
          line-height: 24px;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  .page-menu-search {
    text-align: center;
    margin-bottom: 16px;
  }
  .page-menu-tabs {
    margin-top: 48px;
  }

  .extra-img {
    margin-top: -60px;
    text-align: center;
    width: 195px;

    img {
      width: 100%;
    }
  }

  .mobile {
    .extra-img{
      margin-top: 0;
      text-align: center;
      width: 96px;

      img{
        width: 100%;
      }
    }
  }
</style>
