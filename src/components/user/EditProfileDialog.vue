<template>
  <a-modal
      :visible="visible"
      width="600px"
      :footer="null"
      @cancel="handleCancel"
      :destroyOnClose="true"
      :maskClosable="false"
      class="modern-profile-modal"
  >
    <!-- 顶部标题区域保持不变 -->
    <div class="edit-modal-header">
      <div class="header-content">
        <div class="header-icon">
          <IconFont type="icon-chakan" />
        </div>
        <div class="header-text">
          <h2>个人信息编辑</h2>
          <p>编辑个人信息更好的展示自己</p>
        </div>
      </div>
    </div>

    <!-- 标签页内容区域改版 -->
    <div class="modal-content-wrapper">
      <div class="tab-navigation">
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 'profile' }"
            @click="activeTab = 'profile'"
        >
          <user-outlined />
          <span>个人资料</span>
        </div>
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 'password' }"
            @click="activeTab = 'password'"
        >
          <lock-outlined />
          <span>修改密码</span>
        </div>
      </div>

      <div class="tab-content">
        <!-- 个人资料面板 -->
        <div v-if="activeTab === 'profile'" class="profile-panel">
          <div class="avatar-upload-section">
            <div class="avatar-container">
              <img
                  :src="avatarPreview || profileForm.avatar || defaultAvatar"
                  alt="用户头像"
                  class="avatar-image"
              />

              <!-- 隐藏式文件上传组件 -->
              <file-uploader
                  ref="avatarUploaderRef"
                  accept="image/jpeg,image/png,image/webp"
                  :auto-upload="true"
                  :hide-file-list="true"
                  :validation-config="avatarValidationConfig"
                  :max-count="1"
                  :compress-image="true"
                  :compress-options="{
                    maxWidth: 500,
                    maxHeight: 500,
                    quality: 0.8
                  }"
                  @success="handleAvatarSuccess"
                  @error="handleAvatarError"
                  class="avatar-uploader-hidden"
              />

              <div
                  class="avatar-edit-overlay"
                  @click="triggerAvatarUpload"
                  :class="{ 'uploading': avatarLoading }"
              >
                <div class="overlay-content">
                  <template v-if="avatarLoading">
                    <loading-outlined spin class="overlay-icon" />
                    <span>上传中...</span>
                  </template>
                  <template v-else>
                    <camera-outlined class="overlay-icon" />
                    <span>更换头像</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="avatar-tip">支持JPG、PNG、WEBP格式，不超过2MB</div>
          </div>

          <form class="profile-form" @submit.prevent="handleProfileSubmit">
            <div class="form-group">
              <label for="account" class="required-label">用户账号</label>
              <a-input
                  id="account"
                  v-model:value="profileForm.account"
                  :maxLength="20"
                  show-count
                  disabled
              />
            </div>

            <div class="form-group">
              <label for="username" class="required-label">用户昵称</label>
              <a-input
                  id="username"
                  v-model:value="profileForm.username"
                  placeholder="请输入用户昵称"
                  :maxLength="20"
                  show-count
              />
            </div>

            <div class="form-group">
              <label for="userProfile">个人简介</label>
              <a-textarea
                  id="userProfile"
                  v-model:value="profileForm.userProfile"
                  placeholder="介绍一下自己吧"
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                  :maxlength="200"
                  show-count
              />
            </div>

            <div class="form-actions">
              <a-button class="cancel-button" @click="handleCancel">取消</a-button>
              <a-button
                  type="primary"
                  html-type="submit"
                  :loading="submitLoading"
                  class="submit-button"
              >
                保存修改
              </a-button>
            </div>
          </form>
        </div>

        <!-- 修改密码面板 -->
        <div v-if="activeTab === 'password'" class="password-panel">
          <form class="password-form" @submit.prevent="handlePasswordSubmit">
            <div class="form-group">
              <label for="oldPassword" class="required-label">当前密码</label>
              <a-input-password
                  id="oldPassword"
                  v-model:value="passwordForm.oldPassword"
                  placeholder="请输入当前密码"
                  class="password-input"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </div>

            <div class="form-group">
            <label for="newPassword" class="required-label">新密码</label>
            <a-input-password
                id="newPassword"
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码"
                class="password-input"
                @change="validateNewPassword"
            >
              <template #prefix>
                <key-outlined />
              </template>
            </a-input-password>
            <div class="error-message" v-if="newPasswordError">{{ newPasswordError }}</div>
          </div>

            <!-- 密码强度指示器 -->
            <div class="password-strength-container">
              <div class="strength-header">
                <span>密码强度</span>
                <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
              </div>

              <div class="strength-progress">
                <div class="strength-segment" :class="{ 'filled': passwordStrength >= 1 }"></div>
                <div class="strength-segment" :class="{ 'filled': passwordStrength >= 2 }"></div>
                <div class="strength-segment" :class="{ 'filled': passwordStrength >= 3 }"></div>
                <div class="strength-segment" :class="{ 'filled': passwordStrength >= 4 }"></div>
              </div>

              <div class="password-requirements">
                <div class="requirement" :class="{ 'fulfilled': hasLength }">
                  <check-circle-filled v-if="hasLength" />
                  <close-circle-outlined v-else />
                  <span>至少8个字符</span>
                </div>
                <div class="requirement" :class="{ 'fulfilled': hasLetter }">
                  <check-circle-filled v-if="hasLetter" />
                  <close-circle-outlined v-else />
                  <span>包含字母</span>
                </div>
                <div class="requirement" :class="{ 'fulfilled': hasNumber }">
                  <check-circle-filled v-if="hasNumber" />
                  <close-circle-outlined v-else />
                  <span>包含数字</span>
                </div>
                <div class="requirement" :class="{ 'fulfilled': hasSpecial }">
                  <check-circle-filled v-if="hasSpecial" />
                  <close-circle-outlined v-else />
                  <span>包含特殊字符</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="checkPassword" class="required-label">确认新密码</label>
              <a-input-password
                  id="checkPassword"
                  v-model:value="passwordForm.checkPassword"
                  placeholder="请再次输入新密码"
                  class="password-input"
                  @change="validateConfirmPasswordInput"
              >
                <template #prefix>
                  <safety-outlined />
                </template>
              </a-input-password>
              <div class="error-message" v-if="confirmPasswordError">{{ confirmPasswordError }}</div>
            </div>

            <div class="form-actions">
              <a-button class="cancel-button" @click="handleCancel">取消</a-button>
              <a-button
                  type="primary"
                  html-type="submit"
                  :loading="passwordLoading"
                  class="submit-button"
              >
                修改密码
              </a-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
  LoadingOutlined,
  CameraOutlined
} from '@ant-design/icons-vue';
import { updateUserInfoUsingPut, updateUserPasswordUsingPut } from "@/api/dengluguanli.js";
import { useUserStore } from "@/stores/user.js";
import fileValidator from "@/utils/fileValidator";
import FileUploader from '@/components/common/FileUploader.vue';
import IconFont from "@/components/common/IconFont.vue";

