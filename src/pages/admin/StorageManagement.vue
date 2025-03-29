<!-- src/pages/admin/StorageManagement.vue -->
<template>
  <div class="storage-management-container">
    <!-- 顶部概览卡片 -->
    <a-row :gutter="16" class="overview-cards">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: rgba(124, 104, 238, 0.1)">
              <cloud-outlined style="color: #7c68ee; font-size: 28px" />
            </div>
            <div class="stat-info">
              <div class="stat-title">总存储容量</div>
              <div class="stat-value">{{ formatSize(storageStats.totalSpace) }}</div>
              <div class="progress-mini">
                <a-progress
                    :percent="storageStats.usagePercent"
                    :stroke-color="getStrokeColor(storageStats.usagePercent)"
                    size="small"
                    :show-info="false"
                />
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: rgba(64, 158, 255, 0.1)">
              <hard-drive-outlined style="color: #409eff; font-size: 28px" />
            </div>
            <div class="stat-info">
              <div class="stat-title">已用存储</div>
              <div class="stat-value">{{ formatSize(storageStats.usedSpace) }}</div>
              <div class="stat-change" :class="{ 'up': storageStats.usageChange > 0, 'down': storageStats.usageChange < 0 }">
                {{ storageStats.usageChange > 0 ? '+' : '' }}{{ storageStats.usageChange }}% 较上月
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: rgba(245, 171, 53, 0.1)">
              <file-image-outlined style="color: #f5ab35; font-size: 28px" />
            </div>
            <div class="stat-info">
              <div class="stat-title">图片文件数</div>
              <div class="stat-value">{{ formatNumber(storageStats.totalFiles) }}</div>
              <div class="stat-change" :class="{ 'up': storageStats.filesChange > 0, 'down': storageStats.filesChange < 0 }">
                {{ storageStats.filesChange > 0 ? '+' : '' }}{{ storageStats.filesChange }}% 较上月
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="card-content">
            <div class="icon-wrapper" style="background-color: rgba(103, 194, 58, 0.1)">
              <wallet-outlined style="color: #67c23a; font-size: 28px" />
            </div>
            <div class="stat-info">
              <div class="stat-title">本月存储费用</div>
              <div class="stat-value">¥{{ formatNumber(storageStats.monthlyCost) }}</div>
              <div class="stat-change" :class="{ 'up': storageStats.costChange > 0, 'down': storageStats.costChange < 0 }">
                {{ storageStats.costChange > 0 ? '+' : '' }}{{ storageStats.costChange }}% 较上月
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- COS配置区域 -->
    <a-card title="腾讯云COS配置" class="config-card" :bordered="false">
      <a-form :model="cosConfig" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="存储桶名称">
          <a-input v-model:value="cosConfig.bucketName" placeholder="请输入存储桶名称"/>
        </a-form-item>
        <a-form-item label="存储区域">
          <a-select v-model:value="cosConfig.region" placeholder="请选择存储区域">
            <a-select-option value="ap-beijing">华北地区(北京)</a-select-option>
            <a-select-option value="ap-guangzhou">华南地区(广州)</a-select-option>
            <a-select-option value="ap-shanghai">华东地区(上海)</a-select-option>
            <a-select-option value="ap-chengdu">西南地区(成都)</a-select-option>
            <a-select-option value="ap-hongkong">中国香港</a-select-option>
            <a-select-option value="ap-singapore">新加坡</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="SecretId">
          <a-input v-model:value="cosConfig.secretId" placeholder="请输入腾讯云SecretId"/>
        </a-form-item>
        <a-form-item label="SecretKey">
          <a-input-password v-model:value="cosConfig.secretKey" placeholder="请输入腾讯云SecretKey"/>
        </a-form-item>
        <a-form-item label="CDN加速域名">
          <a-input v-model:value="cosConfig.cdnDomain" placeholder="请输入CDN加速域名（选填）"/>
        </a-form-item>
        <a-form-item label="默认上传路径">
          <a-input v-model:value="cosConfig.uploadPath" placeholder="请输入默认上传路径，例如：images/"/>
        </a-form-item>
        <a-form-item label="存储策略">
          <a-select v-model:value="cosConfig.storageClass" placeholder="请选择存储类型">
            <a-select-option value="STANDARD">标准存储</a-select-option>
            <a-select-option value="STANDARD_IA">低频存储</a-select-option>
            <a-select-option value="ARCHIVE">归档存储</a-select-option>
            <a-select-option value="DEEP_ARCHIVE">深度归档存储</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="CDN状态">
          <a-switch v-model:checked="cosConfig.cdnEnabled" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="saveCosConfig">保存配置</a-button>
            <a-button @click="testConnection">测试连接</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 存储配额管理 -->
    <a-card title="存储配额管理" class="config-card" :bordered="false">
      <a-table :columns="quotaColumns" :data-source="quotaData" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'maxStorage'">
            <a-input-number
                v-if="record.editing"
                v-model:value="record.maxStorage"
                :min="1"
                :max="10000"
                addon-after="GB"
                style="width: 150px"
            />
            <span v-else>{{ record.maxStorage }} GB</span>
          </template>
          <template v-if="column.dataIndex === 'maxFileCount'">
            <a-input-number
                v-if="record.editing"
                v-model:value="record.maxFileCount"
                :min="100"
                :max="1000000"
                style="width: 150px"
            />
            <span v-else>{{ formatNumber(record.maxFileCount) }}</span>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a v-if="!record.editing" @click="startEdit(record)">编辑</a>
              <a v-else @click="saveQuota(record)">保存</a>
              <a-divider v-if="record.editing" type="vertical" />
              <a v-if="record.editing" @click="cancelEdit(record)">取消</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 存储使用分析 -->
    <a-card title="存储使用分析" class="chart-card" :bordered="false">
      <template #extra>
        <a-radio-group v-model:value="storageTimeRange" button-style="solid" size="small">
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
          <a-radio-button value="year">全年</a-radio-button>
        </a-radio-group>
      </template>
      <div class="chart-container">
        <v-chart class="chart" :option="storageChartOption" autoresize />
      </div>
    </a-card>

    <!-- 文件管理 -->
    <a-card title="文件管理" class="file-manager-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search
              v-model:value="fileSearchKeyword"
              placeholder="搜索文件名"
              style="width: 250px"
              @search="searchFiles"
          />
          <a-button type="primary" @click="uploadFile">
            <upload-outlined /> 上传文件
          </a-button>
          <a-button :disabled="!hasFileSelected" @click="deleteSelectedFiles">
            <delete-outlined /> 删除所选
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:activeKey="activeFileTab">
        <a-tab-pane key="all" tab="所有文件">
          <a-table
              :columns="fileColumns"
              :data-source="fileList"
              :row-selection="{ selectedRowKeys: selectedFileKeys, onChange: onSelectChange }"
              :loading="fileLoading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'fileName'">
                <div class="file-name-cell">
                  <img
                      v-if="isImageFile(record.fileName)"
                      :src="record.url + '?imageView2/1/w/40/h/40'"
                      class="file-thumbnail"
                  />
                  <file-image-outlined v-else class="file-icon" />
                  <span>{{ record.fileName }}</span>
                </div>
              </template>
              <template v-if="column.dataIndex === 'fileSize'">
                {{ formatSize(record.fileSize) }}
              </template>
              <template v-if="column.dataIndex === 'storageClass'">
                <a-tag :color="getStorageClassColor(record.storageClass)">
                  {{ getStorageClassName(record.storageClass) }}
                </a-tag>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <a-space>
                  <a @click="previewFile(record)">预览</a>
                  <a-divider type="vertical" />
                  <a @click="downloadFile(record)">下载</a>
                  <a-divider type="vertical" />
                  <a-dropdown>
                    <a class="ant-dropdown-link" @click.prevent>
                      更多 <down-outlined />
                    </a>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="changeStorageClass(record)">
                          修改存储类型
                        </a-menu-item>
                        <a-menu-item @click="copyFileUrl(record)">
                          复制URL
                        </a-menu-item>
                        <a-menu-item @click="deleteFile(record)">
                          <span style="color: #ff4d4f">删除</span>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="images" tab="图片">
          <!-- 图片展示使用九宫格形式 -->
          <div class="image-grid">
            <a-spin :spinning="fileLoading">
              <template v-if="imageList.length > 0">
                <div class="image-grid-container">
                  <div class="image-item" v-for="image in imageList" :key="image.key">
                    <div class="image-wrapper" @click="previewFile(image)">
                      <img :src="image.url + '?imageView2/1/w/200/h/200'" alt="图片缩略图" />
                      <div class="image-actions">
                        <a-checkbox
                            :checked="selectedFileKeys.includes(image.key)"
                            @change="(e) => toggleSelect(image.key, e.target.checked)"
                        ></a-checkbox>
                        <a-dropdown :trigger="['click']" placement="bottomRight">
                          <a class="image-more-action" @click.prevent>
                            <more-outlined />
                          </a>
                          <template #overlay>
                            <a-menu>
                              <a-menu-item @click="previewFile(image)">预览</a-menu-item>
                              <a-menu-item @click="downloadFile(image)">下载</a-menu-item>
                              <a-menu-item @click="copyFileUrl(image)">复制URL</a-menu-item>
                              <a-menu-item @click="deleteFile(image)">
                                <span style="color: #ff4d4f">删除</span>
                              </a-menu-item>
                            </a-menu>
                          </template>
                        </a-dropdown>
                      </div>
                    </div>
                    <div class="image-info">
                      <div class="image-name" :title="image.fileName">{{ image.fileName }}</div>
                      <div class="image-size">{{ formatSize(image.fileSize) }}</div>
                    </div>
                  </div>
                </div>
              </template>
              <a-empty v-else description="暂无图片文件" />
            </a-spin>
          </div>
        </a-tab-pane>
        <a-tab-pane key="videos" tab="视频">
          <a-empty v-if="videoList.length === 0" description="暂无视频文件" />
          <a-list
              v-else
              :data-source="videoList"
              :grid="{ gutter: 16, column: 3 }"
              :loading="fileLoading"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-card hoverable>
                  <div class="video-thumbnail" @click="previewFile(item)">
                    <play-circle-outlined class="play-icon" />
                  </div>
                  <a-card-meta :title="item.fileName">
                    <template #description>
                      <div>{{ formatSize(item.fileSize) }}</div>
                      <div>{{ formatDate(item.lastModified) }}</div>
                    </template>
                  </a-card-meta>
                  <div class="video-actions">
                    <a-space>
                      <a @click="downloadFile(item)">下载</a>
                      <a @click="copyFileUrl(item)">复制链接</a>
                      <a @click="deleteFile(item)" class="danger-action">删除</a>
                    </a-space>
                  </div>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="documents" tab="文档">
          <a-list
              v-if="documentList.length > 0"
              :data-source="documentList"
              :loading="fileLoading"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <file-pdf-outlined v-if="isPdfDocument(item.fileName)" class="file-type-icon pdf" />
                    <file-word-outlined v-else-if="isWordDocument(item.fileName)" class="file-type-icon word" />
                    <file-excel-outlined v-else-if="isExcelDocument(item.fileName)" class="file-type-icon excel" />
                    <file-ppt-outlined v-else-if="isPowerPointDocument(item.fileName)" class="file-type-icon ppt" />
                    <file-text-outlined v-else class="file-type-icon text" />
                  </template>
                  <template #title>
                    <a @click="previewFile(item)">{{ item.fileName }}</a>
                  </template>
                  <template #description>
                    <div>{{ formatSize(item.fileSize) }} | {{ formatDate(item.lastModified) }}</div>
                  </template>
                </a-list-item-meta>
                <div>
                  <a-space>
                    <a @click="downloadFile(item)">下载</a>
                    <a @click="copyFileUrl(item)">复制链接</a>
                    <a @click="deleteFile(item)" class="danger-action">删除</a>
                  </a-space>
                </div>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-else description="暂无文档文件" />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 清理策略 -->
    <a-card title="存储清理策略" class="config-card" :bordered="false">
      <a-form :model="cleanupPolicy" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="临时文件保留时间">
          <a-input-number
              v-model:value="cleanupPolicy.tempFileRetention"
              :min="1"
              :max="30"
              addon-after="天"
              style="width: 150px"
          />
          <span class="form-help-text">临时文件会在指定天数后自动删除</span>
        </a-form-item>
        <a-form-item label="未引用文件处理">
          <a-select v-model:value="cleanupPolicy.unreferencedAction" style="width: 200px">
            <a-select-option value="nothing">不处理</a-select-option>
            <a-select-option value="mark">标记为待删除</a-select-option>
            <a-select-option value="delete">自动删除</a-select-option>
            <a-select-option value="archive">转为归档存储</a-select-option>
          </a-select>
          <span class="form-help-text">系统中存在但未被引用的文件处理方式</span>
        </a-form-item>
        <a-form-item label="清理审核">
          <a-switch v-model:checked="cleanupPolicy.requireApproval" />
          <span class="form-help-text">批量清理操作是否需要管理员审核</span>
        </a-form-item>
        <a-form-item label="自动清理调度">
          <a-select v-model:value="cleanupPolicy.scheduleType" style="width: 200px">
            <a-select-option value="daily">每天</a-select-option>
            <a-select-option value="weekly">每周</a-select-option>
            <a-select-option value="monthly">每月</a-select-option>
          </a-select>
          <a-time-picker
              v-model:value="cleanupPolicy.scheduleTime"
              format="HH:mm"
              style="width: 100px; margin-left: 10px"
          />
          <span class="form-help-text">自动执行清理任务的时间</span>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="saveCleanupPolicy">保存策略</a-button>
            <a-button type="danger" @click="showRunCleanupConfirm">立即执行清理</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 文件预览模态框 -->
    <a-modal
        v-model:visible="previewVisible"
        :title="currentFile?.fileName || '文件预览'"
        :footer="null"
        :width="800"
        @cancel="previewVisible = false"
    >
      <div class="file-preview-container">
        <img
            v-if="isImageFile(currentFile?.fileName)"
            :src="currentFile?.url"
            alt="图片预览"
            class="image-preview"
        />
        <video
            v-else-if="isVideoFile(currentFile?.fileName)"
            :src="currentFile?.url"
            controls
            class="video-preview"
        ></video>
        <div v-else-if="isPdfDocument(currentFile?.fileName)" class="pdf-preview">
          <iframe :src="currentFile?.url" width="100%" height="500px"></iframe>
        </div>
        <div v-else class="file-no-preview">
          <file-outlined />
          <p>无法预览此文件类型，请下载后查看</p>
          <a-button type="primary" @click="downloadFile(currentFile)">下载文件</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 上传文件模态框 -->
    <a-modal
        v-model:visible="uploadVisible"
        title="上传文件"
        :footer="null"
        @cancel="uploadVisible = false"
    >
      <a-upload-dragger
          :multiple="true"
          :before-upload="beforeUpload"
          @change="handleUploadChange"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">
          支持单个或批量上传，严禁上传违规内容
        </p>
      </a-upload-dragger>

      <div class="upload-options" style="margin-top: 16px">
        <a-form :model="uploadOptions" layout="vertical">
          <a-form-item label="存储类型">
            <a-select v-model:value="uploadOptions.storageClass">
              <a-select-option value="STANDARD">标准存储</a-select-option>
              <a-select-option value="STANDARD_IA">低频存储</a-select-option>
              <a-select-option value="ARCHIVE">归档存储</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="自定义路径">
            <a-input
                v-model:value="uploadOptions.customPath"
                placeholder="例如：custom/path/"
                addon-before="/"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 修改存储类型模态框 -->
    <a-modal
        v-model:visible="storageClassModalVisible"
        title="修改存储类型"
        @ok="confirmChangeStorageClass"
        @cancel="storageClassModalVisible = false"
    >
      <a-form :model="storageClassForm" layout="vertical">
        <a-form-item label="文件名">
          <span>{{ currentFile?.fileName }}</span>
        </a-form-item>
        <a-form-item label="当前存储类型">
          <a-tag :color="getStorageClassColor(currentFile?.storageClass)">
            {{ getStorageClassName(currentFile?.storageClass) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="目标存储类型">
          <a-select v-model:value="storageClassForm.storageClass">
            <a-select-option value="STANDARD">标准存储</a-select-option>
            <a-select-option value="STANDARD_IA">低频存储</a-select-option>
            <a-select-option value="ARCHIVE">归档存储</a-select-option>
            <a-select-option value="DEEP_ARCHIVE">深度归档存储</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  CloudOutlined,
  FileImageOutlined,
  WalletOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  InboxOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import dayjs from 'dayjs';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

// 存储统计数据
const storageStats = reactive({
  totalSpace: 1024 * 1024 * 1024 * 100, // 100GB
  usedSpace: 1024 * 1024 * 1024 * 3.7, // 3.7GB
  usagePercent: 3.7,
  usageChange: 12.5,
  totalFiles: 1284,
  filesChange: 15.8,
  monthlyCost: 45.6,
  costChange: -2.3,
});

// COS配置
const cosConfig = reactive({
  bucketName: 'cloud-gallery-1251000004',
  region: 'ap-shanghai',
  secretId: 'AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  secretKey: '****************************',
  cdnDomain: 'img.example.com',
  uploadPath: 'images/',
  storageClass: 'STANDARD',
  cdnEnabled: true,
});

// 存储配额数据
const quotaColumns = [
  { title: '用户类型', dataIndex: 'userType', key: 'userType' },
  { title: '存储上限', dataIndex: 'maxStorage', key: 'maxStorage' },
  { title: '文件数上限', dataIndex: 'maxFileCount', key: 'maxFileCount' },
  { title: '操作', dataIndex: 'action', key: 'action' },
];

const quotaData = ref([
  { key: '1', userType: '普通用户', maxStorage: 5, maxFileCount: 1000, editing: false, originalData: null },
  { key: '2', userType: 'VIP用户', maxStorage: 50, maxFileCount: 10000, editing: false, originalData: null },
  { key: '3', userType: '管理员', maxStorage: 100, maxFileCount: 100000, editing: false, originalData: null },
]);

// 存储时间范围
const storageTimeRange = ref('month');

// 文件管理相关
const activeFileTab = ref('all');
const fileSearchKeyword = ref('');
const fileLoading = ref(false);
const selectedFileKeys = ref<string[]>([]);

// 文件列表
const fileList = ref<any[]>([]);
const imageList = computed(() => fileList.value.filter(file => isImageFile(file.fileName)));
const videoList = computed(() => fileList.value.filter(file => isVideoFile(file.fileName)));
const documentList = computed(() => fileList.value.filter(file => isDocumentFile(file.fileName)));

const hasFileSelected = computed(() => selectedFileKeys.value.length > 0);

// 文件列表表格列配置
const fileColumns = [
  { title: '文件名', dataIndex: 'fileName', key: 'fileName', ellipsis: true },
  { title: '文件大小', dataIndex: 'fileSize', key: 'fileSize', width: 120 },
  { title: '存储类型', dataIndex: 'storageClass', key: 'storageClass', width: 120 },
  { title: '最后修改时间', dataIndex: 'lastModified', key: 'lastModified', width: 180 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180, fixed: 'right' },
];

// 文件预览相关
const previewVisible = ref(false);
const currentFile = ref<any>(null);

// 文件上传相关
const uploadVisible = ref(false);
const uploadOptions = reactive({
  storageClass: 'STANDARD',
  customPath: '',
});

// 存储类型修改相关
const storageClassModalVisible = ref(false);
const storageClassForm = reactive({
  storageClass: 'STANDARD',
});

// 清理策略配置
const cleanupPolicy = reactive({
  tempFileRetention: 7,
  unreferencedAction: 'mark',
  requireApproval: true,
  scheduleType: 'daily',
  scheduleTime: dayjs('08:00', 'HH:mm'),
});

// 存储使用趋势图表配置
// 工具函数：根据时间范围生成模拟的存储使用数据
const generateStorageUsageData = (timeRange: string) => {
  const baseValue = 1024 * 1024 * 1024 * 3; // 3GB
  const dayIncrement = 1024 * 1024 * 100; // 每天增加100MB
  const monthIncrement = 1024 * 1024 * 1024 * 0.2; // 每月增加200MB

  if (timeRange === 'week') {
    return Array.from({ length: 7 }, (_, i) => baseValue + dayIncrement * i);
  } else if (timeRange === 'month') {
    return Array.from({ length: 30 }, (_, i) => baseValue + dayIncrement * i);
  } else { // year
    return Array.from({ length: 12 }, (_, i) => baseValue + monthIncrement * i);
  }
};

const storageChartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params: any) {
        const data = params[0];
        const usedSpace = data.value;
        const usedSpaceFormatted = formatSize(usedSpace);
        return `${data.name}<br/>${data.seriesName}: ${usedSpaceFormatted}`;
      }
    },
    legend: {
      data: ['已用存储']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: storageTimeRange.value === 'week'
          ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          : storageTimeRange.value === 'month'
              ? Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
              : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value: number) {
          return formatSize(value, 0);
        }
      }
    },
    series: [
      {
        name: '已用存储',
        type: 'line',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#409eff'
        },
        lineStyle: {
          width: 2,
          color: '#409eff'
        },
        smooth: true,
        data: generateStorageUsageData(storageTimeRange.value)
      }
    ]
  };
});

