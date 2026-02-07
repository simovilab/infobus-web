<script setup lang="ts">
import { ref, computed } from 'vue'

const searchType = ref<'stops' | 'routes'>('stops')
const searchQuery = ref('')

const placeholder = computed(() => {
  return searchType.value === 'stops' 
    ? 'Buscar paradas por nombre o código...'
    : 'Buscar rutas...'
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo({
      path: searchType.value === 'stops' ? '/paradas' : '/rutas',
      query: { q: searchQuery.value }
    })
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div class="w-full">
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8">
      <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        Planifica tu viaje
      </h2>

      <div class="flex gap-4 mb-6 justify-center">
        <UButton
          :variant="searchType === 'stops' ? 'soft' : 'ghost'"
          color="blue"
          icon="i-lucide-map-pin"
          label="Paradas"
          @click="searchType = 'stops'"
          size="md"
          class="text-blue-600 dark:text-blue-400"
        />
        <UButton
          :variant="searchType === 'routes' ? 'soft' : 'ghost'"
          color="blue"
          icon="i-lucide-route"
          label="Rutas"
          @click="searchType = 'routes'"
          size="md"
          class="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div class="flex gap-2 max-w-2xl mx-auto">
        <UInput
          v-model="searchQuery"
          :placeholder="placeholder"
          size="lg"
          icon="i-lucide-search"
          @keydown="handleKeyDown"
          class="flex-1"
        />
        <UButton
          icon="i-lucide-arrow-right"
          size="lg"
          @click="handleSearch"
          color="blue"
          label="Buscar"
          class="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Ejemplo: "Calle Principal", "Línea 5" o "Estación Central"
      </div>
    </div>
  </div>
</template>
