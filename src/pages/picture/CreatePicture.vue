<template>
  <div class="create-image-page">
    <!-- 页面标题 -->
    <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }">
      <h1 class="page-title">创建图片</h1>
      <p class="page-description">上传图片到您的云图库，开始构建您的知识体系</p>
    </div>

    <!-- 步骤提示 -->
    <div class="steps-container" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 100 } }">
      <div class="step" :class="{ 'active': currentStep >= 1 }">
        <div class="step-icon">
          <cloud-upload-outlined />
        </div>
        <div class="step-content">
          <h3>上传图片</h3>
          <p>选择图片或输入链接</p>
        </div>
      </div>
      <div class="step-divider"></div>
      <div class="step" :class="{ 'active': currentStep >= 2 }">
        <div class="step-icon">
          <form-outlined />
        </div>
        <div class="step-content">
          <h3>填写信息</h3>
          <p>添加名称和描述</p>
        </div>
      </div>
      <div class="step-divider"></div>
      <div class="step" :class="{ 'active': currentStep === 3 }">
        <div class="step-icon">
          <check-circle-outlined />
        </div>
        <div class="step-content">
          <h3>完成创建</h3>
          <p>保存到您的图库</p>
        </div>
      </div>
    </div>

    <!-- 上传区域卡片 -->
    <a-card
        class="upload-card"
        :bordered="false"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <!-- 上传方式选择标签页 -->
      <a-tabs v-model:activeKey="activeTab" class="upload-tabs">
        <a-tab-pane key="local" tab="本地上传">
          <!-- 本地上传区域 -->
          <div class="upload-area">
            <a-upload-dragger
                v-model:fileList="fileList"
                :customRequest="handleLocalUpload"
                :beforeUpload="beforeUpload"
                :showUploadList="false"
                accept="image/*"
                :multiple="false"
                @change="handleUploadChange"
                class="custom-uploader"
            >
              <div class="upload-content" v-if="!previewUrl">
                <div class="upload-icon-wrapper">
                  <cloud-upload-outlined class="upload-icon" />
                </div>
                <p class="upload-text">点击或拖拽图片到此区域上传</p>
                <p class="upload-hint">支持 JPG、PNG、GIF 等格式图片，单个文件不超过 10MB</p>

                <!-- 上传建议 -->
                <div class="upload-suggestions">
                  <h4>上传小贴士</h4>
                  <ul>
                    <li><check-outlined /> 高质量图片可提高识别准确率</li>
                    <li><check-outlined /> 清晰的图片便于知识管理</li>
                    <li><check-outlined /> 添加标签有助于快速检索</li>
                  </ul>
                </div>
              </div>

              <!-- 预览区域 -->
              <div class="preview-container" v-else>
                <img :src="previewUrl" class="preview-image" />
                <div class="preview-actions">
                  <a-button class="preview-action-btn" type="primary" shape="circle" @click.stop="zoomImage">
                    <search-outlined />
                  </a-button>
                  <a-button class="preview-action-btn" type="primary" danger shape="circle" @click.stop="removeImage">
                    <delete-outlined />
                  </a-button>
                </div>
                <div class="image-info-overlay">
                  <div class="image-format">
                    {{ getImageFormat() }}
                  </div>
                </div>
              </div>
            </a-upload-dragger>
          </div>
        </a-tab-pane>

        <a-tab-pane key="url" tab="链接上传">
          <!-- 链接上传区域 -->
          <div class="url-upload-area">
            <a-form layout="vertical">
              <a-form-item label="图片链接" name="imageUrl">
                <a-input
                    v-model:value="imageUrl"
                    placeholder="请输入图片URL，例如：https://example.com/image.jpg"
                    class="url-input"
                    allow-clear
                    @pressEnter="fetchImageFromUrl"
                >
                  <template #prefix>
                    <link-outlined />
                  </template>
                  <template #suffix>
                    <a-button
                        type="primary"
                        size="small"
                        class="fetch-btn"
                        @click="fetchImageFromUrl"
                        :disabled="!imageUrl"
                    >
                      获取
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
            </a-form>

            <!-- 使用示例 -->
            <div class="url-examples" v-if="!previewUrl">
              <h4>链接上传示例</h4>
              <div class="example-links">
                <div class="example-link" v-for="(example, index) in urlExamples" :key="index" @click="useExampleUrl(example)">
                  <div class="example-icon">
                    <img :src="example.thumbnail" alt="示例缩略图" class="example-thumbnail" />
                  </div>
                  <div class="example-info">
                    <p class="example-title">{{ example.title }}</p>
                    <a-tag color="#4F46E5">{{ example.format }}</a-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 链接图片预览区 -->
            <div class="url-preview-wrapper" v-if="previewUrl && activeTab === 'url'">
              <div class="url-preview-container" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
                <img :src="previewUrl" class="preview-image" />
                <div class="preview-actions">
                  <a-button class="preview-action-btn" type="primary" shape="circle" @click.stop="zoomImage">
                    <search-outlined />
                  </a-button>
                  <a-button class="preview-action-btn" type="primary" danger shape="circle" @click.stop="removeImage">
                    <delete-outlined />
                  </a-button>
                </div>
                <div class="image-info-overlay">
                  <div class="image-format">
                    {{ getImageFormat() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- 图片信息设置 -->
      <!-- 修改图片信息设置部分，添加分类选择 -->
      <div class="image-settings" v-if="previewUrl" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300 } }">
        <div class="settings-header">
          <h3 class="settings-title">图片信息</h3>
          <p class="settings-subtitle">添加详细信息让您的图片更易于管理和查找</p>
        </div>

        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="图片名称" name="imageName" required>
                <a-input
                    v-model:value="imageName"
                    placeholder="请输入图片名称"
                    class="input-field"
                >
                  <template #prefix>
                    <edit-outlined />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="图片描述" name="imageDescription">
                <a-textarea
                    v-model:value="imageDescription"
                    placeholder="请输入图片描述（可选）"
                    :rows="3"
                    class="input-field"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 添加分类选择 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="分类" name="imageCategory" required>
                <a-select
                    v-model:value="imageCategory"
                    placeholder="请选择一个分类"
                    class="input-field category-select"
                >
                  <a-select-option v-for="category in categoryOptions" :key="category.value" :value="category.value">
                    {{ category.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 标签选择 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="标签" name="imageTags">
                <a-select
                    v-model:value="imageTags"
                    mode="tags"
                    placeholder="请输入标签，回车确认"
                    class="input-field tag-select"
                >
                  <a-select-option v-for="tag in suggestedTags" :key="tag" :value="tag">
                    {{ tag }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 系统推荐区域 -->
    <div class="recommendations" v-if="previewUrl" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }">
      <a-card :bordered="false" class="recommendation-card">
        <template #title>
          <div class="recommendation-header">
            <bulb-outlined class="recommendation-icon" />
            <span>智能推荐</span>
          </div>
        </template>
        <a-row :gutter="16">
          <a-col :xs="24" :md="8">
            <div class="recommendation-item">
              <h4>推荐标签</h4>
              <div class="recommendation-tags">
                <a-tag
                    v-for="tag in aiSuggestedTags"
                    :key="tag"
                    class="ai-tag"
                    @click="addTag(tag)"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :md="8">
            <div class="recommendation-item">
              <h4>相关图片</h4>
              <div class="related-images">
                <div v-for="(img, index) in relatedImages" :key="index" class="related-image-item">
                  <img :src="img.thumbnail" alt="相关图片" class="related-thumbnail" />
                  <div class="related-image-title">{{ img.title }}</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :md="8">
            <div class="recommendation-item">
              <h4>内容识别</h4>
              <div class="ai-analysis">
                <p class="analysis-result"><scan-outlined /> {{ aiAnalysisResult }}</p>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 提交按钮 -->
    <div class="action-buttons" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
      <a-button @click="handleCancel" class="cancel-btn">取消</a-button>
      <a-button
          type="primary"
          :disabled="!canSubmit"
          :loading="uploading"
          @click="handleSubmit"
          class="submit-btn"
      >
        保存图片
      </a-button>
    </div>

    <!-- 图片预览弹窗 -->
    <a-modal v-model:visible="previewModalVisible" :footer="null" class="preview-modal" width="auto">
      <img :src="previewUrl" alt="图片预览" class="preview-modal-image" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import {
  CloudUploadOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
  FormOutlined,
  CheckCircleOutlined,
  EditOutlined,
  BulbOutlined,
  ScanOutlined,
  LockOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

// 路由和用户状态
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 上传相关状态
const activeTab = ref('local');
const fileList = ref<any[]>([]);
const previewUrl = ref('');
const imageName = ref('');
const imageDescription = ref('');
const imageTags = ref<string[]>([]);
const imageUrl = ref('');
const imagePermission = ref('private');
const uploading = ref(false);
const uploadedFile = ref<File | null>(null);
const currentStep = ref(1);
const previewModalVisible = ref(false);
const imageCategory = ref('');
const categoryOptions = [
  { label: '个人收藏', value: 'personal' },
  { label: '学习资料', value: 'study' },
  { label: '工作项目', value: 'work' },
  { label: '设计灵感', value: 'design' },
  { label: '参考图', value: 'reference' },
  { label: '其他', value: 'other' }
];

// 推荐标签
const suggestedTags = [
  '知识笔记', '学习资料', '参考图', '教程', '设计灵感',
  '重要文档', '工作资料', '个人收藏', '项目素材'
];

// AI推荐标签 - 根据上传图片动态生成
const aiSuggestedTags = ref(['教程资料', '技术文档', '前端开发', 'Vue框架', 'UI设计']);

// AI内容识别结果
const aiAnalysisResult = ref('图片可能包含网页或应用界面设计内容');

// URL示例
const urlExamples = [
  {
    title: '风景图示例',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&h=100&fit=crop',
    format: 'JPG'
  },
  {
    title: '设计图示例',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
    format: 'PNG'
  },
  {
    title: '图标示例',
    url: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png',
    thumbnail: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png',
    format: 'PNG'
  }
];

// 相关图片
const relatedImages = [
  {
    title: '相似图片 1',
    thumbnail: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=100&h=100&fit=crop'
  },
  {
    title: '相似图片 2',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop'
  },
  {
    title: '相似图片 3',
    thumbnail: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=100&h=100&fit=crop'
  }
];

// 计算属性：是否可以提交
const canSubmit = computed(() => {
  return previewUrl.value && imageName.value.trim() !== '';
});

// 使用示例URL
const useExampleUrl = (example :any) => {
  imageUrl.value = example.url;
  fetchImageFromUrl();
};

// 监听文件变化，自动设置图片名称
watch(fileList, (newFileList) => {
  if (newFileList.length > 0 && newFileList[0].name && !imageName.value) {
    // 从文件名中提取名称（去除扩展名）
    const fileName = newFileList[0].name;
    const dotIndex = fileName.lastIndexOf('.');
    imageName.value = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
  }

  // 如果有文件，更新当前步骤
  if (newFileList.length > 0) {
    currentStep.value = 2;
  }
}, { deep: true });

// 监听预览URL变化，更新步骤
watch(previewUrl, (newUrl) => {
  if (newUrl) {
    currentStep.value = 2;
  } else {
    currentStep.value = 1;
  }
});

// 监听表单完成状态，更新步骤
watch([imageName, imageTags], ([newName, newTags]) => {
  if (previewUrl.value && newName && newTags.length > 0) {
    currentStep.value = 3;
  } else if (previewUrl.value) {
    currentStep.value = 2;
  }
}, { deep: true });

// 图片上传前验证
const beforeUpload = (file: File) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件！');
    return false;
  }

  // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
  const isLessThan10M = file.size / 1024 / 1024 < 10;
  if (!isLessThan10M) {
    message.error('图片必须小于 10MB！');
    return false;
  }

  return isImage && isLessThan10M;
};

// 处理本地上传
const handleLocalUpload = ({ file }: any) => {
  uploadedFile.value = file;

  // 创建预览URL
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
    // 模拟AI分析
    simulateAiAnalysis();
  };
};

