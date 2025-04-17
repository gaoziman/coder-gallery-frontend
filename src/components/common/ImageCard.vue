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
            <IconFont type="icon-shijiankaishishijian"/>
            <span>{{ formatDate(image.createTime) }}</span>
          </div>
          <div class="meta-item">
            <IconFont type="icon-liulanliang"/>
            <span>{{ formatNumber(image.viewCount) }} 浏览</span>
          </div>
        </div>

        <div class="image-actions">
          <a-button type="primary" shape="circle" class="action-btn view-btn" @click.stop="viewImage">
            <template #icon>
              <IconFont type="icon-chakan2" class="icon-custom"/>
            </template>
          </a-button>
          <a-button type="primary" shape="circle" class="action-btn download-btn" @click.stop="downloadImage">
            <template #icon>
              <IconFont type="icon-download2" class="icon-custom"/>
            </template>
          </a-button>
          <a-button
              v-if="isOwner"
              type="primary"
              shape="circle"
              class="action-btn delete-btn"
              @click.stop="confirmDelete">
            <template #icon>
              <IconFont type="icon-lajitongshanchu" class="icon-custom"/>
            </template>
          </a-button>
          <!--   点赞按钮-->
          <a-button
              type="primary"
              shape="circle"
              :class="{ 'action-btn': true, 'like-btn': true, 'liked': userReactionStore.isLiked(image.id) }"
              :loading="likeLoading"
              @click.stop="toggleLike">
            <template #icon>
              <IconFont type="icon-xihuan4" class="icon-custom" v-if="userReactionStore.isLiked(image.id)"/>
              <IconFont type="icon-xihuan2" class="icon-custom" v-else/>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 图片预览弹框 - 全新设计 -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="showLightbox" class="premium-lightbox" @click="closeLightbox">
            <!-- 预加载图片以防闪烁 -->
            <img v-if="preloadImage" :src="currentImg" class="preload-image" />

            <!-- 主容器 -->
            <div class="premium-lightbox-container" @click.stop>
              <!-- 顶部操作栏 -->
              <div class="premium-lightbox-header">
                <div class="header-info">
                  <h2 class="image-title">{{ image.title }}</h2>
                  <div class="image-categories">
                    <a-tag
                        v-if="image.category"
                        class="category-tag"
                        :style="{
                        color: getCategoryStyle(image.category).color,
                        background: getCategoryStyle(image.category).background
                      }"
                    >
                      {{ image.category }}
                    </a-tag>
                  </div>
                </div>

                <div class="header-actions">
                  <div class="action-group">
                    <a-tooltip title="下载" placement="bottom">
                      <div class="header-action-btn" @click="downloadImage">
                        <IconFont type="icon-download" />
                      </div>
                    </a-tooltip>

                    <a-tooltip title="分享" placement="bottom">
                      <div class="header-action-btn" @click="shareImage">
                        <IconFont type="icon-fenxiang5" />
                      </div>
                    </a-tooltip>

                    <a-tooltip :title="userReactionStore.isLiked(image.id) ? '取消点赞' : '点赞'" placement="bottom">
                      <div
                          class="header-action-btn"
                          :class="{ 'active': userReactionStore.isLiked(image.id) }"
                          @click="toggleLike"
                      >
                        <IconFont :type="userReactionStore.isLiked(image.id) ? 'icon-xihuan4' : 'icon-xihuan2'" />
                      </div>
                    </a-tooltip>

                    <a-tooltip :title="userReactionStore.isFavorited(image.id) ? '取消收藏' : '收藏'" placement="bottom">
                      <div
                          class="header-action-btn favorite-btn"
                          :class="{ 'active': userReactionStore.isFavorited(image.id) }"
                          @click="toggleBookmark"
                      >
                        <IconFont :type="userReactionStore.isFavorited(image.id) ? 'icon-a-shoucang-yishoucang' : 'icon-wodeshoucang'" />
                      </div>
                    </a-tooltip>
                  </div>

                  <div class="close-btn" @click="closeLightbox">
                    <IconFont type="icon-guanbi" />
                  </div>
                </div>
              </div>

              <!-- 图片查看区域 -->
              <div class="premium-lightbox-content">
                <!-- 左侧导航按钮 -->
                <div v-if="hasPrevImage" class="nav-button prev-button" @click="navigateToPrevImage">
                  <IconFont type="icon-arrow-left" />
                </div>

                <!-- 图片容器 -->
                <div class="image-view-container">
                  <div class="image-wrapper" ref="imageWrapper">
                    <img
                        ref="previewImage"
                        :src="currentImg"
                        :alt="image.title"
                        class="preview-image"
                        :class="{ 'zoomed': zoomLevel > 1 }"
                        :style="{ transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)` }"
                        @mousedown="startPan"
                        @wheel="handleZoom"
                        @dblclick="resetZoom"
                        @load="onImageLoad"
                    />

                    <!-- 缩放提示 -->
                    <div class="zoom-hint" v-if="showZoomHint">
                      <IconFont type="icon-Pointer" />
                      <span>双击可重置缩放</span>
                    </div>
                  </div>

                  <!-- 缩放控制 -->
                  <div class="zoom-controls">
                    <div class="zoom-btn" @click="adjustZoom(-0.1)" title="缩小">
                      <IconFont type="icon-jianfa" />
                    </div>
                    <div class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</div>
                    <div class="zoom-btn" @click="adjustZoom(0.1)" title="放大">
                      <IconFont type="icon-jiazhong" />
                    </div>
                    <div class="zoom-btn" @click="resetZoom" title="重置">
                      <IconFont type="icon-shuaxin2" />
                    </div>
                  </div>
                </div>

                <!-- 右侧导航按钮 -->
                <div v-if="hasNextImage" class="nav-button next-button" @click="navigateToNextImage">
                  <IconFont type="icon-arrow-right" />
                </div>
              </div>

              <!-- 底部信息栏 -->
              <div class="premium-lightbox-footer">
                <!-- 作者信息 -->
                <div class="author-section">
                  <a-avatar :src="image.author.avatar" :size="40" />
                  <div class="author-info">
                    <div class="author-name">{{ image.author.name }}</div>
                    <div class="image-date">{{ formatDate(image.createTime) }}</div>
                  </div>
                </div>

                <!-- 统计信息 -->
                <div class="stats-section">
                  <div class="stat-item">
                    <IconFont type="icon-chakan2" />
                    <span>{{ formatNumber(userReactionStore.getPictureViewCount(image.id)) }}</span>
                  </div>
                  <div class="stat-item" :class="{ 'active': userReactionStore.isLiked(image.id) }">
                    <IconFont :type="userReactionStore.isLiked(image.id) ? 'icon-xihuan4' : 'icon-xihuan2'" />
                    <span>{{ formatNumber(userReactionStore.getPictureLikeCount(image.id)) }}</span>
                  </div>
                  <div class="stat-item">
                    <IconFont type="icon-pinglun2" />
                    <span>{{ formatNumber(image.comments || Math.floor(image.viewCount * 0.1)) }}</span>
                  </div>
                </div>

                <!-- 图片信息切换 -->
                <div class="info-toggle" @click="toggleDetailPanel">
                  <span>{{ showDetailPanel ? '收起信息' : '查看更多' }}</span>
                  <IconFont :type="showDetailPanel ? 'icon-icon-gengduo' : 'icon-icon-gengduo1'" />
                </div>
              </div>

              <!-- 图片详细信息面板 -->
              <transition name="slide">
                <div v-if="showDetailPanel" class="detail-panel">
                  <div class="detail-container">
                    <!-- 图片信息 -->
                    <div class="detail-section">
                      <h3 class="section-title">图片信息</h3>
                      <div class="detail-grid">
                        <div class="detail-item">
                          <div class="item-label">尺寸</div>
                          <div class="item-value">{{ image.width || '1920' }} × {{ image.height || '1080' }} px</div>
                        </div>
                        <div class="detail-item">
                          <div class="item-label">格式</div>
                          <div class="item-value">{{ getImageFormat(image.src) }}</div>
                        </div>
                        <div class="detail-item">
                          <div class="item-label">上传时间</div>
                          <div class="item-value">{{ formatDate(image.createTime) }}</div>
                        </div>
                        <div class="detail-item">
                          <div class="item-label">文件大小</div>
                          <div class="item-value">{{ image.size ? formatFileSize(image.size) : '未知' }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- 标签信息 -->
                    <div class="detail-section" v-if="image.tags && image.tags.length > 0">
                      <h3 class="section-title">标签</h3>
                      <div class="tags-container">
                        <a-tag
                            v-for="(tag, index) in image.tags"
                            :key="index"
                            class="detail-tag"
                            :style="getTagStyleFromBackend(tag)"
                        >
                          {{ tag.name }}
                        </a-tag>
                      </div>
                    </div>

                    <!-- 图片描述 -->
                    <div class="detail-section" v-if="image.description">
                      <h3 class="section-title">描述</h3>
                      <p class="image-description">{{ image.description }}</p>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </transition>
      </Teleport>

      <!-- 图片右下角的热门标签 -->
      <div v-if="isHot" class="hot-badge">
        <IconFont type="icon-hot1" />
        <span>热门</span>
      </div>
    </div>

    <div class="image-info">
      <!-- 标题和收藏按钮并排 -->
      <div class="image-header">
        <div class="image-title">{{ image.title }}</div>
        <!-- 收藏按钮状态 -->
        <div class="bookmark-btn" @click.stop="toggleBookmark">
          <IconFont type="icon-wodeshoucang" v-if="!userReactionStore.isFavorited(image.id)"/>
          <IconFont type="icon-a-shoucang-yishoucang" v-else/>
        </div>
      </div>

      <!-- 作者信息和时间 -->
      <div class="image-author-row">
        <div class="image-author">
          <a-avatar :src="image.author.avatar" :size="24"/>
          <span class="author-name">{{ image.author.name }}</span>
        </div>
        <div class="image-date">
          <IconFont type="icon-shijianfenlei"/>
          <span>{{ formatShortDate(image.createTime) }}</span>
        </div>
      </div>

      <!-- 分类和标签区域 -->
      <div class="image-taxonomy">
        <!-- 单个分类标签 - 使用渐变色背景 -->
        <a-tag
            v-if="image.category"
            class="image-category"
            :style="{
        color: getCategoryStyle(image.category).color,
        background: getCategoryStyle(image.category).background,
        borderColor: 'transparent'
      }">
          {{ image.category }}
        </a-tag>

        <!-- 标签 - 使用后端返回的颜色 -->
        <a-tag
            v-for="(tag, tagIndex) in image.tags.slice(0, 3)"
            :key="tagIndex"
            class="image-tag"
            :style="getTagStyleFromBackend(tag)"
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
          <IconFont type="icon-chakan2"/>
          <span>{{ formatNumber(userReactionStore.getPictureViewCount(image.id)) }}</span>
        </div>
        <div class="interaction-stat"
             :class="{ 'active': userReactionStore.isLiked(image.id) }"
             @click.stop="toggleLike">
          <IconFont type="icon-xihuan2" class="icon-custom" v-if="!userReactionStore.isLiked(image.id)"/>
          <IconFont type="icon-xihuan4" class="icon-custom" v-else/>
          <span>{{ formatNumber(userReactionStore.getPictureLikeCount(image.id)) }}</span>
        </div>
        <div class="interaction-stat">
          <IconFont type="icon-pinglun2"/>
          <span>{{ formatNumber(image.comments || Math.floor(image.viewCount * 0.1)) }}</span>
        </div>
        <div class="interaction-share" @click.stop="shareImage">
          <IconFont type="icon-fenxiang5"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "@/stores/user";
