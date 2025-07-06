<template>
  <a-modal :title="'Scale值配置-' + equipmentName" :width="1000" :open="visible" :maskClosable="false" :confirmLoading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel">
    <a-spin :spinning="formLoading">
      <a-form :model="form" >
        <a-form-item v-show="false"><a-input v-model="form.id" ></a></a-form-item>
        <a-form-item v-show="false"><a-input v-model="form.code" ></a></a-form-item>
        <a-form-item v-show="false"><a-input v-model="form.name" ></a></a-form-item>

        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item>
              <a-table size="middle" :columns="columns" :dataSource="scales" :pagination="false" :loading="scaleLoading" rowKey="key">                
                <!-- 自定义序号列 -->
                <template #serial="{ text, record, index }"><span>
                  {{ index + 1 }}
                </span></template>
                <template #name="{ text, record }"><span>
                   <a-input v-model  value="record.name" style="width : 150px;" placeholder="请输入轴名称"  allow-clear></a>
                </span></template>
                <template #realName="{ text, record }"><span>
                   <a-input v-model  value="record.realName" style="width : 150px;" placeholder="请输入真正轴名称"  allow-clear></a>
                </span></template>
                <template #value="{ text, record }"><span>
                   <a-input-number :step="myInputNumberStep" v-model  value="record.value" style="width : 150px;" placeholder="请输入Scale值" ></a>
                </span></template>                
                <template #operation="{ text, record }">
                  <a @click="removeScale(record.key)">删除</a>
                </template>
              </a-table>
              <a-button style="width: 100%; margin-top: 16px; margin-bottom : 8px" type="dashed" ><template #icon><plus-outlined ></plus-outlined></template @click="newScale">增行</a-button>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { ref } from 'vue';
import {exp_equipment_editScales,exp_equipment_getScales} from '@/api/modular/experiment/equipmentManage'
export default {
  data() {
    return {
      visible: false,
      confirmLoading: false,
      formLoading: false,
      scaleLoading:false,
      // 升级为 ref 对象
      form: ref({}),
      equipmentName:'',
      myInputNumberStep: 0.05,
      scales:[],
      columns: [
         {
          title: '序号',
          key: 'serial',
          align: 'center',
          width: '50',
          slots: { customRender: 'serial' }
        },
        {
          title: '轴名',
          align: 'center',
          key:'name',
          dataIndex: 'name',
          editable: true,
          slots: { customRender: 'name' }
        },
        {
          title: '真正轴名',
          align: 'center',
          key:'realName',
          dataIndex: 'realName',
          editable: true,
          slots: { customRender: 'realName' }
        },
        {
          title: 'Scale',
          align: 'center',
          key:'value',
          dataIndex: 'value',
          editable: true,
          slots: { customRender: 'value' }
        },
        {
          title: '操作',
          key: 'action',
          slots: { customRender: 'operation' }
        }
      ],
    }
  },
  methods: {
    removeScale(key)
    {
        const newData = this.scales.filter(item => item.key !== key)
        this.scales = newData
    },
    newScale()
    {
        const length = this.scales.length
        this.scales.push({
          key: length === 0  '1' : (parseInt(this.scales[length - 1].key) + 1).toString(),
          name: '',
          value: 0.00,
        })
    },
    /**
     * 初始化方法
     */
    setScale(record) {
      this.visible = true
      this.equipmentName=record.name

      setTimeout(() => {
        this.form.id = record.id
        this.form.code = record.code
        this.form.name = record.name
      }, 100)

      var dd={id:record.id}
      exp_equipment_getScales(dd).then((res) => {
        if (res.success) {
          this.scales=res.data
          for(var i=0;i<res.data.length;i++)
          {
            this.scales[i].key=i+1
          }
          console.log('==============exp_equipmentGetScales===============')
          console.log(res.data)
        }
      })
    },
    handleSubmit()
    {
      const tt = this.scales.filter(item => item.name === '' || (item.name!=null && (item.value===0 || item.value===null || item.value==='')))
      if(tt.length>0)
      {
        this.$message.error('请检查轴名称不能为空,并且Scale值不能为空或0')
        retrun;
      }

      const data={
        id:this.form.id,
        code:this.form.code,
        name:this.form.name,
        scales:this.scales
      }

      exp_equipment_editScales(data).then((res) => {
        if (res.success) {
          this.$message.success('Scale值保存成功)
          this.visible = false
          this.confirmLoading = false
          this.$emit('ok', data)
          this.form.id = ''
          this.form.code = ''
          this.form.name = ''
        } else {
          this.$message.error('Scale值保存失败::' + res.message)
        }
      }).finally((res) => {
        this.confirmLoading = false
      })
    },
    handleCancel() {
      // this.form.resetFields()

    this.visible = false
    }
  }
</script>
<style scoped>
.form-footer {
  text-align: right; /* 使按钮居中 */
}
</style>
