<!-- BrowsingHistoryPage.vue -->
<template>
  <div class="browsing-history-page">
    <!-- 页面标题和状态 -->
    <div class="page-header"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="header-content">
        <h1 class="page-title">最近浏览</h1>
        <div class="history-stats">
          <a-statistic title="浏览项目" :value="totalHistoryItems" class="stat-item">
            <template #suffix>
              <eye-outlined style="color: #6366f1" />
            </template>
          </a-statistic>
          <a-statistic title="今日浏览" :value="todayViewCount" class="stat-item" />
          <a-statistic title="最近更新" :value="formatDate(latestViewDate)" class="stat-item" />
        </div>
      </div>
    </div>

    <!-- 浏览历史管理工具栏 -->
    <a-card class="tools-card"
            :bordered="false"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 600 } }">
      <div class="tools-header">
        <div class="view-controls">
          <a-radio-group v-model:value="viewMode" button-style="solid">
            <a-radio-button value="grid">
              <template #icon><appstore-outlined /></template>
              网格视图
            </a-radio-button>
            <a-radio-button value="list">
              <template #icon><unordered-list-outlined /></template>
              列表视图
            </a-radio-button>
            <a-radio-button value="timeline">
              <template #icon><calendar-outlined /></template>
              时间轴
            </a-radio-button>
          </a-radio-group>
        </div>

        <div class="tools-actions">
          <a-dropdown :trigger="['click']">
            <a-button class="sort-dropdown">
              排序方式: {{ getSortLabel(currentSort) }}
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu @click="handleSortMenuClick">
                <a-menu-item key="latest">最近浏览</a-menu-item>
                <a-menu-item key="earliest">最早浏览</a-menu-item>
                <a-menu-item key="mostViewed">最常浏览</a-menu-item>
                <a-menu-item key="nameAsc">名称 A-Z</a-menu-item>
                <a-menu-item key="nameDesc">名称 Z-A</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-button
              type="primary"
              class="clear-history-btn"
              @click="showClearHistoryModal"
              @mousedown="addRippleEffect">
            <template #icon><delete-outlined /></template>
            清除历史
          </a-button>
        </div>
      </div>

      <!-- 时间范围筛选 -->
      <div class="filter-section">
        <div class="section-title">
          <h3>时间筛选</h3>
        </div>

        <div class="time-range-filter">
          <a-radio-group v-model:value="timeRange" button-style="solid" @change="applyTimeFilter">
            <a-radio-button value="all">所有时间</a-radio-button>
            <a-radio-button value="today">今天</a-radio-button>
            <a-radio-button value="yesterday">昨天</a-radio-button>
            <a-radio-button value="week">本周</a-radio-button>
            <a-radio-button value="month">本月</a-radio-button>
          </a-radio-group>

          <a-range-picker
              v-model:value="customDateRange"
              :disabled="timeRange !== 'custom'"
              :disabledDate="disabledFutureDate"
              @change="handleCustomDateChange"
              @click="enableCustomRange" />
        </div>
      </div>

      <!-- 内容筛选 -->
      <div class="filter-section">
        <div class="section-title">
          <h3>内容筛选</h3>
        </div>

        <div class="filter-options">
          <a-select
              v-model:value="selectedCategories"
              mode="multiple"
              placeholder="按分类筛选"
              style="width: 220px"
              :options="categoryOptions"
              @change="handleFilterChange"
          />

          <a-select
              v-model:value="selectedAuthors"
              mode="multiple"
              placeholder="按作者筛选"
              style="width: 220px"
              :options="authorOptions"
              @change="handleFilterChange"
          />

          <a-select
              v-model:value="selectedTags"
              mode="multiple"
              placeholder="按标签筛选"
              style="width: 220px"
              :options="tagOptions"
              @change="handleFilterChange"
          />

          <a-button type="primary" @click="applyFilters">
            应用筛选
          </a-button>
          <a-button @click="resetFilters">
            重置
          </a-button>
        </div>
      </div>

      <!-- 活跃筛选器通知 -->
      <div v-if="isFilterActive" class="active-filter-alert">
        <a-alert type="info" show-icon>
          <template #message>
            <div class="active-filter-info">
              <span>当前已应用 <b>{{ activeFilterCount }}</b> 个筛选条件</span>
              <a-button type="link" size="small" @click="resetFilters">
                清除全部
              </a-button>
            </div>
          </template>
        </a-alert>
      </div>
    </a-card>

    <!-- 浏览历史内容展示 -->
    <div
        :class="{
          'history-grid': viewMode === 'grid',
          'history-list': viewMode === 'list',
          'history-timeline': viewMode === 'timeline'
        }"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }">

      <!-- 网格视图模式 -->
      <template v-if="viewMode === 'grid' && filteredHistory.length > 0">
        <div
            v-for="(item, index) in filteredHistory"
            :key="index"
            class="history-item"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 1000 + (index * 100),
              duration: 500,
              ease: 'easeOut'
            }
          }"
        >
          <div class="history-card" @click="navigateToDetail(item)">
            <div class="image-container">
              <img :src="item.src" :alt="item.title" class="history-image" />
              <div class="image-actions-overlay">
                <a-button type="text" class="image-action-btn" @click.stop="viewItem(item)">
                  <template #icon><eye-outlined /></template>
                </a-button>
                <a-button type="text" class="image-action-btn" @click.stop="addToFavorites(item)">
                  <template #icon><star-outlined /></template>
                </a-button>
                <a-button
                    type="text"
                    class="image-action-btn remove-btn"
                    @click.stop="removeFromHistory(item)"
                >
                  <template #icon><delete-outlined /></template>
                </a-button>
              </div>
              <div class="view-count-badge" v-if="item.viewCount > 1">
                浏览 {{ item.viewCount }} 次
              </div>
              <div class="view-time">
                {{ formatTimeAgo(item.lastViewedAt) }}
              </div>
            </div>
            <div class="history-info">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-author">
                <a-avatar :src="item.author.avatar" :size="24" />
                <span class="author-name">{{ item.author.name }}</span>
              </div>
              <div class="history-tags">
                <a-tag v-for="(tag, tagIdx) in item.tags.slice(0, 2)" :key="tagIdx" class="history-tag">
                  {{ tag.name }}
                </a-tag>
                <a-tag v-if="item.tags.length > 2" class="history-tag more-tag">
                  +{{ item.tags.length - 2 }}
                </a-tag>
              </div>
              <div class="history-category">
                <folder-outlined />
                <span>{{ item.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 列表视图模板 - 替换原有模板 -->
      <template v-if="viewMode === 'list' && filteredHistory.length > 0">
        <div class="history-list">
          <!-- 按日期分组的列表视图 -->
          <div v-for="(dateGroup, date) in groupedByDate" :key="date">
            <!-- 日期指示器 -->
            <div class="timeline-date-indicator">
              <div class="timeline-date-text">{{ formatDateLabel(date) }}</div>
              <div class="timeline-date-line"></div>
            </div>

            <!-- 该日期下的历史记录项 -->
            <a-list
                class="history-list-container"
                item-layout="horizontal"
                :data-source="dateGroup"
            >
              <template #renderItem="{ item, index }">
                <a-list-item :key="item.id">
                  <!-- 未读标记 (可基于业务逻辑添加条件) -->
                  <div class="list-item-unread" v-if="item.viewCount === 1"></div>

                  <div class="list-item-content-wrapper">
                    <!-- 左侧图片区域 -->
                    <div class="list-item-image-section" @click="navigateToDetail(item)">
                      <div class="list-item-image-container">
                        <img :src="item.src" class="list-item-image" />
                        <div class="image-overlay"></div>

                        <!-- 浏览次数标记 -->
                        <div class="view-count-indicator" v-if="item.viewCount > 1">
                          <eye-outlined />
                          {{ item.viewCount }}
                        </div>

                        <!-- 浏览进度条 -->
                        <div
                            class="history-progress-bar"
                            :style="{ width: `${Math.min(item.viewCount * 20, 100)}%` }">
                        </div>
                      </div>
                    </div>

                    <!-- 右侧内容区域 -->
                    <div class="list-item-info-section">
                      <!-- 顶部信息栏 -->
                      <div class="item-top-info">
                        <div class="item-category">
                          <folder-outlined />
                          {{ item.category }}
                        </div>
                        <div class="item-view-time">
                          <clock-circle-outlined />
                          {{ formatTimeAgo(item.lastViewedAt) }}
                        </div>
                      </div>

                      <!-- 标题 -->
                      <div class="list-item-title" @click="navigateToDetail(item)">
                        {{ item.title }}
                      </div>

                      <!-- 中间内容区 -->
                      <div class="item-middle-content">
                        <!-- 作者信息 -->
                        <div class="list-item-author">
                          <a-avatar :src="item.author.avatar" :size="24" class="author-avatar" />
                          <div class="author-info">
                            <div class="author-name">{{ item.author.name }}</div>
                            <div class="author-role">{{ getAuthorRole(item.category) }}</div>
                          </div>
                        </div>

                        <!-- 标签 -->
                        <div class="list-item-tags">
                          <a-tag
                              v-for="(tag, tagIdx) in item.tags"
                              :key="tagIdx"
                              class="history-tag"
                              :color="tag.color ? tag.color : undefined">
                            {{ tag.name }}
                          </a-tag>
                        </div>
                      </div>

                      <!-- 底部信息栏 -->
                      <div class="item-bottom-info">
                        <div class="item-metadata">
                          <div class="metadata-item">
                            <eye-outlined />
                            {{ item.viewCount }} 次浏览
                          </div>
                          <div class="metadata-item">
                            <calendar-outlined />
                            {{ formatDate(item.firstViewedAt) }}
                          </div>
                        </div>

                        <div class="item-actions">
                          <a-button
                              type="text"
                              class="action-btn"
                              @click.stop="viewItem(item)"
                              title="查看">
                            <template #icon><eye-outlined /></template>
                          </a-button>
                          <a-button
                              type="text"
                              class="action-btn"
                              @click.stop="addToFavorites(item)"
                              title="收藏">
                            <template #icon><star-outlined /></template>
                          </a-button>
                          <a-button
                              type="text"
                              class="action-btn remove-btn"
                              @click.stop="removeFromHistory(item)"
                              title="删除">
                            <template #icon><delete-outlined /></template>
                          </a-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>
      </template>

      <!-- 时间轴视图模式 -->
      <template v-else-if="viewMode === 'timeline' && filteredHistory.length > 0">
        <div class="history-timeline-container">
          <a-timeline mode="left">
            <a-timeline-item v-for="(dateGroup, date) in groupedByDate" :key="date">
              <template #dot>
                <calendar-outlined style="font-size: 16px;" />
              </template>
              <template #label>
                <div class="timeline-date">{{ formatDateLabel(date) }}</div>
              </template>

              <div class="timeline-group">
                <div
                    v-for="(item, itemIndex) in dateGroup"
                    :key="itemIndex"
                    class="timeline-item"
                    v-motion
                    :initial="{ opacity: 0, x: 30 }"
                    :enter="{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 200 + (itemIndex * 100),
                      duration: 500,
                    }
                  }"
                >
                  <div class="timeline-item-time">{{ formatTime(item.lastViewedAt) }}</div>
                  <div class="timeline-item-card" @click="navigateToDetail(item)">
                    <div class="timeline-item-content">
                      <img :src="item.src" class="timeline-item-image" />
                      <div class="timeline-item-info">
                        <div class="timeline-item-title">{{ item.title }}</div>
                        <div class="timeline-item-author">
                          <a-avatar :src="item.author.avatar" :size="20" />
                          <span>{{ item.author.name }}</span>
                        </div>
                        <div class="timeline-item-tags">
                          <a-tag v-for="(tag, tagIdx) in item.tags.slice(0, 2)" :key="tagIdx" class="history-tag small">
                            {{ tag.name }}
                          </a-tag>
                        </div>
                      </div>
                    </div>
                    <div class="timeline-item-actions">
                      <a-button type="text" size="small" @click.stop="viewItem(item)">
                        <eye-outlined />
                      </a-button>
                      <a-button type="text" size="small" @click.stop="addToFavorites(item)">
                        <star-outlined />
                      </a-button>
                      <a-button type="text" size="small" @click.stop="removeFromHistory(item)">
                        <delete-outlined />
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-history">
        <a-empty
            :description="isFilterActive ? '没有找到符合条件的浏览记录' : '你还没有浏览任何内容'"
            :image="isFilterActive ? 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg' : undefined"
        >
          <template #extra>
            <div class="empty-actions">
              <a-button v-if="isFilterActive" type="primary" @click="resetFilters">清除筛选条件</a-button>
              <a-button v-else type="primary" @click="goToHomePage">去浏览图库</a-button>
            </div>
          </template>
        </a-empty>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="filteredHistory.length > 0 && hasMoreItems" class="load-more">
      <a-button type="primary" class="load-more-btn" @click="loadMore">
        加载更多
        <template #icon><down-outlined /></template>
      </a-button>
    </div>

    <!-- 批量操作悬浮工具栏 -->
    <div v-if="selectedItems.length > 0" class="batch-actions-bar">
      <div class="batch-info">
        已选择 <b>{{ selectedItems.length }}</b> 项
      </div>
      <div class="batch-buttons">
        <a-button @click="clearSelection">取消选择</a-button>
        <a-button type="primary" @click="batchAddToFavorites">
          <template #icon><star-outlined /></template>
          批量收藏
        </a-button>
        <a-button danger @click="confirmBatchRemove">
          <template #icon><delete-outlined /></template>
          批量删除
        </a-button>
      </div>
    </div>

    <!-- 清除历史确认对话框 -->
    <a-modal
        v-model:visible="clearHistoryModalVisible"
        title="清除浏览历史"
        @ok="clearHistory"
        okText="确定"
        cancelText="取消"
        okType="danger"
    >
      <div class="clear-history-options">
        <a-radio-group v-model:value="clearHistoryOption">
          <a-radio value="all">清除所有浏览历史</a-radio>
          <a-radio value="filtered" :disabled="!isFilterActive">仅清除当前筛选的历史记录</a-radio>
          <a-radio value="before">清除特定日期之前的历史</a-radio>
        </a-radio-group>

        <div class="clear-date-selector" v-if="clearHistoryOption === 'before'">
          <a-date-picker
              v-model:value="clearBeforeDate"
              :disabledDate="disabledFutureDate"
              placeholder="选择日期" />
        </div>
      </div>
      <div class="clear-warning" v-if="clearHistoryOption === 'all'">
        <a-alert type="warning" show-icon message="所有浏览历史将被永久删除，无法恢复" />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  DownOutlined,
  EyeOutlined,
  StarOutlined,
  DeleteOutlined,
  FolderOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useIntersectionObserver } from "@vueuse/core";

