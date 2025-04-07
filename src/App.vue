<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {useUserStore} from "@/stores/user";
const userStore = useUserStore();

onMounted(() => {
  // 检查登录状态的一致性
  const storedUser = localStorage.getItem('cloudgallery_user');
  if (!storedUser && userStore.isLoggedIn) {
    // 如果本地存储被清除但状态未更新，强制更新状态
    userStore.userInfo = null;

    // 可选：重新加载页面以确保所有组件都获得正确的状态
    window.location.reload();
  }
});
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