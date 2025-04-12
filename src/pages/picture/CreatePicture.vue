<!-- pages/picture/CreatePicture.vue -->
<template>
  <div class="create-picture-page">
    <!-- 页面标题区域 -->
    <div class="enhanced-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-container">
            <h1 class="main-title">
              <picture-outlined />
              创建图片
            </h1>
            <p class="page-desc">上传您的图片作品，与更多人分享您的创意和视角</p>
          </div>
          <div class="statistics-container">
            <div class="stat-item">
              <upload-outlined />
              <span>今日上传: <strong>253</strong></span>
            </div>
            <div class="stat-item">
              <eye-outlined />
              <span>昨日浏览: <strong>1.2万</strong></span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="inspiration-container">
            <div class="inspiration-text">今日灵感</div>
            <div class="inspiration-quote">"摄影不只是记录现实，更是发现美的过程"</div>
            <div class="inspiration-author">— 安塞尔·亚当斯</div>
          </div>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div class="upload-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">
              <upload-outlined />
            </div>
            <div class="step-text">上传图片</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ 'active': pictureData }">
            <div class="step-icon">
              <form-outlined />
            </div>
            <div class="step-text">填写信息</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ 'active': submitted }">
            <div class="step-icon">
              <check-circle-outlined />
            </div>
            <div class="step-text">发布成功</div>
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

    <!-- 上传区域 -->
    <a-card class="upload-card" :bordered="false" v-if="!pictureData">
      <a-tabs v-model:activeKey="activeTabKey">
        <!-- 本地上传选项卡 -->
        <a-tab-pane key="local" tab="本地上传">
          <local-upload-component :onUploadSuccess="handleUploadSuccess" />
        </a-tab-pane>

        <!-- 链接上传选项卡 -->
        <a-tab-pane key="link" tab="链接上传">
          <url-upload-component :onUploadSuccess="handleUploadSuccess" />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 提示用户上传成功的消息 - 全新设计 -->
    <a-card v-if="pictureData && !showForm" class="success-card" :bordered="false">
      <div class="modern-success-container">
        <!-- 顶部成功信息 -->
        <div class="success-status-bar">
          <div class="status-icon-wrapper">
            <check-circle-filled class="status-icon" />
          </div>
          <div class="status-text">
            <h2 class="status-title">上传成功</h2>
            <p class="status-description">您的图片已成功上传至平台</p>
          </div>
          <div class="status-actions">
            <a-button type="primary" @click="showForm = true">
              <form-outlined />
              完善信息
            </a-button>
            <a-button @click="resetUpload">
              <reload-outlined />
              重新上传
            </a-button>
          </div>
        </div>

        <!-- 主要内容区 -->
        <div class="preview-content">
          <!-- 左侧大图预览 -->
          <div class="image-preview-section">
            <div class="image-preview-card">
              <div class="image-preview-header">
                <h3><picture-outlined /> 图片预览</h3>
                <a-tag color="processing">原始尺寸</a-tag>
              </div>
              <div class="image-container">
                <img
                    :src="pictureData.url || pictureData.thumbnailUrl"
                    alt="已上传图片"
                    class="preview-image"
                    @error="handleImageError"
                />
              </div>
              <div class="image-action-buttons">
                <a-button type="link" class="image-action-btn">
                  <copy-outlined />
                  <span>复制链接</span>
                </a-button>
                <a-button type="link" class="image-action-btn">
                  <download-outlined />
                  <span>下载图片</span>
                </a-button>
                <a-button type="link" class="image-action-btn">
                  <share-alt-outlined />
                  <span>分享</span>
                </a-button>
              </div>
            </div>
          </div>

          <!-- 右侧信息与其他内容 -->
          <div class="info-section">
            <!-- 图片详情卡片 -->
            <div class="info-card">
              <div class="info-card-header">
                <file-image-outlined />
                <span>图片信息</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-label"><idcard-outlined /> ID</div>
                  <div class="info-value">
                    <a-tooltip :title="pictureData.id">
                      <span class="truncated-text">{{ pictureData.id }}</span>
                    </a-tooltip>
                    <a-button
                        type="link"
                        class="copy-btn"
                        size="small"
                        @click="copyToClipboard(pictureData.id)"
                    >
                      <copy-outlined />
                    </a-button>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label"><calendar-outlined /> 上传时间</div>
                  <div class="info-value">{{ formatDate(pictureData.createTime) }}</div>
                </div>
                <div class="info-row" v-if="pictureData.size">
                  <div class="info-label"><file-outlined /> 文件大小</div>
                  <div class="info-value">{{ formatSize(pictureData.size) }}</div>
                </div>
                <div class="info-row" v-if="pictureData.width && pictureData.height">
                  <div class="info-label"><column-width-outlined /> 尺寸</div>
                  <div class="info-value">{{ pictureData.width }} × {{ pictureData.height }} px</div>
                </div>
                <div class="info-row" v-if="pictureData.format">
                  <div class="info-label"><file-image-outlined /> 格式</div>
                  <div class="info-value">
                    <a-tag :color="getFormatColor(pictureData.format)">{{ pictureData.format }}</a-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 下一步指引卡片 -->
            <div class="next-steps-card">
              <div class="next-steps-header">
                <bulb-outlined />
                <span>下一步</span>
              </div>
              <div class="next-steps-content">
                <p class="next-step-item">
                  <arrow-right-outlined />
                  <span>完善<strong>标题</strong>和<strong>描述</strong>让您的作品更易被发现</span>
                </p>
                <p class="next-step-item">
                  <arrow-right-outlined />
                  <span>添加<strong>标签</strong>和<strong>分类</strong>提高图片搜索排名</span>
                </p>
                <p class="next-step-item">
                  <arrow-right-outlined />
                  <span>上传完成后可在<strong>首页</strong>中查看</span>
                </p>
              </div>
              <div class="next-steps-footer">
                <a-button type="primary" @click="showForm = true" >
                  <form-outlined />继续完善信息
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 表单区域 - 仅当有预览图时显示 - 全新设计 -->
    <div
        v-if="pictureData && showForm"
        class="enhanced-form-container"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
    >
      <!-- 精美图片展示区 -->
      <div class="image-showcase">
        <div class="showcase-header">
          <div class="showcase-title">
            <picture-outlined />
            <span>完善图片信息</span>
          </div>
          <div class="showcase-meta">
            <div class="meta-badge" v-if="pictureData.format">
              <a-tag :color="getFormatColor(pictureData.format)">{{ pictureData.format }}</a-tag>
            </div>
            <div class="meta-badge" v-if="pictureData.width && pictureData.height">
              <a-tag color="blue">{{ pictureData.width }} × {{ pictureData.height }}</a-tag>
            </div>
            <div class="meta-badge" v-if="pictureData.size">
              <a-tag color="cyan">{{ formatSize(pictureData.size) }}</a-tag>
            </div>
            <div class="meta-badge">
              <a-tag color="purple">ID: {{ pictureData.id.substring(0, 8) }}...</a-tag>
              <copy-outlined class="copy-meta-icon" @click="copyToClipboard(pictureData.id)" />
            </div>
          </div>
        </div>


        <!-- 图片尺寸指示器部分 -->
        <div class="image-frame">
          <div class="image-wrapper">
            <img
                :src="pictureData.url || pictureData.thumbnailUrl"
                alt="已上传图片"
                class="showcase-image"
                @error="handleImageError"
            />

            <!-- 优化后的尺寸指示器 -->
            <div class="dimension-indicators">
              <div class="width-indicator">
                <div class="dimension-line width-line"></div>
                <div class="dimension-value">{{ pictureData.picWidth || '未知' }} px</div>
              </div>
              <div class="height-indicator">
                <div class="dimension-line height-line"></div>
                <div class="dimension-value">{{ pictureData.picHeight || '未知' }} px</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 表单内容卡片 -->
      <div class="form-content-card">
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
            <a-form-item label="图片名称" name="title" required>
              <a-input
                  v-model:value="pictureForm.title"
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
                      v-model:value="pictureForm.tags"
                      mode="multiple"
                      placeholder="选择或输入标签"
                      :options="tagOptions"
                      :max-tag-count="3"
                      :max-tag-text-length="10"
                      allow-clear
                      :tokenSeparators="[',']"
                  >
                    <template #suffixIcon><tags-outlined /></template>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <!-- 提交按钮区域 -->
          <div class="form-actions">
            <a-button @click="resetForm">取消</a-button>
            <a-button type="primary" @click="submitForm" :loading="submitting">
              发布图片
            </a-button>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { message, TreeSelect } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import LocalUploadComponent from '@/components/picture/LocalUploadComponent.vue';
