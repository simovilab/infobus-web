<script setup lang="ts">
interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'danger'
  icon: string
}

const alerts = ref<Alert[]>([
  {
    id: '1',
    title: 'Cierres programados',
    description: 'Se realizarán trabajos de mantenimiento en la Línea 5 este fin de semana',
    severity: 'warning',
    icon: 'i-lucide-alert-triangle'
  },
  {
    id: '2',
    title: 'Servicio Normal',
    description: 'Todas las líneas operan con horario normal',
    severity: 'info',
    icon: 'i-lucide-check-circle'
  },
  {
    id: '3',
    title: 'Cambios de ruta',
    description: 'Ruta alternativa disponible en la Línea 3 por trabajos en calle principal',
    severity: 'warning',
    icon: 'i-lucide-info'
  }
])

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'danger': return 'red'
    case 'warning': return 'yellow'
    default: return 'blue'
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="alert in alerts"
      :key="alert.id"
      class="flex gap-3 p-4 rounded-lg border"
      :class="{
        'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800': alert.severity === 'danger',
        'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800': alert.severity === 'warning',
        'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800': alert.severity === 'info'
      }"
    >
      <UIcon
        :name="alert.icon"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
        :class="{
          'text-red-600 dark:text-red-400': alert.severity === 'danger',
          'text-yellow-600 dark:text-yellow-400': alert.severity === 'warning',
          'text-blue-600 dark:text-blue-400': alert.severity === 'info'
        }"
      />
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-sm text-gray-900 dark:text-white">
          {{ alert.title }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ alert.description }}
        </p>
      </div>
      <NuxtLink
        to="/alertas"
        class="text-sm font-medium whitespace-nowrap flex items-center gap-1 hover:underline"
        :class="{
          'text-red-600 hover:text-red-700 dark:text-red-400': alert.severity === 'danger',
          'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400': alert.severity === 'warning',
          'text-blue-600 hover:text-blue-700 dark:text-blue-400': alert.severity === 'info'
        }"
      >
        Ver más
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>