// 配置dayjs插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();

// 视图模式 - 网格/列表/时间轴
const viewMode = ref('grid');

// 当前排序
const currentSort = ref('latest');

// 浏览历史数据 - 修复：增加多个示例数据以便测试分组和筛选功能
const historyItems = ref([
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'macbook-abstract-40',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '海报', color: 'purple' },
      { name: 'Mac壁纸', color: '' },
    ],
    category: '设计素材',
    viewCount: 3,
    firstViewedAt: '2025-03-25 10:15:00',
    lastViewedAt: '2025-03-25 15:20:00',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Spring Boot项目结构',
    author: {
      name: 'Java大神',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'SpringBoot', color: 'blue' },
      { name: '代码', color: '' },
    ],
    category: '代码参考',
    viewCount: 5,
    firstViewedAt: '2025-03-25 09:30:00',
    lastViewedAt: '2025-03-25 14:45:00',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '自然风光摄影集',
    author: {
      name: '摄影师小王',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '风景', color: 'blue' },
      { name: '高清', color: '' },
    ],
    category: '壁纸',
    viewCount: 2,
    firstViewedAt: '2025-03-24 16:20:00',
    lastViewedAt: '2025-03-24 20:15:00',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代UI组件设计集',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '素材', color: 'green' },
      { name: '创意', color: '' },
      { name: 'UI设计', color: 'pink' },
    ],
    category: '设计素材',
    viewCount: 1,
    firstViewedAt: '2025-03-24 10:10:00',
    lastViewedAt: '2025-03-24 10:10:00',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '二次元精选壁纸',
    author: {
      name: '动漫爱好者',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '动漫', color: 'pink' },
      { name: '壁纸', color: '' },
    ],
    category: '壁纸',
    viewCount: 4,
    firstViewedAt: '2025-03-23 18:30:00',
    lastViewedAt: '2025-03-23 22:45:00',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代抽象艺术作品',
    author: {
      name: '艺术家小陈',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '艺术', color: 'red' },
      { name: '创意', color: '' },
    ],
    category: '灵感',
    viewCount: 1,
    firstViewedAt: '2025-03-22 14:25:00',
    lastViewedAt: '2025-03-22 14:25:00',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '校园风光四季集',
    author: {
      name: '校园摄影师',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '校园', color: 'cyan' },
      { name: '四季', color: '' },
      { name: '摄影', color: 'green' },
    ],
    category: '壁纸',
    viewCount: 2,
    firstViewedAt: '2025-03-21 09:35:00',
    lastViewedAt: '2025-03-21 16:40:00',
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Vue 3组件设计模式',
    author: {
      name: '前端架构师',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'Vue3', color: 'green' },
      { name: '代码', color: '' },
      { name: '组件', color: 'blue' },
    ],
    category: '代码参考',
    viewCount: 3,
    firstViewedAt: '2025-03-20 11:20:00',
    lastViewedAt: '2025-03-20 16:30:00',
  },
]);

