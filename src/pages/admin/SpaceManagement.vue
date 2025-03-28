<template>
  <div class="space-management-container">
    <!-- 顶部标题和描述 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">空间管理</h1>
        <p class="page-desc">创建和管理用户空间，监控空间使用情况</p>
      </div>
      <a-button type="primary" class="create-button" @click="openCreateSpaceModal">
        <plus-outlined />
        创建空间
      </a-button>
    </div>

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
        <a-form-item label="空间名称" name="spaceName">
          <a-input v-model:value="searchForm.spaceName" placeholder="请输入空间名称" allowClear/>
        </a-form-item>
        <a-form-item label="空间级别" name="spaceLevel">
          <a-select
              v-model:value="searchForm.spaceLevel"
              placeholder="请选择空间级别"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="normal">普通版</a-select-option>
            <a-select-option value="pro">高级版</a-select-option>
            <a-select-option value="premium">旗舰版</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户ID" name="userId">
          <a-input v-model:value="searchForm.userId" placeholder="请输入用户ID" allowClear/>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" class="search-button">
              <search-outlined/>
              搜索
            </a-button>
            <a-button @click="resetForm" class="reset-button">
              <reload-outlined/>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 空间数据表格 -->
    <a-table
        :columns="columns"
        :data-source="spaceData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        row-key="id"
        class="space-table"
    >
      <template #bodyCell="{ column, record }">
        <!-- 空间名称列 -->
        <template v-if="column.dataIndex === 'spaceName'">
          <div class="space-name-cell">
            <folder-outlined class="folder-icon" />
            <span>{{ record.spaceName }}</span>
          </div>
        </template>

        <!-- 空间级别列 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <a-tag :color="getSpaceLevelColor(record.spaceLevel)">{{ getSpaceLevelName(record.spaceLevel) }}</a-tag>
        </template>

        <!-- 使用情况列 -->
        <template v-if="column.dataIndex === 'usage'">
          <div class="space-usage">
            <div class="space-usage-info">
              大小: {{ record.usedSize }} / {{ record.totalSize }}
            </div>
            <a-progress
                :percent="getUsagePercent(record.usedSize, record.totalSize)"
                :stroke-color="getUsageColor(record.usedSize, record.totalSize)"
                :show-info="false"
                size="small"
            />
            <div class="space-usage-count">
              数量: {{ record.fileCount }} / {{ record.fileLimit }}
            </div>
          </div>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="editSpace(record)">
              <edit-outlined />
            </a-button>
            <a-popconfirm
                title="确定要删除此空间吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteSpace(record)"
            >
              <a-button type="link" size="small" danger>
                <delete-outlined />
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建空间弹窗 -->
    <a-modal
        v-model:visible="createModalVisible"
        title="创建空间"
        @ok="handleCreateSubmit"
        :confirmLoading="submitLoading"
        okText="创建"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="createForm" :rules="rules" ref="createFormRef" layout="vertical">
        <a-form-item label="空间名称" name="spaceName">
          <a-input v-model:value="createForm.spaceName" placeholder="请输入空间名称"/>
        </a-form-item>
        <a-form-item label="空间级别" name="spaceLevel">
          <a-select v-model:value="createForm.spaceLevel" placeholder="请选择空间级别">
            <a-select-option value="normal">普通版 (100MB)</a-select-option>
            <a-select-option value="pro">高级版 (1GB)</a-select-option>
            <a-select-option value="premium">旗舰版 (10GB)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户ID" name="userId">
          <a-input v-model:value="createForm.userId" placeholder="请输入用户ID"/>
        </a-form-item>
        <a-form-item label="空间描述" name="description">
          <a-textarea v-model:value="createForm.description" placeholder="请输入空间描述" :rows="3"/>
        </a-form-item>
        <a-form-item name="enableAI">
          <a-checkbox v-model:checked="createForm.enableAI">启用智能AI功能</a-checkbox>
          <div class="checkbox-description">允许在此空间中使用AI智能标签、图像分析等功能</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑空间弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑空间信息"
        @ok="handleEditSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="editForm" :rules="rules" ref="editFormRef" layout="vertical">
        <a-form-item label="空间ID" name="id">
          <a-input v-model:value="editForm.id" disabled/>
        </a-form-item>
        <a-form-item label="空间名称" name="spaceName">
          <a-input v-model:value="editForm.spaceName" placeholder="请输入空间名称"/>
        </a-form-item>
        <a-form-item label="空间级别" name="spaceLevel">
          <a-select v-model:value="editForm.spaceLevel" placeholder="请选择空间级别">
            <a-select-option value="normal">普通版 (100MB)</a-select-option>
            <a-select-option value="pro">高级版 (1GB)</a-select-option>
            <a-select-option value="premium">旗舰版 (10GB)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户ID" name="userId">
          <a-input v-model:value="editForm.userId" placeholder="请输入用户ID"/>
        </a-form-item>
        <a-form-item label="空间描述" name="description">
          <a-textarea v-model:value="editForm.description" placeholder="请输入空间描述" :rows="3"/>
        </a-form-item>
        <a-form-item name="enableAI">
          <a-checkbox v-model:checked="editForm.enableAI">启用智能AI功能</a-checkbox>
          <div class="checkbox-description">允许在此空间中使用AI智能标签、图像分析等功能</div>
        </a-form-item>
      </a-form>
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
  PlusOutlined,
  ReloadOutlined,
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  UserOutlined,
  DatabaseOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 210,
    ellipsis: true,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
    key: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
    key: 'spaceLevel',
    width: 120,
    filters: [
      { text: '普通版', value: 'normal' },
      { text: '高级版', value: 'pro' },
      { text: '旗舰版', value: 'premium' },
    ],
    onFilter: (value, record) => record.spaceLevel === value,
  },
  {
    title: '使用情况',
    dataIndex: 'usage',
    key: 'usage',
    width: 180,
    sorter: (a, b) => {
      const percentA = parseFloat(a.usedSize) / parseFloat(a.totalSize);
      const percentB = parseFloat(b.usedSize) / parseFloat(b.totalSize);
      return percentA - percentB;
    },
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    sorter: (a, b) => a.createTime - b.createTime,
    render: (text) => formatDateTime(text),
  },
  {
    title: '编辑时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180,
    sorter: (a, b) => a.updateTime - b.updateTime,
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '总空间数',
    value: 15,
    change: 3.5,
    color: 'blue',
    icon: FolderOutlined,
  },
  {
    title: '活跃空间',
    value: 8,
    change: 12.2,
    color: 'green',
    icon: ThunderboltOutlined,
  },
  {
    title: '总存储使用量',
    value: '18.5 GB',
    change: 5.7,
    color: 'purple',
    icon: DatabaseOutlined,
  },
  {
    title: '用户数',
    value: 128,
    change: -2.1,
    color: 'gold',
    icon: UserOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  spaceName: '',
  spaceLevel: undefined,
  userId: '',
});

