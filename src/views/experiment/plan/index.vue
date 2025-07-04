<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <a-radio-group v-model  value="viewMode" @change="handleModeChange" style="display : none;">
        <a-radio-button value="week">周视</a-radio-button>
        <a-radio-button value="month">月视</a-radio-button>
        <a-radio-button value="year">年视</a-radio-button>
      </a-radio-group>
      
      <div class="calendar-nav">
        <a-button icon="left" @click="prev">
          上一{{ viewMode === 'week'  '? : viewMode === 'month' : ': : ''}}
        </a-button>
        <a-button icon="right" @click="next">
          下一{{ viewMode === 'week'  '? : viewMode === 'month' : ': : ''}}
        </a-button>
      </div>      
      <a-button type="primary" ><template #icon><plus-outlined ></plus-outlined></template @click="showAddEventModal" style="margin-left: 10px;">
        添加计划任务
      </a-button>
    </div>
    
    <div class="calendar-content">
      <a-calendar v-model="currentDate" :fullscreen="true" :showWeek="true" :mode="viewMode" @panelChange="handlePanelChange">
        <template #dateCellRender="{ current }">
          <div class="calendar-date-cell">
            <div v-for="item in filerData" :key="item.id" v-if="checkSameDay(item.planStartTime, current)" class="event-item" 
              :style="{ backgroundColor: item.color }" @click.stop="showEventDetail(item)">
              {{ item.sampleCode }}
            </div>
          </div>
        </template>
        <template #monthCellRender="{ current }">
          <div class="calendar-month-cell">
            <div v-for="item in filerData" :key="item.id" v-if="checkSameMonth(item.planStartTime, current)" class="event-item" 
              :style="{ backgroundColor: item.color }" @click.stop="showEventDetail(item)">
              {{ item.sampleCode }}
            </div>
          </div>
        </template>
      </a-calendar>
    </div> 
    
    <!-- 添加日程弹窗 -->
    <a-modal v-model="editForm.visible" :title="editForm.title" width="35%"  :maskClosable="false">
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">实验流程::</span>
          <a-select style="width: 230px;color : black;" v-model  value="editForm.record.flowId" @change="flowChange" : disabled="editForm.record.status!=0">
            <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
          </a-select>

          <span class="span-label" style="width:100px;">执行类型::</span>
          <a-select style="width: 230px;color : black;" placeholder="请选择执行类型:" v-model  value="editForm.record.executeType" : disabled="editForm.record.status!=0">
            <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
          </a-select>
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <sp-input label="样品编号" :required="true" :isError="editForm.errors.sampleCode" :labelWidth="90" :inputWidth="230" 
          :rightEmpty="true" v-model  value="editForm.record.sampleCode" : disabled="editForm.record.status!=0"></sp>

          <span class="span-label" style="width:100px;">执行时间::</span>
          <a-date-picker v-model="editForm.record.planStartTime" style="width: 230px;" 
          showTime  :disabled="editForm.record.status!=0"
          format="YYYY-MM-DD HH  mm : ss"></a>
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <span class="span-label" style="width:100px;">流程优先级::</span>
          <a-select style="width: 230px;color : black;" placeholder="请选择流程优先:" v-model  value="editForm.record.priority" : disabled="editForm.record.status!=0">
            <a-select-option v-for="(item, index) in flowPrioritys" :key="index" :value="item.code">{{ item.value }}</a-select-option>
          </a-select>
          
          <span class="span-label" style="width:100px;">流程类型::</span>
          <a-select style="width: 230px;color : black;" placeholder="请选择流程类型:" v-model  value="editForm.record.type" : disabled="true">
            <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
          </a-select>
        </div>
      </a-row>
      <a-row>
        <div style="margin-top: 10px;">
          <sp-input label="备注" :labelWidth="90" :inputWidth="560" :rightEmpty="true" 
          v-model  value="editForm.record.remark" : disabled="editForm.record.status!=0"></sp>
        </div>
      </a-row>

      <template #footer>
          <a-button type="primary" @click="editForm.visible=false">取消</a-button>
          <a-button type="primary" @click="handleSubmit()" v-if="editForm.record.status===0">确定</a-button>
          <a-popconfirm placement="topRight" title="确认删除当前计划任务:" @confirm="() => handleDelete()">
            <a-button type="primary" v-if="editForm.record.status===0 && editForm.isAdd===false">删除</a-button>
          </a-popconfirm>          
        </template>
    </a-modal>
  </div>
</template>