import UrlUploadComponent from '@/components/picture/UrlUploadComponent.vue';
import { editPictureUsingPost } from '@/api/tupianxiangguanjiekou';
import {
  PictureOutlined,
  UploadOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  AppstoreOutlined,
  TagsOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileOutlined,
  FileImageOutlined,
  IdcardOutlined,
  ColumnWidthOutlined,
  CopyOutlined,
  DownloadOutlined,
  BulbOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue';

import { getCategoryTreeForFrontendUsingGet } from '@/api/fenleiguanli';
import { getTagListUsingGet } from '@/api/biaoqianguanli';

const router = useRouter();

// 激活的标签页
const activeTabKey = ref('local');

// 已上传的图片数据
const pictureData = ref(null);
// 是否显示表单
const showForm = ref(false);
// 是否已提交
const submitted = ref(false);

// 图片表单
const pictureFormRef = ref(null);
const pictureForm = reactive({
  id: '', // 存储上传后返回的图片ID
  title: '',
  description: '',
  category: undefined, // 这里存储的是分类ID (categoryId)
  tags: []  // 这里存储的是标签ID数组 (tagIds)
});

// 提交状态
const submitting = ref(false);

// 分类数据
const categoryData = ref([]);
// 标签数据
const tagOptions = ref([]);

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入图片名称', trigger: 'blur' },
    { min: 2, max: 50, message: '图片名称长度为2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ]
};



// 获取图片格式对应的颜色
const getFormatColor = (format) => {
  const formatColors = {
    'JPG': 'blue',
    'JPEG': 'blue',
    'PNG': 'green',
    'GIF': 'purple',
    'WEBP': 'cyan',
    'SVG': 'orange'
  };

  return formatColors[format?.toUpperCase()] || 'default';
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
      console.log('标签数据获取成功:', tagOptions.value);
    } else {
      console.error('标签数据获取失败');
      message.error('标签数据获取失败');
    }
  } catch (error) {
    console.error('获取标签数据出错:', error);
    message.error('获取标签数据出错: ' + (error.message || '未知错误'));
  }
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

  // 返回匹配的图标，如果没有匹配则返回默认图标
  return iconMap[type] || AppstoreOutlined;
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

