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
      
      <h3 class="disclaimer-subtitle">Dataset Coverage and Limitations</h3>
      <p class="disclaimer-text">
        This timeline represents a <strong>curated selection</strong> of quantum computers and does not include all QPUs ever developed. 
        Some quantum processors may be excluded due to:
      </p>
      <ul class="disclaimer-list">
        <li><strong>Limited public information:</strong> Proprietary or classified systems with insufficient public documentation</li>
        <li><strong>Research prototypes:</strong> Early-stage experimental systems not intended for broader demonstration</li>
        <li><strong>Commercial confidentiality:</strong> Systems under development or commercial restrictions</li>
        <li><strong>Academic focus:</strong> Priority given to systems with published research papers or significant milestones</li>
        <li><strong>Data availability:</strong> Missing critical information like qubit count or release dates</li>
        <li><strong>Verification challenges:</strong> Difficulty in confirming specifications from reliable sources</li>
      </ul>
      <p class="disclaimer-text">
        The timeline emphasizes systems that have contributed significantly to quantum computing progress, 
        have been publicly demonstrated, or represent important technological milestones.
      </p>
      
      <h3 class="disclaimer-subtitle">Contribute to Data Accuracy</h3>
      <p class="disclaimer-text">
        If you find any errors, have more accurate information, or know of significant QPUs that should be included, 
        please submit an issue or pull request on 
        <a href="https://github.com/aben20807/quantum-computer-timeline" target="_blank" class="disclaimer-link">GitHub</a>. 
        For substantial additions or corrections, please include references to verifiable sources such as research papers, 
        official announcements, or peer-reviewed publications.
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
  max-width: 1200px;
}

.disclaimer-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.85);
  margin-bottom: 0.75rem;
}

.disclaimer-list {
  margin: 0.75rem 0 1rem 1.5rem;
  padding: 0;
  list-style: none;
}

.disclaimer-list li {
  margin-bottom: 0.5rem;
  padding-left: 0.75rem;
  position: relative;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255,255,255,0.8);
}

.disclaimer-list li::before {
  content: "•";
  color: #4fc3f7;
  font-weight: bold;
  position: absolute;
  left: -0.5rem;
}

.disclaimer-list li strong {
  color: rgba(255,255,255,0.95);
  font-weight: 600;
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
  text-decoration: inherit;
  transition: color 0.2s;
}

.disclaimer-link:hover {
  color: #81d4fa;
  text-decoration: underline;
}
</style>
