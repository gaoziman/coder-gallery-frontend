<template>
  <div class="base-table-container">
    <!-- 表格顶部区域：包含批量操作按钮、自定义操作区域、刷新和视图切换等 -->
    <div class="table-top-bar">
      <div class="left-operations">
        <slot name="batchOperations">
          <!-- 默认批量操作按钮区域 -->
          <a-space v-if="batchButtons && batchButtons.length > 0">
            <a-button
                v-for="btn in batchButtons"
                :key="btn.key"
                :type="btn.type || 'default'"
                :danger="btn.danger"
                :disabled="!hasSelected && !btn.alwaysEnabled"
                @click="handleBatchOperation(btn)"
            >
              <component :is="btn.icon" v-if="btn.icon"/>
              {{ btn.text }}
            </a-button>
          </a-space>
        </slot>
      </div>
    </div>

    <!-- 表格组件 -->
    <a-table
        :columns="processedColumns"
        :data-source="dataSource"
        :pagination="paginationConfig"
        :loading="loading"
        :row-selection="rowSelection"
        :row-key="rowKey"
        :scroll="scroll"
        @change="handleTableChange"
        :class="{ 'custom-table': true, [tableClass]: tableClass }"
    >
      <!-- 使用作用域插槽渲染自定义列内容 -->
      <template #bodyCell="{ column, record, index }">
        <!-- 允许外部定义每一列的渲染方式 -->
        <slot :name="`column-${column.dataIndex}`" :record="record" :index="index" :column="column">
          <!-- 如果列是操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <slot name="actionColumn" :record="record" :index="index">
              <div class="table-actions">
                <template v-for="(action, actionIndex) in getRowActions(record)" :key="actionIndex">
                  <!-- 分隔线 -->
                  <a-divider v-if="action.divider" type="vertical"/>

                  <!-- 下拉菜单 -->
                  <a-dropdown v-else-if="action.type === 'dropdown'" :trigger="['click']">
                    <a-button type="link" size="small">
                      <component :is="action.icon" v-if="action.icon"/>
                      <IconFont type="icon-gengduo3"  />
                      {{ action.text }}
                    </a-button>

                    <template #overlay>
                      <a-menu>
                        <template v-for="(item, itemIndex) in action.items" :key="itemIndex">
                          <a-menu-divider v-if="item.divider"/>
                          <a-menu-item
                              v-else
                              :disabled="item.disabled"
                              :danger="item.danger"
                              @click="() => handleRowAction(item, record, index)"
                          >
                            <component :is="item.icon" v-if="item.icon"/>
                            {{ item.text }}
                          </a-menu-item>
                        </template>
                      </a-menu>
                    </template>
                  </a-dropdown>
                  <!-- 常规按钮 -->
                  <a-button
                      v-else
                      :type="action.type || 'link'"
                      :size="action.size || 'small'"
                      :danger="action.danger"
                      :disabled="action.disabled"
                      @click="handleRowAction(action, record, index)"
                  >
                    <component :is="action.icon" v-if="action.icon"/>
                    {{ action.text }}
                  </a-button>
                </template>
              </div>
            </slot>
          </template>
        </slot>
      </template>

      <!-- 空状态 -->
      <template #emptyText>
        <slot name="empty">
          <a-empty :description="emptyText || '暂无数据'"/>
        </slot>
      </template>
    </a-table>

    <!-- 批量操作确认弹窗 -->
    <a-modal
        v-model:visible="batchModalVisible"
        :title="currentBatchOperation?.confirmTitle || '确认操作'"
        :ok-text="currentBatchOperation?.confirmOkText || '确定'"
        :cancel-text="currentBatchOperation?.confirmCancelText || '取消'"
        :ok-button-props="{ danger: currentBatchOperation?.danger }"
        @ok="confirmBatchOperation"
    >
      <p>{{ currentBatchOperation?.confirmContent || `确定要对选中的 ${selectedRowKeys.length} 项执行此操作吗？` }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, computed, watch, defineProps, defineEmits} from 'vue';
// 引入 IconFont 组件
import IconFont from '@/components/common/IconFont.vue';

