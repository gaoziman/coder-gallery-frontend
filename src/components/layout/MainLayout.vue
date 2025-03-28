<template>
  <a-layout class="app-layout">
    <SideBar :collapsed="sidebarCollapsed" @update:collapsed="updateSidebarCollapsed" />
    <a-layout
        class="main-content"
        :class="{'sidebar-collapsed': sidebarCollapsed}"
        :style="contentStyle"
    >
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

// 更新侧边栏状态的函数
const updateSidebarCollapsed = (value) => {
  sidebarCollapsed.value = value;
};

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
  margin-top: 64px; /* 为固定头部留出空间 */
  background: var(--bg-light, #f5f7fa);
  overflow-y: auto;
  flex: 1;
  box-sizing: border-box;
}
</style>