import {useUserReactionStore} from '@/stores/userReaction';
import {computed, defineProps, defineEmits, ref, onMounted, watch, onUnmounted, nextTick} from 'vue';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

// 导入Teleport
import { Teleport } from 'vue';



// 添加加载状态
const likeLoading = ref(false);
const favoriteLoading = ref(false);

const userStore = useUserStore();
const userReactionStore = useUserReactionStore();

const showLightbox = ref(false);
const currentImg = ref('');
const imageWrapper = ref(null);
const previewImage = ref(null);
const preloadImage = ref(true);
const imageLoaded = ref(false);

// 新增状态
const showDetailPanel = ref(false);
const showZoomHint = ref(false);
const hasPrevImage = ref(false);
const hasNextImage = ref(false);

// 图片缩放与平移
const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const startX = ref(0);
const startY = ref(0);

// 图片加载完成回调
const onImageLoad = () => {
  imageLoaded.value = true;

  // 预加载完成后可以移除预加载图片
  setTimeout(() => {
    preloadImage.value = false;
  }, 300);
};

// 切换详情面板
const toggleDetailPanel = () => {
  showDetailPanel.value = !showDetailPanel.value;
};

// 显示缩放提示并自动隐藏
const showZoomHintTemporarily = () => {
  showZoomHint.value = true;
  setTimeout(() => {
    showZoomHint.value = false;
  }, 2000);
};

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
  'navigate-to-detail',
  'navigate'
]);

