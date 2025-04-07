<!-- AccountSettingsDialog.vue -->
<template>
  <a-modal
      :visible="visible"
      title="账号设置"
      width="600px"
      :footer="null"
      @cancel="handleCancel"
  >
    <a-tabs v-model:activeKey="activeTab">
      <!-- 基本设置 Tab -->
      <a-tab-pane key="basic" tab="基本设置">
        <a-form
            :model="basicForm"
            name="basicSettingsForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @finish="handleBasicSubmit"
        >
          <!-- 修改邮箱 -->
          <a-form-item
              label="电子邮箱"
              name="email"
              :rules="[
              { required: true, message: '请输入电子邮箱!' },
              { type: 'email', message: '请输入有效的电子邮箱!' }
            ]"
          >
            <a-input v-model:value="basicForm.email" placeholder="请输入电子邮箱" />
          </a-form-item>

          <!-- 修改手机号 -->
          <a-form-item
              label="手机号码"
              name="phone"
          >
            <a-input-group compact>
              <a-select v-model:value="basicForm.phonePrefix" style="width: 20%">
                <a-select-option value="+86">+86</a-select-option>
                <a-select-option value="+1">+1</a-select-option>
                <a-select-option value="+44">+44</a-select-option>
                <a-select-option value="+81">+81</a-select-option>
              </a-select>
              <a-input
                  v-model:value="basicForm.phone"
                  style="width: 80%"
                  placeholder="请输入手机号码"
              />
            </a-input-group>
          </a-form-item>

          <!-- 语言偏好 -->
          <a-form-item label="语言偏好" name="language">
            <a-select v-model:value="basicForm.language">
              <a-select-option value="zh-CN">简体中文</a-select-option>
              <a-select-option value="en-US">English</a-select-option>
              <a-select-option value="ja-JP">日本語</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 时区设置 -->
          <a-form-item label="时区" name="timezone">
            <a-select
                v-model:value="basicForm.timezone"
                show-search
                :filter-option="filterOption"
            >
              <a-select-option value="Asia/Shanghai">(GMT+08:00) 北京，香港，新加坡</a-select-option>
              <a-select-option value="America/New_York">(GMT-05:00) 纽约</a-select-option>
              <a-select-option value="Europe/London">(GMT+00:00) 伦敦</a-select-option>
              <a-select-option value="Asia/Tokyo">(GMT+09:00) 东京</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 按钮区域 -->
          <a-form-item :wrapper-col="{ span: 24 }" style="text-align: right;">
            <a-button type="primary" html-type="submit">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 安全设置 Tab -->
      <a-tab-pane key="security" tab="安全设置">
        <a-form
            :model="securityForm"
            name="securitySettingsForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
        >
          <!-- 修改密码 -->
          <a-form-item
              label="当前密码"
              name="currentPassword"
              :rules="[{ required: true, message: '请输入当前密码!' }]"
          >
            <a-input-password
                v-model:value="securityForm.currentPassword"
                placeholder="请输入当前密码"
            />
          </a-form-item>

          <a-form-item
              label="新密码"
              name="newPassword"
              :rules="[
              { required: true, message: '请输入新密码!' },
              { min: 8, message: '密码长度不能少于8个字符!' }
            ]"
          >
            <a-input-password
                v-model:value="securityForm.newPassword"
                placeholder="请输入新密码"
            />
          </a-form-item>

          <a-form-item
              label="确认新密码"
              name="confirmPassword"
              :rules="[
              { required: true, message: '请确认新密码!' },
              { validator: validateConfirmPassword }
            ]"
          >
            <a-input-password
                v-model:value="securityForm.confirmPassword"
                placeholder="请确认新密码"
            />
          </a-form-item>

          <!-- 双重认证 -->
          <a-form-item label="双重认证">
            <a-switch v-model:checked="securityForm.twoFactorEnabled" />
            <div class="setting-description">
              启用后，登录时将需要输入手机验证码
            </div>
          </a-form-item>

          <!-- 登录设备管理 -->
          <a-form-item label="登录设备">
            <a-button type="link" @click="showDevicesModal = true">
              查看登录设备
            </a-button>
            <div class="setting-description">
              管理您当前的登录设备
            </div>
          </a-form-item>

          <!-- 登录通知 -->
          <a-form-item label="登录通知">
            <a-switch v-model:checked="securityForm.loginNotification" />
            <div class="setting-description">
              有新设备登录时，通过邮件通知您
            </div>
          </a-form-item>

          <!-- 按钮区域 -->
          <a-form-item :wrapper-col="{ span: 24 }" style="text-align: right;">
            <a-button type="primary" @click="handleSecuritySubmit">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 隐私设置 Tab -->
      <a-tab-pane key="privacy" tab="隐私设置">
        <a-form
            :model="privacyForm"
            name="privacySettingsForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @finish="handlePrivacySubmit"
        >
          <!-- 个人资料可见性 -->
          <a-form-item label="个人资料可见性" name="profileVisibility">
            <a-radio-group v-model:value="privacyForm.profileVisibility">
              <a-radio value="public">公开 - 所有人可见</a-radio>
              <a-radio value="friends">好友 - 仅好友可见</a-radio>
              <a-radio value="private">私密 - 仅自己可见</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 搜索可见性 -->
          <a-form-item label="搜索可见性">
            <a-switch v-model:checked="privacyForm.searchable" />
            <div class="setting-description">
              允许其他用户通过搜索找到您
            </div>
          </a-form-item>

          <!-- 活动状态 -->
          <a-form-item label="活动状态">
            <a-switch v-model:checked="privacyForm.showActivity" />
            <div class="setting-description">
              显示您的在线状态
            </div>
          </a-form-item>

          <!-- 按钮区域 -->
          <a-form-item :wrapper-col="{ span: 24 }" style="text-align: right;">
            <a-button type="primary" html-type="submit">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 通知设置 Tab -->
      <a-tab-pane key="notifications" tab="通知设置">
        <a-form
            :model="notificationForm"
            name="notificationSettingsForm"
            @finish="handleNotificationSubmit"
        >
          <div class="notification-settings">
            <div class="notification-header">
              <span class="notification-type-header">通知类型</span>
              <span class="notification-channel-header">电子邮件</span>
              <span class="notification-channel-header">站内信</span>
              <span class="notification-channel-header">推送通知</span>
            </div>

            <div class="notification-item">
              <span class="notification-type">点赞</span>
              <a-checkbox v-model:checked="notificationForm.likes.email"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.likes.site"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.likes.push"></a-checkbox>
            </div>

            <div class="notification-item">
              <span class="notification-type">评论</span>
              <a-checkbox v-model:checked="notificationForm.comments.email"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.comments.site"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.comments.push"></a-checkbox>
            </div>

            <div class="notification-item">
              <span class="notification-type">关注</span>
              <a-checkbox v-model:checked="notificationForm.follows.email"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.follows.site"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.follows.push"></a-checkbox>
            </div>

            <div class="notification-item">
              <span class="notification-type">系统公告</span>
              <a-checkbox v-model:checked="notificationForm.announcements.email"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.announcements.site"></a-checkbox>
              <a-checkbox v-model:checked="notificationForm.announcements.push"></a-checkbox>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div style="text-align: right; margin-top: 24px;">
            <a-button type="primary" html-type="submit">保存设置</a-button>
          </div>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <!-- 登录设备弹窗 -->
    <a-modal
        :visible="showDevicesModal"
        title="登录设备管理"
        width="600px"
        @ok="handleDeviceModalOk"
    >
      <a-list item-layout="horizontal" :data-source="loginDevices">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :style="{ backgroundColor: item.current ? '#6554C0' : '#ccc' }">
                  <template v-if="item.type === 'desktop'">
                    <laptop-outlined />
                  </template>
                  <template v-else-if="item.type === 'mobile'">
                    <mobile-outlined />
                  </template>
                  <template v-else>
                    <global-outlined />
                  </template>
                </a-avatar>
              </template>
              <template #title>
                <span>
                  {{ item.name }}
                  <a-tag v-if="item.current" color="blue">当前设备</a-tag>
                </span>
              </template>
              <template #description>
                <div>最近登录: {{ item.lastLogin }}</div>
                <div>位置: {{ item.location }}</div>
              </template>
            </a-list-item-meta>
            <template v-if="!item.current">
              <a-button type="text" danger @click="handleLogoutDevice(item.id)">
                退出登录
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  LaptopOutlined,
  MobileOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userAccount: {
    type: Object,
    default: () => ({})
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'save']);

