<!-- components/common/ImageCard.vue -->
<template>
  <div class="image-card" @click="navigateToDetail">
    <div class="image-cover-container" :style="{ aspectRatio: image.aspectRatio || '16/9' }">
      <!-- 图片 -->
      <img
          :src="image.src"
          :alt="image.title"
          class="gallery-image loaded"
          @error="handleImageError"
      />

      <!-- 悬停时显示的信息遮罩层 -->
      <div class="image-hover-overlay">
        <div class="image-meta-info">
          <div class="meta-item">
            <clock-circle-outlined />
            <span>{{ formatDate(image.createTime) }}</span>
          </div>
          <div class="meta-item">
            <eye-outlined />
            <span>{{ formatNumber(image.views) }} 浏览</span>
          </div>
        </div>

        <div class="image-actions">
          <a-button type="primary" shape="circle" class="action-btn view-btn" @click.stop="viewImage">
            <template #icon><eye-outlined /></template>
          </a-button>
          <a-button type="primary" shape="circle" class="action-btn download-btn" @click.stop="downloadImage">
            <template #icon><download-outlined /></template>
          </a-button>
          <a-button
              v-if="isOwner"
              type="primary"
              shape="circle"
              class="action-btn delete-btn"
              @click.stop="confirmDelete">
            <template #icon><delete-outlined /></template>
          </a-button>
          <a-button
              v-else
              type="primary"
              shape="circle"
              :class="{ 'action-btn': true, 'like-btn': true, 'liked': image.liked }"
              @click.stop="toggleLike">
            <template #icon>
              <heart-filled v-if="image.liked"/>
              <heart-outlined v-else/>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 图片右下角的热门标签 -->
      <div v-if="isHot" class="hot-badge">
        <fire-outlined />
        <span>热门</span>
      </div>
    </div>

    <div class="image-info">
      <!-- 标题和收藏按钮并排 -->
      <div class="image-header">
        <div class="image-title">{{ image.title }}</div>
        <div class="bookmark-btn" @click.stop="toggleBookmark">
          <star-filled v-if="image.bookmarked" class="bookmarked" />
          <star-outlined v-else />
        </div>
      </div>

      <!-- 作者信息和时间 -->
      <div class="image-author-row">
        <div class="image-author">
          <a-avatar :src="image.author.avatar" :size="24"/>
          <span class="author-name">{{ image.author.name }}</span>
        </div>
        <div class="image-date">
          <clock-circle-outlined />
          <span>{{ formatShortDate(image.createTime) }}</span>
        </div>
      </div>

      <!-- 分类和标签区域 -->
      <div class="image-taxonomy">
        <!-- 单个分类标签 - 使用更深的颜色 -->
        <a-tag v-if="image.category" class="image-category" :color="getCategoryColor(image.category)">
          {{ image.category }}
        </a-tag>

        <!-- 标签 - 使用浅色背景和深色文字 -->
        <a-tag
            v-for="(tag, tagIndex) in image.tags.slice(0, 3)"
            :key="tagIndex"
            class="image-tag"
            :style="{
              backgroundColor: getTagColor(tag.name, true).backgroundColor,
              color: getTagColor(tag.name, true).color,
              borderColor: 'transparent'
            }"
        >
          {{ tag.name }}
        </a-tag>

        <!-- 如果标签过多，显示还有更多 -->
        <a-tag v-if="image.tags.length > 3" class="image-more-tag">
          +{{ image.tags.length - 3 }}
        </a-tag>
      </div>

      <!-- 图片底部的互动区域 -->
      <div class="image-interaction">
        <div class="interaction-stat">
          <eye-outlined />
          <span>{{ formatNumber(image.views) }}</span>
        </div>
        <div class="interaction-stat" :class="{ 'active': image.liked }" @click.stop="toggleLike">
          <heart-outlined v-if="!image.liked" />
          <heart-filled v-else />
          <span>{{ formatNumber(image.likes || Math.floor(image.views * 0.4)) }}</span>
        </div>
        <div class="interaction-stat">
          <message-outlined />
          <span>{{ formatNumber(image.comments || Math.floor(image.views * 0.1)) }}</span>
        </div>
        <div class="interaction-share" @click.stop="shareImage">
          <share-alt-outlined />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  StarOutlined,
  StarFilled,
  FireOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue';
