<template>
  <a-layout class="app-layout">
    <SideBar :collapsed="sidebarCollapsed" @update:collapsed="sidebarCollapsed = $event" />
    <a-layout class="main-content" :style="contentStyle">
      <HeaderBar />
      <a-layout-content class="content-container">
        <router-view />
      </a-layout-content>
      <FooterBar />
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SideBar from '@/components/layout/SideBar.vue';
import HeaderBar from '@/components/layout/HeaderBar.vue';
import FooterBar from '@/components/layout/FooterBar.vue';

// 侧边栏折叠状态
const sidebarCollapsed = ref(false);

// 根据侧边栏状态计算主内容区域样式
const contentStyle = computed(() => ({
  marginLeft: sidebarCollapsed.value ? '80px' : '240px',
  transition: 'all 0.3s'
}));
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  overflow: hidden;
  transition: margin-left 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  display: flex;
  flex-direction: column;
}

.content-container {
  padding: 24px;
  background: var(--bg-light, #f5f7fa);
  overflow-y: auto;
  flex: 1; /* 改为flex: 1，让内容区域自动填充剩余空间 */
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>