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
      <!-- 分类筛选 -->
      <div class="filter-section category-section">
        <div class="filter-title">分类</div>
        <div class="filter-options">
          <div class="category-tags-wrapper">
            <a-tag
                :class="['category-tag', selectedCategory === 'all' ? 'category-tag-active' : '']"
                @click="selectCategory('all')"
            >
              <span class="category-icon all-icon"></span>
              全部
            </a-tag>
            <a-tag
                v-for="category in categories"
                :key="category.id"
                :class="['category-tag', selectedCategory === category.id ? 'category-tag-active' : '']"
                @click="selectCategory(category.id)"
            >
              <span :class="['category-icon', `${category.id}-icon`]"></span>
              {{ category.name }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- 标签筛选 -->
      <div class="filter-section tags-section">
        <div class="filter-title">标签</div>
        <div class="filter-options tags-container">
          <a-tag
              :class="['tag-item', selectedTags.length === 0 ? 'tag-active' : '']"
              @click="clearTagSelection"
          >
            <span class="tag-dot"></span>
            全部
          </a-tag>
          <a-tag
              v-for="tag in popularTags"
              :key="tag.id"
              :class="['tag-item', selectedTags.includes(tag.id) ? 'tag-active' : '']"
              @click="toggleTag(tag.id)"
          >
            <span class="tag-dot" :style="{ backgroundColor: getTagColor(tag.id) }"></span>
            {{ tag.name }}
          </a-tag>
          <a-button
              v-if="hasMoreTags"
              class="more-tags-btn"
              type="link"
              @click="showMoreTags"
          >
            更多标签
            <template #icon>
              <DownOutlined/>
            </template>
          </a-button>
        </div>
      </div>

      <!-- 排序选项 -->
      <div class="filter-section sort-section">
        <div class="filter-title">排序</div>
        <a-select
            v-model:value="sortOption"
            class="sort-select"
            @change="handleSortChange"
        >
          <a-select-option value="latest">
            <ClockCircleOutlined /> 最新发布
          </a-select-option>
          <a-select-option value="popular">
            <FireOutlined /> 最受欢迎
          </a-select-option>
          <a-select-option value="mostViewed">
            <EyeOutlined /> 最多浏览
          </a-select-option>
          <a-select-option value="mostLiked">
            <HeartOutlined /> 最多点赞
          </a-select-option>
          <a-select-option value="mostBookmarked">
            <StarOutlined /> 最多收藏
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- 活跃筛选标签展示 -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">已选择：</div>
      <div class="active-filters-tags">
        <a-tag
            v-if="selectedCategory !== 'all'"
            closable
            @close="selectCategory('all')"
        >
          {{ getCategoryName(selectedCategory) }}
        </a-tag>
        <a-tag
            v-for="tagId in selectedTags"
            :key="tagId"
            closable
            @close="toggleTag(tagId)"
        >
          {{ getTagName(tagId) }}
        </a-tag>
        <a-tag
            v-if="sortOption !== 'latest'"
            closable
            @close="resetSort"
        >
          {{ getSortName(sortOption) }}
        </a-tag>
        <a-button type="link" @click="resetAllFilters" v-if="hasActiveFilters">
          清除全部
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
        @ok="handleTagsModalOk"
    >
      <div class="tags-modal-content">
        <a-tag
            v-for="tag in allTags"
            :key="tag.id"
            :class="['modal-tag-item', selectedTags.includes(tag.id) ? 'tag-active' : '']"
            @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </a-tag>
      </div>
      <div class="tags-modal-footer">
        <a-button @click="clearTagSelection">清除选择</a-button>
      </div>
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
  StarOutlined
} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";
import router from "@/router";
import {
  getWaterfallPicturesUsingPost,
  loadMoreWaterfallPicturesUsingPost,
} from '@/api/tupianxiangguanjiekou';
import ImageGallery from '@/components/common/ImageGallery.vue';

