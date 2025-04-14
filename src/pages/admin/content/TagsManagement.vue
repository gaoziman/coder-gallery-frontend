<template>
  <div class="tag-management-container">
    <DashboardHeader
        title="标签管理"
        description="智能系统标签，支持创建、分类、状态控制及使用情况追踪"
        parent-module="内容管理"
        :module-icon="TagOutlined"
        :metrics="headerMetrics"
    />

    <StatCards :cards="statCards"/>

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 标签名称 -->
            <a-form-item label="标签名称" name="name">
              <a-input v-model:value="searchForm.name" placeholder="请输入标签名称" allowClear/>
            </a-form-item>

            <!-- 状态 -->
            <a-form-item label="状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="active">已启用</a-select-option>
                <a-select-option value="inactive">已禁用</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 创建时间 -->
            <a-form-item label="创建时间" name="createTime">
              <a-range-picker
                  v-model:value="searchForm.createTime"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY-MM-DD"
                  style="width: 240px"
              />
            </a-form-item>

            <!-- 操作按钮 -->
            <div class="search-buttons">
              <a-button type="primary" html-type="submit" class="search-button" :loading="loading">
                <search-outlined/>
                查询
              </a-button>
              <a-button @click="resetSearchForm">
                <reload-outlined/>
                重置
              </a-button>
            </div>
          </div>
        </a-form>
      </div>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <div class="operation-left">
        <a-space>
          <a-button type="primary" @click="openCreateModal">
            <plus-outlined/>
            新建标签
          </a-button>
          <a-button @click="handleRefresh" :loading="loading">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchEnable">
            <check-circle-outlined/>
            批量启用
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchDisable">
            <stop-outlined/>
            批量禁用
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
          <a-radio-button value="grid">
            <appstore-outlined/>
            卡片视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="tagData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 标签颜色列 -->
          <template v-if="column.dataIndex === 'color'">
            <div class="tag-color-container">
              <div class="tag-color-dot" :style="{ backgroundColor: record.color }"></div>
              <span>{{ record.color }}</span>
            </div>
          </template>

          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="getStatusType(record.status)"
                :text="getStatusText(record.status)"
            />
          </template>

          <!-- 创建时间 -->
          <template v-if="column.dataIndex === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>


          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewTagDetails(record)">
                <eye-outlined/>
                查看
              </a-button>
              <a-button type="link" size="small" @click="editTag(record)">
                <edit-outlined/>
                编辑
              </a-button>
              <a-button
                  type="link"
                  size="small"
                  @click="toggleTagStatus(record)"
                  :style="{ color: record.status === 'active' ? '#ff4d4f' : '#52C41A' }"
              >
                <component :is="record.status === 'active' ? 'stop-outlined' : 'check-circle-outlined'"/>
                {{ record.status === 'active' ? '禁用' : '启用' }}
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="2" @click="copyTag(record)">
                      <copy-outlined/>
                      复制
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item key="3" danger @click="showDeleteConfirm(record)">
                      <delete-outlined/>
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  <more-outlined/>
                  更多
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 卡片视图 -->
    <div v-else-if="viewMode === 'grid'" class="grid-view-container">
      <a-spin :spinning="loading">
        <div class="grid-header">
          <div class="grid-selection" v-if="hasSelected">
            <a-checkbox
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="onSelectAllChange"
            />
            <span class="selected-count">已选择 {{ selectedRowKeys.length }} 项</span>
          </div>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6" v-for="tag in tagData" :key="tag.id">
            <div class="tag-card" :class="{ 'tag-card-selected': selectedRowKeys.includes(tag.id) }"
                 :style="{ '--tag-color': tag.color, '--tag-color-light': lightenColor(tag.color, 20) }"
                 @click="toggleTagSelection(tag.id)">
              <!-- 状态标签 -->
              <div class="tag-label" :class="tag.status === 'active' ? 'tag-label-active' : 'tag-label-inactive'">
                <check-circle-outlined v-if="tag.status === 'active'"/>
                <stop-outlined v-else/>
                {{ getStatusText(tag.status) }}
              </div>

              <!-- 卡片标题区 -->
              <div class="tag-card-title">
                <div class="tag-icon" :style="{ backgroundColor: tag.color }">
                  <component :is="getTagIcon(tag.category)"/>
                </div>
                <h3 class="tag-title-text">{{ tag.name }}</h3>
              </div>

              <!-- 卡片内容区 -->
              <div class="tag-card-content">
                <p class="tag-description">{{ tag.description || '暂无描述信息' }}</p>

                <!-- 使用情况指标 -->
                <div class="tag-stats">
                  <div class="tag-stat-item">
                    <link-outlined/>
                    <span>引用次数: {{ tag.referenceCount || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- 卡片底部信息 -->
              <div class="tag-card-meta">
                <div class="tag-create-info">
                  <calendar-outlined/>
                  创建于: {{ formatDateTime(tag.createTime, true) }}
                </div>

                <div class="tag-actions">
                  <a-button class="tag-action-btn" @click.stop="editTag(tag)">
                    <edit-outlined/>
                  </a-button>
                  <a-button class="tag-action-btn" @click.stop="viewTagDetails(tag)">
                    <eye-outlined/>
                  </a-button>
                  <a-button class="tag-action-btn" @click.stop="toggleTagStatus(tag)">
                    <component :is="tag.status === 'active' ?  StopOutlined : CheckCircleOutlined"/>
                  </a-button>
                  <a-dropdown>
                    <button class="tag-action-btn" @click.stop>
                      <more-outlined/>
                    </button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1" @click.stop="copyTag(tag)">
                          <copy-outlined/>
                          复制
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item key="2" danger @click.stop="showDeleteConfirm(tag)">
                          <delete-outlined/>
                          删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>

              <!-- 装饰元素 -->
              <div class="card-decoration">
                <div class="decoration-shape" :style="{ backgroundColor: tag.color }"></div>
              </div>
            </div>
          </a-col>
        </a-row>

        <!-- 卡片视图分页 -->
        <div class="grid-pagination-bottom">
          <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '36', '48']"
              :showQuickJumper="true"
              :showTotal="(total) => `共 ${total} 项`"
              @change="onPageChange"
              @showSizeChange="onShowSizeChange"
          />
        </div>
      </a-spin>
    </div>

    <a-modal
        v-model:visible="tagModalVisible"
        :title="isEditing ? '编辑标签' : '新建标签'"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-tag-modal compact-tag-modal"
    >
      <!-- 精简头部区域 -->
      <div class="modal-header-compact">
        <div class="header-icon">
          <component :is="isEditing ? EditOutlined : PlusOutlined"/>
        </div>
        <div class="header-title">
          <h2>{{ isEditing ? '编辑标签信息' : '创建新标签' }}</h2>
          <p>{{ isEditing ? '修改标签的基本信息和配置' : '创建一个新的标签，用于内容分类和组织' }}</p>
        </div>
      </div>

      <!-- 移除多余的分隔线，减少垂直间距 -->

      <a-form
          :model="tagForm"
          :rules="tagRules"
          ref="tagFormRef"
          layout="vertical"
          class="compact-form"
      >
        <div class="form-content">
          <!-- 横向三列布局，更有效利用空间 -->
          <div class="integrated-form-compact">
            <!-- 第一列：标签名称 -->
            <div class="form-column">
              <a-form-item label="标签名称" name="name" required>
                <a-input
                    v-model:value="tagForm.name"
                    placeholder="请输入标签名称"
                    :maxLength="20"
                    showCount
                >
                  <template #prefix>
                    <font-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                  </template>
                </a-input>
              </a-form-item>
            </div>

            <!-- 第二列：标签状态 -->
            <div class="form-column">
              <a-form-item label="标签状态" name="status" required>
                <a-select
                    v-model:value="tagForm.status"
                    placeholder="请选择标签状态"
                    :options="statusOptions"
                >
                  <template #suffixIcon>
                    <check-circle-outlined/>
                  </template>
                </a-select>
              </a-form-item>
            </div>

            <!-- 第三列：标签颜色 -->
            <div class="form-column">
              <a-form-item label="标签颜色" name="color" required class="color-form-item">
                <div class="color-display-row">
                  <!-- 颜色预览 -->
                  <div class="selected-color-preview" :style="{ backgroundColor: tagForm.color }"></div>
                  <!-- 颜色输入框 -->
                  <a-input
                      v-model:value="tagForm.color"
                      placeholder="#颜色代码"
                      class="color-input"
                  />
                  <!-- 显示颜色选择器按钮 - 使用更可靠的图标 -->
                  <a-button class="color-picker-button" @click="openColorPicker">
                    <svg viewBox="64 64 896 896" data-icon="bg-colors" width="1em" height="1em" fill="currentColor"
                         aria-hidden="true" focusable="false" class="">
                      <path
                          d="M766.4 744.3c43.7 0 79.4-36.2 79.4-80.5 0-53.5-79.4-140.8-79.4-140.8S687 610.3 687 663.8c0 44.3 35.7 80.5 79.4 80.5zm-377.1-44.1c7.1 7.1 18.6 7.1 25.6 0l256.1-256c7.1-7.1 7.1-18.6 0-25.6l-256-256c-7.1-7.1-18.6-7.1-25.6 0-7.1 7.1-7.1 18.6 0 25.6l230.4 230.6L389.3 675.6a18.15 18.15 0 000 24.6zm261.3-105.5c3.2 3.2 3.2 8.4 0 11.6l-28.4 28.4c-3.2 3.2-8.4 3.2-11.6 0l-56.7-56.7a8.15 8.15 0 010-11.6l28.4-28.4c3.2-3.2 8.4-3.2 11.6 0l56.7 56.7zM675.3 150l-166 166c-3.2 3.2-8.4 3.2-11.6 0l-56.8-56.8c-3.2-3.2-3.2-8.4 0-11.6l166-166c3.2-3.2 8.4-3.2 11.6 0l56.8 56.8c3.2 3.2 3.2 8.4 0 11.6z"></path>
                    </svg>
                  </a-button>
                </div>
              </a-form-item>
            </div>
          </div>

          <!-- 紧凑排列的颜色预设 -->
          <div class="color-selector-compact">
            <div class="color-preset-grid">
              <template v-for="color in presetColors.slice(0, 15)" :key="color">
                <div
                    class="color-preset-item"
                    :class="{ active: tagForm.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="tagForm.color = color"
                ></div>
              </template>
            </div>
          </div>

          <!-- 可选的描述字段 - 减小高度 -->
          <a-form-item label="标签描述" name="description">
            <a-textarea
                v-model:value="tagForm.description"
                placeholder="请输入标签描述（选填）"
                :rows="2"
                :maxLength="100"
                showCount
            />
          </a-form-item>

          <!-- 标签预览 - 精简高度，移到底部 -->
          <div class="tag-preview-compact">
            <div class="preview-title">预览效果:</div>
            <a-tag :color="tagForm.color" style="margin: 0; padding: 5px 12px; font-size: 14px;">
              {{ tagForm.name || '标签预览' }}
            </a-tag>
          </div>
        </div>

        <!-- 表单底部按钮 - 减少上边距 -->
        <div class="form-footer-compact">
          <a-space>
            <a-button @click="handleTagCancel">取消</a-button>
            <a-button type="primary" @click="handleTagSubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              {{ isEditing ? '保存' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>


    <a-modal
        v-model:visible="colorPickerVisible"
        title="高级颜色选择器"
        :footer="null"
        width="360px"
        :destroyOnClose="true"
        class="color-picker-modal"
    >
      <!-- 简化颜色选择器内容，确保组件正确加载 -->
      <div class="advanced-color-selector">
        <!-- 预设颜色选择网格 -->
        <div class="color-grid">
          <div
              v-for="color in presetColors"
              :key="color"
              class="color-grid-item"
              :style="{ backgroundColor: color }"
              :class="{ active: tagForm.color === color }"
              @click="selectColor(color)"
          ></div>
        </div>

        <!-- 自定义颜色输入 -->
        <div class="custom-color-input">
          <span class="color-input-label">自定义颜色:</span>
          <div class="color-input-container">
            <div class="color-preview" :style="{ backgroundColor: tagForm.color }"></div>
            <a-input
                v-model:value="tagForm.color"
                placeholder="#颜色代码"
                :maxLength="7"
                @change="validateColorCode"
            />
          </div>
        </div>

        <!-- 底部确认按钮 -->
        <div class="color-picker-footer">
          <a-button @click="colorPickerVisible = false">取消</a-button>
          <a-button type="primary" @click="confirmColorSelection">确定</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 标签详情弹窗 -->
    <a-modal
        v-model:visible="detailModalVisible"
        title="标签详情"
        width="720px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-detail-modal"
    >
      <template v-if="selectedTag">
        <div class="detail-header">
          <div class="detail-title">
            <a-tag :color="selectedTag.color" style="padding: 4px 12px; font-size: 16px;">
              {{ selectedTag.name }}
            </a-tag>
            <a-badge :status="getStatusType(selectedTag.status)" :text="getStatusText(selectedTag.status)"/>
          </div>
        </div>

        <a-divider/>

        <div class="detail-content">
          <div class="detail-section">
            <div class="section-title">
              <info-circle-outlined/>
              <span>基本信息</span>
            </div>
            <div class="detail-info-table">
              <div class="detail-info-row">
                <div class="detail-label">ID</div>
                <div class="detail-value">{{ selectedTag.id }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">创建时间</div>
                <div class="detail-value">{{ formatDateTime(selectedTag.createTime) }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">最后更新</div>
                <div class="detail-value">{{ formatDateTime(selectedTag.updateTime) }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">引用次数</div>
                <div class="detail-value">{{ selectedTag.referenceCount }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">颜色代码</div>
                <div class="detail-value">
                  <div class="color-display-wrapper">
                    <div class="color-square" :style="{ backgroundColor: selectedTag.color }"></div>
                    <span class="color-code">{{ selectedTag.color }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <file-text-outlined/>
              <span>描述信息</span>
            </div>
            <div class="detail-description">
              {{ selectedTag.description || '暂无描述' }}
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title collapsible" @click="toggleRelatedContent">
              <link-outlined/>
              <span>关联内容 (TOP 5)</span>
              <div class="collapse-icon">
                <down-outlined v-if="!relatedContentExpanded"/>
                <up-outlined v-else/>
              </div>
            </div>

            <!-- 使用 a-collapse 组件 -->
            <div class="related-content-container" :class="{ 'expanded': relatedContentExpanded }">
              <a-spin :spinning="relatedContentLoading">
                <div v-if="relatedContentExpanded">
                  <a-empty v-if="relatedContent.length === 0" description="暂无关联内容"/>
                  <a-table
                      v-else
                      :columns="relatedColumns"
                      :data-source="relatedContent"
                      :pagination="false"
                      size="small"
                  />
                </div>
              </a-spin>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <a-space>
            <a-button @click="detailModalVisible = false">
              关闭
            </a-button>
            <a-button type="primary" @click="editTag(selectedTag)">
              <template #icon>
                <edit-outlined/>
              </template>
              编辑标签
            </a-button>
          </a-space>
        </div>
      </template>
    </a-modal>

  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  MoreOutlined,
  SaveOutlined,
  CopyOutlined,
  TeamOutlined,
  StopOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined, TagOutlined, WarningOutlined
} from '@ant-design/icons-vue';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  listTagByPageUsingGet,
  createTagUsingPost,
  updateTagUsingPut,
  deleteTagUsingDelete,
  batchDeleteTagsUsingDelete,
  updateTagStatusUsingPut,
  batchUpdateTagStatusUsingPut,
  getTagStatisticsUsingGet,
  getTagRelatedItemsUsingGet,
} from '@/api/biaoqianguanli';
import StatCards from "@/components/common/StatCards.vue";
import DashboardHeader from "@/components/common/DashboardHeader.vue";


// 视图模式
const viewMode = ref('list');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);
const isAllSelected = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === tagData.value.length);
const isIndeterminate = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < tagData.value.length);

// 已选标签数据
const selectedTag = ref(null);
const detailModalVisible = ref(false);
const relatedContentLoading = ref(false);
const relatedContent = ref([]);


// 其他必要的变量和方法
const tagModalVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const tagFormRef = ref(null);

// 控制关联内容是否展开的状态
const relatedContentExpanded = ref(false);

// 排序字段和顺序
const sortField = ref('');
const sortOrder = ref('');

const colorPickerVisible = ref(false);

// 表格数据和加载状态
const loading = ref(false);
const tagData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  // 添加下面的页码大小选项配置
  pageSizeOptions: ['10', '20', '50', '100'],
  // 添加onShowSizeChange回调函数
  onShowSizeChange: (current, size) => {
    pagination.current = 1; // 切换每页条数时，重置为第一页
    pagination.pageSize = size;
    fetchTagData(); // 重新获取数据
  }
});


