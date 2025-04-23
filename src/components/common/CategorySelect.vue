<template>
  <div class="category-select-container">
    <!-- 主选择框 -->
    <div
        class="category-select-input"
        :class="{ 'is-active': selectedCategory }"
        @click="openModal"
    >
      <div v-if="selectedCategory" class="selected-category">
        <div class="category-icon-box">
          <icon-font v-if="selectedCategory.iconType === 'iconfont'" :type="selectedCategory.icon" />
          <component v-else-if="selectedCategory.icon" :is="resolveIcon(selectedCategory.icon)" />
          <component v-else :is="resolveIcon(getCategoryTypeIcon(selectedCategory.type))" />
        </div>
        <div class="category-name">{{ selectedCategory.name }}</div>
      </div>
      <div v-else class="placeholder">请选择分类</div>

      <div class="select-arrow">
        <TagsOutlined />
      </div>
    </div>

    <!-- 分类选择模态框 -->
    <a-modal
        v-model:visible="modalVisible"
        :title="modalTitle"
        :footer="null"
        :width="520"
        :bodyStyle="{ padding: '0', maxHeight: '70vh', overflow: 'hidden' }"
        :maskClosable="true"
        :destroyOnClose="false"
        @cancel="closeModal"
        class="category-select-modal"
    >
      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-input-wrap">
          <search-outlined class="search-icon" />
          <input
              type="text"
              class="search-input"
              v-model="searchText"
              placeholder="搜索分类..."
              @input="handleSearch"
              @keydown.enter="handleEnterSearch"
              ref="searchInput"
          />
          <close-circle-outlined
              v-if="searchText"
              class="clear-icon"
              @click.stop="clearSearch"
          />
        </div>
      </div>

      <!-- 分类列表区域 -->
      <div class="category-list-container" v-if="!loading">
        <!-- 搜索无结果 -->
        <div class="empty-result" v-if="searchText && filteredCategories.length === 0">
          <inbox-outlined class="empty-icon" />
          <div class="empty-text">未找到匹配的分类</div>
        </div>

        <!-- 分类列表 - 全新设计 -->
        <div class="category-list" v-else>
          <div
              v-for="category in searchText ? filteredCategories : categories"
              :key="category.id"
              class="category-item"
                :class="[
                    `level-${category.level}`,
                    { 'is-active': String(category.id) === String(tempSelectedId) },
                    { 'is-inactive': category.status === 'inactive' }
                  ]"
              @click.stop="category.status !== 'inactive' && handleCategorySelect(category.id)"
          >
            <!-- 左侧: 图标和名称 -->
            <div class="item-left">
              <div class="category-icon-box">
                <icon-font v-if="category.iconType === 'iconfont'" :type="category.icon" />
                <component v-else-if="category.icon" :is="resolveIcon(category.icon)" />
                <component v-else :is="resolveIcon(getCategoryTypeIcon(category.type))" />
              </div>
              <div class="category-name">{{ category.name }}</div>
            </div>

            <!-- 右侧: 状态和操作 -->
            <div class="item-right">
              <!-- 内容数量标签 (模拟数据) -->
              <div v-if="category.contentCount || Math.floor(Math.random() * 100)" class="count-badge">
                {{ formatCount(category.contentCount || Math.floor(Math.random() * 100)) }}
              </div>

              <!-- 状态标签 -->
              <div v-if="category.status === 'inactive'" class="status-badge inactive">
                已禁用
              </div>

              <!-- 展开/折叠图标 -->
              <div
                  v-if="hasChildren(category) && !searchText"
                  class="expand-icon"
                  :class="{ 'is-expanded': isExpanded(category.id) }"
                  @click.stop="toggleExpand(category.id)"
              >
                <right-outlined />
              </div>

              <!-- 选中标记 -->
              <div v-else-if="String(category.id) === String(tempSelectedId)" class="selected-mark">
                <check-outlined />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-else>
        <loading-outlined spin class="loading-icon" />
        <div class="loading-text">加载分类中...</div>
      </div>

      <!-- 底部操作区 -->
      <div class="modal-footer">
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="confirmSelection" :disabled="!tempSelectedId">确认选择</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watchEffect, watch, onMounted, nextTick } from 'vue';
import {
  RightOutlined,
  DownOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InboxOutlined,
  AppstoreOutlined,
  FolderOutlined,
  BookOutlined,
  UserOutlined,
  PictureOutlined,
  TagOutlined,
  TagsOutlined,
  FileImageOutlined,
  BulbOutlined,
  HeartOutlined,
  CameraOutlined,
  StarOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
  CrownOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  AliwangwangOutlined,
  StopOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue';
import { Modal as AModal, Button as AButton, message } from 'ant-design-vue';

// 导入IconFont组件，根据项目实际路径调整
import IconFont from '@/components/common/IconFont.vue';

// 组件属性
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  treeData: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  modalTitle: {
    type: String,
    default: '选择分类'
  }
});

