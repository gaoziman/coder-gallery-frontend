<template>
  <div class="user-management-container">
    <!-- 使用实时统计组件 -->
    <RealTimeStats
        :header-config="headerConfig"
        :refresh-interval="refreshInterval"
        @data-updated="handleDataUpdated"
    />

    <!-- 搜索条件区域 -->
    <a-card class="search-form-card" :body-style="{ padding: '24px' }">
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch" class="search-form">
          <div class="search-form-items">
            <!-- 用户名 -->
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear/>
            </a-form-item>

            <!-- 角色 -->
            <a-form-item label="角色" name="role">
              <a-select
                  v-model:value="searchForm.role"
                  placeholder="请选择角色"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="user">普通用户</a-select-option>
                <a-select-option value="vip">VIP用户</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 状态 -->
            <a-form-item label="状态" name="status">
              <a-select
                  v-model:value="searchForm.status"
                  placeholder="请选择状态"
                  style="width: 150px"
                  allowClear
              >
                <a-select-option value="active">已激活</a-select-option>
                <a-select-option value="inactive">未激活</a-select-option>
                <a-select-option value="banned">已禁用</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 注册时间 -->
            <a-form-item label="注册时间" name="registerTime">
              <a-range-picker
                  v-model:value="searchForm.registerTime"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY-MM-DD"
                  style="width: 240px"
              />
            </a-form-item>

            <!-- 操作按钮 - 不需要form-item包装，直接放在一个div里 -->
            <div class="search-buttons">
              <a-button type="primary" html-type="submit" class="search-button">
                <IconFont type="icon-chaxun2"/>
                查询
              </a-button>
              <a-button @click="resetSearchForm" class="reset-button">
                <IconFont type="icon-zhongzhi-xian"/>
                重置
              </a-button>
            </div>
          </div>
        </a-form>
      </div>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-space>
        <a-button type="primary" @click="openAddUserModal">
          <IconFont type="icon-chuangjian2"/>
          添加用户
        </a-button>
        <a-button @click="handleRefresh">
          <IconFont type="icon-icon"/>
          刷新
        </a-button>
        <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
          <IconFont type="icon-piliangshanchu3"/>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 使用BaseTable组件替换原始的a-table -->
    <BaseTable
        :columns="columns"
        :data-source="userData"
        :loading="loading"
        :pagination="pagination"
        :show-selection="true"
        :selected-keys="selectedRowKeys"
        :row-key="'id'"
        :row-actions="getRowActions"
        @refresh="handleRefresh"
        @selection-change="onSelectChange"
        @row-action="handleTableRowAction"
        @table-change="handleTableChange"
    >
      <!-- 自定义列 -->
      <template #column-id="{ record }">
        <a-tooltip placement="topLeft">
          <template #title>{{ record.id }}</template>
          <span class="truncated-id" @mouseenter="showFullId = record.id" @mouseleave="showFullId = ''">
            {{ formatId(record.id) }}
          </span>
        </a-tooltip>
      </template>

      <template #column-avatar="{ record }">
        <a-avatar :src="record.avatar" :alt="record.username"/>
      </template>

      <template #column-role="{ record }">
        <a-tag :color="getRoleColor(record.role)">{{ getRoleName(record.role) }}</a-tag>
      </template>

      <template #column-status="{ record }">
        <a-badge
            :status="getStatusType(record.status)"
            :text="getStatusText(record.status)"
        />
      </template>

      <template #column-registerTime="{ record }">
        {{ formatDateTime(record.registerTime, true) }}
      </template>
    </BaseTable>

    <!-- 查看用户信息弹窗 -->
    <a-modal
        v-model:visible="viewModalVisible"
        :footer="null"
        width="720px"
        :mask-closable="true"
        :destroyOnClose="true"
        class="custom-user-modal"
    >

      <div class="edit-modal-header">
        <div class="header-content">
          <div class="header-icon">
            <IconFont type="icon-chakan" />
          </div>
          <div class="header-text">
            <h2>用户详细信息</h2>
            <p>查看用户的完整资料与系统状态</p>
          </div>
        </div>
      </div>

      <a-divider/>


      <div class="user-profile-container">
        <!-- 用户基本信息区 -->
        <div class="profile-header">
          <div class="profile-avatar">
            <a-avatar :src="currentUser.avatar" :size="84"/>
            <div class="user-status" :class="getStatusClass(currentUser.status)">
              <badge-status :status="getStatusType(currentUser.status)" :text="getStatusText(currentUser.status)"/>
            </div>
          </div>

          <div class="profile-info">
            <h3 class="user-name">{{ currentUser.username }}</h3>
            <div class="user-role">
              <a-tag :color="getRoleColor(currentUser.role)">{{ getRoleName(currentUser.role) }}</a-tag>
            </div>
            <div class="user-id">ID: {{ currentUser.id }}</div>
          </div>

          <div class="profile-actions">
            <a-space>
              <a-button type="primary" @click="editThisUser">
                <template #icon>
                  <IconFont type="icon-a-bianji1" />
                </template>
                编辑
              </a-button>
              <a-button @click="resetPasswordForUser">
                <template #icon>
                  <IconFont type="icon-zhongzhimima2" />
                </template>
                重置密码
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 用户详细信息区 -->
        <div class="profile-details">
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" tab="基本信息">
              <div class="info-section">
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-yonghu"/>
                      <span>账户名</span>
                    </div>
                    <div class="info-value">{{ currentUser.account }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-yonghu-mingpian-L"/>
                      <span>用户名</span>
                    </div>
                    <div class="info-value">{{ currentUser.username }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-shoujihao1"/>
                      <span>手机号</span>
                    </div>
                    <div class="info-value">{{ currentUser.phone }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-huoyueyonghu2"/>
                      <span>角色</span>
                    </div>
                    <div class="info-value">
                      <a-tag :color="getRoleColor(currentUser.role)">{{ getRoleName(currentUser.role) }}</a-tag>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-yonghuzongshu"/>
                      <span>状态</span>
                    </div>
                    <div class="info-value">
                      <a-badge :status="getStatusType(currentUser.status)" :text="getStatusText(currentUser.status)"/>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-jiaoyiyuntubiao-1" />
                      <span>注册时间</span>
                    </div>
                    <div class="info-value">{{ formatDateTime(currentUser.registerTime) }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <IconFont type="icon-wodeshenfenquequan" />
                      <span>最后登录</span>
                    </div>
                    <div class="info-value">{{ formatDateTime(currentUser.lastLoginTime) }}</div>
                  </div>

                  <div class="info-item" v-if="currentUser.remark">
                    <div class="info-label">
                      <IconFont type="icon-document" />
                      <span>备注</span>
                    </div>
                    <div class="info-value">{{ currentUser.remark || '暂无备注' }}</div>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="2" tab="登录历史">
              <div class="login-history">
                <a-empty v-if="!loginHistory.length" description="暂无登录记录"/>
                <a-timeline v-else>
                  <a-timeline-item v-for="(item, index) in loginHistory" :key="index" :color="getTimelineColor(index)">
                    <div class="timeline-content">
                      <div class="timeline-time">{{ formatDateTime(item.time) }}</div>
                      <div class="timeline-detail">
                        <span class="device">{{ item.device }}</span>
                        <span class="ip">IP: {{ item.ip }}</span>
                        <span class="location">{{ item.location }}</span>
                      </div>
                    </div>
                  </a-timeline-item>
                </a-timeline>
              </div>
            </a-tab-pane>

            <a-tab-pane key="3" tab="操作记录">
              <div class="operation-history-container">
                <a-empty v-if="!operationHistory.length" description="暂无操作记录"/>
                <a-list v-else :data-source="operationHistory" item-layout="horizontal" class="operation-history-list">
                  <template #renderItem="{ item }">
                    <a-list-item class="operation-record-item">
                      <div class="operation-record-card">
                        <div class="operation-header">
                          <div class="operation-title">
                            <span class="module-name">{{ item.module || '系统模块' }}</span>
                            <span class="action-divider">-</span>
                            <span class="action-name">{{ item.action || '系统操作' }}</span>
                          </div>
                          <a-tag
                              :color="item.status === 0 ? 'success' : 'error'"
                              class="operation-status"
                          >
                            {{ item.status === 0 ? '成功' : '失败' }}
                          </a-tag>
                        </div>

                        <div class="operation-content">
                          <div class="operation-details">
                            <div class="detail-item">
                              <IconFont type="icon-shijian" class="detail-icon" />
                              <span class="detail-text">{{ formatDateTime(item.operationTime) }}</span>
                            </div>
                            <div class="detail-item" v-if="item.ip">
                              <IconFont type="icon-dingwei" />
                              <span class="detail-text">{{ item.ip }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-list-item>
                  </template>
                </a-list>
                <div class="operation-history-pagination">
                  <a-pagination
                      v-if="operationHistory.length > 0"
                      v-model:current="operationHistoryPagination.current"
                      :total="operationHistoryPagination.total"
                      :page-size="operationHistoryPagination.pageSize"
                      :show-size-changer="operationHistoryPagination.showSizeChanger"
                      :show-quick-jumper="operationHistoryPagination.showQuickJumper"
                      :page-size-options="operationHistoryPagination.pageSizeOptions"
                      :show-total="operationHistoryPagination.showTotal"
                      @change="handleOperationHistoryPageChange"
                      @showSizeChange="handleOperationHistoryPageSizeChange"
                  />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <div class="modal-footer">
        <a-button @click="closeUserDetails">关闭</a-button>
      </div>
    </a-modal>


    <!-- 统一的用户表单模态框 -->
    <a-modal
        v-model:visible="userFormModalVisible"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        width="720px"
        class="custom-user-modal"
    >
      <div class="edit-modal-header">
        <div class="header-content">
          <div class="header-icon">
            <IconFont :type="isEditMode ? 'icon-bianji4' : 'icon-yonghu'"/>
          </div>
          <div class="header-text">
            <h2>{{ isEditMode ? '编辑用户信息' : '添加新用户' }}</h2>
            <p>{{ isEditMode ? '请修改以下信息更新用户账号' : '请填写以下信息创建一个新的用户账号' }}</p>
          </div>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="userFormState"
          :rules="formRules"
          ref="userFormRef"
          layout="vertical"
      >
        <div class="form-row-container">
          <!-- 左侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <IconFont type="icon-jibenxinxi2"/>
              <span>基本信息</span>
            </div>

            <a-form-item label="账户名" name="account" :rules="accountRules">
              <a-input
                  v-model:value="userFormState.account"
                  placeholder="请输入账户名"
                  :disabled="isEditMode"
                  :maxLength="20"
                  :showCount="!isEditMode"
              >
                <template #prefix>
                  <IconFont type="icon-yonghu"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
              <a-input
                  v-model:value="userFormState.username"
                  placeholder="请输入用户名"
              >
                <template #prefix>
                  <IconFont type="icon-yonghu-mingpian-L"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="手机号" name="phone" :rules="phoneRules">
              <a-input
                  v-model:value="userFormState.phone"
                  placeholder="请输入手机号"
              >
                <template #prefix>
                  <IconFont type="icon-shoujihao1"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item v-if="!isEditMode" label="头像" name="avatar">
              <div class="avatar-uploader">
                <div class="upload-container" @click="handleAvatarUpload">
                  <div v-if="!userFormState.avatar" class="upload-placeholder">
                    <IconFont type="icon-upload11"/>
                    <div>点击上传</div>
                  </div>
                  <img v-else :src="userFormState.avatar" class="avatar-preview" alt="用户头像"/>
                </div>
                <div class="avatar-tips">
                  <IconFont type="icon-shuxing"/>
                  <span>支持 jpg、png 格式，大小不超过 2MB</span>
                </div>
              </div>
            </a-form-item>
          </div>

          <!-- 右侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <setting-outlined/>
              <span>账户设置</span>
            </div>

            <template v-if="!isEditMode">
              <a-form-item label="密码" name="password" :rules="passwordRules">
                <a-input-password
                    v-model:value="userFormState.password"
                    placeholder="请输入密码"
                >
                  <template #prefix>
                    <IconFont type="icon-mima4"/>
                  </template>
                </a-input-password>
                <div class="password-strength" v-if="userFormState.password">
                  <div class="strength-label">密码强度：</div>
                  <div class="strength-indicator">
                    <div class="indicator-bar" :class="getPasswordStrengthClass()"></div>
                  </div>
                  <div class="strength-text">{{ getPasswordStrengthText() }}</div>
                </div>
              </a-form-item>

              <a-form-item label="确认密码" name="confirmPassword" :rules="confirmPasswordRules">
                <a-input-password
                    v-model:value="userFormState.confirmPassword"
                    placeholder="请确认密码"
                >
                  <template #prefix>
                    <IconFont type="icon-querenmima1"/>
                  </template>
                </a-input-password>
              </a-form-item>
            </template>

            <a-form-item label="角色" name="role" :rules="[{ required: true, message: '请选择角色' }]">
              <a-select
                  v-model:value="userFormState.role"
                  placeholder="请选择用户角色"
                  :options="roleOptions"
              >
                <template #suffixIcon>
                  <IconFont type="icon-huoyueyonghu2"/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="状态" name="status" :rules="[{ required: true, message: '请选择状态' }]">
              <a-select
                  v-model:value="userFormState.status"
                  placeholder="请选择用户状态"
                  :options="statusOptions"
              >
                <template #suffixIcon>
                  <IconFont type="icon-yonghuzongshu"/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item v-if="isEditMode" label="头像" name="avatar">
              <div class="avatar-uploader">
                <div class="upload-container" @click="handleAvatarUpload">
                  <div v-if="!userFormState.avatar" class="upload-placeholder">
                    <IconFont type="icon-upload11"/>
                    <div>点击上传</div>
                  </div>
                  <img v-else :src="userFormState.avatar" class="avatar-preview" alt="用户头像"/>
                </div>
                <div class="avatar-tips">
                  <IconFont type="icon-shuxing"/>
                  <span>支持 jpg、png 格式，大小不超过 2MB</span>
                </div>
              </div>
            </a-form-item>
          </div>
        </div>

        <a-form-item label="备注" name="remark">
          <a-textarea
              v-model:value="userFormState.remark"
              :placeholder="isEditMode ? '请输入用户备注信息' : '请输入用户备注信息（选填）'"
              :rows="3"
              :maxLength="200"
              :showCount="true"
          />
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleUserFormCancel">取消</a-button>
            <a-button type="primary" @click="handleUserFormSubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              保存
            </a-button>
          </a-space>
        </div>
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
        <a-form-item label="确认新密码" name="checkPassword">
          <a-input-password v-model:value="resetPasswordForm.checkPassword" placeholder="请确认新密码"/>
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
  computed, h
} from 'vue';
import {message, Modal} from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  addUserUsingPost,
  batchDeleteUsersUsingDelete,
  deleteUserUsingDelete,
  getUserByIdUsingGet,
  getUserStatisticsUsingGet,
  listUserByPageUsingGet,
  resetUserPasswordUsingPost,
  updateUserUsingPut
} from "@/api/yonghuguanli.js";
import BaseTable from "@/components/common/BaseTable.vue";
// 引入 IconFont 组件
import IconFont from '@/components/common/IconFont.vue';
import {listOperationLogsUsingGet} from "@/api/caozuorizhiguanli.js";
import {listLoginLogsUsingGet} from "@/api/denglurizhiguanli.js";
import RealTimeStats from "@/components/common/RealTimeStats.vue";

// 表格数据和加载状态
const loading = ref(false);
const userData = ref([]);
const pagination = reactive({
  current: 1,         // 当前页码
  pageSize: 10,       // 每页条数
  total: 0,           // 总记录数
  showSizeChanger: true,  // 显示每页条数选择器
  showQuickJumper: true,  // 显示快速跳转
  pageSizeOptions: ['10', '20', '50', '100'], // 每页条数选项
  showTotal: (total) => `共 ${total} 条`,  // 总记录数展示文本
});

// 选中行数据
const selectedRowKeys = ref([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 模态框可见性和当前操作用户
const viewModalVisible = ref(false);
const visible = ref(false);
const formRef = ref();
const resetPasswordModalVisible = ref(false);
const submitLoading = ref(false);
const currentUser = ref({});

// 统一的用户表单模态框相关状态
const userFormModalVisible = ref(false);
const userFormRef = ref(null);
const isEditMode = ref(false);

// 表单引用
const resetPasswordFormRef = ref(null);


const showFullId = ref('');

// 操作记录数据
const operationHistory = ref([]);

const operationHistoryPagination = reactive({
  current: 1,         // 当前页码
  pageSize: 3,        // 每页条数 (默认值更改为5)
  total: 0,           // 总记录数
  showSizeChanger: true,  // 显示每页条数选择器
  showQuickJumper: true,  // 显示快速跳转
  pageSizeOptions: ['3', '5', '10', '20'], // 每页条数选项
  showTotal: (total) => `共 ${total} 条`,  // 总记录数展示文本
});

const userFormState = reactive({
  id: '',          // 编辑模式才会有
  account: '',     // 账户名
  username: '',    // 用户名
  password: '',    // 密码（仅新增模式）
  confirmPassword: '', // 确认密码（仅新增模式）
  phone: '',       // 手机号
  role: 'user',    // 角色
  status: 'active', // 状态
  avatar: '',      // 头像
  remark: ''       // 备注
});


// 刷新间隔 - 30秒
const refreshInterval = ref(30000);

// 头部配置
const headerConfig = {
  title: '用户管理',
  description: '管理系统用户，分配角色权限，查看用户活动记录',
  parentModule: '内容管理',
  iconType: 'icon-yonghuguanli1'
};


// 处理数据更新事件
const handleDataUpdated = (data) => {
  console.log('统计数据已更新:', data);
};

// 搜索表单数据
const searchForm = reactive({
  username: '',
  role: undefined,
  status: undefined,
  registerTime: [],
});

// 模拟登录历史数据
const loginHistory = ref([
  {
    time: new Date(2025, 2, 30, 10, 25, 0).getTime(),
    device: '苹果 iPhone 13',
    ip: '192.168.1.1',
    location: '北京市海淀区'
  },
  {
    time: new Date(2025, 2, 28, 16, 42, 0).getTime(),
    device: 'Chrome 浏览器 (Windows)',
    ip: '192.168.1.1',
    location: '北京市海淀区'
  },
  {
    time: new Date(2025, 2, 25, 9, 15, 0).getTime(),
    device: 'Safari 浏览器 (MacOS)',
    ip: '220.181.38.148',
    location: '北京市朝阳区'
  }
]);



// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 120,
    fixed: 'left',
    className: 'id-column',
    ellipsis: true,
  },
  {
    title: '账户名',
    dataIndex: 'account',
    align: 'center',
    width: 120
  },
  {
    title: '用户名',
    dataIndex: 'username',
    align: 'center',
    width: 120
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    align: 'center',
    width: 120
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    align: 'center',
    width: 80
  },
  {
    title: '角色',
    dataIndex: 'role',
    align: 'center',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    width: 100
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    align: 'center',
    width: 140
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 160,
    className: 'action-column'
  }
];

// 行操作按钮配置
const getRowActions = (record) => {
  const actions = [
    {
      key: 'view',
      text: '查看',
      type: 'link',
      icon: () => h(IconFont, {type: 'icon-chakan2', style: {color: 'inherit'}})
    },
    {
      key: 'edit',
      text: '编辑',
      type: 'link',
      icon: () => h(IconFont, {type: 'icon-bianji4', style: {color: 'inherit'}})
    }
  ];

  // 非管理员角色才显示更多操作
  if (record.role !== 'admin' && record.role !== 'superAdmin') {
    actions.push({
      key: 'dropdown',
      text: '更多',
      type: 'dropdown',
      items: [
        {
          key: 'resetPassword',
          text: '重置密码',
          icon: () => h(IconFont, {type: 'icon-zhongzhimima2', style: {color: 'inherit'}})
        },
        {
          divider: true
        },
        {
          key: 'delete',
          text: '删除',
          icon: () => h(IconFont, {type: 'icon-shanchu', style: {color: 'inherit'}}),
          danger: true,
          confirm: {
            title: '确认删除',
            content: `确定要删除用户 "${record.username}" 吗？此操作不可恢复！`
          }
        }
      ]
    });
  }

  return actions;
};
// 处理表格行操作
const handleTableRowAction = ({action, record}) => {
  console.log('收到行操作:', action);

  // 使用 action.key 来判断是哪种操作
  switch (action.key) {
    case 'view':
      viewUserDetails(record);
      break;
    case 'edit':
      editUser(record);
      break;
    case 'resetPassword':
      resetPassword(record);
      break;
    case 'delete':
      confirmDelete(record);
      break;
    default:
      console.log('未处理的操作:', action.key, record);
  }
};

// 为头部指标准备数据
const headerMetrics = computed(() => [
  {
    icon: () => h(IconFont, {type: 'icon-jinri1'}),
    label: '今日登录',
    value: stats.value.todayLoginUsers || 0
  },
  {
    icon: () => h(IconFont, {type: 'icon-benzhouremen-'}),
    label: '本周新增',
    value: stats.value.newUsersThisWeek || 0
  },
  {
    icon: () => h(IconFont, {type: 'icon-user-locking'}),
    label: '禁用账户',
    value: stats.value.bannedUsers || 0
  }
]);


// 顶部卡片数据
const statCards = reactive([
  {
    title: '注册用户总数',
    value: 673,
    change: 9.3,
    color: 'purple',
    icon: () => h(IconFont, {type: 'icon-pingtaiyonghuzongshu'})
  },
  {
    title: '本月新增用户',
    value: 86,
    change: 12.5,
    color: 'blue',
    icon: () => h(IconFont, {type: 'icon-benzhouxinzengtishishuliang'})
  },
  {
    title: 'VIP用户总数',
    value: 128,
    change: 5.2,
    color: 'gold',
    icon: () => h(IconFont, {type: 'icon-17003'})
  },
  {
    title: '活跃用户比例',
    value: '78.6%',
    change: -2.3,
    color: 'green',
    icon: () => h(IconFont, {type: 'icon-huoyueyonghu'})
  },
]);

// 获取时间线颜色
const getTimelineColor = (index) => {
  const colors = ['#6554C0', '#52C41A', '#1890FF', '#FAAD14', '#F5222D'];
  return colors[index % colors.length];
};

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    active: 'status-active',
    inactive: 'status-inactive',
    banned: 'status-banned'
  };
  return statusMap[status] || 'status-default';
};

// 角色选项
const roleOptions = [
  {value: 'user', label: '普通用户'},
  {value: 'admin', label: '管理员'},
  {value: 'vip', label: 'VIP用户'},
  {value: 'superAdmin', label: '超级管理员'}
];

// 状态选项
const statusOptions = [
  {value: 'active', label: '已激活', tagColor: 'success'},
  {value: 'inactive', label: '未激活', tagColor: 'warning'},
  {value: 'banned', label: '已禁用', tagColor: 'error'}
];

// 重置密码表单数据
const resetPasswordForm = reactive({
  userId: '',
  newPassword: '',
  checkPassword: '',
});


// 重置密码确认验证
const validateResetPasswordConfirm = (rule, value) => {
  if (value !== resetPasswordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};


// 重置用户表单状态
const resetUserFormState = () => {
  userFormState.id = '';
  userFormState.account = '';
  userFormState.username = '';
  userFormState.password = '';
  userFormState.confirmPassword = '';
  userFormState.phone = '';
  userFormState.role = 'user';
  userFormState.status = 'active';
  userFormState.avatar = '';
  userFormState.remark = '';

  // 如果表单引用存在，重置表单验证状态
  userFormRef.value && userFormRef.value.resetFields();
};

// 重置密码验证规则
const resetPasswordRules = {
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur'}
  ],
  checkPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {validator: validateResetPasswordConfirm, trigger: 'blur'}
  ],
};


