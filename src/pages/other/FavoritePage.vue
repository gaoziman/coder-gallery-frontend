<template>
  <div class="favorite-page">
    <!-- 页面标题和状态 -->
    <div class="page-header"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="header-content">
        <h1 class="page-title">我的收藏</h1>
        <div class="collection-stats">
          <a-statistic title="收藏总数" :value="totalFavorites" class="stat-item">
            <template #suffix>
              <star-filled style="color: #faad14" />
            </template>
          </a-statistic>
          <a-statistic title="创建于" :value="formatDate(userInfo.favoriteCreatedAt)" class="stat-item" />
          <a-statistic title="最近更新" :value="formatDate(userInfo.favoriteUpdatedAt)" class="stat-item" />
        </div>
      </div>
    </div>

    <!-- 收藏整理工具栏 -->
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
                <a-menu-item key="newest">最近添加</a-menu-item>
                <a-menu-item key="oldest">最早添加</a-menu-item>
                <a-menu-item key="nameAsc">名称 A-Z</a-menu-item>
                <a-menu-item key="nameDesc">名称 Z-A</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-button
              type="primary"
              class="create-collection-btn"
              @click="showCreateCollectionModal"
              @mousedown="addRippleEffect">
            <template #icon><folder-add-outlined /></template>
            创建收藏夹
          </a-button>
        </div>
      </div>

      <!-- 收藏夹标签 -->
      <div class="collections-section">
        <div class="section-title">
          <h3>我的收藏夹</h3>
          <a-tooltip title="管理收藏夹">
            <a-button type="text" size="small" @click="showManageCollectionsModal">
              <setting-outlined />
            </a-button>
          </a-tooltip>
        </div>

        <div class="collection-tags">
          <a-tag
              v-for="(collection, index) in collections"
              :key="index"
              :class="{
              'collection-tag': true,
              'collection-tag-active': collection.active
            }"
              @click="toggleCollectionActive(index)"
          >
            <template #icon>
              <component :is="getCollectionIcon(collection)" />
            </template>
            {{ collection.name }}
            <span class="collection-count">{{ collection.count }}</span>
          </a-tag>
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
            <a-select-option value="week">本周</a-select-option>
            <a-select-option value="month">本月</a-select-option>
            <a-select-option value="year">今年</a-select-option>
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
    </a-card>

    <!-- 收藏内容展示 -->
    <div
        :class="{'favorites-grid': viewMode === 'grid', 'favorites-list': viewMode === 'list'}"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }">

      <!-- 网格视图模式 -->
      <template v-if="viewMode === 'grid' && filteredFavorites.length > 0">
        <div
            v-for="(item, index) in filteredFavorites"
            :key="index"
            class="favorite-item"
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
          <div class="favorite-card" @click="navigateToDetail(item)">
            <div class="image-container">
              <img :src="item.src" :alt="item.title" class="favorite-image" />
              <div class="image-actions-overlay">
                <a-button type="text" class="image-action-btn" @click.stop="viewItem(item)">
                  <template #icon><eye-outlined /></template>
                </a-button>
                <a-button type="text" class="image-action-btn" @click.stop="downloadItem(item)">
                  <template #icon><download-outlined /></template>
                </a-button>
                <a-button
                    type="text"
                    class="image-action-btn remove-btn"
                    @click.stop="confirmRemoveFavorite(item)"
                >
                  <template #icon><delete-outlined /></template>
                </a-button>
                <a-dropdown :trigger="['click']" @click.stop>
                  <a-button type="text" class="image-action-btn">
                    <template #icon><folder-outlined /></template>
                  </a-button>
                  <template #overlay>
                    <a-menu @click="(e) => moveToCollection(item, e.key)">
                      <a-menu-item v-for="col in collections" :key="col.id">
                        {{ col.name }}
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="new">+ 创建新收藏夹</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
              <div class="favorite-date">
                收藏于 {{ formatDate(item.favoriteDate) }}
              </div>
            </div>
            <div class="favorite-info">
              <div class="favorite-title">{{ item.title }}</div>
              <div class="favorite-author">
                <a-avatar :src="item.author.avatar" :size="24" />
                <span class="author-name">{{ item.author.name }}</span>
              </div>
              <div class="favorite-tags">
                <a-tag v-for="(tag, tagIdx) in item.tags.slice(0, 2)" :key="tagIdx" class="favorite-tag">
                  {{ tag.name }}
                </a-tag>
                <a-tag v-if="item.tags.length > 2" class="favorite-tag more-tag">
                  +{{ item.tags.length - 2 }}
                </a-tag>
              </div>
              <div class="favorite-collection">
                <folder-outlined />
                <span>{{ getCollectionName(item.collectionId) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 列表视图模式 -->
      <template v-else-if="viewMode === 'list' && filteredFavorites.length > 0">
        <a-list
            class="favorite-list"
            item-layout="horizontal"
            :data-source="filteredFavorites"
        >
          <template #renderItem="{ item, index }">
            <a-list-item
                :key="index"
                v-motion
                :initial="{ opacity: 0, x: -50 }"
                :enter="{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 800 + (index * 80),
                  duration: 500,
                  ease: 'easeOut'
                }
              }"
            >
              <template #actions>
                <a-button type="text" @click.stop="viewItem(item)">
                  <eye-outlined />
                </a-button>
                <a-button type="text" @click.stop="downloadItem(item)">
                  <download-outlined />
                </a-button>
                <a-dropdown :trigger="['click']" @click.stop>
                  <a-button type="text">
                    <folder-outlined />
                  </a-button>
                  <template #overlay>
                    <a-menu @click="(e) => moveToCollection(item, e.key)">
                      <a-menu-item v-for="col in collections" :key="col.id">
                        {{ col.name }}
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="new">+ 创建新收藏夹</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
                <a-button type="text" @click.stop="confirmRemoveFavorite(item)">
                  <delete-outlined />
                </a-button>
              </template>
              <a-list-item-meta @click="navigateToDetail(item)">
                <template #avatar>
                  <img :src="item.src" class="list-item-image" />
                </template>
                <template #title>
                  <div class="list-item-title">{{ item.title }}</div>
                </template>
                <template #description>
                  <div class="list-item-desc">
                    <div class="list-item-author">
                      <a-avatar :src="item.author.avatar" :size="20" />
                      <span>{{ item.author.name }}</span>
                    </div>
                    <div class="list-item-tags">
                      <a-tag v-for="(tag, tagIdx) in item.tags.slice(0, 3)" :key="tagIdx" class="favorite-tag">
                        {{ tag.name }}
                      </a-tag>
                    </div>
                    <div class="list-item-meta">
                      <span class="list-item-collection">
                        <folder-outlined /> {{ getCollectionName(item.collectionId) }}
                      </span>
                      <span class="list-item-date">
                        <calendar-outlined /> {{ formatDate(item.favoriteDate) }}
                      </span>
                    </div>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-favorites">
        <a-empty
            :description="isFilterActive ? '没有找到符合条件的收藏项' : '你还没有收藏任何内容'"
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
    <div v-if="filteredFavorites.length > 0 && hasMoreItems" class="load-more">
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
        <a-dropdown :trigger="['click']">
          <a-button>
            移动到收藏夹 <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu @click="(e) => batchMoveToCollection(e.key)">
              <a-menu-item v-for="col in collections" :key="col.id">
                {{ col.name }}
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="new">+ 创建新收藏夹</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button danger @click="confirmBatchRemove">批量删除</a-button>
      </div>
    </div>

    <!-- 创建收藏夹弹窗 -->
    <a-modal
        v-model:visible="collectionModalVisible"
        title="创建新收藏夹"
        @ok="createCollection"
        okText="创建"
        cancelText="取消"
    >
      <a-form :model="newCollection" layout="vertical">
        <a-form-item label="收藏夹名称" name="name"
                     :rules="[{ required: true, message: '请输入收藏夹名称' }]">
          <a-input v-model:value="newCollection.name" placeholder="输入名称" />
        </a-form-item>
        <a-form-item label="图标" name="icon">
          <a-radio-group v-model:value="newCollection.icon" button-style="solid">
            <a-radio-button value="folder"><folder-outlined /></a-radio-button>
            <a-radio-button value="heart"><heart-outlined /></a-radio-button>
            <a-radio-button value="star"><star-outlined /></a-radio-button>
            <a-radio-button value="picture"><picture-outlined /></a-radio-button>
            <a-radio-button value="file"><file-outlined /></a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
              v-model:value="newCollection.description"
              placeholder="添加简短描述（可选）"
              :rows="2"
          />
        </a-form-item>
        <a-form-item label="颜色标签" name="color">
          <div class="color-picker">
            <div
                v-for="color in colorOptions"
                :key="color"
                :class="['color-option', {'color-selected': newCollection.color === color}]"
                :style="{backgroundColor: color}"
                @click="newCollection.color = color"
            ></div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 管理收藏夹弹窗 -->
    <a-modal
        v-model:visible="manageCollectionsModalVisible"
        title="管理收藏夹"
        width="600px"
        @ok="saveCollectionsChanges"
        okText="保存"
        cancelText="取消"
    >
      <a-table :dataSource="collectionsForManage" :columns="collectionColumns" :pagination="false">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <a-input
                v-if="record.editing"
                v-model:value="collectionsForManage[index].name"
            />
            <span v-else>
              <component :is="getCollectionIcon(record)" />
              <span style="margin-left: 8px">{{ record.name }}</span>
            </span>
          </template>
          <template v-if="column.key === 'count'">
            <a-tag>{{ record.count }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="collection-actions">
              <a-button
                  v-if="record.editing"
                  type="link"
                  @click="saveCollectionEdit(index)"
                  class="confirm-collection-btn"
              >
                <check-outlined />
              </a-button>
              <a-button
                  v-else
                  type="link"
                  @click="startCollectionEdit(index)"
                  class="edit-collection-btn"
              >
                <edit-outlined />
              </a-button>
              <a-popconfirm
                  title="确定要删除这个收藏夹吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="removeCollection(index)"
              >
                <a-button type="link" danger>
                  <delete-outlined />
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderAddOutlined,
  StarOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  PictureOutlined,
  FileOutlined,
  SettingOutlined,
  CheckOutlined,
  EditOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useIntersectionObserver } from "@vueuse/core";

