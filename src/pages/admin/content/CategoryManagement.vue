<template>
  <div class="category-management-container">
    <div class="tm-page-container">
      <!-- 分类管理页面标题区域 -->
      <div class="tm-header">
        <div class="tm-header-left">
          <div class="tm-icon-container">
            <appstore-outlined class="tm-icon"/>
          </div>
          <div class="tm-header-info">
            <div class="tm-title-row">
              <h1 class="tm-title">分类管理</h1>
              <a-tag color="#6554C0">内容管理</a-tag>
            </div>
            <p class="tm-description">
              管理系统分类资源，支持创建、组织、批量操作以及层级结构管理
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
              <div class="tm-metric-value">8</div>
            </div>
            <div class="tm-divider"></div>
            <div class="tm-metric-item">
              <div class="tm-metric-label">
                <partition-outlined/>
                总分类数
              </div>
              <div class="tm-metric-value">86</div>
            </div>
            <div class="tm-divider"></div>
            <div class="tm-metric-item">
              <div class="tm-metric-label">
                <link-outlined/>
                内容总数
              </div>
              <div class="tm-metric-value">3.5k</div>
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
            <!-- 分类名称 -->
            <a-form-item label="分类名称" name="categoryName">
              <a-input v-model:value="searchForm.categoryName" placeholder="请输入分类名称" allowClear/>
            </a-form-item>

            <!-- 分类类型 -->
            <a-form-item label="分类类型" name="categoryType">
              <a-select
                  v-model:value="searchForm.categoryType"
                  placeholder="请选择类型"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="article">文章分类</a-select-option>
                <a-select-option value="product">产品分类</a-select-option>
                <a-select-option value="media">媒体分类</a-select-option>
                <a-select-option value="user">用户分类</a-select-option>
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
            新建分类
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchMove">
            <swap-outlined/>
            批量移动
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchExport">
            <export-outlined/>
            批量导出
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="tree">
            <branches-outlined/>
            树形视图
          </a-radio-button>
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 树形视图 -->
    <div v-if="viewMode === 'tree'" class="tree-view-container">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="tree-card" :body-style="{ padding: '16px' }">
            <template #title>
              <div class="tree-card-title">
                <branches-outlined />
                <span>分类层级树</span>
              </div>
            </template>
            <a-spin :spinning="loading">
              <div class="tree-header">
                <a-input-search
                    v-model:value="searchTreeValue"
                    placeholder="搜索分类"
                    style="width: 100%;"
                    @change="handleTreeSearch"
                    allowClear
                />
              </div>
              <div class="tree-content">
                <a-tree
                    :tree-data="categoryTreeData"
                    :selectable="true"
                    :selected-keys="selectedTreeKeys"
                    :expandable="true"
                    :show-line="true"
                    :draggable="true"
                    @select="onTreeSelect"
                    @drop="onTreeDrop"
                >
                  <template #title="{ title, key }">
                    <span class="tree-node-title">{{ title }}</span>
                    <span class="tree-node-action">
                      <a-dropdown :trigger="['click']">
                        <template #overlay>
                          <a-menu>
                            <a-menu-item @click.stop="addChildCategory(key)">
                              <plus-outlined /> 添加子分类
                            </a-menu-item>
                            <a-menu-item @click.stop="editCategory(key)">
                              <edit-outlined /> 编辑
                            </a-menu-item>
                            <a-menu-divider />
                            <a-menu-item @click.stop="showDeleteConfirm(key)" danger>
                              <delete-outlined /> 删除
                            </a-menu-item>
                          </a-menu>
                        </template>
                        <more-outlined @click.stop />
                      </a-dropdown>
                    </span>
                  </template>
                </a-tree>
              </div>
            </a-spin>
          </a-card>
        </a-col>

        <a-col :span="16">
          <div v-if="selectedCategory" class="category-detail-panel">
            <a-card :body-style="{ padding: '24px' }">
              <template #title>
                <div class="detail-panel-title">
                  <appstore-outlined />
                  <span>{{ selectedCategory.name }} - 详细信息</span>
                </div>
              </template>

              <div class="detail-panel-content">
                <a-descriptions :column="2" bordered>
                  <a-descriptions-item label="分类ID">{{ selectedCategory.id }}</a-descriptions-item>
                  <a-descriptions-item label="创建时间">{{ formatDateTime(selectedCategory.createTime) }}</a-descriptions-item>
                  <a-descriptions-item label="分类类型">
                    <a-tag :color="getCategoryTypeColor(selectedCategory.type)">
                      {{ getCategoryTypeName(selectedCategory.type) }}
                    </a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="内容数量">
                    <a-badge :count="selectedCategory.itemCount" :number-style="{ backgroundColor: '#52C41A' }" />
                  </a-descriptions-item>
                  <a-descriptions-item label="分类描述" :span="2">
                    {{ selectedCategory.description || '暂无描述' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="子分类数量">{{ selectedCategory.childCount }}</a-descriptions-item>
                  <a-descriptions-item label="排序">{{ selectedCategory.sort }}</a-descriptions-item>
                </a-descriptions>

                <div class="detail-action-bar">
                  <a-space>
                    <a-button type="primary" @click="editCategory(selectedCategory.id)">
                      <edit-outlined />
                      编辑分类
                    </a-button>
                    <a-button @click="addChildCategory(selectedCategory.id)">
                      <plus-outlined />
                      添加子分类
                    </a-button>
                    <a-button type="primary" danger @click="showDeleteConfirm(selectedCategory.id)">
                      <delete-outlined />
                      删除分类
                    </a-button>
                  </a-space>
                </div>

                <a-divider orientation="left">关联内容</a-divider>

                <a-table
                    :columns="relatedColumns"
                    :data-source="relatedItems"
                    :pagination="{ pageSize: 5, size: 'small' }"
                    size="small"
                />
              </div>
            </a-card>
          </div>

          <div v-else class="category-empty-detail">
            <a-empty description="请选择一个分类以查看详情">
              <template #image>
                <appstore-outlined style="font-size: 64px; color: #bfbfbf" />
              </template>
              <a-button type="primary" @click="openCreateModal">新建分类</a-button>
            </a-empty>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="categoryData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 分类类型列 -->
          <template v-if="column.dataIndex === 'type'">
            <a-tag :color="getCategoryTypeColor(record.type)">
              {{ getCategoryTypeName(record.type) }}
            </a-tag>
          </template>

          <!-- 内容数量列 -->
          <template v-if="column.dataIndex === 'itemCount'">
            <a-badge :count="record.itemCount" :number-style="{ backgroundColor: '#52C41A' }" />
          </template>

          <!-- 分类层级列 -->
          <template v-if="column.dataIndex === 'level'">
            <div class="level-indicator">
              <div v-for="i in record.level" :key="i" class="level-dot"></div>
              <span>{{ getLevelText(record.level) }}</span>
            </div>
          </template>

          <!-- 创建时间 -->
          <template v-if="column.dataIndex === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewCategory(record)">
                <eye-outlined/>
                查看
              </a-button>
              <a-button type="link" size="small" @click="editCategory(record.id)">
                <edit-outlined/>
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="addChildCategory(record.id)">
                      <plus-outlined/> 添加子分类
                    </a-menu-item>
                    <a-menu-item key="2" @click="moveCategory(record)">
                      <swap-outlined/> 移动分类
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item key="3" danger @click="showDeleteConfirm(record.id)">
                      <delete-outlined/> 删除分类
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

    <!-- 新建/编辑分类弹窗 -->
    <a-modal
        v-model:visible="categoryModalVisible"
        :title="isEditing ? '编辑分类' : '新建分类'"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-category-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <component :is="isEditing ? EditOutlined : PlusOutlined"/>
        </div>
        <div class="header-title">
          <h2>{{ isEditing ? '编辑分类信息' : '创建新分类' }}</h2>
          <p>{{ isEditing ? '修改分类的基本信息和关联设置' : '创建一个新的分类，用于内容的归类和组织' }}</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="categoryForm"
          :rules="categoryRules"
          ref="categoryFormRef"
          layout="vertical"
      >
        <div class="category-tabs">
          <div class="tab-item" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">
            <info-circle-outlined/>
            <span>基本信息</span>
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'advanced' }" @click="activeTab = 'advanced'">
            <setting-outlined/>
            <span>高级设置</span>
          </div>
        </div>

        <div class="form-content">
          <!-- 基本信息面板 -->
          <div v-show="activeTab === 'basic'" class="tab-panel">
            <a-form-item label="分类名称" name="name">
              <a-input
                  v-model:value="categoryForm.name"
                  placeholder="请输入分类名称"
                  :maxLength="50"
                  showCount
              >
                <template #prefix>
                  <font-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="上级分类" name="parentId">
              <a-tree-select
                  v-model:value="categoryForm.parentId"
                  :tree-data="parentCategoryOptions"
                  placeholder="请选择上级分类（不选择则为顶级分类）"
                  allow-clear
                  tree-default-expand-all
                  show-search
                  style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="分类类型" name="type">
              <a-select
                  v-model:value="categoryForm.type"
                  placeholder="请选择分类类型"
                  style="width: 100%"
              >
                <a-select-option value="article">文章分类</a-select-option>
                <a-select-option value="product">产品分类</a-select-option>
                <a-select-option value="media">媒体分类</a-select-option>
                <a-select-option value="user">用户分类</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="分类描述" name="description">
              <a-textarea
                  v-model:value="categoryForm.description"
                  placeholder="请输入分类描述信息（选填）"
                  :rows="4"
                  :maxLength="200"
                  :showCount="true"
              />
            </a-form-item>
          </div>

          <!-- 高级设置面板 -->
          <div v-show="activeTab === 'advanced'" class="tab-panel">
            <a-form-item label="排序优先级" name="sort">
              <a-input-number
                  v-model:value="categoryForm.sort"
                  :min="0"
                  :max="999"
                  style="width: 100%"
              />
              <div class="form-item-help">数值越小，排序越靠前</div>
            </a-form-item>

            <a-form-item label="图标" name="icon">
              <a-input
                  v-model:value="categoryForm.icon"
                  placeholder="请输入图标名称或代码"
              >
                <template #prefix>
                  <component :is="getIconComponent(categoryForm.icon)" style="color: rgba(0, 0, 0, 0.45)"/>
                </template>
              </a-input>
              <div class="form-item-help">可以输入Ant Design图标名称</div>
            </a-form-item>

            <a-form-item label="是否在导航中显示" name="showInMenu">
              <a-switch
                  v-model:checked="categoryForm.showInMenu"
                  checked-children="显示"
                  un-checked-children="隐藏"
              />
              <div class="form-item-help">开启后，该分类将在网站导航中显示</div>
            </a-form-item>

            <a-form-item label="分类别名" name="alias">
              <a-input
                  v-model:value="categoryForm.alias"
                  placeholder="请输入分类别名，用于URL等场景"
                  allow-clear
              />
              <div class="form-item-help">用于生成友好的URL，不填则使用分类ID</div>
            </a-form-item>
          </div>
        </div>

        <a-form-item label="分类预览">
          <div class="category-preview">
            <div class="preview-header">预览效果</div>
            <div class="preview-content">
              <div class="preview-category">
                <div class="preview-category-icon">
                  <component :is="getIconComponent(categoryForm.icon)" :style="{ color: getCategoryTypeColor(categoryForm.type) }"/>
                </div>
                <div class="preview-category-info">
                  <div class="preview-category-name">{{ categoryForm.name || '分类名称预览' }}</div>
                  <div class="preview-category-type">
                    <a-tag :color="getCategoryTypeColor(categoryForm.type)">
                      {{ getCategoryTypeName(categoryForm.type) }}
                    </a-tag>
                  </div>
                </div>
                <div class="preview-category-description">
                  {{ categoryForm.description || '分类描述将显示在此处...' }}
                </div>
              </div>
            </div>
          </div>
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleCategoryCancel">取消</a-button>
            <a-button type="primary" @click="handleCategorySubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              {{ isEditing ? '保存' : '创建' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
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
  SettingOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  MoreOutlined,
  SaveOutlined,
  TeamOutlined,
  SwapOutlined,
  ExportOutlined,
  FolderOutlined,
  FileOutlined,
  BranchesOutlined,
  PartitionOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
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
    title: '分类名称',
    dataIndex: 'name',
    align: 'left',
    width: 180
  },
  {
    title: '分类类型',
    dataIndex: 'type',
    align: 'center',
    width: 100,
    filters: [
      { text: '文章分类', value: 'article' },
      { text: '产品分类', value: 'product' },
      { text: '媒体分类', value: 'media' },
      { text: '用户分类', value: 'user' },
    ],
  },
  {
    title: '层级',
    dataIndex: 'level',
    align: 'center',
    width: 100,
    filters: [
      { text: '一级', value: 1 },
      { text: '二级', value: 2 },
      { text: '三级', value: 3 },
    ],
  },
  {
    title: '内容数量',
    dataIndex: 'itemCount',
    align: 'center',
    width: 100,
    sorter: true
  },
  {
    title: '排序',
    dataIndex: 'sort',
    align: 'center',
    width: 80,
    sorter: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 170,
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 230,
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
    title: '分类总数',
    value: '86',
    change: 9.3,
    color: 'purple',
    icon: AppstoreOutlined,
  },
  {
    title: '本月新增',
    value: '12',
    change: 5.2,
    color: 'blue',
    icon: PlusOutlined,
  },
  {
    title: '顶级分类',
    value: '24',
    change: 2.8,
    color: 'green',
    icon: PartitionOutlined,
  },
  {
    title: '空分类',
    value: '18',
    change: -3.5,
    color: 'gold',
    icon: FolderOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  categoryName: '',
  categoryType: undefined,
  createTime: [],
});

