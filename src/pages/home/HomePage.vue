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

    <!-- 筛选区域 -->
    <div class="filter-container">
      <!-- 分类筛选区域 -->
      <div class="filter-section">
        <h3 class="filter-section-title">分类</h3>

        <!-- 分类选项 - 可滚动容器 -->
        <div class="scroll-container">
          <a-spin :spinning="loadingCategories" v-if="loadingCategories"/>
          <template v-else>
            <div
                class="filter-item"
                :class="{'highlight': selectedCategory === 'all'}"
                @click="selectCategory('all')"
            >
              <span class="filter-item-icon">
               <IconFont type="icon-fenlei-"/>
              </span>
              全部
            </div>

            <!-- 显示前10个分类 -->
            <div
                v-for="category in displayedCategories"
                :key="category.id"
                class="filter-item"
                :class="{'highlight': selectedCategory === category.id}"
                @click="selectCategory(category.id)"
            >
                <span class="filter-item-icon">
                  <!-- 使用渲染函数获取的Ant Design图标组件 -->
                  <component :is="renderCategoryIcon(category)" v-if="renderCategoryIcon(category)"/>
                  <!-- 如果是iconfont图标 -->
                  <IconFont v-else-if="category.icon && category.icon.startsWith('icon-')" :type="category.icon"/>
                  <!-- 默认图标 -->
                  <AppstoreOutlined v-else/>
                </span>
              {{ category.name }}
            </div>

            <!-- 添加更多分类按钮 -->
            <div
                v-if="hasMoreCategories"
                class="show-more-btn"
                @click="showMoreCategories"
            >
              更多分类
              <span class="show-more-icon">
               <IconFont type="icon-icon-gengduo1"/>
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 标签筛选区域 -->
      <div class="filter-section">
        <h3 class="filter-section-title">标签</h3>

        <!-- 标签选项 -->
        <div class="filter-items-container">
          <a-spin :spinning="loadingTags" v-if="loadingTags"/>
          <template v-else>
            <div
                class="filter-item"
                :class="{'active': selectedTags.length === 0}"
                @click="clearTagSelection"
            >
              <span class="filter-item-dot" style="background-color: #6366f1;"></span>
              <IconFont type="icon-biaoqian4"/>
              全部
            </div>

            <div
                v-for="tag in popularTags"
                :key="tag.id"
                class="filter-item"
                :class="{'active': selectedTags.includes(tag.id)}"
                @click="toggleTag(tag.id)"
            >
          <span
              class="filter-item-dot"
              :style="{ backgroundColor: tag.color || getTagColor(tag.id) }"
          ></span>
              {{ tag.name }}
            </div>

            <div
                v-if="hasMoreTags"
                class="show-more-btn"
                @click="showMoreTags"
            >
              更多标签
              <span class="show-more-icon">
                <IconFont type="icon-icon-gengduo1"/>
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 更多分类弹窗 -->
      <a-modal
          v-model:visible="categoriesModalVisible"
          title="选择分类"
          width="600px"
          :bodyStyle="{ padding: '20px' }"
      >
        <div class="tags-modal-content">
          <div
              class="filter-item modal-tag-item"
              :class="{'highlight': selectedCategory === 'all'}"
              @click="selectCategory('all')"
          >
            <span class="filter-item-icon"><IconFont type="icon-fenlei-"/> 全部</span>

          </div>

          <div
              v-for="category in categories"
              :key="category.id"
              class="filter-item modal-tag-item"
              :class="{'highlight': selectedCategory === category.id}"
              @click="selectCategory(category.id)"
          >
            <span class="filter-item-icon">
              <!-- 使用渲染函数获取的Ant Design图标组件 -->
              <component :is="renderCategoryIcon(category)" v-if="renderCategoryIcon(category)"/>
              <!-- 如果是iconfont图标 -->
              <IconFont v-else-if="category.icon && category.icon.startsWith('icon-')" :type="category.icon"/>
              <!-- 默认图标 -->
              <AppstoreOutlined v-else/>
            </span>
            {{ category.name }}
          </div>
        </div>
        <template #footer>
          <div class="tags-modal-footer">
            <a-button @click="selectCategory('all')">重置</a-button>
            <a-button type="primary" @click="handleCategoriesModalOk">确定</a-button>
          </div>
        </template>
      </a-modal>

      <!-- 排序区域 -->
      <div class="filter-section">
        <h3 class="filter-section-title">排序</h3>

        <!-- 排序选项 -->
        <div class="sort-area">
          <div
              class="sort-item"
              :class="{'active': sortOption === 'latest'}"
              @click="handleSortChange('latest')"
          >
            <span class="sort-item-icon">
              <IconFont type="icon-shijian6"/>
            </span>
            最新发布
          </div>

          <div
              class="sort-item"
              :class="{'active': sortOption === 'popular'}"
              @click="handleSortChange('popular')"
          >
            <span class="sort-item-icon">
             <IconFont type="icon-shouhuanyingde"/>
            </span>
            最受欢迎
          </div>

          <div
              class="sort-item"
              :class="{'active': sortOption === 'mostViewed'}"
              @click="handleSortChange('mostViewed')"
          >
            <span class="sort-item-icon">
              <IconFont type="icon-liulan3"/>
            </span>
            最多浏览
          </div>

          <div
              class="sort-item"
              :class="{'active': sortOption === 'mostLiked'}"
              @click="handleSortChange('mostLiked')"
          >
            <span class="sort-item-icon">
              <IconFont type="icon-aixin3"/>
            </span>
            最多点赞
          </div>

          <div
              class="sort-item"
              :class="{'active': sortOption === 'mostBookmarked'}"
              @click="handleSortChange('mostBookmarked')"
          >
            <span class="sort-item-icon">
              <IconFont type="icon-a-shoucangyishoucang1x"/>
            </span>
            最多收藏
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃筛选标签展示 -->
    <!-- 优化的已选择区域模板 -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">已选择</div>
      <div class="active-filters-tags">
        <!-- 分类标签 -->
        <a-tag
            v-if="selectedCategory !== 'all'"
            closable
            @close="selectCategory('all')"
            data-filter-type="category"
        >
          <template #icon>
            <component :is="renderCategoryIcon(getCategoryObject(selectedCategory))"
                       v-if="renderCategoryIcon(getCategoryObject(selectedCategory))"/>
            <IconFont v-else :type="getCategoryIcon(selectedCategory)"/>
          </template>
          {{ getCategoryName(selectedCategory) }}
        </a-tag>

        <!-- 标签 -->
        <a-tag
            v-for="tagId in selectedTags"
            :key="tagId"
            closable
            @close="toggleTag(tagId)"
            data-filter-type="tag"
        >
          <template #icon>
            <IconFont type="icon-biaoqian4"/>
          </template>
          {{ getTagName(tagId) }}
        </a-tag>

        <!-- 排序 -->
        <a-tag
            v-if="sortOption !== 'latest'"
            closable
            @close="resetSort"
            data-filter-type="sort"
        >
          <template #icon>
            <IconFont type="icon-paixu"/>
          </template>
          {{ getSortName(sortOption) }}
        </a-tag>

        <!-- 清除全部按钮 -->
        <a-button type="link" @click="resetAllFilters">
          清除全部
          <template #icon>
            <IconFont type="icon-shuaxin2" />
          </template>
        </a-button>
      </div>
    </div>

    <!-- 瀑布流图片展示 -->
    <image-gallery
        :images="galleryImages"
        :loading="loading"
        empty-text="加载中..."
        @view="viewImage"
        @download="downloadImage"
        @like="toggleLike"
        @bookmark="toggleBookmark"
        @share="shareImage"
        @delete="confirmDelete"
        @navigate-to-detail="navigateToDetail"
        @refresh="fetchGalleryImages"
    />

    <!-- 加载更多 -->
    <div class="load-more" v-if="hasMore">
      <a-button type="primary" @click="loadMore" :loading="loadingMore">
        加载更多
        <template #icon>
          <down-outlined/>
        </template>
      </a-button>
    </div>

    <!-- 无更多数据提示 -->
    <div class="no-more" v-else-if="!loading && galleryImages.length > 0">
      <a-divider>已经到底了</a-divider>
    </div>

    <!-- 更多标签弹窗 -->
    <a-modal
        v-model:visible="tagsModalVisible"
        title="选择标签"
        width="600px"
        :bodyStyle="{ padding: '20px' }"
    >
      <div class="tags-modal-content">
        <div
            v-for="tag in allTags"
            :key="tag.id"
            class="filter-item modal-tag-item"
            :class="{'active': selectedTags.includes(tag.id)}"
            @click="toggleTag(tag.id)"
        >
      <span
          class="filter-item-dot"
          :style="{ backgroundColor: tag.color || getTagColor(tag.id) }">
      </span>
          {{ tag.name }}
        </div>
      </div>
      <template #footer>
        <div class="tags-modal-footer">
          <a-button @click="clearTagSelection">清除选择</a-button>
          <a-button type="primary" @click="handleTagsModalOk">确定</a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue';
