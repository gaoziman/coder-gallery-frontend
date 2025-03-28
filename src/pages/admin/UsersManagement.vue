<template>
  <div class="users-management-container">
    <!-- 顶部状态卡片 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <template #cover>
              <div class="stat-icon-container">
                <UserOutlined class="stat-icon" />
              </div>
            </template>
            <a-statistic
                title="注册用户总数"
                :value="userStats.totalUsers"
                :value-style="{ color: '#5D5FEF', fontWeight: 'bold' }"
            />
            <div class="stat-change">
              <span class="increase">
                <ArrowUpOutlined /> {{ userStats.userGrowth }}% 较上月
              </span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <template #cover>
              <div class="stat-icon-container">
                <ClockCircleOutlined class="stat-icon" />
              </div>
            </template>
            <a-statistic
                title="本月新增用户"
                :value="userStats.newUsers"
                :value-style="{ color: '#5D5FEF', fontWeight: 'bold' }"
            />
            <div class="stat-change">
              <span class="increase">
                <ArrowUpOutlined /> {{ userStats.newUserGrowth }}% 较上月
              </span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <template #cover>
              <div class="stat-icon-container">
                <CrownOutlined class="stat-icon" />
              </div>
            </template>
            <a-statistic
                title="VIP用户总数"
                :value="userStats.vipUsers"
                :value-style="{ color: '#5D5FEF', fontWeight: 'bold' }"
            />
            <div class="stat-change">
              <span class="increase">
                <ArrowUpOutlined /> {{ userStats.vipGrowth }}% 较上月
              </span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <template #cover>
              <div class="stat-icon-container">
                <FireOutlined class="stat-icon" />
              </div>
            </template>
            <a-statistic
                title="活跃用户比例"
                :value="userStats.activeRate"
                suffix="%"
                :precision="1"
                :value-style="{ color: '#5D5FEF', fontWeight: 'bold' }"
            />
            <div class="stat-change">
              <span class="decrease">
                <ArrowDownOutlined /> {{ userStats.activeRateChange }}% 较上月
              </span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 用户筛选和操作区 -->
    <div class="filter-section">
      <a-card class="filter-card">
        <a-row :gutter="16" align="middle">
          <a-col :span="18">
            <a-form layout="inline" :model="filterForm">
              <a-form-item label="用户名" name="username">
                <a-input v-model:value="filterForm.username" placeholder="请输入用户名" allow-clear />
              </a-form-item>
              <a-form-item label="邮箱" name="email">
                <a-input v-model:value="filterForm.email" placeholder="请输入邮箱" allow-clear />
              </a-form-item>
              <a-form-item label="角色" name="role">
                <a-select
                    v-model:value="filterForm.role"
                    style="width: 120px"
                    placeholder="选择角色"
                    allow-clear
                >
                  <a-select-option value="all">全部角色</a-select-option>
                  <a-select-option value="admin">管理员</a-select-option>
                  <a-select-option value="vip">VIP用户</a-select-option>
                  <a-select-option value="regular">普通用户</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="状态" name="status">
                <a-select
                    v-model:value="filterForm.status"
                    style="width: 120px"
                    placeholder="选择状态"
                    allow-clear
                >
                  <a-select-option value="all">全部状态</a-select-option>
                  <a-select-option value="active">活跃</a-select-option>
                  <a-select-option value="inactive">不活跃</a-select-option>
                  <a-select-option value="banned">已封禁</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="注册时间" name="registerDate">
                <a-range-picker v-model:value="filterForm.registerDate" />
              </a-form-item>
            </a-form>
          </a-col>
          <a-col :span="6" style="text-align: right">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                查询
              </a-button>
              <a-button @click="resetFilters">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
              <a-button type="primary" @click="handleAddUser">
                <template #icon><PlusOutlined /></template>
                添加用户
              </a-button>
              <a-button danger @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
                <template #icon><DeleteOutlined /></template>
                批量删除
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 用户列表表格 -->
    <a-card class="users-table-card">
      <a-table
          :dataSource="userData"
          :columns="columns"
          :pagination="pagination"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :row-key="record => record.id"
          :loading="loading"
          @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 用户信息列 -->
          <template v-if="column.key === 'userInfo'">
            <div class="user-info-cell">
              <a-avatar :src="record.avatar" :size="40" />
              <div class="user-info-details">
                <div class="user-name">{{ record.username }}</div>
                <div class="user-email">{{ record.email }}</div>
              </div>
            </div>
          </template>

          <!-- 角色列 -->
          <template v-if="column.key === 'role'">
            <a-tag :color="getRoleTagColor(record.role)">
              {{ getRoleDisplayName(record.role) }}
            </a-tag>
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-badge
                :status="getStatusDot(record.status)"
                :text="getStatusDisplayName(record.status)"
            />
          </template>

          <!-- 存储空间列 -->
          <template v-if="column.key === 'storage'">
            <a-progress
                :percent="(record.usedStorage / record.totalStorage) * 100"
                size="small"
                :stroke-color="getStorageColor(record.usedStorage, record.totalStorage)"
            />
            <div class="storage-text">
              {{ formatStorage(record.usedStorage) }} / {{ formatStorage(record.totalStorage) }}
            </div>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-tooltip title="查看详情">
                <a-button type="link" size="small" @click="handleViewUser(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="编辑用户">
                <a-button type="link" size="small" @click="handleEditUser(record)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="重置密码">
                <a-button type="link" size="small" @click="handleResetPassword(record)">
                  <KeyOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="record.status === 'banned' ? '解除封禁' : '封禁用户'">
                <a-button
                    type="link"
                    size="small"
                    :danger="record.status !== 'banned'"
                    @click="handleToggleBan(record)"
                >
                  <template v-if="record.status === 'banned'">
                    <UnlockOutlined />
                  </template>
                  <template v-else>
                    <StopOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="删除用户">
                <a-popconfirm
                    title="确定要删除此用户吗?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDeleteUser(record)"
                >
                  <a-button type="link" danger size="small">
                    <DeleteOutlined />
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 用户详情抽屉 -->
    <a-drawer
        :title="drawerTitle"
        :visible="drawerVisible"
        :width="600"
        @close="closeDrawer"
        :body-style="{ paddingBottom: '80px' }"
    >
      <template v-if="currentUser">
        <div v-if="drawerType === 'view'" class="user-profile">
          <!-- 用户资料展示 -->
          <div class="user-profile-header">
            <a-avatar :src="currentUser.avatar" :size="90" />
            <div class="user-profile-title">
              <h2>{{ currentUser.username }}</h2>
              <div class="user-tags">
                <a-tag :color="getRoleTagColor(currentUser.role)">
                  {{ getRoleDisplayName(currentUser.role) }}
                </a-tag>
                <a-tag :color="getStatusTagColor(currentUser.status)">
                  {{ getStatusDisplayName(currentUser.status) }}
                </a-tag>
              </div>
              <div class="user-join-date">
                注册于 {{ formatDate(currentUser.registerDate) }}
              </div>
            </div>
          </div>

          <a-divider />

          <!-- 用户资料详情 -->
          <div class="user-detail-section">
            <h3>基本信息</h3>
            <a-descriptions :column="2">
              <a-descriptions-item label="用户ID">{{ currentUser.id }}</a-descriptions-item>
              <a-descriptions-item label="电子邮箱">{{ currentUser.email }}</a-descriptions-item>
              <a-descriptions-item label="手机号码">{{ currentUser.phone || '未设置' }}</a-descriptions-item>
              <a-descriptions-item label="上次登录">{{ formatDateTime(currentUser.lastLogin) }}</a-descriptions-item>
              <a-descriptions-item label="登录IP">{{ currentUser.lastIP }}</a-descriptions-item>
              <a-descriptions-item label="IP地址">{{ currentUser.location || '未知' }}</a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 用户作品统计 -->
          <div class="user-stats-section">
            <h3>用户统计</h3>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic
                    title="上传图片数"
                    :value="currentUser.uploadCount"
                    :value-style="{ color: '#5D5FEF' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                    title="获得点赞"
                    :value="currentUser.likesReceived"
                    :value-style="{ color: '#5D5FEF' }"
                />
              </a-col>
              <a-col :span="8">
                <a-statistic
                    title="空间访问量"
                    :value="currentUser.profileViews"
                    :value-style="{ color: '#5D5FEF' }"
                />
              </a-col>
            </a-row>
          </div>

          <!-- 存储空间使用情况 -->
          <div class="user-storage-section">
            <h3>存储空间</h3>
            <a-progress
                :percent="(currentUser.usedStorage / currentUser.totalStorage) * 100"
                :format="percent => `${percent.toFixed(2)}%`"
                status="active"
                :strokeColor="{
                '0%': '#5D5FEF',
                '100%': '#8082FF'
              }"
            />
            <div class="storage-text-detail">
              已使用 {{ formatStorage(currentUser.usedStorage) }} / 总共 {{ formatStorage(currentUser.totalStorage) }}
            </div>
          </div>

          <!-- 最近上传图片 -->
          <div class="user-recent-uploads">
            <h3>最近上传</h3>
            <a-list
                grid={{ gutter: 16, column: 3 }}
                :data-source="currentUser.recentImages || []"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card hoverable>
                    <template #cover>
                      <img
                          alt="example"
                          :src="item.url"
                          style="height: 150px; object-fit: cover;"
                      />
                    </template>
                    <a-card-meta :title="item.title">
                      <template #description>
                        <div>{{ formatDate(item.uploadTime) }}</div>
                        <div>
                          <EyeOutlined /> {{ item.views }}
                          <LikeOutlined style="margin-left: 8px" /> {{ item.likes }}
                        </div>
                      </template>
                    </a-card-meta>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>

        <!-- 编辑用户表单 -->
        <div v-if="drawerType === 'edit' || drawerType === 'add'">
          <a-form
              :model="userForm"
              :rules="userFormRules"
              ref="userFormRef"
              layout="vertical"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="用户名" name="username">
                  <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="电子邮箱" name="email">
                  <a-input v-model:value="userForm.email" placeholder="请输入电子邮箱" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="手机号码" name="phone">
                  <a-input v-model:value="userForm.phone" placeholder="请输入手机号码" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="角色" name="role">
                  <a-select v-model:value="userForm.role" placeholder="请选择角色">
                    <a-select-option value="admin">管理员</a-select-option>
                    <a-select-option value="vip">VIP用户</a-select-option>
                    <a-select-option value="regular">普通用户</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="状态" name="status">
                  <a-select v-model:value="userForm.status" placeholder="请选择状态">
                    <a-select-option value="active">活跃</a-select-option>
                    <a-select-option value="inactive">不活跃</a-select-option>
                    <a-select-option value="banned">已封禁</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="总存储空间 (MB)" name="totalStorage">
                  <a-input-number
                      v-model:value="userForm.totalStorage"
                      :min="100"
                      :max="10000"
                      style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item v-if="drawerType === 'add'" label="密码" name="password">
              <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
            </a-form-item>

            <a-form-item v-if="drawerType === 'add'" label="确认密码" name="confirmPassword">
              <a-input-password v-model:value="userForm.confirmPassword" placeholder="请再次输入密码" />
            </a-form-item>

            <a-form-item label="头像">
              <a-upload
                  name="avatar"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  action="/api/upload"
                  @change="handleAvatarChange"
              >
                <img v-if="userForm.avatar" :src="userForm.avatar" alt="avatar" style="width: 100%" />
                <div v-else>
                  <PlusOutlined />
                  <div style="margin-top: 8px">上传</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-form>
        </div>

        <!-- 重置密码表单 -->
        <div v-if="drawerType === 'resetPassword'">
          <a-alert
              message="重置用户密码"
              description="重置后，将生成随机密码并发送到用户邮箱，或者您可以手动设置新密码。"
              type="warning"
              show-icon
              style="margin-bottom: 24px"
          />

          <a-form
              :model="passwordForm"
              :rules="passwordFormRules"
              ref="passwordFormRef"
              layout="vertical"
          >
            <a-form-item label="重置方式" name="resetType">
              <a-radio-group v-model:value="passwordForm.resetType">
                <a-radio value="auto">生成随机密码并发送邮件</a-radio>
                <a-radio value="manual">手动设置新密码</a-radio>
              </a-radio-group>
            </a-form-item>

            <template v-if="passwordForm.resetType === 'manual'">
              <a-form-item label="新密码" name="newPassword">
                <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
              </a-form-item>

              <a-form-item label="确认新密码" name="confirmPassword">
                <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入密码" />
              </a-form-item>
            </template>
          </a-form>
        </div>
      </template>

      <template #footer>
        <div style="text-align: right">
          <a-space>
            <a-button @click="closeDrawer">取消</a-button>
            <a-button v-if="drawerType === 'edit' || drawerType === 'add'" type="primary" @click="handleSaveUser">
              保存
            </a-button>
            <a-button v-if="drawerType === 'resetPassword'" type="primary" @click="handleSavePassword">
              确认重置
            </a-button>
          </a-space>
        </div>
      </template>
    </a-drawer>

    <!-- 批量删除确认弹窗 -->
    <a-modal
        v-model:visible="batchDeleteModalVisible"
        title="批量删除用户"
        ok-text="确认删除"
        cancel-text="取消"
        :okButtonProps="{ danger: true }"
        @ok="confirmBatchDelete"
    >
      <p>您确定要删除选中的 {{ selectedRowKeys.length }} 个用户吗？</p>
      <p>此操作将永久删除这些用户账户以及相关的所有数据，且无法恢复。</p>
      <a-checkbox v-model:checked="batchDeleteOptions.notifyUsers">通知用户账户已被删除</a-checkbox>
      <a-checkbox v-model:checked="batchDeleteOptions.keepFiles">保留用户上传的文件</a-checkbox>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  UserOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  FireOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  KeyOutlined,
  StopOutlined,
  UnlockOutlined,
  LikeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import dayjs from 'dayjs';

