<!-- pages/explore/ExplorePage.vue -->
<template>
  <div class="explore-page">
    <!-- 顶部横幅区域 -->
    <div class="banner-container"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="banner-content">
        <h1 class="banner-title">探索发现</h1>
        <p class="banner-desc">发现创意灵感，探索精选内容</p>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="explore-content">
      <!-- 趋势分析区域 -->
      <a-card class="trends-card"
              :bordered="false"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }">
        <div class="section-header">
          <h2 class="section-title">
            <area-chart-outlined /> 热门趋势
          </h2>
          <a-radio-group v-model:value="trendPeriod" button-style="solid" size="small">
            <a-radio-button value="daily">今日</a-radio-button>
            <a-radio-button value="weekly">本周</a-radio-button>
            <a-radio-button value="monthly">本月</a-radio-button>
          </a-radio-group>
        </div>

        <div class="trends-container">
          <div v-for="(trend, index) in currentTrends" :key="index" class="trend-item"
               v-motion
               :initial="{ opacity: 0, x: 20 }"
               :enter="{ opacity: 1, x: 0, transition: { delay: 300 + (index * 100), duration: 500 } }">
            <div class="trend-rank">{{ index + 1 }}</div>
            <div class="trend-content">
              <div class="trend-tag">
                <a-tag :color="getTagColor(trend.category)">{{ trend.category }}</a-tag>
              </div>
              <div class="trend-name">{{ trend.name }}</div>
              <div class="trend-stats">
                <span><eye-outlined /> {{ trend.views }}</span>
                <span><heart-outlined /> {{ trend.likes }}</span>
                <span><cloud-download-outlined /> {{ trend.downloads }}</span>
              </div>
            </div>
            <div class="trend-growth" :class="trend.growth > 0 ? 'positive' : 'negative'">
              <arrow-up-outlined v-if="trend.growth > 0" />
              <arrow-down-outlined v-else />
              {{ Math.abs(trend.growth) }}%
            </div>
          </div>
        </div>
      </a-card>

      <!-- 精选推荐区域 -->
      <div class="featured-section"
           v-motion
           :initial="{ opacity: 0 }"
           :enter="{ opacity: 1, transition: { delay: 500, duration: 600 } }">
        <div class="section-header with-more">
          <h2 class="section-title">
            <fire-outlined /> 精选推荐
          </h2>
          <a-button type="link" class="view-more-btn">
            查看更多 <right-outlined />
          </a-button>
        </div>

        <div class="featured-list">
          <div v-for="(item, index) in featuredItems" :key="index" class="featured-item"
               v-motion
               :initial="{ opacity: 0, scale: 0.9 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 600 + (index * 150), duration: 500 } }">
            <div class="featured-img-container">
              <img :src="item.image" :alt="item.title" class="featured-img" />
              <div class="featured-overlay">
                <div class="featured-category">{{ item.category }}</div>
                <a-button type="primary" shape="circle" class="view-btn">
                  <template #icon><eye-outlined /></template>
                </a-button>
              </div>
            </div>
            <div class="featured-info">
              <h3 class="featured-title">{{ item.title }}</h3>
              <div class="featured-meta">
                <div class="featured-author">
                  <a-avatar :src="item.author.avatar" :size="24" />
                  <span>{{ item.author.name }}</span>
                </div>
                <div class="featured-stats">
                  <span><heart-outlined /> {{ item.likes }}</span>
                  <span><eye-outlined /> {{ item.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 发现创作者区域 -->
      <div class="creators-section"
           v-motion
           :initial="{ opacity: 0 }"
           :enter="{ opacity: 1, transition: { delay: 700, duration: 600 } }">
        <div class="section-header with-more">
          <h2 class="section-title">
            <user-outlined /> 发现创作者
          </h2>
          <a-button type="link" class="view-more-btn">
            查看更多 <right-outlined />
          </a-button>
        </div>

        <div class="creators-list">
          <div v-for="(creator, index) in popularCreators" :key="index" class="creator-card"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 800 + (index * 100), duration: 500 } }">
            <div class="creator-header">
              <div class="creator-cover" :style="{ backgroundImage: `url(${creator.coverImage})` }"></div>
              <a-avatar :src="creator.avatar" :size="64" class="creator-avatar" />
            </div>
            <div class="creator-info">
              <h3 class="creator-name">{{ creator.name }}</h3>
              <p class="creator-bio">{{ creator.bio }}</p>
              <div class="creator-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ creator.followers }}</div>
                  <div class="stat-label">粉丝</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ creator.works }}</div>
                  <div class="stat-label">作品</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ creator.likes }}</div>
                  <div class="stat-label">获赞</div>
                </div>
              </div>
              <div class="creator-tags">
                <a-tag v-for="(tag, tagIndex) in creator.tags" :key="tagIndex">{{ tag }}</a-tag>
              </div>
              <a-button type="primary" ghost block class="follow-btn">
                <template #icon><plus-outlined /></template>
                关注
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 每日灵感区域 -->
      <div class="daily-inspiration"
           v-motion
           :initial="{ opacity: 0 }"
           :enter="{ opacity: 1, transition: { delay: 900, duration: 600 } }">
        <div class="section-header">
          <h2 class="section-title">
            <bulb-outlined /> 每日灵感
          </h2>
          <a-button type="link" class="refresh-btn" @click="refreshInspiration">
            <reload-outlined /> 换一批
          </a-button>
        </div>

        <div class="inspiration-grid">
          <div v-for="(item, index) in inspirationItems" :key="index"
               class="inspiration-item"
               :class="getInspirationSize(index)"
               v-motion
               :initial="{ opacity: 0, scale: 0.95 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 1000 + (index * 100), duration: 500 } }">
            <img :src="item.image" :alt="item.title" class="inspiration-img" />
            <div class="inspiration-overlay">
              <div class="inspiration-info">
                <h3 class="inspiration-title">{{ item.title }}</h3>
                <div class="inspiration-category">{{ item.category }}</div>
                <div class="inspiration-actions">
                  <a-button type="text" shape="circle" class="action-btn">
                    <template #icon><heart-outlined /></template>
                  </a-button>
                  <a-button type="text" shape="circle" class="action-btn">
                    <template #icon><share-alt-outlined /></template>
                  </a-button>
                  <a-button type="text" shape="circle" class="action-btn">
                    <template #icon><download-outlined /></template>
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门话题区域 -->
      <div class="topics-section"
           v-motion
           :initial="{ opacity: 0 }"
           :enter="{ opacity: 1, transition: { delay: 1100, duration: 600 } }">
        <div class="section-header with-more">
          <h2 class="section-title">
            <message-outlined /> 热门话题
          </h2>
          <a-button type="link" class="view-more-btn">
            查看更多 <right-outlined />
          </a-button>
        </div>

        <div class="topics-list">
          <div v-for="(topic, index) in hotTopics" :key="index" class="topic-card"
               v-motion
               :initial="{ opacity: 0, x: -20 }"
               :enter="{ opacity: 1, x: 0, transition: { delay: 1200 + (index * 100), duration: 500 } }">
            <div class="topic-content">
              <div class="topic-header">
                <a-tag color="#6366f1">{{ topic.category }}</a-tag>
                <span class="topic-time">{{ topic.time }}</span>
              </div>
              <h3 class="topic-title">{{ topic.title }}</h3>
              <p class="topic-desc">{{ topic.description }}</p>
              <div class="topic-stats">
                <span class="topic-stat"><message-outlined /> {{ topic.comments }}</span>
                <span class="topic-stat"><like-outlined /> {{ topic.likes }}</span>
                <span class="topic-stat"><eye-outlined /> {{ topic.views }}</span>
              </div>
            </div>
            <div class="topic-image">
              <img :src="topic.image" :alt="topic.title" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  EyeOutlined,
  HeartOutlined,
  CloudDownloadOutlined,
  FireOutlined,
  RightOutlined,
  UserOutlined,
  PlusOutlined,
  BulbOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  MessageOutlined,
  LikeOutlined,
  AreaChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 趋势期间选择
