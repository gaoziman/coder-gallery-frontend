<!-- EditProfileDialog.vue -->
<template>
  <a-modal
      :visible="visible"
      title="个人资料与安全"
      width="600px"
      :footer="null"
      @cancel="handleCancel"
      :destroyOnClose="true"
  >
    <a-tabs v-model:activeKey="activeTab">
      <!-- 基本资料标签页 -->
      <a-tab-pane key="profile" tab="个人资料">
        <a-form
            :model="profileForm"
            name="profileForm"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
            @finish="handleProfileSubmit"
        >
          <!-- 头像上传 -->
          <div class="avatar-upload-container">
            <div class="avatar-wrapper">
              <img :src="avatarPreview || profileForm.avatar" alt="用户头像" class="avatar-preview"/>
              <div class="avatar-upload-overlay">
                <upload-outlined class="upload-icon"/>
                <span>更换头像</span>
              </div>
              <input
                  type="file"
                  accept="image/*"
                  class="avatar-input"
                  @change="handleAvatarChange"
              />
            </div>
          </div>

          <!-- 用户名 -->
          <a-form-item
              label="用户昵称"
              name="username"
              :rules="[{ required: true, message: '请输入用户昵称!' }]"
          >
            <a-input v-model:value="profileForm.username" placeholder="请输入用户昵称"/>
          </a-form-item>

          <!-- 个人简介 -->
          <a-form-item
              label="个人简介"
              name="userProfile"
          >
            <a-textarea
                v-model:value="profileForm.userProfile"
                placeholder="介绍一下自己吧"
                :auto-size="{ minRows: 3, maxRows: 6 }"
                :maxlength="200"
                show-count
            />
          </a-form-item>

          <!-- 按钮区域 -->
          <a-form-item :wrapper-col="{ span: 24 }" style="text-align: right; margin-bottom: 0;">
            <a-space>
              <a-button @click="handleCancel">取消</a-button>
              <a-button type="primary" html-type="submit" :loading="submitLoading">保存修改</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 密码修改标签页 -->
      <a-tab-pane key="password" tab="修改密码">
        <a-form
            :model="passwordForm"
            name="passwordForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @finish="handlePasswordSubmit"
        >
          <!-- 当前密码 -->
          <a-form-item
              label="当前密码"
              name="oldPassword"
              :rules="[{ required: true, message: '请输入当前密码!' }]"
          >
            <a-input-password
                v-model:value="passwordForm.oldPassword"
                placeholder="请输入当前密码"
            >
              <template #prefix>
                <lock-outlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 新密码 -->
          <a-form-item
              label="新密码"
              name="newPassword"
              :rules="[
              { required: true, message: '请输入新密码!' },
              { min: 8, message: '密码长度不能少于8个字符!' },
              { validator: validatePassword }
            ]"
          >
            <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码"
            >
              <template #prefix>
                <key-outlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 密码强度指示器 -->
          <a-form-item label="密码强度" :wrapper-col="{ span: 18 }">
            <div class="password-strength">
              <div class="strength-bar">
                <div
                    class="strength-indicator"
                    :style="{ width: passwordStrengthPercentage + '%' }"
                    :class="passwordStrengthClass"
                ></div>
              </div>
              <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
            </div>
            <div class="password-tips">
              <check-circle-outlined :class="hasLength ? 'success' : 'normal'"/>
              至少8个字符
              <check-circle-outlined :class="hasLetter ? 'success' : 'normal'"/>
              包含字母
              <check-circle-outlined :class="hasNumber ? 'success' : 'normal'"/>
              包含数字
              <check-circle-outlined :class="hasSpecial ? 'success' : 'normal'"/>
              包含特殊字符
            </div>
          </a-form-item>

          <!-- 确认新密码 -->
          <a-form-item
              label="确认新密码"
              name="checkPassword"
              :rules="[
              { required: true, message: '请确认新密码!' },
              { validator: validateConfirmPassword }
            ]"
          >
            <a-input-password
                v-model:value="passwordForm.checkPassword"
                placeholder="请再次输入新密码"
            >
              <template #prefix>
                <safety-outlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 按钮区域 -->
          <a-form-item :wrapper-col="{ span: 24 }" style="text-align: right; margin-bottom: 0;">
            <a-space>
              <a-button @click="handleCancel">取消</a-button>
              <a-button type="primary" html-type="submit" :loading="passwordLoading">修改密码</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup>