// 顶部卡片数据
const statCards = ref([]);

// 搜索表单数据
const searchForm = reactive({
  name: '',
  category: undefined,
  status: undefined,
  createTime: [],
});


// 统计信息
const tagStatistics = ref({
  todayCreated: 0,
  weekCount: 0,
  monthCreated: 0,
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  totalUsage: 0,
});

// 标签表单
const tagForm = reactive({
  id: '',
  name: '',
  color: '#1890FF',
  status: 'active',
  description: '',
});

const headerMetrics = computed(() => [
  {
    icon: CalendarOutlined,
    label: '今日创建',
    value: tagStatistics.value.todayCount || 0
  },
  {
    icon: PlusOutlined, // 或者可以使用 UserAddOutlined，取决于图标需求
    label: '本周新增',
    value: tagStatistics.value.weekCount || 0
  },
  {
    icon: WarningOutlined,
    label: '未使用标签',
    value: tagStatistics.value.unusedTag || 0
  }
]);


// 扩展预设颜色数组，添加更多颜色选择
const presetColors = ref([
  '#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1',
  '#13C2C2', '#EB2F96', '#FA541C', '#2F54EB', '#00B96B',
  // 额外添加一些常用颜色
  '#F759AB', '#9254DE', '#D4380D', '#006D75', '#237804',
  '#AD8B00', '#D48806', '#D46B08', '#7CB305', '#389E0D',
  '#08979C', '#096DD9', '#1D39C4', '#531DAB', '#C41D7F'
]);


