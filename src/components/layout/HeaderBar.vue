<!-- src/components/layout/HeaderBar.vue -->
<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- 左侧导航 -->
      <div class="nav-links">
        <TransitionGroup name="nav-item">
          <div
              v-for="(item, index) in navItems"
              :key="item.path"
              class="nav-item-container"
          >

            <a v-if="!item.children"
            :href="item.path"
            class="header-link"
            :class="{ active: item.active }"
            @mouseenter="onHover(index)"
            @mouseleave="onLeave(index)"
            >
            <div class="icon-container">
              <component :is="item.icon" />
            </div>
            <span>{{ item.title }}</span>
            <div v-if="item.active" class="active-indicator"></div>
            </a>

            <!-- 带有子菜单的导航项 -->
            <div
                v-else
                class="header-link dropdown-trigger"
                :class="{ active: item.active }"
                @mouseenter="onDropdownHover(index)"
                @mouseleave="onDropdownLeave(index)"
            >
              <div class="icon-container">
                <component :is="item.icon" />
              </div>
              <span>{{ item.title }}</span>
              <down-outlined v-if="item.children" :class="{'dropdown-icon': true, 'rotated': activeDropdown === index}" />
              <div v-if="item.active" class="active-indicator"></div>

              <!-- 下拉菜单 -->
              <transition name="dropdown">
                <div v-show="activeDropdown === index" class="dropdown-menu">
                  <a
                      v-for="child in item.children"
                      :key="child.path"
                      :href="child.path"
                      class="dropdown-item"
                  >
                    <div class="dropdown-icon-container">
                      <component :is="child.icon" />
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
        <a-button type="primary" class="upload-button">
          <template #icon><upload-outlined /></template>
          上传图片
        </a-button>

        <!-- 通知 -->
        <a-badge dot>
          <a-button type="text" shape="circle" class="notification-button">
            <template #icon><bell-outlined /></template>
          </a-button>
        </a-badge>

        <!-- 用户头像 -->
        <a-dropdown>
          <a-avatar
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              class="user-avatar"
          />
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">个人资料</a-menu-item>
              <a-menu-item key="settings">设置</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout">退出登录</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
  PictureOutlined,
  TagOutlined,
  AppstoreOutlined,
  BookOutlined,
  UploadOutlined,
  BellOutlined,
  DownOutlined,
  DashboardOutlined,
  CommentOutlined,
  SafetyCertificateOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';

// 导航菜单数据 - 增加了二级菜单结构
const navItems = ref([
  { path: '/', title: '主页', icon: HomeOutlined, active: true },
  { path: '/create', title: '创建图片', icon: PlusOutlined, active: false },
  {
    title: '内容管理',
    icon: AppstoreOutlined,
    active: false,
    children: [
      { path: '/dashboard', title: '仪表盘', icon: DashboardOutlined },
      { path: '/images', title: '图片管理', icon: PictureOutlined },
      { path: '/spaces', title: '空间管理', icon: AppstoreOutlined },
      { path: '/categories', title: '分类管理', icon: AppstoreOutlined },
      { path: '/tags', title: '标签管理', icon: TagOutlined },
      { path: '/comments', title: '评论管理', icon: CommentOutlined }
    ]
  },
  {
    title: '系统设置',
    icon: SettingOutlined,
    active: false,
    children: [
      { path: '/users', title: '用户管理', icon: UserOutlined },
      { path: '/settings', title: '系统设置', icon: SettingOutlined },
      { path: '/security', title: '安全中心', icon: SafetyCertificateOutlined }
    ]
  },
]);

// 处理鼠标悬停效果
const hoveredIndex = ref(null);
const onHover = (index) => {
  hoveredIndex.value = index;
};
const onLeave = () => {
  hoveredIndex.value = null;
};

// 处理下拉菜单的显示/隐藏
const activeDropdown = ref(null);
const onDropdownHover = (index) => {
  activeDropdown.value = index;
};
const onDropdownLeave = (index) => {
  activeDropdown.value = null;
};

// 使用vueuse/motion设置元素动画
onMounted(() => {
  // 为上传按钮添加动画
  const uploadBtn = document.querySelector('.upload-button');
  if (uploadBtn) {
    useMotion(uploadBtn, {
      initial: { scale: 1 },
      hover: { scale: 1.05 }
    });
  }

  // 为用户头像添加动画
  const avatar = document.querySelector('.user-avatar');
  if (avatar) {
    useMotion(avatar, {
      initial: { scale: 1, borderWidth: '2px', borderColor: 'transparent' },
      hover: { scale: 1.1, borderWidth: '2px', borderColor: 'rgba(79, 70, 229, 0.3)' }
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
  position: sticky;
  top: 0;
  z-index: 99;
  padding: 0;
  height: 64px;
  line-height: 64px;
  margin: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.nav-links {
  display: flex;
  height: 100%;
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

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 100;
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

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05);
}

.upload-button:active {
  transform: translateY(0);
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
  box-shadow: 0 0 0 2px transparent;
}

.user-avatar:hover {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
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

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>