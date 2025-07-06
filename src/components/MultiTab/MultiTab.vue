<template>
  <div class="ant-pro-multi-tab">
    <div class="ant-pro-multi-tab-wrapper">
      <a-tabs
        v-model:activeKey="activeKey"
        hide-add
        type="editable-card"
        :tab-bar-style="{ background: '#FFF', margin: 0, paddingLeft: '16px', paddingTop: '1px' }"
        @edit="onEdit"
      >
        <a-tab-pane
          v-for="page in pages"
          :key="page.fullPath"
          :closable="pages.length > 1"
        >
          <template #tab>
            <a-dropdown :trigger="['contextmenu']">
              <span style="user-select: none">
                {{ getPageTitle(page) }}
              </span>
              <template #overlay>
                <a-menu @click="({ key }) => closeMenuClick(key, page.fullPath)">
                  <a-menu-item key="closeThat">关闭当前标签</a-menu-item>
                  <a-menu-item key="closeRight">关闭右侧</a-menu-item>
                  <a-menu-item key="closeLeft">关闭左侧</a-menu-item>
                  <a-menu-item key="closeAll">关闭全部</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import events from './events'

export default {
  name: 'MultiTab',
  data() {
    return {
      fullPathList: [],
      pages: [],
      activeKey: '',
      newTabIndex: 0
    }
  },
  created() {
    // 绑定事件监听器，参考V2实现
    events.$on('open', val => {
      if (!val) {
        throw new Error(`multi-tab: open tab ${val} err`)
      }
      this.activeKey = val
    })

    events.$on('close', val => {
      if (!val) {
        this.closeThat(this.activeKey)
        return
      }
      this.closeThat(val)
    })

    events.$on('rename', ({ key, name }) => {
      try {
        // 完全参考V2实现：只查找path
        const item = this.pages.find(item => item.path === key)
        if (item) {
          item.meta.customTitle = name
          this.$forceUpdate()
        }
      } catch (e) {
        console.error('重命名标签失败:', e)
      }
    })
  },
  mounted() {
    // 组件挂载完成
  },
  methods: {
    onEdit(targetKey, action) {
      if (action === 'remove') {
        this.remove(targetKey)
      }
    },

    remove(targetKey) {
      this.pages = this.pages.filter(page => page.fullPath !== targetKey)
      this.fullPathList = this.fullPathList.filter(path => path !== targetKey)
      
      // 判断当前标签是否关闭，若关闭则跳转到最后一个还存在的标签页
      if (!this.fullPathList.includes(this.activeKey)) {
        this.selectedLastPath()
      }
    },

    selectedLastPath() {
      if (this.fullPathList.length > 0) {
        this.activeKey = this.fullPathList[this.fullPathList.length - 1]
      }
    },
    
    getPageTitle(page) {
      // 完全参考V2的JSX实现：page.meta.customTitle || page.meta.title
      if (page.meta && page.meta.customTitle) {
        return page.meta.customTitle
      }
      if (page.meta && page.meta.title) {
        return page.meta.title
      }
      // 兜底逻辑与V2保持一致
      return page.name || '未命名页面'
    },

    // 右键菜单方法 - 完全参考V2实现
    closeThat(e) {
      // 判断是否为最后一个标签页，如果是最后一个，则无法被关闭
      if (this.fullPathList.length > 1) {
        this.remove(e)
      } else {
        this.$message.info('这是最后一个标签了, 无法被关闭')
      }
    },

    closeLeft(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex > 0) {
        // 完全参考V2实现：使用forEach而不是slice
        this.fullPathList.forEach((item, index) => {
          if (index < currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('左侧没有标签')
      }
    },

    closeRight(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex < (this.fullPathList.length - 1)) {
        // 完全参考V2实现：使用forEach而不是slice
        this.fullPathList.forEach((item, index) => {
          if (index > currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('右侧没有标签')
      }
    },

    closeAll(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      // 完全参考V2实现：使用forEach
      this.fullPathList.forEach((item, index) => {
        if (index !== currentIndex) {
          this.remove(item)
        }
      })
    },

    closeMenuClick(key, route) {
      this[key](route)
    }
  },
  
  watch: {
    '$route': {
      handler(newRoute) {
        if (!newRoute || !newRoute.fullPath) {
          return
        }

        // 设置当前激活标签
        this.activeKey = newRoute.fullPath

        // 检查是否已经存在该路由的标签，避免重复添加
        const existingIndex = this.fullPathList.indexOf(newRoute.fullPath)
        
        // 额外检查：对于首页相关路径，避免重复添加
        const isHomePage = newRoute.fullPath === '/' || newRoute.fullPath === '/welcome' || newRoute.path === '/welcome'
        let hasHomePage = false
        
        if (isHomePage) {
          hasHomePage = this.fullPathList.some(path => 
            path === '/' || path === '/welcome' || path.includes('/welcome')
          )
        }
        
        if (existingIndex < 0 && !(isHomePage && hasHomePage)) {
          this.fullPathList.push(newRoute.fullPath)
          this.pages.push(newRoute)
        } else {
          if (existingIndex >= 0) {
            // 如果标签已存在，更新对应的路由对象（防止路由对象过期）
            this.pages[existingIndex] = newRoute
          }
        }
      },
      immediate: true
    },

    activeKey: {
      handler(newActiveKey) {
        // 路由切换逻辑
        if (newActiveKey && this.$router) {
          this.$router.push({ path: newActiveKey }).catch(err => {
            // 忽略重复导航错误
            if (err.name !== 'NavigationDuplicated') {
              console.warn('路由切换失败:', err)
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
