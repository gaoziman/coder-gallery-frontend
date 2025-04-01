<template>
  <span class="trend-badge" :class="value > 0 ? 'positive' : 'negative'">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path v-if="value > 0"
            d="M7 14l5-5 5 5z"
            fill="currentColor"/>
      <path v-else
            d="M7 10l5 5 5-5z"
            fill="currentColor"/>
    </svg>
  </span>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.trend-badge {
  position: absolute;
  right: -22px;
  top: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.positive {
  color: #52C41A;
  background-color: rgba(82, 196, 26, 0.1);
}

.negative {
  color: #F5222D;
  background-color: rgba(245, 34, 45, 0.1);
}
</style>