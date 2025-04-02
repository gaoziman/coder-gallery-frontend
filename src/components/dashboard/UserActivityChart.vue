// components/dashboard/UserActivityChart.vue
<template>
  <a-card
      class="activity-chart-card"
      :bordered="false"
      title="用户活跃度分析"
  >
    <template #extra>
      <a-radio-group v-model:value="timeRange" size="small" button-style="solid">
        <a-radio-button value="week">本周</a-radio-button>
        <a-radio-button value="month">本月</a-radio-button>
        <a-radio-button value="year">全年</a-radio-button>
      </a-radio-group>
    </template>

    <div class="chart-container">
      <div class="chart-info">
        <div class="chart-title">用户活跃趋势</div>
        <div class="chart-subtitle">每日活跃用户数与内容互动量</div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value">2,486</div>
            <div class="stat-label">日均活跃用户</div>
            <div class="stat-change up">
              <arrow-up-outlined /> 12.3% 较上周
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">8,295</div>
            <div class="stat-label">日均互动数</div>
            <div class="stat-change up">
              <arrow-up-outlined /> 8.7% 较上周
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">32%</div>
            <div class="stat-label">留存率</div>
            <div class="stat-change down">
              <arrow-down-outlined /> 2.1% 较上周
            </div>
          </div>
        </div>
      </div>

      <div class="chart-visualization">
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color active-users"></div>
            <div class="legend-text">活跃用户</div>
          </div>
          <div class="legend-item">
            <div class="legend-color interactions"></div>
            <div class="legend-text">互动量</div>
          </div>
        </div>

        <div class="chart-area">
          <!-- 这里实际项目中会使用ECharts或其他图表库 -->
          <div class="placeholder-chart">
            <div v-for="(value, index) in chartData" :key="index" class="bar-group">
              <div class="bar-container">
                <div class="bar active-bar" :style="{ height: `${value.activeUsers/10}%` }"></div>
                <div class="bar interaction-bar" :style="{ height: `${value.interactions/20}%` }"></div>
              </div>
              <div class="bar-label">{{ value.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';

// 时间范围选择
const timeRange = ref('week');

// 模拟图表数据
const chartData = ref([
  { date: '周一', activeUsers: 520, interactions: 1240 },
  { date: '周二', activeUsers: 632, interactions: 1480 },
  { date: '周三', activeUsers: 701, interactions: 1820 },
  { date: '周四', activeUsers: 734, interactions: 1960 },
  { date: '周五', activeUsers: 890, interactions: 2340 },
  { date: '周六', activeUsers: 930, interactions: 2460 },
  { date: '周日', activeUsers: 820, interactions: 2180 }
]);
</script>

<style scoped>
.activity-chart-card {
  margin: 24px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-container {
  display: flex;
  margin-top: 16px;
}

.chart-info {
  flex: 1;
  padding-right: 24px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.chart-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 24px;
}

.stat-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: #f9f9fb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #6151e6;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.up {
  color: #52c41a;
}

.stat-change.down {
  color: #f5222d;
}

.chart-visualization {
  flex: 2;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.active-users {
  background-color: #6151e6;
}

.legend-color.interactions {
  background-color: #36cfc9;
}

.legend-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.chart-area {
  height: 240px;
  background-color: #f9f9fb;
  border-radius: 8px;
  padding: 16px;
}

/* 简易图表样式 */
.placeholder-chart {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.bar-container {
  display: flex;
  align-items: flex-end;
  height: 200px;
  width: 40px;
  position: relative;
}

.bar {
  width: 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.active-bar {
  background-color: #6151e6;
  margin-right: 8px;
}

.interaction-bar {
  background-color: #36cfc9;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .chart-container {
    flex-direction: column;
  }

  .chart-info {
    padding-right: 0;
    padding-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .stat-cards {
    flex-direction: column;
  }
}
</style>