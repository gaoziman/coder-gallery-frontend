<!-- components/picture/LocalUploadComponent.vue -->
<template>
  <div class="local-upload-component">
    <div class="upload-area" v-if="!previewUrl">
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
        <img :src="previewUrl" alt="预览图" class="preview-image" />
        <div class="preview-actions">
          <a-button type="primary" @click="reupload">重新上传</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { uploadPictureUsingPost } from '@/api/tupianxiangguanjiekou';

const props = defineProps({
  onUploadSuccess: {
    type: Function,
    required: true
  }
});

// 图片预览URL
const previewUrl = ref('');
// 保存上传的文件
const uploadFile = ref(null);

// 本地上传图片前处理
const beforeLocalUpload = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  // 检查文件大小
  const isLt6M = file.size / 1024 / 1024 < 6;
  if (!isLt6M) {
    message.error('图片大小不能超过6MB!');
    return false;
  }

  // 保存文件供上传使用
  uploadFile.value = file;

  // 预览图片
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    previewUrl.value = reader.result;
    // 自动上传
    handleUpload();
  };

  // 阻止自动上传
  return false;
};

// 处理图片上传到服务器
const handleUpload = async () => {
  if (!uploadFile.value) {
    message.error('请先选择图片');
    return;
  }

  // 显示loading消息并获取消息引用
  const loadingMessage = message.loading('正在上传...', 0);

  try {
    // 调用上传接口
    const result = await uploadPictureUsingPost(
        {}, // 这里可以传递额外的参数
        {}, // body 参数
        uploadFile.value
    );

    // 关闭loading消息
    loadingMessage();

    if (result && result.data.data) {
      console.log(JSON.stringify(result.data.data));
      message.success('图片上传成功');
      // 调用父组件传递的成功回调，传递返回的图片信息
      props.onUploadSuccess(result.data.data);
    } else {
      message.error('上传失败，请重试');
    }
  } catch (error) {
    // 关闭loading消息
    loadingMessage();

    console.error('上传错误:', error);
    message.error('上传出错: ' + (error.message || '未知错误'));
  }
};

// 重新上传
const reupload = () => {
  previewUrl.value = '';
  uploadFile.value = null;
};
</script>

<style scoped>
.local-upload-component {
  width: 100%;
}

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

/* 响应式调整 */
@media (max-width: 768px) {
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
  .upload-text {
    color: #e0e0e0;
  }

  .upload-hint {
    color: #a6a6a6;
  }
}
</style>