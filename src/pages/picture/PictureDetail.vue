<template>
  <div class="image-detail-header">
    <!-- 左侧：返回与进度指示 -->
    <div class="header-left">
      <a-button class="circle-button back-button" shape="circle">
        <template #icon>
          <IconFont type="icon-shangyizhang11" />
        </template>
      </a-button>
      <div class="progress-indicator">
        <div class="progress-track">
          <div class="progress-fill"></div>
        </div>
        <span class="progress-text">5/14</span>
      </div>
    </div>

    <!-- 中间：分类标签 -->
    <div class="category-container">
      <a class="category-tag">动物摄影</a>
      <a  class="category-tag">表情包</a>
      <span class="image-title">熊猫表情包 1</span>
    </div>

    <!-- 右侧：功能按钮 -->
    <div class="action-buttons">
      <a-button class="feature-button">
        <template #icon><IconFont type="icon-search" /></template>
        以图搜图
      </a-button>
      <a-button class="feature-button">
        <template #icon><IconFont type="icon-search" /></template>
        相似图片
      </a-button>
      <a-button class="feature-button">
        <template #icon><IconFont type="icon-yuantu" /></template>
        查看原图
      </a-button>
      <a-button class="feature-button">
        <template #icon><IconFont type="icon-yuantu" /></template>
        我要举报
      </a-button>
    </div>
  </div>

  <div class="redesigned-detail-page">
    <div class="detail-container" v-motion :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { duration: 500 } }">
      <a-row :gutter="[24, 24]">
        <!-- 左侧图片区域 -->
        <a-col :xs="24" :lg="16" :xl="17" class="card-col">
          <div class="image-card" v-motion :initial="{ y: 20, opacity: 0 }"
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
                    <IconFont type="icon-shangyizhang11" />
                  </template>
                </a-button>
                <a-button
                    class="nav-button next-button"
                    shape="circle"
                    @click="navigateToNext"
                    :disabled="!hasNextImage"
                >
                  <template #icon>
                    <IconFont type="icon-shangyizhang13" style="margin-left: 7px" />
                  </template>
                </a-button>
              </div>

              <!-- 主图片 -->
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
                  <!-- 喜欢按钮 -->
                  <div
                      class="action-btn like-button"
                      :class="{'action-active': userReactionStore.isLiked(imageId)}"
                      @click="toggleLike"
                      role="button"
                      tabindex="0"
                      @keydown.enter="toggleLike"
                  >
                    <span class="action-icon">
                      <IconFont type="icon-xihuan2" v-if="!userReactionStore.isLiked(imageId)"/>
                      <IconFont type="icon-xihuan4" v-else/>
                    </span>
                    <span class="action-text">
                      {{ userReactionStore.getPictureLikeCount(imageId) === 0 ? '喜欢' : formatNumber(userReactionStore.getPictureLikeCount(imageId)) }}
                    </span>
                  </div>

                  <!-- 收藏按钮 -->
                  <div
                      class="action-btn bookmark-button"
                      :class="{'action-active': userReactionStore.isFavorited(imageId)}"
                      @click="toggleBookmark"
                      role="button"
                      tabindex="0"
                      @keydown.enter="toggleBookmark"
                  >
                    <span class="action-icon">
                      <IconFont type="icon-wodeshoucang" v-if="!userReactionStore.isFavorited(imageId)"/>
                      <IconFont type="icon-a-shoucang-yishoucang" v-else/>
                    </span>
                    <span class="action-text">
                      {{ userReactionStore.isFavorited(imageId) ? '已收藏' : '收藏' }}
                    </span>
                  </div>

                  <!-- 分享按钮 -->
                  <ShareComponent
                      :share-url="shareUrl"
                      :content-title="currentImage.name || '分享图片'"
                      class="share-btn"
                  />

                  <!-- 下载按钮 -->
                  <a-button type="primary" class="download-button" @click="downloadImage">
                    <template #icon>
                      <IconFont type="icon-chevron_circle_down" />
                    </template>
                    下载
                  </a-button>

                  <!-- 编辑按钮 (仅当用户是图片所有者时显示) -->
                  <a-button v-if="isOwner" class="edit-button" @click="editImage">
                    <template #icon>
                      <IconFont type="icon-bianji2" />
                    </template>
                    编辑
                  </a-button>
                </div>

                <div class="view-count">
                  <IconFont type="icon-chakan3" />
                  {{ formatNumber(currentImage.viewCount || 0) }} 浏览
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧信息区域 -->
        <a-col :xs="24" :lg="8" :xl="7" class="card-col">
          <div class="info-sidebar" v-motion :initial="{ x: 20, opacity: 0 }"
               :enter="{ x: 0, opacity: 1, transition: { delay: 200, duration: 400 } }">
            <div class="info-content-scroll">
              <!-- 作者信息卡片 -->
              <div class="info-section author-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 250, duration: 300 } }">
                <div class="author-avatar-wrapper">
                  <img v-if="currentImage.user" :src="currentImage.user.avatar" class="author-avatar" />
                  <div class="author-status-badge" :class="{ 'online': true }"></div>
                </div>

                <div class="author-details">
                  <div class="author-name-row">
                    <span v-if="currentImage.user" class="author-name">{{ currentImage.user.username || '未知作者' }}</span>
                    <a-tag color="blue" class="verified-badge" v-if="currentImage.user && currentImage.user.verified">
                      <template #icon><check-outlined /></template>
                      认证创作者
                    </a-tag>
                  </div>

                  <div class="author-meta">
                    <span class="upload-time" :title="formatDate(currentImage.createTime, 'full')">
                      {{ formatDate(currentImage.createTime) }}
                    </span>
                    <a-divider type="vertical" class="meta-divider" />
                    <span class="author-role">{{ currentImage.user?.role || '设计师' }}</span>
                  </div>
                </div>

                <a-button type="primary" class="follow-button" shape="round" size="middle">
                  <template #icon><user-add-outlined class="follow-icon" /></template>
                  关注
                </a-button>
              </div>

              <!-- 图片描述 -->
              <div class="info-section description-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 300, duration: 300 } }">
                <p class="image-description">{{ currentImage.description || '这是一张关于' + currentImage.name + '的图片。' }}</p>
              </div>

              <!-- 统计数据区域 -->
              <div class="info-section stats-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 350, duration: 300 } }">
                <div class="stats-grid">
                  <!-- 浏览量 -->
                  <div class="stat-item view-stat">
                    <div class="stat-icon-wrapper">
                      <IconFont type="icon-chakan3" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatNumber(userReactionStore.getPictureViewCount(imageId)) }}</div>
                      <div class="stat-label">浏览</div>
                    </div>
                  </div>

                  <!-- 喜欢数 -->
                  <div class="stat-item like-stat">
                    <div class="stat-icon-wrapper">
                      <IconFont type="icon-guanzhuzhongxin" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatNumber(userReactionStore.getPictureLikeCount(imageId)) }}</div>
                      <div class="stat-label">喜欢</div>
                    </div>
                  </div>

                  <!-- 收藏数 -->
                  <div class="stat-item favorite-stat">
                    <div class="stat-icon-wrapper">
                      <IconFont type="icon-shoucang" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatNumber(userReactionStore.getPictureFavoriteCount(imageId)) }}</div>
                      <div class="stat-label">收藏</div>
                    </div>
                  </div>

                  <!-- 评论数 -->
                  <div class="stat-item comment-stat">
                    <div class="stat-icon-wrapper">
                      <IconFont type="icon-pinglunshu" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatNumber(currentImage.commentCount || 0) }}</div>
                      <div class="stat-label">评论</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分类与标签区域 -->
              <div class="info-section tags-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 400, duration: 300 } }">
                <div class="section-header">
                  <IconFont type="icon-shuqian" class="section-icon" />
                  <h3 class="section-title">分类与标签</h3>
                </div>

                <div class="section-content">
                  <!-- 分类 -->
                  <div class="categories-wrapper">
                    <a-tag
                        color="blue"
                        class="category-tag"
                    >
                      {{ currentImage.category || '风景壁纸' }}
                    </a-tag>
                  </div>

                  <!-- 标签 -->
                  <div class="tags-wrapper">
                    <template v-if="currentImage.tags && currentImage.tags.length > 0">
                      <a-tag
                          v-for="(tag, index) in visibleTags"
                          :key="index"
                          class="tag"
                          :color="tagColors[index % tagColors.length]"
                      >
                        {{ typeof tag === 'string' ? tag : tag.name }}
                      </a-tag>

                      <!-- 如果有更多标签，显示+N更多 -->
                      <a-tag
                          v-if="hasMoreTags"
                          class="tag more-tag"
                          @click="showAllTags"
                      >
                        +{{ currentImage.tags.length - 3 }} 更多
                      </a-tag>
                    </template>
                    <div v-else class="no-tags">
                      <IconFont type="icon-empty" class="no-tags-icon" />
                      <span>暂无标签</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 图片详细信息区域 -->
              <div class="info-section details-section" v-motion :initial="{ y: 10, opacity: 0 }"
                   :enter="{ y: 0, opacity: 1, transition: { delay: 450, duration: 300 } }">
                <div class="section-header">
                  <IconFont type="icon-biankuang" class="section-icon" />
                  <h3 class="section-title">图片详细信息</h3>
                </div>

                <div class="section-content">
                  <div class="details-grid">
                    <!-- 左侧列 -->
                    <div class="detail-column">
                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-tupiangeshi" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">格式</div>
                          <div class="detail-value">{{ currentImage.format || 'JPEG' }}</div>
                        </div>
                      </div>

                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-dengkuanfenbu" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">宽度</div>
                          <div class="detail-value">{{ currentImage.picWidth || '5120' }}px</div>
                        </div>
                      </div>

                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-a-tongyikuangaohuaban1" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">高度</div>
                          <div class="detail-value">{{ currentImage.picHeight || '2880' }}px</div>
                        </div>
                      </div>
                    </div>

                    <!-- 右侧列 -->
                    <div class="detail-column">
                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-kuangaobi1" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">宽高比</div>
                          <div class="detail-value">{{ currentImage.picScale || '1.78' }}</div>
                        </div>
                      </div>

                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-wenjiandaxiao" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">文件大小</div>
                          <div class="detail-value">{{ formatFileSize(currentImage.size) }}</div>
                        </div>
                      </div>

                      <div class="detail-item">
                        <div class="detail-icon">
                          <IconFont type="icon-shangchuanshijian1" />
                        </div>
                        <div class="detail-info">
                          <div class="detail-label">上传时间</div>
                          <div class="detail-value">{{ formatDate(currentImage.createTime, 'full') }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

<!--      <a-row>-->
<!--        <a-col :span="24">-->
<!--          <div v-motion :initial="{ opacity: 0, y: 10 }"-->
<!--               :enter="{ opacity: 1, y: 0, transition: { delay: 600, duration: 300 } }">-->
<!--            <ImageStoryBackground :story-data="storyData"/>-->
<!--          </div>-->
<!--        </a-col>-->
<!--      </a-row>-->

      <div style="margin-top: 20px">
        <!-- 评论系统 -->
        <a-row>
          <a-col :span="24">
            <div v-motion :initial="{ opacity: 0 }"
                 :enter="{ opacity: 1, transition: { delay: 700, duration: 500 } }">
              <CommentSystem
                  :content-id="imageId"
                  content-type="picture"
                  :initial-comments="comments"
                  :initial-total="commentTotal"
                  @updated="handleCommentUpdate"
              />
            </div>
          </a-col>
        </a-row>
      </div>


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
import {ref, reactive, computed, onMounted, onUnmounted, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';
import {useUserStore} from "@/stores/user";
import CommentSystem from '@/components/comment/CommentSystem.vue';
import RelatedPictures from "@/components/picture/RelatedPictures.vue";
import ImageStoryBackground from "@/components/picture/ImageStoryBackground.vue";
import {commentService} from '@/services/commentService';
import {getNextPictureUsingGet, getPictureByIdUsingGet, getPreviousPictureUsingGet} from "@/api/tupianxiangguanjiekou";
import {useUserReactionStore} from '@/stores/userReaction';
import ShareComponent from "@/components/common/ShareComponent.vue";

const userReactionStore = useUserReactionStore();

const userStore = useUserStore();

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
const isDarkMode = ref(false);

// 模拟评论数据
const comments = ref<any[]>([]);
const commentLoading = ref(true);
const commentTotal = ref(0)
const shareUrl = ref('');


// 计算图片是否被收藏
const isCollected = computed(() => {
  return userReactionStore.isFavorited(imageId.value);
});

// 标签显示控制
const visibleTags = computed(() => {
  if (!currentImage.value.tags || !currentImage.value.tags.length) return [];
  return currentImage.value.tags.slice(0, 3);
});

const hasMoreTags = computed(() => {
  return currentImage.value.tags && currentImage.value.tags.length > 3;
});


// 定义标签颜色数组，用于自动分配不同颜色给标签
const tagColors = ref(['green', 'orange', 'geekblue', 'purple', 'cyan', 'magenta']);

// 格式化文件大小的函数
const formatFileSize = (sizeInBytes :any) => {
  if (!sizeInBytes) return '未知大小';

  sizeInBytes = Number(sizeInBytes);

  if (isNaN(sizeInBytes)) {
    // 如果是字符串形式的尺寸，直接返回
    return sizeInBytes;
  }

  if (sizeInBytes < 1024) {
    return sizeInBytes + ' B';
  } else if (sizeInBytes < 1024 * 1024) {
    return (sizeInBytes / 1024).toFixed(2) + ' KB';
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

// 显示所有标签的方法
const showAllTags = () => {
  message.info('显示所有标签功能开发中');
}

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
    {name: "逆光摄影", type: "technique"},
    {name: "海景摄影", type: "subject"},
    {name: "自然光利用", type: "technique"},
    {name: "水面反射", type: "composition"},
    {name: "日落构图", type: "composition"},
    {name: "抽象自然", type: "style"}
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
const formatDate = (dateString: any, type = 'relative') => {
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
    const response = await getPreviousPictureUsingGet({id: imageId.value});
    hasPrevImage.value = !!(response && response.data && (response.data.data || response.data.id));
  } catch (error) {
    console.error('检查上一张图片错误:', error);
    hasPrevImage.value = false;
  }
};

// 检查是否有下一张图片
const checkHasNextImage = async () => {
  try {
    const response = await getNextPictureUsingGet({id: imageId.value});
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
    const response = await getPreviousPictureUsingGet({id: imageId.value});

    if (response && response.data) {
      const newImage = response.data.data || response.data;

      // 更新URL
      router.push({
        name: 'PictureDetail',
        params: {id: newImage.id}
      });

      // 更新当前图片数据并重置状态
      currentImage.value = newImage;
      imageId.value = newImage.id;
      imageLoaded.value = false;

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
    const response = await getNextPictureUsingGet({id: imageId.value});

    if (response && response.data) {
      const newImage = response.data.data || response.data;

      // 更新URL
      router.push({
        name: 'PictureDetail',
        params: {id: newImage.id}
      });

      // 更新当前图片数据并重置状态
      currentImage.value = newImage;
      imageId.value = newImage.id;
      imageLoaded.value = false;

      // 重新检查导航状态
      await checkHasPrevImage();
      await checkHasNextImage();
    }
  } catch (error) {
    message.error('获取下一张图片失败');
  } finally {
    loading.value = false;
  }
};

// 在 fetchComments 中添加递归处理多级嵌套评论的函数
const processCommentReplies = (commentsList) => {
  if (!commentsList || !commentsList.length) return [];

  return commentsList.map(item => {
    const formattedComment = {
      id: item.id,
      content: item.content,
      createTime: item.createTime,
      likes: item.likeCount || 0,
      liked: item.hasLiked || false,
      parentId: item.parentId,
      rootId: item.rootId,
      author: {
        id: item.user?.id,
        name: item.user?.username || '未知用户',
        avatar: item.user?.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${item.user?.username || 'unknown'}`,
      },
      replyUser: item.replyUser ? {
        id: item.replyUser.id,
        name: item.replyUser.username || '未知用户',
        avatar: item.replyUser.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${item.replyUser.username || 'unknown'}`
      } : null,
      // 递归处理子评论
      replies: processCommentReplies(item.children || [])
    };

    return formattedComment;
  });
};

// 修改 fetchComments 函数
const fetchComments = async (pictureId) => {
  if (!pictureId) return;

  commentLoading.value = true;
  try {
    const { list, total } = await commentService.getContentCommentsTree(
        pictureId,
        "picture"
    );

    // 使用递归函数处理评论数据
    comments.value = list.map(comment => {
      // 处理顶级评论
      const formattedComment = {
        id: comment.id,
        content: comment.content,
        createTime: comment.createTime,
        likes: comment.likeCount || 0,
        liked: comment.hasLiked || false,
        replyCount: comment.replyCount || 0,
        author: {
          id: comment.user?.id,
          name: comment.user?.username || '未知用户',
          avatar: comment.user?.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${comment.user?.username || 'unknown'}`,
        },
        // 递归处理所有子评论
        replies: processCommentReplies(comment.children || [])
      };

      return formattedComment;
    });

    commentTotal.value = total || list.length;

    // 更新图片的评论计数
    if (currentImage.value) {
      currentImage.value.commentCount = total || list.length;
    }
  } catch (error) {
    console.error('获取评论列表失败:', error);
    message.error('获取评论列表失败');
  } finally {
    commentLoading.value = false;
  }
};


// 获取图片详情数据
const fetchPictureDetail = async (id: number) => {
  try {
    loading.value = true;
    imageLoaded.value = false;

    const response = await getPictureByIdUsingGet({id});

    if (response && response.data) {
      currentImage.value = response.data.data;

      // 获取反应状态和计数
      await userReactionStore.getStatus(id);
      await userReactionStore.getCounts(id);

      // 检查是否有上一张/下一张图片
      await checkHasPrevImage();
      await checkHasNextImage();
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
const toggleLike = async () => {
  if (!imageId.value) return;

  try {
    // 使用store的方法来切换点赞状态
    await userReactionStore.toggleLike(imageId.value);

  } catch (error) {
    console.error('点赞操作失败', error);
    message.error('操作失败，请稍后重试');
  }
};

// 收藏操作
const toggleBookmark = async () => {
  if (!imageId.value) return;

  try {
    // 使用store的方法来切换收藏状态
    await userReactionStore.toggleFavorite(imageId.value);

  } catch (error) {
    console.error('收藏操作失败', error);
    message.error('操作失败，请稍后重试');
  }
};

// 收藏/取消收藏
const toggleCollect = toggleBookmark;


// 复制链接
const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制');
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
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
  if (userStore.userInfo && currentImage.value.user) {
    return userStore.userInfo.id === currentImage.value.user.id.toString();
  }
  return false;
});


// 编辑图片信息
const editImage = () => {
  router.push({name: 'EditPicture', params: {id: imageId.value}});
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

// 更新评论列表后的处理方法
const handleCommentUpdate = () => {
  console.log('触发评论更新，正在重新获取评论列表...');
  // 重新获取评论列表
  fetchComments(imageId.value);
};

// 生命周期钩子
onMounted(async () => {

  // 初始化userReactionStore
  await userReactionStore.initialize();

  if (typeof window !== 'undefined') {
    shareUrl.value = window.location.href;
  }

  // 获取图片详情
  await fetchPictureDetail(imageId.value);

  // 获取评论列表
  await fetchComments(imageId.value);

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
    // 当图片 ID 变化时获取新的评论
    fetchComments(newId as string);

    // 更新分享URL
    if (typeof window !== 'undefined') {
      shareUrl.value = window.location.href;
    }
  }
});
</script>


<style scoped>
.image-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 12px 0;
  box-sizing: border-box;
}

/* 左侧返回与进度 */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.circle-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #f5f7fa;
}

.circle-button:hover {
  background: #e8edf5;
  transform: translateX(-2px);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-track {
  width: 100px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 35%;
  background: #6366f1;
  border-radius: 2px;
}

.progress-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* 中间分类标签 */
.category-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 14px;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
}

.category-tag:hover {
  transform: translateY(-1px);
}

.image-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  margin-left: 4px;
}

/* 右侧功能按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-button {
  height: 32px;
  border-radius: 16px;
  padding: 0 15px;
  font-size: 13px;
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
  transition: all 0.2s;
}

.feature-button:hover {
  background: #f3f4f6;
  color: #4b5563;
  transform: translateY(-1px);
}

.feature-button.highlight {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #e0e7ff;
}

.feature-button.highlight:hover {
  background: #e0e7ff;
  color: #4338ca;
}

/* 响应式调整 */
@media (max-width: 1100px) {
  .feature-button span {
    display: none;
  }

  .feature-button {
    width: 36px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .image-detail-header {
    flex-wrap: wrap;
  }

  .header-left {
    order: 1;
    width: 50%;
  }

  .category-container {
    order: 3;
    width: 100%;
    margin-top: 12px;
  }

  .action-buttons {
    order: 2;
    width: 50%;
    justify-content: flex-end;
  }
}

@media (max-width: 576px) {
  .progress-track {
    width: 60px;
  }

  .action-buttons {
    gap: 5px;
  }
}
/* 整体页面布局 */
.redesigned-detail-page {
  padding: 24px 0 32px;
  background-color: #f7f9fc;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 主容器样式 */
.detail-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

/* 确保左右卡片列同高 */
.card-col {
  display: flex;
  flex-direction: column;
}

/* ===== 左侧图片卡片 ===== */
.image-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 680px; /* 固定高度以匹配右侧 */
  width: 100%;
  border: 1px solid rgba(234, 236, 240, 0.4);
  transition: all 0.3s ease;
}

.image-card:hover {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.picture-viewer {
  position: relative;
  width: 100%;
  height: 100%;
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
  background-color: rgba(24, 49, 83, 0.03);
  flex: 1;
  overflow: hidden;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.8s ease;
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
  padding: 0 20px;
}

.nav-button {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  pointer-events: auto;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  transform: scale(1.1);
  opacity: 1;
  background: white;
}

.nav-button:disabled {
  opacity: 0.5;
  transform: none;
  cursor: not-allowed;
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
  padding: 16px 24px;
  border-top: 1px solid rgba(234, 236, 240, 0.8);
  background-color: white;
  flex-shrink: 0;
  height: 72px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(234, 236, 240, 0.8);
}

.action-btn:hover {
  transform: translateY(-2px);
  background: white;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}

.action-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #64748b;
  transition: all 0.3s;
}

.action-text {
  font-size: 14px;
  color: #64748b;
  transition: all 0.3s;
}

.action-btn:hover .action-icon,
.action-btn:hover .action-text {
  color: #4b5563;
}

.action-btn.action-active .action-icon,
.action-btn.action-active .action-text {
  color: #6366f1;
}

.like-button.action-active .action-icon {
  color: #ec4899;
}

.bookmark-button.action-active .action-icon {
  color: #f59e0b;
}

.download-button,
.edit-button {
  height: 40px;
  font-size: 14px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  transition: all 0.3s;
  padding: 0 16px;
}

.download-button {
  background: #6366f1;
  border: none;
  color: white;
}

.download-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.edit-button {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.edit-button:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  transform: translateY(-2px);
}

.view-count {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* ===== 右侧信息侧边栏 ===== */
.info-sidebar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(234, 236, 240, 0.4);
  transition: all 0.3s ease;
  height: 680px; /* 确保与左侧图片卡片高度一致 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-sidebar:hover {
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 滚动内容区域 */
.info-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.info-content-scroll::-webkit-scrollbar {
  width: 6px;
}

.info-content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.info-content-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.info-content-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* 信息区域通用样式 */
.info-section {
  padding: 20px;
  border-bottom: 1px solid rgba(234, 236, 240, 0.8);
}

.info-section:last-child {
  border-bottom: none;
}

/* 作者卡片 */
.author-section {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.author-avatar-wrapper {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.author-avatar:hover {
  transform: scale(1.05);
}

.author-status-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #10b981;
  border: 2px solid white;
}

.author-details {
  flex: 1;
  overflow: hidden;
  margin-right: 12px;
}

.author-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.author-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-badge {
  font-size: 12px;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 10px;
  flex-shrink: 0;
}

.author-meta {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 13px;
}

.meta-divider {
  margin: 0 8px;
  height: 12px;
}

.follow-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  background: #6366f1;
  border: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  color: white;
  flex-shrink: 0;
}

.follow-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.follow-icon {
  margin-right: 4px;
}

/* 描述区域 */
.description-section {
  padding-top: 10px;
}

.image-description {
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
  background: rgba(249, 250, 251, 0.7);
  padding: 14px 16px;
  border-radius: 12px;
  position: relative;
  border: 1px solid rgba(234, 236, 240, 0.8);
  margin: 0;
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-icon {
  color: #6366f1;
  font-size: 20px;
  margin-right: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-content {
  padding: 0;
}

/* 统计卡片 */
.stats-section {
  padding-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: 12px;
  background: linear-gradient(145deg, #f9fafb, #ffffff);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  border: 1px solid rgba(234, 236, 240, 0.8);
  text-align: center;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.view-stat:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.like-stat:hover {
  border-color: rgba(236, 72, 153, 0.3);
}

.favorite-stat:hover {
  border-color: rgba(245, 158, 11, 0.3);
}

.comment-stat:hover {
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-icon-wrapper {
  font-size: 24px;
  margin-bottom: 8px;
  color: #64748b;
  transition: all 0.3s ease;
}

.view-stat:hover .stat-icon-wrapper {
  color: #3b82f6;
}

.like-stat:hover .stat-icon-wrapper {
  color: #ec4899;
}

.favorite-stat:hover .stat-icon-wrapper {
  color: #f59e0b;
}

.comment-stat:hover .stat-icon-wrapper {
  color: #10b981;
}

.stat-content {
  width: 100%;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

/* 分类与标签 */
.categories-wrapper {
  margin-bottom: 16px;
}

.category-tag {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.category-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  border-radius: 100px;
  padding: 5px 14px;
  font-size: 13px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  height: 28px;
  display: inline-flex;
  align-items: center;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.more-tag {
  background: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
}

.more-tag:hover {
  background: #e5e7eb;
  color: #374151;
}

.no-tags {
  color: #64748b;
  font-size: 13px;
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.no-tags-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 详细信息卡片 */
.details-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.detail-column {
  flex: 1;
  min-width: 120px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  transform: translateX(2px);
}

.detail-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6366f1;
  font-size: 16px;
  transition: all 0.3s ease;
}

.detail-item:hover .detail-icon {
  background: rgba(99, 102, 241, 0.12);
  transform: scale(1.05);
}

.detail-info {
  flex: 1;
}

.detail-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.detail-item:hover .detail-value {
  color: #6366f1;
}

.share-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.share-btn:hover {
  transform: translateY(-2px);
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .image-card,
  .info-sidebar {
    height: auto;
  }

  .main-image-wrapper {
    height: 450px;
  }
}

@media (max-width: 768px) {
  .redesigned-detail-page {
    padding: 16px 0 24px;
  }

  .detail-container {
    padding: 0 16px;
  }

  .image-action-bar {
    flex-direction: column;
    gap: 16px;
    height: auto;
    padding: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .view-count {
    align-self: flex-end;
  }

  .author-section {
    flex-wrap: wrap;
  }

  .follow-button {
    margin-top: 16px;
    width: 100%;
  }

  .details-grid {
    flex-direction: column;
  }

  .action-btn {
    padding: 8px 12px;
  }

  .action-text {
    display: none;
  }

  .action-icon {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 暗色模式适配 */
.dark-theme .redesigned-detail-page {
  background-color: #111827;
}

.dark-theme .image-card,
.dark-theme .info-sidebar {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.dark-theme .main-image-wrapper {
  background-color: rgba(17, 24, 39, 0.5);
}

.dark-theme .nav-button {
  background: rgba(31, 41, 55, 0.9);
}

.dark-theme .nav-button:hover {
  background: #374151;
}

.dark-theme .image-action-bar,
.dark-theme .info-section {
  background: #1f2937;
  border-color: #374151;
}

.dark-theme .action-btn {
  background: rgba(31, 41, 55, 0.5);
  border-color: #374151;
}

.dark-theme .action-btn:hover {
  background: #374151;
}

.dark-theme .action-icon,
.dark-theme .action-text,
.dark-theme .view-count {
  color: #9ca3af;
}

.dark-theme .action-btn:hover .action-icon,
.dark-theme .action-btn:hover .action-text {
  color: #e5e7eb;
}

.dark-theme .author-name,
.dark-theme .section-title,
.dark-theme .stat-value,
.dark-theme .detail-value {
  color: #e5e7eb;
}

.dark-theme .author-meta,
.dark-theme .stat-label,
.dark-theme .detail-label,
.dark-theme .image-description {
  color: #9ca3af;
}

.dark-theme .image-description {
  background: rgba(31, 41, 55, 0.5);
  border-color: #374151;
}

.dark-theme .section-header {
  border-color: #374151;
}

.dark-theme .stat-item {
  background: linear-gradient(145deg, #1f2937, #111827);
  border-color: #374151;
}

.dark-theme .detail-icon {
  background: rgba(99, 102, 241, 0.15);
}

.dark-theme .detail-item:hover .detail-icon {
  background: rgba(99, 102, 241, 0.25);
}

.dark-theme .more-tag {
  background: #374151;
  color: #9ca3af;
}

.dark-theme .more-tag:hover {
  background: #4b5563;
  color: #e5e7eb;
}

.dark-theme .edit-button {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.dark-theme .edit-button:hover {
  background: rgba(99, 102, 241, 0.25);
}
</style>