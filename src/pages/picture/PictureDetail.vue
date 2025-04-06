<!-- pages/picture/PictureDetail.vue -->
<template>
  <div class="detail-page">
    <!-- 重新设计的顶部导航区域 -->
    <div class="header-card">
      <div class="header-content">
        <!-- 左侧返回与标题 -->
        <div class="header-left">
          <a-button @click="goBack" class="back-button">
            <template #icon>
              <arrow-left-outlined/>
            </template>
            返回
          </a-button>

          <div class="title-divider"></div>

          <div class="title-section">
            <h1 class="image-heading">{{ currentImage.title }}</h1>
            <div class="image-category">{{ currentImage.category }} · {{ currentImage.author?.name }}</div>
          </div>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="header-right">
          <a-tag class="view-tag">
            <template #icon>
              <eye-outlined/>
            </template>
            {{ formatNumber(currentImage.views || 0) }}
          </a-tag>

          <a-button class="action-button" type="text">
            <template #icon>
              <share-alt-outlined/>
            </template>
          </a-button>
        </div>
      </div>
    </div>

    <div class="detail-container" v-motion :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { duration: 500 } }">
      <a-row :gutter="[16, 0]">
        <!-- 左侧图片区域 -->
        <a-col :xs="24" :lg="16" :xl="17" class="card-col">
          <!-- 左侧图片区域部分的修改 -->
          <div class="image-container" v-motion :initial="{ y: 20, opacity: 0 }"
               :enter="{ y: 0, opacity: 1, transition: { delay: 100, duration: 400 } }">
            <!-- 图片浏览区 -->
            <div class="picture-viewer">
              <!-- 上一张/下一张按钮 -->
              <div class="navigation-buttons">
                <a-button
                    class="nav-button prev-button"
                    shape="circle"
                    @click="navigateToPrev"
                    :disabled="!hasPrevImage"
                >
                  <template #icon>
                    <left-outlined/>
                  </template>
                </a-button>
                <a-button
                    class="nav-button next-button"
                    shape="circle"
                    @click="navigateToNext"
                    :disabled="!hasNextImage"
                >
                  <template #icon>
                    <right-outlined/>
                  </template>
                </a-button>
              </div>

              <!-- 主图片 - 调整为flex-grow占满空间 -->
              <div class="main-image-wrapper">
                <img
                    :src="currentImage.src"
                    :alt="currentImage.title"
                    class="main-image"
                    @load="imageLoaded = true"
                    :class="{ 'image-loaded': imageLoaded }"
                />
                <!-- 图片加载中骨架屏 -->
                <a-skeleton-image v-if="!imageLoaded" :active="true" class="image-skeleton"/>
              </div>

              <!-- 底部操作栏 -->
              <div class="image-action-bar" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 400, duration: 300 } }">
                <div class="action-buttons">
                  <a-button
                      type="text"
                      :class="['like-button', {'action-active': currentImage.liked}]"
                      @click="toggleLike"
                  >
                    <template #icon>
                      <heart-filled v-if="currentImage.liked"/>
                      <heart-outlined v-else/>
                    </template>
                    {{ formatNumber(currentImage.likes || 0) }}
                  </a-button>

                  <a-button
                      type="text"
                      :class="['bookmark-button', {'action-active': currentImage.bookmarked}]"
                      @click="toggleBookmark"
                  >
                    <template #icon>
                      <star-filled v-if="currentImage.bookmarked"/>
                      <star-outlined v-else/>
                    </template>
                    收藏
                  </a-button>

                  <a-dropdown :trigger="['click']">
                    <a-button type="text" class="share-button">
                      <template #icon>
                        <share-alt-outlined/>
                      </template>
                      分享
                    </a-button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="link">
                          <template #icon>
                            <link-outlined/>
                          </template>
                          复制链接
                        </a-menu-item>
                        <a-menu-item key="wechat">
                          <template #icon>
                            <wechat-outlined/>
                          </template>
                          微信
                        </a-menu-item>
                        <a-menu-item key="weibo">
                          <template #icon>
                            <weibo-outlined/>
                          </template>
                          微博
                        </a-menu-item>
                        <a-menu-item key="qq">
                          <template #icon>
                            <qq-outlined/>
                          </template>
                          QQ
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>

                  <!-- 下载按钮 -->
                  <a-button type="primary" class="download-button-new" @click="downloadImage">
                    <template #icon>
                      <download-outlined/>
                    </template>
                    下载
                  </a-button>

                  <!-- 编辑按钮 (仅当用户是图片所有者时显示) -->
                  <a-button v-if="isOwner" class="edit-button-new" @click="editImage">
                    <template #icon>
                      <edit-outlined/>
                    </template>
                    编辑
                  </a-button>
                </div>

                <div class="view-count">
                  <eye-outlined/>
                  {{ formatNumber(currentImage.views || 0) }} 浏览
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧信息区域 -->
        <a-col :xs="24" :lg="8" :xl="7" class="card-col">
          <div class="info-container" v-motion :initial="{ x: 20, opacity: 0 }"
               :enter="{ x: 0, opacity: 1, transition: { delay: 200, duration: 400 } }">
            <div class="info-content-wrapper">
              <!-- 图片标题和描述 -->
              <h1 class="image-title">{{ currentImage.title }}</h1>
              <p class="description">{{
                  currentImage.description || '这是一张关于' + currentImage.title + '的精美艺术照片。'
                }}</p>

              <!-- 作者信息 -->
              <div class="author-info" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 300, duration: 300 } }">
                <a-avatar :src="currentImage.author?.avatar" :size="42"/>
                <div class="author-name">
                  <span>{{ currentImage.author?.name || '未知作者' }}</span>
                  <span class="upload-time">{{ formatDate(currentImage.createTime) }}</span>
                </div>
                <a-button type="primary" shape="round" size="small" class="follow-button">
                  <template #icon>
                    <plus-outlined/>
                  </template>
                  关注
                </a-button>
              </div>

              <!-- 分类与标签 -->
              <div class="category-tags-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 400, duration: 300 } }">
                <div class="section-title">分类与标签</div>
                <div class="category-tag-container">
                  <a-tag class="category-tag">{{ currentImage.category || '未分类' }}</a-tag>

                  <a-tag
                      v-for="(tag, index) in currentImage.tags"
                      :key="index"
                      class="picture-tag"
                  >
                    {{ tag.name }}
                  </a-tag>
                </div>
              </div>

              <!-- 信息与统计卡片容器 -->
              <div class="cards-container" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 500, duration: 300 } }">
                <!-- 图片详细信息卡片 -->
                <div class="info-detail-card">
                  <div class="card-header">
                    <info-circle-outlined class="card-icon"/>
                    图片详细信息
                  </div>
                  <div class="card-body">
                    <div class="info-item">
                      <span class="info-label">格式</span>
                      <span class="info-value">{{ formatInfo.format }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">宽度</span>
                      <span class="info-value">{{ formatInfo.width }}px</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">高度</span>
                      <span class="info-value">{{ formatInfo.height }}px</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">宽高比</span>
                      <span class="info-value">{{ formatInfo.aspectRatio }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">文件大小</span>
                      <span class="info-value">{{ formatInfo.size }}</span>
                    </div>
                  </div>
                </div>

                <!-- 统计数据卡片 - 改为一行四列布局 -->
                <div class="stats-card">
                  <div class="card-header">
                    <chart-outlined class="card-icon"/>
                    统计数据
                  </div>
                  <div class="card-body">
                    <!-- 新的单行四列统计布局 -->
                    <div class="stats-row">
                      <div class="stat-item">
                        <eye-outlined class="stat-icon"/>
                        <div class="stat-value">{{ formatNumber(currentImage.views || 0) }}</div>
                        <div class="stat-label">浏览量</div>
                      </div>
                      <div class="stat-item">
                        <heart-outlined class="stat-icon"/>
                        <div class="stat-value">{{ formatNumber(currentImage.likes || 0) }}</div>
                        <div class="stat-label">点赞数</div>
                      </div>
                      <div class="stat-item">
                        <star-outlined class="stat-icon"/>
                        <div class="stat-value">{{ formatNumber(currentImage.collects || 0) }}</div>
                        <div class="stat-label">收藏数</div>
                      </div>
                      <div class="stat-item">
                        <comment-outlined class="stat-icon"/>
                        <div class="stat-value">{{ formatNumber(currentImage.comments || 0) }}</div>
                        <div class="stat-label">评论数</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <div v-motion :initial="{ opacity: 0, y: 10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 600, duration: 300 } }">
            <ImageStoryBackground :story-data="storyData" />
          </div>
        </a-col>
      </a-row>

      <!-- 评论系统 (宽屏下独立一行) -->
      <a-row>
        <a-col :span="24">
          <div class="comment-section-container" v-motion :initial="{ opacity: 0 }"
               :enter="{ opacity: 1, transition: { delay: 700, duration: 500 } }">
            <CommentSystem :picture-id="imageId" :comments="comments" @reply="handleAddComment"
                           @like="handleLikeComment"/>
          </div>
        </a-col>
      </a-row>

      <!-- 新增：相关推荐 -->
      <a-row>
        <a-col :span="24">
          <div v-motion :initial="{ opacity: 0, y: 10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 300 } }">
            <RelatedPictures
                :current-category="currentImage.category"
                :current-tags="currentImage.tags?.map(tag => tag.name) || []"
            />
          </div>
        </a-col>
      </a-row>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';
import CommentSystem from '@/components/comment/CommentSystem.vue';
import RelatedPictures from "@/components/picture/RelatedPictures.vue";
import ImageStoryBackground from "@/components/picture/ImageStoryBackground.vue";
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  LinkOutlined,
  WechatOutlined,
  WeiboOutlined,
  QqOutlined,
  InfoCircleOutlined,
  CommentOutlined,
} from '@ant-design/icons-vue';

// 获取路由参数
const route = useRoute();
const router = useRouter();
const imageId = ref(route.params.id as string);

// 图片是否加载完成
const imageLoaded = ref(false);

// 返回上一页
const goBack = () => {
  router.back();
};

const storyData = reactive({
  story: "这张照片捕捉了一个独特时刻——日落时分的海浪与阳光交织。拍摄于一个宁静的海岸，当时天气晴朗，阳光穿透薄云，形成了这种梦幻般的金色氛围。\n\n当我站在海边，感受海浪拍打岸边的节奏，阳光开始下沉，整个场景呈现出一种难以置信的宁静与力量并存的状态。海浪的运动与日落的静谧形成了完美的对比，展现了自然的和谐之美。",
  captureDate: "2023年10月15日",
  location: "太平洋沿岸，加利福尼亚",
  quotes: [
    {
      text: "日落不是一天的结束，而是生命之美的开始。",
      author: "约翰·穆尔"
    }
  ],
  knowledgePoints: [
    {
      title: "黄金时刻摄影",
      content: "日出前后和日落前后的一小时被摄影师称为 黄金时刻 ，此时阳光倾斜度大，光线柔和，色温较低，呈现出温暖的金色调，是户外摄影的最佳时机。"
    },
    {
      title: "波浪形成原理",
      content: "海浪主要由风力作用于水面形成。风越强、作用时间越长、作用距离（风区）越大，产生的波浪就越高。波浪传播到浅水区域时，由于受到海底摩擦力的影响，波长变短，波高增加，最终形成破碎的浪花。"
    }
  ],
  creationInspiration: "这张照片旨在捕捉自然界中瞬息万变的光影关系，尤其是水面对光线的反射和折射效果。通过近距离拍摄海浪，同时保留远处的日落，创造出一种空间上的层次感与纵深感。",
  relatedConcepts: [
    { name: "逆光摄影", type: "technique" },
    { name: "海景摄影", type: "subject" },
    { name: "自然光利用", type: "technique" },
    { name: "水面反射", type: "composition" },
    { name: "日落构图", type: "composition" },
    { name: "抽象自然", type: "style" }
  ],
  photographyTips: "拍摄海浪与日落的组合时，建议使用偏振镜以减少水面反光，突出水下细节；同时使用渐变滤镜平衡天空与水面的曝光差异。为了捕捉波浪的动感，可尝试1/250秒或更快的快门速度。",
  verified: true
});

// 模拟相册数据 - 生产环境应从API获取
const galleryImages = reactive([
  {
    id: '1',
    src: 'https://cdn.pixabay.com/photo/2014/04/03/10/32/user-310807_1280.png',
    title: 'macbook-workspace',
    description: '一张关于MacBook的抽象艺术照片',
    author: {
      name: '程序员Leo',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    category: '海报',
    tags: [
      {name: 'Mac壁纸', color: ''},
      {name: '高清', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-09-15T08:30:00.000Z',
    views: 1250,
    likes: 520,
    collects: 89,
    comments: 45,
    width: 1920,
    height: 1280,
    size: '2.50MB',
    format: 'JPG',
    aspectRatio: '3:2',
  },
  {
    id: '2',
    src: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    title: '山脉风光摄影',
    description: '壮丽的山脉风景',
    author: {
      name: '摄影师小王',
      avatar: 'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_1280.png',
    },
    category: '风景',
    tags: [
      {name: '高清', color: ''},
      {name: '自然', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-10-10T14:20:00.000Z',
    views: 3840,
    likes: 1520,
    collects: 245,
    comments: 120,
    width: 1920,
    height: 1080,
    size: '3.25MB',
    format: 'JPG',
    aspectRatio: '16:9',
  },
  {
    id: '3',
    src: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg',
    title: '城市夜景',
    description: '璀璨的城市夜景',
    author: {
      name: '城市摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2014/04/03/10/32/user-310807_1280.png',
    },
    category: '城市',
    tags: [
      {name: '夜景', color: ''},
      {name: '建筑', color: ''},
    ],
    liked: true,
    bookmarked: true,
    createTime: '2023-11-15T20:30:00.000Z',
    views: 4260,
    likes: 2180,
    collects: 560,
    comments: 235,
    width: 2100,
    height: 900,
    size: '4.12MB',
    format: 'JPG',
    aspectRatio: '21:9',
  },
]);

// 当前显示的图片
const currentImageIndex = ref(0);
const currentImage = computed(() => {
  // 查找匹配的图片
  const index = galleryImages.findIndex(img => img.id === imageId.value);
  if (index >= 0) {
    currentImageIndex.value = index;
    return galleryImages[index];
  }
  // 默认返回第一张图片
  return galleryImages[0];
});

// 格式化信息
const formatInfo = computed(() => {
  return {
    format: currentImage.value.format || 'JPG',
    width: currentImage.value.width || 1920,
    height: currentImage.value.height || 1080,
    aspectRatio: currentImage.value.aspectRatio || '16:9',
    size: currentImage.value.size || '2.5MB',
  };
});

// 检查是否有上一张/下一张图片
const hasPrevImage = computed(() => currentImageIndex.value > 0);
const hasNextImage = computed(() => currentImageIndex.value < galleryImages.length - 1);

// 导航到上一张/下一张图片
const navigateToPrev = () => {
  if (hasPrevImage.value) {
    imageLoaded.value = false;
    const prevIndex = currentImageIndex.value - 1;
    imageId.value = galleryImages[prevIndex].id;
    router.push({name: 'PictureDetail', params: {id: imageId.value}});
  }
};

const navigateToNext = () => {
  if (hasNextImage.value) {
    imageLoaded.value = false;
    const nextIndex = currentImageIndex.value + 1;
    imageId.value = galleryImages[nextIndex].id;
    router.push({name: 'PictureDetail', params: {id: imageId.value}});
  }
};

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';

  const date = dayjs(dateString);
  const now = dayjs();
  const diffDays = now.diff(date, 'day');

  if (diffDays < 1) {
    return '今天';
  } else if (diffDays < 2) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}个月前`;
  } else {
    return `${Math.floor(diffDays / 365)}年前`;
  }
};

// 点赞操作
const toggleLike = () => {
  currentImage.value.liked = !currentImage.value.liked;
  if (currentImage.value.liked) {
    currentImage.value.likes = (currentImage.value.likes || 0) + 1;
    message.success('已添加到喜欢');
  } else {
    currentImage.value.likes = Math.max((currentImage.value.likes || 0) - 1, 0);
    message.success('已取消喜欢');
  }
};

// 收藏操作
const toggleBookmark = () => {
  currentImage.value.bookmarked = !currentImage.value.bookmarked;
  if (currentImage.value.bookmarked) {
    currentImage.value.collects = (currentImage.value.collects || 0) + 1;
    message.success('已收藏');
  } else {
    currentImage.value.collects = Math.max((currentImage.value.collects || 0) - 1, 0);
    message.success('已取消收藏');
  }
};

// 下载图片
const downloadImage = () => {
  message.success('图片下载中...');
  const a = document.createElement('a');
  a.href = currentImage.value.src;
  a.download = currentImage.value.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 增加下载统计
  setTimeout(() => {
    message.success('下载成功!');
  }, 1000);
};

// 是否是图片所有者（用于控制编辑按钮显示）
const isOwner = computed(() => {
  // 在实际应用中，应该比较当前登录用户ID和图片作者ID
  return true; // 假设当前用户是所有者
});

// 编辑图片信息
const editImage = () => {
  router.push({ name: 'EditPicture', params: { id: imageId.value } });
};

// 模拟评论数据
const comments = reactive([
  {
    id: 'comment-1',
    content: '这张图片的构图非常精美，光影效果处理得很到位！',
    createTime: '2023-12-01T08:30:00.000Z',
    likes: 15,
    liked: false,
    author: {
      id: 'user-1',
      name: '摄影爱好者',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    replies: [
      {
        id: 'reply-1',
        content: '完全同意，特别是光线的处理非常自然',
        createTime: '2023-12-01T09:15:00.000Z',
        likes: 5,
        liked: false,
        author: {
          id: 'user-2',
          name: '设计师小明',
          avatar: 'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_1280.png',
        },
      }
    ]
  },
  {
    id: 'comment-2',
    content: '请问这张图片是用什么相机拍摄的呢？效果真棒！',
    createTime: '2023-12-02T14:20:00.000Z',
    likes: 8,
    liked: false,
    author: {
      id: 'user-3',
      name: '科技迷',
      avatar: 'https://cdn.pixabay.com/photo/2014/04/03/10/32/user-310807_1280.png',
    },
    replies: []
  }
]);

// 处理添加评论
const handleAddComment = (commentData, content) => {
  console.log('添加评论:', commentData, content);
  // 实际应用中应调用API添加评论

  if (commentData.replyTo) {
    // 添加回复
    const parentComment = comments.find(c => c.id === (commentData.replyTo.parentId || commentData.replyTo.commentId));
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }

      parentComment.replies.push({
        id: 'reply-' + Date.now(),
        content: content,
        createTime: new Date().toISOString(),
        likes: 0,
        liked: false,
        author: {
          id: 'current-user',
          name: '当前用户',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
        },
      });
    }
  } else {
    // 添加新评论
    comments.unshift({
      id: 'comment-' + Date.now(),
      content: content,
      createTime: new Date().toISOString(),
      likes: 0,
      liked: false,
      author: {
        id: 'current-user',
        name: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
      },
      replies: []
    });

    // 更新评论计数
    currentImage.value.comments = (currentImage.value.comments || 0) + 1;
  }
};

// 处理评论点赞
const handleLikeComment = (commentId, liked) => {
  console.log('点赞评论:', commentId, liked);
  // 实际应用中应调用API处理点赞

  // 查找并更新评论
  const updateComment = (commentList) => {
    for (const comment of commentList) {
      if (comment.id === commentId) {
        comment.liked = liked;
        comment.likes = liked ? comment.likes + 1 : Math.max(comment.likes - 1, 0);
        return true;
      }

      if (comment.replies && comment.replies.length > 0) {
        if (updateComment(comment.replies)) {
          return true;
        }
      }
    }
    return false;
  };

  updateComment(comments);
};

// 监听路由变化，更新图片
watch(() => route.params.id, (newId) => {
  if (newId) {
    imageId.value = newId as string;
    imageLoaded.value = false;
  }
});

// 组件挂载时增加浏览量
onMounted(() => {
  // 增加浏览量
  if (currentImage.value) {
    currentImage.value.views = (currentImage.value.views || 0) + 1;
  }
});
</script>

<style scoped>
/* 整体页面布局 */
.detail-page {
  padding: 24px 8px 40px; /* 减少左右边距 */
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 返回按钮 */
.back-button-container {
  margin-bottom: 16px;
  padding-left: 4px;
}

.back-button {
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.back-button:hover {
  transform: translateX(-4px);
  color: var(--primary-color, #6366f1);
}

/* 主容器样式 */
.detail-container {
  max-width: 1800px; /* 增加最大宽度 */
  width: 98%; /* 使用百分比宽度以减少边距 */
  margin: 0 auto;
}

/* 确保列的宽度比例保持不变 */
:deep(.ant-col-xl-17) {
  width: 70.83333333%;
}

:deep(.ant-col-xl-7) {
  width: 29.16666667%;
}

.card-col {
  display: flex;
}

/* 左侧图片区域 */
.image-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  /* 使用flex布局，高度仍保持700px */
  height: 700px;
  width: 100%;
}

.picture-viewer {
  position: relative;
  width: 100%;
  height: 100%; /* 占满容器 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 主图片样式 */
.main-image-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  flex: 1; /* 这是关键，让图片区域自动填充剩余空间 */
  overflow: hidden;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.image-loaded {
  opacity: 1;
}

.image-skeleton {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
}

/* 导航按钮 */
.navigation-buttons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.nav-button {
  width: 40px;
  height: 40px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  pointer-events: auto;
  transition: all 0.3s;
}

.nav-button:hover {
  transform: scale(1.1);
  opacity: 1;
}

.prev-button {
  margin-left: 8px;
}

.next-button {
  margin-right: 8px;
}

/* 图片操作栏 */
.image-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px; /* 略微减小内边距 */
  border-top: 1px solid #f0f0f0;
  background-color: white;
  flex-shrink: 0; /* 防止被压缩 */
  height: 60px; /* 固定高度 */
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
}

.like-button,
.bookmark-button,
.share-button {
  display: flex;
  align-items: center;
  padding: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

/* 新增下载按钮样式 */
.download-button-new,
.edit-button-new {
  height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.3s;
  padding: 0 12px;
}

.download-button-new {
  background: var(--primary-color, #6366f1);
  border: none;
  margin-left: 8px;
}

.download-button-new:hover {
  background: #5254ca;
  transform: translateY(-1px);
}

.edit-button-new {
  background: #f0f2ff;
  color: #6366f1;
  border: 1px solid #e6e8ff;
  margin-left: 8px;
}

.edit-button-new:hover {
  background: #e6e9ff;
  color: #5254ca;
}

.action-active {
  color: #ff4d4f;
}

.action-active.bookmark-button {
  color: #faad14;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .image-container {
    height: auto; /* 小屏幕下高度自适应 */
    min-height: 500px; /* 设置最小高度 */
  }

  .main-image-wrapper {
    height: 400px; /* 小屏幕下给定固定高度 */
    flex: 0 0 auto; /* 不再自动填充 */
  }
}

@media (min-width: 1440px) {
  .main-image-wrapper {
    /* 大屏下图片可以更大一些 */
    min-height: 500px;
  }
}

/* 超宽屏幕优化 */
@media (min-width: 1800px) {
  .image-container {
    height: 750px; /* 超宽屏幕下统一增加高度 */
  }

  .main-image-wrapper {
    min-height: 650px; /* 增加主图区域的最小高度，让图片显示更大 */
  }
}

.view-count {
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 评论区域容器 */
.comment-section-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

/* 右侧信息区域 - 重新设计 */
.info-container {
  box-sizing: border-box;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  /* 大屏幕时保持固定高度 */
  height: 700px;
  overflow-y: auto;
}

/* 内容包装器用于控制内部布局 */
.info-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 图片标题与描述 */
.image-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
  line-height: 1.3;
}

.description {
  color: #595959;
  line-height: 1.6;
  margin-bottom: 20px;
  max-height: 70px;
  overflow: hidden;
  position: relative;
}

.description:after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: 20px;
  background: linear-gradient(transparent, white);
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.author-name {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.follow-button {
  background: var(--primary-color, #6366f1);
  border: none;
}

/* 分类与标签 */
.category-tags-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.category-tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background-color: #6366f1;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  border: none;
}

.picture-tag {
  background-color: #f0f2ff;
  color: #6366f1;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  border: 1px solid #e6e8ff;
}

/* 卡片容器 - 新的布局结构 */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片通用样式 */
.info-detail-card,
.stats-card {
  width: 100%;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  align-items: center;
  background-color: rgba(99, 102, 241, 0.8);
  color: white;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 500;
}

.card-icon {
  margin-right: 8px;
  font-size: 16px;
}

.card-body {
  padding: 0;
}

/* 图片详细信息样式 */
.info-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background-color: rgba(249, 249, 251, 0.8);
}

.info-label {
  color: #8c8c8c;
  font-size: 14px;
  flex: 0 0 70px;
  padding-right: 10px;
  position: relative;
}

.info-label::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  height: 12px;
  width: 1px;
  background-color: #eaeaea;
  transform: translateY(-50%);
}

.info-value {
  color: #262626;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  text-align: right;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

/* 统计数据样式 - 一行四列布局 */
.stats-row {
  display: flex;
  width: 100%;
  border-top: none;
  min-height: 80px;
}

.stat-item {
  flex: 1;
  padding: 12px 4px; /* 较小的水平内边距，确保在窄屏上内容不会换行 */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中 */
  border-right: 1px solid #f5f5f5;
  min-height: 80px;
}

.stat-item:last-child {
  border-right: none;
}

.stat-icon {
  font-size: 16px;
  color: #6366f1;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 2px;
  white-space: nowrap; /* 防止数值换行 */
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .image-container, .info-container {
    height: 700px; /* 保持一致高度 */
  }

  .image-title {
    font-size: 20px;
  }

  .info-label {
    flex: 0 0 65px;
    font-size: 13px;
  }

  /* 优化统计卡片在中等屏幕上的显示 */
  .stat-item {
    padding: 12px 2px;
  }

  .stat-icon {
    font-size: 15px;
  }

  .stat-value {
    font-size: 15px;
  }
}

/* 平板和小屏幕 */
@media (max-width: 1992px) {
  .info-container {
    height: auto;
    overflow-y: visible;
    min-height: unset; /* 清除最小高度限制 */
  }

  .stat-item {
    padding: 10px 6px;
    min-height: 70px;
  }

  .stat-icon {
    font-size: 15px;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 15px;
  }

  .stat-label {
    font-size: 11px;
  }
}

@media (max-width: 375px) {
  .info-container {
    padding: 14px;
  }

  .image-title {
    font-size: 18px;
  }

  .info-item {
    padding: 8px 12px;
  }

  .info-label {
    flex: 0 0 60px;
    font-size: 12px;
  }

  .stat-item {
    padding: 8px 2px; /* 减小内边距确保内容不换行 */
    min-height: 65px;
  }

  .stat-icon {
    font-size: 14px;
    margin-bottom: 3px;
  }

  .stat-value {
    font-size: 13px; /* 减小字体大小 */
  }

  .stat-label {
    font-size: 9px; /* 减小标签字体大小 */
  }
}

/* 大屏幕优化 */
@media (min-width: 1440px) {
  .detail-container {
    width: 95%; /* 大屏下使用95%宽度 */
  }

  .image-container, .info-container {
    height: 700px; /* 保持相同高度 */
  }

  .main-image-wrapper {
    height: 500px;
    min-height: 500px;
  }
}

/* 超宽屏幕优化 */
@media (min-width: 1800px) {
  .detail-container {
    width: 90%;
    max-width: 2000px;
  }

  .image-container, .info-container {
    height: 750px; /* 超宽屏幕下统一增加高度 */
  }

  .main-image-wrapper {
    height: 550px;
    min-height: 550px;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .detail-page {
    background-color: #121212;
  }

  .image-container,
  .info-container,
  .comment-section-container,
  .info-detail-card,
  .stats-card {
    background-color: #1f1f1f;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .info-detail-card,
  .stats-card {
    border-color: #333;
  }

  .image-title {
    color: #f0f0f0;
  }

  .description {
    color: #b3b3b3;
  }

  .description:after {
    background: linear-gradient(transparent, #1f1f1f);
  }

  .section-title {
    color: #e0e0e0;
  }

  .picture-tag {
    background-color: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
  }

  .main-image-wrapper {
    background-color: #2a2a2a;
  }

  .author-info,
  .category-tags-section {
    border-bottom-color: #333;
  }

  .info-item {
    border-bottom-color: #333;
  }

  .info-item:hover {
    background-color: #262626;
  }

  .info-label::after {
    background-color: #444;
  }

  .info-label {
    color: #a6a6a6;
  }

  .info-value {
    color: #f0f0f0;
  }

  .image-action-bar {
    border-top-color: #333;
    background-color: #1f1f1f;
  }

  .view-count {
    color: #a6a6a6;
  }

  .nav-button {
    background-color: #2a2a2a;
    color: #f0f0f0;
  }

  .stats-row {
    background-color: #1f1f1f;
  }

  .stat-item {
    background-color: #1f1f1f;
    border-right-color: #333;
  }

  .stat-icon {
    color: #a5a8ff;
  }

  .stat-value {
    color: #f0f0f0;
  }

  .stat-label {
    color: #a6a6a6;
  }
}

/* 顶部卡片样式 */
.header-card {
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 14px 16px;
  border: 1px solid #f0f0f0;
  max-width: 1800px;
  width: 98%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧区域样式 */
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; /* 确保子元素可以缩小 */
}

.back-button {
  flex-shrink: 0;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(to right, #f0f2ff, #f5f7ff);
  border: 1px solid #e6e8ff;
  color: #6366f1;
  padding: 0 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.back-button:hover {
  background: linear-gradient(to right, #e6e9ff, #edf0ff);
  transform: translateX(-2px);
}

.title-divider {
  height: 24px;
  width: 1px;
  background: #f0f0f0;
  margin: 0 14px;
  flex-shrink: 0;
}

.title-section {
  display: flex;
  flex-direction: column;
  min-width: 0; /* 确保可以缩小 */
  flex: 1;
}

.image-heading {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-category {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧区域样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-tag {
  background: #f5f7fa;
  border: none;
  border-radius: 6px;
  color: #5c6b8a;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-button {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-button:hover {
  background: rgba(99, 102, 241, 0.12);
  transform: scale(1.05);
}

/* 大屏幕优化 */
@media (min-width: 1440px) {
  .header-card {
    width: 95%;
  }
}

/* 超宽屏幕优化 */
@media (min-width: 1800px) {
  .header-card {
    width: 90%;
    max-width: 2000px;
  }
}

/* 移动端屏幕优化 */
@media (max-width: 768px) {
  .header-card {
    width: 100%;
    padding: 12px;
  }

  .detail-page {
    padding: 16px 4px 32px;
  }

  .image-action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .view-count {
    margin-left: 8px;
  }

  .detail-container {
    width: 100%;
  }

  .main-image-wrapper {
    height: 350px;
    min-height: 350px;
  }
}

/* 响应式调整 */
@media (max-width: 576px) {
  .header-card {
    padding: 12px;
  }

  .title-section {
    max-width: 150px;
  }

  .image-category {
    display: none;
  }

  .title-divider {
    margin: 0 10px;
  }
}

/* 暗黑模式适配 - 顶部卡片 */
@media (prefers-color-scheme: dark) {
  .header-card {
    background: #1f1f1f;
    border-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .back-button {
    background: linear-gradient(to right, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08));
    border-color: rgba(99, 102, 241, 0.3);
    color: #a5a8ff;
  }

  .back-button:hover {
    background: linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.12));
  }

  .title-divider {
    background: #333;
  }

  .image-heading {
    color: #e0e0e0;
  }

  .image-category {
    color: #a6a6a6;
  }

  .view-tag {
    background: #2a2a2a;
    color: #a6a6a6;
  }

  .action-button {
    background: rgba(99, 102, 241, 0.15);
    color: #a5a8ff;
  }

  .action-button:hover {
    background: rgba(99, 102, 241, 0.25);
  }
}
</style>