// 状态选项
const statusOptions = [
  {value: 'active', label: '已启用', tagColor: 'success'},
  {value: 'inactive', label: '已禁用', tagColor: 'danger'},
];

// 创建响应式数据
const tagStats = ref({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  todayCount: 0,
  monthCount: 0,
  weekCount: 0,
  unusedTag: 0,
  totalReferenceCount: 0
});

// 保存上一次统计数据，用于计算环比
const previousStats = reactive({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  todayCount: 0,
  monthCount: 0,
  weekCount: 0,
  unusedTag: 0,
  totalReferenceCount: 0
});

// 标签表单验证规则
const tagRules = {
  name: [
    {required: true, message: '请输入标签名称', trigger: 'blur'},
    {max: 20, message: '标签名称不能超过20个字符', trigger: 'blur'}
  ],
  color: [
    {required: true, message: '请选择标签颜色', trigger: 'change'},
    {
      pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      message: '请输入有效的颜色代码',
      trigger: 'blur'
    }
  ],
  status: [
    {required: true, message: '请选择标签状态', trigger: 'change'}
  ],
};


// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 170,
  },
  {
    title: '标签名称',
    dataIndex: 'name',
    align: 'left',
    width: 150
  },
  {
    title: '颜色',
    dataIndex: 'color',
    align: 'center',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    align: 'left',
    ellipsis: true,
    width: 250
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 170,
    sorter: true
  },
  {
    title: '引用次数',
    dataIndex: 'referenceCount',
    align: 'center',
    width: 100,
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 240,
    className: 'action-column',
    fixed: 'right'
  }
];

