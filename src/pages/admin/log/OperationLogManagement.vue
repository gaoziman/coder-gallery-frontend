<template>
  <div class="operation-log-container">
    <div class="ol-page-container">
      <!-- 操作日志管理页面标题区域 -->
      <div class="ol-header">
        <div class="ol-header-left">
          <div class="ol-icon-container">
            <code-outlined class="ol-icon"/>
          </div>
          <div class="ol-header-info">
            <div class="ol-title-row">
              <h1 class="ol-title">操作日志管理</h1>
              <a-tag color="#6554C0">日志管理</a-tag>
            </div>
            <p class="ol-description">
              管理系统用户的操作记录，支持查询、筛选和导出操作历史数据
            </p>
          </div>
        </div>

        <div class="ol-header-right">
          <div class="ol-metrics">
            <div class="ol-metric-item">
              <div class="ol-metric-label">
                <calendar-outlined/>
                今日操作
              </div>
              <div class="ol-metric-value">{{ headerMetrics.todayOperations }}</div>
            </div>
            <div class="ol-divider"></div>
            <div class="ol-metric-item">
              <div class="ol-metric-label">
                <user-outlined/>
                活跃用户
              </div>
              <div class="ol-metric-value">{{ headerMetrics.activeUsers }}</div>
            </div>
            <div class="ol-divider"></div>
            <div class="ol-metric-item">
              <div class="ol-metric-label">
                <warning-outlined/>
                异常操作
              </div>
              <div class="ol-metric-value">{{ headerMetrics.exceptionOperations }}</div>
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
            <!-- 操作用户 -->
            <a-form-item label="操作用户" name="operator">
              <a-input v-model:value="searchForm.operator" placeholder="请输入用户名称" allowClear/>
            </a-form-item>

            <!-- 操作类型 -->
            <a-form-item label="操作类型" name="operationType">
              <a-select
                  v-model:value="searchForm.operationType"
                  placeholder="请选择操作类型"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="create">新增</a-select-option>
                <a-select-option value="update">修改</a-select-option>
                <a-select-option value="delete">删除</a-select-option>
                <a-select-option value="query">查询</a-select-option>
                <a-select-option value="import">导入</a-select-option>
                <a-select-option value="export">导出</a-select-option>
                <a-select-option value="other">其他</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 操作状态 -->
            <a-form-item label="操作状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="0">成功</a-select-option>
                <a-select-option value="1">失败</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 操作模块 -->
            <a-form-item label="操作模块" name="module">
              <a-select
                  v-model:value="searchForm.module"
                  placeholder="请选择模块"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="用户管理">用户管理</a-select-option>
                <a-select-option value="图片管理">图片管理</a-select-option>
                <a-select-option value="空间管理">空间管理</a-select-option>
                <a-select-option value="分类管理">分类管理</a-select-option>
                <a-select-option value="标签管理">标签管理</a-select-option>
                <a-select-option value="评论管理">评论管理</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 操作时间 -->
            <a-form-item label="操作时间" name="operationTime">
              <a-range-picker
                  v-model:value="searchForm.operationTime"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY-MM-DD"
                  style="width: 240px"
                  @change="handleDateChange"
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
          <a-button type="primary" @click="handleExport">
            <export-outlined/>
            导出数据
          </a-button>
          <a-button @click="handleRefresh">
            <reload-outlined/>
            刷新
          </a-button>
          <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
            <delete-outlined/>
            批量删除
          </a-button>
          <a-button :disabled="!hasSelected" @click="handleBatchAnalyze">
            <bar-chart-outlined/>
            批量分析
          </a-button>
        </a-space>
      </div>

      <div class="operation-right">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="list">
            <unordered-list-outlined/>
            列表视图
          </a-radio-button>
          <a-radio-button value="chart">
            <line-chart-outlined/>
            图表视图
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'">
      <a-table
          :columns="columns"
          :data-source="logData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          @change="handleTableChange"
          row-key="id"
      >
        <template #bodyCell="{ column, record }">

          <template v-if="column.dataIndex === 'operator'">
            <div class="user-info">
              <UserAvatar
                  :username="record.username"
                  :userId="record.userId"
                  :avatar="record.avatar"
                  :status="record.status"
                  size="small"
              />
              <div class="user-identity">
                <span class="username">{{ record.username || '未知用户' }}</span>
                <span class="role-tag" :class="getUserRoleClass(record.role)">
                  {{ getUserRole(record.role) }}
                </span>
              </div>
            </div>
          </template>

          <!-- 操作状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="record.status === 0 ? 'success' : 'error'"
                :text="record.status === 0 ? '成功' : '失败'"
            />
          </template>

          <!-- 操作类型列 -->
          <template v-if="column.dataIndex === 'operationType'">
            <a-tag :color="getOperationTypeColor(record.operationType)">
              {{ getOperationTypeText(record.operationType) }}
            </a-tag>
          </template>

          <!-- 操作IP列 -->
          <template v-if="column.dataIndex === 'ip'">
            <div class="ip-info">
              <environment-outlined style="margin-right: 5px;"/>
              {{ record.ip }}
            </div>
          </template>

          <!-- 操作时间列 -->
          <template v-if="column.dataIndex === 'operationTime'">
            {{ formatDateTime(record.operationTime) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewLogDetails(record)">
                <eye-outlined/>
                详情
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="handleRepeat(record)">
                      <redo-outlined/>
                      重复操作
                    </a-menu-item>
                    <a-menu-item key="2" @click="handleTrack(record)">
                      <radar-chart-outlined/>
                      追踪关联
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

    <!-- 图表视图 -->
    <div v-else-if="viewMode === 'chart'" class="chart-view-container">
      <a-spin :spinning="loading">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-card title="操作类型分布" :bordered="false">
              <div class="chart-container">
                <div id="operationTypeChart" style="height: 300px;"></div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="操作趋势分析" :bordered="false">
              <div class="chart-container">
                <div id="operationTrendChart" style="height: 300px;"></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 16px;">
          <a-col :span="24">
            <a-card title="用户操作热力图" :bordered="false">
              <div class="chart-container">
                <div id="userOperationHeatmap" style="height: 400px;"></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>

    <!-- 操作日志详情弹窗 -->
    <a-modal
        v-model:visible="logDetailVisible"
        title="操作日志详情"
        width="720px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-log-modal"
    >
      <template v-if="selectedLog">
        <div class="log-detail-header">
          <div class="user-profile">
            <UserAvatar
                :username="selectedLog.username"
                :userId="selectedLog.userId"
                :avatar="selectedLog.avatar"
                :status="selectedLog.status"
                size="large"
            />
            <div class="user-info">
              <div class="user-name">{{ selectedLog.username }}</div>
            </div>
          </div>
          <div class="log-status">
            <a-badge
                :status="selectedLog.status === 0? 'success' : 'error'"
                :text="selectedLog.status === 0 ? '登录成功' : '登录失败'"
            />
          </div>
        </div>

        <a-divider/>

        <div class="log-detail-content">
          <div class="log-section">
            <div class="section-title">
              <info-circle-outlined/>
              <span>基本信息</span>
            </div>
            <div class="log-info-table">
              <div class="log-info-row">
                <div class="log-label">操作类型</div>
                <div class="log-value">
                  <a-tag :color="getOperationTypeColor(selectedLog.operationType)">
                    {{ getOperationTypeText(selectedLog.operationType) }}
                  </a-tag>
                </div>
              </div>
              <div class="log-info-row">
                <div class="log-label">操作模块</div>
                <div class="log-value">{{ getModuleText(selectedLog.module) }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">操作时间</div>
                <div class="log-value">{{ formatDateTime(selectedLog.operationTime) }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">执行耗时</div>
                <div class="log-value">{{ selectedLog.duration }} ms</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">IP地址</div>
                <div class="log-value">{{ selectedLog.ip }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">操作来源</div>
                <div class="log-value">{{ selectedLog.source }}</div>
              </div>
            </div>
          </div>

          <!-- 修复请求参数显示部分 -->
          <div class="log-section">
            <div class="section-title">
              <code-outlined/>
              <span>请求信息</span>
            </div>
            <div class="log-request-info">
              <!-- 请求方法行 -->
              <div class="log-info-row">
                <div class="log-label">请求方法</div>
                <div class="log-value">
                  <span class="request-method" :class="getMethodClass(selectedLog.method || 'GET')">
                    {{ selectedLog.method || 'GET' }}
                  </span>
                </div>
              </div>

              <!-- 请求URL行 -->
              <div class="log-info-row">
                <div class="log-label">请求URL</div>
                <div class="log-value request-url">{{ selectedLog.url || '-' }}</div>
              </div>

              <!-- 请求参数行 -->
              <div class="log-info-row">
                <div class="log-label">请求参数</div>
                <div class="log-value">
                  <a-button type="link" size="small" @click="toggleParamVisible" class="param-toggle-btn">
                    {{ paramVisible ? '收起' : '展开' }}
                    <component :is="paramVisible ? 'up-outlined' : 'down-outlined'"/>
                  </a-button>
                </div>
              </div>

              <!-- 参数内容块 -->
              <div v-if="paramVisible" class="log-code-block">
                <pre v-if="selectedLog.params">{{ formatJson(selectedLog.params) }}</pre>
                <pre v-else>{ }</pre>
              </div>
            </div>
          </div>

          <div class="log-section">
            <div class="section-title">
              <file-text-outlined/>
              <span>操作详情</span>
            </div>
            <div class="log-detail-description">
              {{ selectedLog.description }}
            </div>
            <div class="log-changes" v-if="selectedLog.changes">
              <div class="changes-title">数据变更记录</div>
              <div class="changes-table">
                <div class="changes-header">
                  <div class="changes-field">字段</div>
                  <div class="changes-before">变更前</div>
                  <div class="changes-after">变更后</div>
                </div>
                <div v-for="(change, index) in selectedLog.changes" :key="index" class="changes-row">
                  <div class="changes-field">{{ change.field }}</div>
                  <div class="changes-before">{{ change.before || '-' }}</div>
                  <div class="changes-after">{{ change.after || '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.status === 'fail'" class="log-section error-section">
            <div class="section-title danger-title">
              <warning-outlined/>
              <span>错误信息</span>
            </div>
            <div class="log-error-message">
              {{ selectedLog.errorMsg || '未知错误' }}
            </div>
            <div v-if="selectedLog.stackTrace" class="log-code-block">
              <pre>{{ selectedLog.stackTrace }}</pre>
            </div>
          </div>
        </div>

        <div class="log-detail-actions">
          <a-space>
            <a-button @click="logDetailVisible = false">
              关闭
            </a-button>
            <a-button v-if="selectedLog.status === 'success'" type="primary" @click="handleRepeat(selectedLog)">
              <template #icon>
                <redo-outlined/>
              </template>
              重复操作
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
  computed,
  onMounted, watch, nextTick, onBeforeUnmount
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  WarningOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  LineChartOutlined,
  BarChartOutlined,
  UserOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  CodeOutlined,
  FileTextOutlined,
  RedoOutlined,
  RadarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons-vue';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  CalendarComponent
} from 'echarts/components';
import {
  getOperationLogDetailUsingGet,
  deleteOperationLogUsingDelete,
  batchDeleteOperationLogsUsingDelete,
  exportOperationLogsUsingGet,
  listOperationLogsUsingGet, getOperationLogStatisticsUsingGet
} from '@/api/caozuorizhiguanli';
import TrendBadge from "@/components/common/TrendBadge.vue";
import {BarChart, HeatmapChart, LineChart, PieChart} from "echarts/charts";
import {LabelLayout, UniversalTransition} from "echarts/features";
import {CanvasRenderer} from "echarts/renderers";
import UserAvatar from "@/components/common/UserAvatar.vue";

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  CalendarComponent,
  PieChart,
  LineChart,
  HeatmapChart,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);



// 定时器引用
const refreshTimer = ref(null);

// 视图模式
const viewMode = ref('list');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 弹窗状态
const logDetailVisible = ref(false);
const selectedLog = ref(null);
const paramVisible = ref(false);


// 图表实例引用
const operationTypeChart = ref(null);
const operationTrendChart = ref(null);
const userOperationHeatmap = ref(null);

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 170,
  },
  {
    title: '操作用户',
    dataIndex: 'operator',
    align: 'center',
    width: 180
  },
  {
    title: '操作类型',
    dataIndex: 'operationType',
    align: 'center',
    width: 100,
  },
  {
    title: '操作模块',
    dataIndex: 'module',
    align: 'left',
    width: 120
  },
  {
    title: '操作描述',
    dataIndex: 'description',
    align: 'left',
    ellipsis: true,
    width: 150
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    align: 'center',
    width: 120,
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    align: 'center',
    width: 130,
  },
  {
    title: '操作时间',
    dataIndex: 'operationTime',
    align: 'center',
    width: 170,
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 160,
    fixed: 'right'
  }
];

// 顶部卡片数据
const statCards = ref([
  {
    title: '总操作次数',
    value: '加载中...',
    change: 0,
    color: 'purple',
    icon: CodeOutlined,
  },
  {
    title: '本月操作量',
    value: '加载中...',
    change: 0,
    color: 'blue',
    icon: CalendarOutlined,
  },
  {
    title: '操作成功率',
    value: '加载中...',
    change: 0,
    color: 'green',
    icon: CheckCircleOutlined,
  },
  {
    title: '异常操作',
    value: '加载中...',
    change: 0,
    color: 'gold',
    icon: WarningOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  operator: '',
  operationType: undefined,
  status: undefined,
  module: undefined,
  operationTime: [],
});

// 日志数据和加载状态
const loading = ref(false);
const logData = ref([]);
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
    fetchLogData(); // 重新获取数据
  }
});


// 监听视图模式变化，当切换到图表视图时，初始化图表
watch(() => viewMode.value, (newValue) => {
  if (newValue === 'chart') {
    nextTick(() => {
      initCharts();
    });
  }
});




// 获取操作类型文本
const getOperationTypeText = (type) => {
  const textMap = {
    create: '新增',
    update: '修改',
    delete: '删除',
    query: '查询',
    import: '导入',
    export: '导出',
    other: '其他'
  };
  return textMap[type] || textMap.other;
};

// 获取模块文本
const getModuleText = (module) => {
  const moduleMap = {
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    system: '系统设置',
    content: '内容管理',
    finance: '财务管理',
    product: '产品管理',
    hr: '人力资源',
    marketing: '营销管理',
    dashboard: '仪表盘'
  };
  return moduleMap[module] || module;
};


// 根据用户名判断用户角色
const getUserRole = (role) => {
  if (!role) return '未知';

  const roleMap = {
    'user': '普通用户',
    'admin': '管理员',
    'superadmin': '超级管理员'
  };

  return roleMap[role] || '未知用户';
};

// 根据角色返回样式类名
const getUserRoleClass = (role) => {
  if (!role) return 'role-unknown';

  const classMap = {
    'user': 'role-user',
    'admin': 'role-admin',
    'superadmin': 'role-superadmin'
  };

  return classMap[role] || 'role-unknown';
};


// 统计指标数据
const headerMetrics = ref({
  todayOperations: 0,
  activeUsers: 0,
  exceptionOperations: 0
});

const handleDateChange = () => {
  pagination.current = 1; // 重置到第一页
  fetchLogData(); // 获取数据
};

// 设置定时刷新
const setupAutoRefresh = () => {
  // 每60秒刷新一次统计数据
  refreshTimer.value = setInterval(() => {
    fetchStatistics();
  }, 60000);
};

// 清除定时刷新
const clearAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
};


