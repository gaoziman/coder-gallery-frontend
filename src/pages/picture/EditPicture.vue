<!-- pages/picture/EditPicture.vue -->
<template>
  <div class="edit-picture-page">
    <!-- 页面标题区域 -->
    <div class="enhanced-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <h1 class="main-title">
              <edit-outlined />
              编辑图片
            </h1>
            <p class="page-desc">您可以在这里修改图片信息，更新您的创作细节</p>
          </div>
          <div class="picture-info-container">
            <div class="info-item">
              <eye-outlined />
              <span>已获浏览: <strong>{{ pictureStats.views }}</strong></span>
            </div>
            <div class="info-item">
              <like-outlined />
              <span>获得点赞: <strong>{{ pictureStats.likes }}</strong></span>
            </div>
            <div class="info-item">
              <calendar-outlined />
              <span>发布于: <strong>{{ formatDate(pictureData.publishDate) }}</strong></span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="preview-container">
            <div class="preview-label">当前图片</div>
            <div class="thumbnail-wrapper">
              <img :src="pictureData.imageUrl" alt="当前图片预览" class="thumbnail-image" />
              <div class="image-actions">
                <a-button type="primary" size="small" @click="showImagePreview">查看大图</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度指示器，简化为只有编辑和保存两个步骤 -->
      <div class="edit-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">
              <form-outlined />
            </div>
            <div class="step-text">编辑信息</div>
          </div>
          <div class="step-divider"></div>
          <div class="step">
            <div class="step-icon">
              <check-circle-outlined />
            </div>
            <div class="step-text">保存更新</div>
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


    <div class="content-cards-container">
    <!-- 图片详细信息卡片 -->
    <image-detail-card
        :imageData="pictureData"
        :imageStats="pictureStats"
        @preview="showImagePreview"
    />


    <!-- 表单区域 -->
    <a-card
        class="form-card"
        :bordered="false"
    >
      <template #title>
        <div class="form-card-title">
          <form-outlined />
          编辑图片信息
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

          <!-- 可见性设置 -->
          <a-form-item label="可见性" name="visibility">
            <a-radio-group v-model:value="pictureForm.visibility" button-style="solid">
              <a-radio-button value="public">
                <template #icon><global-outlined /></template>
                公开
              </a-radio-button>
              <a-radio-button value="friends">
                <template #icon><team-outlined /></template>
                好友可见
              </a-radio-button>
              <a-radio-button value="private">
                <template #icon><lock-outlined /></template>
                仅自己可见
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <!-- 版权设置 -->
          <a-form-item label="版权设置" name="copyright">
            <a-select
                v-model:value="pictureForm.copyright"
                placeholder="选择版权类型"
                :options="copyrightOptions"
                style="max-width: 500px"
            >
              <template #suffixIcon><copyright-outlined /></template>
            </a-select>
          </a-form-item>

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

        <!-- 修改记录 -->
        <div class="form-section">
          <h3 class="section-title">修改记录</h3>
          <div class="edit-history">
            <a-timeline>
              <a-timeline-item v-for="(record, index) in editHistory" :key="index">
                <template #dot>
                  <history-outlined style="fontSize: 16px" />
                </template>
                <div class="history-item">
                  <div class="history-time">{{ formatDate(record.date) }}</div>
                  <div class="history-content">{{ record.description }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>

        <!-- 提交按钮区域 -->
        <div class="form-actions">
          <a-popconfirm
              title="确定要取消编辑吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="cancelEdit"
          >
            <a-button>取消</a-button>
          </a-popconfirm>
          <a-button type="primary" @click="submitForm" :loading="submitting">
            保存更新
          </a-button>
        </div>
      </a-form>
    </a-card>

    </div>

    <!-- 大图预览模态框 -->
    <a-modal v-model:visible="previewVisible" :footer="null" width="800px" centered>
      <img :src="pictureData.imageUrl" alt="图片预览" style="width: 100%;" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
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
  EnvironmentOutlined,
  EyeOutlined,
  LikeOutlined,
  StarOutlined,
  CommentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  ColumnWidthOutlined,
  FileOutlined,
  ClockCircleOutlined,
  EditOutlined,
  HistoryOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue';
import ImageDetailCard from "@/components/picture/ImageDetailCard.vue";

const router = useRouter();
const route = useRoute();

// 图片ID从路由参数获取
const pictureId = ref(route.params.id || '123');

// 图片信息预览模态框
const previewVisible = ref(false);

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

// 模拟从API获取的图片数据
const pictureData = reactive({
  id: pictureId.value,
  imageUrl: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699',
  fileName: 'mountain_landscape.jpg',
  dimensions: '1920 x 1080',
  fileSize: '2.4 MB',
  format: 'JPG',
  uploadDate: '2023-12-10T10:30:00',
  publishDate: '2023-12-15T14:20:00'
});

// 图片统计数据
const pictureStats = reactive({
  views: 2345,
  likes: 128,
  collects: 89,
  comments: 45
});

// 图片编辑历史记录
const editHistory = reactive([
  {
    date: '2024-01-20T09:15:00',
    description: '更新了图片标签和分类'
  },
  {
    date: '2024-02-15T16:30:00',
    description: '修改了图片描述和故事背景'
  }
]);

// 图片表单
const pictureFormRef = ref(null);
const pictureForm = reactive({
  title: '壮丽山景',
  description: '在清晨的阳光下拍摄的山脉风景，远处的云海给画面增添了神秘感。',
  category: 'landscape',
  tags: ['nature', 'mountains', 'sunrise'],
  device: 'Canon EOS 5D Mark IV',
  location: '阿尔卑斯山脉',
  shootDate: dayjs('2023-10-05'),
  colorMode: 'color',
  story: '这张照片是我在徒步旅行的第三天早晨拍摄的。前一晚下了雨，清晨的阳光穿过云层，形成了这种壮观的光线效果。',
  visibility: 'public',
  copyright: 'cc-by',
  enableWatermark: true,
  watermarkText: 'Photography by Me'
});

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
  { value: 'minimalism', label: '极简' },
  { value: 'mountains', label: '山脉' },
  { value: 'sunrise', label: '日出' }
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

// 组件挂载时获取图片数据
onMounted(() => {
  // 模拟API获取图片数据
  // 在实际应用中，这里应该是一个API调用
  console.log('获取图片ID:', pictureId.value);
  message.success('图片数据加载成功');
});

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 格式化数字显示
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';

  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 计算宽高比
const getAspectRatio = (dimensions) => {
  if (!dimensions) return '16:9';

  const parts = dimensions.split(' x ');
  if (parts.length !== 2) return '16:9';

  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);

  if (isNaN(width) || isNaN(height) || height === 0) return '16:9';

  // 尝试计算常见的宽高比
  const ratio = width / height;

  if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
  if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
  if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
  if (Math.abs(ratio - 1) < 0.1) return '1:1';
  if (Math.abs(ratio - 21/9) < 0.1) return '21:9';

  // 如果不是常见比例，计算最大公约数并简化
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);

  return `${width/divisor}:${height/divisor}`;
};

