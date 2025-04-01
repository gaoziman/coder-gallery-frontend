<template>
  <div class="history-page">
    <!-- 页面标题和统计信息 -->
    <div class="page-header"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="header-title">
        <div class="title-icon">
          <history-outlined />
        </div>
        <h1 class="page-title">浏览历史</h1>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-label">总浏览数</div>
          <div class="stat-value">{{ totalHistory }} <eye-outlined class="stat-icon" /></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日浏览</div>
          <div class="stat-value">{{ todayViews }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">本周热门</div>
          <div class="stat-value">{{ popularCategory }}</div>
        </div>
      </div>
    </div>

    <!-- 视图控制和工具栏 -->
    <div class="view-controls-bar"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }">
      <div class="left-section">
        <a-dropdown :trigger="['click']" class="sort-dropdown">
          <a-button class="sort-button">
            {{ getSortLabel(currentSort) }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu @click="handleSortMenuClick">
              <a-menu-item key="newest">最近浏览</a-menu-item>
              <a-menu-item key="oldest">最早浏览</a-menu-item>
              <a-menu-item key="most">浏览最多</a-menu-item>
              <a-menu-item key="nameAsc">名称 A-Z</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <div class="center-section">
        <!-- 修改后的视图按钮组 - 添加文字 -->
        <div class="view-toggle">
          <a-radio-group v-model:value="viewMode" optionType="button" buttonStyle="solid" size="middle">
            <a-radio-button value="list">
              <div class="view-option-content">
                <unordered-list-outlined />
                <span class="view-option-text">列表视图</span>
              </div>
            </a-radio-button>
            <a-radio-button value="grid">
              <div class="view-option-content">
                <appstore-outlined />
                <span class="view-option-text">网格视图</span>
              </div>
            </a-radio-button>
            <a-radio-button value="timeline">
              <div class="view-option-content">
                <clock-circle-outlined />
                <span class="view-option-text">时间轴视图</span>
              </div>
            </a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <div class="right-section">
        <a-button
            type="primary"
            class="clear-history-btn"
            @click="showClearHistoryModal">
          <template #icon><delete-outlined /></template>
          清除历史
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 500 } }">
      <div class="filter-card">
        <div class="filter-title">
          <h3>快速筛选</h3>
        </div>
        <div class="filter-content">
          <div class="time-filter">
            <a-radio-group v-model:value="timeFilter" button-style="solid">
              <a-radio-button value="all">全部时间</a-radio-button>
              <a-radio-button value="today">今天</a-radio-button>
              <a-radio-button value="week">本周</a-radio-button>
              <a-radio-button value="month">本月</a-radio-button>
            </a-radio-group>
          </div>

          <div class="category-filter">
            <a-select
                v-model:value="selectedCategories"
                mode="multiple"
                placeholder="按分类筛选"
                style="width: 100%"
                :options="categoryOptions">
            </a-select>
          </div>

          <div class="filter-actions">
            <a-button type="primary" @click="applyFilters">应用筛选</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容显示区域 - 根据视图模式切换 -->
    <div class="history-content"
         v-if="filteredHistory.length > 0"
         v-motion
         :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { delay: 500, duration: 600 } }">

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="list-view">
        <a-list
            class="history-list"
            :data-source="filteredHistory"
            :pagination="{ pageSize: 10, hideOnSinglePage: true }"
        >
          <template #renderItem="{ item, index }">
            <a-list-item
                :key="item.id"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 100 * index, duration: 400 } }"
            >
              <a-list-item-meta>
                <template #avatar>
                  <div class="list-item-thumb">
                    <img :src="item.thumbnail" :alt="item.title" />
                  </div>
                </template>
                <template #title>
                  <div class="list-item-title">
                    <span @click="viewItem(item)">{{ item.title }}</span>
                    <a-tag v-if="isToday(item.viewTime)" color="green">今日</a-tag>
                  </div>
                </template>
                <template #description>
                  <div class="list-item-info">
                    <span class="view-time"><clock-circle-outlined /> {{ formatDate(item.viewTime) }}</span>
                    <span class="view-count"><eye-outlined /> 浏览 {{ item.viewCount }} 次</span>
                    <span class="category-tag">
                      <tag-outlined /> {{ item.category }}
                    </span>
                  </div>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="text" @click="viewItem(item)">
                  <eye-outlined />
                </a-button>
                <a-button type="text" @click="addToFavorites(item)">
                  <star-outlined />
                </a-button>
                <a-button type="text" @click="removeFromHistory(item)">
                  <delete-outlined />
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- 改进的网格视图组件 -->
      <div v-else-if="viewMode === 'grid'" class="grid-view">
        <div class="history-grid-container">
          <div class="history-grid">
            <div
                v-for="(item, index) in filteredHistory"
                :key="item.id"
                class="grid-item"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 50 * index, duration: 400 } }"
            >
              <div class="grid-card" @click="viewItem(item)">
                <div class="grid-thumb">
                  <img :src="item.thumbnail" :alt="item.title" />
                  <div class="grid-overlay">
                    <div class="grid-actions">
                      <a-button type="primary" shape="circle" class="grid-action-btn" @click.stop="viewItem(item)">
                        <template #icon><eye-outlined /></template>
                      </a-button>
                      <a-button type="primary" shape="circle" class="grid-action-btn" @click.stop="addToFavorites(item)">
                        <template #icon><star-outlined /></template>
                      </a-button>
                      <a-button type="primary" shape="circle" class="grid-action-btn remove-btn" @click.stop="removeFromHistory(item)">
                        <template #icon><delete-outlined /></template>
                      </a-button>
                    </div>
                  </div>
                  <div class="view-time-badge" v-if="isToday(item.viewTime)">
                    <clock-circle-outlined /> 今日浏览
                  </div>
                </div>
                <div class="grid-info">
                  <div class="grid-title">{{ item.title }}</div>
                  <div class="grid-author">
                    <a-avatar :size="24" :style="{ backgroundColor: getAvatarColor(item.category) }">
                      {{ getAvatarText(item.category) }}
                    </a-avatar>
                    <span class="author-name">{{ getCategoryAuthor(item.category) }}</span>
                  </div>
                  <div class="grid-meta">
                    <span class="view-count"><eye-outlined /> {{ item.viewCount }}</span>
                    <span class="view-time"><clock-circle-outlined /> {{ formatDate(item.viewTime) }}</span>
                  </div>
                  <div class="grid-category">
                    <tag-outlined /> {{ item.category }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间轴视图 -->
      <div v-else class="timeline-view">
        <a-timeline mode="left">
          <a-timeline-item
              v-for="(group, dateKey) in groupedHistory"
              :key="dateKey"
              :color="getTimelineColor(dateKey)"
          >
            <template #dot>
              <calendar-outlined :style="{ fontSize: '16px' }" />
            </template>

            <div class="timeline-date-header">{{ formatDateHeader(dateKey) }}</div>

            <div class="timeline-items-container">
              <div
                  v-for="(item, itemIndex) in group"
                  :key="item.id"
                  class="timeline-item"
                  v-motion
                  :initial="{ opacity: 0, x: -20 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 100 * itemIndex, duration: 400 } }"
              >
                <div class="timeline-item-card" @click="viewItem(item)">
                  <div class="timeline-thumb">
                    <img :src="item.thumbnail" :alt="item.title" />
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ item.title }}</div>
                    <div class="timeline-info">
                      <span class="timeline-time"><clock-circle-outlined /> {{ formatTime(item.viewTime) }}</span>
                      <span class="timeline-category"><tag-outlined /> {{ item.category }}</span>
                      <span class="timeline-views"><eye-outlined /> {{ item.viewCount }}次</span>
                    </div>
                  </div>
                  <div class="timeline-actions">
                    <a-button type="text" shape="circle" size="small" @click.stop="viewItem(item)">
                      <eye-outlined />
                    </a-button>
                    <a-button type="text" shape="circle" size="small" @click.stop="addToFavorites(item)">
                      <star-outlined />
                    </a-button>
                    <a-button type="text" shape="circle" size="small" @click.stop="removeFromHistory(item)">
                      <delete-outlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state"
         v-motion
         :initial="{ opacity: 0, scale: 0.9 }"
         :enter="{ opacity: 1, scale: 1, transition: { delay: 400, duration: 500 } }">
      <a-empty
          :description="isFilterActive ? '没有找到符合条件的浏览记录' : '暂无浏览记录'"
          :image="emptyImage">
        <template #description>
          <div class="empty-description">
            <p>{{ isFilterActive ? '没有找到符合条件的浏览记录' : '暂无浏览记录' }}</p>
            <p class="empty-hint">{{ isFilterActive ? '尝试调整筛选条件' : '浏览内容后，将自动记录在这里' }}</p>
          </div>
        </template>
        <template #extra>
          <a-button v-if="isFilterActive" @click="resetFilters">清除筛选条件</a-button>
          <a-button v-else type="primary" @click="navigateToHome">去浏览内容</a-button>
        </template>
      </a-empty>
    </div>

    <!-- 清除历史确认对话框 -->
    <a-modal
        v-model:visible="clearModalVisible"
        title="清除浏览历史"
        @ok="confirmClearHistory"
        :okText="clearOption === 'all' ? '清除全部' : '确认清除'"
        okType="danger"
        cancelText="取消"
    >
      <p>请选择要清除的浏览记录：</p>
      <a-radio-group v-model:value="clearOption">
        <a-radio value="selected">仅清除筛选结果 ({{ filteredHistory.length }} 项)</a-radio>
        <a-radio value="all">清除全部浏览历史 ({{ totalHistory }} 项)</a-radio>
      </a-radio-group>
      <p class="warning-text">注意：此操作不可恢复，请谨慎操作！</p>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
  EyeOutlined,
  DeleteOutlined,
  StarOutlined,
  DownOutlined,
  TagOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