// 当前筛选后的历史记录
const filteredHistory = ref([...historyItems.value]);

// 筛选相关数据
const selectedCategories = ref<string[]>([]);
const selectedAuthors = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const timeRange = ref('all');
const customDateRange = ref<any[]>([]);
const clearBeforeDate = ref();

// 当前选中的项目
const selectedItems = ref<string[]>([]);

// 清除历史相关数据
const clearHistoryModalVisible = ref(false);
const clearHistoryOption = ref('all');

// 计算最新一次浏览的日期
const latestViewDate = computed(() => {
  if (historyItems.value.length === 0) return '';
  return historyItems.value.reduce((latest, item) => {
    return dayjs(item.lastViewedAt).isAfter(dayjs(latest)) ? item.lastViewedAt : latest;
  }, historyItems.value[0].lastViewedAt);
});

// 计算属性 - 总浏览项目数
const totalHistoryItems = computed(() => {
  return historyItems.value.length;
});

// 计算属性 - 今日浏览数量
const todayViewCount = computed(() => {
  const today = dayjs().startOf('day');
  return historyItems.value.filter(item =>
      dayjs(item.lastViewedAt).isAfter(today)
  ).length;
});

// 计算属性 - 是否有更多项目可加载
const hasMoreItems = computed(() => {
  // 示例中假设有更多项目
  return filteredHistory.value.length < totalHistoryItems.value * 2;
});

