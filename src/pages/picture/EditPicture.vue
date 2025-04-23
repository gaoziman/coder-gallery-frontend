<!-- pages/picture/EditPicture.vue -->
<template>
  <div class="edit-picture-page">
    <!-- 页面标题区域 - 减小高度 -->
    <div class="enhanced-page-header">
      <!-- 装饰性背景图案 -->
      <div class="decorative-background">
        <div class="bg-pattern-grid"></div>
        <div class="bg-glow glow-1"></div>
        <div class="bg-glow glow-2"></div>
        <div class="bg-glow glow-3"></div>
      </div>

      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <div class="title-icon-wrapper">
              <edit-outlined class="title-icon"/>
            </div>
            <div class="title-text">
              <h1 class="main-title">编辑图片</h1>
              <p class="page-desc">您可以在这里修改图片信息，更新您的创作细节</p>
            </div>
          </div>

          <!-- 编辑信息统计卡片 - 横向排列更紧凑 -->
          <div class="edit-stats">
            <div class="edit-stat-card">
              <calendar-outlined class="stat-card-icon" />
              <div class="stat-card-content">
                <div class="stat-card-value">{{ formatDate(pictureData.createTime).split(' ')[0] }}</div>
                <div class="stat-card-label">上传日期</div>
              </div>
            </div>
            <div class="edit-stat-card">
              <eye-outlined class="stat-card-icon" />
              <div class="stat-card-content">
                <div class="stat-card-value">{{ formatNumber(pictureData.viewCount) }}</div>
                <div class="stat-card-label">浏览量</div>
              </div>
            </div>
            <div class="edit-stat-card">
              <like-outlined class="stat-card-icon" />
              <div class="stat-card-content">
                <div class="stat-card-value">{{ formatNumber(pictureData.likeCount) }}</div>
                <div class="stat-card-label">点赞数</div>
              </div>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="header-preview-container">
            <div class="preview-frame">
              <img :src="pictureData.url" alt="预览图" class="header-preview-image" />
              <div class="preview-overlay">
                <a-button type="primary" icon-only class="preview-button" @click="showFullImage">
                  <search-outlined />
                </a-button>
              </div>
            </div>
            <div class="preview-info">
              <div class="preview-format">
                <file-image-outlined />
                <span>{{ pictureData.format || 'JPG' }}</span>
              </div>
              <div class="preview-dimensions">
                <column-width-outlined />
                <span>{{ pictureData.picWidth }} × {{ pictureData.picHeight }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度指示器 - 减小高度并简化 -->
      <div class="edit-progress">
        <div class="progress-line"></div>
        <div class="progress-steps">
          <div class="step active completed">
            <div class="step-icon">
              <form-outlined />
            </div>
            <div class="step-text">编辑信息</div>
          </div>
          <div class="step">
            <div class="step-icon">
              <check-circle-outlined />
            </div>
            <div class="step-text">保存更新</div>
          </div>
        </div>

        <!-- 流程指引文本 -->
        <div class="progress-guide">
          <info-circle-outlined />
          <span>编辑完成后点击"更新"按钮保存您的修改</span>
        </div>
      </div>

      <!-- 装饰性图形元素 -->
      <div class="decorative-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="square"></div>
        <div class="triangle"></div>

        <!-- 新增装饰性元素 - 保留但减少数量 -->
        <div class="floating-icon camera-icon">
          <camera-outlined />
        </div>
        <div class="floating-icon picture-icon">
          <picture-outlined />
        </div>
        <div class="floating-icon tag-icon">
          <tags-outlined />
        </div>

        <!-- 装饰性线条 - 保留但减少数量 -->
        <div class="decorative-line line-1"></div>
        <div class="decorative-line line-2"></div>
      </div>
    </div>

    <!-- 全新设计的图片预览区域 - 增强型互动预览框 -->
    <div class="image-preview-container">
      <div class="image-preview-left">
        <div class="enhanced-preview-window" ref="imageContainer">
          <div class="preview-image-wrapper" ref="imageWrapper">
            <!-- 加载中状态显示骨架屏 -->
            <a-skeleton-image v-if="imageLoading" active :width="480" :height="320" />

            <img
                :src="pictureData.url"
                alt="图片预览"
                class="enhanced-preview-image"
                ref="previewImage"
                @load="onImageLoad"
                :style="{
                transform: `scale(${zoomLevel}) rotate(${rotationDegree}deg)`,
                transformOrigin: 'center center'
              }"
            />

            <!-- 图片加载状态 -->
            <div class="image-loading-overlay" v-if="imageLoading">
              <a-spin tip="图片加载中..." />
            </div>
          </div>

          <!-- 图片控制面板 -->
          <div class="image-controls">
            <div class="control-group">
              <a-tooltip title="缩小">
                <a-button type="text" shape="circle" @click="zoomOut" :disabled="zoomLevel <= 0.5">
                  <zoom-out-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="当前缩放比例">
                <span class="zoom-indicator">{{ Math.round(zoomLevel * 100) }}%</span>
              </a-tooltip>

              <a-tooltip title="放大">
                <a-button type="text" shape="circle" @click="zoomIn" :disabled="zoomLevel >= 3">
                  <zoom-in-outlined />
                </a-button>
              </a-tooltip>
            </div>

            <div class="control-divider"></div>

            <div class="control-group">
              <a-tooltip title="向左旋转">
                <a-button type="text" shape="circle" @click="rotateLeft">
                  <undo-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="向右旋转">
                <a-button type="text" shape="circle" @click="rotateRight">
                  <redo-outlined />
                </a-button>
              </a-tooltip>
            </div>

            <div class="control-divider"></div>

            <div class="control-group">
              <a-tooltip title="重置视图">
                <a-button type="text" shape="circle" @click="resetView">
                  <sync-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="全屏查看">
                <a-button type="text" shape="circle" @click="showFullImage">
                  <fullscreen-outlined />
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>

      <div class="image-preview-right">
        <div class="streamlined-info-panel">
          <h3 class="preview-title">图片基本信息</h3>

          <!-- 重新设计的信息行布局 -->
          <div class="info-rows">
            <div class="info-row">
              <div class="info-label"><file-image-outlined /> 文件格式</div>
              <div class="info-value">{{ pictureData.format || 'JPG' }}</div>
            </div>

            <div class="info-row">
              <div class="info-label"><file-outlined /> 文件大小</div>
              <div class="info-value">{{ pictureData.size || '2.4 MB' }}</div>
            </div>

            <div class="info-row">
              <div class="info-label"><column-width-outlined /> 图片尺寸</div>
              <div class="info-value">{{ pictureData.picWidth }} × {{ pictureData.picHeight }}</div>
            </div>

            <div class="info-row">
              <div class="info-label"><border-outlined /> 宽高比例</div>
              <div class="info-value">{{ pictureData.picScale || '16:9' }}</div>
            </div>

            <div class="info-row">
              <div class="info-label"><calendar-outlined /> 上传时间</div>
              <div class="info-value">{{ formatDate(pictureData.createTime) }}</div>
            </div>
          </div>

          <!-- 重新设计的统计信息区域 -->
          <div class="stats-section">
            <h3 class="stats-title">图片数据统计</h3>
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-header">
                  <eye-outlined />
                  <span>浏览</span>
                </div>
                <div class="stat-value">{{ formatNumber(pictureData.viewCount) }}</div>
              </div>

              <div class="stat-card">
                <div class="stat-header">
                  <heart-outlined />
                  <span>点赞</span>
                </div>
                <div class="stat-value">{{ formatNumber(pictureData.likeCount) }}</div>
              </div>

              <div class="stat-card">
                <div class="stat-header">
                  <star-outlined />
                  <span>收藏</span>
                </div>
                <div class="stat-value">{{ formatNumber(pictureData.collectionCount) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-cards-container">
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
                <!-- 替换树形选择器为我们的自定义下拉组件 -->
                <a-form-item label="图片分类" name="category" required>
                  <category-select
                      v-model:modelValue="pictureForm.category"
                      :treeData="categoryData"
                      :loading="loadingCategories"
                      @change="handleCategoryChange"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <!-- 图片标签 - 使用动态数据 -->
                <a-form-item label="图片标签" name="tags">
                  <tag-select
                      v-model:modelValue="pictureForm.tagIds"
                      :options="tagOptions"
                      :loading="loadingTags"
                      @change="handleTagChange"
                  />
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
              更新
            </a-button>
          </div>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed, watch, nextTick, onUnmounted, h} from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
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
  FileOutlined,
  FileImageOutlined,
  ColumnWidthOutlined,
  BorderOutlined,
  StarOutlined,
  HeartOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  PictureOutlined,
  SettingOutlined,
  FilterOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  RedoOutlined,
  SyncOutlined
} from '@ant-design/icons-vue';
import CategorySelect from "@/components/common/CategorySelect.vue";
import TagSelect from "@/components/common/TagSelect.vue";
import { editPictureUsingPost, getPictureByIdUsingGet } from "@/api/tupianxiangguanjiekou.js";
import { getCategoryTreeForFrontendUsingGet } from "@/api/fenleiguanli.js";
import { getTagListUsingGet } from "@/api/biaoqianguanli.js";