// 处理上传状态变化
const handleUploadChange = (info: any) => {
  fileList.value = info.fileList.slice(-1); // 只保留最后上传的一个文件
};

// 从URL获取图片
const fetchImageFromUrl = async () => {
  if (!imageUrl.value) {
    message.warning('请输入图片链接');
    return;
  }

  try {
    // 验证URL是否为图片
    const isValidImageUrl = /\.(jpeg|jpg|gif|png|webp|bmp)(\?.*)?$/i.test(imageUrl.value);
    if (!isValidImageUrl) {
      message.warning('请输入有效的图片链接，支持 jpg、png、gif 等格式');
      return;
    }

    previewUrl.value = imageUrl.value;

    // 从URL中提取文件名作为默认图片名称
    if (!imageName.value) {
      const urlParts = imageUrl.value.split('/');
      let fileName = urlParts[urlParts.length - 1];
      // 移除查询参数
      fileName = fileName.split('?')[0];
      // 移除扩展名
      const dotIndex = fileName.lastIndexOf('.');
      imageName.value = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
    }

    message.success('成功获取图片');

    // 模拟AI分析
    simulateAiAnalysis();
  } catch (error) {
    message.error('获取图片失败，请检查链接是否有效');
    console.error('获取图片失败:', error);
  }
};