const router = useRouter();

// 用户信息
const userInfo = reactive({
  favoriteCreatedAt: '2023-01-15',
  favoriteUpdatedAt: '2025-03-25'
});

// 视图模式 - 网格/列表
const viewMode = ref('grid');

// 当前排序
const currentSort = ref('newest');

// 收藏夹列表
const collections = ref([
  {
    id: 'all',
    name: '全部收藏',
    count: 8,
    icon: 'star',
    active: true
  },
  {
    id: 'design',
    name: '设计素材',
    count: 2,
    icon: 'picture',
    active: false
  },
  {
    id: 'wallpapers',
    name: '壁纸',
    count: 2,
    icon: 'picture',
    active: false
  },
  {
    id: 'inspiration',
    name: '灵感',
    count: 2,
    icon: 'heart',
    active: false
  },
  {
    id: 'code',
    name: '代码参考',
    count: 2,
    icon: 'file',
    active: false
  }
]);

// 新建收藏夹数据
const newCollection = reactive({
  name: '',
  description: '',
  icon: 'folder',
  color: '#1890ff'
});

// 颜色选项
const colorOptions = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
  '#a0d911'
];

// 收藏夹管理弹窗相关
const manageCollectionsModalVisible = ref(false);
const collectionsForManage = ref([]);
const collectionColumns = [
  {
    title: '收藏夹名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '项目数量',
    dataIndex: 'count',
    key: 'count',
  },
  {
    title: '操作',
    key: 'action',
  }
];

