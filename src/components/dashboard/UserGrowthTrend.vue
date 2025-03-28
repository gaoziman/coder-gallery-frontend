// components/dashboard/UserGrowthTrend.vue
<template>
  <a-card
      :bordered="false"
      class="chart-card"
      title="用户增长趋势"
  >
    <a-radio-group
        v-model:value="period"
        size="small"
        :options="periodOptions"
        button-style="solid"
        class="period-selector"
    />

    <div ref="chartRef" class="chart-container"></div>

    <div class="chart-tooltip" v-if="tooltipVisible" :style="tooltipStyle">
      <div class="tooltip-title">{{ tooltipTitle }}</div>
      <div class="tooltip-item" v-for="(item, index) in tooltipData" :key="index">
        <span
            class="tooltip-marker"
            :style="{ backgroundColor: item.color }"
        ></span>
        <span class="tooltip-name">{{ item.name }}:</span>
        <span class="tooltip-value">{{ item.value }}</span>
      </div>
    </div>

    <!-- 改进的图例区域 -->
    <div class="chart-footer">
      <div class="legend-item">
        <span class="legend-marker current-year"></span>
        <span class="legend-text">2025年用户数</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker last-year"></span>
        <span class="legend-text">2024年用户数</span>
      </div>
    </div>

    <!-- 数据提示浮层 - 调整位置并改善样式 -->
    <div class="data-tooltip" v-if="hoveredMonth">
      <div class="tooltip-month">{{ hoveredMonth }}</div>
      <div class="tooltip-data">
        <div class="tooltip-year">
          <span class="year-label">2025年用户数:</span>
          <span class="year-value">{{ formatNumber(currentYearValue) }}人</span>
        </div>
        <div class="tooltip-year">
          <span class="year-label">2024年用户数:</span>
          <span class="year-value">{{ formatNumber(previousYearValue) }}人</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
]);

const chartRef = ref(null);
const chart = shallowRef(null);
const period = ref('month');
const tooltipVisible = ref(false);
const tooltipStyle = ref({});
const tooltipTitle = ref('');
const tooltipData = ref([]);
const hoveredMonth = ref(null);
const currentYearValue = ref(0);
const previousYearValue = ref(0);

// 周期选择选项
const periodOptions = [
  { label: '月度', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '年度', value: 'year' }
];

// 模拟的月度数据
const monthlyData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  current: [9800, 10200, 10700, 11200, 11800, 12000, 12100, 12300, 12600, 12800, 0, 0],
  previous: [5200, 5500, 6300, 6700, 7200, 7500, 8000, 8200, 8600, 9000, 9500, 9800]
};

// 季度数据
const quarterlyData = {
  xAxis: ['Q1', 'Q2', 'Q3', 'Q4'],
  current: [10700, 12000, 12800, 0],
  previous: [6300, 7500, 9000, 9800]
};

// 年度数据
const yearlyData = {
  xAxis: ['2021', '2022', '2023', '2024', '2025'],
  current: [3200, 5600, 8500, 10800, 12800],
  previous: [1500, 3200, 5600, 8500, 10800]
};

// 初始化图表
const initChart = () => {
  if (chart.value) {
    chart.value.dispose();
  }

  // 创建echarts实例
  chart.value = echarts.init(chartRef.value);

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    chart.value && chart.value.resize();
  });

  // 更新图表数据
  updateChart();

  // 添加鼠标悬停事件
  chart.value.on('mouseover', { seriesIndex: 0 }, (params) => {
    hoveredMonth.value = params.name;
    currentYearValue.value = params.value;
    previousYearValue.value = getDataByIndex(period.value, params.dataIndex, 'previous');
  });

  chart.value.on('mouseout', () => {
    hoveredMonth.value = null;
  });
};

// 根据索引获取数据
const getDataByIndex = (periodType, index, dataType) => {
  let data;
  switch (periodType) {
    case 'quarter':
      data = quarterlyData;
      break;
    case 'year':
      data = yearlyData;
      break;
    default:
      data = monthlyData;
  }
  return data[dataType][index];
};

// 根据选择的时间周期更新图表数据
const updateChart = () => {
  let data;
  switch (period.value) {
    case 'quarter':
      data = quarterlyData;
      break;
    case 'year':
      data = yearlyData;
      break;
    default:
      data = monthlyData;
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', // 增加底部边距，为图例留出空间
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#909399'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#909399',
        formatter: value => formatNumber(value)
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params) => {
        // 自定义提示框内容，可以展示更多信息
        let result = `<div style="font-weight:500;margin-bottom:8px;">${params[0].axisValue}</div>`;
        params.forEach(item => {
          const yearText = item.seriesName === '2025年用户数' ? '2025年' : '2024年';
          result += `<div style="display:flex;align-items:center;margin-bottom:5px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${item.color};margin-right:5px;"></span>
              <span style="flex:1;font-size:12px;color:#666;">${yearText}用户数：</span>
              <span style="font-weight:500;color:#333;">${formatNumber(item.value)}人</span>
            </div>`;
        });
        return result;
      }
    },
    series: [
      {
        name: '2025年用户数',
        type: 'line',
        data: data.current,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: {
          color: '#6151e6'
        },
        lineStyle: {
          width: 3,
          color: '#6151e6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(97, 81, 230, 0.25)'
            },
            {
              offset: 1,
              color: 'rgba(97, 81, 230, 0.05)'
            }
          ])
        }
      },
      {
        name: '2024年用户数',
        type: 'line',
        data: data.previous,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: {
          color: '#b7c0d1'
        },
        lineStyle: {
          width: 2,
          color: '#b7c0d1'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(183, 192, 209, 0.15)'
            },
            {
              offset: 1,
              color: 'rgba(183, 192, 209, 0.05)'
            }
          ])
        }
      }
    ]
  };

  chart.value.setOption(option);
};

// 格式化数字，添加千分位分隔符
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 监听时间周期变化
watch(period, () => {
  if (chart.value) {
    updateChart();
  }
});

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});
</script>

<style scoped>
.chart-card {
  flex: 2;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-right: 12px;
  height: 450px;
  position: relative;
}

/* 自定义单选按钮组样式 */
.period-selector {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 5;
}

:deep(.ant-radio-button-wrapper) {
  border-color: #6151e6;
  color: #6151e6;
}

:deep(.ant-radio-button-wrapper:hover) {
  color: #6151e6;
  border-color: #6151e6;
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  background: #6151e6;
  border-color: #6151e6;
  color: white;
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before) {
  background-color: #6151e6;
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover) {
  background: #7366ea;
  border-color: #7366ea;
  color: white;
}

.chart-container {
  height: 330px; /* 减小高度，为底部图例留出更多空间 */
  width: 100%;
}

.chart-footer {
  display: flex;
  padding: 12px 0;
  justify-content: center;
  margin-top: 8px;
  position: relative;
  z-index: 2;
  background-color: white;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 15px;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}

.current-year {
  background-color: #6151e6;
}

.last-year {
  background-color: #b7c0d1;
}

.chart-tooltip {
  position: absolute;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transition: all 0.3s;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.tooltip-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.tooltip-name {
  flex: 1;
  color: #666;
}

.tooltip-value {
  font-weight: 500;
}

/* 数据提示层样式 */
.data-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  text-align: left;
  z-index: 5;
  border: 1px solid #f0f0f0;
  min-width: 220px;
}

.tooltip-month {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.tooltip-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-year {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.year-label {
  color: #666;
  font-size: 14px;
  margin-right: 12px;
}

.year-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-card {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .legend-text {
    font-size: 12px;
  }
}
</style>