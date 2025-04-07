<template>
  <div class="favorite-page">
    <!-- 页面标题和统计信息 -->
    <div class="page-header"
         v-motion
         :initial="{ opacity: 0, y: -20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
      <div class="header-title">
        <div class="title-icon">
          <picture-outlined/>
        </div>
        <h1 class="page-title">我的收藏</h1>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-label">收藏总数</div>
          <div class="stat-value">{{ totalFavorites }}
            <star-filled class="star-icon"/>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">创建于</div>
          <div class="stat-value">{{ userInfo.favoriteCreatedAt }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">最近更新</div>
          <div class="stat-value">{{ userInfo.favoriteUpdatedAt }}</div>
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
              <a-menu-item key="newest">最近添加</a-menu-item>
              <a-menu-item key="oldest">最早添加</a-menu-item>
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
        </a-radio-group>
      </div>

      <div class="action-section">
        <a-button
            type="primary"
            class="create-collection-btn"
            @click="showCreateCollectionModal"
            @mousedown="addRippleEffect">
          <template #icon>
            <folder-add-outlined/>
          </template>
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
            <setting-outlined/>
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
            <component :is="getCollectionIcon(collection)"/>
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

    <!-- 使用封装好的 ImageGallery 组件展示收藏内容 -->
    <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }">

      <!-- 网格视图 - 瀑布流 -->
      <div v-if="filteredFavorites.length > 0 && viewMode === 'grid'">
        <image-gallery
            :images="formatFavoritesToGalleryImages(filteredFavorites)"
            empty-text="没有找到符合条件的收藏项"
            @view="viewItem"
            @download="downloadItem"
            @like="toggleLike"
            @bookmark="toggleBookmark"
            @share="shareImage"
            @delete="confirmRemoveFavorite"
            @navigate-to-detail="navigateToDetail"
            @refresh="resetFilters"
        />

        <!-- 网格视图加载更多按钮 -->
        <div v-if="hasMoreItems" class="load-more">
          <a-button type="primary" class="load-more-btn" @click="loadMore">
            加载更多
            <template #icon>
              <down-outlined />
            </template>
          </a-button>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else-if="filteredFavorites.length > 0 && viewMode === 'list'" class="list-view">
        <a-table
            :dataSource="formatFavoritesToListData(filteredFavorites)"
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

            <!-- 收藏夹列 -->
            <template v-if="column.key === 'collection'">
              <a-tag>{{ getCollectionName(record.collectionId) }}</a-tag>
            </template>

            <!-- 日期列 -->
            <template v-if="column.key === 'date'">
              {{ formatDate(record.createTime || record.favoriteDate) }}
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
                <a-button type="text" @click.stop="toggleBookmark(record)" title="更改收藏夹">
                  <template #icon>
                    <folder-outlined/>
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
                      <a-menu-item @click.stop="confirmRemoveFavorite(record)">
                        <delete-outlined/>
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </template>
        </a-table>
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
      <div v-if="filteredFavorites.length === 0" class="empty-favorites">
        <a-empty description="没有找到符合条件的收藏项">
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
          <a-dropdown :trigger="['click']">
            <a-button>
              移动到收藏夹
              <down-outlined/>
            </a-button>
            <template #overlay>
              <a-menu @click="(e) => batchMoveToCollection(e.key)">
                <a-menu-item v-for="col in collections" :key="col.id">
                  {{ col.name }}
                </a-menu-item>
                <a-menu-divider/>
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
            <a-input v-model:value="newCollection.name" placeholder="输入名称"/>
          </a-form-item>
          <a-form-item label="图标" name="icon">
            <a-radio-group v-model:value="newCollection.icon" button-style="solid">
              <a-radio-button value="folder">
                <folder-outlined/>
              </a-radio-button>
              <a-radio-button value="heart">
                <heart-outlined/>
              </a-radio-button>
              <a-radio-button value="star">
                <star-outlined/>
              </a-radio-button>
              <a-radio-button value="picture">
                <picture-outlined/>
              </a-radio-button>
              <a-radio-button value="file">
                <file-outlined/>
              </a-radio-button>
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
              <component :is="getCollectionIcon(record)"/>
              <span style="margin-left: 8px">{{ record.name }}</span>
            </span>
            </template>
            <template v-if="column.key === 'count'">
              <a-tag>{{ record.count }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button
                  v-if="record.editing"
                  type="link"
                  @click="saveCollectionEdit(index)"
              >
                <check-outlined/>
              </a-button>
              <a-button
                  v-else
                  type="link"
                  @click="startCollectionEdit(index)"
              >
                编辑
                <edit-outlined/>
              </a-button>
              <a-popconfirm
                  title="确定要删除这个收藏夹吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="removeCollection(index)"
              >
                <a-button type="link" danger>
                  删除
                  <delete-outlined/>
                </a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </a-modal>
    </div>
  </div>
</template>


<script setup lang="ts">
import {ref, reactive, computed, onMounted, h, watch} from 'vue';
import {
  EyeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
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
} from '@ant-design/icons-vue';
import {useRouter} from 'vue-router';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import {useIntersectionObserver} from "@vueuse/core";
// 引入封装好的组件
import ImageGallery from '@/components/common/ImageGallery.vue';


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
    align: 'center',
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
    title: '收藏夹',
    dataIndex: 'collectionId',
    key: 'collection',
    width: 120,
    align: 'center',
    filters: collections.value.map(c => ({
      text: c.name,
      value: c.id,
    })),
    onFilter: (value, record) => record.collectionId === value,
  },
  {
    title: '日期',
    dataIndex: 'createTime',
    key: 'date',
    width: 120,
    align: 'center',
    sorter: (a, b) => {
      const dateA = new Date(a.createTime || a.favoriteDate);
      const dateB = new Date(b.createTime || b.favoriteDate);
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

// 将收藏数据格式化为列表视图所需的格式
const formatFavoritesToListData = (favorites) => {
  return favorites.map(item => {
    return {
      ...item,
      key: item.id,
    };
  });
};

// 处理表格选择变化
const onSelectChange = (selectedRowKeys) => {
  selectedItems.value = selectedRowKeys;
};


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
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
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
      {name: '海报', color: 'purple'},
      {name: 'Mac壁纸', color: ''},
    ],
    createTime: '2023-11-15T20:30:00.000Z',
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
      {name: '风景', color: 'blue'},
      {name: '高清', color: ''},
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
      {name: '素材', color: 'green'},
      {name: '创意', color: ''},
      {name: 'UI设计', color: 'pink'},
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
      {name: '动漫', color: 'pink'},
      {name: '壁纸', color: ''},
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
      {name: 'SpringBoot', color: 'blue'},
      {name: '代码', color: ''},
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
      {name: '校园', color: 'cyan'},
      {name: '四季', color: ''},
      {name: '摄影', color: 'green'},
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
      {name: '艺术', color: 'red'},
      {name: '创意', color: ''},
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
      {name: 'Vue3', color: 'green'},
      {name: '代码', color: ''},
      {name: '组件', color: 'blue'},
    ],
    favoriteDate: '2025-02-20',
    collectionId: 'code',
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
    liked: false,
    bookmarked: false,
    views: 2140,
    likes: 845,
    comments: 97,
    createTime: '2023-11-08T09:15:00.000Z',
    aspectRatio: '16/9',
  },
  {
    src: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '程序员壁纸.jpg',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '壁纸',
    tags: [
      {name: '代码', color: 'blue'},
      {name: '壁纸', color: ''},
    ],
    liked: false,
    bookmarked: false,
    views: 3210,
    likes: 1284,
    comments: 156,
    createTime: '2023-10-25T13:50:00.000Z',
    aspectRatio: '16/9',
  },
  {
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'UI组件库.png',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '素材',
    tags: [
      {name: '素材', color: 'green'},
      {name: '创意', color: ''},
    ],
    liked: false,
    bookmarked: false,
    views: 1450,
    likes: 625,
    comments: 85,
    createTime: '2023-11-05T11:20:00.000Z',
    aspectRatio: '4/3',
  },
  {
    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '城市夜景.jpg',
    author: {
      name: '摄影师王小明',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '城市',
    tags: [
      {name: '风景', color: 'blue'},
      {name: '城市', color: ''},
    ],
    liked: true,
    bookmarked: true,
    views: 4260,
    likes: 1780,
    comments: 205,
    createTime: '2023-11-15T20:30:00.000Z',
    aspectRatio: '16/9',
  },
]);