// 分类表单
const categoryForm = reactive({
  id: '',
  name: '',
  parentId: null,
  type: 'article',
  description: '',
  icon: 'AppstoreOutlined',
  sort: 100,
  showInMenu: true,
  alias: '',
});

// 获取图标组件
function getIconComponent(iconName) {
  // 根据字符串名称返回对应的图标组件
  const iconMap = {
    'AppstoreOutlined': AppstoreOutlined,
    'FolderOutlined': FolderOutlined,
    'FileOutlined': FileOutlined,
    'LinkOutlined': LinkOutlined,
    'TeamOutlined': TeamOutlined,
    'PartitionOutlined': PartitionOutlined,
    'BranchesOutlined': BranchesOutlined,
  };

  return iconMap[iconName] || AppstoreOutlined;
}

// 其他必要的变量和方法
const categoryModalVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const categoryFormRef = ref(null);
const activeTab = ref('basic');

// 表格数据和加载状态
const loading = ref(false);
const categoryData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 视图模式
const viewMode = ref('tree');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 树形视图相关变量
const categoryTreeData = ref([]);
const selectedTreeKeys = ref([]);
const searchTreeValue = ref('');
const selectedCategory = ref(null);

// 模拟关联内容数据
const relatedItems = ref([
  {
    id: 1,
    type: '文章',
    title: '2025年市场趋势分析报告',
    createTime: new Date(2025, 0, 15).getTime()
  },
  {
    id: 2,
    type: '产品',
    title: '智能家居控制系统',
    createTime: new Date(2025, 0, 18).getTime()
  },
  {
    id: 3,
    type: '文章',
    title: '如何提升团队协作效率',
    createTime: new Date(2025, 0, 22).getTime()
  },
  {
    id: 4,
    type: '媒体',
    title: '新品发布会视频',
    createTime: new Date(2025, 0, 25).getTime()
  },
  {
    id: 5,
    type: '产品',
    title: '移动办公解决方案',
    createTime: new Date(2025, 0, 28).getTime()
  }
]);

