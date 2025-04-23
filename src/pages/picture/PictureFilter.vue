<template>
  <div class="filters-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-wrapper">
        <a-input-search
            v-model:value="filterStore.searchText"
            placeholder="搜索图片、标签、作者..."
            class="search-input"
            @input="debounceSearch"
            @search="onSearch"
            enter-button
        >
        </a-input-search>

        <a-button
            v-if="hasActiveFilters"
            class="reset-button"
            @click="resetAllFilters"
        >
          <template #icon><IconFont type="icon-shuaxin2" /></template>
          重置筛选
        </a-button>
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
                :class="{'highlight': filterStore.selectedCategory === 'all'}"
                @click="selectCategory('all')"
            >
              <span class="filter-item-icon">
                <IconFont type="icon-fenlei-"/>
              </span>
              全部
            </div>

            <!-- 显示前7个分类 -->
            <div
                v-for="category in displayedCategories"
                :key="category.id"
                class="filter-item"
                :class="{'highlight': filterStore.selectedCategory === category.id}"
                @click="selectCategory(category.id)"
            >
              <span class="filter-item-icon">
                <component :is="renderCategoryIcon(category)" v-if="renderCategoryIcon(category)"/>
                <IconFont v-else-if="category.icon && category.icon.startsWith('icon-')" :type="category.icon"/>
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
              <span class="btn-text">更多分类</span>
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
                :class="{'active': filterStore.selectedTags.length === 0}"
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
                :class="{'active': filterStore.selectedTags.includes(tag.id)}"
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
                class="show-more-btn tag-variant"
                @click="showMoreTags"
            >
              <span class="btn-text">更多标签</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 排序区域 -->
      <div class="filter-section">
        <h3 class="filter-section-title">排序</h3>

        <!-- 排序选项 -->
        <div class="sort-area">
          <div
              v-for="(name, type) in sortMap"
              :key="type"
              class="sort-item"
              :class="{'active': filterStore.sortOption === type}"
              @click="handleSortChange(type)"
          >
            <span class="sort-item-icon">
              <IconFont :type="getSortIcon(type)"/>
            </span>
            {{ name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃筛选标签展示 -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">已选择</div>
      <div class="active-filters-tags">
        <!--  搜索框内容      -->
        <a-tag
            v-if="filterStore.searchText.trim() !== ''"
            closable
            @close="clearSearch"
            data-filter-type="search"
        >
          <template #icon>
            <IconFont type="icon-sousuo"/>
          </template>
          {{ filterStore.searchText.trim() }}
        </a-tag>

        <!-- 分类标签 -->
        <a-tag
            v-if="filterStore.selectedCategory !== 'all'"
            closable
            @close="selectCategory('all')"
            data-filter-type="category"
        >
          <template #icon>
            <component :is="renderCategoryIcon(getCategoryObject(filterStore.selectedCategory))"
                       v-if="renderCategoryIcon(getCategoryObject(filterStore.selectedCategory))"/>
            <IconFont v-else :type="getCategoryIcon(filterStore.selectedCategory)"/>
          </template>
          {{ getCategoryName(filterStore.selectedCategory) }}
        </a-tag>

        <!-- 标签 -->
        <a-tag
            v-for="tagId in filterStore.selectedTags"
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
            v-if="filterStore.sortOption !== 'latest'"
            closable
            @close="resetSort"
            data-filter-type="sort"
        >
          <template #icon>
            <IconFont :type="getSortIcon(filterStore.sortOption)"/>
          </template>
          {{ sortMap[filterStore.sortOption] }}
        </a-tag>
      </div>
    </div>

    <!-- 分类和标签弹窗 -->
    <CategorySelectionModal
        v-model:visible="categoriesModalVisible"
        :categories="categories"
        :selectedCategory="filterStore.selectedCategory"
        :renderCategoryIcon="renderCategoryIcon"
        @select="selectCategory"
        @cancel="handleCategoriesModalCancel"
    />

    <!-- 替换原有的标签弹框 -->
    <TagSelectionModal
        v-model:visible="tagsModalVisible"
        v-model:selectedTags="filterStore.selectedTags"
        :tags="allTags"
        :getTagColor="getTagColor"
        @search="executeSearch"
        @cancel="handleTagsModalCancel"
    />

  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted, onUnmounted} from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  AppstoreOutlined, TagOutlined, DeleteOutlined, SortAscendingOutlined,
  ClockCircleOutlined, FireOutlined, EyeOutlined, HeartOutlined, StarOutlined
} from '@ant-design/icons-vue';
import { listCategoriesByTypeUsingGet } from '@/api/fenleiguanli';
import { getTagListUsingGet } from "@/api/biaoqianguanli";
import { useFilterStore } from '@/stores/filterStore';
import Category = API.Category;
import CategorySelectionModal from "@/components/home/CategorySelectionModal.vue";
import TagSelectionModal from "@/components/home/TagSelectionModal.vue";
import {CategoryData, ColorMap, FilterParams, SortOption, TagData} from "@/types/home";

