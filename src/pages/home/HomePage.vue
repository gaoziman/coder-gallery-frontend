<!-- pages/home/HomePage.vue -->
<template>
  <div class="home-page">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-wrapper">
        <a-input-search
            v-model:value="searchText"
            placeholder="搜索图片、标签、作者..."
            class="search-input"
            @search="onSearch"
            enter-button
        >
        </a-input-search>
      </div>
    </div>

    <!-- 分类和筛选器 -->
    <a-card class="filter-card" :bordered="false">
      <!-- 排序和筛选器 -->
      <div class="filter-header">
        <div class="filter-actions">
          <a-button type="primary"
                    @click="showCreateFilterModal"
                    @mousedown="addRippleEffect">
            <template #icon>
              <plus-outlined/>
            </template>
            创建筛选器
          </a-button>

          <!-- 添加我的筛选器下拉菜单 -->
          <filter-list
              :filters="filterStore.savedFilters"
              @select="handleApplyFilter"
              @delete="handleDeleteFilter"
              @create="showCreateFilterModal"
          />
        </div>

        <a-dropdown :trigger="['click']">
          <a-button>
            筛选排序：{{ getSortLabel(filterStore.currentSort) }}
            <down-outlined/>
          </a-button>
          <template #overlay>
            <a-menu @click="handleSortMenuClick">
              <a-menu-item key="newest">最新发布</a-menu-item>
              <a-menu-item key="popular">最受欢迎</a-menu-item>
              <a-menu-item key="look">最多浏览</a-menu-item>
              <a-menu-item key="oldest">最多收藏</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <!-- 显示活动筛选器 -->
      <div v-if="filterStore.activeFilter" class="active-filter">
        <a-alert type="info" show-icon>
          <template #message>
            <div class="active-filter-info">
              <span>当前筛选器: <b>{{ filterStore.activeFilter.name }}</b></span>
              <a-button type="link" size="small" @click="handleClearFilter">
                清除筛选
              </a-button>
            </div>
          </template>
        </a-alert>
      </div>

      <!-- 分类导航 -->
      <div class="category-section">
        <div class="section-title">
          <h3>分类浏览</h3>
        </div>

        <div class="category-tags">
          <a-tag
              v-for="(category, index) in filterStore.categories"
              :key="index"
              :class="{
                  'category-tag': true,
                  'category-tag-active': category.active,
                  'category-filter-applied': filterStore.activeFilter && filterStore.activeFilter.categories.includes(category.name)
                }"
              @click="toggleCategoryActive(index)"
          >
            {{ category.name }}
          </a-tag>
        </div>
      </div>

      <!-- 标签选择器 -->
      <div class="tag-section">
        <div class="section-title">
          <h3>热门标签</h3>
        </div>

        <div class="tag-list">
          <a-tag
              v-for="(tag, index) in filterStore.tags"
              :key="index"
              :class="{
                  'custom-tag': true,
                  'tag-hot': tag.hot || tag.name === '热门',
                  'tag-filter-applied': filterStore.activeFilter && filterStore.activeFilter.tags.includes(tag.name)
                }"
              @click="toggleTagActive(index)"
          >
            {{ tag.name }}
            <span v-if="tag.count" class="tag-count">{{ tag.count }}</span>
          </a-tag>
        </div>
      </div>
    </a-card>

    <!-- 瀑布流图片展示 -->
    <div class="masonry-gallery">
      <template v-if="galleryImages.length > 0">
        <div
            v-for="(image, index) in galleryImages"
            :key="index"
            class="masonry-item"
        >
          <div class="image-card" @click="navigateToDetail(image)">
            <div class="image-cover-container" :style="{ aspectRatio: image.aspectRatio || '16/9' }">
              <!-- 图片 -->
              <img
                  :src="image.src"
                  :alt="image.title"
                  class="gallery-image loaded"
                  @error="handleImageError($event, image)"
              />

              <!-- 图片右上角的统计信息 -->
              <div class="image-stats-overlay">
                <div class="stat-badge views-badge">
                  <eye-outlined />
                  <span>{{ formatNumber(image.views) }}</span>
                </div>
                <div class="stat-badge likes-badge" :class="{ 'liked': image.liked }">
                  <heart-filled v-if="image.liked" />
                  <heart-outlined v-else />
                  <span>{{ formatNumber(image.likes || Math.floor(image.views * 0.4)) }}</span>
                </div>
              </div>

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
                  <a-button type="primary" shape="circle" class="action-btn view-btn" @click.stop="viewImage(image)">
                    <template #icon><eye-outlined /></template>
                  </a-button>
                  <a-button type="primary" shape="circle" class="action-btn download-btn" @click.stop="downloadImage(image)">
                    <template #icon><download-outlined /></template>
                  </a-button>
                  <a-button
                      v-if="isOwner(image)"
                      type="primary"
                      shape="circle"
                      class="action-btn delete-btn"
                      @click.stop="confirmDelete(image)">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                  <a-button
                      v-else
                      type="primary"
                      shape="circle"
                      :class="{ 'action-btn': true, 'like-btn': true, 'liked': image.liked }"
                      @click.stop="toggleLike(image)">
                    <template #icon>
                      <heart-filled v-if="image.liked"/>
                      <heart-outlined v-else/>
                    </template>
                  </a-button>
                </div>
              </div>

              <!-- 图片右下角的热门标签 -->
              <div v-if="isPopular(image)" class="hot-badge">
                <fire-outlined />
                <span>热门</span>
              </div>
            </div>

            <div class="image-info">
              <!-- 标题和收藏按钮并排 -->
              <div class="image-header">
                <div class="image-title">{{ image.title }}</div>
                <div class="bookmark-btn" @click.stop="toggleBookmark(image)">
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
                <div class="interaction-stat" :class="{ 'active': image.liked }" @click.stop="toggleLike(image)">
                  <heart-outlined v-if="!image.liked" />
                  <heart-filled v-else />
                  <span>{{ formatNumber(image.likes || Math.floor(image.views * 0.4)) }}</span>
                </div>
                <div class="interaction-stat">
                  <message-outlined />
                  <span>{{ formatNumber(image.comments || Math.floor(image.views * 0.1)) }}</span>
                </div>
                <div class="interaction-share" @click.stop="shareImage(image)">
                  <share-alt-outlined />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-gallery">
        <a-empty description="加载中...">
          <template #extra>
            <a-button type="primary" @click="handleClearFilter">重新加载</a-button>
          </template>
        </a-empty>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more">
      <a-button type="primary" @click="loadMore">
        加载更多
        <template #icon>
          <down-outlined/>
        </template>
      </a-button>
    </div>

    <!-- 创建筛选器弹窗 -->
    <create-filter-modal
        v-model:visible="filterModalVisible"
        :categories="categories"
        :tags="tags"
        @save="saveFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import {
  PlusOutlined,
  DownOutlined,
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
  LinkOutlined,
  WechatOutlined,
  WeiboOutlined,
  QqOutlined
} from '@ant-design/icons-vue';
import CreateFilterModal from "@/pages/home/CreateFilterModal.vue";
import FilterList from "@/pages/home/FilterList.vue";
import { useFilterStore } from '@/stores/filterStore';
import 'animate.css';
import { message, Modal } from "ant-design-vue";
import router from "@/router";
import dayjs from 'dayjs';

