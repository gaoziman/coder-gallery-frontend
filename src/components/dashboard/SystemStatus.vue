<template>
  <a-card :bordered="false" class="system-status-card" title="系统状态">
    <div class="metric-item">
      <div class="metric-label">CPU使用率</div>
      <div class="metric-content">
        <a-progress
            :percent="cpuUsage"
            status="normal"
            :strokeColor="getProgressColor(cpuUsage)"
            size="small"
        />
        <div class="metric-value">{{ cpuUsage }}%</div>
      </div>
    </div>

    <div class="metric-item">
      <div class="metric-label">内存使用率</div>
      <div class="metric-content">
        <a-progress
            :percent="memoryUsage"
            status="normal"
            :strokeColor="getProgressColor(memoryUsage)"
            size="small"
        />
        <div class="metric-value">{{ memoryUsage }}%</div>
      </div>
    </div>

    <div class="metric-item">
      <div class="metric-label">平均响应时间</div>
      <div class="metric-content">
        <a-progress
            :percent="responseTimePercent"
            status="normal"
            :strokeColor="getResponseTimeColor(responseTime)"
            size="small"
        />
        <div class="metric-value">{{ responseTime }}ms</div>
      </div>
    </div>

    <div class="server-status">
      <div class="status-label">服务器状态</div>
      <div class="status-chips">
        <a-tag class="status-chip online">
          <CheckCircleFilled />
          主服务器
        </a-tag>
        <a-tag class="status-chip online">
          <CheckCircleFilled />
          备用服务器
        </a-tag>
        <a-tag class="status-chip online">
          <CheckCircleFilled />
          CDN
        </a-tag>
      </div>
    </div>

    <a-divider style="margin: 16px 0" />

    <div class="status-footer">
      <div class="last-update">上次更新: {{ lastUpdate }}</div>
      <a-button type="primary" class="detail-btn">
        查看详细系统报告
      </a-button>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled
} from '@ant-design/icons-vue';

// 模拟数据
const cpuUsage = ref(42);
const memoryUsage = ref(68);
const responseTime = ref(128);
const responseTimePercent = computed(() => {
  // 假设我们认为超过200ms就是100%了（不好）
  return Math.min(100, (responseTime.value / 200) * 100);
});
const lastUpdate = ref('2025-03-28 09:30:12');

// 根据使用率返回不同颜色 - 绿色到黄色到红色
const getProgressColor = (percent) => {
  if (percent < 50) return '#52c41a';
  if (percent < 80) return '#faad14';
  return '#f5222d';
};

// 响应时间颜色 - 低响应时间是好的，所以颜色逻辑与使用率相反
const getResponseTimeColor = (ms) => {
  if (ms < 100) return '#52c41a';
  if (ms < 150) return '#faad14';
  return '#f5222d';
};
</script>

<style scoped>
.system-status-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 450px;
}

.metric-item {
  margin-bottom: 24px;
}

.metric-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
}

.metric-content {
  display: flex;
  align-items: center;
}

.metric-value {
  margin-left: 12px;
  font-weight: 500;
  min-width: 50px;
}

.server-status {
  margin-top: 24px;
}

.status-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 12px;
}

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-chip {
  display: flex;
  align-items: center;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
}

.status-chip.online {
  background-color: rgba(82, 196, 26, 0.1);
  border-color: #b7eb8f;
  color: #52c41a;
}

.status-chip.warning {
  background-color: rgba(250, 173, 20, 0.1);
  border-color: #ffe58f;
  color: #faad14;
}

.status-chip.offline {
  background-color: rgba(245, 34, 45, 0.1);
  border-color: #ffa39e;
  color: #f5222d;
}

.status-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-update {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.detail-btn {
  background-color: #6151e6;
  border-color: #6151e6;
}
</style>