<!-- src/components/layout/SideBar.vue -->
<template>
  <a-layout-sider
      class="sidebar"
      :width="240"
      :collapsed-width="80"
      :collapsed="collapsed"
      :trigger="null"
      collapsible
      fixed
  >
    <!-- Logo区域 -->
    <div class="sidebar-header" @click="navigateToHome">
      <div class="logo-container">
        <div class="logo-icon-wrapper">
          <cloud-outlined class="logo-icon"/>
        </div>
        <h1 class="logo-title" v-if="!collapsed">智能云图库</h1>
      </div>
    </div>

    <!-- 侧边栏内容容器 -->
    <div class="sidebar-container">
      <!-- 主要菜单 -->
      <div class="menu-group-title" v-if="!collapsed">{{ menuGroups[0].title }}</div>
      <div class="menu-items">
        <div
            v-for="item in menuGroups[0].items"
            :key="item.key"
            :class="['menu-item', {'active': selectedKeys.includes(item.key)}]"
            @click="handleMenuClick(item)"
        >
          <component :is="item.icon" class="menu-item-icon"/>
          <span class="menu-item-label" v-if="!collapsed">{{ item.label }}</span>
        </div>
      </div>

      <!-- 收藏分类 -->
      <div class="menu-group-title" v-if="!collapsed">{{ menuGroups[1].title }}</div>
      <div class="menu-items">
        <div
            v-for="item in menuGroups[1].items"
            :key="item.key"
            :class="['menu-item', {'active': selectedKeys.includes(item.key)}]"
            @click="handleMenuClick(item)"
        >
          <component :is="item.icon" class="menu-item-icon"/>
          <span class="menu-item-label" v-if="!collapsed">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 创建团队按钮 -->
    <div class="sidebar-footer">
      <a-button
          type="primary"
          class="create-team-btn"
          block
          @click="handleCreateTeam"
      >
        <template #icon>
          <plus-outlined/>
        </template>
        <span v-if="!collapsed">创建新团队</span>
      </a-button>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  CloudOutlined,
  PictureOutlined,
  InboxOutlined,
  TeamOutlined,
  GlobalOutlined,
  HeartOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';

// 获取路由实例
const router = useRouter();
const route = useRoute();

// 侧边栏折叠状态，加入props双向绑定
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:collapsed']);

// 创建计算属性来处理双向绑定
const collapsed = computed({
  get: () => props.collapsed,
  set: (value) => emit('update:collapsed', value)
});

// 选中的菜单项
const selectedKeys = ref(['gallery']);

// 定义菜单组数据结构
const menuGroups = [
  {
    title: '主要菜单',
    items: [
      {
        key: 'gallery',
        icon: PictureOutlined,
        label: '公共图库',
        path: '/'
      },
      {
        key: 'my-space',
        icon: InboxOutlined,
        label: '我的空间',
        path: '/space'
      },
      {
        key: 'team',
        icon: TeamOutlined,
        label: '团队协作',
        path: '/team'
      },
      {
        key: 'explore',
        icon: GlobalOutlined,
        label: '探索发现',
        path: '/explore'
      }
    ]
  },
  {
    title: '收藏分类',
    items: [
      {
        key: 'favorites',
        icon: HeartOutlined,
        label: '我的收藏',
        path: '/favorites'
      },
      {
        key: 'saved',
        icon: BookOutlined,
        label: '已保存',
        path: '/saved'
      },
      {
        key: 'history',
        icon: ClockCircleOutlined,
        label: '最近浏览',
        path: '/history'
      }
    ]
  }
];

// 根据路由路径设置选中的菜单
watch(() => route.path, (newPath) => {
  // 遍历所有菜单项找到匹配的路径
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (item.path === newPath ||
          (newPath === '/' && item.key === 'gallery') ||
          (newPath.startsWith(item.path) && item.path !== '/')) {
        selectedKeys.value = [item.key];
        break;
      }
    }
  }
}, { immediate: true });

// 菜单点击处理函数
const handleMenuClick = (item) => {
  selectedKeys.value = [item.key];
  router.push(item.path);
};

// 导航到首页函数
const navigateToHome = () => {
  selectedKeys.value = ['gallery'];
  router.push('/');
};

// 创建团队处理函数
const handleCreateTeam = () => {
  router.push('/team/create');
};
</script>

<style scoped>
.sidebar {
  height: 100vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 25;
  background: white;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
}

.sidebar-header {
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  margin: 0;
  box-sizing: border-box;
  cursor: pointer;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: var(--primary-color, #4F46E5);
}

.logo-title {
  margin: 0 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
}

/* 侧边栏内容容器，使用flex布局 */
.sidebar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  overflow-y: auto;
}

/* 菜单分组标题 */
.menu-group-title {
  color: #616161;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  margin-top: 8px;
  margin-bottom: 4px;
}

/* 菜单项容器 */
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 单个菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  margin: 0 8px;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.menu-item.active {
  background-color: rgba(var(--primary-rgb, 79, 70, 229), 0.1);
}

.menu-item.active .menu-item-icon {
  color: var(--primary-color, #4F46E5);
}

.menu-item.active .menu-item-label {
  color: var(--primary-color, #4F46E5);
  font-weight: 500;
}

/* 菜单项图标 */
.menu-item-icon {
  font-size: 18px;
  color: #303030;
  margin-right: 12px;
}

/* 菜单项标签 */
.menu-item-label {
  font-size: 14px;
  color: #202020;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部按钮区域 */
.sidebar-footer {
  padding: 16px;
  margin-top: auto;
}

/* 创建新团队按钮 */
.create-team-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color, #4F46E5);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(var(--primary-rgb, 79, 70, 229), 0.2);
  transition: all 0.3s;
}

.create-team-btn:hover {
  background: var(--primary-hover, #4338CA);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.25);
}

.create-team-btn .anticon {
  font-size: 16px;
}

/* 折叠状态下的样式调整 */
:deep(.ant-layout-sider-collapsed) .create-team-btn {
  padding: 0;
  width: 48px !important;
  height: 48px;
  margin: 0 auto;
}

:deep(.ant-layout-sider-collapsed) .menu-item {
  padding: 0;
  justify-content: center;
}

:deep(.ant-layout-sider-collapsed) .menu-item-icon {
  margin-right: 0;
}

:deep(.ant-layout-sider-collapsed) .logo-icon-wrapper {
  margin: 0 auto;
}

/* 深色模式下的样式调整 */
:global([data-theme="dark"]) .sidebar {
  background: var(--bg-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:global([data-theme="dark"]) .sidebar-header {
  border-bottom-color: var(--border-color);
}

:global([data-theme="dark"]) .logo-title {
  color: var(--text-primary);
}

:global([data-theme="dark"]) .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

:global([data-theme="dark"]) .menu-item.active {
  background-color: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
}

:global([data-theme="dark"]) .menu-item-icon,
:global([data-theme="dark"]) .menu-item-label {
  color: var(--text-primary);
}

:global([data-theme="dark"]) .menu-group-title {
  color: var(--text-secondary);
}
</style>