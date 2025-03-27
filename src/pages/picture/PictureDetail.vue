<template>
  <div class="picture-detail-page">
    <!-- 返回按钮 -->
    <div class="back-action">
      <a-button @click="goBack" type="primary">
        <template #icon><left-outlined /></template>
        返回
      </a-button>
    </div>

    <div class="detail-container">
      <!-- 左侧：图片展示区 -->
      <div class="picture-view-section">
        <!-- 图片展示区 -->
        <div class="image-display"
             :class="{ 'fullscreen-mode': isFullscreen }"
             v-motion
             :initial="{ opacity: 0, scale: 0.95 }"
             :enter="{ opacity: 1, scale: 1, transition: { delay: 100, duration: 500 } }">
          <div class="image-wrapper">
            <div class="image-container">
              <a-image
                  :src="currentPicture.src"
                  :alt="currentPicture.title"
                  :preview="false"
                  class="main-image"
              />

              <!-- 全屏按钮 -->
              <div class="fullscreen-control">
                <a-button
                    class="action-button fullscreen-btn"
                    @click="toggleFullscreen"
                    type="text"
                >
                  <template #icon>
                    <expand-outlined v-if="!isFullscreen" />
                    <compress-outlined v-else />
                  </template>
                </a-button>
              </div>
            </div>

            <!-- 图片控制区域 -->
            <div class="image-controls">
              <!-- 上一张/下一张导航按钮 -->
              <div class="nav-buttons">
                <a-button
                    class="nav-button prev-button"
                    @click="navigateToPrevious"
                    :disabled="!hasPrevious"
                >
                  <template #icon><left-outlined /></template>
                  上一张
                </a-button>
                <a-button
                    class="nav-button next-button"
                    @click="navigateToNext"
                    :disabled="!hasNext"
                >
                  下一张
                  <template #icon><right-outlined /></template>
                </a-button>
              </div>

              <!-- 图片操作按钮 -->
              <div class="action-buttons">
                <a-tooltip title="点赞">
                  <a-button
                      class="action-button like-btn"
                      :type="currentPicture.liked ? 'primary' : 'default'"
                      shape="circle"
                      @click="toggleLike"
                  >
                    <template #icon>
                      <heart-filled v-if="currentPicture.liked" />
                      <heart-outlined v-else />
                    </template>
                  </a-button>
                </a-tooltip>

                <a-tooltip title="收藏">
                  <a-button
                      class="action-button collect-btn"
                      :type="currentPicture.collected ? 'primary' : 'default'"
                      shape="circle"
                      @click="toggleCollect"
                  >
                    <template #icon>
                      <star-filled v-if="currentPicture.collected" />
                      <star-outlined v-else />
                    </template>
                  </a-button>
                </a-tooltip>

                <a-dropdown :trigger="['click']">
                  <a-tooltip title="分享">
                    <a-button class="action-button share-btn" shape="circle">
                      <template #icon><share-alt-outlined /></template>
                    </a-button>
                  </a-tooltip>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="shareToWeChat">
                        <template #icon><wechat-outlined /></template>
                        微信
                      </a-menu-item>
                      <a-menu-item @click="shareToWeibo">
                        <template #icon><weibo-outlined /></template>
                        微博
                      </a-menu-item>
                      <a-menu-item @click="copyLink">
                        <template #icon><link-outlined /></template>
                        复制链接
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>

                <a-dropdown :trigger="['click']">
                  <a-tooltip title="更多操作">
                    <a-button class="action-button more-btn" shape="circle">
                      <template #icon><more-outlined /></template>
                    </a-button>
                  </a-tooltip>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="reportImage">
                        <template #icon><warning-outlined /></template>
                        举报图片
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：图片信息区 -->
      <div class="picture-info-section"
           v-motion
           :initial="{ opacity: 0, x: 20 }"
           :enter="{ opacity: 1, x: 0, transition: { delay: 300, duration: 500 } }">
        <a-card class="info-card" :bordered="false">
          <!-- 标题与作者信息 -->
          <div class="picture-header">
            <h1 class="picture-title">{{ currentPicture.title }}</h1>

            <div class="author-info">
              <router-link :to="`/user/${currentPicture.author.id}`" class="author-link">
                <a-avatar :src="currentPicture.author.avatar" :size="36" />
                <div class="author-details">
                  <span class="author-name">{{ currentPicture.author.name }}</span>
                  <span class="upload-time">{{ formatUploadTime(currentPicture.uploadTime) }}</span>
                </div>
              </router-link>
              <a-button class="follow-btn" size="small" @click="toggleFollow">
                {{ currentPicture.isFollowing ? '已关注' : '关注' }}
              </a-button>
            </div>
          </div>

          <!-- 图片描述 -->
          <div class="picture-description" v-if="currentPicture.description">
            <p>{{ currentPicture.description }}</p>
          </div>

          <!-- 标签 -->
          <div class="picture-tags">
            <a-tag
                v-for="tag in currentPicture.tags"
                :key="tag.name"
                :color="tag.color || undefined"
                class="picture-tag"
            >
              {{ tag.name }}
            </a-tag>
          </div>

          <!-- 图片详细信息 -->
          <a-divider class="info-divider" />

          <div class="picture-details">
            <div class="detail-item">
              <span class="detail-label">分类</span>
              <span class="detail-value">{{ currentPicture.category }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">格式</span>
              <span class="detail-value">{{ currentPicture.format }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">尺寸</span>
              <span class="detail-value">{{ currentPicture.width }} × {{ currentPicture.height }}px</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">大小</span>
              <span class="detail-value">{{ formatFileSize(currentPicture.fileSize) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">宽高比</span>
              <span class="detail-value">{{ calculateAspectRatio(currentPicture.width, currentPicture.height) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">浏览量</span>
              <span class="detail-value">{{ formatNumber(currentPicture.views) }}</span>
            </div>
          </div>

          <!-- 下载和编辑按钮 -->
          <div class="action-buttons-container">
            <a-button type="primary" class="download-btn" @click="downloadImage">
              <template #icon><download-outlined /></template>
              下载图片
            </a-button>

            <a-button v-if="isOwner" class="edit-btn" @click="editImage">
              <template #icon><edit-outlined /></template>
              编辑图片
            </a-button>
          </div>

          <!-- 统计信息 -->
          <div class="stats-container">
            <div class="stat-item">
              <eye-outlined />
              <span>{{ formatNumber(currentPicture.views) }} 浏览</span>
            </div>
            <div class="stat-item">
              <heart-outlined />
              <span>{{ formatNumber(currentPicture.likes) }} 喜欢</span>
            </div>
            <div class="stat-item">
              <star-outlined />
              <span>{{ formatNumber(currentPicture.collections) }} 收藏</span>
            </div>
            <div class="stat-item">
              <message-outlined />
              <span>{{ formatNumber(currentPicture.comments) }} 评论</span>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comments-section"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">
      <CommentSystem
          :pictureId="pictureId"
          :comments="comments"
          @reply="handleReply"
          @delete="handleDeleteComment"
          @like="handleLikeComment"
      />
    </div>

    <!-- 相关推荐 -->
    <div class="related-section"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 700, duration: 500 } }">
      <h2 class="section-title">相关推荐</h2>
      <div class="related-pictures">
        <div
            v-for="(pic, index) in relatedPictures"
            :key="index"
            class="related-picture-item"
            @click="navigateToDetail(pic.id)"
        >
          <a-image
              :src="pic.src"
              :alt="pic.title"
              :preview="false"
              class="related-image"
          />
          <div class="related-info">
            <div class="related-title">{{ pic.title }}</div>
            <div class="related-author">
              <a-avatar :src="pic.author.avatar" :size="24" />
              <span>{{ pic.author.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import {
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
  MoreOutlined,
  WarningOutlined,
  LinkOutlined,
  WechatOutlined,
  WeiboOutlined,
  ExpandOutlined,
  CompressOutlined,
} from '@ant-design/icons-vue';
import CommentSystem from '@/components/comment/CommentSystem.vue';

// 日期格式化初始化
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 路由
const route = useRoute();
const router = useRouter();
const pictureId = computed(() => route.params.id as string);

// 全屏状态
const isFullscreen = ref(false);

// 示例图片数据
const currentPicture = reactive({
  id: '1',
  src: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  title: 'macbook-abstract-40',
  description: '这是一张关于 MacBook 的抽象艺术照片，展示了简约与创意的完美结合。光影交错，色彩柔和，体现了现代科技美学。',
  author: {
    id: 'user123',
    name: '程序员Leo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
  },
  uploadTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
  category: '海报',
  format: 'JPG',
  width: 1920,
  height: 1280,
  fileSize: 2.5 * 1024 * 1024, // 2.5MB
  views: 15836,
  likes: 458,
  collections: 129,
  comments: 37,
  tags: [
    { name: '海报', color: 'purple' },
    { name: 'Mac壁纸', color: '' },
    { name: '创意', color: 'green' },
    { name: '办公', color: 'blue' },
  ],
  liked: false,
  collected: false,
  isFollowing: false,
});

// 判断是否是图片所有者
const isOwner = computed(() => {
  // 这里可以根据实际登录用户ID与图片作者ID比较
  // 示例中默认为false，表示当前用户不是图片所有者
  return false;
});

// 相关推荐图片
const relatedPictures = reactive([
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '自然风光摄影集',
    author: {
      name: '摄影师小王',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代UI组件设计集',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '二次元精选壁纸',
    author: {
      name: '动漫爱好者',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
  },
]);

// 示例评论数据
const comments = reactive([
  {
    id: 'comment1',
    author: {
      id: 'user1',
      name: '评论用户A',
      avatar: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    },
    content: '这张图片真的很惊艳，非常喜欢这种简约风格！',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: 'reply1',
        author: {
          id: 'user2',
          name: '评论用户B',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
        },
        replyTo: {
          id: 'user1',
          name: '评论用户A',
        },
        content: '同意，尤其是光影的处理非常专业！',
        time: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前
        likes: 2,
        isLiked: false,
      }
    ]
  },
  {
    id: 'comment2',
    author: {
      id: 'user3',
      name: '评论用户C',
      avatar: 'https://images.unsplash.com/photo-1557296387-5358ad7997bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    },
    content: '请问这种效果用什么软件做的？非常棒的构图！',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
    likes: 3,
    isLiked: false,
    replies: []
  }
]);

// 格式化上传时间
const formatUploadTime = (time :any) => {
  return dayjs(time).fromNow();
};

// 格式化文件大小
const formatFileSize = (bytes :any) => {
  if (bytes < 1024) {
    return bytes + 'B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + 'KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }
};

// 格式化数字（添加千位分隔符）
const formatNumber = (num :any) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 计算宽高比
const calculateAspectRatio = (width :any, height :any) => {
  const gcd :any = (a :any, b :any) => (b ? gcd(b, a % b) : a);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

// 上一张/下一张图片的判断
const hasPrevious = ref(true);
const hasNext = ref(true);

// 导航到上一张图片
const navigateToPrevious = () => {
  message.info('正在加载上一张图片');
  // 实际应用中这里应该跳转到上一张图片
};

// 导航到下一张图片
const navigateToNext = () => {
  message.info('正在加载下一张图片');
  // 实际应用中这里应该跳转到下一张图片
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 切换点赞状态
const toggleLike = () => {
  currentPicture.liked = !currentPicture.liked;
  if (currentPicture.liked) {
    currentPicture.likes++;
    message.success('点赞成功');
  } else {
    currentPicture.likes--;
    message.info('已取消点赞');
  }
};

// 切换收藏状态
const toggleCollect = () => {
  currentPicture.collected = !currentPicture.collected;
  if (currentPicture.collected) {
    currentPicture.collections++;
    message.success('收藏成功');
  } else {
    currentPicture.collections--;
    message.info('已取消收藏');
  }
};

// 切换关注状态
const toggleFollow = () => {
  currentPicture.isFollowing = !currentPicture.isFollowing;
  if (currentPicture.isFollowing) {
    message.success(`已关注 ${currentPicture.author.name}`);
  } else {
    message.info(`已取消关注 ${currentPicture.author.name}`);
  }
};

// 分享到微信
const shareToWeChat = () => {
  message.success('已生成微信分享二维码');
  // 实际应用中弹出微信分享二维码
};

// 分享到微博
const shareToWeibo = () => {
  const shareUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(`${currentPicture.title} - 来自智能云图库`);
  window.open(`https://service.weibo.com/share/share.php?url=${shareUrl}&title=${title}`);
  message.success('正在打开微博分享页面');
};

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    message.success('链接已复制到剪贴板');
  });
};

// 下载图片
const downloadImage = () => {
  message.success('图片下载中...');
  // 实际应用中处理图片下载逻辑
};

// 编辑图片
const editImage = () => {
  router.push(`/edit-image/${pictureId.value}`);
};

// 举报图片
const reportImage = () => {
  message.info('举报功能即将上线');
  // 实际应用中处理举报逻辑
};

// 全屏模式切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 导航到详情页
const navigateToDetail = (id :any) => {
  router.push(`/picture/${id}`);
};

// 处理评论回复
const handleReply = (comment :any, content :any) => {
  message.success('回复成功');
  // 实际应用中处理评论回复逻辑
};

// 处理评论删除
const handleDeleteComment = (commentId :any) => {
  message.success('评论已删除');
  // 实际应用中处理评论删除逻辑
};

// 处理评论点赞
const handleLikeComment = (commentId :any, liked :any) => {
  message.success(liked ? '已点赞评论' : '已取消点赞');
  // 实际应用中处理评论点赞逻辑
};

// 初始化
onMounted(() => {
  // 增加浏览量
  currentPicture.views++;
  // 实际应用中获取图片详情数据
});
</script>

<style scoped>
.picture-detail-page {
  padding: 16px 24px 40px;
}

.back-action {
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  color: #666;
  transition: all 0.3s;
}

.back-btn:hover {
  color: var(--primary-color, #722ed1);
  background: rgba(114, 46, 209, 0.05);
}

.detail-container {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

/* 左侧图片区域 */
.picture-view-section {
  flex: 1;
  max-width: 65%;
}

.image-display {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  display: flex;
  flex-direction: column;
}

.image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.main-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.fullscreen-control {
  position: absolute;
  top: 10px;
  right: 10px;
}

.fullscreen-btn {
  background: rgba(255, 255, 255, 0.7);
  border: none;
}

.image-controls {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-button {
  transition: all 0.3s;
}

.action-button:hover {
  transform: translateY(-2px);
}

.like-btn.ant-btn-primary {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

.collect-btn.ant-btn-primary {
  background-color: #faad14;
  border-color: #faad14;
}

/* 右侧信息区域 */
.picture-info-section {
  width: 35%;
  min-width: 320px;
}

.info-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.picture-header {
  margin-bottom: 16px;
}

.picture-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.author-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.upload-time {
  font-size: 12px;
  color: #999;
}

.follow-btn {
  background: transparent;
  border: 1px solid var(--primary-color, #722ed1);
  color: var(--primary-color, #722ed1);
  border-radius: 16px;
  padding: 0 12px;
  transition: all 0.3s;
}

.picture-description {
  margin-bottom: 16px;
  color: #666;
  line-height: 1.6;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.picture-tag {
  border-radius: 16px;
  padding: 4px 12px;
  margin: 0;
}

.info-divider {
  margin: 16px 0;
}

.picture-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.action-buttons-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.download-btn {
  flex: 1;
  height: 40px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--primary-color, #722ed1) 0%, #845ee3 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(130, 94, 227, 0.3);
}

.edit-btn {
  height: 40px;
  border-radius: 8px;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
}

/* 评论区样式 */
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 相关推荐区域 */
.related-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.related-pictures {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.related-picture-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.related-picture-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.related-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.5s;
}

.related-picture-item:hover .related-image {
  transform: scale(1.05);
}

.related-info {
  padding: 12px;
}

.related-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .detail-container {
    flex-direction: column;
  }

  .picture-view-section,
  .picture-info-section {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .related-pictures {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .main-image {
    max-height: 50vh;
  }

  .picture-details {
    grid-template-columns: 1fr;
  }
}
</style>