// 事件
const emit = defineEmits(['update:modelValue', 'change']);

// 本地状态
const searchText = ref('');
const expandedIds = ref(new Set());
const modalVisible = ref(false);
const searchInput = ref(null);
const tempSelectedId = ref(null); // 临时存储选中的ID，确认后才更新

// 当前选中的分类对象
const selectedCategory = computed(() => {
  if (!props.modelValue) return null;

  // 在扁平化的分类列表中查找当前选中的分类
  return findCategoryById(props.modelValue, props.treeData);
});

// 递归查找分类
function findCategoryById(id, categories) {
  if (!categories || !Array.isArray(categories)) return null;

  for (const category of categories) {
    if (String(category.id) === String(id)) {
      return category;
    }

    if (category.children && category.children.length > 0) {
      const found = findCategoryById(id, category.children);
      if (found) return found;
    }
  }

  return null;
}

// 打开模态框
function openModal() {
  modalVisible.value = true;
  // 设置临时选中ID为当前选中的值
  tempSelectedId.value = props.modelValue;

  // 在下一个tick后聚焦搜索框
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus();
    }
  });
}

// 关闭模态框
function closeModal() {
  modalVisible.value = false;
  searchText.value = '';
  // 放弃临时选择
  tempSelectedId.value = props.modelValue;
}

// 确认选择
function confirmSelection() {
  if (tempSelectedId.value) {
    emit('update:modelValue', tempSelectedId.value);
    emit('change', tempSelectedId.value);
  }
  closeModal();
}

// 处理回车搜索 - 选择并确认
function handleEnterSearch() {
  // 如果有搜索结果，选择第一个匹配项并自动确认选择
  if (searchText.value && filteredCategories.value.length > 0) {
    const categoryId = filteredCategories.value[0].id;
    const category = findCategoryById(categoryId, props.treeData);

    // 只有active状态的分类才能被选择和确认
    if (category && category.status !== 'inactive') {
      tempSelectedId.value = categoryId;
      // 直接确认选择并关闭模态框
      emit('update:modelValue', categoryId);
      emit('change', categoryId);
      closeModal();
    } else if (category && category.status === 'inactive') {
      // 如果是inactive状态，显示提示消息
      message.warning('该分类当前不可用');
    }
  }
}

// 扁平化所有分类数据，用于显示和搜索
const categories = computed(() => {
  return flattenCategoryTree(props.treeData);
});

// 将树形结构扁平化为列表
function flattenCategoryTree(treeData, level = 1, parentId = null) {
  if (!treeData || !Array.isArray(treeData)) return [];

  let result = [];

  treeData.forEach(category => {
    // 添加扁平化所需的额外属性
    const flatCategory = {
      ...category,
      level,
      parentId,
      // 确保children存在
      children: category.children || []
    };

    // 添加当前分类
    result.push(flatCategory);

    // 如果在搜索中或者已展开，则添加子分类
    if (searchText.value || isExpanded(category.id)) {
      const children = flattenCategoryTree(category.children, level + 1, category.id);
      result.push(...children);
    }
  });

  return result;
}

// 是否有子分类
function hasChildren(category) {
  return category.children && category.children.length > 0;
}

// 是否已展开
function isExpanded(categoryId) {
  return expandedIds.value.has(categoryId);
}

// 切换展开/折叠状态
function toggleExpand(categoryId) {
  if (expandedIds.value.has(categoryId)) {
    expandedIds.value.delete(categoryId);
  } else {
    expandedIds.value.add(categoryId);
  }
}

// 搜索功能
const filteredCategories = computed(() => {
  if (!searchText.value) return categories.value;

  const search = searchText.value.toLowerCase();

  return categories.value.filter(category => {
    return category.name.toLowerCase().includes(search);
  });
});

