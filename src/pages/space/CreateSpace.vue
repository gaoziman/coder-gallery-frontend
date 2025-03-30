<!-- ImprovedCreateSpaceWithLevels.vue -->
<template>
  <div class="create-space-container">
    <!-- 顶部渐变背景区域 -->
    <div class="header-gradient">
      <div class="header-content">
        <h1 class="page-title">创建您的个人空间</h1>
        <p class="page-subtitle">轻松创建并管理您的图片空间</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content-wrapper">
      <div class="main-content-area">
        <!-- 左侧信息区 -->
        <div class="info-sidebar">
          <a-card class="sidebar-card space-features">
            <template #title>
              <div class="card-title">
                <crown-outlined />
                <span>空间特性</span>
              </div>
            </template>
            <div class="feature-list">
              <div class="feature-item">
                <check-circle-outlined />
                <span>无限量相册创建</span>
              </div>
              <div class="feature-item">
                <check-circle-outlined />
                <span>智能分类整理</span>
              </div>
              <div class="feature-item">
                <check-circle-outlined />
                <span>高清图片存储</span>
              </div>
              <div class="feature-item">
                <check-circle-outlined />
                <span>便捷分享功能</span>
              </div>
              <div class="feature-item">
                <check-circle-outlined />
                <span>安全隐私保护</span>
              </div>
            </div>
          </a-card>

          <a-card class="sidebar-card usage-tips">
            <template #title>
              <div class="card-title">
                <bulb-outlined />
                <span>使用提示</span>
              </div>
            </template>
            <div class="tips-content">
              <p>创建自己的空间后，您可以：</p>
              <ul>
                <li>上传并管理您的图片资源</li>
                <li>创建多个相册进行分类</li>
                <li>设置适合您的访问权限</li>
                <li>与好友分享您的作品</li>
              </ul>
            </div>
          </a-card>
        </div>

        <!-- 中间创建空间卡片 -->
        <a-card class="create-space-card" :bordered="false">
          <a-form :model="spaceForm" :rules="rules" ref="spaceFormRef" layout="vertical">
            <!-- 空间名称 -->
            <a-form-item label="空间名称" name="name" required>
              <a-input
                  v-model:value="spaceForm.name"
                  placeholder="请输入空间名称"
                  :maxLength="30"
                  show-count
                  allow-clear
              >
                <template #suffix v-if="spaceForm.name">
                  <close-circle-outlined @click="clearName" />
                </template>
              </a-input>
            </a-form-item>

            <!-- 空间级别 -->
            <a-form-item label="空间级别" name="level" required>
              <a-select
                  v-model:value="spaceForm.level"
                  placeholder="请选择空间级别"
                  @change="handleLevelChange"
              >
                <a-select-option value="standard">
                  普通版 <tag-outlined /> (10GB存储空间)
                </a-select-option>
                <a-select-option value="professional" disabled>
                  专业版 <crown-outlined /> (50GB存储空间)
                </a-select-option>
                <a-select-option value="premium" disabled>
                  旗舰版 <fire-outlined /> (100GB存储空间)
                </a-select-option>
              </a-select>
              <div class="level-tip" v-if="showLevelTip">
                <info-circle-outlined />
                <span>只能创建普通版空间，升级账户后可创建更高级别空间</span>
              </div>
            </a-form-item>

            <!-- 空间封面 -->
            <a-form-item label="空间封面" name="cover">
              <a-upload-dragger
                  v-model:fileList="fileList"
                  name="file"
                  :beforeUpload="beforeUpload"
                  @change="handleChange"
                  :showUploadList="false"
                  accept="image/*"
              >
                <div class="upload-content">
                  <div v-if="!spaceForm.cover" class="upload-hint">
                    <p class="ant-upload-drag-icon">
                      <inbox-outlined />
                    </p>
                    <p class="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p class="ant-upload-hint">支持单个图片，最大10MB</p>
                  </div>
                  <div v-else class="upload-preview">
                    <img :src="spaceForm.cover" alt="空间封面预览" />
                    <div class="upload-actions">
                      <a-button type="primary" shape="circle" size="small" @click.stop="changeImage">
                        <template #icon><edit-outlined /></template>
                      </a-button>
                      <a-button type="primary" danger shape="circle" size="small" @click.stop="removeImage">
                        <template #icon><delete-outlined /></template>
                      </a-button>
                    </div>
                  </div>
                </div>
              </a-upload-dragger>
            </a-form-item>

            <!-- 访问权限 -->
            <a-form-item label="访问权限" name="visibility">
              <a-radio-group v-model:value="spaceForm.visibility" button-style="solid">
                <a-radio-button value="private">
                  <template #icon><lock-outlined /></template>
                  私密
                </a-radio-button>
                <a-radio-button value="friends">
                  <template #icon><team-outlined /></template>
                  好友可见
                </a-radio-button>
                <a-radio-button value="public">
                  <template #icon><global-outlined /></template>
                  公开
                </a-radio-button>
              </a-radio-group>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" block @click="createSpace">创建空间</a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 右侧信息区 -->
        <div class="info-sidebar">
          <a-card class="sidebar-card premium-features">
            <template #title>
              <div class="card-title">
                <star-outlined />
                <span>空间级别对比</span>
              </div>
            </template>
            <div class="level-comparison">
              <div class="level-row level-header">
                <div class="level-cell"></div>
                <div class="level-cell">普通版</div>
                <div class="level-cell">专业版</div>
                <div class="level-cell">旗舰版</div>
              </div>
              <div class="level-row">
                <div class="level-cell">存储空间</div>
                <div class="level-cell">10GB</div>
                <div class="level-cell">50GB</div>
                <div class="level-cell">100GB</div>
              </div>
              <div class="level-row">
                <div class="level-cell">单文件大小</div>
                <div class="level-cell">10MB</div>
                <div class="level-cell">50MB</div>
                <div class="level-cell">100MB</div>
              </div>
              <div class="level-row">
                <div class="level-cell">同时上传</div>
                <div class="level-cell">5张</div>
                <div class="level-cell">20张</div>
                <div class="level-cell">无限制</div>
              </div>
              <div class="level-row">
                <div class="level-cell">图片编辑</div>
                <div class="level-cell">基础</div>
                <div class="level-cell">高级</div>
                <div class="level-cell">专业</div>
              </div>
              <div class="level-row">
                <div class="level-cell">AI分析</div>
                <div class="level-cell">
                  <close-outlined class="icon-no" />
                </div>
                <div class="level-cell">
                  <check-outlined class="icon-yes" />
                </div>
                <div class="level-cell">
                  <check-outlined class="icon-yes" />
                </div>
              </div>
              <div class="level-row">
                <div class="level-cell">备份加密</div>
                <div class="level-cell">
                  <close-outlined class="icon-no" />
                </div>
                <div class="level-cell">
                  <close-outlined class="icon-no" />
                </div>
                <div class="level-cell">
                  <check-outlined class="icon-yes" />
                </div>
              </div>
            </div>
            <div class="upgrade-section">
              <a-button type="primary" class="upgrade-button">升级账户</a-button>
            </div>
          </a-card>

          <a-card class="sidebar-card help-card">
            <template #title>
              <div class="card-title">
                <question-circle-outlined />
                <span>需要帮助？</span>
              </div>
            </template>
            <div class="help-content">
              <p>查看我们的指南了解如何：</p>
              <ul>
                <li>有效组织您的图片</li>
                <li>设置合适的访问权限</li>
                <li>使用高级编辑功能</li>
              </ul>
              <a-button type="link" class="help-link">查看帮助文档</a-button>
            </div>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  LockOutlined, TeamOutlined, GlobalOutlined, InboxOutlined, EditOutlined, TagOutlined,
  DeleteOutlined, CloseCircleOutlined, BulbOutlined, CheckCircleOutlined, InfoCircleOutlined,
  CrownOutlined, StarOutlined, QuestionCircleOutlined, FireOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons-vue';

