<template>
  <div class="recent-view-page">
    <!-- 页面标题和统计信息 -->
    <div class="page-header"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="header-title">
        <div class="title-icon">
          <history-outlined/>
        </div>
        <h1 class="page-title">最近浏览</h1>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-label">浏览总数</div>
          <div class="stat-value">{{ totalViewed }}
            <eye-filled class="view-icon"/>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日浏览</div>
          <div class="stat-value">{{ todayViewCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">上次浏览</div>
          <div class="stat-value">{{ formatTimeSince(userInfo.lastViewTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 视图控制和工具栏 -->
    <div class="view-controls-bar"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }">
      <div class="dropdown-section">
        <a-dropdown :trigger="['click']" class="sort-dropdown">
          <a-button class="sort-button">
            {{ getSortLabel(currentSort) }}
            <down-outlined/>
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
      </div>

      <div class="view-buttons">
        <a-radio-group v-model:value="viewMode" size="small" button-style="solid">
          <a-radio-button value="grid">
            <appstore-outlined/>
            网格视图
          </a-radio-button>
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
          <a-radio-button value="timeline">
            <field-time-outlined/>
            时间轴视图
          </a-radio-button>
        </a-radio-group>
      </div>

      <div class="action-section">
        <a-button
            type="primary"
            class="clear-history-btn"
            @click="showClearHistoryModal"
            @mousedown="addRippleEffect">
          <template #icon>
            <delete-outlined/>
          </template>
          清除历史
        </a-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="section-title">
        <h3>快速筛选</h3>
      </div>

      <div class="filter-options">
        <a-select
            v-model:value="selectedCategories"
            mode="multiple"
            placeholder="按分类筛选"
            style="width: 220px"
            :options="categoryOptions"
            @change="handleCategoryChange"
        />

        <a-select
            v-model:value="selectedTags"
            mode="multiple"
            placeholder="按标签筛选"
            style="width: 220px"
            :options="tagOptions"
            @change="handleTagChange"
        />

        <a-select
            v-model:value="timeRange"
            placeholder="时间范围"
            style="width: 150px"
            @change="handleTimeRangeChange"
        >
          <a-select-option value="all">所有时间</a-select-option>
          <a-select-option value="today">今天</a-select-option>
          <a-select-option value="yesterday">昨天</a-select-option>
          <a-select-option value="week">本周</a-select-option>
          <a-select-option value="month">本月</a-select-option>
        </a-select>

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

    <!-- 内容展示区域 -->
    <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }">

      <!-- 网格视图 - 瀑布流 -->
      <div v-if="filteredHistory.length > 0 && viewMode === 'grid'">
        <image-gallery
            :images="formatHistoryToGalleryImages(filteredHistory)"
            empty-text="没有找到符合条件的浏览记录"
            @view="viewItem"
            @download="downloadItem"
            @like="toggleLike"
            @bookmark="addToFavorites"
            @share="shareImage"
            @delete="confirmRemoveHistory"
            @navigate-to-detail="navigateToDetail"
            @refresh="resetFilters"
        />

        <!-- 网格视图加载更多按钮 -->
        <div v-if="hasMoreItems" class="load-more">
          <a-button type="primary" class="load-more-btn" @click="loadMore">
            加载更多
            <template #icon>
              <down-outlined/>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else-if="filteredHistory.length > 0 && viewMode === 'list'" class="list-view">
        <a-table
            :dataSource="formatHistoryToListData(filteredHistory)"
            :columns="listViewColumns"
            :pagination="{ pageSize: 10 }"
            :rowKey="record => record.id"
            :rowSelection="{ selectedRowKeys: selectedItems, onChange: onSelectChange }"
        >
          <!-- 缩略图列 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'thumbnail'">
              <div class="thumbnail-cell">
                <img :src="record.src" :alt="record.title" class="thumbnail-image"/>
              </div>
            </template>

            <!-- 标题列 -->
            <template v-if="column.key === 'title'">
              <div class="title-cell">
                <div class="title-text">{{ record.title }}</div>
                <div class="title-tags">
                  <a-tag
                      v-for="(tag, index) in record.tags"
                      :key="index"
                      :color="tag.color || undefined"
                      class="item-tag"
                  >
                    {{ tag.name }}
                  </a-tag>
                </div>
              </div>
            </template>

            <!-- 作者列 -->
            <template v-if="column.key === 'author'">
              <div class="author-cell">
                <a-avatar :src="record.author.avatar" :size="24"/>
                <span class="author-name">{{ record.author.name }}</span>
              </div>
            </template>

            <!-- 查看次数列 -->
            <template v-if="column.key === 'viewCount'">
              <a-badge :count="record.viewCount" :numberStyle="{ backgroundColor: '#6366f1' }"/>
            </template>

            <!-- 最近浏览时间列 -->
            <template v-if="column.key === 'viewTime'">
              {{ formatDate(record.viewTime) }}
              <div class="view-time-ago">{{ formatTimeSince(record.viewTime) }}</div>
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'actions'">
              <div class="action-buttons">
                <a-button type="text" @click.stop="viewItem(record)" title="查看">
                  <template #icon>
                    <eye-outlined/>
                  </template>
                </a-button>
                <a-button type="text" @click.stop="downloadItem(record)" title="下载">
                  <template #icon>
                    <download-outlined/>
                  </template>
                </a-button>
                <a-button type="text" @click.stop="addToFavorites(record)" title="收藏">
                  <template #icon>
                    <star-outlined/>
                  </template>
                </a-button>
                <a-dropdown>
                  <a-button type="text">
                    <template #icon>
                      <more-outlined/>
                    </template>
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click.stop="shareImage(record)">
                        <share-alt-outlined/>
                        分享
                      </a-menu-item>
                      <a-menu-item @click.stop="confirmRemoveHistory(record)">
                        <delete-outlined/>
                        从历史记录中删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 时间轴视图 -->
      <div v-else-if="filteredHistory.length > 0 && viewMode === 'timeline'" class="timeline-view">
        <a-timeline mode="left">
          <!-- 按日期分组显示 -->
          <div v-for="(group, date) in groupedByDate" :key="date" class="timeline-date-group">
            <div class="timeline-date-header">
              <div class="date-badge">
                {{ formatTimelineDate(date) }}
                <span class="date-count">{{ group.items.length }}项</span>
              </div>
            </div>

            <a-timeline-item
                v-for="item in group.items"
                :key="item.id"
                :color="getCategoryColor(item.category || item.tags[0]?.name)"
            >
              <div class="timeline-item-card" @click="viewItem(item)">
                <div class="timeline-item-time">{{ formatShortTime(item.viewTime) }}</div>
                <div class="timeline-item-content">
                  <div class="timeline-item-thumbnail">
                    <img :src="item.src" :alt="item.title"/>
                  </div>
                  <div class="timeline-item-info">
                    <div class="timeline-item-title">{{ item.title }}</div>
                    <div class="timeline-item-meta">
                      <a-tag v-if="item.category" :color="getCategoryColor(item.category)">
                        {{ item.category }}
                      </a-tag>
                      <span class="timeline-item-author">
                        <user-outlined/> {{ item.author.name }}
                      </span>
                      <span class="timeline-view-count">
                        <eye-outlined/> 查看{{ item.viewCount }}次
                      </span>
                    </div>
                  </div>
                </div>
                <div class="timeline-item-actions">
                  <a-tooltip title="加入收藏">
                    <a-button type="text" size="small" @click.stop="addToFavorites(item)">
                      <star-outlined/>
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="再次查看">
                    <a-button type="text" size="small" @click.stop="viewItem(item)">
                      <eye-outlined/>
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="从历史记录中删除">
                    <a-button type="text" size="small" @click.stop="confirmRemoveHistory(item)">
                      <delete-outlined/>
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </a-timeline-item>
          </div>
        </a-timeline>

        <!-- 时间轴视图加载更多按钮 -->
        <div v-if="hasMoreTimelineItems" class="load-more">
          <a-button type="primary" class="load-more-btn" @click="loadMoreTimeline">
            加载更多历史记录
            <template #icon>
              <history-outlined/>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="viewMode === 'list'" class="pagination-container">
        <a-pagination
            v-model:current="pagination.current"
            :total="pagination.total"
            :pageSize="pagination.pageSize"
            :pageSizeOptions="pagination.pageSizeOptions"
            showSizeChanger
            showQuickJumper
            :showTotal="total => `共 ${total} 条`"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="filteredHistory.length === 0" class="empty-history">
        <a-empty description="没有找到符合条件的浏览记录">
          <template #extra>
            <div class="empty-actions">
              <a-button type="primary" @click="resetFilters">清除筛选条件</a-button>
              <a-button @click="goToHomePage">浏览新图片</a-button>
            </div>
          </template>
        </a-empty>
      </div>

      <!-- 批量操作悬浮工具栏 -->
      <div v-if="selectedItems.length > 0" class="batch-actions-bar">
        <div class="batch-info">
          已选择 <b>{{ selectedItems.length }}</b> 项
        </div>
        <div class="batch-buttons">
          <a-button @click="clearSelection">取消选择</a-button>
          <a-button @click="batchAddToFavorites">
            <template #icon>
              <star-outlined/>
            </template>
            批量收藏
          </a-button>
          <a-button danger @click="confirmBatchRemove">
            <template #icon>
              <delete-outlined/>
            </template>
            批量删除
          </a-button>
        </div>
      </div>

      <!-- 清除历史记录确认弹窗 -->
      <a-modal
          v-model:visible="clearHistoryModalVisible"
          title="清除浏览历史"
          @ok="clearHistory"
          okText="确定清除"
          okType="danger"
          cancelText="取消"
      >
        <div class="clear-history-options">
          <p>确定要清除浏览历史记录吗？此操作不可恢复。</p>
          <a-radio-group v-model:value="clearHistoryOption">
            <a-radio :value="'all'">清除全部历史记录</a-radio>
            <a-radio :value="'selected'">仅清除选中项</a-radio>
            <a-radio :value="'byTime'">按时间清除</a-radio>
          </a-radio-group>

          <div v-if="clearHistoryOption === 'byTime'" class="time-range-selector" style="margin-top: 12px;">
            <a-radio-group v-model:value="clearTimeRange">
              <a-radio :value="'day'">清除一天前的记录</a-radio>
              <a-radio :value="'week'">清除一周前的记录</a-radio>
              <a-radio :value="'month'">清除一个月前的记录</a-radio>
            </a-radio-group>
          </div>
        </div>
      </a-modal>

      <!-- 批量收藏确认弹窗 -->
      <a-modal
          v-model:visible="addToFavoritesModalVisible"
          title="添加到收藏夹"
          @ok="confirmAddToFavorites"
          okText="添加"
          cancelText="取消"
      >
        <div class="favorites-selection">
          <p>选择要添加到的收藏夹：</p>
          <a-radio-group v-model:value="selectedFavoriteFolder">
            <div class="favorite-folders-list">
              <a-radio
                  v-for="folder in favoriteFolders"
                  :key="folder.id"
                  :value="folder.id"
                  class="favorite-folder-option"
              >
                <div class="folder-radio-content">
                  <component :is="getCollectionIcon(folder)"/>
                  <span>{{ folder.name }}</span>
                </div>
              </a-radio>
            </div>
          </a-radio-group>

          <a-divider/>

          <div class="create-new-folder">
            <a-button type="link" @click="showCreateFolderModal">
              <template #icon>
                <folder-add-outlined/>
              </template>
              创建新收藏夹
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, reactive, computed, onMounted, h, watch} from 'vue';
import {
  EyeOutlined,
  EyeFilled,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FieldTimeOutlined,
  DownOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  HistoryOutlined,
  UserOutlined,
  FolderOutlined,
  FolderAddOutlined,
  PictureOutlined,
  FileOutlined,
} from '@ant-design/icons-vue';
import {useRouter} from 'vue-router';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import {useIntersectionObserver} from "@vueuse/core";
// 引入封装好的组件
import ImageGallery from '@/components/common/ImageGallery.vue';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();

// 用户信息
const userInfo = reactive({
  lastViewTime: '2025-04-02T09:30:00.000Z',
  historyCreatedAt: '2023-02-10',
});

// 视图模式 - 网格/列表/时间轴
const viewMode = ref('grid');

// 当前排序
const currentSort = ref('latest');

// 浏览历史数据
const viewHistory = ref([
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: 'macbook-abstract-40',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '海报', color: 'purple'},
      {name: 'Mac壁纸', color: ''},
    ],
    createTime: '2023-11-15T20:30:00.000Z',
    viewTime: '2025-04-02T09:30:00.000Z',
    viewCount: 5,
    category: '壁纸',
    liked: true,
    device: 'desktop',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '自然风光摄影集',
    author: {
      name: '摄影师小王',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '风景', color: 'blue'},
      {name: '高清', color: ''},
    ],
    createTime: '2023-10-20',
    viewTime: '2025-04-02T08:15:00.000Z',
    viewCount: 3,
    category: '风景',
    liked: false,
    device: 'mobile',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代UI组件设计集',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '素材', color: 'green'},
      {name: '创意', color: ''},
      {name: 'UI设计', color: 'pink'},
    ],
    createTime: '2023-12-05',
    viewTime: '2025-04-01T19:42:00.000Z',
    viewCount: 2,
    category: '素材',
    device: 'desktop',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '二次元精选壁纸',
    author: {
      name: '动漫爱好者',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '动漫', color: 'pink'},
      {name: '壁纸', color: ''},
    ],
    createTime: '2023-09-15',
    viewTime: '2025-04-01T16:20:00.000Z',
    viewCount: 6,
    category: '动漫',
    liked: true,
    device: 'tablet',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Spring Boot项目结构',
    author: {
      name: 'Java大神',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: 'SpringBoot', color: 'blue'},
      {name: '代码', color: ''},
    ],
    createTime: '2023-07-10',
    viewTime: '2025-04-01T14:05:00.000Z',
    viewCount: 4,
    category: '代码参考',
    device: 'desktop',
  },
  // 昨天的浏览记录
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '校园风光四季集',
    author: {
      name: '校园摄影师',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '校园', color: 'cyan'},
      {name: '四季', color: ''},
      {name: '摄影', color: 'green'},
    ],
    createTime: '2023-08-25',
    viewTime: '2025-04-01T10:45:00.000Z',
    viewCount: 2,
    category: '风景',
    device: 'mobile',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '现代抽象艺术作品',
    author: {
      name: '艺术家小陈',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: '艺术', color: 'red'},
      {name: '创意', color: ''},
    ],
    createTime: '2023-06-18',
    viewTime: '2025-04-01T09:20:00.000Z',
    viewCount: 1,
    category: '艺术',
    device: 'desktop',
  },
  // 两天前的浏览记录
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Vue 3组件设计模式',
    author: {
      name: '前端架构师',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      {name: 'Vue3', color: 'green'},
      {name: '代码', color: ''},
      {name: '组件', color: 'blue'},
    ],
    createTime: '2023-05-20',
    viewTime: '2025-03-31T17:30:00.000Z',
    viewCount: 7,
    category: '代码参考',
    device: 'desktop',
  },
  // 一周前
  {
    id: '9',
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
    createTime: '2023-11-15T20:30:00.000Z',
    viewTime: '2025-03-26T20:30:00.000Z',
    viewCount: 3,
    aspectRatio: '21/9',
    device: 'desktop',
  },
  {
    id: '10',
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
    createTime: '2023-07-20T14:30:00.000Z',
    viewTime: '2025-03-25T12:15:00.000Z',
    viewCount: 4,
    aspectRatio: '2/3',
    device: 'tablet',
  },
  // 两周前
  {
    id: '11',
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
    createTime: '2023-11-08T09:15:00.000Z',
    viewTime: '2025-03-19T09:45:00.000Z',
    viewCount: 2,
    aspectRatio: '1/1',
    device: 'mobile',
  },
  {
    id: '12',
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Mac系统壁纸.jpg',
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '壁纸',
    tags: [
      {name: 'Mac壁纸', color: 'cyan'},
      {name: '创意', color: ''},
    ],
    viewTime: '2025-03-15T13:50:00.000Z',
    viewCount: 1,
    aspectRatio: '16/9',
    device: 'desktop',
  },
]);