// 格式化数字显示
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化文件大小显示
const formatSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 格式化日期显示
const formatDate = (date: string | number | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 根据百分比获取进度条颜色
const getStrokeColor = (percent: number): string => {
  if (percent < 60) return '#67c23a';
  if (percent < 80) return '#e6a23c';
  return '#f56c6c';
};

// 判断文件类型的工具函数
const isImageFile = (fileName: string): boolean => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isVideoFile = (fileName: string): boolean => {
  const extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
  return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isDocumentFile = (fileName: string): boolean => {
  const extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
  return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isPdfDocument = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.pdf');
};

const isWordDocument = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx');
};

const isExcelDocument = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.xls') || fileName.toLowerCase().endsWith('.xlsx');
};

const isPowerPointDocument = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx');
};

// 存储类型相关函数
const getStorageClassName = (storageClass: string): string => {
  const classMap: Record<string, string> = {
    'STANDARD': '标准存储',
    'STANDARD_IA': '低频存储',
    'ARCHIVE': '归档存储',
    'DEEP_ARCHIVE': '深度归档存储'
  };
  return classMap[storageClass] || storageClass;
};

const getStorageClassColor = (storageClass: string): string => {
  const colorMap: Record<string, string> = {
    'STANDARD': '#409eff',
    'STANDARD_IA': '#67c23a',
    'ARCHIVE': '#e6a23c',
    'DEEP_ARCHIVE': '#909399'
  };
  return colorMap[storageClass] || '#409eff';
};

