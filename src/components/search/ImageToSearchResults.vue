<template>
  <div class="search-results-page">
    <!-- 固定顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <!-- 左侧返回按钮 -->
        <div class="header-left">
          <a-button class="back-button" @click="goBack">
            <template #icon>
              <IconFont type="icon-shangyizhang11" />
            </template>
            返回
          </a-button>
        </div>

        <!-- 中间标题区域 -->
        <div class="header-center">
          <h2 class="page-title">以图搜图结果</h2>
          <div class="search-meta">
            找到相似图片 {{ total }} 张
          </div>
        </div>

        <!-- 右侧搜索按钮 -->
        <div class="header-right">
          <a-button
              class="research-button"
              type="primary"
              @click="showResearchModal"
          >
            <template #icon>
              <IconFont type="icon-sousuo2" />
            </template>
            再次搜索
          </a-button>
        </div>
      </div>
    </header>

    <!-- 搜索结果内容区 -->
    <div class="results-container">
      <a-spin :spinning="loading" tip="搜索中...">
        <div v-if="records.length === 0 && !loading" class="empty-result">
          <a-empty description="未找到相似图片" />
        </div>
        <div v-else class="image-grid">
          <div
              v-for="item in records"
              :key="item.id"
              class="image-card"
          >
            <div class="image-wrapper">
              <img
                  :src="item.thumbnailUrl || item.url"
                  :alt="item.name"
                  class="result-image"
                  @load="handleImageLoaded"
              />
            </div>
          </div>
        </div>

        <div class="pagination-wrapper">
          <a-pagination
              v-model:current="current"
              :total="total"
              :pageSize="pageSize"
              show-size-changer
              :pageSizeOptions="['12', '24', '36', '48']"
              @change="handlePageChange"
              @showSizeChange="handleSizeChange"
              :show-total="(total) => `共 ${total} 条结果`"
          />
        </div>
      </a-spin>
    </div>

    <!-- 再次搜索弹窗 -->
    <a-modal
        v-model:visible="researchModalVisible"
        title="调整搜索参数"
        @ok="handleResearch"
        @cancel="researchModalVisible = false"
        width="480px"
    >
      <a-form layout="vertical">
        <a-form-item label="搜索不满意？再次搜索">
          <a-switch v-model:checked="searchParams.isResearch" />
        </a-form-item>
        <a-form-item label="自定义关键词">
          <a-input
              v-model:value="searchParams.customKeyword"
              placeholder="输入关键词可提高搜索精度"
              allow-clear
          />
        </a-form-item>
        <a-form-item label="保存搜索结果">
          <a-switch v-model:checked="searchParams.saveResults" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { searchByImageUsingPost } from '@/api/tupianxiangguanjiekou';
import IconFont from '@/components/common/IconFont.vue';

const route = useRoute();
const router = useRouter();

// 搜索参数
const searchParams = reactive({
  pictureId: null,
  includeSameUser: false,
  saveResults: false,
  customKeyword: '',
  isResearch: false,
  pageNum: 1,
  pageSize: 12
});

// 分页和排序
const total = ref(0);
const records = ref([]);
const loading = ref(true);
const current = ref(1);
const pageSize = ref(12);
const sortType = ref('similarity');
const keyword = ref('');
const researchModalVisible = ref(false);
const loadedImagesCount = ref(0);

// 存储所有数据，前端分页使用
const allRecords = ref([]);
const dataFullyLoaded = ref(false);

