<template>
  <div class="w-full py-2">
    <div
      class="relative bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10"
      ref="chartContainer"
      style="width: 100%; height: 520px; min-height: 440px;"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const emit = defineEmits(['point-hover', 'mouseleave']);
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const chartContainer = ref(null);
let chartInstance = null;

const getOrganizationStyle = (organization) => {
  const palette = [
    { color: '#42b883', symbol: 'circle' },     // Google - circle
    { color: '#ff9800', symbol: 'rect' },       // IBM - square
    { color: '#2196f3', symbol: 'triangle' },   // USTC - triangle
    { color: '#e91e63', symbol: 'diamond' },    // Additional organizations
    { color: '#9c27b0', symbol: 'pin' },
    { color: '#4caf50', symbol: 'arrow' },
    { color: '#f44336', symbol: 'circle' },
    { color: '#607d8b', symbol: 'rect' },
    { color: '#00bcd4', symbol: 'triangle' },
    { color: '#ffc107', symbol: 'diamond' }
  ];
  // Still use 'organization' as the field name since that's what exists in the data
  const organizations = [...new Set(props.data.map(qpu => qpu.organization))];
  const idx = organizations.indexOf(organization);
  return palette[idx % palette.length];
};

const getChartData = () => {
  if (!props.data || props.data.length === 0) return [];
  
  return props.data
    .filter(qpu => {
      const hasDate = qpu.releaseDate && !isNaN(Date.parse(qpu.releaseDate));
      const hasQubit = !isNaN(Number(qpu.qubitCount));
      console.log('QPU:', qpu.name, 'hasDate:', hasDate, 'hasQubit:', hasQubit, 'date:', qpu.releaseDate, 'qubits:', qpu.qubitCount);
      return hasDate && hasQubit;
    })
    .map(qpu => {
      const timestamp = new Date(qpu.releaseDate).getTime();
      const qubits = Number(qpu.qubitCount);
      console.log('Mapping QPU:', qpu.name, 'timestamp:', timestamp, 'qubits:', qubits);
      return [timestamp, qubits, qpu.organization, qpu];
    });
};

const renderChart = () => {
  console.log('renderChart called, container:', chartContainer.value, 'data length:', props.data?.length);
  
  if (!chartContainer.value) {
    console.log('No chart container');
    return;
  }
  
  // Check if container has dimensions
  const containerRect = chartContainer.value.getBoundingClientRect();
  console.log('Container dimensions:', containerRect.width, 'x', containerRect.height);
  
  if (containerRect.width === 0 || containerRect.height === 0) {
    console.log('Container has no dimensions, retrying in 500ms');
    setTimeout(renderChart, 500);
    return;
  }
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
    console.log('ECharts instance created');
  }
  
  if (!props.data || props.data.length === 0) {
    console.log('No data available, data:', props.data);
    return;
  }
  
  const chartData = getChartData();
  console.log('Chart data:', chartData);
  
  if (chartData.length === 0) {
    console.log('No valid chart data after filtering');
    chartInstance.clear();
    return;
  }

  // Calculate min and max years from the data for proper axis bounds
  const timestamps = chartData.map(item => item[0]);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const minYear = new Date(minTimestamp).getFullYear();
  const maxYear = new Date(maxTimestamp).getFullYear();
  
  // Create year boundaries for the axis
  const startOfAxis = new Date(minYear, 0, 1).getTime();
  const endOfAxis = new Date(maxYear + 1, 0, 1).getTime();

  const option = {
    title: { 
      text: 'Quantum Computer Timeline', 
      left: 'center',
      top: 20, // Add specific top padding for the title
      textStyle: { color: '#fff', fontWeight: 'bold', fontSize: 22 } 
    },
    tooltip: {
      show: false  // Disable built-in tooltip to use our custom tooltip system
    },
    grid: { 
      left: 100, 
      right: 60, 
      top: 100, // Increased top padding from 80 to 100
      bottom: 100,
      containLabel: true
    },
    xAxis: {
      type: 'time', // Back to time type for correct data positioning
      name: 'Release Date',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#fff', fontWeight: 'bold' },
      min: startOfAxis,
      max: endOfAxis,
      minInterval: 3600 * 24 * 365 * 1000, // Ensure minimum interval is one year
      maxInterval: 3600 * 24 * 365 * 1000, // Ensure maximum interval is one year
      splitNumber: maxYear - minYear + 1, // Force exactly one split per year
      boundaryGap: ['5%', '5%'], // Add padding to the axis
      axisLabel: { 
        color: '#fff',
        formatter: (value) => {
          return echarts.time.format(value, '{yyyy}');
        },
        interval: (index, value) => {
          // Only show labels at the start of each year
          const date = new Date(value);
          return date.getMonth() === 0 && date.getDate() === 1;
        },
        align: 'center'
      },
      axisTick: { 
        lineStyle: { color: '#fff' },
        interval: (index, value) => {
          // Only show ticks at the start of each year
          const date = new Date(value);
          return date.getMonth() === 0 && date.getDate() === 1;
        }
      },
      splitLine: { 
        show: true,
        lineStyle: { 
          color: 'rgba(255, 255, 255, 0.1)', // Lighter grid lines
          width: 0.5 // Thinner grid lines
        }
      },
      axisLine: { lineStyle: { color: '#fff' } }
    },
    yAxis: {
      type: 'value',
      name: 'Qubit Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { color: '#fff', fontWeight: 'bold' },
      axisLabel: { color: '#fff' },
      splitLine: { 
        lineStyle: { 
          color: 'rgba(255, 255, 255, 0.1)', // Lighter grid lines
          width: 0.5 // Thinner grid lines
        } 
      },
      axisLine: { lineStyle: { color: '#fff' } },
      axisTick: { lineStyle: { color: '#fff' } }
    },
    series: [{
      type: 'scatter',
      data: chartData.map((item, index) => {
        const qpu = item[3];
        const style = getOrganizationStyle(qpu.organization);
        return {
          value: [item[0], item[1]], // Now correctly interpreted as [time, value]
          symbol: style.symbol,
          symbolSize: 24,
          itemStyle: {
            color: style.color,
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: 'rgba(0,0,0,0.4)'
          },
          qpuData: qpu,
          label: {
            show: true,
            position: 'top',
            formatter: qpu.name,
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            distance: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderColor: style.color,
            borderWidth: 1,
            borderRadius: 4,
            padding: [2, 6],
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1
          }
        };
      }),
      emphasis: {
        scale: 1.3,  // More subtle scaling
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(255,255,255,0.4)',
          borderWidth: 4
        },
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    }],
    backgroundColor: 'transparent'
  };
  
  console.log('Setting chart option:', option);
  chartInstance.setOption(option, true);
  chartInstance.resize();
  
  chartInstance.off('mouseover');
  chartInstance.off('globalout');
  
  chartInstance.on('mouseover', (params) => {
    if (params.componentType === 'series') {
      emit('point-hover', params.data.qpuData, params.event.event);
    }
  });
  
  chartInstance.on('globalout', () => {
    emit('mouseleave');
  });
};

onMounted(() => {
  console.log('Component mounted, data:', props.data);
  // Wait for DOM to be fully rendered and Tailwind styles applied
  nextTick(() => {
    setTimeout(() => {
      renderChart();
    }, 500);
  });
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', renderChart);
});

watch(() => props.data, (newData) => {
  console.log('Data changed:', newData);
  nextTick(() => renderChart());
}, { deep: true });
</script>
