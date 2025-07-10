<template>
  <div v-if="qpu" class="p-4 bg-white rounded shadow-lg text-black max-w-xs">
    <h3 class="font-bold text-lg mb-2">{{ qpu.name }}</h3>
    <p><b>Company:</b> {{ qpu.company }}</p>
    <p><b>Release Date:</b> {{ qpu.releaseDate }}</p>
    <p><b>Qubit Count:</b> {{ qpu.qubitCount }}</p>
    <div v-if="qpu.paperLinks && qpu.paperLinks.length">
      <b>Papers:</b>
      <ul class="list-disc ml-5">
        <li v-for="link in qpu.paperLinks" :key="link.url">
          <a :href="link.url" target="_blank" class="text-blue-600 underline">{{ link.title }}</a>
        </li>
      </ul>
    </div>
    <p v-if="qpu.description" class="mt-2">{{ qpu.description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  qpu: Object
});
</script>