// 关联内容表格列定义
const relatedColumns = [
  {
    title: '内容类型',
    dataIndex: 'type',
    align: 'center',
    width: 100,
  },
  {
    title: '内容标题',
    dataIndex: 'title',
    align: 'left',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 170,
  }
];


// 获取标签对应的图标 - 箭头函数
const getTagIcon = (category) => {
  const iconMap = {
    'marketing': 'fund-outlined',
    'analytics': 'area-chart-outlined',
    'design': 'sketch-outlined',
    'user': 'user-outlined',
    'product': 'shopping-outlined',
    'default': 'tag-outlined'
  };

  return iconMap[category] || iconMap.default;
};


// 切换关联内容的展开/折叠状态
const toggleRelatedContent = () => {
  relatedContentExpanded.value = !relatedContentExpanded.value;

  // 如果展开且数据为空，则加载数据
  if (relatedContentExpanded.value && selectedTag.value && relatedContent.value.length === 0) {
    fetchTagRelatedItems(selectedTag.value.id);
  }
};

// 添加颜色选择器相关方法
const openColorPicker = () => {
  colorPickerVisible.value = true;
};

const selectColor = (color) => {
  tagForm.color = color;
};

const confirmColorSelection = () => {
  // 验证颜色代码
  validateColorCode();
  // 关闭选择器
  colorPickerVisible.value = false;
};

const validateColorCode = () => {
  // 简单验证颜色代码
  const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorPattern.test(tagForm.color)) {
    // 如果格式不正确，设置为默认颜色
    if (tagForm.color && !tagForm.color.startsWith('#')) {
      tagForm.color = '#' + tagForm.color;
    }
    // 再次检查并重置无效颜色
    if (!colorPattern.test(tagForm.color)) {
      tagForm.color = '#1890FF';
    }
  }
};


