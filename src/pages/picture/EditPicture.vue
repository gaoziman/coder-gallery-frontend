<template>
  <div class="edit-image-page">
    <!-- 页面标题 -->
    <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }">
      <h1 class="page-title">编辑图片</h1>
      <p class="page-description">优化图片信息，完善您的知识体系</p>
    </div>

    <!-- 步骤提示 -->
    <div class="steps-container" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 100 } }">
      <div class="step active">
        <div class="step-icon">
          <picture-outlined />
        </div>
        <div class="step-content">
          <h3>查看图片</h3>
          <p>预览并管理图片</p>
        </div>
      </div>
      <div class="step-divider"></div>
      <div class="step active">
        <div class="step-icon">
          <form-outlined />
        </div>
        <div class="step-content">
          <h3>编辑信息</h3>
          <p>更新名称和描述</p>
        </div>
      </div>
      <div class="step-divider"></div>
      <div class="step" :class="{ 'active': isFormChanged }">
        <div class="step-icon">
          <check-circle-outlined />
        </div>
        <div class="step-content">
          <h3>保存更改</h3>
          <p>应用您的修改</p>
        </div>
      </div>
    </div>

    <!-- 进度提示 -->
    <div class="progress-container" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 150 } }">
      <a-progress
          :percent="progressPercentage"
          :stroke-color="{ '0%': '#6A35E8', '100%': '#9166FF' }"
          :stroke-width="10"
          class="progress-bar"
      />
      <div class="progress-text">完成度: {{ progressPercentage }}%</div>
    </div>

    <!-- 编辑区域卡片 -->
    <a-card
        class="edit-card"
        :bordered="false"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <a-spin :spinning="isLoading" tip="正在加载图片数据...">
        <a-row :gutter="24">
          <!-- 图片预览区 -->
          <a-col :xs="24" :md="10">
            <div class="image-preview-section">
              <div class="section-header">
                <picture-outlined class="section-icon" />
                <h3 class="section-title">图片预览</h3>
                <a-tooltip title="查看图片详情">
                  <info-circle-outlined class="section-help-icon" />
                </a-tooltip>
              </div>

              <div class="preview-container">
                <template v-if="imageData.url">
                  <img :src="imageData.url" class="preview-image" :style="{ transform: `rotate(${imageRotation}deg)` }" />

                  <div class="preview-actions-wrapper">
                    <div class="preview-actions">
                      <a-tooltip title="放大预览">
                        <a-button class="preview-action-btn" type="primary" shape="circle" @click="zoomImage">
                          <search-outlined />
                        </a-button>
                      </a-tooltip>
                      <a-tooltip title="旋转图片">
                        <a-button class="preview-action-btn" type="primary" shape="circle" @click="rotateImage">
                          <rotate-right-outlined />
                        </a-button>
                      </a-tooltip>
                      <a-tooltip title="替换图片">
                        <a-button class="preview-action-btn" type="primary" shape="circle" @click="showReplaceModal">
                          <swap-outlined />
                        </a-button>
                      </a-tooltip>
                      <a-tooltip title="下载图片">
                        <a-button class="preview-action-btn" type="primary" shape="circle" @click="downloadImage">
                          <download-outlined />
                        </a-button>
                      </a-tooltip>
                    </div>
                  </div>

                  <div class="image-info-overlay">
                    <div class="image-info-item">
                      <file-image-outlined />
                      <span>{{ getImageFormat() }}</span>
                    </div>
                    <div class="image-info-item">
                      <inbox-outlined />
                      <span>{{ getFormattedSize() }}</span>
                    </div>
                    <div class="image-info-item">
                      <calendar-outlined />
                      <span>{{ dayjs(imageData.uploadTime).format('YYYY-MM-DD') }}</span>
                    </div>
                  </div>
                </template>
                <div v-else class="empty-preview">
                  <inbox-outlined class="empty-icon" />
                  <p>暂无图片</p>
                </div>
              </div>

              <!-- 上传历史记录 -->
              <div class="upload-history">
                <div class="history-header">
                  <div class="history-title">
                    <history-outlined class="history-icon" />
                    <h4>历史版本</h4>
                  </div>
                  <a-tooltip title="查看更多历史版本">
                    <a @click="viewAllHistory" class="view-all-link">
                      <eye-outlined /> 查看全部
                    </a>
                  </a-tooltip>
                </div>

                <div class="history-timeline">
                  <a-timeline>
                    <a-timeline-item
                        v-for="(history, index) in imageHistory"
                        :key="index"
                        :color="history.active ? '#6A35E8' : '#C5C5C5'"
                    >
                      <template #dot>
                        <div
                            class="history-dot"
                            :class="{ 'active': history.active }"
                            @click="previewHistoryVersion(history)"
                        >
                          <img :src="history.thumbnail" alt="历史版本缩略图" class="history-thumbnail" />
                        </div>
                      </template>
                      <div class="history-item">
                        <div class="history-info">
                          <span class="history-date">{{ history.date }}</span>
                          <span class="history-user">{{ history.user }}</span>
                        </div>
                        <div class="history-action">
                          <a-button
                              type="link"
                              size="small"
                              class="restore-btn"
                              @click="restoreVersion(history)"
                              :disabled="history.active"
                          >
                            <history-outlined v-if="!history.active" />
                            <check-circle-outlined v-else />
                            {{ history.active ? '当前版本' : '恢复此版本' }}
                          </a-button>
                        </div>
                      </div>
                    </a-timeline-item>
                  </a-timeline>
                </div>
              </div>
            </div>
          </a-col>

          <!-- 编辑信息区 -->
          <a-col :xs="24" :md="14">
            <div class="edit-info-section">
              <div class="section-header">
                <form-outlined class="section-icon" />
                <h3 class="section-title">图片信息</h3>
                <div class="section-subtitle">完善信息可提高管理效率和检索准确度</div>
              </div>

              <a-form layout="vertical" class="edit-form">
                <a-form-item label="图片名称" name="imageName" required>
                  <a-input
                      v-model:value="imageData.name"
                      placeholder="请输入图片名称"
                      class="input-field"
                      @change="updateProgress"
                  >
                    <template #prefix>
                      <edit-outlined />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item label="图片描述" name="imageDescription">
                  <a-textarea
                      v-model:value="imageData.description"
                      placeholder="请输入图片描述，帮助您更好地理解和检索图片"
                      :rows="3"
                      class="input-field"
                      @change="updateProgress"
                  />
                  <div class="field-tips">
                    <bulb-outlined />
                    <span>详细的描述有助于智能分析和图片检索</span>
                  </div>
                </a-form-item>

                <!-- 分类选择 -->
                <a-form-item label="分类" name="imageCategory" required>
                  <a-select
                      v-model:value="imageData.category"
                      placeholder="请选择一个分类"
                      class="input-field category-select"
                      @change="updateProgress"
                  >
                    <template #suffixIcon>
                      <folder-outlined />
                    </template>
                    <a-select-option
                        v-for="category in categoryOptions"
                        :key="category.value"
                        :value="category.value"
                    >
                      <div class="category-option">
                        <span
                            class="category-dot"
                            :style="{ backgroundColor: getCategoryColor(category.value) }"
                        ></span>
                        {{ category.label }}
                      </div>
                    </a-select-option>
                  </a-select>
                </a-form-item>

                <!-- 标签选择 -->
                <a-form-item label="标签" name="imageTags">
                  <a-select
                      v-model:value="imageData.tags"
                      mode="tags"
                      placeholder="请输入标签，回车确认"
                      class="input-field tag-select"
                      @change="updateProgress"
                  >
                    <template #suffixIcon>
                      <tags-outlined />
                    </template>
                    <a-select-option
                        v-for="tag in suggestedTags"
                        :key="tag"
                        :value="tag"
                    >
                      {{ tag }}
                    </a-select-option>
                  </a-select>

                  <div class="suggested-tags">
                    <span class="suggested-tags-title">推荐标签:</span>
                    <div class="suggested-tags-list">
                      <a-tag
                          v-for="tag in suggestedTags.slice(0, 5)"
                          :key="tag"
                          class="suggested-tag"
                          @click="addTag(tag)"
                          v-show="!imageData.tags.includes(tag)"
                      >
                        <plus-outlined /> {{ tag }}
                      </a-tag>
                    </div>
                  </div>
                </a-form-item>


                <!-- 高级设置折叠面板 -->
                <a-collapse ghost class="advanced-settings">
                  <a-collapse-panel key="1" header="高级设置">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="创建日期" name="createDate">
                          <a-date-picker
                              v-model:value="createDate"
                              class="input-field date-picker"
                              valueFormat="YYYY-MM-DD"
                              :disabled="true"
                          >
                            <template #suffixIcon>
                              <calendar-outlined />
                            </template>
                          </a-date-picker>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="最后修改日期" name="modifyDate">
                          <a-date-picker
                              v-model:value="modifyDate"
                              class="input-field date-picker"
                              valueFormat="YYYY-MM-DD"
                              :disabled="true"
                          >
                            <template #suffixIcon>
                              <calendar-outlined />
                            </template>
                          </a-date-picker>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-form-item label="图片URL" name="imageUrl">
                      <a-input
                          v-model:value="imageData.url"
                          class="input-field"
                          disabled
                      >
                        <template #prefix>
                          <link-outlined />
                        </template>
                        <template #addonAfter>
                          <a-tooltip title="复制URL">
                            <copy-outlined @click="copyImageUrl" class="copy-icon" />
                          </a-tooltip>
                        </template>
                      </a-input>
                    </a-form-item>

                    <a-form-item label="图片引用" name="referenceCount">
                      <a-input-number
                          v-model:value="referenceCount"
                          class="input-field reference-count"
                          :min="0"
                          :disabled="true"
                      />
                      <div class="field-tips">
                        <info-circle-outlined />
                        <span>此图片被引用的次数，删除前请确认引用情况</span>
                      </div>
                    </a-form-item>
                  </a-collapse-panel>
                </a-collapse>
              </a-form>
            </div>
          </a-col>
        </a-row>

        <!-- 智能分析区 -->
        <div class="ai-analysis-section" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300 } }">
          <div class="section-header">
            <div class="analysis-title-wrapper">
              <bulb-outlined class="section-icon" />
              <h3 class="section-title">智能分析</h3>
            </div>
            <a-button
                type="primary"
                ghost
                class="refresh-btn"
                @click="refreshAnalysis"
                :loading="analysisLoading"
            >
              <sync-outlined spin v-if="analysisLoading" />
              <sync-outlined v-else />
              刷新分析
            </a-button>
          </div>

          <a-row :gutter="16">
            <a-col :xs="24" :md="8">
              <div class="analysis-card content-card">
                <div class="analysis-card-header">
                  <scan-outlined class="analysis-card-icon" />
                  <span>内容识别</span>
                </div>
                <div class="analysis-card-content">
                  {{ aiAnalysisResult }}
                </div>
                <div class="analysis-accuracy">
                  <div class="accuracy-label">识别准确度:</div>
                  <div class="accuracy-bar">
                    <div class="accuracy-fill" style="width: 85%"></div>
                  </div>
                  <div class="accuracy-value">85%</div>
                </div>
              </div>
            </a-col>

            <a-col :xs="24" :md="8">
              <div class="analysis-card tags-card">
                <div class="analysis-card-header">
                  <tags-outlined class="analysis-card-icon" />
                  <span>推荐标签</span>
                </div>
                <div class="analysis-card-content tag-cloud">
                  <a-tag
                      v-for="tag in aiSuggestedTags"
                      :key="tag"
                      class="ai-tag"
                      @click="addTag(tag)"
                      :class="{ 'used-tag': imageData.tags.includes(tag) }"
                  >
                    <plus-outlined v-if="!imageData.tags.includes(tag)" />
                    <check-outlined v-else />
                    {{ tag }}
                  </a-tag>
                </div>
                <div class="analysis-footer">点击标签添加到图片标签中</div>
              </div>
            </a-col>

            <a-col :xs="24" :md="8">
              <div class="analysis-card similar-card">
                <div class="analysis-card-header">
                  <group-outlined class="analysis-card-icon" />
                  <span>相似图片</span>
                </div>
                <div class="analysis-card-content similar-images">
                  <div
                      v-for="(img, index) in similarImages"
                      :key="index"
                      class="similar-image"
                      @click="viewSimilarImage(img)"
                  >
                    <img :src="img.thumbnail" alt="相似图片" />
                    <div class="similar-image-overlay">
                      <search-outlined />
                    </div>
                    <div class="similar-image-name">{{ img.name }}</div>
                  </div>
                </div>
                <div class="analysis-footer">
                  <a @click="viewMoreSimilarImages">
                    <arrow-right-outlined /> 查看更多相似图片
                  </a>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- 系统提示 -->
        <div class="system-notice" v-if="showNotice" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }">
          <a-alert
              :message="noticeMessage"
              :type="noticeType"
              showIcon
              closable
              @close="closeNotice"
              class="notice-alert"
          />
        </div>
      </a-spin>
    </a-card>

    <!-- 底部工具栏 -->
    <div class="action-buttons" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
      <div class="buttons-left">
        <a-tooltip title="删除此图片">
          <a-popconfirm
              title="确定要删除此图片吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteImage"
          >
            <a-button danger class="action-btn">
              <delete-outlined /> 删除
            </a-button>
          </a-popconfirm>
        </a-tooltip>
        <a-tooltip title="使用此图片创建拷贝">
          <a-button class="action-btn">
            <copy-outlined /> 创建副本
          </a-button>
        </a-tooltip>
        <a-tooltip title="查看使用情况">
          <a-button class="action-btn">
            <bar-chart-outlined /> 使用统计
          </a-button>
        </a-tooltip>
      </div>

      <div class="buttons-right">
        <a-button @click="cancelEdit" class="cancel-btn">
          <close-outlined /> 取消
        </a-button>
        <a-button
            type="primary"
            class="submit-btn"
            :disabled="!isFormChanged"
            :loading="saving"
            @click="saveChanges"
        >
          <save-outlined v-if="!saving" />
          保存更改
        </a-button>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <a-modal v-model:visible="previewModalVisible" :footer="null" class="preview-modal" width="auto">
      <div class="preview-modal-container">
        <img
            :src="previewUrl"
            alt="图片预览"
            class="preview-modal-image"
            :style="{ transform: `rotate(${imageRotation}deg)` }"
        />
        <div class="preview-modal-toolbar">
          <a-button-group>
            <a-button type="primary" @click="rotateImage(-90)">
              <rotate-left-outlined />
            </a-button>
            <a-button type="primary" @click="rotateImage(90)">
              <rotate-right-outlined />
            </a-button>
            <a-button type="primary" @click="downloadImage">
              <download-outlined />
            </a-button>
          </a-button-group>
        </div>
      </div>
    </a-modal>

    <!-- 替换图片弹窗 -->
    <a-modal
        v-model:visible="replaceModalVisible"
        title="替换图片"
        @ok="confirmReplace"
        @cancel="cancelReplace"
        okText="确认替换"
        cancelText="取消"
        :confirmLoading="replacingImage"
    >
      <div class="replace-modal-content">
        <a-tabs v-model:activeKey="replaceActiveTab">
          <a-tab-pane key="local" tab="本地上传">
            <a-upload-dragger
                v-model:fileList="replaceFileList"
                :customRequest="handleReplaceUpload"
                :beforeUpload="beforeUpload"
                :showUploadList="false"
                accept="image/*"
                :multiple="false"
                @change="handleReplaceUploadChange"
                class="custom-uploader"
            >
              <div class="upload-content" v-if="!replacePreviewUrl">
                <div class="upload-icon-wrapper">
                  <cloud-upload-outlined class="upload-icon" />
                </div>
                <p class="upload-text">点击或拖拽图片到此区域上传</p>
                <p class="upload-hint">支持 JPG、PNG、GIF 等格式图片，单个文件不超过 10MB</p>
              </div>

              <div class="preview-container" v-else>
                <img :src="replacePreviewUrl" class="preview-image" />
                <div class="preview-actions">
                  <a-button class="preview-action-btn" type="primary" shape="circle" @click.stop="previewReplaceImage">
                    <search-outlined />
                  </a-button>
                  <a-button class="preview-action-btn" type="primary" danger shape="circle" @click.stop="removeReplaceImage">
                    <delete-outlined />
                  </a-button>
                </div>
              </div>
            </a-upload-dragger>
          </a-tab-pane>

          <a-tab-pane key="url" tab="链接上传">
            <a-form layout="vertical">
              <a-form-item label="图片链接" name="replaceImageUrl">
                <a-input
                    v-model:value="replaceImageUrl"
                    placeholder="请输入图片URL，例如：https://example.com/image.jpg"
                    class="url-input"
                    allow-clear
                    @pressEnter="fetchReplaceImageFromUrl"
                >
                  <template #prefix>
                    <link-outlined />
                  </template>
                  <template #suffix>
                    <a-button
                        type="primary"
                        size="small"
                        class="fetch-btn"
                        @click="fetchReplaceImageFromUrl"
                        :disabled="!replaceImageUrl"
                    >
                      获取
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
            </a-form>

            <!-- URL示例 -->
            <div class="url-examples" v-if="!replacePreviewUrl">
              <h4>链接上传示例</h4>
              <div class="example-links">
                <div class="example-link" v-for="(example, index) in urlExamples" :key="index" @click="useExampleUrl(example)">
                  <div class="example-icon">
                    <img :src="example.thumbnail" alt="示例缩略图" class="example-thumbnail" />
                  </div>
                  <div class="example-info">
                    <p class="example-title">{{ example.title }}</p>
                    <a-tag color="#6A35E8">{{ example.format }}</a-tag>
                  </div>
                </div>
              </div>
            </div>

            <div class="url-preview-wrapper" v-if="replacePreviewUrl && replaceActiveTab === 'url'">
              <div class="url-preview-container">
                <img :src="replacePreviewUrl" class="preview-image" />
                <div class="preview-actions">
                  <a-button class="preview-action-btn" type="primary" shape="circle" @click.stop="previewReplaceImage">
                    <search-outlined />
                  </a-button>
                  <a-button class="preview-action-btn" type="primary" danger shape="circle" @click.stop="removeReplaceImage">
                    <delete-outlined />
                  </a-button>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>

        <div class="replace-options" v-if="replacePreviewUrl">
          <a-checkbox v-model:checked="keepMetadata">保留当前图片的元数据（名称、描述、标签等）</a-checkbox>
          <a-checkbox v-model:checked="createVersion">创建新的历史版本（推荐）</a-checkbox>
        </div>
      </div>
    </a-modal>

    <!-- 查看所有历史版本弹窗 -->
    <a-modal
        v-model:visible="historyModalVisible"
        title="图片历史版本"
        :footer="null"
        width="800px"
    >
      <div class="history-grid">
        <div
            v-for="(version, index) in allHistoryVersions"
            :key="index"
            class="history-version-item"
            :class="{ 'active': version.active }"
        >
          <div class="version-preview">
            <img :src="version.url" alt="历史版本" />
          </div>
          <div class="version-info">
            <div class="version-date">{{ version.date }}</div>
            <div class="version-user">{{ version.user }}</div>
            <div class="version-actions">
              <a-button
                  type="primary"
                  size="small"
                  :disabled="version.active"
                  @click="restoreVersion(version)"
              >
                恢复此版本
              </a-button>
              <a-button
                  size="small"
                  @click="previewHistoryVersion(version)"
              >
                预览
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import {
  CloudUploadOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
  FormOutlined,
  CheckCircleOutlined,
  EditOutlined,
  BulbOutlined,
  ScanOutlined,
  LockOutlined,
  TeamOutlined,
  GlobalOutlined,
  PictureOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  SwapOutlined,
  CopyOutlined,
  HistoryOutlined,
  SyncOutlined,
  DownloadOutlined,
  BarChartOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  FileImageOutlined,
  InboxOutlined,
  FolderOutlined,
  TagsOutlined,
  CloseOutlined,
  PlusOutlined,
  GroupOutlined,
  ArrowRightOutlined,
  SaveOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

// 路由和用户状态
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 加载状态
const isLoading = ref(false);
const saving = ref(false);
const analysisLoading = ref(false);

// 图片基础数据
const imageData = reactive({
  id: 'img-' + Math.floor(Math.random() * 100000),
  name: '图片分析报告',
  description: '这是一个详细的界面分析报告，包含了用户交互流程和关键指标',
  category: 'study',
  tags: ['学习资料', '数据分析', 'UI设计'],
  url: 'https://images.unsplash.com/photo-1593642532400-2682810df593',
  permission: 'private',
  uploadType: 'local',
  uploadTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
  lastModified: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
  userId: userStore.userInfo?.id
});

// 保存原始数据用于比较
const originalData = JSON.parse(JSON.stringify(imageData));

// 相关状态变量
const previewModalVisible = ref(false);
const replaceModalVisible = ref(false);
const historyModalVisible = ref(false);
const previewUrl = ref(imageData.url);
const imageRotation = ref(0);

// 替换图片相关
const replaceActiveTab = ref('local');
const replaceFileList = ref([]);
const replacePreviewUrl = ref('');
const replaceImageUrl = ref('');
const replacingImage = ref(false);
const keepMetadata = ref(true);
const createVersion = ref(true);
const replaceUploadedFile = ref(null);

// 系统提示
const showNotice = ref(true);
const noticeMessage = ref('为确保图片质量，建议添加清晰的描述和适当的标签，以便更好地管理和检索');
const noticeType = ref('info');

// 日期相关
const createDate = ref(dayjs(imageData.uploadTime).format('YYYY-MM-DD'));
const modifyDate = ref(dayjs(imageData.lastModified).format('YYYY-MM-DD'));
const referenceCount = ref(8);

// 分类选项
const categoryOptions = [
  { label: '个人收藏', value: 'personal' },
  { label: '学习资料', value: 'study' },
  { label: '工作项目', value: 'work' },
  { label: '设计灵感', value: 'design' },
  { label: '参考图', value: 'reference' },
  { label: '其他', value: 'other' }
];

// 推荐标签
const suggestedTags = [
  '知识笔记', '学习资料', '参考图', '教程', '设计灵感',
  '重要文档', '工作资料', '个人收藏', '项目素材', '数据分析',
  'UI设计', '用户体验', '原型设计', '界面交互', '产品规划'
];

// URL上传示例
const urlExamples = [
  {
    title: '风景图示例',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&h=100&fit=crop',
    format: 'JPG'
  },
  {
    title: '设计图示例',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
    format: 'PNG'
  },
  {
    title: '图标示例',
    url: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png',
    thumbnail: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png',
    format: 'PNG'
  }
];

// AI分析结果
const aiAnalysisResult = ref('图片可能包含界面设计或数据分析图表内容');
const aiSuggestedTags = ref(['数据可视化', '界面设计', '分析报告', 'Dashboard', '用户体验']);

// 相似图片
const similarImages = [
  {
    id: 'img-1',
    name: '用户流程分析',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
  },
  {
    id: 'img-2',
    name: '数据仪表盘',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  },
  {
    id: 'img-3',
    name: '界面原型',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=100&h=100&fit=crop',
    url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e'
  }
];

// 历史版本数据
const imageHistory = [
  {
    id: 'hist-1',
    thumbnail: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=50&h=50&fit=crop',
    url: 'https://images.unsplash.com/photo-1593642532400-2682810df593',
    date: '2023-06-15',
    user: '当前版本',
    active: true
  },
  {
    id: 'hist-2',
    thumbnail: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=50&h=50&fit=crop&sat=-100',
    url: 'https://images.unsplash.com/photo-1593642532400-2682810df593?sat=-100',
    date: '2023-06-10',
    user: '原始版本',
    active: false
  }
];

// 所有历史版本 - 弹窗用
const allHistoryVersions = [
  ...imageHistory,
  {
    id: 'hist-3',
    thumbnail: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=50&h=50&fit=crop&blur=10',
    url: 'https://images.unsplash.com/photo-1593642532400-2682810df593?blur=10',
    date: '2023-06-05',
    user: '早期版本',
    active: false
  },
  {
    id: 'hist-4',
    thumbnail: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=50&h=50&fit=crop&q=50',
    url: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=50',
    date: '2023-06-01',
    user: '初始上传',
    active: false
  }
];

// 计算属性：表单是否有变更
const isFormChanged = computed(() => {
  return (
      imageData.name !== originalData.name ||
      imageData.description !== originalData.description ||
      imageData.category !== originalData.category ||
      JSON.stringify(imageData.tags) !== JSON.stringify(originalData.tags) ||
      imageData.permission !== originalData.permission
  );
});

// 计算进度完成度
const calculateProgress = () => {
  let progress = 0;

  // 基础项: 名称、分类各占20%
  if (imageData.name) progress += 20;
  if (imageData.category) progress += 20;

  // 描述占15%
  if (imageData.description) progress += 15;

  // 标签: 每个标签占5%，最多占30%
  const tagPercent = Math.min(imageData.tags.length * 5, 30);
  progress += tagPercent;

  // 权限设置占15%
  if (imageData.permission) progress += 15;

  return Math.min(progress, 100); // 确保不超过100%
};

const progressPercentage = ref(calculateProgress());

// 更新进度
const updateProgress = () => {
  progressPercentage.value = calculateProgress();
};

// 获取图片格式
const getImageFormat = () => {
  const url = imageData.url;
  const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  return match ? match[1].toUpperCase() : 'JPG';
};

// 获取格式化的文件大小
const getFormattedSize = () => {
  // 模拟文件大小，实际应从API获取
  const sizeInKB = Math.floor(Math.random() * 1000) + 500;
  return sizeInKB > 1000 ? `${(sizeInKB / 1024).toFixed(2)} MB` : `${sizeInKB} KB`;
};

// 获取分类对应的颜色
const getCategoryColor = (category) => {
  const colorMap = {
    'personal': '#722ED1',
    'study': '#2F54EB',
    'work': '#1890FF',
    'design': '#13C2C2',
    'reference': '#52C41A',
    'other': '#FAAD14'
  };
  return colorMap[category] || '#6A35E8';
};

// 放大预览图片
const zoomImage = () => {
  previewModalVisible.value = true;
  imageRotation.value = 0; // 重置旋转角度
};

// 旋转图片
const rotateImage = (degrees = 90) => {
  imageRotation.value = (imageRotation.value + degrees) % 360;
};

// 显示替换图片弹窗
const showReplaceModal = () => {
  replaceModalVisible.value = true;
  replacePreviewUrl.value = '';
  replaceImageUrl.value = '';
  replaceFileList.value = [];
  keepMetadata.value = true;
  createVersion.value = true;
};

// 使用示例URL
const useExampleUrl = (example) => {
  replaceImageUrl.value = example.url;
  fetchReplaceImageFromUrl();
};

// 图片上传前验证
const beforeUpload = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件！');
    return false;
  }

  // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
  const isLessThan10M = file.size / 1024 / 1024 < 10;
  if (!isLessThan10M) {
    message.error('图片必须小于 10MB！');
    return false;
  }

  return isImage && isLessThan10M;
};