// 获取搜索结果
const fetchSearchResults = async () => {
  loading.value = true;
  loadedImagesCount.value = 0;

  try {
    const { searchId } = route.query;

    if (!searchId) {
      message.error('搜索参数错误');
      return;
    }

    // 从sessionStorage中获取搜索参数
    const storedParams = sessionStorage.getItem(searchId);

    if (!storedParams) {
      message.error('搜索参数已失效');
      return;
    }

    // 解析存储的参数
    const parsedParams = JSON.parse(storedParams);

    // 合并存储的参数和当前参数
    Object.assign(searchParams, parsedParams);

    // 如果有关键词，添加到搜索参数中
    if (keyword.value) {
      searchParams.customKeyword = keyword.value;
    }

    // 只有在没有缓存数据或强制重新搜索时才调用API
    if (allRecords.value.length === 0 || searchParams.isResearch) {
      const apiParams = {
        pictureId: searchParams.pictureId,
        includeSameUser: searchParams.includeSameUser || false,
        saveResults: searchParams.saveResults || false,
        customKeyword: searchParams.customKeyword || '',
        isResearch: searchParams.isResearch || false,
        pageNum: 1,
        pageSize: 8
      };

      const response = await searchByImageUsingPost(apiParams);

      if (response && response.data && response.data.code === 200) {
        const { data } = response.data;
        allRecords.value = data.records || [];
        total.value = data.total || 0;
        dataFullyLoaded.value = true;
      } else {
        message.error('搜索失败: ' + (response?.data?.message || '未知错误'));
      }
    }

    // 前端执行分页
    applyClientPagination();
  } catch (error) {
    console.error('搜索错误:', error);
    message.error('搜索出错，请重试');
  } finally {
    loading.value = false;
  }
};

// 前端分页逻辑
const applyClientPagination = () => {
  const start = (current.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  // 如果有关键词，先过滤
  let filteredRecords = allRecords.value;
  if (keyword.value) {
    filteredRecords = allRecords.value.filter(item =>
        (item.name && item.name.toLowerCase().includes(keyword.value.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(keyword.value.toLowerCase()))
    );
    total.value = filteredRecords.length;
  } else {
    total.value = allRecords.value.length;
  }

  // 应用分页
  records.value = filteredRecords.slice(start, end);
};

// 处理分页变化
const handlePageChange = (page, size) => {
  current.value = page;
  pageSize.value = size;
  applyClientPagination();
};

// 处理每页条数变化
const handleSizeChange = (current, size) => {
  pageSize.value = size;
  applyClientPagination();
};

// 处理排序方式变化
watch(sortType, () => {
  // 前端排序
  if (sortType.value === 'similarity') {
    // 相似度排序，保持原顺序即可，因为API返回的就是按相似度排序的
  } else if (sortType.value === 'latest') {
    // 按时间排序
    allRecords.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  }
  applyClientPagination();
});

// 处理关键词搜索
const handleSearch = () => {
  current.value = 1; // 重置页码
  applyClientPagination();
};

// 显示再次搜索弹窗
const showResearchModal = () => {
  searchParams.isResearch = true;
  researchModalVisible.value = true;
};

// 处理再次搜索
const handleResearch = () => {
  searchParams.isResearch = true;
  current.value = 1; // 重置页码
  researchModalVisible.value = false;
  allRecords.value = []; // 清空缓存数据
  fetchSearchResults();
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 格式化数字
const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};

// 处理图片加载完成
const handleImageLoaded = () => {
  loadedImagesCount.value++;
};

// 组件挂载时获取搜索结果
onMounted(() => {
  fetchSearchResults();
});
</script>

<style scoped>
.search-results-page {
  background-color: #f7f9fc;
  min-height: calc(100vh - 64px);
  padding-bottom: 24px;
}

/* 顶部导航栏样式 */
.page-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
}

.header-container {
  position: relative;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0;
}

/* 左侧按钮区域 - 贴近左边缘 */
.header-left {
  position: absolute;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

/* 中间标题区域 */
.header-center {
  flex: 1;
  text-align: center;
  margin: 0 80px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.search-meta {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

/* 右侧按钮区域 - 贴近右边缘 */
.header-right {
  position: absolute;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 16px;
}

.research-button {
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

/* 内容区域样式 */
.results-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 16px 0;
}

.empty-result {
  background-color: white;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.image-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  padding-top: 75%; /* 4:3 宽高比 */
  overflow: hidden;
  background-color: #f3f4f6;
}

.result-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-card:hover .result-image {
  transform: scale(1.05);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-container {
    height: 56px;
  }

  .header-center {
    margin: 0 70px;
  }

  .page-title {
    font-size: 16px;
  }

  .search-meta {
    font-size: 12px;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .back-button, .research-button {
    padding: 0 8px;
    height: 36px;
    font-size: 12px;
  }

  .header-left {
    padding-left: 8px;
  }

  .header-right {
    padding-right: 8px;
  }

  .header-center {
    margin: 0 60px;
  }

  .search-meta {
    display: none;
  }
}
</style>