const router = useRouter();
const route = useRoute();

// 图片ID从路由参数获取
const pictureId = ref(route.params.id || '123');

// 提交状态
const submitting = ref(false);

// 分类数据
const categoryData = ref([]);
// 标签数据
const tagOptions = ref([]);

const loadingCategories = ref(false);
const loadingTags = ref(false);

const imageContainer = ref(null);
const previewImage = ref(null);

// 图片状态
const imageLoading = ref(true);
const zoomLevel = ref(1);  // 缩放级别
const rotationDegree = ref(0);  // 旋转角度

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入图片名称', trigger: 'blur' },
    { min: 2, max: 50, message: '图片名称长度为2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ]
};

// 模拟从API获取的图片数据
const pictureData = ref({
  id: pictureId.value,
  name: 'mountain_landscape.jpg',
  picWidth: '1920',
  picHeight: '1080',
  picScale: '16:9',
  size: '2.4 MB',
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
  tagIds: [],
  shootDate: dayjs('2023-10-05'),
});

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '--';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 格式化数字显示
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';

  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 分类变更处理函数
const handleCategoryChange = (value) => {
  pictureForm.value.category = value;
};

// 创建计算属性，过滤掉已选择的标签
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

const handleTagChange = (value) => {
  pictureForm.value.tagIds = value;
};

