<!-- components/filter/FilterList.vue -->
<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <a-button class="filter-list-btn" :class="{ 'filter-btn-pulse': showPulse }">
      <template #icon><filter-outlined /></template>
      我的筛选器
      <a-badge v-if="filters.length > 0" :count="filters.length" :offset="[5, -5]" />
    </a-button>
    <template #overlay>
      <a-menu class="filter-menu">
        <a-menu-item
            v-for="filter in filters"
            :key="filter.id"
            @click="() => onFilterSelect(filter)"
        >
          <div class="filter-menu-item">
            <span class="filter-name">{{ filter.name }}</span>
            <a-popconfirm
                title="确定要删除此筛选器吗？"
                @confirm="() => onFilterDelete(filter.id)"
                okText="确定"
                cancelText="取消"
            >
              <a-button
                  type="text"
                  size="small"
                  @click.stop
              >
                <delete-outlined />
              </a-button>
            </a-popconfirm>
          </div>
        </a-menu-item>
        <a-menu-divider v-if="filters.length > 0" />
        <a-menu-item @click="onCreateFilter">
          <plus-outlined /> 创建新筛选器
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { FilterOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {onMounted, ref, watch} from "vue";

// 父组件传入的属性
const props = defineProps({
  filters: {
    type: Array,
    default: () => []
  }
});

// 向父组件发送事件
const emit = defineEmits(['select', 'delete', 'create']);

// 显示脉冲动画
const showPulse = ref(false);
const prevFiltersCount = ref(0);

// 监听筛选器数量变化
watch(() => props.filters.length, (newCount, oldCount) => {
  if (newCount > oldCount) {
    // 新增了筛选器，显示动画
    showPulse.value = true;
    setTimeout(() => {
      showPulse.value = false;
    }, 2000); // 2秒后停止动画
  }
});
onMounted(() => {
  prevFiltersCount.value = props.filters.length;
});

// 选择筛选器
const onFilterSelect = (filter :any) => {
  emit('select', filter);
};

// 删除筛选器
const onFilterDelete = (filterId :any) => {
  emit('delete', filterId);
};

// 创建新筛选器
const onCreateFilter = () => {
  emit('create');
};
</script>

<style scoped>
.filter-list-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
}

.filter-menu {
  min-width: 200px;
}

.filter-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.filter-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 添加脉冲动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

.filter-btn-pulse {
  animation: pulse 1.5s infinite;
}
</style>