// 表单验证规则
const accountRules = [
  {required: true, message: '请输入账户名', trigger: 'blur'},
  {min: 3, max: 20, message: '账户名长度应为3-20个字符', trigger: 'blur'}
];

const phoneRules = [
  {required: true, message: '请输入手机号', trigger: 'blur'},
  {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
];

const passwordRules = [
  {required: true, message: '请输入密码', trigger: 'blur'},
  {min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur'}
];

// 确认密码验证规则
const confirmPasswordRules = computed(() => [
  {required: true, message: '请确认密码', trigger: 'blur'},
  {validator: validateUserFormConfirmPassword, trigger: 'blur'}
]);

// 密码确认验证
const validateUserFormConfirmPassword = async (_rule, value) => {
  if (value === '') {
    return Promise.reject('请确认密码');
  } else if (value !== userFormState.password) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};

const formRules = {
  account: accountRules,
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur'}
  ],
  phone: phoneRules,
  role: [
    {required: true, message: '请选择角色', trigger: 'change'}
  ],
  status: [
    {required: true, message: '请选择状态', trigger: 'change'}
  ],
};


// 打开添加用户表单
const openAddUserForm = () => {
  // 设置为新增模式
  isEditMode.value = false;

  // 重置表单数据
  resetUserFormState();

  // 打开模态框
  userFormModalVisible.value = true;
};

// 打开编辑用户表单
const openEditUserForm = async (record) => {
  try {
    // 设置为编辑模式
    isEditMode.value = true;

    // 获取完整的用户信息
    const response = await getUserByIdUsingGet({id: record.id});

    if (response.data && response.data.data) {
      const userData = response.data.data;

      // 填充表单数据
      userFormState.id = userData.id.toString();
      userFormState.account = userData.account || '';
      userFormState.username = userData.username || '';
      userFormState.phone = userData.phone || '';
      userFormState.avatar = userData.avatar || '';
      userFormState.role = userData.role || '';
      userFormState.status = userData.status || '';
      userFormState.remark = userData.remark || '';

      // 清空密码字段（编辑模式不需要）
      userFormState.password = '';
      userFormState.confirmPassword = '';

      // 打开模态框
      userFormModalVisible.value = true;
    } else {
      message.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('加载用户信息错误:', error);
    message.error('加载用户信息失败，请稍后重试');
  }
};


// 用户表单取消处理
const handleUserFormCancel = () => {
  resetUserFormState();
  userFormModalVisible.value = false;
};

// 用户表单提交处理
const handleUserFormSubmit = () => {
  userFormRef.value.validate()
      .then(async () => {
        submitLoading.value = true;
        try {
          if (isEditMode.value) {
            // 编辑模式 - 更新用户
            const params = {
              id: userFormState.id,
              username: userFormState.username,
              phone: userFormState.phone,
              avatar: userFormState.avatar,
              role: userFormState.role,
              status: userFormState.status,
              remark: userFormState.remark
            };

            const response = await updateUserUsingPut(params);

            if (response.data && response.data.data) {
              message.success('用户信息已更新');

              // 更新表格中的数据
              const index = userData.value.findIndex(user => user.id === userFormState.id);
              if (index !== -1) {
                userData.value[index] = {...userData.value[index], ...params};
              }

              // 关闭表单
              userFormModalVisible.value = false;

              // 刷新用户列表
              fetchUserData();
            } else {
              message.error('更新用户信息失败: ' + (response.data?.message || '未知错误'));
            }
          } else {
            // 新增模式 - 添加用户
            const params = {
              account: userFormState.account,
              username: userFormState.username,
              password: userFormState.password,
              phone: userFormState.phone,
              avatar: userFormState.avatar,
              role: userFormState.role,
              status: userFormState.status,
              remark: userFormState.remark
            };

            const response = await addUserUsingPost(params);

            if (response.data) {
              message.success('添加用户成功');

              // 关闭表单
              userFormModalVisible.value = false;

              // 刷新用户列表
              fetchUserData();
            } else {
              message.error('添加用户失败');
            }
          }
        } catch (error) {
          console.error(isEditMode.value ? '更新用户信息错误:' : '添加用户错误:', error);
          message.error((isEditMode.value ? '更新用户信息' : '添加用户') + '失败，请稍后重试');
        } finally {
          submitLoading.value = false;
        }
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};

// 密码强度计算
const getPasswordStrength = computed(() => {
  const password = userFormState.password || '';
  if (!password) return 0;

  let strength = 0;
  // 密码长度大于8
  if (password.length >= 8) strength += 1;
  // 包含数字
  if (/\d/.test(password)) strength += 1;
  // 包含小写字母
  if (/[a-z]/.test(password)) strength += 1;
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength += 1;
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  return Math.min(5, strength);
});

// 获取密码强度类名
const getPasswordStrengthClass = () => {
  const strength = getPasswordStrength.value;
  if (strength <= 1) return 'very-weak';
  if (strength === 2) return 'weak';
  if (strength === 3) return 'medium';
  if (strength === 4) return 'strong';
  return 'very-strong';
};

// 获取密码强度文本
const getPasswordStrengthText = () => {
  const strength = getPasswordStrength.value;
  if (strength <= 1) return '非常弱';
  if (strength === 2) return '弱';
  if (strength === 3) return '中等';
  if (strength === 4) return '强';
  return '非常强';
};

// 关闭用户详情
const closeUserDetails = () => {
  viewModalVisible.value = false;
};

// 编辑当前用户
const editThisUser = () => {
  // 关闭详情窗口
  viewModalVisible.value = false;

  // 调用编辑函数
  editUser(currentUser.value);
};

// 为当前用户重置密码
const resetPasswordForUser = () => {
  // 关闭详情窗口
  viewModalVisible.value = false;

  // 调用重置密码函数
  resetPassword(currentUser.value);
};


const showModal = () => {
  visible.value = true;
};


// 重置表单
const resetForm = () => {
  formRef.value && formRef.value.resetFields();
};


const stats = ref({
  todayLoginUsers: 0,
  newUsersThisWeek: 0,
  bannedUsers: 0
});


// 获取用户统计数据
const fetchUserStatistics = async () => {
  try {
    const response = await getUserStatisticsUsingGet();
    if (response.data && response.data.data) {
      const data = response.data.data;

      // 更新统计卡片数据
      statCards[0].value = data.totalUsers || 0;
      statCards[1].value = data.newUsersThisMonth || 0;
      statCards[2].value = data.vipUsers || 0;
      statCards[3].value = `${data.activeUserRatio || 0}%`;

      // 更新增长率
      statCards[0].change = data.totalUserGrowth || 0;
      statCards[1].change = data.newUserGrowth || 0;
      statCards[2].change = data.vipUserGrowth || 0;
      statCards[3].change = data.activeGrowth || 0;

      // 更新顶部指标数据（使用响应式数据）
      stats.value = {
        todayLoginUsers: data.todayLoginUsers || 0,
        newUsersThisWeek: data.newUsersThisWeek || 0,
        bannedUsers: data.bannedUsers || 0
      };
    }
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    message.error('获取统计数据失败');
  }
};


// 格式化日期时间
const formatDateTime = (timestamp, dateOnly = false) => {
  if (!timestamp) return '';
  return dayjs(timestamp).format(dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

// 搜索处理
const handleSearch = async () => {
  pagination.current = 1; // 重置到第一页
  await fetchUserData(); // 使用搜索条件获取数据
};


// 刷新表格数据
const handleRefresh = () => {
  fetchUserData();
  selectedRowKeys.value = [];
  message.success('数据已刷新');
};

// 表格选择变化
const onSelectChange = (selected) => {
  selectedRowKeys.value = selected;
};

// 表格变化处理（排序、分页等）
const handleTableChange = (pag, filters, sorter) => {
  console.log("表格变化:", pag);
  // 更新分页信息
  pagination.current = pag.pagination.current;
  pagination.pageSize = pag.pagination.pageSize;
  // 重新获取数据
  fetchUserData();
};


// 获取角色名称
const getRoleName = (role) => {
  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户',
    superAdmin: '超级管理员'
  };
  return roleMap[role] || '未知角色';
};


// 获取角色颜色
const getRoleColor = (role) => {
  const colorMap = {
    admin: '#6554C0',
    user: '#52C41A',
    vip: '#FAAD14',
    superAdmin: '#FF4D4F'
  };
  return colorMap[role] || 'default';
};

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'warning',
    banned: 'error'
  };
  return statusMap[status] || 'default';
};


// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '已激活',
    inactive: '未激活',
    banned: '已禁用'
  };
  return statusMap[status] || '未知状态';
};

// 格式化ID显示，截断过长的ID
const formatId = (id) => {
  if (id && id.toString().length > 12) {
    const idStr = id.toString();
    const start = idStr.substring(0, 6);
    const end = idStr.substring(idStr.length - 4);
    return `${start}...${end}`;
  }
  return id;
};

// 获取用户数据
const fetchUserData = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      username: searchForm.username || undefined,
      role: searchForm.role || undefined,
      status: searchForm.status || undefined,
      registerTimeStart: searchForm.registerTime?.[0] ? dayjs(searchForm.registerTime[0]).format('YYYY-MM-DD') : undefined,
      registerTimeEnd: searchForm.registerTime?.[1] ? dayjs(searchForm.registerTime[1]).format('YYYY-MM-DD') : undefined,
    };

    // 调用API
    const response = await listUserByPageUsingGet(params);
    const result = response.data;
    if (result.code === 200 && result.data) {
      // 确保ID为字符串类型，防止JS对大数的精度问题
      userData.value = (result.data.records || []).map(user => ({
        ...user,
        id: user.id?.toString() // 确保ID为字符串
      }));

      // 更新分页信息 - 匹配后端返回的字段
      pagination.total = result.data.total || 0;
      pagination.current = result.data.pageNum || 1;

    } else {
      userData.value = [];
      pagination.total = 0;
      message.warning('获取用户数据失败');
    }
  } catch (error) {
    console.error('获取用户列表错误:', error);
    message.error('获取用户列表失败，请稍后重试');
    userData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 查看用户详情
const viewUserDetails = async (record) => {
  try {
    // 确保使用完整的ID字符串
    const userId = record.id;

    // 重置操作记录分页到第一页
    operationHistoryPagination.current = 1;

    // 并行发起用户详情和登录历史请求
    const [userResponse, loginHistoryResponse] = await Promise.all([
      getUserByIdUsingGet({id: userId}),
      listLoginLogsUsingGet({
        createBy: userId,
        pageNum: 1,
        pageSize: 3
      })
    ]);

    if (userResponse.data && userResponse.data.code === 200) {
      // 设置用户基本信息
      currentUser.value = userResponse.data.data;

      // 处理登录历史
      if (loginHistoryResponse.data && loginHistoryResponse.data.code === 200) {
        // 转换登录历史数据，保留全部字段
        loginHistory.value = loginHistoryResponse.data.data.records.map(log => ({
          time: log.loginTime,
          device: `${log.browser} (${log.os})`,
          ip: log.ip,
          location: log.location
        }));
      } else {
        loginHistory.value = [];
      }

      // 而是通过封装的方法获取
      await fetchOperationHistory(userId);

      // 打开详情模态框
      viewModalVisible.value = true;
    } else {
      message.error('获取用户详情失败');
    }
  } catch (error) {
    console.error('获取用户详情错误:', error);
    message.error('获取用户详情失败，请稍后重试');
  }
};


const fetchOperationHistory = async (userId) => {
  const userIdToUse = userId || (currentUser.value ? currentUser.value.id : null);

  // 如果没有有效的用户ID，则不进行请求
  if (!userIdToUse) {
    operationHistory.value = [];
    operationHistoryPagination.total = 0;
    return;
  }

  try {
    // 构建请求参数
    const params = {
      createBy: userIdToUse,
      pageNum: operationHistoryPagination.current,
      pageSize: operationHistoryPagination.pageSize
    };

    const response = await listOperationLogsUsingGet(params);


    if (response.data && response.data.code === 200) {
      const operationData = response.data.data;

      // 更新数据与分页信息
      operationHistory.value = operationData?.records || [];
      operationHistoryPagination.total = operationData?.total || 0;
      operationHistoryPagination.current = operationData?.pageNum || 1;
    } else {
      // 获取失败时的处理
      operationHistory.value = [];
      operationHistoryPagination.total = 0;
      message.warning('未获取到操作记录');
    }
  } catch (error) {
    console.error('获取操作记录错误:', error);
    message.error('获取操作记录失败');

    // 发生错误时重置
    operationHistory.value = [];
    operationHistoryPagination.total = 0;
  }
};

// 处理操作记录分页变化
const handleOperationHistoryPageChange = async (page, pageSize) => {
  // 更新分页信息
  operationHistoryPagination.current = page;
  operationHistoryPagination.pageSize = pageSize;

  // 获取操作记录数据 - 使用当前用户ID
  await fetchOperationHistory(currentUser.value?.id);
};

// 页大小变化处理函数
const handleOperationHistoryPageSizeChange = async (current, size) => {
  // 更新分页信息，页码重置为1
  operationHistoryPagination.current = 1;
  operationHistoryPagination.pageSize = size;

  // 获取操作记录数据 - 使用当前用户ID
  await fetchOperationHistory(currentUser.value?.id);
};

// 打开添加用户弹窗
const openAddUserModal = () => {
  openAddUserForm(); // 替换原来的打开添加用户弹窗逻辑
};

const editUser = (record) => {
  openEditUserForm(record); // 替换原来的打开编辑用户弹窗逻辑
};


const resetSearchForm = () => {
  // 重置搜索表单的所有字段
  searchForm.username = '';
  searchForm.role = undefined;
  searchForm.status = undefined;
  searchForm.registerTime = [];

  // 重新获取数据
  pagination.current = 1;
  fetchUserData();

  message.success('搜索条件已重置');
};


// 头像上传处理函数
const handleAvatarUpload = () => {
  // 这里实现头像上传逻辑，可以使用input file或者其他上传组件
  // 简单模拟上传成功后设置头像
  const mockAvatar = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
  userFormState.avatar = mockAvatar;
};

// 重置用户密码
const resetPassword = (record) => {
  resetPasswordForm.userId = record.id;
  resetPasswordForm.newPassword = '';
  resetPasswordForm.checkPassword = '';
  resetPasswordModalVisible.value = true;
};

// 处理重置密码提交
const handleResetPassword = () => {
  resetPasswordFormRef.value.validate()
      .then(async () => {
        submitLoading.value = true;
        try {
          // 构建请求参数
          const params = {
            userId: resetPasswordForm.userId,
            newPassword: resetPasswordForm.newPassword,
            checkPassword: resetPasswordForm.checkPassword,
          };

          // 调用重置密码API
          const response = await resetUserPasswordUsingPost(params);

          if (response.data) {
            message.success('密码已重置');
            resetPasswordModalVisible.value = false;
          } else {
            message.error('重置密码失败');
          }
        } catch (error) {
          console.error('重置密码错误:', error);
          message.error('重置密码失败，请稍后重试');
        } finally {
          submitLoading.value = false;
        }
      })
      .catch(error => {
        console.error('表单验证失败', error);
      });
};

// 确认删除方法
const confirmDelete = (record) => {
  // 使用 Modal.confirm 替代当前的简单 Modal
  Modal.confirm({
    title: '确定要删除此用户吗?',
    content: '删除后将无法恢复，请谨慎操作。',
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      deleteUser(record);
    }
  });
};


