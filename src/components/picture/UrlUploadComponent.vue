<!-- components/picture/UrlUploadComponent.vue -->
<template>
  <div class="url-upload-component">
    <div class="link-upload-area" v-if="!previewUrl">
      <div class="upload-header">
        <div class="upload-icon">
          <link-outlined />
        </div>
        <h3 class="upload-title">通过URL添加图片</h3>
        <p class="upload-desc">支持JPG、PNG、WebP、GIF等格式的在线图片链接</p>
      </div>

      <a-form :model="linkForm" layout="vertical" class="url-form">
        <div class="url-input-container">
          <a-input
              v-model:value="linkForm.fileUrl"
              placeholder="输入图片URL链接，例如 https://example.com/image.jpg"
              class="link-input"
              allow-clear
              @pressEnter="handleUrlUpload"
          >
            <template #prefix>
              <global-outlined class="input-prefix-icon" />
            </template>
          </a-input>

          <div class="url-example">
            <info-circle-outlined />
            <span>支持大多数主流网站的图片链接</span>
          </div>

          <a-button
              type="primary"
              class="upload-button"
              :disabled="!isValidUrlFormat"
              @click="handleUrlUpload"
              :loading="isUploading"
          >
            <upload-outlined v-if="!isUploading" />
            {{ isUploading ? '上传中...' : '上传图片' }}
          </a-button>
        </div>
      </a-form>

      <div class="url-tips">
        <div class="tips-header">
          <bulb-outlined />
          <span>小贴士</span>
        </div>
        <ul class="tips-list">
          <li><check-outlined /> 确保链接直接指向图片文件（以.jpg、.png、.webp等结尾）</li>
          <li><check-outlined /> 建议使用支持跨域访问的图片链接，确保更高的成功率</li>
          <li><check-outlined /> 如果链接有效但上传失败，请尝试使用本地上传</li>
        </ul>
      </div>
    </div>

    <div class="preview-area" v-else>
      <div class="preview-image-container">
        <div class="preview-header">
          <picture-outlined />
          <span>图片预览</span>
          <a-tag color="success">已成功获取</a-tag>
        </div>
        <div class="preview-image-wrapper">
          <img :src="previewUrl" alt="预览图" class="preview-image" />
          <div class="image-overlay"></div>
          <div class="image-dimensions" v-if="imageDimensions.width && imageDimensions.height">
            {{ imageDimensions.width }} x {{ imageDimensions.height }} px
          </div>
        </div>
        <div class="preview-info">
          <div class="info-item">
            <link-outlined />
            <a-tooltip :title="linkForm.fileUrl">
              <div class="truncated-url">{{ linkForm.fileUrl }}</div>
            </a-tooltip>
            <copy-outlined class="copy-icon" @click="copyToClipboard(linkForm.fileUrl)" />
          </div>
        </div>
        <div class="preview-actions">
          <a-button @click="reupload">
            <reload-outlined />
            重新上传
          </a-button>
          <a-button type="primary" @click="confirmUpload">
            <check-outlined />
            使用此图片
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { uploadPictureByUrlUsingPost } from '@/api/tupianxiangguanjiekou';
import {
  LinkOutlined,
  GlobalOutlined,
  UploadOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  PictureOutlined,
  ReloadOutlined,
  CopyOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  onUploadSuccess: {
    type: Function,
    required: true
  }
});

// 链接表单
const linkForm = reactive({
  fileUrl: ''
});

// 图片预览URL
const previewUrl = ref('');
// 上传状态
const isUploading = ref(false);
// 上传成功的图片数据
const uploadedImageData = ref(null);
// 图片尺寸
const imageDimensions = reactive({
  width: 0,
  height: 0
});

// 校验URL格式是否有效
const isValidUrlFormat = computed(() => {
  if (!linkForm.fileUrl) return false;

  return /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}(\/[^\s]*)?$/.test(linkForm.fileUrl);
});

