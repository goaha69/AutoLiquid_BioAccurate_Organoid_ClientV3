<template>
  <div>
    <x-card v-if="hasPerm('exp_equipment:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="12">
              <a-form-item label="设备编号">
                <a-input v-model="queryParam.code" allow-clear placeholder="请输入设备编号" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="设备名称">
                <a-input v-model="queryParam.name" allow-clear placeholder="请输入设备名称" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="主机">
                <a-input v-model="queryParam.host" allow-clear placeholder="请输入主机" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
        </div>

      </template>
    </x-card>
    <a-card :bordered="false">
      <s-table ref="table" :columns="columns" :data="loadData" :alert="true" :rowKey="(record) => record.id" :customRow="customRow">
        <template #operator>
          <a-button type="primary" v-if="hasPerm('exp_equipment:add')" @click="$refs.addForm.add()">
            <template #icon><plus-outlined></plus-outlined></template>新增设备
          </a-button>
        </template>
        <template #serial="{ text, record, index }">
          {{ index + 1 }}
        </template> 
        <template #port="{ text }">
            {{ text === 0 ? '' : text }}
        </template>
        <template #baudRate="{ text }">
            {{ text === 0 ? '' : text }}
        </template>
        <template #manufactureDate="{ text }">
            {{ formatDate(text) }}
        </template>
        <template #status="{ text }">
            {{ statusFilter(text) }}
        </template>
        <template #isConnected="{ text }">
            {{ isConnectedFilter(text) }}
        </template>
        <template #action="{ text, record }">
          <a v-if="hasPerm('exp_equipment:edit')" @click="$refs.editForm.edit(record)">编辑</a>
          <a-divider type="vertical" v-if="hasPerm('exp_equipment:edit')"></a-divider> 

          <a-dropdown
              v-if="hasPerm('exp_equipment:edit') || hasPerm('exp_equipment:delete') || hasPerm('exp_equipment:debug') || hasPerm('exp_equipment:scale')">
              <a class="ant-dropdown-link">
                更多<down-outlined></down-outlined>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPerm('exp_equipment:debug')">
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugView')" @click="$refs.debugView.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugCentrifuge')" @click="$refs.debugCentrifuge.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugCamera')" @click="$refs.debugCamera.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugIncubatorCo2')" @click="$refs.debugIncubatorCo2.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugMicroplateReader')" @click="$refs.debugMicroplateReader.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugMicroscope')" @click="$refs.debugMicroscope.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugKeyto')" @click="$refs.debugKeyto.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugMisumi')" @click="$refs.debugMisumi.debug(record)">调试</a>
                    <a v-if="record.paramsPage && record.paramsPage.includes('debugBarcode')" @click="$refs.debugBarcode.debug(record)">调试</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:scale') && record.isThirdParty===false">
                    <a @click="$refs.scaleView.setScale(record)">设置scale</a>
                  </a-menu-item>
                  <a-menu-item v-if="hasPerm('exp_equipment:delete')">
                    <a-popconfirm placement="topRight" title="确认删除" @confirm="() => exp_equipment_delete(record)">
                      <a>删除</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
        </template>
      </s-table>
      <add-form ref="addForm" @ok="handleOk"></add-form>
      <edit-form ref="editForm" @ok="handleOk"></edit-form>      
      <scale-view ref="scaleView" @ok="handleOk"></scale-view>
      <debug-view ref="debugView" @ok="handleOk"></debug-view>
      <debug-centrifuge ref="debugCentrifuge" @ok="handleOk"></debug-centrifuge>
      <debug-camera ref="debugCamera" @ok="handleOk"></debug-camera>
      <debug-incubator-co2 ref="debugIncubatorCo2" @ok="handleOk"></debug-incubator-co2>
      <debug-microplate-reader ref="debugMicroplateReader" @ok="handleOk"></debug-microplate-reader>
      <debug-microscope ref="debugMicroscope" @ok="handleOk"></debug-microscope>
      <debug-misumi ref="debugMisumi" @ok="handleOk"></debug-misumi>
      <debug-keyto ref="debugKeyto" @ok="handleOk"></debug-keyto>
      <debug-barcode ref="debugBarcode" @ok="handleOk"></debug-barcode>
    </a-card>
  </div>
