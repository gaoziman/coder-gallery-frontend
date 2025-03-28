<template>
  <div class="user-management-container">
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
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear/>
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select
              v-model:value="searchForm.role"
              placeholder="请选择角色"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="vip">VIP用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 180px"
              allowClear
          >
            <a-select-option value="active">已激活</a-select-option>
            <a-select-option value="inactive">未激活</a-select-option>
            <a-select-option value="banned">已禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注册时间" name="registerTime">
          <a-range-picker
              v-model:value="searchForm.registerTime"
              :placeholder="['开始日期', '结束日期']"
              format="YYYY-MM-DD"
          />
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
        <a-button type="primary" class="primary-button" @click="openAddUserModal">
          <plus-outlined/>
          添加用户
        </a-button>
        <a-button class="secondary-button" @click="handleRefresh">
          <reload-outlined/>
          重置
        </a-button>
        <a-button danger class="danger-button" :disabled="!hasSelected" @click="handleBatchDelete">
          <delete-outlined/>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 用户数据表格 -->
    <a-table
        :columns="columns"
        :data-source="userData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        row-key="id"
        class="user-table"
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户头像列 -->
        <template v-if="column.dataIndex === 'avatar'">
          <a-avatar :src="record.avatar" :alt="record.username"/>
        </template>

        <!-- 角色列 -->
        <template v-if="column.dataIndex === 'role'">
          <a-tag :color="getRoleColor(record.role)">{{ getRoleName(record.role) }}</a-tag>
        </template>

        <!-- 状态列 -->
        <template v-if="column.dataIndex === 'status'">
          <a-badge
              :status="getStatusType(record.status)"
              :text="getStatusText(record.status)"
          />
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="viewUserDetails(record)">
              <eye-outlined/>
              查看
            </a-button>
            <a-button type="link" size="small" @click="editUser(record)">
              <edit-outlined/>
              编辑
            </a-button>
            <a-button type="link" size="small" @click="resetPassword(record)">
              <key-outlined/>
              重置密码
            </a-button>
            <a-popconfirm
                title="确定要删除此用户吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteUser(record)"
            >
              <a-button type="link" size="small" danger>
                <delete-outlined/>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 查看用户信息弹窗 -->
    <a-modal
        v-model:visible="viewModalVisible"
        title="用户详细信息"
        :footer="null"
        width="600px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="用户ID">{{ currentUser.id }}</a-descriptions-item>
        <a-descriptions-item label="账户名">{{ currentUser.account }}</a-descriptions-item>
        <a-descriptions-item label="用户名">{{ currentUser.username }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentUser.phone }}</a-descriptions-item>
        <a-descriptions-item label="头像">
          <a-avatar :src="currentUser.avatar" :size="64"/>
        </a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag :color="getRoleColor(currentUser.role)">{{ getRoleName(currentUser.role) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge :status="getStatusType(currentUser.status)" :text="getStatusText(currentUser.status)"/>
        </a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ formatDateTime(currentUser.registerTime) }}</a-descriptions-item>
        <a-descriptions-item label="最后登录时间">{{ formatDateTime(currentUser.lastLoginTime) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 编辑用户信息弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑用户信息"
        @ok="handleEditSubmit"
        :confirmLoading="submitLoading"
        okText="保存"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="editForm" :rules="rules" ref="editFormRef" layout="vertical">
        <a-form-item label="账户名" name="account">
          <a-input v-model:value="editForm.account" placeholder="请输入账户名" disabled/>
        </a-form-item>
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editForm.username" placeholder="请输入用户名"/>
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="editForm.phone" placeholder="请输入手机号"/>
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <a-upload
              list-type="picture-card"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              @change="handleAvatarChange"
          >
            <div v-if="editForm.avatar">
              <img :src="editForm.avatar" alt="avatar" style="width: 100%"/>
            </div>
            <div v-else>
              <plus-outlined/>
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="editForm.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="vip">VIP用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="editForm.status" placeholder="请选择状态">
            <a-select-option value="active">已激活</a-select-option>
            <a-select-option value="inactive">未激活</a-select-option>
            <a-select-option value="banned">已禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加用户弹窗 -->
    <a-modal
        v-model:visible="addModalVisible"
        title="添加用户"
        @ok="handleAddSubmit"
        :confirmLoading="submitLoading"
        okText="添加"
        cancelText="取消"
        width="600px"
    >
      <a-form :model="addForm" :rules="rules" ref="addFormRef" layout="vertical">
        <a-form-item label="账户名" name="account">
          <a-input v-model:value="addForm.account" placeholder="请输入账户名"/>
        </a-form-item>
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="addForm.username" placeholder="请输入用户名"/>
        </a-form-item>
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="addForm.password" placeholder="请输入密码"/>
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password v-model:value="addForm.confirmPassword" placeholder="请确认密码"/>
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="addForm.phone" placeholder="请输入手机号"/>
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <a-upload
              list-type="picture-card"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              @change="handleAddAvatarChange"
          >
            <div v-if="addForm.avatar">
              <img :src="addForm.avatar" alt="avatar" style="width: 100%"/>
            </div>
            <div v-else>
              <plus-outlined/>
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="addForm.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="vip">VIP用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="addForm.status" placeholder="请选择状态">
            <a-select-option value="active">已激活</a-select-option>
            <a-select-option value="inactive">未激活</a-select-option>
            <a-select-option value="banned">已禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal
        v-model:visible="resetPasswordModalVisible"
        title="重置密码"
        @ok="handleResetPassword"
        :confirmLoading="submitLoading"
        okText="确定"
        cancelText="取消"
    >
      <a-form :model="resetPasswordForm" :rules="resetPasswordRules" ref="resetPasswordFormRef" layout="vertical">
        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="resetPasswordForm.newPassword" placeholder="请输入新密码"/>
        </a-form-item>
        <a-form-item label="确认新密码" name="confirmNewPassword">
          <a-input-password v-model:value="resetPasswordForm.confirmNewPassword" placeholder="请确认新密码"/>
        </a-form-item>
      </a-form>
      <div class="reset-password-tips">
        <info-circle-outlined style="color: #6554C0; margin-right: 8px;"/>
        重置密码后，系统将自动向用户发送密码重置通知。
      </div>
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
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '账户名',
    dataIndex: 'account',
    key: 'account',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 80,
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    key: 'registerTime',
    sorter: true,
    render: (text) => formatDateTime(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 240,
    fixed: 'right',
  },
];

// 顶部卡片数据
const statCards = reactive([
  {
    title: '注册用户总数',
    value: 673,
    change: 9.3,
    color: 'purple',
    icon: UserOutlined,
  },
  {
    title: '本月新增用户',
    value: 86,
    change: 12.5,
    color: 'blue',
    icon: UserOutlined,
  },
  {
    title: 'VIP用户总数',
    value: 128,
    change: 5.2,
    color: 'gold',
    icon: UserOutlined,
  },
  {
    title: '活跃用户比例',
    value: '78.6%',
    change: -2.3,
    color: 'green',
    icon: UserOutlined,
  },
]);

// 搜索表单数据
const searchForm = reactive({
  username: '',
  role: undefined,
  status: undefined,
  registerTime: [],
});

// 表格数据和加载状态
const loading = ref(false);
const userData = ref([]);
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

// 模态框可见性和当前操作用户
const viewModalVisible = ref(false);
const editModalVisible = ref(false);
const addModalVisible = ref(false);
const resetPasswordModalVisible = ref(false);
const submitLoading = ref(false);
const currentUser = ref({});

// 表单引用
const editFormRef = ref(null);
const addFormRef = ref(null);
const resetPasswordFormRef = ref(null);

// 编辑表单数据
const editForm = reactive({
  id: '',
  account: '',
  username: '',
  phone: '',
  avatar: '',
  role: '',
  status: '',
});

// 添加表单数据
const addForm = reactive({
  account: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  avatar: '',
  role: 'user',
  status: 'active',
});

// 重置密码表单数据
const resetPasswordForm = reactive({
  userId: '',
  newPassword: '',
  confirmNewPassword: '',
});

// 表单验证规则
const rules = {
  account: [
    {required: true, message: '请输入账户名', trigger: 'blur'},
    {min: 3, max: 20, message: '账户名长度应为3-20个字符', trigger: 'blur'}
  ],
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {validator: validateConfirmPassword, trigger: 'blur'}
  ],
  phone: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
  ],
  role: [
    {required: true, message: '请选择角色', trigger: 'change'}
  ],
  status: [
    {required: true, message: '请选择状态', trigger: 'change'}
  ],
};

