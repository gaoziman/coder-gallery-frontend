<template>
  <div class="my-space-page">
    <!-- 用户个人资料和空间概览 -->
    <div class="profile-card">
      <div class="profile-cover gradient-bg"></div>

      <div class="profile-avatar-container">
        <a-avatar :size="128" :src="userInfo.avatar" class="profile-avatar"/>
        <div class="verified-badge">
          <check-outlined/>
        </div>
      </div>

      <div class="profile-info">
        <h2 class="profile-name">{{ userInfo.name }}</h2>
        <p class="profile-desc">{{ userInfo.level }} · 已加入 {{ userInfo.joinTime }}</p>

        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-count">{{ userInfo.imageCount }}</div>
            <div class="stat-label">图片</div>
          </div>
          <div class="stat-item">
            <div class="stat-count">{{ userInfo.spaceCount }}</div>
            <div class="stat-label">空间</div>
          </div>
          <div class="stat-item">
            <div class="stat-count">{{ userInfo.teamCount }}</div>
            <div class="stat-label">团队</div>
          </div>
          <div class="stat-item">
            <div class="stat-count">{{ userInfo.followerCount }}</div>
            <div class="stat-label">关注者</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="profile-actions">
          <a-button type="primary" class="action-btn primary-btn">
            <template #icon>
              <upload-outlined/>
            </template>
            上传图片
          </a-button>
          <a-button class="action-btn">
            <template #icon>
              <edit-outlined/>
            </template>
            批量编辑
          </a-button>
          <a-button class="action-btn">
            <template #icon>
              <bar-chart-outlined/>
            </template>
            查看统计
          </a-button>
        </div>
      </div>
    </div>

    <!-- 空间类型和容量 -->
    <div class="space-types-container">
      <a-row :gutter="24">
        <!-- 普通空间 -->
        <a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
          <a-card class="space-card">
            <div class="space-card-header">
              <folder-outlined class="space-icon regular"/>
              <div class="space-info">
                <h3 class="space-title">普通空间</h3>
                <p class="space-status">已开通</p>
              </div>
            </div>

            <div class="space-details">
              <div class="space-detail-item">
                <span class="detail-label">存储空间</span>
                <span class="detail-value">5GB</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">图片数量限制</span>
                <span class="detail-value">1,000张</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">分享功能</span>
                <span class="detail-value">基础</span>
              </div>
            </div>

            <div class="space-usage">
              <div class="usage-header">
                <span class="usage-label">使用情况</span>
                <span class="usage-value">4.2GB/5GB</span>
              </div>
              <a-progress :percent="84" :show-info="false" stroke-color="#6366F1"/>
            </div>
          </a-card>
        </a-col>

        <!-- 专业版空间 -->
        <a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
          <a-card class="space-card current">
            <div class="current-tag">当前版本</div>
            <div class="space-card-header">
              <folder-open-outlined class="space-icon pro"/>
              <div class="space-info">
                <h3 class="space-title">专业版空间</h3>
                <p class="space-status">已开通</p>
              </div>
            </div>

            <div class="space-details">
              <div class="space-detail-item">
                <span class="detail-label">存储空间</span>
                <span class="detail-value">20GB</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">图片数量限制</span>
                <span class="detail-value">10,000张</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">分享功能</span>
                <span class="detail-value">高级</span>
              </div>
            </div>

            <div class="space-usage">
              <div class="usage-header">
                <span class="usage-label">使用情况</span>
                <span class="usage-value">8.5GB/20GB</span>
              </div>
              <a-progress :percent="42.5" :show-info="false" stroke-color="#6366F1"/>
            </div>
          </a-card>
        </a-col>

        <!-- 旗舰空间 -->
        <a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
          <a-card class="space-card">
            <div class="space-card-header">
              <folder-add-outlined class="space-icon"/>
              <div class="space-info">
                <h3 class="space-title">旗舰空间</h3>
                <p class="space-status">未开通</p>
              </div>
            </div>

            <div class="space-details">
              <div class="space-detail-item">
                <span class="detail-label">存储空间</span>
                <span class="detail-value">100GB</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">图片数量限制</span>
                <span class="detail-value">无限制</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">分享功能</span>
                <span class="detail-value">无限制</span>
              </div>
            </div>

            <div class="space-action">
              <a-button type="primary" block class="upgrade-btn">
                升级
              </a-button>
            </div>
          </a-card>
        </a-col>

        <!-- AI助力空间 -->
        <a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
          <a-card class="space-card">
            <div class="space-card-header">
              <bulb-outlined class="space-icon ai"/>
              <div class="space-info">
                <h3 class="space-title">AI助力空间</h3>
                <p class="space-status">新功能</p>
              </div>
            </div>

            <div class="space-details">
              <div class="space-detail-item">
                <span class="detail-label">智能分类</span>
                <span class="detail-value">支持</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">AI图像生成</span>
                <span class="detail-value">每月50次</span>
              </div>
              <div class="space-detail-item">
                <span class="detail-label">内容识别</span>
                <span class="detail-value">高级</span>
              </div>
            </div>

            <div class="space-action">
              <a-button type="primary" block class="try-btn">
                立即体验
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选区域 -->
    <a-card class="filter-card"
            :bordered="false"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 600 } }">
      <div class="filter-wrapper">
        <!-- 日期选择器 -->
        <div class="filter-item">
          <div class="filter-label">日期</div>
          <a-range-picker
              v-model:value="dateRange.value"
              :placeholder="['开始日期', '结束日期']"
              format="YYYY-MM-DD"
              @change="onDateChange"
              class="date-range-picker"
          />
        </div>

        <!-- 图片名称 -->
        <div class="filter-item">
          <div class="filter-label">图片名称</div>
          <input type="text" class="filter-input" placeholder="输入图片名称关键词" v-model="filterConditions.imageName" />
        </div>

        <!-- 图片简介 -->
        <div class="filter-item">
          <div class="filter-label">图片简介</div>
          <input type="text" class="filter-input" placeholder="输入图片简介关键词" v-model="filterConditions.imageDesc" />
        </div>

        <!-- 分类下拉框 - 修复宽度问题 -->
        <div class="filter-item">
          <div class="filter-label">分类</div>
          <a-select
              v-model:value="filterConditions.category"
              placeholder="全部分类"
              class="filter-select"
              style="width: 100%"
          >
            <a-select-option value="">全部分类</a-select-option>
            <a-select-option
                v-for="category in categories.filter(c => c.name !== '全部')"
                :key="category.name"
                :value="category.name"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </div>

        <!-- 图片宽度 -->
        <div class="filter-item">
          <div class="filter-label">图片宽度</div>
          <input type="number" class="filter-input" placeholder="宽度" v-model="filterConditions.minWidth" />
        </div>

        <!-- 图片高度 -->
        <div class="filter-item">
          <div class="filter-label">图片高度</div>
          <input type="number" class="filter-input" placeholder="高度" v-model="filterConditions.minHeight" />
        </div>

        <!-- 图片格式 - 修复宽度问题 -->
        <div class="filter-item">
          <div class="filter-label">图片格式</div>
          <a-select
              v-model:value="format"
              placeholder="全部格式"
              class="filter-select"
              style="width: 100%"
          >
            <a-select-option value="">全部格式</a-select-option>
            <a-select-option value="jpg">JPG/JPEG</a-select-option>
            <a-select-option value="png">PNG</a-select-option>
            <a-select-option value="svg">SVG</a-select-option>
            <a-select-option value="gif">GIF</a-select-option>
            <a-select-option value="webp">WEBP</a-select-option>
          </a-select>
        </div>

        <!-- 尺寸类型 - 修复宽度问题 -->
        <div class="filter-item">
          <div class="filter-label">尺寸类型</div>
          <a-select
              v-model:value="size"
              placeholder="全部尺寸"
              class="filter-select"
              style="width: 100%"
              @change="handleSizeChange"
          >
            <a-select-option value="">全部尺寸</a-select-option>
            <a-select-option value="small">小尺寸 (< 1MP)</a-select-option>
            <a-select-option value="medium">中等尺寸 (1-5MP)</a-select-option>
            <a-select-option value="large">大尺寸 (> 5MP)</a-select-option>
          </a-select>
        </div>

        <!-- 标签 - 修复多选下拉问题 -->
        <div class="filter-item">
          <div class="filter-label">标签</div>
          <a-select
              v-model:value="filterConditions.tags"
              mode="multiple"
              placeholder="选择标签"
              class="filter-select"
              style="width: 100%"
          >
            <a-select-option
                v-for="tag in tags"
                :key="tag.name"
                :value="tag.name"
            >
              {{ tag.name }}
            </a-select-option>
          </a-select>
        </div>

        <!-- 主色调 -->
        <div class="filter-item color-container">
          <div class="filter-label">主色调</div>
          <div class="color-options-wrapper">
            <div class="color-options">
              <div
                  v-for="(color, index) in colorOptions"
                  :key="index"
                  :class="['color-option', { 'selected': selectedColor === color.value }]"
                  :style="{ backgroundColor: color.color }"
                  :title="color.name"
                  @click="selectColor(color.value)"
              ></div>
            </div>

            <!-- 将按钮区域移到这里 -->
            <div class="filter-actions">
              <button class="filter-btn filter-btn-apply" @click="applyFilters">搜索</button>
              <button class="filter-btn filter-btn-reset" @click="resetFilters">重置</button>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 排序和筛选器 - 修改布局：筛选在左侧，排序在右侧 -->
    <div class="filter-header">
      <div class="filter-left">
        <a-button type="primary"
                  class="create-filter-btn"
                  @click="showCreateFilterModal"
                  @mousedown="addRippleEffect">
          <template #icon><plus-outlined /></template>
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

      <div class="filter-right">
        <a-dropdown :trigger="['click']">
          <a-button class="sort-dropdown">
            筛选排序：{{ currentSortLabel }}
            <down-outlined />
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

    <!-- 分类浏览 -->
    <div class="category-section">
      <div class="section-title">
        <h3>分类浏览</h3>
      </div>
      <div class="category-tags">
        <a-tag
            v-for="(category, index) in categories"
            :key="index"
            :class="['category-tag', { 'active': category.active }]"
            @click="toggleCategory(index)"
        >
          {{ category.name }}
        </a-tag>
      </div>

      <!-- 热门标签 -->
      <div class="tag-section">
        <div class="section-title">
          <h3>热门标签</h3>
        </div>
        <div class="tag-list">
          <a-tag
              v-for="(tag, index) in tags"
              :key="index"
              :class="['custom-tag', { 'tag-hot': tag.hot }]"
              @click="toggleTag(index)"
          >
            {{ tag.name }}
            <span v-if="tag.count" class="tag-count">{{ tag.count }}</span>
          </a-tag>
        </div>
      </div>
    </div>

    <!-- 瀑布流图片展示 - 修改图片卡片样式 -->
    <div class="masonry-gallery"
         :initial="{ opacity: 0 }"
         :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }">
      <template v-if="galleryImages.length > 0">
        <div
            v-for="(image, index) in galleryImages"
            :key="index"
            class="masonry-item"
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
          <div class="image-card">
            <div class="image-cover-container">
              <img :src="image.src" :alt="image.title" class="gallery-image" />
              <div class="image-hover-overlay">
                <div class="image-actions">
                  <a-button type="text" class="image-action-btn" shape="circle">
                    <template #icon><eye-outlined /></template>
                  </a-button>
                  <a-button type="text" class="image-action-btn" shape="circle">
                    <template #icon><download-outlined /></template>
                  </a-button>
                  <a-button type="text" class="image-action-btn" shape="circle">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </div>
              </div>
            </div>
            <div class="image-info">
              <div class="image-title">{{ image.title }}</div>
              <div class="image-author">
                <a-avatar :src="image.author.avatar" :size="24" />
                <span class="author-name">{{ image.author.name }}</span>
              </div>
              <div class="image-tags">
                <a-tag class="image-tag" v-for="(tag, tagIndex) in image.tags.slice(0, 2)" :key="tagIndex">
                  {{ tag.name }}
                </a-tag>
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
      <a-button type="primary" class="load-more-btn" @click="loadMore">
        加载更多
        <template #icon><down-outlined /></template>
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
import {ref, reactive, onMounted, watch} from 'vue';
import {
  UploadOutlined,
  EditOutlined,
  BarChartOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  BulbOutlined,
  DownOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';

// 在script部分修改日期相关代码
import {DatePicker} from 'ant-design-vue';
import {useIntersectionObserver} from "@vueuse/core";
import {useFilterStore} from "@/stores/filterStore";
import 'animate.css';
import CreateFilterModal from "@/pages/home/CreateFilterModal.vue";
import FilterList from "@/pages/home/FilterList.vue";

const {RangePicker} = DatePicker;

// 日期相关（改为使用Ant Design的日期选择器）
const dateRange = reactive({
  value: null,
  startText: '',
  endText: ''
});

// 日期变化处理函数
const onDateChange = (dates :any, dateStrings:any) => {
  if (dates) {
    dateRange.startText = dateStrings[0];
    dateRange.endText = dateStrings[1];
  } else {
    dateRange.startText = '';
    dateRange.endText = '';
  }
  // 应用日期筛选
  fetchGalleryImages();
};

// 用户信息
const userInfo = reactive({
  name: '张小明',
  level: '专业版用户',
  joinTime: '1 年',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  imageCount: 245,
  spaceCount: 12,
  teamCount: 3,
  followerCount: '1.2K'
});

// 搜索相关
const searchText = ref('');
const onSearch = (value: string) => {
  console.log('搜索：', value);
};

// 使用筛选器Store
const filterStore = useFilterStore();

// 分类数据
const categories = reactive([
  { name: '全部', active: true },
  { name: '个人', active: false },
  { name: '星球', active: false },
  { name: '面试题', active: false },
  { name: '表情包', active: false },
  { name: '素材', active: false },
  { name: '学习', active: false },
  { name: 'Bugs', active: false },
  { name: '海报', active: false },
  { name: '壁纸', active: false },
  { name: '动漫', active: false },
]);

// 切换分类选中状态
const toggleCategory = (index: number) => {
  if (index === 0) {
    // 如果是全部，则只激活全部
    categories.forEach((cat, i) => {
      cat.active = i === 0;
    });
  } else {
    // 取消全部的激活
    categories[0].active = false;
    // 切换当前分类的激活状态
    categories[index].active = !categories[index].active;

    // 如果没有任何激活的分类，则激活全部
    const hasActive = categories.some(cat => cat.active);
    if (!hasActive) {
      categories[0].active = true;
    }
  }
  // 应用筛选
  fetchGalleryImages();
};

// 切换标签选中状态
const toggleTag = (index: number) => {
  tags[index].hot = !tags[index].hot;
  // 应用筛选
  fetchGalleryImages();
};

// 标签数据
const tags = reactive([
  { name: '热门', hot: true, count: '120+' },
  { name: '头像', hot: false },
  { name: '高清', hot: false },
  { name: '艺术', hot: false },
  { name: '校园', hot: false },
  { name: '风景', hot: false },
  { name: '简历', hot: false },
  { name: '创意', hot: false },
  { name: 'Spring', hot: false },
  { name: 'SpringBoot', hot: false },
  { name: '美女', hot: false },
  { name: '海边', hot: false },
  { name: 'Mac壁纸', hot: false },
]);


const format = ref('');
const size = ref('');
const showCustomSize = ref(false);
const customSize = reactive({
  width: null,
  height: null
});

const handleSizeChange = (value: string) => {
  showCustomSize.value = value === 'custom';
};

const selectedColor = ref('');
const colorOptions = [
  {value: 'red', name: '红色', color: '#f5222d'},
  {value: 'orange', name: '橙色', color: '#fa8c16'},
  {value: 'yellow', name: '黄色', color: '#fadb14'},
  {value: 'green', name: '绿色', color: '#52c41a'},
  {value: 'cyan', name: '青色', color: '#13c2c2'},
  {value: 'blue', name: '蓝色', color: '#1677ff'},
  {value: 'purple', name: '紫色', color: '#722ed1'},
  {value: 'pink', name: '粉色', color: '#eb2f96'},
  {value: 'gray', name: '灰色', color: '#8c8c8c'},
  {value: 'black', name: '黑色', color: '#000000'},
  {value: 'white', name: '白色', color: '#ffffff', border: true}
];

const selectColor = (color: string) => {
  selectedColor.value = selectedColor.value === color ? '' : color;
  fetchGalleryImages();
};

// 排序相关
const currentSort = ref('newest');
const currentSortLabel = ref('最新上传');

const handleSortMenuClick = (e: any) => {
  currentSort.value = e.key;

  const sortLabels: Record<string, string> = {
    newest: '最新上传',
    oldest: '最早上传',
    popular: '最受欢迎',
    look: '最多浏览'
  };

  currentSortLabel.value = sortLabels[e.key] || '最新上传';
  fetchGalleryImages();
};

// 图库数据
const galleryImages = reactive([
  {
    src: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    title: '设计风格指南.jpg',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '海报', color: 'purple' },
      { name: 'Mac壁纸', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '海边日落.jpg',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '风景', color: 'blue' },
      { name: '海边', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'UI组件库.png',
    author: {
      name: 'UI设计师小李',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '素材', color: 'green' },
      { name: '创意', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '城市夜景.jpg',
    author: {
      name: '摄影师王小明',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '风景', color: 'blue' },
      { name: '城市', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '自然风光.jpg',
    author: {
      name: '摄影师小王',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '风景', color: 'blue' },
      { name: '高清', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Mac系统壁纸.jpg',
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: 'Mac壁纸', color: 'cyan' },
      { name: '创意', color: '' },
    ],
    liked: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '程序员壁纸.jpg',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    tags: [
      { name: '代码', color: 'blue' },
      { name: '壁纸', color: '' },
    ],
    liked: false,
  }
]);

// 原始图库数据（用于筛选）
const originalGalleryImages = [...galleryImages];

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
        galleryEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }
};

