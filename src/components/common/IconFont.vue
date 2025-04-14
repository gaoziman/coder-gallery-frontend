<template>
  <component :is="tag" :style="styles" :class="classes" v-bind="$attrs">
    <svg class="icon" aria-hidden="true" v-if="svgMode">
      <use :xlink:href="`#${type}`"></use>
    </svg>
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import iconService from '@/api/IconService';

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 16
  },
  color: String,
  tag: {
    type: String,
    default: 'span'
  },
  className: String
});

const svgMode = computed(() => props.type.startsWith('icon-'));

const styles = computed(() => {
  const style = {};

  if (props.size) {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;
    style.fontSize = sizeValue;
  }

  if (props.color) {
    style.color = props.color;
  }

  return style;
});

const classes = computed(() => {
  return props.className;
});

onMounted(() => {
  // 初始化图标服务
  iconService.init();
});
</script>

<style scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>