<template>
  <a-modal title="ʵ" :width="900" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">

        <a-row :gutter="8">
          <div>            
            <sp-input label="̱" :labelWidth="110" :isError="errors.code" :inputWidth="250" :required="true" v-model="attributeData.code" ></sp>
            <sp-input label="" :labelWidth="110" :isError="errors.name" :inputWidth="250" :required="true" v-model="attributeData.name" ></sp>
          </div>

          <div style="margin-top:10px;"> 
            <span class="span-label" style="width:120px;">ͣ</span>
            <a-select style="width: 250px;color: black;" placeholder="ѡ" v-model : value="attributeData.type">
              <a-select-option v-for="(item, index) in flowTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
            
            <span class="span-label" style="width: 120px; margin-left : 40px;">ִͣ</span>
            <a-select style="width: 250px;color: black;" placeholder="ѡִ" v-model : value="attributeData.executeType">
              <a-select-option v-for="(item, index) in executeTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;"> 
            <span class="span-label" style="width:120px;">ʱִ̣</span>
            <a-select style="width: 250px;color: black;" placeholder="ѡʱִ" v-model : value="attributeData.nextFlowId" clearable>
              <a-select-option v-for="(item, index) in flowData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
            
            <sp-input-number label="ʱִʱ" :step="1" :labelWidth="150"  :inputWidth="150" :rightEmpty="true" v-model="attributeData.executeNextFlowTime" ></sp>
            <a-select style="width: 95px;color : black; margin-left: -35px;" placeholder="ѡʱִ" v-model : value="attributeData.executeNextFlowType">
              <a-select-option v-for="(item, index) in executeNextFlowTypes" :key="index" :value="item.code">{{ item.value }}</a-select-option>
            </a-select>
          </div>

          <div style="margin-top:10px;">            
            <sp-input-number label="" :step="1" :labelWidth="110"  :inputWidth="100" :required="true" v-model="attributeData.sort" ></sp>
            <span class="span-label" style="margin-left:130px;">沼֣</span>
            <a-select style="width: 250px;color: black;" placeholder="ѡ沼" v-model : value="attributeData.layoutId">
              <a-select-option v-for="(item, index) in layoutData" :key="index" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
            <a-button style="margin-left:5px;" type="primary" size="small" @click="showPreviewLayout">鿴</a-button>
          </div>
        </a-row>

        <a-divider orientation="left" style="margin-top:130px;">ԶϢ</a-divider>
        <a-row  gutter="8" style="min-height : 400px;">
          <a-col :span="24">
            <a-table size="middle" :columns="columns" :dataSource="attributeData.attributes" :pagination="false" :loading="attributeLoading" rowKey="key" :scroll="{  y: 320 }">   
              <!-- Զ -->
              <template #serial="{ text, record, index }"><span>
                {{ index + 1 }}
              </span></template>
              <template #name="{ text, record }"><span>
                  <a-input v-model="record.name" placeholder=""></a>
              </span></template>
              <template #type="{ text, record }"><span>
                  <a-select v-model  value="record.type" key="dataType" style="width : 100%" placeholder="ѡ">
                  <a-select-option v-for="(item, index) in dataTypeSelectData" :key="index" :value="item.value">
                    {{ item.value }}</a-select-option>
                </a-select>
              </span></template>   
              <template #value="{ text, record }"><span>
                  <a-input v-model="record.value" placeholder="ֵ"></a>
              </span></template>
              <template #keyStr="{ text, record }"><span>
                <a-input v-model="record.keyStr" placeholder="ؼ"></a>
              </span></template> 
              <template #operation="{ text, record }">
                <a @click="removeAttribute(record.key)">ɾ</a>
              </template>
            </a-table>
            <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" ><template #icon><plus-outlined ></plus-outlined></template @click="newAttribute"></a-button>
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
            title: 'ؼ',
            align: 'center',
            key:'keyStr',
            width: '100',
            dataIndex: 'keyStr',
            editable: true,
            slots: { customRender: 'keyStr' }
          },
          {
            title: 'ֵ',
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
          key: length === 0  '1' : (parseInt(this.attributeData.attributes[length - 1].key) + 1).toString(),
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
          this.$message.warning("ѡ沼֣")
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
            this.$message.success('ɹ')
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