</template>
<script>
  import {STable, Ellipsis,XCard} from '@/components'
  import {exp_equipment_page,exp_equipment_delete} from '@/api/modular/experiment/equipmentManage'   
  import { sysDictTypeDropDown} from '@/api/modular/system/dictManage'
  import addForm from './addForm'
  import editForm from './editForm'
  import scaleView from './scaleView'
  import debugMisumi from './debugMisumi'
  import debugKeyto from './debugKeyto'
  import debugView from './debugView'
  import debugCamera from './debugCamera'
  import debugCentrifuge from './debugCentrifuge'
  import debugIncubatorCo2 from './debugIncubatorCo2'
  import debugMicroplateReader from './debugMicroplateReader'  
  import debugMicroscope from './debugMicroscope'  
  import debugBarcode from './debugBarcode'  

  import moment from 'moment'
  export default {
    name: "exp_equipment_mgr",
    components: {
      XCard,
      STable,
      Ellipsis,
      addForm,
      editForm,
      scaleView,
      debugView,
      debugMisumi,
      debugKeyto,
      debugCentrifuge,
      debugCamera,
      debugIncubatorCo2,
      debugMicroplateReader,
      debugMicroscope,
      debugBarcode,
    },
    data() {
      return {
        // 查询参数
        queryParam: {},
        // 表头
        columns: [
          {
            title: '序号',
            key: 'serial',
            align: 'center',
            width: '50px',
            slots: { customRender: 'serial' }
          },   
          {
            title: '设备编号',
            dataIndex: 'code'
          },
          {
            title: '设备名称',
            width: '150px',
            dataIndex: 'name'
          },
          {
            title: '主机',
            dataIndex: 'host'
          },
          {
            title: '端口',
            dataIndex: 'port',
            slots: {
              customRender: 'port'
            }
          },
          {
            title: 'Com',
            dataIndex: 'comPort'
          },
          {
            title: '波特',
            dataIndex: 'baudRate',
            slots: {
              customRender: 'baudRate'
            }
          },
          {
            title: '生产厂商',
            dataIndex: 'manufacturer'
          },
          {
            title: '生产日期',
            dataIndex: 'manufactureDate',
            slots: {
              customRender: 'manufactureDate'
            }
          },
          {
            title: '配置url',
            dataIndex: 'paramsPage'
          },
          {
            title: '状态',
            dataIndex: 'status',
            slots: {
              customRender: 'status'
            }
          },
          {
            title: '连接状态',
            dataIndex: 'isConnected',
            slots: {
              customRender: 'isConnected'
            }
          }
        ],
        // 加载数据方法 必须Promise 对象
        loadData: parameter => {
          return exp_equipment_page(Object.assign(parameter, this.queryParam)).then((res) => {            
            return res.data;
          });
        },
        selectedRow: null,
        statusDictTypeDropDown: [],
        isConnectedDictTypeDropDown: [],
      };
    },
    created() {
      this.sysDictTypeDropDown();
      if (this.hasPerm('exp_equipment:edit') || this.hasPerm('exp_equipment:delete')) {
        this.columns.push({
          title: '操作',
          width: '200px',
          dataIndex: 'action',
          slots: {
            customRender: 'action'
          }
        });
      }
    },
    methods: {
      customRow(record) {
        return {
          on: {
            click: () => {
              this.selectedRow = record;
            }
          },                
          style: {
            backgroundColor: this.selectedRow == record ? ('#'+this.$store.getters.color.slice(1)+'15') : '', // Change background color based on age
          },
        };
      },
      formatDate(date) {
        if (!date) return '';
        return moment(date).format('YYYY-MM-DD');
      },
      sysDictTypeDropDown() {
        sysDictTypeDropDown({
          code: 'common_status'
        }).then((res) => {
          this.statusDictTypeDropDown = res.data;
        });

        sysDictTypeDropDown({
          code: 'equipment_isconnected'
        }).then((res) => {
          this.isConnectedDictTypeDropDown = res.data;
        });
      },
      statusFilter(status) {
        const values = this.statusDictTypeDropDown.filter(item => item.code == status);
        if (values.length > 0) {
          return values[0].value;
        }
      },
      isConnectedFilter(status) {
        const values = this.isConnectedDictTypeDropDown.filter(item => JSON.parse(item.code) == status);
        if (values.length > 0) {
          return values[0].value;
        }
      },
      exp_equipment_delete(record) {
        exp_equipment_delete(record).then((res) => {
          if (res.success) {
            this.$message.success('删除成功');
            this.$refs.table.refresh();
          } else {
            this.$message.error('删除失败::' + res.message);
          }
        }).catch((err) => {
          this.$message.error('删除错误::' + err.message);
        });
      },
      toggleAdvanced() {
        this.advanced = !this.advanced;
      },
      handleOk() {
        console.log('handleOk');
        this.$refs.table.refresh();
      },
    }
  }
</script>
<style lang="less">
  .table-operator {
    margin-bottom: 18px;
  }

  button {
    margin-right: 8px;
  }
</style>
