<template>
  <div class="category-select-container" v-click-outside="closeDropdown">
    <!-- 主选择框 - 默认显示已选分类或占位文本 -->
    <div
        class="category-select-input"
        :class="{ 'is-focused': dropdownVisible }"
        @click="toggleDropdown"
    >
      <div v-if="selectedCategory" class="selected-category">
        <div class="category-icon-box">
          <!-- 图标显示逻辑与原来相同 -->
          <icon-font v-if="selectedCategory.iconType === 'iconfont'" :type="selectedCategory.icon" />
          <component v-else-if="selectedCategory.icon" :is="resolveIcon(selectedCategory.icon)" />
          <component v-else :is="resolveIcon(getCategoryTypeIcon(selectedCategory.type))" />
        </div>
        <div class="category-name">{{ selectedCategory.name }}</div>
      </div>
      <div v-else class="placeholder">请选择分类</div>

      <div class="select-arrow" :class="{ 'is-rotate': dropdownVisible }">
        <IconFont type="icon-zhankai3" />
      </div>
    </div>

    <!-- 下拉框 -->
    <div class="category-dropdown" v-show="dropdownVisible">
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

        <!-- 分类列表 -->
        <div class="category-list" v-else>
          <div
              v-for="category in searchText ? filteredCategories : categories"
              :key="category.id"
              class="category-item"
              :class="[
              `level-${category.level}`,
              { 'is-active': String(category.id) === String(modelValue) }
            ]"
              @click.stop="handleCategorySelect(category.id)"
          >
            <!-- 分类图标，根据iconType和icon确定显示方式 -->
            <div class="category-icon-box">
              <icon-font v-if="category.iconType === 'iconfont'" :type="category.icon" />
              <component v-else-if="category.icon" :is="resolveIcon(category.icon)" />
              <component v-else :is="resolveIcon(getCategoryTypeIcon(category.type))" />
            </div>

            <!-- 分类名称 -->
            <div class="category-name">{{ category.name }}</div>

            <!-- 数量标签 -->
<!--            <div v-if="category.contentCount" class="count-tag">-->
<!--              {{ formatCount(category.contentCount) }}-->
<!--            </div>-->

            <!-- 展开/折叠图标，只对有子分类的项显示 -->
            <div
                v-if="hasChildren(category) && !searchText"
                class="expand-icon"
                :class="{ 'is-expanded': isExpanded(category.id) }"
                @click.stop="toggleExpand(category.id)"
            >
              <IconFont type="icon-xiala" />
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-else>
        <loading-outlined spin class="loading-icon" />
        <div class="loading-text">加载分类中...</div>
      </div>
    </div>
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
  FileImageOutlined,
  BulbOutlined,
  HeartOutlined,
  CameraOutlined,
  StarOutlined,
  TagsOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
  CrownOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  AliwangwangOutlined
} from '@ant-design/icons-vue';

// 导入IconFont组件，根据项目实际路径调整
import IconFont from '@/components/common/IconFont.vue';
import { message } from "ant-design-vue";

// 添加点击外部关闭下拉框的指令
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};

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
  }
});

// 事件
const emit = defineEmits(['update:modelValue', 'change']);

// 本地状态
const searchText = ref('');
const expandedIds = ref(new Set());
const dropdownVisible = ref(false);
const searchInput = ref(null);

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

// 切换下拉框显示状态
function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value;

  // 如果打开下拉框，则在下一个tick后聚焦搜索框
  if (dropdownVisible.value) {
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    });
  }
}

// 关闭下拉框
function closeDropdown() {
  dropdownVisible.value = false;
  searchText.value = '';
}

// 处理回车搜索
function handleEnterSearch() {
  // 如果有搜索结果，选择第一个匹配项
  if (searchText.value && filteredCategories.value.length > 0) {
    handleCategorySelect(filteredCategories.value[0].id);
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

    // 如果展开了，则添加子分类
    if (isExpanded(category.id) && !searchText.value) {
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
  emit('update:modelValue', categoryId);
  emit('change', categoryId);
  closeDropdown(); // 选择后关闭下拉框
}

// 格式化数量显示
function formatCount(count) {
  if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}k`;
  }
  return count;
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

// 添加一个函数用于展开所有父级分类
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
      console.log('已展开父级分类:', parentIds);
    } else {
      console.log('未找到分类ID对应的分类项:', categoryId);
    }
  }
}

// 监听 modelValue 变化，展开父级分类
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    expandParentCategories(newVal);
    console.log('分类选择器收到新的选中值:', newVal);
  }
}, { immediate: true });

// 当选中值变化或展开状态变化时，自动展开父级
watchEffect(() => {
  if (props.modelValue) {
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
    const parentIds = findParents(props.modelValue, props.treeData);
    if (parentIds) {
      parentIds.forEach(id => {
        expandedIds.value.add(id);
      });
    }
  }
});
</script>

<style scoped>
.category-select-container {
  position: relative;
  width: 100%;
}

/* 主选择框样式 */
.category-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-select-input:hover {
  border-color: #8b5cf6;
}

.category-select-input.is-focused {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.placeholder {
  color: #a3a3a3;
  font-size: 14px;
}

.selected-category {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.select-arrow {
  color: #a3a3a3;
  transition: transform 0.3s;
  margin-left: 8px;
}

.select-arrow.is-rotate {
  transform: rotate(180deg);
}

/* 下拉框样式 */
.category-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

/* 搜索区域 */
.search-area {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 10px;
  height: 36px;
  transition: all 0.2s;
}

.search-input-wrap:focus-within {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.search-icon {
  color: #a3a3a3;
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
  color: #333;
}

.clear-icon {
  cursor: pointer;
  color: #a3a3a3;
  transition: color 0.2s;
  font-size: 16px;
}

.clear-icon:hover {
  color: #666;
}

/* 分类列表区域 */
.category-list-container {
  overflow-y: auto;
  max-height: 300px;
  padding: 8px 0;
}

/* 自定义滚动条 */
.category-list-container::-webkit-scrollbar {
  width: 6px;
}

.category-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.category-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.category-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 分类列表项 */
.category-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  position: relative;
  cursor: pointer;
  margin: 2px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: #f5f3ff;
}

.category-item.is-active {
  background-color: #ede9fe;
}

/* 添加子类缩进 */
.category-item.level-2 {
  padding-left: 28px;
}

.category-item.level-3 {
  padding-left: 40px;
}

.category-item.level-4 {
  padding-left: 52px;
}

.category-item.level-5 {
  padding-left: 64px;
}

/* 分类图标 */
.category-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: #f5f3ff;
  border-radius: 8px;
  color: #8b5cf6;
  font-size: 16px;
  flex-shrink: 0;
}

/* 主选择框中的图标盒子稍小一些 */
.selected-category .category-icon-box {
  width: 28px;
  height: 28px;
  font-size: 14px;
}

.is-active .category-icon-box {
  background-color: #ddd6fe;
  color: #7c3aed;
}

/* 分类名称 */
.category-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-active .category-name {
  color: #7c3aed;
  font-weight: 500;
}

/* 数量标签 */
.count-tag {
  background-color: #ede9fe;
  color: #8b5cf6;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.is-active .count-tag {
  background-color: #ddd6fe;
  color: #7c3aed;
}

/* 展开/折叠图标 */
.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a3a3a3;
  margin-left: 8px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #a3a3a3;
}

.loading-icon {
  font-size: 24px;
  color: #8b5cf6;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 14px;
}

/* 空结果状态 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #a3a3a3;
}

.empty-icon {
  font-size: 24px;
  color: #d4d4d4;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
}
</style>