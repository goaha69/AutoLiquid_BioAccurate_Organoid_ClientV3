<template>
    <div class="div-container">
        <div :style="{
            width:(labelEmpty:0:(labelWidth+10)) + 'px',
            display:'inline-block',
            textAlign: 'right',
            alignItems:'center',
          }" v-if="label">
          <span class="span-start" v-if="required">*</span>
          <span :style="{
            paddingLeft: '5px',
            textAlign: 'right',
            display:'inline-block',
            color:'black'
          }" v-if="label">{{label}}:</span>
        </div>
        <div :style="{
            width:(inputWidth+40) + 'px',
            display:'inline-block',
          }">
          <a-input-number
              v-model="internalValue"
              @change="handleChange"
              :min="min"
              :max="max"
              :step="step"
              :placeholder=label  (tempP+label)  placeholder  disabled="disabled" : style="{
                width: inputWidth + 'px',
                border:  isError : '1px solid red' : '1px solid #d9d9d9',
                color:'black',
              }"></a>
          <span class="span-unit" v-if="unit">({{unit}})</span>
        </div>  
    </div>  
</template>

<script>
export default {
  name: 'SpInputNumber',
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: Number.MIN_SAFE_INTEGER,
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
    },
    step: {
      type: Number,
      default: 0.5,
    },
    placeholder: {
      type: String,
      default: '请输入数?,
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
      default: 100,
    },
    labelWidth: {
      type:Number,
      default: 130,
    },
    disabled: {
      type:Boolean,
      default: false,
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
      tempP:'请输:
    };
  },
  watch: {
    modelValue(newValue) {
      this.internalValue = newValue;
    },
  },
  methods: {
    handleChange(value) {
      /**
       * 如果输入为空,则设置:0
       */
      if (value === null || value === '') {
        // if(this.required === 'true')
        //   this.isError=true;
        this.internalValue = 0;
        this.$emit('update:modelValue', 0); // 触发 input 事件
      } else {
        // this.isError=false;
        this.internalValue = value;
        this.$emit('update:modelValue', value); // 触发 input 事件
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