// 扩展筛选条件
const filterConditions = reactive({
  imageName: '',
  imageDesc: '',
  minWidth: null,
  maxWidth: null,
  minHeight: null,
  maxHeight: null,
  category: '',
  tags: []
});

// 重置筛选器
const resetFilters = () => {
  // 重置所有筛选条件
  Object.keys(filterConditions).forEach(key => {
    if (Array.isArray(filterConditions[key])) {
      filterConditions[key] = [];
    } else {
      filterConditions[key] = '';
    }
  });

  dateRange.value = null;
  dateRange.startText = '';
  dateRange.endText = '';
  format.value = '';
  size.value = '';
  selectedColor.value = '';
  showCustomSize.value = false;
  customSize.width = null;
  customSize.height = null;

  // 重置分类和标签
  categories.forEach((cat, i) => {
    cat.active = i === 0;
  });

  tags.forEach(tag => {
    tag.hot = false;
  });

  // 标记第一个标签为热门（如果存在）
  if (tags.length > 0) {
    tags[0].hot = true;
  }

  // 重新加载图片
  fetchGalleryImages();

  message.success('筛选条件已重置');
};

// 应用筛选器（搜索）
const applyFilters = () => {
  // 实际应用中，这里会根据所有筛选条件来过滤图片
  fetchGalleryImages();
  message.success('筛选条件已应用');
};

