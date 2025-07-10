<template>
  <section class="about-section bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10">
    <h2 class="about-title">About This Project</h2>
    <p class="about-text">
      This website visualizes the timeline of quantum computer development using real QPU data. 
      Hover over points for details and paper links. Each organization is represented by unique colors and symbols.
      Click on legend items to filter the chart by organization.
    </p>
  </section>
</template>

<script setup>
// No props needed
</script>

<style scoped>
.about-section {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.about-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.about-text {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  margin: 0;
  max-width: 1100px;
}
</style>
