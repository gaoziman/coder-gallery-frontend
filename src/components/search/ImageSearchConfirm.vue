<template>
  <a-modal
      :visible="visible"
      :title="'以图搜图'"
      :footer="null"
      @cancel="handleCancel"
      width="480px"
      class="search-confirm-modal"
  >
    <div class="confirm-content">
      <div class="image-preview">
        <img :src="currentImage" alt="搜索图片" class="preview-image" />
      </div>
      <div class="search-options">
        <a-form layout="vertical">
          <a-form-item label="包含同一用户图片">
            <a-switch v-model:checked="searchParams.includeSameUser" />
          </a-form-item>
          <a-form-item label="是否再次搜索">
            <a-switch v-model:checked="searchParams.isResearch" />
          </a-form-item>
          <a-form-item label="自定义关键词（可选）">
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
      </div>
    </div>
    <div class="modal-footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button
          type="primary"
          @click="handleSearch"
          :loading="searching"
      >
        开始搜索
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  currentImage: {
    type: String,
    default: ''
  },
  currentImageId: {
    type: [String, Number],
    required: true
  },
  searching: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'search', 'cancel']);

const searchParams = reactive({
  pictureId: null,
  scope: 'all',
  includeSameUser: false,
  similarity: 70,
  saveResults: false,
  customKeyword: '',
  isResearch: false,
  image: ''
});

// 监听currentImageId的变化
watch(() => props.currentImageId, (newVal) => {
  if (newVal) {
    searchParams.pictureId = newVal;
  }
});

// 监听currentImage的变化
watch(() => props.currentImage, (newVal) => {
  if (newVal) {
    searchParams.image = newVal;
  }
});

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

const handleSearch = () => {
  emit('search', { ...searchParams });
};
</script>

<style scoped>
.search-confirm-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-preview {
  display: flex;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
  height: 200px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.search-options {
  padding: 0 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>