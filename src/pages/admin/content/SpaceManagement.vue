<template>
  <div class="space-management-container">
    <DashboardHeader
        title="空间管理"
        description="管理系统空间资源，支持创建、分类、权限控制以及使用情况追踪"
        parent-module="内容管理"
        :module-icon="FolderOutlined"
        :metrics="headerMetrics"
    />

    <StatCards :cards="statCards"/>

    <!-- 搜索表单 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 空间名称 -->
            <a-form-item label="空间名称" name="spaceName">
              <a-input v-model:value="searchForm.spaceName" placeholder="请输入空间名称" allowClear/>
            </a-form-item>

            <!-- 空间级别 -->
            <a-form-item label="空间级别" name="spaceLevel">
              <a-select
                  v-model:value="searchForm.spaceLevel"
                  placeholder="请选择级别"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option :value="0">普通版</a-select-option>
                <a-select-option :value="1">专业版</a-select-option>
                <a-select-option :value="2">旗舰版</a-select-option>
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
            新建空间
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-dropdown :disabled="!hasSelected">
            <a-button>
              <database-outlined/>
              批量操作
              <down-outlined/>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="upgrade" @click="handleBatchUpgrade">
                  <upgrade-outlined/> 升级空间
                </a-menu-item>
                <a-menu-item key="export" @click="handleBatchExport">
                  <export-outlined/> 导出数据
                </a-menu-item>
                <a-menu-item key="backup" @click="handleBatchBackup">
                  <save-outlined/> 备份空间
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
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
          :data-source="spaceData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 空间级别列 -->
          <template v-if="column.dataIndex === 'space_level'">
            <a-tag :color="getSpaceLevelColor(record.space_level)">
              {{ getSpaceLevelText(record.space_level) }}
            </a-tag>
          </template>

          <!-- 存储限制列 -->
          <template v-if="column.dataIndex === 'storage_usage'">
            <a-progress
                :percent="calculateStoragePercent(record)"
                :status="getStorageStatus(record)"
                size="small"
            />
            <div class="storage-text">
              {{ formatStorage(record.total_size) }} / {{ formatStorage(record.max_size) }}
            </div>
          </template>

          <!-- 文件数量列 -->
          <template v-if="column.dataIndex === 'file_count'">
            <div class="count-info">
              <div>{{ record.total_count }} / {{ record.max_count }}</div>
              <div class="count-percent">
                {{ calculateCountPercent(record) }}%
              </div>
            </div>
          </template>

          <!-- 创建时间 -->
          <template v-if="column.dataIndex === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewSpaceDetails(record)">
                <eye-outlined/>
                查看
              </a-button>
              <a-button type="link" size="small" @click="editSpace(record)">
                <edit-outlined/>
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="upgradeSpace(record)">
                      <save-outlined/> 升级空间
                    </a-menu-item>
                    <a-menu-item key="2" @click="backupSpace(record)">
                      <save-outlined/> 备份空间
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item key="3" danger @click="showDeleteConfirm(record)">
                      <delete-outlined/> 删除空间
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
          <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6" v-for="space in spaceData" :key="space.id">
            <div
                class="space-card"
                :class="{ 'space-card-selected': selectedRowKeys.includes(space.id) }"
                @click="toggleSpaceSelection(space.id)"
            >
              <div class="space-card-header">
                <a-checkbox :checked="selectedRowKeys.includes(space.id)" @click.stop/>
                <a-tag :color="getSpaceLevelColor(space.space_level)">
                  {{ getSpaceLevelText(space.space_level) }}
                </a-tag>
              </div>
              <div class="space-card-body">
                <div class="space-icon">
                  <folder-filled :style="{ color: getSpaceLevelColor(space.space_level) }"/>
                </div>
                <div class="space-name">{{ space.space_name }}</div>
                <div class="space-storage">
                  <a-progress
                      :percent="calculateStoragePercent(space)"
                      :status="getStorageStatus(space)"
                      size="small"
                  />
                  <div class="storage-text">
                    {{ formatStorage(space.total_size) }} / {{ formatStorage(space.max_size) }}
                  </div>
                </div>
              </div>
              <div class="space-card-footer">
                <div class="space-create-info">创建于: {{ formatDateTime(space.create_time) }}</div>
                <div class="space-actions">
                  <a-button type="link" size="small" @click.stop="editSpace(space)">
                    <edit-outlined/>
                  </a-button>
                  <a-button type="link" size="small" @click.stop="viewSpaceDetails(space)">
                    <eye-outlined/>
                  </a-button>
                  <a-dropdown>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1" @click.stop="upgradeSpace(space)">
                          <upgrade-outlined/> 升级空间
                        </a-menu-item>
                        <a-menu-item key="2" @click.stop="backupSpace(space)">
                          <save-outlined/> 备份空间
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item key="3" danger @click.stop="showDeleteConfirm(space)">
                          <delete-outlined/> 删除空间
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

    <!-- 新建/编辑空间弹窗 -->
    <a-modal
        v-model:visible="spaceModalVisible"
        :title="isEditing ? '编辑空间' : '新建空间'"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-space-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <component :is="isEditing ? EditOutlined : PlusOutlined"/>
        </div>
        <div class="header-title">
          <h2>{{ isEditing ? '编辑空间信息' : '创建新空间' }}</h2>
          <p>{{ isEditing ? '修改空间的基本信息和配置选项' : '创建一个新的空间，用于存储和管理内容资源' }}</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="spaceForm"
          :rules="spaceRules"
          ref="spaceFormRef"
          layout="vertical"
      >
        <div class="form-tabs">
          <div class="tab-item" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">
            <info-circle-outlined/>
            <span>基本信息</span>
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
            <setting-outlined/>
            <span>空间配置</span>
          </div>
        </div>

        <div class="form-content">
          <!-- 基本信息面板 -->
          <div v-show="activeTab === 'basic'" class="tab-panel">
            <a-form-item label="空间名称" name="space_name">
              <a-input
                  v-model:value="spaceForm.space_name"
                  placeholder="请输入空间名称"
                  :maxLength="128"
                  showCount
              >
                <template #prefix>
                  <folder-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="空间级别" name="space_level">
              <a-radio-group v-model:value="spaceForm.space_level" button-style="solid">
                <a-radio-button :value="0">普通版</a-radio-button>
                <a-radio-button :value="1">专业版</a-radio-button>
                <a-radio-button :value="2">旗舰版</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="创建用户" name="user_id">
              <a-select
                  v-model:value="spaceForm.user_id"
                  placeholder="请选择创建用户"
                  :options="userOptions"
                  show-search
                  :filter-option="filterUserOption"
              >
                <template #suffixIcon>
                  <user-outlined/>
                </template>
              </a-select>
            </a-form-item>
          </div>

          <!-- 空间配置面板 -->
          <div v-show="activeTab === 'settings'" class="tab-panel">
            <a-form-item label="存储容量上限" name="max_size">
              <a-input-number
                  v-model:value="spaceForm.max_size"
                  :min="1"
                  :max="10000"
                  addonAfter="GB"
                  style="width: 100%"
              />
              <div class="form-item-help">设置此空间可使用的最大存储容量</div>
            </a-form-item>

            <a-form-item label="文件数量上限" name="max_count">
              <a-input-number
                  v-model:value="spaceForm.max_count"
                  :min="10"
                  :max="100000"
                  style="width: 100%"
              />
              <div class="form-item-help">设置此空间可存储的最大文件数量</div>
            </a-form-item>

            <a-form-item label="是否启用" name="is_delete">
              <a-switch
                  v-model:checked="isSpaceEnabled"
                  checked-children="启用"
                  un-checked-children="禁用"
              />
              <div class="form-item-help">禁用后，用户将无法访问该空间</div>
            </a-form-item>
          </div>
        </div>

        <a-form-item label="空间预览">
          <div class="space-preview">
            <div class="preview-header">预览效果</div>
            <div class="preview-content">
              <div class="preview-space">
                <div class="preview-space-icon">
                  <folder-filled :style="{ color: getSpaceLevelColor(spaceForm.space_level) }"/>
                </div>
                <div class="preview-space-name">{{ spaceForm.space_name || '空间名称预览' }}</div>
                <div class="preview-space-level">
                  <a-tag :color="getSpaceLevelColor(spaceForm.space_level)">
                    {{ getSpaceLevelText(spaceForm.space_level) }}
                  </a-tag>
                </div>
                <div class="preview-space-capacity">
                  <div>存储容量：{{ formatStorage(spaceForm.max_size * 1024 * 1024 * 1024) }}</div>
                  <div>文件上限：{{ spaceForm.max_count }} 个</div>
                </div>
              </div>
            </div>
          </div>
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleSpaceCancel">取消</a-button>
            <a-button type="primary" @click="handleSpaceSubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              {{ isEditing ? '保存' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <!-- 空间详情弹窗 -->
    <a-modal
        v-model:visible="detailModalVisible"
        title="空间详情"
        width="720px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-detail-modal"
    >
      <template v-if="selectedSpace">
        <div class="detail-header">
          <div class="detail-title">
            <a-tag :color="getSpaceLevelColor(selectedSpace.space_level)" style="padding: 4px 12px; font-size: 16px;">
              {{ selectedSpace.space_name }}
            </a-tag>
            <a-tag :color="getSpaceLevelColor(selectedSpace.space_level)">
              {{ getSpaceLevelText(selectedSpace.space_level) }}
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
                <div class="detail-value">{{ selectedSpace.id }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">创建时间</div>
                <div class="detail-value">{{ formatDateTime(selectedSpace.create_time) }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">更新时间</div>
                <div class="detail-value">{{ formatDateTime(selectedSpace.update_time) }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">创建用户</div>
                <div class="detail-value">{{ getUserName(selectedSpace.user_id) }}</div>
              </div>
              <div class="detail-info-row">
                <div class="detail-label">空间状态</div>
                <div class="detail-value">
                  <a-badge
                      :status="selectedSpace.is_delete ? 'error' : 'success'"
                      :text="selectedSpace.is_delete ? '已禁用' : '已启用'"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <database-outlined/>
              <span>存储信息</span>
            </div>
            <div class="storage-info">
              <div class="storage-card">
                <div class="storage-card-title">存储容量</div>
                <div class="storage-card-content">
                  <a-progress
                      type="circle"
                      :percent="calculateStoragePercent(selectedSpace)"
                      :status="getStorageStatus(selectedSpace)"
                      :width="80"
                  />
                  <div class="storage-details">
                    <div class="storage-used">{{ formatStorage(selectedSpace.total_size) }}</div>
                    <div class="storage-total">/ {{ formatStorage(selectedSpace.max_size) }}</div>
                  </div>
                </div>
              </div>
              <div class="storage-card">
                <div class="storage-card-title">文件数量</div>
                <div class="storage-card-content">
                  <a-progress
                      type="circle"
                      :percent="calculateCountPercent(selectedSpace)"
                      :status="getCountStatus(selectedSpace)"
                      :width="80"
                  />
                  <div class="storage-details">
                    <div class="storage-used">{{ selectedSpace.total_count }}</div>
                    <div class="storage-total">/ {{ selectedSpace.max_count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <bar-chart-outlined/>
              <span>使用趋势</span>
            </div>
            <div class="usage-graph">
              <div class="usage-header">
                <span>最近30天存储使用情况</span>
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
        </div>

        <div class="detail-footer">
          <a-space>
            <a-button @click="detailModalVisible = false">
              关闭
            </a-button>
            <a-button type="primary" @click="editSpace(selectedSpace)">
              <template #icon>
                <edit-outlined/>
              </template>
              编辑空间
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
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  HddOutlined,
  MoreOutlined,
  SaveOutlined,
  FolderOutlined,
  FolderFilled,
  DatabaseOutlined,
  DownOutlined,
  UserOutlined,
  ExportOutlined,
  BarChartOutlined, CalendarOutlined, TeamOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import DashboardHeader from "@/components/common/DashboardHeader.vue";
import StatCards from "@/components/common/StatCards.vue";

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 70,
  },
  {
    title: '空间名称',
    dataIndex: 'space_name',
    align: 'left',
    width: 180
  },
  {
    title: '空间级别',
    dataIndex: 'space_level',
    align: 'center',
    width: 100,
    filters: [
      { text: '普通版', value: 0 },
      { text: '专业版', value: 1 },
      { text: '旗舰版', value: 2 },
    ],
  },
  {
    title: '存储使用情况',
    dataIndex: 'storage_usage',
    align: 'center',
    width: 200,
    sorter: (a, b) => calculateStoragePercent(a) - calculateStoragePercent(b),
  },
  {
    title: '文件数量',
    dataIndex: 'file_count',
    align: 'center',
    width: 130,
    sorter: (a, b) => a.total_count - b.total_count,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    align: 'center',
    width: 170,
    sorter: true
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    align: 'center',
    width: 170,
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 220,
    className: 'action-column',
    fixed: 'right'
  }
];


const headerMetrics = computed(() => [
  {
    icon: CalendarOutlined,
    label: '今日创建',
    value: 8
  },
  {
    icon: TeamOutlined,
    label: '总空间数',
    value: 62
  },
  {
    icon: HddOutlined,
    label: '总存储量',
    value: '1.8T'
  }
]);

// 顶部卡片数据
const statCards = reactive([
  {
    title: '空间总数',
    value: '62',
    change: 15.3,
    color: 'purple',
    icon: FolderOutlined,
  },
  {
    title: '本月新增',
    value: '12',
    change: 7.8,
    color: 'blue',
    icon: PlusOutlined,
  },
  {
    title: '存储总量',
    value: '1.8T',
    change: 23.5,
    color: 'green',
    icon: HddOutlined,
  },
  {
    title: '存储余量',
    value: '5.2T',
    change: -8.6,
    color: 'gold',
    icon: DatabaseOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  spaceName: '',
  spaceLevel: undefined,
  createTime: [],
});

// 空间表单
const spaceForm = reactive({
  id: '',
  space_name: '',
  space_level: 0,
  max_size: 10, // GB
  max_count: 1000,
  user_id: null,
  is_delete: 0
});

// 用户选项
const userOptions = [
  { value: 1, label: '管理员' },
  { value: 2, label: '测试账号' },
  { value: 3, label: '开发人员' },
  { value: 4, label: '运维人员' },
  { value: 5, label: '市场部门' },
];

// 过滤用户选项
function filterUserOption(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase());
}

// 其他必要的变量和方法
const spaceModalVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const spaceFormRef = ref(null);

// 表格数据和加载状态
const loading = ref(false);
const spaceData = ref([]);
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
const isAllSelected = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === spaceData.value.length);
const isIndeterminate = computed(() => selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < spaceData.value.length);

// 已选空间数据
const selectedSpace = ref(null);
const detailModalVisible = ref(false);

// 空间表单验证规则
const spaceRules = {
  space_name: [
    { required: true, message: '请输入空间名称', trigger: 'blur' },
    { max: 128, message: '空间名称不能超过128个字符', trigger: 'blur' }
  ],
  space_level: [
    { required: true, message: '请选择空间级别', trigger: 'change' }
  ],
  max_size: [
    { required: true, message: '请设置存储容量上限', trigger: 'blur' },
    { type: 'number', min: 1, message: '存储容量必须大于0', trigger: 'blur' }
  ],
  max_count: [
    { required: true, message: '请设置文件数量上限', trigger: 'blur' },
    { type: 'number', min: 10, message: '文件数量必须大于10', trigger: 'blur' }
  ],
  user_id: [
    { required: true, message: '请选择创建用户', trigger: 'change' }
  ],
};

// 使用情况趋势数据模拟
const usageData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100));