// 表格数据和加载状态
const loading = ref(false);
const spaceData = ref([]);
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

// 模态框可见性
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const submitLoading = ref(false);
const currentSpace = ref({});

// 表单引用
const createFormRef = ref(null);
const editFormRef = ref(null);

// 创建表单数据
const createForm = reactive({
  spaceName: '',
  spaceLevel: 'normal',
  userId: '',
  description: '',
  enableAI: false,
});

// 编辑表单数据
const editForm = reactive({
  id: '',
  spaceName: '',
  spaceLevel: '',
  userId: '',
  description: '',
  enableAI: false,
});

// 表单验证规则
const rules = {
  spaceName: [
    { required: true, message: '请输入空间名称', trigger: 'blur' },
    { min: 2, max: 20, message: '空间名称长度应为2-20个字符', trigger: 'blur' }
  ],
  spaceLevel: [
    { required: true, message: '请选择空间级别', trigger: 'change' }
  ],
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
  ],
};

// 组件挂载时获取数据
onMounted(() => {
  fetchSpaceData();
});

// 获取空间数据
function fetchSpaceData() {
  loading.value = true;
  // 模拟API调用获取数据
  setTimeout(() => {
    const data = [
      {
        id: '1876969367248326658',
        spaceName: '花猪猪',
        spaceLevel: 'normal',
        usedSize: '1.52 MB',
        totalSize: '100.00 MB',
        fileCount: 2,
        fileLimit: 100,
        userId: '18668407105803632XX',
        createTime: new Date('2025-01-08 20:29:04').getTime(),
        updateTime: new Date('2025-01-08 12:29:04').getTime(),
        description: '用于存储日常生活照片和记录',
        enableAI: true,
      },
      {
        id: '1891334624779476993',
        spaceName: '老六',
        spaceLevel: 'normal',
        usedSize: '786.46 KB',
        totalSize: '100.00 MB',
        fileCount: 2,
        fileLimit: 100,
        userId: '18721005547616460XX',
        createTime: new Date('2025-02-17 11:51:29').getTime(),
        updateTime: new Date('2025-02-17 11:51:28').getTime(),
        description: '工作文档存储空间',
        enableAI: false,
      },
      {
        id: '1877381251910950913',
        spaceName: '滑稽',
        spaceLevel: 'normal',
        usedSize: '1.09 MB',
        totalSize: '100.00 MB',
        fileCount: 3,
        fileLimit: 100,
        userId: '18736470650394828XX',
        createTime: new Date('2025-01-09 23:45:45').getTime(),
        updateTime: new Date('2025-01-09 23:45:45').getTime(),
        description: '趣味图片收藏',
        enableAI: true,
      },
      {
        id: '1876262285872250882',
        spaceName: '柠檬',
        spaceLevel: 'normal',
        usedSize: '760.93 KB',
        totalSize: '100.00 MB',
        fileCount: 1,
        fileLimit: 100,
        userId: '18736470650394828XX',
        createTime: new Date('2025-01-06 21:39:23').getTime(),
        updateTime: new Date('2025-01-06 13:39:23').getTime(),
        description: '个人项目素材库',
        enableAI: false,
      },
      {
        id: '1875019038692790273',
        spaceName: '月亮',
        spaceLevel: 'normal',
        usedSize: '1.76 MB',
        totalSize: '100.00 MB',
        fileCount: 2,
        fileLimit: 100,
        userId: '18714811610233159XX',
        createTime: new Date('2025-01-03 11:19:10').getTime(),
        updateTime: new Date('2025-01-03 11:19:09').getTime(),
        description: '夜景摄影作品集',
        enableAI: true,
      },
      {
        id: '1888784741426036738',
        spaceName: '微凉的空间',
        spaceLevel: 'normal',
        usedSize: '4.25 KB',
        totalSize: '100.00 MB',
        fileCount: 2,
        fileLimit: 100,
        userId: '18668407669685862XX',
        createTime: new Date('2025-02-10 10:59:09').getTime(),
        updateTime: new Date('2025-02-10 10:59:08').getTime(),
        description: '个人博客素材库',
        enableAI: false,
      },
      {
        id: '1877256747519877121',
        spaceName: 'memon',
        spaceLevel: 'normal',
        usedSize: '3.56 MB',
        totalSize: '100.00 MB',
        fileCount: 7,
        fileLimit: 100,
        userId: '18668407286200647XX',
        createTime: new Date('2025-01-09 15:31:01').getTime(),
        updateTime: new Date('2025-01-09 15:31:01').getTime(),
        description: '笔记与备忘录',
        enableAI: true,
      },
      {
        id: '1875018468925952001',
        spaceName: 'leocoder',
        spaceLevel: 'premium',
        usedSize: '4.28 MB',
        totalSize: '10000.00 MB',
        fileCount: 15,
        fileLimit: 10000,
        userId: '18664858817774796XX',
        createTime: new Date('2025-01-03 11:16:54').getTime(),
        updateTime: new Date('2025-01-03 11:16:53').getTime(),
        description: '项目开发资源库',
        enableAI: true,
      },
    ];

    spaceData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 搜索处理
function handleSearch() {
  loading.value = true;
  // 实际项目中应调用API进行搜索
  setTimeout(() => {
    // 模拟搜索过滤
    const filteredData = spaceData.value.filter(space => {
      let match = true;

      if (searchForm.spaceName && !space.spaceName.includes(searchForm.spaceName)) {
        match = false;
      }

      if (searchForm.spaceLevel && space.spaceLevel !== searchForm.spaceLevel) {
        match = false;
      }

      if (searchForm.userId && !space.userId.includes(searchForm.userId)) {
        match = false;
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
function resetForm() {
  searchForm.spaceName = '';
  searchForm.spaceLevel = undefined;
  searchForm.userId = '';
  fetchSpaceData();
  message.success('表单已重置');
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
    if (sorter.field === 'createTime' || sorter.field === 'updateTime') {
      spaceData.value = [...spaceData.value].sort((a, b) => {
        return order * (a[sorter.field] - b[sorter.field]);
      });
    }
  }
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 获取空间级别颜色
function getSpaceLevelColor(level) {
  const colorMap = {
    normal: 'blue',
    pro: 'purple',
    premium: 'green'
  };
  return colorMap[level] || 'default';
}

// 获取空间级别名称
function getSpaceLevelName(level) {
  const levelMap = {
    normal: '普通版',
    pro: '高级版',
    premium: '旗舰版'
  };
  return levelMap[level] || '未知级别';
}

// 获取使用百分比
function getUsagePercent(usedSize, totalSize) {
  const used = parseFloat(usedSize);
  const total = parseFloat(totalSize);
  if (isNaN(used) || isNaN(total) || total === 0) return 0;

  // 提取数值和单位
  const usedMatch = usedSize.match(/(\d+(\.\d+)?)\s*(\w+)/);
  const totalMatch = totalSize.match(/(\d+(\.\d+)?)\s*(\w+)/);

  if (!usedMatch || !totalMatch) return 0;

  const usedValue = parseFloat(usedMatch[1]);
  const usedUnit = usedMatch[3];
  const totalValue = parseFloat(totalMatch[1]);
  const totalUnit = totalMatch[3];

  // 转换为相同单位
  const unitMap = { 'KB': 1, 'MB': 1024, 'GB': 1024 * 1024 };
  const usedBytes = usedValue * (unitMap[usedUnit] || 1);
  const totalBytes = totalValue * (unitMap[totalUnit] || 1);

  return (usedBytes / totalBytes) * 100;
}

// 获取使用情况的颜色
function getUsageColor(usedSize, totalSize) {
  const percent = getUsagePercent(usedSize, totalSize);
  if (percent > 90) return '#ff4d4f';
  if (percent > 70) return '#faad14';
  return '#1890ff';
}

// 打开创建空间弹窗
function openCreateSpaceModal() {
  // 重置表单
  Object.keys(createForm).forEach(key => {
    createForm[key] = key === 'spaceLevel' ? 'normal' : (key === 'enableAI' ? false : '');
  });
  createModalVisible.value = true;
}

// 处理创建空间提交
function handleCreateSubmit() {
  createFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 创建新空间并添加到表格
          const newSpace = {
            id: `189${Date.now().toString().slice(-10)}`,
            spaceName: createForm.spaceName,
            spaceLevel: createForm.spaceLevel,
            usedSize: '0 KB',
            totalSize: createForm.spaceLevel === 'premium' ? '10000.00 MB' : (createForm.spaceLevel === 'pro' ? '1000.00 MB' : '100.00 MB'),
            fileCount: 0,
            fileLimit: createForm.spaceLevel === 'premium' ? 10000 : (createForm.spaceLevel === 'pro' ? 1000 : 100),
            userId: createForm.userId,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime(),
            description: createForm.description,
            enableAI: createForm.enableAI,
          };

          spaceData.value.unshift(newSpace);
          pagination.total += 1;

          // 更新统计卡片
          statCards[0].value += 1;
          statCards[0].change = 3.5 + (1 / 15) * 100;

          submitLoading.value = false;
          createModalVisible.value = false;
          message.success('空间已创建');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 编辑空间信息
function editSpace(record) {
  // 复制空间数据到编辑表单
  Object.keys(editForm).forEach(key => {
    if (key in record) {
      editForm[key] = record[key];
    }
  });
  editModalVisible.value = true;
}

// 处理编辑提交
function handleEditSubmit() {
  editFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 更新表格中的数据
          const index = spaceData.value.findIndex(space => space.id === editForm.id);
          if (index !== -1) {
            // 更新空间级别时可能需要调整容量限制
            if (spaceData.value[index].spaceLevel !== editForm.spaceLevel) {
              if (editForm.spaceLevel === 'premium') {
                editForm.totalSize = '10000.00 MB';
                editForm.fileLimit = 10000;
              } else if (editForm.spaceLevel === 'pro') {
                editForm.totalSize = '1000.00 MB';
                editForm.fileLimit = 1000;
              } else {
                editForm.totalSize = '100.00 MB';
                editForm.fileLimit = 100;
              }
            }

            // 更新编辑时间
            editForm.updateTime = new Date().getTime();

            spaceData.value[index] = { ...spaceData.value[index], ...editForm };
          }

          submitLoading.value = false;
          editModalVisible.value = false;
          message.success('空间信息已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 删除空间
function deleteSpace(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    spaceData.value = spaceData.value.filter(space => space.id !== record.id);
    pagination.total -= 1;

    // 更新统计卡片
    statCards[0].value -= 1;

    loading.value = false;
    message.success('空间已删除');
  }, 500);
}
</script>

<style scoped>
/* 全局容器样式 */
.space-management-container {
  padding: 16px;
}

/* 页面标题区域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.page-desc {
  font-size: 14px;
  color: #8c8c8c;
}

.create-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.create-button:hover, .create-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
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

.bg-blue {
  background: linear-gradient(135deg, #6554C0 0%, #8A7CE0 100%);
}

.bg-green {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
}

.bg-purple {
  background: linear-gradient(135deg, #4E7CF6 0%, #7B97F6 100%);
}

.bg-gold {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
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

.search-button {
  background-color: #6554C0;
  border-color: #6554C0;
}

.search-button:hover, .search-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

/* 表格样式 */
.space-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 空间名称单元格样式 */
.space-name-cell {
  display: flex;
  align-items: center;
}

.folder-icon {
  color: #6554C0;
  margin-right: 8px;
  font-size: 18px;
}

/* 空间使用情况样式 */
.space-usage {
  width: 180px;
}

.space-usage-info {
  font-size: 13px;
  margin-bottom: 6px;
}

.space-usage-count {
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 4px;
}

/* 复选框描述样式 */
.checkbox-description {
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 4px;
  margin-left: 24px;
}
</style>