// 当前选中的项目
const selectedItems = ref<string[]>([]);

// 筛选相关数据
const selectedCategories = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const timeRange = ref('all');

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: favorites.value.length,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 分页变化处理函数
const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;

  // 根据当前页码和每页条数调用现有的过滤函数
  filterFavorites();
};

// 每页条数变化处理函数
const handleSizeChange = (current, size) => {
  pagination.pageSize = size;
  pagination.current = 1; // 切换每页数量时重置到第一页
  filterFavorites(); // 调用已有的过滤函数
};

// 根据当前激活的收藏夹筛选数据
const filteredFavorites = ref([...favorites.value]);

// 计算属性 - 总收藏数
const totalFavorites = computed(() => {
  return favorites.value.length;
});

// 计算属性 - 是否有更多项目可加载
const hasMoreItems = computed(() => {
  // 在网格视图模式下，当前显示的项目数小于筛选后的总数，说明还有更多项目可加载
  if (viewMode.value === 'grid') {
    // 获取当前筛选条件下的所有项目数量
    let totalFilteredCount = 0;

    // 应用与filterFavorites相同的筛选逻辑计算总数
    let filtered = [...favorites.value];
    const activeCollectionId = collections.value.find(c => c.active)?.id;

    if (activeCollectionId && activeCollectionId !== 'all') {
      filtered = filtered.filter(item => item.collectionId === activeCollectionId);
    }

    if (selectedCategories.value.length > 0) {
      filtered = filtered.filter(item => {
        return item.tags.some(tag => selectedCategories.value.includes(tag.name));
      });
    }

    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(item => {
        return item.tags.some(tag => selectedTags.value.includes(tag.name));
      });
    }

    if (timeRange.value !== 'all') {
      const now = dayjs();
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.favoriteDate || item.createTime);
        switch (timeRange.value) {
          case 'today': return itemDate.isSame(now, 'day');
          case 'week': return itemDate.isAfter(now.subtract(1, 'week'));
          case 'month': return itemDate.isAfter(now.subtract(1, 'month'));
          case 'year': return itemDate.isAfter(now.subtract(1, 'year'));
          default: return true;
        }
      });
    }

    totalFilteredCount = filtered.length;

    return filteredFavorites.value.length < totalFilteredCount || filteredFavorites.value.length < 20;
  }

  return false;
});

