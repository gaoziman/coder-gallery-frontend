<template>
  <div class="statistics-cards">
    <a-row :gutter="24">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false">
          <div class="card-content">
            <div class="icon-wrapper">
              <PictureOutlined class="stat-icon image-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">图片总数</div>
              <div class="stat-value">{{ formatNumber(totalImages) }}</div>
              <div class="stat-growth" :class="{'growth-up': imageGrowth > 0, 'growth-down': imageGrowth < 0}">
                <span v-if="imageGrowth > 0">
                  <ArrowUpOutlined />
                </span>
                <span v-else>
                  <ArrowDownOutlined />
                </span>
                {{ Math.abs(imageGrowth) }}% 较上周
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false">
          <div class="card-content">
            <div class="icon-wrapper">
              <EyeOutlined class="stat-icon views-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">总访问量</div>
              <div class="stat-value">{{ formatNumber(totalViews) }}</div>
              <div class="stat-growth" :class="{'growth-up': viewsGrowth > 0, 'growth-down': viewsGrowth < 0}">
                <span v-if="viewsGrowth > 0">
                  <ArrowUpOutlined />
                </span>
                <span v-else>
                  <ArrowDownOutlined />
                </span>
                {{ Math.abs(viewsGrowth) }}% 较上周
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false">
          <div class="card-content">
            <div class="icon-wrapper">
              <UserOutlined class="stat-icon users-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">用户数量</div>
              <div class="stat-value">{{ formatNumber(totalUsers) }}</div>
              <div class="stat-growth" :class="{'growth-up': usersGrowth > 0, 'growth-down': usersGrowth < 0}">
                <span v-if="usersGrowth > 0">
                  <ArrowUpOutlined />
                </span>
                <span v-else>
                  <ArrowDownOutlined />
                </span>
                {{ Math.abs(usersGrowth) }}% 较上周
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false">
          <div class="card-content">
            <div class="icon-wrapper">
              <HddOutlined class="stat-icon storage-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">存储容量</div>
              <div class="stat-value">{{ storageUsed }} <span class="storage-total">/ {{ storageTotal }}</span></div>
              <div class="storage-progress">
                <a-progress
                    :percent="storagePercent"
                    :showInfo="false"
                    :strokeColor="getStorageColor(storagePercent)"
                    size="small"
                />
                <div class="storage-text">已使用 {{ storagePercent }}%</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  PictureOutlined,
  EyeOutlined,
  UserOutlined,
  HddOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons-vue';

// 模拟数据 - 实际应用中应从API获取
const totalImages = ref(1284);
const imageGrowth = ref(12.5);
const totalViews = ref(28793);
const viewsGrowth = ref(25.8);
const totalUsers = ref(673);
const usersGrowth = ref(8.3);
const storageUsed = ref('3.7 GB');
const storageTotal = ref('10.0 GB');
const storagePercent = ref(37);

// 格式化数字，添加千分位分隔符
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 根据存储使用率返回不同颜色
const getStorageColor = (percent) => {
  if (percent < 50) return '#52c41a';
  if (percent < 80) return '#faad14';
  return '#f5222d';
};
</script>

<style scoped>
.statistics-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 28px;
}

.image-icon {
  color: #6151e6;
}

.views-icon {
  color: #13c2c2;
}

.users-icon {
  color: #1890ff;
}

.storage-icon {
  color: #722ed1;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
  white-space: nowrap;
}

.storage-total {
  font-size: 14px;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.45);
}

.stat-growth {
  font-size: 12px;
}

.growth-up {
  color: #52c41a;
}

.growth-down {
  color: #f5222d;
}

.storage-progress {
  margin-top: 8px;
}

.storage-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 16px;
  }
}
</style>