// 清除搜索
function clearSearch() {
  searchText.value = '';
  if (searchInput.value) {
    searchInput.value.focus();
  }
}

// 处理搜索
function handleSearch() {
  // 搜索处理由computed属性自动完成
}

// 处理分类选择
function handleCategorySelect(categoryId) {
  // 查找分类对象
  const category = findCategoryById(categoryId, props.treeData);

  // 只有active状态的分类才能被选择
  if (category && category.status !== 'inactive') {
    // 在模态框中，我们先临时存储选择，确认后才更新
    tempSelectedId.value = categoryId;
  } else if (category && category.status === 'inactive') {
    // 如果是inactive状态，显示提示消息
    message.warning('该分类当前不可用');
  }
}

// 格式化数量显示
function formatCount(count) {
  if (!count && count !== 0) return '0';

  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

// 获取分类类型对应的图标
function getCategoryTypeIcon(type) {
  const iconMap = {
    'learning': 'book',
    'figure': 'user',
    'wallpaper': 'picture',
    'theme': 'folder',
    'picture': 'file-image',
    'tag': 'tag',
    'photo': 'camera',
    'creative': 'bulb',
    'favorite': 'heart',
    'popular': 'star',
    'collection': 'tags',
    'video': 'video-camera',
    'trending': 'thunderbolt',
    'hot': 'fire',
    'award': 'trophy',
    'premium': 'crown',
    'new': 'rocket',
    'landscape': 'environment',
    'style': 'appstore'
  };

  return iconMap[type] || 'folder';
}

// 解析图标名称为组件
function resolveIcon(iconName) {
  if (!iconName) return FolderOutlined;

  const iconMap = {
    'folder': FolderOutlined,
    'book': BookOutlined,
    'user': UserOutlined,
    'picture': PictureOutlined,
    'tag': TagOutlined,
    'file-image': FileImageOutlined,
    'bulb': BulbOutlined,
    'heart': HeartOutlined,
    'camera': CameraOutlined,
    'star': StarOutlined,
    'tags': TagsOutlined,
    'video-camera': VideoCameraOutlined,
    'thunderbolt': ThunderboltOutlined,
    'fire': FireOutlined,
    'trophy': TrophyOutlined,
    'crown': CrownOutlined,
    'rocket': RocketOutlined,
    'environment': EnvironmentOutlined,
    'appstore': AppstoreOutlined,
    'aliwangwang': AliwangwangOutlined
  };

  // 转换为小写进行匹配
  const lowerCaseName = iconName.toLowerCase();

  if (iconMap[lowerCaseName]) {
    return iconMap[lowerCaseName];
  }

  // 尝试匹配不带后缀的名称
  const nameWithoutSuffix = lowerCaseName.replace(/(outlined|filled|twotone)$/i, '');
  if (iconMap[nameWithoutSuffix]) {
    return iconMap[nameWithoutSuffix];
  }

  return FolderOutlined;
}

// 展开父级分类函数
function expandParentCategories(categoryId) {
  // 查找所有父级分类
  const findParents = (id, categories, path = []) => {
    for (const category of categories) {
      if (String(category.id) === String(id)) {
        return [...path, category.id];
      }

      if (category.children && category.children.length > 0) {
        const found = findParents(id, category.children, [...path, category.id]);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  // 只有当分类树数据存在时才执行
  if (props.treeData && props.treeData.length > 0) {
    const parentIds = findParents(categoryId, props.treeData);
    if (parentIds) {
      parentIds.forEach(id => {
        expandedIds.value.add(id);
      });
    }
  }
}

// 监听 modelValue 变化，展开父级分类
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    expandParentCategories(newVal);
    // 更新临时选中ID
    tempSelectedId.value = newVal;
  }
}, { immediate: true });

// 当模态框打开时，自动展开到当前选中的分类
watch(() => modalVisible.value, (isVisible) => {
  if (isVisible && tempSelectedId.value) {
    expandParentCategories(tempSelectedId.value);
  }
});

// 当选中值变化或展开状态变化时，自动展开父级
watchEffect(() => {
  if (tempSelectedId.value) {
    // 找到当前分类及其所有父级
    const findParents = (categoryId, categories) => {
      for (const category of categories) {
        if (String(category.id) === String(categoryId)) {
          return [category.id];
        }

        if (category.children && category.children.length > 0) {
          const found = findParents(categoryId, category.children);
          if (found) {
            return [category.id, ...found];
          }
        }
      }

      return null;
    };

    // 展开所有父级分类
    const parentIds = findParents(tempSelectedId.value, props.treeData);
    if (parentIds) {
      parentIds.forEach(id => {
        expandedIds.value.add(id);
      });
    }
  }
});
</script>

<style scoped>
/* ========== 全局样式 ========== */
.category-select-container {
  position: relative;
  width: 100%;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ========== 主选择框样式 ========== */
.category-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  background: linear-gradient(to bottom, #ffffff, #fcfcfc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.category-select-input:hover {
  border-color: #7c3aed;
  box-shadow: 0 3px 8px rgba(124, 58, 237, 0.12);
  transform: translateY(-1px);
}

.category-select-input.is-active {
  border-color: #7c3aed;
  background: linear-gradient(to bottom, #f9f7ff, #f3f0ff);
}

.placeholder {
  color: #94a3b8;
  font-size: 14px;
  letter-spacing: 0.3px;
}

.selected-category {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  gap: 10px;
}

.select-arrow {
  color: #94a3b8;
  transition: all 0.3s;
  font-size: 14px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.is-active .select-arrow {
  color: #7c3aed;
}

/* ========== 模态框样式 ========== */
:deep(.category-select-modal) {
  overflow: hidden;
}

:deep(.category-select-modal .ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15);
}

:deep(.category-select-modal .ant-modal-header) {
  padding: 16px 24px;
  background: linear-gradient(to right, #f9f7ff, #f5f3ff);
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
}

:deep(.category-select-modal .ant-modal-title) {
  font-size: 16px;
  color: #4c1d95;
  font-weight: 600;
}

:deep(.category-select-modal .ant-modal-close) {
  color: #7c3aed;
}

:deep(.category-select-modal .ant-modal-body) {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

/* ========== 搜索区域 ========== */
.search-area {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.3));
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  transition: all 0.25s;
  box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.02) inset,
      0 1px 2px rgba(0, 0, 0, 0.04);
}

.search-input-wrap:focus-within {
  border-color: #7c3aed;
  box-shadow:
      0 0 0 3px rgba(124, 58, 237, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.03) inset;
}

.search-icon {
  color: #94a3b8;
  margin-right: 8px;
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  height: 100%;
  color: #334155;
  letter-spacing: 0.2px;
}

.search-input::placeholder {
  color: #cbd5e1;
  font-size: 14px;
}

.clear-icon {
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
  font-size: 16px;
  opacity: 0.8;
}

.clear-icon:hover {
  color: #7c3aed;
  opacity: 1;
  transform: scale(1.1);
}

/* ========== 分类列表区域 ========== */
.category-list-container {
  overflow-y: auto;
  max-height: calc(70vh - 130px);
  padding: 12px;
  flex: 1;
}

/* 自定义滚动条 */
.category-list-container::-webkit-scrollbar {
  width: 6px;
}

.category-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.category-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(124, 58, 237, 0.2);
  border-radius: 10px;
}

.category-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(124, 58, 237, 0.35);
}