// 计算属性 - 是否有活跃的筛选条件
const isFilterActive = computed(() => {
  return selectedCategories.value.length > 0 ||
      selectedAuthors.value.length > 0 ||
      selectedTags.value.length > 0 ||
      timeRange.value !== 'all';
});

// 计算属性 - 活跃筛选条件数量
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedCategories.value.length > 0) count++;
  if (selectedAuthors.value.length > 0) count++;
  if (selectedTags.value.length > 0) count++;
  if (timeRange.value !== 'all') count++;
  return count;
});

// 分类选项
const categoryOptions = computed(() => {
  // 从所有历史项中提取唯一的分类
  const categories = new Set();
  historyItems.value.forEach(item => {
    categories.add(item.category);
  });

  // 转换为选择器选项格式
  return Array.from(categories).map(cat => ({
    label: cat,
    value: cat
  }));
});

// 作者选项
const authorOptions = computed(() => {
  // 从所有历史项中提取唯一的作者
  const authors = new Set();
  historyItems.value.forEach(item => {
    authors.add(item.author.name);
  });

  // 转换为选择器选项格式
  return Array.from(authors).map(author => ({
    label: author,
    value: author
  }));
});

// 标签选项
const tagOptions = computed(() => {
  // 从所有历史项中提取唯一的标签名称
  const tags = new Set();
  historyItems.value.forEach(item => {
    item.tags.forEach(tag => {
      tags.add(tag.name);
    });
  });

  // 转换为选择器选项格式
  return Array.from(tags).map(tag => ({
    label: tag,
    value: tag
  }));
});