const userStore = useUserStore();

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    required: true
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'save', 'passwordChanged']);

// 文件上传器引用
const avatarUploaderRef = ref(null);

// 激活的标签页
const activeTab = ref('profile');

// 表单加载状态
const submitLoading = ref(false);
const passwordLoading = ref(false);
const avatarLoading = ref(false);

// 错误信息状态
const newPasswordError = ref('');
const confirmPasswordError = ref('');


// 用户资料表单
const profileForm = reactive({
  username: '',
  avatar: '',
  userProfile: '',
  account: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: ''
});

// 头像预览
const avatarPreview = ref('');

// 头像验证配置
const avatarValidationConfig = {
  ...fileValidator.avatarValidationConfig,
  // 更新允许的文件类型，与后端保持一致
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
  // 更新允许的文件扩展名
  allowedExtensions: ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
  // 保持错误消息一致
  errorMessages: {
    typeError: '请上传头像图片 (JPG, PNG, WEBP, HEIC)',
    extensionError: '请上传头像图片 (JPG, PNG, WEBP, HEIC)',
    maxSizeError: '头像图片大小不能超过2MB'
  }
};

// 默认头像
const defaultAvatar = computed(() => {
  const username = props.userInfo?.username || props.userInfo?.name || 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
});

// 监听props变化，初始化表单
watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 重置当前标签为个人资料
        activeTab.value = 'profile';

        // 当对话框打开时，初始化表单数据
        profileForm.username = props.userInfo.username || props.userInfo.name || '';
        profileForm.account = props.userInfo.account || props.userInfo.account || '';
        profileForm.avatar = props.userInfo.avatar || '';
        profileForm.userProfile = props.userInfo.userProfile || '';

        // 清空密码表单
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.checkPassword = '';

        // 清空头像预览
        avatarPreview.value = '';
      }
    }
);

