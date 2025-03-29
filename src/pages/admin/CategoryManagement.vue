<template>
  <div class="category-management-container">
    <!-- 顶部卡片统计信息 -->
    <div class="stat-cards">
      <a-row :gutter="16">
        <a-col :span="6" v-for="(card, index) in statCards" :key="index">
          <a-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="card-content">
              <div class="icon-container" :class="`bg-${card.color}`">
                <component :is="card.icon"/>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ card.title }}</div>
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-change" :class="{ 'increase': card.change > 0, 'decrease': card.change < 0 }">
                  <arrow-up-outlined v-if="card.change > 0"/>
                  <arrow-down-outlined v-if="card.change < 0"/>
                  {{ Math.abs(card.change) }}% 较上月
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
        <a-form-item label="分类名称" name="categoryName">
          <a-input v-model:value="searchForm.categoryName" placeholder="请输入分类名称" allowClear/>
        </a-form-item>
        <a-form-item label="创建时间" name="createTime">
          <a-range-picker
              v-model:value="searchForm.createTime"
              :placeholder="['开始日期', '结束日期']"
              format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="archived">已归档</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" class="search-button">
              <search-outlined/>
              查询
            </a-button>
            <a-button @click="resetForm" class="reset-button">
              <reload-outlined/>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" class="primary-button" @click="openAddCategoryModal">
          <plus-outlined/>
          添加分类
        </a-button>
        <a-button class="secondary-button" @click="handleRefresh">
          <reload-outlined/>
          刷新
        </a-button>
        <a-button danger class="danger-button" :disabled="!hasSelected" @click="handleBatchDelete">
          <delete-outlined/>
          批量删除
        </a-button>
      </a-space>

      <a-space>
        <a-dropdown>
          <a-button class="secondary-button">
            <export-outlined />
            导出
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="exportExcel">导出Excel</a-menu-item>
              <a-menu-item key="2" @click="exportPDF">导出PDF</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>

    <!-- 分类树形结构和表格 -->
    <a-row :gutter="16" class="content-row">

      <!-- 右侧分类表格 -->
      <a-col :span="24">
        <a-table
            :columns="columns"
            :data-source="categoryData"
            :loading="loading"
            :pagination="pagination"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
            row-key="id"
            class="category-table"
            :scroll="{ x: 1300 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 图标列 -->
            <template v-if="column.dataIndex === 'icon'">
              <div class="category-icon-container" :style="{ backgroundColor: record.iconBg || '#6554C0' }">
                <component :is="record.icon || 'AppstoreOutlined'" style="color: white" />
              </div>
            </template>

            <!-- 状态列 -->
            <template v-if="column.dataIndex === 'status'">
              <a-badge
                  :status="getStatusType(record.status)"
                  :text="getStatusText(record.status)"
              />
            </template>

            <!-- 关联数量列 -->
            <template v-if="column.dataIndex === 'articleCount'">
              <a-button type="link" @click="viewRelatedArticles(record)">
                {{ record.articleCount }} 篇文章
              </a-button>
            </template>

            <!-- 排序列 -->
            <template v-if="column.dataIndex === 'sort'">
              <a-input-number
                  v-model:value="record.sort"
                  :min="0"
                  :max="100"
                  style="width: 80px"
                  @change="(value) => handleSortChange(record, value)"
              />
            </template>

            <!-- 修改操作列，展开所有按钮 -->
            <template v-if="column.dataIndex === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewCategoryDetails(record)">
                  <eye-outlined />
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editCategory(record)">
                  <edit-outlined />
                  编辑
                </a-button>
                <a-button type="link" size="small" danger @click="deleteCategory(record)">
                  <delete-outlined />
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>

    <!-- 查看分类详情弹窗 -->
    <a-modal
        v-model:visible="viewModalVisible"
        title="分类详细信息"
        :footer="null"
        width="600px"
        class="custom-modal view-category-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeViewModal"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="分类ID">{{ currentCategory.id }}</a-descriptions-item>
        <a-descriptions-item label="分类名称">{{ currentCategory.name }}</a-descriptions-item>
        <a-descriptions-item label="所属父级">{{ getParentCategoryName(currentCategory.parentId) }}</a-descriptions-item>
        <a-descriptions-item label="分类描述">{{ currentCategory.description || '无' }}</a-descriptions-item>
        <a-descriptions-item label="分类图标">
          <div class="category-icon-preview">
            <div class="icon-bg" :style="{ backgroundColor: currentCategory.iconBg || '#6554C0' }">
              <component :is="currentCategory.icon || 'AppstoreOutlined'" style="color: white; font-size: 22px;" />
            </div>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="排序值">{{ currentCategory.sort }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDateTime(currentCategory.createTime) }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ formatDateTime(currentCategory.updateTime) }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <div class="modal-footer">
        <a-button @click="viewModalVisible = false">关闭</a-button>
        <a-button type="primary" @click="editCategory(currentCategory)">编辑此分类</a-button>
      </div>
    </a-modal>

    <!-- 编辑分类信息弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑分类信息"
        @ok="handleEditSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="700px"
        class="custom-modal edit-category-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeEditModal"
    >
      <a-form :model="editForm" :rules="rules" ref="editFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类名称" name="name">
              <a-input v-model:value="editForm.name" placeholder="请输入分类名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属父级" name="parentId">
              <a-tree-select
                  v-model:value="editForm.parentId"
                  :tree-data="parentCategoryOptions"
                  placeholder="请选择父级分类"
                  tree-default-expand-all
                  allow-clear
                  :replace-fields="{ title: 'name', key: 'id', value: 'id' }"
                  :disabled="isEditingTopCategory"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="分类描述" name="description">
          <a-textarea v-model:value="editForm.description" placeholder="请输入分类描述" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类图标" name="icon">
              <div class="icon-selector">
                <div class="selected-icon" :style="{ backgroundColor: editForm.iconBg || '#6554C0' }">
                  <component :is="editForm.icon || 'AppstoreOutlined'" style="color: white" />
                </div>
                <a-popover
                    placement="bottomLeft"
                    trigger="click"
                    :content-style="{ width: '300px' }"
                >
                  <template #content>
                    <div class="icons-container">
                      <div
                          v-for="icon in iconOptions"
                          :key="icon"
                          class="icon-option"
                          @click="editForm.icon = icon"
                      >
                        <component :is="icon" />
                      </div>
                    </div>
                    <a-divider style="margin: 8px 0" />
                    <div class="color-picker">
                      <div
                          v-for="color in colorOptions"
                          :key="color"
                          class="color-option"
                          :style="{ backgroundColor: color }"
                          @click="editForm.iconBg = color"
                      ></div>
                    </div>
                  </template>
                  <a-button>选择图标和颜色</a-button>
                </a-popover>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序值" name="sort">
              <a-input-number v-model:value="editForm.sort" :min="0" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="editForm.status">
            <a-radio-button value="published">已发布</a-radio-button>
            <a-radio-button value="draft">草稿</a-radio-button>
            <a-radio-button value="archived">已归档</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加分类弹窗 -->
    <a-modal
        v-model:visible="addModalVisible"
        title="添加分类"
        @ok="handleAddSubmit"
        :confirmLoading="submitLoading"
        okText="添加"
        cancelText="取消"
        width="700px"
        class="custom-modal add-category-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeAddModal"
    >
      <a-form :model="addForm" :rules="rules" ref="addFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类名称" name="name">
              <a-input v-model:value="addForm.name" placeholder="请输入分类名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属父级" name="parentId">
              <a-tree-select
                  v-model:value="addForm.parentId"
                  :tree-data="parentCategoryOptions"
                  placeholder="请选择父级分类"
                  tree-default-expand-all
                  allow-clear
                  :replace-fields="{ title: 'name', key: 'id', value: 'id' }"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="分类描述" name="description">
          <a-textarea v-model:value="addForm.description" placeholder="请输入分类描述" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类图标" name="icon">
              <div class="icon-selector">
                <div class="selected-icon" :style="{ backgroundColor: addForm.iconBg || '#6554C0' }">
                  <component :is="addForm.icon || 'AppstoreOutlined'" style="color: white" />
                </div>
                <a-popover
                    placement="bottomLeft"
                    trigger="click"
                    :content-style="{ width: '300px' }"
                >
                  <template #content>
                    <div class="icons-container">
                      <div
                          v-for="icon in iconOptions"
                          :key="icon"
                          class="icon-option"
                          @click="addForm.icon = icon"
                      >
                        <component :is="icon" />
                      </div>
                    </div>
                    <a-divider style="margin: 8px 0" />
                    <div class="color-picker">
                      <div
                          v-for="color in colorOptions"
                          :key="color"
                          class="color-option"
                          :style="{ backgroundColor: color }"
                          @click="addForm.iconBg = color"
                      ></div>
                    </div>
                  </template>
                  <a-button>选择图标和颜色</a-button>
                </a-popover>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序值" name="sort">
              <a-input-number v-model:value="addForm.sort" :min="0" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="addForm.status">
            <a-radio-button value="published">已发布</a-radio-button>
            <a-radio-button value="draft">草稿</a-radio-button>
            <a-radio-button value="archived">已归档</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看关联文章弹窗 -->
    <a-modal
        v-model:visible="relatedArticlesModalVisible"
        title="关联文章列表"
        :footer="null"
        width="800px"
        class="custom-modal articles-modal"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }"
        :z-index="2000"
        @cancel="closeRelatedArticlesModal"
    >
      <a-alert
          type="info"
          :message="`${currentCategory.name} 分类下的文章列表 (共 ${currentCategory.articleCount} 篇)`"
          style="margin-bottom: 16px"
      />
      <a-table
          :columns="articleColumns"
          :data-source="relatedArticles"
          :loading="articleLoading"
          :pagination="{ pageSize: 5 }"
          size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getArticleStatusColor(record.status)">{{ getArticleStatusText(record.status) }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="openArticlePreview(record)">
              <eye-outlined />
              预览
            </a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  watch
} from 'vue';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ApartmentOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  NodeExpandOutlined,
  NodeCollapseOutlined,
  ExportOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60,
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    align: 'center',
    width: 60,
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    align: 'center',
    key: 'name',
    width: 180, // 增加宽度
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    align: 'center',
    ellipsis: true,
    width: 200, // 增加宽度
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 100,
    filters: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
      { text: '已归档', value: 'archived' },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
    sorter: true,
    width: 160, // 减少宽度
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    width: 320, // 增加宽度以容纳展开的按钮
    fixed: 'right',
  },
];

