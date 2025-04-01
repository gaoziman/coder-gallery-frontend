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
              <div class="ol-metric-value">438</div>
            </div>
            <div class="ol-divider"></div>
            <div class="ol-metric-item">
              <div class="ol-metric-label">
                <user-outlined/>
                活跃用户
              </div>
              <div class="ol-metric-value">53</div>
            </div>
            <div class="ol-divider"></div>
            <div class="ol-metric-item">
              <div class="ol-metric-label">
                <warning-outlined/>
                异常操作
              </div>
              <div class="ol-metric-value">12</div>
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
                <a-select-option value="success">成功</a-select-option>
                <a-select-option value="fail">失败</a-select-option>
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
                <a-select-option value="user">用户管理</a-select-option>
                <a-select-option value="role">角色管理</a-select-option>
                <a-select-option value="menu">菜单管理</a-select-option>
                <a-select-option value="system">系统设置</a-select-option>
                <a-select-option value="content">内容管理</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 操作时间 -->
            <a-form-item label="操作时间" name="operationTime">
              <a-range-picker
                  v-model:value="searchForm.operationTime"
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
          <!-- 操作用户信息列 -->
          <template v-if="column.dataIndex === 'operator'">
            <div class="user-info">
              <a-avatar :size="32" :style="{ backgroundColor: getAvatarColor(record.operatorId) }">
                {{ record.operator.charAt(0) }}
              </a-avatar>
              <div class="user-details">
                <div class="user-name">{{ record.operator }}</div>
                <div class="user-id">{{ record.operatorRole }}</div>
              </div>
            </div>
          </template>

          <!-- 操作状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="record.status === 'success' ? 'success' : 'error'"
                :text="record.status === 'success' ? '成功' : '失败'"
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
            <a-avatar :size="64" :style="{ backgroundColor: getAvatarColor(selectedLog.operatorId) }">
              {{ selectedLog.operator.charAt(0) }}
            </a-avatar>
            <div class="user-info">
              <div class="user-name">{{ selectedLog.operator }}</div>
              <div class="user-meta">
                <span>角色: {{ selectedLog.operatorRole }}</span>
                <a-divider type="vertical"/>
                <span>ID: {{ selectedLog.operatorId }}</span>
              </div>
            </div>
          </div>
          <div class="log-status">
            <a-badge
                :status="selectedLog.status === 'success' ? 'success' : 'error'"
                :text="selectedLog.status === 'success' ? '操作成功' : '操作失败'"
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
                <div class="log-value">{{ selectedLog.ip }} ({{ selectedLog.location }})</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">操作来源</div>
                <div class="log-value">{{ selectedLog.source }}</div>
              </div>
            </div>
          </div>

          <div class="log-section">
            <div class="section-title">
              <code-outlined/>
              <span>请求信息</span>
            </div>
            <div class="log-request-info">
              <div class="log-info-row">
                <div class="log-label">请求方法</div>
                <div class="log-value">
                  <a-tag color="#108ee9">{{ selectedLog.method }}</a-tag>
                </div>
              </div>
              <div class="log-info-row">
                <div class="log-label">请求URL</div>
                <div class="log-value">{{ selectedLog.url }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">请求参数</div>
                <div class="log-value">
                  <a-button type="link" size="small" @click="toggleParamVisible">
                    {{ paramVisible ? '收起' : '展开' }}
                    <component :is="paramVisible ? 'up-outlined' : 'down-outlined'"/>
                  </a-button>
                </div>
              </div>
              <div v-if="paramVisible" class="log-code-block">
                <pre>{{ formatJson(selectedLog.requestParams) }}</pre>
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
import {message} from 'ant-design-vue';
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
import TrendBadge from "@/components/common/TrendBadge.vue";
import {BarChart, HeatmapChart, LineChart, PieChart} from "echarts/charts";
import {LabelLayout, UniversalTransition} from "echarts/features";
import {CanvasRenderer} from "echarts/renderers";

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


// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 70,
  },
  {
    title: '操作用户',
    dataIndex: 'operator',
    align: 'left',
    width: 180
  },
  {
    title: '操作类型',
    dataIndex: 'operationType',
    align: 'center',
    width: 100,
    filters: [
      { text: '新增', value: 'create' },
      { text: '修改', value: 'update' },
      { text: '删除', value: 'delete' },
      { text: '查询', value: 'query' },
      { text: '导入', value: 'import' },
      { text: '导出', value: 'export' },
    ],
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
    width: 250
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    align: 'center',
    width: 100,
    filters: [
      { text: '成功', value: 'success' },
      { text: '失败', value: 'fail' }
    ],
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
const statCards = reactive([
  {
    title: '总操作次数',
    value: '12,458',
    change: 15.6,
    color: 'purple',
    icon: CodeOutlined,
  },
  {
    title: '本月操作量',
    value: '3,865',
    change: 8.9,
    color: 'blue',
    icon: CalendarOutlined,
  },
  {
    title: '操作成功率',
    value: '98.7%',
    change: 1.2,
    color: 'green',
    icon: CheckCircleOutlined,
  },
  {
    title: '异常操作',
    value: '86',
    change: -3.8,
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
});

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

// 监听视图模式变化，当切换到图表视图时，初始化图表
watch(() => viewMode.value, (newValue) => {
  if (newValue === 'chart') {
    nextTick(() => {
      initCharts();
    });
  }
});

// 在组件挂载后，如果当前是图表视图，初始化图表
onMounted(() => {
  fetchLogData();
  if (viewMode.value === 'chart') {
    nextTick(() => {
      initCharts();
    });
  }
});

// 创建并初始化所有图表
function initCharts() {
  initOperationTypeChart();
  initOperationTrendChart();
  initUserOperationHeatmap();

  // 添加窗口大小改变时重新调整图表大小的监听器
  window.addEventListener('resize', resizeCharts);
}

// 调整所有图表大小
function resizeCharts() {
  operationTypeChart.value && operationTypeChart.value.resize();
  operationTrendChart.value && operationTrendChart.value.resize();
  userOperationHeatmap.value && userOperationHeatmap.value.resize();
}

// 在组件销毁前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  disposeCharts();
});

