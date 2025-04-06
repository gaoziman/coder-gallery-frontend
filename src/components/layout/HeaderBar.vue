<!-- src/components/layout/HeaderBar.vue -->
<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- 左侧导航 -->
      <div class="nav-links">
        <TransitionGroup name="nav-item">
          <div
              v-for="(item, index) in filteredNavItems"
              :key="item.key"
              class="nav-item-container"
          >
            <a v-if="!item.children"
               href="javascript:void(0)"
               class="header-link"
               :class="{ active: item.active }"
               @click="handleNavItemClick(item)"
               @mouseenter="onHover(index)"
               @mouseleave="onLeave(index)"
            >
              <div class="icon-container">
                <component :is="item.icon"/>
              </div>
              <span>{{ item.title }}</span>
              <div v-if="item.active" class="active-indicator"></div>
            </a>

            <!-- 带有子菜单的导航项 -->
            <div
                v-else
                class="header-link dropdown-trigger"
                :class="{ active: item.active || isParentActive(item) }"
                @mouseenter="onDropdownHover(index)"
                @mouseleave="onDropdownLeave(index)"
            >
              <div class="icon-container">
                <component :is="item.icon"/>
              </div>
              <span>{{ item.title }}</span>
              <down-outlined v-if="item.children"
                             :class="{'dropdown-icon': true, 'rotated': activeDropdown === index}"/>
              <div v-if="item.active" class="active-indicator"></div>

              <!-- 下拉菜单 -->
              <transition name="dropdown">
                <div v-show="activeDropdown === index" class="dropdown-menu">
                  <a v-for="child in item.children"
                     :key="child.key"
                     href="javascript:void(0)"
                     class="dropdown-item"
                     @click="handleSubItemClick(child)"
                  >
                    <div class="dropdown-icon-container">
                      <component :is="child.icon"/>
                    </div>
                    <span>{{ child.title }}</span>
                  </a>
                </div>
              </transition>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- 右侧用户信息 -->
      <div class="user-actions">
        <!-- 上传按钮 -->
        <a-button type="primary"  :disabled="!userStore.isLoggedIn" @click="handleUploadClick">
          <template #icon>
            <upload-outlined/>
          </template>
          上传图片
        </a-button>

        <!-- 通知 - 仅登录后显示 -->
        <a-badge dot v-if="userStore.isLoggedIn">
          <a-button type="text" shape="circle" class="notification-button">
            <template #icon>
              <bell-outlined/>
            </template>
          </a-button>
        </a-badge>

        <!-- 用户头像或登录按钮 -->
        <template v-if="userStore.isLoggedIn">
          <!-- 用户头像及下拉菜单 -->
          <a-dropdown :trigger="['click']">
            <a-avatar
                :src="userStore.userInfo?.avatar"
                class="user-avatar"
            />

            <!-- 自定义下拉菜单，更紧凑的版本 -->
            <template #overlay>
              <div class="custom-dropdown-menu">
                <a href="/profile" class="custom-menu-item">
                  <div class="menu-icon">
                    <user-outlined/>
                  </div>
                  <span class="menu-text">个人资料</span>
                </a>
                <div class="menu-divider"></div>
                <a @click="handleLogout" class="custom-menu-item">
                  <div class="menu-icon">
                    <logout-outlined/>
                  </div>
                  <span class="menu-text">退出登录</span>
                </a>
              </div>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <!-- 登录按钮 -->
          <a-button
              type="primary"
              @click="openAuthModal"
          >
            <template #icon>
              <login-outlined/>
            </template>
            登录
          </a-button>
        </template>
      </div>
    </div>

    <!-- 引入登录/注册模态框组件 -->
    <auth-modal ref="authModalRef"/>
  </a-layout-header>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useMotion} from '@vueuse/motion';