// 当前选中的项目
const selectedItems = ref<string[]>([]);

// 筛选相关数据
const selectedCategories = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const timeRange = ref('all');

// 清除历史相关
const clearHistoryModalVisible = ref(false);
const clearHistoryOption = ref('all');
const clearTimeRange = ref('week');

// 添加到收藏夹相关
const addToFavoritesModalVisible = ref(false);
const selectedFavoriteFolder = ref('');
const selectedItemsForFavorites = ref<string[]>([]);

// 收藏夹列表
const favoriteFolders = ref([
  {
    id: 'all',
    name: '全部收藏',
    count: 8,
    icon: 'star',
  },
  {
    id: 'design',
    name: '设计素材',
    count: 2,
    icon: 'picture',
  },
  {
    id: 'wallpapers',
    name: '壁纸',
    count: 2,
    icon: 'picture',
  },
  {
    id: 'inspiration',
    name: '灵感',
    count: 2,
    icon: 'heart',
  },
  {
    id: 'code',
    name: '代码参考',
    count: 2,
    icon: 'file',
  }
]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: viewHistory.value.length,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 列表视图列定义
const listViewColumns = [
  {
    title: '缩略图',
    dataIndex: 'src',
    key: 'thumbnail',
    width: 80,
    align: 'center',
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
    sorter: (a, b) => a.title.localeCompare(b.title),
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    width: 150,
    align: 'center',
  },
  {
    title: '查看次数',
    dataIndex: 'viewCount',
    key: 'viewCount',
    width: 100,
    align: 'center',
    sorter: (a, b) => a.viewCount - b.viewCount,
  },
  {
    title: '浏览时间',
    dataIndex: 'viewTime',
    key: 'viewTime',
    width: 180,
    align: 'center',
    sorter: (a, b) => {
      const dateA = new Date(a.viewTime);
      const dateB = new Date(b.viewTime);
      return dateA - dateB;
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    align: 'center',
  },
];

// 根据当前排序和筛选条件过滤浏览历史
const filteredHistory = ref([...viewHistory.value]);

// 计算属性 - 总浏览数
const totalViewed = computed(() => {
  return viewHistory.value.length;
});

// 计算属性 - 今日浏览数
const todayViewCount = computed(() => {
  const today = dayjs().startOf('day');
  return viewHistory.value.filter(item => {
    const itemDate = dayjs(item.viewTime);
    return itemDate.isAfter(today) || itemDate.isSame(today, 'day');
  }).length;
});

// 计算属性 - 是否有更多项目可加载
const hasMoreItems = computed(() => {
  if (viewMode.value === 'grid') {
    // 计算当前筛选条件下的所有项目数量
    let totalFilteredCount = calculateTotalFilteredCount();
    return filteredHistory.value.length < totalFilteredCount || filteredHistory.value.length < 20;
  }
  return false;
});

// 计算属性 - 时间轴模式是否有更多项目可加载
const hasMoreTimelineItems = computed(() => {
  let totalFilteredCount = calculateTotalFilteredCount();
  // 时间轴视图中可能显示了所有分组，但每组只显示了部分项目
  return Object.values(groupedByDate.value).some(group => group.hasMoreItems);
});

// 计算属性 - 是否有活跃的筛选条件
const isFilterActive = computed(() => {
  return selectedCategories.value.length > 0 ||
      selectedTags.value.length > 0 ||
      timeRange.value !== 'all';
});

// 计算属性 - 活跃筛选条件数量
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedCategories.value.length > 0) count++;
  if (selectedTags.value.length > 0) count++;
  if (timeRange.value !== 'all') count++;
  return count;
});