const trendPeriod = ref('daily');

// 趋势数据
const trends = ref({
  daily: [
    { name: '极简风格UI设计', category: '设计', views: 3240, likes: 1520, downloads: 860, growth: 32 },
    { name: 'Vue3组件库使用技巧', category: '前端', views: 2870, likes: 1340, downloads: 720, growth: 28 },
    { name: '漫威英雄高清壁纸合集', category: '壁纸', views: 2560, likes: 1890, downloads: 1240, growth: 15 },
    { name: 'SpringBoot最佳实践', category: '后端', views: 2150, likes: 980, downloads: 520, growth: 12 },
    { name: '日系插画创作指南', category: '插画', views: 1980, likes: 1420, downloads: 680, growth: -5 },
  ],
  weekly: [
    { name: 'TypeScript高级指南', category: '前端', views: 12540, likes: 5680, downloads: 3210, growth: 45 },
    { name: '现代办公室UI设计', category: '设计', views: 10870, likes: 4920, downloads: 2580, growth: 38 },
    { name: '自然风光摄影作品集', category: '摄影', views: 9240, likes: 6350, downloads: 4120, growth: 24 },
    { name: 'React与Vue对比分析', category: '前端', views: 8450, likes: 3760, downloads: 1950, growth: 18 },
    { name: '动漫角色绘制技巧', category: '插画', views: 7820, likes: 5430, downloads: 2840, growth: -8 },
  ],
  monthly: [
    { name: '全栈开发学习路径', category: '编程', views: 45680, likes: 23450, downloads: 12340, growth: 60 },
    { name: '现代UI设计趋势2025', category: '设计', views: 38790, likes: 19840, downloads: 9870, growth: 52 },
    { name: '艺术创作集锦', category: '艺术', views: 32560, likes: 27980, downloads: 18240, growth: 36 },
    { name: '程序员必备工具推荐', category: '工具', views: 28740, likes: 15680, downloads: 8960, growth: 22 },
    { name: '城市建筑摄影指南', category: '摄影', views: 26450, likes: 18320, downloads: 10240, growth: -12 },
  ]
});

