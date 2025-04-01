<template>
  <div class="user-management-container">
    <div class="um-page-container">
      <!-- 用户管理页面标题区域 -->
      <div class="um-header">
        <div class="um-header-left">
          <div class="um-icon-container">
            <team-outlined class="um-icon"/>
          </div>
          <div class="um-header-info">
            <div class="um-title-row">
              <h1 class="um-title">用户管理</h1>
              <a-tag color="#6554C0">内容管理</a-tag>
            </div>
            <p class="um-description">
              管理系统用户，分配角色权限，查看用户活动记录
            </p>
          </div>
        </div>

        <div class="um-header-right">
          <div class="um-metrics">
            <div class="um-metric-item">
              <div class="um-metric-label">
                <calendar-outlined/>
                今日登录
              </div>
              <div class="um-metric-value">48</div>
            </div>
            <div class="um-divider"></div>
            <div class="um-metric-item">
              <div class="um-metric-label">
                <user-add-outlined/>
                本周新增
              </div>
              <div class="um-metric-value">26</div>
            </div>
            <div class="um-divider"></div>
            <div class="um-metric-item">
              <div class="um-metric-label">
                <safety-outlined/>
                待审核
              </div>
              <div class="um-metric-value">12</div>
            </div>
          </div>
        </div>
      </div>
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
      <a-space>
        <a-button type="primary" @click="openAddUserModal">
          <plus-outlined/>
          添加用户
        </a-button>
        <a-button  @click="handleRefresh">
          <reload-outlined/>
          刷新
        </a-button>
        <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
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
        width="720px"
        :mask-closable="true"
        :destroyOnClose="true"
        class="custom-user-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <eye-outlined/>
        </div>
        <div class="header-title">
          <h2>用户详细信息</h2>
          <p>查看用户的完整资料与系统状态</p>
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
                  <edit-outlined/>
                </template>
                编辑
              </a-button>
              <a-button @click="resetPasswordForUser">
                <template #icon>
                  <key-outlined/>
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
                      <user-outlined/>
                      <span>账户名</span>
                    </div>
                    <div class="info-value">{{ currentUser.account }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <solution-outlined/>
                      <span>用户名</span>
                    </div>
                    <div class="info-value">{{ currentUser.username }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <phone-outlined/>
                      <span>手机号</span>
                    </div>
                    <div class="info-value">{{ currentUser.phone }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <team-outlined/>
                      <span>角色</span>
                    </div>
                    <div class="info-value">
                      <a-tag :color="getRoleColor(currentUser.role)">{{ getRoleName(currentUser.role) }}</a-tag>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <check-circle-outlined/>
                      <span>状态</span>
                    </div>
                    <div class="info-value">
                      <a-badge :status="getStatusType(currentUser.status)" :text="getStatusText(currentUser.status)"/>
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <calendar-outlined/>
                      <span>注册时间</span>
                    </div>
                    <div class="info-value">{{ formatDateTime(currentUser.registerTime) }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      <clock-circle-outlined/>
                      <span>最后登录</span>
                    </div>
                    <div class="info-value">{{ formatDateTime(currentUser.lastLoginTime) }}</div>
                  </div>

                  <div class="info-item" v-if="currentUser.remark">
                    <div class="info-label">
                      <message-outlined/>
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
              <a-empty description="暂无操作记录"/>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <div class="modal-footer">
        <a-button @click="closeUserDetails">关闭</a-button>
      </div>
    </a-modal>
    <!-- 编辑用户信息弹窗 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑用户信息"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-user-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <edit-outlined/>
        </div>
        <div class="header-title">
          <h2>编辑用户信息</h2>
          <p>请修改以下信息更新用户账号</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="editForm"
          :rules="rules"
          ref="editFormRef"
          layout="vertical"
      >
        <div class="form-row-container">
          <!-- 左侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <profile-outlined/>
              <span>基本信息</span>
            </div>

            <a-form-item label="账户名" name="account">
              <a-input
                  v-model:value="editForm.account"
                  placeholder="请输入账户名"
                  disabled
              >
                <template #prefix>
                  <user-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="用户名" name="username">
              <a-input
                  v-model:value="editForm.username"
                  placeholder="请输入用户名"
              >
                <template #prefix>
                  <solution-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="手机号" name="phone">
              <a-input
                  v-model:value="editForm.phone"
                  placeholder="请输入手机号"
              >
                <template #prefix>
                  <phone-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>
          </div>

          <!-- 右侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <setting-outlined/>
              <span>账户设置</span>
            </div>

            <a-form-item label="角色" name="role">
              <a-select
                  v-model:value="editForm.role"
                  placeholder="请选择用户角色"
                  :options="roleOptions"
              >
                <template #suffixIcon>
                  <team-outlined/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="状态" name="status">
              <a-select
                  v-model:value="editForm.status"
                  placeholder="请选择用户状态"
                  :options="statusOptions"
              >
                <template #suffixIcon>
                  <check-circle-outlined/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="头像" name="avatar">
              <div class="avatar-uploader">
                <div class="upload-container" @click="handleAvatarUpload">
                  <div v-if="!editForm.avatar" class="upload-placeholder">
                    <upload-outlined/>
                    <div>点击上传</div>
                  </div>
                  <img v-else :src="editForm.avatar" class="avatar-preview" alt="用户头像"/>
                </div>
                <div class="avatar-tips">
                  <info-circle-outlined/>
                  <span>支持 jpg、png 格式，大小不超过 2MB</span>
                </div>
              </div>
            </a-form-item>
          </div>
        </div>

        <a-form-item label="备注" name="remark">
          <a-textarea
              v-model:value="editForm.remark"
              placeholder="请输入用户备注信息（选填）"
              :rows="3"
              :maxLength="200"
              :showCount="true"
          />
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleEditCancel">取消</a-button>
            <a-button type="primary" @click="handleEditSubmit" :loading="submitLoading">
              <template #icon>
                <save-outlined/>
              </template>
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>
    <!-- 添加用户弹窗 -->
    <a-modal
        v-model:visible="visible"
        title="添加用户"
        width="720px"
        :mask-closable="false"
        :destroyOnClose="true"
        :footer="null"
        class="custom-user-modal"
    >
      <div class="modal-header">
        <div class="header-icon">
          <user-outlined/>
        </div>
        <div class="header-title">
          <h2>添加新用户</h2>
          <p>请填写以下信息创建一个新的用户账号</p>
        </div>
      </div>

      <a-divider/>

      <a-form
          :model="formState"
          :rules="rules"
          ref="formRef"
          layout="vertical"
      >
        <div class="form-row-container">
          <!-- 左侧表单列 -->
          <div class="form-column">
            <div class="column-header">
              <profile-outlined/>
              <span>基本信息</span>
            </div>

            <a-form-item label="账户名" name="accountName" :rules="[{ required: true, message: '请输入账户名' }]">
              <a-input
                  v-model:value="formState.accountName"
                  placeholder="请输入账户名"
                  :maxLength="20"
                  :showCount="true"

              >
                <template #prefix>
                  <user-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="用户名" name="userName" :rules="[{ required: true, message: '请输入用户名' }]">
              <a-input
                  v-model:value="formState.userName"
                  placeholder="请输入用户名"
              >
                <template #prefix>
                  <solution-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="手机号" name="phone" :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
          ]">
              <a-input
                  v-model:value="formState.phone"
                  placeholder="请输入手机号"
              >
                <template #prefix>
                  <phone-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="头像" name="avatar">
              <div class="avatar-uploader">
                <div
                    class="upload-container"
                    @click="handleAvatarUpload"
                >
                  <div v-if="!formState.avatar" class="upload-placeholder">
                    <upload-outlined/>
                    <div>点击上传</div>
                  </div>
                  <img v-else :src="formState.avatar" class="avatar-preview" alt="用户头像"/>
                </div>
                <div class="avatar-tips">
                  <info-circle-outlined/>
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

            <a-form-item label="密码" name="password" :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6个字符' }
          ]">
              <a-input-password
                  v-model:value="formState.password"
                  placeholder="请输入密码"
              >
                <template #prefix>
                  <lock-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input-password>
              <div class="password-strength" v-if="formState.password">
                <div class="strength-label">密码强度：</div>
                <div class="strength-indicator">
                  <div class="indicator-bar" :class="getPasswordStrengthClass()"></div>
                </div>
                <div class="strength-text">{{ getPasswordStrengthText() }}</div>
              </div>
            </a-form-item>

            <a-form-item label="确认密码" name="confirmPassword" :rules="[
  { required: true, message: '请确认密码' },
  { validator: validateConfirmPassword }
]">
              <a-input-password
                  v-model:value="formState.confirmPassword"
                  placeholder="请确认密码"
              >
                <template #prefix>
                  <safety-outlined style="color: rgba(0, 0, 0, 0.25)"/>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item label="角色" name="role" :rules="[{ required: true, message: '请选择角色' }]">
              <a-select
                  v-model:value="formState.role"
                  placeholder="请选择用户角色"
                  :options="roleOptions"
              >
                <template #suffixIcon>
                  <team-outlined/>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item label="状态" name="status" :rules="[{ required: true, message: '请选择状态' }]">
              <a-select
                  v-model:value="formState.status"
                  placeholder="请选择用户状态"
                  :options="statusOptions"
              >
                <template #suffixIcon>
                  <check-circle-outlined/>
                </template>
              </a-select>
            </a-form-item>
          </div>
        </div>

        <a-form-item label="备注" name="remark">
          <a-textarea
              v-model:value="formState.remark"
              placeholder="请输入用户备注信息（选填）"
              :rows="3"
              :maxLength="200"
              :showCount="true"
          />
        </a-form-item>

        <div class="form-footer">
          <a-space>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
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
  InfoCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserAddOutlined,
  SafetyOutlined,
  SettingOutlined,
  FileTextOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import dayjs from 'dayjs';

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    align: 'center',
    width: 70,
    fixed: 'left'
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
const activeTab = ref('all');
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
const visible = ref(false);
const formRef = ref();
const editModalVisible = ref(false);
const resetPasswordModalVisible = ref(false);
const submitLoading = ref(false);
const currentUser = ref({});

// 表单引用
const editFormRef = ref(null);
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
  remark: '' // 新增备注字段
});