// 添加获取统计数据的函数
const fetchStatistics = async () => {
  try {
    const response = await getOperationLogStatisticsUsingGet();

    if (response.data && response.data.code === 200 && response.data.data) {
      const stats = response.data.data;

      // 更新卡片数据
      statCards.value[0].value = stats.totalOperations.toLocaleString();
      statCards.value[0].change = stats.totalOperationsGrowthRate;

      statCards.value[1].value = stats.monthlyOperations.toLocaleString();
      statCards.value[1].change = stats.monthlyOperationsGrowthRate;

      statCards.value[2].value = stats.successRate.toFixed(1) + '%';
      statCards.value[2].change = stats.successRateGrowthRate;

      statCards.value[3].value = stats.exceptionOperations.toLocaleString();
      statCards.value[3].change = stats.exceptionOperationsGrowthRate;

      // 更新页面头部的统计指标
      headerMetrics.value = {
        todayOperations: stats.todayOperations,
        activeUsers: stats.activeUsers,
        exceptionOperations: stats.exceptionOperations
      };
    } else {
      message.error(response.data?.message || '获取统计数据失败');
    }
  } catch (error) {
    console.error('获取统计数据异常:', error);
    message.error('获取统计数据发生异常');
  }
};

// 创建并初始化所有图表
const initCharts = () => {
  initOperationTypeChart();
  initOperationTrendChart();
  initUserOperationHeatmap();

  // 添加窗口大小改变时重新调整图表大小的监听器
  window.addEventListener('resize', resizeCharts);
};