// 文件操作相关方法
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedFileKeys.value = selectedRowKeys;
};

const toggleSelect = (key: string, checked: boolean) => {
  if (checked) {
    selectedFileKeys.value.push(key);
  } else {
    selectedFileKeys.value = selectedFileKeys.value.filter(k => k !== key);
  }
};

// 文件预览
const previewFile = (file: any) => {
  currentFile.value = file;
  previewVisible.value = true;
};

// 下载文件
const downloadFile = (file: any) => {
  // 实际项目中应使用COS SDK提供的下载方法
  window.open(file.url, '_blank');
  message.success(`开始下载: ${file.fileName}`);
};

// 复制文件URL
const copyFileUrl = (file: any) => {
  navigator.clipboard.writeText(file.url).then(() => {
    message.success('文件链接已复制到剪贴板');
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
};

// 删除文件
const deleteFile = (file: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文件"${file.fileName}"吗？此操作不可恢复。`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 实际项目中应调用API删除COS中的文件
      fileList.value = fileList.value.filter(item => item.key !== file.key);
      message.success('文件已删除');
    }
  });
};

// 批量删除选中文件
const deleteSelectedFiles = () => {
  if (selectedFileKeys.value.length === 0) {
    message.warning('请先选择要删除的文件');
    return;
  }

  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的${selectedFileKeys.value.length}个文件吗？此操作不可恢复。`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 实际项目中应调用API批量删除COS中的文件
      fileList.value = fileList.value.filter(item => !selectedFileKeys.value.includes(item.key));
      selectedFileKeys.value = [];
      message.success('文件已删除');
    }
  });
};

