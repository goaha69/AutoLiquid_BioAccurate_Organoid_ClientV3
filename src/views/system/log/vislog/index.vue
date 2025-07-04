<template>
  <div>
    <x-card v-if="hasPerm('sysVisLog:page')">
      <template #content>

        <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="24">
              <a-form-item label="日志名称">
                <a-input v-model  value="queryParam.name" allow-clear placeholder="请输入日志名 : " ></a>
              </a-form-item>
            </a-col>
            <a-col  md="8" : sm="24">
              <a-form-item label="访问类型">
                <a-select v-model="queryParam.visType" allow-clear placeholder="请选择访问类型">
                  <a-select-option v-for="(item,index) in visTypeDict" :key="index" :value="item.code">{{ item.value }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col  md="8" : sm="24">
                <a-form-item label="是否成功">
                  <a-select v-model="queryParam.success" placeholder="请选择是否成功">
                    <a-select-option v-for="(item,index) in successDict" :key="index" :value="item.code">
                      {{ item.value }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="10" :sm="24">
                <a-form-item label="访问时间">
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
        <template #operator v-if="hasPerm('sysVisLog:sysVisLog')">
          <a-popconfirm
            @confirm="() => sysVisLogDelete()"
            placement="top"
            title="确认清空日志'" v-if="hasPerm('sysVisLog:delete')">
            <a-button>清空日志</a-button>
          </a-popconfirm>
        </template>
        <template #operator v-if="hasPerm('sysVisLog:export')">
            <a-button @click="sysVisLogExport">导出日志</a-button>
        </template>
        <span #name #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #visTime #default="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </template>
        <span #visType #default="text">
          {{ visTypeFilter(text) }}
        </template>
        <span #success #default="text">
          {{ successFilter(text) }}
        </template>
        <template #action="text, record">
          <span #action>
            <a @click="$refs.detailsVislog.details(record)">查看详情</a>
          </template>
        </template>
      </s-table>
      <details-vislog ref="detailsVislog" ></details>
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
    sysVisLogPage,
    sysVisLogDelete,
    sysVisLogExport
  } from '@/api/modular/system/logManage'
  import detailsVislog from './details'
  import {
    sysEnumDataList
  } from '@/api/modular/system/enumManage'
  import moment from 'moment'
  export default {
    name:"sys_log_mgr_vis_log",
    components: {
      XCard,
      STable,
      Ellipsis,
      detailsVislog
    },
    data() {
      return {
        advanced: false,
        // 查询参数

      queryParam: {},
        // 表头

      columns: [{
            title: '日志名称',
            dataIndex: 'name',
            slots: {
              customRender: 'name'
            }
          },
          {
            title: '访问类型',
            dataIndex: 'visType',
            slots: {
              customRender: 'visType'
            }
          },
          {
            title: '是否成功',
            dataIndex: 'success',
            slots: {
              customRender: 'success'
            }
          },
          {
            title: 'IP',
            dataIndex: 'ip'
          },
          {
            title: '浏览',
            dataIndex: 'browser'
          },
          {
            title: '时间',
            dataIndex: 'visTime',
            slots: {
              customRender: 'visTime'
            }
          },
          {
            title: '访问',
            dataIndex: 'account'
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
          return sysVisLogPage(Object.assign(parameter, this.switchingDate())).then((res) => {
            return res.data
          })
        },
        selectedRowKeys: [],
        selectedRows: [],
        defaultExpandedKeys: [],
        visTypeDict: [],
        successDict: []
      }
    },
    /**
     * 相当于html的onload方法,进来初始化
       */
    created() {
      this.sysEnumDataList()
    },
    methods: {
      moment,
      visTypeFilter(visType) {
        // eslint-disable-next-line eqeqeq

      const values = this.visTypeDict.filter(item => item.code == visType)
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
       * 获取枚举数据
       */
      sysEnumDataList() {
        sysEnumDataList({
          enumName: 'LoginType'
        }).then((res) => {
          this.visTypeDict = res.data
        })
        sysEnumDataList({
          enumName: 'YesOrNot'
        }).then((res) => {
          this.successDict = res.data
        })
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
       * 清空日志
       */
      sysVisLogDelete() {
        sysVisLogDelete().then((res) => {
          if (res.success) {
            this.$message.success('清空成功')
            this.$refs.table.refresh(true)
          } else {
            this.$message.error('清空失败::' + res.message)
          }
        })
      },
      sysVisLogExport(){
        sysVisLogExport(this.selectedRowKeys).then((res=>{
        // 尝试解析 filename* 格式

      let fileName = `VisLog.txt`; // 默认        const disposition = res.headers['content-disposition'];
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