// 图片数据状态
const galleryImages = reactive([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentOffset = ref(0);
const lastId = ref(null);
const lastValue = ref(null);
const pageSize = ref(12);

// 搜索文本
const searchText = ref('');
const selectedCategory = ref('all');


const selectedTags = ref([]);

// 只展示前10个热门标签，其余在弹窗中显示
const popularTags = computed(() => {
  return allTags.value.slice(0, 10);
});
const hasMoreTags = computed(() => {
  return allTags.value.length > 10;
});

// 标签弹窗控制
const tagsModalVisible = ref(false);
const showMoreTags = () => {
  tagsModalVisible.value = true;
};
const handleTagsModalOk = () => {
  tagsModalVisible.value = false;
};

// 排序选项
const sortOption = ref('latest'); // 默认最新发布

// 判断是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return selectedCategory.value !== 'all' || selectedTags.value.length > 0 || sortOption.value !== 'latest';
});

// 分类数据
const categories = ref([
  {id: 'nature', name: '自然风光'},
  {id: 'city', name: '城市建筑'},
  {id: 'people', name: '人物肖像'},
  {id: 'animals', name: '动物世界'},
  {id: 'food', name: '美食佳肴'},
  {id: 'travel', name: '旅行探险'},
  {id: 'art', name: '艺术创作'},
  {id: 'tech', name: '科技数码'}
]);

// 标签数据
const allTags = ref([
  {id: 'mountains', name: '山脉'},
  {id: 'ocean', name: '海洋'},
  {id: 'forest', name: '森林'},
  {id: 'sunset', name: '日落'},
  {id: 'architecture', name: '建筑'},
  {id: 'skyscraper', name: '摩天大楼'},
  {id: 'portrait', name: '肖像'},
  {id: 'wildlife', name: '野生动物'},
  {id: 'pets', name: '宠物'},
  {id: 'cuisine', name: '美食'},
  {id: 'dessert', name: '甜点'},
  {id: 'adventure', name: '冒险'},
  {id: 'illustration', name: '插画'},
  {id: 'photography', name: '摄影'},
  {id: 'gadgets', name: '数码产品'},
  {id: 'minimal', name: '极简主义'},
  {id: 'colorful', name: '多彩'},
  {id: 'blackandwhite', name: '黑白'},
  {id: 'abstract', name: '抽象'},
  {id: 'vintage', name: '复古'}
]);