// 组件挂载时获取数据
onMounted(() => {
  fetchSpaceData();
});

// 格式化存储大小
function formatStorage(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}

// 计算存储使用百分比
function calculateStoragePercent(record) {
  if (!record.max_size || record.max_size === 0) return 0;
  return Math.round((record.total_size / record.max_size) * 100);
}

// 计算文件数量百分比
function calculateCountPercent(record) {
  if (!record.max_count || record.max_count === 0) return 0;
  return Math.round((record.total_count / record.max_count) * 100);
}

// 获取存储状态
function getStorageStatus(record) {
  const percent = calculateStoragePercent(record);
  if (percent >= 90) return 'exception';
  if (percent >= 70) return 'warning';
  return 'normal';
}

// 获取文件数量状态
function getCountStatus(record) {
  const percent = calculateCountPercent(record);
  if (percent >= 90) return 'exception';
  if (percent >= 70) return 'warning';
  return 'normal';
}

// 获取空间级别文本
function getSpaceLevelText(level) {
  const levelMap = {
    0: '普通版',
    1: '专业版',
    2: '旗舰版'
  };
  return levelMap[level] || '未知级别';
}

// 获取空间级别颜色
function getSpaceLevelColor(level) {
  const colorMap = {
    0: '#1890FF',  // 普通版 - 蓝色
    1: '#722ED1',  // 专业版 - 紫色
    2: '#FA541C'   // 旗舰版 - 橙色
  };
  return colorMap[level] || '#000000';
}

