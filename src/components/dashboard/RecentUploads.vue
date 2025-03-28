// components/dashboard/RecentUploads.vue
<template>
  <a-card
      class="recent-uploads-card"
      :bordered="false"
      title="最近上传图片"
  >
    <!-- 修复卡片右上角内容 -->
    <template #extra>
      <a href="javascript:void(0);" class="extra-link">查看全部</a>
    </template>

    <a-spin :spinning="loading">
      <!-- 图片网格 -->
      <div class="uploads-grid">
        <div
            v-for="item in recentUploads"
            :key="item.id"
            class="upload-item"
        >
          <div class="image-wrapper">
            <img :src="item.url" :alt="item.title" class="upload-image" />
            <div class="image-overlay">
              <div class="overlay-actions">
                <a-button
                    type="primary"
                    shape="circle"
                    class="action-button"
                >
                  <EyeOutlined />
                </a-button>
                <a-button
                    type="primary"
                    shape="circle"
                    class="action-button"
                >
                  <DownloadOutlined />
                </a-button>
                <a-button
                    type="primary"
                    shape="circle"
                    class="action-button"
                >
                  <HeartOutlined />
                </a-button>
              </div>
            </div>
          </div>

          <div class="upload-info">
            <div class="upload-title" :title="item.title">{{ item.title }}</div>
            <div class="upload-meta">
              <a-avatar :src="item.uploader.avatar" :size="20" />
              <span class="uploader-name">{{ item.uploader.name }}</span>
              <span class="upload-time">{{ formatDate(item.uploadTime) }}</span>
            </div>
            <div class="upload-stats">
              <div class="stat-item">
                <EyeOutlined />
                <span>{{ item.views }}</span>
              </div>
              <div class="stat-item">
                <HeartOutlined />
                <span>{{ item.likes }}</span>
              </div>
              <div class="stat-item">
                <DownloadOutlined />
                <span>{{ item.downloads }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <a-button type="link" class="view-more-btn">
          查看更多上传
          <RightOutlined />
        </a-button>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import {
  EyeOutlined,
  HeartOutlined,
  DownloadOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 模拟加载状态
const loading = ref(false);

// 模拟最近上传数据
const recentUploads = ref([
  {
    id: 1,
    title: '春天花海风景',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    uploadTime: '2025-03-28T08:45:23',
    uploader: {
      name: '王晓华',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    views: 128,
    likes: 43,
    downloads: 18
  },
  {
    id: 2,
    title: '创意UI设计作品',
    url: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    uploadTime: '2025-03-28T07:12:56',
    uploader: {
      name: '张艺谋',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    views: 89,
    likes: 32,
    downloads: 14
  },
  {
    id: 3,
    title: '城市夜景摄影',
    url: 'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438183972690-6d4658e3290e.webp',
    uploadTime: '2025-03-28T05:30:11',
    uploader: {
      name: '李小明',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    views: 76,
    likes: 28,
    downloads: 9
  },
  {
    id: 4,
    title: '现代简约风格插画',
    url: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
    uploadTime: '2025-03-27T22:18:45',
    uploader: {
      name: '赵明',
      avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
    },
    views: 65,
    likes: 21,
    downloads: 7
  }
]);

// 格式化日期，显示为相对时间（例如：3小时前）
const formatDate = (dateString) => {
  return dayjs(dateString).fromNow();
};
</script>

<style scoped>
.recent-uploads-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 480px;
}

.extra-link {
  color: #6151e6;
  font-size: 14px;
}

.uploads-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.upload-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.upload-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.image-wrapper {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.upload-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.upload-item:hover .upload-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-item:hover .image-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  color: white;
  background: rgba(97, 81, 230, 0.8);
  border: none;
}

.action-button:hover {
  background: #6151e6;
}

.upload-info {
  padding: 12px;
}

.upload-title {
  font-weight: 500;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-meta {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.uploader-name {
  margin-left: 6px;
  margin-right: 8px;
}

.upload-time {
  flex: 1;
  text-align: right;
}

.upload-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-item span {
  margin-left: 4px;
}

.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.view-more-btn {
  color: #6151e6;
}

@media (max-width: 576px) {
  .uploads-grid {
    grid-template-columns: 1fr;
  }
}
</style>