// 分类选项
const categoryOptions = computed(() => {
  // 从所有浏览项中提取唯一的分类
  const categories = new Set();
  viewHistory.value.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
    item.tags?.forEach(tag => {
      categories.add(tag.name);
    });
  });

  // 转换为选择器选项格式
  return Array.from(categories).map(cat => ({
    label: cat,
    value: cat
  }));
});

// 标签选项
const tagOptions = computed(() => {
  // 从所有浏览项中提取唯一的标签名称
  const tags = new Set();
  viewHistory.value.forEach(item => {
    item.tags?.forEach(tag => {
      tags.add(tag.name);
    });
  });

  // 转换为选择器选项格式
  return Array.from(tags).map(tag => ({
    label: tag,
    value: tag
  }));
});

// 按日期分组的浏览历史（用于时间轴视图）
const groupedByDate = computed(() => {
  const groups = {};

  filteredHistory.value.forEach(item => {
    const date = dayjs(item.viewTime).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = {
        date,
        items: [],
        // 每个组默认显示最多5项，以便支持"加载更多"功能
        hasMoreItems: false,
        visibleCount: 5
      };
    }
    groups[date].items.push(item);
  });

  // 对每个组内的项目按照时间从新到旧排序
  Object.keys(groups).forEach(date => {
    groups[date].items.sort((a, b) =>
        dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf()
    );

    // 检查是否有更多项目可以加载
    if (groups[date].items.length > groups[date].visibleCount) {
      groups[date].hasMoreItems = true;
      groups[date].items = groups[date].items.slice(0, groups[date].visibleCount);
    }
  });

  // 按日期排序（最新的在前）
  return Object.fromEntries(
      Object.entries(groups).sort((a, b) => {
        return dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf();
      })
  );
});