import {
  DownOutlined,
  ClockCircleOutlined,
  FireOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined, SortAscendingOutlined, DeleteOutlined, TagOutlined, AppstoreOutlined
} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";
import router from "@/router";
import {
  getWaterfallPicturesUsingPost,
  loadMoreWaterfallPicturesUsingPost,
} from '@/api/tupianxiangguanjiekou';
import {
  listCategoriesByTypeUsingGet
} from '@/api/fenleiguanli';
import {getTagListUsingGet} from "@/api/biaoqianguanli";
import {useUserReactionStore} from '@/stores/userReaction';
import ImageGallery from '@/components/common/ImageGallery.vue';
import Category = API.Category;
import GalleryImage = API.GalleryImage;
import Tag = API.Tag;
import ApiPictureRecord = API.ApiPictureRecord;


const userReactionStore = useUserReactionStore();

// 图片数据状态
const galleryImages = reactive<API.GalleryImage[]>([]);
const loading = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const hasMore = ref<boolean>(true);
const currentOffset = ref<number>(0);
const lastId = ref<string | number | null>(null);
const lastValue = ref<any>(null);
const pageSize = ref<number>(12);

// 搜索文本
const searchText = ref<string>('');
const selectedCategory = ref<string | number>('all');
const selectedTags = ref<Array<string | number>>([]);