// 重置密码验证规则
const resetPasswordRules = {
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur'}
  ],
  confirmNewPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {validator: validateResetPasswordConfirm, trigger: 'blur'}
  ],
};

// 密码确认验证
function validateConfirmPassword(rule, value) {
  if (value !== addForm.password) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
}

// 重置密码确认验证
function validateResetPasswordConfirm(rule, value) {
  if (value !== resetPasswordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserData();
});

// 获取用户数据
function fetchUserData() {
  loading.value = true;
  // 这里应该是调用API获取数据，现在模拟一些数据
  setTimeout(() => {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        account: `account_${i}`,
        username: `用户${i}`,
        phone: `1391234${i.toString().padStart(4, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        role: i % 5 === 0 ? 'admin' : (i % 3 === 0 ? 'vip' : 'user'),
        status: i % 7 === 0 ? 'banned' : (i % 4 === 0 ? 'inactive' : 'active'),
        registerTime: new Date(2025, 0, i % 28 + 1).getTime(),
        lastLoginTime: new Date(2025, 2, i % 28 + 1).getTime(),
      });
    }
    userData.value = data;
    pagination.total = data.length;
    loading.value = false;
  }, 500);
}

// 搜索处理
function handleSearch() {
  // 实际项目中应调用API进行搜索
  loading.value = true;
  setTimeout(() => {
    // 模拟搜索过滤
    const filteredData = userData.value.filter(user => {
      let match = true;

      if (searchForm.username && !user.username.includes(searchForm.username)) {
        match = false;
      }

      if (searchForm.role && user.role !== searchForm.role) {
        match = false;
      }

      if (searchForm.status && user.status !== searchForm.status) {
        match = false;
      }

      if (searchForm.registerTime && searchForm.registerTime.length === 2) {
        const startTime = searchForm.registerTime[0].valueOf();
        const endTime = searchForm.registerTime[1].valueOf();
        if (user.registerTime < startTime || user.registerTime > endTime) {
          match = false;
        }
      }

      return match;
    });

    userData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.current = 1;
    loading.value = false;

    message.success('搜索完成');
  }, 500);
}

// 重置搜索表单
function resetForm() {
  searchForm.username = '';
  searchForm.role = undefined;
  searchForm.status = undefined;
  searchForm.registerTime = [];
  fetchUserData();
  message.success('表单已重置');
}

// 刷新表格数据
function handleRefresh() {
  fetchUserData();
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
    userData.value = [...userData.value].sort((a, b) => {
      return order * (a[sorter.field] - b[sorter.field]);
    });
  }
}

// 获取角色名称
function getRoleName(role) {
  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户'
  };
  return roleMap[role] || '未知角色';
}

// 获取角色颜色
function getRoleColor(role) {
  const colorMap = {
    admin: '#6554C0',
    user: '#52C41A',
    vip: '#FAAD14'
  };
  return colorMap[role] || 'default';
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    active: 'success',
    inactive: 'warning',
    banned: 'error'
  };
  return statusMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    active: '已激活',
    inactive: '未激活',
    banned: '已禁用'
  };
  return statusMap[status] || '未知状态';
}

// 格式化日期时间
function formatDateTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

// 查看用户详情
function viewUserDetails(record) {
  currentUser.value = {...record};
  viewModalVisible.value = true;
}

// 编辑用户信息
function editUser(record) {
  // 复制用户数据到编辑表单
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
          const index = userData.value.findIndex(user => user.id === editForm.id);
          if (index !== -1) {
            userData.value[index] = {...userData.value[index], ...editForm};
          }

          submitLoading.value = false;
          editModalVisible.value = false;
          message.success('用户信息已更新');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 打开添加用户弹窗
function openAddUserModal() {
  // 重置添加表单
  Object.keys(addForm).forEach(key => {
    addForm[key] = key === 'role' ? 'user' : (key === 'status' ? 'active' : '');
  });
  addModalVisible.value = true;
}

// 处理添加用户提交
function handleAddSubmit() {
  addFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          // 创建新用户并添加到表格
          const newUser = {
            id: userData.value.length + 1,
            account: addForm.account,
            username: addForm.username,
            phone: addForm.phone,
            avatar: addForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            role: addForm.role,
            status: addForm.status,
            registerTime: new Date().getTime(),
            lastLoginTime: null,
          };

          userData.value.unshift(newUser);
          pagination.total += 1;

          submitLoading.value = false;
          addModalVisible.value = false;
          message.success('用户已添加');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 重置用户密码
function resetPassword(record) {
  resetPasswordForm.userId = record.id;
  resetPasswordForm.newPassword = '';
  resetPasswordForm.confirmNewPassword = '';
  resetPasswordModalVisible.value = true;
}

// 处理重置密码提交
function handleResetPassword() {
  resetPasswordFormRef.value.validate()
      .then(() => {
        submitLoading.value = true;

        // 模拟API调用
        setTimeout(() => {
          submitLoading.value = false;
          resetPasswordModalVisible.value = false;
          message.success('密码已重置');
        }, 500);
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
}

// 删除用户
function deleteUser(record) {
  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    userData.value = userData.value.filter(user => user.id !== record.id);
    pagination.total -= 1;
    loading.value = false;
    message.success('用户已删除');
  }, 500);
}

// 批量删除用户
function handleBatchDelete() {
  if (!selectedRowKeys.value.length) {
    return;
  }

  loading.value = true;

  // 模拟API调用
  setTimeout(() => {
    userData.value = userData.value.filter(user => !selectedRowKeys.value.includes(user.id));
    pagination.total -= selectedRowKeys.value.length;
    selectedRowKeys.value = [];
    loading.value = false;
    message.success('已批量删除用户');
  }, 500);
}

// 头像上传前验证
function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片!');
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!');
  }

  return false; // 阻止自动上传
}

// 编辑表单头像变更处理
function handleAvatarChange(info) {
  if (info.file.status !== 'uploading') {
    console.log(info.file, info.fileList);
  }

  if (info.file.status === 'done') {
    // 实际项目中应获取服务器返回的URL
    // 这里仅作示例，使用本地预览
    getBase64(info.file.originFileObj, (url) => {
      editForm.avatar = url;
    });
    message.success('头像上传成功');
  } else if (info.file.status === 'error') {
    message.error('头像上传失败');
  }
}

// 添加表单头像变更处理
function handleAddAvatarChange(info) {
  if (info.file.status !== 'uploading') {
    console.log(info.file, info.fileList);
  }

  if (info.file.status === 'done') {
    // 实际项目中应获取服务器返回的URL
    // 这里仅作示例，使用本地预览
    getBase64(info.file.originFileObj, (url) => {
      addForm.avatar = url;
    });
    message.success('头像上传成功');
  } else if (info.file.status === 'error') {
    message.error('头像上传失败');
  }
}

// 将文件转换为Base64
function getBase64(file, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(file);
}

</script>

<style scoped>
/* 全局容器样式 */
.user-management-container {
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

/* 表格样式 */
.user-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 重置密码提示样式 */
.reset-password-tips {
  background-color: #f0f7ff;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
  color: #4E7CF6;
  display: flex;
  align-items: center;
}
</style>