import {useUserStore} from '@/stores/user';
import {useMenuStore} from '@/stores/menu';
import {message} from 'ant-design-vue';
import AuthModal from '@/components/auth/AuthModal.vue';
import {
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
  PictureOutlined,
  TagOutlined,
  AppstoreOutlined,
  UploadOutlined,
  BellOutlined,
  DownOutlined,
  DashboardOutlined,
  CommentOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined, CloudOutlined, CrownOutlined, FolderOpenOutlined,
} from '@ant-design/icons-vue';

// 获取路由和状态管理
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const menuStore = useMenuStore();

// 导航菜单数据
const navItems = ref([
  {key: 'home', path: '/', title: '主页', icon: HomeOutlined, active: false},
  {key: 'create-picture', path: '/create-picture', title: '创建图片', icon: PlusOutlined, active: false},
  {
    key: 'content-management',
    title: '内容管理',
    icon: AppstoreOutlined,
    active: false,
    children: [
      {key: 'dashboard', path: '/admin/dashboard', title: '仪表盘', icon: DashboardOutlined},
      {key: 'users', path: '/admin/users', title: '用户管理', icon: UserOutlined},
      {key: 'images', path: '/admin/images', title: '图片管理', icon: PictureOutlined},
      {key: 'spaces', path: '/admin/spaces', title: '空间管理', icon: CrownOutlined},
      {key: 'categories', path: '/admin/categories', title: '分类管理', icon: FolderOpenOutlined},
      {key: 'tags', path: '/admin/tags', title: '标签管理', icon: TagOutlined},
      {key: 'comments', path: '/admin/comments', title: '评论管理', icon: CommentOutlined}
    ]
  },
  {
    key: 'system-settings',
    title: '系统设置',
    icon: SettingOutlined,
    active: false,
    children: [
      {key: 'settings', path: '/admin/storage', title: '存储管理', icon: CloudOutlined},
    ]
  },
  {
    key: 'logs',
    title: '日志管理',
    icon: LoginOutlined,
    active: false,
    children: [
      {key: 'login_log', path: '/admin/login_log', title: '登录日志管理', icon: LoginOutlined},
      {key: 'operation_log', path: '/admin/operation_log', title: '操作日志管理', icon: LoginOutlined},
    ]
  },
]);

// 过滤菜单项，根据用户角色显示或隐藏管理员菜单
const filteredNavItems = computed(() => {
  // 如果是管理员，显示所有菜单项
  if (userStore.userInfo?.role === 'admin') {
    return navItems.value;
  }

  // 非管理员，过滤掉管理员专用菜单
  return navItems.value.filter(item => {
    // 过滤掉内容管理和系统设置这两个管理员菜单组
    if (item.key === 'content-management' || item.key === 'system-settings') {
      return false;
    }
    return true;
  });
});

// 更新导航项激活状态 - 需要在watch之前定义
const updateNavItemsActiveState = (activeKeys :any) => {
  navItems.value.forEach(item => {
    item.active = activeKeys.includes(item.key);
  });
};


const isParentActive = (item  :any) => {
  // 如果没有子菜单，直接返回 false
  if (!item.children) return false;

  // 检查子菜单中是否有被选中的项目
  return item.children.some(child => {
    // 检查当前路径是否与子菜单路径匹配
    return menuStore.topSelectedKeys.includes(child.key);
  });
};

// 监听菜单状态变化，更新导航栏高亮
watch(() => menuStore.topSelectedKeys, (newKeys) => {
  updateNavItemsActiveState(newKeys);
}, {deep: true, immediate: true});

// 导航项点击处理
const handleNavItemClick = (item  :any) => {
  if (item.path) {
    menuStore.activateTopMenu(item.key);
    router.push(item.path);
  }
};


// 子菜单项点击处理
const handleSubItemClick = (child :any) => {
  if (child.path) {
    menuStore.updateMenuByPath(child.path);
    router.push(child.path);
  }
};

