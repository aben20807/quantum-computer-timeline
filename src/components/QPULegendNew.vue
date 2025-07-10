<template>
  <div class="legend-container">
    <div v-if="!companies || companies.length === 0" class="loading-text">
      Loading legend...
    </div>
    <div v-for="(organization, index) in companies" 
         :key="organization.name" 
         class="legend-item"
         :style="{ animationDelay: `${index * 0.1}s` }">
      <div class="symbol-container">
        <svg width="24" height="24" viewBox="0 0 24 24" class="symbol-svg">
          <!-- Circle symbol -->
          <circle v-if="organization.symbol === 'circle'"
                  cx="12" cy="12" r="8"
                  :fill="organization.color"
                  stroke="rgba(255,255,255,0.3)"
                  stroke-width="2"/>
          
          <!-- Rectangle symbol -->
          <rect v-else-if="organization.symbol === 'rect'"
                x="4" y="4" width="16" height="16" rx="2"
                :fill="organization.color"
                stroke="rgba(255,255,255,0.3)"
                stroke-width="2"/>
          
          <!-- Triangle symbol -->
          <polygon v-else-if="organization.symbol === 'triangle'"
                   points="12,4 20,18 4,18"
                   :fill="organization.color"
                   stroke="rgba(255,255,255,0.3)"
                   stroke-width="2"/>
          
          <!-- Diamond symbol -->
          <polygon v-else-if="organization.symbol === 'diamond'"
                   points="12,2 20,12 12,22 4,12"
                   :fill="organization.color"
                   stroke="rgba(255,255,255,0.3)"
                   stroke-width="2"/>
          
          <!-- Pin symbol -->
          <path v-else-if="organization.symbol === 'pin'"
                d="M12 2C8.5 2 6 4.5 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.5-2.5-6-6-6zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                :fill="organization.color"
                stroke="rgba(255,255,255,0.3)"
                stroke-width="1"/>
          
          <!-- Arrow symbol -->
          <path v-else-if="organization.symbol === 'arrow'"
                d="M4 12L20 12M20 12L14 6M20 12L14 18"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke="organization.color"
                fill="none"/>
          
          <!-- Default to circle for unknown symbols -->
          <circle v-else
                  cx="12" cy="12" r="8"
                  :fill="organization.color"
                  stroke="rgba(255,255,255,0.3)"
                  stroke-width="2"/>
        </svg>
      </div>
      <span class="organization-name">{{ organization.name }}</span>
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

// Debug logging
console.log('QPULegend companies:', props.companies);
</script>

<style scoped>
.legend-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1rem;
}

.loading-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.symbol-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  position: relative;
}

.symbol-svg {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.legend-item:hover .symbol-svg {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  transform: scale(1.1);
}

.organization-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.025em;
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

/* Responsive design */
@media (max-width: 768px) {
  .legend-container {
    gap: 1rem;
  }
  
  .legend-item {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  
  .symbol-container {
    width: 28px;
    height: 28px;
  }
  
  .symbol-svg {
    width: 20px;
    height: 20px;
  }
  
  .organization-name {
    font-size: 0.8rem;
  }
}
</style>