// 取消编辑
const cancelEdit = () => {
  message.info('已取消编辑');
  router.push(`/picture/${pictureId.value}`);
};

// 获取分类数据（树形结构）
const fetchCategoryTree = async () => {
  try {
    loadingCategories.value = true;
    const result = await getCategoryTreeForFrontendUsingGet({});

    if (result && result.data) {
      // 为分类数据添加图标信息
      const processCategories = (categories) => {
        return categories.map(category => {
          // 确定图标类型和图标名称
          let iconType = 'antd'; // 默认为ant-design图标
          let icon = '';

          // 判断图标类型和图标名称
          if (category.icon) {
            // 如果icon以'icon-'开头，则视为iconfont图标
            if (category.icon.startsWith('icon-')) {
              iconType = 'iconfont';
              icon = category.icon;
            } else {
              // 否则视为antd图标
              icon = category.icon;
            }
          } else {
            // 没有指定图标时，根据分类类型选择默认图标
            icon = category.type || 'folder';
          }

          return {
            ...category,
            iconType,
            icon,
            children: category.children ? processCategories(category.children) : []
          };
        });
      };

      categoryData.value = processCategories(result.data.data);
    } else {
      message.error('分类数据获取失败');
    }
  } catch (error) {
    message.error('获取分类数据出错: ' + (error.message || '未知错误'));
  } finally {
    loadingCategories.value = false;
  }
};

// 获取标签数据
const fetchTags = async () => {
  try {
    loadingTags.value = true;
    const result = await getTagListUsingGet();

    if (result && result.data) {
      // 转换标签数据为select需要的格式
      tagOptions.value = result.data.data.map(tag => ({
        value: tag.id,
        label: tag.name,
        status: tag.status
      }));
    } else {
      console.error('标签数据获取失败');
      message.error('标签数据获取失败');
    }
  } catch (error) {
    console.error('获取标签数据出错:', error);
    message.error('获取标签数据出错: ' + (error.message || '未知错误'));
  } finally {
    loadingTags.value = false;
  }
};

// 获取图片详情数据
const fetchPictureDetail = async (id) => {
  imageLoading.value = true;
  try {
    const response = await getPictureByIdUsingGet({id});

    if (response && response.data) {
      pictureData.value = response.data.data;

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

      // 确保分类ID是正确的数据类型(String或Number)
      const categoryId = response.data.data.categoryId;

      pictureForm.value = {
        ...response.data.data,
        category: categoryId, // 确保使用正确的分类ID
        tagIds: tagsData
      };

      console.log('设置当前分类ID:', categoryId);
    } else {
      message.error('获取图片详情失败');
    }
  } catch (error) {
    console.error('获取图片详情错误:', error);
    message.error('获取图片详情出错');
  }
};

