<template>
  <div class="tag-management-container">
    <div class="tm-page-container">
      <!-- 标签管理页面标题区域 -->
      <div class="tm-header">
        <div class="tm-header-left">
          <div class="tm-icon-container">
            <tag-outlined class="tm-icon"/>
          </div>
          <div class="tm-header-info">
            <div class="tm-title-row">
              <h1 class="tm-title">标签管理</h1>
              <a-tag color="#6554C0">内容管理</a-tag>
            </div>
            <p class="tm-description">
              管理系统标签资源，支持创建、分类、批量操作以及使用情况追踪
            </p>
          </div>
        </div>

        <div class="tm-header-right">
          <div class="tm-metrics">
            <div class="tm-metric-item">
              <div class="tm-metric-label">
                <calendar-outlined/>
                今日创建
              </div>
              <div class="tm-metric-value">14</div>
            </div>
            <div class="tm-divider"></div>
            <div class="tm-metric-item">
              <div class="tm-metric-label">
                <team-outlined/>
                本周新增
              </div>
              <div class="tm-metric-value">46</div>
            </div>
            <div class="tm-divider"></div>
            <div class="tm-metric-item">
              <div class="tm-metric-label">
                <link-outlined/>
                引用总数
              </div>
              <div class="tm-metric-value">2.3k</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 顶部卡片统计信息 -->
    <div class="stat-cards">
      <a-row :gutter="16">
        <a-col :span="6" v-for="(card, index) in statCards" :key="index">
          <a-card class="stat-card" :body-style="{ padding: '24px' }">
            <div class="card-content">
              <div class="icon-container" :class="`bg-${card.color}`">
                <component :is="card.icon"/>
                <div class="icon-ring"></div>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ card.title }}</div>
                <div class="stat-value">{{ card.value }}
                  <span class="stat-trend">
                <trend-badge :value="card.change"/>
              </span>
                </div>
                <div class="stat-change" :class="{ 'increase': card.change > 0, 'decrease': card.change < 0 }">
                  <arrow-up-outlined v-if="card.change > 0"/>
                  <arrow-down-outlined v-if="card.change < 0"/>
                  {{ Math.abs(card.change) }}% 较上月
                </div>
              </div>
              <div class="card-decoration">
                <div class="decoration-circle circle-1"></div>
                <div class="decoration-circle circle-2"></div>
                <div class="decoration-line line-1"></div>
                <div class="decoration-line line-2"></div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 标签名称 -->
            <a-form-item label="标签名称" name="tagName">
              <a-input v-model:value="searchForm.tagName" placeholder="请输入标签名称" allowClear/>
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
                <a-select-option value="inactive">未启用</a-select-option>
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
              <a-button type="primary" html-type="submit" class="search-button">
                <search-outlined/>
                查询
              </a-button>
              <a-button @click="resetSearchForm" class="reset-button">
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
          <a-button @click="handleRefresh">
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

          <!-- 引用次数列 -->
          <template v-if="column.dataIndex === 'usageCount'">
            <a-badge :count="record.usageCount" :number-style="{ backgroundColor: '#52C41A' }"/>
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
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
                    <a-menu-item key="1" @click="viewTagDetails(record)">
                      <eye-outlined/>
                      查看详情
                    </a-menu-item>
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
            <div
                class="tag-card"
                :class="{ 'tag-card-selected': selectedRowKeys.includes(tag.id) }"
                @click="toggleTagSelection(tag.id)"
            >
              <div class="tag-card-header">
                <a-checkbox :checked="selectedRowKeys.includes(tag.id)" @click.stop/>
                <a-badge :status="getStatusType(tag.status)" :text="getStatusText(tag.status)"/>
              </div>
              <div class="tag-card-body">
                <div class="tag-display">
                  <a-tag
                      :color="tag.color"
                      style="margin: 0; padding: 4px 12px; font-size: 14px;"
                  >
                    {{ tag.name }}
                  </a-tag>
                </div>
              </div>
              <div class="tag-card-footer">
                <div class="tag-create-info">创建于: {{ formatDateTime(tag.createTime) }}</div>
                <div class="tag-actions">
                  <a-button type="link" size="small" @click.stop="editTag(tag)">
                    <edit-outlined/>
                  </a-button>
                  <a-button
                      type="link"
                      size="small"
                      @click.stop="toggleTagStatus(tag)"
                      :style="{ color: tag.status === 'active' ? '#ff4d4f' : '#52C41A' }"
                  >
                    <component :is="tag.status === 'active' ? 'stop-outlined' : 'check-circle-outlined'"/>
                  </a-button>
                  <a-dropdown>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1" @click.stop="viewTagDetails(tag)">
                          <eye-outlined/>
                          查看详情
                        </a-menu-item>
                        <a-menu-item key="2" @click.stop="copyTag(tag)">
                          <copy-outlined/>
                          复制
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item key="3" danger @click.stop="showDeleteConfirm(tag)">
                          <delete-outlined/>
                          删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                    <a-button type="link" size="small" @click.stop>
                      <more-outlined/>
                    </a-button>
                  </a-dropdown>
                </div>
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

    <!-- 新建/编辑标签弹窗 -->
    <a-modal
        v-model:visible="tagModalVisible"
        :title="isEditing ? '编辑标签' : '新建标签'"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-tag-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <component :is="isEditing ? EditOutlined : PlusOutlined"/>
        </div>
        <div class="header-title">
          <h2>{{ isEditing ? '编辑标签信息' : '创建新标签' }}</h2>
          <p>{{ isEditing ? '修改标签的基本信息和分类等配置' : '创建一个新的标签，用于内容分类和组织' }}</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="tagForm"
          :rules="tagRules"
          ref="tagFormRef"
          layout="vertical"
      >
        <div class="tag-tabs">
          <div class="tab-item" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">
            <tag-outlined/>
            <span>基本信息</span>
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
            <setting-outlined/>
            <span>标签设置</span>
          </div>
        </div>

        <div class="form-content">
          <!-- 基本信息面板 -->
          <div v-show="activeTab === 'basic'" class="tab-panel">
            <a-form-item label="标签名称" name="name">
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

            <a-form-item label="标签分类" name="category">
              <a-select
                  v-model:value="tagForm.category"
                  placeholder="请选择标签分类"
                  :options="categoryOptions"
              >
                <template #suffixIcon>
                  <appstore-outlined/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="标签描述" name="description">
              <a-textarea
                  v-model:value="tagForm.description"
                  placeholder="请输入标签描述信息（选填）"
                  :rows="4"
                  :maxLength="200"
                  :showCount="true"
              />
            </a-form-item>
          </div>

          <!-- 标签设置面板 -->
          <div v-show="activeTab === 'settings'" class="tab-panel">
            <a-form-item label="标签颜色" name="color">
              <div class="color-selector-wrapper">
                <div class="color-presets">
                  <template v-for="color in presetColors" :key="color">
                    <div
                        class="color-preset-item"
                        :class="{ active: tagForm.color === color }"
                        :style="{ backgroundColor: color }"
                        @click="tagForm.color = color"
                    ></div>
                  </template>
                </div>
                <div class="color-input-container">
                  <a-input
                      v-model:value="tagForm.color"
                      placeholder="#颜色代码"
                      class="color-input"
                  >
                    <template #prefix>
                      <div class="color-display" :style="{ backgroundColor: tagForm.color }"></div>
                    </template>
                  </a-input>
                </div>
              </div>
            </a-form-item>

            <a-form-item label="标签状态" name="status">
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
        </div>

        <a-form-item label="标签预览">
          <div class="tag-preview">
            <div class="preview-header">预览效果</div>
            <div class="preview-content">
              <a-tag :color="tagForm.color" style="margin: 0; padding: 6px 16px; font-size: 16px;">
                {{ tagForm.name || '标签预览' }}
              </a-tag>
            </div>
          </div>
        </a-form-item>

        <div class="form-footer">
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
          <div class="detail-category">
            <a-tag :color="getCategoryColor(selectedTag.category)">
              {{ getCategoryName(selectedTag.category) }}
            </a-tag>
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
                <div class="detail-value">{{ selectedTag.usageCount }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">颜色代码</div>
                <div class="detail-value">
                  <div class="color-display">
                    <div class="color-square" :style="{ backgroundColor: selectedTag.color }"></div>
                    <span>{{ selectedTag.color }}</span>
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
            <div class="section-title">
              <bar-chart-outlined/>
              <span>使用情况</span>
            </div>
            <div class="usage-graph">
              <div class="usage-header">
                <span>最近30天引用趋势</span>
              </div>
              <div class="usage-chart">
                <!-- 这里可以放趋势图表，示例中用简单的条状图展示 -->
                <div class="bar-chart">
                  <div v-for="(value, index) in usageData" :key="index" class="bar-container">
                    <div class="bar" :style="{ height: `${(value / Math.max(...usageData)) * 150}px` }"></div>
                    <div class="bar-label">{{ index + 1 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <link-outlined/>
              <span>关联内容 (TOP 5)</span>
            </div>
            <a-table
                :columns="relatedColumns"
                :data-source="relatedContent"
                :pagination="false"
                size="small"
            />
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
  computed,
  h
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  MoreOutlined,
  SaveOutlined,
  CopyOutlined,
  TeamOutlined,
  TagOutlined,
  StopOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';
import TrendBadge from "@/components/common/TrendBadge.vue";

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 70,
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
    dataIndex: 'usageCount',
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

// 顶部卡片数据
const statCards = reactive([
  {
    title: '标签总数',
    value: '1,248',
    change: 12.5,
    color: 'purple',
    icon: TagOutlined,
  },
  {
    title: '本月新增',
    value: '143',
    change: 8.2,
    color: 'blue',
    icon: PlusOutlined,
  },
  {
    title: '活跃标签',
    value: '892',
    change: 5.7,
    color: 'green',
    icon: CheckCircleOutlined,
  },
  {
    title: '未使用标签',
    value: '356',
    change: -3.6,
    color: 'gold',
    icon: WarningOutlined,
  },
]);


// 搜索表单数据
const searchForm = reactive({
  tagName: '',
  category: undefined,
  status: undefined,
  createTime: [],
});

// 标签表单
const tagForm = reactive({
  id: '',
  name: '',
  color: '#1890FF',
  status: 'active',
  description: '',
});

// 预设颜色
const presetColors = ref([
  '#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1',
  '#13C2C2', '#EB2F96', '#FA541C', '#2F54EB', '#00B96B'
]);

// 类别选项
const categoryOptions = [
  {value: 'content', label: '内容分类'},
  {value: 'marketing', label: '营销活动'},
  {value: 'product', label: '产品标签'},
  {value: 'user', label: '用户标签'},
  {value: 'feature', label: '功能标记'}
];

// 状态选项
const statusOptions = [
  {value: 'active', label: '已启用', tagColor: 'success'},
  {value: 'inactive', label: '未启用', tagColor: 'warning'}
];

// 其他必要的变量和方法
const tagModalVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const tagFormRef = ref(null);


// 表格数据和加载状态
const loading = ref(false);
const tagData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 视图模式
const viewMode = ref('list');
const activeTab = ref('basic');
// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);
const isAllSelected = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === tagData.value.length);
const isIndeterminate = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < tagData.value.length);

// 已选标签数据
const selectedTag = ref(null);


// 标签表单验证规则
const tagRules = {
  name: [
    {required: true, message: '请输入标签名称', trigger: 'blur'},
    {max: 20, message: '标签名称不能超过20个字符', trigger: 'blur'}
  ],
  color: [
    {required: true, message: '请选择标签颜色', trigger: 'change'}
  ],
  status: [
    {required: true, message: '请选择标签状态', trigger: 'change'}
  ],
};


// 使用情况趋势数据模拟
const usageData = Array.from({length: 30}, () => Math.floor(Math.random() * 100));

// 关联内容数据模拟
const relatedContent = [
  {
    id: 1,
    type: '文章',
    title: '如何提高用户转化率的10个技巧',
    createTime: new Date(2025, 0, 8).getTime()
  },
  {
    id: 2,
    type: '产品',
    title: '智能家居控制系统 v2.0',
    createTime: new Date(2025, 0, 12).getTime()
  },
  {
    id: 3,
    type: '图片',
    title: '产品宣传主视觉图片',
    createTime: new Date(2025, 0, 15).getTime()
  },
  {
    id: 4,
    type: '文档',
    title: '2025年Q1营销策略报告',
    createTime: new Date(2025, 0, 18).getTime()
  },
  {
    id: 5,
    type: '视频',
    title: '新品发布会直播回放',
    createTime: new Date(2025, 0, 20).getTime()
  }
];
// 组件挂载时获取数据
onMounted(() => {
  fetchTagData();
});

// 获取标签数据
function fetchTagData() {
  loading.value = true;

  // 模拟API请求获取标签数据
  setTimeout(() => {
    const data = [
      {
        id: 1,
        name: '热门推荐',
        color: '#F5222D',
        category: 'marketing',
        description: '用于标记热门推荐内容，显示在首页和推荐栏目',
        status: 'active',
        createTime: new Date(2025, 0, 5).getTime(),
        updateTime: new Date(2025, 0, 5).getTime(),
        usageCount: 128
      },
      {
        id: 2,
        name: '新功能',
        color: '#722ED1',
        category: 'feature',
        description: '标记新上线的功能和特性',
        status: 'active',
        createTime: new Date(2025, 0, 6).getTime(),
        updateTime: new Date(2025, 0, 15).getTime(),
        usageCount: 87
      },
      {
        id: 3,
        name: '限时优惠',
        color: '#FAAD14',
        category: 'marketing',
        description: '用于标记限时促销商品',
        status: 'active',
        createTime: new Date(2025, 0, 7).getTime(),
        updateTime: new Date(2025, 0, 7).getTime(),
        usageCount: 95
      },
      {
        id: 4,
        name: '用户指南',
        color: '#52C41A',
        category: 'content',
        description: '标记用户指南和教程类内容',
        status: 'active',
        createTime: new Date(2025, 0, 8).getTime(),
        updateTime: new Date(2025, 0, 8).getTime(),
        usageCount: 43
      },
      {
        id: 5,
        name: '高级会员',
        color: '#1890FF',
        category: 'user',
        description: '标记高级会员专属内容',
        status: 'active',
        createTime: new Date(2025, 0, 9).getTime(),
        updateTime: new Date(2025, 0, 9).getTime(),
        usageCount: 72
      },
      {
        id: 6,
        name: '新品上市',
        color: '#EB2F96',
        category: 'product',
        description: '标记新上市的产品',
        status: 'active',
        createTime: new Date(2025, 0, 10).getTime(),
        updateTime: new Date(2025, 0, 10).getTime(),
        usageCount: 64
      },
      {
        id: 7,
        name: '技术博客',
        color: '#13C2C2',
        category: 'content',
        description: '标记技术博客和专业文章',
        status: 'inactive',
        createTime: new Date(2025, 0, 11).getTime(),
        updateTime: new Date(2025, 0, 11).getTime(),
        usageCount: 39
      },
      {
        id: 8,
        name: '精选案例',
        color: '#FA541C',
        category: 'content',
        description: '标记精选客户案例',
        status: 'active',
        createTime: new Date(2025, 0, 12).getTime(),
        updateTime: new Date(2025, 0, 12).getTime(),
        usageCount: 27
      },
      {
        id: 9,
        name: '即将下线',
        color: '#F5222D',
        category: 'product',
        description: '标记即将下线的产品或功能',
        status: 'inactive',
        createTime: new Date(2025, 0, 13).getTime(),
        updateTime: new Date(2025, 0, 13).getTime(),
        usageCount: 18
      },
      {
        id: 10,
        name: '社区活动',
        color: '#2F54EB',
        category: 'marketing',
        description: '标记社区活动和线下沙龙',
        status: 'active',
        createTime: new Date(2025, 0, 14).getTime(),
        updateTime: new Date(2025, 0, 14).getTime(),
        usageCount: 52
      },
      {
        id: 11,
        name: '新手入门',
        color: '#52C41A',
        category: 'content',
        description: '标记适合新手的入门内容',
        status: 'active',
        createTime: new Date(2025, 0, 15).getTime(),
        updateTime: new Date(2025, 0, 15).getTime(),
        usageCount: 91
      },
      {
        id: 12,
        name: '进阶技巧',
        color: '#722ED1',
        category: 'content',
        description: '标记包含进阶技巧的高级内容',
        status: 'active',
        createTime: new Date(2025, 0, 16).getTime(),
        updateTime: new Date(2025, 0, 16).getTime(),
        usageCount: 63
      }
    ];

    tagData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    active: 'success',
    inactive: 'warning'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    active: '已启用',
    inactive: '未启用'
  };
  return statusMap[status] || '未知状态';
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索过滤
  setTimeout(() => {
    // 过滤条件实现
    const filteredData = tagData.value.filter(tag => {
      let match = true;

      if (searchForm.tagName && !tag.name.includes(searchForm.tagName)) {
        match = false;
      }

      if (searchForm.category && tag.category !== searchForm.category) {
        match = false;
      }

      if (searchForm.status && tag.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.createTime && searchForm.createTime.length === 2) {
        const startTime = searchForm.createTime[0].valueOf();
        const endTime = searchForm.createTime[1].valueOf();
        if (tag.createTime < startTime || tag.createTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    tagData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.tagName = '';
  searchForm.category = undefined;
  searchForm.status = undefined;
  searchForm.createTime = [];

  // 重新获取所有数据
  fetchTagData();

  message.success('搜索条件已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchTagData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 选择所有改变
function onSelectAllChange(e) {
  if (e.target.checked) {
    selectedRowKeys.value = tagData.value.map(item => item.id);
  } else {
    selectedRowKeys.value = [];
  }
}

// 切换标签选择
function toggleTagSelection(id) {
  const index = selectedRowKeys.value.indexOf(id);
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1);
  } else {
    selectedRowKeys.value.push(id);
  }
}

// 表格变化处理
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    tagData.value = [...tagData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }
}

// 页面变化
function onPageChange(page, pageSize) {
  pagination.current = page;
  pagination.pageSize = pageSize;
}

// 每页条数变化
function onShowSizeChange(current, size) {
  pagination.pageSize = size;
  pagination.current = 1;
}

// 打开创建标签模态框
function openCreateModal() {
  // 重置表单
  tagForm.id = '';
  tagForm.name = '';
  tagForm.color = '#1890FF';
  tagForm.category = 'content';
  tagForm.status = 'active';
  tagForm.description = '';

  isEditing.value = false;
  tagModalVisible.value = true;
}

// 编辑标签
function editTag(record) {
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
}

// 处理标签提交
function handleTagSubmit() {
  tagFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          if (isEditing.value) {
            // 更新标签
            const index = tagData.value.findIndex(tag => tag.id === tagForm.id);
            if (index !== -1) {
              tagData.value[index] = {
                ...tagData.value[index],
                ...tagForm,
                updateTime: new Date().getTime()
              };
            }
            message.success('标签信息已更新');
          } else {
            // 创建标签
            const newTag = {
              ...tagForm,
              id: Math.max(...tagData.value.map(tag => tag.id)) + 1,
              createTime: new Date().getTime(),
              updateTime: new Date().getTime(),
              usageCount: 0
            };
            tagData.value.unshift(newTag);
            pagination.total += 1;
            message.success('标签创建成功');
          }

          submitLoading.value = false;
          tagModalVisible.value = false;
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 取消标签编辑
function handleTagCancel() {
  tagModalVisible.value = false;
}

// 查看标签详情
function viewTagDetails(record) {
  selectedTag.value = record;
  detailModalVisible.value = true;
}

// 复制标签
function copyTag(record) {
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
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  window.$modal?.confirm({
    title: '确定要删除此标签吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteTag(record);
    }
  });
}

// 删除标签
function deleteTag(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    tagData.value = tagData.value.filter(tag => tag.id !== record.id);
    pagination.total -= 1;
    loading.value = false;
    message.success('标签已删除');

    // 如果删除的是当前选中的标签，则清除选中状态
    if (selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
    }

    // 如果详情模态框显示的是当前删除的标签，关闭它
    if (detailModalVisible.value && selectedTag.value && selectedTag.value.id === record.id) {
      detailModalVisible.value = false;
    }
  }, 500);
}

// 批量删除标签
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的标签');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 个标签吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        tagData.value = tagData.value.filter(tag => !selectedRowKeys.value.includes(tag.id));
        pagination.total -= selectedRowKeys.value.length;
        selectedRowKeys.value = [];
        loading.value = false;
        message.success('已批量删除标签');
      }, 800);
    }
  });
}

