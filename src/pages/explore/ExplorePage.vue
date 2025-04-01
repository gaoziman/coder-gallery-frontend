<!-- pages/explore/ExplorePage.vue -->
<template>
  <div class="discovery-hero">
    <div class="discovery-header">
      <h1 class="page-title">探索发现</h1>
      <p class="subtitle">发现创意灵感，探索精彩内容</p>
    </div>

    <!-- 轮播展示区 -->
    <a-carousel autoplay class="featured-carousel">
      <div class="carousel-item" v-for="(item, index) in featuredItems" :key="index">
        <div class="carousel-content" :style="{ backgroundImage: `url(${item.coverImage})` }">
          <div class="carousel-overlay">
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <a-button type="primary"  class="action-btn">立即查看</a-button>
          </div>
        </div>
      </div>
    </a-carousel>

    <!-- 快速筛选标签 -->
    <div class="quick-filter-tags">
      <div class="filter-label">快速筛选:</div>
      <div class="tags-wrapper">
        <a-tag
            v-for="tag in quickTags"
            :key="tag.id"
            :color="tag.color"
            @click="applyQuickFilter(tag.id)"
            class="filter-tag"
        >
          {{ tag.name }}
          <fire-outlined v-if="tag.isHot" class="hot-icon" />
        </a-tag>
      </div>
    </div>
  </div>


  <div class="discovery-categories">
    <div class="section-header">
      <h2>精选专辑</h2>
      <a-button type="link" @click="viewAllCategories">
        查看全部
        <right-outlined />
      </a-button>
    </div>

    <div class="categories-grid">
      <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{
        opacity: 1,
        y: 0,
        transition: {
          delay: category.id * 100,
          duration: 500
        }
      }"
      >
        <div class="category-image" :style="{ backgroundImage: `url(${category.coverImage})` }">
          <div class="category-overlay">
            <div class="category-stats">
              <div class="stat">
                <picture-outlined />
                <span>{{ formatNumber(category.imageCount) }}</span>
              </div>
              <div class="stat">
                <eye-outlined />
                <span>{{ formatNumber(category.views) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="category-info">
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
          <div class="category-tags">
            <a-tag
                v-for="(tag, index) in category.tags.slice(0, 3)"
                :key="index"
                :style="{
              backgroundColor: getTagColor(tag, true).backgroundColor,
              color: getTagColor(tag, true).color,
              borderColor: 'transparent'
            }"
            >
              {{ tag }}
            </a-tag>
            <a-tag v-if="category.tags.length > 3" class="more-tag">
              +{{ category.tags.length - 3 }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="trending-section">
    <div class="section-header">
      <h2>
        <fire-outlined class="trending-icon" />
        热门趋势
      </h2>
      <a-dropdown>
        <template #overlay>
          <a-menu @click="handleTrendingPeriodChange">
            <a-menu-item key="day">今日热门</a-menu-item>
            <a-menu-item key="week">本周热门</a-menu-item>
            <a-menu-item key="month">本月热门</a-menu-item>
          </a-menu>
        </template>
        <a-button>
          {{ trendingPeriodText }}
          <down-outlined />
        </a-button>
      </a-dropdown>
    </div>

    <!-- 趋势内容网格 -->
    <div class="trending-grid">
      <div
          v-for="(item, index) in trendingItems"
          :key="item.id"
          class="trending-item"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
        opacity: 1,
        scale: 1,
        transition: {
          delay: index * 100,
          duration: 500
        }
      }"
      >
        <div class="trending-rank">{{ index + 1 }}</div>
        <div class="trending-image">
          <img :src="item.src" :alt="item.title" />
          <div class="trending-overlay">
            <div class="trending-stats">
              <div class="stat">
                <eye-outlined />
                <span>{{ formatNumber(item.views) }}</span>
              </div>
              <div class="stat">
                <heart-outlined />
                <span>{{ formatNumber(item.likes) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="trending-info">
          <div class="trending-title">{{ item.title }}</div>
          <div class="trending-author">
            <a-avatar :src="item.author.avatar" :size="24" />
            <span>{{ item.author.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="creators-section">
    <div class="section-header">
      <h2>
        <crown-outlined class="creator-icon" />
        优秀创作者
      </h2>
      <a-button type="link">查看全部</a-button>
    </div>

    <div class="creators-carousel">
      <a-carousel :dots="false" arrows autoplay>
        <div class="carousel-page" v-for="page in creatorPages" :key="page.id">
          <div class="creators-grid">
            <div
                v-for="creator in page.creators"
                :key="creator.id"
                class="creator-card"
            >
              <div class="creator-header">
                <a-avatar :src="creator.avatar" :size="64" />
                <div class="creator-info">
                  <h4>{{ creator.name }}</h4>
                  <p>{{ creator.role }}</p>
                  <div class="creator-stats">
                    <div class="stat">
                      <picture-outlined />
                      <span>{{ formatNumber(creator.imageCount) }}</span>
                    </div>
                    <div class="stat">
                      <team-outlined />
                      <span>{{ formatNumber(creator.followers) }}</span>
                    </div>
                  </div>
                </div>
                <a-button type="primary" size="small" class="follow-btn">关注</a-button>
              </div>
              <div class="creator-gallery">
                <div class="gallery-preview" v-for="img in creator.featured.slice(0, 4)" :key="img.id">
                  <img :src="img.src" :alt="img.title" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-carousel>
    </div>
  </div>



  <div class="challenges-section">
    <div class="section-header">
      <h2>
        <trophy-outlined class="challenge-icon" />
        创意挑战
      </h2>
      <a-button type="link">历史挑战</a-button>
    </div>

    <div class="challenges-grid">
      <div
          v-for="challenge in activeAllenges"
          :key="challenge.id"
          class="challenge-card"
          v-motion
          :initial="{ opacity: 0, x: -50 }"
          :enter="{
        opacity: 1,
        x: 0,
        transition: {
          delay: challenge.id * 150,
          duration: 600
        }
      }"
      >
        <div class="challenge-image" :style="{ backgroundImage: `url(${challenge.coverImage})` }">
          <div class="challenge-status" :class="{ 'status-active': challenge.isActive, 'status-ending': challenge.isEnding }">
            {{ challenge.isEnding ? '即将结束' : '进行中' }}
          </div>
        </div>
        <div class="challenge-content">
          <h3>{{ challenge.title }}</h3>
          <p>{{ challenge.description }}</p>
          <div class="challenge-meta">
            <div class="meta-item">
              <clock-circle-outlined />
              <span>{{ challenge.endDate }}</span>
            </div>
            <div class="meta-item">
              <team-outlined />
              <span>{{ formatNumber(challenge.participants) }}人参与</span>
            </div>
          </div>
          <div class="challenge-footer">
            <a-button type="primary">立即参与</a-button>
            <a-button>了解详情</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="collections-section">
    <div class="section-header">
      <h2>
        <book-outlined class="collections-icon" />
        精选话题
      </h2>
      <a-radio-group v-model:value="selectedCollectionType" button-style="solid" class="custom-radio-group">
        <a-radio-button value="popular">热门</a-radio-button>
        <a-radio-button value="new">最新</a-radio-button>
        <a-radio-button value="following">关注</a-radio-button>
      </a-radio-group>
    </div>

    <div class="collections-grid">
      <div
          v-for="collection in visibleCollections"
          :key="collection.id"
          class="collection-card"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{
        opacity: 1,
        transition: {
          delay: collection.id * 100,
          duration: 400
        }
      }"
      >
        <div class="collection-preview">
          <div class="preview-large">
            <img :src="collection.preview[0]" :alt="collection.title" />
          </div>
          <div class="preview-small">
            <div class="preview-item" v-for="(img, index) in collection.preview.slice(1, 4)" :key="index">
              <img :src="img" :alt="`${collection.title}-${index}`" />
            </div>
            <div class="preview-more" v-if="collection.totalItems > 4">
              <plus-outlined />
              <span>{{ collection.totalItems - 4 }}</span>
            </div>
          </div>
        </div>
        <div class="collection-info">
          <h3>{{ collection.title }}</h3>
          <p>{{ collection.description }}</p>
          <div class="collection-footer">
            <div class="collection-author">
              <a-avatar :src="collection.author.avatar" :size="24" />
              <span>{{ collection.author.name }}</span>
            </div>
            <a-button type="link" size="small">
              <folder-add-outlined />
              添加
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import {
  FireOutlined, CrownOutlined, BookOutlined, TrophyOutlined, BulbOutlined,
  AppstoreOutlined, BarsOutlined, PictureOutlined, EyeOutlined, HeartOutlined,
  HeartFilled, DownOutlined, ClockCircleOutlined, TeamOutlined, ReloadOutlined,
  FolderAddOutlined, PlusOutlined, StarOutlined, StarFilled, ShareAltOutlined,
} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";

// 精选内容数据
const featuredItems = reactive([
  {
    id: 1,
    title: '2024年度设计趋势',
    description: '探索今年最流行的设计风格、配色方案和创意灵感',
    coverImage: 'https://images.unsplash.com/photo-1613909207039-6b173b755cc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 2,
    title: 'AI生成艺术特辑',
    description: '探索人工智能与创意设计的完美结合',
    coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 3,
    title: '环保主题创意合集',
    description: '绿色设计理念如何影响现代视觉艺术',
    coverImage: 'https://images.unsplash.com/photo-1623645481161-0d8160281b37?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
  }
]);

// 快速筛选标签
const quickTags = reactive([
  { id: 1, name: '热门推荐', color: '#6366F1', isHot: true },
  { id: 2, name: '最新上传', color: '#10B981' },
  { id: 3, name: '高清壁纸', color: '#3B82F6' },
  { id: 4, name: '创意插画', color: '#EC4899' },
  { id: 5, name: 'UI设计', color: '#8B5CF6', isHot: true },
  { id: 6, name: '摄影作品', color: '#F59E0B' },
  { id: 7, name: '图标设计', color: '#06B6D4' },
  { id: 8, name: '素材模板', color: '#10B981' }
]);

// 专辑分类
const categories = reactive([
  {
    id: 1,
    name: '现代UI设计',
    description: '探索现代用户界面设计的最新趋势和实践',
    coverImage: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 1240,
    views: 45600,
    tags: ['UI设计', '用户体验', '界面']
  },
  {
    id: 2,
    name: '自然风光',
    description: '大自然的壮丽景色，从山川到海洋，从日出到星空',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 3450,
    views: 128900,
    tags: ['风景', '自然', '摄影', '壁纸']
  },
  {
    id: 3,
    name: '创意插画',
    description: '富有想象力的插画作品，展现艺术家的独特视角',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 2180,
    views: 75400,
    tags: ['插画', '创意', '艺术']
  },
  {
    id: 4,
    name: '城市建筑',
    description: '现代与古典建筑的完美交融，城市风光摄影集',
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 1840,
    views: 63200,
    tags: ['城市', '建筑', '摄影']
  },
  {
    id: 5,
    name: '图标设计',
    description: '精美图标集合，从线性到立体，从简约到复杂',
    coverImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 5680,
    views: 95800,
    tags: ['图标', 'UI设计', '素材']
  },
  {
    id: 6,
    name: '科技未来',
    description: '探索科技与未来的视觉呈现，充满想象力的未来主义作品',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    imageCount: 1260,
    views: 48200,
    tags: ['科技', '未来', '创意']
  }
]);

// 创建view, list混合视图选择器
const selectedView = ref('grid');

// 趋势内容相关
const trendingPeriod = ref('week');
const trendingPeriodText = computed(() => {
  const periodMap = {
    day: '今日热门',
    week: '本周热门',
    month: '本月热门'
  };
  return periodMap[trendingPeriod.value];
});

const handleTrendingPeriodChange = (e) => {
  trendingPeriod.value = e.key;
  // 这里可以添加加载对应周期热门内容的逻辑
};

// 趋势内容数据
const trendingItems = reactive([
  {
    id: 1,
    title: '自然光影下的建筑摄影',
    src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 12450,
    likes: 4325,
    author: {
      name: '摄影师Leo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 2,
    title: '极简主义界面设计',
    src: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 8760,
    likes: 3120,
    author: {
      name: 'UI设计师小王',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 3,
    title: '城市夜景灯光',
    src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 7480,
    likes: 2980,
    author: {
      name: '城市摄影师',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 4,
    title: '创意字体设计',
    src: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 6520,
    likes: 2350,
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 5,
    title: '自然风光壁纸',
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 5980,
    likes: 2120,
    author: {
      name: '风景摄影师',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 6,
    title: '抽象几何图形',
    src: 'https://images.unsplash.com/photo-1550859492-d5da9d7578e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 5240,
    likes: 1830,
    author: {
      name: '艺术家小张',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 7,
    title: '科技感UI界面',
    src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 4870,
    likes: 1720,
    author: {
      name: 'UI设计师小明',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  },
  {
    id: 8,
    title: '创意插画作品',
    src: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    views: 4320,
    likes: 1540,
    author: {
      name: '插画师小红',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    }
  }
]);

// 优秀创作者数据
const creators = reactive([
  {
    id: 1,
    name: '摄影师李伟',
    role: '风光摄影师',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 248,
    followers: 12450,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '山间日出' },
      { id: 2, src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '海岸线' },
      { id: 3, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '峡谷风光' },
      { id: 4, src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '雪山' }
    ]
  },
  {
    id: 2,
    name: 'UI设计师王晓',
    role: '资深界面设计师',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 186,
    followers: 8760,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '应用界面' },
      { id: 2, src: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '图标集' },
      { id: 3, src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '数据界面' },
      { id: 4, src: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '移动设计' }
    ]
  },
  {
    id: 3,
    name: '插画师小红',
    role: '创意插画师',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 324,
    followers: 15320,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '城市插画' },
      { id: 2, src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '抽象创意' },
      { id: 3, src: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '水彩作品' },
      { id: 4, src: 'https://images.unsplash.com/photo-1550859492-d5da9d7578e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '几何艺术' }
    ]
  },
  {
    id: 4,
    name: '建筑摄影师张强',
    role: '建筑摄影专家',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 178,
    followers: 9430,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '现代建筑' },
      { id: 2, src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '城市天际线' },
      { id: 3, src: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '地标建筑' },
      { id: 4, src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '古典建筑' }
    ]
  },
  {
    id: 5,
    name: '摄影师李伟',
    role: '风光摄影师',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 248,
    followers: 12450,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '山间日出' },
      { id: 2, src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '海岸线' },
      { id: 3, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '峡谷风光' },
      { id: 4, src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '雪山' }
    ]
  },
  {
    id: 6,
    name: 'UI设计师王晓',
    role: '资深界面设计师',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 186,
    followers: 8760,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '应用界面' },
      { id: 2, src: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '图标集' },
      { id: 3, src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '数据界面' },
      { id: 4, src: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '移动设计' }
    ]
  },
  {
    id: 7,
    name: '插画师小红',
    role: '创意插画师',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 324,
    followers: 15320,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '城市插画' },
      { id: 2, src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '抽象创意' },
      { id: 3, src: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '水彩作品' },
      { id: 4, src: 'https://images.unsplash.com/photo-1550859492-d5da9d7578e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '几何艺术' }
    ]
  },
  {
    id: 8,
    name: '建筑摄影师张强',
    role: '建筑摄影专家',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    imageCount: 178,
    followers: 9430,
    featured: [
      { id: 1, src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '现代建筑' },
      { id: 2, src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '城市天际线' },
      { id: 3, src: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '地标建筑' },
      { id: 4, src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', title: '古典建筑' }
    ]
  }
]);

