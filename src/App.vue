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
    '#42b883', '#ff9800', '#2196f3', '#e91e63', '#9c27b0', '#4caf50', '#f44336', '#607d8b', '#00bcd4', '#ffc107'
  ];
  const map = {};
  let i = 0;
  data.forEach(qpu => {
    if (!map[qpu.company]) {
      map[qpu.company] = palette[i % palette.length];
      i++;
    }
  });
  return Object.entries(map).map(([name, color]) => ({ name, color }));
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
    <main class="w-full max-w-5xl px-4 flex flex-col gap-8">
      <AboutSection />
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <div class="flex-1 bg-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
          <TimelineChart :data="qpuData" @point-hover="handlePointHover" @mouseleave="handleChartLeave" />
        </div>
        <div class="w-full md:w-64 bg-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
          <h2 class="text-xl font-bold mb-4">Legend</h2>
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