// 批量启用标签
function handleBatchEnable() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要启用的标签');
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    tagData.value = tagData.value.map(tag => {
      if (selectedRowKeys.value.includes(tag.id)) {
        return {...tag, status: 'active', updateTime: new Date().getTime()};
      }
      return tag;
    });

    loading.value = false;
    message.success(`已启用 ${selectedRowKeys.value.length} 个标签`);
  }, 500);
}

// 批量禁用标签
function handleBatchDisable() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要禁用的标签');
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    tagData.value = tagData.value.map(tag => {
      if (selectedRowKeys.value.includes(tag.id)) {
        return {...tag, status: 'inactive', updateTime: new Date().getTime()};
      }
      return tag;
    });

    loading.value = false;
    message.success(`已禁用 ${selectedRowKeys.value.length} 个标签`);
  }, 500);
}

// 切换标签状态
function toggleTagStatus(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = tagData.value.findIndex(tag => tag.id === record.id);
    if (index !== -1) {
      const newStatus = record.status === 'active' ? 'inactive' : 'active';
      tagData.value[index] = {
        ...tagData.value[index],
        status: newStatus,
        updateTime: new Date().getTime()
      };

      message.success(`标签已${newStatus === 'active' ? '启用' : '禁用'}`);
    }

    loading.value = false;
  }, 500);
}
</script>
<style scoped>
/* 全局容器样式 */
.tag-management-container {
  padding: 16px;
}