// 处理替换图片上传
const handleReplaceUpload = ({ file }) => {
  replaceUploadedFile.value = file;

  // 创建预览URL
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    replacePreviewUrl.value = e.target?.result;
  };
};

// 处理替换图片上传状态变化
const handleReplaceUploadChange = (info) => {
  replaceFileList.value = info.fileList.slice(-1); // 只保留最后上传的一个文件
};

// 从URL获取替换图片
const fetchReplaceImageFromUrl = async () => {
  if (!replaceImageUrl.value) {
    message.warning('请输入图片链接');
    return;
  }

  try {
    // 验证URL是否为图片
    const isValidImageUrl = /\.(jpeg|jpg|gif|png|webp|bmp)(\?.*)?$/i.test(replaceImageUrl.value);
    if (!isValidImageUrl) {
      message.warning('请输入有效的图片链接，支持 jpg、png、gif 等格式');
      return;
    }

    replacePreviewUrl.value = replaceImageUrl.value;
    message.success('成功获取图片');
  } catch (error) {
    message.error('获取图片失败，请检查链接是否有效');
    console.error('获取图片失败:', error);
  }
};

// 预览替换图片
const previewReplaceImage = () => {
  previewUrl.value = replacePreviewUrl.value;
  previewModalVisible.value = true;
  imageRotation.value = 0; // 重置旋转角度
};