// 模拟用户统计数据
const userStats = reactive({
  totalUsers: 673,
  userGrowth: 9.3,
  newUsers: 86,
  newUserGrowth: 12.5,
  vipUsers: 128,
  vipGrowth: 5.2,
  activeRate: 78.6,
  activeRateChange: 2.3,
});

// 表格列定义
const columns = [
  {
    title: '用户信息',
    key: 'userInfo',
    width: '25%',
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    filters: [
      { text: '管理员', value: 'admin' },
      { text: 'VIP用户', value: 'vip' },
      { text: '普通用户', value: 'regular' },
    ],
    width: '10%',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: '活跃', value: 'active' },
      { text: '不活跃', value: 'inactive' },
      { text: '已封禁', value: 'banned' },
    ],
    width: '10%',
  },
  {
    title: '注册时间',
    dataIndex: 'registerDate',
    key: 'registerDate',
    sorter: true,
    width: '15%',
    customRender: ({ text }) => formatDate(text),
  },
  {
    title: '存储空间',
    key: 'storage',
    width: '20%',
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
  },
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 673,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 筛选表单
const filterForm = reactive({
  username: '',
  email: '',
  role: undefined,
  status: undefined,
  registerDate: [],
});

// 表格数据加载状态
const loading = ref(false);

// 表格选中行
const selectedRowKeys = ref<number[]>([]);

