<template>
  <a-modal :open="visiable" title="版本管理" @cancel="cancelform" width="90vw">
    <a-layout style="height: 90vh;">
      <!-- 左右布局 -->
      <a-layout-sider style="background: #fff; padding: 16px;" :width="800">
        <a-input-group compact :width="800">
          <span style="padding: 3px 16px;">地点 : </span>
          <a-select v-model:value="selectedLocation.id" @change="selectionLocation">
            <a-select-option style="width: 100px;" v-for="location in locationList" :key="location.id" 
            :value="location.id">
              {{  location.locationName }}
            </a-select-option>
          </a-select>
          <a-button style="margin: 0px 16px;" type="primary" @click="openadd('location')">添加地点</a-button>
          <a-button style="margin: 0px 16px;" type="primary" @click="openadd('version')">添加版本</a-button>
        </a-input-group>
        <a-card>
          <a-table ref="versionTable" :dataSource="versionList" :columns="columns" :rowKey="record => record.id" 
            :record="record" :customRow="customRow"/>
        </a-card>
        <a-modal :width="800" 
          style="height: 400px;" title="版本信息录入" :open="visible" @ok="handleSubmit('version')" @cancel="handleCancel('version')" :closable="false">
          <a-card>
              <a-input style="margin: 5px 0px;" placeholder="请输入地点名:.." v-model:value="deviceversion.locationName" />
              <a-input style="margin: 5px 0px;" placeholder="请输入版本号..." v-model:value="deviceversion.currentVersion" />
              <a-textarea :rows="10" placeholder="请输入版本信:.." v-model:value="deviceversion.remark" />
          </a-card>
        </a-modal>
        <a-modal :width="800" 
          style="height: 400px;" title="添加地点名称" :open="locationvisible" @ok="handleSubmit" @cancel="handleCancel" :closable="false">
          <a-card>
              <a-input style="margin: 5px 0px;" placeholder="请输入地点名:.." v-model:value="locationparam.locationName" />
          </a-card>
        </a-modal>
      </a-layout-sider>

      <a-layout-content style="padding: 0px 16px; background: #f0f2f5;width : 50%;">
          <a-card title="版本记录,更新记录" :bordered="false">
            <a-list item-layout="horizontal" :data-source="versionDetails">
              <template #renderItem="{ item, index }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <h2 style="margin-bottom: 8px; font-size: 30px; font-weight : bold;">{{ item.currentVersion }}</h2>
                      <h1 v-html="formatRemark(item.remark)"></h1>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
      </a-layout-content>
    </a-layout>
  </a-modal>
</template>

<script>
export default {
  components: {
     
  },
  data() {
    return {
      expDeviceModule:null,
      visiable:false,
      record:null,
      selectedLocation:{
        id:0,
        name:''
      },
      locationList:[],
      locationvisible:false,
      visible:false,
      deviceversion:{
        id:0,
        locationName:'',
        currentVersion:'',
        remark:''
      },
      locationparam:{
        locationName:'',
      },
      versionList:[],
      columns: [
      { title: "版本", dataIndex: "currentVersion", key: "currentVersion" },
      { title: "最后更新时间", dataIndex: "lastUpdateTime", key: "lastUpdateTime" },
      { title: "创建时间", dataIndex: "createdTime", key: "createdTime" },
      { title: "更新时间", dataIndex: "updatedTime", key: "updatedTime" },
    ],
    versionDetails:[]
    };
  },
  mounted() {
    this.Init();
  },
  methods: {
    async Init(){
      this.expDeviceModule = await import('@/api/modular/experiment/expDeviceVersionManage');
      this.expDeviceModule.exp_deviceversion_locationlist().then((res)=>{
        this.locationList = []
        this.locationList = res.data
        if (this.locationList.length > 0) {
          this.selectedLocation.id = this.locationList[0].id; // 默认选择第一
        this.selectedLocation.name = this.locationList[0].locationName
          this.expDeviceModule.exp_deviceversion_getversionlist(this.selectedLocation).then((res)=>{
            this.versionList = []
            this.versionList = res.data
            this.versionDetails = []
            this.versionDetails = res.data
          })
        }
      })
    },
    open(){
      this.visiable = true
    },
    cancelform(){
      this.visiable = false;
    },
    formatRemark(remark) {
    return remark.replace(/\n/g, '<br>');
  },
  refresh(){
    this.expDeviceModule.exp_deviceversion_getversionlist(this.selectedLocation).then((res)=>{
            this.versionList = []
            this.versionList = res.data
            this.versionDetails = []
            this.versionDetails = res.data
      }),
    this.expDeviceModule.exp_deviceversion_locationlist().then((res)=>{
        this.locationList = []
        this.locationList = res.data
        this.deviceversion.locationName = this.locationList.find(item=>item.id === this.selectedLocation.id).locationName
      })
  },
  selectionLocation(){
    this.refresh();
    },
    customRow(record){
      return {
        onClick: () => {
          this.handleRowClick(record)
        },
      };
    },
    openadd(str){
      if(str == 'version'){
        this.visible = true
        this.deviceversion.locationName = this.locationList.find(item=>item.id === this.selectedLocation.id).locationName
      }
      else{
        this.locationvisible = true
      }
    },
    handleRowClick(record){
      console.log('1212123123',record)
    },
    handleSubmit(str){
      if(str == 'version'){
      this.visible = false;
      this.deviceversion.id = this.selectedLocation.id
      this.expDeviceModule.exp_deviceversion_addversion(this.deviceversion).then((res)=>{
        if(res.success){
          this.refresh();
        }
      })
      }
      else{
        this.locationvisible = false;
        this.expDeviceModule.exp_deviceversion_addlocation(this.locationparam).then((res=>{
          if(res.success){
          this.refresh();
        }
        }))
      }
    },
    handleCancel(str){
      if(str == 'version'){
      this.visible = false;
      }
      else{
        this.locationvisible = false;
      }
    }
  },
};
</script>

<style scoped>

</style>
