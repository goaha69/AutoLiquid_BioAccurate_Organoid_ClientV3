<template>
  <vue-word-cloud
    :words="formattedWords"
    :color="([, weight]) => weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo'"
    font-family="Roboto"
    :style="{ height: `${height}px`, width: `${width}px` }"
  />
</template>

<script setup>
import { computed } from 'vue';
import VueWordCloud from 'vuewordcloud';

const props = defineProps({
  tagList: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    default: 400,
  },
  width: {
    type: Number,
    default: 640,
  },
});

const formattedWords = computed(() => {
  return props.tagList.map(item => [item.name, item.value]);
});
</script>