// 模拟AI分析
const simulateAiAnalysis = () => {
  // 模拟加载
  setTimeout(() => {
    // 随机生成一些标签建议
    const possibleTags = [
      '网页设计', 'UI/UX', '应用界面', '用户界面',
      '前端开发', 'Vue组件', '设计模式', '交互设计',
      '响应式布局', '移动应用', '界面原型', '设计稿'
    ];

    // 随机选择3-5个标签
    const count = Math.floor(Math.random() * 3) + 3;
    const selectedTags = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * possibleTags.length);
      selectedTags.push(possibleTags[randomIndex]);
      possibleTags.splice(randomIndex, 1);
    }

    aiSuggestedTags.value = selectedTags;

    // 随机选择一个分析结果
    const possibleResults = [
      '图片可能包含网页或应用界面设计内容',
      '检测到UI设计元素，可能是一个应用原型',
      '识别为前端界面设计图，包含多个交互组件',
      '检测到这可能是一个Vue应用的页面截图'
    ];

    const randomResultIndex = Math.floor(Math.random() * possibleResults.length);
    aiAnalysisResult.value = possibleResults[randomResultIndex];
  }, 800);
};

// 添加AI推荐的标签
const addTag = (tag: string) => {
  if (!imageTags.value.includes(tag)) {
    imageTags.value.push(tag);
    message.success(`已添加标签: ${tag}`);
  }
};

