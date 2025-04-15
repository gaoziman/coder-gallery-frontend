<template>
  <div class="icon-selector-wrapper">
    <!-- 切换标签页 -->
    <a-tabs v-model:activeKey="activeTabKey" class="icon-tabs">
      <a-tab-pane key="iconfont" tab="IconFont图标">
        <div class="search-bar">
          <a-input
              v-model:value="searchText"
              placeholder="搜索图标"
              allow-clear
              class="search-input"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>

          <div class="tool-right">
            <a-select
                v-model:value="sortOrder"
                style="width: 150px"
                placeholder="排序方式"
            >
              <a-select-option value="name-asc">名称 (A-Z)</a-select-option>
              <a-select-option value="name-desc">名称 (Z-A)</a-select-option>
              <a-select-option value="recent">最近添加</a-select-option>
            </a-select>

            <a-select
                v-model:value="pageSize"
                style="width: 120px"
                title="每页显示图标数量"
            >
              <a-select-option :value="36">36个/页</a-select-option>
              <a-select-option :value="48">48个/页</a-select-option>
              <a-select-option :value="64">64个/页</a-select-option>
              <a-select-option :value="100">100个/页</a-select-option>
            </a-select>
          </div>
        </div>

        <a-spin :spinning="loading">
          <a-empty
              v-if="filteredIcons.length === 0"
              description="未找到图标"
          >
            <template #extra>
              <a-button type="primary" @click="openIconManager">
                管理图标
              </a-button>
            </template>
          </a-empty>

          <div v-else class="icon-grid">
            <div
                v-for="icon in paginatedIcons"
                :key="icon.id"
                class="icon-grid-item"
                :class="{ 'selected': selectedIconValue === icon.id }"
                @click="selectIcon(icon.id)"
            >
              <div class="icon-wrapper">
                <IconFont :type="icon.id" size="20" />
              </div>
              <div class="icon-name">{{ formatIconName(icon.name) }}</div>
            </div>
          </div>

          <div class="pagination-container">
            <div class="pagination-info">
              <span>共 {{ filteredIcons.length }} 个图标</span>
            </div>
            <a-pagination
                v-model:current="currentPage"
                :total="filteredIcons.length"
                :pageSize="pageSize"
                :showTotal="total => `共 ${total} 个图标`"
                :showSizeChanger="false"
                :showQuickJumper="true"
            />
          </div>
        </a-spin>
      </a-tab-pane>

      <a-tab-pane key="ant" tab="Ant Design图标">
        <div class="search-bar">
          <a-input
              v-model:value="antSearchText"
              placeholder="搜索图标"
              allow-clear
              class="search-input"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>

          <div class="tool-right">
            <a-radio-group v-model:value="antIconType" button-style="solid" class="custom-radio-group">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="outlined">线框风格</a-radio-button>
              <a-radio-button value="filled">实底风格</a-radio-button>
            </a-radio-group>
          </div>
        </div>

        <a-spin :spinning="antLoading">
          <a-empty
              v-if="filteredAntIcons.length === 0"
              description="未找到图标"
          />

          <div v-else class="icon-grid">
            <div
                v-for="icon in paginatedAntIcons"
                :key="icon.name"
                class="icon-grid-item"
                :class="{ 'selected': selectedIconValue === icon.name }"
                @click="selectIcon(icon.name)"
            >
              <div class="icon-wrapper">
                <component :is="icon.component" />
              </div>
              <div class="icon-name">{{ formatIconName(formatAntIconName(icon.name)) }}</div>
            </div>
          </div>

          <div class="pagination-container">
            <div class="pagination-info">
              <span>共 {{ filteredAntIcons.length }} 个图标</span>
            </div>
            <a-pagination
                v-model:current="antCurrentPage"
                :total="filteredAntIcons.length"
                :pageSize="pageSize"
                :showTotal="total => `共 ${total} 个图标`"
                :showSizeChanger="false"
                :showQuickJumper="true"
            />
          </div>
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import * as AntIcons from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import IconFont from '@/components/common/IconFont.vue';
import iconService from '@/services/IconService';