// 当前活动标签
const activeTab = ref('basic');

// 登录设备模态框可见性
const showDevicesModal = ref(false);

// 基本设置表单
const basicForm = reactive({
  email: '',
  phone: '',
  phonePrefix: '+86',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
});

// 安全设置表单
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false,
  loginNotification: true
});

// 隐私设置表单
const privacyForm = reactive({
  profileVisibility: 'public',
  searchable: true,
  showActivity: true
});

// 通知设置表单
const notificationForm = reactive({
  likes: {
    email: false,
    site: true,
    push: true
  },
  comments: {
    email: true,
    site: true,
    push: true
  },
  follows: {
    email: true,
    site: true,
    push: false
  },
  announcements: {
    email: true,
    site: true,
    push: false
  }
});

// 模拟登录设备列表
const loginDevices = [
  {
    id: 1,
    name: 'Chrome on macOS',
    type: 'desktop',
    lastLogin: '2023-11-25 14:30',
    location: '北京',
    current: true
  },
  {
    id: 2,
    name: 'Safari on iPhone',
    type: 'mobile',
    lastLogin: '2023-11-24 09:15',
    location: '上海',
    current: false
  },
  {
    id: 3,
    name: 'Firefox on Windows',
    type: 'desktop',
    lastLogin: '2023-11-20 18:45',
    location: '广州',
    current: false
  }
];