// 处理鼠标悬停效果
const hoveredIndex = ref(null);
const onHover = (index  :any) => {
  hoveredIndex.value = index;
};
const onLeave = () => {
  hoveredIndex.value = null;
};

// 处理下拉菜单的显示/隐藏
const activeDropdown = ref(null);
const onDropdownHover = (index  :any) => {
  activeDropdown.value = index;
};
const onDropdownLeave = () => {
  activeDropdown.value = null;
};

// 登录模态框引用
const authModalRef = ref(null);

// 打开登录/注册模态框
const openAuthModal = () => {
  authModalRef.value?.open();
};

// 处理上传按钮点击
const handleUploadClick = () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录后再进行上传');
    openAuthModal();
  } else {
    router.push('/create-picture');
  }
};

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  message.success('已成功退出登录');
  router.push('/');
};

// 全局监听登录事件和初始化
onMounted(() => {
  // 初始化导航状态
  menuStore.updateMenuByPath(route.path);

  // 监听全局事件
  window.addEventListener('openLoginModal', () => {
    openAuthModal();
  });

  // 监听导航更新事件
  window.addEventListener('update-nav-active', (event) => {
    if (event.detail && event.detail.path) {
      menuStore.updateMenuByPath(event.detail.path);
    }
  });

  // 为上传按钮添加动画
  const uploadBtn = document.querySelector('.upload-button');
  if (uploadBtn) {
    useMotion(uploadBtn, {
      initial: {scale: 1},
      hover: {scale: 1.05}
    });
  }

  // 为用户头像添加动画
  const avatar = document.querySelector('.user-avatar');
  if (avatar) {
    useMotion(avatar, {
      initial: {scale: 1, borderWidth: '2px', borderColor: 'transparent'},
      hover: {scale: 1.1, borderWidth: '2px', borderColor: 'rgba(79, 70, 229, 0.3)'}
    });
  }

  // 为登录按钮添加动画
  const loginBtn = document.querySelector('.login-button');
  if (loginBtn) {
    useMotion(loginBtn, {
      initial: {scale: 1},
      hover: {scale: 1.05}
    });
  }
});
</script>

<style scoped>
/* 导入animate.css库 */
@import 'animate.css';

.header {
  background-color: #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.03);
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999; /* 降低z-index，确保低于模态框遮罩层 */
  padding: 0;
  height: 64px;
  line-height: 64px;
  margin: 0;
  left: 240px;
  width: calc(100% - 240px);
  transition: left 0.3s, width 0.3s;
}

body.modal-open .header {
  z-index: 900; /* 当模态框打开时进一步降低z-index */
}

/* 添加侧边栏折叠状态的样式 */
.sidebar-collapsed .header {
  left: 80px; /* 折叠后的侧边栏宽度 */
  width: calc(100% - 80px);
}
/* 修改header-content样式 */
.header-content {
  display: flex;
  justify-content: space-between; /* 这确保子元素分布在两端 */
  align-items: center;
  height: 100%;
  width: 100%; /* 确保宽度为100% */
  padding: 0; /* 移除内边距，让内容延伸到边缘 */
}

/* 修改nav-links样式，保证它不会挤压右侧内容 */
.nav-links {
  display: flex;
  height: 100%;
  flex-shrink: 0; /* 防止被压缩 */
  margin-left: 24px; /* 左侧留出空间 */
}

/* 修改user-actions样式，确保它始终靠右 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 24px; /* 只保留右侧内边距 */
  margin-left: auto; /* 这会将元素推到右侧 */
  flex-shrink: 0; /* 防止被压缩 */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  /* 提高z-index确保菜单显示在其他元素之上 */
  z-index: 1000;
}

.nav-item-container {
  height: 100%;
  position: relative;
}

.header-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  color: #666;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.header-link:hover {
  color: #4F46E5;
  background-color: rgba(79, 70, 229, 0.05);
}

.header-link.active {
  color: #4F46E5;
  font-weight: 500;
}

