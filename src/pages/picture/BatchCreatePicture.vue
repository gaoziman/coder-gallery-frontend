<template>
  <div class="batch-create-picture-page">
    <!-- 页面标题区域 -->
    <div class="enhanced-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <h1 class="main-title">
              <picture-outlined />
              批量创建图片
            </h1>
            <p class="page-desc">通过关键词搜索抓取图片，一键批量上传多张图片作品</p>
          </div>
          <div class="statistics-container">
            <div class="stat-item">
              <cloud-download-outlined />
              <span>本周抓取: <strong>1,258</strong></span>
            </div>
            <div class="stat-item">
              <file-search-outlined />
              <span>热门关键词: <strong>自然风光</strong></span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="inspiration-container">
            <div class="inspiration-text">批量效率提示</div>
            <div class="inspiration-quote">"使用精准的关键词和合适的数量设置，可以提高图片采集的相关性和质量"</div>
            <div class="inspiration-author">— 智能云图库</div>
          </div>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div class="upload-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">
              <search-outlined />
            </div>
            <div class="step-text">设置参数</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ 'active': isSearching || hasResults }">
            <div class="step-icon">
              <cloud-download-outlined />
            </div>
            <div class="step-text">抓取图片</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ 'active': hasResults }">
            <div class="step-icon">
              <check-circle-outlined />
            </div>
            <div class="step-text">批量上传</div>
          </div>
        </div>
      </div>

      <!-- 装饰性图形元素 -->
      <div class="decorative-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="square"></div>
        <div class="triangle"></div>
      </div>
    </div>

    <!-- 参数设置区域 -->
    <a-card class="parameter-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <setting-outlined />
          抓取参数设置
        </div>
      </template>

      <a-form
          :model="searchForm"
          layout="vertical"
          :rules="formRules"
          ref="searchFormRef"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <!-- 关键词 -->
            <a-form-item label="搜索关键词" name="keyword" required>
              <a-input
                  v-model:value="searchForm.keyword"
                  placeholder="输入图片搜索关键词，多个关键词用空格分隔"
                  :maxLength="100"
                  show-count
                  allow-clear
              >
                <template #prefix>
                  <search-outlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <!-- 抓取源 -->
            <a-form-item label="抓取源" name="source" required>
              <a-select
                  v-model:value="searchForm.source"
                  placeholder="选择图片抓取来源"
                  :options="sourceOptions"
                  show-search
              >
                <template #suffixIcon><global-outlined /></template>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <!-- 图片数量 -->
            <a-form-item label="抓取数量" name="count" required>
              <a-input-number
                  v-model:value="searchForm.count"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                  placeholder="设置需要抓取的图片数量"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <!-- 图片分类 -->
            <a-form-item label="图片分类" name="category">
              <a-select
                  v-model:value="searchForm.category"
                  placeholder="选择图片分类"
                  :options="categoryOptions"
                  :show-search="true"
                  allow-clear
              >
                <template #suffixIcon><appstore-outlined /></template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <!-- 文件名前缀 -->
            <a-form-item label="文件名前缀" name="namePrefix">
              <a-input
                  v-model:value="searchForm.namePrefix"
                  placeholder="设置文件名前缀，例如：风景_"
                  allow-clear
              >
                <template #prefix>
                  <font-size-outlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>


        <!-- 搜索按钮区域 -->
        <div class="form-actions">
          <a-button @click="resetForm">重置</a-button>
          <a-button type="primary" @click="startSearch" :loading="isSearching">
            开始抓取
          </a-button>
        </div>
      </a-form>
    </a-card>

    <!-- 搜索结果区域 - 仅当有结果时显示 -->
    <a-card
        v-if="hasResults"
        class="results-card"
        :bordered="false"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
    >
      <template #title>
        <div class="card-title">
          <picture-outlined />
          抓取结果 ({{ searchResults.length }}张)
        </div>
      </template>

      <div class="results-toolbar">
        <div class="selection-info">
          已选择 {{ selectedImages.length }} 张图片
        </div>
        <div class="toolbar-actions">
          <a-button type="primary" :disabled="!selectedImages.length" @click="uploadSelected">
            <upload-outlined />
            批量上传
          </a-button>
          <a-button :disabled="!selectedImages.length" @click="deselectAll">
            取消选择
          </a-button>
          <a-button type="link" @click="selectAll">
            全选
          </a-button>
        </div>
      </div>

      <div class="image-grid">
        <a-checkbox-group v-model:value="selectedImages">
          <div class="image-grid-container">
            <div
                v-for="(image, index) in searchResults"
                :key="index"
                class="image-item"
            >
              <div class="image-card">
                <div class="image-checkbox">
                  <a-checkbox :value="image.id"></a-checkbox>
                </div>
                <img :src="image.thumbnail" :alt="image.title" class="thumbnail" />
                <div class="image-info">
                  <div class="image-title">{{ searchForm.namePrefix || '' }}{{ image.title }}</div>
                  <div class="image-size">{{ image.width }}x{{ image.height }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-checkbox-group>
      </div>

      <div class="load-more-container" v-if="hasMoreResults">
        <a-button @click="loadMoreResults" :loading="loadingMore">
          加载更多
        </a-button>
      </div>

      <div class="upload-actions">
        <a-button @click="closeResults">取消</a-button>
        <a-button type="primary" :disabled="!selectedImages.length" @click="uploadSelected" :loading="uploading">
          批量上传所选图片
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import {
  PictureOutlined,
  UploadOutlined,
  SearchOutlined,
  SettingOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  TagsOutlined,
  StopOutlined,
  FontSizeOutlined,
  CloudDownloadOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

// 表单及搜索相关
const searchFormRef = ref(null);
const showAdvanced = ref(false);
const isSearching = ref(false);
const hasResults = ref(false);
const hasMoreResults = ref(false);
const loadingMore = ref(false);
const uploading = ref(false);

// 搜索表单
const searchForm = reactive({
  keyword: '',
  source: 'all',
  count: 20,
  category: undefined,
  namePrefix: '',
  imageSize: undefined,
  imageType: undefined,
  colorStyle: undefined,
  autoTags: true,
  safeSearch: true,
  tags: [],
  excludeKeywords: ''
});

// 表单验证规则
const formRules = {
  keyword: [
    { required: true, message: '请输入搜索关键词', trigger: 'blur' },
    { min: 2, max: 100, message: '关键词长度为2-100个字符', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择抓取源', trigger: 'change' }
  ],
  count: [
    { required: true, message: '请设置抓取数量', trigger: 'change' },
    { type: 'number', min: 1, max: 100, message: '抓取数量范围为1-100', trigger: 'change' }
  ]
};

// 抓取源选项
const sourceOptions = [
  { value: 'all', label: '全部来源' },
  { value: 'baidu', label: '百度图片' },
  { value: 'bing', label: '必应图片' },
  { value: 'google', label: '谷歌图片' },
  { value: 'unsplash', label: 'Unsplash' },
  { value: 'pexels', label: 'Pexels' },
  { value: 'pixabay', label: 'Pixabay' }
];

// 分类选项
const categoryOptions = [
  { value: 'portrait', label: '人像' },
  { value: 'landscape', label: '风景' },
  { value: 'architecture', label: '建筑' },
  { value: 'animals', label: '动物' },
  { value: 'food', label: '美食' },
  { value: 'sports', label: '运动' },
  { value: 'street', label: '街拍' },
  { value: 'still_life', label: '静物' },
  { value: 'abstract', label: '抽象' },
  { value: 'documentary', label: '纪实' },
  { value: 'other', label: '其他' }
];

// 标签选项
const tagOptions = [
  { value: 'macro', label: '微距' },
  { value: 'bw', label: '黑白' },
  { value: 'nature', label: '自然' },
  { value: 'city', label: '城市' },
  { value: 'creative', label: '创意' },
  { value: 'portrait', label: '人像' },
  { value: 'wallpaper', label: '壁纸' },
  { value: 'night', label: '夜景' },
  { value: 'vintage', label: '复古' },
  { value: 'water', label: '水景' },
  { value: 'art', label: '艺术' },
  { value: 'minimalism', label: '极简' }
];

// 图片尺寸选项
const imageSizeOptions = [
  { value: 'any', label: '任意尺寸' },
  { value: 'large', label: '大尺寸' },
  { value: 'medium', label: '中等尺寸' },
  { value: 'small', label: '小尺寸' },
  { value: 'wallpaper', label: '壁纸尺寸' },
  { value: 'square', label: '正方形' }
];

// 图片类型选项
const imageTypeOptions = [
  { value: 'all', label: '所有类型' },
  { value: 'photo', label: '照片' },
  { value: 'clipart', label: '剪贴画' },
  { value: 'lineart', label: '线稿' },
  { value: 'face', label: '人脸' },
  { value: 'transparent', label: '透明背景' }
];

// 颜色风格选项
const colorStyleOptions = [
  { value: 'all', label: '所有颜色' },
  { value: 'color', label: '彩色' },
  { value: 'bw', label: '黑白' },
  { value: 'red', label: '红色系' },
  { value: 'orange', label: '橙色系' },
  { value: 'yellow', label: '黄色系' },
  { value: 'green', label: '绿色系' },
  { value: 'blue', label: '蓝色系' },
  { value: 'purple', label: '紫色系' },
  { value: 'pink', label: '粉色系' },
  { value: 'white', label: '白色系' },
  { value: 'gray', label: '灰色系' },
  { value: 'black', label: '黑色系' }
];

// 搜索结果
const searchResults = ref([]);
const selectedImages = ref([]);

// 重置表单
const resetForm = () => {
  searchFormRef.value?.resetFields();
  showAdvanced.value = false;

  Object.assign(searchForm, {
    keyword: '',
    source: 'all',
    count: 20,
    category: undefined,
    namePrefix: '',
    imageSize: undefined,
    imageType: undefined,
    colorStyle: undefined,
    autoTags: true,
    safeSearch: true,
    tags: [],
    excludeKeywords: ''
  });

  message.info('搜索参数已重置');
};

// 开始搜索
const startSearch = async () => {
  try {
    await searchFormRef.value.validate();

    // 设置搜索中状态
    isSearching.value = true;

    // 清空之前的结果
    searchResults.value = [];
    selectedImages.value = [];

    // 模拟API请求延迟
    setTimeout(() => {
      // 生成模拟搜索结果
      searchResults.value = generateMockResults(searchForm.count);

      // 更新状态
      isSearching.value = false;
      hasResults.value = true;
      hasMoreResults.value = true;

      message.success(`已找到${searchResults.value.length}张相关图片`);
    }, 1500);

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查抓取参数是否填写正确');
  }
};

// 生成模拟搜索结果
const generateMockResults = (count) => {
  const results = [];

  for (let i = 0; i < count; i++) {
    const width = Math.floor(Math.random() * 1000) + 500;
    const height = Math.floor(Math.random() * 1000) + 500;

    results.push({
      id: `img-${i}`,
      title: `${searchForm.keyword.split(' ')[0]}-${i + 1}`,
      thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/200`,
      source: searchForm.source,
      width: width,
      height: height,
      size: `${Math.floor(width * height / 10000)}KB`,
      format: ['jpg', 'png', 'webp'][Math.floor(Math.random() * 3)]
    });
  }

  return results;
};

// 加载更多结果
const loadMoreResults = () => {
  if (hasMoreResults.value) {
    loadingMore.value = true;

    setTimeout(() => {
      const additionalResults = generateMockResults(10);
      searchResults.value = [...searchResults.value, ...additionalResults];

      loadingMore.value = false;

      // 如果结果超过一定数量，假设没有更多结果
      if (searchResults.value.length >= 50) {
        hasMoreResults.value = false;
      }
    }, 1000);
  }
};

// 选择所有图片
const selectAll = () => {
  selectedImages.value = searchResults.value.map(image => image.id);
};

// 取消选择所有图片
const deselectAll = () => {
  selectedImages.value = [];
};

// 上传选中的图片
const uploadSelected = () => {
  if (selectedImages.value.length === 0) {
    message.warning('请至少选择一张图片');
    return;
  }

  uploading.value = true;

  // 模拟上传过程
  setTimeout(() => {
    uploading.value = false;

    const count = selectedImages.value.length;
    message.success(`成功上传${count}张图片`);

    // 跳转到我的空间页面
    router.push('/space');
  }, 2000);
};

// 关闭结果
const closeResults = () => {
  hasResults.value = false;
  searchResults.value = [];
  selectedImages.value = [];
};
</script>

<style scoped>
.batch-create-picture-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.step-divider {
  width: 60px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

/* 装饰性元素 */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: 10%;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 20%;
}

.square {
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.05);
  transform: rotate(45deg);
  bottom: 20px;
  right: 15%;
}

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid rgba(255, 255, 255, 0.05);
  top: 10%;
  left: 20%;
  transform: rotate(20deg);
}

/* 卡片样式 */
.parameter-card,
.results-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}


/* 头部样式 - 沿用CreatePicture.vue中的样式 */
.enhanced-page-header {
  margin-bottom: 32px;
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #4a6bef 0%, #7e3ef5 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(122, 79, 245, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 60%;
}

.title-container {
  margin-bottom: 8px;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.page-desc {
  margin: 12px 0 0;
  font-size: 15px;
  opacity: 0.9;
  max-width: 90%;
  color: white;
  line-height: 1.6;
}

.statistics-container {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.inspiration-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 12px;
  max-width: 280px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.inspiration-text {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.inspiration-quote {
  font-size: 15px;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 8px;
}

.inspiration-author {
  font-size: 13px;
  text-align: right;
  opacity: 0.7;
}

/* 进度指示器 */
.upload-progress {
  margin-top: 32px;
  position: relative;
  z-index: 2;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  background-color: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background-color: white;
  color: #5d54f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.step-text {
  font-size: 13px;
  font-weight: 500;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  color: #262626;
  margin: 0;
  font-weight: 500;
}

.advanced-options {
  background-color: #f9f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.switch-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  color: #262626;
}

/* 按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 结果区域样式 */
.results-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.selection-info {
  font-size: 14px;
  color: #262626;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.image-grid {
  margin-bottom: 24px;
}

.image-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  transition: all 0.3s ease;
}

.image-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.image-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 2px;
}

.thumbnail {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 8px;
  background-color: white;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 12px;
  color: #8c8c8c;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .batch-create-picture-page {
    padding: 16px 12px;
  }

  .enhanced-page-header {
    padding: 24px 16px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 24px;
  }

  .header-left {
    max-width: 100%;
  }

  .main-title {
    font-size: 24px;
  }

  .header-right {
    justify-content: flex-start;
  }

  .inspiration-container {
    max-width: 100%;
  }

  .statistics-container {
    flex-wrap: wrap;
  }

  .progress-steps {
    padding: 12px 8px;
  }

  .step-icon {
    width: 36px;
    height: 36px;
  }

  .step-text {
    font-size: 12px;
  }

  .step-divider {
    width: 30px;
  }

  .image-grid-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .batch-create-picture-page {
    background-color: #121212;
  }

  .enhanced-page-header {
    background: linear-gradient(135deg, #3a59c7 0%, #5d3eae 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .parameter-card,
  .results-card {
    background-color: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .section-title {
    color: #e0e0e0;
  }

  .advanced-options {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .option-label {
    color: #e0e0e0;
  }

  .results-toolbar {
    border-bottom-color: #333;
  }

  .selection-info {
    color: #e0e0e0;
  }

  .image-card {
    background-color: #2a2a2a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .image-info {
    background-color: #2a2a2a;
  }

  .image-title {
    color: #e0e0e0;
  }

  .upload-actions {
    border-top-color: #333;
  }
}
</style>