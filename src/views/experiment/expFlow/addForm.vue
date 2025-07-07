<template>
  <a-modal title="新增实验流程" :width="900" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">

        <a-row :gutter="8">
          <div>            
            <sp-input label="编号" :labelWidth="110" :isError="errors.code" :inputWidth="250" :required="true" v-model="attributeData.code" />
            <sp-input label="名称" :labelWidth="110" :isError="errors.name" :inputWidth="250" :required="true" v-model="attributeData.name" />
          </div>

          <div style="margin-top:10px;"> 
            <span class="span-label" style="width:120px;">类型：</span>
            <a-select style="width: 250px;color: black;" placeholder="请选择类型" v-model:value="attributeData.type">
              <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
            
            <span class="span-label" style="width: 120px; margin-left : 40px;">执行类型：</span>
            <a-select style="width: 250px;color: black;" placeholder="请选择执行类型" v-model:value="attributeData.executeType">
              <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;"> 
            <span class="span-label" style="width:120px;">下次执行流程：</span>
            <a-select style="width: 250px;color: black;" placeholder="请选择下次执行流程" v-model:value="attributeData.nextFlowId" clearable>
              <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
            
            <sp-input-number label="下次执行时间" :step="1" :labelWidth="150"  :inputWidth="150" :rightEmpty="true" v-model="attributeData.executeNextFlowTime" />
            <a-select style="width: 95px;color : black; margin-left: -35px;" placeholder="请选择下次执行时间" v-model:value="attributeData.executeNextFlowType">
              <a-select-option v-for="(item, index) in executeNextFlowTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;">            
            <sp-input-number label="排序" :step="1" :labelWidth="110"  :inputWidth="100" :required="true" v-model="attributeData.sort" />
            <span class="span-label" style="margin-left:130px;">盘面布局：</span>
            <a-select style="width: 250px;color: black;" placeholder="请选择盘面布局" v-model:value="attributeData.layoutId">
              <a-select-option v-for="(item, index) in layoutData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
            <a-button style="margin-left:5px;" type="primary" size="small" @click="showPreviewLayout">查看</a-button>
          </div>
        </a-row>

        <a-divider orientation="left" style="margin-top:130px;">属性信息</a-divider>
        <a-row  gutter="8" style="min-height : 400px;">
          <a-col :span="24">
            <a-table size="middle" :columns="columns" :dataSource="attributeData.attributes" :pagination="false" :loading="attributeLoading" rowKey="key" :scroll="{  y: 320 }">   
              <!-- 自定义序号列 -->
              <template #serial="{ text, record, index }"><span>
                {{ index + 1 }}
              </span></template>
              <template #name="{ text, record }"><span>
                  <a-input v-model:value="record.name" placeholder="名称" />
              </span></template>
              <template #type="{ text, record }"><span>
                  <a-select v-model:value="record.type" key="dataType" style="width : 100%" placeholder="请选择类型">
                  <a-select-option v-for="(item, index) in dataTypeSelectData" :key="index" :value="item.value">
                    {{ item.value }}</a-select-option>
                </a-select>
              </span></template>   
              <template #value="{ text, record }"><span>
                  <a-input v-model:value="record.value" placeholder="值" />
              </span></template>
              <template #keyStr="{ text, record }"><span>
                <a-input v-model:value="record.keyStr" placeholder="关键字" />
              </span></template> 
              <template #operation="{ text, record }">
                <a @click="removeAttribute(record.key)">删除</a>
              </template>
            </a-table>
            <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" @click="newAttribute"><template #icon><plus-outlined /></template>增行</a-button>
          </a-col>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import {exp_flow_add} from '@/api/modular/experiment/expFlowManage'
  import { exp_layout_list } from '@/api/modular/experiment/layoutManage'
  import { sysDictTypeDropDown } from '@/api/modular/system/dictManage'
  import SpInput from '@/components/spInput.vue';
  import SpInputNumber from '@/components/spInputNumber.vue';
  export default {
    components: {
      SpInputNumber,
      SpInput
    ,
    PlusOutlined},
    data () {
      return {
        visible: false,
        formLoading: false,
        form: this.$form.createForm(this),
        attributeDefaultType:'varchar',
        layoutData:[],
        attributeData:{
          code:'',
          name:'',
          layoutId:0,
          sort:0,
          type:1,
          executeType:1,
          attributes:[],
          deletedAttributes:[]
        },
        flowTypes:[],
        executeTypes:[],
        errors:{
          code:false,
          name:false
        },
        executeNextFlowTypes:[],
        flowData:[],
        attributeLoading: false,
        columns: [
          {
            title: '',
            key: 'serial',
            align: 'center',
            width: '50',
            slots: { customRender: 'serial' }
          },
          {
            title: '',
            align: 'center',
            key:'name',
            dataIndex: 'name',
            width:'100',
            editable: true,
            slots: { customRender: 'name' }
          },
          {
            title: '',
            align: 'center',
            key:'type',
            width: '100',
            dataIndex: 'type',
            editable: true,
            slots: { customRender: 'type' }
          },
          {
            title: '关键字',
            align: 'center',
            key:'keyStr',
            width: '100',
            dataIndex: 'keyStr',
            editable: true,
            slots: { customRender: 'keyStr' }
          },
          {
            title: '值',
            align: 'center',
            key:'value',
            width: '100',
            dataIndex: 'value',
            editable: true,
            slots: { customRender: 'value' }
          },
          {
            title: '',
            key: 'action',
            align: 'center',
            width:100,
            slots: { customRender: 'operation' }
          }
        ],
        dataTypeSelectData: [
          {
            value: 'text',
            hasLength: false,
            hasDecimalDigits: false
          },
          {
            value: 'varchar',
            hasLength: true,
            hasDecimalDigits: false
          }, 
          {
            value: 'nvarchar',
            hasLength: true,
            hasDecimalDigits: false
          },
          {
            value: 'char',
            hasLength: true,
            hasDecimalDigits: false
          }, 
          {
            value: 'nchar',
            hasLength: true,
            hasDecimalDigits: false
          }, 
          {
            value: 'timestamp',
            hasLength: false,
            hasDecimalDigits: false
          }, 
          {
            value: 'int',
            hasLength: false,
            hasDecimalDigits: false
          }, 
          {
            value: 'smallint',
            hasLength: false,
            hasDecimalDigits: false
          }, 
          {
            value: 'tinyint',
            hasLength: false,
            hasDecimalDigits: false
          }, 
          {
            value: 'bigint',
            hasLength: false,
            hasDecimalDigits: false
          }, 
          {
            value: 'bit',
            hasLength: false,
            hasDecimalDigits: false
          },
          {
            value: 'decimal',
            hasLength: true,
            hasDecimalDigits: true
          }, 
          {
            value: 'datetime',
            hasLength: false,
            hasDecimalDigits: false
          },
        ],
      }
    },
    created()
    {
      // this.getLayoutData()

  },
    methods: {
      /**
       * ȡֵ
       */
       sysDictTypeDropDown() {
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

        sysDictTypeDropDown({code: 'execute_next_flow_type'}).then((res) => {
          this.executeNextFlowTypes = res.data
          this.executeNextFlowTypes.forEach((item) => {
            item.code=parseInt(item.code)
          })          
        })
      },
      resetAttribute()
      {
        this.attributeData={
          id:0,
          code:'',
          name:'',
          layoutId:0,
          sort:0,
          type:1,
          executeType:1,
          attributes:[],
          nextFlowId:null,
          executeNextFlowTime:0,
          executeNextFlowType:0,
          deletedAttributes:[]
        }
        this.errors={
          code:false,
          name:false,
        }
      },
      removeAttribute(key){
        const newData = this.attributeData.attributes.filter(item => item.key !== key)
        this.attributeData.attributes = newData
      },
      newAttribute(){
        console.log(this.attributeData)
        const length = this.attributeData.attributes.length        
        this.attributeData.attributes.push({
          key: length === 0 ? '1' : (parseInt(this.attributeData.attributes[length - 1].key) + 1).toString(),
          flowId:0,
          name:'',
          type:this.attributeDefaultType,
          value:'',
          modifyMode:1,
        })
      },
      /**
       * ʼ
       */
      add (record) {
        this.visible = true
        this.resetAttribute()
        this.sysDictTypeDropDown()

        exp_layout_list({}).then((res) => {
          if (res.success) {
            this.layoutData=res.data
          } 
        })
      },
      showPreviewLayout()
      {
        let layoutId=this.form.getFieldValue('layoutId')
        if(layoutId)
        {
          console.log('layoutId:'+layoutId);
          this.$emit('preview-layout', layoutId)
        }
        else
          this.$message.warning("请选择盘面布局")
      },
      validateFields()
      {
        var result=true;
        this.errors.code=!this.attributeData.code;
        this.errors.name=!this.attributeData.name;
        console.log(this.errors)
        for (const key in this.errors) {          
          if (this.errors[key]) {            
            result=false
            break;
          }
        }
        return result
      },
      /**
       * ύ
       */
      handleSubmit () {
        console.log('=================handleSubmit=================')
        if(!this.validateFields())
          return;
        
        this.formLoading = true        
        exp_flow_add(this.attributeData).then((res) => {
          if (res.success) {
            this.$message.success('添加成功')
            this.$emit('ok', this.attributeData)
            this.handleCancel()
          } else {
            this.$message.error(res.message)
          }
        }).finally((res) => {
          this.formLoading = false
        })
      },
      handleCancel () {
        this.form.resetFields()
        this.visible = false
      }
    }
  }
</script>
<style scoped>
.ant-row{
  height: 40px;
}
.ant-col{
  height: 40px;
}
.ant-form-item{
  height: 40px;
}
.ant-form-item-control{
  height: 40px;
}
.ant-form-explain{
  height: 0;
}
.span-label{
  width: 140px;
  text-align: right;
  display:inline-block;
  color: black;
}
</style>
