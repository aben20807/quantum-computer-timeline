<template>
  <div style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem;">
    <div v-if="!companies || companies.length === 0" 
         style="font-size: 0.875rem; color: #d1d5db; animation: pulse 2s infinite;">
      Loading legend... {{ typeof companies === 'undefined' ? '(undefined)' : 
                           !Array.isArray(companies) ? '(not an array)' : 
                           '(' + companies.length + ' items)' }}
    </div>
    <div v-for="(organization, index) in sortedCompanies" 
         :key="organization.name" 
         class="legend-item"
         :style="{
           display: 'flex',
           alignItems: 'center',
           gap: '0.75rem',
           padding: '0.75rem 1.25rem',
           borderRadius: '9999px',
           background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
           backdropFilter: 'blur(12px)',
           border: '1px solid rgba(255,255,255,0.15)',
           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
           cursor: 'pointer',
           boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
           animationDelay: `${index * 0.1}s`,
           position: 'relative',
           overflow: 'hidden',
           opacity: visibleOrganizations.has(organization.name) ? '1' : '0.5'
         }"
         @mouseenter="onHover"
         @mouseleave="onLeave"
         @click="toggleOrganization(organization.name)">
      
      <!-- SVG Symbol Container -->
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" style="position: relative; z-index: 2;">
          <!-- Circle Symbol -->
          <circle v-if="organization.symbol === 'circle'"
                  cx="12" cy="12" r="8"
                  :fill="organization.color"
                  stroke="white"
                  stroke-width="2.5"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Rectangle Symbol -->
          <rect v-else-if="organization.symbol === 'rect'"
                x="5" y="5" width="14" height="14"
                :fill="organization.color"
                stroke="white"
                stroke-width="2.5"
                rx="2"
                style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Triangle Symbol -->
          <polygon v-else-if="organization.symbol === 'triangle'"
                   points="12,4 20,18 4,18"
                   :fill="organization.color"
                   stroke="white"
                   stroke-width="2.5"
                   stroke-linejoin="round"
                   style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Diamond Symbol -->
          <polygon v-else-if="organization.symbol === 'diamond'"
                   points="12,3 21,12 12,21 3,12"
                   :fill="organization.color"
                   stroke="white"
                   stroke-width="2.5"
                   stroke-linejoin="round"
                   style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Pin Symbol -->
          <g v-else-if="organization.symbol === 'pin'">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  :fill="organization.color"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </g>
          
          <!-- Arrow Symbol -->
          <g v-else-if="organization.symbol === 'arrow'">
            <polygon points="2,12 10,4 10,8 22,8 22,16 10,16 10,20"
                     :fill="organization.color"
                     stroke="white"
                     stroke-width="2.5"
                     stroke-linejoin="round"
                     style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          </g>
          
          <!-- Rounded Rectangle Symbol -->
          <rect v-else-if="organization.symbol === 'roundRect'"
                x="5" y="5" width="14" height="14"
                :fill="organization.color"
                stroke="white"
                stroke-width="2.5"
                rx="5" ry="5"
                style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Empty Circle Symbol -->
          <circle v-else-if="organization.symbol === 'emptyCircle'"
                  cx="12" cy="12" r="8"
                  fill="transparent"
                  :stroke="organization.color"
                  stroke-width="3"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Empty Rectangle Symbol -->
          <rect v-else-if="organization.symbol === 'emptyRect'"
                x="5" y="5" width="14" height="14"
                fill="transparent"
                :stroke="organization.color"
                stroke-width="3"
                rx="2"
                style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Custom Path Symbol -->
          <path v-else-if="organization.symbol && organization.symbol.startsWith('path://')"
                :d="organization.symbol.replace('path://', '')"
                :fill="organization.color"
                stroke="white"
                stroke-width="1.5"
                transform="scale(0.75) translate(4, 4)"
                style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
                
          <!-- Default to Circle for unknown symbols -->
          <circle v-else
                  cx="12" cy="12" r="8"
                  :fill="organization.color"
                  stroke="white"
                  stroke-width="2.5"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
        </svg>
        
        <!-- Animated glow effect -->
        <div :style="{
               position: 'absolute',
               width: '120%',
               height: '120%',
               borderRadius: '50%',
               background: `radial-gradient(circle, ${organization.color}30 0%, transparent 70%)`,
               animation: 'glow 3s ease-in-out infinite',
               zIndex: 1
             }"></div>
      </div>
      
      <!-- Organization Name -->
      <div :style="{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              letterSpacing: '0.025em',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }">
        <span>{{ organization.name }} ({{ getQpuCount(organization.name) }})</span>
      </div>
      
      <!-- Shine effect overlay -->
      <div :style="{
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             borderRadius: '9999px',
             background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
             pointerEvents: 'none',
             opacity: 0,
             transition: 'opacity 0.3s ease',
             zIndex: 1
           }"
           class="shine-overlay"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  companies: { // Keeping prop name for API compatibility
    type: Array,
    default: () => []
  },
  visibleOrganizations: {
    type: Set,
    default: () => new Set()
  },
  qpuData: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle-organization']);