// 判断图片是否为热门
const isHot = computed(() => {
  const viewCount = userReactionStore.getPictureViewCount(props.image.id);
  const likeCount = userReactionStore.getPictureLikeCount(props.image.id);
  return (viewCount > 3000 || likeCount > 200);
});

// 判断是否是图片所有者
const isOwner = computed(() => {
  // 获取当前登录用户
  const currentUser = userStore.userInfo;

  // 如果用户未登录，肯定不是所有者
  if (!currentUser) return false;

  // 管理员始终有权限
  if (currentUser.role === 'admin') return true;

  // 普通用户需要检查是否是作者
  return currentUser.id === props.image.user.id;
});

// 获取图片格式
const getImageFormat = (src) => {
  if (!src) return 'JPEG';
  const extension = src.split('.').pop().toLowerCase();
  if (extension === 'png') return 'PNG';
  if (extension === 'gif') return 'GIF';
  if (extension === 'webp') return 'WebP';
  return 'JPEG';
};

// 加载图片的反应状态和计数
const loadImageReactions = async () => {
  if (props.image && props.image.id) {
    await userReactionStore.getStatus(props.image.id);
    await userReactionStore.getCounts(props.image.id);
  }
};

// 格式化文件大小为KB
const formatFileSize = (sizeInBytes) => {
  if (!sizeInBytes && sizeInBytes !== 0) return '未知';
  const sizeInKB = (sizeInBytes / 1024).toFixed(1);
  return `${sizeInKB} KB`;
};