/* ========== 分类列表项 - 新设计 ========== */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  height: 46px;
  background-color: rgba(249, 250, 251, 0.7);
  overflow: hidden;
  border: 1px solid transparent;
}

.category-item:hover {
  background-color: #f3f0ff;
  transform: translateY(-2px) scale(1.01);
  box-shadow:
      0 4px 10px -2px rgba(124, 58, 237, 0.1),
      0 2px 4px -2px rgba(124, 58, 237, 0.06);
  border-color: rgba(124, 58, 237, 0.2);
}

.category-item.is-active {
  background-color: #ede9fe;
  box-shadow:
      0 4px 8px -2px rgba(124, 58, 237, 0.15),
      0 2px 4px -2px rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.4);
}

/* ========== 左侧内容区域 ========== */
.item-left {
  display: flex;
  align-items: center;
  padding: 0 12px 0 14px;
  flex: 1;
  min-width: 0;
  height: 100%;
}

/* ========== 右侧内容区域 ========== */
.item-right {
  display: flex;
  align-items: center;
  padding-right: 14px;
  gap: 10px;
  height: 100%;
}

/* ========== 添加子类缩进 - 视觉优化 ========== */
.category-item.level-1 .item-left {
  padding-left: 14px;
}

.category-item.level-2 .item-left {
  padding-left: 24px;
}

