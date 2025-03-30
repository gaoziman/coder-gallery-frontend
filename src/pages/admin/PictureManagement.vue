<template>
  <a-layout class="image-management-container">
    <a-layout-content>
      <!-- 操作按钮区域 -->
      <a-row class="mb-6" align="middle" justify="space-between">
        <a-col>
          <a-space size="middle">
            <a-button type="primary" @click="handleUpload">
              <template #icon>
                <upload-outlined/>
              </template>
              上传图片
            </a-button>
            <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
              <template #icon>
                <delete-outlined/>
              </template>
              批量删除
            </a-button>
            <a-button :disabled="!hasSelected" @click="handleBatchTag">
              <template #icon>
                <tag-outlined/>
              </template>
              批量标签
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <!-- 搜索条件区域 -->
      <a-card class="search-form-card" :body-style="{ padding: '24px' }">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear/>
          </a-form-item>
          <a-form-item label="角色" name="role">
            <a-select
                v-model:value="searchForm.category"
                placeholder="请选择角色"
                style="width: 150px"
                allowClear
            >
              <a-select-option value="风景/自然">风景/自然</a-select-option>
              <a-select-option value="建筑/城市">建筑/城市</a-select-option>
              <a-select-option value="食品/餐饮">食品/餐饮</a-select-option>
              <a-select-option value="艺术/设计">艺术/设计</a-select-option>
              <a-select-option value="产品/科技">产品/科技</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态：">
            <a-select
                v-model:value="searchForm.status"
                placeholder="请选择状态"
                style="width: 150px"
                allowClear
            >
              <a-select-option value="active">已上线</a-select-option>
              <a-select-option value="inactive">已下线</a-select-option>
              <a-select-option value="pending">待审核</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="创建时间" name="registerTime">
            <a-range-picker
                v-model:value="searchForm.registerTime"
                :placeholder="['开始日期', '结束日期']"
                format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch" class="search-btn">
                <template #icon>
                  <search-outlined/>
                </template>
                查询
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <reload-outlined/>
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>


      <!-- 数据统计卡片 -->
      <a-row :gutter="[16, 16]" class="mb-6">
        <a-col :xs="24" :sm="12" :md="6" v-for="(card, index) in statCards" :key="index">
          <a-card class="stat-card" :bordered="false">
            <a-row align="middle" :gutter="16">
              <a-col>
                <a-avatar :size="48" :class="`stat-avatar-${card.color}`">
                  <template #icon>
                    <component :is="card.icon"/>
                  </template>
                </a-avatar>
              </a-col>
              <a-col flex="auto">
                <div class="stat-title">{{ card.title }}</div>
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-change" :class="{ 'increase': card.change > 0, 'decrease': card.change < 0 }">
                  <arrow-up-outlined v-if="card.change > 0"/>
                  <arrow-down-outlined v-if="card.change < 0"/>
                  {{ Math.abs(card.change) }}% 较上月
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>


      <!-- 筛选表单 -->
      <a-card class="mb-6" :bordered="false">
        <a-row justify="space-between" align="middle">
          <a-col>
            <!-- 使用自定义样式的Tab切换而非Radio Button组 -->
            <div class="custom-tab-container">
              <div
                  :class="['custom-tab', { active: viewMode === 'grid' }]"
                  @click="handleViewModeChange('grid')"
              >
                <app-store-outlined/>
                <span>网格视图</span>
              </div>
              <div
                  :class="['custom-tab', { active: viewMode === 'list' }]"
                  @click="handleViewModeChange('list')"
              >
                <unordered-list-outlined/>
                <span>列表视图</span>
              </div>
            </div>
          </a-col>
          <a-col>
            <a-typography-text type="secondary">
              显示 {{ pageInfo.from }}-{{ pageInfo.to }} / 共 {{ pageInfo.total }} 项 - 第 {{ pageInfo.current }} 页
            </a-typography-text>
          </a-col>
        </a-row>
      </a-card>

      <!-- 网格视图和列表视图容器 -->
      <a-spin :spinning="loading" tip="加载中..." size="large" class="custom-theme-spin">
        <transition name="fade" mode="out-in">
          <!-- 网格视图 - 重构版本 -->
          <div v-if="viewMode === 'grid'" style="padding: 16px 0;">
            <div style="display: flex; flex-wrap: wrap; margin: -12px;">
              <div
                  v-for="image in images"
                  :key="image.id"
                  style="width: calc(25% - 24px); padding: 12px; box-sizing: border-box;"
                  :style="{
        '@media (max-width: 1200px)': { width: 'calc(33.33% - 24px)' },
        '@media (max-width: 768px)': { width: 'calc(50% - 24px)' },
        '@media (max-width: 576px)': { width: '100%' }
      }"
              >
                <!-- 单个图片卡片 - 使用内联样式 -->
                <div
                    style="position: relative; display: flex; flex-direction: column; height: 100%; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; transition: all 0.3s;">
                  <!-- 复选框选择 -->
                  <div
                      style="position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(255,255,255,0.8); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <a-checkbox
                        :checked="selectedRowKeys.includes(image.id)"
                        @change="e => toggleSelection(image.id, e.target.checked)"
                    />
                  </div>

                  <!-- 图片预览区域 -->
                  <div style="position: relative; height: 200px; overflow: hidden; border-radius: 8px 8px 0 0;">
                    <img
                        :src="image.url"
                        :alt="image.name"
                        style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                    />
                    <!-- 悬停遮罩 -->
                    <div
                        :id="`overlay-${image.id}`"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; z-index: 5;"
                        @mouseenter="document.getElementById(`overlay-${image.id}`).style.opacity = 1"
                        @mouseleave="document.getElementById(`overlay-${image.id}`).style.opacity = 0"
                    >
                      <div style="display: flex; justify-content: center; gap: 8px;">
                        <a-button class="action-btn" type="primary" shape="circle" @click="previewImage(image)">
                          <template #icon>
                            <eye-outlined/>
                          </template>
                        </a-button>
                        <a-button class="action-btn" type="primary" shape="circle" @click="editImage(image)">
                          <template #icon>
                            <edit-outlined/>
                          </template>
                        </a-button>
                        <a-button class="action-btn" type="primary" shape="circle" @click="showDeleteConfirm(image)">
                          <template #icon>
                            <delete-outlined/>
                          </template>
                        </a-button>
                      </div>
                    </div>
                  </div>

                  <!-- 图片信息区域 -->
                  <div
                      style="padding: 12px; display: flex; flex-direction: column; flex-grow: 1; background-color: white;">
                    <h5 style="margin: 0 0 8px; font-size: 16px; line-height: 1.4; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {{ image.name }}</h5>

                    <div style="display: block; margin-bottom: 8px; font-size: 12px; color: #8c8c8c;">
                      {{ image.size }} · {{ formatDate(image.createTime) }}
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px;">
                      <a-tag v-for="tag in image.tags.slice(0, 2)" :key="tag" color="purple">{{ tag }}</a-tag>
                      <a-tag v-if="image.tags.length > 2" color="blue">+{{ image.tags.length - 2 }}</a-tag>
                    </div>

                    <div
                        style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 8px; align-items: center;">
                      <div>
                        <eye-outlined/>
                        {{ image.views }}
                      </div>
                      <div>
                        <star-outlined/>
                        {{ image.favorites }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页控件 -->
            <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
              <a-pagination
                  v-model:current="pagination.current"
                  :total="pagination.total"
                  :pageSize="pagination.pageSize"
                  show-size-changer
                  show-quick-jumper
                  :showTotal="total => `共 ${total} 条数据`"
                  @change="handlePaginationChange"
                  @showSizeChange="handleSizeChange"
              />
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="list-view">
            <a-table
                :columns="columns"
                :data-source="images"
                :pagination="pagination"
                :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                @change="handleTableChange"
                :row-key="record => record.id"
            >
              <!-- 图片预览列 -->
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'preview'">
                  <a-image :src="record.url" :width="60" :height="60" class="table-image-preview"/>
                </template>

                <!-- 标签列 -->
                <template v-if="column.dataIndex === 'tags'">
                  <a-space wrap>
                    <a-tag v-for="tag in record.tags" :key="tag" color="purple">{{ tag }}</a-tag>
                  </a-space>
                </template>

                <!-- 分类列 -->
                <template v-if="column.dataIndex === 'category'">
                  <a-tag :color="getCategoryColor(record.category)">{{ record.category }}</a-tag>
                </template>

                <!-- 宽高比列 -->
                <template v-if="column.dataIndex === 'ratio'">
                  {{ (record.width / record.height).toFixed(2) }}
                </template>

                <!-- 操作列 -->
                <template v-if="column.dataIndex === 'action'">
                  <a-space>
                    <a-button class="table-action-btn" type="text" size="small" @click="previewImage(record)">
                      <template #icon>
                        <eye-outlined/>
                      </template>
                    </a-button>
                    <a-button class="table-action-btn" type="text" size="small" @click="editImage(record)">
                      <template #icon>
                        <edit-outlined/>
                      </template>
                    </a-button>
                    <a-button class="table-action-btn" type="text" size="small" @click="copyImageUrl(record)">
                      <template #icon>
                        <copy-outlined/>
                      </template>
                    </a-button>
                    <a-popconfirm
                        title="确定要删除此图片吗？"
                        ok-text="删除"
                        cancel-text="取消"
                        @confirm="handleDelete(record)"
                    >
                      <a-button class="table-action-btn danger" type="text" size="small">
                        <template #icon>
                          <delete-outlined/>
                        </template>
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </transition>
      </a-spin>

      <!-- 图片预览弹窗 -->
      <a-modal
          v-model:visible="previewVisible"
          title="图片预览"
          :footer="null"
          width="800px"
          centered
          class="preview-modal"
          :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
          :z-index="2000"
          :style="{ top: 0 }"
          @cancel="closePreview"
      >
        <div class="preview-modal-content">
          <div class="preview-image-container">
            <a-image
                :src="currentImage?.url"
                :alt="currentImage?.name"
                class="full-preview-img"
                :preview="false"
            />
            <!-- 预览图下方的操作按钮区域 -->
            <div class="preview-actions">
              <a-space size="middle">
                <a-button class="action-btn" shape="circle" @click="downloadImage">
                  <template #icon>
                    <download-outlined/>
                  </template>
                </a-button>
                <a-button class="action-btn" shape="circle" @click="editImage(currentImage)">
                  <template #icon>
                    <edit-outlined/>
                  </template>
                </a-button>
                <a-button class="action-btn" shape="circle" @click="copyImageUrl(currentImage)">
                  <template #icon>
                    <copy-outlined/>
                  </template>
                </a-button>
                <a-button class="action-btn danger" shape="circle" @click="showDeleteConfirm(currentImage)">
                  <template #icon>
                    <delete-outlined/>
                  </template>
                </a-button>
              </a-space>
            </div>
          </div>
          <a-divider/>
          <div class="preview-image-info">
            <a-typography-title :level="4">{{ currentImage?.name }}</a-typography-title>
            <a-typography-paragraph>{{ currentImage?.description }}</a-typography-paragraph>
            <a-descriptions :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
              <a-descriptions-item label="尺寸">
                {{ currentImage?.width }} × {{ currentImage?.height }} px
              </a-descriptions-item>
              <a-descriptions-item label="大小">
                {{ currentImage?.size }}
              </a-descriptions-item>
              <a-descriptions-item label="格式">
                {{ getImageFormat(currentImage?.name) }}
              </a-descriptions-item>
              <a-descriptions-item label="上传时间">
                {{ formatDate(currentImage?.createTime) }}
              </a-descriptions-item>
            </a-descriptions>
            <div class="preview-tags">
              <a-space wrap>
                <a-tag v-for="tag in currentImage?.tags" :key="tag" color="purple">{{ tag }}</a-tag>
              </a-space>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- 删除确认弹窗 -->
      <a-modal
          v-model:visible="deleteModalVisible"
          title="删除确认"
          :footer="null"
          @cancel="deleteModalVisible = false"
      >
        <p>确定要删除图片 "{{ currentImage?.name }}" 吗？此操作不可恢复。</p>
        <div class="modal-footer">
          <a-button @click="deleteModalVisible = false">取消</a-button>
          <a-button danger type="primary" @click="confirmDeleteImage">确认删除</a-button>
        </div>
      </a-modal>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  UploadOutlined,
  DeleteOutlined,
  TagOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  StarOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
  ArrowDownOutlined,
  PictureOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  ShareAltOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();

// 视图模式：网格或列表
const viewMode = ref('grid');

// 表格加载状态
const loading = ref(false);

// 当前预览图片
const currentImage = ref(null);
const previewVisible = ref(false);
const deleteModalVisible = ref(false);

// 选择的行（图片ID）
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 搜索表单数据
const searchForm = reactive({
  name: '',            // 图片名称
  description: '',     // 图片简介
  uploader: '',        // 上传用户
  category: undefined, // 图片类型
  status: undefined,   // 图片状态
  dateRange: [],       // 上传时间范围
  fileType: undefined, // 文件类型
});

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

// 页面显示数据计算
const pageInfo = computed(() => {
  const {current, pageSize, total} = pagination;
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  return {current, total, from, to};
});

// 过滤表单
const filterForm = reactive({
  imageName: '',
  uploadDate: [],
  fileType: undefined,
  tagCategory: undefined,
});

// 统计卡片数据
const statCards = [
  {
    title: '总图片数',
    value: '14,526',
    change: 8.4,
    color: 'purple',
    icon: PictureOutlined,
  },
  {
    title: '本周上传',
    value: '1,284',
    change: 12.5,
    color: 'blue',
    icon: CloudUploadOutlined,
  },
  {
    title: '存储用量',
    value: '458 GB',
    change: 0,
    color: 'indigo',
    icon: DatabaseOutlined,
  },
  {
    title: '公开分享',
    value: '2,451',
    change: 5.7,
    color: 'green',
    icon: ShareAltOutlined,
  },
];

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 70,
    fixed: 'left',
    align: 'center',
  },
  {
    title: '预览图',
    dataIndex: 'preview',
    width: 100,
    fixed: 'left',
    align: 'center',
  },
  {
    title: '图片名称',
    dataIndex: 'name',
    width: 200,
    sorter: true,
    align: 'center',
  },
  {
    title: '图片简介',
    dataIndex: 'description',
    width: 300,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '文件大小',
    dataIndex: 'size',
    width: 120,
    sorter: true,
    align: 'center',
  },
  {
    title: '宽度',
    dataIndex: 'width',
    width: 100,
    sorter: true,
    align: 'center',
  },
  {
    title: '高度',
    dataIndex: 'height',
    width: 100,
    sorter: true,
    align: 'center',
  },
  {
    title: '宽高比',
    dataIndex: 'ratio',
    width: 100,
    sorter: true,
    align: 'center',
  },
  {
    title: '分类',
    dataIndex: 'category',
    width: 120,
    align: 'center',
    filters: [
      {text: '风景/自然', value: '风景/自然'},
      {text: '建筑/城市', value: '建筑/城市'},
      {text: '食品/餐饮', value: '食品/餐饮'},
    ],
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 200,
    align: 'center',
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    width: 100,
    sorter: true,
    align: 'center',
  },
  {
    title: '收藏量',
    dataIndex: 'favorites',
    width: 100,
    sorter: true,
    align: 'center',
  },
  {
    title: '上传用户',
    dataIndex: 'uploader',
    width: 120,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    align: 'center',
    sorter: true,
    render: (text) => formatDate(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 160,
    className: 'action-column'
  }
];