// 导航到前一张图片
const navigateToPrevImage = () => {
  // 这里需要根据实际情况实现前一张图片的导航
  // 可以通过事件通知父组件切换图片
  emit('navigate', { direction: 'prev', currentId: props.image.id });
};

// 导航到下一张图片
const navigateToNextImage = () => {
  // 这里需要根据实际情况实现下一张图片的导航
  emit('navigate', { direction: 'next', currentId: props.image.id });
};

// 格式化创建时间
const formatDate = (timestamp: any) => {
  if (!timestamp) return '未知时间';
  return dayjs(timestamp).format('YYYY-MM-DD');
};

// 格式化短日期（仅显示月和日）
const formatShortDate = (timestamp :any) => {
  if (!timestamp) return '未知';
  return dayjs(timestamp).format('MM-DD');
};

// 格式化浏览量，如果超过1000则显示为1k+
const formatNumber = (num :any) => {
  if (!num && num !== 0) return 0;
  return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num;
};


// 优化的分类颜色映射表 - 主色调+渐变效果
const categoryColors = {
  '全部': {
    color: '#fff',
    background: 'linear-gradient(135deg, #6554C0, #7B68EE)',
    icon: 'icon-hot3'
  },
  '个人': {
    color: '#fff',
    background: 'linear-gradient(135deg, #1677ff, #36a9ff)',
    icon: 'icon-personal'
  },
  '星球': {
    color: '#fff',
    background: 'linear-gradient(135deg, #00b96b, #52c41a)',
    icon: 'icon-planet'
  },
  '面试题': {
    color: '#fff',
    background: 'linear-gradient(135deg, #fa8c16, #ffc53d)',
    icon: 'icon-interview'
  },
  '表情包': {
    color: '#fff',
    background: 'linear-gradient(135deg, #eb2f96, #ff85c0)',
    icon: 'icon-emoji'
  },
  '素材': {
    color: '#fff',
    background: 'linear-gradient(135deg, #13c2c2, #5cdbd3)',
    icon: 'icon-material'
  },
  '学习': {
    color: '#fff',
    background: 'linear-gradient(135deg, #1d39c4, #597ef7)',
    icon: 'icon-study'
  },
  'Bugs': {
    color: '#fff',
    background: 'linear-gradient(135deg, #d4380d, #ff7a45)',
    icon: 'icon-bug'
  },
  '海报': {
    color: '#fff',
    background: 'linear-gradient(135deg, #531dab, #8e44ad)',
    icon: 'icon-poster'
  },
  '壁纸': {
    color: '#fff',
    background: 'linear-gradient(135deg, #c41d7f, #eb2f96)',
    icon: 'icon-wallpaper'
  },
  '动漫': {
    color: '#fff',
    background: 'linear-gradient(135deg, #d46b08, #fa8c16)',
    icon: 'icon-anime'
  },
  '风景': {
    color: '#fff',
    background: 'linear-gradient(135deg, #08979c, #13c2c2)',
    icon: 'icon-landscape'
  },
  '城市': {
    color: '#fff',
    background: 'linear-gradient(135deg, #096dd9, #1890ff)',
    icon: 'icon-city'
  },
  '时尚': {
    color: '#fff',
    background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
    icon: 'icon-fashion'
  },
  '校园': {
    color: '#fff',
    background: 'linear-gradient(135deg, #237804, #52c41a)',
    icon: 'icon-campus'
  },
  '美食': {
    color: '#fff',
    background: 'linear-gradient(135deg, #ad4e00, #fa8c16)',
    icon: 'icon-food'
  },
  '建筑': {
    color: '#fff',
    background: 'linear-gradient(135deg, #391085, #722ed1)',
    icon: 'icon-building'
  },
  '艺术': {
    color: '#fff',
    background: 'linear-gradient(135deg, #006d75, #08979c)',
    icon: 'icon-art'
  },
  '户外': {
    color: '#fff',
    background: 'linear-gradient(135deg, #135200, #389e0d)',
    icon: 'icon-outdoor'
  },
  '生活': {
    color: '#fff',
    background: 'linear-gradient(135deg, #0050b3, #1677ff)',
    icon: 'icon-life'
  },
};

// 获取分类样式
const getCategoryStyle = (category :any) => {
  const style = categoryColors[category] || categoryColors['全部'];

  return {
    color: style.color,
    background: style.background,
    border: 'none',
    textTransform: 'uppercase', // 使分类全大写以区分标签
    fontWeight: 600,
    padding: '3px 12px', // 更大的内边距
    borderRadius: '20px', // 更大的圆角
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
  };
};


// 图片加载错误处理
const handleImageError = (event: any) => {
  console.error(`图片加载失败: ${props.image.src}`);
  // 设置替代图片 - 使用一个更可靠的占位图片服务
  event.target.src = 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg';
};

