<!-- components/auth/AuthModal.vue -->
<template>
  <a-modal
      v-model:visible="visible"
      :footer="null"
      :maskClosable="false"
      :width="900"
      class="auth-modal"
      :bodyStyle="{ padding: '0' }"
      :destroyOnClose="true"
  >
    <div class="modal-container">
      <!-- 左侧品牌展示区域 -->
      <div class="brand-panel">
        <div class="brand-content">
          <!-- 品牌标志和名称 -->
          <div class="brand-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0 }">
            <div class="logo-container">
              <cloud-outlined class="logo-icon"/>
            </div>
            <h1 class="brand-name">智能云图库</h1>
          </div>

          <!-- 品牌标语 -->
          <div class="brand-slogan" v-motion :initial="{ opacity: 0 }"
               :enter="{ opacity: 1, transition: { delay: 200 } }">
            <h2>构建图片知识体系</h2>
            <p>让管理更有条理、更有效率</p>
          </div>

          <!-- 图片元素 -->
          <div class="illustration-area">
            <div class="illustration-element box1"></div>
            <div class="illustration-element box2"></div>
            <div class="illustration-element box3"></div>
          </div>

          <!-- 数据统计 -->
          <div class="stats-container" v-motion :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
            <div class="stat-item">
              <h3>10,000+</h3>
              <p>活跃用户</p>
            </div>
            <div class="stat-item">
              <h3>50,000+</h3>
              <p>图片总数</p>
            </div>
            <div class="stat-item">
              <h3>98%</h3>
              <p>用户满意度</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="auth-panel">
        <div class="auth-content">
          <!-- 欢迎信息 -->
          <div class="welcome-header" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
            <h2>欢迎回来</h2>
            <p>继续您的图片管理之旅</p>
          </div>

          <!-- 标签切换 -->
          <div class="auth-tabs" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 200 } }">
            <div
                :class="['tab', { active: activeTab === 'login' }]"
                @click="activeTab = 'login'"
            >
              登录
            </div>
            <div
                :class="['tab', { active: activeTab === 'register' }]"
                @click="activeTab = 'register'"
            >
              注册
            </div>
          </div>

          <!-- 登录表单 -->
          <div
              v-show="activeTab === 'login'"
              class="auth-form-container"
              v-motion
              :initial="{ opacity: 0, x: -20 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
          >
            <a-form
                :model="loginForm"
                @finish="handleLogin"
                layout="vertical"
                class="auth-form"
            >
              <a-form-item
                  name="username"
                  :rules="[{ required: true, message: '请输入用户名' }]"
              >
                <a-input
                    v-model:value="loginForm.username"
                    placeholder="请输入用户名"
                    class="auth-input"
                >
                  <template #prefix>
                    <user-outlined class="input-icon"/>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                  name="password"
                  :rules="[{ required: true, message: '请输入密码' }]"
              >
                <a-input-password
                    v-model:value="loginForm.password"
                    placeholder="请输入密码"
                    class="auth-input"
                >
                  <template #prefix>
                    <lock-outlined class="input-icon"/>
                  </template>
                </a-input-password>
              </a-form-item>

              <div class="form-options">
                <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
                <a href="#" class="forgot-password">忘记密码?</a>
              </div>

              <a-button
                  type="primary"
                  html-type="submit"
                  :loading="loading"
                  class="submit-btn"
              >
                登录
              </a-button>
            </a-form>
          </div>

          <!-- 注册表单 -->
          <div
              v-show="activeTab === 'register'"
              class="auth-form-container"
              v-motion
              :initial="{ opacity: 0, x: 20 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
          >
            <a-form
                :model="registerForm"
                @finish="handleRegister"
                layout="vertical"
                class="auth-form"
            >
              <a-form-item
                  name="username"
                  :rules="[{ required: true, message: '请输入用户名' }]"
              >
                <a-input
                    v-model:value="registerForm.username"
                    placeholder="请输入用户名"
                    class="auth-input"
                >
                  <template #prefix>
                    <user-outlined class="input-icon"/>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                  name="password"
                  :rules="[{ required: true, message: '请输入密码' }]"
              >
                <a-input-password
                    v-model:value="registerForm.password"
                    placeholder="请输入密码"
                    class="auth-input"
                >
                  <template #prefix>
                    <lock-outlined class="input-icon"/>
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item
                  name="confirmPassword"
                  :rules="[
                  { required: true, message: '请确认密码' },
                  { validator: validateConfirmPassword }
                ]"
              >
                <a-input-password
                    v-model:value="registerForm.confirmPassword"
                    placeholder="确认密码"
                    class="auth-input"
                >
                  <template #prefix>
                    <check-outlined class="input-icon"/>
                  </template>
                </a-input-password>
              </a-form-item>

              <a-button
                  type="primary"
                  html-type="submit"
                  :loading="loading"
                  class="submit-btn"
              >
                注册
              </a-button>
            </a-form>
          </div>

          <!-- 登录后可体验功能 -->
          <div class="features-container" v-show="activeTab === 'login'" v-motion :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }">
            <p class="features-title">登录后即可体验完整功能</p>
            <div class="feature-items">
              <div class="feature-item">
                <book-outlined class="feature-icon"/>
                <span>构建知识笔记</span>
              </div>
              <div class="feature-item">
                <link-outlined class="feature-icon"/>
                <span>建立知识连接</span>
              </div>
              <div class="feature-item">
                <team-outlined class="feature-icon"/>
                <span>团队协作</span>
              </div>
            </div>
          </div>


          <!-- 在注册表单之后添加以下内容 -->
          <!-- 注册专享内容区域 -->
          <div v-show="activeTab === 'register'" class="register-benefits" v-motion :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }">
            <!-- 新用户福利 -->
            <p class="benefits-title">注册即享多重权益</p>

            <div class="benefits-container">
              <div class="benefit-card">
                <gift-outlined class="benefit-icon"/>
                <div class="benefit-text">
                  <h4>新用户专享</h4>
                  <p>获得2GB额外存储空间</p>
                </div>
              </div>

              <div class="benefit-card">
                <safety-outlined class="benefit-icon"/>
                <div class="benefit-text">
                  <h4>数据安全</h4>
                  <p>全程加密保护您的隐私</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {message} from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined,
  CheckOutlined,
  CloseOutlined,
  CloudOutlined,
  BookOutlined,
  LinkOutlined,
  TeamOutlined,
  GiftOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue';
