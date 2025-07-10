<template>
  <div style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem;">
    <div v-if="!companies || companies.length === 0" 
         style="font-size: 0.875rem; color: #d1d5db; animation: pulse 2s infinite;">
      Loading legend...
    </div>
    <div v-for="(company, index) in companies" 
         :key="company.name" 
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
           overflow: 'hidden'
         }"
         @mouseenter="onHover"
         @mouseleave="onLeave">
      
      <!-- SVG Symbol Container -->
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" style="position: relative; z-index: 2;">
          <!-- Circle Symbol -->
          <circle v-if="company.symbol === 'circle'"
                  cx="12" cy="12" r="8"
                  :fill="company.color"
                  stroke="white"
                  stroke-width="2.5"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Rectangle Symbol -->
          <rect v-else-if="company.symbol === 'rect'"
                x="5" y="5" width="14" height="14"
                :fill="company.color"
                stroke="white"
                stroke-width="2.5"
                rx="2"
                style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Triangle Symbol -->
          <polygon v-else-if="company.symbol === 'triangle'"
                   points="12,4 20,18 4,18"
                   :fill="company.color"
                   stroke="white"
                   stroke-width="2.5"
                   stroke-linejoin="round"
                   style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Diamond Symbol -->
          <polygon v-else-if="company.symbol === 'diamond'"
                   points="12,3 21,12 12,21 3,12"
                   :fill="company.color"
                   stroke="white"
                   stroke-width="2.5"
                   stroke-linejoin="round"
                   style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          
          <!-- Pin Symbol -->
          <g v-else-if="company.symbol === 'pin'">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  :fill="company.color"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                  style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </g>
          
          <!-- Arrow Symbol -->
          <g v-else-if="company.symbol === 'arrow'">
            <polygon points="2,12 10,4 10,8 22,8 22,16 10,16 10,20"
                     :fill="company.color"
                     stroke="white"
                     stroke-width="2.5"
                     stroke-linejoin="round"
                     style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));" />
          </g>
          
          <!-- Default to Circle for unknown symbols -->
          <circle v-else
                  cx="12" cy="12" r="8"
                  :fill="company.color"
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
               background: `radial-gradient(circle, ${company.color}30 0%, transparent 70%)`,
               animation: 'glow 3s ease-in-out infinite',
               zIndex: 1
             }"></div>
      </div>
      
      <!-- Company Name -->
      <span :style="{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              letterSpacing: '0.025em',
              position: 'relative',
              zIndex: 2
            }">
        {{ company.name }}
      </span>
      
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
  companies: {
    type: Array,
    default: () => []
  }
});

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
  
  // Scale the SVG
  const svg = target.querySelector('svg');
  if (svg) {
    svg.style.transform = 'scale(1.15)';
  }
};

const onLeave = (event) => {
  const target = event.currentTarget;
  target.style.transform = 'translateY(0) scale(1)';
  target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
  target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)';
  target.style.borderColor = 'rgba(255,255,255,0.15)';
  
  // Hide shine effect
  const shine = target.querySelector('.shine-overlay');
  if (shine) {
    shine.style.opacity = '0';
  }
  
  // Reset SVG scale
  const svg = target.querySelector('svg');
  if (svg) {
    svg.style.transform = 'scale(1)';
  }
};

// Debug logging
console.log('QPULegend companies:', props.companies);
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
  
  .legend-item span {
    font-size: 0.75rem !important;
    text-align: center !important;
    max-width: 80px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
}
</style>
