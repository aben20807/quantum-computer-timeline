<script setup>
import { ref, onMounted } from 'vue';
import Papa from 'papaparse';
import TimelineChart from './components/TimelineChart.vue';
import QPULegend from './components/QPULegend.vue';
import QPUDetailTooltip from './components/QPUDetailTooltip.vue';
import AboutSection from './components/AboutSection.vue';
import DisclaimerSection from './components/DisclaimerSection.vue';

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
    // Built-in symbols
    { color: '#42b883', symbol: 'roundRect' },     // Google
    { color: '#ff9800', symbol: 'rect' },          // IBM (use 'rect' instead of 'square' for ECharts compatibility)
    { color: '#2196f3', symbol: 'triangle' },      // USTC
    { color: '#e91e63', symbol: 'diamond' },       // Additional organizations
    { color: '#9c27b0', symbol: 'circle' },
    { color: '#4caf50', symbol: 'pin' },
    { color: '#f44336', symbol: 'arrow' },
    { color: '#607d8b', symbol: 'emptyCircle' },
    
    // Custom path-based symbols
    // Star
    { color: '#00bcd4', symbol: 'path://M15.422,18.129l-5.264-2.768l-5.265,2.768l1.006-5.863L1.64,8.114l5.887-0.855l2.632-5.334l2.633,5.334l5.885,0.855l-4.258,4.152L15.422,18.129z' },
    // Diamond (custom)
    { color: '#ffc107', symbol: 'path://M0 8l8 -8l8 8l-8 8l-8 -8z' },
    // Hexagon
    { color: '#795548', symbol: 'path://M8 1L15.5 5.5L15.5 14.5L8 19L0.5 14.5L0.5 5.5Z' },
    // Cross
    { color: '#3f51b5', symbol: 'path://M2,7L7,7L7,2L9,2L9,7L14,7L14,9L9,9L9,14L7,14L7,9L2,9Z' },
    // Pentagon
    { color: '#8bc34a', symbol: 'path://M6.476,1.176L0.32,6.741L2.727,14.299L10.795,14.307L13.27,6.762L' },
    // Heart
    { color: '#ff5722', symbol: 'path://M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z' },
    // Sun/Flower
    { color: '#03a9f4', symbol: 'path://M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z' },
    // Cloud
    { color: '#cddc39', symbol: 'path://M24 15c0 2.21-1.79 4-4 4h-12.5c-2.485 0-4.5-2.015-4.5-4.5 0-2.485 2.015-4.5 4.5-4.5 0.5 0 0.5 0 1 0.1 0.413-2.661 2.69-4.6 5-4.6 2.761 0 5 2.239 5 5 0 0.5-0.5 1-0.1 1.5 3.339 0.213 6.1 2.31 6.1 5z' },
    // Moon
    { color: '#673ab7', symbol: 'path://M10.719 2.082c-2.572 2.028-4.719 5.212-4.719 9.918 0 4.569 1.938 7.798 4.548 9.78-4.829-0.092-8.547-6.776-8.547-9.78 0-3.133 3.443-9.918 8.718-9.918z' },
    // Lightning Bolt
    { color: '#009688', symbol: 'path://M8 1L1 12L8 14L4 23L15 10L9 8L13 1Z' },
    // Infinity
    { color: '#ffeb3b', symbol: 'path://M12.5,18c-5,0-5-8-10-8s-5,8-10,8s5-8,10-8S17.5,18,12.5,18z' },
    // Camera
    { color: '#9e9e9e', symbol: 'path://M9 3h-4c-1.105 0-2 0.895-2 2v10c0 1.105 0.895 2 2 2h14c1.105 0 2-0.895 2-2v-10c0-1.105-0.895-2-2-2h-4l-2-2h-6l-2 2z' }
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
  // Use the data file directly from the data directory
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
        <TimelineChart 
          :data="qpuData" 
          :organization-styles="organizations"
          @point-hover="handlePointHover" 
          @mouseleave="handleChartLeave" 
        />
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
      <div class="max-w-7xl mx-auto w-full">
        <DisclaimerSection />
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
    <footer class="mt-12 mb-4 text-sm opacity-80">2025 &copy; <a href="https://github.com/aben20807" class="footer-link" target="_blank">aben20807</a></footer>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Override global anchor styles with higher specificity */
footer .footer-link {
  color: #4fc3f7;
  text-decoration: underline;
  font-weight: 400;
  text-decoration: inherit;
}

footer .footer-link:hover {
  color: #81d4fa;
  text-decoration: underline;
}
</style>
