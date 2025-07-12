<template>
  <div class="w-full py-0">
    <div
      class="relative bg-white/5 rounded-lg md:rounded-2xl p-0.5 sm:p-1 md:p-4 shadow-xl backdrop-blur-sm border border-white/10"
      ref="chartContainer"
      style="width: 100%; height: calc(100vw * 0.75); min-height: 250px; max-height: 600px;"
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
    chartInstance = echarts.init(chartContainer.value, null, {
      renderer: 'canvas',
      useDirtyRect: true,
      devicePixelRatio: window.devicePixelRatio
    });
    console.log('ECharts instance created with responsive settings');
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

  // Detect if we're on a mobile device
  const isMobile = window.innerWidth < 768;
  
  const option = {
    title: { 
      text: 'Quantum Computer Timeline', 
      left: 'center',
      top: isMobile ? 10 : 20, // Less padding on mobile
      textStyle: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: isMobile ? 16 : 22 // Smaller font on mobile
      } 
    },
    tooltip: {
      show: false  // Disable built-in tooltip to use our custom tooltip system
    },
    grid: { 
      left: '5%', 
      right: '3%', 
      top: isMobile ? 40 : 80,
      bottom: isMobile ? 40 : 80,
      containLabel: true,
      height: isMobile ? '92%' : '85%' // Even more height utilization on mobile
    },
    xAxis: {
      type: 'time', // Back to time type for correct data positioning
      name: '',
      nameLocation: 'middle',
      nameGap: isMobile ? 15 : 30,
      nameTextStyle: { 
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: isMobile ? 8 : 12
      },
      min: startOfAxis,
      max: endOfAxis,
      minInterval: 3600 * 24 * 365 * 1000, // Ensure minimum interval is one year
      maxInterval: 3600 * 24 * 365 * 1000, // Ensure maximum interval is one year
      splitNumber: isMobile ? Math.min(5, maxYear - minYear + 1) : maxYear - minYear + 1, // Fewer splits on mobile
      boundaryGap: isMobile ? ['3%', '3%'] : ['5%', '5%'], // Less padding on mobile
      axisLabel: { 
        color: '#fff',
        fontSize: isMobile ? 9 : 12,
        formatter: (value) => {
          return echarts.time.format(value, '{yyyy}');
        },
        interval: (index, value) => {
          // On mobile, we might want to show fewer year labels
          if (isMobile) {
            const date = new Date(value);
            const year = date.getFullYear();
            // Only show every other year on mobile if we have many years
            if ((maxYear - minYear) > 10) {
              return date.getMonth() === 0 && date.getDate() === 1 && year % 2 === 0;
            }
          }
          // Default behavior for desktop or if we don't have many years
          const date = new Date(value);
          return date.getMonth() === 0 && date.getDate() === 1;
        },
        align: 'center',
        rotate: isMobile ? 45 : 0 // Rotate labels on mobile to save space
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
      nameGap: isMobile ? 25 : 50,
      nameTextStyle: { 
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: isMobile ? 8 : 12
      },
      min: Math.max(1, minQubitCount * 0.8), // Ensure minimum is at least 1 for log scale
      max: maxQubitCount * 1.2, // Add 20% padding at the top
      logBase: 10, // Base-10 logarithmic scale
      axisLabel: { 
        color: '#fff',
        fontSize: isMobile ? 9 : 12,
        margin: isMobile ? 2 : 8, // Less margin on mobile
        formatter: (value) => {
          // On mobile, simplify large numbers
          if (isMobile && value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
          }
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
          symbolSize: isMobile ? 10 : 18, // Much smaller on mobile
          itemStyle: {
            color: style.color,
            borderColor: '#fff',
            borderWidth: isMobile ? 0.5 : 2, // Minimal border on mobile
            shadowBlur: isMobile ? 3 : 10, // Minimal blur on mobile
            shadowColor: 'rgba(0,0,0,0.4)'
          },
          qpuData: qpu,
          label: {
            // On mobile with any data points, we need to be more aggressive about hiding labels
            show: isMobile 
              ? (chartData.length > 15 ? index % 4 === 0 : index % 2 === 0) // Show fewer labels on mobile
              : true,
            position: 'top',
            formatter: isMobile
              ? (qpu.name.length > 8 ? qpu.name.substring(0, 5) + '...' : qpu.name) // Even shorter names on mobile
              : qpu.name,
            color: '#fff',
            fontSize: isMobile ? 7 : 10,
            fontWeight: 'bold',
            distance: isMobile ? 2 : 6,
            backgroundColor: 'rgba(0,0,0,0.5)', // More transparent background
            borderColor: style.color,
            borderWidth: isMobile ? 0 : 1, // No border on mobile
            borderRadius: isMobile ? 1 : 3,
            padding: isMobile ? [0, 2] : [2, 5], // Minimal padding on mobile
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowBlur: isMobile ? 0 : 2, // No blur on mobile
            textShadowOffsetX: 0,
            textShadowOffsetY: 0
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
      // Initial check for mobile view
      if (window.innerWidth < 768) {
        console.log('Mobile device detected, applying mobile optimizations');
        updateChartForMobile();
      }
    }, 500);
  });
  
  // Enhanced resize handler with debouncing for better performance
  let resizeTimeout;
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (chartInstance) {
        const isMobileView = window.innerWidth < 768;
        console.log('Window resized. Width:', window.innerWidth, 'Mobile view:', isMobileView ? 'yes' : 'no');
        
        // Always resize first
        chartInstance.resize();
        
        // Apply mobile optimizations if needed, or restore desktop view
        if (isMobileView) {
          updateChartForMobile();
        } else {
          // If switching back to desktop from mobile, re-render the chart completely
          renderChart();
        }
      }
    }, 250); // Debounce resize events
  };
  
  window.addEventListener('resize', handleResize);
});