// 批量删除相关
const batchDeleteModalVisible = ref(false);
const batchDeleteOptions = reactive({
  notifyUsers: true,
  keepFiles: false,
});

// 抽屉相关
const drawerVisible = ref(false);
const drawerType = ref('view'); // view, edit, add, resetPassword
const drawerTitle = computed(() => {
  switch (drawerType.value) {
    case 'view':
      return '用户详情';
    case 'edit':
      return '编辑用户';
    case 'add':
      return '添加用户';
    case 'resetPassword':
      return '重置密码';
    default:
      return '';
  }
});

// 当前选中的用户
const currentUser = ref(null);

// 用户表单
const userFormRef = ref(null);
const userForm = reactive({
  id: null,
  username: '',
  email: '',
  phone: '',
  role: 'regular',
  status: 'active',
  totalStorage: 500,
  avatar: '',
});

// 用户表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的电子邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' },
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' },
  ],
  totalStorage: [
    { required: true, message: '请设置存储空间大小', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: async (rule: Rule, value: string) => {
        if (value !== userForm.password) {
          throw new Error('两次输入的密码不一致');
        }
      },
      trigger: 'blur',
    },
  ],
};

// 密码重置表单
const passwordFormRef = ref(null);
const passwordForm = reactive({
  resetType: 'auto',
  newPassword: '',
  confirmPassword: '',
});

