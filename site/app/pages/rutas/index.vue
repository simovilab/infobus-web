<script setup lang="ts">
useSeoMeta({
  title: 'Rutas - InfoBus',
  description: 'Consulta todas las rutas de transporte disponibles, horarios y paradas.'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <UContainer>
        <UPageHeader
          title="Nuestras Rutas"
          description="Explora todas las líneas de transporte disponibles en la ciudad. Consulta horarios, paradas y detalles de cada ruta."
          class="py-8"
        />
      </UContainer>
    </div>

    <!-- Search and Filter Section -->
    <UContainer class="py-8">
      <div class="flex flex-col gap-6">
        <!-- Search Bar -->
        <UInput
          icon="i-lucide-search"
          placeholder="Buscar ruta por número o nombre..."
          size="lg"
        />

        <!-- Routes List -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Todas las Rutas
          </h2>
          <RoutesList />
        </div>
      </div>
    </UContainer>

    <!-- Info Section -->
    <div class="bg-gray-50 dark:bg-slate-900/50 py-12">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo usar las rutas?
            </h3>
            <ul class="space-y-3 text-gray-600 dark:text-gray-300">
              <li class="flex gap-3">
                <span class="flex-shrink-0">✓</span>
                <span>Selecciona tu ruta de interés</span>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0">✓</span>
                <span>Consulta todas las paradas y horarios</span>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0">✓</span>
                <span>Planifica tu viaje con tiempo</span>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0">✓</span>
                <span>Recibe notificaciones de cambios</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Información importante
            </h3>
            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Horarios:</strong> Todas las rutas operan de 6 AM a 11 PM, con servicio especial en horarios pico.
              </p>
              <p>
                <strong>Frecuencia:</strong> Varía según la ruta. Consulta los detalles específicos.
              </p>
              <p>
                <strong>Accesibilidad:</strong> Todas nuestras rutas tienen buses con acceso para personas con discapacidad.
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- CTA Section -->
    <UContainer class="py-12">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Necesitas más ayuda?
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Contáctanos si tienes preguntas sobre nuestras rutas
        </p>
        <UButton
          label="Contactar"
          to="/contacto"
          size="lg"
        />
      </div>
    </UContainer>
  </div>
</template>