// 分类表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 50, message: '分类名称不能超过50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请设置排序优先级', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序值必须在0-999之间', trigger: 'blur' }
  ],
};

// 父分类选项
const parentCategoryOptions = computed(() => {
  // 构建适用于树选择的数据结构
  const buildTreeData = (data, parentId = null) => {
    const result = [];
    const items = data.filter(item =>
        (parentId === null && !item.parentId) ||
        (item.parentId === parentId)
    );

    items.forEach(item => {
      // 避免自己选择自己为父类
      if (isEditing.value && item.id === categoryForm.id) {
        return;
      }

      const node = {
        title: item.name,
        value: item.id,
        key: item.id,
      };

      const children = buildTreeData(data, item.id);
      if (children.length) {
        node.children = children;
      }

      result.push(node);
    });

    return result;
  };

  return buildTreeData(categoryData.value);
});

// 组件挂载时获取数据
onMounted(() => {
  fetchCategoryData();
});

// 获取分类数据
function fetchCategoryData() {
  loading.value = true;

  // 模拟API请求获取分类数据
  setTimeout(() => {
    const data = [
      {
        id: 1,
        name: '产品分类',
        parentId: null,
        type: 'product',
        description: '所有产品的主分类，包含各类产品子分类',
        icon: 'AppstoreOutlined',
        level: 1,
        sort: 10,
        itemCount: 156,
        childCount: 3,
        showInMenu: true,
        alias: 'products',
        createTime: new Date(2025, 0, 5).getTime(),
        updateTime: new Date(2025, 0, 5).getTime(),
      },
      {
        id: 2,
        name: '智能设备',
        parentId: 1,
        type: 'product',
        description: '智能家居和IoT相关设备',
        icon: 'AppstoreOutlined',
        level: 2,
        sort: 20,
        itemCount: 68,
        childCount: 2,
        showInMenu: true,
        alias: 'smart-devices',
        createTime: new Date(2025, 0, 6).getTime(),
        updateTime: new Date(2025, 0, 15).getTime(),
      },
      {
        id: 3,
        name: '软件服务',
        parentId: 1,
        type: 'product',
        description: '各类软件产品和服务',
        icon: 'AppstoreOutlined',
        level: 2,
        sort: 30,
        itemCount: 52,
        childCount: 0,
        showInMenu: true,
        alias: 'software',
        createTime: new Date(2025, 0, 7).getTime(),
        updateTime: new Date(2025, 0, 7).getTime(),
      },
      {
        id: 4,
        name: '解决方案',
        parentId: 1,
        type: 'product',
        description: '企业级解决方案和服务包',
        icon: 'AppstoreOutlined',
        level: 2,
        sort: 40,
        itemCount: 36,
        childCount: 0,
        showInMenu: true,
        alias: 'solutions',
        createTime: new Date(2025, 0, 8).getTime(),
        updateTime: new Date(2025, 0, 8).getTime(),
      },
      {
        id: 5,
        name: '智能家居',
        parentId: 2,
        type: 'product',
        description: '家庭智能设备和系统',
        icon: 'HomeOutlined',
        level: 3,
        sort: 10,
        itemCount: 45,
        childCount: 0,
        showInMenu: true,
        alias: 'smart-home',
        createTime: new Date(2025, 0, 9).getTime(),
        updateTime: new Date(2025, 0, 9).getTime(),
      },
      {
        id: 6,
        name: '商业智能',
        parentId: 2,
        type: 'product',
        description: '商业场景智能设备解决方案',
        icon: 'ShopOutlined',
        level: 3,
        sort: 20,
        itemCount: 23,
        childCount: 0,
        showInMenu: true,
        alias: 'business-intelligence',
        createTime: new Date(2025, 0, 10).getTime(),
        updateTime: new Date(2025, 0, 10).getTime(),
      },
      {
        id: 7,
        name: '文章资讯',
        parentId: null,
        type: 'article',
        description: '公司新闻、行业动态、技术博客等内容',
        icon: 'FileOutlined',
        level: 1,
        sort: 50,
        itemCount: 245,
        childCount: 3,
        showInMenu: true,
        alias: 'articles',
        createTime: new Date(2025, 0, 11).getTime(),
        updateTime: new Date(2025, 0, 11).getTime(),
      },
      {
        id: 8,
        name: '公司新闻',
        parentId: 7,
        type: 'article',
        description: '公司最新动态、发布会等信息',
        icon: 'FileOutlined',
        level: 2,
        sort: 10,
        itemCount: 87,
        childCount: 0,
        showInMenu: true,
        alias: 'company-news',
        createTime: new Date(2025, 0, 12).getTime(),
        updateTime: new Date(2025, 0, 12).getTime(),
      },
      {
        id: 9,
        name: '技术博客',
        parentId: 7,
        type: 'article',
        description: '技术分享、解决方案、最佳实践',
        icon: 'FileOutlined',
        level: 2,
        sort: 20,
        itemCount: 108,
        childCount: 0,
        showInMenu: true,
        alias: 'tech-blog',
        createTime: new Date(2025, 0, 13).getTime(),
        updateTime: new Date(2025, 0, 13).getTime(),
      },
      {
        id: 10,
        name: '行业资讯',
        parentId: 7,
        type: 'article',
        description: '行业最新动态、市场分析等资讯',
        icon: 'FileOutlined',
        level: 2,
        sort: 30,
        itemCount: 50,
        childCount: 0,
        showInMenu: true,
        alias: 'industry-news',
        createTime: new Date(2025, 0, 14).getTime(),
        updateTime: new Date(2025, 0, 14).getTime(),
      },
      {
        id: 11,
        name: '媒体资源',
        parentId: null,
        type: 'media',
        description: '图片、视频等多媒体资源',
        icon: 'PictureOutlined',
        level: 1,
        sort: 60,
        itemCount: 328,
        childCount: 2,
        showInMenu: true,
        alias: 'media',
        createTime: new Date(2025, 0, 15).getTime(),
        updateTime: new Date(2025, 0, 15).getTime(),
      },
      {
        id: 12,
        name: '图片素材',
        parentId: 11,
        type: 'media',
        description: '产品图片、宣传海报等图片资源',
        icon: 'PictureOutlined',
        level: 2,
        sort: 10,
        itemCount: 215,
        childCount: 0,
        showInMenu: true,
        alias: 'images',
        createTime: new Date(2025, 0, 16).getTime(),
        updateTime: new Date(2025, 0, 16).getTime(),
      },
      {
        id: 13,
        name: '视频资源',
        parentId: 11,
        type: 'media',
        description: '宣传视频、教程视频等资源',
        icon: 'VideoCameraOutlined',
        level: 2,
        sort: 20,
        itemCount: 113,
        childCount: 0,
        showInMenu: true,
        alias: 'videos',
        createTime: new Date(2025, 0, 17).getTime(),
        updateTime: new Date(2025, 0, 17).getTime(),
      },
      {
        id: 14,
        name: '用户分类',
        parentId: null,
        type: 'user',
        description: '用户标签和分组',
        icon: 'TeamOutlined',
        level: 1,
        sort: 70,
        itemCount: 158,
        childCount: 2,
        showInMenu: false,
        alias: 'users',
        createTime: new Date(2025, 0, 18).getTime(),
        updateTime: new Date(2025, 0, 18).getTime(),
      },
      {
        id: 15,
        name: '企业客户',
        parentId: 14,
        type: 'user',
        description: '企业级别客户和VIP',
        icon: 'TeamOutlined',
        level: 2,
        sort: 10,
        itemCount: 85,
        childCount: 0,
        showInMenu: false,
        alias: 'enterprise',
        createTime: new Date(2025, 0, 19).getTime(),
        updateTime: new Date(2025, 0, 19).getTime(),
      },
      {
        id: 16,
        name: '个人用户',
        parentId: 14,
        type: 'user',
        description: '个人用户和普通消费者',
        icon: 'TeamOutlined',
        level: 2,
        sort: 20,
        itemCount: 73,
        childCount: 0,
        showInMenu: false,
        alias: 'personal',
        createTime: new Date(2025, 0, 20).getTime(),
        updateTime: new Date(2025, 0, 20).getTime(),
      }
    ];

    categoryData.value = data;
    pagination.total = data.length;

    // 构建树形数据
    buildCategoryTree(data);

    loading.value = false;
  }, 500);
}

