<!-- pages/picture/EditPicture.vue -->
<template>
  <div class="edit-picture-page">
    <!-- 页面标题区域 -->
    <div class="enhanced-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <h1 class="main-title">
              <edit-outlined/>
              编辑图片
            </h1>
            <p class="page-desc">您可以在这里修改图片信息，更新您的创作细节</p>
          </div>
          <div class="picture-info-container">
            <div class="info-item">
              <eye-outlined/>
              <span>已获浏览: <strong>{{ pictureData.viewCount }}</strong></span>
            </div>
            <div class="info-item">
              <like-outlined/>
              <span>获得点赞: <strong>{{ pictureData.likeCount }}</strong></span>
            </div>
            <div class="info-item">
              <calendar-outlined/>
              <span>发布于: <strong>{{ formatDate(pictureData.createTime) }}</strong></span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="preview-container">
            <div class="preview-label">当前图片</div>
            <div class="thumbnail-wrapper">
              <img :src="pictureData.url" alt="当前图片预览" class="thumbnail-image"/>
              <div class="image-actions">
                <a-button type="primary" size="small" @click="showImagePreview">查看大图</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度指示器，简化为只有编辑和保存两个步骤 -->
      <div class="edit-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">
              <form-outlined/>
            </div>
            <div class="step-text">编辑信息</div>
          </div>
          <div class="step-divider"></div>
          <div class="step">
            <div class="step-icon">
              <check-circle-outlined/>
            </div>
            <div class="step-text">保存更新</div>
          </div>
        </div>
      </div>

      <!-- 装饰性图形元素 -->
      <div class="decorative-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="square"></div>
        <div class="triangle"></div>
      </div>
    </div>


    <div class="content-cards-container">
      <!-- 图片详细信息卡片 -->
      <image-detail-card
          :imageData="pictureData"
          @preview="showImagePreview"
      />


      <!-- 表单区域 -->
      <a-card
          class="form-card"
          :bordered="false"
      >
        <template #title>
          <div class="form-card-title">
            <form-outlined/>
            编辑图片信息
          </div>
        </template>

        <a-form
            :model="pictureForm"
            layout="vertical"
            :rules="formRules"
            ref="pictureFormRef"
        >
          <!-- 基础信息区 -->
          <div class="form-section">
            <h3 class="section-title">基础信息</h3>

            <!-- 图片名称 -->
            <a-form-item label="图片名称" name="name" required>
              <a-input
                  v-model:value="pictureForm.name"
                  placeholder="为您的图片起个名称"
                  :maxLength="50"
                  show-count
                  allow-clear
              />
            </a-form-item>

            <!-- 图片简介 -->
            <a-form-item label="图片简介" name="description">
              <a-textarea
                  v-model:value="pictureForm.description"
                  placeholder="描述一下您的图片内容、创作灵感或想法..."
                  :rows="4"
                  :maxLength="500"
                  show-count
                  allow-clear
              />
            </a-form-item>

            <!-- 一行两列布局 -->
            <a-row :gutter="16">
              <a-col :span="12">
                <!-- 图片分类 - 使用树形选择器 -->
                <a-form-item label="图片分类" name="category" required>
                  <a-tree-select
                      v-model:value="pictureForm.category"
                      class="enhanced-tree-select"
                      style="width: 100%"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto', padding: '8px' }"
                      placeholder="选择图片分类"
                      :tree-data="formattedCategoryTree"
                      :show-search="true"
                      :filter-tree-node="(input, treeNode) => treeNode.title.toLowerCase().indexOf(input.toLowerCase()) > -1"
                      tree-default-expand-all
                      allow-clear
                  >
                    <template #suffixIcon><appstore-outlined /></template>

                    <!-- 自定义树节点的渲染 -->
                    <template #treeTitle="{ value, title, dataRef }">
                          <span :class="dataRef.isLeaf ? 'child-category' : 'parent-category'">
                            <!-- 根据分类类型显示不同的图标 -->
                            <component
                                :is="getCategoryIcon(dataRef.type)"
                                class="category-icon"
                            />
                            {{ title }}

                            <!-- 为一级分类添加计数信息 -->
                            <a-badge
                                v-if="dataRef.contentCount && dataRef.level === 1"
                                :count="dataRef.contentCount"
                                :number-style="{ backgroundColor: '#52c41a', fontSize: '12px', padding: '0 6px', boxShadow: 'none' }"
                            />
                          </span>
                    </template>
                  </a-tree-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <!-- 图片标签 - 使用动态数据 -->
                <a-form-item label="图片标签" name="tags">
                  <a-select
                      :value="pictureForm.tagIds"
                      @change="handleTagChange"
                      mode="multiple"
                      :options="filteredTagOptions"
                      :getPopupContainer="triggerNode => triggerNode.parentNode"
                      placeholder="选择或输入标签"
                      :max-tag-text-length="10"
                      allow-clear
                      :token-separators="[',']"
                      option-label-prop="label"
                      :field-names="{ label: 'label', value: 'value' }"
                      @dropdownVisibleChange="handleDropdownVisibleChange"
                      :label-in-value="true"
                  >
                    <template #suffixIcon><tags-outlined /></template>
                    <template #option="option">
                      <div :class="{ 'tag-option-disabled': option.disabled }">
                        {{ option.label }}
                      </div>
                    </template>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <!-- 修改记录 -->
          <div class="form-section">
            <h3 class="section-title">修改记录</h3>
            <div class="edit-history">
              <a-timeline>
                <a-timeline-item v-for="(record, index) in editHistory" :key="index">
                  <template #dot>
                    <history-outlined style="fontSize: 16px"/>
                  </template>
                  <div class="history-item">
                    <div class="history-time">{{ formatDate(record.date) }}</div>
                    <div class="history-content">{{ record.description }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </div>

          <!-- 提交按钮区域 -->
          <div class="form-actions">
            <a-popconfirm
                title="确定要取消编辑吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="cancelEdit"
            >
              <a-button>取消</a-button>
            </a-popconfirm>
            <a-button type="primary" @click="submitForm" :loading="submitting">
              保存更新
            </a-button>
          </div>
        </a-form>
      </a-card>

    </div>

    <!-- 大图预览模态框 -->
    <a-modal v-model:visible="previewVisible" :footer="null" width="800px" centered>
      <img :src="pictureData.url" alt="图片预览" style="width: 100%;"/>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue';
import {message, Modal} from 'ant-design-vue';
import {useRouter, useRoute} from 'vue-router';
import dayjs from 'dayjs';
import {
  FormOutlined,
  AppstoreOutlined,
  TagsOutlined,
  EyeOutlined,
  LikeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  HistoryOutlined,
} from '@ant-design/icons-vue';
import ImageDetailCard from "@/components/picture/ImageDetailCard.vue";
import {editPictureUsingPost, getPictureByIdUsingGet} from "@/api/tupianxiangguanjiekou.js";
import {getCategoryTreeForFrontendUsingGet} from "@/api/fenleiguanli.js";
import {getTagListUsingGet} from "@/api/biaoqianguanli.js";

const router = useRouter();
const route = useRoute();

// 图片ID从路由参数获取
const pictureId = ref(route.params.id || '123');

// 图片信息预览模态框
const previewVisible = ref(false);


// 提交状态
const submitting = ref(false);

// 分类数据
const categoryData = ref([]);
// 标签数据
const tagOptions = ref([]);

// 表单验证规则
const formRules = {
  name: [
    {required: true, message: '请输入图片名称', trigger: 'blur'},
    {min: 2, max: 50, message: '图片名称长度为2-50个字符', trigger: 'blur'}
  ],
  category: [
    {required: true, message: '请选择图片分类', trigger: 'change'}
  ]
};

// 模拟从API获取的图片数据
const pictureData = ref({
  id: pictureId.value,
  url: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699',
  name: 'mountain_landscape.jpg',
  picWidth: '1920',
  picHeight: '1080',
  picScale: '',
  size: '2.4 KB',
  format: 'JPG',
  createTime: '',
  likeCount: '',
  collectionCount: '',
  viewCount: '',
  commentCount: '',
});

// 图片编辑历史记录
const editHistory = reactive([
  {
    date: '2024-01-20T09:15:00',
    description: '更新了图片标签和分类'
  },
  {
    date: '2024-02-15T16:30:00',
    description: '修改了图片描述和故事背景'
  }
]);

// 图片表单
const pictureFormRef = ref(null);
const pictureForm = ref({
  name: '壮丽山景',
  description: '在清晨的阳光下拍摄的山脉风景，远处的云海给画面增添了神秘感。',
  category: 'landscape',
  tags: ['nature', 'mountains', 'sunrise'],
  shootDate: dayjs('2023-10-05'),
});


// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};


// 为不同分类类型返回不同的图标组件
const getCategoryIcon = (type) => {
  const iconMap = {
    'learning': BookOutlined,
    'figure': UserOutlined,
    'wallpaper': PictureOutlined,
    'theme': FolderOutlined,
    'picture': PictureOutlined
  };

  // 返回匹配的图标,如果没有匹配则返回默认图标
  return iconMap[type] || AppstoreOutlined;
};

// 查看大图
const showImagePreview = () => {
  previewVisible.value = true;
};
// 1. 创建计算属性，过滤掉已选择的标签
const filteredTagOptions = computed(() => {
  if (!pictureForm.value.tagIds || pictureForm.value.tagIds.length === 0) {
    return tagOptions.value;
  }

  // 获取已选择的标签ID列表
  const selectedIds = pictureForm.value.tagIds.map(tag =>
      typeof tag === 'object' ? tag.value : tag
  );

  // 过滤掉已选择的标签
  return tagOptions.value.filter(option => !selectedIds.includes(option.value));
});

// 2. 创建自定义的选择处理函数
// 自定义的选择处理函数
const handleTagChange = (selectedValues) => {
  // 获取当前已选择的标签
  const currentSelectedTags = pictureForm.value.tagIds || [];
  const currentSelectedIds = currentSelectedTags.map(tag =>
      typeof tag === 'object' ? tag.value : tag
  );

  // 如果是添加操作
  if (selectedValues.length > currentSelectedIds.length) {
    // 找出新添加的值
    const newValue = selectedValues.find(value => {
      const valueId = typeof value === 'object' ? value.value : value;
      return !currentSelectedIds.includes(valueId);
    });

    if (newValue) {
      // 查找完整的标签对象（包含label）
      let newTagObject = newValue;
      if (typeof newValue !== 'object') {
        // 如果只有ID，查找对应的完整标签对象
        newTagObject = tagOptions.value.find(tag => tag.value === newValue);
      }

      // 安全添加不重复的完整标签对象
      pictureForm.value.tagIds = [...currentSelectedTags, newTagObject];
    }
  } else {
    // 如果是删除操作
    const deletedValue = currentSelectedIds.find(id =>
        !selectedValues.includes(id) &&
        !selectedValues.some(v => typeof v === 'object' && v.value === id)
    );

    if (deletedValue !== undefined) {
      // 从标签列表中删除
      pictureForm.value.tagIds = currentSelectedTags.filter(tag => {
        const tagId = typeof tag === 'object' ? tag.value : tag;
        return tagId !== deletedValue;
      });
    } else {
      // 直接使用新值（可能是完整删除或其他情况）
      pictureForm.value.tagIds = selectedValues;
    }
  }
};
// 3. 创建标签选项渲染函数
const renderTagOption = (option) => {
  // 检查选项是否已选择
  const isSelected = pictureForm.value.tagIds?.some(tag => {
    const tagValue = typeof tag === 'object' ? tag.value : tag;
    return tagValue === option.value;
  });

  return {
    ...option,
    disabled: isSelected // 禁用已选择的选项
  };
};

// 取消编辑
const cancelEdit = () => {
  message.info('已取消编辑');
  router.push(`/picture/detail/${pictureId.value}`);
};


// 将原始分类数据转换为TreeSelect组件可用的格式
const formattedCategoryTree = computed(() => {
  return formatCategoryTree(categoryData.value);
});

// 获取分类数据（树形结构）
const fetchCategoryTree = async () => {
  try {
    const result = await getCategoryTreeForFrontendUsingGet({

    });

    if (result && result.data) {
      categoryData.value = result.data.data;
      console.log('分类数据获取成功:', categoryData.value);
    } else {
      console.error('分类数据获取失败');
      message.error('分类数据获取失败');
    }
  } catch (error) {
    console.error('获取分类数据出错:', error);
    message.error('获取分类数据出错: ' + (error.message || '未知错误'));
  }
};

// 获取标签数据
const fetchTags = async () => {
  try {
    const result = await getTagListUsingGet();

    if (result && result.data) {
      // 转换标签数据为select需要的格式
      tagOptions.value = result.data.data.map(tag => ({
        value: tag.id,
        label: tag.name
      }));
    } else {
      console.error('标签数据获取失败');
      message.error('标签数据获取失败');
    }
  } catch (error) {
    console.error('获取标签数据出错:', error);
    message.error('获取标签数据出错: ' + (error.message || '未知错误'));
  }
};



// 递归格式化分类树，用于TreeSelect组件
const formatCategoryTree = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];

  return categories.map(category => ({
    value: category.id,
    title: category.name,
    key: category.id,
    isLeaf: !category.children || category.children.length === 0,
    selectable: true,
    // 添加原始数据中的其他有用字段
    type: category.type,
    level: category.level,
    contentCount: category.contentCount,
    icon: category.icon,
    children: category.children ? formatCategoryTree(category.children) : []
  }));
};

