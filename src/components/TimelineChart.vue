<template>
  <div class="w-full h-96" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: Array
});

const chartContainer = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!chartContainer.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
  }
  // Example: Replace with real chart option
  chartInstance.setOption({
    title: { text: 'Quantum Computer Timeline' },
    tooltip: {},
    xAxis: { type: 'time' },
    yAxis: { type: 'value', name: 'Qubit Count' },
    series: [{
      type: 'scatter',
      data: props.data.map(qpu => [qpu.releaseDate, qpu.qubitCount]),
      symbolSize: 20,
    }],
  });
};

onMounted(renderChart);
watch(() => props.data, renderChart);
</script>