// 计算属性 - 按日期分组的历史记录
const groupedByDate = computed(() => {
  const grouped = {};

  filteredHistory.value.forEach(item => {
    const dateKey = dayjs(item.lastViewedAt).format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(item);
  });

  // 对每个日期组内的项目按时间排序
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      return dayjs(b.lastViewedAt).valueOf() - dayjs(a.lastViewedAt).valueOf();
    });
  });

  return grouped;
});

// 获取排序标签文本
const getSortLabel = (sortKey: string): string => {
  const sortLabels = {
    latest: '最近浏览',
    earliest: '最早浏览',
    mostViewed: '最常浏览',
    nameAsc: '名称 A-Z',
    nameDesc: '名称 Z-A'
  };
  return sortLabels[sortKey] || '最近浏览';
};

// 排序菜单点击处理
const handleSortMenuClick = (e: { key: string }) => {
  currentSort.value = e.key;
  sortHistory();
  message.success(`已按${getSortLabel(e.key)}排序`);
};

// 根据分类获取作者角色
const getAuthorRole = (category) => {
  const roleMap = {
    '设计素材': '设计师',
    '代码参考': '开发者',
    '壁纸': '摄影师',
    '灵感': '创意师',
    '教程': '讲师'
  };

  return roleMap[category] || '贡献者';
};

// 丰富描述内容生成函数
const getItemDescription = (item) => {
  // 可以根据不同的内容类型生成不同的描述
  const descriptions = [
    `${item.title}是一个由${item.author.name}创建的${item.category}`,
    `这是一份关于${item.title}的${item.category}，创建于${formatDate(item.firstViewedAt)}`,
    `${item.author.name}分享的精选${item.category}，获得了${item.viewCount}次浏览`
  ];

  // 随机选择一个描述，也可以根据业务逻辑选择合适的描述
  const index = (item.id.charCodeAt(0) || 0) % descriptions.length;
  return descriptions[index];
};

// 获取随机颜色函数
const getRandomColor = () => {
  const colors = ['blue', 'green', 'red', 'cyan', 'purple', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 根据当前排序方式对列表进行排序
const sortHistory = () => {
  const sortedHistory = [...filteredHistory.value];

  sortedHistory.sort((a, b) => {
    switch (currentSort.value) {
      case 'latest':
        return dayjs(b.lastViewedAt).valueOf() - dayjs(a.lastViewedAt).valueOf();
      case 'earliest':
        return dayjs(a.lastViewedAt).valueOf() - dayjs(b.lastViewedAt).valueOf();
      case 'mostViewed':
        return b.viewCount - a.viewCount;
      case 'nameAsc':
        return a.title.localeCompare(b.title);
      case 'nameDesc':
        return b.title.localeCompare(a.title);
      default:
        return dayjs(b.lastViewedAt).valueOf() - dayjs(a.lastViewedAt).valueOf();
    }
  });

  filteredHistory.value = sortedHistory;
};

// 禁用未来日期
const disabledFutureDate = (current) => {
  return current && current > dayjs().endOf('day');
};

// 启用自定义日期范围
const enableCustomRange = () => {
  timeRange.value = 'custom';
};

// 处理自定义日期范围变化
const handleCustomDateChange = (dates) => {
  if (dates && dates.length === 2) {
    customDateRange.value = dates;
    applyTimeFilter();
  }
};

// 处理筛选条件变化
const handleFilterChange = () => {
  // 可以在这里实现即时筛选，也可以等待用户点击"应用筛选"按钮
  // 这里选择后者，所以暂不执行筛选
};

// 应用时间筛选
const applyTimeFilter = () => {
  filterHistory();
  message.success('已应用时间筛选');
};

// 应用筛选条件
const applyFilters = () => {
  filterHistory();
  message.success('筛选条件已应用');
};

// 重置筛选条件
const resetFilters = () => {
  selectedCategories.value = [];
  selectedAuthors.value = [];
  selectedTags.value = [];
  timeRange.value = 'all';
  customDateRange.value = [];

  // 重新加载历史记录列表
  filterHistory();

  message.success('筛选条件已重置');
};

// 根据当前条件筛选历史记录
const filterHistory = () => {
  // 创建一个完整的历史记录副本
  let filtered = [...historyItems.value];

  // 按分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(item => {
      return selectedCategories.value.includes(item.category);
    });
  }

  // 按作者筛选
  if (selectedAuthors.value.length > 0) {
    filtered = filtered.filter(item => {
      return selectedAuthors.value.includes(item.author.name);
    });
  }

  // 按标签筛选
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(item => {
      return item.tags.some(tag => selectedTags.value.includes(tag.name));
    });
  }

  // 按时间范围筛选
  if (timeRange.value !== 'all') {
    const now = dayjs();
    filtered = filtered.filter(item => {
      const itemDate = dayjs(item.lastViewedAt);

      switch (timeRange.value) {
        case 'today':
          return itemDate.isSame(now, 'day');
        case 'yesterday': {
          const yesterday = now.subtract(1, 'day');
          return itemDate.isSame(yesterday, 'day');
        }
        case 'week':
          return itemDate.isAfter(now.subtract(1, 'week'));
        case 'month':
          return itemDate.isAfter(now.subtract(1, 'month'));
        case 'custom':
          if (customDateRange.value && customDateRange.value.length === 2) {
            const startDate = dayjs(customDateRange.value[0]).startOf('day');
            const endDate = dayjs(customDateRange.value[1]).endOf('day');
            return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
          }
          return true;
        default:
          return true;
      }
    });
  }

  // 应用排序
  filteredHistory.value = filtered;
  sortHistory();
};