// 排序选项
const sortOption = ref('latest'); // 默认最新发布

// 是否正在加载分类数据
const categories = ref<API.Category[]>([]);
const loadingCategories = ref(false);

// 标签数据
const allTags = ref<API.Tag[]>([]);
// 是否正在加载标签数据
const loadingTags = ref<boolean>(false);


// 定义排序类型和名称的映射
const sortMap = {
  'latest': '最新发布',
  'popular': '最受欢迎',
  'mostViewed': '最多浏览',
  'mostLiked': '最多点赞',
  'mostBookmarked': '最多收藏'
} as const;

// 从sortMap对象中提取键的类型
type SortType = keyof typeof sortMap;


// 判断是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return selectedCategory.value !== 'all' || selectedTags.value.length > 0 || sortOption.value !== 'latest';
});

// 标签弹窗控制
const tagsModalVisible = ref(false);
const showMoreTags = () => {
  tagsModalVisible.value = true;
};
const handleTagsModalOk = () => {
  tagsModalVisible.value = false;
};

// 分类弹窗控制
const categoriesModalVisible = ref(false);
const showMoreCategories = () => {
  categoriesModalVisible.value = true;
};
const handleCategoriesModalOk = () => {
  categoriesModalVisible.value = false;
};

// 计算显示在主页面的分类（限制数量）
const displayedCategories = computed(() => {
  return categories.value.slice(0, 7); // 只显示前7个分类
});

// 是否有更多分类
const hasMoreCategories = computed(() => {
  return categories.value.length > 7;
});

const popularTags = computed(() => {
  return allTags.value.slice(0, 10);
});
const hasMoreTags = computed(() => {
  return allTags.value.length > 10;
});

// 获取标签颜色的方法
const getTagColor = (tagId: string | number): string => {
  // 为不同的标签分配固定的颜色
  const colorMap: { [key: string]: string } = {
    'mountains': '#4ade80', // 绿色
    'ocean': '#38bdf8',     // 蓝色
    'forest': '#14b8a6',    // 青绿色
    'sunset': '#f97316',    // 橙色
    'architecture': '#8b5cf6', // 紫色
    'skyscraper': '#6366f1',  // 靛蓝色
    'portrait': '#ec4899',    // 粉色
    'wildlife': '#eab308',    // 黄色
    'pets': '#f43f5e',        // 红色
    'cuisine': '#d946ef',     // 品红色
    'dessert': '#f472b6',     // 浅粉色
    'adventure': '#0ea5e9',   // 天蓝色
    'illustration': '#a855f7', // 亮紫色
    'photography': '#64748b', // 灰蓝色
    'gadgets': '#0891b2',     // 深青色
    'minimal': '#475569',     // 深灰色
    'colorful': '#f59e0b',    // 琥珀色
    'blackandwhite': '#334155', // 深灰色
    'abstract': '#dc2626',    // 红色
    'vintage': '#b45309'      // 棕色
  };

  // 将tagId转换为字符串，以便安全地用作对象键
  const tagIdStr = String(tagId);

  // 如果在colorMap中找不到对应的颜色，则生成一个基于标签ID的唯一颜色
  if (!colorMap[tagIdStr]) {
    // 使用简单的哈希算法生成颜色
    let hash = 0;
    for (let i = 0; i < tagIdStr.length; i++) {
      hash = tagIdStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
  }

  return colorMap[tagId] || '#6366f1'; // 默认返回主题色
}

// 获取分类名称
const getCategoryName = (categoryId: any) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
};

// 获取标签名称
const getTagName = (tagId: string | number) => {
  const tag = allTags.value.find(t => t.id === tagId);
  return tag ? tag.name : '未知标签';
};


// 使用提取的类型作为参数类型
const getSortName = (sort: SortType | string) => {
  return sort in sortMap ? sortMap[sort as SortType] : '未知排序';
};

// 选择分类
const selectCategory = (categoryId: any) => {
  if (selectedCategory.value === categoryId) return;

  selectedCategory.value = categoryId;
  // 重新获取图片数据
  applyFilters();
};

// 切换标签选择
const toggleTag = (tagId: any) => {
  const index = selectedTags.value.indexOf(tagId);
  if (index === -1) {
    selectedTags.value.push(tagId);
  } else {
    selectedTags.value.splice(index, 1);
  }
  // 重新获取图片数据
  applyFilters();
};

// 清除标签选择
const clearTagSelection = () => {
  selectedTags.value = [];
  // 重新获取图片数据
  applyFilters();
};

// 处理排序变更
const handleSortChange = (value: any) => {
  sortOption.value = value;
  // 重新获取图片数据
  applyFilters();
};

// 重置排序
const resetSort = () => {
  sortOption.value = 'latest';
  // 重新获取图片数据
  applyFilters();
};

