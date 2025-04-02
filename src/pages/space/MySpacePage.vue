<template>
  <div class="my-space-page">
    <!-- 添加顶部容量概览卡片 -->
    <div class="storage-overview-card">
      <div class="storage-info">
        <div class="storage-title">
          <hard-drive-outlined class="storage-icon" />
          <h2>专业版空间总容量</h2>
        </div>
        <div class="storage-details">
          <div class="storage-percentage">{{ getStoragePercentage() }}%</div>
          <div class="storage-size">已使用 {{ formatStorage(storageUsed) }} / {{ formatStorage(storageTotal) }}</div>
        </div>
        <a-progress
            :percent="getStoragePercentage()"
            :stroke-color="getProgressColor(getStoragePercentage())"
            :show-info="false"
            size="small"
            class="storage-progress"
        />
        <div class="storage-stats">
          <div class="stat-box">
            <picture-outlined />
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.imageCount }}</div>
              <div class="stat-label">图片数量</div>
            </div>
          </div>
          <div class="stat-box">
            <folder-outlined />
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.spaceCount }}</div>
              <div class="stat-label">空间数量</div>
            </div>
          </div>
          <div class="stat-box">
            <team-outlined />
            <div class="stat-content">
              <div class="stat-value">{{ userInfo.teamCount }}</div>
              <div class="stat-label">团队数量</div>
            </div>
          </div>
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
                <span class="usage-value">{{ formatStorage(storageUsed) }}/{{ formatStorage(storageTotal) }}</span>
              </div>
              <a-progress :percent="getStoragePercentage()" :show-info="false" stroke-color="#6366F1"/>
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
              <a-button type="primary" block>
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
              <a-button type="primary" block>
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
              <a-button type="primary"  @click="applyFilters">搜索</a-button>
              <a-button  @click="resetFilters">重置</a-button>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- ImageGallery组件 -->
    <image-gallery
        :images="galleryImages"
        empty-text="暂无图片"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 800, duration: 800 } }"
        @view="viewImage"
        @download="downloadImage"
        @like="toggleLike"
        @bookmark="toggleBookmark"
        @share="shareImage"
        @delete="confirmDelete"
        @navigate-to-detail="navigateToDetail"
        @refresh="handleClearFilter"
    />

    <!-- 加载更多 -->
    <div class="load-more">
      <a-button type="primary" @click="loadMore">
        加载更多
        <template #icon><down-outlined /></template>
      </a-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, watch, computed} from 'vue';
import {
  DownOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  BulbOutlined,
  PictureOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import {message, Modal} from 'ant-design-vue';
import {DatePicker} from 'ant-design-vue';
import {useFilterStore} from "@/stores/filterStore";
import 'animate.css';
import ImageGallery from '@/components/common/ImageGallery.vue';
import router from '@/router';

const {RangePicker} = DatePicker;

// 空间容量数据
const storageTotal = ref(20 * 1024 * 1024 * 1024); // 20GB
const storageUsed = ref(8.5 * 1024 * 1024 * 1024); // 8.5GB

// 获取存储百分比
const getStoragePercentage = () => {
  return Math.round((storageUsed.value / storageTotal.value) * 100);
};

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 70) return '#52C41A'; // 绿色
  if (percentage < 90) return '#FAAD14'; // 黄色
  return '#F5222D'; // 红色
};

// 格式化存储大小显示
const formatStorage = (bytes) => {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
};

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

// 使用筛选器Store
const filterStore = useFilterStore();