// 获取标签颜色的方法
const getTagColor = (tagId) => {
  // 为不同的标签分配固定的颜色
  const colorMap = {
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

  return colorMap[tagId] || '#6366f1'; // 默认返回主题色
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
};

// 获取标签名称
const getTagName = (tagId) => {
  const tag = allTags.value.find(t => t.id === tagId);
  return tag ? tag.name : '未知标签';
};

// 获取排序名称
const getSortName = (sort) => {
  const sortMap = {
    'latest': '最新发布',
    'popular': '最受欢迎',
    'mostViewed': '最多浏览',
    'mostLiked': '最多点赞',
    'mostBookmarked': '最多收藏'
  };
  return sortMap[sort] || '未知排序';
};

// 选择分类
const selectCategory = (categoryId) => {
  if (selectedCategory.value === categoryId) return;

  selectedCategory.value = categoryId;
  // 重新获取图片数据
  applyFilters();
};

// 切换标签选择
const toggleTag = (tagId) => {
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
const handleSortChange = (value) => {
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
  const params = {};

  // 添加分类筛选
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value;
  }

  // 添加标签筛选
  if (selectedTags.value.length > 0) {
    params.tags = selectedTags.value;
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
  console.log('搜索：', value);
  // 重置并根据搜索条件获取图片
  currentOffset.value = 0;
  lastId.value = null;
  lastValue.value = null;
  searchText.value = value;

  // 应用所有筛选条件
  applyFilters();
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
const viewImage = (image: any) => {
  // 这里可以更新浏览计数
  if (typeof image.views === 'number') {
    image.views += 1;
  } else {
    image.views = 1;
  }
  // 导航到详情页
  navigateToDetail(image);
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
  // 实际应用中应调用API删除图片，并从列表移除
};

// 点赞或取消点赞
const toggleLike = (image: any) => {
  image.liked = !image.liked;
  if (image.liked) {
    image.likes = (image.likes || 0) + 1;
  } else if (image.likes > 0) {
    image.likes -= 1;
  }
  message.success(image.liked ? '已添加到喜欢' : '已取消喜欢');
};

// 切换收藏状态的函数
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
  // 分享逻辑已经由ImageCard组件处理
  message.success(`已打开"${image.title}"的分享选项`);
};

// 加载更多图片
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;

  try {
    loadingMore.value = true;

    // 准备请求参数 - 使用lastId和lastValue
    const params = {
      offset: currentOffset.value,
      limit: pageSize.value,
      lastId: lastId.value,
      lastValue: lastValue.value
    };

    // 构建包含所有筛选条件的请求体
    const requestBody = {};

    // 添加搜索关键词
    if (searchText.value.trim()) {
      requestBody.keyword = searchText.value.trim();
    }

    // 添加分类筛选
    if (selectedCategory.value !== 'all') {
      requestBody.category = selectedCategory.value;
    }

    // 添加标签筛选
    if (selectedTags.value.length > 0) {
      requestBody.tags = selectedTags.value;
    }

    // 添加排序
    requestBody.sortBy = sortOption.value;

    console.log('加载更多图片请求参数:', params, requestBody);

    // 调用加载更多API
    const response = await loadMoreWaterfallPicturesUsingPost(
        params,
        requestBody
    );

    console.log('加载更多图片接口返回:', response);

    // 处理响应数据
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 更新lastId和lastValue用于下次加载
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 添加新加载的图片
        if (pictures.length > 0) {
          pictures.forEach(pic => {
            galleryImages.push(transformPictureData(pic));
          });

          // 更新偏移量
          currentOffset.value += pictures.length;
        }

        // 更新是否有更多数据标志
        hasMore.value = responseData.hasMore === true;

        if (pictures.length === 0) {
          message.info('没有更多图片了');
          hasMore.value = false;
        }
      } else {
        console.error('加载更多返回的数据结构不正确', responseData);
        message.warning('加载更多图片失败：数据格式不正确');
      }
    } else {
      message.error(response?.data?.message || '加载更多图片失败');
    }
  } catch (error) {
    console.error('加载更多图片出错:', error);
    message.error('加载更多图片时发生错误');
  } finally {
    loadingMore.value = false;
  }
};

// 将API返回的图片数据转换为组件使用的格式
const transformPictureData = (apiPicture) => {
  // 确保apiPicture是一个对象
  if (!apiPicture || typeof apiPicture !== 'object') {
    console.warn('无效的图片数据:', apiPicture);
    return {
      id: `default-${Date.now()}-${Math.random()}`,
      src: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg', // 默认图片
      title: '未命名图片',
      author: {
        name: '未知作者',
        avatar: 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
      },
      category: '未分类',
      tags: [],
      createTime: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
      aspectRatio: '1/1'
    };
  }

  // 根据后端实际返回的字段结构转换
  return {
    id: apiPicture.id,
    src: apiPicture.url,
    url: apiPicture.url,
    title: apiPicture.name || '未命名图片',
    author: {
      name: apiPicture.user?.username || '未知作者',
      avatar: apiPicture.user?.avatar || 'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png',
    },
    category: apiPicture.category || '未分类',
    tags: Array.isArray(apiPicture.tags)
        ? apiPicture.tags.map(tag => ({name: tag, color: ''}))
        : [],
    liked: false, // API没有提供liked状态
    bookmarked: false, // API没有提供bookmarked状态
    createTime: apiPicture.createTime,
    updateTime: apiPicture.updateTime,
    views: apiPicture.viewCount || 0,
    likes: apiPicture.likeCount || 0,
    comments: 0, // API没有提供评论数
    aspectRatio: apiPicture.picWidth && apiPicture.picHeight
        ? `${apiPicture.picWidth}/${apiPicture.picHeight}`
        : (apiPicture.picScale ? `${apiPicture.picScale}` : '1/1'),
    // 保留原始数据，以便后续需要时使用
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

    console.log('请求默认瀑布流图片数据（无参数）');

    // 调用API获取瀑布流图片 - 不传递任何筛选参数
    const response = await getWaterfallPicturesUsingPost();

    console.log('瀑布流图片接口返回:', response);

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
      } else {
        console.error('返回的数据结构不正确', responseData);
        message.warning('获取图片数据失败：数据格式不正确');
      }
    } else {
      message.error(response?.data?.message || '获取图片数据失败');
    }
  } catch (error) {
    console.error('获取瀑布流图片出错:', error);
    message.error('获取图片数据时发生错误');
  } finally {
    loading.value = false;
  }
};