// 重置所有筛选条件
const resetAllFilters = () => {
  selectedCategory.value = 'all';
  selectedTags.value = [];
  sortOption.value = 'latest';
  // 重新获取图片数据
  applyFilters();
};

// 应用所有筛选条件并重新获取数据
const applyFilters = () => {
  // 构建筛选参数
  const params: API.FilterParams = {};


  // 添加分类筛选 - 修改字段名从category为categoryId
  if (selectedCategory.value !== 'all') {
    params.categoryId = selectedCategory.value;
  }

  // 添加标签筛选 - 修改字段名从tags为tagIds
  if (selectedTags.value.length > 0) {
    params.tagIds = selectedTags.value;
  }

  // 添加排序
  params.sortBy = sortOption.value;

  // 添加搜索关键词
  if (searchText.value.trim()) {
    params.keyword = searchText.value.trim();
  }

  // 获取筛选后的图片数据
  fetchGalleryImagesWithParams(params);
};

const onSearch = (value: string) => {
  // 重置并根据搜索条件获取图片
  currentOffset.value = 0;
  lastId.value = null;
  lastValue.value = null;
  searchText.value = value;

  // 应用所有筛选条件
  applyFilters();
};

// 修改renderCategoryIcon函数实现
const renderCategoryIcon = (category: { id: string | number; name: string; icon?: string }) => {
  if (!category || !category.icon) return null;

  // 检查是否是Ant Design图标
  if (category.icon.startsWith('ant-')) {
    // 从图标名称中提取出图标名称，如ant-appstore => appstore
    const iconName = category.icon.replace('ant-', '');

    // 根据图标名称返回对应的图标组件
    switch (iconName.toLowerCase()) {
      case 'appstore':
        return AppstoreOutlined;
      case 'tag':
        return TagOutlined;
      case 'delete':
        return DeleteOutlined;
      case 'sort-ascending':
        return SortAscendingOutlined;
      case 'clock-circle':
        return ClockCircleOutlined;
      case 'fire':
        return FireOutlined;
      case 'eye':
        return EyeOutlined;
      case 'heart':
        return HeartOutlined;
      case 'star':
        return StarOutlined;
      case 'down':
        return DownOutlined;
      default:
        return AppstoreOutlined;
    }
  }

  // 返回null以允许在模板中使用其他方式处理
  return null;
};


// 获取分类对象的辅助函数
const getCategoryObject = (categoryId: string | number): Category => {
  // 在categories数组中查找对应的分类对象
  const category = categories.value.find(c => c.id === categoryId);

  // 如果找到了，返回该对象
  if (category) {
    return category;
  }

  // 如果没找到，返回一个默认对象
  return {
    id: categoryId,
    name: getCategoryName(categoryId),
    icon: 'icon-fenlei-'
  };
};

// 获取分类图标的辅助函数
const getCategoryIcon = (categoryId: string | number): string => {
  const category = categories.value.find(c => c.id === categoryId);
  return category?.icon || 'icon-fenlei-'; // 默认返回一个通用分类图标
};


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
const viewImage = async (image: any) => {
  if (!image.id) return;

  // 记录浏览
  await userReactionStore.addViewRecord(image.id);

  // 更新浏览计数
  image.viewCount = userReactionStore.getPictureViewCount(image.id);

  // 导航到详情页
  navigateToDetail(image);
};

// 获取图片数据后，批量加载反应状态和计数
const afterFetchGalleryImages = async (images: any[]) => {
  if (!images.length) return;

  // 提取所有图片ID
  const pictureIds = images.map(img => img.id).filter(Boolean);

  // 批量获取反应状态和计数
  await userReactionStore.batchGetStatus(pictureIds);
  await userReactionStore.batchGetCounts(pictureIds);
};


