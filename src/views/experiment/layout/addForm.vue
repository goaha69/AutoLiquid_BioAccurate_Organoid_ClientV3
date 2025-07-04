<template>
  <a-modal title="" :width="1300" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <!-- <a-form-item v-show="false"><a-input v-decorator="['id']" ></a></a-form-item> -->
        <!-- <a-form-item v-show="false"><a-input v-decorator="['remark']" ></a></a-form-item> -->

        <a-row :gutter="8">
          <div>            
            <sp-input label="ֱ" :labelWidth="120" :isError="errors.code" :inputWidth="300" :required="true" v-model="attributeData.code" ></sp>
            <sp-input label="" :labelWidth="120" :isError="errors.name" :inputWidth="300" :required="true" v-model="attributeData.name" ></sp>
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="Xߴ" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.xSize" ></sp>
            <sp-input-number label="Yߴ" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.ySize" ></sp>
            <sp-input-number label="Xƫ" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.xOffset" ></sp>
            <sp-input-number label="Yƫ" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.yOffset" ></sp>
          </div>
        </a-row>

        <a-divider orientation="left">λϢ</a-divider>
        <a-form-item v-show="false"><a-input v-decorator="['shippingSpaces']" ></a></a-form-item>
        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-table size="middle" :columns="columns" :dataSource="shippingSpaces" :pagination="false" :loading="shippingSpaceLoading" rowKey="key" :scroll="{  y: 320 }">    
                <!-- Զ -->
                <span #serial #default="text, record, index">
                  {{ index' + 1 }}
                </span>
                <span #name #default="text, record">
                   <a-input v-model="record.name" placeholder=""></a>
                </span>  
                <span #isStorage #default="text, record">
                   <a-checkbox v-model="record.isStorage" ></a>
                </span>              
                <span #xSize #default="text, record">
                   <sp-input-number v-model="record.xSize" placeholder="Xߴ"></sp>
                </span>
                <span #ySize #default="text, record">
                   <sp-input-number v-model="record.ySize" placeholder="Yߴ"></sp>
                </span>
                <span #xOffset #default="text, record">
                   <sp-input-number v-model="record.xOffset" placeholder="Xƫ"></sp>
                </span>
                <span #yOffset #default="text, record">
                   <sp-input-number v-model="record.yOffset" placeholder="Yƫ"></sp>
                </span>
                <span #zOffset #default="text, record">
                   <sp-input-number v-model="record.zOffset" placeholder="λ߶"></sp>
                </span>
                
                <template #operation #default="text, record">
                  <a @click="removeShippingSpace(record.key)">ɾ</a>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" ><template #icon><plus-outlined ></plus-outlined></template @click="newShippingSpace">Ӳλ</a-button>
            </a-form-item>
          </a-col>
        </a-row>


      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { exp_layout_add,exp_layout_getShippingSpaces} from '@/api/modular/experiment/layoutManage'
  import SpInputNumber from '@/components/spInputNumber.vue';
  import SpInput from '@/components/spInput.vue';
  export default {
    components: {
      SpInputNumber,
      SpInput
    ,
    PlusOutlined},
    data () {
      return {
        statusData: [],
        Data: [],
        visible: false,
        formLoading: false,
        shippingSpaceLoading:false,
        form: this.$form.createForm(this),
        attributeData:{
          code:'',
          name:'',
          remark:'',
          xSize:0.0,
          ySize:0.0,
          xOffset:0.0,
          yOffset:0.0,     
        },
        errors:{
          code:false,
          name:false
        },
        myInputNumberStep:0.5,
        shippingSpaces:[],
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
            width:'20%',
            editable: true,
            slots: { customRender: 'name' }
          },
          {
            title: '洢λ',
            align: 'center',
            key:'isStorage',
            width: '100',
            dataIndex: 'isStorage',
            editable: true,
            slots: { customRender: 'isStorage' }
          },
          {
            title: 'Xߴ(mm)',
            align: 'center',
            key:'xSize',
            dataIndex: 'xSize',
            editable: true,
            slots: { customRender: 'xSize' }
          },
          {
            title: 'Yߴ(mm)',
            align: 'center',
            key:'ySize',
            dataIndex: 'ySize',
            editable: true,
            slots: { customRender: 'ySize' }
          },
          {
            title: 'Xƫ(mm)',
            align: 'center',
            key:'xOffset',
            dataIndex: 'xOffset',
            editable: true,
            slots: { customRender: 'xOffset' }
          },
          {
            title: 'Yƫ(mm)',
            align: 'center',
            key:'yOffset',
            dataIndex: 'yOffset',
            editable: true,
            slots: { customRender: 'yOffset' }
          },
          {
            title: 'λ߶(mm)',
            align: 'center',
            key:'zOffset',
            dataIndex: 'zOffset',
            editable: true,
            slots: { customRender: 'zOffset' }
          },
          {
            title: '',
            key: 'action',
            width:100,
            slots: { customRender: 'operation' }
          }
        ],
      }
    },
    methods: {
      resetAttribute()
      {
        this.attributeData={
          id:0,
          code:'',
          name:'',
          remark:'',
          xSize:0.0,
          ySize:0.0,
          xOffset:0.0,
          yOffset:0.0,   
          isStorage:false,       
        }
        this.shippingSpaces=[]
        this.errors={
          code:false,
          name:false,
        }
      },
      removeShippingSpace(key)
      {
          const newData = this.shippingSpaces.filter(item => item.key !== key)
          this.shippingSpaces = newData
      },
      newShippingSpace()
      {
          const length = this.shippingSpaces.length
          this.shippingSpaces.push({
            key: length === 0  '1' : (parseInt(this.shippingSpaces[length - 1].key)' + 1).toString(),
            xSize: 0.00,
            ySize: 0.00,
            xOffset:0.00,
            yOffset:0.00,
            zOffset:0.00,
            name:'',
            consumableIds:'',
            consumableTags:'',
            isStorage:false,       
            // consumableIdList:[]

        })
      },
      /**
       * ʼ
       */
      add (record) {
        this.visible = true
        this.resetAttribute()
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
        this.attributeData.shippingSpaces=this.shippingSpaces
        
        exp_layout_add(this.attributeData).then((res) => {          
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
.ant-form-item-label {
  width: 150px; /* Set your desired width */
       */
  text-align: right; /* Align text to the right for better appearance */
       */
}

/* Optional: Adjust the wrapper column to align with the label width */
       */
.ant-form-item-control {
  margin-left: 10px; /* Adjust margin as needed */
       */
}

.my-input-number1{
  width: 120px;
}

.my-input-number{
  width: 120px;
}
</style>
