<template>
  <div>
    <x-card v-if="hasPerm('sysOpLog:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="24">
              <a-form-item label="操作人名:>
                <a-input" v-model  value="queryParam.name" allow-clear placeholder="请输入名 : " ></a>
              </a-form-item>
            </a-col>
            <a-col  md="8" : sm="24">
              <a-form-item label="请求方式">
                <a-input v-model  value="queryParam.reqMethod" allow-clear placeholder="请输入请求方 : " ></a>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <!-- <a-col  md="4" : sm="6">
                <a-form-item label="是否成功">
                  <a-select v-model="queryParam.success" placeholder="请选择是否成功">
                    <a-select-option v-for="(item, index) in successDict" :key="index" :value="item.code">
                      {{ item.value }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col> -->
              <a-col  md="8" : sm="24">
                <a-form-item label="操作时间">
                  <a-range-picker
                    v-model="queryParam.dates"
                    :show-time="{
                      hideDisabledOptions: true,
                      defaultValue: [moment('00:00:00', 'HH  mm : ss'), moment('23:59:59', 'HH  mm : ss')],
                    }"
                    format="YYYY-MM-DD HH  mm : ss"
                    style="width: 100%; max-width : 240px;"
                    class="custom-range-picker"
                  ></a>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span
                class="table-page-search-submitButtons"
                :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced : '收起' : '展开' }}
                  <a-icon :type="advanced  'up' : 'down'" ></a>
                </a>
              </template>
            </a-col>
          </a-row>
        </a-form>
        </div>

      </template>
    </x-card>
    <a-card :bordered="false">
      <s-table
        ref="table"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowKey="record => record.id"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '30', '40','50'],
          defaultPageSize: 10
        }">
        <template #operator v-if="hasPerm('sysOpLog:delete')">
          <a-popconfirm @confirm="() => sysOpLogDelete()" placement="top" title="确认清空日志:>
            <a-button>清空日志</a-button>
          </a-popconfirm>
        </template>
        <template #operator" v-if="hasPerm('sysOpLog:export')">
            <a-button @click="sysOpLogExport">导出日志</a-button>
        </template>
        <span #opType #default="text">
          {{ opTypeFilter(text) }}
        </template>
        <span #success #default="text">
          {{ successFilter(text) }}
        </template>
        <span #name #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #url #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #opTime #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <template #action="text, record">
          <span #action>
            <a @click="$refs.detailsOplog.details(record)">查看详情</a>
          </template>
        </template>
      </s-table>
      <details-oplog ref="detailsOplog" ></details>
    </a-card>
  </div>