// 创建颜色亮化函数，为卡片顶部渐变效果提供支持 - 箭头函数
const lightenColor = (color, percent) => {
  // 移除可能的 # 前缀
  let hex = color.replace('#', '');

  // 将十六进制转换为 RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // 亮化处理
  r = Math.min(255, Math.floor(r * (100 + percent) / 100));
  g = Math.min(255, Math.floor(g * (100 + percent) / 100));
  b = Math.min(255, Math.floor(b * (100 + percent) / 100));

  // 转回十六进制
  return `#${(r.toString(16).padStart(2, '0'))}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// 获取标签统计信息 - 箭头函数
const fetchTagStatistics = async () => {
  loading.value = true;
  try {
    const response = await getTagStatisticsUsingGet();
    console.log('统计数据响应:', response);

    if (response?.data?.code === 200 && response?.data?.data) {
      // 获取数据
      const statsData = response.data.data;

      // 保存前一次数据用于环比计算
      Object.assign(previousStats, tagStats.value);

      // 更新当前数据 - tagStats 用于中间部分的卡片
      tagStats.value = {
        totalCount: statsData.totalCount || 0,
        activeCount: statsData.activeCount || 0,
        inactiveCount: statsData.inactiveCount || 0,
        todayCount: statsData.todayCount || 0,
        monthCount: statsData.monthCount || 0,
        weekCount: statsData.weekCount || 0,
        unusedTag: statsData.unusedTag || 0,
        totalReferenceCount: statsData.totalReferenceCount || 0
      };

      // 更新顶部指标数据 - tagStatistics 用于顶部指标
      tagStatistics.value = {
        todayCount: statsData.todayCount || 0,
        weekCount: statsData.weekCount || 0,
        monthCount: statsData.monthCount || 0,
        totalCount: statsData.totalCount || 0,
        activeCount: statsData.activeCount || 0,
        inactiveCount: statsData.inactiveCount || 0,
        totalReferenceCount: statsData.totalReferenceCount || 0,
        unusedTag: statsData.unusedTag || 0
      };

      // 初始化统计卡片数据
      initStatCards();
    } else {
      message.error('获取标签统计数据失败');
    }
  } catch (error) {
    console.error('获取标签统计数据出错:', error);
    message.error('获取标签统计数据出错');
  } finally {
    loading.value = false;
  }
};

// 初始化统计卡片数据 - 箭头函数
const initStatCards = () => {
  statCards.value = [
    {
      title: '标签总数',
      value: tagStats.value.totalCount,
      change: calculateChange(tagStats.value.totalCount, previousStats.totalCount),
      color: 'purple',
      icon: 'TagOutlined'
    },
    {
      title: '本月新增',
      value: tagStats.value.monthCount,
      change: calculateChange(tagStats.value.monthCount, previousStats.monthCount),
      color: 'blue',
      icon: 'PlusOutlined'
    },
    {
      title: '活跃标签',
      value: tagStats.value.activeCount,
      change: calculateChange(tagStats.value.activeCount, previousStats.activeCount),
      color: 'green',
      icon: 'CheckCircleOutlined'
    },
    {
      title: '未使用标签',
      value: tagStats.value.unusedTag,
      change: calculateChange(tagStats.value.unusedTag, previousStats.unusedTag),
      color: 'gold',
      icon: 'WarningOutlined'
    }
  ];
};

// 计算环比变化 - 箭头函数
const calculateChange = (current, previous) => {
  if (previous === 0) return 0;
  return Math.round((current - previous) / previous * 100);
};


// 获取标签数据 - 箭头函数
const fetchTagData = async () => {
  loading.value = true;

  try {
    // 构建查询参数
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      status: searchForm.status || undefined,
      createTimeStart: searchForm.createTime?.[0] ? dayjs(searchForm.createTime[0]).format('YYYY-MM-DD 00:00:00') : undefined,
      createTimeEnd: searchForm.createTime?.[1] ? dayjs(searchForm.createTime[1]).format('YYYY-MM-DD 23:59:59') : undefined,
    };

    // 处理排序
    if (sortField.value && sortOrder.value) {
      params.sortField = sortField.value;
      params.sortOrder = sortOrder.value;
    }

    const response = await listTagByPageUsingGet(params);

    if (response.data.code === 200 && response.data) {
      tagData.value = response.data.data.records || [];
      pagination.total = response.data.data.total || 0;
    } else {
      message.error(response.data.message || '获取标签数据失败');
    }
  } catch (error) {
    console.error('获取标签数据异常:', error);
    message.error('获取标签数据发生异常');
  } finally {
    loading.value = false;
  }
};


// 获取状态类型 - 箭头函数
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'error'
  };
  return statusMap[status] || 'default';
};

// 获取状态文本 - 箭头函数
const getStatusText = (status) => {
  const statusMap = {
    active: '已启用',
    inactive: '已禁用'
  };
  return statusMap[status] || '未知状态';
};


// 格式化日期时间 - 箭头函数
const formatDateTime = (timestamp, dateOnly = false) => {
  if (!timestamp) return '未设置';
  return dayjs(timestamp).format(dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

// 搜索处理 - 箭头函数
const handleSearch = () => {
  pagination.current = 1;
  fetchTagData();
};

// 重置搜索表单 - 箭头函数
const resetSearchForm = () => {
  searchForm.name = '';
  searchForm.status = undefined;
  searchForm.createTime = [];
  sortField.value = '';
  sortOrder.value = '';

  // 重新获取数据
  pagination.current = 1;
  fetchTagData();

  message.success('搜索条件已重置');
};

// 刷新表格数据 - 箭头函数
const handleRefresh = () => {
  fetchTagData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
};

// 表格选择变化 - 箭头函数
const onSelectChange = (selected) => {
  selectedRowKeys.value = selected;
};

// 选择所有改变 - 箭头函数
const onSelectAllChange = (e) => {
  if (e.target.checked) {
    selectedRowKeys.value = tagData.value.map(item => item.id);
  } else {
    selectedRowKeys.value = [];
  }
};

// 切换标签选择 - 箭头函数
const toggleTagSelection = (id) => {
  const index = selectedRowKeys.value.indexOf(id);
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1);
  } else {
    selectedRowKeys.value.push(id);
  }
};

// 表格变化处理 - 箭头函数
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    sortField.value = sorter.field;
    sortOrder.value = sorter.order === 'ascend' ? 'asc' : 'desc';
  } else {
    sortField.value = '';
    sortOrder.value = '';
  }

  fetchTagData();
};

// 页面变化 - 箭头函数
const onPageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchTagData();
};

// 每页条数变化 - 箭头函数
const onShowSizeChange = (current, size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchTagData();
};

// 打开创建标签模态框 - 箭头函数
const openCreateModal = () => {
  // 重置表单
  tagForm.id = '';
  tagForm.name = '';
  tagForm.color = '#1890FF';
  tagForm.category = 'content';
  tagForm.status = 'active';
  tagForm.description = '';

  isEditing.value = false;
  tagModalVisible.value = true;
};

// 编辑标签 - 箭头函数
const editTag = (record) => {
  // 复制标签数据到编辑表单
  Object.keys(tagForm).forEach(key => {
    if (key in record) {
      tagForm[key] = record[key];
    }
  });

  isEditing.value = true;
  tagModalVisible.value = true;

  // 如果详情模态框打开，关闭它
  if (detailModalVisible.value) {
    detailModalVisible.value = false;
  }
};

// 处理标签提交 - 箭头函数
const handleTagSubmit = () => {
  tagFormRef.value.validate()
      .then(async () => {
        submitLoading.value = true;

        try {
          let response;

          if (isEditing.value) {
            // 更新标签
            const updateRequest = {
              id: tagForm.id,
              name: tagForm.name,
              color: tagForm.color,
              description: tagForm.description,
              status: tagForm.status
            };

            response = await updateTagUsingPut(updateRequest);

            if (response.data.code === 200 && response.data) {
              message.success('标签信息已更新');
              tagModalVisible.value = false;
              fetchTagData();
            } else {
              message.error(response.data.message || '更新标签失败');
            }
          } else {
            // 创建标签
            const createRequest = {
              name: tagForm.name,
              color: tagForm.color,
              description: tagForm.description,
              status: tagForm.status
            };

            response = await createTagUsingPost(createRequest);

            if (response.data.code === 200 && response.data) {
              message.success('标签创建成功');
              tagModalVisible.value = false;
              fetchTagData();
              fetchTagStatistics();
            } else {
              message.error(response.data.message || '创建标签失败');
            }
          }
        } catch (error) {
          console.error(isEditing.value ? '更新标签异常:' : '创建标签异常:', error);
          message.error(isEditing.value ? '更新标签发生异常' : '创建标签发生异常');
        } finally {
          submitLoading.value = false;
        }
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};

// 取消标签编辑 - 箭头函数
const handleTagCancel = () => {
  tagModalVisible.value = false;
};

// 查看标签详情 - 箭头函数
const viewTagDetails = async (record) => {
  selectedTag.value = record;
  detailModalVisible.value = true;
  relatedContentExpanded.value = false;
};


// 获取标签关联内容 - 箭头函数
const fetchTagRelatedItems = async (tagId) => {
  relatedContentLoading.value = true;
  try {
    const response = await getTagRelatedItemsUsingGet({
      tagId: tagId,
      pageNum: 1,
      pageSize: 5
    });

    // 修改这里的数据处理逻辑
    if (response.data.code === 200 && response.data.data) {
      relatedContent.value = response.data.data.records || [];
    } else {
      relatedContent.value = [];
      console.error('获取标签关联内容失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('获取标签关联内容异常:', error);
    relatedContent.value = [];
  } finally {
    relatedContentLoading.value = false;
  }
};

// 复制标签 - 箭头函数
const copyTag = (record) => {
  // 创建一个标签副本，但设置为新建状态
  const tagCopy = {...record};
  delete tagCopy.id;
  tagCopy.name = `${tagCopy.name}_复制`;
  tagCopy.usageCount = 0;

  // 填充到表单
  Object.keys(tagForm).forEach(key => {
    if (key in tagCopy) {
      tagForm[key] = tagCopy[key];
    }
  });

  isEditing.value = false;
  tagModalVisible.value = true;

  message.success('已复制标签，请保存以创建新标签');
};

// 显示删除确认对话框 - 箭头函数
const showDeleteConfirm = (record) => {
  Modal.confirm({
    title: '确定要删除此标签吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteTag(record.id);
    }
  });
};

// 删除标签 - 箭头函数
const deleteTag = async (id) => {
  loading.value = true;

  try {
    const response = await deleteTagUsingDelete({id});

    if (response.data.code === 200 && response.data) {
      message.success('标签已删除');

      // 如果删除的是当前选中的标签，则清除选中状态
      if (selectedRowKeys.value.includes(id)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id);
      }

      // 如果详情模态框显示的是当前删除的标签，关闭它
      if (detailModalVisible.value && selectedTag.value && selectedTag.value.id === id) {
        detailModalVisible.value = false;
      }

      // 重新获取数据
      fetchTagData();
      fetchTagStatistics();
    } else {
      message.error(response.data.message || '删除标签失败');
    }
  } catch (error) {
    console.error('删除标签异常:', error);
    message.error('删除标签发生异常');
  } finally {
    loading.value = false;
  }
};

// 批量删除标签 - 箭头函数
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的标签');
    return;
  }

  Modal.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 个标签吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      loading.value = true;

      try {
        const response = await batchDeleteTagsUsingDelete({
          ids: selectedRowKeys.value
        });

        if (response.data.code === 200 && response.data) {
          message.success(`已批量删除 ${selectedRowKeys.value.length} 个标签`);
          selectedRowKeys.value = [];
          fetchTagData();
          fetchTagStatistics();
        } else {
          message.error(response.data.message || '批量删除标签失败');
        }
      } catch (error) {
        console.error('批量删除标签异常:', error);
        message.error('批量删除标签发生异常');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 批量启用标签 - 箭头函数
const handleBatchEnable = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要启用的标签');
    return;
  }

  loading.value = true;

  try {
    const response = await batchUpdateTagStatusUsingPut({
      ids: selectedRowKeys.value,
      status: 'active'
    });

    if (response.data.code === 200 && response.data) {
      message.success(`已启用 ${selectedRowKeys.value.length} 个标签`);
      fetchTagData();
    } else {
      message.error(response.data.message || '批量启用标签失败');
    }
  } catch (error) {
    console.error('批量启用标签异常:', error);
    message.error('批量启用标签发生异常');
  } finally {
    loading.value = false;
  }
};

// 批量禁用标签 - 箭头函数
const handleBatchDisable = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要禁用的标签');
    return;
  }

  loading.value = true;

  try {
    const response = await batchUpdateTagStatusUsingPut({
      ids: selectedRowKeys.value,
      status: 'inactive'
    });

    if (response.data.code === 200 && response.data) {
      message.success(`已禁用 ${selectedRowKeys.value.length} 个标签`);
      fetchTagData();
    } else {
      message.error(response.data.message || '批量禁用标签失败');
    }
  } catch (error) {
    console.error('批量禁用标签异常:', error);
    message.error('批量禁用标签发生异常');
  } finally {
    loading.value = false;
  }
};

// 切换标签状态 - 箭头函数
const toggleTagStatus = async (record) => {
  loading.value = true;
  console.log('当前标签状态:', record.status); // 添加日志

  const newStatus = record.status === 'active' ? 'inactive' : 'active';
  console.log('即将更新为的状态:', newStatus); // 添加日志

  try {
    // 确保请求结构正确
    const requestData = {
      id: record.id,
      status: newStatus
    };

    const response = await updateTagStatusUsingPut(requestData);

    // 增加详细的响应日志
    console.log('状态更新响应:', response);

    // 更全面的响应结构检查
    if (response.data && response.data.code === 200) {
      message.success(`标签已${newStatus === 'active' ? '启用' : '禁用'}`);
      fetchTagData(); // 刷新数据
    } else {
      // 显示更详细的错误信息
      const errorMsg = response.data?.message || response.data.message || `${newStatus === 'active' ? '启用' : '禁用'}标签失败`;
      message.error(errorMsg);
    }
  } catch (error) {
    console.error('更新标签状态异常:', error);
    message.error('更新标签状态发生异常: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchTagStatistics();
  fetchTagData();
});
</script>

<style scoped>
/* 全局容器样式 */
.tag-management-container {
  padding: 16px;
}

/* 数据统计卡片样式 start */
.stat-cards {
  margin-bottom: 32px;
}

/* 调整搜索表单卡片的间距 */
.search-form-card {
  margin-bottom: 32px;
  padding: 4px 0;
}

/* 调整操作按钮区域的间距 */
.operation-bar {
  margin-bottom: 32px;
  padding: 8px 0;
}

/* 给表格添加一些顶部间距 */
.a-table {
  margin-top: 8px;
}

/* 调整表格的内部单元格间距 */
:deep(.ant-table-cell) {
  padding: 14px 16px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
  border: none;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6554C0, #9F44D3);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(101, 84, 192, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  position: relative;
  overflow: hidden;
}

.icon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0.8;
  z-index: 1;
}

.icon-container .anticon {
  position: relative;
  z-index: 2;
}

.bg-purple {
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
}

.bg-blue {
  background: linear-gradient(135deg, #1890FF 0%, #36CEFF 100%);
}

.bg-green {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
}

.bg-gold {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  line-height: 1.1;
  margin-bottom: 8px;
  position: relative;
}

.stat-title {
  font-size: 15px;
  color: #8C8C8C;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-change {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

.increase {
  color: #52C41A;
  background-color: rgba(82, 196, 26, 0.1);
}

.decrease {
  color: #F5222D;
  background-color: rgba(245, 34, 45, 0.1);
}

.stat-change .anticon {
  margin-right: 4px;
}

/* 装饰元素容器 */
.card-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 120px;
  height: 120px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  opacity: 0.08;
}

/* 装饰形状 - 圆形 */
.decoration-shape {
  position: absolute;
  bottom: -60px;
  right: -60px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transform: scale(1);
  transition: transform 0.3s ease;
}

/* 悬停时的动画效果 */
.tag-card:hover .decoration-shape {
  transform: scale(1.1);
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
}

.circle-1 {
  width: 140px;
  height: 140px;
  right: -70px;
  top: -70px;
  background: rgba(101, 84, 192, 0.05);
}

.circle-2 {
  width: 80px;
  height: 80px;
  right: 20px;
  bottom: -40px;
  background: rgba(101, 84, 192, 0.03);
}

.decoration-line {
  position: absolute;
  background: rgba(101, 84, 192, 0.05);
}

.line-1 {
  width: 2px;
  height: 60px;
  transform: rotate(45deg);
  right: 30px;
  bottom: 20px;
}

.line-2 {
  width: 80px;
  height: 2px;
  transform: rotate(45deg);
  right: -20px;
  bottom: 50px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.stat-card:hover .stat-value {
  animation: pulse 1s ease infinite;
}

.icon-container {
  transition: all 0.3s ease;
}

.stat-card:hover .icon-container {
  transform: rotate(10deg);
}

/* end */

/* 优化的搜索表单样式 */
.search-form-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form-container {
  width: 100%;
}

.search-form {
  width: 100%;
}

.search-form-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}

/* 确保表单项有合适的间距 */
.search-form-items .ant-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

/* 确保查询和重置按钮保持水平排列 */
.search-buttons {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

/* 搜索按钮样式 */
.search-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.search-button:hover, .search-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.operation-left, .operation-right {
  display: flex;
  align-items: center;
}

/* 标签颜色显示 */
.tag-color-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
}

/* 卡片容器样式优化 */
.tag-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0;
}

.tag-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(101, 84, 192, 0.12);
  border-color: rgba(101, 84, 192, 0.2);
}

/* 卡片顶部彩色条带 */
.tag-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--tag-color), var(--tag-color-light));
}

/* 卡片标签样式 */
.tag-label {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

/*区分不同的样式*/
.tag-label-active {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52C41A;
}

.tag-label-inactive {
  background-color: rgba(245, 34, 45, 0.1);
  color: #F5222D;
}


/* 卡片标题区域 */
.tag-card-title {
  padding: 20px 20px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
}

.tag-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

/* 卡片内容区域 */
.tag-card-content {
  padding: 0 20px 16px;
  flex-grow: 1;
}

.tag-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 卡片元信息区域 */
.tag-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tag-create-info {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 去除更多按钮的黑色边框 - 更精确的选择器 */
button.ant-btn,
.ant-btn:focus,
.ant-btn-icon-only,
button[class*="ant-dropdown-trigger"],
:deep(.ant-btn),
:deep(.ant-btn:focus),
:deep(.ant-btn-icon-only),
:deep(.ant-dropdown-trigger) {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

/* 确保覆盖所有可能的状态 */
:deep(.ant-dropdown-trigger):hover,
:deep(.ant-dropdown-trigger):focus,
:deep(.ant-dropdown-trigger):active,
:deep(.ant-btn):hover,
:deep(.ant-btn):focus,
:deep(.ant-btn):active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* 特别针对卡片中的操作按钮 */
.operation-right .ant-radio-button-wrapper:focus-within,
.tag-action-btn,
.tag-action-btn:focus,
.tag-action-btn:active,
.tag-actions button,
.tag-actions button:focus,
.tag-actions button:active {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

/* 卡片操作按钮区域 */
.tag-actions {
  display: flex;
  gap: 4px;
}

.tag-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  color: #999;
  background: transparent;
  transition: all 0.2s;
}

.tag-action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #6554C0;
}

/* 增加卡片选中状态样式 */
.tag-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 3px rgba(101, 84, 192, 0.2);
}

/* 添加卡片底部装饰元素 */
.card-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 80px;
  height: 80px;
  opacity: 0.04;
  pointer-events: none;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom right;
}

/* 标签管理专用样式 - 使用tm-前缀避免冲突 */
.tm-page-container {
  padding: 0; /* 移除内边距，让子元素决定间距 */
}

.tm-header {
  background: linear-gradient(135deg, #ffffff 0%, #f6f5ff 100%);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(101, 84, 192, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tm-header-left {
  display: flex;
  align-items: center;
}

.tm-icon-container {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(101, 84, 192, 0.2);
}

.tm-icon {
  font-size: 28px;
  color: white;
}

.tm-header-info {
  display: flex;
  flex-direction: column;
}

.tm-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.tm-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tm-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.tm-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tm-metrics {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tm-metric-item {
  padding: 0 16px;
  position: relative;
}

.tm-divider {
  width: 1px;
  height: 24px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.tm-metric-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.tm-metric-label .anticon {
  margin-right: 6px;
}

.tm-metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 自定义标签弹窗样式 */
.custom-tag-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-tag-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-tag-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-tag-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-tag-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 自定义详情弹窗样式 */
.custom-detail-modal :deep(.ant-modal-header) {
  background-color: #f9f9f9;
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-detail-modal :deep(.ant-modal-title) {
  font-weight: 600;
  font-size: 18px;
}

.custom-detail-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-detail-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 模态框头部样式 */
.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 0 4px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(101, 84, 192, 0.2);
}

.header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-title p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #888;
}

/* 整合表单样式 */
.integrated-form {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.form-column {
  flex: 1;
  min-width: 0; /* 确保弹性子项可以收缩 */
}

/* 更新颜色选择器样式 */
.color-selector-wrapper {
  width: 100%;
  position: relative;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .color-presets {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 992px) {
  .color-presets {
    grid-template-columns: repeat(8, 1fr);
  }
}

.color-preset-item {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.color-preset-item:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.color-preset-item.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white, 0 0 0 4px #6554C0;
}

.color-picker-trigger {
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border: 1px dashed #d9d9d9;
}

.color-picker-trigger:hover {
  background: #f0f0f0;
  color: #6554C0;
  border-color: #6554C0;
}

.color-input-container {
  width: 100%;
  margin-top: 8px;
}

.color-input {
  width: 100%;
}

.color-display {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 4px;
}

/* 高级颜色选择器样式 */
.advanced-color-picker-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  margin-top: 8px;
  width: 100%;
  max-width: 320px;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-header span {
  font-weight: 500;
  color: #333;
}

/* 确保 vue-color 的选择器正确显示 */
.advanced-color-picker-container :deep(.vc-sketch) {
  width: 100% !important;
  padding: 10px !important;
  box-shadow: none !important;
}

/* 标签预览样式优化 */
.tag-preview {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;
}

.preview-header {
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.preview-content {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  background: white;
}

/* 响应式调整 */
@media (max-width: 720px) {
  .integrated-form {
    flex-direction: column;
    gap: 0;
  }

  .form-column {
    width: 100%;
  }

  .color-presets {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 480px) {
  .color-presets {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 颜色选择器样式优化 */
.color-selector-wrapper {
  width: 100%;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.color-preset-item {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.color-preset-item:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.color-preset-item.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white, 0 0 0 4px #6554C0;
}

.color-input-container {
  width: 100%;
  margin-top: 8px;
}

.color-input {
  width: 100%;
}

.color-display {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 4px;
}

/* 标签预览样式 */
.tag-preview {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.preview-content {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  background: white;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 标签详情样式 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-category {
  display: flex;
}

.detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.section-title .anticon {
  margin-right: 8px;
  color: #6554C0;
}

.detail-info-table {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.detail-info-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-info-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #333;
}

.color-square {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

.detail-description {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #333;
  line-height: 1.6;
}

.color-display-wrapper {
  display: flex;
  align-items: center;
}

.color-square {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: inline-block;
  margin-right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-code {
  font-family: monospace;
  font-size: 14px;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 网格视图容器样式 */
.grid-view-container {
  margin-bottom: 24px;
}

.grid-header {
  margin-bottom: 16px;
}

.grid-selection {
  display: flex;
  align-items: center;
  background: #f0f8ff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.selected-count {
  margin-left: 12px;
  color: #666;
}

.grid-pagination-bottom {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}


/* 添加折叠相关的样式 */
.collapsible {
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.collapsible:hover {
  background-color: #f0f0f0;
}

.collapse-icon {
  font-size: 14px;
  color: #999;
}

.related-content-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.related-content-container.expanded {
  max-height: 500px; /* 足够大的高度以容纳内容 */
  transition: max-height 0.5s ease-in;
}

/* 当没有数据时的样式 */
.no-data-message {
  padding: 16px;
  text-align: center;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 8px;
}


/* 紧凑型弹窗总体样式 */
.compact-tag-modal :deep(.ant-modal-body) {
  padding: 16px 24px;
}

/* 紧凑型表单样式 */
.compact-form .ant-form-item {
  margin-bottom: 16px;
}

/* 紧凑型弹窗头部 */
.modal-header-compact {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header-compact .header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6554C0 0%, #9F44D3 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
}

.modal-header-compact .header-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-header-compact .header-title p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #888;
}

/* 三列布局表单 */
.integrated-form-compact {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.integrated-form-compact .form-column {
  flex: 1;
  min-width: 0;
}

/* 颜色选择器紧凑布局 */
.color-selector-compact {
  margin-bottom: 16px;
}

.color-preset-grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 8px;
}

.color-preset-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-preset-item:hover {
  transform: scale(1.1);
}

.color-preset-item.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white, 0 0 0 3px #6554C0;
}

/* 颜色显示行 */
.color-display-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
}

.color-input {
  flex: 1;
}

.color-picker-button {
  padding: 0 10px;
}

/* 紧凑型标签预览 */
.tag-preview-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

/* 紧凑型表单底部 */
.form-footer-compact {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 8px;
}


/* 高级颜色选择器样式 */
.advanced-color-selector {
  padding: 16px 8px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.color-grid-item {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.color-grid-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-grid-item.active {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px white, 0 0 0 4px #6554C0;
}

.custom-color-input {
  margin-bottom: 20px;
}

.color-input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.color-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.color-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 修复颜色选择按钮样式 */
.color-form-item .ant-form-item-control-input {
  min-height: auto;
}

.color-picker-button {
  color: #666;
  transition: all 0.3s;
}

.color-picker-button:hover {
  color: #6554C0;
}

.color-picker-modal :deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
}

.color-picker-modal :deep(.ant-modal-body) {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 720px) {
  .integrated-form-compact {
    flex-direction: column;
    gap: 0;
  }

  .color-preset-grid {
    grid-template-columns: repeat(10, 1fr);
  }
}

@media (max-width: 480px) {
  .color-preset-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .tm-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tm-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .tm-metrics {
    width: 100%;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .tm-metric-item {
    padding: 0 10px;
  }

  .tm-metric-value {
    font-size: 16px;
  }

  .tm-title {
    font-size: 20px;
  }

  .custom-tag-modal, .custom-detail-modal {
    width: 95% !important;
    max-width: 500px;
  }
}

@media (max-width: 576px) {
  .tm-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .tm-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .tm-divider {
    display: none;
  }

  .tm-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }
}
</style>