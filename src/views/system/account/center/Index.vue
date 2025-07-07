<template>
  <div class="page-header-index-wide page-header-wrapper-grid-content-main">
    <a-row :gutter="24">
      <a-col :md="24" :lg="7">
        <a-card :bordered="false">
          <div class="account-center-avatarHolder">
            <div class="avatar">
              <img :src="avatar()">
            </div>
            <div class="username">{{ nickname() }}</div>
            <div class="bio">海纳百川,有容乃大</div>
          </div>
          <div class="account-center-detail">
            <p>
              <i class="title"></i>交互专家
            </p>
            <p>
              <i class="group"></i>蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED
            </p>
            <p>
              <i class="address"></i>
              <span>浙江省</span>
              <span>杭州市</span>
            </p>
          </div>
          <a-divider />

          <div class="account-center-tags">
            <div class="tagsTitle">标签</div>
            <div>
              <template v-for="(tag, index) in tags" :key="`tag-${index}`">
                <a-tooltip v-if="tag.length > 20" :key="`tooltip-${index}`" :title="tag">
                  <a-tag :key="`long-tag-${index}`" :closable="index !== 0"
                  >{{ `${tag.slice(0, 20)}...` }}</a-tag>
                </a-tooltip>
                <a-tag
                  v-else
                  :key="`short-tag-${index}`"
                  :closable="index !== 0"
                  @close="handleTagClose(tag)"
                >{{ tag }}</a-tag>
              </template>
              <a-input
                v-if="tagInputVisible"
                ref="tagInput"
                type="text"
                size="small"
                :style="{ width: '78px' }"
                v-model:value="tagInputValue"
                @blur="handleTagInputConfirm"
                @keyup.enter="handleTagInputConfirm"
              />
              <a-tag v-else @click="showTagInput" style="background: #fff; border-style: dashed;">
                <plus-outlined />New Tag
              </a-tag>
            </div>
          </div>
          <a-divider :dashed="true" />

          <div class="account-center-team">
            <div class="teamTitle">团队</div>
            <a-spin :spinning="teamSpinning">
              <div class="members">
                <a-row>
                  <a-col :span="12" v-for="(item, index) in teams" :key="index">
                    <a>
                      <a-avatar size="small" :src="item.avatar" />
                      <span class="member">{{ item.name }}</span>
                    </a>
                  </a-col>
                </a-row>
              </div>
            </a-spin>
          </div>
        </a-card>
      </a-col>
      <a-col :md="24" :lg="17">
        <a-card
          style="width: 100%"
          :bordered="false"
          :tabList="tabListNoTitle"
          :activeTabKey="noTitleKey"
          @tabChange="key => handleTabChange(key, 'noTitleKey')"
        >
          <article-page v-if="noTitleKey === 'article'" />
          <app-page v-else-if="noTitleKey === 'app'" />
          <project-page v-else-if="noTitleKey === 'project'" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { PlusOutlined } from '@ant-design/icons-vue'
import { PageView, RouteView } from '@/layouts'
import { AppPage, ArticlePage, ProjectPage } from './page'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'AccountCenter',
  components: {
    RouteView,
    PageView,
    AppPage,
    ArticlePage,
    ProjectPage,
    PlusOutlined
  }
})

const store = useStore()

const tags = ref(['很有想法', '专注设计', '辣~', '大长腿', '川妹子', '海纳百川'])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const teams = ref([])
const teamSpinning = ref(true)
const tagInput = ref(null)

const tabListNoTitle = reactive([
  {
    key: 'article',
    tab: '文章(8)'
  },
  {
    key: 'app',
    tab: '应用(8)'
  },
  {
    key: 'project',
    tab: '项目(8)'
  }
])

const noTitleKey = ref('app')

const nickname = () => store.getters.nickname
const avatar = () => store.getters.avatar

const getTeams = async () => {
  try {
    // Replace with actual API call
    // const res = await this.$http.get('/workplace/teams')
    // teams.value = res.result
    
    // Mock data for now
    teams.value = [
      { name: '张三', avatar: 'https://via.placeholder.com/32' },
      { name: '李四', avatar: 'https://via.placeholder.com/32' },
      { name: '王五', avatar: 'https://via.placeholder.com/32' }
    ]
    teamSpinning.value = false
  } catch (error) {
    console.error('获取团队信息失败:', error)
    teamSpinning.value = false
  }
}

const handleTabChange = (key, type) => {
  if (type === 'noTitleKey') {
    noTitleKey.value = key
  }
}

const handleTagClose = (removeTag) => {
  tags.value = tags.value.filter(tag => tag !== removeTag)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    if (tagInput.value) {
      tagInput.value.focus()
    }
  })
}

const handleTagInputConfirm = () => {
  const inputValue = tagInputValue.value
  if (inputValue && !tags.value.includes(inputValue)) {
    tags.value = [...tags.value, inputValue]
  }
  
  tagInputVisible.value = false
  tagInputValue.value = ''
}

onMounted(() => {
  getTeams()
})
</script>

<style lang="less" scoped>
.page-header-wrapper-grid-content-main {
  width: 100%;
  height: 100%;
  min-height: 100%;
  transition: 0.3s;

  .account-center-avatarHolder {
    text-align: center;
    margin-bottom: 24px;

    & > .avatar {
      margin: 0 auto;
      width: 104px;
      height: 104px;
      margin-bottom: 20px;
      border-radius: 50%;
      overflow: hidden;
      img {
        height: 100%;
        width: 100%;
      }
    }

    .username {
      color: rgba(0, 0, 0, 0.85);
      font-size: 20px;
      line-height: 28px;
      font-weight: 500;
      margin-bottom: 4px;
    }
  }

  .account-center-detail {
    p {
      margin-bottom: 8px;
      padding-left: 26px;
      position: relative;
    }

    i {
      position: absolute;
      height: 14px;
      width: 14px;
      left: 0;
      top: 4px;
      background: url(https://gw.alipayobjects.com/zos/rmsportal/pBjWzVAHnOOtAUvZmZfy.svg);
    }

    .title {
      background-position: 0 0;
    }
    .group {
      background-position: 0 -22px;
    }
    .address {
      background-position: 0 -44px;
    }
  }

  .account-center-tags {
    .tagsTitle {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 12px;
    }
  }

  .account-center-team {
    .teamTitle {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 12px;
    }

    .members {
      a {
        display: block;
        margin: 12px 0;
        line-height: 24px;
        height: 24px;
        .member {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
          line-height: 24px;
          max-width: 100px;
          vertical-align: top;
          margin-left: 12px;
          transition: all 0.3s;
          display: inline-block;
        }
        &:hover {
          span {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>