// 获取用户名称
function getUserName(userId) {
  const user = userOptions.find(user => user.value === userId);
  return user ? user.label : `用户 ID: ${userId}`;
}

// 格式化日期时间
function formatDateTime(timestamp) {
  if (!timestamp) return '--';
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 获取空间数据
function fetchSpaceData() {
  loading.value = true;

  // 模拟API请求获取空间数据
  setTimeout(() => {
    const data = [
      {
        id: 1,
        space_name: '产品资源库',
        space_level: 2,
        max_size: 1024 * 1024 * 1024 * 1024, // 1TB
        total_size: 689 * 1024 * 1024 * 1024, // 689GB
        max_count: 10000,
        total_count: 7245,
        user_id: 1,
        create_time: new Date(2025, 0, 5).getTime(),
        update_time: new Date(2025, 2, 15).getTime(),
        is_delete: 0
      },
      {
        id: 2,
        space_name: '设计素材库',
        space_level: 1,
        max_size: 500 * 1024 * 1024 * 1024, // 500GB
        total_size: 378 * 1024 * 1024 * 1024, // 378GB
        max_count: 5000,
        total_count: 3218,
        user_id: 3,
        create_time: new Date(2025, 0, 8).getTime(),
        update_time: new Date(2025, 2, 12).getTime(),
        is_delete: 0
      },
      {
        id: 3,
        space_name: '营销资料',
        space_level: 0,
        max_size: 100 * 1024 * 1024 * 1024, // 100GB
        total_size: 87 * 1024 * 1024 * 1024, // 87GB
        max_count: 1000,
        total_count: 875,
        user_id: 5,
        create_time: new Date(2025, 0, 12).getTime(),
        update_time: new Date(2025, 2, 1).getTime(),
        is_delete: 0
      },
      {
        id: 4,
        space_name: '研发文档',
        space_level: 2,
        max_size: 800 * 1024 * 1024 * 1024, // 800GB
        total_size: 456 * 1024 * 1024 * 1024, // 456GB
        max_count: 8000,
        total_count: 5672,
        user_id: 4,
        create_time: new Date(2025, 0, 15).getTime(),
        update_time: new Date(2025, 2, 18).getTime(),
        is_delete: 0
      },
      {
        id: 5,
        space_name: '客户案例',
        space_level: 1,
        max_size: 300 * 1024 * 1024 * 1024, // 300GB
        total_size: 289 * 1024 * 1024 * 1024, // 289GB
        max_count: 3000,
        total_count: 2876,
        user_id: 2,
        create_time: new Date(2025, 0, 18).getTime(),
        update_time: new Date(2025, 2, 10).getTime(),
        is_delete: 0
      },
      {
        id: 6,
        space_name: '培训视频',
        space_level: 2,
        max_size: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
        total_size: 1.7 * 1024 * 1024 * 1024 * 1024, // 1.7TB
        max_count: 5000,
        total_count: 3245,
        user_id: 1,
        create_time: new Date(2025, 0, 22).getTime(),
        update_time: new Date(2025, 2, 20).getTime(),
        is_delete: 0
      },
      {
        id: 7,
        space_name: '测试数据',
        space_level: 0,
        max_size: 50 * 1024 * 1024 * 1024, // 50GB
        total_size: 12 * 1024 * 1024 * 1024, // 12GB
        max_count: 500,
        total_count: 187,
        user_id: 2,
        create_time: new Date(2025, 0, 25).getTime(),
        update_time: new Date(2025, 1, 25).getTime(),
        is_delete: 0
      },
      {
        id: 8,
        space_name: '系统备份',
        space_level: 1,
        max_size: 500 * 1024 * 1024 * 1024, // 500GB
        total_size: 423 * 1024 * 1024 * 1024, // 423GB
        max_count: 1000,
        total_count: 128,
        user_id: 4,
        create_time: new Date(2025, 1, 2).getTime(),
        update_time: new Date(2025, 3, 1).getTime(),
        is_delete: 0
      },
      {
        id: 9,
        space_name: '历史归档',
        space_level: 0,
        max_size: 200 * 1024 * 1024 * 1024, // 200GB
        total_size: 198 * 1024 * 1024 * 1024, // 198GB
        max_count: 2000,
        total_count: 1987,
        user_id: 3,
        create_time: new Date(2025, 1, 8).getTime(),
        update_time: new Date(2025, 1, 15).getTime(),
        is_delete: 0
      },
      {
        id: 10,
        space_name: '项目计划',
        space_level: 1,
        max_size: 120 * 1024 * 1024 * 1024, // 120GB
        total_size: 67 * 1024 * 1024 * 1024, // 67GB
        max_count: 1500,
        total_count: 934,
        user_id: 5,
        create_time: new Date(2025, 1, 15).getTime(),
        update_time: new Date(2025, 2, 25).getTime(),
        is_delete: 0
      },
      {
        id: 11,
        space_name: '公共资源',
        space_level: 2,
        max_size: 1.5 * 1024 * 1024 * 1024 * 1024, // 1.5TB
        total_size: 980 * 1024 * 1024 * 1024, // 980GB
        max_count: 15000,
        total_count: 12453,
        user_id: 1,
        create_time: new Date(2025, 1, 20).getTime(),
        update_time: new Date(2025, 3, 5).getTime(),
        is_delete: 0
      },
      {
        id: 12,
        space_name: '临时工作区',
        space_level: 0,
        max_size: 50 * 1024 * 1024 * 1024, // 50GB
        total_size: 23 * 1024 * 1024 * 1024, // 23GB
        max_count: 500,
        total_count: 234,
        user_id: 2,
        create_time: new Date(2025, 1, 28).getTime(),
        update_time: new Date(2025, 2, 28).getTime(),
        is_delete: 0
      }
    ];

    spaceData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索过滤
  setTimeout(() => {
    const filteredData = spaceData.value.filter(space => {
      let match = true;

      if (searchForm.spaceName && !space.space_name.includes(searchForm.spaceName)) {
        match = false;
      }

      if (searchForm.spaceLevel !== undefined && space.space_level !== searchForm.spaceLevel) {
        match = false;
      }

      if (searchForm.createTime && searchForm.createTime.length === 2) {
        const startTime = searchForm.createTime[0].valueOf();
        const endTime = searchForm.createTime[1].valueOf();
        if (space.create_time < startTime || space.create_time > endTime) {
          match = false;
        }
      }

      return match;
    });

    spaceData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.spaceName = '';
  searchForm.spaceLevel = undefined;
  searchForm.createTime = [];

  // 重新获取所有数据
  fetchSpaceData();

  message.success('搜索条件已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchSpaceData();
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
    selectedRowKeys.value = spaceData.value.map(item => item.id);
  } else {
    selectedRowKeys.value = [];
  }
}

// 切换空间选择
function toggleSpaceSelection(id) {
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
    spaceData.value = [...spaceData.value].sort((a, b) => {
      if (sorter.field === 'storage_usage') {
        return order * (calculateStoragePercent(a) - calculateStoragePercent(b));
      }
      if (sorter.field === 'file_count') {
        return order * (a.total_count - b.total_count);
      }
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }

  // 处理筛选
  if (filters.space_level && filters.space_level.length > 0) {
    spaceData.value = spaceData.value.filter(space => filters.space_level.includes(space.space_level));
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

// 打开创建空间模态框
function openCreateModal() {
  // 重置表单
  spaceForm.id = '';
  spaceForm.space_name = '';
  spaceForm.space_level = 0;
  spaceForm.max_size = 10;
  spaceForm.max_count = 1000;
  spaceForm.user_id = null;
  spaceForm.is_delete = 0;

  isEditing.value = false;
  spaceModalVisible.value = true;
}

// 添加计算属性
const isSpaceEnabled = computed({
  get: () => !spaceForm.is_delete,
  set: (value) => {
    spaceForm.is_delete = !value;
  }
});

// 编辑空间
function editSpace(record) {
  // 复制空间数据到编辑表单
  spaceForm.id = record.id;
  spaceForm.space_name = record.space_name;
  spaceForm.space_level = record.space_level;
  spaceForm.max_size = record.max_size / (1024 * 1024 * 1024); // 转换为GB
  spaceForm.max_count = record.max_count;
  spaceForm.user_id = record.user_id;
  spaceForm.is_delete = record.is_delete;

  isEditing.value = true;
  spaceModalVisible.value = true;

  // 如果详情模态框打开，关闭它
  if (detailModalVisible.value) {
    detailModalVisible.value = false;
  }
}

// 查看空间详情
function viewSpaceDetails(record) {
  selectedSpace.value = record;
  detailModalVisible.value = true;
}

// 处理空间表单提交
function handleSpaceSubmit() {
  spaceFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          const formData = {
            ...spaceForm,
            max_size: spaceForm.max_size * 1024 * 1024 * 1024, // 转换为字节
          };

          if (isEditing.value) {
            // 更新空间
            const index = spaceData.value.findIndex(space => space.id === formData.id);
            if (index !== -1) {
              spaceData.value[index] = {
                ...spaceData.value[index],
                space_name: formData.space_name,
                space_level: formData.space_level,
                max_size: formData.max_size,
                max_count: formData.max_count,
                user_id: formData.user_id,
                is_delete: formData.is_delete,
                update_time: new Date().getTime()
              };
            }
            message.success('空间信息已更新');
          } else {
            // 创建空间
            const newSpace = {
              ...formData,
              id: Math.max(...spaceData.value.map(space => space.id)) + 1,
              total_size: 0,
              total_count: 0,
              create_time: new Date().getTime(),
              update_time: new Date().getTime()
            };
            spaceData.value.unshift(newSpace);
            pagination.total += 1;
            message.success('空间创建成功');
          }

          submitLoading.value = false;
          spaceModalVisible.value = false;
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 取消空间编辑
function handleSpaceCancel() {
  spaceModalVisible.value = false;
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  window.$modal?.confirm({
    title: '确定要删除此空间吗?',
    content: '删除后将无法恢复，内部所有文件均会丢失，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteSpace(record);
    }
  });
}

// 删除空间
function deleteSpace(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    spaceData.value = spaceData.value.filter(space => space.id !== record.id);
    pagination.total -= 1;
    loading.value = false;
    message.success('空间已删除');

    // 如果删除的是当前选中的空间，则清除选中状态
    if (selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
    }

    // 如果详情模态框显示的是当前删除的空间，关闭它
    if (detailModalVisible.value && selectedSpace.value && selectedSpace.value.id === record.id) {
      detailModalVisible.value = false;
    }
  }, 500);
}

// 批量删除空间
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的空间');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 个空间吗?`,
    content: '删除后将无法恢复，所有文件均会丢失，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        spaceData.value = spaceData.value.filter(space => !selectedRowKeys.value.includes(space.id));
        pagination.total -= selectedRowKeys.value.length;
        selectedRowKeys.value = [];
        loading.value = false;
        message.success('已批量删除空间');
      }, 800);
    }
  });
}

