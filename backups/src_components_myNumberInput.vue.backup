<template>
  <div class="input-number-container">
    <a-button @click="decrement" class="decrement-button">-</a-button>
    <a-input-number v-model:value="value" class="input-number" :min="0" :max="10000" @change="onChange" ></a>
    <a-button @click="increment" class="increment-button">+</a-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: 0, // Initial value
    };
  },
  methods: {
    increment() {
      this.value++;
    },
    decrement() {
      if (this.value > 0) {
        this.value--;
      }
    },
    onChange(newValue) {
      console.log('New value:', newValue);
    },
  },
};
</script>

<style scoped>
.input-number-container {
  display: flex;
  align-items: center; /* Center vertically */
}

.input-number {
  width: 100px; /* Set a fixed width for the input */
  text-align: center; /* Center the text inside the input */
}

.decrement-button,
.increment-button {
  width: 30px; /* Set a fixed width for buttons */
}
</style>
