<template>
  <div class="file-uploader" :class="{ 'is-dragging': isDragging, 'is-disabled': disabled }">
    <!-- 拖拽上传区域 -->
    <div
        class="upload-area"
        :class="[
        `upload-area--${size}`,
        { 'upload-area--has-file': fileList.length > 0 }
      ]"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="triggerUpload"
    >
      <!-- 文件列表展示 -->
      <div class="file-list" v-if="fileList.length > 0 && !hideFileList">
        <div
            v-for="(file, index) in fileList"
            :key="index"
            class="file-item"
            :class="{ 'file-item--error': file.status === 'error' }"
        >
          <!-- 文件图标 -->
          <div class="file-icon">
            <file-image-outlined v-if="isImageFile(file)" />
            <file-pdf-outlined v-else-if="isPdfFile(file)" />
            <file-word-outlined v-else-if="isWordFile(file)" />
            <file-excel-outlined v-else-if="isExcelFile(file)" />
            <file-zip-outlined v-else-if="isArchiveFile(file)" />
            <file-outlined v-else />
          </div>

          <!-- 文件信息 -->
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <!-- 文件大小 -->
              <span class="file-size">{{ formatFileSize(file.size) }}</span>

              <!-- 上传状态 -->
              <span v-if="file.status === 'uploading'" class="file-status">
                <loading-outlined spin />
                上传中 {{ file.percent ? `${Math.floor(file.percent)}%` : '' }}
              </span>
              <span v-else-if="file.status === 'error'" class="file-status error">
                <warning-outlined />
                {{ file.error || '上传失败' }}
              </span>
              <span v-else-if="file.status === 'done'" class="file-status success">
                <check-circle-outlined />
                上传成功
              </span>
            </div>

            <!-- 进度条 -->
            <a-progress
                v-if="file.status === 'uploading'"
                :percent="file.percent || 0"
                size="small"
                :show-info="false"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions">
            <!-- 预览按钮（仅对图片和PDF有效） -->
            <a-button
                v-if="(isImageFile(file) || isPdfFile(file)) && file.url"
                type="link"
                size="small"
                @click.stop="previewFile(file)"
            >
              <template #icon><eye-outlined /></template>
            </a-button>

            <!-- 删除按钮 -->
            <a-button
                type="link"
                size="small"
                danger
                @click.stop="removeFile(index)"
                :disabled="file.status === 'uploading'"
            >
              <template #icon><delete-outlined /></template>
            </a-button>
          </div>
        </div>
      </div>

      <!-- 上传区域内容 -->
      <div class="upload-content" v-if="showUploadArea">
        <div class="upload-icon">
          <slot name="icon">
            <upload-outlined v-if="!loading" />
            <loading-outlined spin v-else />
          </slot>
        </div>

        <div class="upload-text">
          <slot>
            <div v-if="!loading">
              <span class="upload-text-main">{{ dragText }}</span>
              <span class="upload-text-sub">{{ acceptText }}</span>
            </div>
            <div v-else>{{ loadingText }}</div>
          </slot>
        </div>

        <!-- 自定义内容插槽 -->
        <slot name="extra"></slot>
      </div>
    </div>

    <!-- 上传按钮（可选） -->
    <div class="upload-actions" v-if="showUploadButton && !disabled">
      <slot name="actions">
        <a-button
            type="primary"
            @click="triggerUpload"
            :loading="loading"
            :disabled="disabled || (fileList.length >= maxCount && maxCount > 0)"
        >
          <template #icon><upload-outlined /></template>
          {{ buttonText }}
        </a-button>
      </slot>
    </div>

    <!-- 文件提示 -->
    <div class="upload-tips" v-if="showTips">
      <slot name="tips">
        <a-typography-text type="secondary">
          {{ tipsText }}
        </a-typography-text>
      </slot>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="file-input"
        @change="handleFileChange"
        :disabled="disabled || loading"
    />

    <!-- 图片预览 -->
    <a-image
        v-if="previewVisible"
        :visible="previewVisible"
        :src="previewImage"
        @visibleChange="handlePreviewVisibleChange"
        :preview="previewConfig"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  UploadOutlined,
  LoadingOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  EyeOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import { uploadImageUsingPost } from '@/api/wenjianshangchuan';