// 排序映射
const sortMap: SortOption = {
  'latest': '最新发布',
  'popular': '最受欢迎',
  'mostViewed': '最多浏览',
  'mostLiked': '最多点赞',
  'mostBookmarked': '最多收藏'
};


// 排序图标映射
const sortIconMap: SortOption = {
  'latest': 'icon-shijian6',
  'popular': 'icon-shouhuanyingde',
  'mostViewed': 'icon-liulan3',
  'mostLiked': 'icon-aixin3',
  'mostBookmarked': 'icon-a-shoucangyishoucang1x'
};


// 使用筛选器 Store
const filterStore = useFilterStore();

// 路由
const route = useRoute();

// 加载状态
const loadingCategories = ref(false);
const loadingTags = ref(false);

// 分类和标签数据
const categories = ref<API.Category[]>([]);
const allTags = ref<API.Tag[]>([]);

// 弹窗控制
const categoriesModalVisible = ref(false);
const tagsModalVisible = ref(false);

// 防抖搜索相关变量
let searchTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 500;


// 计算属性：判断是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return filterStore.selectedCategory !== 'all' ||
      filterStore.selectedTags.length > 0 ||
      filterStore.sortOption !== 'latest' ||
      filterStore.searchText.trim() !== '';
});

// 分类和标签计算属性
const displayedCategories = computed(() => {
  return categories.value.slice(0, 7);
});

const hasMoreCategories = computed(() => {
  return categories.value.length > 7;
});

const popularTags = computed(() => {
  return allTags.value.slice(0, 10);
});

const hasMoreTags = computed(() => {
  return allTags.value.length > 10;
});

// 弹窗方法
const showMoreCategories = () => {
  categoriesModalVisible.value = true;
};

const showMoreTags = () => {
  tagsModalVisible.value = true;
};

// 筛选操作方法
const onSearch = (value :any) => {
  filterStore.searchText = value;
  applyFilters();
};

// 清除搜索关键词
const clearSearch = () => {
  filterStore.searchText = '';
  applyFilters();
};

// 标签搜索执行函数
const executeSearch = (tags :any) => {
  // 更新选中的标签
  filterStore.selectedTags = [...tags];

  // 应用筛选条件，触发搜索
  applyFilters();
};

// 处理分类弹框取消
const handleCategoriesModalCancel = () => {
  categoriesModalVisible.value = false;
};

// 处理标签弹框取消
const handleTagsModalCancel = () => {
  tagsModalVisible.value = false;
};

const selectCategory = (categoryId :any) => {
  if (filterStore.selectedCategory === categoryId) return;
  filterStore.selectedCategory = categoryId;
  applyFilters();
};

const toggleTag = (tagId :any) => {
  const index = filterStore.selectedTags.indexOf(tagId);
  if (index === -1) {
    filterStore.selectedTags.push(tagId);
  } else {
    filterStore.selectedTags.splice(index, 1);
  }
  applyFilters();
};

const clearTagSelection = () => {
  filterStore.selectedTags = [];
  applyFilters();
};

const handleSortChange = (value :any) => {
  filterStore.sortOption = value;
  applyFilters();
};

const resetSort = () => {
  filterStore.sortOption = 'latest';
  applyFilters();
};

const resetAllFilters = () => {
  filterStore.resetAllFilters();
  applyFilters();
};

// 辅助方法：获取分类图标
const renderCategoryIcon = (category :any) => {
  if (!category || !category.icon) return null;

  if (category.icon.startsWith('ant-')) {
    const iconName = category.icon.replace('ant-', '');

    switch (iconName.toLowerCase()) {
      case 'appstore': return AppstoreOutlined;
      case 'tag': return TagOutlined;
      case 'delete': return DeleteOutlined;
      case 'sort-ascending': return SortAscendingOutlined;
      case 'clock-circle': return ClockCircleOutlined;
      case 'fire': return FireOutlined;
      case 'eye': return EyeOutlined;
      case 'heart': return HeartOutlined;
      case 'star': return StarOutlined;
      default: return AppstoreOutlined;
    }
  }

  return null;
};