const router = useRouter();

// 空间表单数据
const spaceForm = reactive({
  name: '',
  cover: '',
  visibility: 'private',
  level: 'standard'
});

// 显示级别提示
const showLevelTip = ref(false);

// 处理级别变更
const handleLevelChange = (value) => {
  if (value !== 'standard') {
    // 如果选择了非普通版，显示提示并重置为普通版
    message.warning('您当前无权创建指定级别的空间，请升级账户后再试');
    showLevelTip.value = true;
    spaceForm.level = 'standard';
  } else {
    showLevelTip.value = false;
  }
};

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入空间名称', trigger: 'blur' },
    { min: 2, max: 30, message: '名称长度应为2-30个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择空间级别', trigger: 'change' }
  ]
};

// 封面上传相关
const fileList = ref([]);
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('图片大小不能超过10MB!');
    return false;
  }

  // 将文件转换为 base64 预览
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    spaceForm.cover = e.target.result;
  };

  return false; // 阻止自动上传
};

// 处理图片变化
const handleChange = (info) => {
  fileList.value = info.fileList.slice(-1);
};

// 清除名称
const clearName = () => {
  spaceForm.name = '';
};

// 更换图片
const changeImage = (e) => {
  e.stopPropagation();
  // 触发上传按钮点击
  const uploadInput = document.querySelector('.ant-upload input');
  if (uploadInput) {
    uploadInput.click();
  }
};