// 创建收藏夹相关
const collectionModalVisible = ref(false);

const favorites = ref([
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
    favoriteDate: '2025-03-25',
    collectionId: 'design',
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
      { name: '风景', color: 'blue' },
      { name: '高清', color: '' },
    ],
    favoriteDate: '2025-03-20',
    collectionId: 'wallpapers',
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
      { name: '素材', color: 'green' },
      { name: '创意', color: '' },
      { name: 'UI设计', color: 'pink' },
    ],
    favoriteDate: '2025-03-18',
    collectionId: 'design',
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
      { name: '动漫', color: 'pink' },
      { name: '壁纸', color: '' },
    ],
    favoriteDate: '2025-03-15',
    collectionId: 'inspiration',
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
      { name: 'SpringBoot', color: 'blue' },
      { name: '代码', color: '' },
    ],
    favoriteDate: '2025-03-10',
    collectionId: 'code',
  },
  {
    id: '6',
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
    favoriteDate: '2025-03-05',
    collectionId: 'wallpapers',
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
      { name: '艺术', color: 'red' },
      { name: '创意', color: '' },
    ],
    favoriteDate: '2025-02-28',
    collectionId: 'inspiration',
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
    favoriteDate: '2025-02-20',
    collectionId: 'code',
  },
]);

