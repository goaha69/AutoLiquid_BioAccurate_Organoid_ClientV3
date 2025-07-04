<template>
    <div class="div-container">
        <div :style="{
            width:(labelEmpty:0:(labelWidth+10)) + 'px',
            display:'inline-block',
            textAlign: 'right',
            alignItems:'center',
          }">
          <span class="span-start" v-if="required">*</span>
          <span :style="{
            paddingLeft: '5px',
            textAlign: 'right',
            display:'inline-block',
            color:'black'
          }">{{label}}:</span>
        </div>
        <div :style="{
            width:(inputWidth+(rightEmpty:0:40)) + 'px',
            display:'inline-block',
          }">
          <a-input
              v-model:value="internalValue"
              @change="handleChange"
              :placeholder="'请输入'+label"
              :style="{
                width: inputWidth + 'px',
                border:  isError : '1px solid red' : '1px solid #d9d9d9',
                color:'black',
              }"></a>
          <span class="span-unit" v-if="unit">{{unit}}</span>
        </div>  
    </div>  
</template>

<script>
export default {
  name: 'SpInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入数:,
    },
    unit: {
      type:String,
      default: "",
    },
    label: {
      type:String,
      default: "",
    },
    required: {
      type:Boolean,
      default: false,
    },
    inputWidth: {
      type:Number,
      default: 160,
    },
    labelWidth: {
      type:Number,
      default: 130,
    },
    isError: {
      type:Boolean,
      default: false,
    },
    rightEmpty: {
      type:Boolean,
      default: false,
    },
    labelEmpty: {
      type:Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalValue: this.modelValue,
    };
  },
  watch: {
    modelValue(newValue) {
      this.internalValue = newValue;
    },
  },
  methods: {
    handleChange(event) {
      const value = event.target.value; 
      // 如果输入为空,则设置0
      if ((value === null || value === '') && this.required) { 
        this.isError=true;
        this.internalValue = '';
        this.$emit('update:modelValue', this.internalValue); // 触发 input 事件
      } else {
        this.isError=false;
        this.internalValue = value;
        this.$emit('update:modelValue', this.internalValue); // 触发 input 事件
      }
    },
  },
};
</script>

<style scoped>
.div-container {
  display:inline-block;
  /* display: flex; */
  flex-direction:column;
  justify-content:center;
  align-items:center;
}
.my-input-number{
  width: 100px;
}
.span-unit{
  margin-left: 5px;
  color: black;
}
.span-start{
  width:10px;
  color:red;
  font-size: 18px;
  display:inline-block;
}
.span-label{
  padding-left: 5px;
  text-align: right;
  display:inline-block;
}
.div-left{
  width: 150px;
  display:inline-block;
  text-align: right;
  align-items:center;
}
.div-right{
  display:inline-block;
}
</style>
