<!-- pages/picture/PictureDetail.vue -->
<template>
  <div class="detail-page">
    <!-- 顶部导航区域 -->
    <div class="header-navigation" :class="{ 'with-blur': isScrolled }">
      <div class="nav-container">
        <!-- 左侧导航区域 -->
        <div class="nav-left">
          <a-button @click="goBack" class="back-link">
            <template #icon>
              <arrow-left-outlined />
            </template>
            <span class="back-text">返回</span>
          </a-button>

          <div class="nav-divider"></div>

          <div class="breadcrumb">
            <span  class="category-link">{{ currentImage.category || 'Java' }}</span>
            <span class="separator">/</span>
            <span class="current-title">{{ currentImage.name || 'Java从入门到精通' }}</span>
          </div>
        </div>

        <!-- 右侧功能区域 -->
        <div class="nav-right">

          <!-- 浏览数据 -->
          <div class="view-info">
            <eye-outlined />
            <span>{{ formatNumber(currentImage.viewCount || 16) }}</span>
          </div>

          <!-- 作者信息 -->
            <div class="author-preview">
              <img :src="currentImage.user?.avatar || 'https://joeschmoe.io/api/v1/random'" class="avatar" />
              <span class="name">{{ currentImage.user?.username || '程序员Leo' }}</span>
            </div>

          <!-- 分享按钮 -->
          <a-dropdown :trigger="['click']">
            <div class="share-button">
              <share-alt-outlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="copy" @click="copyLink">
                  <template #icon><link-outlined /></template>
                  复制链接
                </a-menu-item>
                <a-menu-item key="wechat" @click="shareToWechat">
                  <template #icon><wechat-outlined /></template>
                  微信分享
                </a-menu-item>
                <a-menu-item key="weibo" @click="shareToWeibo">
                  <template #icon><weibo-outlined /></template>
                  微博分享
                </a-menu-item>
                <a-menu-item key="qrcode" @click="showQrcode">
                  <template #icon><qrcode-outlined /></template>
                  二维码
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 收藏按钮 -->
          <div class="collect-button" :class="{ 'active': isCollected }" @click="toggleCollect">
            <star-filled v-if="isCollected" />
            <star-outlined v-else />
          </div>

          <!-- 更多操作 -->
          <a-dropdown :trigger="['click']">
            <div class="more-button">
              <ellipsis-outlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="download" @click="downloadImage">
                  <template #icon><download-outlined /></template>
                  下载图片
                </a-menu-item>
                <a-menu-item key="report" @click="reportContent">
                  <template #icon><flag-outlined /></template>
                  举报内容
                </a-menu-item>
                <a-menu-item key="fullscreen" @click="toggleFullscreen">
                  <template #icon><fullscreen-outlined /></template>
                  全屏模式
                </a-menu-item>
                <a-menu-item key="theme" @click="toggleTheme">
                  <template #icon><bulb-outlined /></template>
                  {{ isDarkMode ? '亮色模式' : '暗色模式' }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>

    <div class="detail-container" v-motion :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { duration: 500 } }">
      <a-row :gutter="[16, 0]">
        <!-- 左侧图片区域 -->
        <a-col :xs="24" :lg="16" :xl="17" class="card-col">
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
                    :src="currentImage.url"
                    :alt="currentImage.name"
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
                    <a-button type="link" class="share-button">
                      <template #icon>
                        <share-alt-outlined/>
                      </template>
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
                  {{ formatNumber(currentImage.viewCount || 0) }} 浏览
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧信息区域 - 重新设计 -->
        <a-col :xs="24" :lg="8" :xl="7" class="card-col">
          <div class="info-container" v-motion :initial="{ x: 20, opacity: 0 }"
               :enter="{ x: 0, opacity: 1, transition: { delay: 200, duration: 400 } }">

            <!-- 顶部区域：标题和作者信息 -->
            <div class="info-content-wrapper">
              <div class="info-header">
                <h1 class="image-title">{{ currentImage.name }}</h1>
                <p class="description">{{ currentImage.description || '这是一张关于' + currentImage.name + '的图片。' }}</p>

                <!-- 作者信息 -->
                <div class="author-info" v-motion :initial="{ y: 10, opacity: 0 }"
                     :enter="{ y: 0, opacity: 1, transition: { delay: 300, duration: 300 } }">
                  <img v-if="currentImage.user" :src="currentImage.user.avatar"  class="author-avatar" />
                  <div class="author-details">
                    <span v-if="currentImage.user"  class="author-name">{{ currentImage.user.username || '未知作者' }}</span>
                    <span class="upload-time">{{ formatDate(currentImage.createTime) }}</span>
                  </div>
                  <a-button type="primary" class="follow-button" size="middle">
                    <template #icon><plus-outlined class="follow-icon" /></template>
                    关注
                  </a-button>
                </div>
              </div>

              <!-- 中部可滚动区域 -->
              <div class="info-body">
                <!-- 分类与标签部分 -->
                <div class="info-section" v-motion :initial="{ y: 10, opacity: 0 }"
                     :enter="{ y: 0, opacity: 1, transition: { delay: 400, duration: 300 } }">
                  <h3 class="section-title">
                    <tag-outlined class="section-icon" /> 分类与标签
                  </h3>

                  <div class="tags-container">
                    <span class="category-tag">{{ currentImage.category || '未分类' }}</span>

                    <span
                        v-for="(tag, index) in currentImage.tags"
                        :key="index"
                        class="tag"
                    >
                    {{ typeof tag === 'string' ? tag : tag.name }}
                  </span>
                  </div>
                </div>

                <!-- 图片详细信息 -->
                <div class="info-section" v-motion :initial="{ y: 10, opacity: 0 }"
                     :enter="{ y: 0, opacity: 1, transition: { delay: 500, duration: 300 } }">
                  <h3 class="section-title">
                    <info-circle-outlined class="section-icon" /> 图片详细信息
                  </h3>

                  <div class="image-details">
                    <div class="detail-item">
                      <span class="detail-label">格式</span>
                      <span class="detail-value">{{ currentImage.format || 'PNG' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">宽度</span>
                      <span class="detail-value">{{ currentImage.picWidth || '1920' }}px</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">高度</span>
                      <span class="detail-value">{{ currentImage.picHeight || '1080' }}px</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">宽高比</span>
                      <span class="detail-value">{{ currentImage.picScale || '1.78' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">文件大小</span>
                      <span class="detail-value">{{ currentImage.size || '33302 B' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">上传时间</span>
                      <span class="detail-value">{{ formatDate(currentImage.createTime, 'full') || '2025年04月12日 16:41' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 统计数据区域 -->
                <div class="info-section" v-motion :initial="{ y: 10, opacity: 0 }"
                     :enter="{ y: 0, opacity: 1, transition: { delay: 600, duration: 300 } }">
                  <h3 class="section-title">
                    <bar-chart-outlined class="section-icon" /> 统计数据
                  </h3>

                  <div class="stats-grid">
                    <div class="stat-item">
                      <eye-outlined class="stat-icon" />
                      <div class="stat-value">{{ formatNumber(currentImage.viewCount || 16) }}</div>
                      <div class="stat-label">浏览量</div>
                    </div>
                    <div class="stat-item">
                      <heart-outlined class="stat-icon" />
                      <div class="stat-value">{{ formatNumber(currentImage.likeCount || 0) }}</div>
                      <div class="stat-label">点赞数</div>
                    </div>
                    <div class="stat-item">
                      <star-outlined class="stat-icon" />
                      <div class="stat-value">{{ formatNumber(currentImage.collectionCount || 0) }}</div>
                      <div class="stat-label">收藏数</div>
                    </div>
                    <div class="stat-item">
                      <comment-outlined class="stat-icon" />
                      <div class="stat-value">{{ formatNumber(currentImage.commentCount || 0) }}</div>
                      <div class="stat-label">评论数</div>
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

      <!-- 相关推荐 -->
      <a-row>
        <a-col :span="24">
          <div v-motion :initial="{ opacity: 0, y: 10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 300 } }">
            <RelatedPictures
                :current-category="currentImage.category"
                :current-tags="currentImage.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || []"
            />
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
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
  TagOutlined,
  BarChartOutlined,
  EllipsisOutlined,
  FlagOutlined,
  FullscreenOutlined,
  BulbOutlined,
  QrcodeOutlined
} from '@ant-design/icons-vue';
import { getNextPictureUsingGet, getPictureByIdUsingGet, getPreviousPictureUsingGet } from "@/api/tupianxiangguanjiekou";

// 获取路由参数
const route = useRoute();
const router = useRouter();
const imageId = ref(route.params.id as string);

// 各种状态变量
const imageLoaded = ref(false);
const loading = ref(false);
const currentImage = ref<any>({});
const hasPrevImage = ref(false);
const hasNextImage = ref(true);
const isScrolled = ref(false);
const isCollected = ref(false);
const isDarkMode = ref(false);
const isAudioPlaying = ref(false);

// 返回上一页
const goBack = () => {
  router.back();
};

// 故事数据
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



// 格式化数字
const formatNumber = (num: any) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 格式化日期
const formatDate = (dateString, type = 'relative') => {
  if (!dateString) return '未知时间';

  const date = dayjs(dateString);
  const now = dayjs();

  // 返回相对时间（如：3天前）
  if (type === 'relative') {
    const diffDays = now.diff(date, 'day');

    if (diffDays < 1) {
      const diffHours = now.diff(date, 'hour');
      if (diffHours < 1) {
        const diffMinutes = now.diff(date, 'minute');
        return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
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
  }
  // 返回完整日期时间格式
  else if (type === 'full') {
    return date.format('YYYY年MM月DD日 HH:mm');
  }
};

// 检查是否有上一张图片
const checkHasPrevImage = async () => {
  try {
    const response = await getPreviousPictureUsingGet({ id: imageId.value });
    hasPrevImage.value = !!(response && response.data && (response.data.data || response.data.id));
  } catch (error) {
    console.error('检查上一张图片错误:', error);
    hasPrevImage.value = false;
  }
};

// 检查是否有下一张图片
const checkHasNextImage = async () => {
  try {
    const response = await getNextPictureUsingGet({ id: imageId.value });
    hasNextImage.value = !!(response && response.data && (response.data.data || response.data.id));
  } catch (error) {
    console.error('检查下一张图片错误:', error);
    hasNextImage.value = false;
  }
};

// 导航到上一张图片
const navigateToPrev = async () => {
  if (!hasPrevImage.value) return;

  try {
    loading.value = true;
    const response = await getPreviousPictureUsingGet({ id: imageId.value });

    if (response && response.data) {
      // 修正：API返回的数据可能有额外的嵌套结构
      const newImage = response.data.data || response.data;

      // 更新URL - 移除replace: true以保留正常导航历史
      router.push({
        name: 'PictureDetail',
        params: { id: newImage.id }
      });

      // 更新当前图片数据并重置状态
      currentImage.value = newImage;
      imageId.value = newImage.id;
      imageLoaded.value = false; // 重置图片加载状态

      // 重新检查导航状态
      checkHasPrevImage();
      checkHasNextImage();
    }
  } catch (error) {
    console.error('获取上一张图片错误:', error);
    message.error('获取上一张图片失败');
  } finally {
    loading.value = false;
  }
};

// 导航到下一张图片
const navigateToNext = async () => {
  if (!hasNextImage.value) return;

  try {
    loading.value = true;
    const response = await getNextPictureUsingGet({ id: imageId.value });

    if (response && response.data) {
      // 修正：API返回的数据可能有额外的嵌套结构
      const newImage = response.data.data || response.data;

      // 更新URL - 移除replace: true以保留正常导航历史
      router.push({
        name: 'PictureDetail',
        params: { id: newImage.id }
      });

      // 更新当前图片数据并重置状态
      currentImage.value = newImage;
      imageId.value = newImage.id;
      imageLoaded.value = false; // 重置图片加载状态

      // 重新检查导航状态
      checkHasPrevImage();
      checkHasNextImage();
    }
  } catch (error) {
    console.error('获取下一张图片错误:', error);
    message.error('获取下一张图片失败');
  } finally {
    loading.value = false;
  }
};

// 获取图片详情数据
const fetchPictureDetail = async (id: string) => {
  try {
    loading.value = true;
    imageLoaded.value = false;

    const response = await getPictureByIdUsingGet({ id });

    if (response && response.data) {
      currentImage.value = response.data.data;
      console.log(JSON.stringify(currentImage.value));

      // 检查是否有上一张/下一张图片
      checkHasPrevImage();
      checkHasNextImage();
    } else {
      message.error('获取图片详情失败');
    }
  } catch (error) {
    console.error('获取图片详情错误:', error);
    message.error('获取图片详情出错');
  } finally {
    loading.value = false;
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

// 收藏/取消收藏
const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  message.success(isCollected.value ? '已收藏' : '已取消收藏');
};

// 关注作者
const followAuthor = () => {
  message.success('已关注作者');
};

// 复制链接
const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制');
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
};

// 分享到微信
const shareToWechat = () => {
  message.success('已打开微信分享');
  // 实际应用中这里会调用微信SDK
};

// 分享到微博
const shareToWeibo = () => {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(`我在学习 ${currentImage.value.name || 'Java从入门到精通'}`);
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`);
};

// 显示二维码
const showQrcode = () => {
  message.info('二维码功能开发中');
  // 实际应用中会显示页面二维码
};

// 举报内容
const reportContent = () => {
  message.info('举报功能开发中');
  // 实际应用中会打开举报表单
};

// 全屏模式
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      message.error(`全屏请求失败: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-theme', isDarkMode.value);
  message.success(`已切换到${isDarkMode.value ? '暗色' : '亮色'}模式`);
};

// 切换音频讲解
const toggleAudio = () => {
  isAudioPlaying.value = !isAudioPlaying.value;
  message.success(isAudioPlaying.value ? '音频讲解已开启' : '音频讲解已关闭');
  // 实际应用中会调用音频播放API
};



// 下载图片
const downloadImage = () => {
  if (!currentImage.value.url) {
    message.error('图片链接不存在');
    return;
  }

  message.success('开始下载图片...');
  const a = document.createElement('a');
  a.href = currentImage.value.url || currentImage.value.src;
  a.download = currentImage.value.name || currentImage.value.title || 'download-image';
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
  // 实际应用中，应该比较当前登录用户ID和图片作者ID
  // 如果后端返回了isOwner字段，直接使用
  if (currentImage.value.hasOwnProperty('isOwner')) {
    return currentImage.value.isOwner;
  }
  return false;
});

// 编辑图片信息
const editImage = () => {
  router.push({ name: 'EditPicture', params: { id: imageId.value } });
};

// 监听滚动事件以添加毛玻璃效果
const handleScroll = () => {
  isScrolled.value = window.scrollY > 60;
};

// 检测系统暗色模式
const checkDarkMode = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.body.classList.add('dark-theme');
  }
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

// 生命周期钩子
onMounted(() => {
  // 获取图片详情
  fetchPictureDetail(imageId.value);

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
  checkDarkMode();

  // 监听系统暗色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    isDarkMode.value = e.matches;
    document.body.classList.toggle('dark-theme', e.matches);
  });
});

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
});

// 监听路由变化，更新图片
watch(() => route.params.id, (newId) => {
  if (newId) {
    imageId.value = newId as string;
    imageLoaded.value = false;
    fetchPictureDetail(newId as string);
  }
});
</script>

<style scoped>
/* 整体页面布局 */
.detail-page {
  padding: 24px 0 40px; /* 移除左右内边距，使用容器控制 */
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中所有子元素 */
}

/* 主容器样式 */
.detail-container {
  max-width: 1800px; /* 增加最大宽度 */
  width: 99.5%; /* 使用百分比宽度以减少边距 */
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

/* 顶部导航区域样式 */
.header-navigation {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(0);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  margin-bottom: 24px;

  /* 以下是关键修改 */
  width: 99.5%; /* 与detail-container保持一致 */
  max-width: 1800px; /* 与detail-container保持一致 */
  margin-left: auto;
  margin-right: auto;
  /* 移除display: flex和justify-content: center */
}

.with-blur {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1800px;
  width: 99.5%; /* 使用与detail-container相同的宽度 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 16px;
}

/* 左侧导航区域 */
.nav-left {
  display: flex;
  align-items: center;
}

.back-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #595959;
  border-radius: 6px;
  background: #f9f9f9;
  border: 1px solid #f0f0f0;
  padding: 0 10px;
  height: 34px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: #f0f2ff;
  color: #6366f1;
  border-color: #e6e8ff;
  transform: translateX(-2px);
}

.back-text {
  margin-left: 6px;
}

.nav-divider {
  width: 1px;
  height: 22px;
  background: #f0f0f0;
  margin: 0 12px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.category-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.category-link:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: #d9d9d9;
}

.current-title {
  color: #262626;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* 右侧功能区域 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-toggle,
.audio-button,
.share-button,
.collect-button,
.more-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #595959;
  transition: all 0.3s;
  background: #f5f5f5;
}

.mode-toggle:hover,
.audio-button:hover,
.share-button:hover,
.more-button:hover {
  background: #f0f2ff;
  color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.collect-button {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.collect-button:hover,
.collect-button.active {
  background: #fff7e6;
  color: #faad14;
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.15);
}

.collect-button.active {
  color: #faad14;
  background: #fff7e6;
}

.view-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8c8c8c;
  padding: 4px 10px;
  border-radius: 16px;
  background: #f5f5f5;
  transition: all 0.3s;
}

.view-info:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.author-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  background: linear-gradient(to right, #f0f2ff, #e6e8ff);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e6e8ff;
}

.author-preview:hover {
  background: linear-gradient(to right, #e6e8ff, #d9dfff);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e6e8ff;
}

.name {
  font-size: 13px;
  font-weight: 500;
  color: #6366f1;
}

/* 弹出的作者卡片 */
.author-card {
  width: 280px;
  padding: 16px;
}

.author-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.author-large-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e6e8ff;
}

.author-info {
  margin-left: 12px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.author-title {
  font-size: 13px;
  color: #8c8c8c;
}

.author-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 8px;
  border: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-weight: 600;
  color: #262626;
  font-size: 15px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.follow-btn {
  width: 100%;
  height: 36px;
  border-radius: 18px;
  background: #6366f1;
  border: none;
}

.follow-btn:hover {
  background: #4f46e5;
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

/* 右侧图片信息卡片 - 重新设计 */
.info-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 700px; /* 保持与左侧图片卡片相同高度 */
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

/* 卡片布局结构 */
.info-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

/* 顶部区域：标题、作者、关注 */
.info-header {
  padding: 24px;
  border-bottom: 1px solid #f5f7fa;
}

.image-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  position: relative;
  font-size: 14px;
}

/* 作者信息样式优化 */
.author-info {
  display: flex;
  align-items: center;
  position: relative;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f2ff;
}

.author-details {
  margin-left: 12px;
  flex: 1;
}

.author-name {
  font-weight: 500;
  color: #1f1f1f;
  font-size: 15px;
  display: block;
  margin-bottom: 2px;
}

.upload-time {
  font-size: 13px;
  color: #94a3b8;
}

.follow-button {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 20px;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.follow-button:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.follow-icon {
  margin-right: 4px;
  font-size: 16px;
}

/* 图片信息中部 - 修改为不滚动 */
.info-body {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* 移除滚动条 */
.no-scroll {
  overflow: hidden;
}

/* 模块化布局 */
.info-section {
  padding: 16px 24px; /* 减小内边距 */
  border-bottom: 1px solid #f5f7fa;
}

.info-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 14px; /* 减小下边距 */
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 8px;
  color: #6366f1;
  font-size: 16px;
}

/* 分类与标签 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  transition: all 0.2s;
}

.tag {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  transition: all 0.2s;
}

.tag:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* 图片详细信息 */
.image-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px; /* 减小行间距 */
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
}

/* 统计数据 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background-color: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 8px;
}

.stats-grid .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  position: relative;
  transition: background-color 0.2s;
}

.stats-grid .stat-item:hover {
  background-color: #f1f5f9;
}

.stats-grid .stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background-color: #e2e8f0;
}

.stat-icon {
  color: #6366f1;
  font-size: 16px;
  margin-bottom: 6px; /* 减小间距 */
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .back-text,
  .separator,
  .current-title {
    display: none;
  }

  .nav-divider {
    margin: 0 8px;
  }

  .name {
    display: none;
  }

  .author-preview {
    padding: 4px;
    background: #f5f5f5;
  }

  .nav-right {
    gap: 8px;
  }

  .mode-toggle {
    display: none;
  }

  .image-action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .view-count {
    margin-left: 8px;
  }
}

@media (max-width: 576px) {
  .audio-button,
  .view-info {
    display: none;
  }

  .nav-container {
    padding: 0 12px;
  }

  .title-section {
    max-width: 150px;
  }

  .image-category {
    display: none;
  }

  .main-image-wrapper {
    height: 350px;
    min-height: 350px;
  }
}

@media (max-width: 992px) {
  .image-container {
    height: auto; /* 小屏幕下高度自适应 */
    min-height: 500px; /* 设置最小高度 */
  }

  .main-image-wrapper {
    height: 400px; /* 小屏幕下给定固定高度 */
    flex: 0 0 auto; /* 不再自动填充 */
  }

  .info-container {
    height: auto;
    min-height: 400px;
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

@media (min-width: 1440px) {
  .nav-container {
    width: 95%; /* 大屏下使用与detail-container相同的宽度 */
  }
  .header-navigation,
  .detail-container {
    width: 95%; /* 大屏下使用相同宽度确保对齐 */
  }

  .image-container, .info-container {
    height: 700px; /* 保持相同高度 */
  }

  .main-image-wrapper {
    min-height: 500px;
  }
}

/* 学习模式样式 */
:global(.learning-mode) .detail-page {
  background: #ffffff;
}

:global(.learning-mode) .header-navigation {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

:global(.learning-mode) .mode-toggle {
  color: #6366f1;
  background: #e6e8ff;
}

:global(.learning-mode.dark-theme) .detail-page {
  background: #0d1117;
}

:global(.learning-mode.dark-theme) .header-navigation {
  background: rgba(13, 17, 23, 0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

:global(.learning-mode.dark-theme) .mode-toggle {
  color: #a5a8ff;
  background: #252945;
}
</style>