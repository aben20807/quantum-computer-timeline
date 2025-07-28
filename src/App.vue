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
const visibleOrganizations = ref(new Set());  // Track which organizations are visible
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
    // Built-in symbols with improved contrast for dark backgrounds
    { color: '#4ade80', symbol: 'roundRect' }, // Bright green (better contrast)
    { color: '#fb923c', symbol: 'rect' }, // Brighter orange
    { color: '#60a5fa', symbol: 'triangle' }, // Lighter blue
    { color: '#f472b6', symbol: 'diamond' }, // Brighter pink
    { color: '#c084fc', symbol: 'circle' }, // Brighter purple
    { color: '#94a3b8', symbol: 'emptyCircle' }, // Lighter gray
    
    // Custom path-based symbols with improved contrast
    // Star
    { color: '#22d3ee', symbol: 'path://M15.422,18.129l-5.264-2.768l-5.265,2.768l1.006-5.863L1.64,8.114l5.887-0.855l2.632-5.334l2.633,5.334l5.885,0.855l-4.258,4.152L15.422,18.129z' }, // Brighter cyan
    // Diamond (custom)
    { color: '#fbbf24', symbol: 'path://M0 8l8 -8l8 8l-8 8l-8 -8z' }, // Brighter yellow
    // Hexagon
    { color: '#f87171', symbol: 'path://M8 1L15.5 5.5L15.5 14.5L8 19L0.5 14.5L0.5 5.5Z' }, // Brighter red
    // Cross
    { color: '#818cf8', symbol: 'path://M2,7L7,7L7,2L9,2L9,7L14,7L14,9L9,9L9,14L7,14L7,9L2,9Z' }, // Brighter indigo
    // Sun/Flower
    { color: '#38bdf8', symbol: 'path://M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z' }, // Brighter sky blue
    // Moon
    { color: '#a78bfa', symbol: 'path://M10.719 2.082c-2.572 2.028-4.719 5.212-4.719 9.918 0 4.569 1.938 7.798 4.548 9.78-4.829-0.092-8.547-6.776-8.547-9.80 0-3.133 3.443-9.918 8.718-9.918z' }, // Brighter violet
    // Lightning Bolt
    { color: '#34d399', symbol: 'path://M8 1L1 12L8 14L4 23L15 10L9 8L13 1Z' }, // Bright emerald
    // Infinity
    { color: '#fde047', symbol: 'path://M12.5,18c-5,0-5-8-10-8s-5,8-10,8s5-8,10-8S17.5,18,12.5,18z' }, // Brighter yellow
    // Camera
    { color: '#e5e7eb', symbol: 'path://M9 3h-4c-1.105 0-2 0.895-2 2v10c0 1.105 0.895 2 2 2h14c1.105 0 2-0.895 2-2v-10c0-1.105-0.895-2-2-2h-4l-2-2h-6l-2 2z' }, // Much lighter gray
    // Cloud
    { color: '#a3e635', symbol: 'path://M24 15c0 2.21-1.79 4-4 4h-12.5c-2.485 0-4.5-2.015-4.5-4.5 0-2.485 2.015-4.5 4.5-4.5 0.5 0 0.5 0 1 0.1 0.413-2.661 2.69-4.6 5-4.6 2.761 0 5 2.239 5 5 0 0.5-0.5 1-0.1 1.5 3.339 0.213 6.1 2.31 6.1 5z' }, // Brighter lime
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
    symbol: palette[index % palette.length].symbol,
    visible: true // All organizations are visible by default
  }));
}

onMounted(() => {
  console.log('App mounted, fetching CSV data');
  // Use the data file directly from the data directory
  fetch('./data/qpu_timeline.csv')
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
          
          // Initialize all organizations as visible
          visibleOrganizations.value = new Set(
            organizations.value.map(org => org.name)
          );
          
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

function toggleOrganizationVisibility(orgName) {
  // Toggle the visibility of the organization
  if (visibleOrganizations.value.has(orgName)) {
    visibleOrganizations.value.delete(orgName);
  } else {
    visibleOrganizations.value.add(orgName);
  }
  
  // Update the visible property in the organizations array
  organizations.value = organizations.value.map(org => ({
    ...org,
    visible: visibleOrganizations.value.has(org.name)
  }));
}

function resetOrganizationVisibility() {
  // Make all organizations visible
  visibleOrganizations.value = new Set(
    organizations.value.map(org => org.name)
  );
  
  // Update the visible property in the organizations array
  organizations.value = organizations.value.map(org => ({
    ...org,
    visible: true
  }));
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
          :visible-organizations="visibleOrganizations"
          @point-hover="handlePointHover" 
          @mouseleave="handleChartLeave" 
        />
      </div>
      <div class="max-w-7xl mx-auto w-full">
        <div class="bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-medium text-gray-200">Organizations</h2>
              <div class="text-sm text-gray-400 mt-1">
                Showing {{ visibleOrganizations.size }} of {{ organizations.length }} organizations
              </div>
            </div>
            <button 
              @click="resetOrganizationVisibility"
              class="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              :disabled="visibleOrganizations.size === organizations.length"
              :class="{ 'opacity-50 cursor-not-allowed hover:shadow-md hover:transform-none': visibleOrganizations.size === organizations.length }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="font-semibold">Show All</span>
            </button>
          </div>
          <QPULegend 
            :companies="organizations" 
            :visible-organizations="visibleOrganizations"
            :qpu-data="qpuData"
            @toggle-organization="toggleOrganizationVisibility" 
          />
          <!-- Display debug info if legend is empty -->
          <div v-if="!organizations || !organizations.length" class="text-center text-red-400 mt-4">
            <p>Debug: No organizations data available.</p>
          </div>
        </div>
      </div>
      <div class="max-w-7xl mx-auto w-full">
        <div class="bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10">
          <h2 class="text-lg font-medium text-gray-200 mb-4">Quantum Computing Technologies</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-blue-300 font-semibold text-base mb-2">Superconducting</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Uses superconducting circuits operating at near absolute zero temperatures. 
                Fast gate operations and good connectivity, but requires complex cooling systems. 
                Used by IBM, Google, and Rigetti.
              </p>
            </div>
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-green-300 font-semibold text-base mb-2">Trapped Ion</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Individual ions held in electromagnetic traps and manipulated with lasers. 
                High fidelity gates and long coherence times, but slower operations. 
                Used by IonQ, Honeywell, and Alpine Quantum Technologies.
              </p>
            </div>
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-purple-300 font-semibold text-base mb-2">Photonic</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Uses photons (particles of light) as qubits. Room temperature operation 
                and natural for quantum networking, but challenging to implement two-qubit gates. 
                Used by Xanadu, PsiQuantum, and Orca Computing.
              </p>
            </div>
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-yellow-300 font-semibold text-base mb-2">Neutral Atom</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Neutral atoms trapped in optical lattices and controlled with lasers. 
                Highly scalable with flexible connectivity patterns. 
                Used by QuEra, Pasqal, and Atom Computing.
              </p>
            </div>
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-red-300 font-semibold text-base mb-2">Annealing</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Specialized for optimization problems using quantum tunneling effects. 
                Not universal quantum computers but excellent for specific applications. 
                Primarily developed by D-Wave Systems.
              </p>
            </div>
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 class="text-cyan-300 font-semibold text-base mb-2">Topological</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Theoretical approach using anyons and topological properties for 
                inherently error-resistant qubits. Still in research phase. 
                Being pursued by Microsoft and others.
              </p>
            </div>
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
