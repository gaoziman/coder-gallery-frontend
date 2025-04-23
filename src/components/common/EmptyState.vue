<template>
  <div class="empty-state-container" :class="{ 'with-action': showAction }">
    <!-- 动画插图区域 -->
    <div class="illustration-container">
      <!-- 不同类型的空状态使用不同插图 -->
      <div v-if="type === 'no-data'" class="illustration no-data-illustration">
        <img src="@/assets/images/empty-state-no-data.svg" alt="暂无数据" v-if="customImage === ''" />
        <img :src="customImage" alt="暂无数据" v-else />
      </div>
      <div v-else-if="type === 'no-search-results'" class="illustration search-results-illustration">
        <img src="@/assets/images/empty-state-search.svg" alt="未找到搜索结果" v-if="customImage === ''" />
        <img :src="customImage" alt="未找到搜索结果" v-else />
      </div>
      <div v-else-if="type === 'no-filter-results'" class="illustration filter-results-illustration">
        <img src="@/assets/images/empty-state-filter.svg" alt="未找到筛选结果" v-if="customImage === ''" />
        <img :src="customImage" alt="未找到筛选结果" v-else />
      </div>
      <div v-else class="illustration default-illustration">
        <img src="@/assets/images/empty-state-default.svg" alt="空状态" v-if="customImage === ''" />
        <img :src="customImage" alt="空状态" v-else />
      </div>
    </div>

    <!-- 文本提示区域 -->
    <div class="empty-state-content">
      <h3 class="title">{{ title || getDefaultTitle() }}</h3>
      <p class="description">{{ description || getDefaultDescription() }}</p>

      <!-- 操作按钮区域 -->
      <div class="action-container" v-if="showAction">
        <a-button
            :type="actionButtonType"
            @click="handleActionClick"
            :icon="actionIcon ? h(resolveIcon(actionIcon)) : undefined"
        >
          {{ actionText }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  // 空状态类型：no-data(默认), no-search-results, no-filter-results, custom
  type: {
    type: String,
    default: 'no-data'
  },
  // 自定义标题文本
  title: {
    type: String,
    default: ''
  },
  // 自定义描述文本
  description: {
    type: String,
    default: ''
  },
  // 搜索关键词（用于显示在提示中）
  keyword: {
    type: String,
    default: ''
  },
  // 是否显示操作按钮
  showAction: {
    type: Boolean,
    default: true
  },
  // 操作按钮文本
  actionText: {
    type: String,
    default: '刷新'
  },
  // 操作按钮类型
  actionButtonType: {
    type: String,
    default: 'primary'
  },
  // 操作按钮图标名称
  actionIcon: {
    type: String,
    default: 'reload'
  },
  // 自定义图片路径
  customImage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['action']);

// 根据类型获取默认标题
const getDefaultTitle = () => {
  switch (props.type) {
    case 'no-data':
      return '暂无图片数据';
    case 'no-search-results':
      return props.keyword
          ? `未找到与"${props.keyword}"相关的图片`
          : '未找到搜索结果';
    case 'no-filter-results':
      return '没有符合筛选条件的图片';
    default:
      return '暂无数据';
  }
};

// 根据类型获取默认描述
const getDefaultDescription = () => {
  switch (props.type) {
    case 'no-data':
      return '系统中尚未添加任何图片，请稍后再查看';
    case 'no-search-results':
      return '请尝试使用其他关键词，或者减少筛选条件';
    case 'no-filter-results':
      return '当前筛选条件下没有匹配的图片，请尝试调整筛选条件';
    default:
      return '未找到匹配的内容';
  }
};

// 处理操作按钮点击
const handleActionClick = () => {
  emit('action', props.type);
};

// 解析图标组件
const resolveIcon = (iconName) => {
  const iconMap = {
    'reload': ReloadOutlined,
    'search': SearchOutlined,
    'plus': PlusOutlined,
    'filter': FilterOutlined,
    'clear': ClearOutlined
  };

  return iconMap[iconName] || ReloadOutlined;
};
</script>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 320px;
  margin: 20px 0;
  transition: all 0.3s ease;
}

.empty-state-container.with-action {
  padding-bottom: 48px;
}

.illustration-container {
  margin-bottom: 24px;
  max-width: 240px;
  max-height: 200px;
}

.illustration img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.15));
  transition: transform 0.3s ease;
}

.illustration img:hover {
  transform: translateY(-5px);
}

/* 特定类型的插图样式 */
.no-data-illustration img {
  opacity: 0.85;
}

.search-results-illustration img {
  opacity: 0.9;
}

.filter-results-illustration img {
  opacity: 0.9;
}

.empty-state-content {
  max-width: 320px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  line-height: 1.4;
}

.description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.6;
}

.action-container {
  margin-top: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .empty-state-container {
    padding: 32px 16px;
    min-height: 280px;
  }

  .illustration-container {
    max-width: 180px;
    max-height: 160px;
  }

  .title {
    font-size: 16px;
  }

  .description {
    font-size: 13px;
  }
}
</style>