// 带参数获取瀑布流图片数据（用于搜索和筛选）
const fetchGalleryImagesWithParams = async (params) => {
  try {
    loading.value = true;

    // 清空已有数据和偏移量
    galleryImages.length = 0;
    currentOffset.value = 0;
    lastId.value = null;
    lastValue.value = null;

    console.log('请求瀑布流图片数据，带参数:', params);

    // 调用API获取瀑布流图片 - 传递搜索参数
    const response = await getWaterfallPicturesUsingPost(params);

    console.log('瀑布流图片接口返回:', response);

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
        console.error('返回的数据结构不正确', responseData);
        message.warning('获取图片数据失败：数据格式不正确');
      }
    } else {
      message.error(response?.data?.message || '获取图片数据失败');
    }
  } catch (error) {
    console.error('获取瀑布流图片出错:', error);
    message.error('获取图片数据时发生错误');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化时获取图片数据（不带参数）
  fetchGalleryImages();
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
  height: 44px; /* 与输入框高度一致 */
  width: 60px; /* 增加按钮宽度 */
  border-radius: 0 8px 8px 0;
  background: #6366f1; /* 统一按钮颜色 */
  display: flex;
  align-items: center; /* 垂直居中图标 */
  justify-content: center; /* 水平居中图标 */
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

/* 筛选区域样式 */
.filter-container {
  padding: 16px 24px 20px;
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f2;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-right: 20px;
  min-width: 42px;
  position: relative;
  padding-left: 2px;
}

.filter-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 20px;
  height: 2px;
  background-color: #6366f1;
  border-radius: 2px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

/* 分类标签容器 */
.category-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  padding: 4px 0;
}

/* 分类标签样式 */
.category-tag {
  cursor: pointer;
  padding: 6px 14px 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #f5f7fa;
  color: #4b5563;
  border: none;
  margin-right: 0;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: auto;
}

.category-tag:hover {
  background-color: #e9ecf5;
  color: #6366f1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.15);
}

.category-tag-active {
  background-color: #6366f1;
  color: white;
  font-weight: 500;
}

.category-tag-active:hover {
  background-color: #5258e9;
  color: white;
}

/* 分类图标 */
.category-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  top: -1px;
}

.all-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmlkIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxsaW5lIHgxPSIzIiB5MT0iOSIgeDI9IjIxIiB5Mj0iOSIvPjxsaW5lIHgxPSIzIiB5MT0iMTUiIHgyPSIyMSIgeTI9IjE1Ii8+PGxpbmUgeDE9IjkiIHkxPSIzIiB4Mj0iOSIgeTI9IjIxIi8+PGxpbmUgeDE9IjE1IiB5MT0iMyIgeDI9IjE1IiB5Mj0iMjEiLz48L3N2Zz4=');
}

.nature-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1tb3VudGFpbi1zbm93Ij48cGF0aCBkPSJtOCAzIDQgOCA1LTUgNSAxNUgyTDggMyIvPjxwYXRoIGQ9Ik00LjE0IDE1LjVjMi45Ni0yLjk2IDQuMjQtMi45NiA3LjIgMGwxLjMzLTEuMzRjLTMuOS0zLjktNi00LTkuOTcgMGwtMS4zLTEuMzJjNC45Ny00Ljk3IDcuNDUtNC45NyAxMi40MSAwIi8+PC9zdmc+');
}