</template>
<script>
import { STable, Ellipsis, XCard } from '@/components'
import { sysOpLogPage, sysOpLogDelete ,sysOpLogExport} from '@/api/modular/system/logManage'
import detailsOplog from './details'
import { sysEnumDataList } from '@/api/modular/system/enumManage'
import moment from 'moment'
export default {
  name: 'sys_log_mgr_op_log',
  components: {
    XCard,
    STable,
    Ellipsis,
    detailsOplog
  },
  data() {
    return {
      advanced: false,
      // 查询参数

    queryParam: {
      },
      // 表头

    columns: [
        {
          title: '请求方式',
          dataIndex: 'reqMethod',
          slots: {
            customRender: 'reqMethod',
            sorter: true
          }
        },
        {
          title: '执行结果',
          dataIndex: 'success',
          slots: {
            customRender: 'success',
            sorter: true
          }
        },
        {
          title: 'IP',
          dataIndex: 'ip',
          sorter: true
        },
        {
          title: '请求地址',
          dataIndex: 'url',
          slots: {
            customRender: 'url',
            sorter: true
          }
        },
        {
          title: '操作时间',
          dataIndex: 'opTime',
          slots: {
            customRender: 'opTime',
            sorter: true
          }
        },
        {
          title: '操作',
          dataIndex: 'name',
          slots: {
            customRender: 'name',
            sorter: true
          }
        },
        {
          title: '操作人帐',
          dataIndex: 'account',
          sorter: true
        },
        {
          title: '详情',
          dataIndex: 'action',
          width: '150px',
          slots: {
            customRender: 'action'
          }
        }
      ],
      // 加载数据方法 必须Promise 对象

    loadData: parameter => {
        const queryParams = Object.assign(parameter, this.switchingDate())
        console.log('发送的查询参数:', queryParams) // 添加这行日志

      return sysOpLogPage(queryParams)
          .then(res => {
            if (res.data) {
              console.log('返回数据:', res.data)
              return res.data
            } else {
              this.$message.error('未获取到日志数据')
              return []
            }
          })
          .catch(err => {
            console.error('数据加载失败:', err)
            this.$message.error('数据加载失败')
            return []
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      defaultExpandedKeys: [],
      opTypeDict: [],
      successDict: []
    }
  },
  created() {
    this.sysEnumDataList()
  },
  methods: {
    moment,
    opTypeFilter(opType) {
      // eslint-disable-next-line eqeqeq

    const values = this.opTypeDict.filter(item => item.code == opType)
      if (values.length > 0) {
        return values[0].value
      }
    },
    successFilter(success) {
      // eslint-disable-next-line eqeqeq

    const values = this.successDict.filter(item => item.code == success)
      if (values.length > 0) {
        return values[0].value
      }
    },
    /**
     * 查询参数组装
       */
    switchingDate() {
      const dates = this.queryParam.dates
      if (dates != null) {
          this.queryParam.searchBeginTime = moment(dates[0]).format('YYYY-MM-DD HH  mm : ss')
          this.queryParam.searchEndTime = moment(dates[1]).format('YYYY-MM-DD HH  mm : ss')
          if (dates.length < 1) {
            delete this.queryParam.searchBeginTime
            delete this.queryParam.searchEndTime
          }     
         }
      const obj = JSON.parse(JSON.stringify(this.queryParam))
      delete obj.dates
      
      return obj
    },
    /**
     * 获取枚举数据
       */
    sysEnumDataList() {
      sysEnumDataList({
        enumName: 'YesOrNot'
      }).then(res => {
        this.successDict = res.data
      })
    },
    /**
     * 清空日志
       */
    sysOpLogDelete() {
      sysOpLogDelete().then(res => {
        if (res.success) {
          this.$message.success('清空成功')
          this.$refs.table.refresh(true)
        } else {
          this.$message.error('清空失败:::' + res.message)
        }
      })
    },
    /**
       * 清空日志
       */
      sysOpLogDelete() {
        sysOpLogDelete().then((res) => {
          if (res.success) {
            this.$message.success('清空成功')
            this.$refs.table.refresh(true)
          } else {
            this.$message.error('清空失败:::' + res.message)
          }
        })
      },
      sysOpLogExport(){
       sysOpLogExport(this.selectedRowKeys).then((res=>{
        // 尝试解析 filename* 格式

      let fileName = `OpLog.txt`; // 默认        const disposition = res.headers['content-disposition'];
        const utf8FilenameMatch = disposition.match(/filename\*=UTF-8''(.' + ?)(?:;|$)/);
        if (utf8FilenameMatch) {
          fileName = decodeURIComponent(utf8FilenameMatch[1]);
        } else {
          // 回退解析 filename 格式

        const filenameMatch = disposition.match(/filename="?(.+?)":(::;|$)/);
          if (filenameMatch) {
            fileName = decodeURIComponent(filenameMatch[1]);
          }
        }

        const blob = new Blob([res.data], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = decodeURIComponent(fileName) ; // 已解
      document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        }))
      },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    }
  }
}
</script>
<style lang="less">
.table-operator {
  margin-bottom: 18px;
}

.ant-input {
  height: 32px;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.ant-select-selection {
  height: 32px;
  border-radius: 4px;
  
  .ant-select-selection__rendered {
    line-height: 32px;
  }
  
  .ant-select-selection-selected-value {
    padding: 0 8px;
    font-size: 12px;
  }
}

.table-page-search-wrapper {
  .ant-form-item {
    margin-bottom: 16px;
  }
}

button {
  margin-right: 8px;
}
</style>
