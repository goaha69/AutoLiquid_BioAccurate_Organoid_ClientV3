<template>
  <div class="app-list">
    <a-list
      :grid="{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }"
      :dataSource="dataSource">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card :hoverable="true">
            <a-card-meta>
              <template #title>
                <div style="margin-bottom: 3px">{{ item.title }}</div>
              </template>
              <template #avatar>
                <a-avatar class="card-avatar" :src="item.avatar" size="small" />
              </template>
              <template #description>
                <div class="meta-cardInfo">
                  <div>
                    <p>活跃用户</p>
                    <p>
                      <span>{{ item.activeUser }}<span>:</span></span>
                    </p>
                  </div>
                  <div>
                    <p>新增用户</p>
                    <p>{{ formatNumber(item.newUser) }}</p>
                  </div>
                </div>
              </template>
            </a-card-meta>
            <template #actions>
              <a>
                <download-outlined />
              </a>
              <a>
                <edit-outlined />
              </a>
              <a>
                <share-alt-outlined />
              </a>
              <a>
                <a-dropdown>
                  <template #default>
                    <a class="ant-dropdown-link" href="javascript:;">
                      <ellipsis-outlined />
                    </a>
                  </template>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item>
                        <a href="javascript:;">1st menu item</a>
                      </a-menu-item>
                      <a-menu-item>
                        <a href="javascript:;">2nd menu item</a>
                      </a-menu-item>
                      <a-menu-item>
                        <a href="javascript:;">3rd menu item</a>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { DownloadOutlined, EditOutlined, ShareAltOutlined, EllipsisOutlined } from '@ant-design/icons-vue'

defineOptions({
  name: 'Article'
})

const dataSource = []
for (let i = 0; i < 11; i++) {
  dataSource.push({
    title: 'Alipay',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
    activeUser: 17,
    newUser: 1700
  })
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}
</script>

<style lang="less" scoped>
.app-list {
  .meta-cardInfo {
    zoom: 1;
    margin-top: 16px;

    > div {
      position: relative;
      text-align: left;
      float: left;
      width: 50%;

      p {
        line-height: 32px;
        font-size: 24px;
        margin: 0;

        &:first-child {
          color: rgba(0, 0, 0, .45);
          font-size: 12px;
          line-height: 20px;
          margin-bottom: 4px;
        }
      }
    }
  }
}
</style>
