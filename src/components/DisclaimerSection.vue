<template>
  <section class="disclaimer-section bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/10 mt-6">
    <h2 class="disclaimer-title">Disclaimer</h2>
    <div class="disclaimer-content">
      <p class="disclaimer-text">
        The quantum computing field is rapidly evolving, and despite our best efforts to maintain accurate information, 
        some data in this visualization may become outdated or contain inaccuracies. Details about quantum processors, 
        qubit counts, release dates, and organizational attributions are compiled from publicly available sources 
        which themselves may contain varying degrees of precision or marketing claims.
      </p>
      
      <h3 class="disclaimer-subtitle">Contribute to Data Accuracy</h3>
      <p class="disclaimer-text">
        If you find any errors or have more accurate/updated information, please submit an issue or pull request on 
        <a href="https://github.com/aben20807/QPU" target="_blank" class="disclaimer-link">GitHub</a>. 
        For substantial additions or corrections, please include references to verifiable sources.
      </p>
      
      <p class="disclaimer-text notice">
        This project aims to provide an educational visualization of quantum computing progress rather than 
        an authoritative technical reference. All information should be verified with original sources when 
        used for research, academic, or business purposes.
      </p>
    </div>
  </section>
</template>

<script setup>
// No props needed
</script>

<style scoped>
.disclaimer-section {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.03);
}

.disclaimer-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.disclaimer-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.disclaimer-content {
  width: 100%;
  max-width: 800px;
}

.disclaimer-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.85);
  margin-bottom: 0.75rem;
}

.disclaimer-text.notice {
  margin-top: 1rem;
  padding: 0.75rem;
  border-left: 3px solid rgba(255, 193, 7, 0.7);
  background-color: rgba(255, 193, 7, 0.05);
  border-radius: 0 4px 4px 0;
}

.disclaimer-link {
  color: #4fc3f7;
  text-decoration: underline;
  transition: color 0.2s;
}

.disclaimer-link:hover {
  color: #81d4fa;
}
</style>
