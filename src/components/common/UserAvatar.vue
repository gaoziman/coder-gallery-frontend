// 在 src/components/common/UserAvatar.vue 文件中
<template>
  <div class="user-avatar-wrapper" :title="username">
    <div v-if="avatar" class="avatar-image-container">
      <img :src="avatar" :alt="username" class="avatar-image" />
    </div>
    <div v-else class="avatar-text-container" :style="{ backgroundColor: avatarColor }">
      <span class="avatar-text">{{ userInitials }}</span>
      <span v-if="isOnline" class="status-indicator online"></span>
      <span v-else-if="isOffline" class="status-indicator offline"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  username: {
    type: String,
    default: '未知用户'
  },
  userId: {
    type: [String, Number],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: -1 // -1: 无状态, 0: 离线, 1: 在线
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
});

// 根据用户ID生成背景色
const avatarColor = computed(() => {
  const colors = [
    '#1677ff', '#13c2c2', '#52c41a', '#faad14', '#fa541c',
    '#722ed1', '#eb2f96', '#f5222d', '#fa8c16', '#a0d911'
  ];

  if (!props.userId) return colors[0];

  // 确保即使是字符串ID也能获得一致的颜色
  const id = typeof props.userId === 'string'
      ? props.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : props.userId;

  return colors[id % colors.length];
});

// 生成用户名首字母
const userInitials = computed(() => {
  if (!props.username) return '?';

  // 处理中文名（取第一个字）和英文名（取首字母）
  if (/^[\u4e00-\u9fa5]+$/.test(props.username)) {
    return props.username.charAt(0);
  } else {
    const nameParts = props.username.split(' ');
    if (nameParts.length > 1) {
      // 如果是全名，返回首字母组合
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    } else {
      // 单个名字，返回首字母
      return props.username.charAt(0).toUpperCase();
    }
  }
});

// 计算在线状态
const isOnline = computed(() => props.status === 1);
const isOffline = computed(() => props.status === 0);
</script>

<style scoped>
.user-avatar-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  width: v-bind('props.size === "small" ? "32px" : props.size === "large" ? "48px" : "40px"');
  height: v-bind('props.size === "small" ? "32px" : props.size === "large" ? "48px" : "40px"');
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-image-container {
  width: 100%;
  height: 100%;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: v-bind('props.size === "small" ? "14px" : props.size === "large" ? "20px" : "16px"');
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: #52c41a;
}

.status-indicator.offline {
  background-color: #bfbfbf;
}
</style>