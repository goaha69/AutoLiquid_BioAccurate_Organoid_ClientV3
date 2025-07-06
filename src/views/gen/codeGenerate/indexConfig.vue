<template>
  <a-card :bordered="false" v-show="indexConfigShow">
    <div class="table-operator">
      <a-button class="but_item" type="dashed" @click="handleCancel" icon="rollback">返回</a-button>
      <a-button type="primary" ><template #icon><plus-outlined ></plus-outlined></template @click="handleSubmit">保存</a-button>
    </div>
    <a-table ref="table" size="middle" :columns="columns" :dataSource="loadData" :pagination="false" :alert="true"
      :loading="tableLoading" :rowKey="(record) => record.id">
      <template #columnComment="{ text, record }">
        <a-input v-model="record.columnComment" ></a>
      </template>
      <!--      <template #javaType="{ text, record }">
        <a-select style="width: 120px" v-model  value="record.javaType" : disabled="judgeColumns(record)">
          <a-select-option v-for="(item,index) in javaTypeData" :key="index" :value="item.code">{{ item.name }}</a-select-option>
        </a-select>
      </template> -->
      <template #effectType="{ text, record }">
        <a-select style="width: 120px" v-model  value="record.effectType" : disabled="judgeColumns(record)"
          @change="effectTypeChange(record, $event)">
          <a-select-option v-for="(item, index) in effectTypeData" :key="index" :value="item.code">{{
            item.name
          }}</a-select-option>
        </a-select>
      </template>
      <template #dictTypeCode="{ text, record }">
        <a-select style="width: 120px" v-model  value="record.dictTypeCode" : disabled="record.effectType !== 'radio' && record.effectType !== 'select' && record.effectType !== 'checkbox'
          ">
          <a-select-option v-for="(item, index) in dictDataAll" :key="index" :value="item.code">{{
            item.name
          }}</a-select-option>
        </a-select>
      </template>
      <template #whetherTable="{ text, record }">
        <a-checkbox v-model="record.whetherTable" ></a>
      </template>
      <template #whetherRetract="{ text, record }">
        <a-checkbox v-model="record.whetherRetract" ></a>
      </template>
      <template #whetherAddUpdate="{ text, record }">
        <a-checkbox v-model  value="record.whetherAddUpdate" : disabled="judgeColumns(record)" ></a>
      </template>
      <template #whetherRequired="{ text, record }">
        <a-checkbox v-model  value="record.whetherRequired" : disabled="judgeColumns(record)" ></a>
      </template>
      <template #queryWhether="{ text, record }">
        <a-switch v-model="record.queryWhether">
          <a-icon #checkedChildren type="check" ></a>
          <a-icon #unCheckedChildren type="close" ></a>
        </a-switch>
      </template>
      <template #queryType="{ text, record }">
        <a-select style="width: 100px" v-model  value="record.queryType" : disabled="!record.queryWhether">
          <a-select-option v-for="(item, index) in codeGenQueryTypeData" :key="index" :value="item.code">{{
            item.name
          }}</a-select-option>
        </a-select>
      </template>
    </a-table>
    <fk-modal ref="fkModal" ></fk>
  </a-card>