const props = defineProps({
  value: String,
  visible: Boolean
});

const emit = defineEmits(['update:value', 'select', 'cancel', 'confirm']);

// 标签页状态
const activeTabKey = ref('iconfont');

// 状态
const loading = ref(false);
const antLoading = ref(false);
const icons = ref([]);
const antIcons = ref([]);
const searchText = ref('');
const antSearchText = ref('');
const sortOrder = ref('name-asc');
const antIconType = ref('all');

// 分页相关状态
const pageSize = ref(48);
const currentPage = ref(1);
const antCurrentPage = ref(1);

// 临时选中的图标
const selectedIconValue = ref(props.value || '');

// 格式化图标名称，处理过长的名称
const formatIconName = (name) => {
  if (!name) return '';
  if (name.length > 12) {
    return name.substring(0, 10) + '...';
  }
  return name;
};

// 监听value变化
watch(() => props.value, (newVal) => {
  selectedIconValue.value = newVal || '';
});

// 监听visible变化，重置一些状态
watch(() => props.visible, (visible) => {
  if (visible) {
    selectedIconValue.value = props.value || '';
  }
});

// 初始化组件
onMounted(() => {
  // 初始化前确保图标服务已经加载
  iconService.init();
  loadIcons();
  loadAntIcons();

  // 从localStorage恢复设置
  const savedPageSize = localStorage.getItem('icon-selector-page-size');
  if (savedPageSize) {
    pageSize.value = parseInt(savedPageSize);
  }

  // 根据当前值确定初始标签页
  if (props.value) {
    // 如果值是以icon-开头，则选择iconfont标签页
    if (props.value.startsWith('icon-')) {
      activeTabKey.value = 'iconfont';
    }
    // 如果值是以Outlined、Filled或TwoTone结尾，则选择ant标签页
    else if (props.value.endsWith('Outlined') || props.value.endsWith('Filled') || props.value.endsWith('TwoTone')) {
      activeTabKey.value = 'ant';
    }
  }
});

// 监听pageSize变化，保存到localStorage
watch(pageSize, (newValue) => {
  localStorage.setItem('icon-selector-page-size', newValue.toString());
});

// 当分页大小变化时，重置为第一页
watch([pageSize, activeTabKey], () => {
  if (activeTabKey.value === 'iconfont') {
    currentPage.value = 1;
  } else {
    antCurrentPage.value = 1;
  }
});

// 当搜索条件变化时，重置分页
watch(searchText, () => {
  currentPage.value = 1;
});

watch(antSearchText, () => {
  antCurrentPage.value = 1;
});

watch(antIconType, () => {
  antCurrentPage.value = 1;
});

// 获取Ant Design图标
const loadAntIcons = () => {
  antLoading.value = true;

  try {
    const iconList = [];

    Object.entries(AntIcons).forEach(([name, component]) => {
      if (name.endsWith('Outlined') || name.endsWith('Filled')) {
        iconList.push({
          name,
          component,
          displayName: name.replace(/([A-Z])/g, ' $1').trim(),
          type: name.endsWith('Outlined') ? 'outlined' : 'filled'
        });
      }
    });

    antIcons.value = iconList;
  } catch (error) {
    console.error('加载Ant Design图标失败:', error);
  } finally {
    antLoading.value = false;
  }
};

// 格式化Ant Design图标名称
const formatAntIconName = (name) => {
  return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/Outlined|Filled|TwoTone/g, '')
      .trim();
};

// 加载IconFont图标
const loadIcons = () => {
  loading.value = true;

  try {
    // 从图标服务中获取所有图标
    icons.value = iconService.getAllIcons();

    // 如果没有图标，尝试等待图标加载完成
    if (icons.value.length === 0) {
      // 稍微延迟再次尝试加载
      setTimeout(() => {
        icons.value = iconService.getAllIcons();
        loading.value = false;
      }, 500);
    } else {
      loading.value = false;
    }
  } catch (error) {
    console.error('加载IconFont图标失败:', error);
    loading.value = false;
  }
};