// 搜索文件
const searchFiles = () => {
  if (!fileSearchKeyword.value) {
    fetchFiles(); // 如果关键字为空，重新获取所有文件
    return;
  }

  fileLoading.value = true;
  // 实际项目中应调用API搜索文件
  setTimeout(() => {
    const keyword = fileSearchKeyword.value.toLowerCase();
    const filteredFiles = mockFiles.filter(file =>
        file.fileName.toLowerCase().includes(keyword)
    );
    fileList.value = filteredFiles;
    fileLoading.value = false;
  }, 500);
};

// 上传文件相关方法
const uploadFile = () => {
  uploadVisible.value = true;
};

const beforeUpload = (file: File) => {
  // 这里可以添加文件类型、大小等检查
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    message.error('文件大小不能超过100MB!');
  }
  // 返回false将阻止默认上传行为
  return false;
};

const handleUploadChange = (info: UploadChangeParam) => {
  const { file, fileList } = info;

  if (file.status === 'uploading') {
    // 开始上传
  }
  if (file.status === 'done') {
    message.success(`${file.name} 上传成功`);
  } else if (file.status === 'error') {
    message.error(`${file.name} 上传失败`);
  }
};

// 修改存储类型
const changeStorageClass = (file: any) => {
  currentFile.value = file;
  storageClassForm.storageClass = file.storageClass;
  storageClassModalVisible.value = true;
};