// 添加复制到剪贴板功能
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制到剪贴板');
  }, () => {
    message.error('复制失败');
  });
};

// 处理图片加载错误
const handleImageError = (e) => {
  console.error('图片加载失败:', e);
  // 如果主图片加载失败，尝试使用缩略图
  if (pictureData.value && pictureData.value.thumbnailUrl && e.target.src !== pictureData.value.thumbnailUrl) {
    e.target.src = pictureData.value.thumbnailUrl;
  } else {
    // 如果缩略图也失败或不存在，显示默认占位图
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoMTYwdjE2MEgweiIvPjxwYXRoIGQ9Ik02NCA0OS44MmM3LjM1NCAwIDEzLjMxOCA1Ljk2NCAxMy4zMTggMTMuMzE4cy01Ljk2NCAxMy4zMTgtMTMuMzE4IDEzLjMxOGMtNy4zNTUgMC0xMy4zMTgtNS45NjQtMTMuMzE4LTEzLjMxOFM1Ni42NDUgNDkuODIgNjQgNDkuODJ6bTQ0Ljc4OSA2Mi42M0w5Ni45MiA5OC44MDZsMTIuMDEzLTEyLjAxNCAyMy4zNzUgMjMuMzc1LTIzLjUyIDIuMjgzeiIgZmlsbD0iI0VFRSIvPjxwYXRoIGQ9Ik0xMjggMTEyLjQ1VjExNkg0MHYtMTQuNjg2bDE2LjQwMi0xNi40MDIgMTkuNDUzIDE5LjQ1M0wxMjggNTJ2NjAuNDV6IiBmaWxsPSIjRjVGNUY1Ii8+PC9nPjwvc3ZnPg==';
  }
};