.city-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1idWlsZGluZy0yIj48cGF0aCBkPSJNNiAyMlY1YTIgMiAwIDAgMSAyLTJoOGEyIDIgMCAwIDEgMiAydjE3SC02WiIvPjxwYXRoIGQ9Ik02IDEySDRhMiAyIDAgMCAwLTIgMnY2aDR2LThaIi8+PHBhdGggZD0iTTE4IDEyaDJhMiAyIDAgMCAxIDIgMnY2aC00di04WiIvPjxwYXRoIGQ9Ik0xMCA4aDRNMTAgMTJoNE0xMCAxNmg0Ii8+PC9zdmc+');
}

.people-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VycyI+PHBhdGggZD0iTTEyIDIwdi0yYzAtMS42OTYtMS0zLTMtM3MtMy43MDgtMS4zMDQtMy0zYzAuNi0xLjQgMi41LTIgNC0yIDEuNDIyIDAgMi41IDEgMi41IDIuNWE0IDQgMCAxIDAgOCAwYzAgMS4zNjEtMS4xNy0xLjYzOS0yLjUgMC0xLjMxMyAxLjYyNi0yLjUgNS41LTIuNSA3LjVNMTcgMTRjLTEuMjI0LTEuNDgyLTIgLTMtMiAtNGE0IDQgMCAwIDEgNCAtNCAyIDIgMCAwIDEgMiAyIi8+PHBhdGggZD0iTTcgNy41YTIuNSAyLjUgMCAxIDEgMCAtNSAyLjUgMi41IDAgMCAxIDAgNSIvPjwvc3ZnPg==');
}

.animals-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wYXciPjxjaXJjbGUgY3g9IjExIiBjeT0iNiIgcj0iMiIvPjxjaXJjbGUgY3g9IjE4IiBjeT0iOCIgcj0iMiIvPjxjaXJjbGUgY3g9IjUiIGN5PSI4IiByPSIyIi8+PGNpcmNsZSBjeD0iNyIgY3k9IjEzIiByPSIyIi8+PHBhdGggZD0iTTE0LjY4IDE2Ljk1QzEzLjM3IDE0LjgyIDEyLjM1IDE0IDE0IDEyLjJjMi45OS0zLjM1IDMuODUtNi4yIDIuNC03LjY2LTEuNDYtMS40Ni00LjMtLjYtNy42NCAyLjRsLTIuOTMgMi45M2MtMS4yOCAxLjI3LS43NSAyLjQuOSA0LjE1IDEuNSwxLjU4IDIuNzYgMi44NiA0LjE1IDQuMTQgMS4zNCAxLjI3IDIuNjMgMi4wNiA0LjE0IDEuNzguNDIgMCAxLjg3LjIxIDEuODctLjZzLTEuOC0uNzYtMi4yMS0xLjNaIi8+PC9zdmc+');
}

.food-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11dGVuc2lscyI+PHBhdGggZD0iTTMgMnYxMWMwIDIuNyAyLjEgNSA1IDVoMGMyLjcgMCA1LTIuMyA1LTVWMk0zIDEzaDEwTTMgOWgxME0zIDVoMTBNMTYgOFY1YzAtMi01LTIuNC01LTRNMTYgNXYzYzAtMiA1LTIuNCA1LTRIOE0yMSAzdjRNMjEgMTJ2OCIvPjwvc3ZnPg==');
}

.travel-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wbGFuZSI+PHBhdGggZD0iTTE3LjggNC44SDIzTDxwYXRoIGQ9Ik0xNy44IDQuOGg1LjJsLTQuOCA0LjhoLTUuMnpNMTEuMTkgNEE5IDE5IDAgMCAwIDEwLjQgOWwtMS45IDE5QTEwIDEwIDAgMCAwIDE2IDIxLjZMMTcuOCA0LjhIMTEuMXpNMi40IDEwLjRoNS4yTDcuNiAxNS4yaC01LjJ6TTE0IDE1LjJ2NGg0eiIvPjwvc3ZnPg==');
}