const router = useRouter();

// 视图模式
const viewMode = ref('list');

// 排序方式
const currentSort = ref('newest');

// 时间筛选
const timeFilter = ref('all');

// 分类筛选
const selectedCategories = ref([]);

// 清除历史对话框相关
const clearModalVisible = ref(false);
const clearOption = ref('selected');

// 模拟用户信息
const userInfo = reactive({
  userId: '001',
  username: '用户名',
});

// 模拟浏览历史数据
const historyData = ref([
  {
    id: '1',
    title: '现代化Vue3组件库设计模式与实践',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '前端开发',
    viewTime: '2025-03-31T15:30:00',
    viewCount: 5,
  },
  {
    id: '2',
    title: '自然风光摄影技巧与后期处理',
    thumbnail: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '摄影',
    viewTime: '2025-03-31T10:15:00',
    viewCount: 2,
  },
  {
    id: '3',
    title: 'UI设计趋势：扁平化到新拟物风格的演变',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '设计',
    viewTime: '2025-03-30T14:45:00',
    viewCount: 3,
  },
  {
    id: '4',
    title: '动漫人物表情绘制教程',
    thumbnail: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '插画',
    viewTime: '2025-03-29T19:20:00',
    viewCount: 1,
  },
  {
    id: '5',
    title: 'Spring Boot微服务架构设计',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '后端开发',
    viewTime: '2025-03-28T11:05:00',
    viewCount: 7,
  },
  {
    id: '6',
    title: '校园四季风光摄影集锦',
    thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '摄影',
    viewTime: '2025-03-27T16:40:00',
    viewCount: 2,
  },
  {
    id: '7',
    title: '现代抽象艺术创作指南',
    thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '艺术',
    viewTime: '2025-03-26T09:15:00',
    viewCount: 3,
  },
  {
    id: '8',
    title: 'TensorFlow深度学习实践与应用',
    thumbnail: 'https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '人工智能',
    viewTime: '2025-03-25T13:25:00',
    viewCount: 4,
  },
  {
    id: '9',
    title: '响应式Web设计与实现',
    thumbnail: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '前端开发',
    viewTime: '2025-03-24T08:50:00',
    viewCount: 6,
  },
  {
    id: '10',
    title: '城市建筑摄影构图技巧',
    thumbnail: 'https://images.unsplash.com/photo-1486728297118-82a07bc48a28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: '摄影',
    viewTime: '2025-03-23T15:10:00',
    viewCount: 3,
  },
]);