// 处理上传成功的回调
const handleUploadSuccess = (pictureVO) => {
  if (pictureVO.id && typeof pictureVO.id !== 'string') {
    pictureVO.id = String(pictureVO.id);
  }

  pictureData.value = pictureVO;

  // 预填充表单数据
  pictureForm.id = pictureVO.id;

  // 设置标题 - 优先使用返回的title，其次是name，再次是文件名
  if (pictureVO.title) {
    pictureForm.title = pictureVO.title;
  } else if (pictureVO.name) {
    pictureForm.title = pictureVO.name;
  } else {
    // 尝试从URL中提取文件名作为默认标题
    try {
      const urlParts = new URL(pictureVO.url || pictureVO.thumbnailUrl).pathname.split('/');
      const fileName = urlParts[urlParts.length - 1].split('.')[0];
      if (fileName) {
        pictureForm.title = decodeURIComponent(fileName);
      }
    } catch (e) {
      console.log('无法从URL提取文件名');
    }
  }

  // 设置描述
  if (pictureVO.description) {
    pictureForm.description = pictureVO.description;
  }

  // 设置分类
  if (pictureVO.categoryId) {
    pictureForm.category = pictureVO.categoryId;
  } else if (pictureVO.category) {
    pictureForm.category = pictureVO.category;
  }

  // 设置标签 - 优先使用tagIds
  if (pictureVO.tagIds) {
    pictureForm.tags = pictureVO.tagIds;
  } else if (pictureVO.tags) {
    pictureForm.tags = Array.isArray(pictureVO.tags) ? pictureVO.tags : [pictureVO.tags];
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知';

  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return dateString; // 如果解析失败则返回原始字符串
  }
};

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '未知';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// 重置上传
const resetUpload = () => {
  pictureData.value = null;
  showForm.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  // 如果是已上传的图片，返回到上传成功状态
  if (pictureData.value) {
    showForm.value = false;
    return;
  }

  // 重置表单字段
  pictureFormRef.value?.resetFields();

  // 重置其他字段
  Object.assign(pictureForm, {
    id: pictureData.value?.id || '',
    title: '',
    description: '',
    category: undefined,
    tags: []
  });

  message.info('表单已重置');
};

// 提交表单
const submitForm = async () => {
  // 表单验证
  try {
    await pictureFormRef.value.validate();

    // 检查是否有图片ID
    if (!pictureForm.id) {
      message.error('图片信息丢失，请重新上传');
      return;
    }

    // 设置提交中状态
    submitting.value = true;

    // 构建提交数据 - 修改格式以符合后端要求
    const editRequest = {
      id: pictureForm.id,
      name: pictureForm.title,
      description: pictureForm.description,
      categoryId: pictureForm.category, // 使用categoryId作为键名
      tagIds: pictureForm.tags // 使用tagIds作为键名
    };

    console.log('提交的数据:', JSON.stringify(editRequest));

    // 调用编辑接口
    try {
      const result = await editPictureUsingPost(editRequest);

      if (result && result.data) {
        // 提示成功
        message.success('图片发布成功');

        // 设置已提交状态
        submitted.value = true;

        // 延迟后跳转到图片详情页面
        setTimeout(() => {
          router.push(`/picture/${pictureForm.id}`);
        }, 1500);
      } else {
        message.error('图片信息更新失败');
        submitting.value = false;
      }
    } catch (error) {
      console.error('提交错误:', error);
      message.error('提交出错: ' + (error.message || '未知错误'));
      submitting.value = false;
    }

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单是否填写正确');
  }
};

// 页面挂载时检查URL参数，支持预填充一些字段
onMounted(async () => {
  // 获取分类和标签数据
  await fetchCategoryTree();
  await fetchTags();

  // 检查URL参数，支持预填充一些字段
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  if (category) {
    pictureForm.category = category;
  }
});
</script>

<style scoped>
.create-picture-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 增强版页面头部样式 */
.enhanced-page-header {
  margin-bottom: 32px;
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #4a6bef 0%, #7e3ef5 100%);
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
  color: white;
  line-height: 1.6;
}