// 移除替换图片
const removeReplaceImage = () => {
  replacePreviewUrl.value = '';
  replaceFileList.value = [];
  replaceUploadedFile.value = null;

  // 如果是在URL标签页，也清空URL输入
  if (replaceActiveTab.value === 'url') {
    replaceImageUrl.value = '';
  }
};

// 确认替换图片
const confirmReplace = async () => {
  if (!replacePreviewUrl.value) {
    message.warning('请先选择替换图片');
    return;
  }

  replacingImage.value = true;

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 如果选择创建新版本，添加当前版本到历史记录
    if (createVersion.value) {
      // 将当前活跃版本标记为非活跃
      imageHistory.forEach(history => {
        history.active = false;
      });

      // 添加当前版本到历史记录
      imageHistory.unshift({
        id: 'hist-' + Date.now(),
        thumbnail: imageData.url + '?w=50&h=50&fit=crop',
        url: imageData.url,
        date: dayjs().format('YYYY-MM-DD'),
        user: '替换前版本',
        active: false
      });
    }

    // 更新图片URL
    const oldUrl = imageData.url;
    imageData.url = replacePreviewUrl.value;
    previewUrl.value = replacePreviewUrl.value;

    // 更新最新版本为活跃
    imageHistory[0].thumbnail = replacePreviewUrl.value + '?w=50&h=50&fit=crop';
    imageHistory[0].url = replacePreviewUrl.value;
    imageHistory[0].date = dayjs().format('YYYY-MM-DD');
    imageHistory[0].user = '当前版本';
    imageHistory[0].active = true;

    // 更新修改日期
    imageData.lastModified = dayjs().format('YYYY-MM-DD HH:mm:ss');
    modifyDate.value = dayjs().format('YYYY-MM-DD');

    // 显示成功消息
    message.success('图片替换成功');

    // 显示系统提示
    showNotice.value = true;
    noticeMessage.value = '图片已成功替换。新图片已保存为最新版本。';
    noticeType.value = 'success';

    // 关闭替换弹窗
    replaceModalVisible.value = false;
  } catch (error) {
    message.error('图片替换失败，请稍后重试');
    console.error('替换失败:', error);
  } finally {
    replacingImage.value = false;
  }
};

