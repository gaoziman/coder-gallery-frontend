<template>
  <a-modal
      :visible="visible"
      :title="null"
      width="800px"
      :footer="null"
      :closable="false"
      class="category-modal"
      :maskClosable="true"
      @cancel="handleCancel"
  >
    <div class="modal-container">
      <!-- 顶部标题区域 -->
      <div class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-bg">
              <AppstoreOutlined class="title-icon" />
            </div>
            <h2 class="modal-title">选择分类</h2>
          </div>
          <a-button type="text" class="close-button" @click="handleCancel">
            <CloseOutlined />
          </a-button>
        </div>
        <div class="header-description">
          精选分类帮您快速找到需要的内容，可选择多个分类组合浏览
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-section" v-if="categories.length > 12">
        <a-input
            placeholder="搜索分类..."
            v-model:value="searchText"
            @input="filterCategories"
            :allowClear="true"
        >
          <template #prefix>
            <SearchOutlined class="search-icon" />
          </template>
        </a-input>
      </div>

      <!-- 分类区域 -->
      <div class="categories-container">

        <!-- 所有分类 -->
        <div class="category-section">
          <h3 class="section-title">所有分类</h3>
          <div class="category-grid">
            <div
                v-for="category in displayedCategories"
                :key="category.id"
                class="category-card"
                :class="{ 'active': localSelectedCategory === category.id }"
                @click="selectCategory(category.id)"
            >
              <div class="card-icon" :style="getCategoryIconStyle(category)">
                <component :is="renderCategoryIcon(category)" v-if="renderCategoryIcon(category)"/>
                <IconFont v-else-if="category.icon && category.icon.startsWith('icon-')" :type="category.icon"/>
                <AppstoreOutlined v-else/>
              </div>
              <div class="card-label">{{ category.name }}</div>
              <div class="card-count" v-if="category.count">{{ formatCount(category.count) }}</div>
            </div>
          </div>

          <!-- 没有找到分类时显示 -->
          <div v-if="displayedCategories.length === 0" class="empty-state-container">
            <empty-state
                :type="getEmptyStateType()"
                :keyword="searchText"
                :show-action="true"
                :action-text="getEmptyStateActionText()"
                :action-icon="getEmptyStateActionIcon()"
                @action="handleEmptyStateAction"
            />
          </div>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="modal-footer">
        <div class="selection-info" v-if="selectedCategory !== 'all'">
          已选: <span class="selected-name">{{ getSelectedCategoryName() }}</span>
        </div>
        <div class="button-group">
          <a-button @click="resetSelection" class="reset-button">
            <template #icon><UndoOutlined /></template>
            重置
          </a-button>
          <a-button type="primary" @click="handleConfirm" class="confirm-button">
            确定
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  AppstoreOutlined,
  CloseOutlined,
  SearchOutlined,
  UndoOutlined,
} from '@ant-design/icons-vue';
import EmptyState from "@/components/common/EmptyState.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: 'all'
  },
  renderCategoryIcon: {
    type: Function,
    default: () => null
  }
});

const emit = defineEmits(['update:visible', 'select', 'cancel']);

// 本地状态
const searchText = ref('');
const localSelectedCategory = ref(props.selectedCategory);

// 更新本地选中状态
watch(() => props.selectedCategory, (newVal) => {
  localSelectedCategory.value = newVal;
});


const getEmptyStateType = () => {
  return 'no-search-results';
};

const getEmptyStateActionText = () => {
  return '清除搜索';
};

const getEmptyStateActionIcon = () => {
  return 'clear';
};

const handleEmptyStateAction = () => {
  searchText.value = '';
};

// 搜索过滤后的分类
const displayedCategories = computed(() => {
  if (!searchText.value) {
    return props.categories;
  }
  return props.categories.filter(category =>
      category.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 推荐分类（取前5个）
const featuredCategories = computed(() => {
  return props.categories.slice(0, 5);
});

// 过滤分类
const filterCategories = () => {
  // 搜索功能已通过计算属性实现
};

// 选择分类
const selectCategory = (categoryId) => {
  localSelectedCategory.value = categoryId;
};

// 重置选择
const resetSelection = () => {
  localSelectedCategory.value = 'all';
};

// 确认选择
const handleConfirm = () => {
  emit('select', localSelectedCategory.value);
  emit('update:visible', false);
};

// 取消选择
const handleCancel = () => {
  localSelectedCategory.value = props.selectedCategory; // 恢复原来的选择
  emit('cancel');
  emit('update:visible', false);
};

// 获取选中分类名称
const getSelectedCategoryName = () => {
  if (localSelectedCategory.value === 'all') {
    return '全部';
  }
  const category = props.categories.find(c => c.id === localSelectedCategory.value);
  return category ? category.name : '未知分类';
};

// 格式化数量显示
const formatCount = (count) => {
  if (count > 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count;
};

// 获取分类图标样式
const getCategoryIconStyle = (category) => {
  // 生成随机但稳定的颜色（基于分类ID）
  let hue = 0;
  if (category.id) {
    const str = String(category.id);
    for (let i = 0; i < str.length; i++) {
      hue += str.charCodeAt(i);
    }
    hue = hue % 360;
  }

  // 使用特定颜色，如果是常见分类
  const specialCategories = {
    'photo': '210',
    'design': '340',
    'nature': '120',
    'art': '30',
    'tech': '200',
  };

  const categoryKey = category.name ? category.name.toLowerCase() : '';
  if (specialCategories[categoryKey]) {
    hue = specialCategories[categoryKey];
  }

  return {
    backgroundColor: `hsl(${hue}, 70%, 95%)`,
    color: `hsl(${hue}, 70%, 40%)`
  };
};
</script>

<style scoped>
.category-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-container {
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-section {
  display: flex;
  align-items: center;
}

.icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  margin-right: 12px;
}

.title-icon {
  font-size: 18px;
  color: white;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  font-size: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.header-description {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.search-section {
  margin-bottom: 20px;
}

.search-section :deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.search-section :deep(.ant-input-affix-wrapper:hover),
.search-section :deep(.ant-input-affix-wrapper:focus) {
  border-color: #6366f1;
}

.search-icon {
  color: #9ca3af;
}

.categories-container {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 20px;
}

.categories-container::-webkit-scrollbar {
  width: 6px;
}

.categories-container::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 8px;
}

.categories-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 8px;
}

.categories-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.category-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #6366f1;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.category-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: 12px;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #e5e7eb;
}

.category-card.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.category-card.special {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-card.special.active {
  background-color: #eff6ff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.category-card.special:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 24px;
  transition: all 0.2s ease;
}

.card-icon.all {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.card-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  transition: all 0.2s ease;
}

.card-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 10px;
}

.category-card.active .card-label {
  color: #6366f1;
  font-weight: 600;
}


.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.selection-info {
  font-size: 14px;
  color: #6b7280;
}

.selected-name {
  color: #6366f1;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 12px;
}

.reset-button {
  display: flex;
  align-items: center;
}

.confirm-button {
  min-width: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  padding: 0 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #5258e9 0%, #7c4ddc 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

/* 统一按钮样式 */
.reset-button, .confirm-button {
  min-width: 80px;
  height: 40px;
  font-weight: 500;
  padding: 0 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 重置按钮特有样式 */
.reset-button {
  color: #6b7280;
  border: 1px solid #e5e7eb;
  background-color: white;
}

.reset-button:hover {
  color: #374151;
  border-color: #d1d5db;
  background-color: #f9fafb;
}

/* 确认按钮样式 */
.confirm-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #5258e9 0%, #7c4ddc 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.empty-state-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>