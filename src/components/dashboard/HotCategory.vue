// components/dashboard/PopularCategories.vue
<template>
  <a-card class="popular-categories-card" :bordered="false" title="热门分类">
    <template #extra>
      <a href="javascript:void(0);" class="extra-link">查看全部</a>
    </template>

    <div class="categories-list">
      <!-- 抽象艺术分类 -->
      <div class="category-item">
        <div class="category-icon warning">
          <PictureOutlined />
        </div>
        <div class="category-tag">抽象艺术</div>
        <div class="category-content">
          <div class="category-title">抽象艺术</div>
          <div class="category-desc">各类抽象表现形式的绘画、雕塑与数字艺术作品</div>
        </div>
        <div class="category-stats">
          <div class="stat-value">742</div>
          <div class="stat-date">2025-03-13</div>
        </div>
      </div>

      <!-- 自然风景分类 -->
      <div class="category-item">
        <div class="category-icon info">
          <EnvironmentOutlined />
        </div>
        <div class="category-tag">自然风景</div>
        <div class="category-content">
          <div class="category-title">自然风景</div>
          <div class="category-desc">山水、海洋、森林等自然景观的高清摄影作品</div>
        </div>
        <div class="category-stats">
          <div class="stat-value">518</div>
          <div class="stat-date">2025-03-10</div>
        </div>
      </div>

      <!-- UI设计分类 -->
      <div class="category-item">
        <div class="category-icon success">
          <AppstoreOutlined />
        </div>
        <div class="category-tag">UI设计</div>
        <div class="category-content">
          <div class="category-title">UI设计</div>
          <div class="category-desc">界面设计、交互原型、APP界面和网页设计资源</div>
        </div>
        <div class="category-stats">
          <div class="stat-value">463</div>
          <div class="stat-date">2025-03-05</div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <a-button type="primary" class="add-category-btn">
        发布新分类
      </a-button>
    </div>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import {
  PictureOutlined,
  EnvironmentOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue';

// 可以在这里添加更多分类数据和交互逻辑
</script>

<style scoped>
.popular-categories-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.extra-link {
  color: #6151e6;
  font-size: 14px;
}

.categories-list {
  margin-top: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.category-item:last-child {
  border-bottom: none;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
}

.category-icon.warning {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.category-icon.info {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.category-icon.success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.category-tag {
  position: absolute;
  top: 16px;
  left: 56px;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  display: none;
}

.category-content {
  flex: 1;
}

.category-title {
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 16px;
}

.category-desc {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.5;
}

.category-stats {
  text-align: right;
  margin-left: 16px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #6151e6;
}

.stat-date {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}

.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.add-category-btn {
  background-color: #6151e6;
  border-color: #6151e6;
  width: 100%;
}

.add-category-btn:hover {
  background-color: #7366ea;
  border-color: #7366ea;
}

/* 悬停效果 */
.category-item:hover {
  background-color: rgba(97, 81, 230, 0.03);
  cursor: pointer;
}

.category-item:hover .category-title {
  color: #6151e6;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .category-stats {
    display: none;
  }

  .category-desc {
    font-size: 12px;
  }
}
</style>