// 取消替换图片
const cancelReplace = () => {
  replaceModalVisible.value = false;
};

// 添加AI推荐的标签
const addTag = (tag) => {
  if (!imageData.tags.includes(tag)) {
    imageData.tags.push(tag);
    updateProgress();
    message.success(`已添加标签: ${tag}`);
  }
};

// 刷新AI分析
const refreshAnalysis = async () => {
  analysisLoading.value = true;

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 更新AI分析结果
    const possibleResults = [
      '识别到图片包含界面设计或数据分析图表',
      '图片可能是一个应用Dashboard的截图',
      '检测到包含数据可视化元素和用户界面组件',
      '识别为数据分析报告或业务展示页面'
    ];
    aiAnalysisResult.value = possibleResults[Math.floor(Math.random() * possibleResults.length)];

    // 更新AI推荐标签
    const possibleTags = [
      'UI设计', '数据分析', '可视化', 'Dashboard', '用户体验',
      '交互设计', '信息架构', '业务报表', '界面布局', '用户研究',
      '产品设计', '设计系统', '图表分析', '数据展示', '界面原型'
    ];

    // 随机选择5个不同的标签
    const selectedTags = [];
    const tagsCopy = [...possibleTags];
    for (let i = 0; i < 5; i++) {
      if (tagsCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * tagsCopy.length);
      selectedTags.push(tagsCopy[randomIndex]);
      tagsCopy.splice(randomIndex, 1);
    }

    aiSuggestedTags.value = selectedTags;

    message.success('分析结果已更新');
  } catch (error) {
    message.error('更新分析失败，请稍后重试');
    console.error('更新分析失败:', error);
  } finally {
    analysisLoading.value = false;
  }
};

