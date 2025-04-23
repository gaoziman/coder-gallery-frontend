<template>
  <a-modal
      :visible="visible"
      :title="null"
      width="800px"
      :footer="null"
      :closable="false"
      class="tag-modal"
      :maskClosable="true"
      @cancel="handleCancel"
  >
    <div class="modal-container">
      <!-- 顶部标题区域 -->
      <div class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-bg">
              <TagOutlined class="title-icon" />
            </div>
            <h2 class="modal-title">选择标签</h2>
          </div>
          <a-button type="text" class="close-button" @click="handleCancel">
            <CloseOutlined />
          </a-button>
        </div>
        <div class="header-description">
          标签能帮您精确定位感兴趣的内容，可多选以获取更精准的结果
        </div>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <a-input
            placeholder="搜索标签..."
            v-model:value="searchText"
            @input="filterTags"
            :allowClear="true"
            class="search-input"
        >
          <template #prefix>
            <SearchOutlined class="search-icon" />
          </template>
        </a-input>

        <div class="current-selection" v-if="selectedTags.length > 0">
          <span class="selection-label">已选 {{ selectedTags.length }} 个</span>
          <a-button type="link" class="clear-btn" @click="clearSelection">清空</a-button>
        </div>
      </div>

      <!-- 标签区域 -->
      <div class="tags-container">
        <!-- 推荐标签 -->
        <div class="tag-section">
          <h3 class="section-title">推荐标签</h3>
          <div class="recommended-tags">
            <div
                class="tag-item special"
                :class="{'active': selectedTags.length === 0}"
                @click="clearSelection"
            >
              <div class="tag-content">
                <div class="tag-dot" style="background-color: #6366f1;"></div>
                <span class="tag-text">全部</span>
              </div>
            </div>

            <div
                v-for="tag in popularTags"
                :key="tag.id"
                class="tag-item special"
                :class="{'active': isTagSelected(tag.id)}"
                @click="toggleTag(tag.id)"
            >
              <div class="tag-content">
                <div class="tag-dot" :style="{ backgroundColor: tag.color || getTagColor(tag.id) }"></div>
                <span class="tag-text">{{ tag.name }}</span>
                <span class="tag-count" v-if="tag.count">{{ formatCount(tag.count) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 所有标签 -->
        <div class="tag-section">
          <h3 class="section-title">所有标签</h3>

          <!-- 标签网格 -->
          <div class="all-tags-grid">
            <div
                v-for="tag in filteredTags"
                :key="tag.id"
                class="tag-card"
                :class="{'active': isTagSelected(tag.id)}"
                @click="toggleTag(tag.id)"
            >
              <div class="tag-card-content">
                <div class="tag-indicator" :style="{ backgroundColor: tag.color || getTagColor(tag.id) }"></div>
                <div class="tag-name">{{ tag.name }}</div>
                <div class="tag-count" v-if="tag.count">{{ formatCount(tag.count) }}</div>
              </div>
              <div class="tag-checkbox">
                <CheckOutlined v-if="isTagSelected(tag.id)" />
                <PlusOutlined v-else />
              </div>
            </div>
          </div>

          <!-- 没有找到标签时显示 -->
          <div v-if="filteredTags.length === 0" class="empty-state-container">
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

      <!-- 已选标签预览 -->
      <div class="selected-preview" v-if="selectedTags.length > 0">
        <div class="preview-header">
          <h4 class="preview-title">已选标签</h4>
          <a-button type="link" class="preview-clear" @click="clearSelection">
            清空
          </a-button>
        </div>
        <div class="selected-tags">
          <div
              v-for="tagId in selectedTags"
              :key="tagId"
              class="preview-tag"
          >
            <div class="preview-dot" :style="{ backgroundColor: getTagColorById(tagId) }"></div>
            <span class="preview-text">{{ getTagNameById(tagId) }}</span>
            <a-button type="text" class="remove-tag" @click.stop="removeTag(tagId)">
              <CloseOutlined />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="modal-footer">
        <div class="selection-info" v-if="selectedTags.length > 0">
          已选择了 <span class="selected-count">{{ selectedTags.length }}</span> 个标签
        </div>
        <div class="button-group">
          <a-button @click="clearSelection" class="action-button reset-button">
            <template #icon><UndoOutlined /></template>
            重置
          </a-button>
          <a-button type="primary" @click="handleConfirm" class="action-button confirm-button">
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
  TagOutlined,
  CloseOutlined,
  SearchOutlined,
  UndoOutlined,
  InboxOutlined,
  CheckOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import EmptyState from "@/components/common/EmptyState.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  tags: {
    type: Array,
    default: () => []
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  getTagColor: {
    type: Function,
    default: () => '#6366f1'
  }
});

// 添加 search 事件，与分类弹窗的 select 事件保持行为一致
const emit = defineEmits(['update:visible', 'update:selectedTags', 'cancel', 'search']);

// 本地状态
const searchText = ref('');
const localSelectedTags = ref([...props.selectedTags]);

// 更新本地选中状态
watch(() => props.selectedTags, (newVal) => {
  localSelectedTags.value = [...newVal];
}, { deep: true });

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
  resetSearch();
};