watch(viewMode, (newMode, oldMode) => {
  if (newMode !== oldMode) {
    // 切换视图模式时重新应用筛选
    filterFavorites();
  }
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

// 将收藏项格式化为Gallery组件所需的图片格式
const formatFavoritesToGalleryImages = (favorites) => {
  return favorites.map(item => {
    return {
      id: item.id,
      src: item.src,
      title: item.title,
      author: item.author,
      category: item.category || item.tags[0]?.name || '',
      tags: item.tags,
      createTime: item.createTime || item.favoriteDate,
      // 使用已有的值或生成合理的随机值
      views: item.views || Math.floor(Math.random() * 5000) + 1000,
      likes: item.likes || Math.floor(Math.random() * 2000) + 500,
      comments: item.comments || Math.floor(Math.random() * 200) + 50,
      // 使用项目本身的宽高比，如果没有则使用默认值
      aspectRatio: item.aspectRatio || '16/9',
      bookmarked: item.bookmarked !== undefined ? item.bookmarked : true,
      liked: item.liked !== undefined ? item.liked : (Math.random() > 0.5),
      collectionId: item.collectionId
    };
  });
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
      const itemDate = dayjs(item.favoriteDate || item.createTime);

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

  // 更新总数
  pagination.total = filtered.length;

  // 区分处理不同视图模式
  if (viewMode.value === 'list') {
    // 列表视图使用分页逻辑
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = Math.min(startIndex + pagination.pageSize, filtered.length);
    filteredFavorites.value = filtered.slice(startIndex, endIndex);

    // 如果当前页没有数据且不是第一页，回到上一页
    if (filteredFavorites.value.length === 0 && pagination.current > 1) {
      pagination.current -= 1;
      filterFavorites(); // 递归调用一次获取上一页数据
    }
  } else {
    // 网格视图（瀑布流）不分页，直接展示所有或部分数据
    // 这里可以控制初始加载的数量，例如最多显示前20条
    const maxInitialItems = 20;
    filteredFavorites.value = filtered.slice(0, maxInitialItems);
  }
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
        return dayjs(b.favoriteDate || b.createTime).valueOf() - dayjs(a.favoriteDate || a.createTime).valueOf();
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

// 切换点赞状态
const toggleLike = (item: any) => {
  item.liked = !item.liked;
  message.success(item.liked ? '已添加到喜欢' : '已取消喜欢');
};

// 切换收藏状态
const toggleBookmark = (item: any) => {
  // 收藏夹页面的项目已经是收藏状态，这里是切换不同收藏夹
  const collectionsMenu = collections.value.filter(c => c.id !== 'all');
  Modal.info({
    title: '选择收藏夹',
    content: h => h('div', {}, [
      h('p', {}, `将"${item.title}"移动到:`),
      h('div', {style: 'margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;'},
          collectionsMenu.map(col =>
              h('div', {
                style: 'cursor: pointer; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 4px;',
                onClick: () => {
                  moveToCollection(item, col.id);
                  Modal.destroyAll();
                }
              }, [
                h(getCollectionIcon(col), {style: 'margin-right: 8px;'}),
                col.name
              ])
          )
      )
    ]),
    okText: '取消',
  });
};

// 分享图片
const shareImage = (item: any) => {
  message.success(`分享"${item.title}"的链接已复制到剪贴板`);
};

// 导航到详情页
const navigateToDetail = (item: any) => {
  // 假设image对象有id属性
  const imageId = item.id;
  router.push({
    name: 'PictureDetail',
    params: {id: imageId},
    // 可以通过state传递一些数据，避免重新加载
    state: {imageData: item}
  });
};

// 加载更多
const loadMore = () => {
  message.loading('加载更多内容...', 1.5)
      .then(() => {
        // 获取当前筛选条件下的所有项目
        let allFiltered = [...favorites.value];

        // 应用与filterFavorites相同的筛选逻辑
        const activeCollectionId = collections.value.find(c => c.active)?.id;
        if (activeCollectionId && activeCollectionId !== 'all') {
          allFiltered = allFiltered.filter(item => item.collectionId === activeCollectionId);
        }

        if (selectedCategories.value.length > 0) {
          allFiltered = allFiltered.filter(item => {
            return item.tags.some(tag => selectedCategories.value.includes(tag.name));
          });
        }

        if (selectedTags.value.length > 0) {
          allFiltered = allFiltered.filter(item => {
            return item.tags.some(tag => selectedTags.value.includes(tag.name));
          });
        }

        if (timeRange.value !== 'all') {
          const now = dayjs();
          allFiltered = allFiltered.filter(item => {
            const itemDate = dayjs(item.favoriteDate || item.createTime);
            switch (timeRange.value) {
              case 'today': return itemDate.isSame(now, 'day');
              case 'week': return itemDate.isAfter(now.subtract(1, 'week'));
              case 'month': return itemDate.isAfter(now.subtract(1, 'month'));
              case 'year': return itemDate.isAfter(now.subtract(1, 'year'));
              default: return true;
            }
          });
        }

        // 应用排序
        sortFavoritesList(allFiltered);

        // 计算需要加载的新项目
        const currentCount = filteredFavorites.value.length;
        const batchSize = 8; // 每次加载的数量
        const newItems = allFiltered.slice(currentCount, currentCount + batchSize);

        if (newItems.length > 0) {
          // 将新项目添加到当前显示的列表中
          filteredFavorites.value = [...filteredFavorites.value, ...newItems];
          message.success(`已加载 ${newItems.length} 个新内容`);
        } else {
          // 如果没有更多项目，则可以考虑生成新的随机项目
          const sampleSize = Math.min(4, favorites.value.length);
          const sampleItems = favorites.value
              .sort(() => 0.5 - Math.random()) // 随机排序
              .slice(0, sampleSize); // 取前几项

          const generatedItems = sampleItems.map(item => {
            // 创建深拷贝并修改部分属性以区分原项目
            const newItem = JSON.parse(JSON.stringify(item));
            // 生成唯一ID
            newItem.id = `new_${item.id}_${Date.now()}`;
            // 修改日期为最近30天内的随机日期
            newItem.favoriteDate = dayjs()
                .subtract(Math.floor(Math.random() * 30), 'day')
                .format('YYYY-MM-DD');
            // 随机分配到某个收藏夹
            const allCollectionIds = collections.value
                .filter(c => c.id !== 'all')
                .map(c => c.id);
            newItem.collectionId = allCollectionIds[Math.floor(Math.random() * allCollectionIds.length)];

            // 更新其他属性以区分
            if (newItem.views) newItem.views = Math.floor(newItem.views * (0.7 + Math.random() * 0.6));
            if (newItem.likes) newItem.likes = Math.floor(newItem.likes * (0.7 + Math.random() * 0.6));
            if (newItem.comments) newItem.comments = Math.floor(newItem.comments * (0.7 + Math.random() * 0.6));

            return newItem;
          });

          // 添加到列表中
          favorites.value.push(...generatedItems);

          // 更新收藏夹计数
          const collectionCounts = {};
          generatedItems.forEach(item => {
            if (!collectionCounts[item.collectionId]) {
              collectionCounts[item.collectionId] = 0;
            }
            collectionCounts[item.collectionId]++;
          });

          // 更新各收藏夹计数
          Object.keys(collectionCounts).forEach(collectionId => {
            const collection = collections.value.find(c => c.id === collectionId);
            if (collection) {
              collection.count += collectionCounts[collectionId];
            }
          });

          // 更新"全部收藏"计数
          const allCollection = collections.value.find(c => c.id === 'all');
          if (allCollection) {
            allCollection.count += generatedItems.length;
          }

          // 将新生成的项目添加到筛选结果中
          filteredFavorites.value = [...filteredFavorites.value, ...generatedItems];
          message.success(`已加载 ${generatedItems.length} 个新内容`);
        }
      });
};

// 跳转到主页
const goToHomePage = () => {
  router.push({name: 'HomePage'});
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

  // 确保每个收藏项都有宽高比属性，以优化瀑布流布局
  favorites.value.forEach(item => {
    if (!item.aspectRatio) {
      // 根据标签或类别为项目分配不同的宽高比
      // 这有助于创建更有视觉吸引力的瀑布流布局
      const tag = item.tags[0]?.name.toLowerCase() || '';

      if (tag.includes('壁纸') || tag.includes('风景')) {
        item.aspectRatio = '16/9'; // 风景类常用的宽高比
      } else if (tag.includes('人像') || tag.includes('模特') || tag.includes('写真')) {
        item.aspectRatio = '3/4'; // 人像照片常用的竖向比例
      } else if (tag.includes('艺术') || tag.includes('创意')) {
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
    // 由于我们现在使用ImageGallery组件，需要监听其中的.masonry-item元素
    const cards = document.querySelectorAll('.masonry-item');
    console.log('找到瀑布流项目数量:', cards.length);
    cards.forEach((card, index) => {
      // 添加可见性检查
      const {stop} = useIntersectionObserver(
          card,
          ([{isIntersecting}]) => {
            if (isIntersecting) {
              setTimeout(() => {
                card.classList.add('animate__animated', 'animate__fadeInUp');
              }, index * 50); // 减少延迟以加快动画
              stop();
            }
          },
          {threshold: 0.1} // 降低阈值以提前触发动画
      );
    });
  }, 800); // 给DOM渲染足够的时间
});
</script>

<style scoped>
/* 基础页面样式 */
.favorite-page {
  padding: 16px 2vw; /* 使用相对单位减少两侧空白 */
  max-width: 1600px; /* 增加最大宽度适应大屏 */
  margin: 0 auto;
  width: 100%;
}

/* 优化卡片网格布局 - 瀑布流列数调整 */
@media (min-width: 1400px) {
  .favorite-page .masonry-gallery {
    column-count: 5; /* 大屏增加列数 */
    column-gap: 20px;
  }
}

@media (min-width: 1800px) {
  .favorite-page .masonry-gallery {
    column-count: 6; /* 超宽屏幕显示更多列 */
    column-gap: 24px;
  }
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

.star-icon {
  color: #f1c40f;
  margin-left: 6px;
  font-size: 18px;
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

/* 创建收藏夹按钮的高度统一 */
.create-collection-btn {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 6px;
}

.create-collection-btn :deep(.anticon) {
  font-size: 14px;
  margin-right: 4px;
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

/* 增强收藏夹标签的视觉效果 */
/* 增强收藏夹标签的视觉效果 */
.collections-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
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

/* 增强收藏夹标签样式 */
.collection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.collection-tag {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f5f7fa;
  border: 1px solid #e5e7eb;
  transition: all 0.25s ease;
  color: #374151;
  margin: 0;
  height: auto;
  line-height: 1.5;
  user-select: none;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.collection-tag:hover {
  border-color: #6366f1;
  background-color: #f9f9ff;
  transform: translateY(-1px);
}

.collection-tag-active {
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
  transform: translateY(-1px);
}

.collection-tag-active:hover {
  background: linear-gradient(135deg, #5254cc 0%, #6c78e8 100%);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.collection-tag :deep(.anticon) {
  margin-right: 8px;
  font-size: 16px;
}

.collection-count {
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 12px;
  font-weight: bold;
  line-height: normal;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 为不同收藏夹设置不同图标颜色 */
.collection-tag:not(.collection-tag-active) :deep(.anticon-star) {
  color: #f59e0b;
}

.collection-tag:not(.collection-tag-active) :deep(.anticon-heart) {
  color: #ef4444;
}

.collection-tag:not(.collection-tag-active) :deep(.anticon-picture) {
  color: #3b82f6;
}

.collection-tag:not(.collection-tag-active) :deep(.anticon-file) {
  color: #10b981;
}

.collection-tag:not(.collection-tag-active) :deep(.anticon-folder) {
  color: #6366f1;
}

/* 设置收藏夹头部区域的布局 */
.collections-section .section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

/* 增强设置按钮的视觉效果 */
.collections-section .ant-btn-text {
  width: auto;
  height: auto;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.collections-section .ant-btn-text:hover {
  background-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.2);
}

.collections-section .ant-btn-text .anticon {
  font-size: 16px;
}

/* 为设置按钮添加文字 */
.settings-btn::after {
  content: '管理收藏夹';
  margin-left: 4px;
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

@media (min-width: 576px) {
  .favorite-page .masonry-gallery {
    column-count: 2;
    column-gap: 16px;
  }
}

@media (min-width: 992px) {
  .favorite-page .masonry-gallery {
    column-count: 3;
    column-gap: 20px;
  }
}

@media (min-width: 1200px) {
  .favorite-page .masonry-gallery {
    column-count: 4;
    column-gap: 24px;
  }
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
</style>