// 当前选中的项目
const selectedItems = ref<string[]>([]);

// 筛选相关数据
const selectedCategories = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const timeRange = ref('all');

// 根据当前激活的收藏夹筛选数据
const filteredFavorites = ref([...favorites.value]);

// 计算属性 - 总收藏数
const totalFavorites = computed(() => {
  return favorites.value.length;
});

// 计算属性 - 是否有更多项目可加载
const hasMoreItems = computed(() => {
  // 示例中假设有更多项目
  return filteredFavorites.value.length < totalFavorites.value * 2;
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
  // 从所有收藏项中提取唯一的标签名称
  const categories = new Set();
  favorites.value.forEach(item => {
    item.tags.forEach(tag => {
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
  // 从所有收藏项中提取唯一的标签名称（与分类有些重复，但在实际应用中可能是不同的）
  const tags = new Set();
  favorites.value.forEach(item => {
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

// 获取排序标签文本
const getSortLabel = (sortKey: string): string => {
  const sortLabels = {
    newest: '最近添加',
    oldest: '最早添加',
    nameAsc: '名称 A-Z',
    nameDesc: '名称 Z-A'
  };
  return sortLabels[sortKey] || '最近添加';
};

// 获取收藏夹名称
const getCollectionName = (collectionId: string): string => {
  const collection = collections.value.find(c => c.id === collectionId);
  return collection ? collection.name : '未分类';
};

// 获取收藏夹图标
const getCollectionIcon = (collection: any) => {
  const iconMap = {
    folder: FolderOutlined,
    heart: collection.active ? HeartFilled : HeartOutlined,
    star: collection.active ? StarFilled : StarOutlined,
    picture: PictureOutlined,
    file: FileOutlined
  };
  return iconMap[collection.icon] || FolderOutlined;
};

// 处理分类选择变化
const handleCategoryChange = (values: string[]) => {
  selectedCategories.value = values;
};

// 处理标签选择变化
const handleTagChange = (values: string[]) => {
  selectedTags.value = values;
};

// 处理时间范围变化
const handleTimeRangeChange = (value: string) => {
  timeRange.value = value;
};

// 排序菜单点击处理
const handleSortMenuClick = (e: { key: string }) => {
  currentSort.value = e.key;
  sortFavorites();
  message.success(`已按${getSortLabel(e.key)}排序`);
};

// 应用筛选条件
const applyFilters = () => {
  filterFavorites();
  message.success('筛选条件已应用');
};

// 重置筛选条件
const resetFilters = () => {
  selectedCategories.value = [];
  selectedTags.value = [];
  timeRange.value = 'all';

  // 重新加载项目列表
  filterFavorites();

  message.success('筛选条件已重置');
};

// 根据当前条件筛选收藏项
const filterFavorites = () => {
  // 获取当前活跃的收藏夹
  const activeCollectionId = collections.value.find(c => c.active)?.id;

  // 先按收藏夹筛选
  let filtered = [...favorites.value];
  if (activeCollectionId && activeCollectionId !== 'all') {
    filtered = filtered.filter(item => item.collectionId === activeCollectionId);
  }

  // 按分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(item => {
      return item.tags.some(tag => selectedCategories.value.includes(tag.name));
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
      const itemDate = dayjs(item.favoriteDate);

      switch (timeRange.value) {
        case 'today':
          return itemDate.isSame(now, 'day');
        case 'week':
          return itemDate.isAfter(now.subtract(1, 'week'));
        case 'month':
          return itemDate.isAfter(now.subtract(1, 'month'));
        case 'year':
          return itemDate.isAfter(now.subtract(1, 'year'));
        default:
          return true;
      }
    });
  }

  // 应用排序
  sortFavoritesList(filtered);

  // 更新筛选后的列表
  filteredFavorites.value = filtered;
};

// 切换收藏夹选中状态
const toggleCollectionActive = (index: number) => {
  // 取消其他收藏夹的激活状态
  collections.value.forEach((col, idx) => {
    col.active = idx === index;
  });

  // 重新筛选收藏项
  filterFavorites();
};

// 根据当前排序方式对列表进行排序
const sortFavorites = () => {
  sortFavoritesList(filteredFavorites.value);
};

// 排序函数
const sortFavoritesList = (list: any[]) => {
  list.sort((a, b) => {
    switch (currentSort.value) {
      case 'newest':
        return dayjs(b.favoriteDate).valueOf() - dayjs(a.favoriteDate).valueOf();
      case 'oldest':
        return dayjs(a.favoriteDate).valueOf() - dayjs(b.favoriteDate).valueOf();
      case 'nameAsc':
        return a.title.localeCompare(b.title);
      case 'nameDesc':
        return b.title.localeCompare(a.title);
      default:
        return dayjs(b.favoriteDate).valueOf() - dayjs(a.favoriteDate).valueOf();
    }
  });
};

// 移动到收藏夹
const moveToCollection = (item: any, collectionId: string) => {
  if (collectionId === 'new') {
    // 创建新收藏夹
    showCreateCollectionModal();
    return;
  }

  // 获取目标收藏夹
  const targetCollection = collections.value.find(c => c.id === collectionId);
  if (!targetCollection) return;

  // 获取源收藏夹
  const sourceCollectionId = item.collectionId;
  const sourceCollection = collections.value.find(c => c.id === sourceCollectionId);

  // 如果源和目标相同，则跳过
  if (sourceCollectionId === collectionId) {
    message.info(`此项目已经在"${targetCollection.name}"收藏夹中`);
    return;
  }

  // 更新源收藏夹计数
  if (sourceCollection && sourceCollection.id !== 'all') {
    sourceCollection.count--;
  }

  // 更新目标收藏夹计数
  if (targetCollection.id !== 'all') {
    targetCollection.count++;
  }

  // 更新项目的收藏夹ID
  item.collectionId = collectionId;

  // 重新过滤内容（如果当前在按收藏夹筛选）
  filterFavorites();

  message.success(`已将"${item.title}"移动到"${targetCollection.name}"`);
};

// 显示创建收藏夹弹窗
const showCreateCollectionModal = () => {
  // 重置表单
  newCollection.name = '';
  newCollection.description = '';
  newCollection.icon = 'folder';
  newCollection.color = '#1890ff';

  // 显示弹窗
  collectionModalVisible.value = true;
};

// 创建收藏夹
const createCollection = () => {
  // 表单验证
  if (!newCollection.name.trim()) {
    message.error('请输入收藏夹名称');
    return;
  }

  // 生成唯一ID
  const id = `collection_${Date.now()}`;

  // 创建收藏夹对象
  const collection = {
    id,
    name: newCollection.name.trim(),
    description: newCollection.description,
    icon: newCollection.icon,
    color: newCollection.color,
    count: 0,
    active: false
  };

  // 添加到收藏夹列表
  collections.value.push(collection);

  // 关闭弹窗
  collectionModalVisible.value = false;

  message.success(`收藏夹"${collection.name}"创建成功`);
};

// 显示管理收藏夹弹窗
const showManageCollectionsModal = () => {
  // 复制收藏夹列表用于编辑（除了"全部收藏"）
  collectionsForManage.value = collections.value
      .filter(col => col.id !== 'all')
      .map(col => ({...col, editing: false}));

  // 显示弹窗
  manageCollectionsModalVisible.value = true;
};

// 开始编辑收藏夹
const startCollectionEdit = (index: number) => {
  collectionsForManage.value[index].editing = true;
};

// 保存收藏夹编辑
const saveCollectionEdit = (index: number) => {
  const collection = collectionsForManage.value[index];

  // 验证名称
  if (!collection.name.trim()) {
    message.error('收藏夹名称不能为空');
    return;
  }

  // 保存编辑状态
  collection.editing = false;
};

// 删除收藏夹
const removeCollection = (index: number) => {
  const collection = collectionsForManage.value[index];

  // 删除收藏夹
  collectionsForManage.value.splice(index, 1);

  // 从主列表中也删除
  const mainIndex = collections.value.findIndex(c => c.id === collection.id);
  if (mainIndex !== -1) {
    collections.value.splice(mainIndex, 1);
  }

  message.success(`已删除收藏夹"${collection.name}"`);
};

// 保存收藏夹管理的更改
const saveCollectionsChanges = () => {
  // 检查是否有未完成的编辑
  const unfinishedEdit = collectionsForManage.value.some(col => col.editing);
  if (unfinishedEdit) {
    message.warning('请先保存所有正在编辑的收藏夹');
    return;
  }

  // 更新主收藏夹列表（除了"全部收藏"）
  const allCollection = collections.value.find(c => c.id === 'all');
  collections.value = [
    allCollection,
    ...collectionsForManage.value
  ];

  // 关闭弹窗
  manageCollectionsModalVisible.value = false;

  message.success('收藏夹更新成功');
};

// 确认删除收藏项
const confirmRemoveFavorite = (item: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要将"${item.title}"从收藏中移除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => removeFavorite(item),
  });
};

// 删除收藏项
const removeFavorite = (item: any) => {
  // 获取项目所在收藏夹
  const collectionId = item.collectionId;
  const collection = collections.value.find(c => c.id === collectionId);

  // 更新收藏夹计数
  if (collection && collection.id !== 'all') {
    collection.count--;
  }

  // 更新"全部收藏"计数
  const allCollection = collections.value.find(c => c.id === 'all');
  if (allCollection) {
    allCollection.count--;
  }

  // 从列表中移除
  const index = favorites.value.findIndex(f => f.id === item.id);
  if (index !== -1) {
    favorites.value.splice(index, 1);
  }

  // 从筛选结果中移除
  const filteredIndex = filteredFavorites.value.findIndex(f => f.id === item.id);
  if (filteredIndex !== -1) {
    filteredFavorites.value.splice(filteredIndex, 1);
  }

  message.success(`已将"${item.title}"从收藏中移除`);
};

// 批量删除
const confirmBatchRemove = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要删除的项目');
    return;
  }

  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedItems.value.length} 项内容吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: batchRemoveFavorites,
  });
};