// 密码表单验证规则
const passwordFormRules = {
  resetType: [
    { required: true, message: '请选择重置方式', trigger: 'change' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: async (rule: Rule, value: string) => {
        if (value !== passwordForm.newPassword) {
          throw new Error('两次输入的密码不一致');
        }
      },
      trigger: 'blur',
    },
  ],
};

// 模拟用户数据
const userData = ref([
  {
    id: 1,
    username: '张三丰',
    email: 'zhang***@example.com',
    phone: '138****8888',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'admin',
    status: 'active',
    registerDate: '2023-02-28',
    lastLogin: '2025-03-28 09:15:42',
    lastIP: '192.168.1.103',
    location: '北京',
    usedStorage: 256,
    totalStorage: 1024,
    uploadCount: 68,
    likesReceived: 342,
    profileViews: 1205,
    recentImages: [
      {
        id: 101,
        title: '春天花海风景',
        url: 'https://picsum.photos/id/11/300/200',
        uploadTime: '2025-03-25',
        views: 126,
        likes: 43
      },
      {
        id: 102,
        title: '城市建筑设计',
        url: 'https://picsum.photos/id/13/300/200',
        uploadTime: '2025-03-23',
        views: 85,
        likes: 32
      },
      {
        id: 103,
        title: '山水风景油画',
        url: 'https://picsum.photos/id/18/300/200',
        uploadTime: '2025-03-20',
        views: 76,
        likes: 21
      }
    ]
  },
  {
    id: 2,
    username: '李小明',
    email: 'li***@gmail.com',
    phone: '139****7777',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    role: 'vip',
    status: 'active',
    registerDate: '2024-06-15',
    lastLogin: '2025-03-28 11:22:35',
    lastIP: '182.156.12.89',
    location: '上海',
    usedStorage: 598,
    totalStorage: 2048,
    uploadCount: 127,
    likesReceived: 865,
    profileViews: 2356
  },
  {
    id: 3,
    username: '王晓华',
    email: 'wang***@qq.com',
    phone: '135****6666',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    role: 'admin',
    status: 'active',
    registerDate: '2023-12-10',
    lastLogin: '2025-03-27 16:45:18',
    lastIP: '220.181.38.148',
    location: '广州',
    usedStorage: 785,
    totalStorage: 1024,
    uploadCount: 214,
    likesReceived: 865,
    profileViews: 3562
  },
  {
    id: 4,
    username: '赵明',
    email: 'zhao***@163.com',
    phone: '137****5555',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    role: 'regular',
    status: 'inactive',
    registerDate: '2024-09-05',
    lastLogin: '2025-03-05 09:12:43',
    lastIP: '114.114.114.114',
    location: '成都',
    usedStorage: 89,
    totalStorage: 512,
    uploadCount: 23,
    likesReceived: 89,
    profileViews: 456
  },
  {
    id: 5,
    username: '黄晓东',
    email: 'huang***@outlook.com',
    phone: '138****4444',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    role: 'regular',
    status: 'banned',
    registerDate: '2024-05-22',
    lastLogin: '2025-02-15 14:52:36',
    lastIP: '221.192.168.15',
    location: '深圳',
    usedStorage: 205,
    totalStorage: 512,
    uploadCount: 57,
    likesReceived: 124,
    profileViews: 728
  },
  {
    id: 6,
    username: '林雪',
    email: 'lin***@hotmail.com',
    phone: '139****3333',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    role: 'vip',
    status: 'active',
    registerDate: '2024-11-17',
    lastLogin: '2025-03-27 20:15:08',
    lastIP: '118.186.36.210',
    location: '杭州',
    usedStorage: 1536,
    totalStorage: 5120,
    uploadCount: 324,
    likesReceived: 1254,
    profileViews: 5870
  }
]);

