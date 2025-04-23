<template>
  <div class="home-page">
    <!-- 使用筛选器组件 -->
    <picture-filter @filter-change="handleFilterChange"/>

    <template v-if="loading">
      <!-- 保留原有的加载状态 -->
      <image-gallery
          :images="galleryImages"
          :loading="loading"
          :empty-text="'加载中...'"
          @view="viewImage"
          @download="downloadImage"
          @like="toggleLike"
          @bookmark="toggleBookmark"
          @share="shareImage"
          @delete="confirmDelete"
          @navigate-to-detail="navigateToDetail"
          @refresh="fetchGalleryImages"
      />
    </template>
    <template v-else-if="galleryImages.length === 0">
      <!-- 使用新的空状态组件 -->
      <empty-state
          :type="getEmptyStateType()"
          :keyword="filterStore.searchText"
          :show-action="true"
          :action-text="getEmptyStateActionText()"
          :action-icon="getEmptyStateActionIcon()"
          @action="handleEmptyStateAction"
      />
    </template>
    <template v-else>
      <image-gallery
          :images="galleryImages"
          :loading="loading"
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
      <div class="load-more-container">
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
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import {DownOutlined} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";
import router from "@/router";
import {
  getWaterfallPicturesUsingPost,
  loadMoreWaterfallPicturesUsingPost,
} from '@/api/tupianxiangguanjiekou';
import {useUserReactionStore} from '@/stores/userReaction';
import {useFilterStore} from '@/stores/filterStore';
import ImageGallery from '@/components/common/ImageGallery.vue';
import PictureFilter from "@/pages/picture/PictureFilter.vue";
import EmptyState from "@/components/common/EmptyState.vue";

// 使用Store
const userReactionStore = useUserReactionStore();
const filterStore = useFilterStore();

// 图片数据状态
const galleryImages = reactive<API.GalleryImage[]>([]);
const loading = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const hasMore = ref<boolean>(true);
const currentOffset = ref<number>(0);
const lastId = ref<string | number | null>(null);
const lastValue = ref<any>(null);
const pageSize = ref<number>(12);

const hasSearched = ref(false);


// 获取空状态类型
const getEmptyStateType = () => {
  if (!hasSearched.value) {
    return 'no-data';
  } else if (filterStore.searchText) {
    return 'no-search-results';
  } else if (hasActiveFilters()) {
    return 'no-filter-results';
  }
  return 'no-data';
};

// 获取空状态操作按钮文本
const getEmptyStateActionText = () => {
  if (!hasSearched.value) {
    return '刷新';
  } else if (filterStore.searchText || hasActiveFilters()) {
    return '清除筛选条件';
  }
  return '刷新';
};

// 获取空状态操作按钮图标
const getEmptyStateActionIcon = () => {
  if (!hasSearched.value) {
    return 'reload';
  } else if (filterStore.searchText || hasActiveFilters()) {
    return 'clear';
  }
  return 'reload';
};

// 处理空状态操作按钮点击
const handleEmptyStateAction = (type: any) => {
  if (type === 'no-data') {
    // 刷新数据
    fetchGalleryImages();
  } else if (type === 'no-search-results' || type === 'no-filter-results') {
    // 清除筛选条件
    filterStore.resetAllFilters();
    // 重新获取图片
    fetchGalleryImages();
  }
};

// 判断是否有活跃的筛选条件
const hasActiveFilters = () => {
  return filterStore.selectedCategory !== 'all' ||
      filterStore.selectedTags.length > 0 ||
      filterStore.sortOption !== 'latest' ||
      filterStore.searchText.trim() !== '';
};

// 处理筛选器变更
const handleFilterChange = (filterParams: any) => {
  // 重置图片加载状态
  currentOffset.value = 0;
  lastId.value = null;
  lastValue.value = null;

  // 标记已经进行了搜索
  hasSearched.value = true;

  // 使用筛选参数加载图片
  fetchGalleryImagesWithParams(filterParams);
};