// 移除图片
const removeImage = () => {
  previewUrl.value = '';
  fileList.value = [];
  uploadedFile.value = null;

  // 如果是在URL标签页，也清空URL输入
  if (activeTab.value === 'url') {
    imageUrl.value = '';
  }

  // 重置步骤
  currentStep.value = 1;
};

// 放大预览图片
const zoomImage = () => {
  previewModalVisible.value = true;
};

// 获取图片格式
const getImageFormat = () => {
  if (!previewUrl.value) return '';

  if (activeTab.value === 'local' && uploadedFile.value) {
    const type = uploadedFile.value.type;
    return type.split('/')[1].toUpperCase();
  } else {
    const url = previewUrl.value;
    const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    return match ? match[1].toUpperCase() : '未知格式';
  }
};

// 处理提交
// 修改处理提交函数，添加分类处理
const handleSubmit = async () => {
  if (!previewUrl.value) {
    message.warning('请先上传或提供图片');
    return;
  }

  if (!imageName.value.trim()) {
    message.warning('请输入图片名称');
    return;
  }

  if (!imageCategory.value) {
    message.warning('请选择图片分类');
    return;
  }

  uploading.value = true;

  try {
    // 模拟上传API调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 创建图片对象
    const imageData = {
      id: Date.now().toString(),
      name: imageName.value,
      description: imageDescription.value,
      category: imageCategory.value, // 添加分类
      tags: imageTags.value,
      url: previewUrl.value,
      uploadType: activeTab.value,
      permission: imagePermission.value,
      uploadTime: new Date().toISOString(),
      userId: userStore.userInfo?.id
    };

    console.log('上传图片数据:', imageData);

    // 成功提示
    message.success('图片上传成功！');

    // 重置表单
    previewUrl.value = '';
    imageName.value = '';
    imageDescription.value = '';
    imageCategory.value = ''; // 重置分类
    imageTags.value = [];
    fileList.value = [];
    imageUrl.value = '';
    uploadedFile.value = null;
    currentStep.value = 1;

    // 导航到图片列表或详情页
    router.push('/space');
  } catch (error) {
    message.error('图片上传失败，请稍后重试');
    console.error('上传失败:', error);
  } finally {
    uploading.value = false;
  }
};