.art-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wYWxldHRlIj48Y2lyY2xlIGN4PSIxMi41IiBjeT0iOC41IiByPSIxIi8+PGNpcmNsZSBjeD0iJiM5OTksMjIwOzciIGN5PSIxMiIgcj0iMSIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjEiLz48cGF0aCBkPSJNMTIgMmE5Ljk2NSA5Ljk2NSAwIDAgMCAtNi43MSAxNy4zYy4zLjIuNjEuMy45Mi4zMC45Ni4wNCAxLjg0LS41NCAyLjE2LTEuNDYuNTgtMS43Mi0uNzgtMy4zMy0yLjQ0LTMuMzNhMS4wNiAxLjA2IDAgMCAxLS44MS0uMzlBOCg4IDAgMSAwIDEyIDQuaCA4IiAvPjwvLvs4PjwvcGF0aD48L3N2Zz4=');
}

.tech-icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1sYXB0b3AiPjxwYXRoIGQ9Ik0yMCAxM1Y2YTIgMiAwIDAgMC0yLTJINmEyIDIgMCAwIDAtMiAydjdNMiAxOGg3bTEzIDBoPG00IDBIN20tNSAwaDEwIi8+PC9zdmc+');
}

/* 标签区域样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  transition: all 0.2s ease;
  background-color: #f5f7fa;
  color: #4b5563;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  height: auto;
}

.tag-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #6366f1; /* 默认点的颜色 */
  margin-right: 6px;
}

.tag-item:hover {
  background-color: #e9ecf5;
  color: #6366f1;
  transform: translateY(-1px);
}

.tag-active {
  background-color: #6366f1;
  color: white;
  font-weight: 500;
}

.tag-active:hover {
  background-color: #5258e9;
  color: white;
}

.tag-active .tag-dot {
  background-color: white;
}

.more-tags-btn {
  font-size: 12px;
  padding: 0 8px;
  height: 26px;
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
  border: none;
  transition: all 0.2s ease;
}

.more-tags-btn:hover {
  background-color: rgba(99, 102, 241, 0.2);
  color: #4f46e5;
}

/* 排序区域样式 */
.sort-section {
  margin-left: auto;
  margin-right: 0;
  align-items: center;
}

.sort-select {
  width: 160px;
  border-radius: 8px;
}

/* 下拉选择框样式 */
.sort-select :deep(.ant-select-selector) {
  border-radius: 8px !important;
  height: 36px !important;
  display: flex;
  align-items: center;
  padding: 0 12px !important;
  border-color: #e5e7eb !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.sort-select :deep(.ant-select-selector:hover) {
  border-color: #6366f1 !important;
}

.sort-select :deep(.ant-select-arrow) {
  color: #6366f1;
}

/* 活跃筛选标签展示区域样式 */
.active-filters {
  display: flex;
  align-items: center;
  padding: 0 24px 16px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.active-filters-title {
  font-size: 13px;
  color: #6b7280;
  margin-right: 10px;
  font-weight: 500;
}

.active-filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.active-filters-tags :deep(.ant-tag) {
  background-color: #e0e7ff;
  color: #4f46e5;
  border: none;
  border-radius: 16px;
  padding: 3px 10px;
  margin-right: 0;
}

.active-filters-tags :deep(.ant-tag .anticon-close) {
  color: #4f46e5;
  font-size: 10px;
}

.active-filters-tags :deep(.ant-tag .anticon-close:hover) {
  color: #312e81;
  background-color: transparent;
}

.active-filters-tags :deep(.ant-btn-link) {
  color: #6366f1;
  font-size: 13px;
  padding: 0 4px;
  height: 26px;
}

/* 标签模态框样式 */
.tags-modal-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.modal-tag-item {
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
}

.tags-modal-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 添加一些过渡动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* 添加响应式调整 */
@media (max-width: 768px) {
  .filter-container {
    padding: 12px 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-title {
    margin-bottom: 8px;
    min-width: auto;
  }

  .sort-section {
    width: 100%;
    margin-top: 12px;
  }

  .sort-select {
    width: 100%;
  }
}

/* 增强选中状态的视觉反馈 */
.category-tag-active, .tag-active {
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

/* 添加点击时的动画效果 */
.category-tag:active, .tag-item:active {
  transform: scale(0.95);
}

/* 提供可见的焦点状态 */
.category-tag:focus, .tag-item:focus {
  outline: 2px solid rgba(99, 102, 241, 0.4);
  outline-offset: 1px;
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
</style>