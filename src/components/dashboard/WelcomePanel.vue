<template>
  <a-card class="welcome-panel" :bordered="false">
    <div class="welcome-content">
      <div class="welcome-left">
        <h1 class="welcome-title">{{ greeting }}，管理员</h1>
        <div class="date-time">
          <div class="date">{{ formattedDate }}</div>
          <div class="time">
            {{ formattedTime }}
            <span class="seconds">{{ seconds }}</span>
            <span class="am-pm">{{ timeFormat }}</span>
          </div>
        </div>

        <div class="system-status-container">
          <div class="status-item">
            <div class="status-label">系统运行状态</div>
            <div class="status-value" :class="{'status-good': systemStatus === '良好'}">{{ systemStatus }}</div>
          </div>

          <div class="status-item">
            <div class="status-label">服务器负载</div>
            <div class="status-value">{{ serverLoad }}</div>
          </div>

          <div class="status-item">
            <div class="status-label">在线用户</div>
            <div class="status-value">{{ onlineUsers }}人</div>
          </div>
        </div>

        <div class="action-buttons">
          <a-button type="primary">
            <UploadOutlined />
            上传新图片
          </a-button>
          <a-button>
            <LineChartOutlined />
            查看数据统计
          </a-button>
          <a-button>
            <SettingOutlined />
            系统设置
          </a-button>
        </div>
      </div>

      <div class="welcome-right">
        <div class="stats-summary">
          <div class="stat-card">
            <UploadOutlined class="stat-icon" />
            <div class="stat-info">
              <div class="stat-value">{{ todayUploads }}</div>
              <div class="stat-label">今日上传</div>
            </div>
          </div>

          <div class="stat-card">
            <EyeOutlined class="stat-icon" />
            <div class="stat-info">
              <div class="stat-value">{{ todayViews }}</div>
              <div class="stat-label">今日浏览</div>
            </div>
          </div>

          <div class="stat-card">
            <HeartOutlined class="stat-icon" />
            <div class="stat-info">
              <div class="stat-value">{{ todayLikes }}</div>
              <div class="stat-label">今日点赞</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  UploadOutlined,
  LineChartOutlined,
  SettingOutlined,
  EyeOutlined,
  HeartOutlined
} from '@ant-design/icons-vue';

// 动态时间与日期
const now = ref(new Date());
const seconds = ref(now.value.getSeconds().toString().padStart(2, '0'));
let timer = null;

// 计算属性
const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

const formattedDate = computed(() => {
  const year = now.value.getFullYear();
  const month = now.value.getMonth() + 1;
  const date = now.value.getDate();
  const day = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.value.getDay()];
  return `${year}年${month}月${date}日 ${day}`;
});

const formattedTime = computed(() => {
  const hours = now.value.getHours();
  const minutes = now.value.getMinutes().toString().padStart(2, '0');

  let displayHours = hours;
  if (hours > 12) {
    displayHours = hours - 12;
  } else if (hours === 0) {
    displayHours = 12;
  }

  return `${displayHours}:${minutes}`;
});

const timeFormat = computed(() => {
  return now.value.getHours() >= 12 ? 'PM' : 'AM';
});

// 模拟数据
const systemStatus = ref('良好');
const serverLoad = ref('19.101108403987%');
const onlineUsers = ref(43);
const todayUploads = ref(47);
const todayViews = ref(384);
const todayLikes = ref(136);

// 更新时间
const updateTime = () => {
  now.value = new Date();
  seconds.value = now.value.getSeconds().toString().padStart(2, '0');
};

onMounted(() => {
  // 设置定时器每秒更新一次时间
  timer = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  // 组件销毁前清除定时器
  clearInterval(timer);
});
</script>

<style scoped>
.welcome-panel {
  background: linear-gradient(135deg, #6151e6 0%, #4338ca 100%);
  color: white;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
}

.welcome-left {
  flex: 1;
}

.welcome-right {
  width: 320px;
  padding-left: 24px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-title {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 500;
}

.date-time {
  margin-bottom: 24px;
}

.date {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.time {
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
}

.seconds {
  font-size: 20px;
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.8;
}

.am-pm {
  font-size: 16px;
  margin-left: 4px;
  opacity: 0.8;
}

.system-status-container {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.status-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 6px;
  flex: 1;
}

.status-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.status-value {
  font-size: 16px;
  font-weight: 500;
}

.status-good {
  color: #52c41a;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
}

.stats-summary {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 50%;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}
</style>