// 处理图片下载
const downloadImage = (image: any) => {
  message.success('图片下载中...');
  // 实际下载逻辑
  const a = document.createElement('a');
  a.href = image.src || image.url;
  a.download = image.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 确认删除图片
const confirmDelete = (image: any) => {
  // 这里已经由ImageCard组件弹出确认框，所以直接执行删除逻辑
  message.success('图片已删除');
};

// 点赞或取消点赞
const toggleLike = async (image: any) => {
  if (!image.id) return;
};

// 切换收藏状态的函数
const toggleBookmark = async (image: any) => {
  if (!image.id) return;
};
// 分享图片
const shareImage = (image: any) => {
  // 分享逻辑已经由ImageCard组件处理
  message.success(`已打开"${image.title}"的分享选项`);
};

// 加载更多图片
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;

  try {
    loadingMore.value = true;

    // 准备请求参数 - 使用lastId和lastValue
    const params: API.loadMoreWaterfallPicturesUsingPOSTParams = {
      offset: currentOffset.value,
      limit: pageSize.value,
      lastId: lastId.value,
      lastValue: lastValue.value
    };

    // 直接使用正确的PictureWaterfallRequest类型
    const requestBody: API.PictureWaterfallRequest = {};

    // 添加搜索关键词
    if (searchText.value.trim()) {
      requestBody.keyword = searchText.value.trim();
    }

    // 添加分类筛选 - 确保类型正确
    if (selectedCategory.value !== 'all') {
      const categoryIdValue = selectedCategory.value;

      // 处理不同的类型情况
      if (typeof categoryIdValue === 'string') {
        // 如果是字符串且可以解析为数字，则转换为数字
        if (/^\d+$/.test(categoryIdValue)) {
          requestBody.categoryId = parseInt(categoryIdValue, 10);
        }
      } else if (typeof categoryIdValue === 'number') {
        // 如果已经是数字类型，直接赋值
        requestBody.categoryId = categoryIdValue;
      }
    }

    // 添加标签筛选
    if (selectedTags.value.length > 0) {
      // 将所有标签ID转换为数字
      requestBody.tagIds = selectedTags.value.map(tagId => {
        // 如果是字符串且可以解析为数字，则转换为数字
        if (typeof tagId === 'string' && /^\d+$/.test(tagId)) {
          return parseInt(tagId, 10);
        }
        // 如果已经是数字，直接返回
        else if (typeof tagId === 'number') {
          return tagId;
        }
        // 对于无法转换为数字的字符串，返回null
        return null;
      }).filter((id): id is number => id !== null);
    }

    // 添加排序
    requestBody.sortBy = sortOption.value;


    // 调用加载更多API
    const response = await loadMoreWaterfallPicturesUsingPost(params, requestBody);


    // 处理响应数据
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures: ApiPictureRecord[] = responseData.records;

        // 保存lastId和lastValue用于下次加载更多
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 创建一个数组来存储新转换的图片对象
        const newImages: GalleryImage[] = [];

        // 将新的图片数据添加到现有的galleryImages数组中
        if (pictures.length > 0) {
          pictures.forEach((pic: ApiPictureRecord) => {
            // 转换图片数据并添加到两个数组中
            const transformedPic = transformPictureData(pic);
            galleryImages.push(transformedPic);
            newImages.push(transformedPic);
          });

          // 更新偏移量
          currentOffset.value += pictures.length;

          // 如果有图片数据添加成功，显示提示
          message.success(`成功加载 ${pictures.length} 张新图片`);
        } else {
          message.info('没有更多图片了');
          hasMore.value = false;
        }

        // 更新是否有更多数据标志
        hasMore.value = responseData.hasMore === true;

        // 批量加载新加载图片的反应状态和计数
        if (newImages.length > 0) {
          await afterFetchGalleryImages(newImages);
        }
      } else {
        message.warning('获取更多图片失败：数据格式不正确');
        hasMore.value = false;
      }
    } else {
      message.error(response?.data?.message || '获取更多图片失败');
      hasMore.value = false;
    }
  } catch (error) {
    message.error('获取更多图片时发生错误');
    hasMore.value = false;
  } finally {
    loadingMore.value = false;
  }
};