// 跳转到详情页
const navigateToDetail = (item) => {
  // 假设item对象有id属性
  const itemId = item.id;
  router.push({
    name: 'PictureDetail',
    params: { id: itemId },
    // 可以通过state传递一些数据，避免重新加载
    state: { imageData: item }
  });
};

// 查看项目
const viewItem = (item) => {
  navigateToDetail(item);
};

// 添加到收藏
const addToFavorites = (item) => {
  message.success(`已将"${item.title}"添加到收藏`);
  // 这里可以添加实际的收藏逻辑
};

// 批量添加到收藏
const batchAddToFavorites = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要收藏的项目');
    return;
  }

  // 这里可以添加实际的批量收藏逻辑
  message.success(`已将 ${selectedItems.value.length} 个项目添加到收藏`);

  // 清空选中列表
  selectedItems.value = [];
};

// 确认删除浏览记录
const removeFromHistory = (item) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要将"${item.title}"从浏览历史中删除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 从列表中移除
      const index = historyItems.value.findIndex(i => i.id === item.id);
      if (index !== -1) {
        historyItems.value.splice(index, 1);
      }

      // 从筛选结果中移除
      const filteredIndex = filteredHistory.value.findIndex(i => i.id === item.id);
      if (filteredIndex !== -1) {
        filteredHistory.value.splice(filteredIndex, 1);
      }

      message.success(`已将"${item.title}"从浏览历史中删除`);
    },
  });
};

// 确认批量删除
const confirmBatchRemove = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要删除的项目');
    return;
  }

  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedItems.value.length} 项浏览记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: batchRemoveFromHistory,
  });
};

// 批量删除实现
const batchRemoveFromHistory = () => {
  const itemCount = selectedItems.value.length;

  // 从列表中移除
  historyItems.value = historyItems.value.filter(i => !selectedItems.value.includes(i.id));

  // 从筛选结果中移除
  filteredHistory.value = filteredHistory.value.filter(i => !selectedItems.value.includes(i.id));

  // 清空选中列表
  const removedCount = itemCount;
  selectedItems.value = [];

  message.success(`已删除 ${removedCount} 条浏览记录`);
};

// 清除选择
const clearSelection = () => {
  selectedItems.value = [];
  message.info('已取消选择');
};

// 显示清除历史对话框
const showClearHistoryModal = () => {
  clearHistoryModalVisible.value = true;
};

// 清除历史
const clearHistory = () => {
  const option = clearHistoryOption.value;

  if (option === 'all') {
    // 清除所有历史
    historyItems.value = [];
    filteredHistory.value = [];
    message.success('已清除所有浏览历史');
  }
  else if (option === 'filtered' && isFilterActive.value) {
    // 清除筛选后的历史
    const idsToRemove = new Set(filteredHistory.value.map(item => item.id));
    historyItems.value = historyItems.value.filter(item => !idsToRemove.has(item.id));
    filteredHistory.value = [];
    message.success('已清除筛选的浏览历史');
  }
  else if (option === 'before' && clearBeforeDate.value) {
    // 清除特定日期之前的历史
    const beforeDate = dayjs(clearBeforeDate.value).endOf('day');

    historyItems.value = historyItems.value.filter(item =>
        dayjs(item.lastViewedAt).isAfter(beforeDate)
    );

    filterHistory(); // 重新应用筛选条件
    message.success(`已清除 ${beforeDate.format('YYYY-MM-DD')} 之前的浏览历史`);
  }

  clearHistoryModalVisible.value = false;
};

// 加载更多
const loadMore = () => {
  message.loading('加载更多内容...', 1.5)
      .then(() => {
        // 模拟加载更多
        const newItems = [...historyItems.value.slice(0, 4)].map(item => ({
          ...item,
          id: `new_${item.id}_${Date.now()}`,
          lastViewedAt: dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD HH:mm:ss')
        }));

        // 添加到列表中
        historyItems.value.push(...newItems);

        // 重新应用筛选
        filterHistory();

        message.success('已加载更多历史记录');
      });
};

// 跳转到主页
const goToHomePage = () => {
  router.push({ name: 'HomePage' });
};

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD');
};