// 批量删除实现
const batchRemoveFavorites = () => {
  // 获取每个收藏夹的删除计数
  const collectionCountMap: Record<string, number> = {};
  const itemCount = selectedItems.value.length;

  selectedItems.value.forEach(itemId => {
    const item = favorites.value.find(f => f.id === itemId);
    if (item) {
      // 更新收藏夹计数
      if (!collectionCountMap[item.collectionId]) {
        collectionCountMap[item.collectionId] = 0;
      }
      collectionCountMap[item.collectionId]++;
    }
  });

  // 更新收藏夹计数
  Object.keys(collectionCountMap).forEach(collectionId => {
    const collection = collections.value.find(c => c.id === collectionId);
    if (collection && collection.id !== 'all') {
      collection.count -= collectionCountMap[collectionId];
    }
  });

  // 更新"全部收藏"计数
  const allCollection = collections.value.find(c => c.id === 'all');
  if (allCollection) {
    allCollection.count -= itemCount;
  }

  // 从列表中移除
  favorites.value = favorites.value.filter(f => !selectedItems.value.includes(f.id));

  // 从筛选结果中移除
  filteredFavorites.value = filteredFavorites.value.filter(f => !selectedItems.value.includes(f.id));

  // 清空选中列表
  const removedCount = itemCount;
  selectedItems.value = [];

  message.success(`已删除 ${removedCount} 个收藏项`);
};