// 修改fetchGalleryImages函数来正确处理分类和标签筛选
const fetchGalleryImages = () => {
  // 构建筛选条件
  let activeCategories = categories
      .filter(category => category.active)
      .map(category => category.name);

  let activeTags = tags
      .filter(tag => tag.hot)
      .map(tag => tag.name);

  console.log('应用筛选条件获取图片: 分类=', activeCategories, '标签=', activeTags);

  // 确保 originalGalleryImages 有内容
  if (originalGalleryImages.length === 0) {
    console.warn('原始图片数据为空，正在重新初始化...');
    originalGalleryImages.push(...JSON.parse(JSON.stringify(galleryImages)));
  }

  // 模拟根据筛选条件过滤图片
  let filteredImages = [...originalGalleryImages]; // 默认使用所有图片

  // 如果有筛选条件，再应用筛选逻辑
  if ((activeCategories.length > 0 && !activeCategories.includes('全部')) || activeTags.length > 0) {
    filteredImages = originalGalleryImages.filter(image => {
      // 筛选分类（如果选中了"全部"分类，则不进行分类筛选）
      if (activeCategories.length > 0 && !activeCategories.includes('全部')) {
        const imageCategoryMatch = image.tags.some(tag =>
            activeCategories.includes(tag.name)
        );
        if (!imageCategoryMatch) return false;
      }

      // 筛选标签（如果有选中的标签）
      if (activeTags.length > 0) {
        const tagMatch = image.tags.some(tag =>
            activeTags.includes(tag.name)
        );
        if (!tagMatch) return false;
      }

      return true;
    });
  }

  // 根据排序条件排序
  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (currentSort.value) {
      case 'newest':
        return 0; // 假设新的排在前面
      case 'popular':
        return b.liked ? 1 : -1; // 受欢迎的排在前面
      case 'look':
        return 0; // 这里应该根据浏览次数排序，暂时为0
      case 'oldest':
        return 0; // 假设旧的排在前面
      default:
        return 0;
    }
  });

  console.log('筛选后的图片数量:', sortedImages.length);

  // 更新图库数据
  galleryImages.splice(0, galleryImages.length, ...sortedImages);

  // 如果筛选结果为空，显示提示信息
  if (sortedImages.length === 0) {
    message.info('未找到符合条件的图片');
  }
};