const formState = reactive({
  accountName: '',
  userName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'normal',
  status: 'active',
  avatar: ''
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

// 获取时间线颜色
function getTimelineColor(index) {
  const colors = ['#6554C0', '#52C41A', '#1890FF', '#FAAD14', '#F5222D'];
  return colors[index % colors.length];
}

// 获取状态样式类
function getStatusClass(status) {
  const statusMap = {
    active: 'status-active',
    inactive: 'status-inactive',
    banned: 'status-banned'
  };
  return statusMap[status] || 'status-default';
}

// 关闭用户详情
function closeUserDetails() {
  viewModalVisible.value = false;
}

// 编辑当前用户
function editThisUser() {
  // 关闭详情窗口
  viewModalVisible.value = false;

  // 调用编辑函数
  editUser(currentUser.value);
}

// 为当前用户重置密码
function resetPasswordForUser() {
  // 关闭详情窗口
  viewModalVisible.value = false;

  // 调用重置密码函数
  resetPassword(currentUser.value);
}


// 角色选项
const roleOptions = [
  {value: 'user', label: '普通用户'},
  {value: 'admin', label: '管理员'},
  {value: 'superAdmin', label: '超级管理员'},
  {value: 'vip', label: 'VIP用户'}
];

// 状态选项
const statusOptions = [
  {value: 'active', label: '已激活', tagColor: 'success'},
  {value: 'inactive', label: '未激活', tagColor: 'warning'},
  {value: 'disabled', label: '已禁用', tagColor: 'error'}
];

// 重置密码表单数据
const resetPasswordForm = reactive({
  userId: '',
  newPassword: '',
  confirmNewPassword: '',
});

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
const validateConfirmPassword = async (_rule, value) => {
  if (value === '') {
    return Promise.reject('请确认密码');
  } else if (value !== formState.password) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};

// 重置密码确认验证
function validateResetPasswordConfirm(rule, value) {
  if (value !== resetPasswordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
}

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

// 密码强度计算
const getPasswordStrength = computed(() => {
  const password = formState.password || '';
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

const showModal = () => {
  visible.value = true;
};

// 关闭对话框
const handleCancel = () => {
  resetForm();
  visible.value = false;
};

// 重置表单
const resetForm = () => {
  formRef.value && formRef.value.resetFields();
};

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
    } else if (key === 'remark') {
      // 为备注字段设置默认值（如果记录中没有）
      editForm.remark = record.remark || '';
    }
  });
  editModalVisible.value = true;
}

function resetSearchForm() {
  // 重置搜索表单的所有字段
  searchForm.username = '';
  searchForm.role = undefined;
  searchForm.status = undefined;
  searchForm.registerTime = [];

  // 重新获取数据（可选：是否在重置后自动刷新数据）
  fetchUserData();

  // 提示用户已重置
  message.success('搜索条件已重置');
}

// 取消编辑
const handleEditCancel = () => {
  editModalVisible.value = false;
};

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
  // 重置添加表单数据
  formState.accountName = '';
  formState.userName = '';
  formState.password = '';
  formState.confirmPassword = '';
  formState.phone = '';
  formState.role = 'normal';
  formState.status = 'active';
  formState.avatar = '';

  // 使用正确的状态变量打开弹窗
  visible.value = true;
}