// 调整所有图表大小
const resizeCharts = () => {
  operationTypeChart.value && operationTypeChart.value.resize();
  operationTrendChart.value && operationTrendChart.value.resize();
  userOperationHeatmap.value && userOperationHeatmap.value.resize();
};

// 销毁所有图表实例
const disposeCharts = () => {
  operationTypeChart.value && operationTypeChart.value.dispose();
  operationTrendChart.value && operationTrendChart.value.dispose();
  userOperationHeatmap.value && userOperationHeatmap.value.dispose();
};

// 初始化操作类型分布饼图
const initOperationTypeChart = () => {
  // 计算各操作类型的数量
  const typeCount = {};
  logData.value.forEach(log => {
    if (typeCount[log.operationType]) {
      typeCount[log.operationType]++;
    } else {
      typeCount[log.operationType] = 1;
    }
  });

  // 准备图表数据
  const chartData = Object.keys(typeCount).map(key => ({
    name: getOperationTypeText(key),
    value: typeCount[key],
    itemStyle: {
      color: getOperationTypeColor(key)
    }
  }));

  // 初始化图表
  const chartDom = document.getElementById('operationTypeChart');
  operationTypeChart.value = echarts.init(chartDom);

  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: chartData.map(item => item.name)
    },
    series: [
      {
        name: '操作类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };

  // 应用图表配置
  operationTypeChart.value.setOption(option);
};

// 初始化操作趋势分析折线图
const initOperationTrendChart = () => {
  // 按日期分组操作数据
  const dateGroups = {};
  const statusGroups = {success: {}, fail: {}};

  logData.value.forEach(log => {
    const date = dayjs(log.operationTime).format('MM-DD');

    // 统计每天的总操作次数
    if (dateGroups[date]) {
      dateGroups[date]++;
    } else {
      dateGroups[date] = 1;
    }

    // 统计每天成功和失败的操作次数
    if (log.status === 'success') {
      if (statusGroups.success[date]) {
        statusGroups.success[date]++;
      } else {
        statusGroups.success[date] = 1;
      }
    } else {
      if (statusGroups.fail[date]) {
        statusGroups.fail[date]++;
      } else {
        statusGroups.fail[date] = 1;
      }
    }
  });

  // 确保日期是排序的
  const dates = Object.keys(dateGroups).sort();

  // 准备图表数据
  const totalData = dates.map(date => dateGroups[date] || 0);
  const successData = dates.map(date => statusGroups.success[date] || 0);
  const failData = dates.map(date => statusGroups.fail[date] || 0);

  // 初始化图表
  const chartDom = document.getElementById('operationTrendChart');
  operationTrendChart.value = echarts.init(chartDom);

  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['总操作', '成功', '失败']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总操作',
        type: 'line',
        smooth: true,
        data: totalData,
        lineStyle: {
          width: 3,
          color: '#6554C0'
        },
        showSymbol: false
      },
      {
        name: '成功',
        type: 'line',
        smooth: true,
        data: successData,
        lineStyle: {
          width: 2,
          color: '#52C41A'
        },
        showSymbol: false
      },
      {
        name: '失败',
        type: 'line',
        smooth: true,
        data: failData,
        lineStyle: {
          width: 2,
          color: '#F5222D'
        },
        showSymbol: false
      }
    ]
  };

  // 应用图表配置
  operationTrendChart.value.setOption(option);
};