// 模拟图片数据
const images = ref([
  {
    id: 1,
    name: '美丽日落风景.jpg',
    description: '拍摄于山顶的绝美日落景色，天空呈现出绚丽的橙红色',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f',
    size: '2.4 MB',
    width: 1920,
    height: 1080,
    category: '风景/自然',
    tags: ['日落', '风景', '山水'],
    views: 152,
    favorites: 43,
    uploader: '摄影师A',
    createTime: '2023-03-14 15:30:00',
  },
  {
    id: 2,
    name: '现代建筑设计.png',
    description: '现代主义风格建筑设计，简洁的线条和大面积的玻璃墙',
    url: 'https://images.unsplash.com/photo-1682695798256-28a674122872',
    size: '5.7 MB',
    width: 2400,
    height: 1600,
    category: '建筑/城市',
    tags: ['建筑', '现代', '设计'],
    views: 98,
    favorites: 27,
    uploader: '建筑师B',
    createTime: '2023-03-13 10:15:00',
  },
  {
    id: 4,
    name: '城市夜景.jpg',
    description: '繁华都市的夜景全景，霓虹闪烁，高楼林立',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    size: '4.8 MB',
    width: 3840,
    height: 2160,
    category: '建筑/城市',
    tags: ['城市', '夜景', '风光'],
    views: 342,
    favorites: 118,
    uploader: '城市摄影师D',
    createTime: '2023-03-11 21:20:00',
  },
  {
    id: 5,
    name: '抽象艺术绘画.png',
    description: '现代抽象派艺术作品，色彩鲜明，构图独特',
    url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968',
    size: '6.5 MB',
    width: 2000,
    height: 2000,
    category: '艺术/设计',
    tags: ['艺术', '抽象', '绘画'],
    views: 87,
    favorites: 31,
    uploader: '艺术家E',
    createTime: '2023-03-10 09:40:00',
  },
  {
    id: 6,
    name: '热带海滩度假.jpg',
    description: '蓝天白云下的热带海滩，椰树和清澈的海水',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    size: '3.9 MB',
    width: 2100,
    height: 1400,
    category: '风景/自然',
    tags: ['海滩', '旅行', '度假'],
    views: 278,
    favorites: 92,
    uploader: '旅行摄影师F',
    createTime: '2023-03-09 14:10:00',
  },
  {
    id: 7,
    name: '森林小径.jpg',
    description: '穿过茂密森林的小径，阳光透过树叶洒落',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    size: '2.8 MB',
    width: 1800,
    height: 1200,
    category: '风景/自然',
    tags: ['森林', '自然', '步道'],
    views: 142,
    favorites: 47,
    uploader: '风景摄影师G',
    createTime: '2023-03-08 11:35:00',
  },
  {
    id: 8,
    name: '科技产品特写.png',
    description: '最新款智能手机的细节特写，展示精湛工艺',
    url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
    size: '4.2 MB',
    width: 2200,
    height: 1500,
    category: '产品/科技',
    tags: ['科技', '产品', '特写'],
    views: 189,
    favorites: 53,
    uploader: '产品摄影师H',
    createTime: '2023-03-07 16:50:00',
  },
]);


