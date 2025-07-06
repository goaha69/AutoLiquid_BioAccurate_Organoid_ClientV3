<template>
  <div>
    <x-card v-if="hasPerm('exp_flow:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :span="5">
              <a-form-item label="样品编号:">
                <a-input v-model  value="queryParam.sampleCode" allow-clear placeholder="请输入样品编 : " ></a>
              </a-form-item>
            </a-col>
            <!-- <a-col :span="5">
              <a-form-item label="实验流程">
                <a-select style="color: black;" v-model : value="queryParam.flowId" allowClear>
                  <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="流程类型">
                <a-select style="color: black;" v-model : value="queryParam.type" allowClear>
                  <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->
            <a-col :span="4">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
        </div>

      </template>
    </x-card>
    <a-card :bordered="false">
      <s-table ref="table" size="middle" :loading="loading" :pagination="false"
        :columns="columns" :data="loadData" :alert="true"
        :rowKey="(record) => record.id">
        <template #serial="{ text, record, index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template #type="{ text }">
          <span>{{ typeFilter(text) }}</span>
        </template>
        <template #status="{ text }">
          <span>{{ statusFilter(text) }}</span>
        </template>
        <template #flowId="{ text }">
          <span>{{ flowFilter(text) }}</span>
        </template>
        <template #cultivateOrGenerationTime="{ text }">
          <span>{{ formatDate(text) }}</span>
        </template>
        <template #susceptibility1Time="{ text }">
          <span>{{ formatDate(text) }}</span>
        </template>
        <template #susceptibility2Time="{ text }">
          <span>{{ formatDate(text) }}</span>
        </template>
        <template #susceptibility3Time="{ text }">
          <span>{{ formatDate(text) }}</span>
        </template>
        <template #action="{ record }">
          <a-button type="link" @click="showDetail(record)">查看明细</a-button>
          <a-button type="link" @click="showStatusModal(record)">修改状态</a-button>
        </template>
      </s-table>
    </a-card>

    <!--显微镜图像!-->
    <a-modal title="显微镜图像" :open="imageModal.visible" :footer="null" :width="1100" @cancel="clearImageData" @close="clearImageData">
      <image-thumbnail ref="imageThumbnail" :images="imageModal.imageData" />
    </a-modal>

    <!--样品明细模态框 !-->
    <a-modal title="样品明细" :open="detailModal.visible" @ok="handleDetailOk" @cancel="handleDetailCancel" :width="1600">
      <div>
        <p>{{"样品编号::"+detailModal.detailData.sampleCode  }}</p>
        <p>{{"样品状态::"+statusFilter(detailModal.detailData.status) }}</p>
      </div>
      <div class="timeline-container">
        <!-- 时间轴线 -->
        <div class="timeline-line"></div>
        
        <!-- 时间轴节:-->
        <div
          v-for="(item, index) in detailModal.detailData.tracks" :key="index" :class="[
            'timeline-node',
            { 'timeline-node-top': isEven(index), 'timeline-node-bottom': isOdd(index) }
          ]"
        > 
          <div class="timeline-node-dot"></div>
          <div class="timeline-node-content" >
            <div class="timeline-node-time" v-if="item.flowCase!=null">{{ item.flowCase.startTime}}</div>
            <div class="timeline-node-text" v-if="item.flowCase!=null">{{ item.flowCase.name }}</div>
            <div class="timeline-node-subtext" 
            v-if="item.consumables!=null && item.consumables.length>0"
            v-for="(sitem, sindex) in item.consumables" :key="sindex">
              {{ sitem.name +'('+sitem.barcode+')' }}
            </div>
            <div class="timeline-node-subtext" v-if="item.files!=null && item.files.length>0" @click="showImage(item.files)">
              图像
            </div>
            <div class="timeline-node-subtext" v-if="item.readerData!=null && item.readerData.length>0" @click="show384(item.readerData[0].dataScheme)">
              384孔板数据
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!--修改状态模态框 !-->
    <a-modal title="修改状态" :open="statusModal.visible" @ok="handleStatusConfirm" @cancel="handleStatusCancel">
      <div style="margin-bottom: 16px;">
        <span>样品号::</span>
        <span style="color: #666; font-weight : 500;">
          {{ statusModal.record.sampleCode }}
        </span>
      </div>
      <div style="margin-bottom: 16px;">
        <span>原状态::</span>
        <span style="color: #666; font-weight : 500;">
          {{ statusFilter(statusModal.originalStatus) }}
        </span>
      </div>
      <div>
        <span>新状态::</span>
        <a-select v-model="statusModal.record.status" style="width: 200px;" placeholder="请选择新状态:">
          <a-select-option v-for="(value, key) in sampleStatus" :key="key" :value="parseInt(key)">
            {{ value }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>

    <!--384孔板模态框 !-->
    <a-modal v-model:open="Modal384.visible" title="384孔位数据" width="1050px" :footer="null">
      <div class="plate-container">
        <!-- 列号展示 -->
        <div class="column-headers">
          <div class="row-header"></div>
          <div v-for="col in 24" :key="col" class="column-header">
            {{ col }}
          </div>
        </div>
        <!-- 主体表格 -->
        <div v-for="(row, rowIndex) in Modal384.rows" :key="row" class="plate-row">
          <div class="row-header">{{ row }}</div>
          <div
            v-for="col in 24"
            :key="col"
            class="plate-cell"
            :style="{ backgroundColor: Modal384.data[getIndex(rowIndex, col - 1)] == 0 ? '' : '#8ad8bc' }"
          >
            {{ Modal384.data[getIndex(rowIndex, col - 1)] }}
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { STable, Ellipsis, XCard } from '@/components';
import { exp_flow_case_getSamples, exp_flow_case_getSampleDetail, exp_flow_case_UpdateSampleStatus } from '@/api/modular/experiment/expFlowCaseManage';
import { exp_flow_list } from '@/api/modular/experiment/expFlowManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import SpInputNumber from '@/components/spInputNumber.vue';
import SpInput from '@/components/spInput.vue';
import { data } from 'jquery';
import moment from 'moment';
import ImageThumbnail from "@/components/ImageThumbnail.vue";

export default {
  components: {
    XCard,
    STable,
    Ellipsis,
    SpInputNumber,
    SpInput,
    ImageThumbnail
  },
  data() {
    return {
      queryParam: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      loading: false,
      columns: [
        {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '60px',
          slots: { customRender: 'serial' },
        },
        {
          title: '样品编号:',
          dataIndex: 'sampleCode',
        },
        {
          title: '培养箱位',
          dataIndex: 'storageLoc',
        },
        {
          title: '案例编号',
          dataIndex: 'code',
          slots: { customRender: 'code' },
        },
        {
          title: '流程名称',
          dataIndex: 'name',
          slots: { customRender: 'name' },
        },
        {
          title: '流程类型',
          dataIndex: 'type',
          slots: { customRender: 'type' },
        },
        {
          title: '培养日期',
          dataIndex: 'cultivateOrGenerationTime',
          slots: { customRender: 'cultivateOrGenerationTime' },
        },
        {
          title: '距上一次换液天',
          dataIndex: 'lastChangeLiquidDay',
        },
        {
          title: '距上一次传代天',
          dataIndex: 'lastGenerationDay',
        },
        {
          title: '铺板日期',
          dataIndex: 'susceptibility1Time',
          slots: { customRender: 'susceptibility1Time' },
        },
        {
          title: '加药日期',
          dataIndex: 'susceptibility2Time',
          slots: { customRender: 'susceptibility2Time' },
        },
        {
          title: '检测日',
          dataIndex: 'susceptibility3Time',
          slots: { customRender: 'susceptibility3Time' },
        },
        {
          title: '状',
          dataIndex: 'status',
          slots: {
            customRender: 'status',
          },
        },
        {
          title: '操作',
          align: 'center',
          slots: { customRender: 'action' },
        }
      ],
      imageModal:{
        visible: false,
        imageData:[]
      },
      detailModal: {
        visible: false,
        currentRecord: null,
        detailData:{
          sampleCode:'123',
          status:0,
          tracks:[],
        },
      },
      loadData: parameter => {
        return exp_flow_case_getSamples(Object.assign(parameter, this.queryParam)).then((res) => {
          this.pagination.current = res.data.pageNo;
          this.pagination.pageSize = res.data.pageSize;
          return res.data
        })
      }, 
      flowData: [],
      flowStatus: [],
      liquidRanges: [],
      flowTypes: [],
      executeTypes: [],
      flowPrioritys: [],
      // 状态的判断

    sampleStatus: [],
      // 状态模态框是否打开

    statusModal: {
        visible: false,
        record: {},// 存储当前操作的记
      originalStatus: null // 新增属性保存原状      },
      // 384孔板模态框是否打开

    Modal384: {
        visible: false,
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        data: [],
        dataList:[]
      }
    };
  },
  mounted() {
    this.refreshTime = setInterval(this.refreshFun, 10000);
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  },
  beforeUnmount() {
    clearInterval(this.refreshTime);
    this.$socket.off('ReceiveMessage');
  },
  created() {
    this.sysDictTypeDropDown();
    this.getFlowData();
  },
  methods: {
    clearImageData(){
      this.imageModal.visible=false;
      console.log('===this.imageModal.visible=false===');
      this.$refs.imageThumbnail.clearFormData();
    },
    // 判断索引是否为奇
  isOdd(index) {
      return index % 2 !== 0;
    },
    // 判断索引是否为偶
  isEven(index) {
      return index % 2 === 0;
    },
    showDetail(record) {
      this.detailModal.currentRecord = record;
      this.detailModal.visible = true;
      var dd = { id: record.id };
      exp_flow_case_getSampleDetail(dd).then((res) => {
        if(res.success)
        {
          console.log(this.detailModal.detailData.sampleCode)
          this.detailModal.detailData=res.data
          console.log(this.detailModal.detailData.tracks)
        }else {
          this.$message.error('明细数据加载失败!');
        }
      });
    },
    handleDetailOk() {
      this.detailModal.visible = false;
    },
    handleDetailCancel() {
      this.detailModal.visible = false;
    },
    getFlowData() {
      const data = {};
      exp_flow_list(data).then((res) => {
        if (res.success) {
          this.flowData = res.data;
        } else {
          this.$message.error('数据加载失败');
        }
      });
    },
    sysDictTypeDropDown() {
      sysDictTypeDropDown({ code: 'expflow_status' }).then((res) => {
        this.flowStatus = res.data;
        this.flowStatus.forEach((item) => {
          item.code = parseInt(item.code);
        });
      });

      sysDictTypeDropDown({ code: 'liquid_range' }).then((res) => {
        this.liquidRanges = res.data;
        this.liquidRanges.forEach((item) => {
          item.code = parseInt(item.code);
        });
      });

      sysDictTypeDropDown({ code: 'flow_type' }).then((res) => {
        this.flowTypes = res.data;
        this.flowTypes.forEach((item) => {
          item.code = parseInt(item.code);
        });
      });

      sysDictTypeDropDown({ code: 'flow_execute_type' }).then((res) => {
        this.executeTypes = res.data;
        this.executeTypes.forEach((item) => {
          item.code = parseInt(item.code);
        });
      });

      sysDictTypeDropDown({ code: 'flow_priority' }).then((res) => {
        this.flowPrioritys = res.data;
        this.flowPrioritys.forEach((item) => {
          item.code = parseInt(item.code);
        });
      });

      sysDictTypeDropDown({ code: 'sample_status' }).then((res) => {
        this.sampleStatus = res.data
        this.sampleStatus.forEach((item) => {
          item.code = parseInt(item.code)
        })
      })
    },
    formatDate(text)
    {
      if(text!=null)
        return moment(text).format('YYYY-MM-DD')
      else
        return ''
    },
    flowFilter(flowId) {
      const values = this.flowData.filter((item) => item.id === flowId);
      if (values.length > 0) {
        return values[0].name;
      }
    },
    typeFilter(status) {
      const values = this.flowTypes.filter((item) => item.code === status);
      if (values.length > 0) {
        return values[0].value;
      }
    },
    // 状态判
  statusFilter(status) {
      const values = this.sampleStatus.filter((item) => item.code === status);
      if (values.length > 0) {
        return values[0].value;
      }
    },
    /**
       * 打开状态修改模态框
       */
      showStatusModal(record) {
      this.statusModal.visible = true;
      this.statusModal.record = { ...record }; // 复制记录,避免直接修改原数据

    this.statusModal.originalStatus = record.status; /**
       * 保存原状 },
       */
      handleStatusConfirm() {
      const { id, status } = this.statusModal.record;
      exp_flow_case_UpdateSampleStatus({ id, status }).then(res => {
        if (res.success) {
          this.$message.success('状态更新成:);
          // 更新表格数据

        this.$refs.table.refresh()
          // const index = this.sampleModal.sampleData.findIndex(item => item.id === id);
          // if (index !== -1) {
          //   this.$set(this.sampleModal.sampleData, index, { ...this.statusModal.record });
          // }

        this.statusModal.visible = false;
        } else {
          this.$message.error(res.message || '状态更新失:);
        }
      }).catch(err => {
        this.$message.error('请求失败');
      });
    },
    handleStatusCancel() {
      this.statusModal.visible = false;
    },
    /**
       * 打开384孔板
       */
      show384(value) {
      this.Modal384.visible = true;
      console.log(value)
      this.Modal384.data =value.split(',').map(Number); // this.Modal384.dataList[value];

  },
    showImage(files)
    {
      console.log("显微镜图像==###>>>")
      this.imageModal.visible=true;
      this.imageModal.imageData=files;
    },
    /**
       * 计算索引位置
       */
      getIndex(row, column) {
      return row * 24 + column
    },
  },
};
</script>

<style>
.status-modal {
  padding: 24px;
}

.status-modal .status-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-modal .status-item span {
  margin-right: 12px;
  font-weight: 600;
}

.status-modal .ant-select {
  width: 200px;
}


/* 384孔板 */
.plate-container {
  display: flex;
  flex-direction: column;
  overflow: auto;
  max-height: 70vh;

}

.column-headers,
.plate-row {
  display: flex;
  min-width: 1000px;
}

.column-header,
.row-header {
  width: 40px;
  min-width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: #fafafa;
  border: 1px solid #e8e8e8;
}

.plate-cell {
  width: 40px;
  min-width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  font-size: 12px;
  transition: background 0.3s;
}

.plate-cell:hover {
  transform: scale(1.2);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}



.timeline-container {
  position: relative;
  padding: 100px 0; /* 增加上下内边? */
  display: flex;
  justify-content: left;
  margin-top: 30px;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #42b983;
}

.timeline-line::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #42b983;
}

.timeline-node {
  display: flex;
  align-items: center;
  position: relative;   
}

.timeline-node-top {
  justify-content: flex-start;
  margin-left: 30px;
}

.timeline-node-bottom {
  justify-content: flex-start;
  margin-left: 30px;
}

.timeline-node-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #42b983;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-node-content {
  background-color: white;
  padding: 15px; /* 增加内边? */
  border-radius: 8px; /* 增加圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px; /* 增加最大宽  */
  position: relative;
  left: 10px;
  min-height: 130px;
}

.timeline-node-time {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  min-width: 100px;
}

.timeline-node-subtext {
  font-size: 16px;
  color: rgb(97, 116, 97);
  cursor: pointer;
  min-width: 100px;
}

.timeline-node-text {
  font-size: 16px;
  min-width: 100px;
  margin-bottom: 8px;
}

/* 节点上下布局的样: */
.timeline-node-top .timeline-node-content {
  top: -90px; /* 增加顶部偏移 */
  left: 5px;
}

.timeline-node-bottom .timeline-node-content {
  bottom: -90px; /* 增加底部偏移 */
  left: 5px;
}
</style>