// Computed property to sort organizations
import { computed } from 'vue';

// Sort organizations by number of QPUs and alphabetically by name
const sortedCompanies = computed(() => {
  if (!props.companies || !Array.isArray(props.companies)) return [];
  
  // Count QPUs for each organization
  const orgCounts = {};
  if (props.qpuData && Array.isArray(props.qpuData)) {
    props.qpuData.forEach(qpu => {
      if (qpu.organization) {
        orgCounts[qpu.organization] = (orgCounts[qpu.organization] || 0) + 1;
      }
    });
  }
  
  return [...props.companies].sort((a, b) => {
    // First, sort by number of QPUs (descending)
    const countA = orgCounts[a.name] || 0;
    const countB = orgCounts[b.name] || 0;
    
    if (countB !== countA) {
      return countB - countA; // Descending order
    }
    
    // If equal count, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
});

// Debug - log the companies prop whenever it changes
import { watch } from 'vue';
watch(() => props.companies, (newValue) => {
  console.log('QPULegend - companies prop changed:', newValue);
}, { immediate: true, deep: true });

const onHover = (event) => {
  const target = event.currentTarget;
  target.style.transform = 'translateY(-4px) scale(1.08)';
  target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
  target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)';
  target.style.borderColor = 'rgba(255,255,255,0.3)';
  
  // Show shine effect
  const shine = target.querySelector('.shine-overlay');
  if (shine) {
    shine.style.opacity = '1';
  }
};

const onLeave = (event) => {
  const target = event.currentTarget;
  target.style.transform = '';
  target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
  target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)';
  target.style.borderColor = 'rgba(255,255,255,0.15)';
  
  // Hide shine effect
  const shine = target.querySelector('.shine-overlay');
  if (shine) {
    shine.style.opacity = '0';
  }
};

// Function to toggle organization visibility
const toggleOrganization = (orgName) => {
  emit('toggle-organization', orgName);
};

// Helper function to get the number of QPUs for an organization
const getQpuCount = (orgName) => {
  if (!props.qpuData || !Array.isArray(props.qpuData)) return 0;
  
  return props.qpuData.filter(qpu => qpu.organization === orgName).length;
};
</script>

<style scoped>
@keyframes glow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.legend-item {
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.legend-item svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .legend-item {
    gap: 0.5rem !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.8rem !important;
  }
  
  .legend-item svg {
    width: 16px !important;
    height: 16px !important;
  }
}

@media (max-width: 480px) {
  .legend-item {
    flex-direction: column !important;
    gap: 0.25rem !important;
    padding: 0.75rem !important;
    min-width: 0 !important;
  }
  
  .legend-item div {
    font-size: 0.75rem !important;
    text-align: center !important;
    max-width: 80px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    align-items: center !important;
  }
  
  .legend-item div span {
    font-size: 0.7rem !important;
    text-align: center !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
}
</style>