// 打开图标管理模态框 (未实现，留给父组件处理)
const openIconManager = () => {
  emit('openManager');
};

// 过滤IconFont图标
const filteredIcons = computed(() => {
  if (!searchText.value) return icons.value;

  const search = searchText.value.toLowerCase();
  let result = icons.value.filter(icon =>
      icon.id.toLowerCase().includes(search) ||
      (icon.name && icon.name.toLowerCase().includes(search))
  );

  // 应用排序
  if (sortOrder.value === 'name-asc') {
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortOrder.value === 'name-desc') {
    result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }
  // 'recent' 排序假设图标已经按最近添加排序

  return result;
});

// 分页后的IconFont图标
const paginatedIcons = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredIcons.value.slice(startIndex, endIndex);
});

// 过滤Ant Design图标
const filteredAntIcons = computed(() => {
  let result = [...antIcons.value];

  // 按类型过滤（outlined或filled）
  if (antIconType.value !== 'all') {
    result = result.filter(icon => icon.type === antIconType.value);
  }

  // 按搜索词过滤
  if (antSearchText.value) {
    const search = antSearchText.value.toLowerCase();
    result = result.filter(icon =>
        icon.name.toLowerCase().includes(search) ||
        formatAntIconName(icon.name).toLowerCase().includes(search)
    );
  }

  return result;
});

// 分页后的Ant Design图标
const paginatedAntIcons = computed(() => {
  const startIndex = (antCurrentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredAntIcons.value.slice(startIndex, endIndex);
});


const confirmIconSelection = () => {
  if (tempSelectedIcon.value) {
    categoryForm.icon = tempSelectedIcon.value;
    console.log('确认选择图标:', categoryForm.icon); // 调试用

    // 关闭模态框
    iconSelectorVisible.value = false;

    // 通知父组件已选择图标
    emit('confirm', tempSelectedIcon.value);
  } else {
    iconSelectorVisible.value = false;
  }
};

// 选择图标
const selectIcon = (iconName) => {
  selectedIconValue.value = iconName;
  // 同步更新event，但不提交确认
  emit('select', iconName);
};

// 取消选择
const handleCancel = () => {
  emit('cancel');
};

// 确认选择
const handleConfirm = () => {
  if (!selectedIconValue.value) {
    message.warning('请先选择一个图标');
    return;
  }
  emit('update:value', selectedIconValue.value);
  emit('confirm', selectedIconValue.value);
};
</script>

<style scoped>
.icon-selector-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.icon-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.icon-tabs :deep(.ant-tabs-content) {
  flex: 1;
  overflow: hidden;
  min-height: 450px;
}

.icon-tabs :deep(.ant-tabs-tabpane) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
}

.search-input {
  width: 300px;
}

.tool-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-radio-group {
  flex-wrap: wrap;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: 400px;
}

.icon-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
  background-color: white;
  position: relative;
  overflow: hidden;
  height: 78px;
}

.icon-grid-item:hover {
  border-color: var(--primary-color, #6554C0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.15);
  background-color: var(--primary-lighter, #f0ebff);
}

.icon-grid-item.selected {
  border-color: #6554C0;
  background-color: #f0ebff;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.icon-grid-item.selected::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent #6554C0 transparent transparent;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  font-size: 20px;
  margin-bottom: 8px;
  color: #595959;
  transition: all 0.2s ease;
}

.icon-grid-item:hover .icon-wrapper {
  color: var(--primary-color, #6554C0);
  transform: scale(1.1);
}

.icon-name {
  font-size: 11px;
  line-height: 1.2;
  color: #8c8c8c;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: -5px;
  padding: 0 2px;
}

.icon-grid-item:hover .icon-name {
  color: var(--primary-color, #6554C0);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  font-size: 14px;
  color: #888;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .tool-right {
    justify-content: space-between;
    width: 100%;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>