<template>
  <div class="login-log-container">
    <div class="ll-page-container">
      <!-- 登录日志管理页面标题区域 -->
      <div class="ll-header">
        <div class="ll-header-left">
          <div class="ll-icon-container">
            <history-outlined class="ll-icon"/>
          </div>
          <div class="ll-header-info">
            <div class="ll-title-row">
              <h1 class="ll-title">登录日志管理</h1>
              <a-tag color="#6554C0">日志管理</a-tag>
            </div>
            <p class="ll-description">
              管理用户登录系统的操作记录，支持查询、筛选和导出登录历史数据
            </p>
          </div>
        </div>

        <div class="ll-header-right">
          <div class="ll-metrics">
            <div class="ll-metric-item">
              <div class="ll-metric-label">
                <calendar-outlined/>
                今日登录
              </div>
              <div class="ll-metric-value">216</div>
            </div>
            <div class="ll-divider"></div>
            <div class="ll-metric-item">
              <div class="ll-metric-label">
                <warning-outlined/>
                登录失败
              </div>
              <div class="ll-metric-value">18</div>
            </div>
            <div class="ll-divider"></div>
            <div class="ll-metric-item">
              <div class="ll-metric-label">
                <environment-outlined/>
                在线用户
              </div>
              <div class="ll-metric-value">87</div>
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
            <!-- 用户ID或账号 -->
            <a-form-item label="用户信息" name="userId">
              <a-input v-model:value="searchForm.userId" placeholder="用户ID/账号" allowClear/>
            </a-form-item>

            <!-- 登录状态 -->
            <a-form-item label="登录状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="1">成功</a-select-option>
                <a-select-option value="0">失败</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 登录IP -->
            <a-form-item label="登录IP" name="ip">
              <a-input v-model:value="searchForm.ip" placeholder="请输入登录IP" allowClear/>
            </a-form-item>

            <!-- 登录时间范围 -->
            <a-form-item label="登录时间" name="loginTime">
              <a-range-picker
                  v-model:value="searchForm.loginTime"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY-MM-DD"
                  style="width: 240px"
              />
            </a-form-item>

            <!-- 操作系统 -->
            <a-form-item label="操作系统" name="os">
              <a-select
                  v-model:value="searchForm.os"
                  placeholder="请选择系统"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="windows">Windows</a-select-option>
                <a-select-option value="macos">MacOS</a-select-option>
                <a-select-option value="linux">Linux</a-select-option>
                <a-select-option value="ios">iOS</a-select-option>
                <a-select-option value="android">Android</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 浏览器 -->
            <a-form-item label="浏览器" name="browser">
              <a-select
                  v-model:value="searchForm.browser"
                  placeholder="请选择浏览器"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="chrome">Chrome</a-select-option>
                <a-select-option value="firefox">Firefox</a-select-option>
                <a-select-option value="safari">Safari</a-select-option>
                <a-select-option value="edge">Edge</a-select-option>
                <a-select-option value="ie">IE</a-select-option>
              </a-select>
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
            <fund-outlined/>
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
          <a-radio-button value="map">
            <global-outlined/>
            地图视图
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
          <!-- 用户信息列 -->
          <template v-if="column.dataIndex === 'user'">
            <div class="user-info">
              <a-avatar :size="32" :style="{ backgroundColor: getAvatarColor(record.userId) }">
                {{ record.userName.charAt(0) }}
              </a-avatar>
              <div class="user-details">
                <div class="user-name">{{ record.userName }}</div>
                <div class="user-id">ID: {{ record.userId }}</div>
              </div>
            </div>
          </template>

          <!-- 登录状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-badge
                :status="record.status === 1 ? 'success' : 'error'"
                :text="record.status === 1 ? '成功' : '失败'"
            />
          </template>

          <!-- 登录地点列 -->
          <template v-if="column.dataIndex === 'location'">
            <div class="location-info">
              <environment-outlined style="margin-right: 5px; color: #6554C0;"/>
              {{ record.location || '未知' }}
            </div>
          </template>

          <!-- 设备信息列 -->
          <template v-if="column.dataIndex === 'device'">
            <div class="device-info">
              <div>
                <laptop-outlined style="margin-right: 5px;"/>
                {{ record.device || '未知设备' }}
              </div>
              <div>
                <global-outlined style="margin-right: 5px;"/>
                {{ record.browser || '未知浏览器' }}
              </div>
              <div>
                <desktop-outlined style="margin-right: 5px;"/>
                {{ record.os || '未知系统' }}
              </div>
            </div>
          </template>

          <!-- 登录时间列 -->
          <template v-if="column.dataIndex === 'loginTime'">
            {{ formatDateTime(record.loginTime) }}
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
                    <a-menu-item key="1" @click="analyzeUserLogin(record)">
                      <fund-outlined/>
                      行为分析
                    </a-menu-item>
                    <a-menu-item key="2" @click="checkGeoLocation(record)">
                      <environment-outlined/>
                      地理位置
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

    <!-- 地图视图 -->
    <div v-else-if="viewMode === 'map'" class="map-view-container">
      <a-spin :spinning="loading">
        <div class="map-placeholder">
          <div class="map-header">
            <h3>登录地理分布</h3>
            <div class="map-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #ff4d4f;"></div>
                <span>登录失败</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #52c41a;"></div>
                <span>登录成功</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #faad14;"></div>
                <span>异常登录</span>
              </div>
            </div>
          </div>
          <div class="map-container">
            <!-- 这里是地图组件，使用高德地图或其他地图服务 -->
            <div class="map-image">
              <img src="https://via.placeholder.com/1200x600?text=登录地理分布地图" alt="登录地理分布"/>
            </div>
          </div>
          <div class="map-stats">
            <div class="map-stat-item">
              <div class="stat-label">总登录次数</div>
              <div class="stat-value">28,365</div>
            </div>
            <div class="map-stat-item">
              <div class="stat-label">登录城市</div>
              <div class="stat-value">126</div>
            </div>
            <div class="map-stat-item">
              <div class="stat-label">主要地区</div>
              <div class="stat-value">北京 (24.5%)</div>
            </div>
            <div class="map-stat-item">
              <div class="stat-label">异常地点</div>
              <div class="stat-value">18</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 登录详情弹窗 -->
    <a-modal
        v-model:visible="logDetailVisible"
        title="登录详情"
        width="700px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-log-modal"
    >
      <template v-if="selectedLog">
        <div class="log-detail-header">
          <div class="user-profile">
            <a-avatar :size="64" :style="{ backgroundColor: getAvatarColor(selectedLog.userId) }">
              {{ selectedLog.userName.charAt(0) }}
            </a-avatar>
            <div class="user-info">
              <div class="user-name">{{ selectedLog.userName }}</div>
              <div class="user-meta">
                <span>用户ID: {{ selectedLog.userId }}</span>
                <a-divider type="vertical"/>
                <span>部门: {{ selectedLog.department || '未设置' }}</span>
              </div>
            </div>
          </div>
          <div class="log-status">
            <a-badge
                :status="selectedLog.status === 1 ? 'success' : 'error'"
                :text="selectedLog.status === 1 ? '登录成功' : '登录失败'"
            />
          </div>
        </div>

        <a-divider/>

        <div class="log-detail-content">
          <div class="log-section">
            <div class="section-title">
              <clock-circle-outlined/>
              <span>登录信息</span>
            </div>
            <div class="log-info-table">
              <div class="log-info-row">
                <div class="log-label">登录时间</div>
                <div class="log-value">{{ formatDateTime(selectedLog.loginTime) }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">登出时间</div>
                <div class="log-value">{{ selectedLog.logoutTime ? formatDateTime(selectedLog.logoutTime) : '未登出' }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">会话时长</div>
                <div class="log-value">{{ calculateSessionDuration(selectedLog) }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">记录ID</div>
                <div class="log-value">{{ selectedLog.id }}</div>
              </div>
            </div>
          </div>

          <div class="log-section">
            <div class="section-title">
              <global-outlined/>
              <span>位置信息</span>
            </div>
            <div class="log-map-info">
              <div class="log-info-row">
                <div class="log-label">登录IP</div>
                <div class="log-value">{{ selectedLog.ip }}</div>
              </div>
              <div class="log-info-row">
                <div class="log-label">登录地点</div>
                <div class="log-value">{{ selectedLog.location || '未知' }}</div>
              </div>
              <div class="log-location-map">
                <!-- 这里放地图小组件 -->
                <img src="https://via.placeholder.com/500x200?text=登录位置地图" alt="登录位置"/>
              </div>
            </div>
          </div>

          <div class="log-section">
            <div class="section-title">
              <laptop-outlined/>
              <span>设备信息</span>
            </div>
            <div class="log-device-info">
              <div class="device-card">
                <div class="device-icon">
                  <component :is="getDeviceIcon(selectedLog.device)"/>
                </div>
                <div class="device-details">
                  <div class="device-name">{{ selectedLog.device || '未知设备' }}</div>
                  <div class="device-type">设备类型</div>
                </div>
              </div>
              <div class="device-card">
                <div class="device-icon">
                  <component :is="getOSIcon(selectedLog.os)"/>
                </div>
                <div class="device-details">
                  <div class="device-name">{{ selectedLog.os || '未知系统' }}</div>
                  <div class="device-type">操作系统</div>
                </div>
              </div>
              <div class="device-card">
                <div class="device-icon">
                  <component :is="getBrowserIcon(selectedLog.browser)"/>
                </div>
                <div class="device-details">
                  <div class="device-name">{{ selectedLog.browser || '未知浏览器' }}</div>
                  <div class="device-type">浏览器</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.status === 0" class="log-section error-section">
            <div class="section-title danger-title">
              <warning-outlined/>
              <span>失败原因</span>
            </div>
            <div class="log-error-message">
              {{ selectedLog.msg || '未知错误' }}
            </div>
          </div>
        </div>

        <div class="log-detail-actions">
          <a-space>
            <a-button @click="logDetailVisible = false">
              关闭
            </a-button>
            <a-button type="primary" @click="analyzeUserLogin(selectedLog)">
              <template #icon>
                <fund-outlined/>
              </template>
              分析此用户
            </a-button>
          </a-space>
        </div>
      </template>
    </a-modal>

    <!-- 用户登录分析弹窗 -->
    <a-modal
        v-model:visible="userAnalysisVisible"
        title="用户登录行为分析"
        width="800px"
        :footer="null"
        :destroyOnClose="true"
        class="custom-analysis-modal"
    >
      <template v-if="selectedLog">
        <div class="analysis-header">
          <div class="user-profile">
            <a-avatar :size="64" :style="{ backgroundColor: getAvatarColor(selectedLog.userId) }">
              {{ selectedLog.userName.charAt(0) }}
            </a-avatar>
            <div class="user-info">
              <div class="user-name">{{ selectedLog.userName }}</div>
              <div class="user-meta">
                <span>用户ID: {{ selectedLog.userId }}</span>
                <a-divider type="vertical"/>
                <span>账户安全评级: </span>
                <a-tag :color="getSecurityLevelColor('高')">高</a-tag>
              </div>
            </div>
          </div>
          <div class="analysis-actions">
            <a-radio-group v-model:value="analysisTimeRange" button-style="solid" size="small">
              <a-radio-button value="7">近7天</a-radio-button>
              <a-radio-button value="30">近30天</a-radio-button>
              <a-radio-button value="90">近90天</a-radio-button>
            </a-radio-group>
          </div>
        </div>

        <a-divider/>

        <div class="analysis-content">
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" tab="登录时间分布">
              <div class="analysis-chart">
                <div class="chart-title">每日登录时间分布</div>
                <div class="chart-container">
                  <!-- 这里放图表组件 -->
                  <img src="https://via.placeholder.com/700x300?text=登录时间分布图表" alt="登录时间分布"/>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="地理位置分析">
              <div class="analysis-chart">
                <div class="chart-title">登录地点分布</div>
                <div class="chart-container">
                  <!-- 这里放图表组件 -->
                  <img src="https://via.placeholder.com/700x300?text=登录地点分布图表" alt="登录地点分布"/>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="3" tab="设备使用情况">
              <div class="analysis-chart">
                <div class="chart-title">设备使用情况</div>
                <div class="chart-container">
                  <!-- 这里放图表组件 -->
                  <img src="https://via.placeholder.com/700x300?text=设备使用情况图表" alt="设备使用情况"/>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="4" tab="异常行为">
              <div class="analysis-chart">
                <div class="chart-title">异常登录行为</div>
                <div class="chart-container anomaly-container">
                  <div class="anomaly-card">
                    <warning-outlined class="anomaly-icon"/>
                    <div class="anomaly-content">
                      <div class="anomaly-title">非常规时间登录</div>
                      <div class="anomaly-desc">用户在非工作时间 (23:47) 登录系统</div>
                      <div class="anomaly-meta">
                        <span>2025-03-15 23:47:32</span>
                        <span class="anomaly-level high">高风险</span>
                      </div>
                    </div>
                  </div>
                  <div class="anomaly-card">
                    <warning-outlined class="anomaly-icon"/>
                    <div class="anomaly-content">
                      <div class="anomaly-title">异地登录</div>
                      <div class="anomaly-desc">用户在非常规地点 (广州) 登录系统</div>
                      <div class="anomaly-meta">
                        <span>2025-03-10 14:23:05</span>
                        <span class="anomaly-level medium">中风险</span>
                      </div>
                    </div>
                  </div>
                  <div class="anomaly-card">
                    <warning-outlined class="anomaly-icon"/>
                    <div class="anomaly-content">
                      <div class="anomaly-title">未知设备登录</div>
                      <div class="anomaly-desc">用户使用新设备首次登录系统</div>
                      <div class="anomaly-meta">
                        <span>2025-03-08 09:12:47</span>
                        <span class="anomaly-level low">低风险</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <div class="analysis-summary">
          <div class="summary-title">分析结论</div>
          <div class="summary-content">
            <p>该用户在过去30天内有28次登录记录，其中包含2次异常登录行为。用户主要在工作日 09:00-18:00 期间登录系统，
              主要登录地点为北京。用户使用的主要设备为Windows PC，主要浏览器为Chrome。根据分析，该用户账号安全风险较低，
              但建议关注近期的异地登录行为。</p>
          </div>
        </div>

        <div class="analysis-actions-footer">
          <a-space>
            <a-button @click="userAnalysisVisible = false">
              关闭
            </a-button>
            <a-button type="primary" @click="exportAnalysisReport">
              <template #icon>
                <export-outlined/>
              </template>
              导出报告
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
  onMounted
} from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  WarningOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  LaptopOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
  FundOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LoginOutlined,
  SafetyOutlined,
  WindowsOutlined,
  ChromeOutlined
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
    width: 80,
  },
  {
    title: '用户信息',
    dataIndex: 'user',
    align: 'left',
    width: 180
  },
  {
    title: '登录状态',
    dataIndex: 'status',
    align: 'center',
    width: 100,
    filters: [
      { text: '成功', value: 1 },
      { text: '失败', value: 0 },
    ],
  },
  {
    title: '登录地点',
    dataIndex: 'location',
    align: 'left',
    width: 150,
    ellipsis: true,
  },
  {
    title: '登录IP',
    dataIndex: 'ip',
    align: 'center',
    width: 130,
  },
  {
    title: '设备信息',
    dataIndex: 'device',
    align: 'left',
    width: 200,
    ellipsis: true,
  },
  {
    title: '登录时间',
    dataIndex: 'loginTime',
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

// 搜索表单数据
const searchForm = reactive({
  userId: '',
  status: undefined,
  ip: '',
  loginTime: [],
  os: undefined,
  browser: undefined,
});

// 视图模式
const viewMode = ref('list');
const analysisTimeRange = ref('30');

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 弹窗状态
const logDetailVisible = ref(false);
const userAnalysisVisible = ref(false);
const selectedLog = ref(null);

// 顶部卡片数据
const statCards = reactive([
  {
    title: '总登录次数',
    value: '28,365',
    change: 12.8,
    color: 'purple',
    icon: LoginOutlined,
  },
  {
    title: '活跃用户数',
    value: '1,752',
    change: 8.5,
    color: 'blue',
    icon: TeamOutlined,
  },
  {
    title: '登录成功率',
    value: '96.4%',
    change: 1.2,
    color: 'green',
    icon: SafetyOutlined,
  },
  {
    title: '异常登录',
    value: '145',
    change: -5.3,
    color: 'gold',
    icon: WarningOutlined,
  },
]);

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
        id: 1001,
        userId: 10086,
        userName: '张三',
        department: '技术部',
        status: 1,
        ip: '192.168.1.100',
        location: '北京市朝阳区',
        device: 'Dell XPS 15',
        browser: 'Chrome 108.0.5359.125',
        os: 'Windows 11',
        loginTime: new Date(2025, 2, 15, 10, 30, 15).getTime(),
        logoutTime: new Date(2025, 2, 15, 18, 15, 20).getTime(),
        msg: null
      },
      {
        id: 1002,
        userId: 10087,
        userName: '李四',
        department: '市场部',
        status: 1,
        ip: '192.168.2.35',
        location: '上海市浦东新区',
        device: 'MacBook Pro',
        browser: 'Safari 16.3',
        os: 'macOS 13.2',
        loginTime: new Date(2025, 2, 15, 9, 15, 32).getTime(),
        logoutTime: new Date(2025, 2, 15, 17, 30, 45).getTime(),
        msg: null
      },
      {
        id: 1003,
        userId: 10088,
        userName: '王五',
        department: '财务部',
        status: 0,
        ip: '192.168.3.78',
        location: '广州市天河区',
        device: 'ThinkPad X1',
        browser: 'Firefox 109.0',
        os: 'Windows 10',
        loginTime: new Date(2025, 2, 15, 8, 45, 10).getTime(),
        logoutTime: null,
        msg: '密码错误，连续失败3次'
      },
      {
        id: 1004,
        userId: 10089,
        userName: '赵六',
        department: '人力资源部',
        status: 1,
        ip: '192.168.4.110',
        location: '深圳市南山区',
        device: 'Surface Pro 8',
        browser: 'Edge 110.0.1587.41',
        os: 'Windows 11',
        loginTime: new Date(2025, 2, 14, 14, 20, 55).getTime(),
        logoutTime: new Date(2025, 2, 14, 18, 10, 15).getTime(),
        msg: null
      },
      {
        id: 1005,
        userId: 10090,
        userName: '孙七',
        department: '销售部',
        status: 1,
        ip: '192.168.5.92',
        location: '成都市武侯区',
        device: 'iPhone 14 Pro',
        browser: 'Safari Mobile 16.3',
        os: 'iOS 16.3',
        loginTime: new Date(2025, 2, 14, 11, 5, 28).getTime(),
        logoutTime: new Date(2025, 2, 14, 16, 45, 50).getTime(),
        msg: null
      },
      {
        id: 1006,
        userId: 10091,
        userName: '周八',
        department: '技术部',
        status: 1,
        ip: '192.168.6.45',
        location: '杭州市西湖区',
        device: 'Redmi K60',
        browser: 'Chrome Mobile 110.0.5481.63',
        os: 'Android 13',
        loginTime: new Date(2025, 2, 14, 9, 30, 15).getTime(),
        logoutTime: new Date(2025, 2, 14, 19, 0, 20).getTime(),
        msg: null
      },
      {
        id: 1007,
        userId: 10092,
        userName: '吴九',
        department: '产品部',
        status: 0,
        ip: '192.168.7.118',
        location: '武汉市洪山区',
        device: 'HP EliteBook',
        browser: 'Chrome 109.0.5414.120',
        os: 'Windows 10',
        loginTime: new Date(2025, 2, 13, 23, 45, 10).getTime(),
        logoutTime: null,
        msg: '账号已锁定，请联系管理员'
      },
      {
        id: 1008,
        userId: 10093,
        userName: '郑十',
        department: '客服部',
        status: 1,
        ip: '192.168.8.77',
        location: '南京市鼓楼区',
        device: 'iPad Pro',
        browser: 'Safari Mobile 16.3',
        os: 'iPadOS 16.3',
        loginTime: new Date(2025, 2, 13, 15, 10, 5).getTime(),
        logoutTime: new Date(2025, 2, 13, 17, 55, 30).getTime(),
        msg: null
      },
      {
        id: 1009,
        userId: 10086,
        userName: '张三',
        department: '技术部',
        status: 1,
        ip: '192.168.1.100',
        location: '北京市朝阳区',
        device: 'Dell XPS 15',
        browser: 'Chrome 108.0.5359.125',
        os: 'Windows 11',
        loginTime: new Date(2025, 2, 13, 8, 0, 45).getTime(),
        logoutTime: new Date(2025, 2, 13, 18, 30, 10).getTime(),
        msg: null
      },
      {
        id: 1010,
        userId: 10087,
        userName: '李四',
        department: '市场部',
        status: 1,
        ip: '10.10.32.187',
        location: '武汉市江汉区',
        device: 'MacBook Pro',
        browser: 'Safari 16.3',
        os: 'macOS 13.2',
        loginTime: new Date(2025, 2, 12, 10, 20, 30).getTime(),
        logoutTime: new Date(2025, 2, 12, 16, 15, 40).getTime(),
        msg: null
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

// 计算会话持续时间
function calculateSessionDuration(log) {
  if (!log.logoutTime || log.status === 0) {
    return '无会话';
  }

  const duration = dayjs(log.logoutTime).diff(dayjs(log.loginTime), 'minute');
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return `${hours}小时${minutes}分钟`;
}

// 获取头像背景色
function getAvatarColor(userId) {
  const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#13C2C2', '#EB2F96'];
  const index = userId % colors.length;
  return colors[index];
}

// 获取设备图标
function getDeviceIcon(device) {
  if (!device) return LaptopOutlined;

  if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('ipad')) {
    return AppleOutlined;
  } else if (device.toLowerCase().includes('mac')) {
    return AppleOutlined;
  } else if (device.toLowerCase().includes('android')) {
    return AndroidOutlined;
  } else {
    return LaptopOutlined;
  }
}

// 获取操作系统图标
function getOSIcon(os) {
  if (!os) return DesktopOutlined;

  if (os.toLowerCase().includes('windows')) {
    return WindowsOutlined;
  } else if (os.toLowerCase().includes('mac') || os.toLowerCase().includes('ios')) {
    return AppleOutlined;
  } else if (os.toLowerCase().includes('android')) {
    return AndroidOutlined;
  } else if (os.toLowerCase().includes('linux')) {
    return DesktopOutlined;
  } else {
    return DesktopOutlined;
  }
}

// 获取浏览器图标
function getBrowserIcon(browser) {
  if (!browser) return GlobalOutlined;

  if (browser.toLowerCase().includes('chrome')) {
    return ChromeOutlined;
  } else if (browser.toLowerCase().includes('firefox')) {
    return IeOutlined;
  } else if (browser.toLowerCase().includes('safari')) {
    return SafariOutlined;
  } else if (browser.toLowerCase().includes('edge')) {
    return IeOutlined;
  } else {
    return GlobalOutlined;
  }
}

// 获取安全级别颜色
function getSecurityLevelColor(level) {
  const levelMap = {
    '高': 'green',
    '中': 'orange',
    '低': 'red'
  };
  return levelMap[level] || 'blue';
}

// 搜索处理
function handleSearch() {
  loading.value = true;

  // 模拟搜索逻辑
  setTimeout(() => {
    // 过滤条件实现
    const filteredData = logData.value.filter(log => {
      let match = true;

      if (searchForm.userId && !(log.userId.toString().includes(searchForm.userId) || log.userName.includes(searchForm.userId))) {
        match = false;
      }

      if (searchForm.status !== undefined && log.status !== parseInt(searchForm.status)) {
        match = false;
      }

      if (searchForm.ip && !log.ip.includes(searchForm.ip)) {
        match = false;
      }

      if (searchForm.loginTime && searchForm.loginTime.length === 2) {
        const startTime = searchForm.loginTime[0].valueOf();
        const endTime = searchForm.loginTime[1].valueOf();
        if (log.loginTime < startTime || log.loginTime > endTime) {
          match = false;
        }
      }

      if (searchForm.os && !(log.os && log.os.toLowerCase().includes(searchForm.os.toLowerCase()))) {
        match = false;
      }

      if (searchForm.browser && !(log.browser && log.browser.toLowerCase().includes(searchForm.browser.toLowerCase()))) {
        match = false;
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
  searchForm.userId = '';
  searchForm.status = undefined;
  searchForm.ip = '';
  searchForm.loginTime = [];
  searchForm.os = undefined;
  searchForm.browser = undefined;

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
    message.success('登录日志数据已导出');
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
  if (filters.status && filters.status.length > 0) {
    logData.value = logData.value.filter(item => filters.status.includes(item.status));
  }

  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1;
    logData.value = [...logData.value].sort((a, b) => {
      if (typeof a[sorter.field] === 'string') {
        return order * a[sorter.field].localeCompare(b[sorter.field]);
      }
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }
}

// 查看日志详情
function viewLogDetails(record) {
  selectedLog.value = record;
  logDetailVisible.value = true;
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

  if (selectedRowKeys.value.length > 10) {
    message.warning('批量分析最多支持10条记录');
    return;
  }

  message.success(`正在分析 ${selectedRowKeys.value.length} 条记录的行为模式`);
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

// 用户行为分析
function analyzeUserLogin(record) {
  selectedLog.value = record;
  userAnalysisVisible.value = true;
}

// 查看地理位置
function checkGeoLocation(record) {
  // 在实际应用中这里会打开地图或导航到地理位置页面
  message.info(`正在查看 ${record.userName} 的登录地理位置: ${record.location || '未知'}`);
}

// 导出分析报告
function exportAnalysisReport() {
  message.success('分析报告已导出');
}
</script>

<style scoped>
/* 登录日志管理容器样式 */
.login-log-container {
  padding: 16px;
}

/* 页面头部样式 */
.ll-page-container {
  padding: 0;
}

.ll-header {
  background: linear-gradient(135deg, #ffffff 0%, #f6f5ff 100%);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(101, 84, 192, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ll-header-left {
  display: flex;
  align-items: center;
}

.ll-icon-container {
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

.ll-icon {
  font-size: 28px;
  color: white;
}

.ll-header-info {
  display: flex;
  flex-direction: column;
}

.ll-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.ll-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ll-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.ll-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ll-metrics {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ll-metric-item {
  padding: 0 16px;
  position: relative;
}

.ll-divider {
  width: 1px;
  height: 24px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.ll-metric-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.ll-metric-label .anticon {
  margin-right: 6px;
}

.ll-metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
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

/* 地点信息样式 */
.location-info {
  display: flex;
  align-items: center;
}

/* 设备信息样式 */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

/* 地图视图样式 */
.map-view-container {
  margin-bottom: 24px;
}

.map-placeholder {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.map-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.map-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-stats {
  display: flex;
  justify-content: space-between;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.map-stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 登录详情弹窗样式 */
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

.log-map-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-location-map {
  margin-top: 8px;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.log-location-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.log-device-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.device-card {
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 180px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.device-icon {
  width: 40px;
  height: 40px;
  background-color: #f0f2f5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #6554C0;
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: 500;
  color: #333;
}

.device-type {
  font-size: 12px;
  color: #888;
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

/* 用户分析弹窗样式 */
.custom-analysis-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-analysis-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-analysis-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-analysis-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-analysis-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.analysis-actions {
  display: flex;
  align-items: center;
}

.analysis-content {
  margin-bottom: 24px;
}

.analysis-chart {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.chart-container {
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
}

.chart-container img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.anomaly-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.anomaly-card {
  background-color: #fff2f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 12px;
  border-left: 4px solid #ff4d4f;
}

.anomaly-icon {
  font-size: 24px;
  color: #ff4d4f;
}

.anomaly-content {
  flex: 1;
}

.anomaly-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.anomaly-desc {
  color: #666;
  margin-bottom: 8px;
}

.anomaly-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

.anomaly-level {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
}

.anomaly-level.high {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.anomaly-level.medium {
  background-color: #fffbe6;
  color: #faad14;
}

.anomaly-level.low {
  background-color: #f6ffed;
  color: #52c41a;
}

.analysis-summary {
  background-color: #f6f5ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #6554C0;
  margin-bottom: 8px;
}

.summary-content {
  color: #333;
  line-height: 1.6;
}

.analysis-actions-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .ll-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ll-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .ll-metrics {
    width: 100%;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .operation-right {
    margin-top: 16px;
  }

  .log-device-info {
    flex-direction: column;
  }

  .device-card {
    width: 100%;
  }

  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .ll-metric-item {
    padding: 0 10px;
  }

  .ll-metric-value {
    font-size: 16px;
  }

  .ll-title {
    font-size: 20px;
  }

  .log-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .log-status {
    align-self: flex-start;
  }

  .map-stats {
    flex-wrap: wrap;
  }

  .map-stat-item {
    width: 50%;
    margin-bottom: 16px;
  }
}

@media (max-width: 576px) {
  .ll-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .ll-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .ll-divider {
    display: none;
  }

  .ll-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }

  .user-profile {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .log-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .log-label {
    width: 100%;
  }

  .custom-log-modal,
  .custom-analysis-modal {
    width: 95% !important;
    max-width: 500px;
  }

  .map-stats {
    flex-direction: column;
  }

  .map-stat-item {
    width: 100%;
    padding: 8px 0;
  }
}
</style>