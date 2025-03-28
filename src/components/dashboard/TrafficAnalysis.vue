// components/dashboard/TrafficAnalysis.vue
<template>
  <a-card
      class="traffic-analysis-card"
      :bordered="false"
      title="流量来源分析"
  >
    <!-- 修复卡片右上角内容 -->
    <template #extra>
      <a href="javascript:void(0);" class="extra-link">查看详细</a>
    </template>

    <div class="chart-container" ref="chartRef"></div>

    <div class="metrics">
      <div
          v-for="source in trafficSources"
          :key="source.name"
          class="metric-item"
          :class="{ 'active': activeSource === source.name }"
          @mouseenter="setActiveSource(source.name)"
          @mouseleave="setActiveSource(null)"
      >
        <div class="metric-header">
          <div class="metric-name">{{ source.name }}</div>
          <div class="metric-value">{{ source.percent }}%</div>
        </div>
        <a-progress
            :percent="source.percent"
            :showInfo="false"
            :strokeColor="source.color"
            size="small"
        />
      </div>
    </div>

    <div class="card-footer">
      <a-button type="link" class="view-more-btn">
        查看详细分析报告
        <RightOutlined />
      </a-button>
    </div>
  </a-card>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue';
import { RightOutlined } from '@ant-design/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

const chartRef = ref(null);
const chart = shallowRef(null);
const activeSource = ref(null);

// 流量来源数据
const trafficSources = ref([
  { name: '直接访问', value: 42, percent: 42, color: '#6151e6' },
  { name: '搜索引擎', value: 28, percent: 28, color: '#13c2c2' },
  { name: '社交媒体', value: 18, percent: 18, color: '#1890ff' },
  { name: '外部链接', value: 12, percent: 12, color: '#fa8c16' }
]);

// 设置活跃的来源
const setActiveSource = (name) => {
  activeSource.value = name;
  updateChartHighlight();
};

// 更新图表高亮
const updateChartHighlight = () => {
  if (!chart.value) return;

  let seriesData = trafficSources.value.map(item => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color,
      opacity: activeSource.value ? (activeSource.value === item.name ? 1 : 0.5) : 1
    }
  }));

  chart.value.setOption({
    series: [{
      data: seriesData
    }]
  });
};

// 初始化图表
const initChart = () => {
  if (chart.value) {
    chart.value.dispose();
  }

  chart.value = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '流量来源',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: trafficSources.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  };

  chart.value.setOption(option);

  // 为图表添加鼠标悬停事件
  chart.value.on('mouseover', { seriesIndex: 0 }, (params) => {
    setActiveSource(params.name);
  });

  chart.value.on('mouseout', { seriesIndex: 0 }, () => {
    setActiveSource(null);
  });

  window.addEventListener('resize', () => {
    chart.value && chart.value.resize();
  });
};

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 组件销毁前清理
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.dispose();
  }
});
</script>

<style scoped>
.traffic-analysis-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.extra-link {
  color: #6151e6;
  font-size: 14px;
}

.chart-container {
  height: 240px;
  width: 100%;
}

.metrics {
  margin-top: 16px;
}

.metric-item {
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.metric-item:hover, .metric-item.active {
  background-color: rgba(0, 0, 0, 0.025);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.metric-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.metric-value {
  font-weight: 500;
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
</style>