// 移除图片
const removeImage = (e) => {
  e.stopPropagation();
  spaceForm.cover = '';
  fileList.value = [];
};

// 表单引用
const spaceFormRef = ref(null);

// 创建空间
const createSpace = async () => {
  try {
    await spaceFormRef.value.validate();

    // 这里添加创建空间的逻辑
    // API调用示例：
    // const result = await createUserSpace({
    //   name: spaceForm.name,
    //   cover: spaceForm.cover,
    //   visibility: spaceForm.visibility,
    //   level: spaceForm.level
    // });

    message.success('空间创建成功！');

    // 模拟创建成功后跳转到新创建的空间
    router.push('/space');
  } catch (error) {
    message.error('请完成必填项');
  }
};

// 初始化
onMounted(() => {
  // 如果用户名可获取，默认填充空间名称
  const userName = '我的'; // 实际使用时应从用户信息中获取
  spaceForm.name = `${userName}空间`;
});
</script>

<style scoped>
/* 页面容器 */
.create-space-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  background-color: #f7f9fc;
}

/* 顶部渐变背景 */
.header-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  padding: 40px 0;
  color: white;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 主要内容包装区域 */
.main-content-wrapper {
  background-color: #f7f9fc;
  padding: 0 20px;
}

/* 主要内容区域 - 三栏布局 */
.main-content-area {
  max-width: 1200px;
  margin: -30px auto 40px;
  display: flex;
  gap: 20px;
}

/* 级别提示样式 */
.level-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #faad14;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 级别对比表格样式 */
.level-comparison {
  width: 100%;
  margin-bottom: 20px;
}

.level-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.level-row:last-child {
  border-bottom: none;
}

.level-header {
  font-weight: 600;
  color: #333;
}

.level-cell {
  padding: 10px 8px;
  flex: 1;
  text-align: center;
  font-size: 13px;
}

.level-cell:first-child {
  text-align: left;
  font-weight: 500;
}

.icon-yes {
  color: #52c41a;
}

.icon-no {
  color: #ff4d4f;
}

.upgrade-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.upgrade-button {
  background: linear-gradient(to right, #722ed1, #1890ff);
  border: none;
}

/* 侧边栏样式 */
.info-sidebar {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.card-title :deep(.anticon) {
  color: #6366f1;
}

/* 空间特性卡片 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-item :deep(.anticon) {
  color: #52c41a;
}

/* 使用提示卡片 */
.tips-content p {
  margin-bottom: 12px;
}

.tips-content ul {
  padding-left: 20px;
}

.tips-content li {
  margin-bottom: 8px;
  color: #666;
}

/* 高级功能卡片 */
.premium-content p {
  margin-bottom: 16px;
}

.premium-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.premium-feature :deep(.anticon) {
  font-size: 18px;
  color: #faad14;
  margin-top: 2px;
}

.premium-feature h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.premium-feature p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.premium-button {
  margin-top: 8px;
  background: linear-gradient(to right, #faad14, #fa8c16);
  border: none;
}

/* 帮助卡片 */
.help-content p {
  margin-bottom: 12px;
}

.help-content ul {
  padding-left: 20px;
  margin-bottom: 16px;
}

.help-content li {
  margin-bottom: 8px;
  color: #666;
}

.help-link {
  padding: 0;
}

/* 创建空间卡片 */
.create-space-card {
  width: 50%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

/* 上传区域样式 */
.upload-content {
  position: relative;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-hint {
  text-align: center;
}

.ant-upload-drag-icon {
  margin-bottom: 16px;
  font-size: 42px;
  color: #6366f1;
}

.ant-upload-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.ant-upload-hint {
  font-size: 12px;
  color: #888;
}

.upload-preview {
  width: 100%;
  position: relative;
}

.upload-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-preview:hover .upload-actions {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .main-content-area {
    flex-direction: column;
  }

  .info-sidebar, .create-space-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .header-gradient {
    padding: 30px 0;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .level-comparison {
    font-size: 12px;
  }

  .level-cell {
    padding: 8px 4px;
  }
}
</style>