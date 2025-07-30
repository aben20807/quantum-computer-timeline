<template>
  <div class="w-full py-0">
    <div class="relative">
      <div
        class="relative bg-white/5 rounded-lg md:rounded-2xl p-0.5 sm:p-1 md:p-4 shadow-xl backdrop-blur-sm border border-white/10"
        ref="chartContainer"
        style="width: 100%; height: calc(100vw * 0.90); min-height: 320px; max-height: 750px;"
      ></div>
      <!-- Reset Zoom Button -->
      <button
        @click="resetZoom"
        class="absolute top-0 right-0 md:top-0.5 md:right-0.5 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/80 px-2 py-1 md:px-2.5 md:py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200 z-20 flex items-center gap-1 border border-white/10 hover:border-white/20 backdrop-blur-sm text-xs"
        title="Reset Zoom (R)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform duration-200 hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="hidden sm:inline font-normal">Reset</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const emit = defineEmits(['point-hover', 'point-leave', 'mouseleave']);
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
let currentHoveredOrganization = null;

// Reset zoom function
const resetZoom = () => {
  if (chartInstance) {
    // Reset both axes to show full data range
    chartInstance.dispatchAction({
      type: 'dataZoom',
      dataZoomIndex: 0, // X-axis
      start: 0,
      end: 100
    });
    chartInstance.dispatchAction({
      type: 'dataZoom',
      dataZoomIndex: 1, // Y-axis
      start: 0,
      end: 100
    });
    
    // Also trigger a chart refresh to ensure proper rendering
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 100);
  }
};

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

// Simple cycling label positioning to avoid overlaps
const calculateOptimalLabelPosition = (currentIndex, currentItem, allData, isMobile) => {
  const positions = ['top', 'bottom', 'left', 'right'];
  const distances = isMobile ? [8, 12, 8, 12] : [8, 12, 8, 12];
  
  // Simple cycling pattern based on index
  const positionIndex = currentIndex % positions.length;
  const position = positions[positionIndex];
  const distance = distances[positionIndex];
  
  return {
    position: position,
    distance: distance
  };
};