// 导航到图片详情页
const navigateToDetail = () => {
  emit('navigate-to-detail', props.image);
};

// 处理图片浏览
const viewImage = async (e :any) => {
  // 阻止事件冒泡，避免触发navigateToDetail
  e.stopPropagation();

  // 记录浏览
  if (props.image.id) {
    await userReactionStore.addViewRecord(props.image.id);
  }

  // 更新当前预览图片和状态
  currentImg.value = props.image.src;
  imageLoaded.value = false;
  preloadImage.value = true;

  // 重置其他状态
  resetZoom();
  showDetailPanel.value = false;

  // 显示弹框
  showLightbox.value = true;

  // 检查是否有前后图片
  checkNavigationAvailability();

  // 添加键盘事件监听
  nextTick(() => {
    document.addEventListener('keydown', handleKeyDown);
    // 滚动到顶部防止滚动条干扰
    document.body.style.overflow = 'hidden';
  });

  // 发送查看事件
  emit('view', props.image);
};

// 检查导航按钮的可用性
const checkNavigationAvailability = () => {
  // 这里需要根据实际情况实现，判断是否有前后图片
  // 例如，可以通过检查相册中的图片列表来判断
  // 此处只是示例，需要根据实际项目调整
  hasPrevImage.value = false;
  hasNextImage.value = false;
};

// 处理键盘事件
const handleKeyDown = (e) => {
  if (!showLightbox.value) return;

  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      if (hasPrevImage.value) navigateToPrevImage();
      break;
    case 'ArrowRight':
      if (hasNextImage.value) navigateToNextImage();
      break;
    case '+':
    case '=':
      adjustZoom(0.1);
      break;
    case '-':
      adjustZoom(-0.1);
      break;
    case '0':
      resetZoom();
      break;
    case 'i':
      toggleDetailPanel();
      break;
  }
};

// 重置缩放和平移
const resetZoom = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
};

// 调整缩放级别
const adjustZoom = (delta: any) => {
  const newZoom = zoomLevel.value + delta;
  // 限制缩放范围
  if (newZoom >= 0.5 && newZoom <= 3) {
    zoomLevel.value = newZoom;

    // 如果缩放级别大于1，且之前未显示提示，则显示提示
    if (zoomLevel.value > 1 && !showZoomHint.value) {
      showZoomHintTemporarily();
    }
  }
};

// 处理鼠标滚轮缩放
const handleZoom = (e :any) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  adjustZoom(delta);
};

// 开始平移
const startPan = (e :any) => {
  if (zoomLevel.value > 1) {
    isPanning.value = true;
    startX.value = e.clientX - panX.value;
    startY.value = e.clientY - panY.value;

    // 添加全局事件监听
    document.addEventListener('mousemove', handlePan);
    document.addEventListener('mouseup', endPan);
  }
};

// 处理平移
const handlePan = (e) => {
  if (isPanning.value) {
    panX.value = e.clientX - startX.value;
    panY.value = e.clientY - startY.value;
  }
};

// 结束平移
const endPan = () => {
  isPanning.value = false;
  // 移除全局事件监听
  document.removeEventListener('mousemove', handlePan);
  document.removeEventListener('mouseup', endPan);
};

// 优化后的getTagStyleFromBackend函数，提高文字可视性
const getTagStyleFromBackend = (tag :any) => {
  // 如果标签对象有color属性并且是合法的颜色值
  if (tag.color && typeof tag.color === 'string') {
    // 判断是否是有效的颜色值
    const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(tag.color);

    if (isValidColor) {
      // 从颜色值生成相应的浅色背景和边框颜色
      const color = tag.color;

      // 调整对比度：为颜色计算一个浅色的背景色
      const lighterBg = getLightColorFromHex(color);

      // 为颜色计算一个适合的边框颜色
      const borderColor = getMediumColorFromHex(color);

      // 获取更好对比度的文字颜色
      const textColor = getContrastTextColor(color);

      // 轻量化标签样式，与分类形成对比
      return {
        backgroundColor: lighterBg,
        color: textColor,
        borderColor: borderColor,
        fontWeight: '400', // 更轻的字重
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', // 更浅的阴影
        padding: '2px 8px',
        borderRadius: '4px', // 较小的圆角
      };
    }
  }

  // 如果没有有效的颜色信息，使用默认的标签样式
  return {
    backgroundColor: '#f0f5ff',
    color: '#2f54eb',
    borderColor: '#d6e4ff',
    fontWeight: '400',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    borderRadius: '4px'
  };
};