// 根据分类生成头像颜色
const getAvatarColor = (category :any) => {
  const colorMap = {
    '前端开发': '#6c5ce7',
    '后端开发': '#0984e3',
    '设计': '#e84393',
    '摄影': '#00b894',
    '插画': '#fdcb6e',
    '人工智能': '#00cec9',
    '艺术': '#e17055'
  };

  return colorMap[category] || '#6c5ce7';
};

// 获取分类的首字母或图标文本
const getAvatarText = (category :any) => {
  const textMap = {
    '前端开发': 'F',
    '后端开发': 'B',
    '设计': 'D',
    '摄影': 'P',
    '插画': 'I',
    '人工智能': 'AI',
    '艺术': 'A'
  };

  return textMap[category] || category.substring(0, 1);
};

// 根据分类生成作者信息
const getCategoryAuthor = (category) => {
  const authorMap = {
    '前端开发': '前端开发者',
    '后端开发': '后端工程师',
    '设计': 'UI设计师',
    '摄影': '摄影师',
    '插画': '插画师',
    '人工智能': 'AI工程师',
    '艺术': '艺术家'
  };

  return authorMap[category] || '创作者';
};

// 计算属性 - 统计数据
const totalHistory = computed(() => historyData.value.length);

const todayViews = computed(() => {
  const today = dayjs().startOf('day');
  return historyData.value.filter(item =>
      dayjs(item.viewTime).isAfter(today)
  ).length;
});