// 关闭系统提示
const closeNotice = () => {
  showNotice.value = false;
};

// 复制图片URL
const copyImageUrl = () => {
  navigator.clipboard.writeText(imageData.url)
      .then(() => {
        message.success('图片URL已复制到剪贴板');
      })
      .catch(err => {
        message.error('复制失败');
        console.error('复制失败:', err);
      });
};

// 查看所有历史版本
const viewAllHistory = () => {
  historyModalVisible.value = true;
};

// 预览历史版本
const previewHistoryVersion = (history) => {
  previewUrl.value = history.url;
  previewModalVisible.value = true;
  imageRotation.value = 0; // 重置旋转角度
};

// 恢复历史版本
const restoreVersion = async (history) => {
  if (history.active) return;

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 将所有版本标记为非活跃
    imageHistory.forEach(item => {
      item.active = false;
    });

    if (allHistoryVersions) {
      allHistoryVersions.forEach(item => {
        item.active = false;
      });
    }

    // 将选中的版本标记为活跃
    history.active = true;

    // 更新图片URL
    imageData.url = history.url;
    previewUrl.value = history.url;

    // 更新修改日期
    imageData.lastModified = dayjs().format('YYYY-MM-DD HH:mm:ss');
    modifyDate.value = dayjs().format('YYYY-MM-DD');

    // 显示成功消息
    message.success('历史版本恢复成功');

    // 显示系统提示
    showNotice.value = true;
    noticeMessage.value = '历史版本已成功恢复。如需保存，请点击下方"保存更改"按钮。';
    noticeType.value = 'info';

    // 关闭历史版本弹窗
    historyModalVisible.value = false;
  } catch (error) {
    message.error('版本恢复失败，请稍后重试');
    console.error('恢复失败:', error);
  }
};

