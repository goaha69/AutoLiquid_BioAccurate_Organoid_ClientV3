<template>
  <div style="width:90vw;height:90vh;">
    <a-row :gutter="8" style="height:90vh;">
        <a-col :span="4">            
            <a-card title="布局列表" :bordered="false" style="height:110vh;">
                <div class="table-operator" v-if="hasPerm('exp_flow_step:add')">
                    <a-button type="primary" @click="copyAllModal.visible=true">
                        <template #icon><copy-outlined /></template>
                        复制所有程序集
                    </a-button>
                </div>
                <a-table
                    ref="layoutTable" 
                    size="middle" 
                    :pagination="false" 
                    :row-key="(record, index) => record.id" 
                    :columns="layoutColumns" 
                    :dataSource="layoutData" 
                    :loading="layoutLoading" 
                    :customRow="layoutCustomRow"> 
                    <template #serial="{ text, record, index }">
                        {{ index + 1 }}
                    </template> 
                </a-table>
            </a-card>
        </a-col>
        <a-col :span="7">
            <a-card title="程序集列表" :bordered="false" style="height:auto; min-height: 700px;">
                <div class="table-operator" v-if="hasPerm('exp_flow_step:add')">
                    <a-button type="primary" v-if="hasPerm('exp_flow_step:add')" @click="addParentForm">
                        <template #icon><plus-outlined /></template>
                        新增程序集
                    </a-button>
                </div>
                <div>
                    <a-table
                        ref="parentTable" 
                        size="middle" 
                        :pagination="false" 
                        :row-key="(record, index) => record.id" 
                        :columns="stepParentColumns" 
                        draggable="false"
                        :dataSource="stepParentData" 
                        :loading="parentLoading" 
                        :customRow="stepParentCustomRow" 
                        :expandIconAsCell="false" 
                        :expandIconColumnIndex="-1" 
                        :scroll="{  y: 810 }"> 
                        <template #serial="{ text, record, index }">
                            {{ index + 1 }}
                        </template> 
                        <template #action="{ text, record }">
                            <a v-if="hasPerm('exp_flow_step:edit')" @click="executeSummary(record)">执行</a>
                            <a-divider type="vertical" v-if="hasPerm('exp_flow_step:edit')" />
                            <a-dropdown v-if="hasPerm('exp_flow_step:edit') || hasPerm('exp_flow_step:delete')">
                                <a class="ant-dropdown-link">
                                    更多<down-outlined />
                                </a>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item v-if="hasPerm('exp_flow_step:edit')">
                                            <a @click="copySummary(record)">复制</a>
                                        </a-menu-item>
                                        <a-menu-item v-if="hasPerm('exp_flow_step:edit')">
                                            <a @click="$refs.editParentForm.edit(record)">编辑</a>
                                        </a-menu-item>
                                        <a-menu-item v-if="hasPerm('exp_flow_step:delete')">
                                            <a-popconfirm placement="topRight" title="确认删除本步骤与子步骤？" @confirm="() => exp_flow_step_delete(1,record)">
                                                <a>删除</a>
                                            </a-popconfirm>
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </template>
                    </a-table>
                </div>
            </a-card>
        </a-col>
        <a-col :span="13">
            <a-card title="步骤列表" :bordered="false" style="padding-right:100px;">
                <template #extra>
                    <a-button type="primary" @click="executeSummary1()" v-if="!stepRowRunning">
                        <template #icon><play-circle-outlined /></template>
                        执行
                    </a-button>
                    <div v-if="stepRowRunning">                        
                        <a-button type="primary" @click="setCurrentStatus(3)" v-if="currentStatus==1 || currentStatus==2">
                            <template #icon><stop-outlined /></template>
                            停止
                        </a-button>
                        <a-button type="primary" @click="setCurrentStatus(2)" v-if="currentStatus==1">
                            <template #icon><pause-outlined /></template>
                            暂停
                        </a-button>
                        <a-button type="primary" @click="setCurrentStatus(1)" v-if="currentStatus==2">
                            <template #icon><redo-outlined /></template>
                            继续
                        </a-button>
                    </div>                    
                </template>

                <a-button 
                    draggable="true" 
                    @dragstart="(event) => onDragAdd(event, item)" 
                    style="font-size:14px;min-width:100px;margin-top:10px;margin-right:8px;"
                    v-for="(item,index) in typeData" 
                    :key="index" 
                    :value="item.code">{{ item.value }}</a-button>
            
                <a-divider type="horizontal" />
                <div @drop="onDrop" @dragover.prevent style="min-height:600px;">
                    <a-table
                        ref="stepTable" 
                        size="middle" 
                        :pagination="paginationConfig" 
                        :row-key="(record, index) => record.id" 
                        :columns="stepColumns" 
                        :dataSource="stepData" 
                        :loading="stepLoading" 
                        :customRow="stepCustomRow" 
                        draggable="false"> 
                        <template #serial="{ text, record, index }">
                            {{ index + 1 }}
                        </template>
                        <template #description="{ text, record }">
                            {{ getFlowStepDesc(record) }}
                        </template>
                        <template #action="{ text, record }">
                            <a v-if="hasPerm('exp_flow_step:edit')" @click="doMethod(record)">执行</a>
                            <a-divider type="vertical" v-if="hasPerm('exp_flow_step:edit')" />
                            <a v-if="hasPerm('exp_flow_step:edit')" @click="$refs.editStepForm.edit(record)">编辑</a>
                            <a-divider type="vertical" v-if="hasPerm('exp_flow_step:delete')" />          
                            <a-popconfirm v-if="hasPerm('exp_flow_step:delete')" placement="topRight" title="确认删除本步骤？" @confirm="() => exp_flow_step_delete(2,record)">
                                <a>删除</a>
                            </a-popconfirm>
                        </template>
                    </a-table>
                </div>
            </a-card>
        </a-col>
    </a-row>
    
    <edit-parent-form ref="editParentForm" @ok="handleParentOk" />     
    <edit-step-form ref="editStepForm" @ok="handleOk" />  

    <a-modal v-model:visible="interventionModal.visible" :title="interventionModal.title" :maskClosable="false" @ok="handleIntervention">
      <div>
        <span class="span-label">案例编号：</span>
        <span style="color:black;">{{interventionModal.flowCode}}</span>
      </div>
      <div style="margin-top:10px;">
        <span class="span-label">案例名称：</span>
        <span style="color:black;">{{interventionModal.flowName}}</span>
      </div>
      <div style="margin-top:10px;">
        <span class="span-label">节点名称：</span>
        <span style="color:black;">{{interventionModal.nodeName}}</span>
      </div>
      <div style="margin-top:10px;">
        <span class="span-label">步骤名称：</span>
        <span style="color:black;">{{interventionModal.stepName}}</span>
      </div>
      <div style="margin-top:10px;">
        <span class="span-label">描述：</span>
        <span style="color:black;">{{interventionModal.content}}</span>
      </div>
      <div style="margin-top:10px;display: flex; align-items: flex-start;">
        <span class="span-label">处理意见：</span>
        <a-textarea placeholder="请输入处理意见" style="width:250px;font-size:16px;color:black;" :rows="3" v-model:value="interventionModal.remark" />
     </div>
    </a-modal>

    <a-modal v-model:visible="copyModal.visible" title="复制程序集" :maskClosable="false" @ok="handleCopy">
      <div>
        <span class="span-label">来源：</span>
        <span style="color:black;">{{copyModal.oldName}}</span>
      </div>
      <div style="margin-top:10px;">
        <span class="span-label">名称：</span>
        <a-input v-model:value="copyModal.newName" style="width: 200px;" />
     </div>
    </a-modal>  

    <a-modal v-model:visible="copyAllModal.visible" title="复制所有程序集" :maskClosable="false" @ok="handleCopyAll">
      <div>
        <span class="span-label">源布局：</span>
        <a-select style="width: 250px;color:black;" placeholder="请选择盘面布局" v-model:value="copyAllModal.oldLayoutId">
            <a-select-option v-for="(item, index) in layoutData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </div>
      
      <div style="margin-top: 5px;">
        <span class="span-label">新布局：</span>
        <a-select style="width: 250px;color:black;" placeholder="请选择盘面布局" v-model:value="copyAllModal.newLayoutId">
            <a-select-option v-for="(item, index) in layoutData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </div>
    </a-modal>  
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { 
  PlusOutlined, 
  CopyOutlined, 
  DownOutlined, 
  PlayCircleOutlined, 
  StopOutlined, 
  PauseOutlined, 
  RedoOutlined 
} from '@ant-design/icons-vue'
import { doStepMethod, exp_equipment_setAllCurrentStatus } from '@/api/modular/experiment/debug'  
import { exp_flow_case_addTemporaryFlow, exp_flow_case_handleIntervention } from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_step_list, exp_flow_step_delete, exp_flow_step_updateSort, exp_flow_step_edit, exp_flow_step_copy, exp_flow_step_copyByLayout } from '@/api/modular/experiment/expFlowStepManage'
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
import { exp_liquid_list } from '@/api/modular/experiment/liquidManage'
import { exp_equipment_list } from '@/api/modular/experiment/equipmentManage'
import { exp_consumable_list, exp_consumable_getConsumableTags } from '@/api/modular/experiment/consumableManage'
import { exp_layout_getShippingSpaces } from '@/api/modular/experiment/layoutManage'
import { exp_layout_list } from '@/api/modular/experiment/layoutManage'
import editParentForm from './editParentForm.vue'
import editStepForm from './editStepForm.vue'
import { hasPerm } from '@/utils/permissions'
import { message } from 'ant-design-vue'
import store from '@/store'
import * as SignalR from '@microsoft/signalr'

