<template>
  <div class="dashboard-container">
    <!-- 欢迎页面组件 -->
    <WelcomePanel />

    <!-- 数据概览卡片 -->
    <StatisticsCards />

    <!-- 用户活跃度分析组件 -->
    <div class="activity-analysis">
      <UserActivityChart />
    </div>

    <!-- 热门标签和分类 -->
    <div class="analytics-container">
      <HotTags />
      <HotCategory />
    </div>

    <!-- 最近活动模块（已调整顺序，确保上移） -->
    <div class="recent-activities">
      <RecentUploads class="recent-uploads-container" />
      <RecentUsers />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import WelcomePanel from '@/components/dashboard/WelcomePanel.vue';
import StatisticsCards from '@/components/dashboard/StatisticsCards.vue';
import RecentUsers from '@/components/dashboard/RecentUsers.vue';
import RecentUploads from '@/components/dashboard/RecentUploads.vue';
import HotTags from '@/components/dashboard/HotTags.vue';
import HotCategory from '@/components/dashboard/HotCategory.vue';
import UserActivityChart from "@/components/dashboard/UserActivityChart.vue";

// 页面加载时可以在这里获取仪表盘所需的数据
onMounted(() => {
  // 这里可以调用API获取仪表盘数据
  fetchDashboardData();
});

// 模拟获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 在实际应用中，这里应该是向后端API发起请求
    // const response = await api.dashboard.getData();
    console.log('仪表盘数据加载成功');
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 64px); /* 减去头部导航的高度 */
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.analytics-container {
  display: flex;
  gap: 24px;
}

.recent-activities {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 图片区域占2/3，用户区域占1/3 */
  gap: 24px;
  align-items: flex-start; /* 确保从顶部对齐 */
}

.recent-uploads-container {
  height: auto; /* 自适应高度，不设置固定高度 */
  min-height: 400px; /* 最小高度确保内容空间足够 */
  max-height: none; /* 取消最大高度限制 */
  overflow: visible; /* 内容不截断 */
}

/* 滚动条样式保持不变 */
.recent-uploads-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.recent-uploads-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.recent-uploads-container::-webkit-scrollbar-thumb {
  background: rgba(97, 81, 230, 0.3);
  border-radius: 3px;
}

.recent-uploads-container::-webkit-scrollbar-thumb:hover {
  background: rgba(97, 81, 230, 0.5);
}

/* 定制滚动条样式 */
.dashboard-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.dashboard-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dashboard-container::-webkit-scrollbar-thumb {
  background: rgba(97, 81, 230, 0.3);
  border-radius: 3px;
}

.dashboard-container::-webkit-scrollbar-thumb:hover {
  background: rgba(97, 81, 230, 0.5);
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .analytics-container {
    flex-direction: column;
  }

  .recent-activities {
    grid-template-columns: 1fr; /* 单列布局 */
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
    gap: 16px;
  }

  .activity-analysis,
  .analytics-container,
  .recent-activities {
    gap: 16px;
  }
}
</style>