// 获取分类对象
const getCategoryObject = (categoryId :any) => {
  const category = categories.value.find(c => c.id === categoryId);

  if (category) {
    return category;
  }

  return {
    id: categoryId,
    name: getCategoryName(categoryId),
    icon: 'icon-fenlei-'
  };
};

// 获取分类名称
const getCategoryName = (categoryId :any) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
};

// 获取分类图标
const getCategoryIcon = (categoryId :any) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category?.icon || 'icon-fenlei-';
};

// 获取标签名称
const getTagName = (tagId :string | number ): string => {
  const tag = allTags.value.find(t => t.id === tagId);
  return tag ? tag.name : '未知标签';
};

// 获取排序图标
const getSortIcon = (sortType :string | number) :string => {
  return sortIconMap[sortType] || 'icon-paixu';
};

// 获取标签颜色
const getTagColor = (tagId: string | number): string => {
  // 为不同的标签分配固定的颜色
  const colorMap: ColorMap = {
    'mountains': '#4ade80',
    'ocean': '#38bdf8',
    'forest': '#14b8a6',
    'sunset': '#f97316',
    'architecture': '#8b5cf6',
    'skyscraper': '#6366f1',
    'portrait': '#ec4899',
    'wildlife': '#eab308',
    'pets': '#f43f5e',
    'cuisine': '#d946ef',
    'dessert': '#f472b6',
    'adventure': '#0ea5e9',
    'illustration': '#a855f7',
    'photography': '#64748b',
    'gadgets': '#0891b2',
    'minimal': '#475569',
    'colorful': '#f59e0b',
    'blackandwhite': '#334155',
    'abstract': '#dc2626',
    'vintage': '#b45309'
  };


  const tagIdStr = String(tagId);
333
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

  return colorMap[tagIdStr] || '#6366f1';
};

// 应用筛选条件并发出事件
const applyFilters = () => {
  // 更新URL参数
  filterStore.updateUrlParams();

  // 向父组件发出筛选改变事件
  emit('filter-change', getFilterParams());
};

// 防抖搜索函数
const debounceSearch = (e: Event) => {
  // 明确指定Event类型并进行类型断言
  const target = e.target as HTMLInputElement;

  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  // 设置新的定时器
  searchTimer = setTimeout(() => {
    // 执行搜索
    onSearch(target.value);
  }, DEBOUNCE_DELAY);
};

// 获取筛选参数
const getFilterParams = () => {
  const params: FilterParams = {};

  if (filterStore.searchText.trim()) {
    params.keyword = filterStore.searchText.trim();
  }

  if (filterStore.selectedCategory !== 'all') {
    params.categoryId = filterStore.selectedCategory;
  }

  if (filterStore.selectedTags.length > 0) {
    params.tagIds = filterStore.selectedTags;
  }

  params.sortBy = filterStore.sortOption;

  return params;
};