// 添加用户提交事件
const handleSubmit = () => {
  formRef.value
      .validate()
      .then(() => {
        message.success('添加用户成功');
        visible.value = false;
        resetForm();
      })
      .catch(error => {
        console.log('表单校验失败:', error);
      });
};

const handleAvatarUpload = () => {
  // 这里实现头像上传逻辑，可以使用input file或者其他上传组件
  // 简单模拟上传成功后设置头像
  const mockAvatar = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
  formState.avatar = mockAvatar;
};


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

// 暴露方法给父组件使用
defineExpose({
  showModal
});
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

.header-icon {
  width: 40px;
  height: 40px;
  background-color: #6554C0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  color: white;
  font-size: 20px;
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

.operation-bar {
  margin-bottom: 24px; /* 增加与下方表格的间距 */
}

/* 页脚样式 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
}

/* 用户管理专用样式 - 使用um-前缀避免冲突 */
.um-page-container {
  padding: 0; /* 移除内边距，让子元素决定间距 */
}

.um-header {
  background: linear-gradient(135deg, #ffffff 0%, #f6f5ff 100%);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(101, 84, 192, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.um-header-left {
  display: flex;
  align-items: center;
}

.um-icon-container {
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

.um-icon {
  font-size: 28px;
  color: white;
}

.um-header-info {
  display: flex;
  flex-direction: column;
}

.um-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.um-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.um-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.um-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.um-metrics {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.um-metric-item {
  padding: 0 16px;
  position: relative;
}

.um-divider {
  width: 1px;
  height: 24px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

.um-metric-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.um-metric-label .anticon {
  margin-right: 6px;
}

.um-metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 保留原有的其他样式，但可能需要重命名以避免冲突 */
.stat-cards {
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .um-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .um-header-right {
    margin-top: 16px;
    align-items: flex-start;
    width: 100%;
  }

  .um-metrics {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .um-metric-item {
    padding: 0 10px;
  }

  .um-metric-value {
    font-size: 16px;
  }

  .um-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .um-metrics {
    flex-direction: column;
    padding: 12px;
  }

  .um-metric-item {
    padding: 8px 0;
    width: 100%;
  }

  .um-divider {
    display: none;
  }

  .um-metric-item:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .form-column {
    flex: 0 0 100%;
  }

  .custom-user-modal {
    width: 95% !important;
    max-width: 500px;
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .form-column {
    flex: 0 0 100%;
  }
}

</style>