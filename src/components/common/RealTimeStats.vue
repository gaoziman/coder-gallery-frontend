<template>
  <div class="real-time-stats-container">
    <DashboardHeader
        :title="headerConfig.title"
        :description="headerConfig.description"
        :parent-module="headerConfig.parentModule"
        :icon-type="headerConfig.iconType"
        :metrics="headerMetrics"
    />
    <StatCards :cards="statCards" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import DashboardHeader from "@/components/common/DashboardHeader.vue";
import StatCards from "@/components/common/StatCards.vue";
import { h } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

const props = defineProps({
  // 页面标题配置
  headerConfig: {
    type: Object,
    required: true,
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
  // 数据源类型 - 用于确定使用哪个API获取数据
  dataSourceType: {
    type: String,
    default: 'user',
    validator: (value) => ['user', 'category', 'tag', 'picture'].includes(value)
  },
  // 自定义指标图标配置
  metricIcons: {
    type: Object,
    default: () => ({})
  },
  // 自定义卡片图标配置
  cardIcons: {
    type: Object,
    default: () => ({})
  }
});

// 发出事件
const emit = defineEmits(['data-updated', 'refresh-error']);

// 统一的API引入
import {getUserStatisticsUsingGet} from "@/api/yonghuguanli.js";
import {getCategoryStatisticsUsingGet} from "@/api/fenleiguanli.js";
import { getTagStatisticsUsingGet } from "@/api/biaoqianguanli.js";
import {getPictureStatisticsUsingGet} from "@/api/tupianhoutaiguanlijiekou.js";

// 存储统计数据的响应式对象
const statsData = ref({});

// 头部指标和卡片数据的默认配置
const defaultConfigs = {
  user: {
    headerMetrics: [
      {
        iconType: 'icon-jinri1',
        label: '今日登录',
        key: 'todayLoginUsers'
      },
      {
        iconType: 'icon-benzhouremen-',
        label: '本周新增',
        key: 'newUsersThisWeek'
      },
      {
        iconType: 'icon-user-locking',
        label: '禁用账户',
        key: 'bannedUsers'
      }
    ],
    cardConfigs: [
      {
        title: '注册用户总数',
        key: 'totalUsers',
        changeKey: 'totalUserGrowth',
        color: 'purple',
        iconType: 'icon-pingtaiyonghuzongshu'
      },
      {
        title: '本月新增用户',
        key: 'newUsersThisMonth',
        changeKey: 'newUserGrowth',
        color: 'blue',
        iconType: 'icon-benzhouxinzengtishishuliang'
      },
      {
        title: 'VIP用户总数',
        key: 'vipUsers',
        changeKey: 'vipUserGrowth',
        color: 'gold',
        iconType: 'icon-17003'
      },
      {
        title: '活跃用户比例',
        key: 'activeUserRatio',
        changeKey: 'activeGrowth',
        suffix: '%',
        color: 'green',
        iconType: 'icon-huoyueyonghu'
      }
    ]
  },
  category: {
    headerMetrics: [
      {
        iconType: 'icon-jinri1',
        label: '今日新增',
        key: 'newCategoriesOfToday'
      },
      {
        iconType: '分类总数-fenlei-',
        label: '总分类数',
        key: 'totalCategories'
      },
      {
        iconType: 'icon-tupian2',
        label: '使用图片分类数',
        key: 'totalItems'
      }
    ],
    cardConfigs: [
      {
        title: '本月新增',
        key: 'newCategoriesOfMonth',
        changeKey: 'categoryGrowthRate',
        color: 'purple',
        iconType: 'icon-fenlei'
      },
      {
        title: '本周新增',
        key: 'newCategoriesOfWeek',
        changeKey: 'newCategoryGrowthRate',
        color: 'blue',
        iconType: 'icon-benyue'
      },
      {
        title: '顶级分类',
        key: 'topLevelCategories',
        changeKey: 'categoryGrowthRate',
        color: 'green',
        iconType: 'icon-dingjijiedian'
      },
      {
        title: '空分类',
        key: 'emptyCategoriesCount',
        computeValue: (data) => data.disabledCategories ||
            (data.totalCategories - data.activeCategories) || 0,
        changeKey: null,
        color: 'gold',
        iconType: 'icon-kongkong1'
      }
    ]
  },
  tag: {
    headerMetrics: [
      {
        iconType: 'icon-jinri1',
        label: '今日新增',
        key: 'todayCount'
      },
      {
        iconType: 'icon-biaoqian1',
        label: '标签总数',
        key: 'weekCount'
      },
      {
        iconType: 'icon-jinyong-disable',
        label: '禁用标签',
        key: 'unusedTag'
      }
    ],
    cardConfigs: [
      {
        title: '本月新增',
        key: 'totalCount',
        changeKey: 'monthGrowthRate',
        color: 'purple',
        iconType: 'icon-round_yue_fill'
      },
      {
        title: '本周新增',
        key: 'monthCount',
        changeKey: 'weekGrowthRate',
        color: 'blue',
        iconType: 'icon-benzhou2'
      },
      {
        title: '引用总数',
        key: 'totalReferenceCount',
        changeKey: 'referenceCountGrowthRate',
        color: 'green',
        iconType: 'icon-tubiaohuizong2_chakanguahaoxieyi'
      },
      {
        title: '未使用标签',
        key: 'unusedTag',
        changeKey: 'unusedTagGrowthRate',
        color: 'gold',
        iconType: 'icon-biaoqian6'
      }
    ]
  },
  picture: {
    headerMetrics: [
      {
        iconType: 'icon-jinri1',
        label: '今日上传',
        key: 'todayUploadCount'
      },
      {
        iconType: 'icon-shengchengxiangsitupian',
        label: '图片总数',
        key: 'totalCount'
      },
      {
        iconType: 'icon-shenhezhuangtai-tijiaoshenhe',
        label: '待审核',
        key: 'pendingReviewCount'
      }
    ],
    cardConfigs: [
      {
        title: '本月上传',
        key: 'monthUploadCount',
        changeKey: 'monthUploadGrowthRate',
        color: 'purple',
        iconType: 'icon-round_yue_fill'
      },
      {
        title: '本周上传',
        key: 'weekUploadCount',
        changeKey: 'weekUploadGrowthRate',
        color: 'blue',
        iconType: 'icon-benzhou2'
      },
      {
        title: '浏览量',
        key: 'totalViewCount',
        changeKey: 'viewCountGrowthRate',
        color: 'green',
        iconType: 'icon-liulanliang'
      },
      {
        title: '点赞量',
        key: 'totalLikeCount',
        changeKey: 'likeCountGrowthRate',
        color: 'gold',
        iconType: 'icon-dianzan'
      }
    ]
  }
};

// 合并用户提供的图标配置和默认配置
const getUpdatedConfig = (type) => {
  // 深拷贝默认配置以避免修改原始对象
  const config = JSON.parse(JSON.stringify(defaultConfigs[type]));

  // 更新指标图标
  if (props.metricIcons) {
    config.headerMetrics.forEach(metric => {
      if (props.metricIcons[metric.key]) {
        metric.iconType = props.metricIcons[metric.key];
      }
    });
  }

  // 更新卡片图标
  if (props.cardIcons) {
    config.cardConfigs.forEach(card => {
      if (props.cardIcons[card.key]) {
        card.iconType = props.cardIcons[card.key];
      }
    });
  }

  return config;
};

// 根据配置生成响应式的头部指标数据
const headerMetrics = ref([]);

// 根据配置生成响应式的卡片数据
const statCards = ref([]);

// 更新头部指标数据
const updateHeaderMetrics = (config, data) => {
  headerMetrics.value = config.headerMetrics.map(metric => ({
    icon: () => h(IconFont, {type: metric.iconType}),
    label: metric.label,
    value: metric.key && data[metric.key] !== undefined ? data[metric.key] : 0
  }));
};

// 更新卡片数据
const updateStatCards = (config, data) => {
  statCards.value = config.cardConfigs.map(card => {
    let value;
    if (card.computeValue) {
      // 使用计算函数获取值
      value = card.computeValue(data);
    } else {
      // 直接从数据中获取值
      value = card.key && data[card.key] !== undefined ? data[card.key] : 0;
    }

    // 如果有后缀，添加后缀
    if (card.suffix) {
      value = `${value}${card.suffix}`;
    }

    return {
      title: card.title,
      value: value,
      change: card.changeKey && data[card.changeKey] !== undefined ? data[card.changeKey] : 0,
      color: card.color,
      icon: () => h(IconFont, {type: card.iconType})
    };
  });
};

// 获取统计数据
const fetchStatistics = async () => {
  try {
    let response;

    // 根据数据源类型调用不同的API
    if (props.dataSourceType === 'user') {
      response = await getUserStatisticsUsingGet();
    } else if (props.dataSourceType === 'category') {
      response = await getCategoryStatisticsUsingGet();
    }else if (props.dataSourceType === 'tag') {
      response = await getTagStatisticsUsingGet();
    }else if (props.dataSourceType === 'picture') {
      response = await getPictureStatisticsUsingGet();
    }  else {
      throw new Error(`不支持的数据源类型: ${props.dataSourceType}`);
    }

    // 处理响应数据
    if (response.data) {
      let responseData;

      // 用户API和分类API可能有不同的响应结构
      if (props.dataSourceType === 'user') {
        responseData = response.data.data;
      } else if (['category', 'tag', 'picture'].includes(props.dataSourceType)) {
        responseData = response.data.code === 200 ? response.data.data : null;
      }

      if (responseData) {
        // 更新数据
        statsData.value = responseData;

        // 获取当前数据类型的配置
        const currentConfig = getUpdatedConfig(props.dataSourceType);

        // 更新指标和卡片
        updateHeaderMetrics(currentConfig, responseData);
        updateStatCards(currentConfig, responseData);

        // 发出数据更新事件
        emit('data-updated', responseData);
      }
    }
  } catch (error) {
    console.error(`获取${props.dataSourceType}统计数据失败:`, error);
    emit('refresh-error', error);
  }
};

// 定时器引用
let refreshTimer = null;

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

// 监听数据源类型变化
watch(() => props.dataSourceType, () => {
  // 清空现有数据
  statsData.value = {};
  // 重新获取数据
  if (refreshTimer) {
    startRefresh();
  } else {
    fetchStatistics();
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