// 计算当前筛选条件下的总项目数
const calculateTotalFilteredCount = () => {
  let filtered = [...viewHistory.value];

  // 按分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(item => {
      return (
          (item.category && selectedCategories.value.includes(item.category)) ||
          item.tags?.some(tag => selectedCategories.value.includes(tag.name))
      );
    });
  }

  // 按标签筛选
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(item => {
      return item.tags?.some(tag => selectedTags.value.includes(tag.name));
    });
  }

  // 按时间范围筛选
  if (timeRange.value !== 'all') {
    const now = dayjs();
    filtered = filtered.filter(item => {
      const itemDate = dayjs(item.viewTime);
      switch (timeRange.value) {
        case 'today':
          return itemDate.isSame(now, 'day');
        case 'yesterday':
          const yesterday = now.subtract(1, 'day');
          return itemDate.isSame(yesterday, 'day');
        case 'week':
          return itemDate.isAfter(now.subtract(1, 'week'));
        case 'month':
          return itemDate.isAfter(now.subtract(1, 'month'));
        default:
          return true;
      }
    });
  }

  return filtered.length;
};

// 获取排序标签文本
const getSortLabel = (sortKey) => {
  const sortLabels = {
    latest: '最近浏览',
    earliest: '最早浏览',
    mostViewed: '最常浏览',
    nameAsc: '名称 A-Z',
    nameDesc: '名称 Z-A'
  };
  return sortLabels[sortKey] || '最近浏览';
};

// 获取收藏夹图标
const getCollectionIcon = (collection) => {
  const iconMap = {
    folder: FolderOutlined,
    heart: HeartOutlined,
    star: StarOutlined,
    picture: PictureOutlined,
    file: FileOutlined
  };
  return iconMap[collection.icon] || FolderOutlined;
};

// 分页变化处理函数
const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  filterHistory();
};

// 每页条数变化处理函数
const handleSizeChange = (current, size) => {
  pagination.pageSize = size;
  pagination.current = 1; // 切换每页数量时重置到第一页
  filterHistory();
};

// 处理表格选择变化
const onSelectChange = (selectedRowKeys) => {
  selectedItems.value = selectedRowKeys;
};

// 处理分类选择变化
const handleCategoryChange = (values) => {
  selectedCategories.value = values;
};

// 处理标签选择变化
const handleTagChange = (values) => {
  selectedTags.value = values;
};

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  timeRange.value = value;
};

// 排序菜单点击处理
const handleSortMenuClick = (e) => {
  currentSort.value = e.key;
  sortHistory();
  message.success(`已按${getSortLabel(e.key)}排序`);
};

// 应用筛选条件
const applyFilters = () => {
  filterHistory();
  message.success('筛选条件已应用');
};

// 重置筛选条件
const resetFilters = () => {
  selectedCategories.value = [];
  selectedTags.value = [];
  timeRange.value = 'all';
  currentSort.value = 'latest';

  // 重新加载历史记录
  filterHistory();

  message.success('筛选条件已重置');
};

// 根据当前条件筛选浏览历史
const filterHistory = () => {
  // 先按条件筛选
  let filtered = [...viewHistory.value];

  // 按分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(item => {
      return (
          (item.category && selectedCategories.value.includes(item.category)) ||
          item.tags?.some(tag => selectedCategories.value.includes(tag.name))
      );
    });
  }

  // 按标签筛选
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(item => {
      return item.tags?.some(tag => selectedTags.value.includes(tag.name));
    });
  }

  // 按时间范围筛选
  if (timeRange.value !== 'all') {
    const now = dayjs();
    filtered = filtered.filter(item => {
      const itemDate = dayjs(item.viewTime);
      switch (timeRange.value) {
        case 'today':
          return itemDate.isSame(now, 'day');
        case 'yesterday':
          const yesterday = now.subtract(1, 'day');
          return itemDate.isSame(yesterday, 'day');
        case 'week':
          return itemDate.isAfter(now.subtract(1, 'week'));
        case 'month':
          return itemDate.isAfter(now.subtract(1, 'month'));
        default:
          return true;
      }
    });
  }

  // 应用排序
  filtered.sort((a, b) => {
    switch (currentSort.value) {
      case 'latest':
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
      case 'earliest':
        return dayjs(a.viewTime).valueOf() - dayjs(b.viewTime).valueOf();
      case 'mostViewed':
        return b.viewCount - a.viewCount;
      case 'nameAsc':
        return a.title.localeCompare(b.title);
      case 'nameDesc':
        return b.title.localeCompare(a.title);
      default:
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
    }
  });

  // 更新总数
  pagination.total = filtered.length;

  // 区分处理不同视图模式
  if (viewMode.value === 'list') {
    // 列表视图使用分页逻辑
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = Math.min(startIndex + pagination.pageSize, filtered.length);
    filteredHistory.value = filtered.slice(startIndex, endIndex);

    // 如果当前页没有数据且不是第一页，回到上一页
    if (filteredHistory.value.length === 0 && pagination.current > 1) {
      pagination.current -= 1;
      filterHistory(); // 递归调用一次获取上一页数据
    }
  } else {
    // 网格视图和时间轴视图不使用分页，直接展示所有或部分数据
    // 这里可以控制初始加载的数量，例如最多显示前20条
    const maxInitialItems = 20;
    filteredHistory.value = filtered.slice(0, maxInitialItems);
  }
};

// 根据当前排序方式对列表进行排序
const sortHistory = () => {
  filteredHistory.value.sort((a, b) => {
    switch (currentSort.value) {
      case 'latest':
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
      case 'earliest':
        return dayjs(a.viewTime).valueOf() - dayjs(b.viewTime).valueOf();
      case 'mostViewed':
        return b.viewCount - a.viewCount;
      case 'nameAsc':
        return a.title.localeCompare(b.title);
      case 'nameDesc':
        return b.title.localeCompare(a.title);
      default:
        return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
    }
  });
};

// 格式化创建时间
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间';
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

// 格式化相对时间（如：5分钟前、2小时前、昨天等）
const formatTimeSince = (timestamp) => {
  if (!timestamp) return '未知时间';
  return dayjs(timestamp).fromNow();
};

// 格式化时间轴日期显示
const formatTimelineDate = (dateStr) => {
  const date = dayjs(dateStr);
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return '今天';
  } else if (date.isSame(yesterday, 'day')) {
    return '昨天';
  } else if (date.isAfter(today.subtract(7, 'day'))) {
    // 一周内显示星期几
    return date.format('ddd (MM月DD日)');
  } else {
    return date.format('YYYY年MM月DD日');
  }
};

// 格式化时间（仅小时和分钟）
const formatShortTime = (timestamp) => {
  if (!timestamp) return '';
  return dayjs(timestamp).format('HH:mm');
};