// 关联文章表格列定义
const articleColumns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    key: 'publishTime',
    width: 180,
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 100,
  },
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '分类总数',
    value: 24,
    change: 8.5,
    color: 'purple',
    icon: FolderOutlined,
  },
  {
    title: '本月新增分类',
    value: 5,
    change: 15.2,
    color: 'blue',
    icon: FolderOpenOutlined,
  },
  {
    title: '未分类文章',
    value: 12,
    change: -3.8,
    color: 'gold',
    icon: FileOutlined,
  },
  {
    title: '分类覆盖率',
    value: '96.4%',
    change: 2.1,
    color: 'green',
    icon: ApartmentOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  categoryName: '',
  status: undefined,
  createTime: [],
});

// 表格数据和加载状态
const loading = ref(false);
const categoryData = ref([]);
const treeSearchValue = ref('');
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);



// 模态框可见性和当前操作分类
const viewModalVisible = ref(false);
const editModalVisible = ref(false);
const addModalVisible = ref(false);
const relatedArticlesModalVisible = ref(false);
const submitLoading = ref(false);
const currentCategory = ref({})
const articleLoading = ref(false);
const relatedArticles = ref([]);

// 表单引用
const editFormRef = ref(null);
const addFormRef = ref(null);

// 编辑表单数据
const editForm = reactive({
  id: '',
  name: '',
  parentId: null,
  description: '',
  icon: 'AppstoreOutlined',
  iconBg: '#6554C0',
  sort: 0,
  status: 'published',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
});