// 将API返回的图片数据转换为组件使用的格式
const transformPictureData = (apiPicture: any): API.GalleryImage => {
  // 确保apiPicture是一个对象
  if (!apiPicture || typeof apiPicture !== 'object') {
    console.warn('无效的图片数据:', apiPicture);
    return {
      id: `default-${Date.now()}-${Math.random()}`,
      src: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg', // 默认图片
      url: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg', // 确保url也有值
      title: '未命名图片',
      author: {
        name: '未知作者',
        avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
      },
      category: '未分类',
      tags: [],
      liked: false,
      bookmarked: false,
      createTime: new Date().toISOString(),
      updateTime: undefined, // 明确设置为undefined
      viewCount: 0,
      likeCount: 0,
      comments: 0,
      aspectRatio: '1/1',
      raw: {} // 初始化为空对象
    };
  }

  // 安全地获取字段，确保类型正确
  const id = apiPicture.id ?? `temp-${Date.now()}`; // 确保始终有id
  const url = typeof apiPicture.url === 'string' ? apiPicture.url : '';
  const title = typeof apiPicture.name === 'string' ? apiPicture.name : '未命名图片';

  const size = typeof apiPicture.size === 'number' ? apiPicture.size : '';

  // 确保用户信息安全提取
  const username = apiPicture.user?.username;
  const userAvatar = apiPicture.user?.avatar;

  // 安全地提取和转换其他字段
  const category = typeof apiPicture.category === 'string' ? apiPicture.category : '未分类';
  const viewCount = typeof apiPicture.viewCount === 'number' ? apiPicture.viewCount : 0;
  const likeCount = typeof apiPicture.likeCount === 'number' ? apiPicture.likeCount : 0;
  const collectionCount = typeof apiPicture.collectionCount === 'number' ? apiPicture.collectionCount : 0;

  // 处理宽高比
  let aspectRatio = '1/1';
  if (typeof apiPicture.picWidth === 'number' && typeof apiPicture.picHeight === 'number' && apiPicture.picHeight > 0) {
    aspectRatio = `${apiPicture.picWidth}/${apiPicture.picHeight}`;
  } else if (typeof apiPicture.picScale === 'string') {
    aspectRatio = apiPicture.picScale;
  }

  // 修复标签处理逻辑，明确类型
  let tags: Array<{name: string, color: string}> = [];
  if (Array.isArray(apiPicture.tags)) {
    tags = apiPicture.tags.map((tag: any) => ({
      name: typeof tag === 'string' ? tag : String(tag),
      color: ''
    }));
  }

  if (Array.isArray(apiPicture.tagColors) && apiPicture.tagColors.length > 0 && tags.length > 0) {
    // 尝试将颜色与标签匹配
    for (let i = 0; i < Math.min(tags.length, apiPicture.tagColors.length); i++) {
      if (tags[i] && typeof apiPicture.tagColors[i] === 'string') {
        tags[i].color = apiPicture.tagColors[i];
      }
    }
  }

  // 根据后端实际返回的字段结构转换
  return {
    id,
    src: url,
    url,
    title,
    size,
    author: {
      name: typeof username === 'string' ? username : '未知作者',
      avatar: typeof userAvatar === 'string' ? userAvatar : 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category,
    tags,
    createTime: typeof apiPicture.createTime === 'string' ? apiPicture.createTime : new Date().toISOString(),
    updateTime: typeof apiPicture.updateTime === 'string' ? apiPicture.updateTime : undefined,
    viewCount: viewCount,
    likeCount: likeCount,
    collectionCount: collectionCount,
    comments: 0,
    aspectRatio,
    raw: {...apiPicture}
  };
};


// 默认获取瀑布流图片数据（不带参数）
const fetchGalleryImages = async () => {
  try {
    loading.value = true;

    // 清空已有数据和偏移量
    galleryImages.length = 0;
    currentOffset.value = 0;
    lastId.value = null;
    lastValue.value = null;


    // 调用API获取瀑布流图片 - 不传递任何筛选参数
    const response = await getWaterfallPicturesUsingPost({});


    // 处理响应数据 - 基于实际的JSON结构
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 保存lastId和lastValue用于加载更多
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 更新图片数据
        if (pictures.length > 0) {
          pictures.forEach(pic => {
            galleryImages.push(transformPictureData(pic));
          });

          // 更新偏移量
          currentOffset.value = pictures.length;
        }

        // 更新是否有更多数据标志
        hasMore.value = responseData.hasMore === true;
        // 批量加载反应状态和计数
        await afterFetchGalleryImages(galleryImages);
      } else {
        message.warning('获取图片数据失败：数据格式不正确');
      }
    } else {
      message.error(response?.data?.message || '获取图片数据失败');
    }
  } catch (error) {
    message.error('获取图片数据时发生错误');
  } finally {
    loading.value = false;
  }
};

// 带参数获取瀑布流图片数据（用于搜索和筛选）
const fetchGalleryImagesWithParams = async (params: API.FilterParams) => {
  try {
    loading.value = true;

    // 清空已有数据和偏移量
    galleryImages.length = 0;
    currentOffset.value = 0;
    lastId.value = null;
    lastValue.value = null;


    // 创建符合PictureWaterfallRequest类型的请求对象
    const requestParams: API.PictureWaterfallRequest = {};

    // 添加关键词
    if (params.keyword) {
      requestParams.keyword = params.keyword;
    }

    // 处理分类ID - 转换为number类型
    if (params.categoryId !== undefined && params.categoryId !== 'all') {
      if (typeof params.categoryId === 'string' && /^\d+$/.test(params.categoryId)) {
        requestParams.categoryId = parseInt(params.categoryId, 10);
      } else if (typeof params.categoryId === 'number') {
        requestParams.categoryId = params.categoryId;
      }
    }

    // 处理标签ID列表 - 转换为number[]类型
    if (params.tagIds && params.tagIds.length > 0) {
      requestParams.tagIds = params.tagIds
          .map(tagId => {
            if (typeof tagId === 'string' && /^\d+$/.test(tagId)) {
              return parseInt(tagId, 10);
            } else if (typeof tagId === 'number') {
              return tagId;
            }
            return null;
          })
          .filter((id): id is number => id !== null);
    }

    // 添加排序参数
    if (params.sortBy) {
      requestParams.sortBy = params.sortBy;
    }

    // 调用API获取瀑布流图片 - 传递转换后的参数
    const response = await getWaterfallPicturesUsingPost(requestParams);

    // 处理响应数据 - 基于实际的JSON结构
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 保存lastId和lastValue用于加载更多
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 更新图片数据
        if (pictures.length > 0) {
          pictures.forEach(pic => {
            galleryImages.push(transformPictureData(pic));
          });

          // 更新偏移量
          currentOffset.value = pictures.length;
        }

        // 更新是否有更多数据标志
        hasMore.value = responseData.hasMore === true;

        if (pictures.length === 0) {
          if (hasActiveFilters.value) {
            message.info('没有找到符合筛选条件的图片');
          } else if (searchText.value) {
            message.info('没有找到相关图片');
          }
        }
      } else {
        message.warning('获取图片数据失败：数据格式不正确');
      }
      // 批量加载反应状态和计数
      await afterFetchGalleryImages(galleryImages);
    } else {
      message.error(response?.data?.message || '获取图片数据失败');
    }
  } catch (error) {
    message.error('获取图片数据时发生错误');
  } finally {
    loading.value = false;
  }
};


