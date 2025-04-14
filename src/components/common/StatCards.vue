<template>
  <div class="stat-cards-container">
    <div
        v-for="(card, index) in cards"
        :key="index"
        :class="['stat-card', `${card.color}-card`]"
    >
      <div class="stat-card-content">
        <div class="stat-card-icon">
          <component :is="card.icon" />
        </div>
        <div class="stat-card-info">
          <div class="stat-card-title">{{ card.title }}</div>
          <div class="stat-card-value">{{ card.value }}</div>
          <div
              class="stat-card-change"
              :class="card.change > 0 ? 'increase' : card.change < 0 ? 'decrease' : 'no-change'"
          >
            <arrow-up-outlined v-if="card.change > 0" />
            <arrow-down-outlined v-if="card.change < 0" />
            <minus-outlined v-if="card.change === 0" />
            {{ Math.abs(card.change) }}% 较上月
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons-vue';

defineProps({
  // 卡片数据数组
  cards: {
    type: Array,
    required: true
    // cards数组中的每个对象应该包含 {title, value, change, color, icon} 五个属性
    // color应为：purple, blue, green, gold 之一
  }
});
</script>

<style scoped>
/* 卡片区域容器样式 */
.stat-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
}

/* 通用卡片样式 */
.stat-card {
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 卡片主要内容 */
.stat-card-content {
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

/* 卡片图标 */
.stat-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.stat-card-icon .anticon {
  font-size: 20px;
}

/* 卡片信息区 */
.stat-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-card-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 4px;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-card-change {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 10px;
  width: fit-content;
}

.stat-card-change .anticon {
  margin-right: 2px;
  font-size: 12px;
}

.increase {
  color: #52C41A;
  background-color: rgba(82, 196, 26, 0.1);
}

.decrease {
  color: #F5222D;
  background-color: rgba(245, 34, 45, 0.1);
}

.no-change {
  color: #8C8C8C;
  background: rgba(0, 0, 0, 0.06);
}

/* 紫色卡片 */
.purple-card {
  background: linear-gradient(135deg, #F4F1FF 0%, #EEEAFF 100%);
}

.purple-card .stat-card-icon {
  background-color: rgba(101, 84, 192, 0.1);
  color: #6554C0;
}

/* 蓝色卡片 */
.blue-card {
  background: linear-gradient(135deg, #F0F7FF 0%, #E6F1FF 100%);
}

.blue-card .stat-card-icon {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890FF;
}

/* 绿色卡片 */
.green-card {
  background: linear-gradient(135deg, #F0FFF0 0%, #E6FFE6 100%);
}

.green-card .stat-card-icon {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52C41A;
}

/* 金色卡片 */
.gold-card {
  background: linear-gradient(135deg, #FFFBE6 0%, #FFF8D9 100%);
}

.gold-card .stat-card-icon {
  background-color: rgba(250, 173, 20, 0.1);
  color: #FAAD14;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stat-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stat-cards-container {
    grid-template-columns: 1fr;
  }
}
</style>