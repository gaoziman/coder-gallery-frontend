// components/dashboard/HotTags.vue
<template>
  <a-card
      class="hot-tags-card"
      :bordered="false"
      title="热门标签统计"
  >
    <!-- 修复卡片右上角内容 -->
    <template #extra>
      <a href="javascript:void(0);" class="extra-link">管理标签</a>
    </template>

    <!-- 热门标签部分 -->
    <div class="hot-tags-section">
      <div class="tags-container">
        <a-tag
            v-for="tag in hotTags"
            :key="tag.id"
            :color="tag.color"
            class="hot-tag"
            :style="{ fontSize: getTagSize(tag.count) }"
        >
          {{ tag.name }}
          <span class="tag-count">({{ tag.count }})</span>
        </a-tag>
      </div>
    </div>

    <a-divider style="margin: 16px 0" />

    <!-- 推荐分类部分 -->
    <div class="categories">
      <div class="category-header">推荐分类</div>
      <div class="category-list">
        <div
            v-for="(category, index) in topCategories"
            :key="index"
            class="category-item"
        >
          <div class="category-info">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-count">{{ category.count }} 张图片</div>
          </div>
          <div class="category-progress">
            <a-progress
                :percent="category.percent"
                :showInfo="false"
                size="small"
                :strokeColor="category.color"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚部分 -->
    <div class="card-footer">
      <a-button type="link" class="view-more-btn">
        查看全部
        <RightOutlined />
      </a-button>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RightOutlined } from '@ant-design/icons-vue';

// 热门标签数据
const hotTags = ref([
  { id: 1, name: '抽象艺术', count: 289, color: '#6151e6' },
  { id: 2, name: '自然风景', count: 276, color: '#40a9ff' },
  { id: 3, name: 'UI设计', count: 242, color: '#13c2c2' },
  { id: 4, name: '壁纸', count: 198, color: '#faad14' },
  { id: 5, name: '海变色', count: 176, color: '#f759ab' },
  { id: 6, name: '几何图形', count: 154, color: '#1890ff' },
  { id: 7, name: '插画', count: 132, color: '#fa541c' },
  { id: 8, name: '科技', count: 119, color: '#722ed1' },
  { id: 9, name: '商务', count: 108, color: '#52c41a' },
  { id: 10, name: '动物', count: 96, color: '#eb2f96' }
]);

// 按类别统计的顶级分类
const topCategories = ref([
  { name: '艺术创作', count: 742, percent: 35, color: '#6151e6' },
  { name: '自然风景', count: 518, percent: 24, color: '#40a9ff' },
  { name: '设计素材', count: 463, percent: 22, color: '#13c2c2' },
  { name: '商业图片', count: 216, percent: 10, color: '#faad14' },
  { name: '其他分类', count: 187, percent: 9, color: '#bfbfbf' }
]);

// 根据标签使用次数计算字体大小
const getTagSize = (count) => {
  // 映射计数到字体大小范围，例如从12px到18px
  const max = Math.max(...hotTags.value.map(tag => tag.count));
  const min = Math.min(...hotTags.value.map(tag => tag.count));
  const size = 12 + ((count - min) / (max - min)) * 6;
  return `${size}px`;
};
</script>

<style scoped>
.hot-tags-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.extra-link {
  color: #6151e6;
  font-size: 14px;
}

.hot-tags-section {
  margin-bottom: 12px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag {
  margin: 0;
  padding: 2px 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  display: inline-flex;
  align-items: center;
}

.hot-tag:hover {
  transform: scale(1.05);
}

.tag-count {
  margin-left: 4px;
  opacity: 0.8;
  font-size: 0.85em;
}

.categories {
  margin-top: 16px;
}

.category-header {
  font-weight: 500;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.85);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  margin-bottom: 8px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.category-name {
  color: rgba(0, 0, 0, 0.65);
}

.category-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.view-more-btn {
  color: #6151e6;
}
</style>