// 查看大图
const showImagePreview = () => {
  previewVisible.value = true;
};

// 取消编辑
const cancelEdit = () => {
  message.info('已取消编辑');
  router.push(`/picture/detail/${pictureId.value}`);
};

// 提交表单
const submitForm = async () => {
  // 表单验证
  try {
    await pictureFormRef.value.validate();

    // 设置提交中状态
    submitting.value = true;

    // 构建提交数据
    const formData = {
      ...pictureForm,
      id: pictureId.value
    };

    // 模拟API提交
    console.log('提交的更新数据:', formData);

    // 模拟提交延迟
    setTimeout(() => {
      // 提交完成
      submitting.value = false;

      // 更新编辑历史记录
      editHistory.unshift({
        date: new Date().toISOString(),
        description: '更新了图片信息和设置'
      });

      // 提示成功
      Modal.success({
        title: '更新成功',
        content: '您的图片信息已成功更新',
        okText: '返回图片详情',
        onOk: () => {
          router.push(`/picture/detail/${pictureId.value}`);
        }
      });
    }, 1500);

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单是否填写正确');
  }
};
</script>

<style scoped>
.edit-picture-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 卡片通用样式 */
.info-card,
.form-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}

.card-title,
.form-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

/* 图片详细信息样式 */
.picture-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.technical-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 0 8px;
}