.statistics-container {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.stat-item {
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

.inspiration-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 16px;
  border-radius: 12px;
  max-width: 280px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.inspiration-text {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.inspiration-quote {
  font-size: 15px;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 8px;
}

.inspiration-author {
  font-size: 13px;
  text-align: right;
  opacity: 0.7;
}

/* 进度指示器 */
.upload-progress {
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
  max-width: 500px;
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
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
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

/* 卡片样式 */
.upload-card,
.success-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  overflow: hidden;
}

/* 全新上传成功页面样式 */
.modern-success-container {
  padding: 0;
  background-color: white;
}

.success-status-bar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, #f6ffed 0%, #e6f7ff 100%);
  border-bottom: 1px solid #e8e8e8;
}

.status-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #52c41a;
  border-radius: 50%;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
}

.status-icon {
  font-size: 28px;
  color: white;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #52c41a;
}

.status-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 4px 0 0 0;
}

.status-actions {
  display: flex;
  gap: 12px;
}

/* 主内容区域 */
.preview-content {
  display: flex;
  padding: 24px;
  gap: 24px;
}

/* 左侧图片预览 */
.image-preview-section {
  flex: 1;
  max-width: 65%;
}

.image-preview-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.image-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.image-preview-header h3 {
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-container {
  position: relative;
  min-height: 500px;
  max-height: 700px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.image-action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 12px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.image-action-btn {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-size: 14px;
}

.image-action-btn span {
  margin-left: 6px;
}

/* 右侧信息卡片 */
.info-section {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card, .next-steps-card, .recommendation-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.info-card-header, .next-steps-header, .recommendation-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  font-weight: 600;
  font-size: 14px;
  gap: 8px;
}

.info-card-content {
  padding: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 6px;
}

.info-value {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #262626;
}

.truncated-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  color: #1890ff;
  padding: 0 4px;
  font-size: 14px;
  margin-left: 6px;
}

/* 下一步卡片 */
.next-steps-content {
  padding: 16px;
}

.next-step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 14px;
  color: #595959;
}

.next-step-item > .anticon {
  color: #52c41a;
  margin-right: 8px;
  margin-top: 3px;
  font-size: 12px;
}

.next-steps-footer {
  padding: 0 16px 16px;
}

/* 全新图片展示与表单区域样式 */
.enhanced-form-container {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 精美图片展示区样式 */
.image-showcase {
  position: relative;
  background-color: #fafafa;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, #f6f9ff 0%, #f0f7ff 100%);
  border-bottom: 1px solid #eaeaea;
}

.showcase-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e1e1e;
}