// 构建分类树数据
function buildCategoryTree(data) {
  const buildTree = (items, parentId = null) => {
    return items
        .filter(item =>
            (parentId === null && !item.parentId) ||
            (item.parentId === parentId)
        )
        .map(item => {
          const node = {
            title: item.name,
            key: item.id,
            icon: getIconComponent(item.icon),
            data: item,
          };

          const children = buildTree(items, item.id);
          if (children.length) {
            node.children = children;
          }

          return node;
        });
  };

  categoryTreeData.value = buildTree(data);
}

// 获取分类类型名称
function getCategoryTypeName(type) {
  const typeMap = {
    'article': '文章分类',
    'product': '产品分类',
    'media': '媒体分类',
    'user': '用户分类'
  };
  return typeMap[type] || '未知类型';
}

// 获取分类类型颜色
function getCategoryTypeColor(type) {
  const colorMap = {
    'article': '#1890FF',
    'product': '#52C41A',
    'media': '#722ED1',
    'user': '#FA8C16'
  };
  return colorMap[type] || '#000000';
}

// 获取层级文本
function getLevelText(level) {
  const levelMap = {
    1: '一级',
    2: '二级',
    3: '三级',
    4: '四级'
  };
  return levelMap[level] || `${level}级`;
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
    const filteredData = categoryData.value.filter(category => {
      let match = true;

      if (searchForm.categoryName && !category.name.includes(searchForm.categoryName)) {
        match = false;
      }

      if (searchForm.categoryType && category.type !== searchForm.categoryType) {
        match = false;
      }

      if (searchForm.createTime && searchForm.createTime.length === 2) {
        const startTime = searchForm.createTime[0].valueOf();
        const endTime = searchForm.createTime[1].valueOf();
        if (category.createTime < startTime || category.createTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    // 重新构建树形数据
    buildCategoryTree(filteredData);

    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.categoryName = '';
  searchForm.categoryType = undefined;
  searchForm.createTime = [];

  // 重新获取所有数据
  fetchCategoryData();

  message.success('搜索条件已重置');
}

// 刷新数据
function handleRefresh() {
  fetchCategoryData();
  selectedRowKeys.value = [];
  selectedTreeKeys.value = [];
  selectedCategory.value = null;
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 表格变化处理
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    categoryData.value = [...categoryData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }

  // 处理筛选
  if (filters.type && filters.type.length > 0) {
    categoryData.value = categoryData.value.filter(item => filters.type.includes(item.type));
  }

  if (filters.level && filters.level.length > 0) {
    categoryData.value = categoryData.value.filter(item => filters.level.includes(item.level));
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

// 树搜索处理
function handleTreeSearch(e) {
  if (!searchTreeValue.value) {
    // 如果搜索框清空，恢复完整树
    buildCategoryTree(categoryData.value);
    return;
  }

  // 过滤匹配的节点
  const filteredData = categoryData.value.filter(item =>
      item.name.toLowerCase().includes(searchTreeValue.value.toLowerCase())
  );

  // 找到所有匹配节点的父节点路径
  const relevantIds = new Set();

  filteredData.forEach(item => {
    // 添加当前节点
    relevantIds.add(item.id);

    // 添加所有父节点
    let parentId = item.parentId;
    while (parentId) {
      relevantIds.add(parentId);
      const parent = categoryData.value.find(p => p.id === parentId);
      parentId = parent ? parent.parentId : null;
    }
  });

  // 过滤树数据
  const filteredTreeData = categoryData.value.filter(item => relevantIds.has(item.id));
  buildCategoryTree(filteredTreeData);
}

// 树节点选择处理
function onTreeSelect(selectedKeys, info) {
  if (selectedKeys.length === 0) {
    selectedCategory.value = null;
    return;
  }

  selectedTreeKeys.value = selectedKeys;
  const categoryId = selectedKeys[0];
  selectedCategory.value = categoryData.value.find(item => item.id === categoryId);
}

// 树节点拖放处理
function onTreeDrop(info) {
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

  // 找到被拖动的节点
  const dragNode = categoryData.value.find(item => item.id === dragKey);

  if (!dragNode) return;

  // 根据不同的放置位置处理逻辑
  if (dropPosition === 0) {
    // 放在节点内部，成为子节点
    dragNode.parentId = dropKey;
    dragNode.level = categoryData.value.find(item => item.id === dropKey).level + 1;
  } else {
    // 放在节点前后，保持同级
    const dropNodeData = categoryData.value.find(item => item.id === dropKey);
    dragNode.parentId = dropNodeData.parentId;
    dragNode.level = dropNodeData.level;
  }

  // 更新树形数据
  buildCategoryTree(categoryData.value);

  message.success('分类层级已更新');
}

// 打开创建分类模态框
function openCreateModal() {
  // 重置表单
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = key === 'type' ? 'article' :
        key === 'sort' ? 100 :
            key === 'showInMenu' ? true :
                key === 'icon' ? 'AppstoreOutlined' : '';
  });

  isEditing.value = false;
  categoryModalVisible.value = true;
}

// 编辑分类
function editCategory(id) {
  const category = categoryData.value.find(item => item.id === id);

  if (!category) {
    message.error('未找到该分类信息');
    return;
  }

  // 复制分类数据到编辑表单
  Object.keys(categoryForm).forEach(key => {
    if (key in category) {
      categoryForm[key] = category[key];
    }
  });

  isEditing.value = true;
  categoryModalVisible.value = true;

  // 如果详情模态框打开，关闭它
  if (selectedCategory.value && selectedCategory.value.id === id) {
    selectedCategory.value = null;
  }
}

// 查看分类详情
function viewCategory(record) {
  selectedCategory.value = record;
  selectedTreeKeys.value = [record.id];

  // 如果当前是列表视图，切换到树形视图
  if (viewMode.value === 'list') {
    viewMode.value = 'tree';
  }
}

// 添加子分类
function addChildCategory(parentId) {
  // 重置表单
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = key === 'type' ? 'article' :
        key === 'sort' ? 100 :
            key === 'showInMenu' ? true :
                key === 'icon' ? 'AppstoreOutlined' : '';
  });

  // 设置父分类ID
  categoryForm.parentId = parentId;

  // 自动设置类型与父分类一致
  const parentCategory = categoryData.value.find(item => item.id === parentId);
  if (parentCategory) {
    categoryForm.type = parentCategory.type;
  }

  isEditing.value = false;
  categoryModalVisible.value = true;
}

// 处理分类提交
function handleCategorySubmit() {
  categoryFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          const formData = {...categoryForm};

          // 计算分类层级
          let level = 1;
          if (formData.parentId) {
            const parent = categoryData.value.find(item => item.id === formData.parentId);
            if (parent) {
              level = parent.level + 1;
            }
          }

          if (isEditing.value) {
            // 更新分类
            const index = categoryData.value.findIndex(category => category.id === formData.id);
            if (index !== -1) {
              categoryData.value[index] = {
                ...categoryData.value[index],
                ...formData,
                level,
                updateTime: new Date().getTime()
              };

              // 更新子分类的level
              updateChildrenLevel(formData.id);
            }
            message.success('分类信息已更新');
          } else {
            // 创建分类
            const newCategory = {
              ...formData,
              id: Math.max(...categoryData.value.map(category => category.id)) + 1,
              level,
              itemCount: 0,
              childCount: 0,
              createTime: new Date().getTime(),
              updateTime: new Date().getTime()
            };

            categoryData.value.unshift(newCategory);

            // 更新父分类的childCount
            if (newCategory.parentId) {
              const parentIndex = categoryData.value.findIndex(item => item.id === newCategory.parentId);
              if (parentIndex !== -1) {
                categoryData.value[parentIndex].childCount += 1;
              }
            }

            pagination.total += 1;
            message.success('分类创建成功');
          }

          // 重建分类树
          buildCategoryTree(categoryData.value);

          submitLoading.value = false;
          categoryModalVisible.value = false;
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 更新子分类的level
function updateChildrenLevel(parentId) {
  const parent = categoryData.value.find(item => item.id === parentId);
  if (!parent) return;

  const children = categoryData.value.filter(item => item.parentId === parentId);

  children.forEach(child => {
    const index = categoryData.value.findIndex(item => item.id === child.id);
    if (index !== -1) {
      categoryData.value[index].level = parent.level + 1;
      // 递归更新子分类的子分类
      updateChildrenLevel(child.id);
    }
  });
}

// 取消分类编辑
function handleCategoryCancel() {
  categoryModalVisible.value = false;
}

// 显示删除确认对话框
function showDeleteConfirm(id) {
  const category = categoryData.value.find(item => item.id === id);

  if (!category) return;

  // 检查是否有子分类
  const hasChildren = categoryData.value.some(item => item.parentId === id);

  window.$modal?.confirm({
    title: '确定要删除此分类吗?',
    content: hasChildren
        ? '该分类下包含子分类，删除后所有子分类将一并删除，且无法恢复，请谨慎操作。'
        : '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteCategory(id);
    }
  });
}

// 删除分类
function deleteCategory(id) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    // 递归删除分类及其子分类
    const deletedIds = recursiveDeleteCategory(id);

    // 更新父分类的childCount
    const category = categoryData.value.find(item => item.id === id);
    if (category && category.parentId) {
      const parentIndex = categoryData.value.findIndex(item => item.id === category.parentId);
      if (parentIndex !== -1) {
        categoryData.value[parentIndex].childCount -= 1;
      }
    }

    // 过滤出未删除的分类
    categoryData.value = categoryData.value.filter(category => !deletedIds.includes(category.id));
    pagination.total = categoryData.value.length;

    // 重建分类树
    buildCategoryTree(categoryData.value);

    loading.value = false;
    message.success('分类已删除');

    // 如果删除的是当前选中的分类，则清除选中状态
    if (selectedRowKeys.value.includes(id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id);
    }

    if (selectedTreeKeys.value.includes(id)) {
      selectedTreeKeys.value = [];
      selectedCategory.value = null;
    }
  }, 500);
}