// 批量移动到收藏夹
const batchMoveToCollection = (collectionId: string) => {
  if (selectedItems.value.length === 0) {
    message.warning('请先选择要移动的项目');
    return;
  }

  if (collectionId === 'new') {
    // 创建新收藏夹
    showCreateCollectionModal();
    return;
  }

  // 获取目标收藏夹
  const targetCollection = collections.value.find(c => c.id === collectionId);
  if (!targetCollection) return;

  // 获取每个收藏夹的移出计数
  const sourceCollectionCountMap: Record<string, number> = {};

  // 处理每个选中的项目
  selectedItems.value.forEach(itemId => {
    const item = favorites.value.find(f => f.id === itemId);
    if (item) {
      const sourceCollectionId = item.collectionId;

      // 如果源和目标相同，则跳过
      if (sourceCollectionId === collectionId) return;

      // 更新源收藏夹计数
      if (sourceCollectionId !== 'all') {
        if (!sourceCollectionCountMap[sourceCollectionId]) {
          sourceCollectionCountMap[sourceCollectionId] = 0;
        }
        sourceCollectionCountMap[sourceCollectionId]++;
      }

      // 更新项目的收藏夹ID
      item.collectionId = collectionId;
    }
  });

  // 更新源收藏夹计数
  Object.keys(sourceCollectionCountMap).forEach(sourceId => {
    const sourceCollection = collections.value.find(c => c.id === sourceId);
    if (sourceCollection) {
      sourceCollection.count -= sourceCollectionCountMap[sourceId];
    }
  });

  // 更新目标收藏夹计数
  if (targetCollection.id !== 'all') {
    targetCollection.count += selectedItems.value.length;
  }

  // 重新过滤内容（如果当前在按收藏夹筛选）
  filterFavorites();

  // 获取移动数量
  const movedCount = selectedItems.value.length;

  // 清空选中列表
  selectedItems.value = [];

  message.success(`已将 ${movedCount} 个项目移动到"${targetCollection.name}"`);
};