// 格式化相对时间
const formatTimeAgo = (dateStr) => {
  return dayjs(dateStr).fromNow();
};

// 格式化时间
const formatTime = (dateStr) => {
  return dayjs(dateStr).format('HH:mm');
};

// 格式化日期标签
const formatDateLabel = (dateStr) => {
  const date = dayjs(dateStr);
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return '今天';
  } else if (date.isSame(yesterday, 'day')) {
    return '昨天';
  } else {
    return date.format('YYYY年MM月DD日');
  }
};

// 添加点击涟漪效果
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

// 初始化
onMounted(() => {
  // 初始加载筛选后的历史记录
  filterHistory();

  // 添加动画监听
  setTimeout(() => {
    const cards = document.querySelectorAll('.history-item');
    console.log('找到历史项卡片数量:', cards.length);
    cards.forEach((card, index) => {
      // 添加可见性检查
      const { stop } = useIntersectionObserver(
          card,
          ([{ isIntersecting }]) => {
            if (isIntersecting) {
              setTimeout(() => {
                card.classList.add('animate__animated', 'animate__fadeInUp');
              }, index * 100);
              stop();
            }
          },
          { threshold: 0.2 }
      );
    });
  }, 800); // 给DOM渲染足够的时间
});
</script>

<style scoped>
/* 页面基础样式 */
.browsing-history-page {
  padding-top: 16px;
}

/* 页面标题与统计数据 */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.history-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

/* 工具栏卡片 */
.tools-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.view-controls {
  display: flex;
  align-items: center;
}

.tools-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.clear-history-btn {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
  border-radius: 8px;
  height: 38px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
  transition: all 0.3s;
}

.clear-history-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.25);
}

.sort-dropdown {
  height: 38px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  background-color: white;
  border: 1px solid #d9d9d9;
  transition: all 0.2s;
}

.sort-dropdown:hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.time-range-filter {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.active-filter-alert {
  margin-top: 16px;
}

.active-filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 浏览历史瀑布流布局 */
.history-grid {
  column-count: 1;
  column-gap: 20px;
  margin-bottom: 32px;
}

@media (min-width: 640px) {
  .history-grid {
    column-count: 2;
    column-gap: 24px;
  }
}

@media (min-width: 1024px) {
  .history-grid {
    column-count: 3;
    column-gap: 24px;
  }
}

@media (min-width: 1280px) {
  .history-grid {
    column-count: 4;
    column-gap: 24px;
  }
}

.history-item {
  break-inside: avoid;
  margin-bottom: 24px;
  display: inline-block;
  width: 100%;
}

/* 卡片样式 */
.history-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.history-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.history-image {
  width: 100%;
  display: block;
  transition: transform 0.5s;
}

.history-card:hover .history-image {
  transform: scale(1.05);
}

.image-actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.history-card:hover .image-actions-overlay {
  opacity: 1;
}

.image-action-btn {
  background-color: white !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: none !important;
}

.image-action-btn:hover {
  transform: scale(1.1);
  background-color: #6366F1 !important;
}

.image-action-btn:hover :deep(.anticon) {
  font-size: 18px;
  color: white;
}

.image-action-btn :deep(.anticon) {
  font-size: 18px;
  color: #333;
  transition: color 0.3s ease;
}

.remove-btn:hover {
  background-color: #ff4d4f !important;
}

.view-count-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(99, 102, 241, 0.85);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 12px;
}

.view-time {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 8px 0 0 0;
}