// 销毁所有图表实例
function disposeCharts() {
  operationTypeChart.value && operationTypeChart.value.dispose();
  operationTrendChart.value && operationTrendChart.value.dispose();
  userOperationHeatmap.value && userOperationHeatmap.value.dispose();
}

// 初始化操作类型分布饼图
function initOperationTypeChart() {
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
}

// 初始化操作趋势分析折线图
function initOperationTrendChart() {
  // 按日期分组操作数据
  const dateGroups = {};
  const statusGroups = { success: {}, fail: {} };

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
}

// 初始化用户操作热力图
function initUserOperationHeatmap() {
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
      formatter: function (params) {
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
}


// 组件挂载时获取数据
onMounted(() => {
  fetchLogData();
});

// 获取日志数据
function fetchLogData() {
  loading.value = true;

  // 模拟API请求获取日志数据
  setTimeout(() => {
    const data = [
      {
        id: 100001,
        operator: '张三',
        operatorId: 10086,
        operatorRole: '系统管理员',
        operationType: 'create',
        module: 'user',
        description: '创建新用户：李四',
        status: 'success',
        ip: '192.168.1.100',
        location: '北京市朝阳区',
        operationTime: new Date(2025, 2, 15, 10, 30, 15).getTime(),
        method: 'POST',
        url: '/api/system/user',
        source: 'Web管理后台',
        duration: 125,
        requestParams: {
          username: 'lisi',
          realName: '李四',
          email: 'lisi@example.com',
          phone: '13800138000',
          roleId: 2,
          status: 1
        },
        changes: [
          {
            field: '用户状态',
            before: null,
            after: '启用'
          },
          {
            field: '角色',
            before: null,
            after: '普通用户'
          }
        ],
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100002,
        operator: '李四',
        operatorId: 10087,
        operatorRole: '普通用户',
        operationType: 'update',
        module: 'content',
        description: '更新文章内容：《2025年Q1市场营销策略》',
        status: 'success',
        ip: '192.168.2.35',
        location: '上海市浦东新区',
        operationTime: new Date(2025, 2, 15, 9, 15, 32).getTime(),
        method: 'PUT',
        url: '/api/content/article/256',
        source: 'Web管理后台',
        duration: 87,
        requestParams: {
          id: 256,
          title: '2025年Q1市场营销策略',
          content: '更新后的文章内容...',
          categoryId: 3,
          tags: [1, 5, 8]
        },
        changes: [
          {
            field: '内容',
            before: '原文章内容',
            after: '更新后的文章内容'
          },
          {
            field: '标签',
            before: '营销,策略',
            after: '营销,策略,2025'
          }
        ],
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100003,
        operator: '王五',
        operatorId: 10088,
        operatorRole: '内容编辑',
        operationType: 'delete',
        module: 'content',
        description: '删除文章：《过期促销活动》',
        status: 'success',
        ip: '192.168.3.78',
        location: '广州市天河区',
        operationTime: new Date(2025, 2, 15, 8, 45, 10).getTime(),
        method: 'DELETE',
        url: '/api/content/article/128',
        source: 'Web管理后台',
        duration: 65,
        requestParams: {
          id: 128,
          permanently: false
        },
        changes: null,
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100004,
        operator: '赵六',
        operatorId: 10089,
        operatorRole: '系统管理员',
        operationType: 'update',
        module: 'system',
        description: '修改系统配置：邮件服务器设置',
        status: 'fail',
        ip: '192.168.4.110',
        location: '深圳市南山区',
        operationTime: new Date(2025, 2, 14, 14, 20, 55).getTime(),
        method: 'PUT',
        url: '/api/system/config/mail',
        source: 'Web管理后台',
        duration: 210,
        requestParams: {
          smtpServer: 'smtp.example.com',
          port: 465,
          username: 'system@example.com',
          password: '******',
          ssl: true
        },
        changes: [
          {
            field: 'SMTP服务器',
            before: 'smtp.old-example.com',
            after: 'smtp.example.com'
          },
          {
            field: '端口',
            before: '25',
            after: '465'
          },
          {
            field: 'SSL',
            before: '否',
            after: '是'
          }
        ],
        errorMsg: '连接SMTP服务器失败：无法解析主机名',
        stackTrace: 'java.net.UnknownHostException: smtp.example.com\n   at java.net.AbstractPlainSocketImpl.connect(Unknown Source)\n   at java.net.Socket.connect(Unknown Source)\n   at com.sun.mail.util.SocketFetcher.createSocket(SocketFetcher.java:321)\n   at com.sun.mail.util.SocketFetcher.getSocket(SocketFetcher.java:237)\n   at com.sun.mail.smtp.SMTPTransport.openServer(SMTPTransport.java:1928)'
      },
      {
        id: 100005,
        operator: '孙七',
        operatorId: 10090,
        operatorRole: '财务专员',
        operationType: 'export',
        module: 'finance',
        description: '导出财务报表：2025年2月财务汇总',
        status: 'success',
        ip: '192.168.5.92',
        location: '成都市武侯区',
        operationTime: new Date(2025, 2, 14, 11, 5, 28).getTime(),
        method: 'GET',
        url: '/api/finance/report/export',
        source: 'Web管理后台',
        duration: 1250,
        requestParams: {
          year: 2025,
          month: 2,
          type: 'summary',
          format: 'excel'
        },
        changes: null,
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100006,
        operator: '周八',
        operatorId: 10091,
        operatorRole: '产品经理',
        operationType: 'query',
        module: 'product',
        description: '查询产品数据：智能家居产品线销售统计',
        status: 'success',
        ip: '192.168.6.45',
        location: '杭州市西湖区',
        operationTime: new Date(2025, 2, 14, 9, 30, 15).getTime(),
        method: 'GET',
        url: '/api/product/stats',
        source: '移动应用',
        duration: 320,
        requestParams: {
          productLine: 'smart-home',
          dateRange: '2025-01-01,2025-02-29',
          groupBy: 'category'
        },
        changes: null,
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100007,
        operator: '吴九',
        operatorId: 10092,
        operatorRole: '人力资源专员',
        operationType: 'import',
        module: 'hr',
        description: '导入员工数据：新入职员工批量导入',
        status: 'fail',
        ip: '192.168.7.118',
        location: '武汉市洪山区',
        operationTime: new Date(2025, 2, 13, 14, 45, 10).getTime(),
        method: 'POST',
        url: '/api/hr/employee/import',
        source: 'Web管理后台',
        duration: 875,
        requestParams: {
          fileName: '新员工名单.xlsx',
          sheetIndex: 0,
          skipHeader: true
        },
        changes: null,
        errorMsg: '导入失败：第15行数据格式错误，身份证号码不符合规则',
        stackTrace: null
      },
      {
        id: 100008,
        operator: '郑十',
        operatorId: 10093,
        operatorRole: '市场专员',
        operationType: 'create',
        module: 'marketing',
        description: '创建营销活动：春季促销大礼包',
        status: 'success',
        ip: '192.168.8.77',
        location: '南京市鼓楼区',
        operationTime: new Date(2025, 2, 13, 15, 10, 5).getTime(),
        method: 'POST',
        url: '/api/marketing/campaign',
        source: 'Web管理后台',
        duration: 150,
        requestParams: {
          name: '春季促销大礼包',
          startDate: '2025-03-01',
          endDate: '2025-03-31',
          budget: 50000,
          channels: ['email', 'sms', 'wechat']
        },
        changes: [
          {
            field: '活动状态',
            before: null,
            after: '待开始'
          },
          {
            field: '预算',
            before: null,
            after: '50000元'
          }
        ],
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100009,
        operator: '张三',
        operatorId: 10086,
        operatorRole: '系统管理员',
        operationType: 'update',
        module: 'role',
        description: '修改角色权限：产品经理',
        status: 'success',
        ip: '192.168.1.100',
        location: '北京市朝阳区',
        operationTime: new Date(2025, 2, 13, 8, 0, 45).getTime(),
        method: 'PUT',
        url: '/api/system/role/3',
        source: 'Web管理后台',
        duration: 95,
        requestParams: {
          id: 3,
          name: '产品经理',
          permissions: [1, 2, 3, 5, 8, 13, 21, 34]
        },
        changes: [
          {
            field: '权限',
            before: '产品管理,数据查看',
            after: '产品管理,数据查看,报表导出'
          }
        ],
        errorMsg: null,
        stackTrace: null
      },
      {
        id: 100010,
        operator: '李四',
        operatorId: 10087,
        operatorRole: '普通用户',
        operationType: 'query',
        module: 'dashboard',
        description: '查看仪表盘：系统概览',
        status: 'success',
        ip: '10.10.32.187',
        location: '武汉市江汉区',
        operationTime: new Date(2025, 2, 12, 10, 20, 30).getTime(),
        method: 'GET',
        url: '/api/dashboard',
        source: '移动应用',
        duration: 180,
        requestParams: {
          timeRange: 'week'
        },
        changes: null,
        errorMsg: null,
        stackTrace: null
      }
    ];

    logData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 600);
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 获取头像背景色
function getAvatarColor(operatorId) {
  const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#13C2C2', '#EB2F96'];
  const index = operatorId % colors.length;
  return colors[index];
}

// 获取操作类型颜色
function getOperationTypeColor(type) {
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
}

// 获取操作类型文本
function getOperationTypeText(type) {
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
}

// 获取模块文本
function getModuleText(module) {
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
}

// 格式化JSON
function formatJson(json) {
  try {
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return JSON.stringify(json);
  }
}

// 切换请求参数显示状态
function toggleParamVisible() {
  paramVisible.value = !paramVisible.value;
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索逻辑
  setTimeout(() => {
    // 过滤条件实现
    const filteredData = logData.value.filter(log => {
      let match = true;

      if (searchForm.operator && !log.operator.includes(searchForm.operator)) {
        match = false;
      }

      if (searchForm.operationType && log.operationType !== searchForm.operationType) {
        match = false;
      }

      if (searchForm.status && log.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.module && log.module !== searchForm.module) {
        match = false;
      }

      if (searchForm.operationTime && searchForm.operationTime.length === 2) {
        const startTime = searchForm.operationTime[0].valueOf();
        const endTime = searchForm.operationTime[1].valueOf();
        if (log.operationTime < startTime || log.operationTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    logData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetSearchForm() {
  searchForm.operator = '';
  searchForm.operationType = undefined;
  searchForm.status = undefined;
  searchForm.module = undefined;
  searchForm.operationTime = [];

  // 重新获取所有数据
  fetchLogData();

  message.success('搜索条件已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchLogData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
}

// 导出数据
function handleExport() {
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    message.success('操作日志数据已导出');
  }, 1000);
}

// 表格选择变化
function onSelectChange(selected) {
  selectedRowKeys.value = selected;
}

// 表格变化处理
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;

  // 处理筛选
  let filteredData = [...logData.value];

  if (filters.status && filters.status.length > 0) {
    filteredData = filteredData.filter(item => filters.status.includes(item.status));
  }

  if (filters.operationType && filters.operationType.length > 0) {
    filteredData = filteredData.filter(item => filters.operationType.includes(item.operationType));
  }

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    filteredData = filteredData.sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }

  logData.value = filteredData;
}

// 查看日志详情
function viewLogDetails(record) {
  selectedLog.value = record;
  logDetailVisible.value = true;
  paramVisible.value = false; // 默认收起请求参数
}

// 批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的记录');
    return;
  }

  window.$modal?.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗?`,
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      loading.value = true;

      // 模拟API调用
      setTimeout(() => {
        logData.value = logData.value.filter(log => !selectedRowKeys.value.includes(log.id));
        pagination.total -= selectedRowKeys.value.length;
        selectedRowKeys.value = [];
        loading.value = false;
        message.success('已批量删除日志记录');
      }, 800);
    }
  });
}

// 批量分析
function handleBatchAnalyze() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要分析的记录');
    return;
  }

  message.success(`开始分析 ${selectedRowKeys.value.length} 条操作记录的行为模式`);
  // 实际应用中这里会进行数据分析或跳转到分析页面
}

// 显示删除确认对话框
function showDeleteConfirm(record) {
  window.$modal?.confirm({
    title: '确定要删除此记录吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteLog(record);
    }
  });
}

// 删除日志
function deleteLog(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    logData.value = logData.value.filter(log => log.id !== record.id);
    pagination.total -= 1;
    loading.value = false;
    message.success('记录已删除');

    // 如果删除的是当前选中的记录，则清除选中状态
    if (selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = selectedRowKeys.value.filter(id => id !== record.id);
    }

    // 如果详情弹窗显示的是当前删除的记录，关闭它
    if (logDetailVisible.value && selectedLog.value && selectedLog.value.id === record.id) {
      logDetailVisible.value = false;
    }
  }, 500);
}

// 重复操作
function handleRepeat(record) {
  message.info(`正在重复执行操作：${record.description}`);
  // 实际应用中这里会调用相应的API重新执行该操作
}

// 追踪关联操作
function handleTrack(record) {
  message.info(`正在分析操作关联性：${record.description}`);
  // 实际应用中这里会跳转到关联分析页面
}
</script>

<style scoped>
/* 全局容器样式 */
.operation-log-container {
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

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
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

.log-request-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
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