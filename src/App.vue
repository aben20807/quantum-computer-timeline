<script setup>
import { ref, onMounted } from 'vue';
import Papa from 'papaparse';
import TimelineChart from './components/TimelineChart.vue';
import QPULegend from './components/QPULegend.vue';
import QPUDetailTooltip from './components/QPUDetailTooltip.vue';
import AboutSection from './components/AboutSection.vue';

const qpuData = ref([]);
const organizations = ref([]);  // Will hold organization data for the legend
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

function getOrganizationStyles(data) {
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
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('getOrganizationStyles: Invalid data:', data);
    return [];
  }
  
  // Get unique organizations
  const orgNames = [...new Set(data.filter(qpu => qpu && qpu.organization).map(qpu => qpu.organization))];
  
  // Create the organization style objects
  return orgNames.map((name, index) => ({
    name,
    color: palette[index % palette.length].color,
    symbol: palette[index % palette.length].symbol
  }));
}

onMounted(() => {
  console.log('App mounted, fetching CSV data');
  fetch('/data/qpu_timeline.csv')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to load CSV: ${res.status} ${res.statusText}`);
      }
      return res.text();
    })
    .then(csv => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          qpuData.value = results.data.map(row => ({
            ...row,
            qubitCount: Number(row.qubitCount),
            externalLink: parsePaperLinks(row.externalLink),
          }));
          organizations.value = getOrganizationStyles(qpuData.value);
          console.log('App.vue - QPU data loaded:', qpuData.value);
          console.log('App.vue - Organizations generated:', organizations.value);
          
          // Ensure the organizations value is correctly structured and not empty
          if (!organizations.value || !Array.isArray(organizations.value) || organizations.value.length === 0) {
            console.error('Organizations data is invalid:', organizations.value);
          }
        }
      });
    })
    .catch(error => {
      console.error('Error loading or parsing CSV data:', error);
    });
});

function handlePointHover(qpu, event) {
  selectedQPU.value = qpu;
  showTooltip.value = true;
  
  // Calculate position with bounds checking
  const tooltipWidth = 280; // Approximate tooltip width
  const tooltipHeight = 200; // Approximate tooltip height
  const margin = 20;
  
  let x = event.clientX + 15;
  let y = event.clientY - 10;
  
  // Check if tooltip would go off the right edge
  if (x + tooltipWidth > window.innerWidth - margin) {
    x = event.clientX - tooltipWidth - 15;
  }
  
  // Check if tooltip would go off the bottom edge
  if (y + tooltipHeight > window.innerHeight - margin) {
    y = event.clientY - tooltipHeight - 10;
  }
  
  // Ensure tooltip doesn't go off the left or top edges
  x = Math.max(margin, x);
  y = Math.max(margin, y);
  
  tooltipPosition.value = { x, y };
}

function handleChartLeave() {
  // Add a small delay to allow moving from chart to tooltip
  setTimeout(() => {
    if (!isHoveringTooltip.value) {
      showTooltip.value = false;
      selectedQPU.value = null;
    }
  }, 100);
}

const isHoveringTooltip = ref(false);

function handleTooltipMouseEnter() {
  isHoveringTooltip.value = true;
}

function handleTooltipMouseLeave() {
  isHoveringTooltip.value = false;
  showTooltip.value = false;
  selectedQPU.value = null;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col items-center">
    <header class="w-full py-8 text-center bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight drop-shadow-lg animate-pulse">Quantum Computer Timeline</h1>
      <p class="text-lg mt-2 opacity-80">Explore the evolution of QPUs, their organizations, and breakthroughs</p>
    </header>
    <main class="w-full px-4 flex flex-col gap-8">
      <div class="max-w-7xl mx-auto w-full">
        <AboutSection />
      </div>
      <div class="max-w-7xl mx-auto w-full">
        <TimelineChart :data="qpuData" @point-hover="handlePointHover" @mouseleave="handleChartLeave" />
      </div>
      <div class="max-w-7xl mx-auto w-full">
        <div class="bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10">
          <h2 class="text-lg font-medium mb-6 text-center text-gray-200">Organizations</h2>
          <QPULegend :companies="organizations" />
          <!-- Display debug info if legend is empty -->
          <div v-if="!organizations || !organizations.length" class="text-center text-red-400 mt-4">
            <p>Debug: No organizations data available.</p>
          </div>
        </div>
      </div>
      <transition name="fade">
        <div v-if="showTooltip" 
             :style="{ 
               position: 'fixed', 
               left: tooltipPosition.x + 'px', 
               top: tooltipPosition.y + 'px', 
               zIndex: 1000
             }"
             @mouseenter="handleTooltipMouseEnter"
             @mouseleave="handleTooltipMouseLeave">
          <QPUDetailTooltip :qpu="selectedQPU" />
        </div>
      </transition>
    </main>
    <footer class="mt-12 mb-4 text-sm opacity-80">2025 &copy; <a href="https://github.com/aben20807" class="text-blue-300 hover:text-blue-200 underline" target="_blank">aben20807</a></footer>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
