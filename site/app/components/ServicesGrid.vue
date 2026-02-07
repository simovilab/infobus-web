<script setup lang="ts">
interface Service {
  title: string
  description: string
  icon: string
  link: string
}

const services = ref<Service[]>([
  {
    title: 'Horarios',
    description: 'Consulta horarios de todas nuestras líneas',
    icon: 'i-lucide-clock',
    link: '/rutas'
  },
  {
    title: 'Paradas',
    description: 'Encuentra paradas cercanas a tu ubicación',
    icon: 'i-lucide-map-pin',
    link: '/paradas'
  },
  {
    title: 'Tarifas',
    description: 'Información sobre tarifas y pases',
    icon: 'i-lucide-credit-card',
    link: '/tarifas'
  },
  {
    title: 'Mapas',
    description: 'Explora el mapa de rutas',
    icon: 'i-lucide-map',
    link: '/docs'
  }
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <NuxtLink
      v-for="(service, index) in services"
      :key="index"
      :to="service.link"
      class="group p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors hover:shadow-md"
    >
      <div class="flex items-center gap-3 mb-3">
        <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
          <UIcon :name="service.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ service.title }}
        </h3>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ service.description }}
      </p>
    </NuxtLink>
  </div>
</template>