const popularCategory = computed(() => {
  const categoryCount = {};
  historyData.value.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  let maxCategory = '';
  let maxCount = 0;

  Object.keys(categoryCount).forEach(category => {
    if (categoryCount[category] > maxCount) {
      maxCount = categoryCount[category];
      maxCategory = category;
    }
  });

  return maxCategory;
});

// 计算属性 - 筛选是否激活
const isFilterActive = computed(() => {
  return timeFilter.value !== 'all' || selectedCategories.value.length > 0;
});

// 计算属性 - 分类选项
const categoryOptions = computed(() => {
  const categories = new Set();

  historyData.value.forEach(item => {
    categories.add(item.category);
  });

  return Array.from(categories).map(category => ({
    label: category,
    value: category
  }));
});

// 计算属性 - 根据筛选条件过滤历史记录
const filteredHistory = computed(() => {
  let result = [...historyData.value];

  // 按时间筛选
  if (timeFilter.value !== 'all') {
    const now = dayjs();

    result = result.filter(item => {
      const itemTime = dayjs(item.viewTime);

      switch (timeFilter.value) {
        case 'today':
          return itemTime.isAfter(now.startOf('day'));
        case 'week':
          return itemTime.isAfter(now.subtract(7, 'day'));
        case 'month':
          return itemTime.isAfter(now.subtract(30, 'day'));
        default:
          return true;
      }
    });
  }

  // 按分类筛选
  if (selectedCategories.value.length > 0) {
    result = result.filter(item =>
        selectedCategories.value.includes(item.category)
    );
  }

  // 应用排序
  result = sortHistoryItems(result);

  return result;
});

// 计算属性 - 时间轴分组
const groupedHistory = computed(() => {
  const groups = {};

  filteredHistory.value.forEach(item => {
    const dateKey = dayjs(item.viewTime).format('YYYY-MM-DD');

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(item);
  });

  // 确保每组内部也是排序的
  Object.keys(groups).forEach(dateKey => {
    groups[dateKey] = sortHistoryItems(groups[dateKey]);
  });

  return groups;
});

// 获取排序标签文本
const getSortLabel = (sortKey :any) => {
  const sortLabels = {
    newest: '最近浏览',
    oldest: '最早浏览',
    most: '浏览最多',
    nameAsc: '名称 A-Z'
  };

  return sortLabels[sortKey] || '最近浏览';
};

// 应用筛选
const applyFilters = () => {
  message.success('筛选条件已应用');
};

// 重置筛选
const resetFilters = () => {
  timeFilter.value = 'all';
  selectedCategories.value = [];
  message.success('筛选条件已重置');
};

// 排序历史记录
const sortHistoryItems = (items :any) => {
  return [...items].sort((a, b) => {
    switch (currentSort.value) {
      case 'newest':
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
      case 'oldest':
        return dayjs(a.viewTime).valueOf() - dayjs(b.viewTime).valueOf();
      case 'most':
        return b.viewCount - a.viewCount;
      case 'nameAsc':
        return a.title.localeCompare(b.title);
      default:
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
    }
  });
};

// 排序菜单点击处理
const handleSortMenuClick = (e :any) => {
  currentSort.value = e.key;
  message.success(`已按${getSortLabel(e.key)}排序`);
};

// 判断是否为今天
const isToday = (dateString :any) => {
  return dayjs(dateString).isAfter(dayjs().startOf('day'));
};

// 格式化日期
const formatDate = (dateString :any) => {
  const now = dayjs();
  const date = dayjs(dateString);

  if (date.isAfter(now.startOf('day'))) {
    return `今天 ${date.format('HH:mm')}`;
  } else if (date.isAfter(now.subtract(1, 'day').startOf('day'))) {
    return `昨天 ${date.format('HH:mm')}`;
  } else if (date.isAfter(now.subtract(7, 'day'))) {
    return `${date.format('ddd')} ${date.format('HH:mm')}`;
  } else {
    return date.format('YYYY-MM-DD');
  }
};

// 格式化时间
const formatTime = (dateString) => {
  return dayjs(dateString).format('HH:mm');
};