// 获取分类数据
// 获取分类数据
const fetchCategories = async () => {
  try {
    loadingCategories.value = true;
    const response = await listCategoriesByTypeUsingGet({type: ''});

    if (response?.data?.code === 200 && Array.isArray(response.data.data)) {
      categories.value = response.data.data
          .filter((category: CategoryData) => category.status !== 'inactive')
          .map((category: CategoryData) => {
            return {
              id: category.id || category.code || '',
              name: typeof category.name === 'string' ? category.name : '',
              icon: typeof category.icon === 'string' ? category.icon : 'ant-appstore',
              count: typeof category.count === 'number' ? category.count : 0
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
    const response = await getTagListUsingGet();

    if (response?.data?.code === 200 && Array.isArray(response.data.data)) {
      allTags.value = response.data.data
          .filter((tag: TagData) => tag.status !== 'inactive')
          .map((tag: TagData) => {
            return {
              id: tag.id !== undefined ? tag.id : '',
              name: typeof tag.name === 'string' ? tag.name : '',
              color: typeof tag.color === 'string' ? tag.color : getTagColor(tag.id),
              count: typeof tag.count === 'number' ? tag.count : 0
            } as API.Tag;
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

// 初始化：从URL加载筛选条件
const initFiltersFromUrl = () => {
  // 如果已经初始化过，则不再重复初始化
  if (filterStore.isInitialized) {
    return;
  }

  // 清空现有数据
  loadingCategories.value = true;
  loadingTags.value = true;

  // 从URL参数加载筛选条件
  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlFilters = filterStore.loadFromUrlParams(urlParams);
};

const emit = defineEmits(['filter-change']);

// 组件卸载时清除定时器
onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});


// 初始化数据
onMounted(async () => {
  // 初始化从URL加载筛选条件
  initFiltersFromUrl();

  // 获取筛选数据
  await Promise.all([
    fetchCategories(),
    fetchTags()
  ]);

  // 如果有筛选条件，应用筛选
  if (filterStore.hasActiveFilters) {
    applyFilters();
  } else if (filterStore.isInitialized) {
    // 即使没有筛选条件，但已初始化，也通知父组件加载默认图片
    emit('filter-change', filterStore.getFilterParams());
  }
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}


.reset-button {
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 500;
  padding: 0 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reset-button .anticon {
  font-size: 16px;
  margin-right: 6px;
}

/* 整体搜索框样式 */
.search-input {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  flex: 1;
}

/* 输入框部分样式 */
.search-input :deep(.ant-input) {
  height: 44px;
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
  background: rgba(250, 250, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(226, 232, 240, 0.6);
}

/* 分类标签项通用样式*/
.filter-item {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 18px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(226, 232, 240, 0.4);
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
}

/* 图标容器优化 */
.filter-item-icon {
  margin-right: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  opacity: 0.85;
  transition: all 0.3s ease;
}

/* 分类标签悬停状态 */
.filter-item:hover {
  background: rgba(248, 250, 252, 0.8);
  color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.1);
  border-color: rgba(199, 210, 254, 0.5);
}

/* 图标悬停状态 */
.filter-item:hover .filter-item-icon,
.filter-item:hover .anticon,
.filter-item:hover :deep(svg) {
  opacity: 1;
  color: #4f46e5;
}

/* 分类标签选中状态 */
.filter-item.active {
  background: rgba(238, 242, 255, 0.8);
  color: #4338ca;
  border-color: rgba(165, 180, 252, 0.6);
  font-weight: 500;
}

.filter-item.active .filter-item-icon {
  color: #4338ca;
  opacity: 1;
}

/* 特别突出的激活状态 - 使用渐变背景 */
.filter-item.highlight {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
  font-weight: 500;
}

/* 确保图标在选中状态下的颜色正确 */
.filter-item.highlight .filter-item-icon,
.filter-item.highlight .anticon,
.filter-item.highlight :deep(svg) {
  color: white !important;
  opacity: 1;
}

/* 滚动容器*/
.scroll-container {
  display: flex;
  overflow-x: auto;
  padding: 6px 2px 8px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 12px;
  margin-bottom: 4px;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

/* 标签内的小圆点 */
.filter-item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
}

/* 标签分类容器 */
.filter-items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 0;
}

/* 重新设计排序区域容器 */
.sort-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  background: linear-gradient(to right, rgba(249, 250, 251, 0.5), rgba(245, 247, 255, 0.5));
  border-radius: 14px;
  padding: 12px 16px;
  border: 1px solid rgba(99, 102, 241, 0.08);
}

/* 优化排序标签项 */
.sort-item {
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  position: relative;
}

/* 排序标签悬停状态 */
.sort-item:hover {
  color: #6366f1;
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.06);
}

/* 排序标签选中状态 */
.sort-item.active {
  background: rgba(255, 255, 255, 0.85);
  color: #6366f1;
  font-weight: 500;
  border: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.08);
}

/* 排序项中的图标优化 */
.sort-item-icon {
  margin-right: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.sort-item:hover .sort-item-icon {
  opacity: 1;
  color: #6366f1;
}

.sort-item.active .sort-item-icon {
  color: #4f46e5;
  opacity: 1;
}

/* 筛选区块标题 */
.filter-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  position: relative;
  padding-left: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

/* 筛选区块标题前的彩色标记 */
.filter-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  border-radius: 2px;
}

/* 每个筛选区块的通用样式 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 显示更多按钮 */
.show-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(245, 247, 255, 0.7) 0%, rgba(238, 242, 255, 0.7) 100%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  color: #6366f1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

/* 标签变体 - 使用不同的颜色 */
.show-more-btn.tag-variant {
  background: linear-gradient(135deg, rgba(245, 243, 255, 0.7) 0%, rgba(237, 233, 254, 0.7) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.08);
}

.show-more-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
  background: linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(224, 231, 255, 0.9) 100%);
}

.show-more-btn.tag-variant:hover {
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.15);
  background: linear-gradient(135deg, rgba(237, 233, 254, 0.9) 0%, rgba(224, 231, 255, 0.9) 100%);
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

/* 顶部分类和标签选中状态 - 这是关键修复 */
.scroll-container > .filter-item:first-child.highlight .filter-item-icon,
.filter-items-container > .filter-item:first-child.active .filter-item-icon,
.scroll-container > .filter-item:first-child.highlight .anticon,
.filter-items-container > .filter-item:first-child.active .anticon {
  color: white !important;
}

/* 确保所有选中项中图标显示为白色 */
.filter-item.highlight .filter-item-icon :deep(svg),
.filter-item.active .filter-item-icon :deep(svg) {
  fill: currentColor;
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

/* 修改搜索按钮内图标的样式，确保在深色背景上清晰可见 */
.search-input :deep(.ant-input-search-button .anticon) {
  font-size: 20px;
  color: #ffffff; /* 添加白色图标颜色 */
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px; /* 固定高度，确保居中 */
  width: 20px; /* 固定宽度 */
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* 添加轻微阴影增强可见性 */
}

/* 确保悬停状态下图标仍然清晰 */
.search-input :deep(.ant-input-search-button:hover .anticon) {
  color: #ffffff;
  opacity: 1;
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
/* 已选择区域的优化样式 */
/* 已选择区域的优化样式 */
.active-filters {
  display: flex;
  align-items: center;
  background: rgba(249, 250, 251, 0.6);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  flex-wrap: wrap;
  gap: 10px;
}

.active-filters-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-right: 12px;
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
  gap: 10px;
  flex: 1;
}

/* 自定义标签样式 - 统一与排序卡片风格 */
.active-filters-tags :deep(.ant-tag) {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: auto;
  line-height: 1.5;
}

/* 标签悬停效果 */
.active-filters-tags :deep(.ant-tag:hover) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08);
}

/* 关闭图标样式 */
.active-filters-tags :deep(.anticon-close) {
  color: #64748b;
  font-size: 10px;
  margin-left: 6px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.active-filters-tags :deep(.anticon-close:hover) {
  background: rgba(224, 231, 255, 0.9);
  color: #4338ca;
}

/* 标签前缀图标样式 */
.active-filters-tags :deep(.ant-tag .anticon:not(.anticon-close)) {
  margin-right: 6px;
  font-size: 15px;
  color: #818cf8;
  opacity: 0.85;
}

.active-filters-tags :deep(.ant-tag:hover .anticon:not(.anticon-close)) {
  opacity: 1;
  color: #6366f1;
}

/* 为不同类型的筛选标签设置不同的颜色 - 保持更统一的风格 */
.active-filters-tags :deep(.ant-tag[data-filter-type="search"]) {
  color: #3b82f6;
  background: rgba(239, 246, 255, 0.6);
  border-color: rgba(191, 219, 254, 0.3);
}

.active-filters-tags :deep(.ant-tag[data-filter-type="search"] .anticon:not(.anticon-close)) {
  color: #3b82f6;
}

.active-filters-tags :deep(.ant-tag[data-filter-type="category"]) {
  color: #0284c7;
  background: rgba(240, 249, 255, 0.6);
  border-color: rgba(186, 230, 253, 0.3);
}

.active-filters-tags :deep(.ant-tag[data-filter-type="category"] .anticon:not(.anticon-close)) {
  color: #0284c7;
}

.active-filters-tags :deep(.ant-tag[data-filter-type="tag"]) {
  color: #16a34a;
  background: rgba(240, 253, 244, 0.6);
  border-color: rgba(187, 247, 208, 0.3);
}

.active-filters-tags :deep(.ant-tag[data-filter-type="tag"] .anticon:not(.anticon-close)) {
  color: #16a34a;
}

.active-filters-tags :deep(.ant-tag[data-filter-type="sort"]) {
  color: #dc2626;
  background: rgba(254, 242, 242, 0.6);
  border-color: rgba(254, 202, 202, 0.3);
}

.active-filters-tags :deep(.ant-tag[data-filter-type="sort"] .anticon:not(.anticon-close)) {
  color: #dc2626;
}
</style>