// 监听props变化，初始化表单
watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 当对话框打开时，初始化表单数据
        const account = props.userAccount || {};

        // 初始化基本信息
        basicForm.email = account.email || '';
        basicForm.phone = account.phone || '';
        basicForm.phonePrefix = account.phonePrefix || '+86';
        basicForm.language = account.language || 'zh-CN';
        basicForm.timezone = account.timezone || 'Asia/Shanghai';

        // 初始化安全设置
        const security = account.securitySettings || {};
        securityForm.twoFactorEnabled = security.twoFactorEnabled || false;
        securityForm.loginNotification = security.loginNotification || true;
        securityForm.currentPassword = '';
        securityForm.newPassword = '';
        securityForm.confirmPassword = '';

        // 初始化隐私设置
        const privacy = account.privacySettings || {};
        privacyForm.profileVisibility = privacy.profileVisibility || 'public';
        privacyForm.searchable = privacy.searchable !== undefined ? privacy.searchable : true;
        privacyForm.showActivity = privacy.showActivity !== undefined ? privacy.showActivity : true;

        // 初始化通知设置
        const notification = account.notificationSettings || {};

        // 使用默认值初始化通知设置对象的结构
        const defaultNotification = {
          email: false,
          site: true,
          push: false
        };

        notificationForm.likes = { ...defaultNotification, ...(notification.likes || {}) };
        notificationForm.comments = { ...defaultNotification, ...(notification.comments || {}) };
        notificationForm.follows = { ...defaultNotification, ...(notification.follows || {}) };
        notificationForm.announcements = { ...defaultNotification, ...(notification.announcements || {}) };
      }
    },
    { immediate: true }
);

// 验证确认密码
const validateConfirmPassword = async (rule, value) => {
  if (value !== securityForm.newPassword) {
    throw new Error('两次输入的密码不一致!');
  }
};

// 过滤选项
const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 基本设置提交
const handleBasicSubmit = () => {
  const updatedAccount = {
    ...props.userAccount,
    email: basicForm.email,
    phone: basicForm.phone,
    phonePrefix: basicForm.phonePrefix,
    language: basicForm.language,
    timezone: basicForm.timezone
  };

  emit('save', updatedAccount);
  message.success('基本设置已更新');
};

// 安全设置提交
const handleSecuritySubmit = () => {
  if (!securityForm.currentPassword) {
    message.error('请输入当前密码');
    return;
  }

  if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  // 构建更新的安全设置
  const updatedAccount = {
    ...props.userAccount,
    securitySettings: {
      ...(props.userAccount?.securitySettings || {}),
      twoFactorEnabled: securityForm.twoFactorEnabled,
      loginNotification: securityForm.loginNotification
    }
  };

  // 清空密码相关字段
  securityForm.currentPassword = '';
  securityForm.newPassword = '';
  securityForm.confirmPassword = '';

  emit('save', updatedAccount);
  message.success('安全设置已更新');
};

// 隐私设置提交
const handlePrivacySubmit = () => {
  const updatedAccount = {
    ...props.userAccount,
    privacySettings: {
      ...(props.userAccount?.privacySettings || {}),
      profileVisibility: privacyForm.profileVisibility,
      searchable: privacyForm.searchable,
      showActivity: privacyForm.showActivity
    }
  };

  emit('save', updatedAccount);
  message.success('隐私设置已更新');
};