// 取消上传
const handleCancel = () => {
  router.back();
};

onMounted(() => {
  // 修复导航高亮问题 - 找到HeaderBar组件中的导航项
  const updateNavActiveState = () => {
    // 发送一个自定义事件，通知HeaderBar更新导航激活状态
    window.dispatchEvent(new CustomEvent('update-nav-active', {
      detail: { path: route.path }
    }));
  };

  // 延迟执行，确保HeaderBar组件已经挂载
  setTimeout(updateNavActiveState, 100);
});
</script>

<style scoped>
.create-image-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 步骤流程样式 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.step {
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background-color: #4F46E5;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.3);
}

.step-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
}

.step-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.step-divider {
  flex-grow: 0;
  width: 60px;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 8px;
}

.upload-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
}

.upload-tabs :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #4F46E5 !important;
  font-weight: 500;
}

.upload-tabs :deep(.ant-tabs-ink-bar) {
  background-color: #4F46E5 !important;
}
.upload-area, .url-upload-area {
  padding: 10px 0;
}

/* 自定义上传组件样式 */
.custom-uploader :deep(.ant-upload-drag) {
  border-color: #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-uploader :deep(.ant-upload-drag:hover) {
  border-color: #4F46E5;
  background: rgba(79, 70, 229, 0.02);
}

.custom-uploader :deep(.ant-upload-drag-container) {
  padding: 24px;
}

/* 上传内容区域 */
.upload-content {
  padding: 32px;
  text-align: center;
}

.upload-icon-wrapper {
  background: rgba(79, 70, 229, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.upload-icon {
  font-size: 40px;
  color: #4F46E5;
}

.upload-icon-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

/* 上传建议区域 */
.upload-suggestions {
  margin-top: 24px;
  background: #f3f4f7;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  border-left: 3px solid #4F46E5;
}

.upload-suggestions h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 15px;
  color: #4F46E5;
}

.upload-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.upload-suggestions li {
  margin-bottom: 6px;
  font-size: 14px;
  color: #4b5563;
}

/* 预览容器 */
.preview-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f3f4f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-actions {
  opacity: 1;
}

.preview-action-btn {
  background: #4F46E5 !important;
  border-color: #4F46E5 !important;
}

.preview-action-btn:hover {
  background: #4338ca !important;
  border-color: #4338ca !important;
  transform: scale(1.1);
}

.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .image-info-overlay {
  opacity: 1;
}

.image-format {
  font-size: 14px;
  font-weight: 500;
}

/* 修改链接上传区域样式 */
.url-input {
  height: 44px;
  border-radius: 8px;
}

/* 修改链接输入框的样式 */
.url-input :deep(.ant-input-affix-wrapper) {
  border-color: #e5e7eb;
  transition: all 0.3s ease;
}

.url-input :deep(.ant-input-affix-wrapper:hover) {
  border-color: #4F46E5;
}

.url-input :deep(.ant-input-affix-wrapper:focus),
.url-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #4F46E5 !important;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
}