// 添加监听函数，当分类数据加载完成后，重新检查选中状态
watch(categoryData, (newVal) => {
  if (newVal.length > 0 && pictureForm.value.category) {
    // 分类数据加载完成后，重新确认选中状态
    console.log('分类数据加载完成，当前选中分类ID:', pictureForm.value.category);
  }
}, { deep: true });

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

    if (result && result.data) {
      // 提交成功的处理逻辑
      message.success('图片信息更新成功');

      // 更新编辑历史记录
      editHistory.unshift({
        date: new Date().toISOString(),
        description: '更新了图片信息'
      });

      // 更新成功后跳转到详情页
      router.push(`/picture/${pictureId.value}`);

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


// 图片加载完成
const onImageLoad = () => {
  imageLoading.value = false;
};

// 缩放功能
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.1;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.1;
  }
};

// 旋转功能
const rotateLeft = () => {
  rotationDegree.value = (rotationDegree.value - 90) % 360;
};

const rotateRight = () => {
  rotationDegree.value = (rotationDegree.value + 90) % 360;
};

// 重置视图
const resetView = () => {
  zoomLevel.value = 1;
  rotationDegree.value = 0;
};

// 显示全屏图片
const showFullImage = () => {
  Modal.info({
    title: pictureData.value.name || '图片预览',
    icon: null,
    width: '90%',
    centered: true,
    maskClosable: true,
    okText: '关闭',
    content: h('div', {
      style: {
        textAlign: 'center',
        margin: '20px 0'
      }
    }, [
      h('img', {
        src: pictureData.value.url,
        alt: pictureData.value.name || '图片预览',
        style: {
          maxWidth: '100%',
          maxHeight: '80vh',
          objectFit: 'contain'
        }
      })
    ])
  });
};

// 监听窗口大小变化
const handleResize = () => {
  // 窗口大小变化时的处理逻辑
};

// 组件挂载完成后的操作
onMounted(async () => {
  // 获取图片详情
  await fetchPictureDetail(pictureId.value);

  // 获取分类和标签数据
  await fetchCategoryTree();
  await fetchTags();

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* 原有样式保持不变 */
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

/* 增强版页面头部样式 - 减小高度 */
.enhanced-page-header {
  margin-bottom: 24px; /* 减小底部边距 */
  padding: 30px 30px 24px; /* 减小上下内边距 */
  background: linear-gradient(135deg, #4569ef 0%, #8b45d5 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(122, 79, 245, 0.3);
  transition: all 0.3s ease;
}

.enhanced-page-header:hover {
  box-shadow: 0 15px 40px rgba(122, 79, 245, 0.4);
}

/* 装饰性背景图案 */
.decorative-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bg-pattern-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}

.glow-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: 10%;
  background: rgba(255, 255, 255, 0.2);
  animation: float 15s infinite alternate ease-in-out;
}

.glow-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  left: -100px;
  background: rgba(127, 217, 255, 0.15);
  animation: float 20s infinite alternate-reverse ease-in-out;
}

.glow-3 {
  width: 250px;
  height: 250px;
  top: 40%;
  right: 25%;
  background: rgba(255, 186, 255, 0.15);
  animation: float 17s infinite alternate ease-in-out;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(15px);
  }
  100% {
    transform: translateY(10px) translateX(-15px);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 65%;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0;
}