// 处理URL图片上传
const handleUrlUpload = async () => {
  if (!linkForm.fileUrl) {
    message.error('请输入图片链接');
    return;
  }

  if (!isValidUrlFormat.value) {
    message.error('请输入有效的图片链接');
    return;
  }

  // 设置上传中状态
  isUploading.value = true;

  try {
    // 调用链接上传接口
    const result = await uploadPictureByUrlUsingPost({
      fileUrl: linkForm.fileUrl
    });

    if (result && result.data && result.data.data) {
      message.success('图片获取成功');

      // 保存图片数据
      uploadedImageData.value = result.data.data;

      // 设置预览URL - 使用返回的URL或使用输入的URL
      previewUrl.value = result.data.data?.url || result.data.data?.thumbnailUrl || linkForm.fileUrl;

      // 从返回数据中获取图片尺寸
      if (result.data.data.width && result.data.data.height) {
        imageDimensions.width = result.data.data.width;
        imageDimensions.height = result.data.data.height;
      }
    } else {
      message.error('图片获取失败，请检查链接是否有效');
    }
  } catch (error) {
    console.error('上传错误:', error);
    message.error('获取图片失败: ' + (error.message || '未知错误'));
  } finally {
    isUploading.value = false;
  }
};

// 确认使用上传的图片
const confirmUpload = () => {
  if (uploadedImageData.value) {
    props.onUploadSuccess(uploadedImageData.value);
    message.success('已成功添加图片');
  } else {
    message.error('图片数据不完整，请重新上传');
  }
};

// 重新上传
const reupload = () => {
  previewUrl.value = '';
  uploadedImageData.value = null;
  imageDimensions.width = 0;
  imageDimensions.height = 0;
};

// 复制链接到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('链接已复制到剪贴板');
  }, () => {
    message.error('复制失败');
  });
};

// 监听图片加载以获取尺寸
watch(previewUrl, (newUrl) => {
  if (newUrl && (!imageDimensions.width || !imageDimensions.height)) {
    const img = new Image();
    img.onload = () => {
      imageDimensions.width = img.naturalWidth;
      imageDimensions.height = img.naturalHeight;
    };
    img.src = newUrl;
  }
});
</script>

<style scoped>
.url-upload-component {
  width: 100%;
  border-radius: 12px;
}

/* 链接上传区域 */
.link-upload-area {
  padding: 32px;
  background-color: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-header {
  text-align: center;
  margin-bottom: 16px;
}

.upload-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
  color: #1890ff;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #262626;
}

.upload-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 0;
}

.url-form {
  width: 100%;
}

.url-input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-input {
  font-size: 15px;
  height: 48px;
  border-radius: 8px;
  transition: all 0.3s;
}

.link-input:hover, .link-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.input-prefix-icon {
  color: #bfbfbf;
  margin-right: 4px;
}

.url-example {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: -8px;
  padding-left: 4px;
}

.upload-button {
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.url-tips {
  margin-top: 12px;
  background-color: #f9f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #1890ff;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.tips-list .anticon {
  color: #52c41a;
  margin-top: 3px;
}

/* 预览区域样式 */
.preview-area {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.preview-image-container {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 8px;
  background-color: #fafafa;
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  max-height: 500px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  display: block;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.15) 100%);
  pointer-events: none;
}

.image-dimensions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.preview-info {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #595959;
}

.truncated-url {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 13px;
}

.copy-icon {
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-icon:hover {
  color: #40a9ff;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  background-color: #fafafa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .link-upload-area {
    padding: 20px 16px;
  }

  .preview-area {
    padding: 16px;
  }

  .upload-header {
    margin-bottom: 8px;
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
    margin-bottom: 12px;
  }

  .upload-title {
    font-size: 16px;
  }

  .upload-desc {
    font-size: 13px;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .link-upload-area {
    background-color: #1f1f1f;
  }

  .upload-icon {
    background: linear-gradient(135deg, #111b26 0%, #15395b 100%);
    color: #177ddc;
  }

  .upload-title {
    color: #e0e0e0;
  }

  .upload-desc {
    color: #a6a6a6;
  }

  .url-tips {
    background-color: #141414;
    border-color: #303030;
  }

  .tips-list li {
    color: #a6a6a6;
  }

  .preview-image-container {
    background-color: #1f1f1f;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .preview-header {
    background-color: #141414;
    border-bottom-color: #303030;
  }

  .preview-image-wrapper {
    background-color: #141414;
  }

  .preview-info {
    border-bottom-color: #303030;
  }

  .info-item {
    color: #a6a6a6;
  }

  .preview-actions {
    background-color: #141414;
  }
}
</style>