// 优化：获取对比度更好的文字颜色
const getContrastTextColor = (hexColor :any) => {
  // 移除可能的#前缀
  let hex = hexColor.replace('#', '');

  // 将3位颜色转为6位
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 计算亮度 (使用标准公式)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 计算颜色的亮度和对比度
  const isDark = brightness < 160; // 使用160作为阈值

  if (isDark) {
    // 如果颜色较深，使用白色或浅灰文字
    return '#ffffff';
  } else {
    // 如果颜色较浅，使用原色但加深或使用深灰
    // 获取原色的深色变体
    const darkerColor  = getDarkerColorFromHex(hexColor);

    // 确保足够深以提供良好对比度
    const darkerRgb = hexToRgb(darkerColor);
    const darkerBrightness = (darkerRgb.r * 299 + darkerRgb.g * 587 + darkerRgb.b * 114) / 1000;

    // 如果深色变体仍然不够深，使用标准深色
    return darkerBrightness > 100 ? '#333333' : darkerColor;
  }
};

// 辅助函数：从十六进制颜色生成浅色背景
const getLightColorFromHex = (hexColor :any) => {
  // 移除可能的#前缀
  let hex = hexColor.replace('#', '');

  // 将3位颜色转为6位
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 将颜色转换为HSL
  const hsl = rgbToHsl(r, g, b);

  // 调高亮度和降低饱和度制作浅色背景
  const lighterHsl = [
    hsl[0],           // 保持色相不变
    Math.min(hsl[1] * 0.65, 0.3),  // 降低饱和度
    Math.min(0.96, hsl[2] * 1.3)   // 提高亮度，但不超过96%
  ];

  // 转回RGB然后再转为HEX
  const lighterRgb = hslToRgb(lighterHsl[0], lighterHsl[1], lighterHsl[2]);

  return rgbToHex(lighterRgb[0], lighterRgb[1], lighterRgb[2]);
};

// 辅助函数：从十六进制颜色生成更深的颜色（用于文字）
const getDarkerColorFromHex = (hexColor) => {
  // 移除可能的#前缀
  let hex = hexColor.replace('#', '');

  // 将3位颜色转为6位
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 将颜色转换为HSL
  const hsl = rgbToHsl(r, g, b);

  // 调低亮度和提高饱和度制作深色文字
  const darkerHsl = [
    hsl[0],           // 保持色相不变
    Math.min(1, hsl[1] * 1.2),  // 增加饱和度
    Math.max(0.1, hsl[2] * 0.6)   // 降低亮度
  ];

  // 转回RGB然后再转为HEX
  const darkerRgb = hslToRgb(darkerHsl[0], darkerHsl[1], darkerHsl[2]);

  return rgbToHex(darkerRgb[0], darkerRgb[1], darkerRgb[2]);
};

// 辅助函数：从十六进制颜色生成中等深度的边框颜色
const getMediumColorFromHex = (hexColor :any) => {
  // 移除可能的#前缀
  let hex = hexColor.replace('#', '');

  // 将3位颜色转为6位
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 将颜色转换为HSL
  const hsl = rgbToHsl(r, g, b);

  // 调整亮度和饱和度制作边框颜色
  const mediumHsl = [
    hsl[0],           // 保持色相不变
    Math.min(hsl[1] * 0.85, 0.5),  // 稍微降低饱和度
    Math.min(0.85, hsl[2] * 1.1)    // 稍微提高亮度
  ];

  // 转回RGB然后再转为HEX
  const mediumRgb = hslToRgb(mediumHsl[0], mediumHsl[1], mediumHsl[2]);

  return rgbToHex(mediumRgb[0], mediumRgb[1], mediumRgb[2]);
};

// 辅助函数：将十六进制转换为RGB对象
const hexToRgb = (hex :any) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// 辅助函数：RGB转HSL
const rgbToHsl = (r :any, g :any, b :any) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h, s, l];
};

// 辅助函数：HSL转RGB
const hslToRgb = (h :any, s :any, l :any) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// 辅助函数：RGB转HEX
const rgbToHex = (r :any, g:any, b:any) => {
  const toHex = (c:any) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// 分享图片
const shareImage = () => {
  emit('share', props.image);
};

// 处理图片下载
const downloadImage = () => {
  emit('download', props.image);
};

// 添加关闭预览的方法
const closeLightbox = () => {
  // 使用过渡动画，先不立即设置为false
  document.body.style.overflow = '';

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown);

  // 重置状态
  resetZoom();
  showDetailPanel.value = false;

  // 关闭弹框
  showLightbox.value = false;
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

const toggleLike = async () => {
  if (!props.image.id || likeLoading.value) return;

  try {
    likeLoading.value = true;
    await userReactionStore.toggleLike(props.image.id);
    // 只发送事件，不要添加额外的消息处理
    emit('like', props.image);
  } catch (error) {
    console.error('toggleLike 发生错误:', error);
    // 错误已在store内处理，这里不再显示额外消息
  } finally {
    likeLoading.value = false;
  }
};

// 切换收藏状态
const toggleBookmark = async () => {
  if (!props.image.id || favoriteLoading.value) return;

  try {
    favoriteLoading.value = true;
    await userReactionStore.toggleFavorite(props.image.id);
    // 只发送事件，不要添加额外的消息处理
    emit('bookmark', props.image);
  } catch (error) {
    console.error('toggleBookmark 发生错误:', error);
    // 错误已在store内处理，这里不再显示额外消息
  } finally {
    favoriteLoading.value = false;
  }
};

// 监听点赞状态的变化，及时更新UI
watch(
    () => userReactionStore.isLiked(props.image.id),
    (newValue) => {
      if (props.image) {
        props.image.liked = newValue;
      }
    },
    {immediate: true} // 确保初始化时也执行一次
);

// 监听收藏状态的变化，及时更新UI
watch(
    () => userReactionStore.isFavorited(props.image.id),
    (newValue) => {
      if (props.image) {
        props.image.bookmarked = newValue;
      }
    },
    {immediate: true} // 确保初始化时也执行一次
);

// 组件挂载时加载反应状态和计数
onMounted(async () => {
  if (props.image?.id) {
    await loadImageReactions();
  }
});

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousemove', handlePan);
  document.removeEventListener('mouseup', endPan);
  document.body.style.overflow = '';
});

