<!-- ImageDetailCard.vue -->
<template>
  <section class="image-detail-card">
    <header class="card-header">
      <div class="header-title">
        <info-circle-outlined class="title-icon" />
        <h3>图片详细信息</h3>
      </div>
      <a-tooltip title="查看大图">
        <div class="thumbnail-preview" @click="$emit('preview')">
          <img :src="imageData.url" alt="图片预览" />
          <div class="preview-overlay">
            <eye-outlined />
          </div>
        </div>
      </a-tooltip>
    </header>

    <div class="card-content">
      <!-- 技术参数区 -->
      <div class="tech-specs">
        <div class="specs-header">
          <file-outlined />
          <span>技术参数</span>
        </div>

        <div class="specs-grid">
          <div class="spec-item">
            <div class="spec-icon"><file-image-outlined /></div>
            <div class="spec-detail">
              <div class="spec-label">格式</div>
              <div class="spec-value">{{ imageData.format || 'JPG' }}</div>
            </div>
          </div>

          <div class="spec-item">
            <div class="spec-icon"><column-width-outlined /></div>
            <div class="spec-detail">
              <div class="spec-label">尺寸</div>
              <div class="spec-value">{{ imageData.picWidth}} * {{ imageData.picHeight }}</div>
            </div>
          </div>

          <div class="spec-item">
            <div class="spec-icon"><border-outlined /></div>
            <div class="spec-detail">
              <div class="spec-label">宽高比</div>
              <div class="spec-value">{{ imageData.picScale }}</div>
            </div>
          </div>

          <div class="spec-item">
            <div class="spec-icon"><file-outlined /></div>
            <div class="spec-detail">
              <div class="spec-label">文件大小</div>
              <div class="spec-value">{{ imageData.size || '2.4 MB' }}</div>
            </div>
          </div>

          <div class="spec-item">
            <div class="spec-icon"><calendar-outlined /></div>
            <div class="spec-detail">
              <div class="spec-label">上传时间</div>
              <div class="spec-value">{{ formatDate(imageData.createTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计数据区 -->
      <div class="stats-container">
        <div class="stats-header">
          <bar-chart-outlined />
          <span>统计数据</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card" :style="{ '--stat-color': '#4096ff' }">
            <div class="stat-icon-container">
              <eye-outlined class="stat-icon" />
            </div>
            <div class="stat-value">{{ formatNumber(imageData.viewCount) }}</div>
            <div class="stat-label">浏览量</div>
            <div class="stat-trend" :class="{ 'up': true }">
              <rise-outlined v-if="true" />
              <fall-outlined v-else />
              <span>8.2%</span>
            </div>
          </div>

          <div class="stat-card" :style="{ '--stat-color': '#ff4d4f' }">
            <div class="stat-icon-container">
              <heart-outlined class="stat-icon" />
            </div>
            <div class="stat-value">{{ formatNumber(imageData.likeCount) }}</div>
            <div class="stat-label">点赞数</div>
            <div class="stat-trend" :class="{ 'up': true }">
              <rise-outlined v-if="true" />
              <fall-outlined v-else />
              <span>5.7%</span>
            </div>
          </div>

          <div class="stat-card" :style="{ '--stat-color': '#faad14' }">
            <div class="stat-icon-container">
              <star-outlined class="stat-icon" />
            </div>
            <div class="stat-value">{{ formatNumber(imageData.collectionCount) }}</div>
            <div class="stat-label">收藏数</div>
            <div class="stat-trend" :class="{ 'up': true }">
              <rise-outlined v-if="true" />
              <fall-outlined v-else />
              <span>3.1%</span>
            </div>
          </div>

          <div class="stat-card" :style="{ '--stat-color': '#52c41a' }">
            <div class="stat-icon-container">
              <comment-outlined class="stat-icon" />
            </div>
            <div class="stat-value">{{ formatNumber(imageData.commentCount) }}</div>
            <div class="stat-label">评论数</div>
            <div class="stat-trend" :class="{ 'down': true }">
              <rise-outlined v-if="false" />
              <fall-outlined v-else />
              <span>1.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  InfoCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
  CommentOutlined,
  FileOutlined,
  FileImageOutlined,
  ColumnWidthOutlined,
  BorderOutlined,
  CalendarOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 定义组件的属性
const props = defineProps({
  imageData: {
    type: Object,
    required: true
  }
});

// 定义组件事件
defineEmits(['preview']);

// 格式化数字显示
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';

  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '--';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};
</script>

<style scoped>
.image-detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-detail-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(to right, #fafafa, #f5f5f5);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #1890ff;
  font-size: 18px;
}

.header-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.thumbnail-preview {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.thumbnail-preview:hover {
  transform: scale(1.05);
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 18px;
}

.thumbnail-preview:hover .preview-overlay {
  opacity: 1;
}

.card-content {
  padding: 0;
}

/* 技术参数区样式 */
.tech-specs {
  padding: 16px 20px;
  background: #fafafa;
  position: relative;
}

.specs-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  border-left: 3px solid #1890ff;
  padding-left: 8px;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.spec-item:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.spec-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  font-size: 16px;
}

.spec-detail {
  flex: 1;
}

.spec-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.spec-value {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* 统计数据区样式 */
.stats-container {
  padding: 16px 20px 20px;
  background: white;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  border-left: 3px solid #722ed1;
  padding-left: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  --stat-color: #1890ff;
  position: relative;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(var(--stat-color-rgb), 0.05) 0%, rgba(var(--stat-color-rgb), 0.1) 100%);
  border: 1px solid rgba(var(--stat-color-rgb), 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--stat-color);
  border-radius: 3px 3px 0 0;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: white;
  margin-bottom: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 20px;
  color: var(--stat-color);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.04);
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

/* 为每个统计卡片设置颜色变量 */
.stat-card:nth-child(1) {
  --stat-color-rgb: 64, 150, 255;
}

.stat-card:nth-child(2) {
  --stat-color-rgb: 255, 77, 79;
}

.stat-card:nth-child(3) {
  --stat-color-rgb: 250, 173, 20;
}

.stat-card:nth-child(4) {
  --stat-color-rgb: 82, 196, 26;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .specs-grid, .stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .thumbnail-preview {
    width: 40px;
    height: 40px;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .image-detail-card {
    background: #1f1f1f;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .card-header {
    background: linear-gradient(to right, #141414, #1a1a1a);
    border-bottom-color: #303030;
  }

  .header-title h3 {
    color: #e0e0e0;
  }

  .tech-specs {
    background: #141414;
  }

  .specs-header, .stats-header {
    color: #a6a6a6;
  }

  .spec-item {
    background: #1f1f1f;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .spec-icon {
    background: rgba(24, 144, 255, 0.2);
  }

  .spec-label {
    color: #a6a6a6;
  }

  .spec-value {
    color: #e0e0e0;
  }

  .stats-container {
    background: #1f1f1f;
  }

  .stat-card {
    background: rgba(var(--stat-color-rgb), 0.08);
    border-color: rgba(var(--stat-color-rgb), 0.2);
  }

  .stat-icon-container {
    background: #2a2a2a;
  }

  .stat-value {
    color: #e0e0e0;
  }

  .stat-trend {
    background-color: rgba(255, 255, 255, 0.04);
  }
}
</style>