// 递归删除分类及其子分类
function recursiveDeleteCategory(categoryId) {
  const deletedIds = [categoryId];

  // 查找所有子分类
  const children = categoryData.value.filter(item => item.parentId === categoryId);

  // 递归删除子分类
  children.forEach(child => {
    deletedIds.push(...recursiveDeleteCategory(child.id));
  });

  return deletedIds;
}

// 批量删除分类
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的分类');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 个分类吗?`,
    content: '删除后将无法恢复，所有子分类也会被一并删除，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        // 获取所有需要删除的分类ID（包括子分类）
        let allDeletedIds = [];
        selectedRowKeys.value.forEach(id => {
          allDeletedIds.push(...recursiveDeleteCategory(id));
        });

        // 去重
        allDeletedIds = [...new Set(allDeletedIds)];

        // 过滤出未删除的分类
        categoryData.value = categoryData.value.filter(category => !allDeletedIds.includes(category.id));
        pagination.total = categoryData.value.length;

        // 重建分类树
        buildCategoryTree(categoryData.value);

        selectedRowKeys.value = [];
        selectedTreeKeys.value = [];
        selectedCategory.value = null;

        loading.value = false;
        message.success('已批量删除分类');
      }, 800);
    }
  });
}

// 批量移动分类
function handleBatchMove() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要移动的分类');
    return;
  }

  // 这里可以实现批量移动的模态框
  message.info('批量移动功能正在开发中...');
}