</script>

<style scoped>
/* 图片卡片整体样式保持不变 */
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

/* 强制所有图标对齐 - 提高选择器优先级 */
:deep(.anticon),
:deep(.icon-font),
:deep(.icon-custom) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 0 !important; /* 关键：设置为0消除行高影响 */
  vertical-align: middle !important;
  position: relative !important; /* 建立新的定位上下文 */
}

/* 按钮专用样式 */
.action-btn {
  height: 36px !important;
  width: 36px !important;
  background-color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
  line-height: 0 !important; /* 修改为0 */
  transition: all 0.3s ease;
  overflow: hidden !important;
  position: relative !important; /* 建立新的定位上下文 */
}

/* 深度选择按钮内部的span元素 */
.action-btn :deep(> span) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  position: absolute !important; /* 绝对定位来确保居中 */
  top: 0 !important;
  left: 0 !important;
  margin: 0 !important;
}

/* 处理所有嵌套的图标元素 */
.action-btn :deep(.anticon),
.action-btn :deep(.icon-custom),
.action-btn :deep(svg),
.action-btn :deep(i) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 16px !important; /* 固定大小 */
  height: 16px !important; /* 固定大小 */
  font-size: 16px !important;
  position: absolute !important; /* 绝对定位来确保居中 */
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important; /* 精确居中 */
  margin: 0 !important;
  padding: 0 !important;
}


/* 不同按钮悬停效果 */
.view-btn:hover {
  background-color: #6554C0 !important;
}