// 配置信息（临时解决方案）
const site_config = {
  api_service: 'http://localhost:5566',
  proxy: false
}

export default defineComponent({
  name: 'ExpFlowStepManage',
  components: {
    editParentForm,
    editStepForm,
    PlusOutlined,
    CopyOutlined,
    DownOutlined,
    PlayCircleOutlined,
    StopOutlined,
    PauseOutlined,
    RedoOutlined
  },
  data () {
    return {
      advanced: false, // 高级搜索 展开/关闭
      layoutLoading: false,
      parentLoading: false,
      stepLoading: false,
      queryParam: {},
      layoutColumns: [   
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '45px',
          slots: { customRender: 'serial' }
        },  
        {
          title: '布局名称',
          width:'150px',
          dataIndex: 'name'
        }
      ],
      stepParentColumns: [   
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '45px',
          slots: { customRender: 'serial' }
        },   
        {
          title: '编号',
          width:'90px',
          dataIndex: 'code'
        },
        {
          title: '程序名称',
          dataIndex: 'name'
        }
      ],
      stepColumns: [   
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '45px',
          slots: { customRender: 'serial' }
        },       
        {
          title: '步骤名称',
          width:'120px',
          dataIndex: 'name'
        },
        {
          title: '步骤详述',
          width:'300px',
          dataIndex: 'description',
          slots: { customRender: 'description' }
        },
        {
          title: '排序',
          width:'100px',
          dataIndex: 'sort'
        }
      ],
      paginationConfig: {
          pageSize: 20, // 每页显示条数
          showSizeChanger: true, // 显示每页条数切换器
          pageSizeOptions: ['20', '40', '60'], // 可选的每页条数
      },
      tstyle: { 'padding-bottom': '0px', 'margin-bottom': '10px' },
      // 数据
      stepData: [],
      stepParentData: [],
      layoutData: [],
      typeData:[],
      liquidRanges:[],
      consumableTagData:[],
      equipmentData:[],
      liquidData:[],
      shippingSpaceData:[],
      draggedData: null, // 用于存储拖动的数据
      dragAdd:false,
      selectLayoutNode:null,
      selectStepParentNode:null,
      selectStepNode:null,

      stepRowRunningIndex:0,
      stepRowRunning:false,
      scriptRunning:false,
      currentStatus:3,

      sourceObj: null,
      targetObj: null,
      interventionModal:{
          visible: false,
          stepId:0,
          stepName:'',
          status:0,
          title:'任务[人工干预]',
          content:'人工裂红处理1',
          remark:'',
          flowCode:'',
          flowName:'',
          flowId:0,
          nodeId:0,
          nodeName:'',
      },
      copyModal:{
          visible:false,
          id:0,
          oldName:'',
          newName:'',
      },
      copyAllModal:{
          visible:false,
          oldLayoutId:0,
          newLayoutId:0,
      },

      refreshTime:null,
      mySocket:null,
      base_url: site_config.proxy ? '' : site_config.api_service
    }
  },
  created () {
    console.log('实验步骤管理页面 - 开始初始化')
    
    if (this.hasPerm('exp_flow_step:edit') || this.hasPerm('exp_flow_step:delete')) {
      this.stepColumns.push({
        title: '操作',
        width: '135px',
        dataIndex: 'action',
        slots: { customRender: 'action' }
      })

      this.stepParentColumns.push({
        title: '操作',
        width: '135px',
        dataIndex: 'action',
        slots: { customRender: 'action' }
      })
    }
    
    this.startSocket()
    this.sysDictTypeDropDown()
    this.getLayoutData()
    this.getEquipmentData()
    this.getLiquidData()
  },
  mounted() {
      this.refreshTime = setInterval(this.refreshFun, 10000)
  },
  beforeUnmount() {
      clearInterval(this.refreshTime) // 清除定时器
  },
  methods: { 
      hasPerm,
      startSocket() {
          console.log('=========startSocket--------->')
          console.log(this.base_url+'/hubs/chathub')
          const token = store.getters.token

          this.mySocket = new SignalR.HubConnectionBuilder()
              .configureLogging(SignalR.LogLevel.Information)
              .withUrl(
                  `${this.base_url}/hubs/chathub`, {
                  accessTokenFactory: () => token,
                  skipNegotiation: true,
                  transport: SignalR.HttpTransportType.WebSockets,
                  keepAliveIntervalInMilliseconds: 10000 // 每10秒发送一次心跳
                  }
              ).build()
          
          this.mySocket.on('AppendNotice', (notice) => { 
          })

          this.mySocket.on('PublicMessage', (message) => { 
              // console.log('收到信息----->'+message)
          })

          this.mySocket.on('PublicNotice', (notice) => {
              if(notice.type==3) {
                  if(this.stepData.length>0) {
                      var steps=this.stepData.filter(item => item.id == notice.stepId)
                      if(steps.length>0)
                          this.stepRowRunningIndex=steps[0].sort
                  }
                  if(notice.status===8) {
                      this.interventionModal.stepId=notice.stepId
                      this.interventionModal.stepName=notice.stepName
                      this.interventionModal.status=notice.status
                      this.interventionModal.title=notice.title
                      this.interventionModal.content=notice.content
                      this.interventionModal.remark=notice.remark
                      this.interventionModal.flowCode=notice.flowCode
                      this.interventionModal.flowName=notice.flowName
                      this.interventionModal.flowId=notice.flowId
                      this.interventionModal.nodeName=notice.nodeName
                      this.interventionModal.visible=true
                      console.log('=========等待人工处理==========')
                      console.log(this.interventionModal)
                  }
              }
              else if(notice.type==1) {
                  this.stepRowRunning=false
                  this.currentStatus=3
                  this.stepRowRunningIndex=0
              }
              else if(notice.type==2) {
                  this.stepRowRunningIndex=0
              }        
          })

          this.mySocket.onclose(() => {
              console.log('----->attempting to reconnect....>>>>>')
              setTimeout(() => {
              this.startSocket()
              }, 5000) // 尝试在5秒后重连
          })

          this.mySocket.start().then(() => {
              console.log('Connected to the hub')
          })
          .catch(err => {
              console.error('Error while connecting:', err)
          })
      },
      refreshFun() {
          this.mySocket.invoke("ClientMethod",'Heartbeat Message!!!!!!!!!!!!!!')
      },
      setCurrentStatus(cstatus) {
          exp_equipment_setAllCurrentStatus({status:cstatus}).then((res) => {
              if (res.success) {
                 this.currentStatus=cstatus
                 if(cstatus==3) {
                      this.stepRowRunning=false
                      this.currentStatus=3
                      this.stepRowRunningIndex=0
                      message.success('已停止执行')
                 }
              } else {
                  message.error('更新状态失败')
              }
          }).catch((err) => {
              message.error('异常：' + err.message)
          })
      },      
      handleIntervention(){
          var data={
              id:this.interventionModal.stepId,
              status:2,
              remark:this.interventionModal.remark
          }
          exp_flow_case_handleIntervention(data).then((res) => {
              if (res.success) {
                  this.interventionModal.visible=false
                  message.success('发送成功')
              } else {
                  message.error('发送失败')
              }
          }).catch((err) => {
              message.error('异常：' + err.message)
          })
      },
      doMethod(record){
          this.stepLoading=true
          doStepMethod(record).then((res) => {
              console.log('=========doMethod==========')
              console.log(res)
              this.stepLoading=false
              if (res.success) 
                  message.success('执行成功!')
              else
                  message.error('执行失败：' + res.message)
          }).catch((err) => {
              this.stepLoading=false
              message.error('执行错误：' + err.message)
          })
      },
      copySummary(record){
          this.copyModal.visible=true
          this.copyModal.id=record.id
          this.copyModal.oldName=record.name
          this.copyModal.newName=record.name+"_copy"
      },
      handleCopy(){
          if(this.copyModal.newName==''){
              message.error('请输入新名称')
              return
          }
          var data={id:this.copyModal.id,name:this.copyModal.newName}
          this.parentLoading=true
          exp_flow_step_copy(data).then((res) => {
              this.copyModal.visible=false
              this.parentLoading=false
              if (res.success) {    
                  this.loadFlowStepData(1)             
                  message.success('复制成功')
              } else {                    
                  message.error('复制失败')
              }
          })
      },
      handleCopyAll(){
          var data={oldLayoutId:this.copyAllModal.oldLayoutId,newLayoutId:this.copyAllModal.newLayoutId}
          this.parentLoading=true
          this.copyAllModal.visible=false
          exp_flow_step_copyByLayout(data).then((res) => {
              this.copyAllModal.visible=false
              this.parentLoading=false
              if (res.success) {    
                  this.loadFlowStepData(1)            
                  message.success('复制成功')
              } else {                    
                  message.error('复制失败')
              }
          })
      },
      executeSummary1(){
          if(this.selectStepParentNode==null) {                
              message.info('请先选择程序集!') 
          }
          else {
              var key=Date.now()
              var data={
                  type:1,
                  flowId:this.selectStepParentNode.id,
                  code:this.selectStepParentNode.code+"_"+key,
                  name:this.selectStepParentNode.name+"_"+key,
                  sampleCode:this.selectStepParentNode.code+"_"+key,
              }                
              exp_flow_case_addTemporaryFlow(data).then((res) => {
                  if (res.success) {
                      this.stepRowRunning=true
                      this.currentStatus=1
                      this.startSocket()
                      message.success('任务发送成功')
                  } else {
                      this.stepRowRunning=false
                      this.stepRowRunningIndex=0
                      message.error('任务发送失败')
                  }
              })
          }
      },
      executeSummary(record){
          var key=Date.now()
          var data={
              type:1,
              flowId:record.id,
              code:record.code+"_"+key,
              name:record.name+"_"+key,
              sampleCode:record.code +"_"+key,
          }
          
          exp_flow_case_addTemporaryFlow(data).then((res) => {
              if (res.success) {
                   this.stepRowRunning=true
                  this.currentStatus=1
                  message.success('任务发送成功')
              } else {
                  this.stepRowRunning=false
                  this.stepRowRunningIndex=0
                  message.error('任务发送失败')
              }
          })
      },
      getFlowStepDesc(record) {
          var remark=''
          var tagName=''
          var spaceName=''
          var liquidName=''
          var equipmentName=''
          var tag=this.consumableTagData.filter(item => item.id == record.consumableTagId)
          if(tag.length>0)
          tagName=tag[0].name
          var space=this.shippingSpaceData.filter(item => item.id == record.targetSpaceId)
          if(space.length>0)
          spaceName=space[0].name
          var liquid=this.liquidData.filter(item => item.id == record.liquidId)
          if(liquid.length>0)
          liquidName=liquid[0].name
          var equipment=this.equipmentData.filter(item => item.id == record.equipmentId)
          if(equipment.length>0)
          equipmentName=equipment[0].name

          switch(record.type) {
              case 0://命令脚本
                  remark= equipmentName.concat(' ').concat(record.cmdScript)
                  break
              case 1://取枪头
                  var fl=this.liquidRanges.filter(item => item.code == record.liquidRange)
                  if(fl.length>0)
                  remark=equipmentName.concat(' ').concat(fl[0].value).concat(' ul').concat(' 枪头')
                  break
              case 2://退枪头
                  var f1=(record.releaseTipSourcePos)?'退回原位':'丢弃'
                  var f2=(record.useReleaseTipSourcePos)?'复用':'不复用'
                  remark= equipmentName.concat(' ').concat(f1).concat(' ').concat(f2)
                  break
              case 3://吸液
                  remark= equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr)
                  break
              case 4://喷液
                  remark= equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr)
                  break
              case 5://混合
                  remark= equipmentName.concat(' ').concat(tagName).concat(' ').concat(liquidName).concat(' ').concat(record.volume).concat('ul').concat(' 孔 : ').concat(record.holeIndexStr).concat(' ').concat(record.mixTime).concat(' 次')
                  break
              case 6://等待
                  remark= '等待时间 : '.concat(record.waitTime).concat('秒')
                  break
              case 7://夹取                
                  remark= equipmentName.concat(' 源耗材 : ').concat(tagName).concat(' ').concat(record.holeIndexStr)
                  break
              case 8://人工干预              
                  remark= record.remark
                  break
              case 9://放置                
                  remark= equipmentName.concat(' 目标舱位 : ').concat(spaceName).concat(' ').concat(record.holeIndexStr)
                  break
              default://控制器
                  remark= '控制方法 : '.concat(record.methodDescription).concat(' 参数 : ').concat(this.formatExecuteParam(record.executeParam))
                  break
          }
          return remark
      },
      formatExecuteParam(params) {
          if(params==null || params=='') 
              return []
          else {
              var temp=JSON.parse(params)
              var data=[]
              temp.forEach(item => {
                  data.push(""+item.paramName+":"+item.value+"")
              })
              var str="("+data.map(item => item).join(',')+")"
              return str                
          }
      },
      addParentForm() {
          if(this.selectLayoutNode==null) {
              message.info('请先选择布局!')
              return
          }
          this.$refs.editParentForm.add({
              id:0,
              pid:0,
              layoutId:this.selectLayoutNode.id,
              channelRow:1,
              channelCol:1,
              isClipRelease:true,
              isSpecialAction:false,
              releaseTipSourcePos:false,
              useReleaseTipSourcePos:false,
              sort: this.stepParentData.length+1
          })
      },
      loadFlowStepData(flag) {
          console.log('加载实验步骤数据，flag:', flag)
          
          var data={}
          if(flag==1) {
              data={layoutId:this.selectLayoutNode.id,pid:0}
              this.parentLoading=true
          }
          else {
              data={pid:this.selectStepParentNode.id}
              this.stepLoading=true
          }
          
          exp_flow_step_list(data).then((res) => {
              console.log('exp_flow_step_list API 响应:', res)
              if (res.success) {
                  if(flag==1) {
                      this.stepParentData=res.data
                      this.removeEmptyChildren(this.stepParentData)
                  }
                  else {
                      this.stepData=res.data
                      this.removeEmptyChildren(this.stepData)
                  }
              } else {
                  message.error('数据加载失败：' + (res.message || '未知错误'))
              }
          }).catch((err) => {
              console.error('加载步骤数据失败:', err)
              message.error('数据加载异常：' + err.message)
          }).finally(() => {
              this.parentLoading=false
              this.stepLoading=false
          })
      },
      layoutCustomRow(record) {
          return {
              on: {
                  click: () => {
                      this.selectLayoutNode=record
                      console.log('layout row on click')  
                      this.loadFlowStepData(1)   
                      this.getConsumableTagData()
                      this.getShippingSpaceData()
                      this.stepData=[]                    
                  }
              },                
              style: {
                  backgroundColor: this.selectLayoutNode==record ? ('#'+this.$store.getters.color.slice(1)+'15') : '', 
              },
          }
      },
      stepParentCustomRow(record) {
          return {
              on: {
                  click: () => {
                      this.selectStepParentNode=record
                      console.log('parent row on click')
                      console.log(record)
                      this.loadFlowStepData(2) 
                  },
                  mouseenter: (event) => {
                      event.target.draggable = true
                  },
                  dragstart: (event) => {
                      event.stopPropagation()
                      this.sourceObj = record
                      console.log("源数据 "+ this.sourceObj.id)
                  },
                  dragover: (event) => {
                      event.preventDefault()                        
                  },
                  drop: (event) => {
                      event.preventDefault()                         
                      if(this.sourceObj!=null) {
                          this.targetObj = record
                          console.log("目标数据 "+ this.targetObj.id)

                          var data={...this.sourceObj}
                          data.sort=this.targetObj.sort
                          exp_flow_step_edit(data).then((res) => {
                              this.parentLoading = false
                              if (res.success) {
                                  this.loadFlowStepData(1)
                              } else {
                                  message.error('数据刷新失败')
                              }
                          })
                      }
                  },
                  
              },
              style: {
                  backgroundColor: this.selectStepParentNode==record ? ('#'+this.$store.getters.color.slice(1)+'15') : '', 
              },
          }
      },
      onDragAdd(event,item) {            
          if(this.selectLayoutNode==null) {
              message.info('请先选择布局!')
              return
          }
          if(this.selectStepParentNode==null) {
              message.info('请先选择程序集!')
              return
          }
          this.dragAdd=true
          this.draggedData = item
      },
      onDrop(event){
          event.preventDefault() // 确保默认行为被阻止
          if(this.dragAdd) {
              this.$refs.editStepForm.add({
                  id:0,
                  name:this.draggedData.value,
                  code:this.selectStepParentNode.code+''+(this.stepData.length+1).toString().padStart(2, '0'),
                  pid:this.selectStepParentNode.id,
                  pids:'[0],['+this.selectStepParentNode.id+']',
                  layoutId:this.selectLayoutNode.id,
                  type:this.draggedData.code,
                  sort:this.stepData.length+1,
                  volume:0,
                  mixTime:1,
                  waitTime:0,
                  liquidRange:50, 
                  releaseTipSourcePos:false,
                  useReleaseTipSourcePos:false,
                  channelRow:1,
                  channelCol:1,
                  xOffset:0,
                  yOffset:0,
                  zOffset:0,
                  isClipRelease: true,
                  SpecialMethod:'',
                  isStepStopDetectLiquid:false,
                  isStepAbsorAndJet:false,
              })
              this.draggedData = null 
              this.dragAdd=false
          }
      },
      stepCustomRow(record) {
          return {
              on: {
                  click: () => {
                      this.selectStepNode=record
                      console.log('step row on click')     
                      console.log(record)                    
                  },
                  mouseenter:(event) =>{
                      event.target.draggable = true
                  },
                  dragstart: (event) => {
                      event.stopPropagation()
                      this.dragAdd=false
                      this.sourceObj = record
                      console.log("源数据 "+ this.sourceObj.id)
                  },
                  dragover: (event) => {
                      event.preventDefault()                        
                  },
                  drop: (event) => {
                      event.preventDefault()                         
                      if(this.dragAdd==false && this.sourceObj!=null) {
                          this.targetObj = record
                          console.log("目标数据 "+ this.targetObj.id)

                          var data={...this.sourceObj}
                          data.sort=this.targetObj.sort
                          exp_flow_step_edit(data).then((res) => {
                              this.layoutLoading = false
                              if (res.success) {
                                  this.loadFlowStepData(2)
                              } else {
                                  message.error('数据刷新失败')
                              }
                          })
                      }
                  },
              },                
              style: {
                  backgroundColor: this.getStepRowBackground(record),
              },
          }
      },   
      getStepRowBackground(record) {
          if(this.stepRowRunning) {
              if(record.sort<this.stepRowRunningIndex)
                  return "#a6e698"
              else if(this.stepRowRunningIndex==record.sort)
                  return "#d5eb0b"
              else
                  return ""
          }
          else            
              return this.selectStepNode==record ? ('#'+this.$store.getters.color.slice(1)+'15') : ''
      },
      getConsumableTagData() {
        var data={id:this.selectLayoutNode.id}
        exp_consumable_getConsumableTags(data).then((res) => {
          this.consumableTagData = res.data 
        })
      },
      getEquipmentData() {
          exp_equipment_list({}).then((res) => {
            this.equipmentData=res.data
          })
      },
      getLiquidData() {
          exp_liquid_list({}).then((res) => {
              this.liquidData = res.data
          })
      },  
      getShippingSpaceData() {
          var data={id:this.selectLayoutNode.id}
          exp_layout_getShippingSpaces(data).then((res) => {
            this.shippingSpaceData = res.data
          })
      },        
      getLayoutData() {
          console.log('加载布局数据')
          this.layoutLoading = true
          exp_layout_list({}).then((res) => {
              console.log('exp_layout_list API 响应:', res)
              this.layoutLoading = false
              if (res.success) {
                  this.layoutData = res.data || []
                  console.log('布局数据加载成功:', this.layoutData)
              } else {
                  message.error('布局数据加载失败：' + (res.message || '未知错误'))
              }
          }).catch((err) => {
              console.error('加载布局数据失败:', err)
              this.layoutLoading = false
              message.error('布局数据加载异常：' + err.message)
          })
      },
      removeEmptyChildren(data) {
          if (data == null || data.length === 0) return
          for (let i = 0; i < data.length; i++) {
            const item = data[i]
            item.children = null
            if (item.children != null && item.children.length === 0) {
                // item.children = null
            } else {
                this.removeEmptyChildren(item.children)
            }
          }
      },
      typeFilter(type) {
          const values = this.typeData.filter(item => item.code == type)
          if (values.length > 0) {
              return values[0].value
          }
      },
      /**
       * 获取字典数据
       */
      sysDictTypeDropDown() {
          console.log('加载字典数据')
          sysDictTypeDropDown({ code: 'flow_step_type' }).then((res) => {
              console.log('flow_step_type 字典数据:', res)
              if (res.success) {
                this.typeData = res.data.filter(item => item.code != '-1')
                this.typeData.forEach((item) => {
                    item.code=parseInt(item.code)
                })
                console.log('步骤类型数据:', this.typeData)
              }
          }).catch((err) => {
              console.error('加载步骤类型字典失败:', err)
          })

          sysDictTypeDropDown({code: 'liquid_range'}).then((res) => {
            console.log('liquid_range 字典数据:', res)
            if (res.success) {
              this.liquidRanges = res.data
              this.liquidRanges.forEach((item) => {
                  item.code=parseInt(item.code)
              })
              console.log('液体范围数据:', this.liquidRanges)
            }
          }).catch((err) => {
              console.error('加载液体范围字典失败:', err)
          })
      },
      exp_flow_step_delete (flag,record) {
          exp_flow_step_delete(record).then((res) => {
            if (res.success) {
                message.success('删除成功')
                this.loadFlowStepData(flag)
            } else {
                message.error('删除失败：' + (res.message || '未知错误'))
            }
          }).catch((err) => {
              message.error('删除异常：' + err.message)
          })
      },
      handleOk () {
          this.loadFlowStepData(2)
      },
      handleParentOk () {
          this.loadFlowStepData(1)
      }
  }
})
</script>

<style scoped>
.table-operator {
    margin-bottom: 18px;
}
button {
    margin-right: 8px;
}
.ant-table-selection-column {
    display: none; 
}

.selected-row {
  background-color: #e6f7ff; 
}

:deep(.ant-table-body){
  overflow-y: auto;
}

.span-label{
  width: 140px;
  text-align: right;
  display:inline-block;
  color: black;
}

:deep(.row-running) {
  background-color: #d5eb0b; 
}
:deep(.row-finish) {
  background-color: #a6e698; 
}
</style>