// 导航到图片详情页
const navigateToDetail = (image) => {
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
const viewImage = (image) => {
  // 更新浏览计数
  if (typeof image.views === 'number') {
    image.views += 1;
  } else {
    image.views = 1;
  }
  // 导航到详情页
  navigateToDetail(image);
};

// 处理图片下载
const downloadImage = (image) => {
  message.success('图片下载中...');
  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = image.src;
  a.download = image.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 切换图片收藏状态
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
  message.success(`已打开"${image.title}"的分享选项`);
};

// 确认删除图片
const confirmDelete = (image) => {
  // 从图库中移除该图片
  const index = galleryImages.findIndex(item => item.src === image.src);
  if (index !== -1) {
    galleryImages.splice(index, 1);
  }
  message.success('图片已删除');

  // 更新存储使用量
  updateStorageUsed(-1 * 1024 * 1024 * 100); // 假设每张图片大约100MB
};

// 更新存储使用量
const updateStorageUsed = (changeInBytes) => {
  storageUsed.value = Math.max(0, storageUsed.value + changeInBytes);
  // 确保不超过总容量
  storageUsed.value = Math.min(storageUsed.value, storageTotal.value);
};

// 点赞或取消点赞
const toggleLike = (image) => {
  image.liked = !image.liked;
  if (image.liked) {
    image.likes = (image.likes || 0) + 1;
  } else if (image.likes > 0) {
    image.likes -= 1;
  }
  message.success(image.liked ? '已添加到喜欢' : '已取消喜欢');
};

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

// 获取图片分类
const getImageCategory = (image) => {
  if (image.category) {
    return image.category;
  } else if (image.tags && image.tags.length > 0) {
    // 尝试从标签中找出第一个匹配已知分类的标签
    for (const tag of image.tags) {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      if (Object.keys(categoryColors).includes(tagName)) {
        return tagName;
      }
    }
  }
  return '素材'; // 默认分类
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

// 获取图片标签 - 处理不同格式的标签数据
const getImageTags = (image) => {
  if (!image.tags) return [];

  // 检查标签是否为字符串数组或对象数组
  if (typeof image.tags[0] === 'string') {
    return image.tags.map(tag => ({ name: tag }));
  }

  return image.tags;
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
    bookmarked: false,
    views: 1250,
    likes: 520,
    comments: 45,
    createTime: '2023-09-15T08:30:00.000Z',
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
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: 'Mac系统壁纸.jpg',
    author: {
      name: '设计师小李',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '壁纸',
    tags: [
      { name: 'Mac壁纸', color: 'cyan' },
      { name: '创意', color: '' },
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
      { name: '代码', color: 'blue' },
      { name: '壁纸', color: '' },
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
      { name: '素材', color: 'green' },
      { name: '创意', color: '' },
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
      { name: '风景', color: 'blue' },
      { name: '城市', color: '' },
    ],
    liked: true,
    bookmarked: true,
    views: 4260,
    likes: 1780,
    comments: 205,
    createTime: '2023-11-15T20:30:00.000Z',
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
  },
  {
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    title: '海边日落.jpg',
    author: {
      name: '程序员Leo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    },
    category: '风景',
    tags: [
      { name: '风景', color: 'blue' },
      { name: '海边', color: '' },
    ],
    liked: false,
    bookmarked: false,
    views: 3840,
    likes: 1520,
    comments: 185,
    createTime: '2023-10-10T14:20:00.000Z',
    aspectRatio: '16/9',
  },
]);

// 原始图库数据（用于筛选）
const originalGalleryImages = [...galleryImages];

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
        const imageCategory = getImageCategory(image);
        if (!activeCategories.includes(imageCategory)) return false;
      }

      // 筛选标签（如果有选中的标签）
      if (activeTags.length > 0) {
        const imageTags = getImageTags(image).map(tag => typeof tag === 'string' ? tag : tag.name);
        const tagMatch = imageTags.some(tag => activeTags.includes(tag));
        if (!tagMatch) return false;
      }

      return true;
    });
  }

  // 应用筛选条件
  if (filterConditions.imageName) {
    filteredImages = filteredImages.filter(image =>
        image.title.toLowerCase().includes(filterConditions.imageName.toLowerCase())
    );
  }

  if (filterConditions.category) {
    filteredImages = filteredImages.filter(image =>
        getImageCategory(image) === filterConditions.category
    );
  }

  if (filterConditions.tags && filterConditions.tags.length > 0) {
    filteredImages = filteredImages.filter(image => {
      const imageTags = getImageTags(image).map(tag => typeof tag === 'string' ? tag : tag.name);
      return filterConditions.tags.some(tag => imageTags.includes(tag));
    });
  }

  if (selectedColor) {
    // 在实际应用中，这里需要根据图片的主色调进行过滤
    // 这里仅做示例，实际效果可能需要后端支持
    message.info(`已选择颜色: ${selectedColor}（实际筛选需后端支持）`);
  }

  console.log('筛选后的图片数量:', filteredImages.length);

  // 更新图库数据
  galleryImages.splice(0, galleryImages.length, ...filteredImages);
};

