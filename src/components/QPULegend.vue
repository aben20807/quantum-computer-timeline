<template>
  <div class="flex flex-wrap gap-2">
    <div v-for="company in companies" :key="company.name" class="flex items-center gap-1">
      <span :style="{ background: company.color }" class="w-4 h-4 rounded-full inline-block"></span>
      <span class="text-sm">{{ company.name }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  companies: Array // [{ name, color }]
});
</script>