// 获取图片详情数据
const fetchPictureDetail = async (id) => {
  try {
    const response = await getPictureByIdUsingGet({id});


    if (response && response.data) {
      pictureData.value = response.data.data;

      console.log(JSON.stringify(pictureData.value));

      const tagsData = [];
      if (response.data.data.tagIds && response.data.data.tags) {
        const minLength = Math.min(response.data.data.tagIds.length, response.data.data.tags.length);
        for (let i = 0; i < minLength; i++) {
          tagsData.push({
            value: response.data.data.tagIds[i],
            label: response.data.data.tags[i]
          });
        }
      }

      pictureForm.value = {
        ...response.data.data,
        category: response.data.data.categoryId,
        tagIds: tagsData
      };
    } else {
      message.error('获取图片详情失败');
    }
  } catch (error) {
    console.error('获取图片详情错误:', error);
    message.error('获取图片详情出错');
  }
};

// 提交表单
const submitForm = async () => {
  // 表单验证
  try {
    await pictureFormRef.value.validate();

    // 设置提交中状态
    submitting.value = true;

    // 构建提交数据
    const formData = {
      id: pictureId.value,
      name: pictureForm.value.name,
      description: pictureForm.value.description,
      categoryId: pictureForm.value.category,
      tagIds: Array.isArray(pictureForm.value.tagIds) && pictureForm.value.tagIds.length > 0
          ? pictureForm.value.tagIds.map(tag => {
            // 处理三种可能的情况：
            // 1. 标签是对象，有value属性
            // 2. 标签是对象，没有value属性但直接是id
            // 3. 标签直接是id值
            if (typeof tag === 'object') {
              return tag.value !== undefined ? tag.value : tag.id;
            }
            return tag; // 直接是id值的情况
          })
          : []
    };

    // 调用编辑接口
    const result = await editPictureUsingPost(formData);
    console.log(JSON.stringify(formData));

    if (result && result.data) {
      // 提交成功的处理逻辑
      message.success('图片信息更新成功');

      // 更新编辑历史记录
      editHistory.unshift({
        date: new Date().toISOString(),
        description: '更新了图片信息'
      });

      // 重新获取图片详情,以更新页面数据
      await fetchPictureDetail(pictureId.value);

    } else {
      // 提交失败的处理逻辑
      message.error('图片信息更新失败');
    }

  } catch (error) {
    console.error('表单验证失败或提交出错:', error);
    message.error('请检查表单填写是否正确');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  // 获取图片详情
  await fetchPictureDetail(pictureId.value);

  // 获取分类和标签数据
  await fetchCategoryTree();
  await fetchTags();
});
</script>