// 加载更多
const loadMore = () => {
  console.log('加载更多图片');
  message.info('正在加载更多图片...');
  // 模拟加载更多，实际应该从API获取
  setTimeout(() => {
    message.success('已加载更多内容');
  }, 1000);
};

// 处理清除筛选器
const handleClearFilter = () => {
  resetFilters();
};

// 初始化
onMounted(() => {
  // 首先清空原始图片数组，避免重复
  originalGalleryImages.length = 0;

  // 使用深拷贝创建图片副本
  const deepCopiedImages = JSON.parse(JSON.stringify(galleryImages));

  // 将图片存入原始数据数组
  originalGalleryImages.push(...deepCopiedImages);

  // 为图片添加额外属性
  deepCopiedImages.forEach(image => {
    // 初始化点赞数
    if (!image.likes) {
      image.likes = Math.floor((image.views || 0) * (0.3 + Math.random() * 0.2));
    }

    // 添加评论数
    if (!image.comments) {
      image.comments = Math.floor((image.views || 0) * (0.05 + Math.random() * 0.1));
    }

    // 初始化收藏状态
    if (typeof image.bookmarked === 'undefined') {
      image.bookmarked = false;
    }

    // 确保有aspectRatio
    if (!image.aspectRatio) {
      image.aspectRatio = '16/9';
    }
  });

  setTimeout(() => {
    galleryImages.splice(0, galleryImages.length, ...deepCopiedImages);
  }, 100);

  // 计算初始存储使用量
  const averageImageSize = 0.1; // GB
  storageUsed.value = galleryImages.length * averageImageSize * 1024 * 1024 * 1024;
  // 确保使用量不超过总量的合理范围
  storageUsed.value = Math.min(storageUsed.value, storageTotal.value * 0.9);
});
</script>

<style scoped>
/* 基础样式 */
.my-space-page {
  padding: 1.5rem;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 容量概览卡片 */
.storage-overview-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.storage-title h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.storage-icon {
  font-size: 24px;
  color: #6366F1;
}

.storage-details {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.storage-percentage {
  font-size: 2rem;
  font-weight: 700;
  color: #6366F1;
}

.storage-size {
  font-size: 1rem;
  color: #6B7280;
}

.storage-progress {
  width: 100%;
  margin: 4px 0 16px;
}

.storage-stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 16px;
  gap: 16px;
}

.stat-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
  flex: 1;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
}

.stat-box .anticon {
  font-size: 24px;
  color: #6366F1;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-weight: 600;
  font-size: 1.25rem;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
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


/* ================ 筛选区域终极优化 ================ */
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

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin: 2.5rem 0;
}

/* 暗模式兼容 */
@media (prefers-color-scheme: dark) {
  .storage-overview-card,
  .profile-card,
  .space-card,
  .filter-card {
    background: #1f1f1f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .stat-box {
    background: #262626;
  }

  .storage-title h2,
  .stat-value,
  .profile-name {
    color: #f0f0f0;
  }

  .profile-desc,
  .stat-label,
  .space-status,
  .detail-label,
  .storage-size {
    color: #a0a0a0;
  }

  .stat-count,
  .space-info h3,
  .detail-value {
    color: #e0e0e0;
  }

  .space-icon {
    color: #888;
  }

  .filter-label {
    color: #c0c0c0;
  }

  .filter-input,
  .date-range-picker :deep(.ant-picker) {
    background-color: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }

  .filter-select :deep(.ant-select-selector) {
    background-color: #2a2a2a !important;
    border-color: #444 !important;
    color: #e0e0e0 !important;
  }
}
</style>