// 将创作者分页处理
const creatorPages = computed(() => {
  const chunks = [];
  const chunkSize = window.innerWidth > 1200 ? 4 : window.innerWidth > 768 ? 2 : 1;

  for (let i = 0; i < creators.length; i += chunkSize) {
    chunks.push({
      id: i,
      creators: creators.slice(i, i + chunkSize)
    });
  }

  return chunks;
});

// 活动挑战数据
const activeAllenges = reactive([
  {
    id: 1,
    title: '2024城市摄影大赛',
    description: '用你的镜头捕捉城市的独特魅力，展示都市生活的精彩瞬间',
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-06-15',
    participants: 1458,
    isActive: true,
    isEnding: false
  },
  {
    id: 2,
    title: '创意UI设计挑战',
    description: '设计一个具有未来感的音乐应用界面，体现科技与艺术的完美结合',
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-05-25',
    participants: 862,
    isActive: true,
    isEnding: true
  },
  {
    id: 3,
    title: '自然风光壁纸征集',
    description: '分享你拍摄的最美自然风光，入选作品将被收录到官方壁纸库',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-06-30',
    participants: 2145,
    isActive: true,
    isEnding: false
  },
  {
    id: 4,
    title: '自然风光壁纸征集',
    description: '分享你拍摄的最美自然风光，入选作品将被收录到官方壁纸库',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-06-30',
    participants: 2145,
    isActive: true,
    isEnding: false
  },
  {
    id: 2,
    title: '创意UI设计挑战',
    description: '设计一个具有未来感的音乐应用界面，体现科技与艺术的完美结合',
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-05-25',
    participants: 862,
    isActive: true,
    isEnding: true
  },
  {
    id: 3,
    title: '自然风光壁纸征集',
    description: '分享你拍摄的最美自然风光，入选作品将被收录到官方壁纸库',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-06-30',
    participants: 2145,
    isActive: true,
    isEnding: false
  },
  {
    id: 4,
    title: '自然风光壁纸征集',
    description: '分享你拍摄的最美自然风光，入选作品将被收录到官方壁纸库',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    endDate: '2024-06-30',
    participants: 2145,
    isActive: true,
    isEnding: false
  }
]);

