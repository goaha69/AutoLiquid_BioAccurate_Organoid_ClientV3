<template>
  <page-view :avatar="avatar" :title="false">
    <template #headerContent>
      <div class="title">{{ timeFix }},{{ user.name }}<span class="welcome-text">,{{ welcome }}</span></div>
      <div style="margin-bottom:10px">前端工程师 | 蚂蚁金服 - 某某某事业群 - VUE平台</div>
    </template>
    <template #extra>
      <a-row class="more-info">
        <a-col :span="8">
          <head-info title="项目" content="56" :center="false" :bordered="false" />
        </a-col>
        <a-col :span="8">
          <head-info title="团队排名" content="8/24" :center="false" :bordered="false" />
        </a-col>
        <a-col :span="8">
          <head-info title="项目访问" content="2,223" :center="false" />
        </a-col>
      </a-row>
    </template>

    <div>
      <a-row :gutter="24">
        <a-col :xl="16" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card
            class="project-list"
            :loading="loading"
            style="margin-bottom: 24px;"
            :bordered="false"
            title="进行中的项目"
            :body-style="{ padding: 0 }">
            <template #extra>
              <a>全部项目</a>
            </template>
            <div>
              <a-card-grid class="project-card-grid" :key="i" v-for="(item, i) in projects">
                <a-card :bordered="false" :body-style="{ padding: 0 }">
                  <a-card-meta>
                    <template #title>
                      <div class="card-title">
                        <a-avatar size="small" :src="item.cover" />
                        <a>{{ item.title }}</a>
                      </div>
                    </template>
                    <template #description>
                      <div class="card-description">
                        {{ item.description }}
                      </div>
                    </template>
                  </a-card-meta>
                  <div class="project-item">
                    <a href="/#/">科学搬砖组</a>
                    <span class="datetime">9小时前</span>
                  </div>
                </a-card>
              </a-card-grid>
            </div>
          </a-card>

          <a-card :loading="loading" title="动态" :bordered="false">
            <a-list>
              <a-list-item :key="index" v-for="(item, index) in activities">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="item.user.avatar" />
                  </template>
                  <template #title>
                    <div>
                      <span>{{ item.user.nickname }}</span> 
                      在 <a href="#">{{ item.project.name }}</a> 
                      <span>{{ item.project.action }}</span> 
                      <a href="#">{{ item.project.event }}</a>
                    </div>
                  </template>
                  <template #description>
                    <div>{{ item.time }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
        <a-col
          style="padding: 0 12px"
          :xl="8"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24">
          <a-card title="快速开始 / 便捷导航" style="margin-bottom: 24px" :bordered="false" :body-style="{padding: 0}">
            <div class="item-group">
              <a>操作一</a>
              <a>操作二</a>
              <a>操作三</a>
              <a>操作四</a>
              <a>操作五</a>
              <a>操作六</a>
              <a-button size="small" type="primary" ghost>
                <template #icon>
                  <plus-outlined ></plus-outlined>
                </template>
                添加
              </a-button>
            </div>
          </a-card>
          <a-card title="XX 指数" style="margin-bottom: 24px" :loading="radarLoading" :bordered="false" :body-style="{ padding: 0 }">
            <div style="min-height: 400px; display: flex; align-items: center; justify-content: center; color: #999;">
              <!-- 暂时禁用雷达图,等待Vue 3兼容的图表库 -->
              <!-- <radar :data="radarData" ></radar> -->
              <div style="text-align: center;">
                <p>图表组件升级中...</p>
                <p style="font-size: 12px; margin-top : 10px;">
                  个人: 60分 | 团队: 65分 | 部门: 45分
                </p>
              </div>
            </div>
          </a-card>
          <a-card :loading="loading" title="团队" :bordered="false">
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
          </a-card>
        </a-col>
      </a-row>
    </div>
  </page-view>
</template>

<script>
  import { timeFix } from '@/utils/util'
  import { mapGetters } from 'vuex'
  import { PageView } from '@/layouts'
  import HeadInfo from '@/components/tools/HeadInfo'
  import { PlusOutlined } from '@ant-design/icons-vue'
  // import { Radar } from '@/components' // 暂时禁用,等待Vue 3兼容
  // import { getUserInfo } from '@/permission' // 移除循环导入

const DataSet = require('@antv/data-set')

  export default {
    name: 'system_index_workplace',
    components: {
      PageView,
      HeadInfo,
      PlusOutlined
      // Radar // 暂时禁用

  },
    data () {
      return {
        timeFix: timeFix(),
        avatar: '',
        user: {},

        projects: [],
        loading: true,
        radarLoading: true,
        activities: [],
        teams: [],

        // data

      axis1Opts: {
          dataKey: 'item',
          line: null,
          tickLine: null,
          grid: {
            lineStyle: {
              lineDash: null
            },
            hideFirstLine: false
          }
        },
        axis2Opts: {
          dataKey: 'score',
          line: null,
          tickLine: null,
          grid: {
            type: 'polygon',
            lineStyle: {
              lineDash: null
            }
          }
        },
        scale: [{
          dataKey: 'score',
          min: 0,
          max: 80
        }],
        axisData: [
          { item: '引用', a: 70, b: 30, c: 40 },
          { item: '口碑', a: 60, b: 70, c: 40 },
          { item: '产量', a: 50, b: 60, c: 40 },
          { item: '贡献', a: 40, b: 50, c: 40 },
          { item: '热度', a: 60, b: 70, c: 40 },
          { item: '引用', a: 70, b: 50, c: 40 }
        ],
        radarData: []
      }
    },
    computed: {
      nickname () {
        return this.user.name || '用户'
      },
      welcome () {
        return '欢迎回来'
      },
      userInfo () {
        return this.user
      }
    },
    created () {
    // store 获取用户信息
    this.user = this.$store.getters.userInfo || {
        id: 1,
        name: '管理员',
        nickname: 'admin',
        avatar: '/avatar.jpg'
      }
      // 设置头像地址(如果需要的话)
    this.avatar = this.user.avatar || '/avatar.jpg'
    },
    mounted () {
      this.getProjects()
      this.getActivity()
      this.getTeams()
      this.initRadar()
    },
    methods: {
      getProjects () {
        this.projects = [{
          id: 1,
          cover: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
          title: 'Alipay',
          description: '那是一种内在的东西,他们到达不了,也无法触及',
          status: 1,
          updatedAt: '2018-07-26 00:00:00'
        },
          {
            id: 2,
            cover: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
            title: 'Angular',
            description: '希望是一个好东西,也许是最好的,好东西是不会消亡的',
            status: 1,
            updatedAt: '2018-07-26 00:00:00'
          },
          {
            id: 3,
            cover: 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
            title: 'Ant Design',
            description: '城镇中有那么多的酒馆,她却偏偏走进了我的酒馆',
            status: 1,
            updatedAt: '2018-07-26 00:00:00'
          },
          {
            id: 4,
            cover: 'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png',
            title: 'SuperH2',
            description: '那时候我只会想自己想要什么,从不想自己拥有什么',
            status: 1,
            updatedAt: '2018-07-26 00:00:00'
          },
          {
            id: 5,
            cover: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png',
            title: 'Bootstrap',
            description: '凛冬将至',
            status: 1,
            updatedAt: '2018-07-26 00:00:00'
          },
          {
            id: 6,
            cover: 'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png',
            title: 'Vue',
            description: '生命就像一盒巧克力,结果往往出人意料',
            status: 1,
            updatedAt: '2018-07-26 00:00:00'
          }
        ]
        this.loading = false
      },
      getActivity () {
        this.activities = [{
          id: 1,
          user: {
            nickname: '@name',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
          },
          project: {
            name: '白鹭酱油开发组',
            action: '更新',
            event: '番组计划'
          },
          time: '2018-08-23 14:47:00'
        },
          {
            id: 1,
            user: {
              nickname: '蓝莓',
              avatar: 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png'
            },
            project: {
              name: '白鹭酱油开发组',
              action: '更新',
              event: '番组计划'
            },
            time: '2018-08-23 09:35:37'
          },
          {
            id: 1,
            user: {
              nickname: '@name',
              avatar: '@image(64x64)'
            },
            project: {
              name: '白鹭酱油开发组',
              action: '创建',
              event: '番组计划'
            },
            time: '2017-05-27 00:00:00'
          },
          {
            id: 1,
            user: {
              nickname: '曲丽',
              avatar: '@image(64x64)'
            },
            project: {
              name: '高逼格设计天团',
              action: '更新',
              event: '六月迭代'
            },
            time: '2018-08-23 14:47:00'
          },
          {
            id: 1,
            user: {
              nickname: '@name',
              avatar: '@image(64x64)'
            },
            project: {
              name: '高逼格设计天团',
              action: 'created',
              event: '六月迭代'
            },
            time: '2018-08-23 14:47:00'
          },
          {
            id: 1,
            user: {
              nickname: '曲丽',
              avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
            },
            project: {
              name: '高逼格设计天团',
              action: 'created',
              event: '六月迭代'
            },
            time: '2018-08-23 14:47:00'
          }
        ]
      },
      getTeams () {
        this.teams = [{
          id: 1,
          name: '科学搬砖',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
        },
          {
            id: 2,
            name: '程序员日',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png'
          },
          {
            id: 1,
            name: '设计天团',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/gaOngJwsRYRaVAuXXcmB.png'
          },
          {
            id: 1,
            name: '中二少女',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ubnKSIfAJTxIgXOKlciN.png'
          },
          {
            id: 1,
            name: '骗你学计算机',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png'
          }
        ]
      },
      initRadar () {
        this.radarLoading = true
        const dv = new DataSet.View().source(
          [{
            item: '引用',
            '个人': 70,
            '团队': 30,
            '部门': 40
          },
            {
              item: '口碑',
              '个人': 60,
              '团队': 70,
              '部门': 40
            },
            {
              item: '产量',
              '个人': 50,
              '团队': 60,
              '部门': 40
            },
            {
              item: '贡献',
              '个人': 40,
              '团队': 50,
              '部门': 40
            },
            {
              item: '热度',
              '个人': 60,
              '团队': 70,
              '部门': 40
            },
            {
              item: '引用',
              '个人': 70,
              '团队': 50,
              '部门': 40
            }
          ]
        )
        dv.transform({
          type: 'fold',
          fields: ['个人', '团队', '部门'],
          key: 'user',
          value: 'score'
        })

        this.radarData = dv.rows
        this.radarLoading = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .project-list {

    .card-title {
      font-size: 0;

      a {
        color: rgba(0, 0, 0, 0.85);
        margin-left: 12px;
        line-height: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: top;
        font-size: 14px;

        &:hover {
          color: #1890ff;
        }
      }
    }
    .card-description {
      color: rgba(0, 0, 0, 0.45);
      height: 44px;
      line-height: 22px;
      overflow: hidden;
    }
    .project-item {
      display: flex;
      margin-top: 8px;
      overflow: hidden;
      font-size: 12px;
      height: 20px;
      line-height: 20px;
      a {
        color: rgba(0, 0, 0, 0.45);
        display: inline-block;
        flex: 1 1 0;

        &:hover {
          color: #1890ff;
        }
      }
      .datetime {
        color: rgba(0, 0, 0, 0.25);
        flex: 0 0 auto;
        float: right;
      }
    }
    .ant-card-meta-description {
      color: rgba(0, 0, 0, 0.45);
      height: 44px;
      line-height: 22px;
      overflow: hidden;
    }
  }

  .item-group {
    padding: 20px 0 8px 24px;
    font-size: 0;
    a {
      color: rgba(0, 0, 0, 0.65);
      display: inline-block;
      font-size: 14px;
      margin-bottom: 13px;
      width: 25%;
    }
  }

  .members {
    a {
      display: block;
      margin: 12px 0;
      line-height: 24px;
      height: 24px;
      .member {
        font-size: 14px;
        color: rgba(0, 0, 0, .65);
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

  .mobile {

    .project-list {

      .project-card-grid {
        width: 100%;
      }
    }

    .more-info {
      border: 0;
      padding-top: 16px;
      margin: 16px 0 16px;
    }

    .headerContent .title .welcome-text {
      display: none;
    }
  }

</style>
