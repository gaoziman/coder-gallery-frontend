<template>
  <div class="masonry-gallery">
    <template v-if="images.length > 0">
      <div
          v-for="(image, index) in images"
          :key="image.id || index"
          class="masonry-item"
      >
        <image-card
            :image="image"
            @view="onImageView"
            @download="onImageDownload"
            @like="onImageLike"
            @bookmark="onImageBookmark"
            @share="onImageShare"
            @delete="onImageDelete"
            @navigate-to-detail="onNavigateToDetail"
        />
      </div>
    </template>
    <div v-else class="empty-gallery">
      <a-empty :description="emptyText">
        <template #extra>
          <a-button type="primary" @click="onRefresh">重新加载</a-button>
        </template>
      </a-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import ImageCard from './ImageCard.vue';

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  emptyText: {
    type: String,
    default: '暂无图片'
  }
});

const emit = defineEmits([
  'view',
  'download',
  'like',
  'bookmark',
  'share',
  'delete',
  'navigate-to-detail',
  'refresh'
]);

// 处理图片浏览
const onImageView = (image) => {
  emit('view', image);
};

// 处理图片下载
const onImageDownload = (image) => {
  emit('download', image);
};

// 处理点赞
const onImageLike = (image) => {
  emit('like', image);
};

// 处理收藏
const onImageBookmark = (image) => {
  emit('bookmark', image);
};

// 处理分享
const onImageShare = (image) => {
  emit('share', image);
};

// 处理删除
const onImageDelete = (image) => {
  emit('delete', image);
};

// 处理导航到详情页
const onNavigateToDetail = (image) => {
  emit('navigate-to-detail', image);
};

// 刷新图片
const onRefresh = () => {
  emit('refresh');
};
</script>

<style scoped>
/* 瀑布流布局 */
.masonry-gallery {
  column-count: 1;
  column-gap: 16px;
  margin-bottom: 32px;
  width: 100%;
}

@media (min-width: 576px) {
  .masonry-gallery {
    column-count: 2;
    column-gap: 16px;
  }
}

@media (min-width: 992px) {
  .masonry-gallery {
    column-count: 3;
    column-gap: 20px;
  }
}

@media (min-width: 1200px) {
  .masonry-gallery {
    column-count: 4;
    column-gap: 24px;
  }
}

/* 保证瀑布流元素不被打断 */
.masonry-item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 16px;
  display: inline-block;
  width: 100%;
}

/* 空状态 */
.empty-gallery {
  text-align: center;
  padding: 60px 0;
}
</style>