.title-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.title-icon-wrapper:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.title-icon {
  font-size: 24px;
  color: white;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.main-title {
  font-size: 26px;
  font-weight: 600;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  position: relative;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
}

.page-desc {
  margin: 12px 0 0;
  font-size: 14px;
  opacity: 0.9;
  max-width: 95%;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

/* 顶部统计卡片样式 */
.edit-stats {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.edit-stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 10px 14px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.edit-stat-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-card-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-card-content {
  display: flex;
  flex-direction: column;
}

.stat-card-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.stat-card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* 头部右侧预览区域*/
.header-right {
  position: relative;
  z-index: 2;
}

.header-preview-container {
  width: 240px;
  position: relative;
}

.preview-frame {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  transform: perspective(800px) rotateY(-5deg) rotateX(5deg);
}

.preview-frame:hover {
  transform: perspective(800px) rotateY(0deg) rotateX(0deg);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.header-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-frame:hover .preview-overlay {
  opacity: 1;
}

.preview-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 6px;
}

.preview-format, .preview-dimensions {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 增强版进度指示器 */
.edit-progress {
  position: relative;
  z-index: 2;
  margin-top: 20px;
}

.progress-line {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.progress-steps {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 100px; /* 减小间距 */
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 0.9;
}

.step-icon {
  background-color: rgba(255, 255, 255, 0.15);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.step.active .step-icon {
  background-color: white;
  color: #5d54f5;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.step.completed .step-icon {
  background-color: #52c41a;
  color: white;
}

.step-text {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}

.step.active .step-text {
  color: white;
}

/* 流程引导文本 */
.progress-guide {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  padding: 8px 14px;
  border-radius: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: 10%;
  animation: pulse 15s infinite alternate;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -250px;
  left: -100px;
  animation: pulse 20s infinite alternate-reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 30%;
  right: 25%;
  animation: pulse 8s infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

.square {
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.08);
  transform: rotate(45deg);
  bottom: 30px;
  right: 15%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(45deg);
  }
  100% {
    transform: rotate(405deg);
  }
}

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 70px solid rgba(255, 255, 255, 0.08);
  top: 15%;
  left: 15%;
  animation: float-rotate 25s infinite alternate ease-in-out;
}

@keyframes float-rotate {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(10deg);
  }
  100% {
    transform: translateY(10px) rotate(-5deg);
  }
}

/* 新增的装饰性浮动图标*/
.floating-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: float-icon 10s infinite ease-in-out;
}

.camera-icon {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.picture-icon {
  top: 65%;
  right: 15%;
  animation-delay: 2s;
}

.tag-icon {
  top: 30%;
  right: 8%;
  animation-delay: 4s;
}

@keyframes float-icon {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 装饰性线条  */
.decorative-line {
  position: absolute;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  height: 1px;
  transform-origin: center;
}

.line-1 {
  width: 250px;
  top: 30%;
  right: 5%;
  transform: rotate(-30deg);
  animation: line-fade 8s infinite alternate;
}

.line-2 {
  width: 180px; /* 减小宽度 */
  bottom: 25%;
  left: 10%;
  transform: rotate(45deg);
  animation: line-fade 12s infinite alternate-reverse;
}

@keyframes line-fade {
  0% {
    opacity: 0.2;
    width: 0;
  }
  100% {
    opacity: 0.5;
    width: 100%;
  }
}

/* 全新设计的图片预览区域 */
.image-preview-container {
  display: flex;
  margin-bottom: 36px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.image-preview-left {
  flex: 1;
  min-width: 0;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 增强型图片预览窗口 */
.enhanced-preview-window {
  position: relative;
  width: 100%;
  height: 480px;
  border-radius: 12px;
  background-color: #f9f9f9;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.preview-image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%, #f5f5f5) 0 0 / 20px 20px,
  linear-gradient(45deg, #f5f5f5 25%, transparent 25%, transparent 75%, #f5f5f5 75%, #f5f5f5) 10px 10px / 20px 20px;
}

.enhanced-preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* 图片加载状态 */
.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 图片控制面板 */
.image-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
  background-color: #f0f0f0;
  border-top: 1px solid #e8e8e8;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-divider {
  width: 1px;
  height: 24px;
  background-color: #d9d9d9;
}

.zoom-indicator {
  font-size: 13px;
  color: #666;
  min-width: 46px;
  text-align: center;
  background-color: white;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

/* 右侧信息面板 - 重新设计 */
.image-preview-right {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid #f0f0f0;
  background: linear-gradient(to bottom, #ffffff, #f8f8f8);
}

.streamlined-info-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #1f1f1f;
}

/* 行式信息布局 */
.info-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.info-row:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #1f1f1f;
  font-weight: 500;
  font-size: 14px;
}

/* 重新设计的统计信息样式 */
.stats-section {
  margin-top: 24px;
}

.stats-title {
  font-size: 15px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: linear-gradient(to bottom, #4569ef, #8b45d5);
  border-radius: 2px;
  display: inline-block;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
  border-color: rgba(69, 105, 239, 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-header .anticon {
  font-size: 14px;
}

.stat-header .anticon-eye {
  color: #1890ff;
}

.stat-header .anticon-heart {
  color: #f5222d;
}

.stat-header .anticon-star {
  color: #faad14;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  text-align: center;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .stats-title {
    color: #aaa;
  }

  .stat-card {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .stat-card:hover {
    border-color: rgba(90, 120, 220, 0.4);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }

  .stat-header {
    color: #aaa;
  }

  .stat-value {
    color: #e0e0e0;
  }
}

/* 响应式样式调整 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-card {
    padding: 10px;
  }

  .stat-value {
    font-size: 18px;
  }
}
</style>