// 搜索过滤后的标签
const filteredTags = computed(() => {
  if (!searchText.value) {
    return props.tags;
  }
  return props.tags.filter(tag =>
      tag.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 热门标签（取前8个）
const popularTags = computed(() => {
  return props.tags
      .filter(tag => tag.count)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 8);
});

// 过滤标签
const filterTags = () => {
  // 已通过计算属性实现
};

// 重置搜索
const resetSearch = () => {
  searchText.value = '';
};

// 切换标签选中状态
const toggleTag = (tagId) => {
  const index = localSelectedTags.value.indexOf(tagId);
  if (index === -1) {
    localSelectedTags.value.push(tagId);
  } else {
    localSelectedTags.value.splice(index, 1);
  }
};

// 移除单个标签
const removeTag = (tagId) => {
  const index = localSelectedTags.value.indexOf(tagId);
  if (index !== -1) {
    localSelectedTags.value.splice(index, 1);
  }
};

// 清空选择
const clearSelection = () => {
  localSelectedTags.value = [];
};

// 标签是否被选中
const isTagSelected = (tagId) => {
  return localSelectedTags.value.includes(tagId);
};

// 确认选择
const handleConfirm = () => {
  emit('update:selectedTags', localSelectedTags.value);
  emit('update:visible', false);
  // 添加新的事件触发搜索操作，与分类弹窗行为保持一致
  emit('search', localSelectedTags.value);
};

// 取消选择
const handleCancel = () => {
  localSelectedTags.value = [...props.selectedTags]; // 恢复原来的选择
  emit('cancel');
  emit('update:visible', false);
};

// 格式化数量显示
const formatCount = (count) => {
  if (count > 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count;
};

// 根据ID获取标签颜色
const getTagColorById = (tagId) => {
  const tag = props.tags.find(t => t.id === tagId);
  return tag ? (tag.color || props.getTagColor(tagId)) : '#6366f1';
};

// 根据ID获取标签名称
const getTagNameById = (tagId) => {
  const tag = props.tags.find(t => t.id === tagId);
  return tag ? tag.name : '未知标签';
};
</script>

<style scoped>
/* 样式保持不变 */
.tag-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-container {
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
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
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
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

/* 搜索框样式 - 与分类页面样式匹配 */
.search-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-input {
  width: 100%;
}

.search-section :deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-section :deep(.ant-input-affix-wrapper:hover),
.search-section :deep(.ant-input-affix-wrapper:focus) {
  border-color: #8b5cf6;
  box-shadow: 0 1px 4px rgba(139, 92, 246, 0.15);
}

.search-icon {
  color: #9ca3af;
}

.current-selection {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.selection-label {
  font-size: 14px;
  color: #6b7280;
}

.clear-btn {
  font-size: 13px;
  padding: 0;
  height: auto;
  color: #8b5cf6;
}

/* 标签容器 */
.tags-container {
  max-height: 45vh;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
}

.tags-container::-webkit-scrollbar {
  width: 6px;
}

.tags-container::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 8px;
}

.tags-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 8px;
}

.tags-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.tag-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #8b5cf6;
}

/* 推荐标签样式 */
.recommended-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.tag-item {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tag-item.special {
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.25s ease;
}

.tag-item:hover .tag-content {
  background-color: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tag-item.active .tag-content {
  background-color: #f5f3ff;
  border-color: #ddd6fe;
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tag-text {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  transition: color 0.2s ease;
}

.tag-item.active .tag-text {
  color: #8b5cf6;
}

.tag-count {
  margin-left: 4px;
  font-size: 12px;
  color: #9ca3af;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 全部标签网格 */
.all-tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.tag-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.25s ease;
  cursor: pointer;
  overflow: hidden;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.tag-card.active {
  background-color: #f5f3ff;
  border-color: #ddd6fe;
}

.tag-card-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: calc(100% - 30px);
}

.tag-indicator {
  width: 8px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tag-card:hover .tag-indicator {
  height: 36px;
}

.tag-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}

.tag-card.active .tag-name {
  color: #8b5cf6;
}

.tag-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background-color: #f9fafb;
  color: #9ca3af;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.tag-card.active .tag-checkbox {
  background-color: #8b5cf6;
  color: white;
  border-color: #7c4ddc;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  margin-bottom: 8px;
}

/* 已选标签预览 */
.selected-preview {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-bottom: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.preview-clear {
  font-size: 13px;
  padding: 0;
  height: auto;
  color: #8b5cf6;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 80px;
  overflow-y: auto;
  padding-right: 4px;
}

.selected-tags::-webkit-scrollbar {
  width: 4px;
}

.selected-tags::-webkit-scrollbar-track {
  background: #f9fafb;
}

.selected-tags::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.preview-tag {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 30px;
  background-color: #f5f3ff;
  border: 1px solid #e9d5ff;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.preview-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.remove-tag {
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #9ca3af;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-tag:hover {
  color: #6b7280;
  background-color: #ffffff;
}

/* 底部区域 */
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

.selected-count {
  color: #8b5cf6;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 12px;
}

/* 统一的按钮样式 */
.action-button {
  min-width: 100px;
  height: 40px;
  font-weight: 500;
  padding: 0 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

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

.confirm-button {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border: none;
  color: white;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #7c4ddc 0%, #db2777 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.empty-state-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>