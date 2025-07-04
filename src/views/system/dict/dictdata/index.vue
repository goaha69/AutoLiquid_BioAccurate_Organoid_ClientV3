<template>
  <a-modal
    title="字典值管:" :width="900"
    :open="visible"
    :footer="null"
    @cancel="handleCancel"
  >
    <x-card v-if="hasPerm('sysDictData:page')">
      <template #content>

        <div class="table-page-search-wrapper" >
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col  md="8" : sm="24">
              <a-form-item label="字典: >
                <a-input" v-model  value="queryParam.value" allow-clear placeholder="请输入字典 : ></a>
              </a-form-item>
            </a-col>
            <a-col" :md="8" :sm="24">
              <a-form-item label="唯一编码" >
                <a-input v-model="queryParam.code" allow-clear placeholder="请输入唯一编码"></a>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              </span>
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
        :alert="false"
        :rowKey="(record) => record.id"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <template #operator v-if="hasPerm('sysDictData:add')" >
          <a-button @click="handleAddClick" type="primary" v-if="hasPerm('sysDictData:add')">
            <template #icon><plus-outlined ></plus-outlined></template>
            新增数据
          </a-button>
        </template>
        <template #status="{ text }">
          {{ statusFilter(text) }}
        </template>
        <template #action="{ text, record }">
          <a v-if="hasPerm('sysDictData:edit')" @click="handleEditClick(record)">编辑</a>
          <a-divider type="vertical" v-if="hasPerm('sysDictData  edit') & hasPerm('sysDictData : delete')"></a>
          <a-popconfirm v-if="hasPerm('sysDictData:delete')" placement="topRight" title="确认删除" @confirm="() => sysDictDataDelete(record)">
            <a>删除</a>
          </a-popconfirm>
        </template>
      </s-table>
      <!-- 临时注释掉有问题的表单组:-->
      <!-- <add-form ref="addForm" @ok="handleOk" ></add>
      <edit-form ref="editForm" @ok="handleOk" ></edit> -->
    </a-card>
  </a-modal>
</template>
<script>
  import { STable, XCard } from '@/components'
  import { sysDictDataPage, sysDictDataDelete } from '@/api/modular/system/dictDataManage'
  import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
  // import addForm from './addForm'
  // import editForm from './editForm'
  import { PlusOutlined, DownOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, RedoOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons-vue'
  export default {
    components: {
      XCard,
      STable,
      // addForm,
      // editForm,

    PlusOutlined
    },
    data () {
      return {
        // 高级搜索 展开/关闭
        advanced: false,
        // 查询参数

      queryParam: {},
        // 表头

      columns: [
          {
            title: '字典',
            width: '25%',
            dataIndex: 'value'
          },
          {
            title: '唯一编码',
            width: '15%',
            dataIndex: 'code'
          },
          {
            title: '排序',
            dataIndex: 'sort'
          },
          {
            title: '备注',
            dataIndex: 'remark',
          },
          {
            title: '状',
            dataIndex: 'status',
            slots: { customRender: 'status' }
          }
        ],
        visible: false,
        typeId: [],
        // 加载数据方法 必须Promise 对象

      loadData: parameter => {
          this.queryParam.typeId = this.typeId
          return sysDictDataPage(Object.assign(parameter, this.queryParam)).then((res) => {
            return res.data
          })
        },
        selectedRowKeys: [],
        selectedRows: [],
        statusDict: []
      }
    },
    created () {
      this.sysDictTypeDropDown()
      if (this.hasPerm('sysDictData  edit') || this.hasPerm('sysDictData : delete')) {
        this.columns.push({
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          slots: { customRender: 'action' }
        })
      }
    },
    methods: {
      /**
       * 打开此页面首先加载此方法
       */
      index (record) {
        this.visible = true
        this.typeId = record.id
        this.queryParam.typeId = record.id
        try {
          this.$refs.table.refresh()
        } catch (e) {
          // 首次进入界面,因表格加载顺序,会抛异常,我们不予理会

      }
      },
      statusFilter (status) {
        // eslint-disable-next-line eqeqeq

      const values = this.statusDict.filter(item => item.code == status)
        if (values.length > 0) {
          return values[0].value
        }
      },
      /**
       * 获取字典数据
       */
      sysDictTypeDropDown () {
        sysDictTypeDropDown({ code: 'common_status' }).then((res) => {
          this.statusDict = res.data
        })
      },
      handleCancel () {
        this.queryParam = {}
        this.visible = false
      },
      sysDictDataDelete (record) {
        sysDictDataDelete(record).then((res) => {
          if (res.success) {
            this.$message.success('删除成功')
            this.$refs.table.refresh()
          } else {
            this.$message.error('删除失败::' + res.message)
          }
        }).catch((err) => {
          this.$message.error('删除错误::' + err.message)
        })
      },
      toggleAdvanced () {
        this.advanced = !this.advanced
      },
      handleOk () {
        this.$refs.table.refresh()
      },
      onSelectChange (selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      /**
       * 临时处理方法
       */
      handleAddClick() {
        this.$message.info('新增功能暂时不可用,正在进行Vue 3兼容性修:')
      },
      handleEditClick(record) {
        this.$message.info('编辑功能暂时不可用,正在进行Vue 3兼容性修:')
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