// 获取分类颜色
const getCategoryColor = (category) => {
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
    '代码参考': '#1d39c4', // 深靛青色
  };

  return categoryColors[category] || '#6554C0'; // 默认使用主题紫色
};

// 将历史数据格式化为Gallery组件所需的图片格式
const formatHistoryToGalleryImages = (history) => {
  return history.map(item => {
    return {
      id: item.id,
      src: item.src,
      title: item.title,
      author: item.author,
      category: item.category || item.tags?.[0]?.name || '',
      tags: item.tags || [],
      createTime: item.createTime,
      viewTime: item.viewTime,
      viewCount: item.viewCount,
      // 使用已有的值或设置默认值
      views: item.views || Math.floor(Math.random() * 5000) + 1000,
      likes: item.likes || Math.floor(Math.random() * 2000) + 500,
      comments: item.comments || Math.floor(Math.random() * 200) + 50,
      aspectRatio: item.aspectRatio || '16/9',
      bookmarked: false, // 浏览历史中的项目默认未收藏
      liked: item.liked !== undefined ? item.liked : false,
    };
  });
};

// 将浏览历史数据格式化为列表视图所需的格式
const formatHistoryToListData = (history) => {
  return history.map(item => {
    return {
      ...item,
      key: item.id,
    };
  });
};

// 显示清除历史弹窗
const showClearHistoryModal = () => {
  clearHistoryModalVisible.value = true;
};

// 确认清除历史
const clearHistory = () => {
  // 根据选择的清除选项执行不同的清除逻辑
  if (clearHistoryOption.value === 'all') {
    // 清除全部历史
    viewHistory.value = [];
    filteredHistory.value = [];
    message.success('已清除全部浏览历史');
  } else if (clearHistoryOption.value === 'selected') {
    // 清除选中项
    if (selectedItems.value.length === 0) {
      message.warning('请先选择要清除的项目');
      return;
    }
    viewHistory.value = viewHistory.value.filter(item => !selectedItems.value.includes(item.id));
    filteredHistory.value = filteredHistory.value.filter(item => !selectedItems.value.includes(item.id));

    // 清空选中列表
    selectedItems.value = [];
    message.success('已清除选中的浏览记录');
  } else if (clearHistoryOption.value === 'byTime') {
    // 按时间清除
    let cutoffTime;
    const now = dayjs();

    switch (clearTimeRange.value) {
      case 'day':
        cutoffTime = now.subtract(1, 'day');
        break;
      case 'week':
        cutoffTime = now.subtract(1, 'week');
        break;
      case 'month':
        cutoffTime = now.subtract(1, 'month');
        break;
      default:
        cutoffTime = now.subtract(1, 'week');
    }

    const initialCount = viewHistory.value.length;
    viewHistory.value = viewHistory.value.filter(item => {
      return dayjs(item.viewTime).isAfter(cutoffTime);
    });
    filteredHistory.value = filteredHistory.value.filter(item => {
      return dayjs(item.viewTime).isAfter(cutoffTime);
    });

    const removedCount = initialCount - viewHistory.value.length;
    message.success(`已清除${removedCount}条历史记录`);
  }

  // 关闭弹窗
  clearHistoryModalVisible.value = false;

  // 重新计算统计数据
  pagination.total = viewHistory.value.length;
};