// 获取分类数据
const fetchCategories = async () => {
  try {
    loadingCategories.value = true;

    // 调用API获取分类列表
    const response = await listCategoriesByTypeUsingGet({type: ''});

    if (response?.data?.code === 200 && Array.isArray(response.data.data)) {
      // 使用类型断言前先进行数据验证和转换
      categories.value = response.data.data.map(category => {
        // 验证和处理每个字段
        const id = category.id || category.code || '';
        const name = typeof category.name === 'string' ? category.name : '';
        const icon = typeof category.icon === 'string' ? category.icon : 'ant-appstore';
        const count = typeof category.count === 'number' ? category.count : 0;

        // 返回符合Category类型结构的对象
        return {
          id,
          name,
          icon,
          count
        } as Category;
      });

    } else {
      message.error('获取分类数据失败');
    }
  } catch (error) {
    message.error('获取分类数据时发生错误');
  } finally {
    loadingCategories.value = false;
  }
};


// 获取标签数据
const fetchTags = async () => {
  try {
    loadingTags.value = true;

    // 调用API获取标签列表
    const response = await getTagListUsingGet();

    if (response?.data?.code === 200 && Array.isArray(response.data.data)) {
      // 转换API返回的数据格式为组件使用的格式，确保类型安全
      allTags.value = response.data.data.map((tag: any) => {
        // 验证和处理每个字段，确保类型安全
        const id = tag.id !== undefined ? tag.id : '';
        const name = typeof tag.name === 'string' ? tag.name : '';
        const color = typeof tag.color === 'string' ? tag.color : getTagColor(id);
        const count = typeof tag.count === 'number' ? tag.count : 0;

        // 返回符合Tag类型结构的对象
        return {
          id,
          name,
          color,
          count
        } as Tag;
      });
    } else {
      message.error('获取标签数据失败');
    }
  } catch (error) {
    message.error('获取标签数据时发生错误');
  } finally {
    loadingTags.value = false;
  }
};

// 组件挂载时初始化
onMounted(async () => {
  // 初始化用户反应统计
  await userReactionStore.initialize();
  // 获取分类数据
  await fetchCategories();

  // 获取标签数据
  await fetchTags();
  // 初始化时获取图片数据（不带参数）
  await fetchGalleryImages();
});
</script>

<style scoped>
/* 搜索区域顶部间距 */
.home-page {
  padding-top: 16px;
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
  height: 44px;
  width: 60px;
  border-radius: 0 8px 8px 0;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 筛选区域整体容器 */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  margin-bottom: 24px;
}

/* 每个筛选区块的通用样式 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 筛选区块标题 */
.filter-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 16px;
  display: flex;
  align-items: center;
}

