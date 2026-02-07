<script setup lang="ts">
interface Stop {
  id: string
  name: string
  code: string
  location: string
  routes: number
  accessibility: boolean
}

const stops = ref<Stop[]>([
  {
    id: '1',
    name: 'Estación Central',
    code: 'EST-001',
    location: 'Centro, Calle Principal 100',
    routes: 8,
    accessibility: true
  },
  {
    id: '2',
    name: 'Parque Sur',
    code: 'PSU-002',
    location: 'Zona Sur, Av. Principal',
    routes: 5,
    accessibility: true
  },
  {
    id: '3',
    name: 'Hospital General',
    code: 'HSP-003',
    location: 'Zona Este, Calle Salud',
    routes: 3,
    accessibility: true
  },
  {
    id: '4',
    name: 'Universidad Nacional',
    code: 'UNI-004',
    location: 'Zona Oeste, Campus Central',
    routes: 6,
    accessibility: false
  }
])
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="stop in stops"
      :key="stop.id"
      class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start gap-4">
        <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex-shrink-0">
          <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ stop.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Código: {{ stop.code }}
              </p>
            </div>
            <div v-if="stop.accessibility" class="flex-shrink-0">
              <UTooltip text="Acceso para personas con discapacidad">
                <UIcon name="i-lucide-wheelchair" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </UTooltip>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
            📍 {{ stop.location }}
          </p>
          
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
              {{ stop.routes }} líneas disponibles
            </span>
            <NuxtLink
              :to="`/paradas/${stop.id}`"
              class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver líneas →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