/* 数据统计卡片样式 start */
.stat-cards {
  margin-bottom: 32px; /* 从原来的24px增加到32px */
}

/* 调整搜索表单卡片的间距 */
.search-form-card {
  margin-bottom: 32px; /* 从原来的24px增加到32px */
  padding: 4px 0; /* 在卡片内部增加上下内边距 */
}

/* 调整操作按钮区域的间距 */
.operation-bar {
  margin-bottom: 32px; /* 从原来的24px增加到32px */
  padding: 8px 0; /* 添加内部上下间距 */
}

/* 给表格添加一些顶部间距 */
.a-table {
  margin-top: 8px;
}

/* 调整表格的内部单元格间距，使内容更加宽松 */
:deep(.ant-table-cell) {
  padding: 14px 16px; /* 增加单元格内部填充 */
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

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
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

/* 标签卡片样式 */
.tag-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tag-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.tag-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.tag-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.tag-display {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}


.tag-usage-count .anticon {
  margin-right: 4px;
  color: #6554C0;
}

.tag-card-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.tag-create-info {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.tag-actions {
  display: flex;
  justify-content: space-around;
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

/* 标签选项卡样式 */
.tag-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  color: #888;
}

.tab-item .anticon {
  margin-right: 8px;
  font-size: 16px;
}

.tab-item.active {
  color: #6554C0;
  border-bottom: 2px solid #6554C0;
  font-weight: 500;
}

.tab-item:hover {
  color: #6554C0;
}

.form-content {
  min-height: 320px;
  margin-bottom: 16px;
}

.tab-panel {
  padding: 8px 0;
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

/* 响应式处理 */
@media (max-width: 768px) {
  .custom-tag-modal {
    width: 95% !important;
    max-width: 600px;
  }
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

  .custom-tag-modal {
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