import {useUserStore} from '@/stores/user';

// 获取用户状态存储
const userStore = useUserStore();

// 模态框可见性
const visible = ref(false);
const activeTab = ref('login');
const loading = ref(false);
const rememberMe = ref(false);

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
});

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

// 验证确认密码
const validateConfirmPassword = async (_rule: any, value: string) => {
  if (value !== registerForm.password) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};

// 处理登录
const handleLogin = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模拟成功的响应
    const userData = {
      id: '1',
      username: loginForm.username,
      role: 'admin',
      isAdmin: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      token: 'mock-jwt-token'
    };

    // 保存到状态管理
    userStore.login(userData);

    message.success('登录成功，欢迎回来！');
    visible.value = false;
  } catch (error) {
    message.error('登录失败，请检查用户名和密码');
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模拟成功的响应
    const userData = {
      id: Date.now().toString(),
      username: registerForm.username,
      role: 'admin',
      isAdmin: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.username}`,
      token: 'mock-jwt-token'
    };

    // 保存到状态管理
    userStore.login(userData);

    message.success('注册成功！');
    visible.value = false;
  } catch (error) {
    message.error('注册失败，请稍后再试');
    console.error('Register error:', error);
  } finally {
    loading.value = false;
  }
};

// 打开登录弹窗
const open = () => {
  visible.value = true;
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style scoped>
/* 主容器样式 */
.auth-modal {
  border-radius: 12px;
  overflow: hidden;
}

.auth-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.modal-container {
  display: flex;
  width: 100%;
  height: 550px;
  overflow: hidden;
}

/* 左侧品牌面板 */
.brand-panel {
  position: relative;
  width: 45%;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  color: white;
  overflow: hidden;
}

.brand-content {
  position: relative;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

/* 左侧品牌标志和名称 */
.brand-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo-container {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.logo-icon {
  font-size: 24px;
  color: white;
}

.brand-name {
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin: 0;
}

/* 品牌标语 */
.brand-slogan {
  margin-top: 20px;
  margin-bottom: 40px;
}

.brand-slogan h2 {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px;
  line-height: 1.2;
}

.brand-slogan p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 插图区域 */
.illustration-area {
  position: relative;
  height: 200px;
  margin-bottom: 40px;
}

.illustration-element {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.box1 {
  width: 120px;
  height: 120px;
  left: 10%;
  top: 10%;
  animation: float 12s ease-in-out infinite;
}

.box2 {
  width: 140px;
  height: 80px;
  right: 10%;
  top: 30%;
  animation: float 15s ease-in-out infinite reverse;
}

.box3 {
  width: 80px;
  height: 80px;
  left: 40%;
  bottom: 10%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* 数据统计 */
.stats-container {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 5px;
}

.stat-item p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 右侧认证面板 */
.auth-panel {
  position: relative;
  width: 55%;
  background: white;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  z-index: 5;
}

.close-btn:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.auth-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 欢迎信息 */
.welcome-header {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 5px;
}

.welcome-header p {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

/* 标签切换 */
.auth-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab.active {
  color: #4F46E5;
  border-bottom-color: #4F46E5;
}

.tab:hover:not(.active) {
  color: #4b5563;
}

/* 表单容器 */
.auth-form-container {
  flex: 1;
  max-height: none;
}

.auth-form {
  max-width: 340px;
  margin: 0 auto;
}

.auth-input {
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.auth-input:hover {
  border-color: #a5b4fc;
}

.auth-input:focus, .auth-input:focus-within {
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.input-icon {
  color: #9ca3af;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  color: #4F46E5;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background: #4F46E5;
  border: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 波纹效果 */
.submit-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.submit-btn:hover::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* 功能特点 */
.features-container {
  margin-top: auto;
  text-align: center;
  padding-top: 16px;
}

.features-title {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 12px;
}

.feature-items {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-3px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 20px;
  color: #4F46E5;
  transition: all 0.3s ease;
  padding: 8px;
}

.feature-item:hover .feature-icon {
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
}

.feature-item span {
  font-size: 13px;
  color: #4b5563;
}

/* 深色模式适配 */
:global([data-theme="dark"]) .auth-panel {
  background: #1f2937;
}

:global([data-theme="dark"]) .close-btn {
  background: #374151;
  color: #e5e7eb;
}

:global([data-theme="dark"]) .close-btn:hover {
  background: #4b5563;
}

:global([data-theme="dark"]) .welcome-header h2 {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .welcome-header p {
  color: #9ca3af;
}

:global([data-theme="dark"]) .auth-tabs {
  border-bottom-color: #374151;
}

:global([data-theme="dark"]) .tab {
  color: #9ca3af;
}

:global([data-theme="dark"]) .tab.active {
  color: #a5b4fc;
  border-bottom-color: #a5b4fc;
}

:global([data-theme="dark"]) .auth-input {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

:global([data-theme="dark"]) .auth-input:hover {
  border-color: #6366f1;
}

:global([data-theme="dark"]) .auth-input:focus,
:global([data-theme="dark"]) .auth-input:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

:global([data-theme="dark"]) .input-icon {
  color: #9ca3af;
}

:global([data-theme="dark"]) .forgot-password {
  color: #a5b4fc;
}

:global([data-theme="dark"]) .submit-btn {
  background: #4F46E5;
}

:global([data-theme="dark"]) .submit-btn:hover {
  background: #6366f1;
}

:global([data-theme="dark"]) .features-title {
  color: #9ca3af;
}

:global([data-theme="dark"]) .feature-icon {
  background: #374151;
  color: #818cf8;
}

:global([data-theme="dark"]) .feature-item:hover .feature-icon {
  background: rgba(129, 140, 248, 0.2);
}

:global([data-theme="dark"]) .feature-item span {
  color: #d1d5db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    flex-direction: column;
    height: auto;
  }

  .brand-panel, .auth-panel {
    width: 100%;
  }

  .brand-panel {
    height: 250px;
  }

  .brand-slogan h2 {
    font-size: 28px;
  }

  .brand-slogan p {
    font-size: 16px;
  }

  .stats-container {
    margin-top: 20px;
  }

  .stat-item h3 {
    font-size: 24px;
  }
}

/* 注册专享福利部分 */
.register-benefits {
  /* 修改定位方式，不再自动推到底部 */
  margin-top: 15px;
  margin-bottom: 40px; /* 增加底部边距，创造空白区域 */
  text-align: center;
  padding-top: 0; /* 移除顶部内边距 */
}

.benefits-title {
  font-size: 13px;
  margin-bottom: 10px;
}

.benefits-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-direction: row; /* 确保横向排列 */
}

.benefit-card {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: auto; /* 修改为auto，根据内容自适应宽度 */
  flex: 0 0 auto; /* 不伸缩，保持自身大小 */
}

.benefit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.benefit-icon {
  font-size: 16px;
  color: #4F46E5;
  margin-right: 8px;
}

.benefit-text {
  text-align: left;
  min-width: 100px; /* 确保文本有足够空间显示 */
}

.benefit-text h4 {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px;
  white-space: nowrap; /* 防止文字换行 */
}

.benefit-text p {
  font-size: 11px; /* 略微减小字体大小 */
  color: #6b7280;
  margin: 0;
  white-space: nowrap; /* 防止文字换行 */
}

.agreement-text {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 12px;
  margin-bottom: 10px;
}

.link-text {
  color: #4F46E5;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-text:hover {
  text-decoration: underline;
}

/* 深色模式适配 */
:global([data-theme="dark"]) .benefit-card {
  background: #2d3748;
}

:global([data-theme="dark"]) .benefit-text h4 {
  color: #f3f4f6;
}

:global([data-theme="dark"]) .benefit-text p {
  color: #9ca3af;
}

:global([data-theme="dark"]) .link-text {
  color: #a5b4fc;
}

/* 输入框动画效果 */
.auth-input:focus {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 0 rgba(79, 70, 229, 0.1);
  }
  100% {
    box-shadow: 0 0 6px rgba(79, 70, 229, 0.2);
  }
}
</style>