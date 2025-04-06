<!-- pages/picture/CreatePicture.vue -->
<template>
  <div class="create-picture-page">
    <!-- 页面标题区域 -->
    <div class="enhanced-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <h1 class="main-title">
              <picture-outlined />
              创建图片
            </h1>
            <p class="page-desc">上传您的图片作品，与更多人分享您的创意和视角</p>
          </div>
          <div class="statistics-container">
            <div class="stat-item">
              <upload-outlined />
              <span>今日上传: <strong>253</strong></span>
            </div>
            <div class="stat-item">
              <eye-outlined />
              <span>昨日浏览: <strong>1.2万</strong></span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="inspiration-container">
            <div class="inspiration-text">今日灵感</div>
            <div class="inspiration-quote">"摄影不只是记录现实，更是发现美的过程"</div>
            <div class="inspiration-author">— 安塞尔·亚当斯</div>
          </div>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div class="upload-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">
              <upload-outlined />
            </div>
            <div class="step-text">上传图片</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ 'active': localPreviewUrl || linkPreviewUrl }">
            <div class="step-icon">
              <form-outlined />
            </div>
            <div class="step-text">填写信息</div>
          </div>
          <div class="step-divider"></div>
          <div class="step">
            <div class="step-icon">
              <check-circle-outlined />
            </div>
            <div class="step-text">发布成功</div>
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

    <!-- 上传区域 -->
    <a-card class="upload-card" :bordered="false">
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- 本地上传选项卡 -->
        <a-tab-pane key="local" tab="本地上传">
          <div class="upload-area" v-if="!localPreviewUrl">
            <a-upload-dragger
                name="file"
                :multiple="false"
                :before-upload="beforeLocalUpload"
                :show-upload-list="false"
                accept="image/*"
            >
              <div class="upload-content">
                <p class="upload-icon">
                  <upload-outlined />
                </p>
                <p class="upload-text">点击或拖拽图片至此区域上传</p>
                <p class="upload-hint">支持 JPG、PNG、WebP 等常见图片格式，文件大小不超过 10MB</p>
              </div>
            </a-upload-dragger>
          </div>
          <div class="preview-area" v-else>
            <div class="preview-image-wrapper">
              <img :src="localPreviewUrl" alt="预览图" class="preview-image" />
              <div class="preview-actions">
                <a-button type="primary" @click="reuploadLocal">重新上传</a-button>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 链接上传选项卡 -->
        <a-tab-pane key="link" tab="链接上传">
          <div class="link-upload-area" v-if="!linkPreviewUrl">
            <a-form :model="linkForm" layout="vertical">
              <a-form-item
                  label="图片链接"
                  name="imageUrl"
                  :rules="[{ required: true, message: '请输入图片链接' }]">
                <a-input
                    v-model:value="linkForm.imageUrl"
                    placeholder="输入图片URL链接，如 https://example.com/image.jpg"
                    class="link-input"
                    allow-clear
                >
                  <template #addonAfter v-if="linkForm.imageUrl">
                    <a-button type="primary" size="small" @click="previewLink">
                      预览
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
            </a-form>
          </div>
          <div class="preview-area" v-else>
            <div class="preview-image-wrapper">
              <img :src="linkPreviewUrl" alt="预览图" class="preview-image" />
              <div class="preview-actions">
                <a-button type="primary" @click="reuploadLink">重新上传</a-button>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 表单区域 - 仅当有预览图时显示 -->
    <a-card
        v-if="localPreviewUrl || linkPreviewUrl"
        class="form-card"
        :bordered="false"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
    >
      <template #title>
        <div class="form-card-title">
          <form-outlined />
          填写图片信息
        </div>
      </template>

      <a-form
          :model="pictureForm"
          layout="vertical"
          :rules="formRules"
          ref="pictureFormRef"
      >
        <!-- 基础信息区 -->
        <div class="form-section">
          <h3 class="section-title">基础信息</h3>

          <!-- 图片名称 -->
          <a-form-item label="图片名称" name="title" required>
            <a-input
                v-model:value="pictureForm.title"
                placeholder="为您的图片起个名称"
                :maxLength="50"
                show-count
                allow-clear
            />
          </a-form-item>

          <!-- 图片简介 -->
          <a-form-item label="图片简介" name="description">
            <a-textarea
                v-model:value="pictureForm.description"
                placeholder="描述一下您的图片内容、创作灵感或想法..."
                :rows="4"
                :maxLength="500"
                show-count
                allow-clear
            />
          </a-form-item>

          <!-- 一行两列布局 -->
          <a-row :gutter="16">
            <a-col :span="12">
              <!-- 图片分类 -->
              <a-form-item label="图片分类" name="category" required>
                <a-select
                    v-model:value="pictureForm.category"
                    placeholder="选择分类"
                    :options="categoryOptions"
                    :show-search="true"
                    allow-clear
                >
                  <template #suffixIcon><appstore-outlined /></template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <!-- 图片标签 -->
              <a-form-item label="图片标签" name="tags">
                <a-select
                    v-model:value="pictureForm.tags"
                    mode="multiple"
                    placeholder="选择或输入标签"
                    :options="tagOptions"
                    :max-tag-count="3"
                    :max-tag-text-length="10"
                    allow-clear
                    :tokenSeparators="[',']"
                >
                  <template #suffixIcon><tags-outlined /></template>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 高级选项区域 -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">高级选项</h3>
            <a-switch v-model:checked="showAdvanced" />
          </div>

          <div v-show="showAdvanced" class="advanced-options">
            <a-row :gutter="16">
              <a-col :span="12">
                <!-- 拍摄设备 -->
                <a-form-item label="拍摄设备" name="device">
                  <a-input
                      v-model:value="pictureForm.device"
                      placeholder="相机型号或手机型号等"
                      allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <!-- 拍摄地点 -->
                <a-form-item label="拍摄地点" name="location">
                  <a-input
                      v-model:value="pictureForm.location"
                      placeholder="拍摄的位置或地点"
                      allow-clear
                  >
                    <template #prefix>
                      <environment-outlined />
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <!-- 拍摄日期 -->
                <a-form-item label="拍摄日期" name="shootDate">
                  <a-date-picker
                      v-model:value="pictureForm.shootDate"
                      style="width: 100%"
                      placeholder="选择拍摄日期"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <!-- 色彩模式 -->
                <a-form-item label="色彩模式" name="colorMode">
                  <a-select
                      v-model:value="pictureForm.colorMode"
                      placeholder="选择色彩模式"
                      :options="colorModeOptions"
                      allow-clear
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <!-- 故事背景 -->
            <a-form-item label="故事背景" name="story">
              <a-textarea
                  v-model:value="pictureForm.story"
                  placeholder="分享这张图片背后的故事、拍摄过程或创作灵感..."
                  :rows="4"
                  :maxLength="1000"
                  show-count
                  allow-clear
              />
            </a-form-item>
          </div>
        </div>

        <!-- 隐私与权限区域 -->
        <div class="form-section">
          <h3 class="section-title">隐私与权限</h3>


          <!-- 水印设置 -->
          <a-form-item label="水印设置" name="watermark">
            <div class="watermark-option">
              <a-switch v-model:checked="pictureForm.enableWatermark" />
              <span class="option-label">添加水印</span>
            </div>
            <div v-if="pictureForm.enableWatermark" class="watermark-settings">
              <a-input
                  v-model:value="pictureForm.watermarkText"
                  placeholder="水印文字内容（如：您的用户名或网站名）"
                  allow-clear
              />
            </div>
          </a-form-item>
        </div>

        <!-- 提交按钮区域 -->
        <div class="form-actions">
          <a-button @click="resetForm">取消</a-button>
          <a-button type="primary" @click="submitForm" :loading="submitting">
            发布图片
          </a-button>
        </div>
      </a-form>
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
  FormOutlined,
  AppstoreOutlined,
  TagsOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined,
  CopyrightOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

