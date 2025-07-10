<template>
  <div class="w-full py-2">
    <div
      class="relative bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10"
      ref="chartContainer"
      style="width: 100%; height: 600px; min-height: 500px;"
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
  },
  organizationStyles: {
    type: Array,
    default: () => []
  },
  visibleOrganizations: {
    type: Set,
    default: () => new Set()
  }
});

const chartContainer = ref(null);
let chartInstance = null;

const getOrganizationStyle = (organization) => {
  // Use the organizationStyles passed from the parent component
  if (props.organizationStyles && props.organizationStyles.length > 0) {
    const style = props.organizationStyles.find(s => s.name === organization);
    if (style) {
      return { color: style.color, symbol: style.symbol };
    }
  }
  
  // Fallback to default palette if no matching style is found
  const defaultPalette = [
    { color: '#42b883', symbol: 'circle' },
    { color: '#ff9800', symbol: 'rect' },
    { color: '#2196f3', symbol: 'triangle' },
    { color: '#e91e63', symbol: 'diamond' }
  ];
  
  const organizations = [...new Set(props.data.map(qpu => qpu.organization))];
  const idx = organizations.indexOf(organization);
  return defaultPalette[idx % defaultPalette.length];
};

const getChartData = () => {
  if (!props.data || props.data.length === 0) return [];
  
  return props.data
    .filter(qpu => {
      const hasDate = qpu.releaseDate && !isNaN(Date.parse(qpu.releaseDate));
      const hasQubit = !isNaN(Number(qpu.qubitCount));
      const isVisible = props.visibleOrganizations.has(qpu.organization);
      console.log('QPU:', qpu.name, 'hasDate:', hasDate, 'hasQubit:', hasQubit, 'isVisible:', isVisible);
      return hasDate && hasQubit && isVisible;
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
  const qubitCounts = chartData.map(item => item[1]);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const minYear = new Date(minTimestamp).getFullYear();
  const maxYear = new Date(maxTimestamp).getFullYear();
  
  // Create year boundaries for the axis
  const startOfAxis = new Date(minYear, 0, 1).getTime();
  const endOfAxis = new Date(maxYear + 1, 0, 1).getTime();
  
  // Calculate min and max qubit counts for y-axis
  const minQubitCount = Math.min(...qubitCounts);
  const maxQubitCount = Math.max(...qubitCounts);

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
      top: 80, // Reduced top padding to increase chart area
      bottom: 80, // Reduced bottom padding to increase chart area
      containLabel: true,
      height: '85%' // Increased height to utilize larger chart container
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
      type: 'log', // Changed from 'value' to 'log' for logarithmic scale
      name: 'Qubit Count (log scale)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { color: '#fff', fontWeight: 'bold' },
      min: Math.max(1, minQubitCount * 0.8), // Ensure minimum is at least 1 for log scale
      max: maxQubitCount * 1.2, // Add 20% padding at the top
      logBase: 10, // Base-10 logarithmic scale
      axisLabel: { 
        color: '#fff',
        formatter: (value) => {
          // Format as integer without decimal places
          return Math.round(value).toString();
        }
      },
      minorTick: {
        show: true
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
          width: 0.5
        }
      },
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
          symbolSize: 18, // Reduced from 24 to 18 for smaller data points
          itemStyle: {
            color: style.color,
            borderColor: '#fff',
            borderWidth: 2, // Reduced from 3 to 2 for proportionate border
            shadowBlur: 10, // Reduced from 15 to 10 for proportionate shadow
            shadowColor: 'rgba(0,0,0,0.4)'
          },
          qpuData: qpu,
          label: {
            show: true,
            position: 'top',
            formatter: qpu.name,
            color: '#fff',
            fontSize: 10, // Slightly reduced font size
            fontWeight: 'bold',
            distance: 6,  // Reduced distance to match smaller points
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderColor: style.color,
            borderWidth: 1,
            borderRadius: 3, // Slightly smaller radius
            padding: [2, 5], // Slightly smaller padding
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
          shadowBlur: 15, // Reduced from 20 to 15 to match the smaller point size
          shadowColor: 'rgba(255,255,255,0.4)',
          borderWidth: 3  // Reduced from 4 to 3 to match the smaller point size
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

// Watch for changes in visible organizations
watch(() => props.visibleOrganizations, () => {
  console.log('Visible organizations changed:', [...props.visibleOrganizations]);
  nextTick(() => renderChart());
}, { deep: true });
</script>