// 页面加载时获取用户数据
onMounted(() => {
  // 模拟API请求
  fetchUserData();
});

// 获取用户数据
const fetchUserData = () => {
  loading.value = true;

  // 模拟API请求延迟
  setTimeout(() => {
    // 在实际应用中，这里应该发起API请求获取数据
    loading.value = false;
  }, 500);
};

// 格式化日期函数
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD');
};

// 格式化日期时间函数
const formatDateTime = (dateTime: string) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
};

// 格式化存储空间
const formatStorage = (sizeInMB: number) => {
  if (sizeInMB < 1024) {
    return `${sizeInMB} MB`;
  } else {
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
  }
};

// 获取角色标签颜色
const getRoleTagColor = (role: string) => {
  switch (role) {
    case 'admin':
      return '#5D5FEF';
    case 'vip':
      return '#F59E0B';
    case 'regular':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

// 获取角色显示名称
const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'vip':
      return 'VIP用户';
    case 'regular':
      return '普通用户';
    default:
      return '未知角色';
  }
};

// 获取状态标签颜色
const getStatusTagColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#10B981';
    case 'inactive':
      return '#F59E0B';
    case 'banned':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

// 获取状态显示名称
const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'active':
      return '活跃';
    case 'inactive':
      return '不活跃';
    case 'banned':
      return '已封禁';
    default:
      return '未知状态';
  }
};