// 批量删除确认
const confirmBatchRemove = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要删除的项目');
    return;
  }

  Modal.confirm({
    title: '批量删除',
    content: `确定要从浏览历史中删除选中的 ${selectedItems.value.length} 项记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: batchRemoveHistory,
  });
};

// 批量删除实现
const batchRemoveHistory = () => {
  const itemCount = selectedItems.value.length;

  // 从历史记录中移除选中项
  viewHistory.value = viewHistory.value.filter(item => !selectedItems.value.includes(item.id));
  filteredHistory.value = filteredHistory.value.filter(item => !selectedItems.value.includes(item.id));

  // 清空选中列表
  selectedItems.value = [];

  // 更新统计数据
  pagination.total = viewHistory.value.length;

  message.success(`已从浏览历史中删除 ${itemCount} 条记录`);
};

// 清除选择
const clearSelection = () => {
  selectedItems.value = [];
  message.info('已取消选择');
};

// 确认删除单个浏览记录
const confirmRemoveHistory = (item) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要将"${item.title}"从浏览历史中删除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => removeHistory(item),
  });
};

// 删除单个浏览记录
const removeHistory = (item) => {
  // 从浏览历史中移除
  const index = viewHistory.value.findIndex(h => h.id === item.id);
  if (index !== -1) {
    viewHistory.value.splice(index, 1);
  }

  // 从筛选结果中移除
  const filteredIndex = filteredHistory.value.findIndex(h => h.id === item.id);
  if (filteredIndex !== -1) {
    filteredHistory.value.splice(filteredIndex, 1);
  }

  message.success(`已将"${item.title}"从浏览历史中删除`);

  // 更新统计数据
  pagination.total = viewHistory.value.length;
};

// 查看项目
const viewItem = (item) => {
  // 增加查看次数
  const historyItem = viewHistory.value.find(h => h.id === item.id);
  if (historyItem) {
    historyItem.viewCount = (historyItem.viewCount || 0) + 1;
    historyItem.viewTime = new Date().toISOString();
    // 更新最后浏览时间
    userInfo.lastViewTime = historyItem.viewTime;
  }

  // 导航到详情页
  navigateToDetail(item);
};

// 下载项目
const downloadItem = (item) => {
  message.success('图片下载中...');

  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = item.src;
  a.download = item.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 点赞或取消点赞
const toggleLike = (item) => {
  // 找到原始数据中的项目
  const historyItem = viewHistory.value.find(h => h.id === item.id);
  if (historyItem) {
    historyItem.liked = !historyItem.liked;
    // 更新筛选后的列表中相应的项目
    const filteredItem = filteredHistory.value.find(h => h.id === item.id);
    if (filteredItem) {
      filteredItem.liked = historyItem.liked;
    }
  }

  message.success(item.liked ? '已添加到喜欢' : '已取消喜欢');
};

// 批量添加到收藏
const batchAddToFavorites = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要收藏的项目');
    return;
  }

  // 保存选中的项目以便在确认对话框后使用
  selectedItemsForFavorites.value = [...selectedItems.value];

  // 默认选择第一个收藏夹
  if (favoriteFolders.value.length > 0 && favoriteFolders.value[0].id !== 'all') {
    selectedFavoriteFolder.value = favoriteFolders.value[0].id;
  } else if (favoriteFolders.value.length > 1) {
    selectedFavoriteFolder.value = favoriteFolders.value[1].id;
  }

  // 显示添加到收藏夹弹窗
  addToFavoritesModalVisible.value = true;
};

// 添加到收藏夹
const addToFavorites = (item) => {
  // 单个项目的收藏逻辑
  selectedItemsForFavorites.value = [item.id];

  // 默认选择第一个收藏夹
  if (favoriteFolders.value.length > 0 && favoriteFolders.value[0].id !== 'all') {
    selectedFavoriteFolder.value = favoriteFolders.value[0].id;
  } else if (favoriteFolders.value.length > 1) {
    selectedFavoriteFolder.value = favoriteFolders.value[1].id;
  }

  // 显示添加到收藏夹弹窗
  addToFavoritesModalVisible.value = true;
};

// 确认添加到收藏夹
const confirmAddToFavorites = () => {
  // 验证是否选择了收藏夹
  if (!selectedFavoriteFolder.value) {
    message.error('请选择一个收藏夹');
    return;
  }

  // 获取目标收藏夹
  const targetFolder = favoriteFolders.value.find(f => f.id === selectedFavoriteFolder.value);
  if (!targetFolder) {
    message.error('收藏夹不存在');
    return;
  }

  // 获取要添加的项目列表
  const itemsToAdd = viewHistory.value.filter(item =>
      selectedItemsForFavorites.value.includes(item.id)
  );

  if (itemsToAdd.length === 0) {
    message.warning('没有找到要添加的项目');
    return;
  }

  // 更新收藏夹计数
  targetFolder.count += itemsToAdd.length;

  // 更新"全部收藏"计数
  const allFolder = favoriteFolders.value.find(f => f.id === 'all');
  if (allFolder) {
    allFolder.count += itemsToAdd.length;
  }

  // 在实际应用中，这里还需要调用API将项目添加到收藏夹

  // 关闭弹窗
  addToFavoritesModalVisible.value = false;

  // 清空选中的项目
  selectedItemsForFavorites.value = [];
  selectedItems.value = [];

  // 显示成功消息
  if (itemsToAdd.length === 1) {
    message.success(`已将"${itemsToAdd[0].title}"添加到"${targetFolder.name}"收藏夹`);
  } else {
    message.success(`已将${itemsToAdd.length}个项目添加到"${targetFolder.name}"收藏夹`);
  }
};

// 显示创建收藏夹弹窗
const showCreateFolderModal = () => {
  // 关闭当前的添加到收藏夹弹窗
  addToFavoritesModalVisible.value = false;

  // 在这里应该显示创建收藏夹弹窗
  // 实际实现会调用父组件的showCreateCollectionModal方法
  message.info('创建新收藏夹功能将在完整应用中实现');

  // 模拟创建成功后重新打开添加到收藏夹弹窗
  setTimeout(() => {
    addToFavoritesModalVisible.value = true;
  }, 1000);
};

// 分享图片
const shareImage = (item) => {
  message.success(`分享"${item.title}"的链接已复制到剪贴板`);
};

// 导航到详情页
const navigateToDetail = (item) => {
  // 假设图片对象有id属性
  const imageId = item.id;
  router.push({
    name: 'PictureDetail',
    params: {id: imageId},
    // 可以通过state传递一些数据，避免重新加载
    state: {imageData: item}
  });
};

// 加载更多（网格视图）
const loadMore = () => {
  message.loading('加载更多内容...', 1.5)
      .then(() => {
        // 获取当前筛选条件下的所有项目
        let allFiltered = [...viewHistory.value];

        // 应用与filterHistory相同的筛选逻辑
        if (selectedCategories.value.length > 0) {
          allFiltered = allFiltered.filter(item => {
            return (
                (item.category && selectedCategories.value.includes(item.category)) ||
                item.tags?.some(tag => selectedCategories.value.includes(tag.name))
            );
          });
        }

        if (selectedTags.value.length > 0) {
          allFiltered = allFiltered.filter(item => {
            return item.tags?.some(tag => selectedTags.value.includes(tag.name));
          });
        }

        if (timeRange.value !== 'all') {
          const now = dayjs();
          allFiltered = allFiltered.filter(item => {
            const itemDate = dayjs(item.viewTime);
            switch (timeRange.value) {
              case 'today':
                return itemDate.isSame(now, 'day');
              case 'yesterday':
                const yesterday = now.subtract(1, 'day');
                return itemDate.isSame(yesterday, 'day');
              case 'week':
                return itemDate.isAfter(now.subtract(1, 'week'));
              case 'month':
                return itemDate.isAfter(now.subtract(1, 'month'));
              default:
                return true;
            }
          });
        }

        // 应用排序
        allFiltered.sort((a, b) => {
          switch (currentSort.value) {
            case 'latest':
              return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
            case 'earliest':
              return dayjs(a.viewTime).valueOf() - dayjs(b.viewTime).valueOf();
            case 'mostViewed':
              return b.viewCount - a.viewCount;
            case 'nameAsc':
              return a.title.localeCompare(b.title);
            case 'nameDesc':
              return b.title.localeCompare(a.title);
            default:
              return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
          }
        });

        // 计算需要加载的新项目
        const currentCount = filteredHistory.value.length;
        const batchSize = 8; // 每次加载的数量
        const newItems = allFiltered.slice(currentCount, currentCount + batchSize);

        if (newItems.length > 0) {
          // 将新项目添加到当前显示的列表中
          filteredHistory.value = [...filteredHistory.value, ...newItems];
          message.success(`已加载 ${newItems.length} 个新内容`);
        } else {
          message.info('没有更多内容可加载');
        }
      });
};

// 加载更多（时间轴视图）
const loadMoreTimeline = () => {
  message.loading('加载更多历史记录...', 1.5)
      .then(() => {
        // 获取每个日期组的数据
        const dates = Object.keys(groupedByDate.value);
        let moreLoaded = false;

        // 对每个日期组处理
        dates.forEach(date => {
          const group = groupedByDate.value[date];

          if (group.hasMoreItems) {
            // 获取这个日期下所有满足筛选条件的项目
            const allFilteredForDate = viewHistory.value.filter(item => {
              const itemDate = dayjs(item.viewTime).format('YYYY-MM-DD');
              return itemDate === date;
            }).filter(item => {
              // 应用当前筛选条件
              let match = true;

              if (selectedCategories.value.length > 0) {
                match = match && (
                    (item.category && selectedCategories.value.includes(item.category)) ||
                    item.tags?.some(tag => selectedCategories.value.includes(tag.name))
                );
              }

              if (selectedTags.value.length > 0) {
                match = match && item.tags?.some(tag => selectedTags.value.includes(tag.name));
              }

              return match;
            });

            // 对组内项目按照当前排序规则排序
            allFilteredForDate.sort((a, b) => {
              switch (currentSort.value) {
                case 'latest':
                  return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
                case 'earliest':
                  return dayjs(a.viewTime).valueOf() - dayjs(b.viewTime).valueOf();
                case 'mostViewed':
                  return b.viewCount - a.viewCount;
                case 'nameAsc':
                  return a.title.localeCompare(b.title);
                case 'nameDesc':
                  return b.title.localeCompare(a.title);
                default:
                  return dayjs(b.viewTime).valueOf() - dayjs(a.viewTime).valueOf();
              }
            });

            // 获取当前已显示的项目数
            const currentShownIds = group.items.map(item => item.id);

            // 获取尚未显示的项目
            const notShownItems = allFilteredForDate.filter(item =>
                !currentShownIds.includes(item.id)
            );

            // 加载下一批项目
            const moreItems = notShownItems.slice(0, 5); // 每次加载5项

            if (moreItems.length > 0) {
              // 将新项目添加到当前日期组
              group.items = [...group.items, ...moreItems];
              moreLoaded = true;

              // 更新hasMoreItems状态
              group.hasMoreItems = notShownItems.length > moreItems.length;
            }
          }
        });

        if (moreLoaded) {
          message.success('已加载更多历史记录');
        } else {
          message.info('没有更多历史记录可加载');
        }
      });
};

// 跳转到主页
const goToHomePage = () => {
  router.push({name: 'HomePage'});
};

// 添加点击涟漪效果
const addRippleEffect = (event) => {
  const button = event.currentTarget as HTMLElement;
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

// 监听视图模式变化
watch(viewMode, (newMode, oldMode) => {
  if (newMode !== oldMode) {
    // 切换视图模式时重新应用筛选
    filterHistory();
  }
});

// 初始化
onMounted(() => {
  // 初始加载筛选后的浏览历史
  filterHistory();

  // 确保每个浏览历史项都有合适的属性
  viewHistory.value.forEach(item => {
    // 确保viewCount属性存在
    if (item.viewCount === undefined) {
      item.viewCount = Math.floor(Math.random() * 10) + 1;
    }

    // 确保有宽高比属性，以优化瀑布流布局
    if (!item.aspectRatio) {
      // 根据标签或类别为项目分配不同的宽高比
      const tag = item.tags?.[0]?.name.toLowerCase() || '';
      const category = item.category?.toLowerCase() || '';

      if (tag.includes('壁纸') || tag.includes('风景') || category.includes('风景')) {
        item.aspectRatio = '16/9'; // 风景类常用的宽高比
      } else if (tag.includes('人像') || tag.includes('模特') || category.includes('人物')) {
        item.aspectRatio = '3/4'; // 人像照片常用的竖向比例
      } else if (tag.includes('艺术') || tag.includes('创意') || category.includes('艺术')) {
        item.aspectRatio = '1/1'; // 艺术作品使用正方形布局
      } else {
        // 随机分配几种常见的宽高比
        const ratios = ['16/9', '4/3', '3/2', '1/1', '3/4', '2/3'];
        item.aspectRatio = ratios[Math.floor(Math.random() * ratios.length)];
      }
    }
  });

  // 添加动画监听
  setTimeout(() => {
    // 为瀑布流项目添加动画
    const masonry = document.querySelectorAll('.masonry-item');
    masonry.forEach((item, index) => {
      // 添加可见性检查
      const {stop} = useIntersectionObserver(
          item,
          ([{isIntersecting}]) => {
            if (isIntersecting) {
              setTimeout(() => {
                item.classList.add('animate__animated', 'animate__fadeInUp');
              }, index * 50); // 错开动画开始时间
              stop();
            }
          },
          {threshold: 0.1} // 当元素10%可见时触发
      );
    });

    // 为时间轴项目添加动画
    const timelineItems = document.querySelectorAll('.timeline-item-card');
    timelineItems.forEach((item, index) => {
      // 添加可见性检查
      const {stop} = useIntersectionObserver(
          item,
          ([{isIntersecting}]) => {
            if (isIntersecting) {
              setTimeout(() => {
                item.classList.add('animate__animated', 'animate__fadeInRight');
              }, index * 100); // 错开动画开始时间
              stop();
            }
          },
          {threshold: 0.1} // 当元素10%可见时触发
      );
    });
  }, 800); // 给DOM渲染足够的时间
});
</script>
<style scoped>
/* 基础页面样式 */
.recent-view-page {
  padding: 16px 8px; /* 减少两侧内边距 */
  max-width: 98%; /* 增加页面占比，减少边距 */
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


/* 视图控制和工具栏 - 整体调整 */
.view-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* 视图切换按钮组 - 整体对齐和样式 */
.view-buttons {
  min-width: auto;
  display: flex;
  justify-content: center;
}

.view-buttons :deep(.ant-radio-group) {
  display: flex;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 2px;
  border: none;
  box-shadow: none;
}

.view-buttons :deep(.ant-radio-button-wrapper) {
  height: 32px;
  border: none !important;
  background: transparent;
  color: #606060;
  box-shadow: none !important;
  transition: all 0.2s;
  border-radius: 6px !important;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0;
  line-height: 1;
}

.view-buttons :deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

.view-buttons :deep(.ant-radio-button-wrapper-checked) {
  background-color: #6366f1;
  color: white;
  font-weight: 500;
}

/* 其他栏目调整 */
.dropdown-section {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.action-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

/* 下拉按钮˚ */
.sort-button {
  min-width: 120px; /* 增加最小宽度 */
  height: 36px; /* 适当增加高度 */
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #606060;
  border-color: #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9fb;
  transition: all 0.2s;
}

/* 下拉图标调整 */
.sort-button :deep(.anticon) {
  margin-left: 10px;
  font-size: 12px;
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

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
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

  .create-collection-btn {
    width: 100%;
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

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  position: relative;
  padding-left: 12px;
}

.section-title h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #6366f1;
  border-radius: 2px;
}

.filter-section {
  margin-bottom: 20px;
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

.empty-actions {
  margin-top: 16px;
}

/* 加载更多按钮样式优化 */
.load-more {
  text-align: center;
  margin-top: 32px;
  margin-bottom: 40px;
}

.load-more-btn {
  padding: 0 24px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border: none;
  transition: all 0.3s;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  margin: 0 auto;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.load-more-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.load-more-btn :deep(.anticon) {
  margin-left: 8px;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .load-more-btn {
    width: 100%;
    max-width: 280px; /* 在小屏幕上限制最大宽度 */
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.load-more-btn:hover :deep(.anticon) {
  animation: pulse 1.5s infinite ease-in-out;
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

/* 颜色选择器 */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-selected {
  border-color: #1890ff;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 修改编辑按钮颜色以匹配主题 */
.edit-collection-btn {
  color: #6366f1 !important; /* 使用与创建收藏夹按钮相同的基础色 */
}

.edit-collection-btn:hover {
  color: #818cf8 !important; /* 悬停时使用渐变色的浅色部分 */
}

/* 修改确认按钮颜色以匹配主题 */
.confirm-collection-btn {
  color: #6366f1 !important; /* 使用与创建收藏夹按钮相同的基础色 */
}

.confirm-collection-btn:hover {
  color: #818cf8 !important; /* 悬停时使用渐变色的浅色部分 */
}

/* 当按钮在选中状态或激活状态时 */
.confirm-collection-btn:active,
.confirm-collection-btn.active {
  color: #6366f1 !important;
  background-color: rgba(99, 102, 241, 0.1) !important; /* 添加轻微背景色增强视觉效果 */
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

/* 响应式布局调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .collection-stats {
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

  .batch-actions-bar {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .batch-info {
    margin-right: 0;
    margin-bottom: 8px;
  }
}

/* 列表视图样式 */
.list-view {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.list-view :deep(.ant-table) {
  margin: 0;
}

.list-view :deep(.ant-table-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 500;
  color: #374151;
  padding: 12px 16px;
}

.list-view :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  vertical-align: middle;
}

.list-view :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f7ff;
}

/* 缩略图单元格 */
.thumbnail-cell {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 6px;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.thumbnail-image:hover {
  transform: scale(1.1);
}

/* 标题单元格 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.title-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-tag {
  font-size: 11px;
  padding: 0 6px !important;
  height: 20px !important;
  line-height: 20px !important;
  margin: 0 !important;
}

/* 作者单元格 */
.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  color: #4b5563;
  font-size: 13px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
}

.action-buttons :deep(.ant-btn) {
  color: #6b7280;
  padding: 4px;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons :deep(.ant-btn:hover) {
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.08);
}

/* 列表视图分页 */
.list-view :deep(.ant-pagination) {
  margin: 16px;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .list-view {
    overflow-x: auto;
  }

  .author-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 24px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 自定义分页样式 */
.pagination-container :deep(.ant-pagination-item-active) {
  background-color: #6366f1;
  border-color: #6366f1;
}

.pagination-container :deep(.ant-pagination-item-active a) {
  color: white;
}

.pagination-container :deep(.ant-pagination-item:hover) {
  border-color: #6366f1;
}

.pagination-container :deep(.ant-pagination-item:hover a) {
  color: #6366f1;
}

.pagination-container :deep(.ant-pagination-options) {
  margin-left: 16px;
}

.pagination-container :deep(.ant-select:hover .ant-select-selector) {
  border-color: #6366f1;
}

.pagination-container :deep(.ant-pagination-options-quick-jumper input:hover),
.pagination-container :deep(.ant-pagination-options-quick-jumper input:focus) {
  border-color: #6366f1;
}

.pagination-container :deep(.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .pagination-container {
    padding: 12px 8px;
  }

  .pagination-container :deep(.ant-pagination-options) {
    margin-left: 8px;
  }

  /* 在移动设备上简化分页显示 */
  .pagination-container :deep(.ant-pagination-options-quick-jumper) {
    margin-left: 8px;
  }
}

/* 修复瀑布流布局 */
.favorite-page .masonry-gallery {
  column-count: 1;
  column-gap: 16px;
  margin-bottom: 32px;
  width: 100%;
}

/* 修复瀑布流布局 - 增加列数，减小间距 */
@media (min-width: 576px) {
  .recent-view-page .masonry-gallery {
    column-count: 2;
    column-gap: 14px; /* 减小间距，原来是16px */
  }
}

@media (min-width: 992px) {
  .recent-view-page .masonry-gallery {
    column-count: 3;
    column-gap: 16px; /* 减小间距，原来是20px */
  }
}

@media (min-width: 1200px) {
  .recent-view-page .masonry-gallery {
    column-count: 4;
    column-gap: 18px; /* 减小间距，原来是24px */
  }
}

@media (min-width: 1600px) {
  .recent-view-page .masonry-gallery {
    column-count: 5;
    column-gap: 18px;
  }
}

@media (min-width: 2000px) {
  .recent-view-page .masonry-gallery {
    column-count: 6;
    column-gap: 18px;
  }
}

/* 优化时间轴视图布局 */
.timeline-view {
  padding: 20px 0;
  max-width: 98%;
  margin: 0 auto;
}

.favorite-page .masonry-item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 16px;
  display: inline-block;
  width: 100%;
  animation: fadeIn 0.5s ease-in-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

/* 暗模式兼容 */
@media (prefers-color-scheme: dark) {
  .page-header,
  .view-controls-bar,
  .collections-section,
  .filter-card,
  .list-view,
  .empty-favorites,
  .pagination-container {
    background-color: #1f1f1f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .section-title h3,
  .page-title {
    color: #e0e0e0;
  }

  .stat-label {
    color: #aaa;
  }

  .stat-value {
    color: #e0e0e0;
  }

  .collection-tag:not(.collection-tag-active) {
    background-color: #2a2a2a;
    color: #ccc;
    border-color: #444;
  }

  .list-view :deep(.ant-table-thead > tr > th) {
    background-color: #2a2a2a;
    color: #e0e0e0;
  }

  .list-view :deep(.ant-table-tbody > tr > td) {
    border-bottom-color: #333;
  }

  .list-view :deep(.ant-table-tbody > tr:hover > td) {
    background-color: #2a2a2a;
  }
}

/* 时间轴视图样式 */
.timeline-view {
  padding: 20px 0;
  max-width: 900px;
  margin: 0 auto;
}

.timeline-date-group {
  margin-bottom: 24px;
}

.timeline-date-header {
  margin-bottom: 16px;
  position: relative;
}

.date-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  color: white;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  position: relative;
  z-index: 5;
}

.date-count {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1px 8px;
  margin-left: 8px;
  font-size: 12px;
}

.timeline-view :deep(.ant-timeline-item) {
  padding-bottom: 24px;
}

.timeline-view :deep(.ant-timeline-item-content) {
  margin-left: 24px;
  top: -5px;
}

.timeline-item-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.timeline-item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.timeline-item-time {
  font-size: 12px;
  color: #666;
  padding: 10px 16px 5px;
  border-bottom: 1px dashed #eee;
  background-color: #f9f9fb;
}

.timeline-item-content {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
}

.timeline-item-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.timeline-item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.timeline-item-card:hover .timeline-item-thumbnail img {
  transform: scale(1.05);
}

.timeline-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.timeline-item-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  line-height: 1.3;
  color: #333;
}

.timeline-item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.timeline-item-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.timeline-view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.timeline-item-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background-color: #f9f9fb;
  border-top: 1px solid #f0f0f0;
  gap: 8px;
}

.timeline-item-actions :deep(.ant-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.timeline-item-actions :deep(.ant-btn:hover) {
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.08);
}

/* 添加到收藏弹窗样式 */
.favorite-folders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
}

.favorite-folder-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.favorite-folder-option:hover {
  background-color: #f5f7ff;
}

.folder-radio-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.create-new-folder {
  margin-top: 8px;
  text-align: center;
}

/* 列表视图中的浏览时间前缀 */
.view-time-ago {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 修复缺失的样式 */
.view-icon {
  color: #5284F9;
  margin-left: 6px;
  font-size: 18px;
}

/* 时间轴视图的响应式适配 */
@media (max-width: 768px) {
  .timeline-item-content {
    flex-direction: column;
  }

  .timeline-item-thumbnail {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }

  .timeline-view :deep(.ant-timeline-item-content) {
    margin-left: 16px;
  }
}

/* 动画效果定义 */
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translate3d(20px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate__fadeInRight {
  animation-name: fadeInRight;
  animation-duration: 0.6s;
}

/* 暗模式兼容 */
@media (prefers-color-scheme: dark) {
  .timeline-item-card {
    background: #1f1f1f;
  }

  .timeline-item-time,
  .timeline-item-actions {
    background-color: #1a1a1a;
    border-color: #2a2a2a;
  }

  .timeline-item-title {
    color: #e0e0e0;
  }

  .timeline-item-author,
  .timeline-view-count {
    color: #aaa;
  }

  .view-time-ago {
    color: #777;
  }

  .favorite-folder-option:hover {
    background-color: #2a2a2a;
  }
}
</style>