import { computed, defineProps, defineEmits } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { createVNode } from 'vue';
import { LinkOutlined, WechatOutlined, WeiboOutlined, QqOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  image: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  'view',
  'download',
  'like',
  'bookmark',
  'share',
  'delete',
  'navigate-to-detail'
]);

// 判断图片是否为热门
const isHot = computed(() => {
  return (props.image.views > 3000 || (props.image.likes && props.image.likes > 500));
});

// 判断是否是图片所有者
const isOwner = computed(() => {
  // 这里需要根据实际登录用户ID和图片作者ID比较
  // 示例中简单返回false，表示当前用户不是所有图片的所有者
  return false;
});

// 格式化创建时间
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间';
  return dayjs(timestamp).format('YYYY-MM-DD');
};

// 格式化短日期（仅显示月和日）
const formatShortDate = (timestamp) => {
  if (!timestamp) return '未知';
  return dayjs(timestamp).format('MM-DD');
};

// 格式化浏览量，如果超过1000则显示为1k+
const formatNumber = (num) => {
  if (!num && num !== 0) return 0;
  return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num;
};

// 分类颜色映射表
const categoryColors = {
  '全部': '#6554C0', // 主题紫色
  '个人': '#1677ff', // 深蓝色
  '星球': '#389e0d', // 深绿色
  '面试题': '#d48806', // 深黄色
  '表情包': '#c41d7f', // 深粉色
  '素材': '#08979c', // 深青色
  '学习': '#1d39c4', // 深靛青色
  'Bugs': '#d4380d', // 深橙色
  '海报': '#531dab', // 深紫色
  '壁纸': '#c41d7f', // 深品红色
  '动漫': '#d46b08',  // 深橙黄色
  '风景': '#08979c',  // 深青色
  '城市': '#1d39c4',  // 深靛青色
  '时尚': '#c41d7f',  // 深粉色
  '校园': '#389e0d',  // 深绿色
  '美食': '#d46b08',  // 深橙黄色
  '建筑': '#531dab',  // 深紫色
  '艺术': '#08979c',  // 深青色
  '户外': '#389e0d',  // 深绿色
  '生活': '#1677ff',  // 深蓝色
};

// 获取分类颜色 - 更深的颜色
const getCategoryColor = (category) => {
  return categoryColors[category] || '#6554C0'; // 默认使用主题紫色
};

// 为标签生成不同的颜色 - 根据参数决定是否使用浅色
const getTagColor = (tagName, useLighterColors = false) => {
  // 标签颜色映射 - 浅色系列
  const lighterColors = [
    '#e6f7ff', '#f6ffed', '#fffbe6', '#fff7e6',
    '#fff0f6', '#f9f0ff', '#f0f5ff', '#e6fffb'
  ];

  // 标签文字颜色映射 - 对应的深色
  const textColors = [
    '#1677ff', '#52c41a', '#faad14', '#fa8c16',
    '#eb2f96', '#722ed1', '#2f54eb', '#13c2c2'
  ];

  // 使用标签名计算一个哈希值
  const hashCode = tagName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const index = hashCode % textColors.length;

  // 如果需要浅色，返回背景色和文字色的组合
  if (useLighterColors) {
    return {
      backgroundColor: lighterColors[index],
      color: textColors[index]
    };
  }

  // 否则返回普通的深色
  return textColors[index];
};

// 图片加载错误处理
const handleImageError = (event) => {
  console.error(`图片加载失败: ${props.image.src}`);
  // 设置替代图片 - 使用一个更可靠的占位图片服务
  event.target.src = 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg';
};

// 导航到图片详情页
const navigateToDetail = () => {
  emit('navigate-to-detail', props.image);
};

// 处理图片浏览
const viewImage = () => {
  emit('view', props.image);
};

// 处理图片下载
const downloadImage = () => {
  emit('download', props.image);
};

// 确认删除图片
const confirmDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后将无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      emit('delete', props.image);
    }
  });
};

// 点赞或取消点赞
const toggleLike = () => {
  emit('like', props.image);
};

// 切换收藏状态
const toggleBookmark = () => {
  emit('bookmark', props.image);
};