// 精选话题与灵感板
const selectedCollectionType = ref('popular');
const collections = reactive([
  {
    id: 1,
    title: '极简主义设计',
    description: '探索少即是多的设计理念，收集极简风格的优秀案例',
    preview: [
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 24,
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'popular'
  },
  {
    id: 2,
    title: '创意插画集',
    description: '精选各种风格的创意插画作品，为你的设计提供灵感',
    preview: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1550859492-d5da9d7578e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 36,
    author: {
      name: '插画师小红',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'popular'
  },
  {
    id: 1,
    title: '极简主义设计',
    description: '探索少即是多的设计理念，收集极简风格的优秀案例',
    preview: [
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 24,
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'popular'
  },
  {
    id: 2,
    title: '创意插画集',
    description: '精选各种风格的创意插画作品，为你的设计提供灵感',
    preview: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1550859492-d5da9d7578e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 36,
    author: {
      name: '插画师小红',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'popular'
  },
  {
    id: 3,
    title: '城市建筑摄影',
    description: '记录世界各地的标志性建筑与城市风光',
    preview: [
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1496564203457-11bb12075d90?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 42,
    author: {
      name: '建筑摄影师张强',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'new'
  },
  {
    id: 4,
    title: '自然风光壁纸',
    description: '高清自然风光摄影作品，完美适配各种设备壁纸',
    preview: [
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 56,
    author: {
      name: '风光摄影师李伟',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'popular'
  },
  {
    id: 5,
    title: '现代UI元素',
    description: '收集当代UI设计中的常用元素与组件设计灵感',
    preview: [
      'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 32,
    author: {
      name: 'UI设计师王晓',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'following'
  },
  {
    id: 6,
    title: '科技产品摄影',
    description: '精美科技产品摄影与场景展示，适合电商与宣传素材',
    preview: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    ],
    totalItems: 28,
    author: {
      name: '产品摄影师小陈',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    type: 'new'
  }
]);

// 根据选择筛选集合
const visibleCollections = computed(() => {
  return collections.filter(collection => collection.type === selectedCollectionType.value);
});

// 为标签生成不同的颜色
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

// 添加查看全部的方法
const viewAllCategories = () => {
  // 这里可以添加跳转逻辑，例如：
  // router.push('/categories');
  // 或者显示更多分类的逻辑
  console.log('查看全部专辑');
  // 如果使用消息提示
  message.info('正在跳转到全部专辑页面...');
};

// 格式化数字
const formatNumber = (num) => {
  if (!num && num !== 0) return 0;
  return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num;
};

// 应用快速筛选
const applyQuickFilter = (tagId) => {
  console.log('应用快速筛选:', tagId);
  // 实际应用中，这里会根据选中的标签获取对应内容
  message.success(`已筛选: ${quickTags.find(tag => tag.id === tagId).name}`);
};

// 智能推荐区域 - 使用来自My Space的图片数据作为示例
const recommendedImages = reactive([]);

// 刷新推荐
const refreshRecommendations = () => {
  message.loading('正在为您寻找新的推荐...');

  // 模拟刷新推荐的过程
  setTimeout(() => {
    message.success('推荐已更新');
    // 这里可以添加实际刷新逻辑
  }, 1000);
};

// 处理图片浏览 - 复用My Space中的函数
const viewImage = (image) => {
  // 更新浏览计数
  if (typeof image.views === 'number') {
    image.views += 1;
  } else {
    image.views = 1;
  }
  message.info(`正在查看"${image.title}"`);
};

// 初始化
onMounted(() => {
  // 导入推荐图片数据
  // 在实际应用中，这里会从API获取个性化推荐
  recommendedImages.push(...[
    {
      src: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      title: '设计风格指南',
      author: {
        name: '程序员Leo',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      },
      tags: [
        { name: '海报', color: 'purple' },
        { name: 'Mac壁纸', color: '' },
      ],
      liked: false,
      views: 1250,
      createTime: '2023-09-15T08:30:00.000Z',
      aspectRatio: '16/9',
    },
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
    }
  ]);

  // 初始化动画效果
  // 这里可以添加额外的初始化逻辑
});
</script>

<style scoped>
/* 探索发现页面基础样式 */
.discovery-page {
  padding: 1.5rem;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部英雄区域 */
.discovery-hero {
  margin-bottom: 2.5rem;
}

.discovery-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #6B7280;
}

/* 轮播区域 */
.featured-carousel {
  border-radius: 12px;
  overflow: hidden;
  height: 400px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.carousel-item {
  height: 400px;
}

.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.carousel-overlay h2 {
  font-size: 2rem;
  margin: 0;
  color: white;
}

.carousel-overlay p {
  font-size: 1rem;
  max-width: 60%;
  margin: 0;
}

/* 快速筛选标签 */
.quick-filter-tags {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 0.75rem 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-label {
  font-weight: 500;
  color: #4B5563;
  white-space: nowrap;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.hot-icon {
  color: #F43F5E;
  font-size: 0.75rem;
}

/* 通用部分标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 分类卡片样式 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.category-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-stats {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.75rem;
}

.category-stats .stat {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.category-info {
  padding: 1rem;
}

.category-info h3 {
  font-size: 1.125rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #111827;
}

.category-info p {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* 趋势内容区域样式 */
.trending-section {
  margin-bottom: 3rem;
}

.trending-icon {
  color: #F43F5E;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.trending-item {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.trending-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.trending-rank {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 2;
}

.trending-image {
  height: 160px;
  position: relative;
  overflow: hidden;
}

.trending-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.trending-item:hover .trending-image img {
  transform: scale(1.05);
}

.trending-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.trending-item:hover .trending-overlay {
  opacity: 1;
}

.trending-stats {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.trending-stats .stat {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trending-info {
  padding: 0.75rem;
}

.trending-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trending-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
}

/* 创作者区域样式 */
.creators-section {
  margin-bottom: 3rem;
}

.creator-icon {
  color: #FAAD14;
}

.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
}

.creator-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.creator-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.creator-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.creator-info {
  flex: 1;
}

.creator-info h4 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.creator-info p {
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0 0 0.5rem 0;
}

.creator-stats {
  display: flex;
  gap: 0.75rem;
}

.creator-stats .stat {
  font-size: 0.75rem;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.creator-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.gallery-preview {
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 6px;
}

.gallery-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.creator-card:hover .gallery-preview img {
  transform: scale(1.05);
}

/* 挑战区域样式 */
.challenges-section {
  margin-bottom: 3rem;
}

.challenge-icon {
  color: #52C41A;
}

.challenges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.challenge-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.challenge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.challenge-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.challenge-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background-color: #52C41A;
  color: white;
}

.status-ending {
  background-color: #FAAD14;
  color: white;
}

.challenge-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.challenge-content h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
  color: #111827;
}

.challenge-content p {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1rem;
  line-height: 1.5;
  flex: 1;
}

.challenge-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.meta-item {
  font-size: 0.875rem;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.challenge-footer {
  display: flex;
  gap: 0.75rem;
}

/* 灵感板样式 */
.collections-section {
  margin-bottom: 3rem;
}

.collections-icon {
  color: #6366F1;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.collection-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.collection-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem;
}

.preview-large {
  height: 150px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.collection-card:hover .preview-large img {
  transform: scale(1.05);
}

.preview-small {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  height: 70px;
}

.preview-item {
  border-radius: 6px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.collection-card:hover .preview-item img {
  transform: scale(1.05);
}

.preview-more {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.875rem;
}

.collection-info {
  padding: 1rem;
}

.collection-info h3 {
  font-size: 1.125rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #111827;
}

.collection-info p {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.collection-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collection-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .categories-grid,
  .collections-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .trending-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .challenges-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .categories-grid,
  .collections-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .trending-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .challenges-grid {
    grid-template-columns: 1fr;
  }

  .featured-carousel,
  .carousel-item {
    height: 300px;
  }

  .carousel-overlay h2 {
    font-size: 1.5rem;
  }

  .carousel-overlay p {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .categories-grid,
  .collections-grid,
  .trending-grid {
    grid-template-columns: 1fr;
  }

  .featured-carousel,
  .carousel-item {
    height: 250px;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .discovery-page {
    background-color: #1f1f1f;
    color: #e0e0e0;
  }

  .page-title,
  .section-header h2 {
    color: #f0f0f0;
  }

  .subtitle {
    color: #a0a0a0;
  }

  .quick-filter-tags,
  .category-card,
  .trending-item,
  .creator-card,
  .challenge-card,
  .collection-card {
    background-color: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .filter-label {
    color: #c0c0c0;
  }

  .category-info h3,
  .trending-title,
  .creator-info h4,
  .challenge-content h3,
  .collection-info h3 {
    color: #f0f0f0;
  }

  .category-info p,
  .creator-info p,
  .challenge-content p,
  .collection-info p,
  .trending-author,
  .creator-stats .stat,
  .collection-author,
  .meta-item {
    color: #a0a0a0;
  }
}

/* 修改轮播图按钮样式 */
.carousel-overlay .action-btn {
  width: 120px; /* 设置固定宽度 */
  margin-top: 1rem;
  align-self: flex-start; /* 按钮左对齐 */
  background-color: #6366F1;
  border-color: #6366F1;
}

.carousel-overlay .action-btn:hover {
  background-color: #4F46E5;
  border-color: #4F46E5;
}

/* 添加或修改以下样式来提高按钮文字可读性 */
.follow-btn {
  background-color: #6366F1;  /* 保持主题紫色 */
  border-color: #6366F1;
  color: white;              /* 确保文字为白色 */
  font-weight: 500;          /* 增加字体粗细 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加文字阴影增强对比度 */
  padding: 0 12px;           /* 调整内边距使按钮更宽 */
  height: 28px;              /* 调整高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-btn:hover {
  background-color: #4F46E5;
  border-color: #4F46E5;
}

/* 确保创作者卡片中的其他元素布局合理 */
.creator-card {
  /* 保留原有样式 */
}

.creator-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.creator-info {
  flex: 1;
}

/* 确保在solid模式下，选中的单选按钮具有白色文字 */
.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: white !important; /* 强制文字为白色 */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2); /* 添加文字阴影增强可读性 */
}

/* 强制特异性，确保样式应用 */
html body .ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  color: white !important;
  background-color: var(--primary-color) !important;
}

/* 修复选择器中的热门、最新、关注按钮样式 */
.collections-section .ant-radio-group .ant-radio-button-wrapper-checked {
  color: white !important;
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

/* 为按钮添加过渡效果使颜色变化更平滑 */
.ant-radio-button-wrapper {
  transition: all 0.3s ease !important;
}
</style>