// 批量导出分类
function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的分类');
    return;
  }

  message.loading('正在准备导出数据...', 2)
      .then(() => message.success('导出成功，文件已保存到下载中心'));
}

// 移动单个分类
function moveCategory(record) {
  // 这里可以实现移动分类的模态框
  message.info(`正在准备移动分类"${record.name}"...`);
}
</script>

<style scoped>
/* 全局容器样式 */
.category-management-container {
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
  align-items: flex-start; /* 修改为flex-start确保所有元素从顶部对齐 */
  width: 100%;
  padding: 12px 0;
}


/* 确保表单项和按钮组具有相同的底部边距 */
.search-form-items .ant-form-item,
.search-buttons {
  margin-bottom: 16px !important; /* 使用!important确保覆盖可能的冲突样式 */
}


/* 确保查询和重置按钮保持水平排列 */
.search-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0; /* 移除可能导致错位的顶部边距 */
  height: 32px; /* 设置与表单控件相同的高度 */
  align-self: flex-end; /* 将按钮组对齐到底部，与输入项的底部对齐 */
}

.ant-form-item-label {
  padding-bottom: 8px; /* 确保所有标签具有一致的底部内边距 */
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
  margin-bottom: 32px;
  padding: 8px 0;
  width: 100%;
}

.operation-left {
  display: flex;
  align-items: center;
}