// 分享图片
const shareImage = () => {
  // 创建分享选项
  Modal.info({
    title: '分享图片',
    content: (h) => h('div', [
      h('p', `分享"${props.image.title}"到:`),
      h('div', {
        style: 'display: flex; justify-content: space-around; margin-top: 16px;'
      }, [
        h('div', { class: 'share-option' }, [
          h(WechatOutlined, { style: 'font-size: 24px; color: #07C160;' }),
          h('p', '微信')
        ]),
        h('div', { class: 'share-option' }, [
          h(WeiboOutlined, { style: 'font-size: 24px; color: #E6162D;' }),
          h('p', '微博')
        ]),
        h('div', { class: 'share-option' }, [
          h(QqOutlined, { style: 'font-size: 24px; color: #12B7F5;' }),
          h('p', 'QQ')
        ]),
        h('div', { class: 'share-option' }, [
          h(LinkOutlined, { style: 'font-size: 24px; color: #6554C0;' }),
          h('p', '复制链接')
        ])
      ])
    ]),
    okText: '取消',
    icon: createVNode(ShareAltOutlined),
  });

  emit('share', props.image);
};
</script>

<style scoped>
/* 图片卡片整体样式 */
.image-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  cursor: pointer;
  position: relative;
  height: 100%;
  break-inside: avoid;
  display: flex;
  flex-direction: column;
}

.image-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 图片容器 - 动态宽高比 */
.image-cover-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #f5f5f5; /* 添加背景色作为加载前的占位 */
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.3s ease;
  opacity: 1; /* 默认显示 */
}

.image-card:hover .gallery-image {
  transform: scale(1.05);
}

/* 右上角的统计信息 */
.image-stats-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  pointer-events: none;
  z-index: 2;
}

.stat-badge {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(3px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.views-badge {
  background-color: rgba(0, 0, 0, 0.6);
}

.likes-badge {
  background-color: rgba(0, 0, 0, 0.6);
}

.likes-badge.liked {
  background-color: rgba(244, 63, 94, 0.8);
}

/* 悬停遮罩层 */
.image-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  color: white;
  z-index: 3;
}

.image-card:hover .image-hover-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 右下角热门标签 */
.hot-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(244, 63, 94, 0.9);
  color: white;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(3px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 元数据信息 */
.image-meta-info {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 操作按钮区域 */
.image-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  height: 36px !important;
  width: 36px !important;
  background-color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.action-btn :deep(.anticon) {
  color: #666 !important;
  font-size: 16px;
}

/* 不同按钮悬停效果 */
.view-btn:hover {
  background-color: #6554C0 !important;
}

.download-btn:hover {
  background-color: #10B981 !important;
}

.delete-btn:hover {
  background-color: #EF4444 !important;
}

.like-btn:hover, .like-btn.liked {
  background-color: #F43F5E !important;
}

.action-btn:hover :deep(.anticon) {
  color: white !important;
}

/* 图片信息区域布局优化 */
.image-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 标题和收藏按钮 */
.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-btn {
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-btn:hover {
  color: #6554C0;
}

.bookmark-btn .bookmarked {
  color: #FAAD14;
}

/* 作者行 */
.image-author-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.image-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.image-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

/* 分类和标签区域 */
.image-taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 8px 0;
}

.image-category,
.image-tag,
.image-more-tag {
  font-size: 11px;
  padding: 1px 6px !important;
  border-radius: 4px;
  margin: 0 !important;
  height: auto !important;
  line-height: 1.6 !important;
}

/* 交互区域 */
.image-interaction {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.interaction-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  padding: 0 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interaction-stat:hover, .interaction-stat.active {
  color: #6554C0;
}

.interaction-stat.active {
  color: #F43F5E;
}

.interaction-share {
  margin-left: auto;
  padding: 4px 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.interaction-share:hover {
  color: #6554C0;
}

/* 分享选项样式 */
:deep(.share-option) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.share-option:hover) {
  background-color: #f5f5f5;
}

:deep(.share-option p) {
  margin: 0;
  font-size: 14px;
}

/* 暗模式兼容 */
@media (prefers-color-scheme: dark) {
  .image-card {
    background: #1f1f1f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .image-title {
    color: #f0f0f0;
  }

  .author-name {
    color: #ccc;
  }

  .image-more-tag {
    background-color: #2c2c2c;
    color: #bbb;
  }

  .image-interaction {
    border-top-color: #2a2a2a;
  }

  .interaction-stat,
  .interaction-share {
    color: #aaa;
  }

  .bookmark-btn {
    color: #888;
  }

  .bookmark-btn:hover {
    color: #8b7ae8;
  }

  :deep(.share-option:hover) {
    background-color: #2a2a2a;
  }
}
</style>