// 视图切换逻辑增强
const handleViewModeChange = (mode) => {
  if (viewMode.value !== mode) {
    viewMode.value = mode;
    // 存储用户偏好
    localStorage.setItem('preferredViewMode', mode);

    // 调整分页
    if (mode === 'list') {
      pagination.pageSize = 10;
    } else {
      pagination.pageSize = 12;
    }

    // 重新获取数据
    fetchImageData();

    message.success(`已切换到${mode === 'grid' ? '网格' : '列表'}视图`);
  }
};

// 分页变化处理
const handlePaginationChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchImageData();
};

// 每页条数变化
const handleSizeChange = (current, size) => {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchImageData();
};

// 获取分类颜色
const getCategoryColor = (category) => {
  const colorMap = {
    '风景/自然': 'green',
    '建筑/城市': 'blue',
    '食品/餐饮': 'orange',
    '艺术/设计': 'purple',
    '产品/科技': 'cyan'
  };

  return colorMap[category] || 'default';
};

// 在组件挂载时获取数据
onMounted(() => {
  // 获取用户上次选择的视图模式（如果有）
  const savedViewMode = localStorage.getItem('preferredViewMode');
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }

  // 初始化原始图片数据
  originalImages.value = [...images.value];

  fetchImageData();
});


// 获取图片数据（优化版本）
const fetchImageData = () => {
  loading.value = true;

  // 模拟异步请求
  setTimeout(() => {
    // 设置分页总数（使用计算属性）
    pagination.total = images.value.length;
    loading.value = false;
  }, 300); // 减少加载时间提高性能
};

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