</template>
<script>
import {
  sysCodeGenerateConfigList,
  sysCodeGenerateConfigEdit
} from '@/api/modular/gen/sysCodeGenerateConfigManage'
import fkModal from './fkModal'
export default {
  components: {
    fkModal
  },
  data() {
    return {
      // 表头

    columns: [{
        title: '字段',
        dataIndex: 'columnName'
      },
      {
        title: '描述',
        dataIndex: 'columnComment',
        slots: {
          customRender: 'columnComment'
        }
      },
      {
        title: '类型',
        dataIndex: 'netType'
      },
      // {
      //   title: 'java类型',
      //   dataIndex: 'javaType',
      //   slots: { customRender: 'javaType' }
      // },

    {
        title: '作用类型',
        dataIndex: 'effectType',
        slots: {
          customRender: 'effectType'
        }
      },
      {
        title: '字典',
        dataIndex: 'dictTypeCode',
        slots: {
          customRender: 'dictTypeCode'
        }
      },
      {
        title: '列表显示',
        align: 'center',
        dataIndex: 'whetherTable',
        slots: {
          customRender: 'whetherTable'
        }
      },
      // {
      //   title: '列字段省,
      //   align: 'center',
      //   dataIndex: 'whetherRetract',
      //   slots: { customRender: 'whetherRetract' }
      // },

    {
        title: '增改',
        align: 'center',
        dataIndex: 'whetherAddUpdate',
        slots: {
          customRender: 'whetherAddUpdate'
        }
      },
      {
        title: '必填',
        align: 'center',
        dataIndex: 'whetherRequired',
        slots: {
          customRender: 'whetherRequired'
        }
      },
      {
        title: '是否是查',
        align: 'center',
        dataIndex: 'queryWhether',
        slots: {
          customRender: 'queryWhether'
        }
      },
      {
        title: '查询方式',
        dataIndex: 'queryType',
        slots: {
          customRender: 'queryType'
        }
      }
      ],
      indexConfigShow: false,
      tableLoading: false,
      visible: false,
      loadData: [],
      javaTypeData: [],
      effectTypeData: [],
      dictDataAll: [],
      codeGenQueryTypeData: [],
      yesOrNoData: []
    }
  },
  methods: {
    /**
     * 打开界面
       */
    open(data) {
      this.indexConfigShow = true
      this.tableLoading = true
      const dictOption = this.$options
      this.javaTypeData = dictOption.filters['dictData']('code_gen_net_type')
      this.effectTypeData = dictOption.filters['dictData']('code_gen_effect_type')
      this.dictDataAll = dictOption.filters['dictDataAll']()
      this.yesOrNoData = dictOption.filters['dictData']('yes_or_no')
      this.codeGenQueryTypeData = dictOption.filters['dictData']('code_gen_query_type')
      const params = {
        codeGenId: data.id
      }
      sysCodeGenerateConfigList(params).then((res) => {
        this.loadData = res.data
        this.loadData.forEach(item => {
          for (const key in item) {
            if (item[key] === 'Y') {
              item[key] = true
            }
            if (item[key] === 'N') {
              item[key] = false
            }
          }
        })
        this.tableLoading = false
      })
    },
    /**
     * 提交表单
       */
    handleSubmit() {
      this.tableLoading = true
      // 做数组属性转 咱先来一个切断双向绑定,学习的童鞋下回记下啊
      // eslint-disable-next-line prefer-const

    let loadDatas = JSON.parse(JSON.stringify(this.loadData))
      loadDatas.forEach(item => {
        /**
       * 必填那一项转
       */
      for (const key in item) {
          if (key != "isEnum") {
            if (item[key] === true) {
              item[key] = 'Y'
            }
            if (item[key] === false) {
              item[key] = 'N'
            }
          }

        }
      })
      // const param = {
      //   sysCodeGenerateConfigParamList: loadDatas
      // }

    sysCodeGenerateConfigEdit(loadDatas).then((res) => {
        this.tableLoading = false
        if (res.success) {
          this.$message.success('编辑成功')
          this.handleCancel()
        } else {
          this.$message.error('编辑失败::' + res.message)
        }
      })
    },
    /**
     * 判断是否(用于是否能选择或输入等
       */
    judgeColumns(data) {
      if (
        data.columnName.indexOf('createdUserName') > -1 ||
        data.columnName.indexOf('createdTime') > -1 ||
        data.columnName.indexOf('updatedUserName') > -1 ||
        data.columnName.indexOf('updatedTime') > -1 ||
        data.columnKey === 'True'
      ) {
        return true
      }
      return false
    },
    /**
     * 作用类型改变
       */
    effectTypeChange(data, value) {
      if (value === 'fk') {
        console.log(11)
        this.$refs.fkModal.show(data)
      }
    },
    handleCancel() {
      this.$emit('ok')
      this.loadData = []
      this.indexConfigShow = false
    }
  }
}
</script>