// 激活的标签页
const activeTabKey = ref('local');

// 图片预览URL
const localPreviewUrl = ref('');
const linkPreviewUrl = ref('');

// 链接表单
const linkForm = reactive({
  imageUrl: ''
});


// 图片表单
const pictureFormRef = ref(null);
const pictureForm = reactive({
  title: '',
  description: '',
  category: undefined,
  tags: [],
  device: '',
  location: '',
  shootDate: null,
  colorMode: undefined,
  story: '',
  visibility: 'public',
  copyright: 'cc-by',
  enableWatermark: false,
  watermarkText: ''
});

// 显示高级选项
const showAdvanced = ref(false);

// 提交状态
const submitting = ref(false);

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入图片名称', trigger: 'blur' },
    { min: 2, max: 50, message: '图片名称长度为2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ]
};

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

// 色彩模式选项
const colorModeOptions = [
  { value: 'color', label: '彩色' },
  { value: 'bw', label: '黑白' },
  { value: 'sepia', label: '棕褐色' },
  { value: 'vintage', label: '复古' }
];

// 版权选项
const copyrightOptions = [
  { value: 'cc-by', label: 'CC BY - 署名' },
  { value: 'cc-by-sa', label: 'CC BY-SA - 署名-相同方式共享' },
  { value: 'cc-by-nd', label: 'CC BY-ND - 署名-禁止演绎' },
  { value: 'cc-by-nc', label: 'CC BY-NC - 署名-非商业性使用' },
  { value: 'cc-by-nc-sa', label: 'CC BY-NC-SA - 署名-非商业性使用-相同方式共享' },
  { value: 'cc-by-nc-nd', label: 'CC BY-NC-ND - 署名-非商业性使用-禁止演绎' },
  { value: 'all-rights-reserved', label: '保留所有权利' }
];

