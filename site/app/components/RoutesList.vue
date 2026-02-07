<script setup lang="ts">
interface Route {
  id: string
  number: string
  name: string
  color: string
  stops: number
  type: 'bus' | 'metro' | 'train'
}

const routes = ref<Route[]>([
  {
    id: '1',
    number: '5',
    name: 'Centro - Periférico',
    color: 'bg-red-500',
    stops: 24,
    type: 'bus'
  },
  {
    id: '2',
    number: '10',
    name: 'Sur - Norte',
    color: 'bg-blue-500',
    stops: 18,
    type: 'bus'
  },
  {
    id: '3',
    number: '15',
    name: 'Este - Oeste',
    color: 'bg-green-500',
    stops: 22,
    type: 'bus'
  },
  {
    id: '4',
    number: 'Línea 1',
    name: 'Línea Metropolitana',
    color: 'bg-yellow-500',
    stops: 32,
    type: 'metro'
  }
])

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'metro': return 'i-lucide-subway'
    case 'train': return 'i-lucide-train'
    default: return 'i-lucide-bus'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'metro': return 'Metro'
    case 'train': return 'Tren'
    default: return 'Autobús'
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="route in routes"
      :key="route.id"
      class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div :class="[route.color, 'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0']">
        {{ route.number }}
      </div>
      
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {{ route.name }}
        </h3>
        <div class="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <UIcon :name="getTypeIcon(route.type)" class="w-4 h-4" />
            {{ getTypeLabel(route.type) }}
          </span>
          <span>{{ route.stops }} paradas</span>
        </div>
      </div>

      <NuxtLink
        :to="`/rutas/${route.id}`"
        class="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium whitespace-nowrap"
      >
        Ver detalles
      </NuxtLink>
    </div>
  </div>
</template>
