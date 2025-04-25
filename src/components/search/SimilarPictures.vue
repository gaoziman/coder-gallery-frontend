<template>
  <div class="similar-pictures-page">
    <div class="page-header">
      <a-button class="back-button" @click="goBack">
        <template #icon>
          <IconFont type="icon-shangyizhang11" />
        </template>
        返回
      </a-button>
      <h1 class="page-title">与"{{ originalName }}"相似的图片</h1>
    </div>

    <div class="filter-bar">
      <a-card class="filter-card">
        <a-form layout="inline" :model="filterForm">
          <a-form-item label="相似度匹配类型">
            <a-select v-model:value="filterForm.matchType" style="width: 180px" @change="handleFilterChange">
              <a-select-option :value="1">视觉内容相似</a-select-option>
              <a-select-option :value="2">标签相似</a-select-option>
              <a-select-option :value="3">综合相似</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="包含相同用户的图片">
            <a-switch v-model:checked="filterForm.includeSameUser" @change="handleFilterChange" />
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin tip="正在加载相似图片..." />
    </div>

    <!-- 无数据状态 -->
    <a-empty v-else-if="pictures.length === 0" description="未找到相似图片" />

    <!-- 图片网格列表 -->
    <div v-else class="pictures-grid-container">
      <div class="pictures-grid">
        <div
            v-for="picture in pictures"
            :key="picture.id"
            class="picture-item"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 300 } }"
        >
          <div class="image-card">
            <!-- 左侧图片区域 -->
            <div class="image-cover-container" @click="goToPictureDetail(picture.id)">
              <img
                  :src="picture.thumbnailUrl || picture.url"
                  :alt="picture.name"
                  class="gallery-image loaded"
                  @error="handleImageError($event, picture)"
              />

              <!-- 悬停时显示的信息遮罩层 -->
              <div class="image-hover-overlay">
                <div class="image-meta-info">
                  <div class="meta-item">
                    <IconFont type="icon-shijiankaishishijian"/>
                    <span>{{ formatDate(picture.createTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <IconFont type="icon-liulanliang"/>
                    <span>{{ formatNumber(picture.viewCount) }} 浏览</span>
                  </div>
                </div>

                <div class="image-actions">
                  <a-button type="primary" shape="circle" class="action-btn download-btn" @click.stop="downloadImage(picture)">
                    <template #icon>
                      <IconFont type="icon-download2" class="icon-custom"/>
                    </template>
                  </a-button>
                  <!-- 点赞按钮 -->
                  <a-button
                      type="primary"
                      shape="circle"
                      :class="{ 'action-btn': true, 'like-btn': true, 'liked': userReactionStore.isLiked(picture.id) }"
                      :loading="likeLoadingMap[picture.id]"
                      @click.stop="toggleLike(picture)"
                  >
                    <template #icon>
                      <IconFont type="icon-xihuan4" class="icon-custom" v-if="userReactionStore.isLiked(picture.id)"/>
                      <IconFont type="icon-xihuan2" class="icon-custom" v-else/>
                    </template>
                  </a-button>
                </div>
              </div>

              <!-- 相似度标签 -->
              <div v-if="picture.similarity" class="similarity-badge">
                <IconFont type="icon-fenshuai" />
                <span>{{ (picture.similarity * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <!-- 右侧信息区域 -->
            <div class="image-info">
              <!-- 标题和收藏按钮并排 -->
              <div class="image-header">
                <div class="image-title" @click="goToPictureDetail(picture.id)">{{ picture.name }}</div>
                <!-- 收藏按钮状态 -->
                <div class="bookmark-btn" @click.stop="toggleBookmark(picture)">
                  <IconFont type="icon-wodeshoucang" v-if="!userReactionStore.isFavorited(picture.id)"/>
                  <IconFont type="icon-a-shoucang-yishoucang" v-else/>
                </div>
              </div>

              <!-- 作者信息和时间 -->
              <div class="image-author-row">
                <div class="image-author" v-if="picture.user">
                  <a-avatar :src="picture.user.avatar" :size="24"/>
                  <span class="author-name">{{ picture.user.username }}</span>
                </div>
                <div class="image-date">
                  <IconFont type="icon-shijianfenlei"/>
                  <span>{{ formatShortDate(picture.createTime) }}</span>
                </div>
              </div>

              <!-- 分类和标签区域 -->
              <div class="image-taxonomy">
                <!-- 单个分类标签 - 使用渐变色背景 -->
                <a-tag
                    v-if="picture.category"
                    class="image-category"
                    :style="{
                    color: getCategoryStyle(picture.category).color,
                    background: getCategoryStyle(picture.category).background,
                    borderColor: 'transparent'
                  }"
                >
                  {{ picture.category }}
                </a-tag>

                <!-- 标签 - 使用后端返回的颜色 -->
                <a-tag
                    v-for="(tag, tagIndex) in (picture.tags || []).slice(0, 3)"
                    :key="tagIndex"
                    class="image-tag"
                    :style="getTagStyleFromBackend(tag)"
                >
                  {{ typeof tag === 'string' ? tag : tag.name }}
                </a-tag>

                <!-- 如果标签过多，显示还有更多 -->
                <a-tag v-if="picture.tags && picture.tags.length > 3" class="image-more-tag">
                  +{{ picture.tags.length - 3 }}
                </a-tag>
              </div>

              <!-- 图片底部的互动区域 -->
              <div class="image-interaction">
                <div class="interaction-stat">
                  <IconFont type="icon-chakan2"/>
                  <span>{{ formatNumber(userReactionStore.getPictureViewCount(picture.id)) }}</span>
                </div>
                <div class="interaction-stat"
                     :class="{ 'active': userReactionStore.isLiked(picture.id) }"
                     @click.stop="toggleLike(picture)">
                  <IconFont type="icon-xihuan2" class="icon-custom" v-if="!userReactionStore.isLiked(picture.id)"/>
                  <IconFont type="icon-xihuan4" class="icon-custom" v-else/>
                  <span>{{ formatNumber(userReactionStore.getPictureLikeCount(picture.id)) }}</span>
                </div>
                <div class="interaction-stat">
                  <IconFont type="icon-pinglun2"/>
                  <span>{{ formatNumber(picture.commentCount || Math.floor((picture.viewCount || 0) * 0.1)) }}</span>
                </div>
                <div class="interaction-share" @click.stop="shareImage(picture)">
                  <IconFont type="icon-fenxiang5"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <a-pagination
          v-model:current="pagination.current"
          :total="total"
          :pageSize="pagination.pageSize"
          showSizeChanger
          showQuickJumper
          :pageSizeOptions="['12', '24', '36', '48']"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { findSimilarPicturesUsingPost } from '@/api/tupianxiangguanjiekou';
import { useUserReactionStore } from '@/stores/userReaction';
import { useUserStore } from "@/stores/user";
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userReactionStore = useUserReactionStore();
const userStore = useUserStore();

// 原始图片ID和名称
const pictureId = ref(route.params.id as string);
const originalName = ref(route.query.originalName as string || '原图片');

// 状态变量
const loading = ref(false);
const pictures = ref<any[]>([]);
const total = ref(0);
const likeLoadingMap = reactive({});
const favoriteLoadingMap = reactive({});

// 筛选表单
const filterForm = reactive({
  matchType: 1,
  includeSameUser: true
});

// 分页设置
const pagination = reactive({
  current: 1,
  pageSize: 6
});

// 分类颜色映射表
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
  '编程学习': {
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
const getCategoryStyle = (category) => {
  const style = categoryColors[category] || categoryColors['全部'];
  return {
    color: style.color,
    background: style.background
  };
};

// 获取标签样式
const getTagStyleFromBackend = (tag) => {
  // 如果标签对象有color属性并且是合法的颜色值
  if (tag && tag.color && typeof tag.color === 'string') {
    // 判断是否是有效的颜色值
    const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(tag.color);

    if (isValidColor) {
      // 从颜色值生成相应的浅色背景和边框颜色
      const color = tag.color;
      const lighterBg = getLightColorFromHex(color);
      const borderColor = getMediumColorFromHex(color);
      const textColor = getContrastTextColor(color);

      return {
        backgroundColor: lighterBg,
        color: textColor,
        borderColor: borderColor,
        fontWeight: '400',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        padding: '2px 8px',
        borderRadius: '4px',
      };
    }
  }

  // 如果是字符串标签，使用默认样式
  return {
    backgroundColor: '#f0f5ff',
    color: '#2f54eb',
    borderColor: '#d6e4ff',
    fontWeight: '400',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    borderRadius: '4px'
  };
};

// 获取对比度更好的文字颜色
const getContrastTextColor = (hexColor) => {
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
    const darkerColor = getDarkerColorFromHex(hexColor);

    // 确保足够深以提供良好对比度
    const darkerRgb = hexToRgb(darkerColor);
    if (!darkerRgb) return '#333333';

    const darkerBrightness = (darkerRgb.r * 299 + darkerRgb.g * 587 + darkerRgb.b * 114) / 1000;

    // 如果深色变体仍然不够深，使用标准深色
    return darkerBrightness > 100 ? '#333333' : darkerColor;
  }
};

// 辅助函数：从十六进制颜色生成浅色背景
const getLightColorFromHex = (hexColor) => {
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
const getMediumColorFromHex = (hexColor) => {
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
    Math.min(hsl[1] * 0.85, 0.5),
    Math.min(0.85, hsl[2] * 1.1)
  ];

  // 转回RGB然后再转为HEX
  const mediumRgb = hslToRgb(mediumHsl[0], mediumHsl[1], mediumHsl[2]);

  return rgbToHex(mediumRgb[0], mediumRgb[1], mediumRgb[2]);
};

// 辅助函数：将十六进制转换为RGB对象
const hexToRgb = (hex) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// 辅助函数：RGB转HSL
const rgbToHsl = (r, g, b) => {
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
      default: h = 0;
    }

    h /= 6;
  }

  return [h, s, l];
};

// 辅助函数：HSL转RGB
const hslToRgb = (h, s, l) => {
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
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// 格式化数字
const formatNumber = (num) => {
  if (!num && num !== 0) return 0;
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间';
  return dayjs(timestamp).format('YYYY-MM-DD');
};

// 格式化短日期（仅显示月和日）
const formatShortDate = (timestamp) => {
  if (!timestamp) return '未知';
  return dayjs(timestamp).format('MM-DD');
};

// 图片加载错误处理
const handleImageError = (event, picture) => {
  console.error(`图片加载失败: ${picture.url}`);
  // 设置替代图片
  event.target.src = 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg';
};

// 点赞操作
const toggleLike = async (picture) => {
  if (!picture.id || likeLoadingMap[picture.id]) return;

  try {
    likeLoadingMap[picture.id] = true;
    await userReactionStore.toggleLike(picture.id);
  } catch (error) {
    console.error('点赞操作失败', error);
    message.error('操作失败，请稍后重试');
  } finally {
    likeLoadingMap[picture.id] = false;
  }
};

// 收藏操作
const toggleBookmark = async (picture) => {
  if (!picture.id || favoriteLoadingMap[picture.id]) return;

  try {
    favoriteLoadingMap[picture.id] = true;
    await userReactionStore.toggleFavorite(picture.id);
  } catch (error) {
    console.error('收藏操作失败', error);
    message.error('操作失败，请稍后重试');
  } finally {
    favoriteLoadingMap[picture.id] = false;
  }
};

// 分享图片
const shareImage = (picture) => {
  const url = window.location.origin + router.resolve({
    name: 'PictureDetail',
    params: { id: picture.id }
  }).href;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  } else {
    message.error('您的浏览器不支持自动复制，请手动复制链接');
  }
};

// 下载图片
const downloadImage = (picture) => {
  if (!picture.url) {
    message.error('图片链接不存在');
    return;
  }

  message.success('开始下载图片...');
  const a = document.createElement('a');
  a.href = picture.url;
  a.download = picture.name || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 增加下载统计
  setTimeout(() => {
    message.success('下载成功!');
  }, 1000);
};

// 判断是否是图片所有者
const isOwner = (picture) => {
  if (userStore.userInfo && picture.user) {
    return userStore.userInfo.id === picture.user.id.toString();
  }
  return false;
};

// 获取相似图片
const fetchSimilarPictures = async () => {
  if (!pictureId.value) {
    message.error('未找到原图片ID');
    return;
  }

  loading.value = true;
  try {
    const response = await findSimilarPicturesUsingPost({
      pictureId: parseInt(pictureId.value),
      includeSameUser: filterForm.includeSameUser,
      matchType: filterForm.matchType,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    });

    if (response && response.data && response.data.data) {
      const data = response.data.data;
      pictures.value = data.records || data.list || [];
      total.value = data.total || 0;

      // 更新分页信息
      pagination.current = data.pageNum || 1;

      // 加载每张图片的反应状态
      if (pictures.value.length > 0) {
        for (const picture of pictures.value) {
          if (picture.id) {
            await userReactionStore.getStatus(picture.id);
            await userReactionStore.getCounts(picture.id);
          }
        }
      }
    } else {
      message.error('获取相似图片失败');
      pictures.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取相似图片出错:', error);
    message.error('获取相似图片出错');
    pictures.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理筛选条件改变
const handleFilterChange = () => {
  pagination.current = 1; // 重置到第一页
  fetchSimilarPictures();
};

// 处理页码变化
const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchSimilarPictures();
};

// 处理每页数量变化
const handlePageSizeChange = (current, size) => {
  pagination.current = 1; // 重置到第一页
  pagination.pageSize = size;
  fetchSimilarPictures();
};

// 跳转到图片详情
const goToPictureDetail = (id) => {
  router.push({
    name: 'PictureDetail',
    params: { id }
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 组件挂载和路由参数变化时获取数据
onMounted(async () => {
  // 初始化userReactionStore
  await userReactionStore.initialize();

  // 获取相似图片
  fetchSimilarPictures();
});

watch(() => route.params.id, (newId) => {
  if (newId) {
    pictureId.value = newId as string;
    originalName.value = route.query.originalName as string || '原图片';
    pagination.current = 1; // 重置到第一页
    fetchSimilarPictures();
  }
});
</script>

<style scoped>
.similar-pictures-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.back-button {
  margin-right: 16px;
  border-radius: 8px;
  height: 36px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.filter-bar {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 网格布局容器 */
.pictures-grid-container {
  width: 100%;
  margin-bottom: 32px;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
}

.picture-item {
  transition: all 0.3s ease;
  width: 100%;
}

.picture-item:hover {
  transform: translateY(-5px);
}

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
  display: flex;
  border: 1px solid rgba(234, 236, 240, 0.6);
}

.image-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 图片容器 - 固定尺寸 */
.image-cover-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
  width: 280px;
  height: 200px;
  background-color: #f5f5f5;
  flex-shrink: 0;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.3s ease;
  opacity: 1;
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

/* 相似度标签 */
.similarity-badge {
  position: absolute;
  top: 10px;
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
  line-height: 0 !important;
  vertical-align: middle !important;
  position: relative !important;
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
  line-height: 0 !important;
  transition: all 0.3s ease;
  overflow: hidden !important;
  position: relative !important;
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
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 不同按钮悬停效果 */
.download-btn:hover {
  background-color: white !important;
}

.action-btn:hover :deep(.anticon) {
  color: white !important;
}

/* 图片信息区域布局优化 */
.image-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; /* 关键：允许内容缩小而非溢出 */
}

/* 标题和收藏按钮 */
.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.image-title {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #1f2937;
  transition: color 0.2s ease;
}

.image-title:hover {
  color: #6554C0;
}

.bookmark-btn {
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  margin-bottom: 12px;
}

.image-author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* 允许内容缩小 */
}

.author-name {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.image-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

/* 分类和标签区域 - 优化设计 */
.image-taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
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
  padding-top: 12px; /* 可以稍微减小顶部内边距 */
  padding-bottom: 6px; /* 添加底部内边距使布局更平衡 */
  border-top: 1px solid #f5f5f5;
}

.interaction-stat,
.interaction-share {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
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

.pagination-container {
  margin-top: 32px;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .pictures-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .image-cover-container {
    width: 180px;
  }
}

@media (max-width: 992px) {
  .pictures-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .image-cover-container {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .image-card {
    flex-direction: column;
  }

  .image-cover-container {
    width: 100%;
    height: 200px;
    border-radius: 12px 12px 0 0;
  }

  .image-info {
    padding: 12px;
  }

  .similar-pictures-page {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .filter-bar .ant-form-item {
    margin-bottom: 8px;
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
</style>