.operation-right {
  display: flex;
  align-items: center;
  margin-left: auto; /* 确保视图切换按钮组完全靠右 */
}

/* 树形视图样式 */
.tree-view-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.tree-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tree-card-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.tree-card-title .anticon {
  margin-right: 8px;
  color: #6554C0;
}

.tree-header {
  margin-bottom: 16px;
}

.tree-content {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-node-title {
  margin-right: 8px;
}

.tree-node-action {
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.ant-tree-node-content-wrapper:hover) .tree-node-action {
  opacity: 1;
}

/* 分类详情面板样式 */
.category-detail-panel {
  height: 100%;
}

.detail-panel-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.detail-panel-title .anticon {
  margin-right: 8px;
  color: #6554C0;
}

.detail-panel-content {
  padding: 16px 0;
}

.detail-action-bar {
  margin: 24px 0;
  display: flex;
  justify-content: flex-end;
}

.category-empty-detail {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  padding: 48px;
}

/* 层级指示器样式 */
.level-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-dot {
  width: 8px;
  height: 8px;
  background-color: #6554C0;
  border-radius: 50%;
  margin-right: 4px;
}

/* 自定义分类模态框样式 */
.custom-category-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-category-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-category-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-category-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-category-modal :deep(.ant-modal-content) {
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

/* 分类选项卡样式 */
.category-tabs {
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

/* 分类预览样式 */
.category-preview {
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

.preview-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.preview-category-icon {
  font-size: 36px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.preview-category-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.preview-category-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.preview-category-description {
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
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
    width: 100%; /* 在小屏幕上占满宽度 */
    justify-content: flex-end; /* 小屏幕时依然保持右对齐 */
    margin-left: 0; /* 小屏幕时重置margin-left */
  }

  .tree-view-container .ant-row {
    flex-direction: column;
  }

  .tree-view-container .ant-col {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }

  .category-detail-panel {
    margin-top: 24px;
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

  .custom-category-modal {
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

  /* 增强小屏幕上的操作按钮响应性 */
  .operation-left .ant-space {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .operation-left .ant-btn {
    margin-bottom: 8px;
  }
}
</style>