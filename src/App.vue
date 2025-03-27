<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件，仅包含路由视图
</script>

<style>
@import '@/assets/styles/base.css';

/* 全局基础样式 */
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}
</style>