// 格式化日期头部
const formatDateHeader = (dateString) => {
  const now = dayjs();
  const date = dayjs(dateString);

  if (date.isSame(now, 'day')) {
    return '今天';
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天';
  } else if (date.isAfter(now.subtract(7, 'day'))) {
    return `${date.format('dddd')}`;
  } else {
    return date.format('YYYY年MM月DD日');
  }
};

// 获取时间轴颜色
const getTimelineColor = (dateString) => {
  const now = dayjs();
  const date = dayjs(dateString);

  if (date.isSame(now, 'day')) {
    return '#52c41a'; // 今天 - 绿色
  } else if (date.isAfter(now.subtract(3, 'day'))) {
    return '#1890ff'; // 最近3天 - 蓝色
  } else if (date.isAfter(now.subtract(7, 'day'))) {
    return '#722ed1'; // 一周内 - 紫色
  } else {
    return '#d9d9d9'; // 更早 - 灰色
  }
};

// 查看项目
const viewItem = (item) => {
  message.info(`查看: ${item.title}`);
  // 实际应用中跳转到详情页
  // router.push({ path: `/detail/${item.id}` });
};

// 添加到收藏
const addToFavorites = (item) => {
  message.success(`已添加到收藏: ${item.title}`);
};

// 从历史记录中移除
const removeFromHistory = (item) => {
  Modal.confirm({
    title: '确认移除',
    content: `确定要将"${item.title}"从浏览历史中移除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const index = historyData.value.findIndex(i => i.id === item.id);
      if (index !== -1) {
        historyData.value.splice(index, 1);
        message.success('记录已移除');
      }
    }
  });
};

// 显示清除历史确认对话框
const showClearHistoryModal = () => {
  clearModalVisible.value = true;
  clearOption.value = 'selected';
};

// 确认清除历史
const confirmClearHistory = () => {
  if (clearOption.value === 'all') {
    historyData.value = [];
    message.success('所有浏览历史已清除');
  } else {
    // 仅清除筛选结果
    const itemIds = new Set(filteredHistory.value.map(item => item.id));
    historyData.value = historyData.value.filter(item => !itemIds.has(item.id));
    message.success(`已清除 ${itemIds.size} 条浏览记录`);
  }
  clearModalVisible.value = false;
};

// 导航到主页
const navigateToHome = () => {
  router.push('/');
};



onMounted(() => {
  // 模拟从API获取数据
  // 实际应用中这里会通过API获取历史记录数据
  console.log('页面加载完成，已获取浏览历史数据');
});
</script>
<style scoped>
/* 基础页面样式 */
.history-page {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面标题和统计区域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.header-title {
  display: flex;
  align-items: center;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #6c5ce7;
  border-radius: 12px;
  margin-right: 16px;
}

.title-icon :deep(.anticon) {
  font-size: 28px;
  color: white;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.header-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
  min-width: 100px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  color: #6c5ce7;
  margin-left: 6px;
  font-size: 18px;
}

/* 视图控制和工具栏 */
.view-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.left-section, .right-section {
  flex: 1;
}

.right-section {
  display: flex;
  justify-content: flex-end;
}

.center-section {
  display: flex;
  justify-content: center;
}

/* 视图切换按钮组 - 带文字版本 */
.view-toggle {
  display: flex;
  justify-content: center;
}

.view-toggle :deep(.ant-radio-group) {
  padding: 2px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
}

.view-toggle :deep(.ant-radio-button-wrapper) {
  height: 36px;
  padding: 0 12px;
  border: none !important;
  background: transparent;
  color: #666;
  box-shadow: none !important;
  transition: all 0.2s;
  border-radius: 6px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle :deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

.view-toggle :deep(.ant-radio-button-wrapper-checked) {
  background-color: #6c5ce7;
  color: white;
}

.view-toggle :deep(.ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked):hover) {
  color: #6c5ce7;
  background-color: rgba(108, 92, 231, 0.1);
}

.view-option-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

.view-option-text {
  font-size: 14px;
  font-weight: 500;
}

.view-toggle :deep(.ant-radio-button-wrapper .anticon) {
  font-size: 16px;
  margin-right: 0;
}

/* 视图控制和工具栏 */
.view-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.left-section, .right-section {
  flex: 1;
}

.right-section {
  display: flex;
  justify-content: flex-end;
}

.center-section {
  flex: 2;
  display: flex;
  justify-content: center;
}

/* 清除历史按钮 - 紫色 */
.clear-history-btn {
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-weight: 500;
  border-radius: 6px;
  background-color: #6c5ce7 !important;
  border-color: #6c5ce7 !important;
  color: white !important;
  transition: all 0.2s;
}

.clear-history-btn:hover {
  background-color: #5b4dc7 !important;
  border-color: #5b4dc7 !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(108, 92, 231, 0.3);
}

.clear-history-btn :deep(.anticon) {
  margin-right: 6px;
  font-size: 16px;
}

/* 排序下拉按钮 */
.sort-dropdown {
  min-width: 120px;
}

.sort-button {
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #333;
  border-color: #e0e0e0;
  background-color: #f9f9f9;
  border-radius: 6px;
  transition: all 0.2s;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .view-option-text {
    display: none;
  }

  .view-toggle :deep(.ant-radio-button-wrapper) {
    padding: 0;
    width: 36px;
  }
}

@media (max-width: 768px) {
  .view-controls-bar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .left-section {
    order: 1;
    flex: 0 0 100%;
  }

  .center-section {
    order: 3;
    width: 100%;
    flex: 0 0 100%;
  }

  .right-section {
    order: 2;
    flex: 0 0 100%;
  }

  .sort-dropdown, .sort-button, .clear-history-btn {
    width: 100%;
  }

  .view-option-text {
    display: inline-block;
  }

  .view-toggle :deep(.ant-radio-button-wrapper) {
    flex: 1;
    padding: 0 12px;
  }
}

/* 网格视图CSS - 增强特异性以覆盖全局样式 */
.history-page .grid-view {
  margin-bottom: 30px !important;
}

/* 外层容器 */
.history-page .history-grid-container {
  width: 100% !important;
  display: block !important;
  overflow: visible !important;
  background-color: white !important;
  border-radius: 12px !important;
  padding: 20px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

/* 网格布局 - 注意使用important确保样式不被覆盖 */
.history-page .history-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
  gap: 24px !important;
  width: 100% !important;
  margin: 0 !important;
}

/* 网格项目容器 */
.history-page .grid-item {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  margin-bottom: 0 !important;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
  position: relative !important;
}

.history-page .grid-view {
  display: block !important;
  width: 100% !important;
  column-count: 1 !important; /* 禁用任何列布局 */
  column-gap: 0 !important;
  column-width: auto !important;
}


/* 悬浮效果 */
.history-page .grid-item:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

/* 卡片主体 */
.history-page .grid-card {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 300px !important; /* 设置最小高度确保卡片不会太小 */
}

/* 图片容器 */
.history-page .grid-thumb {
  width: 100% !important;
  height: 0 !important;
  padding-bottom: 65% !important; /* 约3:2的宽高比 */
  position: relative !important;
  overflow: hidden !important;
}

/* 图片样式 */
.history-page .grid-thumb img {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  transition: transform 0.5s ease !important;
}

/* 图片悬浮效果 */
.history-page .grid-card:hover .grid-thumb img {
  transform: scale(1.08) !important;
}

/* 图片覆盖层 */
.history-page .grid-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.4) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease !important;
  pointer-events: none !important;
}

/* 悬浮时显示覆盖层 */
.history-page .grid-card:hover .grid-overlay {
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* 操作按钮容器 */
.history-page .grid-actions {
  display: flex !important;
  gap: 12px !important;
  z-index: 5 !important;
}

/* 通用按钮样式 */
.history-page .grid-action-btn,
.history-page .grid-action-btn[type="button"] {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  padding: 0 !important;
  background-color: white !important;
  color: #333 !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease !important;
  margin: 0 !important;
  cursor: pointer !important;
}

/* 按钮悬浮效果 */
.history-page .grid-action-btn:hover {
  transform: scale(1.15) !important;
  background-color: #6366F1 !important;
}

/* 按钮内图标悬浮效果 */
.history-page .grid-action-btn:hover .anticon {
  color: white !important;
}

/* 删除按钮特殊效果 */
.history-page .grid-action-btn.remove-btn:hover {
  background-color: #ff4d4f !important;
}

/* 图标样式 */
.history-page .grid-action-btn .anticon {
  font-size: 18px !important;
  color: #333 !important;
  transition: color 0.3s ease !important;
}

/* 时间标签 */
.history-page .view-time-badge {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  color: white !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  border-radius: 8px 0 0 0 !important;
  z-index: 2 !important;
}

/* 内容信息区 */
.history-page .grid-info {
  padding: 16px !important;
  flex-grow: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: white !important;
}

/* 标题样式 */
.history-page .grid-title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #333 !important;
  margin-bottom: 12px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  line-height: 1.4 !important;
  height: 2.8em !important;
}

/* 作者信息 */
.history-page .grid-author {
  display: flex !important;
  align-items: center !important;
  margin-bottom: 12px !important;
}

/* 作者名称 */
.history-page .author-name {
  margin-left: 8px !important;
  font-size: 14px !important;
  color: #666 !important;
}

/* 元数据信息 */
.history-page .grid-meta {
  display: flex !important;
  justify-content: space-between !important;
  font-size: 13px !important;
  color: #666 !important;
  margin-bottom: 12px !important;
}

/* 元数据项 */
.history-page .grid-meta span {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

/* 元数据图标 */
.history-page .grid-meta .anticon {
  font-size: 14px !important;
}

/* 分类标签 */
.history-page .grid-category {
  margin-top: auto !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 13px !important;
  color: #6366F1 !important;
  background-color: rgba(99, 102, 241, 0.1) !important;
  border-radius: 4px !important;
  padding: 5px 10px !important;
  width: fit-content !important;
}

/* 响应式布局 */
@media (max-width: 1280px) {
  .history-page .history-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 992px) {
  .history-page .history-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .history-page .history-grid {
    grid-template-columns: 1fr !important;
  }
}


/* 时间轴视图样式优化 */
.timeline-view {
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.timeline-view :deep(.ant-timeline) {
  margin: 0 20px;
}

.timeline-view :deep(.ant-timeline-item-head) {
  background-color: #fff;
  width: 20px;
  height: 20px;
}

.timeline-view :deep(.ant-timeline-item-tail) {
  left: 10px;
  border-left: 2px solid #e8e8e8;
}

.timeline-date-header {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.timeline-date-header::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 40px;
  height: 3px;
  background-color: #6c5ce7;
  border-radius: 2px;
}

.timeline-items-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
  margin-left: 10px;
}

.timeline-item-card {
  display: flex;
  align-items: center;
  background-color: #f9f9ff;
  border-radius: 10px;
  padding: 12px;
  transition: all 0.25s;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.timeline-item-card:hover {
  background-color: #f0f0ff;
  transform: translateX(6px);
  box-shadow: 0 3px 8px rgba(108, 92, 231, 0.1);
}

.timeline-thumb {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.timeline-item-card:hover .timeline-thumb img {
  transform: scale(1.05);
}

.timeline-content {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.timeline-item-card:hover .timeline-title {
  color: #6c5ce7;
}

.timeline-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.timeline-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-time :deep(.anticon) {
  color: #f39c12;
}

.timeline-category :deep(.anticon) {
  color: #2ecc71;
}

.timeline-views :deep(.anticon) {
  color: #3498db;
}

.timeline-actions {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}

.timeline-actions :deep(.ant-btn) {
  width: 32px;
  height: 32px;
  min-width: unset;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
  border: 1px solid #f0f0f0;
}

.timeline-actions :deep(.ant-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.timeline-actions :deep(.ant-btn:nth-child(1):hover) {
  color: #3498db;
  border-color: #3498db;
}

.timeline-actions :deep(.ant-btn:nth-child(2):hover) {
  color: #f1c40f;
  border-color: #f1c40f;
}

.timeline-actions :deep(.ant-btn:nth-child(3):hover) {
  color: #e74c3c;
  border-color: #e74c3c;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .view-buttons {
    min-width: 100%;
  }

  .timeline-view {
    padding: 16px;
  }

  .timeline-view :deep(.ant-timeline) {
    margin: 0 10px;
  }

  .timeline-item-card {
    flex-wrap: wrap;
  }

  .timeline-content {
    flex: 1 0 calc(100% - 90px);
  }

  .timeline-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
    margin-top: 10px;
  }

  .timeline-thumb {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 768px) {
  .timeline-item-card {
    padding: 10px;
  }

  .timeline-thumb {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .timeline-title {
    font-size: 15px;
  }

  .timeline-info {
    gap: 8px;
    font-size: 12px;
  }

  .timeline-date-header {
    font-size: 16px;
  }
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-title {
  margin-bottom: 16px;
}

.filter-title h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.time-filter {
  flex: 0 0 auto;
}

.time-filter :deep(.ant-radio-group) {
  display: flex;
}

.time-filter :deep(.ant-radio-button-wrapper) {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.category-filter {
  flex: 1;
  min-width: 200px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-actions button {
  height: 32px;
}

/* 列表视图样式 */
.list-view {
  margin-bottom: 30px;
}

.history-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.history-list :deep(.ant-list-item) {
  padding: 16px 20px;
  transition: all 0.2s;
}

.history-list :deep(.ant-list-item:hover) {
  background-color: #f9f9ff;
}

.list-item-thumb {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.list-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-item-title span {
  cursor: pointer;
  transition: color 0.2s;
}

.list-item-title span:hover {
  color: #6c5ce7;
}

.list-item-info {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 13px;
}

.list-item-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.list-item-info :deep(.anticon) {
  font-size: 14px;
  color: #999;
}


/* 时间轴视图样式 */
.timeline-view {
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.timeline-view :deep(.ant-timeline) {
  margin: 0 20px;
}

.timeline-date-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.timeline-item-card {
  display: flex;
  align-items: center;
  background-color: #f9f9ff;
  border-radius: 8px;
  padding: 10px;
  transition: all 0.2s;
  cursor: pointer;
}

.timeline-item-card:hover {
  background-color: #f0f0ff;
  transform: translateX(5px);
}

.timeline-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.timeline-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timeline-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.timeline-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-info :deep(.anticon) {
  font-size: 14px;
  color: #6c5ce7;
}

.timeline-actions {
  display: flex;
  gap: 4px;
  margin-left: 10px;
}

.timeline-actions :deep(.ant-btn) {
  width: 28px;
  height: 28px;
  min-width: unset;
  padding: 0;
}

.timeline-actions :deep(.anticon) {
  font-size: 14px;
}

/* 空状态样式 */
.empty-state {
  padding: 48px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.empty-description {
  margin: 16px 0;
}

.empty-description p {
  margin: 4px 0;
}

.empty-hint {
  color: #888;
  font-size: 14px;
}

/* 清除历史对话框样式 */
.warning-text {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 16px;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
    margin-top: 20px;
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .view-controls-bar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .dropdown-section,
  .action-section {
    flex: 0 0 100%;
    padding: 0;
  }

  .view-buttons {
    order: 3;
    min-width: 100%;
  }

  .sort-dropdown {
    width: 100%;
  }

  .sort-button {
    width: 100%;
  }

  .clear-history-btn {
    width: 100%;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .time-filter,
  .category-filter {
    width: 100%;
  }

  .time-filter :deep(.ant-radio-group) {
    width: 100%;
  }

  .time-filter :deep(.ant-radio-button-wrapper) {
    flex: 1;
    padding: 0 4px;
    justify-content: center;
  }

  .filter-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .timeline-item-card {
    flex-wrap: wrap;
  }

  .timeline-content {
    flex: 1 0 60%;
    margin-bottom: 8px;
  }

  .timeline-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .header-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stat-item {
    text-align: left;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-value {
    justify-content: flex-start;
  }

  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .list-item-thumb {
    width: 60px;
    height: 45px;
  }

  .timeline-item-card {
    padding: 8px;
  }

  .timeline-thumb {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .timeline-title {
    font-size: 14px;
  }

  .timeline-info {
    gap: 8px;
    font-size: 12px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active {
  animation: fadeIn 0.3s ease-out;
}

/* 增强的交互效果 */
.list-item-info .view-time :deep(.anticon) {
  color: #f39c12;
}

.list-item-info .view-count :deep(.anticon) {
  color: #3498db;
}

.list-item-info .category-tag :deep(.anticon) {
  color: #2ecc71;
}

.timeline-item-card:hover .timeline-title {
  color: #6c5ce7;
}

/* 分页样式美化 */
.history-list :deep(.ant-pagination) {
  margin: 16px 0;
  padding: 0 16px 16px;
}

.history-list :deep(.ant-pagination-item-active) {
  background-color: #6c5ce7;
  border-color: #6c5ce7;
}

.history-list :deep(.ant-pagination-item-active a) {
  color: white;
}

.history-list :deep(.ant-pagination-item:hover) {
  border-color: #6c5ce7;
}

.history-list :deep(.ant-pagination-item:hover a) {
  color: #6c5ce7;
}

/* 列表项操作按钮悬停效果 */
.history-list :deep(.ant-list-item-action-split) {
  display: none;
}

.history-list :deep(.ant-list-item-action li .ant-btn) {
  transition: all 0.2s;
}

.history-list :deep(.ant-list-item-action li:nth-child(1) .ant-btn:hover) {
  color: #3498db;
}

.history-list :deep(.ant-list-item-action li:nth-child(2) .ant-btn:hover) {
  color: #f1c40f;
}

.history-list :deep(.ant-list-item-action li:nth-child(3) .ant-btn:hover) {
  color: #e74c3c;
}
</style>