const confirmChangeStorageClass = () => {
  if (!currentFile.value) return;

  // 实际项目中应调用API更改COS中文件的存储类型
  const index = fileList.value.findIndex(item => item.key === currentFile.value.key);
  if (index !== -1) {
    fileList.value[index].storageClass = storageClassForm.storageClass;
    message.success('存储类型已更改');
  }

  storageClassModalVisible.value = false;
};

// 配置相关方法
const saveCosConfig = () => {
  // 实际项目中应调用API保存COS配置
  message.success('腾讯云COS配置已保存');
};

const testConnection = () => {
  // 实际项目中应调用API测试COS连接
  message.loading('正在测试连接...', 1.5).then(() => {
    message.success('连接成功，COS配置有效');
  });
};

// 存储配额相关方法
const startEdit = (record: any) => {
  record.originalData = { ...record };
  record.editing = true;
};

const saveQuota = (record: any) => {
  // 实际项目中应调用API保存配额设置
  record.editing = false;
  record.originalData = null;
  message.success(`${record.userType}配额设置已更新`);
};

const cancelEdit = (record: any) => {
  Object.assign(record, record.originalData);
  record.editing = false;
  record.originalData = null;
};

// 清理策略相关方法
const saveCleanupPolicy = () => {
  // 实际项目中应调用API保存清理策略
  message.success('存储清理策略已保存');
};