// 触发头像上传
const triggerAvatarUpload = () => {
  if (avatarLoading.value) return; // 如果正在上传，则不触发
  avatarUploaderRef.value?.triggerUpload();
};

// 处理头像上传成功
const handleAvatarSuccess = async (fileObj) => {
  // 更新头像预览和表单数据
  avatarPreview.value = fileObj.url;
  profileForm.avatar = fileObj.url;

  // 显示成功提示
  message.success('头像上传成功');

  // 更新加载状态
  avatarLoading.value = false;
};

// 处理头像上传错误
const handleAvatarError = (fileObj, fileList, index, errorMsg) => {
  // 更新加载状态
  avatarLoading.value = false;

  // 错误消息已经由FileUploader组件显示
};

// 个人资料表单提交
const handleProfileSubmit = async () => {
  // 表单验证
  if (!profileForm.username) {
    message.error('请输入用户昵称');
    return;
  }

  submitLoading.value = true;

  try {
    // 构建API请求数据对象
    const updateRequest = {
      id: props.userInfo.id,
      username: profileForm.username,
      userProfile: profileForm.userProfile
    };

    // 如果头像已更新，使用新头像URL
    if (profileForm.avatar) {
      updateRequest.avatar = profileForm.avatar;
    }

    // 调用更新用户信息API
    const response = await updateUserInfoUsingPut(updateRequest);
    const result = response.data;

    if (result.code === 200 && result.data) {
      // 构建更新后的用户信息对象
      const updatedUserInfo = {
        ...props.userInfo,
        username: profileForm.username,
        name: profileForm.username, // 确保兼容性，同步更新name字段
        userProfile: profileForm.userProfile
      };

      // 如果有新头像
      if (profileForm.avatar) {
        updatedUserInfo.avatar = profileForm.avatar;
      }

      // 触发保存事件，更新父组件中的用户信息
      emit('save', updatedUserInfo);

      // 显示成功消息
      message.success('个人资料已更新');

      // 关闭对话框
      emit('update:visible', false);
    } else {
      // 更新失败
      message.error(result.message || '更新个人资料失败');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    message.error('更新个人资料失败，请检查网络连接');
  } finally {
    submitLoading.value = false;
  }
};

// 密码强度计算
const hasLength = computed(() => passwordForm.newPassword.length >= 8);
const hasLetter = computed(() => /[a-zA-Z]/.test(passwordForm.newPassword));
const hasNumber = computed(() => /[0-9]/.test(passwordForm.newPassword));
const hasSpecial = computed(() => /[^a-zA-Z0-9]/.test(passwordForm.newPassword));

const passwordStrength = computed(() => {
  let strength = 0;
  if (hasLength.value) strength += 1;
  if (hasLetter.value) strength += 1;
  if (hasNumber.value) strength += 1;
  if (hasSpecial.value) strength += 1;
  return strength;
});

const passwordStrengthClass = computed(() => {
  if (passwordForm.newPassword.length === 0) return '';
  if (passwordStrength.value === 1) return 'strength-weak';
  if (passwordStrength.value === 2) return 'strength-medium';
  if (passwordStrength.value === 3) return 'strength-good';
  return 'strength-strong';
});

const passwordStrengthText = computed(() => {
  if (passwordForm.newPassword.length === 0) return '';
  if (passwordStrength.value === 1) return '弱';
  if (passwordStrength.value === 2) return '中';
  if (passwordStrength.value === 3) return '良好';
  if (passwordStrength.value === 4) return '强';
  return '';
});

// 验证新密码
const validateNewPassword = () => {
  if (passwordForm.newPassword === passwordForm.oldPassword) {
    newPasswordError.value = '新密码不能与当前密码相同';
  } else {
    newPasswordError.value = '';
  }

  // 如果确认密码已经输入，也要重新验证确认密码
  if (passwordForm.checkPassword) {
    validateConfirmPasswordInput();
  }
};

// 验证确认密码
const validateConfirmPasswordInput = () => {
  if (passwordForm.checkPassword !== passwordForm.newPassword) {
    confirmPasswordError.value = '两次输入的密码不一致';
  } else {
    confirmPasswordError.value = '';
  }
};

// 密码表单提交
const handlePasswordSubmit = async () => {
  // 表单验证
  if (!passwordForm.oldPassword) {
    message.error('请输入当前密码');
    return;
  }

  if (!passwordForm.newPassword) {
    message.error('请输入新密码');
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    message.error('密码长度不能少于8个字符');
    return;
  }

  if (passwordForm.newPassword === passwordForm.oldPassword) {
    message.error('新密码不能与当前密码相同');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.checkPassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  passwordLoading.value = true;

  try {
    // 构建密码修改请求对象
    const passwordUpdateRequest = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      checkPassword: passwordForm.checkPassword
    };

    const response = await updateUserPasswordUsingPut(passwordUpdateRequest);
    const result = response.data;

    if (result.code === 200 && result.data) {
      // 使用更长持续时间的成功消息
      message.success({
        content: '密码修改成功，3秒后将退出登录并返回首页...',
        duration: 3,
      });

      // 关闭对话框
      emit('update:visible', false);

      // 触发密码更改事件
      emit('passwordChanged');

      // 使用计时器模拟倒计时效果
      let countdown = 3;
      const timer = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(timer);

          // 清除所有相关的存储数据
          if (userStore.userInfo?.tokenName) {
            localStorage.removeItem(userStore.userInfo.tokenName);
          }
          localStorage.removeItem('cloudgallery_user');
          sessionStorage.removeItem('cloudgallery_user');

          // 确保状态及时更新
          userStore.userInfo = null;

          // 通知所有组件用户状态已更新
          window.dispatchEvent(new CustomEvent('user-info-updated'));

          // 延迟后重定向到首页
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      }, 1000);
    } else {
      // 密码修改失败
      message.error({
        content: result.message || '密码修改失败，请检查当前密码是否正确',
        duration: 3,
      });
    }
  } catch (error) {
    console.error('Update password error:', error);
    message.error({
      content: '密码修改失败，请检查网络连接',
      duration: 3,
    });
  } finally {
    passwordLoading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
/* 保留原有顶部样式 */
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

/* 新样式设计 */
.modern-profile-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.modern-profile-modal :deep(.ant-modal-close) {
  color: white;
}

.modal-content-wrapper {
  padding: 0;
}

/* Tab导航样式 */
.tab-navigation {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab-item {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  color: #6554C0;
}

.tab-item.active {
  color: #6554C0;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background-color: #6554C0;
  border-radius: 2px;
}

/* 内容区样式 */
.tab-content {
  padding: 0 24px 24px;
}

/* 个人资料面板 */
.profile-panel, .password-panel {
  position: relative;
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  margin-bottom: 12px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-edit-overlay.uploading {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.overlay-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.avatar-tip {
  font-size: 13px;
  color: #999;
  text-align: center;
}

.avatar-uploader-hidden {
  display: none;
}

/* 表单样式 */
.profile-form, .password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required-label::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

/* 密码强度样式 */
.password-strength-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin: 10px 0;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.strength-header span:first-child {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.strength-text {
  font-size: 14px;
  font-weight: 500;
}

.strength-progress {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.strength-segment.filled:nth-child(1),
.strength-segment.filled:nth-child(2),
.strength-segment.filled:nth-child(3),
.strength-segment.filled:nth-child(4) {
  background-color: var(--segment-color, #6554C0);
}

.strength-weak .strength-segment.filled:nth-child(1) {
  --segment-color: #ff4d4f;
}

.strength-medium .strength-segment.filled:nth-child(1),
.strength-medium .strength-segment.filled:nth-child(2) {
  --segment-color: #faad14;
}

.strength-good .strength-segment.filled:nth-child(1),
.strength-good .strength-segment.filled:nth-child(2),
.strength-good .strength-segment.filled:nth-child(3) {
  --segment-color: #52c41a;
}

.strength-strong .strength-segment.filled {
  --segment-color: #1890ff;
}

.strength-weak {
  color: #ff4d4f;
}

.strength-medium {
  color: #faad14;
}

.strength-good {
  color: #52c41a;
}

.strength-strong {
  color: #1890ff;
}

.password-requirements {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
}

.requirement.fulfilled {
  color: #52c41a;
}

.requirement :deep(svg) {
  font-size: 14px;
}

.requirement :deep(.anticon-check-circle-filled) {
  color: #52c41a;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.field-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.cancel-button {
  min-width: 80px;
}

.submit-button {
  min-width: 100px;
  background-color: #6554C0;
  border-color: #6554C0;
}

.submit-button:hover,
.submit-button:focus {
  background-color: #7C68EE;
  border-color: #7C68EE;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 4px;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .password-requirements {
    grid-template-columns: 1fr;
  }

  .tab-item {
    padding: 16px 16px;
  }
}
</style>