import {ref, reactive, watch, computed} from 'vue';
import {message} from 'ant-design-vue';
import {
  UploadOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import {updateUserInfoUsingPut, updateUserPasswordUsingPut} from "@/api/dengluguanli.js";
import {useUserStore} from "@/stores/user.js";

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

// 激活的标签页
const activeTab = ref('profile');

// 表单加载状态
const submitLoading = ref(false);
const passwordLoading = ref(false);

// 用户资料表单
const profileForm = reactive({
  username: '',
  avatar: '',
  userProfile: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: ''
});

// 头像预览
const avatarPreview = ref('');

// 监听props变化，初始化表单
watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 重置当前标签为个人资料
        activeTab.value = 'profile';

        // 当对话框打开时，初始化表单数据
        profileForm.username = props.userInfo.username || props.userInfo.name || '';
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

// 头像上传预览
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // 文件类型验证
    if (!file.type.includes('image/')) {
      message.error('请上传图片文件');
      return;
    }

    // 文件大小限制 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB');
      return;
    }

    // 创建本地预览URL
    avatarPreview.value = URL.createObjectURL(file);
  }
};

// 个人资料表单提交
const handleProfileSubmit = async () => {
  submitLoading.value = true;

  try {
    // 构建API请求数据对象
    const updateRequest = {
      id: props.userInfo.id,
      username: profileForm.username,
      avatar: avatarPreview.value || profileForm.avatar,
      userProfile: profileForm.userProfile
    };

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
      if (avatarPreview.value) {
        updatedUserInfo.avatar = avatarPreview.value;
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

const passwordStrengthPercentage = computed(() => {
  return (passwordStrength.value / 4) * 100;
});

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value === 0) return 'strength-none';
  if (passwordStrength.value === 1) return 'strength-weak';
  if (passwordStrength.value === 2) return 'strength-medium';
  if (passwordStrength.value === 3) return 'strength-good';
  return 'strength-strong';
});

const passwordStrengthText = computed(() => {
  if (passwordForm.newPassword.length === 0) return '请输入密码';
  if (passwordStrength.value === 1) return '弱';
  if (passwordStrength.value === 2) return '中';
  if (passwordStrength.value === 3) return '良好';
  if (passwordStrength.value === 4) return '强';
  return '';
});

// 密码验证
const validatePassword = async (_rule, value) => {
  if (value === passwordForm.oldPassword) {
    return Promise.reject('新密码不能与当前密码相同');
  }
  return Promise.resolve();
};

// 确认密码验证
const validateConfirmPassword = async (_rule, value) => {
  if (value !== passwordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};

// 密码表单提交
const handlePasswordSubmit = async () => {
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
.avatar-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.02);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 16px;
  margin-bottom: 2px;
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* 密码强度样式 */
.password-strength {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 10px;
}

.strength-indicator {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  width: 40px;
  text-align: right;
}

.strength-none {
  background-color: #e0e0e0;
  color: #909090;
}

.strength-weak {
  background-color: #ff4d4f;
  color: #ff4d4f;
}

.strength-medium {
  background-color: #faad14;
  color: #faad14;
}

.strength-good {
  background-color: #52c41a;
  color: #52c41a;
}

.strength-strong {
  background-color: #1890ff;
  color: #1890ff;
}

.password-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909090;
  margin-top: 8px;
}

.password-tips .anticon {
  margin-right: 4px;
}

.password-tips .success {
  color: #52c41a;
}

.password-tips .normal {
  color: #d9d9d9;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .password-tips {
    flex-direction: column;
    gap: 6px;
  }
}
</style>