// 下载图片
const downloadImage = () => {
  const link = document.createElement('a');
  link.href = previewUrl.value;
  link.download = imageData.name || 'image';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  message.success('图片下载已开始');
};

// 查看相似图片
const viewSimilarImage = (image) => {
  // 实际应用中可跳转到图片详情页
  previewUrl.value = image.url;
  previewModalVisible.value = true;
  imageRotation.value = 0; // 重置旋转角度
};

// 查看更多相似图片
const viewMoreSimilarImages = () => {
  message.info('查看更多相似图片功能正在开发中');
};

// 删除图片
const deleteImage = async () => {
  try {
    isLoading.value = true;

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    message.success('图片删除成功');

    // 返回到图片列表页
    router.push('/space');
  } catch (error) {
    message.error('删除失败，请稍后重试');
    console.error('删除失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 保存更改
const saveChanges = async () => {
  if (!imageData.name.trim()) {
    message.warning('请输入图片名称');
    return;
  }

  if (!imageData.category) {
    message.warning('请选择图片分类');
    return;
  }

  saving.value = true;

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 更新原始数据
    Object.assign(originalData, JSON.parse(JSON.stringify(imageData)));

    // 更新修改日期
    imageData.lastModified = dayjs().format('YYYY-MM-DD HH:mm:ss');
    modifyDate.value = dayjs().format('YYYY-MM-DD');

    message.success('更改已保存');

    // 显示系统提示
    showNotice.value = true;
    noticeMessage.value = '图片信息已成功更新。';
    noticeType.value = 'success';
  } catch (error) {
    message.error('保存失败，请稍后重试');
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  if (isFormChanged.value) {
    // 如果有未保存的更改，提示用户确认
    const confirmCancel = window.confirm('您有未保存的更改，确定要离开吗？');
    if (!confirmCancel) return;
  }

  router.back();
};

onMounted(() => {
  // 模拟从API获取图片数据
  isLoading.value = true;

  // 在实际应用中，这里应该根据路由参数获取图片ID并从API获取数据
  const imageId = route.params.id;
  console.log('正在加载图片ID:', imageId);

  // 模拟加载延迟
  setTimeout(() => {
    // 数据已加载到reactive对象中，无需额外设置
    console.log('图片数据加载完成');

    // 计算初始进度
    updateProgress();

    isLoading.value = false;
  }, 500);
});
</script>

<style scoped>
/* 基础变量定义 - 紫色主题 */
:root {
  --primary-color: #6A35E8;
  --primary-light: #8E66F3;
  --primary-dark: #5425C9;
  --primary-gradient: linear-gradient(135deg, #6A35E8 0%, #9166FF 100%);
  --secondary-color: #F3F0FF;
  --text-primary: #1F1F1F;
  --text-secondary: #666666;
  --text-light: #999999;
  --border-color: #E6E6E6;
  --card-bg: #FFFFFF;
  --danger-color: #F5222D;
  --success-color: #52C41A;
  --warning-color: #FAAD14;
  --info-color: #1890FF;
  --shadow-sm: 0 2px 8px rgba(106, 53, 232, 0.1);
  --shadow-md: 0 4px 12px rgba(106, 53, 232, 0.15);
  --shadow-lg: 0 8px 24px rgba(106, 53, 232, 0.2);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* 页面基础样式 */
.edit-image-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px;
  background-color: #F8F8FC;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 步骤流程样式 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.step {
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background-color: #6A35E8;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(106, 53, 232, 0.3);
}

.step-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
}

.step-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.step-divider {
  flex-grow: 0;
  width: 60px;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 8px;
}

/* 进度条样式 */
.progress-container {
  margin-bottom: 24px;
  background: #f9fafb;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.progress-bar {
  margin-bottom: 8px;
}

.progress-text {
  text-align: right;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 卡片样式 */
.edit-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin-bottom: 24px;
  padding: 24px;
}

/* 区域标题通用样式 */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px dashed rgba(106, 53, 232, 0.1);
  padding-bottom: 12px;
  position: relative;
}

.section-icon {
  color: var(--primary-color);
  font-size: 18px;
  background: var(--secondary-color);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0 10px;
}

.section-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-left: auto;
  margin-right: 24px;
}

.section-help-icon {
  color: var(--text-light);
  cursor: pointer;
  transition: color 0.3s;
}

.section-help-icon:hover {
  color: var(--primary-color);
}

/* 图片预览区样式 */
.image-preview-section {
  background: #FCFCFF;
  border-radius: var(--radius-md);
  padding: 20px;
  height: 100%;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  margin-bottom: 24px;
  border: 1px solid #E6E0FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.preview-container:hover .preview-image {
  transform: scale(1.05);
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.preview-actions-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(106, 53, 232, 0.05);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container:hover .preview-actions-wrapper {
  opacity: 1;
}

.preview-actions {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.preview-container:hover .preview-actions {
  transform: translateY(0);
}

.preview-action-btn {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  background: var(--primary-gradient) !important;
}

.preview-action-btn:hover {
  opacity: 0.9;
  transform: scale(1.1);
}

.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  display: flex;
  justify-content: space-around;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translateY(10px);
}

.preview-container:hover .image-info-overlay {
  opacity: 1;
  transform: translateY(0);
}

.image-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

/* 历史记录区域样式 */
.upload-history {
  background: linear-gradient(135deg, #F9F7FF 0%, #F3F0FF 100%);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid #E6E0FF;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-icon {
  color: var(--primary-color);
}

.history-title h4 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
}

.view-all-link {
  color: var(--primary-color);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.history-timeline {
  max-height: 220px;
  overflow-y: auto;
  padding-right: 10px;
}

.history-timeline::-webkit-scrollbar {
  width: 6px;
}

.history-timeline::-webkit-scrollbar-track {
  background: #F3F0FF;
  border-radius: 3px;
}

.history-timeline::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 3px;
}

.history-timeline::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.history-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #E6E0FF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-dot.active {
  border-color: var(--primary-color);
  transform: scale(1.1);
  box-shadow: 0 0 0 3px rgba(106, 53, 232, 0.2);
}

.history-dot:hover {
  transform: scale(1.1);
  border-color: var(--primary-light);
}

.history-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin-left: 10px;
  box-shadow: var(--shadow-sm);
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-date {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.history-user {
  font-size: 12px;
  color: var(--text-light);
}

.restore-btn {
  color: var(--primary-color) !important;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}

.restore-btn:disabled {
  color: var(--success-color) !important;
  cursor: default;
}

/* 编辑信息区样式 */
.edit-info-section {
  background: #FCFCFF;
  border-radius: var(--radius-md);
  padding: 20px;
  height: 100%;
}

.edit-form {
  padding: 0 10px;
}

.input-field {
  border-radius: var(--radius-md);
  border: 1px solid #E6E0FF;
  transition: all 0.3s ease;
}

.input-field:hover {
  border-color: var(--primary-light);
}

.input-field:focus,
.input-field :deep(.ant-input:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(106, 53, 232, 0.2);
}

.textarea-field {
  min-height: 100px;
}

.field-tips {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分类选择器样式 */
.category-select :deep(.ant-select-selector) {
  border-radius: var(--radius-md) !important;
  border: 1px solid #E6E0FF !important;
  height: 40px !important;
  padding: 4px 12px !important;
}

.category-select :deep(.ant-select-selector:hover) {
  border-color: var(--primary-light) !important;
}

.category-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(106, 53, 232, 0.2) !important;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 标签选择器样式 */
.tag-select :deep(.ant-select-selector) {
  border-radius: var(--radius-md) !important;
  border: 1px solid #E6E0FF !important;
  min-height: 40px !important;
  padding: 4px 12px !important;
}

.tag-select :deep(.ant-select-selection-item) {
  background-color: var(--primary-color) !important;
  color: white !important;
  border-color: var(--primary-color) !important;
  border-radius: var(--radius-sm) !important;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px !important;
}

.tag-select :deep(.ant-select-selection-item-remove) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tag-select :deep(.ant-select-selection-item-remove:hover) {
  color: white !important;
}

.suggested-tags {
  margin-top: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tags-title {
  font-size: 13px;
  color: var(--text-light);
}

.suggested-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  cursor: pointer;
  background: #F3F0FF;
  color: var(--primary-color);
  border-color: #E6E0FF;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.suggested-tag:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* 权限选择组样式 */
.permission-group {
  width: 100%;
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid #E6E0FF;
}

.permission-option {
  flex: 1;
  text-align: center;
}

.permission-option :deep(.ant-radio-button-wrapper) {
  width: 100%;
  border: none !important;
  border-right: 1px solid #E6E0FF !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
}

.permission-option:last-child :deep(.ant-radio-button-wrapper) {
  border-right: none !important;
}

.permission-option :deep(.ant-radio-button-wrapper-checked) {
  background: var(--primary-gradient) !important;
  color: white !important;
  box-shadow: none !important;
}

.permission-option :deep(.ant-radio-button-wrapper:hover) {
  color: var(--primary-color) !important;
}

.permission-option :deep(.ant-radio-button-wrapper-checked:hover) {
  color: white !important;
}

/* 高级设置样式 */
.advanced-settings {
  margin-top: 16px;
}

.advanced-settings :deep(.ant-collapse-header) {
  color: var(--primary-color) !important;
  font-weight: 500;
  padding: 8px 0 !important;
  display: flex;
  align-items: center;
}

.advanced-settings :deep(.ant-collapse-content-box) {
  padding: 16px !important;
  background: #FCFCFF;
  border-radius: var(--radius-md);
  border: 1px solid #E6E0FF;
}

.date-picker {
  width: 100%;
}

.reference-count {
  width: 100% !important;
}

.copy-icon {
  cursor: pointer;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.copy-icon:hover {
  transform: scale(1.2);
  color: var(--primary-dark);
}

/* 智能分析区域样式 */
.ai-analysis-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E6E0FF;
}

.analysis-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn {
  color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(106, 53, 232, 0.1) !important;
  color: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}

.analysis-card {
  background: linear-gradient(135deg, #F9F7FF 0%, #F3F0FF 100%);
  border-radius: var(--radius-md);
  padding: 20px;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  border-top: 3px solid var(--primary-color);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.analysis-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.analysis-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 16px;
}

.analysis-card-icon {
  color: var(--primary-color);
}

.analysis-card-content {
  color: var(--text-secondary);
  flex: 1;
}

.analysis-footer {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-light);
  text-align: center;
}

.analysis-footer a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.analysis-footer a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.accuracy-bar {
  height: 6px;
  background-color: rgba(106, 53, 232, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: 6px 0;
}

.accuracy-fill {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 3px;
}

.accuracy-label, .accuracy-value {
  font-size: 12px;
  color: var(--text-light);
}

.accuracy-value {
  text-align: right;
}

/* 标签云样式 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.ai-tag {
  cursor: pointer;
  background: rgba(106, 53, 232, 0.1);
  color: var(--primary-color);
  border-color: rgba(106, 53, 232, 0.2);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-tag:hover {
  transform: translateY(-2px);
  background: rgba(106, 53, 232, 0.2);
  box-shadow: var(--shadow-sm);
}

.ai-tag.used-tag {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 相似图片样式 */
.similar-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.similar-image {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  height: 70px;
  transition: all 0.3s ease;
}

.similar-image:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.similar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(106, 53, 232, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.similar-image:hover .similar-image-overlay {
  opacity: 1;
}

.similar-image-name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 0.3s ease;
}

.similar-image:hover .similar-image-name {
  transform: translateY(-4px);
}

/* 系统提示样式 */
.system-notice {
  margin: 24px 0 8px;
}

.notice-alert {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.notice-alert :deep(.ant-alert-success) {
  background-color: #F6FFED;
  border-color: #B7EB8F;
}

.notice-alert :deep(.ant-alert-info) {
  background-color: #E6F7FF;
  border-color: #91D5FF;
}

.notice-alert :deep(.ant-alert-warning) {
  background-color: #FFFBE6;
  border-color: #FFE58F;
}

.notice-alert :deep(.ant-alert-error) {
  background-color: #FFF1F0;
  border-color: #FFA39E;
}

/* 底部工具栏样式 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 30px;
}

.buttons-left, .buttons-right {
  display: flex;
  gap: 12px;
}

.action-btn {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  border: 1px solid #E6E0FF;
  border-radius: var(--radius-md);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-btn.danger-btn {
  color: var(--danger-color);
  border-color: rgba(245, 34, 45, 0.3);
}

.action-btn.danger-btn:hover {
  color: white;
  background: var(--danger-color);
  border-color: var(--danger-color);
}

.cancel-btn {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #E6E0FF;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.3s;
}

.cancel-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.submit-btn {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
}

/* 弹窗样式 */
/* 图片预览弹窗 */
.preview-modal :deep(.ant-modal-content) {
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.preview-modal-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-modal-image {
  max-width: 90vw;
  max-height: 70vh;
  display: block;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.preview-modal-toolbar {
  margin-top: 20px;
}

.preview-modal-toolbar :deep(.ant-btn-primary) {
  background: var(--primary-gradient) !important;
  border: none !important;
  border-radius: var(--radius-sm);
  height: 36px;
  transition: all 0.3s ease;
}

.preview-modal-toolbar :deep(.ant-btn-primary:hover) {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 替换图片弹窗样式 */
.replace-modal-content {
  padding: 10px 0;
}

.replace-modal-content :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--primary-color) !important;
  font-weight: 500;
}

.replace-modal-content :deep(.ant-tabs-ink-bar) {
  background-color: var(--primary-color) !important;
}

/* 上传区域样式 */
.custom-uploader :deep(.ant-upload-drag) {
  border-color: #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-uploader :deep(.ant-upload-drag:hover) {
  border-color: var(--primary-color);
  background: rgba(106, 53, 232, 0.02);
}

.custom-uploader :deep(.ant-upload-drag-container) {
  padding: 24px;
}

.upload-content {
  padding: 32px;
  text-align: center;
}

.upload-icon-wrapper {
  background: rgba(106, 53, 232, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.upload-icon {
  font-size: 28px;
  color: var(--primary-color);
}

.upload-icon-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(106, 53, 232, 0.2);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

/* URL输入样式 */
.url-input {
  border-radius: 8px;
}

.url-input :deep(.ant-input-affix-wrapper) {
  border-color: #e5e7eb;
  transition: all 0.3s ease;
}

.url-input :deep(.ant-input-affix-wrapper:hover) {
  border-color: var(--primary-color);
}

.url-input :deep(.ant-input-affix-wrapper-focused),
.url-input :deep(.ant-input-affix-wrapper:focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(106, 53, 232, 0.2) !important;
}

.fetch-btn {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.fetch-btn:hover:not(:disabled) {
  background-color: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}

/* URL示例 */
.url-examples {
  margin-top: 24px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.url-examples h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1f2937;
}

.example-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.example-link {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  width: calc(33.333% - 8px);
}

.example-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: var(--primary-color);
}

.example-icon {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 8px;
  flex-shrink: 0;
}

.example-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.example-info {
  flex-grow: 1;
}

.example-title {
  font-size: 14px;
  margin: 0 0 4px;
  color: #1f2937;
}
</style>