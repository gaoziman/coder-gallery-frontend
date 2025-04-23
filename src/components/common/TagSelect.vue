<template>
  <div class="tag-select-container">
    <!-- 主选择框 -->
    <div
        class="tag-select-input"
        :class="{ 'is-active': modelValue && modelValue.length > 0 }"
        @click="openModal"
    >
      <!-- 已选标签显示区域 -->
      <div class="selected-tags-container" v-if="modelValue && modelValue.length > 0">
        <div v-for="tag in selectedTags" :key="tag.value" class="tag-item">
          <div class="tag-icon-box">
            <tag-outlined />
          </div>
          <span class="tag-name">{{ tag.label }}</span>
        </div>
      </div>

      <!-- 占位文本 -->
      <div v-else class="placeholder">请选择标签</div>

      <!-- 箭头图标 -->
      <div class="select-arrow">
        <tag-outlined />
      </div>
    </div>

    <!-- 标签选择模态框 -->
    <a-modal
        v-model:visible="modalVisible"
        :title="modalTitle"
        :footer="null"
        :width="520"
        :bodyStyle="{ padding: '0', maxHeight: '70vh', overflow: 'hidden' }"
        :maskClosable="true"
        :destroyOnClose="false"
        @cancel="closeModal"
        class="tag-select-modal"
    >
      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-input-wrap">
          <search-outlined class="search-icon" />
          <input
              type="text"
              class="search-input"
              v-model="searchText"
              placeholder="搜索标签或输入新标签后回车创建..."
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
      <div class="tag-list-container" v-if="!loading && !creatingTag">
        <!-- 搜索无结果 -->
        <div class="empty-result" v-if="searchText && allFilteredTags.length === 0">
          <div v-if="allowCreate" class="create-tag-hint">
            <plus-outlined class="create-icon" />
            <div class="create-text">按回车创建标签 "{{ searchText }}"</div>
          </div>
          <div v-else>
            <inbox-outlined class="empty-icon" />
            <div class="empty-text">未找到匹配的标签</div>
          </div>
        </div>

        <!-- 标签列表 -->
        <div class="tag-list" v-else>
          <div
              v-for="tag in filteredTags"
              :key="tag.value"
              class="tag-list-item"
              :class="{
                'is-active': isTagSelected(tag.value),
                'is-inactive': tag.status === 'inactive'
              }"
              @click.stop="tag.status !== 'inactive' && toggleTag(tag)"
          >
            <!-- 左侧: 图标和名称 -->
            <div class="item-left">
              <div class="tag-icon-box">
                <tag-outlined />
              </div>
              <div class="tag-name">{{ tag.label }}</div>
            </div>

            <!-- 右侧: 状态和操作 -->
            <div class="item-right">
              <!-- 状态标签 -->
              <div v-if="tag.status === 'inactive'" class="status-badge inactive">
                已禁用
              </div>

              <!-- 选中标记 -->
              <div v-else-if="isTagSelected(tag.value)" class="selected-mark">
                <check-outlined />
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控制器 -->
        <div class="pagination-container" v-if="allFilteredTags.length > pageSize">
          <div class="pagination-controls">
            <a-button
                type="text"
                shape="circle"
                @click="prevPage"
                :disabled="currentPage === 1"
                class="page-btn"
            >
              <left-outlined />
            </a-button>

            <div class="page-indicator">
              {{ currentPage }} / {{ totalPages }}
            </div>

            <a-button
                type="text"
                shape="circle"
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="page-btn"
            >
              <right-outlined />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-else>
        <loading-outlined spin class="loading-icon" />
        <div class="loading-text">{{ creatingTag ? '创建标签中...' : '加载标签中...' }}</div>
      </div>

      <!-- 底部操作区 -->
      <div class="modal-footer">
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="confirmSelection" :disabled="!tempSelectedTags || tempSelectedTags.length === 0">确认选择</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, nextTick } from 'vue';
import {
  SearchOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InboxOutlined,
  TagOutlined,
  CheckOutlined,
  PlusOutlined,
  StopOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import { Modal as AModal, Button as AButton, message } from 'ant-design-vue';
import { createTagUsingPost } from '@/api/biaoqianguanli';

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
  },
  allowCreate: {
    type: Boolean,
    default: true
  },
  modalTitle: {
    type: String,
    default: '选择标签'
  }
});