// 获取状态圆点
const getStatusDot = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'banned':
      return 'error';
    default:
      return 'default';
  }
};

// 获取存储空间颜色
const getStorageColor = (used: number, total: number) => {
  const percentage = (used / total) * 100;
  if (percentage < 60) {
    return '#10B981'; // 绿色
  } else if (percentage < 80) {
    return '#F59E0B'; // 黄色
  } else {
    return '#EF4444'; // 红色
  }
};

// 表格选择改变
const onSelectChange = (selectedKeys: number[]) => {
  selectedRowKeys.value = selectedKeys;
};

// 表格变化处理
const handleTableChange = (pagination, filters, sorter) => {
  console.log('表格变化:', pagination, filters, sorter);
  // 在实际应用中，这里应该根据分页、筛选和排序条件重新获取数据
};

// 处理搜索
const handleSearch = () => {
  console.log('搜索条件:', filterForm);
  // 在实际应用中，这里应该根据筛选条件重新获取数据
  fetchUserData();
};

// 重置筛选
const resetFilters = () => {
  // 重置筛选表单
  filterForm.username = '';
  filterForm.email = '';
  filterForm.role = undefined;
  filterForm.status = undefined;
  filterForm.registerDate = [];

  // 重新获取数据
  fetchUserData();
};

// 添加用户
const handleAddUser = () => {
  // 重置用户表单
  Object.assign(userForm, {
    id: null,
    username: '',
    email: '',
    phone: '',
    role: 'regular',
    status: 'active',
    totalStorage: 500,
    avatar: '',
    password: '',
    confirmPassword: '',
  });

  // 打开抽屉
  drawerType.value = 'add';
  drawerVisible.value = true;
};

// 查看用户
const handleViewUser = (record) => {
  currentUser.value = record;
  drawerType.value = 'view';
  drawerVisible.value = true;
};

// 编辑用户
const handleEditUser = (record) => {
  // 设置用户表单数据
  Object.assign(userForm, {
    id: record.id,
    username: record.username,
    email: record.email,
    phone: record.phone,
    role: record.role,
    status: record.status,
    totalStorage: record.totalStorage,
    avatar: record.avatar,
  });

  currentUser.value = record;
  drawerType.value = 'edit';
  drawerVisible.value = true;
};

