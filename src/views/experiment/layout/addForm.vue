<template>
  <a-modal title="添加布局" :width="1300" :open="visible" :maskClosable="false" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :form="form">
        <!-- <a-form-item v-show="false"><a-input v-decorator="['id']" /></a-form-item> -->
        <!-- <a-form-item v-show="false"><a-input v-decorator="['remark']" /></a-form-item> -->

        <a-row :gutter="8">
          <div>            
            <sp-input label="编码" :labelWidth="120" :isError="errors.code" :inputWidth="300" :required="true" v-model="attributeData.code" />
            <sp-input label="名称" :labelWidth="120" :isError="errors.name" :inputWidth="300" :required="true" v-model="attributeData.name" />
          </div>
          <div style="margin-top:10px;">
            <sp-input-number label="X尺寸" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.xSize" />
            <sp-input-number label="Y尺寸" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.ySize" />
            <sp-input-number label="X偏移" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.xOffset" />
            <sp-input-number label="Y偏移" :labelWidth="120" unit="mm" :required="true" v-model="attributeData.yOffset" />
          </div>
        </a-row>

        <a-divider orientation="left">位置信息</a-divider>
        <a-form-item v-show="false"><a-input v-decorator="['shippingSpaces']" /></a-form-item>
        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-table size="middle" :columns="columns" :dataSource="shippingSpaces" :pagination="false" :loading="shippingSpaceLoading" rowKey="key" :scroll="{  y: 320 }">    
                <!-- 序号 -->
                <template #serial="{ text, record, index }"><span>
                  {{ index + 1 }}
                </span></template>
                <template #name="{ text, record }"><span>
                   <a-input v-model="record.name" placeholder="名称" />
                </span></template>  
                <template #isStorage="{ text, record }"><span>
                   <a-checkbox v-model="record.isStorage" />
                </span></template>              
                <template #xSize="{ text, record }"><span>
                   <sp-input-number v-model="record.xSize" placeholder="X尺寸" />
                </span></template>
                <template #ySize="{ text, record }"><span>
                   <sp-input-number v-model="record.ySize" placeholder="Y尺寸" />
                </span></template>
                <template #xOffset="{ text, record }"><span>
                   <sp-input-number v-model="record.xOffset" placeholder="X偏移" />
                </span></template>
                <template #yOffset="{ text, record }"><span>
                   <sp-input-number v-model="record.yOffset" placeholder="Y偏移" />
                </span></template>
                <template #zOffset="{ text, record }"><span>
                   <sp-input-number v-model="record.zOffset" placeholder="位置高度" />
                </span></template>
                
                <template #operation="{ text, record }">
                  <a @click="removeShippingSpace(record.key)">删除</a>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" @click="newShippingSpace">
                <template #icon><plus-outlined /></template>
                添加位置
              </a-button>
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
  import { PlusOutlined } from '@ant-design/icons-vue';
  
  export default {
    components: {
      SpInputNumber,
      SpInput,
      PlusOutlined
    },
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
            title: '序号',
            key: 'serial',
            align: 'center',
            width: '50',
            slots: { customRender: 'serial' }
          },
          {
            title: '名称',
            align: 'center',
            key:'name',
            dataIndex: 'name',
            width:'20%',
            editable: true,
            slots: { customRender: 'name' }
          },
          {
            title: '存储位置',
            align: 'center',
            key:'isStorage',
            width: '100',
            dataIndex: 'isStorage',
            editable: true,
            slots: { customRender: 'isStorage' }
          },
          {
            title: 'X尺寸(mm)',
            align: 'center',
            key:'xSize',
            dataIndex: 'xSize',
            editable: true,
            slots: { customRender: 'xSize' }
          },
          {
            title: 'Y尺寸(mm)',
            align: 'center',
            key:'ySize',
            dataIndex: 'ySize',
            editable: true,
            slots: { customRender: 'ySize' }
          },
          {
            title: 'X偏移(mm)',
            align: 'center',
            key:'xOffset',
            dataIndex: 'xOffset',
            editable: true,
            slots: { customRender: 'xOffset' }
          },
          {
            title: 'Y偏移(mm)',
            align: 'center',
            key:'yOffset',
            dataIndex: 'yOffset',
            editable: true,
            slots: { customRender: 'yOffset' }
          },
          {
            title: '位置高度(mm)',
            align: 'center',
            key:'zOffset',
            dataIndex: 'zOffset',
            editable: true,
            slots: { customRender: 'zOffset' }
          },
          {
            title: '操作',
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
            key: length === 0 ? '1' : (parseInt(this.shippingSpaces[length - 1].key) + 1).toString(),
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
       * 初始化
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
       * 提交
       */
      handleSubmit () {   
        console.log('=================handleSubmit=================')
        if(!this.validateFields())
          return;
        
        this.formLoading = true
        this.attributeData.shippingSpaces=this.shippingSpaces
        
        exp_layout_add(this.attributeData).then((res) => {          
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
.ant-form-item-label {
  width: 150px;
  text-align: right;
}

.ant-form-item-control {
  margin-left: 10px;
}

.my-input-number1{
  width: 120px;
}

.my-input-number{
  width: 120px;
}
</style>