// 网格视图单选
const toggleSelection = (id, checked) => {
  if (checked) {
    if (!selectedRowKeys.value.includes(id)) {
      selectedRowKeys.value.push(id);
    }
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id);
  }
};

// 表格变化（排序、筛选、分页）
const handleTableChange = (pag, filters, sorter) => {
  // 更新分页信息
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    images.value.sort((a, b) => {
      let comparison = 0;
      if (a[sorter.field] < b[sorter.field]) {
        comparison = -1;
      } else if (a[sorter.field] > b[sorter.field]) {
        comparison = 1;
      }
      return comparison * order;
    });
  }
};


// 搜索处理
const handleSearch = () => {
  loading.value = true;

  // 构建查询参数
  const params = {};

  if (searchForm.name) {
    params.name = searchForm.name;
  }

  if (searchForm.description) {
    params.description = searchForm.description;
  }

  if (searchForm.uploader) {
    params.uploader = searchForm.uploader;
  }

  if (searchForm.category) {
    params.category = searchForm.category;
  }

  if (searchForm.status) {
    params.status = searchForm.status;
  }

  if (searchForm.fileType) {
    params.fileType = searchForm.fileType;
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD');
    params.endDate = dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD');
  }

  // 在实际应用中，这里会调用API进行查询
  // 这里模拟筛选
  setTimeout(() => {
    // 根据参数筛选图片
    const filteredImages = filterImages(params);

    // 更新图片列表
    images.value = filteredImages;

    // 更新分页信息
    pagination.total = filteredImages.length;
    pagination.current = 1;

    loading.value = false;
    message.success(`找到 ${filteredImages.length} 个结果`);
  }, 300);
};