// 事件
const emit = defineEmits(['update:modelValue', 'change', 'create']);

// 本地状态
const searchText = ref('');
const modalVisible = ref(false);
const searchInput = ref(null);
const creatingTag = ref(false);
const tempSelectedTags = ref([]);
const localTags = ref([]);

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(8); // 每页显示8条数据

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

// 所有过滤后的标签(不分页)
const allFilteredTags = computed(() => {
  if (!searchText.value) {
    // 将本地创建的新标签与props.options合并显示
    return localTags.value.length > 0 ?
        [...props.options, ...localTags.value] :
        props.options;
  }

  const search = searchText.value.toLowerCase();
  const allOptions = localTags.value.length > 0 ?
      [...props.options, ...localTags.value] :
      props.options;

  return allOptions.filter(tag =>
      tag.label.toLowerCase().includes(search)
  );
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(allFilteredTags.value.length / pageSize.value);
});

// 当前页显示的标签
const filteredTags = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = currentPage.value * pageSize.value;
  return allFilteredTags.value.slice(startIndex, endIndex);
});

// 分页控制函数
const changePage = (page) => {
  currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 打开模态框
function openModal() {
  modalVisible.value = true;
  // 初始化临时选择为当前已选标签
  tempSelectedTags.value = [...(props.modelValue || [])];

  // 重置页码
  currentPage.value = 1;

  // 注意：不再清空localTags，使新创建的标签在会话期间持久存在

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
  tempSelectedTags.value = [...(props.modelValue || [])];
}

// 确认选择
function confirmSelection() {
  emit('update:modelValue', tempSelectedTags.value);
  emit('change', tempSelectedTags.value);
  closeModal();
}

// 判断标签是否已选中
function isTagSelected(value) {
  if (!tempSelectedTags.value || !Array.isArray(tempSelectedTags.value)) {
    return false;
  }

  return tempSelectedTags.value.some(tag => {
    const tagValue = typeof tag === 'object' ? tag.value : tag;
    return String(tagValue) === String(value);
  });
}

// 切换标签选中状态
function toggleTag(tag) {
  // 如果标签状态为inactive，则不允许选择
  if (tag.status === 'inactive') {
    message.warning(`标签 "${tag.label}" 已禁用，无法选择`);
    return;
  }

  let newValue = [...tempSelectedTags.value];

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

  tempSelectedTags.value = newValue;
}

// 创建新标签函数
async function createNewTag(tagName) {
  if (!tagName || tagName.trim() === '') {
    return null;
  }

  // 检查是否已存在相同标签
  const allTags = [...props.options, ...localTags.value];
  const existingTag = allTags.find(tag =>
      tag.label.toLowerCase() === tagName.toLowerCase()
  );

  if (existingTag) {
    message.info(`标签 "${tagName}" 已存在`);
    return existingTag;
  }

  creatingTag.value = true;
  try {
    // 调用创建标签API
    const result = await createTagUsingPost({
      name: tagName.trim(),
      status: 'active'
    });

    if (result && result.data && result.data.data) {
      const tagId = result.data.data;
      const newTag = {
        value: tagId,
        label: tagName.trim(),
        status: 'active'
      };

      // 触发创建事件，让父组件可以更新标签列表
      emit('create', newTag);

      // 将新创建的标签添加到本地标签列表
      localTags.value.push(newTag);

      // 自动选中新创建的标签
      toggleTag(newTag);

      // 清空搜索文本，显示完整列表（包含新标签）
      searchText.value = '';

      // 等待Vue更新计算属性
      await nextTick();

      // 找出新标签在列表中的位置并计算它所在的页码
      const allTagsArray = [...allFilteredTags.value];
      const newTagIndex = allTagsArray.findIndex(tag => String(tag.value) === String(newTag.value));

      if (newTagIndex !== -1) {
        // 计算标签所在页码并跳转
        const tagPage = Math.floor(newTagIndex / pageSize.value) + 1;
        currentPage.value = tagPage;
        console.log(`新标签在第${tagPage}页，索引位置：${newTagIndex}`);
      } else {
        // 如果找不到标签（不太可能发生），则回到第1页
        currentPage.value = 1;
      }

      message.success(`成功创建标签 "${tagName}"`);
      return newTag;
    } else {
      message.error('创建标签失败');
      return null;
    }
  } catch (error) {
    console.error('创建标签错误:', error);
    message.error(`创建标签失败: ${error.message || '未知错误'}`);
    return null;
  } finally {
    creatingTag.value = false;
  }
}

// 处理回车搜索/创建标签
async function handleEnterSearch() {
  if (!searchText.value) return;

  // 如果有搜索结果且没有选中，则选择第一个匹配项
  if (filteredTags.value.length > 0) {
    const firstMatch = filteredTags.value[0];

    // 检查标签状态是否为激活状态
    if (firstMatch.status === 'inactive') {
      message.warning(`标签 "${firstMatch.label}" 已禁用，无法选择`);
      return;
    }

    if (!isTagSelected(firstMatch.value)) {
      toggleTag(firstMatch);
    }
    return;
  }

  // 如果没有匹配结果，且允许创建，则创建新标签
  if (props.allowCreate && searchText.value.trim() !== '') {
    const newTag = await createNewTag(searchText.value);
    if (newTag) {
      // 注意：不需要再次调用toggleTag，因为createNewTag已经直接添加标签到选中列表
      searchText.value = '';
    }
  }
}

// 清除搜索
function clearSearch() {
  searchText.value = '';
  currentPage.value = 1; // 重置页码
  if (searchInput.value) {
    searchInput.value.focus();
  }
}

// 处理搜索
function handleSearch() {
  // 搜索处理由computed属性自动完成
  currentPage.value = 1; // 搜索时重置页码
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 同步临时选中状态
    tempSelectedTags.value = [...newVal];
  }
}, { deep: true });