import fileValidator from '@/utils/fileValidator';

// 定义Props
const props = defineProps({
  // 上传区域大小：small, default, large
  size: {
    type: String,
    default: 'default'
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: '*'
  },
  // 是否支持多文件上传
  multiple: {
    type: Boolean,
    default: false
  },
  // 是否自动上传（选择文件后立即上传）
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示上传按钮
  showUploadButton: {
    type: Boolean,
    default: false
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: '选择文件'
  },
  // 拖拽提示文字
  dragText: {
    type: String,
    default: '点击或拖拽文件到此区域上传'
  },
  // 加载中文字
  loadingText: {
    type: String,
    default: '文件上传中...'
  },
  // 接受的文件类型描述
  acceptText: {
    type: String,
    default: ''
  },
  // 提示文字
  tipsText: {
    type: String,
    default: ''
  },
  // 是否显示提示
  showTips: {
    type: Boolean,
    default: true
  },
  // 最大文件数量
  maxCount: {
    type: Number,
    default: 0 // 0表示不限制
  },
  // 最大文件大小(字节)
  maxSize: {
    type: Number,
    default: 0 // 0表示不限制
  },
  // 文件验证配置
  validationConfig: {
    type: Object,
    default: () => ({})
  },
  // 是否压缩图片
  compressImage: {
    type: Boolean,
    default: true
  },
  // 压缩图片配置
  compressOptions: {
    type: Object,
    default: () => ({
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8
    })
  },
  // 是否隐藏文件列表
  hideFileList: {
    type: Boolean,
    default: false
  },
  // 自定义上传方法
  customUpload: {
    type: Function,
    default: null
  },
  // 初始文件列表
  initialFileList: {
    type: Array,
    default: () => []
  }
});

// 定义Emits
const emit = defineEmits([
  'update:fileList',
  'change',
  'success',
  'error',
  'remove',
  'exceed',
  'beforeUpload'
]);

// Refs
const fileInputRef = ref(null);
const isDragging = ref(false);
const loading = ref(false);
const fileList = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewConfig = ref({
  visible: false,
  defaultVisible: false
});

// 计算属性
const showUploadArea = computed(() => {
  return hideFileList.value || fileList.value.length === 0;
});

const hideFileList = computed(() => {
  return props.hideFileList || (props.maxCount === 1 && fileList.value.length === 1);
});

// 监听初始文件列表变化
watch(() => props.initialFileList, (newVal) => {
  if (newVal && newVal.length > 0) {
    fileList.value = [...newVal];
  }
}, { immediate: true, deep: true });

// 文件类型判断函数
const isImageFile = (file) => {
  return file.type && file.type.startsWith('image/');
};

const isPdfFile = (file) => {
  return file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
};

