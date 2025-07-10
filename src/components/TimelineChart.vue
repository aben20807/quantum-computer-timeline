<template>
  <div class="w-full px-4 py-6">
    <div
      class="relative border border-gray-300 bg-white/5 rounded-xl shadow-lg mx-auto"
      ref="chartContainer"
      style="width: 100%; max-width: 1400px; height: 500px; min-height: 420px;"
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

const getCompanyStyle = (company) => {
  const palette = [
    { color: '#42b883', symbol: 'circle' },     // Google - circle
    { color: '#ff9800', symbol: 'rect' },       // IBM - square
    { color: '#2196f3', symbol: 'triangle' },   // USTC - triangle
    { color: '#e91e63', symbol: 'diamond' },    // Additional companies
    { color: '#9c27b0', symbol: 'pin' },
    { color: '#4caf50', symbol: 'arrow' },
    { color: '#f44336', symbol: 'circle' },
    { color: '#607d8b', symbol: 'rect' },
    { color: '#00bcd4', symbol: 'triangle' },
    { color: '#ffc107', symbol: 'diamond' }
  ];
  const companies = [...new Set(props.data.map(qpu => qpu.company))];
  const idx = companies.indexOf(company);
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
      return [timestamp, qubits, qpu.company, qpu];
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
  
  const option = {
    title: { 
      text: 'Quantum Computer Timeline', 
      left: 'center', 
      textStyle: { color: '#fff', fontWeight: 'bold', fontSize: 22 } 
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const qpu = params.data.qpuData;
        return `<b>${qpu.name}</b><br/>Company: ${qpu.company}<br/>Release: ${qpu.releaseDate}<br/>Qubits: ${qpu.qubitCount}`;
      }
    },
    grid: { 
      left: 100, 
      right: 60, 
      top: 80, 
      bottom: 100,
      containLabel: true
    },
    xAxis: {
      type: 'time',
      name: 'Release Date',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#fff', fontWeight: 'bold' },
      axisLabel: { 
        color: '#fff',
        formatter: (value) => {
          return echarts.time.format(value, '{yyyy}-{MM}');
        }
      },
      splitLine: { show: false },
      axisLine: { lineStyle: { color: '#fff' } },
      axisTick: { lineStyle: { color: '#fff' } }
    },
    yAxis: {
      type: 'value',
      name: 'Qubit Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { color: '#fff', fontWeight: 'bold' },
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#444' } },
      axisLine: { lineStyle: { color: '#fff' } },
      axisTick: { lineStyle: { color: '#fff' } }
    },
    series: [{
      type: 'scatter',
      data: chartData.map((item, index) => {
        const qpu = item[3];
        const style = getCompanyStyle(qpu.company);
        return {
          value: [item[0], item[1]],
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
        scale: 1.8,
        itemStyle: {
          shadowBlur: 25,
          shadowColor: 'rgba(255,255,255,0.6)',
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