.history-info {
  padding: 12px;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-author {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.author-name {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.history-tag {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  color: #666;
  margin: 0;
}

.history-tag.small {
  padding: 0 6px;
  font-size: 11px;
  border-radius: 0 0 0 8px;
}

.list-item-title {
  font-weight: 500;
}

.list-item-desc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.list-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.list-item-meta {
  display: flex;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.list-item-category {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.list-item-time {
  display: flex;
  align-items: center;
}

.list-item-meta :deep(.anticon) {
  margin-right: 4px;
}

/* 时间轴视图样式 */
.history-timeline {
  margin-bottom: 32px;
}

.history-timeline-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.timeline-date {
  font-weight: 500;
  color: #6366f1;
  padding: 4px 8px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  display: inline-block;
}

.timeline-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item-time {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.timeline-item-card {
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.timeline-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.timeline-item-content {
  display: flex;
  padding: 12px;
  flex-grow: 1;
  gap: 12px;
}

.timeline-item-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.timeline-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-item-title {
  font-weight: 500;
  font-size: 14px;
}

.timeline-item-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.timeline-item-tags {
  display: flex;
  gap: 4px;
}

.timeline-item-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 8px;
  background: rgba(248, 249, 250, 0.7);
}

/* 空状态 */
.empty-history {
  padding: 60px 0;
  background: white;
  border-radius: 12px;
  margin-bottom: 32px;
}

.empty-actions {
  margin-top: 16px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 40px;
}

.load-more-btn {
  padding: 0 24px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
  transition: all 0.3s;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* 批量操作工具栏 */
.batch-actions-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 90%;
  background: #6366f1;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.batch-info {
  margin-right: 24px;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

/* 清除历史对话框 */
.clear-history-options {
  margin-bottom: 24px;
}

.clear-date-selector {
  margin-top: 12px;
  margin-left: 24px;
}

.clear-warning {
  margin-top: 16px;
}

/* 添加涟漪效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

/* 新设计的列表视图样式 */

/* 列表容器优化 */
.history-list-container {
  padding: 0;
  background: transparent;
  border-radius: 12px;
  margin-bottom: 16px;
}

/* 列表项容器 */
.history-list-container :deep(.ant-list-items) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 列表项卡片式样式 */
.history-list-container :deep(.ant-list-item) {
  border: none;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 0;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* 列表项悬停效果 */
.history-list-container :deep(.ant-list-item:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.15);
}

/* 列表项内容布局 */
.history-list-container :deep(.ant-list-item-meta) {
  margin-bottom: 0;
  align-items: stretch;
  padding: 0;
}

/* 列表项内容容器 */
.list-item-content-wrapper {
  display: flex;
  width: 100%;
}

/* 列表项左侧图片区域 */
.list-item-image-section {
  width: 160px;
  position: relative;
}

.list-item-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.list-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片上的渐变遮罩 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 50%);
  pointer-events: none;
}

/* 浏览次数指示器 */
.view-count-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  color: white;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.view-count-indicator :deep(.anticon) {
  font-size: 12px;
}

/* 浏览进度条 */
.history-progress-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(to right, #6366f1, #818cf8);
  border-radius: 0;
  z-index: 2;
}

/* 未读标记 */
.list-item-unread {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  z-index: 2;
}

/* 列表项右侧内容区域 */
.list-item-info-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

/* 列表项标题 */
.list-item-title {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  color: #333;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 顶部信息栏 */
.item-top-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

/* 分类标签 */
.item-category {
  font-size: 12px;
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.item-category :deep(.anticon) {
  font-size: 12px;
}

/* 浏览时间 */
.item-view-time {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-view-time :deep(.anticon) {
  font-size: 12px;
  color: #6366f1;
}

/* 列表项中间内容区 */
.item-middle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 作者信息 */
.list-item-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 13px;
  font-weight: 500;
  color: #444;
  line-height: 1.2;
}

.author-role {
  font-size: 11px;
  color: #888;
  line-height: 1.2;
}

/* 标签容器 */
.list-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

/* 标签样式 */
.list-item-tags .history-tag {
  border: none;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
  background-color: #f5f7ff;
  color: #6366f1;
  transition: all 0.2s;
  margin: 0;
}

.list-item-tags .history-tag:hover {
  background-color: #e0e7ff;
  transform: translateY(-1px);
}

/* 为不同颜色的标签设置样式 */
.list-item-tags .history-tag[color="blue"] {
  background-color: #e6f4ff;
  color: #1677ff;
}

.list-item-tags .history-tag[color="green"] {
  background-color: #e6fffb;
  color: #13c2c2;
}

.list-item-tags .history-tag[color="red"] {
  background-color: #fff1f0;
  color: #f5222d;
}

.list-item-tags .history-tag[color="purple"] {
  background-color: #f9f0ff;
  color: #722ed1;
}

.list-item-tags .history-tag[color="pink"] {
  background-color: #fff0f6;
  color: #eb2f96;
}

.list-item-tags .history-tag[color="cyan"] {
  background-color: #e6fffb;
  color: #13c2c2;
}

/* 底部信息栏 */
.item-bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

/* 元数据指标 */
.item-metadata {
  display: flex;
  gap: 16px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.metadata-item :deep(.anticon) {
  font-size: 14px;
  color: #6366f1;
}

/* 操作按钮容器 */
.item-actions {
  display: flex;
  gap: 8px;
}

/* 操作按钮样式 */
.item-actions .action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background-color: #f9f9f9;
  border: none;
  transition: all 0.2s;
}

.item-actions .action-btn:hover {
  background-color: #f0f2ff;
  color: #6366f1;
  transform: translateY(-2px);
}

.item-actions .action-btn :deep(.anticon) {
  font-size: 16px;
}

.item-actions .action-btn.remove-btn:hover {
  background-color: #fff1f0;
  color: #f5222d;
}

/* 操作按钮悬停提示 */
.action-btn-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.action-btn:hover .action-btn-tooltip {
  opacity: 1;
}

/* 日期分组指示器 */
.timeline-date-indicator {
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-date-text {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.1);
}

.timeline-date-line {
  flex-grow: 1;
  height: 1px;
  background: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .list-item-content-wrapper {
    flex-direction: column;
  }

  .list-item-image-section {
    width: 100%;
    height: 140px;
  }

  .item-bottom-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
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

.history-item {
  animation: fadeIn 0.5s ease-out;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .history-stats {
    width: 100%;
    justify-content: space-between;
  }

  .tools-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .tools-actions {
    width: 100%;
    justify-content: space-between;
  }

  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }

  .time-range-filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .batch-actions-bar {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .batch-info {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .timeline-item-content {
    flex-direction: column;
  }

  .timeline-item-image {
    width: 100%;
    height: auto;
  }
}
</style>
