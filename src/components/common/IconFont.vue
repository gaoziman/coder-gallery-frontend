<template>
  <component :is="tag" :style="styles" :class="['icon-wrapper', classes]" v-bind="$attrs">
    <svg class="icon" aria-hidden="true" v-if="svgMode">
      <use :xlink:href="`#${type}`"></use>
    </svg>
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import iconService from '@/services/IconService';

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
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
  margin-right: 8px;
  line-height: 1;
  transform: translateY(-1px);
  flex-shrink: 0;
}
</style>