// 监听模态框状态
watch(() => modalVisible.value, (isVisible) => {
  if (isVisible) {
    // 模态框打开时，初始化临时选中状态
    tempSelectedTags.value = [...(props.modelValue || [])];
  }
});

// 监听props.options变化，同步本地标签与全局标签
watch(() => props.options, (newOptions) => {
  if (localTags.value.length > 0 && newOptions && Array.isArray(newOptions)) {
    // 查找哪些本地创建的标签已经被添加到全局选项中
    const tagsToRemove = [];

    localTags.value.forEach((localTag) => {
      const isInGlobalOptions = newOptions.some(
          option => String(option.value) === String(localTag.value) ||
              option.label.toLowerCase() === localTag.label.toLowerCase()
      );

      if (isInGlobalOptions) {
        tagsToRemove.push(localTag);
      }
    });

    // 从本地标签中移除已存在于全局的标签
    if (tagsToRemove.length > 0) {
      localTags.value = localTags.value.filter(tag =>
          !tagsToRemove.some(r => String(r.value) === String(tag.value))
      );
    }
  }
}, { deep: true });
</script>

<style scoped>
/* ========== 全局样式 ========== */
.tag-select-container {
  position: relative;
  width: 100%;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ========== 主选择框样式 ========== */
.tag-select-input {
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px; /* 保持固定高度与分类选择器一致 */
  padding: 0 14px;
  background: linear-gradient(to bottom, #ffffff, #fcfcfc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.tag-select-input:hover {
  border-color: #7c3aed;
  box-shadow: 0 3px 8px rgba(124, 58, 237, 0.12);
  transform: translateY(-1px);
}

.tag-select-input.is-active {
  border-color: #7c3aed;
  background: linear-gradient(to bottom, #f9f7ff, #f3f0ff);
}

.placeholder {
  color: #94a3b8;
  font-size: 14px;
  letter-spacing: 0.3px;
  flex: 1;
}

.selected-tags-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
  height: 100%;
  white-space: nowrap;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background-color: #f5f3ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
  color: #7c3aed;
  gap: 6px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  transition: all 0.2s;
  height: 26px;
  max-width: 150px;
}

.tag-item:hover {
  background-color: #ede9fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
}

.tag-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
:deep(.tag-select-modal) {
  overflow: hidden;
}

:deep(.tag-select-modal .ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15);
}

:deep(.tag-select-modal .ant-modal-header) {
  padding: 16px 24px;
  background: linear-gradient(to right, #f9f7ff, #f5f3ff);
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
}

:deep(.tag-select-modal .ant-modal-title) {
  font-size: 16px;
  color: #4c1d95;
  font-weight: 600;
}

:deep(.tag-select-modal .ant-modal-close) {
  color: #7c3aed;
}

:deep(.tag-select-modal .ant-modal-body) {
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

/* ========== 标签列表区域 ========== */
.tag-list-container {
  overflow-y: auto;
  max-height: calc(70vh - 130px);
  padding: 12px;
  flex: 1;
}

/* 自定义滚动条 */
.tag-list-container::-webkit-scrollbar {
  width: 6px;
}

.tag-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.tag-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(124, 58, 237, 0.2);
  border-radius: 10px;
}

.tag-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(124, 58, 237, 0.35);
}

/* ========== 标签列表项 - 新设计 ========== */
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-list-item {
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

.tag-list-item:hover {
  background-color: #f3f0ff;
  transform: translateY(-2px) scale(1.01);
  box-shadow:
      0 4px 10px -2px rgba(124, 58, 237, 0.1),
      0 2px 4px -2px rgba(124, 58, 237, 0.06);
  border-color: rgba(124, 58, 237, 0.2);
}

.tag-list-item.is-active {
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

/* ========== 标签图标 - 视觉升级 ========== */
.tag-icon-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 6px;
  color: #7c3aed;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.25s;
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.08);
  position: relative;
}

.tag-icon-box :deep(svg),
.tag-icon-box :deep(.anticon) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主选择框中标签项的图标 */
.tag-item .tag-icon-box {
  width: 20px;
  height: 20px;
  font-size: 12px;
  margin-right: 4px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
}

.is-active .tag-icon-box {
  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
  color: #6d28d9;
  transform: scale(1.05);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 3px 6px rgba(124, 58, 237, 0.15);
}

/* ========== 标签名称 - 视觉优化 ========== */
.tag-name {
  font-size: 13px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  letter-spacing: 0.2px;
  transition: all 0.2s;
  max-width: 120px;
}

.more-tags {
  color: #7c3aed;
  font-size: 12px;
  background-color: #f5f3ff;
  border-radius: 4px;
  padding: 2px 6px;
  height: 20px;
  line-height: 16px;
  margin-left: 4px;
  border: 1px solid rgba(124, 58, 237, 0.15);
}

.is-active .tag-name {
  color: #6d28d9;
  font-weight: 500;
  transform: translateX(2px);
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

/* ========== inactive状态的标签项样式 - 视觉优化 ========== */
.tag-list-item.is-inactive {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #f8fafc;
  box-shadow: none;
  filter: grayscale(40%);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.tag-list-item.is-inactive:hover {
  background-color: #f8fafc;
  transform: none;
  box-shadow: none;
}

.tag-list-item.is-inactive .tag-name {
  color: #94a3b8;
}

.tag-list-item.is-inactive .tag-icon-box {
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

/* ========== 创建标签提示样式 - 视觉优化 ========== */
.create-tag-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.3s;
}

.create-tag-hint:hover {
  transform: scale(1.05);
}

.create-icon {
  font-size: 24px;
  color: #7c3aed;
  margin-bottom: 12px;
  background-color: #f5f3ff;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  border: 1px solid rgba(124, 58, 237, 0.2);
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.15);
}

.create-tag-hint:hover .create-icon {
  background-color: #ede9fe;
  transform: rotate(90deg);
  box-shadow: 0 6px 14px rgba(124, 58, 237, 0.25);
}

.create-text {
  font-size: 15px;
  color: #7c3aed;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
}

/* ========== 分页控制器样式 ========== */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  margin-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f9f7ff;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-indicator {
  font-size: 14px;
  color: #6d28d9;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #ede9fe;
  color: #6d28d9;
  transform: translateY(-2px);
}

.page-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
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