.download-btn:hover {
  background-color: #10B981 !important;
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

/* 分类和标签区域 - 优化设计 */
.image-taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

/* 分类标签样式 - 更加突出和醒目 */
.image-category {
  font-size: 12px;
  padding: 3px 12px !important;
  border-radius: 20px !important; /* 圆角更大 */
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin: 0 !important;
  height: auto !important;
  line-height: 1.6 !important;
  position: relative;
  text-transform: uppercase; /* 全大写增强识别度 */
  border: none !important;
}

.image-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 添加一个小图标指示这是分类 */
.image-category::before {
  content: '•';
  margin-right: 4px;
  font-weight: bold;
}

/* 标签样式 - 更轻量和次要 */
.image-tag {
  font-size: 12px;
  padding: 2px 8px !important;
  border-radius: 4px !important; /* 保持方正的外观 */
  font-weight: 400 !important;
  transition: all 0.2s ease;
  margin: 0 !important;
  height: auto !important;
  line-height: 1.5 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0px;
}

.image-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 更多标签指示 - 更加轻量 */
.image-more-tag {
  font-size: 11px;
  padding: 1px 6px !important;
  border-radius: 4px;
  background-color: rgba(245, 245, 245, 0.7) !important;
  color: #888 !important;
  border: 1px dashed #ddd !important;
  margin: 0 !important;
  height: auto !important;
  line-height: 1.6 !important;
  box-shadow: none;
}

/* 交互区域 */
.image-interaction {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 6px; /* 可以稍微减小顶部内边距 */
  padding-bottom: 6px; /* 添加底部内边距使布局更平衡 */
  border-top: 1px solid #f5f5f5;
}

.interaction-stat,
.interaction-share {
  display: flex;
  align-items: center;
  gap: 1px;
  color: #666;
  font-size: 12px;
  padding: 0 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 修改底部点赞按钮激活颜色 */
.interaction-stat.active {
  color: #F43F5E; /* 保持文字为粉红色 */
  background-color: transparent !important; /* 确保没有背景色 */
}

/* 基础样式：确保默认和非focus状态下为白色背景 */
.like-btn {
  background-color: white !important;
  border-color: white !important;
}

/* 确保点赞状态下为白色背景，图标为红色 */
.like-btn.liked {
  background-color: white !important;
  border-color: white !important;
}

.like-btn.liked :deep(.anticon),
.like-btn.liked :deep(.icon-custom) {
  color: #F43F5E !important; /* 红色图标 */
}

/* 关键：处理focus和active状态 */
.like-btn:focus,
.like-btn:active,
.like-btn:hover {
  background-color: white !important;
  border-color: white !important;
}

/* 处理点赞后的hover状态 */
.like-btn.liked:hover {
  background-color: white !important;
  border-color: white !important;
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

/* 全新预览弹框样式 */
.premium-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  cursor: pointer;
  will-change: opacity;
  transform: translateZ(0);
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 上下滑动过渡 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

/* 预览弹框内容容器 */
.premium-lightbox-container {
  width: 92%;
  height: 90%;
  max-width: 1600px;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  cursor: default;
  animation: scale-in 0.3s ease;
  transform: translateZ(0);
}

@keyframes scale-in {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 预加载图片 - 设为隐藏以避免闪烁 */
.preload-image {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* 顶部区域 */
.premium-lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-bottom: 1px solid #eaeaea;
}

.header-info .image-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.image-categories {
  display: flex;
  gap: 8px;
}

.category-tag {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-group {
  display: flex;
  gap: 16px;
}

/* 头部操作按钮颜色 */
.header-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #555;
  background-color: #f0f0f0;
  transition: all 0.2s ease;
  position: relative;
}

.header-action-btn:hover {
  color: #111;
  background-color: #e0e0e0;
}

.header-action-btn.active {
  color: #F43F5E;
  background-color: rgba(244, 63, 94, 0.1);
}

.favorite-btn.active {
  color: #FAAD14;
  background-color: rgba(250, 173, 20, 0.1);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05); /* 调整悬停背景 */
  color: #333;
}

/* 图片查看区域 */
.premium-lightbox-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  cursor: grab;
  transform-origin: center center;
  will-change: transform;
}

.preview-image.zoomed {
  cursor: grabbing;
}

/* 缩放提示 */
.zoom-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(240, 240, 240, 0.9);
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fade-in-out 2s ease;
  pointer-events: none;
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

/* 缩放控制 */
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(240, 240, 240, 0.9);
  border-radius: 30px;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.zoom-level {
  padding: 0 10px;
  color: #333;
  font-size: 13px;
  min-width: 54px;
  text-align: center;
}

/* 导航按钮 */
.nav-button {
  position: absolute;
  width: 48px;
  height: 48px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(240, 240, 240, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  z-index: 10;
  transition: all 0.2s ease;
  font-size: 24px;
}

.nav-button:hover {
  background-color: rgba(220, 220, 220, 0.9);
}

.prev-button {
  left: 20px;
}

.next-button {
  right: 20px;
}

/* 底部信息栏 */
.premium-lightbox-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: rgba(240, 240, 240, 0.8); /* 从暗色改为浅灰色 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid #eaeaea; /* 添加浅色边框 */
  z-index: 10;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.image-date {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.stat-item.active {
  color: #F43F5E;
}

.info-toggle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  background-color: #ffffff; /* 改为纯白色背景 */
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); /* 加深阴影 */
  z-index: 100; /* 确保它在最顶层，数值高于所有其他元素 */
  border: 1px solid #eaeaea;
}

.info-toggle:hover {
  background-color: #f0f0f0;
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* 详情面板 */
.detail-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid #eaeaea;
  padding: 24px 0 80px 0;
  z-index: 20;
  max-height: 50%;
  overflow-y: auto;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.item-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  margin: 0;
}

.image-description {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.75);
  margin: 0;
  white-space: pre-line;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .premium-lightbox-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .detail-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .premium-lightbox-header,
  .premium-lightbox-footer {
    padding: 12px 16px;
  }

  .header-info .image-title {
    font-size: 16px;
  }

  .action-group {
    gap: 12px;
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }
}

/* 移动端优化 */
@media (max-width: 576px) {
  .header-actions {
    gap: 12px;
  }

  .header-action-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .stats-section {
    gap: 12px;
  }

  .author-section {
    gap: 8px;
  }

  .premium-lightbox-footer {
    flex-wrap: wrap;
    gap: 12px;
  }

  .info-toggle {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .image-card {
    background: #222;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .image-title {
    color: #eee;
  }

  .author-name {
    color: #bbb;
  }

  .image-date,
  .interaction-stat,
  .interaction-share {
    color: #999;
  }

  .image-interaction {
    border-top: 1px solid #333;
  }
}

/* 优化删除按钮样式 */
.delete-btn {
  background-color: white !important;
  color: #666 !important;
}

.delete-btn:hover {
  background-color: #ff4d4f !important;
  color: white !important;
}

.delete-btn:hover :deep(.anticon) {
  color: white !important;
}

/* 修复可能的图标对齐问题 */
:deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>