// 批量升级空间
function handleBatchUpgrade() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要升级的空间');
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    spaceData.value = spaceData.value.map(space => {
      if (selectedRowKeys.value.includes(space.id)) {
        const newLevel = Math.min(space.space_level + 1, 2);
        let newMaxSize = space.max_size;
        let newMaxCount = space.max_count;

        // 根据级别调整容量和文件数
        if (newLevel === 1) {
          newMaxSize = Math.max(space.max_size, 500 * 1024 * 1024 * 1024);
          newMaxCount = Math.max(space.max_count, 5000);
        } else if (newLevel === 2) {
          newMaxSize = Math.max(space.max_size, 1024 * 1024 * 1024 * 1024);
          newMaxCount = Math.max(space.max_count, 10000);
        }

        return {
          ...space,
          space_level: newLevel,
          max_size: newMaxSize,
          max_count: newMaxCount,
          update_time: new Date().getTime()
        };
      }
      return space;
    });

    loading.value = false;
    message.success(`已升级 ${selectedRowKeys.value.length} 个空间`);
  }, 500);
}

// 升级单个空间
function upgradeSpace(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    const index = spaceData.value.findIndex(space => space.id === record.id);
    if (index !== -1) {
      const newLevel = Math.min(record.space_level + 1, 2);
      let newMaxSize = record.max_size;
      let newMaxCount = record.max_count;

      // 根据级别调整容量和文件数
      if (newLevel === 1) {
        newMaxSize = Math.max(record.max_size, 500 * 1024 * 1024 * 1024);
        newMaxCount = Math.max(record.max_count, 5000);
      } else if (newLevel === 2) {
        newMaxSize = Math.max(record.max_size, 1024 * 1024 * 1024 * 1024);
        newMaxCount = Math.max(record.max_count, 10000);
      }

      spaceData.value[index] = {
        ...spaceData.value[index],
        space_level: newLevel,
        max_size: newMaxSize,
        max_count: newMaxCount,
        update_time: new Date().getTime()
      };

      message.success(`空间已升级至${getSpaceLevelText(newLevel)}`);
    }

    loading.value = false;
  }, 500);
}