.icon-container {
  display: flex;
  align-items: center;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.header-link:hover .icon-container {
  animation: heartBeat 1s;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, rgba(79, 70, 229, 0), rgba(79, 70, 229, 1), rgba(79, 70, 229, 0));
  animation: fadeIn 0.5s;
}

/* 下拉菜单样式 */
.dropdown-trigger {
  cursor: pointer;
}

.dropdown-icon {
  margin-left: 4px;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  line-height: 1.5;
  white-space: nowrap;
}

.dropdown-item:hover {
  color: #4F46E5;
  background-color: rgba(79, 70, 229, 0.05);
}

.dropdown-icon-container {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}

.upload-button {
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
  transition: all 0.3s ease;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
}

.upload-button:active:not(:disabled) {
  transform: translateY(0);
}

/* 上传按钮悬停效果 - 确保在启用状态下正常工作 */
.upload-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
}

/* 禁用状态的上传按钮样式 */
.upload-button:disabled {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.5), rgba(99, 102, 241, 0.5));
  color: rgba(255, 255, 255, 0.8);
  cursor: not-allowed;
}

/* 登录按钮样式 */
.login-button {
  height: 36px;
  border-radius: 8px;
  background: #4F46E5; /* 改为实心按钮，与主题色一致 */
  color: white; /* 白色文字 */
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.login-button:hover {
  background: #6366F1; /* 悬停时稍微变亮 */
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -2px rgba(79, 70, 229, 0.3);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(79, 70, 229, 0.2);
}

.notification-button {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.notification-button:hover {
  transform: rotate(15deg);
  color: #4F46E5;
  background-color: rgba(79, 70, 229, 0.05);
  border-color: rgba(79, 70, 229, 0.1);
}

.user-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 导航项目进入/离开动画 */
.nav-item-enter-active,
.nav-item-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.nav-item-enter-from,
.nav-item-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 更紧凑的下拉菜单样式 */
.custom-dropdown-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 160px; /* 减小宽度 */
  overflow: hidden;
}

.custom-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px; /* 减小内边距 */
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.custom-menu-item:hover {
  color: #4F46E5;
  background-color: rgba(79, 70, 229, 0.05);
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px; /* 减小图标固定宽度 */
  font-size: 16px; /* 减小图标大小 */
  margin-right: 12px; /* 保持适度的间距 */
}

.menu-text {
  font-size: 14px;
}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 4px 0; /* 减小分割线边距 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.2);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .login-button span {
    display: none;
  }

  .upload-button span {
    display: none;
  }
}

/* 深色模式适配 */
:global([data-theme="dark"]) .header {
  background-color: #1f2937;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

:global([data-theme="dark"]) .header-link {
  color: #e5e7eb;
}

:global([data-theme="dark"]) .header-link:hover {
  color: #818cf8;
  background-color: rgba(129, 140, 248, 0.1);
}

:global([data-theme="dark"]) .header-link.active {
  color: #818cf8;
}

:global([data-theme="dark"]) .active-indicator {
  background: linear-gradient(90deg, rgba(129, 140, 248, 0), rgba(129, 140, 248, 1), rgba(129, 140, 248, 0));
}

:global([data-theme="dark"]) .dropdown-menu {
  background-color: #374151;
}

:global([data-theme="dark"]) .dropdown-item {
  color: #e5e7eb;
}

:global([data-theme="dark"]) .dropdown-item:hover {
  color: #818cf8;
  background-color: rgba(129, 140, 248, 0.1);
}

:global([data-theme="dark"]) .custom-dropdown-menu {
  background: #374151;
}

:global([data-theme="dark"]) .custom-menu-item {
  color: #e5e7eb;
}

:global([data-theme="dark"]) .custom-menu-item:hover {
  color: #818cf8;
  background-color: rgba(129, 140, 248, 0.1);
}

:global([data-theme="dark"]) .menu-divider {
  background-color: #4b5563;
}
</style>