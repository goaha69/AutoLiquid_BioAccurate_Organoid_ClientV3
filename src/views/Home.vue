<template>
  <div>
    <h2># Trend 组件 </h2>

    <a-divider> 正常 </a-divider>

    <a-card>

      <trend flag="up" style="margin-right: 16px;">
        <template v-slot:term>工资</template>
        5%
      </trend>
      <trend flag="up" style="margin-right: 16px;">
        <template v-slot:term>工作</template>
        50%
      </trend>
      <trend flag="down">
        <template v-slot:term>身体状况</template>
        50%
      </trend>

    </a-card>

    <a-divider> 颜色反转 </a-divider>

    <a-card style="margin-bottom: 3rem">

      <trend flag="up" :reverse-color="true" style="margin-right: 16px;">
        <template v-slot:term>工资</template>
        5%
      </trend>
      <trend flag="down" :reverse-color="true" style="margin-right: 16px;">
        <template v-slot:term>工作</template>
        50%
      </trend>

    </a-card>

    <h2># AvatarList 组件 </h2>

    <a-divider> AvatarList </a-divider>
    <a-card style="margin-bottom: 3rem">
      <avatar-list :max-length="3">
        <avatar-list-item tips="Jake" src="https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png" />
        <avatar-list-item tips="Andy" src="https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
      </avatar-list>

      <a-divider type="vertical" style="margin: 0 16px" />

      <avatar-list size="mini">
        <avatar-list-item tips="Jake" src="https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png" />
        <avatar-list-item tips="Andy" src="https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png" />
        <avatar-list-item tips="Niko" src="https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png" />
      </avatar-list>
    </a-card>

    <h2># CountDown 组件 </h2>

    <a-divider> CountDown </a-divider>
    <a-card style="margin-bottom: 3rem">
      <count-down
        style="font-size: 2rem" 
        :target="new Date().getTime() + 3000000"
        :on-end="onEndHandle">
      </count-down>

      <a-divider type="vertical" style="margin: 0 16px" />

      <count-down
        style="font-size: 2rem" 
        :target="new Date().getTime() + 10000"
        :on-end="onEndHandle2">
      </count-down>
    </a-card>

    <h2># Ellipsis 组件 </h2>

    <a-divider> Ellipsis </a-divider>
    <a-card style="margin-bottom: 3rem">
      <ellipsis :length="100" tooltip>
        There were injuries alleged in three cases in 2015, and a
        fourth incident in September, according to the safety recall report. After meeting with US regulators in October, the firm decided to issue a voluntary recall.
      </ellipsis>
    </a-card>

    <h2># NumberInfo 组件 </h2>

    <a-divider> NumberInfo </a-divider>
    <a-card style="margin-bottom: 3rem">
      <number-info  
        sub-title="() => { return 'Visits this week' }" 
        :total="12321"
        status="up"
        :sub-total="17.1">
      </number-info>
    </a-card>

    <h2># TagSelect 组件 </h2>

    <a-divider> TagSelect </a-divider>
    <a-card style="margin-bottom: 3rem">
      <tag-select>
        <tag-select-option value="cat1">类目1</tag-select-option>
        <tag-select-option value="cat2">类目2</tag-select-option>
        <tag-select-option value="cat3">类目3</tag-select-option>
        <tag-select-option value="cat4">类目4</tag-select-option>
        <tag-select-option value="cat5">类目5</tag-select-option>
        <tag-select-option value="cat6">类目6</tag-select-option>
        <tag-select-option value="cat7">类目7</tag-select-option>
      </tag-select>
    </a-card>

    <h2># DescriptionList 组件 </h2>

    <a-divider> DescriptionList </a-divider>
    <a-card style="margin-bottom: 3rem">
      <description-list title="组名" size="small">
        <description-list-item term="负责人">林东</description-list-item>
        <description-list-item term="角色">1234567</description-list-item>
        <description-list-item term="所属部门">XX公司-YY部门</description-list-item>
        <description-list-item term="过期时间">2018-08-08</description-list-item>
        <description-list-item term="描述">这段描述很长很长很长很长很长很长很长很长很长很长很长很长很长很长...</description-list-item>
      </description-list>
    </a-card>

    <a-divider> TagCloud </a-divider>
    <a-card style="margin-bottom: 3rem">
      <tag-cloud :tag-list="tagCloudData"></tag-cloud>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message, notification } from 'ant-design-vue'
import Trend from '@/components/Trend'
import AvatarList from '@/components/AvatarList'
import CountDown from '@/components/CountDown/CountDown'
import Ellipsis from '@/components/Ellipsis'
import NumberInfo from '@/components/NumberInfo'
import TagSelect from '@/components/TagSelect'
import { DescriptionList, TagCloud } from '@/components/'

const AvatarListItem = AvatarList.AvatarItem
const TagSelectOption = TagSelect.Option
const DescriptionListItem = DescriptionList.Item

defineOptions({
  name: 'Home'
})

const targetTime = ref(new Date().getTime() + 3900000)
const tagCloudData = ref([])

const onEndHandle = () => {
  message.success('CountDown callback!!!')
}

const onEndHandle2 = () => {
  notification.open({
    message: 'Notification Title',
    description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.'
  })
}

const getTagCloudData = async () => {
  try {
    // Note: This API call needs to be updated to use the new HTTP client
    // const res = await $http.get('/data/antv/tag-cloud')
    // tagCloudData.value = res.result
    
    // Placeholder data for now
    tagCloudData.value = [
      { name: 'Vue', value: 100 },
      { name: 'React', value: 80 },
      { name: 'Angular', value: 60 },
      { name: 'JavaScript', value: 120 },
      { name: 'TypeScript', value: 90 }
    ]
  } catch (error) {
    console.error('获取标签云数据失败:', error)
  }
}

onMounted(() => {
  getTagCloudData()
})
</script>

<style scoped>
</style>