// 导航到图片详情页
const navigateToDetail = (image: any) => {
  const imageId = image.id || '';
  router.push({
    name: 'PictureDetail',
    params: {id: imageId},
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
  const a = document.createElement('a');
  a.href = image.src || image.url;
  a.download = image.title || 'download-image';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 确认删除图片
const confirmDelete = (image: any) => {
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
  message.success(`已打开"${image.title}"的分享选项`);
};

// 加载更多图片
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;

  try {
    loadingMore.value = true;

    // 准备请求参数
    const params = {
      offset: currentOffset.value,
      limit: pageSize.value,
      lastId: lastId.value,
      lastValue: lastValue.value
    };

    // 创建请求体
    const requestBody = {};

    // 添加搜索关键词
    if (filterStore.searchText.trim()) {
      requestBody.keyword = filterStore.searchText.trim();
    }

    // 添加分类筛选
    if (filterStore.selectedCategory !== 'all') {
      const categoryIdValue = filterStore.selectedCategory;

      if (typeof categoryIdValue === 'string') {
        if (/^\d+$/.test(categoryIdValue)) {
          requestBody.categoryId = parseInt(categoryIdValue, 10);
        }
      } else if (typeof categoryIdValue === 'number') {
        requestBody.categoryId = categoryIdValue;
      }
    }

    // 添加标签筛选
    if (filterStore.selectedTags.length > 0) {
      requestBody.tagIds = filterStore.selectedTags.map(tagId => {
        if (typeof tagId === 'string' && /^\d+$/.test(tagId)) {
          return parseInt(tagId, 10);
        } else if (typeof tagId === 'number') {
          return tagId;
        }
        return null;
      }).filter((id): id is number => id !== null);
    }

    // 添加排序
    requestBody.sortBy = filterStore.sortOption;

    // 调用加载更多API
    const response = await loadMoreWaterfallPicturesUsingPost(params, requestBody);

    // 处理响应数据
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 保存加载状态
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 创建新图片数组
        const newImages = [];

        // 添加新图片
        if (pictures.length > 0) {
          pictures.forEach((pic) => {
            const transformedPic = transformPictureData(pic);
            galleryImages.push(transformedPic);
            newImages.push(transformedPic);
          });

          // 更新偏移量
          currentOffset.value += pictures.length;
          message.success(`成功加载 ${pictures.length} 张新图片`);
        } else {
          message.info('没有更多图片了');
          hasMore.value = false;
        }

        // 更新是否有更多数据
        hasMore.value = responseData.hasMore === true;

        // 批量加载反应状态
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
  // 安全转换图片数据（保留原有转换逻辑）
  // 这里保留之前的转换函数内容，与之前提供的代码相同
  if (!apiPicture || typeof apiPicture !== 'object') {
    console.warn('无效的图片数据:', apiPicture);
    return {
      id: `default-${Date.now()}-${Math.random()}`,
      src: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg',
      url: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg',
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
      updateTime: undefined,
      viewCount: 0,
      likeCount: 0,
      comments: 0,
      aspectRatio: '1/1',
      raw: {}
    };
  }

  // 安全地获取字段，确保类型正确
  const id = apiPicture.id ?? `temp-${Date.now()}`;
  const url = typeof apiPicture.url === 'string' ? apiPicture.url : '';
  const title = typeof apiPicture.name === 'string' ? apiPicture.name : '未命名图片';
  const size = typeof apiPicture.size === 'number' ? apiPicture.size : '';
  const username = apiPicture.user?.username;
  const userAvatar = apiPicture.user?.avatar;
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

  // 处理标签
  let tags = [];
  if (Array.isArray(apiPicture.tags)) {
    tags = apiPicture.tags.map((tag: any) => ({
      name: typeof tag === 'string' ? tag : String(tag),
      color: ''
    }));
  }

  if (Array.isArray(apiPicture.tagColors) && apiPicture.tagColors.length > 0 && tags.length > 0) {
    // 匹配颜色与标签
    for (let i = 0; i < Math.min(tags.length, apiPicture.tagColors.length); i++) {
      if (tags[i] && typeof apiPicture.tagColors[i] === 'string') {
        tags[i].color = apiPicture.tagColors[i];
      }
    }
  }

  // 返回转换后的图片数据
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

// 获取默认图片数据
const fetchGalleryImages = async () => {
  try {
    loading.value = true;
    galleryImages.length = 0;
    currentOffset.value = 0;
    lastId.value = null;
    lastValue.value = null;

    // 调用API获取图片
    const response = await getWaterfallPicturesUsingPost({});

    // 处理响应数据
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 保存加载状态
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

        // 更新是否有更多数据
        hasMore.value = responseData.hasMore === true;
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

// 带参数获取图片数据
const fetchGalleryImagesWithParams = async (params) => {
  try {
    loading.value = true;

    // 检查是否是初始加载，如果是，则清空现有数据
    if (!loadingMore.value) {
      galleryImages.length = 0;
      currentOffset.value = 0;
      lastId.value = null;
      lastValue.value = null;
    }

    // 创建请求参数
    const requestParams = {};

    // 添加关键词
    if (params.keyword) {
      requestParams.keyword = params.keyword;
    }

    // 处理分类ID
    if (params.categoryId !== undefined && params.categoryId !== 'all') {
      if (typeof params.categoryId === 'string' && /^\d+$/.test(params.categoryId)) {
        requestParams.categoryId = parseInt(params.categoryId, 10);
      } else if (typeof params.categoryId === 'number') {
        requestParams.categoryId = params.categoryId;
      }
    }

    // 处理标签ID列表
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

    // 调用API获取图片
    const response = await getWaterfallPicturesUsingPost(requestParams);

    // 处理响应数据
    if (response && response.data && response.data.code === 200) {
      const responseData = response.data.data;

      if (responseData && responseData.records && Array.isArray(responseData.records)) {
        const pictures = responseData.records;

        // 保存加载状态
        if (responseData.lastId) {
          lastId.value = responseData.lastId;
        }

        if (responseData.lastValue) {
          lastValue.value = responseData.lastValue;
        }

        // 创建图片ID集合用于去重
        const existingImageIds = new Set(galleryImages.map(img => img.id));

        // 更新图片数据（添加去重逻辑）
        if (pictures.length > 0) {
          pictures.forEach(pic => {
            const transformedPic = transformPictureData(pic);

            // 只有当图片ID不存在于当前集合中时才添加
            if (!existingImageIds.has(transformedPic.id)) {
              galleryImages.push(transformedPic);
              existingImageIds.add(transformedPic.id);
            }
          });

          // 更新偏移量
          currentOffset.value = galleryImages.length;
        }

        // 更新是否有更多数据
        hasMore.value = responseData.hasMore === true;

        if (pictures.length === 0) {
          if (Object.keys(params).length > 0) {
          } else if (filterStore.searchText) {
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

// 初始化
onMounted(async () => {
  // 初始化用户反应统计
  await userReactionStore.initialize();
  // 但如果筛选器尚未初始化，默认加载所有图片
  if (!filterStore.isInitialized) {
    fetchGalleryImages();
  }
});
</script>

<style scoped>
.load-more-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 30px 0 50px;
}

.load-more {
  text-align: center;
  width: 200px;
}

.load-more .ant-btn {
  width: 100%;
  height: 44px;
  padding: 0 24px;
  border-radius: 22px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  transition: all 0.3s ease;
}

.load-more .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* 底部提示样式优化 */
.no-more {
  width: 100%;
  text-align: center;
}
</style>