// 重置搜索表单
const handleReset = () => {
  // 重置表单字段
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = [];
    } else {
      searchForm[key] = undefined;
    }
  });

  // 重新获取所有数据
  fetchImageData();
  message.success('已重置搜索条件');
};

// 根据条件筛选图片
const filterImages = (params) => {
  // 从原始图片列表中筛选
  return originalImages.value.filter(image => {
    // 匹配名称
    if (params.name && !image.name.toLowerCase().includes(params.name.toLowerCase())) {
      return false;
    }

    // 匹配描述
    if (params.description && !image.description.toLowerCase().includes(params.description.toLowerCase())) {
      return false;
    }

    // 匹配上传者
    if (params.uploader && !image.uploader.toLowerCase().includes(params.uploader.toLowerCase())) {
      return false;
    }

    // 匹配分类
    if (params.category && image.category !== params.category) {
      return false;
    }

    // 匹配文件类型
    if (params.fileType && !image.name.toLowerCase().endsWith(params.fileType.toLowerCase())) {
      return false;
    }

    // 匹配日期范围
    if (params.startDate && params.endDate) {
      const imageDate = dayjs(image.createTime);
      const startDate = dayjs(params.startDate);
      const endDate = dayjs(params.endDate).endOf('day');

      if (imageDate.isBefore(startDate) || imageDate.isAfter(endDate)) {
        return false;
      }
    }

    return true;
  });
};