// 初始化用户操作热力图
const initUserOperationHeatmap = () => {
  // 按用户和操作类型分组统计数据
  const userOperations = {};
  const users = new Set();
  const operationTypes = new Set();

  logData.value.forEach(log => {
    users.add(log.operator);
    operationTypes.add(log.operationType);

    const key = `${log.operator}-${log.operationType}`;
    if (userOperations[key]) {
      userOperations[key]++;
    } else {
      userOperations[key] = 1;
    }
  });

  // 准备热力图数据
  const usersArray = Array.from(users);
  const operationTypesArray = Array.from(operationTypes);
  const heatmapData = [];

  usersArray.forEach((user, userIndex) => {
    operationTypesArray.forEach((type, typeIndex) => {
      const key = `${user}-${type}`;
      const value = userOperations[key] || 0;

      if (value > 0) {
        heatmapData.push([typeIndex, userIndex, value]);
      }
    });
  });

  // 初始化图表
  const chartDom = document.getElementById('userOperationHeatmap');
  userOperationHeatmap.value = echarts.init(chartDom);

  // 设置图表选项
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const user = usersArray[params.value[1]];
        const type = getOperationTypeText(operationTypesArray[params.value[0]]);
        return `${user}: ${type} ${params.value[2]} 次`;
      }
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: operationTypesArray.map(type => getOperationTypeText(type)),
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: usersArray,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20']
      }
    },
    series: [
      {
        name: '操作次数',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 应用图表配置
  userOperationHeatmap.value.setOption(option);
};

// 获取日志数据
const fetchLogData = async () => {
  loading.value = true;

  try {
    // 构建查询参数
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      operationType: searchForm.operationType || undefined,
      status: searchForm.status || undefined,
      module: searchForm.module || undefined,
    };

    // 处理时间范围
    if (searchForm.operationTime && searchForm.operationTime.length === 2) {
      if (searchForm.operationTime[0] && searchForm.operationTime[1]) {
        params.createTimeStart = searchForm.operationTime[0].format('YYYY-MM-DD 00:00:00');
        params.createTimeEnd = searchForm.operationTime[1].format('YYYY-MM-DD 23:59:59');
      }
    }

    // 在请求前输出参数，便于调试
    console.log('查询参数:', params);

    const response = await listOperationLogsUsingGet(params);

    if (response.data && response.data.code === 200 && response.data.data) {
      logData.value = response.data.data.records || [];
      pagination.total = response.data.data.total || 0;
      console.log('查询结果总数:', pagination.total);
    } else {
      message.error(response.data?.message || '获取操作日志失败');
    }
  } catch (error) {
    console.error('获取操作日志异常:', error);
    message.error('获取操作日志发生异常');
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

// 获取操作类型颜色
const getOperationTypeColor = (type) => {
  const colorMap = {
    create: '#52C41A',    // 绿色
    update: '#1890FF',    // 蓝色
    delete: '#F5222D',    // 红色
    query: '#722ED1',     // 紫色
    import: '#FAAD14',    // 黄色
    export: '#13C2C2',    // 青色
    other: '#8C8C8C'      // 灰色
  };
  return colorMap[type] || colorMap.other;
};


/**
 * 格式化JSON数据为美观的字符串
 * 能够处理各种输入格式，包括对象、字符串、数组、null和undefined
 * @param {any} json - 要格式化的数据
 * @return {string} 格式化后的字符串
 */
const formatJson = (json) => {
  try {
    // 处理null和undefined
    if (json === null) return "null";
    if (json === undefined) return "undefined";

    // 如果json已经是字符串格式，尝试解析它
    if (typeof json === 'string') {
      try {
        // 尝试将字符串解析为JSON对象
        const parsed = JSON.parse(json);
        // 解析成功，以缩进格式返回
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        // 解析失败，说明不是标准JSON字符串
        // 检查是否是逗号分隔的键值对格式 (如 "a=1,b=2")
        if (json.includes('=') && json.includes(',')) {
          try {
            const obj = {};
            json.split(',').forEach(pair => {
              const [key, value] = pair.split('=');
              if (key && value !== undefined) {
                obj[key.trim()] = value.trim();
              }
            });
            return JSON.stringify(obj, null, 2);
          } catch (err) {
            // 转换失败，直接返回原字符串
            return json;
          }
        }
        // 不是特殊格式，直接返回原字符串
        return json;
      }
    }

    // 如果是对象或数组，格式化它
    if (typeof json === 'object') {
      return JSON.stringify(json, null, 2);
    }

    // 其他类型，直接转为字符串
    return String(json);
  } catch (e) {
    // 捕获所有可能的错误，尽量返回有意义的内容
    console.error('格式化JSON时出错:', e);
    if (typeof json === 'object') {
      try {
        return JSON.stringify(json);
      } catch (stringifyError) {
        return '[无法序列化的对象]';
      }
    }
    return String(json);
  }
};

// 切换请求参数显示状态
const toggleParamVisible = () => {
  paramVisible.value = !paramVisible.value;
};

// 搜索处理
const handleSearch = () => {
  // 重置到第一页
  pagination.current = 1;
  fetchLogData();
};

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.operator = '';
  searchForm.operationType = undefined;
  searchForm.status = undefined;
  searchForm.module = undefined;
  searchForm.operationTime = [];

  // 重置分页到第一页
  pagination.current = 1;
  // 重新获取所有数据
  fetchLogData();

  message.success('搜索条件已重置');
};

// 刷新表格数据
const handleRefresh = () => {
  fetchLogData();
  fetchStatistics();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
};

// 导出数据
const handleExport = async () => {
  loading.value = true;

  try {
    // 构建导出参数，基于当前搜索条件
    const params = {
      operator: searchForm.operator || undefined,
      operationType: searchForm.operationType || undefined,
      status: searchForm.status || undefined,
      module: searchForm.module || undefined,
    };

    // 处理时间范围
    if (searchForm.operationTime && searchForm.operationTime.length === 2) {
      if (searchForm.operationTime[0] && searchForm.operationTime[1]) {
        params.startTime = searchForm.operationTime[0].format('YYYY-MM-DD 00:00:00');
        params.endTime = searchForm.operationTime[1].format('YYYY-MM-DD 23:59:59');
      }
    }

    const response = await exportOperationLogsUsingGet(params);

    if (response.data && response.data.code === 200 && response.data.data) {
      // 如果服务器返回了文件下载链接
      const downloadUrl = response.data.data;

      // 创建一个隐藏的a标签来下载文件
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `操作日志_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('操作日志导出成功');
    } else {
      message.error(response.data?.message || '导出操作日志失败');
    }
  } catch (error) {
    console.error('导出操作日志异常:', error);
    message.error('导出操作日志发生异常');
  } finally {
    loading.value = false;
  }
};

// 表格选择变化
const onSelectChange = (selected) => {
  selectedRowKeys.value = selected;
};

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  // 更新分页信息
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  console.log('表格变化 - 当前页:', pagination.current, '每页条数:', pagination.pageSize);

  // 重新从服务器获取数据，而不是本地筛选
  fetchLogData();
};

// 查看日志详情
const viewLogDetails = async (record) => {
  try {
    loading.value = true;

    // 如果record包含所有需要的信息，直接使用
    if (record.params || record.id) {
      // 如果没有详细信息，则需要从API获取
      if (!record.params && record.id) {
        // 调用API获取详细信息
        const response = await getOperationLogDetailUsingGet({id: record.id});

        if (response.data && response.data.code === 200) {
          // 将API返回的详细信息与当前记录合并
          selectedLog.value = {...record, ...response.data.data};
        } else {
          // API调用失败，使用现有记录
          selectedLog.value = record;
          message.warning('获取详细日志信息失败，显示基本信息');
        }
      } else {
        // 直接使用传入的记录
        selectedLog.value = record;
      }

      // 显示弹窗并重置参数显示状态
      logDetailVisible.value = true;
      paramVisible.value = false; // 默认收起请求参数

    } else {
      message.error('日志记录信息不完整');
    }
  } catch (error) {
    console.error('查看日志详情出错:', error);
    message.error('获取日志详情时发生错误');
  } finally {
    loading.value = false;
  }
};

/**
 * 根据请求方法返回对应的CSS类名
 * @param {string} method - HTTP请求方法
 * @return {string} 对应的CSS类名
 */
const getMethodClass = (method) => {
  if (!method) return 'method-get';

  const methodLower = method.toLowerCase();
  switch (methodLower) {
    case 'get':
      return 'method-get';
    case 'post':
      return 'method-post';
    case 'put':
      return 'method-put';
    case 'delete':
      return 'method-delete';
    case 'patch':
      return 'method-patch';
    case 'head':
      return 'method-head';
    case 'options':
      return 'method-options';
    default:
      return 'method-get';
  }
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的记录');
    return;
  }

  Modal.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      loading.value = true;
      console.log('准备批量删除, IDs:', selectedRowKeys.value); // 添加调试日志

      try {
        // 确保传递的是 ID 数组
        const response = await batchDeleteOperationLogsUsingDelete(selectedRowKeys.value);

        console.log('批量删除响应:', response); // 添加调试日志

        if (response.data && response.data.code === 200 && response.data.data) {
          message.success(`已批量删除 ${selectedRowKeys.value.length} 条记录`);
          selectedRowKeys.value = [];
          fetchLogData();
        } else {
          message.error(response.data?.message || '批量删除操作日志失败');
        }
      } catch (error) {
        console.error('批量删除操作日志异常:', error);
        message.error('批量删除操作日志发生异常: ' + (error.message || '未知错误'));
      } finally {
        loading.value = false;
      }
    }
  });
};

// 批量分析
const handleBatchAnalyze = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要分析的记录');
    return;
  }

  message.success(`开始分析 ${selectedRowKeys.value.length} 条操作记录的行为模式`);
  // 实际应用中这里会进行数据分析或跳转到分析页面
};

// 显示删除确认对话框
const showDeleteConfirm = (record) => {
  Modal.confirm({
    title: '确定要删除此记录吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 确保传递记录的 ID
      deleteLog(record.id);
    }
  });
};

// 删除日志
const deleteLog = async (id) => {
  loading.value = true;
  console.log('准备删除日志，ID:', id); // 添加调试日志

  try {
    // 确保正确构造参数
    const params = { id };
    const response = await deleteOperationLogUsingDelete(params);

    console.log('删除响应:', response); // 添加调试日志

    if (response.data && response.data.code === 200 && response.data.data) {
      message.success('操作日志已删除');

      // 如果删除的是当前选中的记录，则清除选中状态
      if (selectedRowKeys.value.includes(id)) {
        selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== id);
      }

      // 如果详情弹窗显示的是当前删除的记录，关闭它
      if (logDetailVisible.value && selectedLog.value && selectedLog.value.id === id) {
        logDetailVisible.value = false;
      }

      // 重新获取数据
      fetchLogData();
    } else {
      message.error(response.data?.message || '删除操作日志失败');
    }
  } catch (error) {
    console.error('删除操作日志异常:', error);
    message.error('删除操作日志发生异常: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};
// 重复操作
const handleRepeat = (record) => {
  message.info(`正在重复执行操作：${record.description}`);
  // 实际应用中这里会调用相应的API重新执行该操作
};

// 追踪关联操作
const handleTrack = (record) => {
  message.info(`正在分析操作关联性：${record.description}`);
  // 实际应用中这里会跳转到关联分析页面
};

// 在组件挂载后的处理
onMounted(() => {
  fetchLogData();
  fetchStatistics();
  setupAutoRefresh();

  if (viewMode.value === 'chart') {
    nextTick(() => {
      initCharts();
    });
  }
});

// 组件卸载前的清理工作
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  disposeCharts();
  clearAutoRefresh();
});
</script>


<style scoped>
/* 全局容器样式 */
.operation-log-container {
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

/* 调整表格的内部单元格间距，使内容更加宽松 */
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
}

.search-form-items .ant-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-buttons {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

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
}

.operation-left, .operation-right {
  display: flex;
  align-items: center;
}

/* 表格内容样式 */
:deep(.ant-table-cell) {
  padding: 14px 16px;
}

/* 用户信息显示样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 13.5px;
  font-weight: 400;
  color: #595959;
  letter-spacing: 0.2px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.user-info:hover .username {
  color: #6554C0;
}

.role-tag {
  font-size: 10.5px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  font-weight: 400;
  white-space: nowrap;
  border: 1px solid transparent;
}

.role-admin {
  color: #722ed1;
  background-color: #f9f0ff;
  border-color: #e9d7fe;
}

.role-developer {
  color: #1677ff;
  background-color: #e6f4ff;
  border-color: #bae0ff;
}

.role-user {
  color: #52c41a;
  background-color: #f6ffed;
  border-color: #d9f7be;
}

.role-unknown {
  color: #8c8c8c;
  background-color: #f5f5f5;
  border-color: #e8e8e8;
}

/* IP信息样式 */
.ip-info {
  display: flex;
  align-items: center;
}

/* 图表视图样式 */
.chart-view-container {
  margin-bottom: 24px;
}

.chart-container {
  width: 100%;
  padding: 8px;
}

.chart-placeholder {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.chart-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 操作日志专用样式 - 使用ol-前缀避免冲突 */
.ol-page-container {
  padding: 0;
}

.ol-header {
  background: linear-gradient(135deg, #ffffff 0%, #f6f5ff 100%);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(101, 84, 192, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ol-header-left {
  display: flex;
  align-items: center;
}

.ol-icon-container {
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

.ol-icon {
  font-size: 28px;
  color: white;
}

.ol-header-info {
  display: flex;
  flex-direction: column;
}

.ol-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.ol-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ol-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.ol-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ol-metrics {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ol-metric-item {
  padding: 0 16px;
  position: relative;
}

.ol-divider {
  width: 1px;
  height: 24px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.ol-metric-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.ol-metric-label .anticon {
  margin-right: 6px;
}

.ol-metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 日志详情弹窗样式 */
.custom-log-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-log-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-log-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-log-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-log-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.log-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
}

.log-status {
  background-color: #f9f9f9;
  padding: 6px 12px;
  border-radius: 20px;
}

.log-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.log-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .anticon {
  color: #6554C0;
}

.danger-title .anticon,
.danger-title {
  color: #ff4d4f;
}

.log-info-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-info-row {
  display: flex;
  align-items: center;
}

.log-label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.log-value {
  flex: 1;
  color: #333;
}

/* 请求信息区域基础样式 */
.log-request-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 信息行样式 */
.log-info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

/* 标签样式 */
.log-label {
  width: 80px;
  min-width: 80px;
  font-weight: 500;
  color: #666;
  margin-right: 12px;
}

/* 值显示区域样式 */
.log-value {
  flex: 1;
  color: #333;
}

/* 请求方法样式标签 */
.request-method {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  letter-spacing: 0.5px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 请求URL样式 */
.request-url {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  word-break: break-all;
  padding: 6px 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #333;
  border-left: 3px solid #6554C0;
}

/* 参数切换按钮样式 */
.param-toggle-btn {
  padding: 2px 10px;
  height: 28px;
  background-color: #f0f0f0;
  border-radius: 14px;
  color: #555;
  transition: all 0.3s;
}

.param-toggle-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

/* 代码块样式 */
.log-code-block {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 16px;
  margin-top: 8px;
  overflow: auto;
  max-height: 300px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  width: 100%;
}

.log-code-block pre {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  color: #333;
  line-height: 1.6;
}

/* HTTP方法颜色变化 */
.method-get {
  background: linear-gradient(135deg, #1890FF 0%, #36CEFF 100%);
}

.method-post {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
}

.method-put {
  background: linear-gradient(135deg, #722ED1 0%, #B37FEB 100%);
}

.method-delete {
  background: linear-gradient(135deg, #F5222D 0%, #FF7875 100%);
}

.method-patch {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
}

.method-head, .method-options {
  background: linear-gradient(135deg, #8C8C8C 0%, #BFBFBF 100%);
}

/* 适配不同屏幕尺寸 */
@media (max-width: 576px) {
  .log-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .log-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .log-value {
    width: 100%;
  }
}

.log-code-block {
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  overflow: auto;
  max-height: 300px;
}

.log-code-block pre {
  margin: 0;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  color: #333;
}

.log-detail-description {
  padding: 8px 0;
  line-height: 1.6;
}

.changes-title {
  font-weight: 500;
  color: #333;
  margin: 12px 0 8px;
  font-size: 14px;
}

.changes-table {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.changes-header {
  display: flex;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
}

.changes-field, .changes-before, .changes-after {
  padding: 8px 12px;
}

.changes-field {
  width: 30%;
  font-weight: 500;
}

.changes-before, .changes-after {
  width: 35%;
}

.changes-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.changes-row:last-child {
  border-bottom: none;
}

.error-section {
  background-color: #fff2f0;
  border-left: 4px solid #ff4d4f;
}

.log-error-message {
  color: #ff4d4f;
  padding: 8px 0;
}

.log-detail-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.request-method {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  letter-spacing: 0.5px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.method-get {
  background: linear-gradient(135deg, #1890FF 0%, #36CEFF 100%);
}

.method-post {
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
}

.method-put {
  background: linear-gradient(135deg, #722ED1 0%, #B37FEB 100%);
}

.method-delete {
  background: linear-gradient(135deg, #F5222D 0%, #FF7875 100%);
}

.method-patch {
  background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
}

.method-head, .method-options {
  background: linear-gradient(135deg, #8C8C8C 0%, #BFBFBF 100%);
}

.request-url {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  word-break: break-all;
  padding: 6px 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #333;
  border-left: 3px solid #6554C0;
}

.param-toggle-btn {
  padding: 2px 10px;
  height: 28px;
  background-color: #f0f0f0;
  border-radius: 14px;
  color: #555;
  transition: all 0.3s;
}

.param-toggle-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.log-code-block {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
  overflow: auto;
  max-height: 300px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.log-code-block pre {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  color: #333;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .ol-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ol-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .ol-metrics {
    width: 100%;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
  }

  .log-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .log-status {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .ol-metric-item {
    padding: 0 10px;
  }

  .ol-metric-value {
    font-size: 16px;
  }

  .ol-title {
    font-size: 20px;
  }

  .custom-log-modal {
    width: 95% !important;
    max-width: 600px;
  }

  .changes-table {
    font-size: 12px;
  }

  .log-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .log-label {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .ol-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .ol-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .ol-divider {
    display: none;
  }

  .ol-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }

  .user-profile {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .changes-header, .changes-row {
    font-size: 11px;
  }

  .changes-field, .changes-before, .changes-after {
    padding: 6px 8px;
  }
}
</style>