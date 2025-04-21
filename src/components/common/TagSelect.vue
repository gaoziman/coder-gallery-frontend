<template>
  <div class="tag-select-container" v-click-outside="closeDropdown">
    <!-- 主选择框 - 显示已选标签 -->
    <div
        class="tag-select-input"
        :class="{ 'is-focused': dropdownVisible }"
        @click="toggleDropdown"
    >
      <!-- 已选标签显示区域 -->
      <div class="selected-tags-container" v-if="modelValue && modelValue.length > 0">
        <div v-for="tag in selectedTags" :key="tag.value" class="tag-item">
          <span class="tag-name">{{ tag.label }}</span>
          <close-circle-outlined class="tag-remove" @click.stop="removeTag(tag)" />
        </div>
      </div>

      <!-- 占位文本 -->
      <div v-else class="placeholder">请选择标签</div>

      <!-- 下拉箭头 -->
      <div class="select-arrow" :class="{ 'is-rotate': dropdownVisible }">
        <down-outlined />
      </div>
    </div>

    <!-- 下拉框 -->
    <div class="tag-dropdown" v-show="dropdownVisible">
      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-input-wrap">
          <search-outlined class="search-icon" />
          <input
              type="text"
              class="search-input"
              v-model="searchText"
              placeholder="搜索标签..."
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

      <!-- 标签列表区域 -->
      <div class="tag-list-container" v-if="!loading">
        <!-- 搜索无结果 -->
        <div class="empty-result" v-if="searchText && filteredTags.length === 0">
          <inbox-outlined class="empty-icon" />
          <div class="empty-text">未找到匹配的标签</div>
        </div>

        <!-- 标签列表 -->
        <div class="tag-list" v-else>
          <div
              v-for="tag in filteredTags"
              :key="tag.value"
              class="tag-list-item"
              :class="{ 'is-selected': isTagSelected(tag.value) }"
              @click.stop="toggleTag(tag)"
          >
            <div class="tag-icon-box">
              <tag-outlined />
            </div>
            <div class="tag-name">{{ tag.label }}</div>
            <check-outlined v-if="isTagSelected(tag.value)" class="check-icon" />
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-else>
        <loading-outlined spin class="loading-icon" />
        <div class="loading-text">加载标签中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, nextTick } from 'vue';
import {
  DownOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InboxOutlined,
  TagOutlined,
  CheckOutlined
} from '@ant-design/icons-vue';

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
    type: Array,
    default: () => []
  },
  options: {
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
const dropdownVisible = ref(false);
const searchInput = ref(null);

// 已选标签列表
const selectedTags = computed(() => {
  if (!props.modelValue || !Array.isArray(props.modelValue) || props.modelValue.length === 0) {
    return [];
  }

  // 获取所有已选的完整标签对象
  return props.modelValue.map(tag => {
    // 处理不同类型的标签值
    const tagValue = typeof tag === 'object' ? tag.value : tag;

    // 尝试在选项中找到完整的标签对象
    const foundTag = props.options.find(option => String(option.value) === String(tagValue));

    // 如果找到则返回完整对象，否则构建一个基础对象
    if (foundTag) {
      return foundTag;
    } else {
      // 如果是对象，使用其现有属性，否则创建新对象
      return typeof tag === 'object'
          ? tag
          : { value: tag, label: String(tag) };
    }
  });
});

// 过滤后的标签列表（用于显示）
const filteredTags = computed(() => {
  if (!searchText.value) {
    return props.options;
  }

  const search = searchText.value.toLowerCase();
  return props.options.filter(tag =>
      tag.label.toLowerCase().includes(search)
  );
});

// 判断标签是否已选中
function isTagSelected(value) {
  if (!props.modelValue || !Array.isArray(props.modelValue)) {
    return false;
  }

  return props.modelValue.some(tag => {
    const tagValue = typeof tag === 'object' ? tag.value : tag;
    return String(tagValue) === String(value);
  });
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
  // 如果有搜索结果且没有选中，则选择第一个匹配项
  if (searchText.value && filteredTags.value.length > 0) {
    const firstMatch = filteredTags.value[0];
    if (!isTagSelected(firstMatch.value)) {
      toggleTag(firstMatch);
    }
  }
}

// 切换标签选中状态
function toggleTag(tag) {
  let newValue = [...(props.modelValue || [])];

  if (isTagSelected(tag.value)) {
    // 如果已选中，则移除
    newValue = newValue.filter(item => {
      const itemValue = typeof item === 'object' ? item.value : item;
      return String(itemValue) !== String(tag.value);
    });
  } else {
    // 如果未选中，则添加
    newValue.push(tag);
  }

  emit('update:modelValue', newValue);
  emit('change', newValue);
}

// 移除标签
function removeTag(tag) {
  const newValue = props.modelValue.filter(item => {
    const itemValue = typeof item === 'object' ? item.value : item;
    return String(itemValue) !== String(tag.value);
  });

  emit('update:modelValue', newValue);
  emit('change', newValue);
}

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

// 监听 modelValue 变化，打印日志
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    console.log('标签选择器收到新的选中值:', newVal);
  }
}, { deep: true });
</script>

<style scoped>
.tag-select-container {
  position: relative;
  width: 100%;
}

/* 主选择框样式 */
.tag-select-input {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 4px 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  flex-wrap: wrap;
}

.tag-select-input:hover {
  border-color: #8b5cf6;
}

.tag-select-input.is-focused {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.placeholder {
  color: #a3a3a3;
  font-size: 14px;
  flex: 1;
}

.selected-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  padding: 2px 0;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: #f5f3ff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
  color: #7c3aed;
  gap: 6px;
}

.tag-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-remove {
  cursor: pointer;
  color: #8b5cf6;
  font-size: 14px;
}

.tag-remove:hover {
  color: #6d28d9;
}

.select-arrow {
  color: #a3a3a3;
  transition: transform 0.3s;
  margin-left: 8px;
  flex-shrink: 0;
}

.select-arrow.is-rotate {
  transform: rotate(180deg);
}

/* 下拉框样式 */
.tag-dropdown {
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

/* 标签列表区域 */
.tag-list-container {
  overflow-y: auto;
  max-height: 300px;
  padding: 8px 0;
}

/* 自定义滚动条 */
.tag-list-container::-webkit-scrollbar {
  width: 6px;
}

.tag-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.tag-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.tag-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 标签列表项 */
.tag-list-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  position: relative;
  cursor: pointer;
  margin: 2px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.tag-list-item:hover {
  background-color: #f5f3ff;
}

.tag-list-item.is-selected {
  background-color: #ede9fe;
}

/* 标签图标 */
.tag-icon-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: #f5f3ff;
  border-radius: 8px;
  color: #8b5cf6;
  font-size: 14px;
  flex-shrink: 0;
}

.is-selected .tag-icon-box {
  background-color: #ddd6fe;
  color: #7c3aed;
}

.check-icon {
  margin-left: auto;
  color: #7c3aed;
  font-size: 16px;
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