const originalImages = ref([...images.value]);

// 上传图片
const handleUpload = () => {
  message.info('上传图片功能正在开发中');
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请至少选择一张图片');
    return;
  }

  // 使用Modal替代undefined的modal变量
  Modal.confirm({
    title: '批量删除图片',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 张图片吗？此操作不可逆。`,
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      // 执行删除操作
      message.success(`已删除 ${selectedRowKeys.value.length} 张图片`);
      // 清空选中
      selectedRowKeys.value = [];
      // 重新获取数据
      fetchImageData();
    }
  });
};

// 批量标签
const handleBatchTag = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请至少选择一张图片');
    return;
  }

  // 在实际应用中，打开标签编辑弹窗
  message.success(`已为 ${selectedRowKeys.value.length} 张图片添加标签`);
};

// 预览图片
const previewImage = (image) => {
  currentImage.value = image;
  previewVisible.value = true;
  // 添加类以禁用背景滚动
  document.body.classList.add('preview-modal-open');
};

// 在关闭预览模态框时移除类
const closePreview = () => {
  previewVisible.value = false;
  document.body.classList.remove('preview-modal-open');
};

// 编辑图片
const editImage = (image) => {
  if (!image) return;
  router.push(`/edit-image/${image.id}`);
};

// 显示删除确认弹窗
const showDeleteConfirm = (image) => {
  currentImage.value = image;
  deleteModalVisible.value = true;
};

// 确认删除操作
const confirmDeleteImage = () => {
  if (!currentImage.value) return;

  // 执行删除操作
  handleDelete(currentImage.value);
  // 关闭弹窗
  deleteModalVisible.value = false;
  // 如果在预览模式，也关闭预览
  if (previewVisible.value) {
    previewVisible.value = false;
  }
};

// 执行删除
const handleDelete = (image) => {
  // 执行删除操作
  message.success(`已删除图片 "${image.name}"`);

  // 从列表中移除
  images.value = images.value.filter(img => img.id !== image.id);

  // 更新分页信息
  pagination.total = images.value.length;
};

// 下载图片（优化版本）
const downloadImage = () => {
  if (!currentImage.value) return;

  const link = document.createElement('a');
  link.href = currentImage.value.url;
  link.download = currentImage.value.name;
  link.target = '_blank'; // 添加target属性提高性能
  document.body.appendChild(link);
  link.click();

  // 使用requestAnimationFrame延迟删除，提高性能
  requestAnimationFrame(() => {
    document.body.removeChild(link);
  });

  message.success('图片下载已开始');
};

// 复制图片链接
const copyImageUrl = (image) => {
  if (!image || !image.url) return;

  navigator.clipboard.writeText(image.url)
      .then(() => {
        message.success('图片链接已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD');
};

// 获取图片格式
const getImageFormat = (filename) => {
  if (!filename) return '';
  const extension = filename.split('.').pop().toUpperCase();
  return extension;
};
</script>

<style scoped>
/* 基本容器样式 */
.image-management-container {
  padding: 20px;
  background-color: #f8f8fc;
  min-height: 100vh;
  --grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  --grid-gap: 16px !important;
}

/* 强制网格视图的布局结构 */
.image-management-container .grid-view {
  display: grid !important;
  grid-template-columns: var(--grid-template-columns) !important;
  gap: var(--grid-gap) !important;
  margin-bottom: 24px !important;
}

/* 修复图片卡片样式 */
.image-management-container .image-card {
  position: relative !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  transition: all 0.3s !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 修复图片预览区域 */
.image-management-container .image-preview {
  position: relative !important;
  height: 200px !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
}

/* 修复图片叠加层 */
.image-management-container .image-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0 !important;
  transition: opacity 0.3s !important;
  z-index: 5 !important;
}

/* 确保悬停效果正常工作 */
.image-management-container .image-preview:hover .image-overlay {
  opacity: 1 !important;
}

/* 修复预览图片样式 */
.image-management-container .preview-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  transition: transform 0.3s ease !important;
}

/* 修复图片信息区域 */
.image-management-container .image-info {
  padding: 12px !important;
  display: flex !important;
  flex-direction: column !important;
  flex-grow: 1 !important;
}

/* 修复图片操作按钮区域 */
.image-management-container .image-actions {
  display: flex !important;
  justify-content: center !important;
  gap: 8px !important;
}

/* 统计卡片样式 */
.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-title {
  font-size: 14px;
  color: #8C8C8C;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.increase {
  color: #52C41A;
}

.decrease {
  color: #F5222D;
}

.image-preview:hover .preview-img {
  transform: scale(1.05) !important;
}

.image-preview:hover .image-overlay {
  opacity: 1 !important;
}

/* 列表视图样式 */
.list-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-image-preview {
  border-radius: 4px;
  overflow: hidden;
}

/* 预览弹窗样式 */
.preview-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
}

.preview-modal :deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
}

.preview-modal :deep(.ant-modal-title) {
  color: #6554C0;
  font-weight: 600;
}

.full-preview-img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  margin: 0 auto;
  border-radius: 4px;
}

.preview-image-info {
  padding: 16px 0;
}

.preview-tags {
  margin-top: 16px;
}

/* 删除弹窗样式 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* 工具类 */
.mb-6 {
  margin-bottom: 24px;
}


/* 预览模态框操作按钮样式 */
.preview-actions {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.preview-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}


/* 预览弹窗样式优化 */
.preview-modal :deep(.ant-modal) {
  top: 0;
  padding-bottom: 0;
}

.preview-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.preview-modal :deep(.ant-modal-mask) {
  backdrop-filter: blur(5px);
}

/* 当预览模态框打开时禁用页面滚动 */
body.preview-modal-open {
  overflow: hidden;
}

/* 搜索区域样式重写 */
.search-form-card {
  margin-bottom: 20px;
}

/* 搜索表单样式修复 */
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 0;
}

/* 修复表单项间距 */
.search-form :deep(.ant-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}


/* 响应式布局调整 */
@media (max-width: 1200px) {
  .search-form {
    gap: 12px;
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .image-management-container {
    padding: 16px;
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .custom-tab-container {
    width: 100%;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form :deep(.ant-form-item) {
    margin-bottom: 12px;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .image-management-container {
    padding: 10px;
  }

  .grid-view {
    grid-template-columns: 1fr;
  }

  .stat-card {
    margin-bottom: 10px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