// 清除选择
const clearSelection = () => {
  selectedItems.value = [];
  message.info('已取消选择');
};

// 查看项目
const viewItem = (item: any) => {
  navigateToDetail(item);
};

// 下载项目
const downloadItem = (item: any) => {
  message.success('图片下载中...');

  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = item.src;
  a.download = item.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 导航到详情页
const navigateToDetail = (item: any) => {
  // 假设image对象有id属性
  const imageId = item.id;
  router.push({
    name: 'PictureDetail',
    params: { id: imageId },
    // 可以通过state传递一些数据，避免重新加载
    state: { imageData: item }
  });
};

// 加载更多
const loadMore = () => {
  message.loading('加载更多内容...', 1.5)
      .then(() => {
        // 模拟加载更多
        const newItems = [...favorites.value].map(item => ({
          ...item,
          id: `new_${item.id}_${Date.now()}`,
          favoriteDate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD')
        }));

        // 添加到列表中
        favorites.value.push(...newItems);

        // 重新应用筛选
        filterFavorites();

        message.success('已加载更多内容');
      });
};

// 跳转到主页
const goToHomePage = () => {
  router.push({ name: 'HomePage' });
};

// 格式化日期
const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD');
};

// 添加点击涟漪效果
const addRippleEffect = (event: MouseEvent) => {
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

// 初始化
onMounted(() => {
  // 初始加载筛选后的收藏项
  filterFavorites();

  // 添加动画监听
  setTimeout(() => {
    const cards = document.querySelectorAll('.favorite-item');
    console.log('找到收藏项卡片数量:', cards.length);
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
.favorite-page {
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

.collection-stats {
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

.create-collection-btn {
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

.create-collection-btn:hover {
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

/* 收藏夹标签 */
.collections-section {
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

.collection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.collection-tag {
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
  display: flex;
  align-items: center;
}

.collection-tag-active {
  color: white;
  background: #6366f1;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
}

.collection-count {
  margin-left: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 12px;
  font-weight: bold;
  line-height: normal;
}

/* 筛选区域 */
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

/* 收藏内容瀑布流布局 */
.favorites-grid {
  column-count: 1;
  column-gap: 20px;
  margin-bottom: 32px;
}

@media (min-width: 640px) {
  .favorites-grid {
    column-count: 2;
    column-gap: 24px;
  }
}

@media (min-width: 1024px) {
  .favorites-grid {
    column-count: 3;
    column-gap: 24px;
  }
}

@media (min-width: 1280px) {
  .favorites-grid {
    column-count: 4;
    column-gap: 24px;
  }
}

.favorite-item {
  break-inside: avoid;
  margin-bottom: 24px;
  display: inline-block;
  width: 100%;
}

/* 卡片样式 */
.favorite-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.favorite-image {
  width: 100%;
  display: block;
  transition: transform 0.5s;
}

.favorite-card:hover .favorite-image {
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

.favorite-card:hover .image-actions-overlay {
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

.favorite-date {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 8px 0 0 0;
}

.favorite-info {
  padding: 12px;
}

.favorite-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-author {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.author-name {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

.favorite-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.favorite-tag {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  color: #666;
  margin: 0;
}

.more-tag {
  background: #e6e6fa;
  color: #6366f1;
}

.favorite-collection {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
}

.favorite-collection :deep(.anticon) {
  margin-right: 6px;
}

/* 列表视图样式 */
.favorite-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.list-item-image {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
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

.list-item-collection {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.list-item-date {
  display: flex;
  align-items: center;
}

.list-item-meta :deep(.anticon) {
  margin-right: 4px;
}

/* 空状态 */
.empty-favorites {
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

.favorite-item {
  animation: fadeIn 0.5s ease-out;
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
</style>