// 初始化
onMounted(() => {
  // 首先清空原始图片数组，避免重复
  originalGalleryImages.length = 0;

  // 使用深拷贝创建图片副本
  const deepCopiedImages = JSON.parse(JSON.stringify(galleryImages));

  // 将图片存入原始数据数组
  originalGalleryImages.push(...deepCopiedImages);

  setTimeout(() => {
    galleryImages.splice(0, galleryImages.length, ...deepCopiedImages);
  }, 100);

  // 添加滚动监听
  setTimeout(() => {
    const cards = document.querySelectorAll('.masonry-item');
    console.log('找到瀑布流卡片数量:', cards.length);
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

// 加载更多
const loadMore = () => {
  console.log('加载更多图片');
  message.info('正在加载更多图片...');
  // 模拟加载更多，实际应该从API获取
};

// 筛选器相关
const filterModalVisible = ref(false);
const savedFilters = ref([]);

// 显示创建筛选器弹窗
const showCreateFilterModal = () => {
  filterModalVisible.value = true;
};

// 保存筛选器
const saveFilter = (filter) => {
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
const handleDeleteFilter = (filterId) => {
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
</script>

<style scoped>
/* 基础样式 */
.my-space-page {
  padding: 1.5rem;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 用户个人资料卡片 */
.profile-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  margin-bottom: 2rem;
}

.profile-cover {
  height: 12rem;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.profile-avatar-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 4rem;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 2rem;
  width: 2rem;
  background-color: #6366F1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
  font-size: 1rem;
}

.profile-info {
  padding-top: 4rem;
  padding-bottom: 1.5rem;
  text-align: center;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.profile-desc {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1rem;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-count {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
}

.action-btn :deep(.anticon) {
  margin-right: 0.5rem;
}

.primary-btn {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.primary-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 空间类型卡片 */
.space-types-container {
  margin-bottom: 2rem;
}

.space-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  height: 100%;
  position: relative;
}

.space-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.space-card.current {
  border: 2px solid #6366F1;
}

.current-tag {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #6366F1;
  color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.space-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.space-icon {
  font-size: 2rem;
  color: #9CA3AF;
  margin-right: 1rem;
}

.space-icon.pro {
  color: #6366F1;
}

.space-icon.ai {
  color: #8B5CF6;
}

.space-info h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
}

.space-status {
  font-size: 0.875rem;
  color: #6B7280;
}

.space-details {
  margin: 1rem 0;
}

.space-detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.detail-label {
  color: #6B7280;
}

.detail-value {
  font-weight: 500;
}

.space-usage {
  margin-top: 1rem;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.usage-label {
  color: #6B7280;
}

.usage-value {
  color: #6366F1;
}

.upgrade-btn, .try-btn {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border: none;
  margin-top: 1.5rem;
  transition: all 0.3s;
}

.try-btn {
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
}

.upgrade-btn:hover, .try-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* ================ 筛选区域终极优化 ================ */
/* ================ 筛选区域优化设计 ================ */
.filter-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
}

/* 筛选项网格布局 */
.filter-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* 筛选项样式 */
.filter-item {
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  min-height: 90px;
}

/* 标签样式 */
.filter-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 8px;
}

/* 解决下拉菜单宽度问题 */
.filter-select {
  width: 100% !important;
}

/* 确保下拉菜单显示正确 */
.filter-select :deep(.ant-select-selector) {
  width: 100% !important;
  min-width: 100% !important;
  height: 36px !important;
  padding: 0 11px !important;
}

/* 修复下拉菜单在展开时的宽度问题 */
:deep(.ant-select-dropdown) {
  min-width: 180px !important;
}

/* 确保多选标签菜单可见 */
.filter-select[mode="multiple"] :deep(.ant-select-selector) {
  height: auto !important;
  min-height: 36px !important;
  padding: 2px 4px !important;
}

/* 统一输入框样式 */
.filter-input,
.date-range-picker :deep(.ant-picker) {
  width: 100%;
  height: 36px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 0 12px;
}

/* 日期选择器样式修复 */
.date-range-picker {
  width: 100%;
}

.date-range-picker :deep(.ant-picker) {
  width: 100% !important;
}

/* 颜色选择器容器 */
.filter-item:has(.color-options) {
  grid-column: span 2;
}

/* 颜色选择器样式 */
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.color-option {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-option.selected {
  border: 2px solid white;
  box-shadow: 0 0 0 2px #6366F1;
}

/* 按钮容器 */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 按钮样式 */
.filter-btn {
  min-width: 90px;
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.25s ease;
  cursor: pointer;
}

/* 重置按钮 */
.filter-btn-reset {
  background-color: white;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

/* 搜索按钮 */
.filter-btn-apply {
  background-color: #6366F1;
  color: white;
  border: none;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .filter-wrapper {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .filter-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-item:has(.color-options) {
    grid-column: span 1;
  }
}

@media (max-width: 576px) {
  .filter-wrapper {
    grid-template-columns: 1fr;
  }
}

/* 按钮点击效果 */
.filter-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 分类与标签区域优化 */
.category-section {
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 30px;  /* 增加与下方内容的间距 */
}

/* 标题样式优化 */
.section-title {
  margin-bottom: 20px;  /* 增加与内容的间距 */
}

.section-title h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  position: relative;
  display: inline-block;
}

.section-title h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6366F1 0%, transparent 100%);
  border-radius: 3px;
}

/* 分类标签样式优化 */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.category-tag {
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
  background-color: #F9FAFB;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  margin: 0;
  font-weight: 500;
}

.category-tag:hover {
  background-color: #F3F4F6;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.category-tag.active {
  color: white;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.25);
  font-weight: 600;
}

/* 热门标签区域 */
.tag-section {
  margin-top: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  cursor: pointer;
  margin-top: 15px;
}

.custom-tag {
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s ease;
  background-color: #F9FAFB;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  margin: 0;
}

.custom-tag:hover {
  background-color: #F3F4F6;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
}

.tag-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  margin-left: 6px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #6366F1;
  border-radius: 9px;
  padding: 0 6px;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 图片卡片中的标签样式优化 */
.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.image-tags .image-tag {
  margin: 0;
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  border: none;
  padding: 3px 8px;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 400;
}

/* 排序和筛选器头部区域 - 修改布局：筛选在左侧，排序在右侧 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
}

.create-filter-btn {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 36px;
  transition: all 0.3s;
}

.create-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sort-dropdown {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.sort-dropdown :deep(.anticon) {
  margin-left: 8px;
}

/* 活动筛选器样式 */
.active-filter {
  margin-bottom: 20px;
}

.active-filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* ================ 图片卡片样式优化 - 与图2相似的效果 ================ */
/* 瀑布流布局 */
.masonry-gallery {
  column-count: 1;
  column-gap: 20px;
  margin-bottom: 32px;
}

@media (min-width: 640px) {
  .masonry-gallery {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-gallery {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .masonry-gallery {
    column-count: 4;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 20px;
  width: 100%;
}

/* 图片卡片样式 */
.image-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 图片容器样式 - 实现图2中的悬停效果 */
.image-cover-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.gallery-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

/* 悬停图层 */
.image-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-card:hover .image-hover-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 图片操作按钮样式 - 模拟图2中的白色圆形按钮 */
.image-actions {
  display: flex;
  gap: 12px;
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

/* 添加悬停效果 - 按钮背景变为紫色 */
.image-action-btn:hover {
  transform: scale(1.1);
  background-color: #6366F1 !important; /* 使用紫色背景，与主题色一致 */
}

/* 悬停时图标颜色变为白色，提高对比度 */
.image-action-btn:hover :deep(.anticon) {
  font-size: 18px;
  color: white; /* 悬停时图标变为白色 */
}

/* 默认图标颜色 */
.image-action-btn :deep(.anticon) {
  font-size: 18px;
  color: #333;
  transition: color 0.3s ease; /* 添加颜色过渡效果 */
}

/* 图片信息区域样式 */
.image-info {
  padding: 12px 16px;
}

.image-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-author {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.author-name {
  margin-left: 8px;
  font-size: 13px;
  color: #666;
}

/* 空状态样式 */
.empty-gallery {
  text-align: center;
  padding: 60px 0;
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin: 2.5rem 0;
}

.load-more-btn {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border: none;
  padding: 0 1.5rem;
  height: 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.load-more-btn :deep(.anticon) {
  margin-left: 0.5rem;
}

/* 涟漪效果 */
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

/* 自定义标签热门状态 */
.custom-tag.tag-hot {
  color: white;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.25);
  font-weight: 600;
}

/* 调整主色调容器样式 */
.filter-item.color-container {
  grid-column: span 2;
}

/* 色彩选项和按钮的包装容器 */
.color-options-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .color-options-wrapper {
    flex-direction: column;
  }

  .filter-actions {
    margin-top: 16px;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .filter-item.color-container {
    grid-column: span 1;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-right {
    width: 100%;
  }

  .sort-dropdown {
    width: 100%;
  }
}
</style>