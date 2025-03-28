// components/dashboard/RecentUsers.vue
<template>
  <a-card
      class="recent-users-card"
      :bordered="false"
      title="最近注册用户"
  >
    <!-- 修复卡片右上角内容 -->
    <template #extra>
      <a href="javascript:void(0);" class="extra-link">查看全部</a>
    </template>

    <a-spin :spinning="loading">
      <a-list :data-source="recentUsers" class="user-list">
        <template #renderItem="{ item }">
          <a-list-item class="user-list-item">
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :src="item.avatar" :size="50" />
              </template>
              <template #title>
                <div class="user-name">
                  {{ item.name }}
                  <a-tag
                      v-if="item.isVip"
                      color="#6151e6"
                      class="user-tag"
                  >
                    VIP
                  </a-tag>
                </div>
              </template>
              <template #description>
                <div class="user-description">
                  <div class="user-email">{{ item.email }}</div>
                  <div class="user-join">
                    注册于 {{ formatDate(item.joinDate) }}
                  </div>
                </div>
              </template>
            </a-list-item-meta>
            <template #actions>
              <div class="user-stats">
                <div class="stat-item">
                  <PictureOutlined />
                  <span>{{ item.uploads }}</span>
                </div>
                <div class="stat-item">
                  <EyeOutlined />
                  <span>{{ item.views }}</span>
                </div>
                <div class="stat-item">
                  <HeartOutlined />
                  <span>{{ item.likes }}</span>
                </div>
              </div>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <div class="card-footer">
        <a-button type="link" class="view-more-btn">
          查看更多用户
          <RightOutlined />
        </a-button>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import {
  PictureOutlined,
  EyeOutlined,
  HeartOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 模拟加载状态
const loading = ref(false);

// 模拟最近用户数据
const recentUsers = ref([
  {
    id: 1,
    name: '张艺谋',
    email: 'zhang****@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    isVip: true,
    joinDate: '2025-03-28T08:12:34',
    uploads: 15,
    views: 342,
    likes: 87
  },
  {
    id: 2,
    name: '李小明',
    email: 'li****@gmail.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVip: false,
    joinDate: '2025-03-27T21:45:12',
    uploads: 8,
    views: 126,
    likes: 42
  },
  {
    id: 3,
    name: '王晓华',
    email: 'wang****@qq.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVip: true,
    joinDate: '2025-03-27T16:20:39',
    uploads: 31,
    views: 865,
    likes: 214
  },
  {
    id: 4,
    name: '赵明',
    email: 'zhao****@163.com',
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    isVip: false,
    joinDate: '2025-03-27T10:05:18',
    uploads: 5,
    views: 89,
    likes: 23
  }
]);

// 格式化日期，显示为相对时间（例如：3小时前）
const formatDate = (dateString) => {
  return dayjs(dateString).fromNow();
};
</script>

<style scoped>
.recent-users-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 480px;
}

.extra-link {
  color: #6151e6;
  font-size: 14px;
}

.user-list {
  margin-top: -16px;
}

.user-list-item {
  padding: 16px 0;
  transition: all 0.3s;
}

.user-list-item:hover {
  background-color: rgba(97, 81, 230, 0.05);
}

.user-name {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.user-tag {
  margin-left: 8px;
  font-size: 10px;
  border-radius: 10px;
  padding: 0 8px;
  line-height: 18px;
  height: 18px;
}

.user-description {
  display: flex;
  flex-direction: column;
}

.user-email {
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.65);
}

.user-join {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.65);
}

.stat-item span {
  margin-left: 4px;
}

.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.view-more-btn {
  color: #6151e6;
}

@media (max-width: 768px) {
  .user-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>