// 搜索文本
const searchText = ref('');
const onSearch = (value: string) => {
  console.log('搜索：', value);
};

// 使用筛选器Store
const filterStore = useFilterStore();

// 获取排序标签
const getSortLabel = (sortKey: string) => {
  const sortLabels = {
    'newest': '最新发布',
    'popular': '最受欢迎',
    'look': '最多浏览',
    'oldest': '最多收藏'
  };
  return sortLabels[sortKey] || '最新发布';
};

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

// 判断图片是否为热门
const isPopular = (image) => {
  // 根据浏览量或其他指标判断是否热门
  return (image.views > 3000 || (image.likes && image.likes > 500));
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

// 排序方式
const handleSortMenuClick = (e: any) => {
  filterStore.setSort(e.key);
  fetchGalleryImages();
};

// 分类数据
const categories = reactive([
  {name: '全部', active: true},
  {name: '个人', active: false},
  {name: '星球', active: false},
  {name: '面试题', active: false},
  {name: '表情包', active: false},
  {name: '素材', active: false},
  {name: '学习', active: false},
  {name: 'Bugs', active: false},
  {name: '海报', active: false},
  {name: '壁纸', active: false},
  {name: '动漫', active: false},
]);

// 导航到图片详情页
const navigateToDetail = (image: any) => {
  // 假设image对象有id属性，如果没有可以使用其他唯一标识
  const imageId = image.id || '';
  router.push({
    name: 'PictureDetail',
    params: {id: imageId},
    // 可以通过state传递一些数据，避免重新加载
    state: {imageData: image}
  });
};

// 处理图片浏览
const viewImage = (image: any) => {
  // 这里可以更新浏览计数
  if (typeof image.views === 'number') {
    image.views += 1;
  } else {
    image.views = 1;
  }
  // 导航到详情页
  navigateToDetail(image);
};

// 处理图片下载
const downloadImage = (image: any) => {
  message.success('图片下载中...');
  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = image.src;
  a.download = image.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 检查是否是图片所有者
const isOwner = (image: any) => {
  // 这里需要根据实际登录用户ID和图片作者ID比较
  // 示例中简单返回false，表示当前用户不是所有图片的所有者
  return false;
};

// 确认删除图片
const confirmDelete = (image: any) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后将无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 删除逻辑
      message.success('图片已删除');
      // 实际应用中应调用API删除图片，并从列表移除
    }
  });
};