// 保存用户
const handleSaveUser = async () => {
  if (!userFormRef.value) return;

  try {
    await userFormRef.value.validate();

    // 模拟API请求
    setTimeout(() => {
      if (drawerType.value === 'add') {
        message.success('用户添加成功！');
      } else {
        message.success('用户信息更新成功！');
      }

      // 关闭抽屉
      closeDrawer();

      // 重新获取数据
      fetchUserData();
    }, 500);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置密码
const handleResetPassword = (record) => {
  currentUser.value = record;
  drawerType.value = 'resetPassword';

  // 重置密码表单
  passwordForm.resetType = 'auto';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';

  drawerVisible.value = true;
};

// 保存密码
const handleSavePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    // 模拟API请求
    setTimeout(() => {
      message.success('密码重置成功！');

      // 关闭抽屉
      closeDrawer();
    }, 500);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 切换封禁状态
const handleToggleBan = (record) => {
  const newStatus = record.status === 'banned' ? 'active' : 'banned';
  const actionText = newStatus === 'banned' ? '封禁' : '解除封禁';

  // 模拟API请求
  setTimeout(() => {
    message.success(`用户${actionText}成功！`);

    // 更新本地数据（实际场景中应该重新获取）
    record.status = newStatus;
  }, 500);
};

// 删除用户
const handleDeleteUser = (record) => {
  // 模拟API请求
  setTimeout(() => {
    message.success('用户删除成功！');

    // 重新获取数据
    fetchUserData();
  }, 500);
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请至少选择一个用户');
    return;
  }

  batchDeleteModalVisible.value = true;
};

// 确认批量删除
const confirmBatchDelete = () => {
  // 模拟API请求
  setTimeout(() => {
    message.success(`成功删除 ${selectedRowKeys.value.length} 个用户！`);

    // 清空选中行
    selectedRowKeys.value = [];

    // 关闭弹窗
    batchDeleteModalVisible.value = false;

    // 重新获取数据
    fetchUserData();
  }, 500);
};

// 处理头像上传
const handleAvatarChange = (info) => {
  if (info.file.status === 'uploading') {
    return;
  }

  if (info.file.status === 'done') {
    // 获取头像URL（实际应用中应该从响应中获取）
    userForm.avatar = URL.createObjectURL(info.file.originFileObj);
  }
};

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false;
};
</script>

<style scoped>
.users-management-container {
  padding: 24px;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.stat-icon-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5D5FEF 0%, #8082FF 100%);
}

.stat-icon {
  font-size: 24px;
  color: white;
}

.stat-change {
  margin-top: 5px;
  font-size: 12px;
}

.increase {
  color: #10B981;
}

.decrease {
  color: #EF4444;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.users-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-info-cell {
  display: flex;
  align-items: center;
}

.user-info-details {
  margin-left: 12px;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
}

.storage-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.user-profile {
  padding: 0 16px;
}

.user-profile-header {
  display: flex;
  margin-bottom: 24px;
}

.user-profile-title {
  margin-left: 24px;
}

.user-tags {
  margin: 8px 0;
}

.user-join-date {
  color: #6b7280;
  font-size: 14px;
}

.user-detail-section,
.user-stats-section,
.user-storage-section,
.user-recent-uploads {
  margin-top: 24px;
  margin-bottom: 32px;
}

.user-storage-section h3,
.user-detail-section h3,
.user-stats-section h3,
.user-recent-uploads h3 {
  margin-bottom: 16px;
  color: #374151;
  border-left: 4px solid #5D5FEF;
  padding-left: 10px;
}

.storage-text-detail {
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

/* 自定义主题颜色 */
:deep(.ant-btn-primary) {
  background-color: #5D5FEF;
}

:deep(.ant-pagination-item-active) {
  border-color: #5D5FEF;
}

:deep(.ant-pagination-item-active a) {
  color: #5D5FEF;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #5D5FEF;
  border-color: #5D5FEF;
}

:deep(.ant-radio-checked .ant-radio-inner) {
  border-color: #5D5FEF;
}

:deep(.ant-radio-inner::after) {
  background-color: #5D5FEF;
}

:deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  background-color: #f0f0ff;
}

:deep(.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  border-color: #5D5FEF;
}

:deep(.ant-input-affix-wrapper:focus),
:deep(.ant-input-affix-wrapper-focused),
:deep(.ant-input:focus),
:deep(.ant-input-focused) {
  border-color: #5D5FEF;
  box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.2);
}
</style>