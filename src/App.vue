<script setup>
import { ref, onMounted } from 'vue';
import Papa from 'papaparse';
import TimelineChart from './components/TimelineChart.vue';
import QPULegend from './components/QPULegend.vue';
import QPUDetailTooltip from './components/QPUDetailTooltip.vue';
import AboutSection from './components/AboutSection.vue';

const qpuData = ref([]);
const companies = ref([]);
const selectedQPU = ref(null);
const showTooltip = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });

function parsePaperLinks(links) {
  try {
    return JSON.parse(links.replace(/''/g, '"'));
  } catch {
    return [];
  }
}

function getCompanyColors(data) {
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
  const map = {};
  let i = 0;
  data.forEach(qpu => {
    if (!map[qpu.company]) {
      map[qpu.company] = palette[i % palette.length];
      i++;
    }
  });
  return Object.entries(map).map(([name, style]) => ({ name, ...style }));
}

onMounted(() => {
  fetch('/data/qpu_timeline.csv')
    .then(res => res.text())
    .then(csv => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          qpuData.value = results.data.map(row => ({
            ...row,
            qubitCount: Number(row.qubitCount),
            paperLinks: parsePaperLinks(row.paperLinks),
          }));
          companies.value = getCompanyColors(qpuData.value);
          console.log('App.vue - QPU data loaded:', qpuData.value);
          console.log('App.vue - Companies generated:', companies.value);
        }
      });
    });
});

function handlePointHover(qpu, event) {
  selectedQPU.value = qpu;
  showTooltip.value = true;
  tooltipPosition.value = { x: event.clientX, y: event.clientY };
}
function handleChartLeave() {
  showTooltip.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col items-center">
    <header class="w-full py-8 text-center bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight drop-shadow-lg animate-pulse">Quantum Computer Timeline</h1>
      <p class="text-lg mt-2 opacity-80">Explore the evolution of QPUs, their companies, and breakthroughs</p>
    </header>
    <main class="w-full px-4 flex flex-col gap-8">
      <div class="max-w-5xl mx-auto w-full">
        <AboutSection />
      </div>
      <div class="w-full">
        <TimelineChart :data="qpuData" @point-hover="handlePointHover" @mouseleave="handleChartLeave" />
      </div>
      <div class="max-w-4xl mx-auto w-full">
        <div class="bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10">
          <h2 class="text-lg font-medium mb-6 text-center text-gray-200">Companies</h2>
          <QPULegend :companies="companies" />
        </div>
      </div>
      <transition name="fade">
        <div v-if="showTooltip" :style="{ position: 'fixed', left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px', zIndex: 1000 }">
          <QPUDetailTooltip :qpu="selectedQPU" />
        </div>
      </transition>
    </main>
    <footer class="mt-12 mb-4 text-sm opacity-60">&copy; 2025 Quantum Timeline Project</footer>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