// 删除用户
const deleteUser = async (record) => {
  loading.value = true;
  try {
    const userId = record.id;
    const response = await deleteUserUsingDelete({id: userId});

    if (response.data) {
      // 从当前列表中移除被删除的用户
      userData.value = userData.value.filter(user => user.id !== record.id);

      // 更新总条数
      pagination.total -= 1;

      // 判断当前页删除后是否为空
      if (userData.value.length === 0 && pagination.current > 1) {
        // 如果当前页为空且不是第一页，则跳转到前一页
        pagination.current -= 1;
        // 重新获取数据
        await fetchUserData();
      }

      message.success('用户已删除');
    } else {
      message.error('删除用户失败');
    }
  } catch (error) {
    console.error('删除用户错误:', error, '请求ID:', record.id);
    message.error('删除用户失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 批量删除用户
const handleBatchDelete = async () => {
  if (!selectedRowKeys.value.length) {
    return;
  }

  Modal.confirm({
    title: '批量删除用户',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？删除后将无法恢复。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      loading.value = true;
      try {
        // 记录当前页码
        const currentPage = pagination.current;

        // 记录当前页选中的行数
        const currentPageSelectedCount = userData.value.filter(
            user => selectedRowKeys.value.includes(user.id)
        ).length;

        // 使用批量删除API
        const response = await batchDeleteUsersUsingDelete({
          ids: selectedRowKeys.value
        });

        if (response.data) {
          // 更新总条数
          pagination.total -= selectedRowKeys.value.length;
          selectedRowKeys.value = [];

          // 判断是否会删除当前页的所有数据
          if (currentPageSelectedCount === userData.value.length && currentPage > 1) {
            // 如果当前页所有数据都被删除且不是第一页，则跳转到前一页
            pagination.current = currentPage - 1;
          }

          message.success('已批量删除用户');
          // 刷新用户列表
          await fetchUserData();
        } else {
          message.error('批量删除用户失败');
        }
      } catch (error) {
        console.error('批量删除用户错误:', error);
        message.error('批量删除用户失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserData();
  fetchUserStatistics();
});

// 暴露方法给父组件使用
defineExpose({
  showModal,
  confirmDelete
});
</script>

<style scoped>
/* 全局容器样式 */
.user-management-container {
  padding: 16px;
}


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

/* 操作按钮区域样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search-form-items {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-form-items .ant-form-item {
    margin-right: 0;
    width: 100%;
  }

  .search-buttons {
    margin-top: 8px;
    width: 100%;
  }

  .search-buttons .ant-btn {
    flex: 1;
  }
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

.form-row-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.form-column {
  flex: 0 0 50%;
  padding: 0 10px;
  box-sizing: border-box;
}

.edit-modal-header {
  background: linear-gradient(135deg, #6554C0, #8A7AD8);
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  margin: -24px -24px 0;
  position: relative;
  overflow: hidden;
}

.edit-modal-header::after {
  content: '';
  position: absolute;
  right: -15px;
  top: -15px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-icon :deep(svg) {
  font-size: 24px;
  color: white;
}

.header-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.header-text p {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 配合模态框其他部分的样式调整 */
.custom-user-modal :deep(.ant-modal-body) {
  padding-top: 0;
}

.custom-user-modal :deep(.ant-modal-close) {
  color: white;
  top: 16px;
}

.custom-user-modal :deep(.ant-modal-close:hover) {
  background: rgba(255, 255, 255, 0.2);
}

/* 让顶部与内容之间的分隔线更加协调 */
.edit-modal-header + .ant-divider {
  margin-top: 24px;
  margin-bottom: 24px;
}

.upload-container {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-container:hover {
  border-color: #1890ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.upload-placeholder .anticon {
  font-size: 24px;
  margin-bottom: 4px;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.custom-user-modal :deep(.ant-modal-header) {
  background: linear-gradient(to right, #6554C0, #8A7AD8);
  padding: 16px 24px;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.custom-user-modal :deep(.ant-modal-title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-user-modal :deep(.ant-modal-close) {
  color: white;
}

.custom-user-modal :deep(.ant-modal-body) {
  padding: 0 24px 24px;
}

.custom-user-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 0 4px;
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

.form-row-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.form-column {
  flex: 0 0 50%;
  padding: 0 12px;
  box-sizing: border-box;
}

.column-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f0f0f0;
  color: #6554C0;
  font-weight: 600;
}

.column-header .anticon {
  margin-right: 8px;
  font-size: 16px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
}

.upload-container {
  width: 104px;
  height: 104px;
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-container:hover {
  border-color: #6554C0;
  background-color: #f6f5ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.upload-placeholder .anticon {
  font-size: 24px;
  margin-bottom: 8px;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
}

.avatar-tips .anticon {
  margin-right: 4px;
  color: #6554C0;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.strength-label {
  color: #666;
  margin-right: 8px;
}

.strength-indicator {
  width: 100px;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-right: 8px;
}

.indicator-bar {
  height: 100%;
  transition: width 0.3s;
}

/* 密码强度颜色 */
.indicator-bar.very-weak {
  width: 20%;
  background-color: #ff4d4f;
}

.indicator-bar.weak {
  width: 40%;
  background-color: #faad14;
}

.indicator-bar.medium {
  width: 60%;
  background-color: #1890ff;
}

.indicator-bar.strong {
  width: 80%;
  background-color: #52c41a;
}

.indicator-bar.very-strong {
  width: 100%;
  background-color: #52c41a;
}

.strength-text {
  color: #666;
}

/* 用户资料容器 */
.user-profile-container {
  padding: 0;
}

/* 用户资料头部 */
.profile-header {
  display: flex;
  padding: 20px;
  background-color: #f9f9ff;
  border-radius: 8px;
  margin-bottom: 24px;
}

.profile-avatar {
  position: relative;
  margin-right: 24px;
}

.user-status {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-active {
  border: 1px solid #52C41A;
}

.status-inactive {
  border: 1px solid #FAAD14;
}

.status-banned {
  border: 1px solid #F5222D;
}

.profile-info {
  flex: 1;
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.user-role {
  margin-bottom: 8px;
}

.user-id {
  font-size: 14px;
  color: #888;
}

.profile-actions {
  display: flex;
  align-items: flex-start;
}

/* 信息区域样式 */
.info-section {
  padding: 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px 40px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  display: flex;
  align-items: center;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label .anticon {
  margin-right: 8px;
  color: #6554C0;
}

.info-value {
  font-size: 16px;
  color: #333;
}

/* 登录历史样式 */
.login-history {
  padding: 16px 0;
}

.timeline-content {
  padding: 4px 0;
}

.timeline-time {
  font-weight: 500;
  margin-bottom: 4px;
}

.timeline-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.device {
  font-weight: 500;
}

.ip, .location {
  color: #888;
}

/* 页脚样式 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 操作列样式优化 */
.action-buttons .ant-btn {
  padding: 0 8px;
}

/* 当操作按钮位于表格最后一列时，确保下拉菜单向左展开 */
.action-buttons .ant-dropdown-menu {
  min-width: 120px;
}

/* ID列样式增强 */
.truncated-id {
  cursor: pointer;
  color: #6554C0;
  position: relative;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncated-id:hover {
  color: #6554C0;
  text-decoration: underline;
}

/* 操作记录列表样式 */
.operation-history-list {
  margin-bottom: 16px;
}

.operation-record-item {
  padding: 0 !important;
  margin-bottom: 16px;
}

.operation-record-card {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.operation-record-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.operation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.operation-title {
  font-size: 16px;
  font-weight: 500;
}

.module-name {
  color: #6554C0;
  font-weight: 600;
}

.action-divider {
  margin: 0 8px;
  color: #aaa;
}

.action-name {
  color: #333;
}

.operation-status {
  font-weight: 500;
}

.operation-content {
  padding-top: 8px;
}

.operation-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.detail-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #8A7AD8;
}

.operation-description {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f9f9ff;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
}

.description-label {
  color: #6554C0;
  font-weight: 500;
  margin-bottom: 4px;
}

.description-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 优化分页组件样式 */
.operation-history-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 增强 Tooltip 的可见性 */
:deep(.ant-tooltip) {
  max-width: 500px;
}

:deep(.ant-tooltip-inner) {
  word-break: break-all;
  font-family: monospace;
  padding: 8px 12px;
}

/* 响应式设计优化 */
@media screen and (max-width: 576px) {
  :deep(.id-column) {
    min-width: 100px;
    max-width: 100px;
  }

  /* 优化小屏幕下的表格显示 */
  .user-management-container :deep(.ant-table-content) {
    overflow-x: auto;
  }

  /* 确保操作列在小屏幕上保持可见 */
  :deep(.action-column) {
    position: sticky;
    right: 0;
    background-color: #fff;
    z-index: 1;
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .profile-actions {
    margin-top: 16px;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-column {
    flex: 0 0 100%;
  }

  .custom-user-modal {
    width: 95% !important;
    max-width: 500px;
  }
}
</style>