<style scoped>
.edit-picture-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 卡片通用样式 */
.form-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}


.form-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}


.technical-info .info-item {
  display: flex;
  align-items: center;
}


/* 表单区域样式 */
.form-section {
  margin-bottom: 24px;
  padding: 0 24px;
}


.section-title {
  font-size: 16px;
  color: #262626;
  margin: 0 0 16px 0;
  font-weight: 500;
}


/* 编辑历史样式 */
.edit-history {
  background-color: #f9f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.history-item {
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.history-content {
  font-size: 14px;
  color: #333;
}

/* 提交按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

/*增强版页面头部样式 */
.enhanced-page-header {
  margin-bottom: 32px;
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #4569ef 0%, #8b45d5 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(122, 79, 245, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 60%;
}

.title-container {
  margin-bottom: 8px;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.page-desc {
  margin: 12px 0 0;
  font-size: 15px;
  opacity: 0.9;
  max-width: 90%;
  line-height: 1.6;
  color: white;
}

.picture-info-container {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.preview-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 12px;
  max-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  max-width: 180px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-image {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 4/3;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumbnail-wrapper:hover .image-actions {
  opacity: 1;
}

/* 编辑进度指示器 */
.edit-progress {
  margin-top: 32px;
  position: relative;
  z-index: 2;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 0.8;
}

.step-icon {
  background-color: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background-color: white;
  color: #5d54f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.step.completed .step-icon {
  background-color: rgba(0, 255, 0, 0.2);
  color: white;
}

.step-text {
  font-size: 13px;
  font-weight: 500;
}

.step-divider {
  width: 60px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

/* 装饰性元素 */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: 10%;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 20%;
}

.square {
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.05);
  transform: rotate(45deg);
  bottom: 20px;
  right: 15%;
}

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid rgba(255, 255, 255, 0.05);
  top: 10%;
  left: 20%;
  transform: rotate(20deg);
}


/* 添加内容卡片容器的样式 */
.content-cards-container {
  display: flex;
  flex-direction: column;
  gap: 36px; /* 增加卡片之间的间距 */
}

/* 增强页面头部与内容之间的间距 */
.enhanced-page-header {
  margin-bottom: 36px; /* 增加与内容的间距 */
  /* 其他样式保持不变 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .edit-picture-page {
    padding: 20px 16px;
  }

  .content-cards-container {
    gap: 24px;
  }

  .enhanced-page-header {
    margin-bottom: 24px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .edit-picture-page {
    padding: 16px 12px;
  }

  .enhanced-page-header {
    padding: 24px 16px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 24px;
  }

  .header-left {
    max-width: 100%;
  }

  .main-title {
    font-size: 24px;
  }

  .header-right {
    justify-content: flex-start;
  }

  .preview-container {
    max-width: 100%;
  }

  .thumbnail-wrapper {
    max-width: 100%;
  }

  .picture-info-container {
    flex-wrap: wrap;
  }

  .progress-steps {
    padding: 12px 8px;
  }

  .step-icon {
    width: 36px;
    height: 36px;
  }

  .step-text {
    font-size: 12px;
  }

  .step-divider {
    width: 30px;
  }


}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .edit-picture-page {
    background-color: #121212;
  }

  .enhanced-page-header {
    background: linear-gradient(135deg, #3a59c7 0%, #5d3eae 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .edit-history {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .history-time {
    color: #999;
  }

  .history-content {
    color: #ddd;
  }

  .form-actions {
    border-top-color: #333;
  }
}
</style>