.showcase-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.copy-meta-icon {
  margin-left: 4px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-meta-icon:hover {
  color: #40a9ff;
  transform: scale(1.1);
}

/* 图片框架与尺寸指示器样式 */
.image-frame {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f5f7fa;
  background-image:
      linear-gradient(45deg, #f0f2f5 25%, transparent 25%, transparent 75%, #f0f2f5 75%, #f0f2f5),
      linear-gradient(45deg, #f0f2f5 25%, transparent 25%, transparent 75%, #f0f2f5 75%, #f0f2f5);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

.image-wrapper {
  position: relative;
  max-width: 90%;
  max-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: #fff;
}

.showcase-image {
  display: block;
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}


.image-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

/* 全新设计的尺寸指示器 */
.dimension-indicators {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.width-indicator {
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.height-indicator {
  position: absolute;
  top: 0;
  right: 16px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.dimension-line {
  background-color: rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.width-line {
  height: 2px;
  width: 60%;
  margin-bottom: 8px;
}

.height-line {
  width: 2px;
  height: 60%;
  margin-right: 8px;
}

.dimension-value {
  font-size: 12px;
  color: #fff;
  background-color: rgba(24, 144, 255, 0.85);
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

/* 鼠标悬停时的效果增强 */
.image-wrapper:hover .dimension-line {
  background-color: rgba(24, 144, 255, 0.6);
}

.image-wrapper:hover .dimension-value {
  background-color: rgba(24, 144, 255, 1);
  transform: scale(1.05);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .image-frame {
    background-color: #121212;
    background-image:
        linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a),
        linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a);
  }

  .image-wrapper {
    background-color: #262626;
  }

  .dimension-line {
    background-color: rgba(64, 169, 255, 0.4);
  }

  .dimension-value {
    color: #fff;
    background-color: rgba(64, 169, 255, 0.85);
  }

  .image-wrapper:hover .dimension-line {
    background-color: rgba(64, 169, 255, 0.7);
  }

  .image-wrapper:hover .dimension-value {
    background-color: rgba(64, 169, 255, 1);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .image-frame {
    padding: 20px;
  }

  .width-line {
    width: 80%;
  }

  .height-line {
    height: 80%;
  }

  .dimension-value {
    font-size: 11px;
    padding: 3px 6px;
  }
}

/* 极小屏幕适配 */
@media (max-width: 480px) {
  .dimension-indicators {
    opacity: 0.8;
  }

  .width-indicator {
    bottom: 8px;
  }

  .height-indicator {
    right: 8px;
  }

  .width-line, .height-line {
    display: none; /* 在极小屏幕上隐藏线条，只保留数值标签 */
  }
}

.width-indicator {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.height-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.indicator-line {
  background-color: rgba(0, 0, 0, 0.1);
}

.width-indicator .indicator-line {
  height: 2px;
  width: 120px;
}

.height-indicator .indicator-line {
  width: 2px;
  height: 120px;
  margin-right: 8px;
}

.indicator-value {
  font-size: 12px;
  color: #8c8c8c;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
}

.height-indicator .indicator-value {
  margin-top: 0;
  margin-left: 4px;
  writing-mode: vertical-lr;
  text-orientation: mixed;
  transform: rotate(180deg);
}

/* 表单内容卡片样式 */
.form-content-card {
  background-color: white;
  padding: 24px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  position: relative;
  padding-left: 12px;
  margin: 0 0 16px 0;
  font-weight: 500;
  color: #262626;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #1890ff;
  border-radius: 2px;
}

/* 按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .create-picture-page {
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

  .inspiration-container {
    max-width: 100%;
  }

  .statistics-container {
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

  /* 响应式调整 - 上传成功页面 */
  .success-status-bar {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .status-icon-wrapper {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .status-actions {
    margin-top: 16px;
    width: 100%;
    flex-direction: column;
  }

  .preview-content {
    flex-direction: column;
    padding: 16px;
  }

  .image-preview-section {
    max-width: 100%;
  }

  .info-section {
    width: 100%;
  }

  .image-container {
    min-height: 300px;
  }

  /* 响应式调整 - 新表单页面 */
  .showcase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .showcase-meta {
    width: 100%;
  }

  .image-frame {
    padding: 20px;
  }

  .image-wrapper {
    max-width: 100%;
  }

  .width-indicator, .height-indicator {
    display: none;
  }

  .form-content-card {
    padding: 16px;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .create-picture-page {
    background-color: #121212;
  }

  .enhanced-page-header {
    background: linear-gradient(135deg, #3a59c7 0%, #5d3eae 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .upload-card,
  .success-card,
  .enhanced-form-container {
    background-color: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .modern-success-container {
    background-color: #1f1f1f;
  }

  .success-status-bar {
    background: linear-gradient(90deg, #162312 0%, #111d2c 100%);
    border-bottom-color: #303030;
  }

  .image-preview-card,
  .info-card,
  .next-steps-card,
  .recommendation-card {
    background-color: #1f1f1f;
    border-color: #303030;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .image-preview-header,
  .info-card-header,
  .next-steps-header,
  .recommendation-header {
    background-color: #262626;
    border-bottom-color: #303030;
  }

  .image-container {
    background-color: #262626;
  }

  .image-action-buttons {
    background-color: #262626;
    border-top-color: #303030;
  }

  .info-label {
    color: #a6a6a6;
  }

  .info-value {
    color: #e0e0e0;
  }

  .next-step-item {
    color: #a6a6a6;
  }


  /* 改进的分类树样式 - 可以添加到CreatePicture.vue的style部分 */
  .enhanced-tree-select {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* 自定义树节点样式 */
  :deep(.ant-tree) {
    background: transparent;
    padding: 8px 0;
  }

  :deep(.ant-tree-treenode) {
    padding: 4px 0;
    transition: all 0.2s;
    border-radius: 6px;
    margin: 2px 0;
  }

  :deep(.ant-tree-treenode:hover) {
    background-color: rgba(24, 144, 255, 0.05);
  }

  :deep(.ant-tree-node-content-wrapper) {
    transition: all 0.3s;
    padding: 6px 8px;
    border-radius: 4px;
  }

  :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background-color: rgba(24, 144, 255, 0.1);
  }

  :deep(.ant-tree-node-content-wrapper:hover) {
    background-color: rgba(24, 144, 255, 0.1);
  }

  :deep(.ant-tree-indent-unit) {
    width: 20px;
  }

  /* 自定义展开/折叠图标 */
  :deep(.ant-tree-switcher) {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    transition: all 0.3s;
    background: transparent;
    margin-right: 4px;
  }

  :deep(.ant-tree-switcher:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* 自定义下拉样式 */
  :deep(.ant-select-tree-dropdown) {
    padding: 8px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* 分类图标样式 */
  .category-icon {
    margin-right: 6px;
    font-size: 14px;
    color: #1890ff;
    opacity: 0.8;
  }

  /* 父级分类样式 */
  .parent-category {
    font-weight: 500;
  }

  /* 子级分类样式 */
  .child-category {
    font-size: 14px;
    color: #666;
  }

  /* 自定义搜索框样式 */
  :deep(.ant-select-selector) {
    border-radius: 8px !important;
    padding: 0 12px !important;
    height: 38px !important;
    box-shadow: none !important;
    border: 1px solid #e8e8e8 !important;
    transition: all 0.3s !important;
  }

  :deep(.ant-select-selector:hover) {
    border-color: #40a9ff !important;
  }

  :deep(.ant-select:focus .ant-select-selector),
  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
  }

  :deep(.ant-select-arrow) {
    color: #1890ff;
  }

  /* 增强悬停效果 */
  :deep(.ant-tree-treenode) {
    position: relative;
    overflow: hidden;
  }

  :deep(.ant-tree-treenode)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0) 70%);
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.3s;
    z-index: 0;
    pointer-events: none;
  }

  :deep(.ant-tree-treenode:hover)::before {
    opacity: 1;
    transform: scale(1);
  }

  /* 美化图标 */
  :deep(.ant-tree-switcher-icon) {
    transition: transform 0.3s;
  }

  :deep(.ant-tree-switcher_open .ant-tree-switcher-icon) {
    transform: rotate(90deg);
  }

  /* 美化滚动条 */
  :deep(.ant-select-tree-list-holder::-webkit-scrollbar) {
    width: 6px;
  }

  :deep(.ant-select-tree-list-holder::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 3px;
  }

  :deep(.ant-select-tree-list-holder::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.10);
    border-radius: 3px;
    transition: all 0.3s;
  }

  :deep(.ant-select-tree-list-holder::-webkit-scrollbar-thumb:hover) {
    background: rgba(0, 0, 0, 0.15);
  }

  /* 暗黑模式适配 */
  @media (prefers-color-scheme: dark) {
    .enhanced-tree-select {
      background: #1f1f1f;
    }

    :deep(.ant-tree-treenode:hover) {
      background-color: rgba(64, 169, 255, 0.1);
    }

    :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
      background-color: rgba(64, 169, 255, 0.2);
    }

    :deep(.ant-tree-node-content-wrapper:hover) {
      background-color: rgba(64, 169, 255, 0.15);
    }

    :deep(.ant-tree-switcher:hover) {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .child-category {
      color: #a6a6a6;
    }

    :deep(.ant-select-selector) {
      background-color: #1f1f1f !important;
      border-color: #303030 !important;
    }

    :deep(.ant-select-selector:hover) {
      border-color: #177ddc !important;
    }

    :deep(.ant-tree-treenode)::before {
      background: radial-gradient(circle, rgba(64, 169, 255, 0.1) 0%, rgba(64, 169, 255, 0) 70%);
    }
  }

  /* 暗黑模式 - 新表单页面 */
  .showcase-header {
    background: linear-gradient(90deg, #20242c 0%, #1c2530 100%);
    border-bottom-color: #303030;
  }

  .showcase-title {
    color: #e0e0e0;
  }

  .image-frame {
    background-color: #121212;
    background-image:
        linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a),
        linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a);
  }

  .indicator-value {
    color: #a6a6a6;
    background-color: rgba(38, 38, 38, 0.8);
  }

  .form-content-card {
    background-color: #1f1f1f;
  }

  .section-title {
    color: #e0e0e0;
  }

  .form-actions {
    border-top-color: #303030;
  }
}
</style>