/* 修改标签切换样式 */
.upload-tabs :deep(.ant-tabs-tab) {
  color: #6b7280;
  transition: all 0.3s ease;
}

.upload-tabs :deep(.ant-tabs-tab:hover) {
  color: #4F46E5;
}

.upload-tabs :deep(.ant-tabs-tab-active) {
  color: #4F46E5;
}

/* 添加分类选择器样式 */
.category-select :deep(.ant-select-selector) {
  border-radius: 8px !important;
}

.category-select :deep(.ant-select-selector:hover) {
  border-color: #4F46E5 !important;
}

.category-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: #4F46E5 !important;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
}

/* 标签选择器的项目样式 */
.tag-select :deep(.ant-select-selection-item) {
  background-color: #4F46E5 !important;
  color: white !important;
  border-color: #4F46E5 !important;
  border-radius: 4px !important;
}

/* 修改链接示例悬停样式 */
.example-link {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  width: calc(33.333% - 8px);
}

.example-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #4F46E5;
  color: #4F46E5;
}

/* 链接文字颜色样式 */
a {
  color: #4F46E5;
  transition: all 0.3s ease;
}

a:hover {
  color: #4338ca;
  text-decoration: none;
}

/* URL示例 */
.url-examples {
  margin-top: 24px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.url-examples h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1f2937;
}

.example-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.example-link {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  width: calc(33.333% - 8px);
}

.example-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #4F46E5;
}

.example-icon {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 8px;
  flex-shrink: 0;
}

.example-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.example-info {
  flex-grow: 1;
}