.category-item.level-3 .item-left {
  padding-left: 34px;
}

.category-item.level-4 .item-left {
  padding-left: 44px;
}

.category-item.level-5 .item-left {
  padding-left: 54px;
}

/* ========== 分类图标 - 视觉升级 ========== */
.category-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 8px;
  color: #7c3aed;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.25s;
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.08);
  position: relative;
}

.category-icon-box :deep(svg),
.category-icon-box :deep(.anticon),
.category-icon-box :deep(.anticon-font) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主选择框中的图标盒子 */
.selected-category .category-icon-box {
  width: 28px;
  height: 28px;
  font-size: 15px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
}

.is-active .category-icon-box {
  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
  color: #6d28d9;
  transform: scale(1.05);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 3px 6px rgba(124, 58, 237, 0.15);
}

/* ========== 分类名称 - 视觉优化 ========== */
.category-name {
  font-size: 14px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  letter-spacing: 0.2px;
  transition: all 0.2s;
}

.is-active .category-name {
  color: #6d28d9;
  font-weight: 500;
  transform: translateX(2px);
}

/* ========== 计数标签 - 视觉优化 ========== */
.count-badge {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  color: #64748b;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 30px;
  text-align: center;
  transition: all 0.2s;
  font-weight: 500;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.is-active .count-badge {
  background: linear-gradient(to bottom, #ede9fe, #ddd6fe);
  color: #6d28d9;
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
  transform: scale(1.05);
}

/* ========== 状态标签 - 视觉优化 ========== */
.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.status-badge.inactive {
  background: linear-gradient(to bottom, #fff1f0, #ffe4e3);
  color: #e11d48;
  border: 1px solid rgba(225, 29, 72, 0.2);
}

/* ========== 展开/折叠图标 - 视觉优化 ========== */
.expand-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  border-radius: 50%;
  background-color: rgba(241, 245, 249, 0.7);
}

.expand-icon:hover {
  background-color: #e0e7ff;
  color: #6d28d9;
  transform: scale(1.1);
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
  background-color: #ddd6fe;
  color: #6d28d9;
}

.expand-icon.is-expanded:hover {
  background-color: #c4b5fd;
  transform: rotate(90deg) scale(1.1);
}

/* ========== 选中标记 - 视觉优化 ========== */
.selected-mark {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6d28d9;
  background-color: #ddd6fe;
  border-radius: 50%;
  animation: mark-pulse 1.5s infinite alternate ease-in-out;
}

@keyframes mark-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
  100% { transform: scale(1.1); box-shadow: 0 0 8px rgba(124, 58, 237, 0.3); }
}

/* ========== inactive状态的分类项样式 - 视觉优化 ========== */
.category-item.is-inactive {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #f8fafc;
  box-shadow: none;
  filter: grayscale(40%);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.category-item.is-inactive:hover {
  background-color: #f8fafc;
  transform: none;
  box-shadow: none;
}

.category-item.is-inactive .category-name {
  color: #94a3b8;
}

.category-item.is-inactive .category-icon-box {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  color: #94a3b8;
  border-color: rgba(226, 232, 240, 0.8);
  box-shadow: none;
}

/* ========== 加载状态 - 视觉优化 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
  color: #94a3b8;
  height: 200px;
}

.loading-icon {
  font-size: 26px;
  color: #7c3aed;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3));
}

.loading-text {
  font-size: 14px;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: #64748b;
}

/* ========== 空结果状态 - 视觉优化 ========== */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 0;
  color: #94a3b8;
  height: 200px;
}

.empty-icon {
  font-size: 28px;
  color: #cbd5e1;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.empty-text {
  font-size: 14px;
  letter-spacing: 0.3px;
  color: #64748b;
}

/* ========== 模态框底部 ========== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  background-color: #f9f7ff;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  gap: 10px;
}

:deep(.modal-footer .ant-btn) {
  border-radius: 6px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

:deep(.modal-footer .ant-btn-primary) {
  background-color: #7c3aed;
  border-color: #7c3aed;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
}

:deep(.modal-footer .ant-btn-primary:hover) {
  background-color: #6d28d9;
  border-color: #6d28d9;
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}
</style>