// 当前趋势数据
const currentTrends = computed(() => {
  return trends.value[trendPeriod.value];
});

// 标签颜色映射
const getTagColor = (category: string) => {
  const colorMap: Record<string, string> = {
    '设计': '#f50',
    '前端': '#2db7f5',
    '后端': '#87d068',
    '壁纸': '#722ed1',
    '插画': '#eb2f96',
    '编程': '#52c41a',
    '艺术': '#faad14',
    '工具': '#1890ff',
    '摄影': '#fa8c16'
  };
  return colorMap[category] || '#6366f1';
};

// 精选推荐数据
const featuredItems = ref([
  {
    title: '现代简约UI框架设计',
    category: '设计',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    likes: 1240,
    views: 3560
  },
  {
    title: 'Vue3高性能组件开发',
    category: '前端',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: {
      name: '前端工程师阿杰',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    likes: 980,
    views: 2850
  },
  {
    title: '自然风光摄影集',
    category: '摄影',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: {
      name: '摄影师小王',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    likes: 1560,
    views: 4230
  },
  {
    title: '二次元动漫壁纸精选',
    category: '壁纸',
    image: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: {
      name: '动漫爱好者',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    likes: 2340,
    views: 5670
  }
]);

// 流行创作者数据
const popularCreators = ref([
  {
    name: '设计师大咖',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    coverImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: '专注UI/UX设计，8年行业经验，前阿里巴巴设计师',
    followers: '12.5k',
    works: 86,
    likes: '35.2k',
    tags: ['UI设计', 'Web设计', '移动端']
  },
  {
    name: '前端工程师小陈',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    coverImage: 'https://images.unsplash.com/photo-1608306448197-e83633f1261c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: 'Vue.js核心贡献者，大型前端应用架构专家',
    followers: '8.7k',
    works: 62,
    likes: '24.8k',
    tags: ['Vue', 'TypeScript', '前端架构']
  },
  {
    name: '插画师奈奈',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: '日系插画师，曾为多家游戏公司绘制角色原画',
    followers: '15.3k',
    works: 124,
    likes: '45.6k',
    tags: ['插画', '角色设计', '动漫风格']
  }
]);

// 每日灵感数据
const inspirationItems = ref([
  {
    title: '极简主义办公空间',
    category: '室内设计',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '创意海报设计',
    category: '平面设计',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '自然风光摄影',
    category: '摄影',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '手绘角色插画',
    category: '插画',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '现代Web界面',
    category: 'UI设计',
    image: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '抽象艺术作品',
    category: '艺术',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
]);

// 获取灵感项目的尺寸类名
const getInspirationSize = (index: number) => {
  // 第一个大尺寸，其他小尺寸
  if (index === 0) return 'inspiration-large';
  // 最后一个竖向尺寸
  if (index === inspirationItems.value.length - 1) return 'inspiration-vertical';
  // 其余为标准尺寸
  return '';
};

// 刷新灵感内容
const refreshInspiration = () => {
  message.loading({ content: '正在刷新内容...', duration: 1 });

  // 模拟API调用，真实场景应该调用后端接口
  setTimeout(() => {
    // 这里只是简单地打乱当前数组顺序
    inspirationItems.value = [...inspirationItems.value].sort(() => Math.random() - 0.5);
    message.success('已刷新内容');
  }, 1000);
};

// 热门话题数据
const hotTopics = ref([
  {
    title: '2025年UI设计趋势预测',
    description: '探讨即将到来的2025年，UI设计领域的新趋势和创新方向，从色彩、排版到交互设计的全面解析。',
    category: '设计讨论',
    time: '3小时前',
    comments: 45,
    likes: 128,
    views: 1240,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    title: 'Vue 3.8新特性深度剖析',
    description: '深入解析Vue 3.8版本带来的性能优化、Composition API增强以及工具链更新，助你快速掌握框架新动向。',
    category: '技术分享',
    time: '昨天',
    comments: 67,
    likes: 215,
    views: 2360,
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    title: '如何提高作品曝光率和关注度',
    description: '分享创作者如何在平台上提高作品可见性、获取更多关注的实用技巧和策略，助你的创意被更多人发现。',
    category: '创作攻略',
    time: '2天前',
    comments: 32,
    likes: 95,
    views: 1580,
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  }
]);

// 初始化
onMounted(() => {
  console.log('探索发现页面已加载');
});
</script>

<style scoped>
.explore-page {
  padding: 0 16px 40px;
}

/* 横幅区域样式 */
.banner-container {
  height: 200px;
  margin-bottom: 32px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 2;
}

.banner-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-desc {
  font-size: 18px;
  opacity: 0.9;
}

/* 探索内容区布局 */
.explore-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* 区域标题通用样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header.with-more {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-title .anticon {
  margin-right: 8px;
  color: #6366f1;
}

.view-more-btn {
  font-size: 14px;
  color: #6366f1;
  padding: 0;
  display: flex;
  align-items: center;
}

.view-more-btn .anticon {
  margin-left: 4px;
  font-size: 12px;
}

.refresh-btn {
  font-size: 14px;
  color: #6366f1;
  padding: 0;
  display: flex;
  align-items: center;
}

.refresh-btn .anticon {
  margin-right: 4px;
  font-size: 14px;
}

/* 趋势卡片样式 */
.trends-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.trends-container {
  margin-top: 16px;
}

.trend-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

.trend-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.trend-rank {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
  width: 30px;
  text-align: center;
}

.trend-content {
  flex: 1;
  margin: 0 12px;
}

.trend-name {
  font-weight: 500;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trend-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.trend-stats span {
  display: flex;
  align-items: center;
}

.trend-stats .anticon {
  margin-right: 4px;
  font-size: 12px;
}

.trend-growth {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.trend-growth.positive {
  color: #52c41a;
}

.trend-growth.negative {
  color: #f5222d;
}

.trend-growth .anticon {
  margin-right: 2px;
}

/* 精选推荐区域样式 */
.featured-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.featured-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background: white;
}

.featured-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.featured-img-container {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.featured-item:hover .featured-img {
  transform: scale(1.05);
}

.featured-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.featured-item:hover .featured-overlay {
  opacity: 1;
}

.featured-category {
  background: rgba(99, 102, 241, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.view-btn {
  background-color: white;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.view-btn:hover {
  background-color: #6366f1;
}

.view-btn:hover .anticon {
  color: white;
}

.featured-info {
  padding: 16px;
}

.featured-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.featured-author {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.featured-author span {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.featured-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.featured-stats span {
  display: flex;
  align-items: center;
}

.featured-stats .anticon {
  margin-right: 3px;
}

/* 创作者区域样式 */
.creators-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.creator-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.3s;
}

.creator-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.creator-header {
  position: relative;
  height: 90px;
}

.creator-cover {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.creator-avatar {
  position: absolute;
  bottom: -32px;
  left: 24px;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.creator-info {
  padding: 40px 20px 24px;
}

.creator-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.creator-bio {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.creator-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 16px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.creator-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.creator-tags :deep(.ant-tag) {
  margin: 0;
  font-size: 12px;
}

.follow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-weight: 500;
  border-color: #6366f1;
  color: #6366f1;
}

.follow-btn:hover {
  background-color: #6366f1;
  color: white;
}

.follow-btn .anticon {
  font-size: 14px;
  margin-right: 4px;
}

/* 每日灵感区域样式 */
.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

@media (max-width: 992px) {
  .inspiration-grid {
    grid-template-columns: 1fr 1fr;
  }

  .inspiration-large {
    grid-column: span 2;
  }

  .inspiration-vertical {
    grid-row: span 1;
  }
}

@media (max-width: 576px) {
  .inspiration-grid {
    grid-template-columns: 1fr;
  }

  .inspiration-large,
  .inspiration-vertical {
    grid-column: span 1;
    grid-row: span 1;
  }
}

.inspiration-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 220px;
}

.inspiration-large {
  grid-column: span 2;
  grid-row: span 1;
}

.inspiration-vertical {
  grid-column: span 1;
  grid-row: span 2;
  height: 100%;
}

.inspiration-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.inspiration-item:hover .inspiration-img {
  transform: scale(1.05);
}

.inspiration-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.inspiration-item:hover .inspiration-overlay {
  opacity: 1;
}

.inspiration-info {
  color: white;
}

.inspiration-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.inspiration-category {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 12px;
}

.inspiration-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.action-btn .anticon {
  font-size: 16px;
  color: white;
}

/* 热门话题区域样式 */
.topics-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.topic-card {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.3s;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.topic-content {
  flex: 1;
  padding: 20px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.topic-time {
  font-size: 12px;
  color: #999;
}

.topic-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.topic-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.topic-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.topic-stat {
  display: flex;
  align-items: center;
}

.topic-stat .anticon {
  margin-right: 4px;
  font-size: 14px;
}

.topic-image {
  width: 120px;
  overflow: hidden;
}

.topic-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.topic-card:hover .topic-image img {
  transform: scale(1.05);
}

@media (max-width: 576px) {
  .topic-card {
    flex-direction: column;
  }

  .topic-image {
    width: 100%;
    height: 160px;
    order: -1;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

/* 波纹按钮效果 - 同主页效果保持一致 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  transform: scale(0);
  animation: ripple-effect 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-effect {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}

@media (min-width: 992px) {
  .explore-content {
    grid-template-columns: 300px 1fr;
    gap: 32px;
  }

  .trends-card {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .featured-section {
    grid-column: 2;
    grid-row: 1;
  }

  .creators-section {
    grid-column: 1;
    grid-row: 3;
  }

  .daily-inspiration {
    grid-column: 2;
    grid-row: 2;
  }

  .topics-section {
    grid-column: 1 / span 2;
    grid-row: 4;
  }
}

@media (min-width: 1400px) {
  .explore-content {
    grid-template-columns: 320px 1fr 320px;
  }

  .trends-card {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .featured-section {
    grid-column: 2;
    grid-row: 1;
  }

  .creators-section {
    grid-column: 3;
    grid-row: 1 / span 2;
  }

  .daily-inspiration {
    grid-column: 2;
    grid-row: 2;
  }

  .topics-section {
    grid-column: 1 / span 3;
    grid-row: 3;
  }
}
</style>