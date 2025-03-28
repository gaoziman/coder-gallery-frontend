<template>
  <div class="dashboard-container">
    <!-- 欢迎页面组件 -->
    <WelcomePanel />

    <!-- 数据概览卡片 -->
    <StatisticsCards />

    <!-- 用户增长趋势和系统状态 -->
    <div class="chart-container">
      <UserGrowthTrend />
      <SystemStatus />
    </div>

    <!-- 最近活动模块 -->
    <div class="recent-activities">
      <RecentUsers />
      <RecentUploads />
    </div>

    <!-- 流量分析和热门标签 -->
    <div class="analytics-container">
      <TrafficAnalysis />
      <HotTags />
      <HotCategory />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import WelcomePanel from '@/components/dashboard/WelcomePanel.vue';
import StatisticsCards from '@/components/dashboard/StatisticsCards.vue';
import UserGrowthTrend from '@/components/dashboard/UserGrowthTrend.vue';
import SystemStatus from '@/components/dashboard/SystemStatus.vue';
import RecentUsers from '@/components/dashboard/RecentUsers.vue';
import RecentUploads from '@/components/dashboard/RecentUploads.vue';
import TrafficAnalysis from '@/components/dashboard/TrafficAnalysis.vue';
import HotTags from '@/components/dashboard/HotTags.vue';
import HotCategory from '@/components/dashboard/HotCategory.vue';

// 页面加载时可以在这里获取仪表盘所需的数据
onMounted(() => {
  // 这里可以调用API获取仪表盘数据
  console.log('仪表盘页面已加载');
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
}

.chart-container {
  display: flex;
  margin-top: 24px;
  gap: 24px;
}

.recent-activities {
  display: flex;
  margin-top: 24px;
  gap: 24px;
}

.analytics-container {
  display: flex;
  margin-top: 24px;
  gap: 24px;
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
  .chart-container,
  .recent-activities,
  .analytics-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .chart-container,
  .recent-activities,
  .analytics-container {
    margin-top: 16px;
    gap: 16px;
  }
}
</style>