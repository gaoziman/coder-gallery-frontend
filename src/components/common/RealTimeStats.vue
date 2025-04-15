<template>
  <div class="real-time-stats-container">
    <DashboardHeader
        :title="headerConfig.title"
        :description="headerConfig.description"
        :parent-module="headerConfig.parentModule"
        :icon-type="headerConfig.iconType"
        :metrics="userHeaderMetrics"
    />
    <StatCards :cards="userStatCards" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import DashboardHeader from "@/components/common/DashboardHeader.vue";
import StatCards from "@/components/common/StatCards.vue";
import { getUserStatisticsUsingGet } from "@/api/yonghuguanli.js";
import { h } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  // 页面标题配置
  headerConfig: {
    type: Object,
    required: true,
    // 示例: {title: '用户管理', description: '管理系统用户...', parentModule: '内容管理', iconType: 'icon-yonghuguanli1'}
  },
  // 刷新间隔（毫秒）
  refreshInterval: {
    type: Number,
    default: 30000 // 默认30秒刷新一次
  },
  // 是否自动启动刷新
  autoRefresh: {
    type: Boolean,
    default: true
  },
  // 自定义指标图标配置
  metricIcons: {
    type: Object,
    default: () => ({
      todayLogin: 'icon-jinri1',
      weeklyNew: 'icon-benzhouremen-',
      banned: 'icon-user-locking'
    })
  },
  // 自定义卡片图标配置
  cardIcons: {
    type: Object,
    default: () => ({
      totalUsers: 'icon-pingtaiyonghuzongshu',
      monthlyNew: 'icon-benzhouxinzengtishishuliang',
      vipUsers: 'icon-17003',
      activeRatio: 'icon-huoyueyonghu'
    })
  }
});

// 发出事件
const emit = defineEmits(['data-updated', 'refresh-error']);

// 统计数据
const stats = ref({
  todayLoginUsers: 0,
  newUsersThisWeek: 0,
  bannedUsers: 0,
  totalUsers: 0,
  newUsersThisMonth: 0,
  vipUsers: 0,
  activeUserRatio: 0,
  totalUserGrowth: 0,
  newUserGrowth: 0,
  vipUserGrowth: 0,
  activeGrowth: 0
});

// 头部指标数据
const userHeaderMetrics = ref([
  {
    icon: () => h(IconFont, { type: props.metricIcons.todayLogin }),
    label: '今日登录',
    value: 0
  },
  {
    icon: () => h(IconFont, { type: props.metricIcons.weeklyNew }),
    label: '本周新增',
    value: 0
  },
  {
    icon: () => h(IconFont, { type: props.metricIcons.banned }),
    label: '禁用账户',
    value: 0
  }
]);

// 统计卡片数据
const userStatCards = ref([
  {
    title: '注册用户总数',
    value: 0,
    change: 0,
    color: 'purple',
    icon: () => h(IconFont, { type: props.cardIcons.totalUsers })
  },
  {
    title: '本月新增用户',
    value: 0,
    change: 0,
    color: 'blue',
    icon: () => h(IconFont, { type: props.cardIcons.monthlyNew })
  },
  {
    title: 'VIP用户总数',
    value: 0,
    change: 0,
    color: 'gold',
    icon: () => h(IconFont, { type: props.cardIcons.vipUsers })
  },
  {
    title: '活跃用户比例',
    value: '0%',
    change: 0,
    color: 'green',
    icon: () => h(IconFont, { type: props.cardIcons.activeRatio })
  }
]);

// 定时器引用
let refreshTimer = null;

// 更新统计指标
const updateMetrics = () => {
  userHeaderMetrics.value[0].value = stats.value.todayLoginUsers || 0;
  userHeaderMetrics.value[1].value = stats.value.newUsersThisWeek || 0;
  userHeaderMetrics.value[2].value = stats.value.bannedUsers || 0;
};

// 更新卡片数据
const updateCards = () => {
  userStatCards.value[0].value = stats.value.totalUsers || 0;
  userStatCards.value[0].change = stats.value.totalUserGrowth || 0;

  userStatCards.value[1].value = stats.value.newUsersThisMonth || 0;
  userStatCards.value[1].change = stats.value.newUserGrowth || 0;

  userStatCards.value[2].value = stats.value.vipUsers || 0;
  userStatCards.value[2].change = stats.value.vipUserGrowth || 0;

  userStatCards.value[3].value = `${stats.value.activeUserRatio || 0}%`;
  userStatCards.value[3].change = stats.value.activeGrowth || 0;
};

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await getUserStatisticsUsingGet();
    if (response.data && response.data.data) {
      // 更新统计数据
      stats.value = response.data.data;

      // 更新展示组件
      updateMetrics();
      updateCards();

      // 发出数据更新事件
      emit('data-updated', stats.value);
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    emit('refresh-error', error);
  }
};

// 开始定时刷新
const startRefresh = () => {
  // 清除可能存在的定时器
  stopRefresh();

  // 立即获取一次数据
  fetchStatistics();

  // 设置定时器
  refreshTimer = setInterval(() => {
    fetchStatistics();
  }, props.refreshInterval);
};

// 停止定时刷新
const stopRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 手动刷新方法（可以暴露给父组件使用）
const refresh = () => {
  fetchStatistics();
};

// 监听刷新间隔变化
watch(() => props.refreshInterval, () => {
  // 如果定时器存在则重启
  if (refreshTimer) {
    startRefresh();
  }
});

// 组件挂载时初始化
onMounted(() => {
  if (props.autoRefresh) {
    startRefresh();
  } else {
    // 即使不自动刷新，也获取一次初始数据
    fetchStatistics();
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  stopRefresh();
});

// 暴露方法给父组件
defineExpose({
  refresh,
  startRefresh,
  stopRefresh
});
</script>

<style scoped>
.real-time-stats-container {
  width: 100%;
}
</style>