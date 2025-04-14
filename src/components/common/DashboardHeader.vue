<template>
  <div class="dashboard-header">
    <!-- 左侧标题区域 -->
    <div class="header-left">
      <div class="icon-container">
        <component :is="moduleIcon" class="icon"/>
      </div>
      <div class="header-info">
        <div class="title-row">
          <h1 class="page-title">{{ title }}</h1>
          <div class="floating-tag-container" v-if="parentModule">
            <div class="floating-tag">
              <span class="tag-text">{{ parentModule }}</span>
            </div>
          </div>
        </div>
        <p class="page-description">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- 右侧数据概览 -->
    <div class="header-metrics">
      <div
          v-for="(metric, index) in metrics"
          :key="index"
          class="metric-item"
      >
        <div class="metric-label">
          <component :is="metric.icon"/>
          {{ metric.label }}
        </div>
        <div class="metric-value">{{ metric.value }}</div>

        <div class="metric-divider" v-if="index < metrics.length - 1"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    required: true
  },
  // 页面描述
  description: {
    type: String,
    required: true
  },
  // 页面图标组件
  moduleIcon: {
    type: Object,
    required: true
  },
  // 父模块名称（显示在浮动标签中）
  parentModule: {
    type: String,
    default: ''
  },
  // 统计指标数据数组
  metrics: {
    type: Array,
    default: () => [],
    // metrics数组中的每个对象应该包含 {icon, label, value} 三个属性
  }
});
</script>

<style scoped>
/* 页面顶部标题区域 */
.dashboard-header {
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.dashboard-header::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 30%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  z-index: 1;
}

/* 左侧标题区域 */
.header-left {
  display: flex;
  align-items: center;
  z-index: 2;
}

.icon-container {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 24px;
  color: white;
}

.header-info {
  color: white;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin: 0;
  margin-right: 14px;
}

/* 大号悬浮标签样式 */
.floating-tag-container {
  position: relative;
  height: 28px;
  z-index: 5;
}

.floating-tag {
  display: inline-block;
  position: relative;
  background: #FF4D4F;
  color: white;
  padding: 4px 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.floating-tag::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%);
  border-radius: 6px;
}

.tag-text {
  position: relative;
  z-index: 2;
}

.page-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  max-width: 450px;
}

/* 右侧数据概览 */
.header-metrics {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2;
}

.metric-item {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.metric-divider {
  position: absolute;
  right: 0;
  width: 1px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.2);
}

.metric-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
}

.metric-label .anticon {
  margin-right: 4px;
  font-size: 14px;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-metrics {
    margin-top: 16px;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .header-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .metric-divider {
    display: none;
  }

  .metric-item:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 8px;
  }
}
</style>