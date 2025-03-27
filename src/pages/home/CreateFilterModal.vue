<!-- components/filter/CreateFilterModal.vue -->
<template>
  <a-modal
      :visible="visible"
      title="创建筛选器"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="520"
      :maskClosable="false"
      okText="确定"
      cancelText="取消"
  >
    <div class="filter-form">
      <a-form :model="filterForm" layout="vertical">
        <!-- 筛选器名称 -->
        <a-form-item label="筛选器名称" name="name" :rules="[{ required: true, message: '请输入筛选器名称' }]">
          <a-input v-model:value="filterForm.name" placeholder="请输入筛选器名称" />
        </a-form-item>

        <!-- 选择分类 -->
        <a-form-item label="分类" name="categories">
          <a-select
              v-model:value="filterForm.categories"
              mode="multiple"
              placeholder="选择分类"
              style="width: 100%"
              :options="categoryOptions"
          />
        </a-form-item>

        <!-- 选择标签 -->
        <a-form-item label="标签" name="tags">
          <a-select
              v-model:value="filterForm.tags"
              mode="multiple"
              placeholder="选择标签"
              style="width: 100%"
              :options="tagOptions"
          />
        </a-form-item>

        <!-- 排序方式 -->
        <a-form-item label="默认排序" name="sortBy">
          <a-radio-group v-model:value="filterForm.sortBy">
            <a-radio value="newest">最新发布</a-radio>
            <a-radio value="popular">最受欢迎</a-radio>
            <a-radio value="look">最多浏览</a-radio>
            <a-radio value="oldest">最多收藏</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch} from 'vue';
import { message } from 'ant-design-vue';

// 父组件传入的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  categories: Array,
  tags: Array
});

// 向父组件发送事件
const emit = defineEmits(['update:visible', 'save']);

// 筛选器表单数据
const filterForm = reactive({
  name: '',
  categories: [],
  tags: [],
  sortBy: 'newest'
});

// 转换分类选项为下拉框格式
const categoryOptions = computed(() => {
  return props.categories?.map(cat => ({
    label: cat.name,
    value: cat.name
  })) || [];
});

// 转换标签选项为下拉框格式
const tagOptions = computed(() => {
  return props.tags?.map(tag => ({
    label: tag.name,
    value: tag.name
  })) || [];
});

// 确认保存筛选器
const handleOk = () => {
  if (!filterForm.name.trim()) {
    message.error('请输入筛选器名称');
    return;
  }

  // 创建筛选器对象
  const newFilter = {
    id: `filter_${Date.now()}`,
    name: filterForm.name,
    categories: filterForm.categories,
    tags: filterForm.tags,
    sortBy: filterForm.sortBy,
    createdAt: new Date().toISOString()
  };

  // 向父组件发送保存事件
  emit('save', newFilter);

  // 重置表单
  resetForm();

  // 关闭弹窗
  emit('update:visible', false);
};

// 取消创建筛选器
const handleCancel = () => {
  resetForm();
  emit('update:visible', false);
};

// 重置表单
const resetForm = () => {
  filterForm.name = '';
  filterForm.categories = [];
  filterForm.tags = [];
  filterForm.sortBy = 'newest';
};

watch(() => props.visible, (val) => {
  if (!val) {
    resetForm();
  }
});
</script>

<style scoped>
.filter-form {
  padding: 0 12px;
}
</style>