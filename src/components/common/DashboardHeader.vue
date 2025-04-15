<template>
  <div class="dashboard-header">
    <!-- 左侧标题区域 -->
    <div class="header-left">
      <div class="icon-container">
        <IconFont :type="iconType" v-if="iconType" />
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
    type: [Object, Function],
    default: null
  },
  iconType: {
    type: String,
    default: ''
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
  padding: 24px 30px;
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.15);
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
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: 1;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: 25%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  z-index: 1;
}

/* 左侧标题区域 */
.header-left {
  display: flex;
  align-items: center;
  z-index: 2;
}

.icon-container {
  width: 56px;
  height: 56px;
  /* 更加明亮的背景色，大幅提高对比度 */
  background: rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  /* 更强的阴影效果，增加立体感 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 强化内发光效果 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  /* 添加发光效果 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18),
  inset 0 1px 2px rgba(255, 255, 255, 0.3),
  0 0 10px rgba(255, 255, 255, 0.3);
}

.icon-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2),
  inset 0 1px 3px rgba(255, 255, 255, 0.4),
  0 0 15px rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.5);
}

/* iconfont 图标样式 - 更高亮度与对比度 */
.icon-container :deep(svg) {
  font-size: 28px;
  /* 高亮白色 */
  color: #FFFFFF;
  /* 更强的轮廓与发光效果 */
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))
  drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))
  brightness(1.2);
  /* 确保完全不透明 */
  opacity: 1;
  /* 图标微缩放动画 */
  transform-origin: center;
  transition: transform 0.3s ease, filter 0.3s ease;
  /* 增加轮廓效果，进一步提高对比度 */
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
  text-stroke: 1px rgba(0, 0, 0, 0.2);
}

/* 图标悬停效果增强 - 更明显的变化 */
.icon-container:hover :deep(svg) {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))
  drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3))
  brightness(1.3);
}

/* 增加图标统一样式 - 确保icon在metrics中也清晰可见 */
.metric-label :deep(svg),
.metric-label :deep(.anticon) {
  margin-right: 6px;
  font-size: 16px;
  color: #FFFFFF;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))
  drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))
  brightness(1.15);
  opacity: 1;
}

.header-info {
  color: white;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
  margin-right: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
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
  background: #FF6B6B;
  color: white;
  padding: 5px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.floating-tag::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 8px;
}

.tag-text {
  position: relative;
  z-index: 2;
}

.page-description {
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 480px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* 右侧数据概览 */
.header-metrics {
  display: flex;
  background: rgba(255, 255, 255, 0.12);
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.header-metrics:hover {
  transform: translateY(-3px);
}

.metric-item {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 110px;
}

.metric-divider {
  position: absolute;
  right: 0;
  width: 1px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
}

.metric-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
  font-weight: 500;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .dashboard-header {
    padding: 20px 24px;
  }
  .page-title {
    font-size: 22px;
  }
  .metric-item {
    padding: 0 12px;
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }
  .header-metrics {
    margin-top: 20px;
    width: 100%;
    justify-content: space-around;
  }
  .icon-container {
    width: 50px;
    height: 50px;
    margin-right: 16px;
  }
  .icon-container :deep(svg) {
    font-size: 24px;
  }
}

@media (max-width: 576px) {
  .header-metrics {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
    justify-content: flex-start;
  }
  .metric-item {
    padding: 6px 10px;
    min-width: auto;
    flex: 1 0 45%;
    align-items: flex-start;
  }
  .metric-divider {
    display: none;
  }
  .page-title {
    font-size: 20px;
  }
  .floating-tag {
    font-size: 12px;
    padding: 4px 10px;
  }
  .page-description {
    font-size: 14px;
  }
  .title-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .page-title {
    margin-right: 0;
  }
}
</style>