// Helper function to generate series data with optional organization highlighting
const generateSeriesData = (chartData, isMobile, hoveredOrganization = null) => {
  return chartData.map((item, index) => {
    const qpu = item[3];
    const style = getOrganizationStyle(qpu.organization);
    const isFromSameOrg = hoveredOrganization ? qpu.organization === hoveredOrganization : false;
    const isHovered = !!hoveredOrganization;
    
    // Calculate optimal label position using simple cycling
    const { position, distance } = calculateOptimalLabelPosition(
      index, 
      item, 
      chartData, 
      isMobile
    );
    
    return {
      value: [item[0], item[1]], 
      symbol: style.symbol,
      symbolSize: isHovered ? (isFromSameOrg ? (isMobile ? 16 : 26) : (isMobile ? 12 : 20)) : (isMobile ? 12 : 20),
      itemStyle: {
        color: style.color,
        borderColor: isHovered && isFromSameOrg ? '#fff' : 'transparent',
        borderWidth: isHovered && isFromSameOrg ? 2 : 0,
        shadowBlur: isHovered && isFromSameOrg ? 10 : 0,
        shadowColor: isHovered && isFromSameOrg ? style.color : 'transparent',
        opacity: isHovered ? (isFromSameOrg ? 1.0 : 0.3) : 1.0
      },
      qpuData: qpu,
      label: {
        show: true,
        position: position,
        formatter: isMobile
          ? (qpu.name.length > 8 ? qpu.name.substring(0, 5) + '...' : qpu.name) 
          : qpu.name,
        color: isHovered ? (isFromSameOrg ? '#fff' : 'rgba(255,255,255,0.5)') : '#fff',
        fontSize: isHovered ? (isFromSameOrg ? (isMobile ? 11 : 14) : (isMobile ? 9 : 12)) : (isMobile ? 9 : 12),
        fontWeight: 'bold',
        distance: distance,
        backgroundColor: isHovered ? (isFromSameOrg ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)') : 'rgba(0,0,0,0.7)',
        borderColor: 'transparent', 
        borderWidth: 0, 
        borderRadius: isMobile ? 1 : 3,
        padding: isMobile ? [1, 3] : [2, 5], 
        textShadowColor: 'transparent', 
        textShadowBlur: 0, 
        textShadowOffsetX: 0,
        textShadowOffsetY: 0
      }
    };
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
    title: [
      {
        text: 'Quantum Computer Timeline', 
        left: 'center',
        top: isMobile ? 10 : 20, // Less padding on mobile
        textStyle: { 
          color: '#fff', 
          fontWeight: 'bold', 
          fontSize: isMobile ? 16 : 22 // Smaller font on mobile
        } 
      },
      {
        text: 'Created by aben20807',
        left: 'center',
        top: isMobile ? 32 : 50, // Position below main title
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)', // Slightly transparent
          fontWeight: 'normal',
          fontSize: isMobile ? 10 : 12, // Smaller than main title
          fontStyle: 'italic'
        }
      }
    ],
    tooltip: {
      show: false  // Disable built-in tooltip to use our custom tooltip system
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'filter',
        disabled: true, // Disable mouse wheel zoom for X-axis
        zoomLock: true,
        minSpan: 10,
        maxSpan: 100,
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        filterMode: 'filter',
        disabled: true, // Disable mouse wheel zoom for Y-axis
        zoomLock: true,
        minSpan: 5,
        maxSpan: 100,
        start: 0,
        end: 100,
        zoomOnMouseWheel: false, // Completely disable mouse wheel zoom
        moveOnMouseMove: false,
        moveOnMouseWheel: false,
        // Configure exponential zoom behavior to match log scale
        rangeMode: ['percent', 'percent'],
        calculator: 'log', // Use logarithmic calculation for zoom
        logBase: 10 // Match the Y-axis log base
      },
      {
        type: 'slider',
        xAxisIndex: [0],
        filterMode: 'filter',
        show: !isMobile, // Hide slider on mobile
        bottom: 40,
        height: 20,
        borderColor: 'rgba(255,255,255,0.2)',
        textStyle: {
          color: '#fff'
        },
        brushStyle: {
          color: 'rgba(96,165,250,0.3)'
        },
        handleStyle: {
          color: '#60a5fa',
          borderColor: '#fff'
        },
        moveHandleStyle: {
          color: '#60a5fa'
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#60a5fa',
            width: 2
          },
          areaStyle: {
            color: 'rgba(96,165,250,0.2)'
          }
        },
        dataBackground: {
          lineStyle: {
            color: 'rgba(255,255,255,0.3)',
            width: 1
          },
          areaStyle: {
            color: 'rgba(255,255,255,0.1)'
          }
        },
        // Disable data shadows for plain slider appearance
        showDataShadow: false,
        showDetail: false,
        realtime: true
      },
      {
        type: 'slider',
        yAxisIndex: [0],
        filterMode: 'filter',
        show: !isMobile, // Hide slider on mobile
        left: 5, // Moved closer to edge to create more space
        width: 20,
        borderColor: 'rgba(255,255,255,0.2)',
        textStyle: {
          color: '#fff'
        },
        brushStyle: {
          color: 'rgba(96,165,250,0.3)'
        },
        handleStyle: {
          color: '#60a5fa',
          borderColor: '#fff'
        },
        moveHandleStyle: {
          color: '#60a5fa'
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#60a5fa',
            width: 2
          },
          areaStyle: {
            color: 'rgba(96,165,250,0.2)'
          }
        },
        dataBackground: {
          lineStyle: {
            color: 'rgba(255,255,255,0.3)',
            width: 1
          },
          areaStyle: {
            color: 'rgba(255,255,255,0.1)'
          }
        },
        // Disable data shadows for plain slider appearance
        showDataShadow: false,
        showDetail: false,
        realtime: true,
        // Configure exponential zoom behavior to match log scale
        rangeMode: ['percent', 'percent'],
        calculator: 'log', // Use logarithmic calculation for zoom
        logBase: 10 // Match the Y-axis log base
      }
    ],
    grid: { 
      left: isMobile ? '5%' : '80px', // Increased space for Y-axis zoom slider on desktop
      right: '3%', 
      top: isMobile ? 50 : 90, // Increased to accommodate author subtitle
      bottom: isMobile ? 40 : 120, // More space for zoom slider on desktop
      containLabel: true,
      height: isMobile ? '92%' : '75%' // Adjust height for zoom controls
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
      nameGap: isMobile ? 25 : 65, // Increased gap to create more space from slider
      nameTextStyle: { 
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: isMobile ? 8 : 12
      },
      min: Math.max(0.5, minQubitCount * 0.5), // Ensure minimum is at least 0.5 for log scale, more conservative
      max: maxQubitCount * 2, // Add more padding at the top
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
      name: 'QPU Data',
      data: generateSeriesData(chartData, isMobile, currentHoveredOrganization),
      emphasis: {
        scale: 1.0,  // Disable scaling to keep consistency with organization highlighting
        itemStyle: {
          shadowBlur: 10, // Add shadow to match organization highlighting
          shadowColor: 'rgba(255, 255, 255, 0.5)', // White shadow for the hovered point
          borderColor: '#fff', // White border to match other highlighted points
          borderWidth: 2, // Same border width as organization highlighting
          opacity: 1.0 // Keep full opacity to match organization highlighting
        },
        label: {
          show: true,
          fontSize: isMobile ? 11 : 14, // Match the organization highlighting font size
          fontWeight: 'bold',
          backgroundColor: 'rgba(0,0,0,0.9)', // Match organization highlighting background
          color: '#fff' // White text to match other highlighted points
        }
      }
    }],
    backgroundColor: 'transparent'
  };
  
  console.log('Setting chart option:', option);
  chartInstance.setOption(option, true);
  chartInstance.resize();
  
  chartInstance.off('mouseover');
  chartInstance.off('mouseout');
  chartInstance.off('globalout');
  
  chartInstance.on('mouseover', (params) => {
    if (params.componentType === 'series' && params.data && params.data.qpuData) {
      const hoveredOrganization = params.data.qpuData.organization;
      
      // Update the global hover state
      currentHoveredOrganization = hoveredOrganization;
      
      // Update the chart with highlighted data for the same organization
      const updatedSeriesData = generateSeriesData(chartData, isMobile, hoveredOrganization);
      
      chartInstance.setOption({
        series: [{
          data: updatedSeriesData
        }]
      }, { notMerge: false });
      
      emit('point-hover', params.data.qpuData, params.event.event);
    }
  });
  
  chartInstance.on('mouseout', (params) => {
    if (params.componentType === 'series' && params.data && params.data.qpuData) {
      // Reset the organization highlighting when leaving a data point
      currentHoveredOrganization = null;
      
      // Reset all data points to normal state
      const normalSeriesData = generateSeriesData(chartData, isMobile, null);
      
      chartInstance.setOption({
        series: [{
          data: normalSeriesData
        }]
      }, { notMerge: false });
      
      // Immediately emit point-leave to stop countdown
      emit('point-leave', params.data.qpuData);
    }
  });
  
  chartInstance.on('globalout', () => {
    // Reset the global hover state
    currentHoveredOrganization = null;
    
    // Reset all data points to normal state
    const normalSeriesData = generateSeriesData(chartData, isMobile, null);
    
    chartInstance.setOption({
      series: [{
        data: normalSeriesData
      }]
    }, { notMerge: false });
    
    // Emit point-leave for any currently hovered point to ensure countdown stops
    if (chartData && chartData.length > 0) {
      // Find any point that might be currently in countdown state and emit leave for it
      chartData.forEach(item => {
        emit('point-leave', item[3]); // item[3] contains the qpu data
      });
    }
    
    // Add a delay before emitting mouseleave to allow moving to tooltip
    setTimeout(() => {
      emit('mouseleave');
    }, 150);
  });
  
  // Add zoom event handlers for better UX
  chartInstance.on('datazoom', (params) => {
    // Update chart labels based on zoom level to reduce clutter when zoomed out
    const currentOption = chartInstance.getOption();
    
    // Calculate zoom level based on the data range
    if (params.batch && params.batch[0]) {
      const zoomInfo = params.batch[0];
      const zoomLevel = zoomInfo.end - zoomInfo.start; // Percentage of data visible
      
      // Re-render with smart positioning when zoom changes
      setTimeout(() => {
        if (chartInstance) {
          const newChartData = getChartData();
          const updatedSeries = newChartData.map((item, index) => {
            const qpu = item[3];
            const style = getOrganizationStyle(qpu.organization);
            const isFromSameOrg = currentHoveredOrganization ? qpu.organization === currentHoveredOrganization : false;
            const isHovered = !!currentHoveredOrganization;
            
            // Adjust label density and positioning based on zoom level
            let labelShowFrequency = 1;
            let shouldShowLabel = true;
            
            // More conservative frequency adjustment - show more labels
            if (zoomLevel > 90) labelShowFrequency = 3;       // Only hide when extremely zoomed out
            else if (zoomLevel > 75) labelShowFrequency = 2;  // Moderately zoomed out
            else labelShowFrequency = 1;                      // Show all when reasonable zoom
            
            // Use simple cycling positioning for zoom too
            const { position, distance } = calculateOptimalLabelPosition(
              index, 
              item, 
              newChartData, 
              isMobile
            );
            
            // Less aggressive hiding - only when really necessary
            shouldShowLabel = isMobile 
              ? (zoomLevel > 90 ? index % (labelShowFrequency * 2) === 0 : index % labelShowFrequency === 0)
              : index % labelShowFrequency === 0;
            
            return {
              value: [item[0], item[1]],
              symbol: style.symbol,
              symbolSize: isHovered ? (isFromSameOrg ? (isMobile ? 16 : 26) : (isMobile ? 12 : 20)) : (isMobile ? 12 : 20),
              itemStyle: {
                color: style.color,
                borderColor: isHovered && isFromSameOrg ? '#fff' : 'transparent',
                borderWidth: isHovered && isFromSameOrg ? 2 : 0,
                shadowBlur: isHovered && isFromSameOrg ? 10 : 0,
                shadowColor: isHovered && isFromSameOrg ? style.color : 'transparent',
                opacity: isHovered ? (isFromSameOrg ? 1.0 : 0.3) : 1.0
              },
              qpuData: qpu,
              label: {
                show: shouldShowLabel,
                position: position,
                formatter: isMobile
                  ? (qpu.name.length > 8 ? qpu.name.substring(0, 5) + '...' : qpu.name)
                  : qpu.name,
                color: isHovered ? (isFromSameOrg ? '#fff' : 'rgba(255,255,255,0.5)') : '#fff',
                fontSize: zoomLevel < 30 ? (isMobile ? 10 : 13) : (isHovered ? (isFromSameOrg ? (isMobile ? 11 : 14) : (isMobile ? 9 : 12)) : (isMobile ? 9 : 12)),
                fontWeight: 'bold',
                distance: distance,
                backgroundColor: isHovered ? (isFromSameOrg ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)') : 'rgba(0,0,0,0.7)',
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: isMobile ? 1 : 3,
                padding: isMobile ? [1, 3] : [2, 5]
              }
            };
          });
          
          chartInstance.setOption({
            series: [{
              data: updatedSeries
            }]
          }, { notMerge: false });
        }
      }, 100);
    }
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
  
  // Keyboard shortcuts for zoom control (desktop only)
  const handleKeyDown = (event) => {
    if (window.innerWidth >= 768 && chartInstance) { // Desktop only
      switch(event.key) {
        case '+':
        case '=':
          // Zoom in
          event.preventDefault();
          chartInstance.dispatchAction({
            type: 'dataZoom',
            dataZoomIndex: 0,
            start: 25,
            end: 75
          });
          break;
        case '-':
          // Zoom out
          event.preventDefault();
          chartInstance.dispatchAction({
            type: 'dataZoom',
            dataZoomIndex: 0,
            start: 0,
            end: 100
          });
          break;
        case 'r':
        case 'R':
          // Reset zoom
          event.preventDefault();
          chartInstance.dispatchAction({
            type: 'restore'
          });
          break;
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown);
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
    title: [
      {
        text: isVerySmallScreen ? 'QPU Timeline' : 'Quantum Computer Timeline', // Even shorter title on very small screens
        top: isVerySmallScreen ? 5 : 10,
        textStyle: { fontSize: isVerySmallScreen ? 14 : 16 }
      },
      {
        text: 'Created by aben20807',
        left: 'center',
        top: isVerySmallScreen ? 22 : 28,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 'normal',
          fontSize: isVerySmallScreen ? 8 : 9,
          fontStyle: 'italic'
        }
      }
    ],
    toolbox: {
      show: false // Always hide toolbox on mobile
    },
    brush: {
      toolbox: [],
      xAxisIndex: [],
      yAxisIndex: []
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'filter',
        disabled: true, // Disable mouse wheel zoom on mobile
        zoomLock: true,
        minSpan: 10,
        maxSpan: 100,
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        filterMode: 'filter',
        disabled: true, // Disable mouse wheel zoom on mobile
        zoomLock: true,
        minSpan: 5,
        maxSpan: 100,
        start: 0,
        end: 100,
        zoomOnMouseWheel: false, // Completely disable mouse wheel zoom
        moveOnMouseMove: false,
        moveOnMouseWheel: false
      }
      // Remove slider zoom controls on mobile for space
    ],
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
  // Reset hover state
  currentHoveredOrganization = null;
  
  // Remove event listeners
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  
  if (chartInstance) {
    // Clean up all chart events
    chartInstance.off('mouseover');
    chartInstance.off('mouseout');
    chartInstance.off('globalout');
    chartInstance.off('datazoom');
    chartInstance.dispose();
    chartInstance = null;
  }
});

watch(() => props.data, (newData) => {
  console.log('Data changed:', newData);
  // Reset hover state when data changes
  currentHoveredOrganization = null;
  nextTick(() => renderChart());
}, { deep: true });

// Watch for changes in visible organizations
watch(() => props.visibleOrganizations, () => {
  console.log('Visible organizations changed:', [...props.visibleOrganizations]);
  // Reset hover state when visible organizations change
  currentHoveredOrganization = null;
  nextTick(() => renderChart());
}, { deep: true });
</script>