const showRunCleanupConfirm = () => {
  Modal.confirm({
    title: '执行清理',
    content: '确定要立即执行存储清理任务吗？此操作可能导致符合清理条件的文件被删除或转移。',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 实际项目中应调用API执行清理任务
      message.loading('正在执行清理任务...', 2.5).then(() => {
        message.success('清理任务已完成');
      });
    }
  });
};

// 模拟数据
const mockFiles = [
  {
    key: '1',
    fileName: 'landscape.jpg',
    fileSize: 1024 * 1024 * 2.3, // 2.3MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-15 14:20:30',
    url: 'https://example.com/images/landscape.jpg'
  },
  {
    key: '2',
    fileName: 'portrait.png',
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-15 15:30:45',
    url: 'https://example.com/images/portrait.png'
  },
  {
    key: '3',
    fileName: 'document.pdf',
    fileSize: 1024 * 1024 * 3.8, // 3.8MB
    storageClass: 'STANDARD_IA',
    lastModified: '2023-09-14 09:15:22',
    url: 'https://example.com/documents/document.pdf'
  },
  {
    key: '4',
    fileName: 'presentation.pptx',
    fileSize: 1024 * 1024 * 5.2, // 5.2MB
    storageClass: 'STANDARD_IA',
    lastModified: '2023-09-13 11:42:18',
    url: 'https://example.com/documents/presentation.pptx'
  },
  {
    key: '5',
    fileName: 'tutorial.mp4',
    fileSize: 1024 * 1024 * 82.7, // 82.7MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-12 16:55:03',
    url: 'https://example.com/videos/tutorial.mp4'
  },
  {
    key: '6',
    fileName: 'backup.zip',
    fileSize: 1024 * 1024 * 124.8, // 124.8MB
    storageClass: 'ARCHIVE',
    lastModified: '2023-09-10 08:30:12',
    url: 'https://example.com/backups/backup.zip'
  },
  {
    key: '7',
    fileName: 'city_skyline.jpg',
    fileSize: 1024 * 1024 * 3.6, // 3.6MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-09 19:22:45',
    url: 'https://example.com/images/city_skyline.jpg'
  },
  {
    key: '8',
    fileName: 'data_report.xlsx',
    fileSize: 1024 * 1024 * 1.8, // 1.8MB
    storageClass: 'STANDARD_IA',
    lastModified: '2023-09-08 14:15:33',
    url: 'https://example.com/documents/data_report.xlsx'
  },
  {
    key: '9',
    fileName: 'interview.mp4',
    fileSize: 1024 * 1024 * 65.3, // 65.3MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-07 10:40:18',
    url: 'https://example.com/videos/interview.mp4'
  },
  {
    key: '10',
    fileName: 'architecture.png',
    fileSize: 1024 * 1024 * 4, // 4MB
    storageClass: 'STANDARD',
    lastModified: '2023-09-05 09:12:55',
    url: 'https://example.com/images/architecture.png'
  }
];