// 备份空间
function backupSpace(record) {
  message.loading('正在创建备份...', 2.5)
      .then(() => message.success('备份成功！备份文件已保存至系统备份区域'));
}

// 批量备份
function handleBatchBackup() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要备份的空间');
    return;
  }

  message.loading(`正在备份 ${selectedRowKeys.value.length} 个空间...`, 3)
      .then(() => message.success('备份任务已提交，请在任务中心查看进度'));
}

// 批量导出
function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的空间');
    return;
  }

  message.loading(`正在准备导出 ${selectedRowKeys.value.length} 个空间的数据...`, 2)
      .then(() => message.success('数据导出成功，文件已保存到下载中心'));
}
</script>
<style scoped>
/* 全局容器样式 */
.space-management-container {
  padding: 24px;
}

/* 数据统计卡片样式 */
.stat-cards {
  margin-bottom: 32px;
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

/* 搜索表单样式 */
.search-form-card {
  margin-bottom: 32px;
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
  padding: 12px 0;
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
  margin-top: 8px;
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

/* 修改操作栏样式，增强右侧元素的靠右对齐 */
.operation-bar {
  display: flex;
  justify-content: space-between; /* 保持左右两侧分布 */
  align-items: center;
  margin-bottom: 32px;
  padding: 8px 0;
  width: 100%; /* 确保宽度占满 */
}

.operation-left {
  display: flex;
  align-items: center;
}

.operation-right {
  display: flex;
  align-items: center;
  margin-left: auto; /* 关键修改：添加margin-left:auto确保完全靠右 */
}

@media (max-width: 992px) {
  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
    width: 100%; /* 在小屏幕上占满宽度 */
    justify-content: flex-start; /* 小屏幕时左对齐 */
  }
}

/* 存储使用情况样式 */
.storage-text {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.count-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-percent {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* 空间卡片样式 */
.space-card {
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

.space-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.space-card-selected {
  border: 2px solid #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

.space-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.space-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.space-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.space-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  text-align: center;
}

.space-storage {
  width: 100%;
}

.space-card-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.space-create-info {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.space-actions {
  display: flex;
  justify-content: space-around;
}

/* 表头样式优化 */
:deep(.ant-table-thead > tr > th) {
  background: #f9f8ff;
  padding: 16px;
  font-weight: 600;
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

/* 自定义空间弹窗样式 */
.custom-space-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-space-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-space-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-space-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-space-modal :deep(.ant-modal-content) {
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

/* 表单选项卡样式 */
.form-tabs {
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

/* 表单帮助文本 */
.form-item-help {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* 空间预览样式 */
.space-preview {
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
  min-height: 140px;
  background: white;
}

.preview-space {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.preview-space-icon {
  font-size: 48px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.preview-space-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.preview-space-level {
  margin-bottom: 16px;
}

.preview-space-capacity {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 详情弹窗样式 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-content {
  margin-top: 16px;
}

.detail-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: #333;
}

.section-title .anticon {
  margin-right: 8px;
  color: #6554C0;
  font-size: 18px;
}

.detail-info-table {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.detail-info-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.detail-info-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 120px;
  padding: 12px 16px;
  background: #f5f5f5;
  font-weight: 500;
  color: #666;
}

.detail-value {
  flex: 1;
  padding: 12px 16px;
}

/* 存储信息卡片样式 */
.storage-info {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.storage-card {
  flex: 1;
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.storage-card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.storage-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.storage-details {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.storage-used {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.storage-total {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

/* 使用趋势图样式 */
.usage-graph {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.usage-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
}

.usage-chart {
  min-height: 200px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 0 8px;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.bar {
  width: 6px;
  background: linear-gradient(to top, #6554C0, #9F44D3);
  border-radius: 3px;
  transition: height 0.3s;
}

.bar-container:hover .bar {
  background: linear-gradient(to top, #7C68EE, #C084FC);
  width: 8px;
}

.bar-label {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
}

.detail-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 卡片视图样式 */
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

/* 在主要区块之间添加分隔效果 */
.search-form-card::after,
.operation-bar::after {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(to right, rgba(101, 84, 192, 0.1), rgba(101, 84, 192, 0), rgba(101, 84, 192, 0.1));
  margin: 8px 0;
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

  .storage-info {
    flex-direction: column;
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

  .custom-space-modal {
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