const isWordFile = (file) => {
  return file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      (file.name && (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')));
};

const isExcelFile = (file) => {
  return file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      (file.name && (file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx')));
};

const isArchiveFile = (file) => {
  return file.type === 'application/zip' ||
      file.type === 'application/x-rar-compressed' ||
      (file.name && (file.name.toLowerCase().endsWith('.zip') || file.name.toLowerCase().endsWith('.rar')));
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  return fileValidator.formatFileSize(bytes);
};

// 触发文件选择
const triggerUpload = () => {
  if (props.disabled || loading.value) return;

  // 检查文件数量限制
  if (props.maxCount > 0 && fileList.value.length >= props.maxCount) {
    message.warning(`最多只能上传${props.maxCount}个文件`);
    emit('exceed', fileList.value.length, props.maxCount);
    return;
  }

  fileInputRef.value.click();
};

// 处理拖拽事件
const onDragOver = (e) => {
  if (props.disabled || loading.value) return;
  e.preventDefault();
  isDragging.value = true;
};

const onDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const onDrop = async (e) => {
  if (props.disabled || loading.value) return;
  e.preventDefault();
  isDragging.value = false;

  // 获取拖拽的文件
  const files = e.dataTransfer.files;
  if (!files || files.length === 0) return;

  await handleFiles(files);
};

// 处理文件选择
const handleFileChange = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  await handleFiles(files);

  // 重置文件输入以允许重复选择相同文件
  fileInputRef.value.value = '';
};

// 处理文件
const handleFiles = async (files) => {
  // 转换FileList为数组
  const fileArray = Array.from(files);

  // 检查文件数量限制
  if (props.maxCount > 0) {
    const remainingCount = props.maxCount - fileList.value.length;
    if (remainingCount <= 0) {
      message.warning(`最多只能上传${props.maxCount}个文件`);
      emit('exceed', fileList.value.length, props.maxCount);
      return;
    }

    // 如果剩余数量少于选择的文件数，截取前几个
    if (fileArray.length > remainingCount) {
      fileArray.splice(remainingCount);
      message.warning(`已选择${files.length}个文件，但只能再上传${remainingCount}个文件`);
    }
  }

  // 验证并处理每个文件
  for (const file of fileArray) {
    // 验证文件
    const isValid = await validateFile(file);

    if (isValid) {
      // 创建文件对象
      const fileObj = {
        uid: Date.now() + Math.random().toString(36).substr(2, 8),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready',
        percent: 0,
        raw: file
      };

      // 添加到文件列表
      fileList.value.push(fileObj);

      // 自动上传
      if (props.autoUpload) {
        await uploadFile(fileObj, fileList.value.length - 1);
      }
    }
  }

  // 更新文件列表
  updateFileList();
};

// 验证文件
const validateFile = async (file) => {
  // 合并验证配置
  const validationConfig = {
    ...props.validationConfig
  };

  // 添加大小限制
  if (props.maxSize > 0) {
    validationConfig.maxSize = props.maxSize;
  }

  // 进行验证
  const isValid = await fileValidator.validateFileWithFeedback(file, validationConfig);

  return isValid;
};

// 上传文件
const uploadFile = async (fileObj, index) => {
  // 防止重复上传
  if (fileObj.status === 'uploading' || fileObj.status === 'done') {
    return;
  }

  // 触发上传前事件
  const shouldUpload = emit('beforeUpload', fileObj);
  if (shouldUpload === false) {
    return;
  }

  // 更新文件状态
  fileObj.status = 'uploading';
  fileObj.percent = 0;
  updateFileList();

  loading.value = true;

  try {
    let uploadedFile = fileObj.raw;

    // 如果是图片并且需要压缩
    if (isImageFile(fileObj) && props.compressImage) {
      uploadedFile = await fileValidator.compressImage(fileObj.raw, props.compressOptions);
    }

    // 使用自定义上传方法或默认上传方法
    if (props.customUpload) {
      const result = await props.customUpload(uploadedFile, (percent) => {
        fileObj.percent = percent;
        updateFileList();
      });

      // 处理上传结果
      handleUploadSuccess(result, fileObj, index);
    } else {
      // 使用默认上传API
      const response = await uploadImageUsingPost({}, uploadedFile);

      // 处理上传结果
      if (response.data && response.data.code === 200 && response.data.data) {
        // 上传成功
        const fileUrl = response.data.data;
        handleUploadSuccess(fileUrl, fileObj, index);
      } else {
        // 上传失败
        handleUploadError(response.data?.message || '上传失败', fileObj, index);
      }
    }
  } catch (error) {
    console.error('File upload error:', error);
    handleUploadError(error.message || '上传过程中发生错误', fileObj, index);
  } finally {
    loading.value = false;
  }
};

// 处理上传成功
const handleUploadSuccess = (url, fileObj, index) => {
  fileObj.status = 'done';
  fileObj.percent = 100;
  fileObj.url = url;

  updateFileList();

  // 触发成功事件
  emit('success', fileObj, fileList.value, index);
  emit('change', fileObj, fileList.value, index);
};

// 处理上传失败
const handleUploadError = (errorMsg, fileObj, index) => {
  fileObj.status = 'error';
  fileObj.error = errorMsg;

  updateFileList();

  // 触发错误事件
  emit('error', fileObj, fileList.value, index, errorMsg);
  emit('change', fileObj, fileList.value, index);

  message.error(`文件 "${fileObj.name}" 上传失败: ${errorMsg}`);
};

// 删除文件
const removeFile = (index) => {
  if (index < 0 || index >= fileList.value.length) return;

  const removedFile = fileList.value[index];

  // 如果文件正在上传中，显示确认提示
  if (removedFile.status === 'uploading') {
    // 此处可以添加二次确认逻辑
  }

  // 删除文件
  fileList.value.splice(index, 1);
  updateFileList();

  // 触发删除事件
  emit('remove', removedFile, fileList.value, index);
  emit('change', null, fileList.value, null);
};

// 预览文件
const previewFile = (file) => {
  if (!file.url) return;

  // 图片预览
  if (isImageFile(file)) {
    previewImage.value = file.url;
    previewVisible.value = true;
    return;
  }

  // PDF预览 - 在新窗口打开
  if (isPdfFile(file)) {
    window.open(file.url, '_blank');
  }
};

// 处理预览可见性变化
const handlePreviewVisibleChange = (visible) => {
  previewVisible.value = visible;
};

// 更新文件列表
const updateFileList = () => {
  emit('update:fileList', [...fileList.value]);
  emit('change', null, [...fileList.value], null);
};

// 清空文件列表
const clearFiles = () => {
  fileList.value = [];
  updateFileList();
};

// 手动上传
const submit = async () => {
  if (fileList.value.length === 0) {
    message.warning('请先选择要上传的文件');
    return;
  }

  loading.value = true;

  try {
    // 找出所有待上传的文件
    const pendingFiles = fileList.value.filter(file => file.status === 'ready');

    if (pendingFiles.length === 0) {
      message.info('没有需要上传的文件');
      return;
    }

    // 上传所有待上传文件
    const uploadPromises = pendingFiles.map(async (file, index) => {
      const fileIndex = fileList.value.findIndex(f => f.uid === file.uid);
      if (fileIndex !== -1) {
        await uploadFile(file, fileIndex);
      }
    });

    await Promise.all(uploadPromises);

    message.success('所有文件上传完成');
  } catch (error) {
    console.error('Batch upload error:', error);
    message.error('批量上传过程中发生错误');
  } finally {
    loading.value = false;
  }
};

// 暴露方法给父组件
defineExpose({
  triggerUpload,
  clearFiles,
  submit,
  fileList
});

// 组件挂载时初始化
onMounted(() => {
  // 初始化文件列表
  if (props.initialFileList && props.initialFileList.length > 0) {
    fileList.value = [...props.initialFileList];
  }
});
</script>

<style scoped>
.file-uploader {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-uploader.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.upload-area {
  position: relative;
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #6554C0;
  background-color: rgba(101, 84, 192, 0.03);
}

.is-dragging .upload-area {
  border-color: #6554C0;
  background-color: rgba(101, 84, 192, 0.05);
}

.upload-area--small {
  padding: 16px;
}

.upload-area--default {
  padding: 24px;
}

.upload-area--large {
  padding: 32px;
}

.upload-area--has-file {
  padding: 12px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
}

.upload-icon {
  font-size: 24px;
  color: #999;
}

.upload-text {
  text-align: center;
}

.upload-text-main {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-text-sub {
  display: block;
  font-size: 12px;
  color: #999;
}

.upload-actions {
  display: flex;
  justify-content: center;
}

.upload-tips {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.file-input {
  display: none;
}

.file-list {
  width: 100%;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.3s;
}

.file-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.file-item--error {
  border-color: #ffa39e;
  background-color: #fff1f0;
}

.file-icon {
  margin-right: 12px;
  font-size: 24px;
  color: #999;
}

.file-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  margin-bottom: 4px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-status.error {
  color: #ff4d4f;
}

.file-status.success {
  color: #52c41a;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .file-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .file-icon {
    margin-bottom: 8px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>