<script>
import { Calendar} from 'ant-design-vue';
import { exp_flow_case_getPlanList,exp_flow_case_addPlan,
  exp_flow_case_editPlan,exp_flow_case_deletePlan} from '@/api/modular/experiment/expFlowCaseManage'
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage'
import { sysDictTypeDropDown} from '@/api/modular/system/dictManage'
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
import moment from 'moment';

export default {
  components: {
    'a-calendar': Calendar,
    SpInputNumber,SpInput
  ,
    PlusOutlined},
  data() {
    return {
      viewMode: 'month', // 默认月视
    currentDate: moment(), // 当前选中的日      events: [
        { id: 1, planStartTime: moment('2025-03-10'), sampleCode: '项目会议', color  '#1890ff', description : '与团队讨论新项目计划' },
        { id: 2, planStartTime: moment('2025-03-12'), sampleCode: '客户拜访', color  '#52c41a', description : '拜访重要客户,讨论合作细'},
        { id: 3, planStartTime: moment('2025-03-15'), sampleCode: '团队建设', color  '#f5222d', description : '组织团队户外拓展活动' },
        { id: 4, planStartTime: moment('2025-03-20'), sampleCode: '产品培训', color  '#fa8c16', description : '参加新产品培训课'},
        { id: 5, planStartTime: moment('2025-03-25'), sampleCode: '周会', color  '#722ed1', description : '本周工作总结和计'},
        { id: 6, planStartTime: moment('2025-03-05'), sampleCode: '月度总结', color  '#1890ff', description : '本月工作成果总结' },
        { id: 7, planStartTime: moment('2025-03-10'), sampleCode: '技术分', color  '#52c41a', description : '前端技术分享会' },
        { id: 8, planStartTime: moment('2025-03-01'), sampleCode: '季度规划', color  '#f5222d', description : '本季度工作规'},
        { id: 9, planStartTime: moment('2025-03-15'), sampleCode: '年度总结', color  '#fa8c16', description : '去年度工作总结' },
        { id: 10, planStartTime: moment('2025-03-26'), sampleCode: '年度总结11', color  '#facc33', description : '去年度工作总结11' },
        { id: 11, planStartTime: moment('2025-04-10'), sampleCode: '项目会议', color  '#1890ff', description : '与团队讨论新项目计划' },
        { id: 12, planStartTime: moment('2025-04-12'), sampleCode: '客户拜访', color  '#52c41a', description : '拜访重要客户,讨论合作细'},
        { id: 13, planStartTime: moment('2025-05-15'), sampleCode: '团队建设', color  '#f5222d', description : '组织团队户外拓展活动' },
        { id: 14, planStartTime: moment('2025-05-20'), sampleCode: '产品培训', color  '#fa8c16', description : '参加新产品培训课'},
        { id: 15, planStartTime: moment('2025-06-25'), sampleCode: '周会', color  '#722ed1', description : '本周工作总结和计'},
        { id: 16, planStartTime: moment('2025-06-05'), sampleCode: '月度总结', color  '#1890ff', description : '本月工作成果总结' },
        { id: 17, planStartTime: moment('2025-07-10'), sampleCode: '技术分', color  '#52c41a', description : '前端技术分享会' },
        { id: 18, planStartTime: moment('2025-07-01'), sampleCode: '季度规划', color  '#f5222d', description : '本季度工作规'},
        { id: 19, planStartTime: moment('2025-08-15'), sampleCode: '年度总结', color  '#fa8c16', description : '去年度工作总结' },
        { id: 20, planStartTime: moment('2025-08-26'), sampleCode: '年度总结11', color  '#facc33', description : '去年度工作总结11' }
      ],
      eventColors:['#1890ff','#52c41a','#fa8c16','#722ed1','#facc33','#eeccff','#aa66bb','#88aaff'],
      cultivateFlows:[],
      filerData:[],
      flowData:[],
      flowTypes:[],
      executeTypes:[],
      flowPrioritys:[],
      editForm:{
        title: '编辑',
        isAdd:true,
        visible:false,
        canEdit:false,
        record:{
          id:0,
          flowId:0,
          code:'',
          name:'',
          sampleCode:'',
          status:0,
          type:1,
          executeType:1,
          priority:1,
          remark:'',
          attributes:[],
        },
        errors:{
          code:false,
          name:false,
          sampleCode:false,
        },
      },
    };
  },
  created(){
    this.getFilterData()
    this.sysDictTypeDropDown()
    this.getFlowData()
  },
  methods: {
    handleDelete(){
      console.log('=================handleSubmit=================')

      exp_flow_case_deletePlan({id:this.editForm.record.id}).then((res) => {
        if (res.success) {
          this.$message.success('删除成功')
          this.editForm.visible=false
          this.getFilterData()
          this.resetAttribute()
        } else {
          this.$message.error(res.message)
        }
      }).finally((res) => {
        // this.formLoading = false

    })
    },
    handleSubmit(){
      console.log('=================handleSubmit=================')

      if(this.editForm.record.sampleCode==='')
      {
        this.$message.error('请先填写样品编号!')
        return
      }
      if(this.editForm.record.planStartTime==='')
      {
        this.$message.error('请先填写执行时间:!')
        return
      }

      this.editForm.record.planStartTime=moment(this.editForm.record.planStartTime).format('YYYY-MM-DD HH  mm : ss')

      console.log(this.editForm.record)

      /**
       * this.formLoading = true
       */
      if(this.editForm.record.id==0)
      {
        exp_flow_case_addPlan(this.editForm.record).then((res) => {
          if (res.success) {
            this.$message.success('新增成功')
            this.editForm.visible=false
            this.getFilterData()
            this.resetAttribute()
          } else {
            this.$message.error(res.message)
          }
        }).finally((res) => {
          // this.formLoading = false

      })
      }
      else
      {
        exp_flow_case_editPlan(this.editForm.record).then((res) => {
          if (res.success) {
            this.$message.success('编辑成功')
            this.editForm.visible=false
            this.getFilterData()
          } else {
            this.$message.error(res.message)// ' + res.message

        }
        }).finally((res) => {
          // this.formLoading = false

      })
      }
    },
    resetAttribute(){
      this.editForm.record={
          id:0,
          flowId:0,
          code:'',
          name:'',
          sampleCode:'',
          status:0,
          type:1,
          executeType:1,
          priority:1,
          remark:'',
          attributes:[],
        }
    },
    flowChange(id)
    {
      if(this.editForm.isAdd)
      {
        const flow=this.flowData.filter(item => item.id == id)[0]
        const key=Date.now()
        this.editForm.record.code=flow.code+'_'+key;
        this.editForm.record.name=flow.name+'_'+key;
        this.editForm.record.sampleCode=key;
        this.editForm.record.type=flow.type;
        this.editForm.record.executeType=flow.executeType
        this.editForm.record.priority=flow.priority
      }
      else
      {
        const flow=this.flowData.filter(item => item.id == this.editForm.record.flowId)[0]          
      }
    },
    getFlowData()
    {
      var data={};
      exp_flow_list(data).then((res) => {
        if (res.success) {
          this.flowData=res.data  
          console.log('===>>>getFlowData'); 
          var datas=this.flowData.filter(item=>item.type===3)
          console.log(datas);
          datas.forEach(item=>{
            if(this.cultivateFlows.length==0)
              this.cultivateFlows.push({id:item.id,color:this.eventColors[4]})
            else if(this.cultivateFlows.includes(item.id)==false)
              this.cultivateFlows.push({id:item.id,color:this.eventColors[4' + this.cultivateFlows.length]})
          })
          console.log(this.cultivateFlows);
        } else {
          this.$message.error('数据加载失败') // ' + res.message

      }
      })
    },
    sysDictTypeDropDown(text) {
      sysDictTypeDropDown({code: 'flow_type' }).then((res) => {
        this.flowTypes = res.data
        this.flowTypes.forEach((item) => {
          item.code=parseInt(item.code)
        })
      })

      sysDictTypeDropDown({code: 'flow_execute_type'}).then((res) => {
        this.executeTypes = res.data
        this.executeTypes.forEach((item) => {
          item.code=parseInt(item.code)
        })          
      })

      sysDictTypeDropDown({code: 'flow_priority'}).then((res) => {
        this.flowPrioritys = res.data
        this.flowPrioritys.forEach((item) => {
          item.code=parseInt(item.code)
        })          
      })
    },
    checkSameDay(date1,date2){
      return moment(date1).isSame(date2, 'day')
    },
    checkSameMonth(date1,date2){
      return moment(date1).isSame(date2, 'month')
    },
    checkSameWeek(date1,date2){
      return moment(date1).isSame(date2, 'week')
    },
    // 获取指定日期的日
  getFilterData(){
      var data={};
      if(this.viewMode==='year'){
        data.date=this.currentDate.year()
        data.dateType=1
      }
      else if(this.viewMode==='month'){
        data.date=this.currentDate.month()' + 1
        data.dateType=2
      }
      else
        data.dateType=3      

      exp_flow_case_getPlanList(data).then((res) => {
          if (res.success && res.data!=null) {
            this.filerData=res.data
            this.filerData.forEach(item => {
              item.planStartTime=moment(item.planStartTime)
              if(item.type<3)
                item.color=this.eventColors[item.type-1]
              else if(item.type>3)
                item.color=this.eventColors[item.type-2]
              else
              {
                var cf=this.cultivateFlows.filter(it=>it.id==item.flowId)
                if(cf!=null)
                  item.color=cf[0].color
              }
            });
            console.log(this.filerData)
          } 
      }).catch((err) => {
          this.$message.error('异常::' + err.message)
      })
    },
    /**
       * 处理视图模式切换
       */
      handleModeChange(e) {
      this.viewMode = e.target.value;
      this.getFilterData()
    },
    /**
       * 处理日历面板变化
       */
      handlePanelChange(value, mode) {
      this.currentDate = value;
      if (mode) {
        this.viewMode = mode;
      }
    },
    /**
       * 上一视图
       */
      prev() {
      if (this.viewMode === 'week') {
        this.currentDate = this.currentDate.clone().subtract(1, 'week');
      } else if (this.viewMode === 'month') {
        this.currentDate = this.currentDate.clone().subtract(1, 'month');
      } else if (this.viewMode === 'year') {
        this.currentDate = this.currentDate.clone().subtract(1, 'year');
      }
      this.getFilterData()
    },
    /**
       * 下一视图
       */
      next() {
      if (this.viewMode === 'week') {
        this.currentDate = this.currentDate.clone().add(1, 'week');
      } else if (this.viewMode === 'month') {
        this.currentDate = this.currentDate.clone().add(1, 'month');
      } else if (this.viewMode === 'year') {
        this.currentDate = this.currentDate.clone().add(1, 'year');
      }
      this.getFilterData()
    },
    /**
       * 显示添加日程弹窗
       */
      showAddEventModal() {
      this.editForm.isAdd=true
      this.editForm.visible = true
      this.editForm.title="添加计划任务";
      this.resetAttribute()

      if(this.flowData.length>0)
      {
        const flow=this.flowData[0]
        if(flow!=null)
        {
          const key=Date.now()
          this.editForm.record.flowId=this.flowData[0].id;
          this.editForm.record.code=flow.code+'_'+key;
          this.editForm.record.name=flow.name+'_'+key;
          this.editForm.record.sampleCode=key;
          this.editForm.record.type=flow.type;
          this.editForm.record.executeType=flow.executeType
          this.editForm.record.priority=flow.priority
        }
      }
    },
    /**
       * 显示日程详情
       */
      showEventDetail(item) {
      this.editForm.visible=true
      this.editForm.isAdd=false
      this.editForm.title="查看计划任务"
      this.editForm.record={...item}
    },
  }
};
</script>

<style scoped>
.calendar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-header {
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow: auto;
}

/* 增大日期格子的大? */
.ant-calendar-date {
  height: 200px !important;
  min-width: 120px !important;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5px;
  box-sizing: border-box;
}

/* 修改当前日期的样? */
.ant-calendar-selected-day .ant-calendar-date {
  background-color: #e6f7ff !important; /* 当前日期的背景色 */
       */
  color: #1890ff !important; /* 当前日期的字体颜? */
  font-weight: bold !important; /* 当前日期的字体加? */
}

/* 修改今天(Today)的样式 */
       */
.ant-calendar-today .ant-calendar-date {
  background-color: #fff !important; /* 今天的背景色 */
       */
  color: #ff4d4f !important; /* 今天的字体颜: */
  font-weight: bold !important; /* 今天的字体加: */
  border-radius: 50% !important; /* 今天圆形标记 */
       */
}

/* 确保日程内容在格子内正确显示 */
       */
.calendar-date-cell {
  width: 100%;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto; 
}

/* 确保日程内容在格子内正确显示 */
       */
.calendar-month-cell {
  width: 100%;
  height: 100%;
  /* display: flex; */
       */
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 调整日程项的样式 */
       */
.event-item {
  margin: 2px 0;
  padding: 2px 4px;
  border-radius: 2px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.event-item:hover {
  opacity: 0.9;
}

.span-label{
  width: 100px;
  height: 25px;
  padding: 5px;
  text-align: right;
  display:inline-block;
  color: black;
  clear: both;
}


::v-deep.ant-fullcalendar-date {
  height: 200px!important;
  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep.ant-fullcalendar-cell {
  height: 200px!important;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