// 添加表单数据
const addForm = reactive({
  name: '',
  parentId: null,
  description: '',
  icon: 'AppstoreOutlined',
  iconBg: '#6554C0',
  sort: 0,
  status: 'published',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
});

// 父级分类选项
const parentCategoryOptions = ref([]);

// 是否正在编辑顶级分类
const isEditingTopCategory = computed(() => {
  // 检查是否是顶级分类（无父级）
  return !editForm.parentId && editForm.id;
});

// 图标选项
const iconOptions = [
  'AppstoreOutlined',
  'FolderOutlined',
  'FileOutlined',
  'BookOutlined',
  'TagsOutlined',
  'SettingOutlined',
  'BarsOutlined',
  'ProfileOutlined',
  'PictureOutlined',
  'ShopOutlined',
  'GiftOutlined',
  'HeartOutlined',
  'StarOutlined',
  'TrophyOutlined'
];

// 颜色选项
const colorOptions = [
  '#6554C0', // 紫色
  '#4E7CF6', // 蓝色
  '#FAAD14', // 金色
  '#52C41A', // 绿色
  '#F5222D', // 红色
  '#13C2C2', // 青色
  '#722ED1', // 深紫色
  '#EB2F96', // 粉色
  '#FA8C16', // 橙色
  '#1890FF', // 亮蓝色
];

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分类名称长度应为2-50个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'change' },
    { type: 'number', message: '排序值必须为数字', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 组件挂载时获取数据
onMounted(() => {
  fetchCategoryData();
  initCategoryTree();
});

// 监听树搜索值变化
watch(treeSearchValue, (value) => {
  if (value) {
    const filtered = filterCategoryTree(categoryTree.value, value);
    expandFilteredNodes(filtered);
  } else {
    // 重置展开状态
    expandedKeys.value = categoryData.value
        .filter(item => item.parentId === null)
        .map(item => item.id.toString());
  }
});

// 获取分类数据
function fetchCategoryData() {
  loading.value = true;
  // 模拟API调用获取数据
  setTimeout(() => {
    const data = [];
    // 生成一些测试数据
    // 顶级分类
    for (let i = 1; i <= 6; i++) {
      data.push({
        id: i,
        name: `分类${i}`,
        parentId: null,
        parentName: '无',
        description: `这是顶级分类${i}的描述信息，用于测试显示效果。`,
        icon: iconOptions[i % iconOptions.length],
        iconBg: colorOptions[i % colorOptions.length],
        articleCount: Math.floor(Math.random() * 30) + 5,
        sort: 10 - i,
        status: i % 3 === 0 ? 'archived' : (i % 2 === 0 ? 'draft' : 'published'),
        createTime: new Date(2025, 0, i).getTime(),
        updateTime: new Date(2025, 1, i + 10).getTime(),
        seoTitle: `分类${i}的SEO标题`,
        seoKeywords: `分类${i},关键词${i},测试`,
        seoDescription: `这是分类${i}的SEO描述，用于搜索引擎优化。`
      });

      // 为每个顶级分类添加子分类
      for (let j = 1; j <= 3; j++) {
        const subId = i * 10 + j;
        data.push({
          id: subId,
          name: `子分类${i}-${j}`,
          parentId: i,
          parentName: `分类${i}`,
          description: `这是分类${i}的子分类${j}的描述信息。`,
          icon: iconOptions[(i + j) % iconOptions.length],
          iconBg: colorOptions[(i + j) % colorOptions.length],
          articleCount: Math.floor(Math.random() * 15),
          sort: j,
          status: j % 3 === 0 ? 'archived' : (j % 2 === 0 ? 'draft' : 'published'),
          createTime: new Date(2025, 1, i + j).getTime(),
          updateTime: new Date(2025, 2, i + j).getTime(),
          seoTitle: `子分类${i}-${j}的SEO标题`,
          seoKeywords: `子分类${i}-${j},关键词,测试`,
          seoDescription: `这是子分类${i}-${j}的SEO描述，用于搜索引擎优化。`
        });

        // 添加第三层分类（孙子节点）
        if (j === 1) {
          for (let k = 1; k <= 2; k++) {
            const grandChildId = subId * 10 + k;
            data.push({
              id: grandChildId,
              name: `三级分类${i}-${j}-${k}`,
              parentId: subId,
              parentName: `子分类${i}-${j}`,
              description: `这是三级分类${i}-${j}-${k}的描述信息。`,
              icon: iconOptions[(i + j + k) % iconOptions.length],
              iconBg: colorOptions[(i + j + k) % colorOptions.length],
              articleCount: Math.floor(Math.random() * 8),
              sort: k,
              status: k % 2 === 0 ? 'draft' : 'published',
              createTime: new Date(2025, 2, i + j + k).getTime(),
              updateTime: new Date(2025, 3, i + j + k).getTime(),
              seoTitle: `三级分类${i}-${j}-${k}的SEO标题`,
              seoKeywords: `三级分类${i}-${j}-${k},关键词,测试`,
              seoDescription: `这是三级分类${i}-${j}-${k}的SEO描述信息。`
            });
          }
        }
      }
    }

    categoryData.value = data;
    pagination.total = data.length;
    loading.value = false;

    // 初始化树形结构
    buildCategoryTree();

    // 初始化父分类选项
    updateParentCategoryOptions();
  }, 600);
}

// 构建分类树形结构
function buildCategoryTree() {
  // 过滤出顶级分类
  const topCategories = categoryData.value.filter(item => item.parentId === null);

  // 递归构建树
  categoryTree.value = topCategories.map(item => {
    return {
      id: item.id,
      name: item.name,
      count: item.articleCount,
      parentId: item.parentId,
      children: getChildren(item.id)
    };
  });

  // 默认展开顶级节点
  expandedKeys.value = topCategories.map(item => item.id.toString());
}

// 递归获取子分类
function getChildren(parentId) {
  const children = categoryData.value.filter(item => item.parentId === parentId);
  if (children.length === 0) {
    return null;
  }

  return children.map(item => {
    return {
      id: item.id,
      name: item.name,
      count: item.articleCount,
      parentId: item.parentId,
      children: getChildren(item.id)
    };
  });
}

// 筛选分类树
function filterCategoryTree(tree, keyword) {
  if (!tree) return [];

  return tree.filter(node => {
    // 检查当前节点是否匹配
    const match = node.name.toLowerCase().includes(keyword.toLowerCase());

    // 递归检查子节点
    let childrenMatch = [];
    if (node.children) {
      childrenMatch = filterCategoryTree(node.children, keyword);
    }

    // 保留当前节点的子节点（可能被过滤）
    if (childrenMatch.length > 0) {
      node.children = childrenMatch;
    }

    // 如果当前节点匹配或有匹配的子节点，则保留该节点
    return match || childrenMatch.length > 0;
  });
}

// 展开过滤后的节点
function expandFilteredNodes(tree) {
  expandedKeys.value = [];
  const collectKeys = (nodes) => {
    if (!nodes) return;

    nodes.forEach(node => {
      expandedKeys.value.push(node.id.toString());
      if (node.children) {
        collectKeys(node.children);
      }
    });
  };

  collectKeys(tree);
}


// 初始化分类树
function initCategoryTree() {
  // 这里可以加载初始的分类树数据
  // 当前已在fetchCategoryData中处理
}

// 更新父分类选项
function updateParentCategoryOptions() {
  // 创建用于选择的分类树数据
  parentCategoryOptions.value = [
    {
      id: null,
      name: '作为顶级分类',
      children: []
    }
  ];

  // 添加所有分类作为可选项，但排除自身及其子分类（编辑时）
  const excludeIds = [];
  if (editModalVisible.value && editForm.id) {
    // 找出所有子分类ID，避免循环引用
    const findAllChildrenIds = (parentId) => {
      excludeIds.push(parentId);
      categoryData.value
          .filter(item => item.parentId === parentId)
          .forEach(child => findAllChildrenIds(child.id));
    };

    findAllChildrenIds(editForm.id);
  }

  // 添加可选的父分类
  const eligibleCategories = categoryData.value.filter(item => !excludeIds.includes(item.id));

  // 构建父分类选择器数据
  const buildParentOptions = (parentId = null) => {
    const children = eligibleCategories.filter(item => item.parentId === parentId);

    return children.map(item => ({
      id: item.id,
      name: item.name,
      children: buildParentOptions(item.id)
    }));
  };

  // 将构建好的分类添加到根选项中
  parentCategoryOptions.value[0].children = buildParentOptions(null);
}

// 搜索处理
function handleSearch() {
  loading.value = true;
  // 实际项目中应调用API进行搜索
  setTimeout(() => {
    // 模拟搜索过滤
    const filteredData = categoryData.value.filter(category => {
      let match = true;

      if (searchForm.categoryName && !category.name.includes(searchForm.categoryName)) {
        match = false;
      }

      if (searchForm.status && category.status !== searchForm.status) {
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

    // 更新表格数据
    const displayData = [...filteredData];
    categoryData.value = displayData;
    pagination.total = displayData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetForm() {
  searchForm.categoryName = '';
  searchForm.status = undefined;
  searchForm.createTime = [];

  fetchCategoryData();
  message.success('表单已重置');
}

// 刷新数据
function handleRefresh() {
  fetchCategoryData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 表格变化处理（排序、分页等）
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    categoryData.value = [...categoryData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'number') {
        return order * (a[sorter.field] - b[sorter.field]);
      } else {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
    });
  }

  // 处理筛选
  if (filters.status && filters.status.length > 0) {
    categoryData.value = categoryData.value.filter(item => filters.status.includes(item.status));
  }
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    published: 'success',
    draft: 'warning',
    archived: 'default'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  };
  return statusMap[status] || '未知状态';
}

// 获取文章状态颜色
function getArticleStatusColor(status) {
  const colorMap = {
    published: 'green',
    draft: 'orange',
    pending: 'blue',
    rejected: 'red'
  };
  return colorMap[status] || 'default';
}

// 获取文章状态文本
function getArticleStatusText(status) {
  const textMap = {
    published: '已发布',
    draft: '草稿',
    pending: '待审核',
    rejected: '已拒绝'
  };
  return textMap[status] || '未知状态';
}

// 格式化日期时间
function formatDateTime(timestamp) {
  if (!timestamp) return '暂无';
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 获取父级分类名称
function getParentCategoryName(parentId) {
  if (!parentId) return '顶级分类';

  const parent = categoryData.value.find(item => item.id === parentId);
  return parent ? parent.name : '未知分类';
}

// 树节点选择事件处理
function onTreeSelect(selectedKeys, info) {
  if (selectedKeys.length > 0) {
    const selectedId = parseInt(selectedKeys[0]);
    // 过滤表格只显示选中的分类及其子分类
    filterTableByCategory(selectedId);
  } else {
    // 显示所有分类
    fetchCategoryData();
  }
}

// 根据分类ID过滤表格
function filterTableByCategory(categoryId) {
  // 找出所有子分类ID
  const childIds = [];
  const findAllChildren = (parentId) => {
    categoryData.value
        .filter(item => item.parentId === parentId)
        .forEach(child => {
          childIds.push(child.id);
          findAllChildren(child.id);
        });
  };

  findAllChildren(categoryId);

  // 过滤表格数据
  const filtered = categoryData.value.filter(item => item.id === categoryId || childIds.includes(item.id));
  categoryData.value = filtered;
  pagination.total = filtered.length;
  pagination.current = 1;
}

// 查看分类详情
function viewCategoryDetails(record) {
  currentCategory.value = { ...record };
  viewModalVisible.value = true;
  document.body.classList.add('modal-open');
}

// 编辑分类信息
function editCategory(record) {
  // 复制分类数据到编辑表单
  Object.keys(editForm).forEach(key => {
    if (key in record) {
      editForm[key] = record[key];
    }
  });

  // 更新父分类选项
  updateParentCategoryOptions();

  editModalVisible.value = true;
  document.body.classList.add('modal-open');
}

// 处理编辑提交
function handleEditSubmit() {
  editFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 更新表格中的数据
          const index = categoryData.value.findIndex(category => category.id === editForm.id);
          if (index !== -1) {
            // 获取父分类名称
            let parentName = '无';
            if (editForm.parentId) {
              const parent = categoryData.value.find(item => item.id === editForm.parentId);
              if (parent) {
                parentName = parent.name;
              }
            }

            categoryData.value[index] = {
              ...categoryData.value[index],
              ...editForm,
              parentName,
              updateTime: new Date().getTime()
            };
          }

          // 重建分类树
          buildCategoryTree();

          submitLoading.value = false;
          editModalVisible.value = false;
          document.body.classList.remove('modal-open'); // 确保移除 modal-open 类
          message.success('分类信息已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 处理添加分类提交
function handleAddSubmit() {
  addFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 获取父分类名称
          let parentName = '无';
          if (addForm.parentId) {
            const parent = categoryData.value.find(item => item.id === addForm.parentId);
            if (parent) {
              parentName = parent.name;
            }
          }

          // 创建新分类并添加到表格
          const newCategory = {
            id: categoryData.value.length + 1,
            name: addForm.name,
            parentId: addForm.parentId,
            parentName: parentName,
            description: addForm.description,
            icon: addForm.icon,
            iconBg: addForm.iconBg,
            articleCount: 0,
            sort: addForm.sort,
            status: addForm.status,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime(),
            seoTitle: addForm.seoTitle,
            seoKeywords: addForm.seoKeywords,
            seoDescription: addForm.seoDescription
          };

          categoryData.value.unshift(newCategory);
          pagination.total += 1;

          // 重建分类树
          buildCategoryTree();

          submitLoading.value = false;
          addModalVisible.value = false;
          document.body.classList.remove('modal-open'); // 确保移除 modal-open 类
          message.success('分类已添加');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 打开添加分类弹窗
function openAddCategoryModal() {
  // 重置添加表单
  Object.keys(addForm).forEach(key => {
    addForm[key] = key === 'status' ? 'published' : (key === 'icon' ? 'AppstoreOutlined' : (key === 'iconBg' ? '#6554C0' : (key === 'sort' ? 0 : '')));
  });

  // 更新父分类选项
  updateParentCategoryOptions();

  addModalVisible.value = true;
  document.body.classList.add('modal-open');
}



// 关闭查看分类详情弹窗
function closeViewModal() {
  viewModalVisible.value = false;
  document.body.classList.remove('modal-open');
}

// 关闭编辑分类弹窗
function closeEditModal() {
  editModalVisible.value = false;
  document.body.classList.remove('modal-open');
}

// 关闭添加分类弹窗
function closeAddModal() {
  addModalVisible.value = false;
  document.body.classList.remove('modal-open');
}

// 关闭关联文章弹窗
function closeRelatedArticlesModal() {
  relatedArticlesModalVisible.value = false;
  document.body.classList.remove('modal-open');
}

// 删除分类
function deleteCategory(record) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除"${record.name}"分类吗？`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        // 从数据源中移除当前分类
        categoryData.value = categoryData.value.filter(category => category.id !== record.id);

        // 更新分页信息
        pagination.total -= 1;

        // 如果当前分类在选中行中，也从选中行移除
        selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);

        loading.value = false;
        message.success(`分类"${record.name}"已成功删除`);
      }, 500);
    }
  });
}

// 批量删除分类
function handleBatchDelete() {
  if (!selectedRowKeys.value.length) {
    return;
  }

  // 获取选中分类的名称列表
  const selectedCategoryNames = categoryData.value
      .filter(item => selectedRowKeys.value.includes(item.id))
      .map(item => item.name)
      .join('、');

  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除以下分类吗？${selectedCategoryNames}`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        // 从数据源中移除所有选中的分类
        categoryData.value = categoryData.value.filter(
            category => !selectedRowKeys.value.includes(category.id)
        );

        // 更新分页信息
        pagination.total -= selectedRowKeys.value.length;

        // 清空选中状态
        selectedRowKeys.value = [];

        loading.value = false;
        message.success(`已成功删除${selectedRowKeys.value.length}个分类`);
      }, 500);
    }
  });
}

// 处理排序变更
function handleSortChange(record, value) {
  // 模拟API调用更新排序
  const index = categoryData.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    categoryData.value[index].sort = value;
    message.success(`已更新 ${record.name} 的排序值为 ${value}`);
  }
}



// 打开文章预览
function openArticlePreview(record) {
  message.info(`正在预览文章：${record.title}`);
  // 实际项目中应该跳转到文章预览页或打开预览弹窗
}

// 导出Excel
function exportExcel() {
  message.success('正在导出Excel文件，请稍候...');
  // 实际项目中接入Excel导出功能
  setTimeout(() => {
    message.success('Excel文件导出成功');
  }, 1500);
}

// 导出PDF
function exportPDF() {
  message.success('正在导出PDF文件，请稍候...');
  // 实际项目中接入PDF导出功能
  setTimeout(() => {
    message.success('PDF文件导出成功');
  }, 1500);
}
</script>

<style scoped>
/* 全局容器样式 */
.category-management-container {
  padding: 16px;
}

/* 数据统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  color: white;
  font-size: 22px;
}

.bg-purple {
  background: linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%);
}

.bg-blue {
  background: linear-gradient(135deg, #4E7CF6 0%, #7B97F6 100%);
}

.bg-gold {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
}

.bg-green {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #8C8C8C;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
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

/* 搜索表单卡片样式 */
.search-form-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* 操作按钮区域样式 */
.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.primary-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.primary-button:hover, .primary-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

.search-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.search-button:hover, .search-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 内容区样式 */
.content-row {
  margin-bottom: 24px;
}

/* 树形卡片样式 */
.tree-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-search {
  margin-bottom: 16px;
}

.category-tree {
  margin-top: 8px;
}

.tree-node-title {
  margin-right: 8px;
}

/* 分类表格样式 */
.category-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 分类图标容器 */
.category-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

/* 分类图标预览 */
.category-icon-preview {
  display: flex;
  align-items: center;
}

.category-icon-preview .icon-bg {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

/* 图标选择器 */
.icon-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.icons-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.icon-option {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.icon-option:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 弹窗底部自定义样式 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* 2. 修改二级按钮样式，添加紫色边框和文字*/
.secondary-button {
  color: #6554C0;
  border-color: #6554C0;
}

.secondary-button:hover, .secondary-button:focus {
  color: #7C68EE;
  border-color: #7C68EE;
  background: #f9f7ff;
}

a-button[type="link"] {
  color: #6554C0;
}

a-button[type="link"]:hover {
  color: #7C68EE;
}

.category-tree :deep(.ant-tree-node-selected) {
  background-color: #f0ebff !important;
}

.category-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: #f0ebff !important;
}

.category-table :deep(.ant-table-row-selected > td) {
  background: #f9f7ff !important;
}

.category-table :deep(.ant-table-column-sorter-up.active),
.category-table :deep(.ant-table-column-sorter-down.active) {
  color: #6554C0;
}

.category-table :deep(.ant-pagination-item-active) {
  border-color: #6554C0;
}

.category-table :deep(.ant-pagination-item-active a) {
  color: #6554C0;
}

.category-table :deep(.ant-pagination-item:hover) {
  border-color: #7C68EE;
}

.category-table :deep(.ant-pagination-item:hover a) {
  color: #7C68EE;
}

.category-table :deep(.ant-pagination-next:hover .ant-pagination-item-link),
.category-table :deep(.ant-pagination-prev:hover .ant-pagination-item-link) {
  color: #6554C0;
  border-color: #6554C0;
}

.modal-footer .ant-btn-primary {
  background-color: #6554C0;
  border-color: #6554C0;
}

.modal-footer .ant-btn-primary:hover,
.modal-footer .ant-btn-primary:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

.category-table :deep(.ant-btn-link) {
  color: #6554C0;
}

.category-table :deep(.ant-btn-link:hover) {
  color: #7C68EE;
}

.category-tree :deep(.ant-tree-switcher) {
  color: #6554C0;
}

.search-form :deep(.ant-input:focus),
.search-form :deep(.ant-input-focused),
.search-form :deep(.ant-select-focused .ant-select-selector),
.search-form :deep(.ant-picker-focused) {
  border-color: #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  color: #6554C0;
  border-color: #6554C0;
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before) {
  background-color: #6554C0;
}

:deep(.ant-radio-button-wrapper:hover) {
  color: #7C68EE;
}

/* 添加操作按钮样式优化 */
.category-table :deep(.ant-table-cell .ant-btn-link) {
  height: 28px;
  padding: 0 8px;
  border-radius: 4px;
}

.category-table :deep(.ant-table-cell .ant-btn-link:hover) {
  background-color: #f0ebff;
}

.category-table :deep(.ant-table-cell .ant-btn-link.ant-btn-dangerous:hover) {
  background-color: #fff1f0;
}

/* 增强表格行高 */
.category-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px;
}

/* 美化表格标题栏 */
.category-table :deep(.ant-table-thead > tr > th) {
  background-color: #f9f7ff;
  color: #6554C0;
  font-weight: 500;
  padding: 12px 8px;
}

/* 表格行悬停效果 */
.category-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9f7ff;
}

/* 模态框样式优化 */
:deep(.custom-modal .ant-modal-content),
:deep(.view-category-modal .ant-modal-content),
:deep(.edit-category-modal .ant-modal-content),
:deep(.add-category-modal .ant-modal-content),
:deep(.articles-modal .ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

:deep(.custom-modal .ant-modal-mask) {
  backdrop-filter: blur(5px);
}

/* 当模态框打开时禁用页面滚动 */
body.modal-open {
  overflow: hidden;
}

/* 模态框的全屏覆盖 */
:deep(.custom-modal .ant-modal-wrap) {
  z-index: 2000;
}

:deep(.custom-modal .ant-modal) {
  top: 20px;
  padding-bottom: 20px;
}

/* 媒体查询适配平板和手机 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stat-cards .ant-col {
    margin-bottom: 16px;
  }

  .search-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-form .ant-form-item {
    margin-right: 0;
    margin-bottom: 16px;
    width: 100%;
  }
}
</style>