// 点赞或取消点赞
const toggleLike = (image: any) => {
  image.liked = !image.liked;
  if (image.liked) {
    image.likes = (image.likes || 0) + 1;
  } else if (image.likes > 0) {
    image.likes -= 1;
  }
  message.success(image.liked ? '已添加到喜欢' : '已取消喜欢');
};

// 新增切换收藏状态的函数
const toggleBookmark = (image) => {
  // 如果图片上没有bookmarked属性，先初始化为false
  if (typeof image.bookmarked === 'undefined') {
    image.bookmarked = false;
  }

  // 切换收藏状态
  image.bookmarked = !image.bookmarked;
  message.success(image.bookmarked ? '已收藏' : '已取消收藏');
};

// 分享图片
const shareImage = (image) => {
  // 创建分享选项
  Modal.info({
    title: '分享图片',
    content: (h) => h('div', [
      h('p', `分享"${image.title}"到:`),
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
};



// 处理应用筛选器
const handleApplyFilter = (filter) => {
  const result = filterStore.applyFilter(filter);
  if (result.success) {
    message.info(result.message);
    fetchGalleryImages();

    // 添加滚动到图片区域的代码
    setTimeout(() => {
      const galleryEl = document.querySelector('.masonry-gallery');
      if (galleryEl) {
        galleryEl.scrollIntoView({behavior: 'smooth'});
      }
    }, 300);
  }
};

// 切换分类选中状态
const toggleCategoryActive = (index: number) => {
  filterStore.toggleCategoryActive(index);
  fetchGalleryImages();
};

// 标签数据
const tags = reactive([
  {name: '热门', hot: true, count: '120+'},
  {name: '头像', hot: false},
  {name: '高清', hot: false},
  {name: '艺术', hot: false},
  {name: '校园', hot: false},
  {name: '风景', hot: false},
  {name: '简历', hot: false},
  {name: '创意', hot: false},
  {name: 'Spring', hot: false},
  {name: 'SpringBoot', hot: false},
  {name: '美女', hot: false},
  {name: '海边', hot: false},
  {name: 'Mac壁纸', hot: false},
]);

// 切换标签选中状态
const toggleTagActive = (index: number) => {
  filterStore.toggleTagActive(index);
  fetchGalleryImages();
};

// 更新后的图库数据 - 更换为本地/CDN图片资源
const galleryImages = reactive([
  {
    id: '1',
    src: 'https://cdn.pixabay.com/photo/2016/11/23/14/37/coding-1853305_1280.jpg',
    title: 'macbook-workspace',
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
    comments: 45,
    aspectRatio: '1/1',
  },
  {
    id: '2',
    src: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    title: '山脉风光摄影',
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
    comments: 120,
    aspectRatio: '16/9',
  },
  {
    id: '3',
    src: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg',
    title: '城市夜景',
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
    comments: 235,
    aspectRatio: '21/9',
  },
  {
    id: '4',
    src: 'https://cdn.pixabay.com/photo/2023/05/15/18/13/boat-8036952_1280.jpg',
    title: '二次元精选壁纸',
    author: {
      name: '动漫爱好者',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_1280.png',
    },
    category: '动漫',
    tags: [
      {name: '壁纸', color: ''},
      {name: '绘画', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-08-05T18:45:00.000Z',
    views: 4531,
    likes: 1820,
    comments: 156,
    aspectRatio: '4/3',
  },
  {
    id: '5',
    src: 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg',
    title: '时尚模特写真',
    author: {
      name: '时尚摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_1280.png',
    },
    category: '时尚',
    tags: [
      {name: '模特', color: ''},
      {name: '写真', color: ''},
      {name: '人像', color: ''},
    ],
    liked: true,
    bookmarked: true,
    createTime: '2023-07-20T14:30:00.000Z',
    views: 6720,
    likes: 2760,
    comments: 320,
    aspectRatio: '2/3',
  },
  {
    id: '6',
    src: 'https://cdn.pixabay.com/photo/2016/03/04/19/36/beach-1236581_1280.jpg',
    title: '校园风光集',
    author: {
      name: '校园摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2014/03/25/16/54/user-297566_1280.png',
    },
    category: '校园',
    tags: [
      {name: '风景', color: ''},
      {name: '四季', color: ''},
      {name: '摄影', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-09-20T16:10:00.000Z',
    views: 1874,
    likes: 756,
    comments: 89,
    aspectRatio: '4/3',
  },
  {
    id: '7',
    src: 'https://cdn.pixabay.com/photo/2019/11/25/16/30/mountains-4652248_1280.jpg',
    title: '山脉日出',
    author: {
      name: '风景摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    category: '风景',
    tags: [
      {name: '山脉', color: ''},
      {name: '日出', color: ''},
      {name: '自然', color: ''},
    ],
    liked: true,
    bookmarked: true,
    createTime: '2023-05-15T05:40:00.000Z',
    views: 8532,
    likes: 3420,
    comments: 412,
    aspectRatio: '21/9',
  },
  {
    id: '8',
    src: 'https://cdn.pixabay.com/photo/2014/12/27/14/37/living-room-581073_1280.jpg',
    title: '咖啡艺术',
    author: {
      name: '咖啡师',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: '美食',
    tags: [
      {name: '咖啡', color: ''},
      {name: '艺术', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-11-08T09:15:00.000Z',
    views: 2140,
    likes: 845,
    comments: 97,
    aspectRatio: '1/1',
  },
  {
    id: '9',
    src: 'https://cdn.pixabay.com/photo/2016/08/11/23/48/mountains-1587287_1280.jpg',
    title: '建筑摄影专辑',
    author: {
      name: '建筑摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_1280.png',
    },
    category: '建筑',
    tags: [
      {name: '城市', color: ''},
      {name: '现代', color: ''},
      {name: '摄影', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-10-25T13:50:00.000Z',
    views: 3210,
    likes: 1284,
    comments: 156,
    aspectRatio: '9/21',
  },
  {
    id: '10',
    src: 'https://cdn.pixabay.com/photo/2016/02/22/20/22/mountains-1216029_1280.jpg',
    title: '现代抽象艺术作品',
    author: {
      name: '艺术家小陈',
      avatar: 'https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_1280.png',
    },
    category: '艺术',
    tags: [
      {name: '抽象', color: ''},
      {name: '创意', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-11-05T11:20:00.000Z',
    views: 965,
    likes: 387,
    comments: 45,
    aspectRatio: '16/9',
  },
  {
    id: '11',
    src: 'https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg',
    title: '极光自然景观',
    author: {
      name: '风光摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: '风景',
    tags: [
      {name: '极光', color: ''},
      {name: '夜景', color: ''},
      {name: '自然', color: ''},
    ],
    liked: true,
    bookmarked: false,
    createTime: '2023-08-12T21:40:00.000Z',
    views: 7450,
    likes: 2980,
    comments: 347,
    aspectRatio: '21/6',
  },
  {
    id: '12',
    src: 'https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_1280.jpg',
    title: '美食摄影集',
    author: {
      name: '美食摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: '美食',
    tags: [
      {name: '料理', color: ''},
      {name: '摄影', color: ''},
      {name: '创意', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-09-30T12:15:00.000Z',
    views: 4180,
    likes: 1672,
    comments: 198,
    aspectRatio: '3/4',
  },
  {
    id: '13',
    src: 'https://cdn.pixabay.com/photo/2015/07/09/22/45/tree-838667_1280.jpg',
    title: '城市建筑夜景',
    author: {
      name: '城市摄影大师',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: '建筑',
    tags: [
      {name: '城市', color: ''},
      {name: '夜景', color: ''},
      {name: '高楼', color: ''},
    ],
    liked: true,
    bookmarked: true,
    createTime: '2023-10-05T19:25:00.000Z',
    views: 5670,
    likes: 2268,
    comments: 264,
    aspectRatio: '2/1',
  },
  {
    id: '14',
    src: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg',
    title: '登山探险风光',
    author: {
      name: '户外摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: '户外',
    tags: [
      {name: '山脉', color: ''},
      {name: '登山', color: ''},
      {name: '自然', color: ''},
    ],
    liked: false,
    bookmarked: false,
    createTime: '2023-07-12T08:40:00.000Z',
    views: 3890,
    likes: 1556,
    comments: 168,
    aspectRatio: '3/4',
  },
]);

// 加载更多
const loadMore = () => {
  console.log('加载更多图片');
  // 这里添加加载更多图片的逻辑
  message.info('正在加载更多内容...');

  // 模拟加载更多图片（示例）
  setTimeout(() => {
    const moreImages = [
      {
        id: '15',
        src: 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg',
        title: '日常生活摄影',
        author: {
          name: '生活摄影师',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
        },
        category: '生活',
        tags: [
          {name: '日常', color: ''},
          {name: '写实', color: ''},
        ],
        liked: false,
        bookmarked: false,
        createTime: '2023-12-05T10:20:00.000Z',
        views: 1230,
        likes: 492,
        comments: 58,
        aspectRatio: '3/2',
      },
      {
        id: '16',
        src: 'https://cdn.pixabay.com/photo/2021/08/25/20/42/field-6574455_1280.jpg',
        title: '乡村田园风光',
        author: {
          name: '乡村摄影师',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
        },
        category: '风景',
        tags: [
          {name: '乡村', color: ''},
          {name: '田园', color: ''},
          {name: '自然', color: ''},
        ],
        liked: false,
        bookmarked: false,
        createTime: '2023-10-18T14:30:00.000Z',
        views: 2860,
        likes: 1144,
        comments: 135,
        aspectRatio: '16/9',
      },
    ];

    // 为新图片添加评论数和点赞数
    moreImages.forEach(image => {
      if (!image.likes) {
        image.likes = Math.floor(image.views * (0.3 + Math.random() * 0.2));
      }
      if (!image.comments) {
        image.comments = Math.floor(image.views * (0.05 + Math.random() * 0.1));
      }
    });

    // 添加到图库
    galleryImages.push(...moreImages);
    message.success('已加载更多内容');
  }, 1000);
};

// 筛选器相关
const filterModalVisible = ref(false);
const savedFilters = ref([]);

// 显示创建筛选器弹窗
const showCreateFilterModal = () => {
  filterModalVisible.value = true;
};

// 保存筛选器
const saveFilter = (filter: any) => {
  // 检查是否已有相同名称的筛选器
  const exists = savedFilters.value.some(f => f.name === filter.name);
  if (exists) {
    message.warning(`已存在名为"${filter.name}"的筛选器`);
    return;
  }

  // 添加到保存的筛选器中
  savedFilters.value.push(filter);

  // 保存到本地存储
  localStorage.setItem('userFilters', JSON.stringify(savedFilters.value));

  message.success(`筛选器"${filter.name}"已创建`);
};

// 处理删除筛选器
const handleDeleteFilter = (filterId: any) => {
  const result = filterStore.deleteFilter(filterId);
  if (result.success) {
    message.success(result.message);
  }
};

// 处理清除筛选器
const handleClearFilter = () => {
  const result = filterStore.clearFilter();
  if (result.success) {
    message.info(result.message);
    fetchGalleryImages();
  }
};

// 原始图库数据（完整数据）
const originalGalleryImages = [...galleryImages];

// 获取图片数据
const fetchGalleryImages = () => {
  // 获取当前筛选条件
  const filters = filterStore.getCurrentFilters();
  console.log('应用筛选条件获取图片:', filters);

  // 确保 originalGalleryImages 有内容
  if (originalGalleryImages.length === 0) {
    console.warn('原始图片数据为空，正在重新初始化...');
    originalGalleryImages.push(...JSON.parse(JSON.stringify(galleryImages)));
  }

  // 模拟根据筛选条件过滤图片
  let filteredImages = [...originalGalleryImages]; // 默认使用所有图片

  // 如果有筛选条件，再应用筛选逻辑
  if ((filters.categories.length > 0 && !filters.categories.includes('全部')) || filters.tags.length > 0) {
    filteredImages = originalGalleryImages.filter(image => {
      // 筛选分类
      if (filters.categories.length > 0 && !filters.categories.includes('全部')) {
        // 检查图片的category属性
        if (image.category) {
          // 如果图片有category属性，直接使用它进行筛选
          if (!filters.categories.includes(image.category)) return false;
        } else {
          // 兼容旧数据结构，使用tags中的名称作为分类筛选
          const imageCategoryMatch = image.tags.some(tag =>
              filters.categories.includes(tag.name)
          );
          if (!imageCategoryMatch) return false;
        }
      }

      // 筛选标签
      if (filters.tags.length > 0) {
        const tagMatch = image.tags.some(tag =>
            filters.tags.includes(tag.name)
        );
        if (!tagMatch) return false;
      }

      return true;
    });
  }

  // 根据排序条件排序
  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (filters.sort) {
      case 'newest':
        // 按创建时间降序排序
        if (a.createTime && b.createTime) {
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
        }
        return 0;
      case 'popular':
        // 按照是否喜欢排序
        return (b.liked ? 1 : 0) - (a.liked ? 1 : 0);
      case 'look':
        // 按照浏览量排序
        return (b.views || 0) - (a.views || 0);
      case 'oldest':
        // 按创建时间升序排序
        if (a.createTime && b.createTime) {
          return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
        }
        return 0;
      default:
        return 0;
    }
  });

  console.log('筛选后的图片数量:', sortedImages.length);

  // 确保即使筛选结果为空，也至少显示所有图片
  if (sortedImages.length === 0 && !filters.categories.length && !filters.tags.length) {
    console.warn('筛选结果为空且无筛选条件，显示所有图片');
    galleryImages.splice(0, galleryImages.length, ...originalGalleryImages);
  } else {
    // 更新图库数据
    galleryImages.splice(0, galleryImages.length, ...sortedImages);
  }
};

// 图片加载错误处理
const handleImageError = (event, image) => {
  console.error(`图片加载失败: ${image.src}`);
  // 设置替代图片 - 使用一个更可靠的占位图片服务
  event.target.src = 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg';
};

// 添加点击涟漪效果函数
const addRippleEffect = (event) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();

  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');

  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
};

// 监听Store中的数据变化，触发图片重新获取
watch(
    () => [
      filterStore.currentSort,
      filterStore.categories.map(c => c.active),
      filterStore.tags.map(t => t.hot)
    ],
    () => {
      if (!filterStore.activeFilter) {
        // 只有在没有激活的筛选器时才自动刷新
        // 避免重复刷新，因为应用筛选器会单独触发刷新
        fetchGalleryImages();
      }
    },
    {deep: true}
);

// 组件挂载时初始化
onMounted(() => {
  // 首先清空原始图片数组，避免重复
  originalGalleryImages.length = 0;

  // 使用深拷贝创建图片副本
  const deepCopiedImages = JSON.parse(JSON.stringify(galleryImages));

  // 将图片存入原始数据数组
  originalGalleryImages.push(...deepCopiedImages);

  // 初始化筛选Store，传入初始分类和标签数据
  const initialCategories = [
    {name: '全部', active: true},
    {name: '个人', active: false},
    {name: '星球', active: false},
    {name: '面试题', active: false},
    {name: '表情包', active: false},
    {name: '素材', active: false},
    {name: '学习', active: false},
    {name: 'Bugs', active: false},
    {name: '海报', active: false},
    {name: '壁纸', active: false},
    {name: '动漫', active: false},
  ];

  const initialTags = [
    {name: '热门', hot: true, count: '120+'},
    {name: '头像', hot: false},
    {name: '高清', hot: false},
    {name: '艺术', hot: false},
    {name: '校园', hot: false},
    {name: '风景', hot: false},
    {name: '简历', hot: false},
    {name: '创意', hot: false},
    {name: 'Spring', hot: false},
    {name: 'SpringBoot', hot: false},
    {name: '美女', hot: false},
    {name: '海边', hot: false},
    {name: 'Mac壁纸', hot: false},
  ];

  filterStore.initialize(initialCategories, initialTags);

  // 获取任何已保存的筛选器
  const savedFiltersStr = localStorage.getItem('userFilters');
  if (savedFiltersStr) {
    try {
      savedFilters.value = JSON.parse(savedFiltersStr);
    } catch (e) {
      console.error('解析保存的筛选器时出错:', e);
      localStorage.removeItem('userFilters');
    }
  }

  // 为图片添加额外属性
  deepCopiedImages.forEach(image => {
    // 根据浏览量按比例生成点赞数
    if (!image.likes) {
      image.likes = Math.floor(image.views * (0.3 + Math.random() * 0.2));
    }

    // 添加评论数
    if (!image.comments) {
      image.comments = Math.floor(image.views * (0.05 + Math.random() * 0.1));
    }

    // 初始化收藏状态
    image.bookmarked = false;
  });

  // 加载图片
  setTimeout(() => {
    console.log('加载所有图片，数量:', deepCopiedImages.length);
    galleryImages.splice(0, galleryImages.length, ...deepCopiedImages);
  }, 10);
});
</script>

<style scoped>
/* 搜索区域顶部间距 */
.home-page {
  padding-top: 16px;
}

/* 移除标签的默认内边距和边框 */
.category-tag:deep(.ant-tag),
.custom-tag:deep(.ant-tag) {
  margin: 0;
  padding: 0;
}

/* 修复排序下拉按钮 */
.sort-dropdown {
  display: flex;
  align-items: center;
  height: 36px;
  border-radius: 6px;
  padding: 0 12px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.sort-dropdown .anticon {
  margin-left: 6px;
}

.search-container {
  padding: 16px 0 24px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-wrapper {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  position: relative; /* 添加相对定位 */
}

/* 整体搜索框样式 */
.search-input {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 输入框部分样式 */
.search-input :deep(.ant-input) {
  height: 44px; /* 统一高度 */
  font-size: 14px;
  padding-left: 16px;
  border-radius: 8px 0 0 8px;
}

/* 前缀图标样式 */
.search-input :deep(.ant-input-prefix) {
  margin-right: 10px;
  color: rgba(0, 0, 0, 0.45);
}

/* 搜索按钮样式 */
.search-input :deep(.ant-input-search-button) {
  height: 44px; /* 与输入框高度一致 */
  width: 60px; /* 增加按钮宽度 */
  border-radius: 0 8px 8px 0;
  background: #6366f1; /* 统一按钮颜色 */
  display: flex;
  align-items: center; /* 垂直居中图标 */
  justify-content: center; /* 水平居中图标 */
  border: none;
}

/* 搜索按钮内的图标居中 */
.search-input :deep(.ant-input-search-button .anticon) {
  line-height: 1;
  font-size: 18px;
  height: 18px; /* 固定图标高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

/* 确保按钮内无空隙 */
.search-input :deep(.ant-input-group-addon) {
  padding: 0;
  overflow: hidden;
}

/* 输入框聚焦时样式 */
.search-input :deep(.ant-input:focus) {
  border-color: #6366f1;
}

/* 禁用按钮悬停阴影，保持一致外观 */
.search-input :deep(.ant-input-search-button:hover) {
  background: #5258e9; /* 稍微深一点的紫色 */
}

/* 确保搜索按钮的高度和输入框完全一致 */
.search-input :deep(.ant-input-affix-wrapper) {
  height: 44px;
  padding: 0 11px;
}

.search-input {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.search-input :deep(.ant-input) {
  height: 42px;
  font-size: 14px;
  padding-left: 16px;
}

.search-input :deep(.ant-input-prefix) {
  margin-right: 10px;
  color: rgba(0, 0, 0, 0.45);
}

.search-input :deep(.ant-input-search-button) {
  height: 42px;
  border-radius: 0 8px 8px 0;
  width: 48px;
  background: var(--primary-color);
}

/* 分类浏览区域样式优化 */
.category-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  margin-bottom: 12px;
}

.section-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 分类标签优化 */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.category-tag {
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  background-color: #f5f5f5;
  border: none;
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.65);
  margin: 0;
  height: auto;
  line-height: 1.5;
  user-select: none;
}

.category-tag-active {
  color: white;
  background: #6366f1; /* 更纯正的紫色，更接近原型图 */
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
}

/* 热门标签 */
.tag-section {
  padding-top: 16px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.custom-tag {
  cursor: pointer;
  margin: 0;
  padding: 4px 12px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  border-radius: 16px; /* 更圆润的标签 */
  border: 1px solid #e8e8e8;
  background-color: white;
  font-size: 13px;
  height: auto;
  line-height: 1.5;
  user-select: none;
}

.tag-hot {
  color: white;
  background: #6366f1; /* 与激活的分类标签一致 */
  border-color: transparent;
}

.tag-count {
  margin-left: 4px;
  background: rgba(255, 255, 255, 0.85);
  color: #6366f1;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: bold;
  line-height: normal;
}

/* 瀑布流布局 */
.masonry-gallery {
  column-count: 1;
  column-gap: 16px;
  margin-bottom: 32px;
  width: 100%;
}

@media (min-width: 576px) {
  .masonry-gallery {
    column-count: 2;
    column-gap: 16px;
  }
}

@media (min-width: 992px) {
  .masonry-gallery {
    column-count: 3;
    column-gap: 20px;
  }
}

@media (min-width: 1200px) {
  .masonry-gallery {
    column-count: 4;
    column-gap: 24px;
  }
}

/* 保证瀑布流元素不被打断 */
.masonry-item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 16px;
  display: inline-block;
  width: 100%;
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

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 40px;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 添加的新样式 */
.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.active-filter {
  margin-bottom: 20px;
}

.active-filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 空状态 */
.empty-gallery {
  text-align: center;
  padding: 60px 0;
}

.category-filter-applied {
  border: 1px dashed #6366f1;
}

.tag-filter-applied {
  border: 1px dashed #6366f1;
}

/* 标签和按钮悬停动画 */
.category-tag, .custom-tag {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.category-tag:hover, .custom-tag:hover {
  transform: translateY(-2px);
}

/* 添加涟漪效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 分享选项样式 */
.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-option:hover {
  background-color: #f5f5f5;
}

.share-option p {
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

  .share-option:hover {
    background-color: #2a2a2a;
  }

  .filter-card {
    background-color: #1f1f1f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .filter-header {
    border-bottom-color: #2a2a2a;
  }

  .category-tag {
    background-color: #2a2a2a;
    color: #ccc;
  }

  .custom-tag {
    background-color: #2a2a2a;
    color: #ccc;
    border-color: #444;
  }

  .section-title h3 {
    color: #e0e0e0;
  }
}
</style>