.technical-info .info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #8c8c8c;
  font-size: 14px;
  width: 70px;
  margin-right: 8px;
}

.info-value {
  color: #262626;
  font-weight: 500;
  font-size: 14px;
}

/* 统计数据样式 */
.stats-info {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #f9f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-icon {
  font-size: 18px;
  color: #6366f1;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
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

/* 编辑历史样式 */
.edit-history {
  background-color: #f9f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.history-item {
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.history-content {
  font-size: 14px;
  color: #333;
}

/* 提交按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

/*增强版页面头部样式 */
.enhanced-page-header {
  margin-bottom: 32px;
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #4569ef 0%, #8b45d5 100%);
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
  line-height: 1.6;
  color: white;
}

.picture-info-container {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.info-item {
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

.preview-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 12px;
  max-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  max-width: 180px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-image {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 4/3;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumbnail-wrapper:hover .image-actions {
  opacity: 1;
}

/* 编辑进度指示器 */
.edit-progress {
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
  max-width: 300px;
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

.step.completed {
  opacity: 0.8;
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

.step.completed .step-icon {
  background-color: rgba(0, 255, 0, 0.2);
  color: white;
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


/* 添加内容卡片容器的样式 */
.content-cards-container {
  display: flex;
  flex-direction: column;
  gap: 36px; /* 增加卡片之间的间距 */
}

/* 调整图片详细信息卡片的样式 */
.detail-card {
  margin-bottom: 0; /* 移除原有的底部边距 */
}

/* 调整页面内边距，增加视觉呼吸感 */
.edit-picture-page {
  padding: 28px; /* 增加页面内边距 */
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 修改卡片底部边距，避免多重边距效果 */
.info-card,
.form-card {
  margin-bottom: 0; /* 移除原有的底部边距 */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}

/* 增强页面头部与内容之间的间距 */
.enhanced-page-header {
  margin-bottom: 36px; /* 增加与内容的间距 */
  /* 其他样式保持不变 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .edit-picture-page {
    padding: 20px 16px;
  }

  .content-cards-container {
    gap: 24px;
  }

  .enhanced-page-header {
    margin-bottom: 24px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .edit-picture-page {
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

  .preview-container {
    max-width: 100%;
  }

  .thumbnail-wrapper {
    max-width: 100%;
  }

  .picture-info-container {
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

  .technical-info {
    grid-template-columns: 1fr;
  }

  .stats-info {
    flex-wrap: wrap;
    gap: 16px;
  }

  .stat-item {
    flex: 1 0 40%;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .edit-picture-page {
    background-color: #121212;
  }

  .enhanced-page-header {
    background: linear-gradient(135deg, #3a59c7 0%, #5d3eae 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .info-card,
  .form-card {
    background-color: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .card-title,
  .form-card-title,
  .section-title {
    color: #e0e0e0;
  }

  .info-label {
    color: #a6a6a6;
  }

  .info-value {
    color: #e0e0e0;
  }

  .stats-info {
    background-color: #2a2a2a;
  }

  .stat-icon {
    color: #a5a8ff;
  }

  .stat-value {
    color: #e0e0e0;
  }

  .stat-label {
    color: #a6a6a6;
  }

  .advanced-options {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .option-label {
    color: #e0e0e0;
  }

  .edit-history {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .history-time {
    color: #999;
  }

  .history-content {
    color: #ddd;
  }

  .form-actions {
    border-top-color: #333;
  }
}
</style>