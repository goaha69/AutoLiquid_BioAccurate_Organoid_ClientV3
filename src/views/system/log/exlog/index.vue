<template>
  <div>
    <x-card v-if="hasPerm('sysOpLog:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="24">
              <a-form-item label="类名">
                <a-input v-model="queryParam.className" allow-clear placeholder="请输入类型" ></a>
              </a-form-item>
            </a-col>
            <a-col  md="8" : sm="24">
              <a-form-item label="方法:>
                <a-input" v-model="queryParam.methodName" allow-clear placeholder="请输入方法名" ></a>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col  md="8" : sm="24">
                <a-form-item label="异常信息">
                  <a-input v-model="queryParam.exceptionMsg" allow-clear placeholder="请输入异常信息关键字" ></a>
                </a-form-item>
              </a-col>
              <a-col  md="8" : sm="24">
                <a-form-item label="姓名">
                  <a-input v-model="queryParam.name" allow-clear placeholder="请输入操作人姓名" ></a>
                </a-form-item>
              </a-col>
              <a-col :md="10" :sm="24">
                <a-form-item label="操作时间">
                  <a-range-picker
                    v-model="queryParam.dates"
                    :show-time="{
                      hideDisabledOptions: true,
                      defaultValue: [moment('00:00:00', 'HH  mm : ss'), moment('23:59:59', 'HH  mm : ss')],
                    }"
                    format="YYYY-MM-DD HH  mm : ss" ></a>
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
        :rowKey="(record) => record.id"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
        <template #operator v-if="hasPerm('sysExLog:delete')">
          <a-popconfirm @confirm="() => sysExLogDelete()" placement="top" title="确认清空日志:>
            <a-button>清空日志</a-button>
          </a-popconfirm>
        </template>
        <template #operator" v-if="hasPerm('sysExLog:export')">
            <a-button @click="sysExLogExport">导出日志</a-button>
        </template>
        <span #name #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #methodName #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #exceptionName #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #exceptionMsg #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #exceptionTime #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <template #action="text, record">
          <span #action>
            <a @click="$refs.detailsExlog.details(record)">查看详情</a>
          </template>
        </template>
      </s-table>
      <details-exlog ref="detailsExlog" ></details>
    </a-card>
  </div>
</template>
<script>
  import {
    STable,
    Ellipsis,
    XCard
  } from '@/components'
  import {
    sysExLogPage,
    sysExLogDelete,
    sysExLogExport
  } from '@/api/modular/system/logManage'
  import detailsExlog from './details'
  import moment from 'moment'
  export default {
    name:"sys_log_mgr_ex_log",
    components: {
      XCard,
      STable,
      Ellipsis,
      detailsExlog
    },
    data() {
      return {
        advanced: false,
        // 查询参数

      queryParam: {},
        // 表头

      columns: [{
            title: '类名',
            dataIndex: 'className',
            slots: {
              customRender: 'className'
            }
          },
          {
            title: '方法',
            dataIndex: 'methodName',
            slots: {
              customRender: 'methodName'
            }
          },
          {
            title: '异常名称',
            dataIndex: 'exceptionName',
            slots: {
              customRender: 'exceptionName'
            }
          },
          {
            title: '异常信息',
            dataIndex: 'exceptionMsg',
            slots: {
              customRender: 'exceptionMsg'
            }
          },
          {
            title: '异常时间',
            dataIndex: 'exceptionTime',
            slots: {
              customRender: 'exceptionTime'
            }
          },
          {
            title: '操作',
            dataIndex: 'name'
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
          return sysExLogPage(Object.assign(parameter, this.switchingDate())).then((res) => {
            return res.data
          })
        },
        selectedRowKeys: [],
        selectedRows: [],
        defaultExpandedKeys: []
      }
    },
    created() {},
    methods: {
      moment,
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
       * 清空日志
       */
      sysExLogDelete() {
        sysExLogDelete().then((res) => {
          if (res.success) {
            this.$message.success('清空成功')
            this.$refs.table.refresh(true)
          } else {
            this.$message.error('清空失败::' + res.message)
          }
        })
      },
      /*  */
      导出日志*/
      sysExLogExport(){
       sysExLogExport(this.selectedRowKeys).then((res=>{
        // 尝试解析 filename* 格式

      let fileName = `ExLog.txt`; // 默认        const disposition = res.headers['content-disposition'];
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

  button {
    margin-right: 8px;
  }
</style>
