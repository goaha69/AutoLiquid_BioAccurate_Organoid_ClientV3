<template>
    <div class="div-container">
        <div :style="{
            width: (labelEmpty ? 0 : (labelWidth + 10)) + 'px',
            display: 'inline-block',
            textAlign: 'right',
            alignItems: 'center',
          }" v-if="label">
          <span class="span-start" v-if="required">*</span>
          <span :style="{
            paddingLeft: '5px',
            textAlign: 'right',
            display: 'inline-block',
            color: 'black'
          }" v-if="label">{{ label }}:</span>
        </div>
        <div :style="{
            width: (inputWidth + 40) + 'px',
            display: 'inline-block',
          }">
          <a-input-number
              v-model:value="internalValue"
              @change="handleChange"
              :min="min"
              :max="max"
              :step="step"
              :placeholder="label ? (tempP + label) : placeholder"
              :disabled="disabled"
              :style="{
                width: inputWidth + 'px',
                border: isError ? '1px solid red' : '1px solid #d9d9d9',
                color: 'black',
              }"
          />
          <span class="span-unit" v-if="unit">({{ unit }})</span>
        </div>  
    </div>  
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({
  name: 'SpInputNumber'
})

const props = defineProps({
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
    default: '请输入数字',
  },
  unit: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  inputWidth: {
    type: Number,
    default: 100,
  },
  labelWidth: {
    type: Number,
    default: 130,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  rightEmpty: {
    type: Boolean,
    default: false,
  },
  labelEmpty: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
const tempP = ref('请输入')

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

const handleChange = (value) => {
  /**
   * 如果输入为空,则设置为0
   */
  if (value === null || value === '') {
    internalValue.value = 0
    emit('update:modelValue', 0)
  } else {
    internalValue.value = value
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.div-container {
  display: inline-block;
  /* display: flex; */
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.my-input-number {
  width: 100px;
}
.span-unit {
  margin-left: 5px;
  color: black;
}
.span-start {
  width: 10px;
  color: red;
  font-size: 18px;
  display: inline-block;
}
.span-label {
  padding-left: 5px;
  text-align: right;
  display: inline-block;
}
.div-left {
  width: 150px;
  display: inline-block;
  text-align: right;
  align-items: center;
}
.div-right {
  display: inline-block;
}
</style>