.example-title {
  font-size: 14px;
  margin: 0 0 4px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* URL预览区域 */
.url-preview-wrapper {
  margin-top: 24px;
}

.url-preview-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f3f4f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 图片信息设置区域 */
.image-settings {
  padding-top: 24px;
  margin-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.settings-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.input-field {
  border-radius: 8px;
}

.input-field:hover {
  border-color: #4F46E5;
}

.input-field:focus {
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

/* 标签选择器样式 */
.tag-select :deep(.ant-select-selection-item) {
  background-color: #4F46E5 !important;
  color: white !important;
  border-color: #4F46E5 !important;
}

/* 权限选择组 */
.permission-group {
  width: 100%;
  display: flex;
}

.permission-option {
  flex: 1;
  text-align: center;
}

.permission-option :deep(.ant-radio-button-wrapper-checked) {
  background: #4F46E5 !important;
  border-color: #4F46E5 !important;
  color: white !important;
}

.permission-option :deep(.ant-radio-button-wrapper-checked::before) {
  background-color: #4F46E5 !important;
}

.permission-option :deep(.ant-radio-button-wrapper:hover) {
  color: #4F46E5 !important;
}

.permission-option :deep(.ant-radio-button-wrapper-checked:hover) {
  color: white !important;
}

/* 智能推荐区域 */
.recommendations {
  margin-bottom: 30px;
}

.recommendation-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.recommendation-header {
  display: flex;
  align-items: center;
}

.recommendation-icon {
  color: #4F46E5;
  margin-right: 8px;
  font-size: 20px;
}

.recommendation-item {
  margin-bottom: 20px;
}

.recommendation-item h4 {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 12px;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-tag {
  cursor: pointer;
  background: rgba(79, 70, 229, 0.1);
  color: #4F46E5;
  border-color: rgba(79, 70, 229, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.ai-tag:hover {
  transform: translateY(-2px);
  background: rgba(79, 70, 229, 0.2);
  box-shadow: 0 3px 6px rgba(79, 70, 229, 0.1);
}

.related-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.related-image-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  height: 70px;
  transition: all 0.3s ease;
}

.related-image-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.related-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-image-title {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-analysis {
  background: #f3f4f7;
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid #4F46E5;
}

.analysis-result {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  border-radius: 8px;
}

.submit-btn {
  border-radius: 8px;
  background: #4F46E5;
  border-color: #4F46E5;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.2);
  transition: all 0.3s ease;
}

.submit-btn:not(:disabled):hover {
  background: #4338ca;
  border-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.submit-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

/* 图片预览弹窗 */
.preview-modal :deep(.ant-modal-content) {
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 12px;
  overflow: hidden;
}

.preview-modal-image {
  max-width: 90vw;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-image-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .steps-container {
    flex-direction: column;
    padding: 12px;
  }

  .step {
    margin-bottom: 16px;
  }

  .step-divider {
    width: 2px;
    height: 20px;
    margin: 8px 0;
  }

  .preview-container, .url-preview-container {
    height: 220px;
  }

  .example-link {
    width: 100%;
  }

  .related-images {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 深色模式适配 */
:global([data-theme="dark"]) .page-title {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .page-description {
  color: #9ca3af;
}

:global([data-theme="dark"]) .steps-container {
  background: #1a1e24;
}

:global([data-theme="dark"]) .step-icon {
  background-color: #374151;
  color: #9ca3af;
}

:global([data-theme="dark"]) .step.active .step-icon {
  background-color: #4F46E5;
  color: white;
}

:global([data-theme="dark"]) .step-content h3 {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .step-content p {
  color: #9ca3af;
}

:global([data-theme="dark"]) .step-divider {
  background-color: #374151;
}

:global([data-theme="dark"]) .upload-card {
  background-color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:global([data-theme="dark"]) .custom-uploader :deep(.ant-upload-drag) {
  background: #2d3748;
  border-color: #4b5563;
}

:global([data-theme="dark"]) .custom-uploader :deep(.ant-upload-drag:hover) {
  border-color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
}

:global([data-theme="dark"]) .upload-icon-wrapper {
  background: rgba(99, 102, 241, 0.2);
}

:global([data-theme="dark"]) .upload-icon {
  color: #6366F1;
}

:global([data-theme="dark"]) .upload-text {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .upload-hint {
  color: #9ca3af;
}

:global([data-theme="dark"]) .upload-suggestions {
  background: #2d3748;
  border-left-color: #6366F1;
}

:global([data-theme="dark"]) .upload-suggestions h4 {
  color: #818cf8;
}

:global([data-theme="dark"]) .upload-suggestions li {
  color: #d1d5db;
}

:global([data-theme="dark"]) .preview-container,
:global([data-theme="dark"]) .url-preview-container {
  background-color: #374151;
}

:global([data-theme="dark"]) .settings-title {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .settings-subtitle {
  color: #9ca3af;
}

:global([data-theme="dark"]) .image-settings {
  border-top-color: #374151;
}

:global([data-theme="dark"]) .url-examples {
  background: #2d3748;
}

:global([data-theme="dark"]) .url-examples h4 {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .example-link {
  background: #1f2937;
  border-color: #4b5563;
}

:global([data-theme="dark"]) .example-link:hover {
  border-color: #6366F1;
}

:global([data-theme="dark"]) .example-title {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .ai-analysis {
  background: #2d3748;
  border-left-color: #6366F1;
}

:global([data-theme="dark"]) .analysis-result {
  color: #d1d5db;
}

:global([data-theme="dark"]) .ai-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

:global([data-theme="dark"]) .ai-tag:hover {
  background: rgba(99, 102, 241, 0.3);
}

/* 添加动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.upload-card {
  animation: slideInUp 0.5s ease-out;
}
</style>