// 获取文件列表
const fetchFiles = () => {
  fileLoading.value = true;
  // 实际项目中应调用API获取COS中的文件列表
  setTimeout(() => {
    fileList.value = [...mockFiles];
    fileLoading.value = false;
  }, 1000);
};

// 初始化方法
onMounted(() => {
  // 获取文件列表
  fetchFiles();

  // 监听存储时间范围变化
  watch(storageTimeRange, () => {
    // 实际项目中应重新获取对应时间范围的数据
  });

  // 监听文件标签页切换
  watch(activeFileTab, () => {
    // 根据标签页筛选文件可以在前端完成，也可以重新请求接口
  });
});
</script>

<style scoped>
.storage-management-container {
  padding: 16px;
}

.overview-cards {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.stat-change {
  font-size: 12px;
  color: #909399;
}

.stat-change.up {
  color: #67c23a;
}

.stat-change.down {
  color: #f56c6c;
}

.progress-mini {
  margin-top: 4px;
}

.config-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.chart-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.chart-container {
  height: 300px;
}

.chart {
  height: 100%;
  width: 100%;
}

.file-manager-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-help-text {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.file-name-cell {
  display: flex;
  align-items: center;
}

.file-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 8px;
}

.danger-action {
  color: #f56c6c;
}

.file-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.image-preview {
  max-width: 100%;
  max-height: 500px;
}

.video-preview {
  width: 100%;
  max-height: 500px;
}

.file-no-preview {
  text-align: center;
  padding: 40px;
}

.file-no-preview .anticon {
  font-size: 64px;
  color: #909399;
  margin-bottom: 16px;
}

.image-grid {
  padding: 16px 0;
}

.image-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 16px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.image-wrapper {
  position: relative;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  cursor: pointer;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-more-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.image-info {
  padding: 8px;
}

.image-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.video-thumbnail {
  height: 150px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  cursor: pointer;
}

.play-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.video-actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}

.file-type-icon {
  font-size: 24px;
}

.file-type-icon.pdf {
  color: #f56c6c;
}

.file-type-icon.word {
  color: #409eff;
}

.file-type-icon.excel {
  color: #67c23a;
}

.file-type-icon.ppt {
  color: #e6a23c;
}

.file-type-icon.text {
  color: #909399;
}
</style>