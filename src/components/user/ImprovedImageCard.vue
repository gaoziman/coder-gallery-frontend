<!-- ImprovedImageCard.vue -->
<template>
  <div class="image-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <!-- 图片容器 -->
    <div class="image-container">
      <!-- 顶部信息栏 - 仅在悬停时显示 -->
      <div class="info-bar" :class="{ 'visible': isHovered }">
        <div class="date">
          <clock-circle-outlined />
          <span>{{ formatDate(image.createTime) }}</span>
        </div>
        <div class="views">
          <eye-outlined />
          <span>{{ formatViewCount(image.views) }} 浏览</span>
        </div>
      </div>

      <!-- 图片 -->
      <img :src="image.src" :alt="image.title" class="card-image" />

      <!-- 操作按钮悬浮层 - 仅在悬停时显示 -->
      <div class="action-overlay" :class="{ 'visible': isHovered }">
        <div class="action-buttons">
          <a-button shape="circle" class="action-btn" @click.stop="$emit('view', image)">
            <template #icon><eye-outlined /></template>
          </a-button>
          <a-button shape="circle" class="action-btn" @click.stop="$emit('download', image)">
            <template #icon><download-outlined /></template>
          </a-button>
          <a-button
              shape="circle"
              class="action-btn"
              :class="{ 'liked': image.liked }"
              @click.stop="handleLike"
          >
            <template #icon>
              <heart-filled v-if="image.liked" />
              <heart-outlined v-else />
            </template>
          </a-button>
        </div>
      </div>
    </div>

    <!-- 卡片内容区 -->
    <div class="card-content">
      <div class="title-row">
        <!-- 标题区 -->
        <div class="card-title">
          <h3>{{ image.title }}</h3>
          <!-- 热门标签 - 移到标题的右侧 -->
          <div v-if="image.isHot" class="hot-tag">
            <fire-outlined />
            <span>热门</span>
          </div>
          <a-button type="text" class="favorite-btn">
            <template #icon><star-outlined /></template>
          </a-button>
        </div>
      </div>

      <!-- 作者信息 -->
      <div class="author-info">
        <a-avatar :src="image.author.avatar" :size="28" />
        <span class="author-name">{{ image.author.name }}</span>
      </div>

      <!-- 标签栏 -->
      <div class="tags-container">
        <a-tag
            v-for="(tag, index) in displayTags"
            :key="index"
            :color="getTagColor(index)"
        >
          {{ tag.name }}
        </a-tag>
        <a-tag v-if="moreTags" class="more-tag">
          +{{ moreTags }}
        </a-tag>
      </div>
    </div>

    <!-- 底部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <eye-outlined />
        <span>{{ formatCount(image.views) }}</span>
      </div>
      <div class="stat-item" :class="{ 'active': image.liked }">
        <heart-filled v-if="image.liked" />
        <heart-outlined v-else />
        <span>{{ formatCount(image.likes) }}</span>
      </div>
      <div class="stat-item">
        <message-outlined />
        <span>{{ formatCount(image.comments) }}</span>
      </div>
      <div class="share-btn">
        <share-alt-outlined />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  DownloadOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 定义props
const props = defineProps({
  image: {
    type: Object,
    required: true
  }
});

// 定义事件
const emit = defineEmits(['view', 'download', 'like']);

// 悬停状态
const isHovered = ref(false);

// 计算要显示的标签
const displayTags = computed(() => {
  return props.image.tags?.slice(0, 3) || [];
});

// 计算更多标签数量
const moreTags = computed(() => {
  const totalTags = props.image.tags?.length || 0;
  return totalTags > 3 ? totalTags - 3 : 0;
});

// 处理点赞事件
const handleLike = () => {
  emit('like', props.image);
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
};

// 格式化视图计数 (k表示上千)
const formatViewCount = (count) => {
  if (!count) return 0;
  return count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
};

// 格式化数字 (简化显示)
const formatCount = (count) => {
  if (!count) return 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count;
};

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['#6554C0', '#36CFC9', '#FF7A45', '#597EF7', '#73D13D'];
  return colors[index % colors.length];
};
</script>

<style scoped>
.image-card {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 图片容器 */
.image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-card:hover .card-image {
  transform: scale(1.05);
}

/* 顶部信息栏 - 默认隐藏，悬停时显示 */
.info-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  color: white;
  font-size: 13px;
  z-index: 2;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.info-bar.visible {
  opacity: 1;
  transform: translateY(0);
}

.date, .views {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 热门标签 - 放在标题旁边 */
.hot-tag {
  display: flex;
  align-items: center;
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3);
  margin-right: 8px;
  white-space: nowrap;
}

/* 标题行排列 */
.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

/* 操作按钮悬浮层 - 默认隐藏，悬停时显示 */
.action-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.action-overlay.visible {
  opacity: 1;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  width: 44px;
  height: 44px;
  background: white !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  background: white !important;
  color: #6554C0 !important;
}

.action-btn.liked {
  color: #ff4d4f !important;
}

/* 卡片内容 */
.card-content {
  padding: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  width: 100%;
}

.card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.favorite-btn {
  color: #bfbfbf;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.favorite-btn:hover {
  color: #faad14;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  margin-top: 12px;
}

.author-name {
  margin-left: 8px;
  font-size: 14px;
  color: #595959;
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
  min-height: 28px;
}

.more-tag {
  background: #f5f5f5 !important;
  border-color: #e8e8e8 !important;
  color: #8c8c8c !important;
}

/* 底部统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 24px;
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.stat-item:hover {
  color: #6554C0;
}

.stat-item.active {
  color: #ff4d4f;
}

.share-btn {
  margin-left: auto;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.3s ease;
}

.share-btn:hover {
  color: #6554C0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-container {
    height: 180px;
  }

  .action-btn {
    width: 40px;
    height: 40px;
  }

  .card-content {
    padding: 12px;
  }
}

@media (max-width: 576px) {
  .action-buttons {
    gap: 12px;
  }

  .stats-bar {
    padding: 10px 12px;
  }

  .stat-item {
    margin-right: 16px;
    font-size: 13px;
  }
}
</style>