/* 筛选区块标题前的彩色标记 */
.filter-section-title::before {
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

/* 分类标签容器 */
.filter-items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 分类标签项 */
.filter-item {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* 分类标签悬停状态 */
.filter-item:hover {
  background: #eef2ff;
  color: #6366f1;
  transform: translateY(-1px);
}

/* 分类标签选中状态 */
.filter-item.active {
  background: #eef2ff;
  color: #6366f1;
  border-color: #c7d2fe;
  font-weight: 500;
}

/* 特别突出的激活状态 */
.filter-item.highlight {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* 标签项中的图标 */
.filter-item-icon {
  margin-right: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 标签内的小圆点 */
.filter-item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

/* 排序区域容器 */
.sort-area {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 16px;
  padding: 8px 12px;
  margin-top: 8px;
}

/* 排序标签项 */
.sort-item {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  margin-right: 8px;
}

/* 排序标签悬停状态 */
.sort-item:hover {
  color: #6366f1;
}

/* 排序标签选中状态 */
.sort-item.active {
  background: #eef2ff;
  color: #6366f1;
  font-weight: 500;
}

/* 排序项中的图标 */
.sort-item-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 显示更多按钮 */
.show-more-btn {
  display: flex;
  align-items: center;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  background: #eef2ff;
}

.show-more-icon {
  margin-left: 4px;
  font-size: 12px;
}

/* 滚动容器 */
.scroll-container {
  display: flex;
  overflow-x: auto;
  padding: 4px 2px 4px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  gap: 10px;
}

.scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-container {
    padding: 16px;
    gap: 20px;
  }
}

/* 标签弹窗样式 */

.tag-selected-count span {
  font-weight: 600;
  color: #0ea5e9;
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.ant-modal-title) {
  font-weight: 600;
  font-size: 16px;
}

:deep(.ant-modal-close) {
  top: 16px;
  right: 16px;
}

:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  background: #0ea5e9;
  border-color: #0ea5e9;
}

:deep(.ant-radio-button-wrapper:hover) {
  color: #0ea5e9;
}

/* 搜索框样式优化 */
.search-container {
  padding: 20px 0 32px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-wrapper {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.1);
}

.search-input :deep(.ant-input) {
  height: 48px;
  font-size: 15px;
  padding-left: 18px;
  border-radius: 12px 0 0 12px;
  border-width: 2px;
  border-color: rgba(99, 102, 241, 0.2);
  border-right: none;
  transition: all 0.3s ease;
}

.search-input :deep(.ant-input:hover),
.search-input :deep(.ant-input:focus) {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.search-input :deep(.ant-input-search-button) {
  height: 48px;
  width: 64px;
  border-radius: 0 12px 12px 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-input :deep(.ant-input-search-button:hover) {
  background: linear-gradient(135deg, #5258e9 0%, #7c4ddc 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.search-input :deep(.ant-input-search-button .anticon) {
  font-size: 20px;
}

/* 标签弹窗样式 */
:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ant-modal-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-modal-title) {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

:deep(.ant-modal-body) {
  padding: 20px;
}

:deep(.ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 20px;
}

/* 弹窗内容区域 */
.tags-modal-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

/* 弹窗内的标签项  */
.modal-tag-item {
  cursor: pointer !important;
}

/* 弹窗内标签的激活状态 */
.modal-tag-item.active {
  background: #eef2ff;
  color: #6366f1;
  border-color: #c7d2fe;
  font-weight: 500;
}

/* 标签点的样式 */
.filter-item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

/* 自定义滚动条样式 */
.tags-modal-content::-webkit-scrollbar {
  width: 8px;
}

.tags-modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tags-modal-content::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 4px;
}

.tags-modal-content::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}

/* 弹窗底部样式 */
.tags-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 自定义滚动条样式 */
.tags-modal-content::-webkit-scrollbar {
  width: 8px;
}

.tags-modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tags-modal-content::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 4px;
}

.tags-modal-content::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}


/* 对分类图标在弹框中的特殊样式 */
.modal-tag-item .filter-item-icon {
  margin-right: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 高亮样式在弹框中的应用 */
.modal-tag-item.highlight {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 40px;
}

/* 无更多数据提示 */
.no-more {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 40px;
  color: #999;
}

/* 已选择区域的优化样式 */
.active-filters {
  display: flex;
  align-items: center;
  background: #f9f9fc;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  flex-wrap: wrap;
  gap: 10px;
}

.active-filters-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

/* 添加一个小图标到标题前 */
.active-filters-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  border-radius: 2px;
  margin-right: 8px;
}

.active-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

/* 自定义标签样式 */
.active-filters-tags :deep(.ant-tag) {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  margin: 0;
  border-radius: 16px;
  background: white;
  border: 1px solid #e0e7ff;
  color: #6366f1;
  font-weight: 500;
  font-size: 13px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  height: auto;
  line-height: 1.5;
}

/* 标签悬停效果 */
.active-filters-tags :deep(.ant-tag:hover) {
  background: #eef2ff;
  border-color: #c7d2fe;
  transform: translateY(-1px);
}

/* 关闭图标样式 */
.active-filters-tags :deep(.anticon-close) {
  color: #8b5cf6;
  font-size: 10px;
  margin-left: 4px;
  background: #eef2ff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.active-filters-tags :deep(.anticon-close:hover) {
  background: #c7d2fe;
  color: #4338ca;
}

/* 标签前缀图标样式 */
.active-filters-tags :deep(.ant-tag .anticon:not(.anticon-close)) {
  margin-right: 6px;
  font-size: 14px;
  color: #8b5cf6;
}

/* 清除全部按钮样式 */
.active-filters-tags :deep(.ant-btn-link) {
  color: #6366f1;
  font-size: 13px;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.06);
  box-shadow: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  border: none;
  margin-left: 8px;
}

.active-filters-tags :deep(.ant-btn-link:hover) {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

.active-filters-tags :deep(.ant-btn-link .anticon) {
  font-size: 14px;
}

/* 为不同类型的筛选标签设置不同的颜色 */
.active-filters-tags :deep(.ant-tag[data-filter-type="category"]) {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0284c7;
}

.active-filters-tags :deep(.ant-tag[data-filter-type="tag"]) {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #16a34a;
}

.active-filters-tags :deep(.ant-tag[data-filter-type="sort"]) {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
  }

  .active-filters-title {
    margin-bottom: 8px;
  }

  .active-filters-tags {
    width: 100%;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .active-filters {
    background: rgba(30, 30, 30, 0.5);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .active-filters-title {
    color: #bbb;
  }

  .active-filters-tags :deep(.ant-tag) {
    background: rgba(45, 45, 45, 0.8);
    border-color: rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
  }

  .active-filters-tags :deep(.ant-tag:hover) {
    background: rgba(60, 60, 60, 0.8);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .active-filters-tags :deep(.anticon-close) {
    background: rgba(80, 80, 80, 0.8);
  }

  .active-filters-tags :deep(.ant-btn-link) {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
  }

  .active-filters-tags :deep(.ant-btn-link:hover) {
    background: rgba(99, 102, 241, 0.25);
  }
}
</style>