// 定义组件属性
const props = defineProps({
  // 表格数据源
  dataSource: {
    type: Array,
    default: () => []
  },
  // 表格列配置
  columns: {
    type: Array,
    default: () => []
  },
  // 行唯一标识字段
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: true
  },
  // 刷新按钮文本
  refreshText: {
    type: String,
    default: '刷新'
  },
  // 空数据提示文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 表格样式类名
  tableClass: {
    type: String,
    default: ''
  },
  // 是否显示选择框
  showSelection: {
    type: Boolean,
    default: false
  },
  // 已选择的行keys
  selectedKeys: {
    type: Array,
    default: () => []
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条`,
      pageSizeOptions: ['10', '20', '50', '100']
    })
  },
  // 批量操作按钮
  batchButtons: {
    type: Array,
    default: () => []
  },
  // 行操作按钮配置
  rowActions: {
    type: [Array, Function],
    default: () => []
  },
  // 表格滚动配置
  scroll: {
    type: Object,
    default: () => ({x: 'max-content'})
  }
});

// 定义事件
const emit = defineEmits([
  'refresh',
  'selectionChange',
  'rowAction',
  'batchAction',
  'confirmBatchAction',
  'tableChange'
]);

// 内部状态
const selectedRowKeys = ref(props.selectedKeys || []);
const batchModalVisible = ref(false);
const currentBatchOperation = ref(null);

// 计算是否有选中项
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 监听外部selectedKeys变化
watch(() => props.selectedKeys, (newValue) => {
  selectedRowKeys.value = newValue;
}, {deep: true});

// 处理表格列，支持自定义渲染和排序配置
const processedColumns = computed(() => {
  return props.columns.map(column => {
    const newColumn = {...column};

    // 为需要排序的列添加sorter属性
    if (newColumn.sorter === true) {
      newColumn.sorter = (a, b) => {
        if (typeof a[column.dataIndex] === 'string') {
          return a[column.dataIndex].localeCompare(b[column.dataIndex]);
        }
        return a[column.dataIndex] - b[column.dataIndex];
      };
    }

    return newColumn;
  });
});

// 获取行操作按钮
const getRowActions = (record) => {
  if (typeof props.rowActions === 'function') {
    return props.rowActions(record);
  }
  return props.rowActions;
};

// 表格分页配置
const paginationConfig = computed(() => {
  if (props.pagination === false) {
    return false;
  }

  return {
    ...props.pagination,
    onChange: (page, pageSize) => {
      emit('tableChange', {
        pagination: {current: page, pageSize},
        filters: {},
        sorter: {}
      });
    },
    onShowSizeChange: (current, size) => {
      emit('tableChange', {
        pagination: {current: 1, pageSize: size},
        filters: {},
        sorter: {}
      });
    }
  };
});

// 表格行选择配置
const rowSelection = computed(() => {
  if (!props.showSelection) {
    return undefined;
  }

  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selected) => {
      selectedRowKeys.value = selected;
      emit('selectionChange', selected);
    }
  };
});

// 处理表格变化事件（分页、筛选、排序）
const handleTableChange = (pagination, filters, sorter) => {
  emit('tableChange', {pagination, filters, sorter});
};

// 处理行操作按钮点击
const handleRowAction = (action, record, index) => {
  emit('rowAction', {action, record, index});
};

// 处理批量操作
const handleBatchOperation = (operation) => {
  if (!hasSelected.value && !operation.alwaysEnabled) {
    return;
  }

  if (operation.confirm) {
    // 显示确认弹窗
    currentBatchOperation.value = operation;
    batchModalVisible.value = true;
  } else {
    // 直接执行操作
    emit('batchAction', {operation, selectedRowKeys: selectedRowKeys.value});
  }
};

// 确认批量操作
const confirmBatchOperation = () => {
  emit('confirmBatchAction', {
    operation: currentBatchOperation.value,
    selectedRowKeys: selectedRowKeys.value
  });

  // 关闭弹窗
  batchModalVisible.value = false;
  currentBatchOperation.value = null;
};
</script>

<style scoped>
.base-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-radius: 12px 12px 0 0;
}

.left-operations{
  display: flex;
  align-items: center;
  gap: 8px;
}


.custom-table {
  width: 100%;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .table-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>