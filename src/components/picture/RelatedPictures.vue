<template>
  <div class="related-pictures-container">
    <div class="section-header">
      <picture-outlined class="section-icon" />
      <h3 class="section-title">相关推荐</h3>
      <a-button type="link" class="more-link">查看更多</a-button>
    </div>

    <div class="pictures-grid">
      <div
          v-for="(picture, index) in relatedPictures"
          :key="index"
          class="picture-card"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 + index * 50, duration: 300 } }"
          @click="navigateToPicture(picture.id)"
      >
        <div class="picture-wrapper">
          <img :src="picture.src" :alt="picture.title" class="picture-image" />
          <div class="picture-overlay">
            <eye-outlined class="overlay-icon" />
            <span class="overlay-count">{{ formatNumber(picture.views) }}</span>
          </div>
        </div>
        <div class="picture-info">
          <div class="picture-title">{{ picture.title }}</div>
          <div class="picture-author">
            <a-avatar :src="picture.author.avatar" :size="20" />
            <span>{{ picture.author.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PictureOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  currentCategory: {
    type: String,
    default: ''
  },
  currentTags: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();

// 模拟相关图片数据
const relatedPictures = [
  {
    id: '4',
    title: '城市日落风景',
    src: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg',
    views: 2345,
    author: {
      name: '风景摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg'
    }
  },
  {
    id: '5',
    title: '沿海城市景观',
    src: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_1280.jpg',
    views: 1865,
    author: {
      name: '海洋爱好者',
      avatar: 'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_1280.png'
    }
  },
  {
    id: '6',
    title: '黄昏的海岸线',
    src: 'https://cdn.pixabay.com/photo/2016/03/04/19/36/beach-1236581_1280.jpg',
    views: 3210,
    author: {
      name: '航拍达人',
      avatar: 'https://cdn.pixabay.com/photo/2014/04/03/10/32/user-310807_1280.png'
    }
  },
  {
    id: '7',
    title: '城市地平线',
    src: 'https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg',
    views: 2745,
    author: {
      name: '城市摄影师',
      avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    }
  }
];

// 导航到图片详情
const navigateToPicture = (pictureId) => {
  router.push({
    name: 'PictureDetail',
    params: { id: pictureId }
  });
};

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};
</script>

<style scoped>
.related-pictures-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-icon {
  color: var(--primary-color, #6366f1);
  font-size: 18px;
  margin-right: 8px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  flex: 1;
}

.more-link {
  color: var(--primary-color, #6366f1);
  font-size: 14px;
  padding: 0;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.picture-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.picture-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 宽高比 */
  overflow: hidden;
}

.picture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.picture-card:hover .picture-image {
  transform: scale(1.05);
}

.picture-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.overlay-icon {
  color: white;
  font-size: 12px;
}

.overlay-count {
  color: white;
  font-size: 12px;
}

.picture-info {
  padding: 8px;
}

.picture-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.picture-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

@media (max-width: 1200px) {
  .pictures-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .pictures-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .pictures-grid {
    grid-template-columns: 1fr;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .related-pictures-container {
    background-color: #1f1f1f;
  }

  .section-title {
    color: #e0e0e0;
  }

  .picture-title {
    color: #e0e0e0;
  }

  .picture-author {
    color: #a6a6a6;
  }
}
</style>