// 本地上传图片前处理
const beforeLocalUpload = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  // 检查文件大小
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('图片大小不能超过10MB!');
    return false;
  }

  // 预览图片
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    localPreviewUrl.value = reader.result;
  };

  // 阻止自动上传
  return false;
};

// 预览链接图片
const previewLink = () => {
  if (!linkForm.imageUrl) {
    message.error('请输入图片链接');
    return;
  }

  // 简单验证URL格式
  const isValidUrl = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}(\/[^\s]*)?$/.test(linkForm.imageUrl);
  if (!isValidUrl) {
    message.error('请输入有效的图片链接');
    return;
  }

  // 设置预览URL
  linkPreviewUrl.value = linkForm.imageUrl;

  // 设置默认标题（如果未设置）
  if (!pictureForm.title) {
    const filename = linkForm.imageUrl.split('/').pop().split('?')[0];
    pictureForm.title = filename;
  }
};

// 重新上传本地图片
const reuploadLocal = () => {
  localPreviewUrl.value = '';
};

// 重新上传链接图片
const reuploadLink = () => {
  linkPreviewUrl.value = '';
  linkForm.imageUrl = '';
};

// 重置表单
const resetForm = () => {
  // 重置图片预览
  localPreviewUrl.value = '';
  linkPreviewUrl.value = '';
  linkForm.imageUrl = '';

  // 重置表单字段
  pictureFormRef.value?.resetFields();

  // 重置高级选项
  showAdvanced.value = false;

  // 重置其他字段
  Object.assign(pictureForm, {
    title: '',
    description: '',
    category: undefined,
    tags: [],
    device: '',
    location: '',
    shootDate: null,
    colorMode: undefined,
    story: '',
    visibility: 'public',
    copyright: 'cc-by',
    enableWatermark: false,
    watermarkText: ''
  });

  message.info('表单已重置');
};

// 提交表单
const submitForm = async () => {
  // 表单验证
  try {
    await pictureFormRef.value.validate();

    // 检查是否有图片
    if (!localPreviewUrl.value && !linkPreviewUrl.value) {
      message.error('请上传图片');
      return;
    }

    // 设置提交中状态
    submitting.value = true;

    // 构建提交数据
    const formData = {
      ...pictureForm,
      imageSource: localPreviewUrl.value ? 'local' : 'link',
      imageUrl: localPreviewUrl.value || linkPreviewUrl.value
    };

    // 模拟API提交
    console.log('提交的表单数据:', formData);

    // 模拟提交延迟
    setTimeout(() => {
      // 提交完成
      submitting.value = false;

      // 提示成功
      message.success('图片发布成功');

      // 跳转到图片详情页面
      router.push('/picture/detail/123');
    }, 1500);

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单是否填写正确');
  }
};
</script>

<style scoped>
.create-picture-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 增强版页面头部样式 */
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

/* 响应式调整 */
@media (max-width: 768px) {
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
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .enhanced-page-header {
    background: linear-gradient(135deg, #3a59c7 0%, #5d3eae 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
}

/* 卡片样式 */
.upload-card,
.form-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}

.form-card {
  padding: 0;
}

.form-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

/* 上传区域样式 */
.upload-area {
  padding: 20px 0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.upload-icon {
  font-size: 48px;
  color: #6366f1;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #262626;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
}

/* 预览区域样式 */
.preview-area {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.preview-image-wrapper {
  position: relative;
  max-width: 500px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  display: block;
}

.preview-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-image-wrapper:hover .preview-actions {
  opacity: 1;
}

/* 链接上传区域 */
.link-upload-area {
  padding: 40px 20px;
}

.link-input {
  font-size: 14px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 24px;
  padding: 0 24px;
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
  margin: 0 0 16px 0;
  font-weight: 500;
}

.advanced-options {
  background-color: #f9f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

/* 水印选项 */
.watermark-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.option-label {
  color: #262626;
}

.watermark-settings {
  margin-top: 12px;
}

/* 按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .create-picture-page {
    padding: 16px 12px;
  }

  .page-title h1 {
    font-size: 20px;
  }

  .upload-content {
    padding: 30px 0;
  }

  .upload-icon {
    font-size: 40px;
  }

  .preview-image-wrapper {
    max-width: 100%;
  }

  .preview-actions {
    opacity: 1;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .create-picture-page {
    background-color: #121212;
  }

  .page-title h1 {
    color: #e0e0e0;
  }

  .page-desc {
    color: #a6a6a6;
  }

  .upload-card,
  .form-card {
    background-color: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .upload-text {
    color: #e0e0e0;
  }

  .upload-hint {
    color: #a6a6a6;
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

  .form-actions {
    border-top-color: #333;
  }
}

</style>