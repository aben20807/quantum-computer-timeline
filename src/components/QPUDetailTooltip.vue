<template>
  <div v-if="qpu" 
       class="tooltip-container">
    <h3 class="tooltip-title">{{ qpu.name }}</h3>
    <div class="tooltip-content">
      <p><span class="label">Organization:</span> {{ qpu.organization }}</p>
      <p><span class="label">Type:</span> {{ qpu.type }}</p>
      <p><span class="label">Release Date:</span> {{ qpu.releaseDate }}</p>
      <p><span class="label">Qubit Count:</span> {{ qpu.qubitCount }}</p>
      <div v-if="qpu.externalLink && qpu.externalLink.length" class="papers-section">
        <span class="label">Link(s):</span>
        <ul class="papers-list">
          <li v-for="link in qpu.externalLink" :key="link.url">
            <a :href="link.url" target="_blank" class="paper-link">{{ link.title }}</a>
          </li>
        </ul>
      </div>
      <p v-if="qpu.description" class="description">{{ qpu.description }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  qpu: Object
});
</script>

<style scoped>
.tooltip-container {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  padding: 1rem;
  max-width: 280px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  font-size: 0.875rem;
  line-height: 1.4;
}

.tooltip-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #2563eb;
  border-bottom: 2px solid rgba(37, 99, 235, 0.2);
  padding-bottom: 0.5rem;
}

.tooltip-content p {
  margin: 0.5rem 0;
}

.label {
  font-weight: 600;
  color: #374151;
}

.papers-section {
  margin-top: 0.75rem;
}

.papers-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.papers-list li {
  margin: 0.5rem 0;
  padding: 0.25rem 0;
}

.paper-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.paper-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.paper-link:visited {
  color: #7c3aed;
}

.paper-link:active {
  color: #1e40af;
}

.description {
  margin-top: 0.75rem !important;
  font-style: italic;
  color: #6b7280;
  border-top: 1px solid rgba(107, 114, 128, 0.2);
  padding-top: 0.75rem;
}
</style>