// Function to optimize chart for mobile view
const updateChartForMobile = () => {
  if (!chartInstance) return;
  
  const currentOption = chartInstance.getOption();
  
  // Get the current data for better decisions
  const chartData = getChartData();
  const dataDensity = chartData.length;
  
  // Check if we're on a very small device (phone vs tablet)
  const isVerySmallScreen = window.innerWidth < 480;
  
  // Mobile-specific modifications
  const mobileOptions = {
    title: {
      text: isVerySmallScreen ? 'QPU Timeline' : 'Quantum Computer Timeline', // Even shorter title on very small screens
      top: isVerySmallScreen ? 5 : 10,
      textStyle: { fontSize: isVerySmallScreen ? 14 : 16 }
    },
    grid: {
      left: isVerySmallScreen ? '1%' : (dataDensity > 20 ? '3%' : '2%'), // Extremely minimal margins on very small screens
      right: isVerySmallScreen ? '1%' : '2%',
      top: isVerySmallScreen ? '8%' : '10%',
      bottom: isVerySmallScreen ? '8%' : '10%',
      containLabel: true
    },
    xAxis: {
      nameGap: 12,
      nameTextStyle: { fontSize: 8 },
      boundaryGap: ['1%', '1%'],
      axisLabel: {
        fontSize: 8,
        rotate: 45,
        margin: 4,
        interval: function(index, value) {
          const date = new Date(value);
          const year = date.getFullYear();
          // If we have many years, only show every other year or every third year
          if ((dataDensity > 30) && date.getMonth() === 0 && date.getDate() === 1) {
            return year % 3 === 0;
          }
          if ((dataDensity > 15) && date.getMonth() === 0 && date.getDate() === 1) {
            return year % 2 === 0;
          }
          return date.getMonth() === 0 && date.getDate() === 1;
        }
      },
      // Thinner lines to save space
      axisTick: { lineStyle: { width: 0.5 } },
      axisLine: { lineStyle: { width: 0.5 } },
      splitLine: { lineStyle: { width: 0.5 } }
    },
    yAxis: {
      nameGap: 20,
      nameTextStyle: { fontSize: 8 },
      axisLabel: {
        fontSize: 8,
        margin: 1,
        formatter: (value) => {
          if (value >= 1000) return (value/1000) + 'K';
          return value;
        }
      },
      // Thinner lines to save space
      axisTick: { lineStyle: { width: 0.5 } },
      axisLine: { lineStyle: { width: 0.5 } },
      splitLine: { lineStyle: { width: 0.5 } }
    }
  };
  
  chartInstance.setOption(mobileOptions, {notMerge: false, lazyUpdate: true});
};

onBeforeUnmount(() => {
  // Remove event listeners
  window.removeEventListener('resize', handleResize);
  
  if (chartInstance) {
    // Clean up all chart events
    chartInstance.off('mouseover');
    chartInstance.off('globalout');
    chartInstance.dispose();
    chartInstance = null;
  }
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
