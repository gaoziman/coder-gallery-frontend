<template>
  <a-card
      class="recent-uploads-card"
      :bordered="false"
      title="最近上传图片"
  >
    <!-- 卡片右上角内容 -->
    <template #extra>
      <router-link to="/uploads" class="extra-link">查看全部</router-link>
    </template>

    <a-spin :spinning="loading">
      <!-- 使用 ImageGallery 组件替换原有的上传网格 -->
      <div v-if="recentUploads.length > 0" class="uploads-container">
        <image-gallery
            :images="formatUploadsToGalleryImages(recentUploads)"
            empty-text="暂无上传图片"
            @view="viewImage"
            @download="downloadImage"
            @like="toggleLike"
            @bookmark="addToFavorites"
            @share="shareImage"
            @delete="confirmDelete"
            @navigate-to-detail="navigateToDetail"
            @refresh="refreshUploads"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-uploads">
        <a-empty description="暂无上传图片">
          <template #extra>
            <a-button type="primary" @click="goToUploadPage">开始上传</a-button>
          </template>
        </a-empty>
      </div>

      <div class="card-footer">
        <router-link to="/uploads" class="view-more-btn">
          <a-button type="link">
            查看更多上传
            <right-outlined />
          </a-button>
        </router-link>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import {
  EyeOutlined,
  HeartOutlined,
  DownloadOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import ImageGallery from '@/components/common/ImageGallery.vue';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();

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
    downloads: 18,
    category: '风景',
    tags: [
      {name: '春天', color: 'green'},
      {name: '花海', color: 'pink'},
    ],
    aspectRatio: '16/9',
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
    downloads: 14,
    category: '设计',
    tags: [
      {name: 'UI设计', color: 'blue'},
      {name: '创意', color: 'purple'},
    ],
    aspectRatio: '4/3',
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
    downloads: 9,
    category: '城市',
    tags: [
      {name: '夜景', color: ''},
      {name: '摄影', color: ''},
    ],
    aspectRatio: '16/9',
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
    downloads: 7,
    category: '插画',
    tags: [
      {name: '简约', color: ''},
      {name: '现代', color: ''},
    ],
    aspectRatio: '3/4',
  }
]);

// 格式化日期，显示为相对时间（例如：3小时前）
const formatDate = (dateString) => {
  return dayjs(dateString).fromNow();
};

// 将上传数据格式化为图片库组件需要的格式
const formatUploadsToGalleryImages = (uploads) => {
  return uploads.map(item => {
    return {
      id: item.id,
      src: item.url,
      title: item.title,
      author: item.uploader,
      category: item.category || '',
      tags: item.tags || [],
      createTime: item.uploadTime,
      viewTime: item.uploadTime,
      // 其他属性
      views: item.views,
      likes: item.likes,
      comments: Math.floor(item.views * 0.1),
      bookmarked: false,
      liked: false,
      aspectRatio: item.aspectRatio || '16/9',
    };
  });
};

// 查看图片
const viewImage = (image) => {
  navigateToDetail(image);
};

// 下载图片
const downloadImage = (image) => {
  message.success('图片下载中...');

  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = image.src;
  a.download = image.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 点赞或取消点赞
const toggleLike = (image) => {
  // 找到原始数据中的项目
  const uploadItem = recentUploads.value.find(item => item.id.toString() === image.id.toString());
  if (uploadItem) {
    // 这里仅做示意，实际应用中应该调用API
    uploadItem.likes = uploadItem.likes + (image.liked ? 1 : -1);
  }

  message.success(image.liked ? '已添加到喜欢' : '已取消喜欢');
};

// 添加到收藏夹
const addToFavorites = (image) => {
  message.success(`已将"${image.title}"添加到收藏`);
};

// 分享图片
const shareImage = (image) => {
  message.success(`分享"${image.title}"的链接已复制到剪贴板`);
};

// 确认删除
const confirmDelete = (image) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除"${image.title}"吗？删除后将无法恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 实际删除逻辑
      const index = recentUploads.value.findIndex(item => item.id.toString() === image.id.toString());
      if (index !== -1) {
        recentUploads.value.splice(index, 1);
        message.success('删除成功');
      }
    },
  });
};

// 导航到详情页
const navigateToDetail = (image) => {
  router.push({
    name: 'PictureDetail',
    params: { id: image.id },
    state: { imageData: image }
  });
};

// 刷新上传列表
const refreshUploads = () => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    loading.value = false;
    message.success('已刷新上传列表');
  }, 1000);
};

// 跳转到上传页面
const goToUploadPage = () => {
  router.push('/upload');
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

.uploads-container {
  margin-bottom: 16px;
}

/* 自定义瀑布流样式，使其适应仪表盘卡片 */
.uploads-container :deep(.masonry-gallery) {
  column-count: 2;
  column-gap: 16px;
}

@media (max-width: 1400px) {
  .uploads-container :deep(.masonry-gallery) {
    column-count: 2;
  }
}

@media (max-width: 576px) {
  .uploads-container :deep(.masonry-gallery) {
    column-count: 1;
  }
}

.empty-uploads {
  text-align: center;
  padding: 40px 0;
}

.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.view-more-btn {
  color: #6151e6;
  text-decoration: none;
}

.view-more-btn:hover {
  opacity: 0.8;
}
</style>