// 通知设置提交
const handleNotificationSubmit = () => {
  const updatedAccount = {
    ...props.userAccount,
    notificationSettings: {
      ...(props.userAccount?.notificationSettings || {}),
      likes: { ...notificationForm.likes },
      comments: { ...notificationForm.comments },
      follows: { ...notificationForm.follows },
      announcements: { ...notificationForm.announcements }
    }
  };

  emit('save', updatedAccount);
  message.success('通知设置已更新');
};

// 处理登录设备确认
const handleDeviceModalOk = () => {
  showDevicesModal.value = false;
};

// 处理退出设备
const handleLogoutDevice = (deviceId) => {
  // 在实际应用中，这里会调用API退出指定设备
  message.success(`设备ID: ${deviceId}已退出登录`);

  // 模拟从列表中移除
  const index = loginDevices.findIndex(device => device.id === deviceId);
  if (index !== -1) {
    loginDevices.splice(index, 1);
  }
};

// 取消操作
const handleCancel = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
/* 基础样式 */
:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ant-modal-header) {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

:deep(.ant-tabs-tab) {
  padding: 12px 16px;
  font-size: 15px;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #6554C0;
  font-weight: 500;
}

:deep(.ant-tabs-ink-bar) {
  background-color: #6554C0;
}

:deep(.ant-form-item-label > label) {
  color: #262626;
  font-weight: 500;
}

/* 设置描述文本样式 */
.setting-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
  margin-left: 2px;
}

/* 通知设置表格样式 */
.notification-settings {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.notification-header {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  background-color: #fafafa;
  padding: 12px 16px;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-type-header {
  text-align: left;
}

.notification-channel-header {
  text-align: center;
  color: #595959;
  font-size: 14px;
}

.notification-type {
  text-align: left;
  color: #262626;
  font-weight: 500;
}

.notification-item :deep(.ant-checkbox-wrapper) {
  display: flex;
  justify-content: center;
}

/* 设备管理样式 */
:deep(.ant-avatar) {
  background-color: #6554C0;
}

:deep(.ant-avatar-string) {
  font-size: 16px;
}

:deep(.ant-list-item-meta-title) {
  font-weight: 500;
  margin-bottom: 4px;
}

:deep(.ant-list-item-meta-description) {
  line-height: 1.5;
  color: #595959;
}

:deep(.ant-btn-dangerous.ant-btn-text) {
  color: #ff4d4f;
}

:deep(.ant-btn-dangerous.ant-btn-text:hover) {
  background-color: #fff1f0;
  color: #ff7875;
}

/* 表单控件样式增强 */
:deep(.ant-input:hover),
:deep(.ant-select:not(.ant-select-disabled):hover .ant-select-selector),
:deep(.ant-input-affix-wrapper:hover) {
  border-color: #7C68EE;
}

:deep(.ant-input:focus),
:deep(.ant-input-focused),
:deep(.ant-select-focused:not(.ant-select-disabled) .ant-select-selector),
:deep(.ant-input-affix-wrapper-focused) {
  border-color: #6554C0;
  box-shadow: 0 0 0 2px rgba(101, 84, 192, 0.2);
}

:deep(.ant-switch-checked) {
  background-color: #6554C0;
}

:deep(.ant-radio-wrapper .ant-radio-checked .ant-radio-inner) {
  border-color: #6554C0;
  background-color: #6554C0;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #6554C0;
  border-color: #6554C0;
}

:deep(.ant-btn-primary) {
  background-color: #6554C0;
  border-color: #6554C0;
}

:deep(.ant-btn-primary:hover),
:deep(.ant-btn-primary:focus) {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

:deep(.ant-btn-link) {
  color: #6554C0;
}

:deep(.ant-btn-link:hover) {
  color: #7C68EE;
}

/* 响应式调整 */
@media (max-width: 576px) {
  :deep(.ant-form-item-label) {
    padding: 0 0 8px;
    line-height: 1.5;
    white-space: normal;
    text-align: left;
  }

  :deep(.ant-form-item-control) {
    flex: 1 1 100%;
  }

  .notification-item,
  .notification-header {
    grid-template-columns: 1.5fr repeat(3, 1fr);
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>