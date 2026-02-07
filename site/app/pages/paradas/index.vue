<script setup lang="ts">
useSeoMeta({
  title: 'Paradas - InfoBus',
  description: 'Encuentra todas las paradas de transporte, ubicaciones y líneas disponibles.'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <UContainer>
        <UPageHeader
          title="Paradas de Transporte"
          description="Localiza todas las paradas disponibles en la ciudad. Consulta qué líneas pasan por cada parada y su accesibilidad."
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
          placeholder="Buscar parada por nombre o código..."
          size="lg"
        />

        <!-- Filters -->
        <div class="flex gap-3 flex-wrap">
          <UButton
            variant="soft"
            color="green"
            icon="i-lucide-check"
            label="Solo accesibles"
            size="sm"
          />
          <UButton
            variant="outline"
            label="Todas las paradas"
            size="sm"
          />
        </div>

        <!-- Stops List -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Todas las Paradas
          </h2>
          <StopsList />
        </div>
      </div>
    </UContainer>

    <!-- Info Section -->
    <div class="bg-gray-50 dark:bg-slate-900/50 py-12">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Información de Paradas
            </h3>
            <ul class="space-y-3 text-gray-600 dark:text-gray-300">
              <li class="flex gap-3">
                <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Cada parada tiene código único para fácil identificación</span>
              </li>
              <li class="flex gap-3">
                <UIcon name="i-lucide-wheelchair" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Muchas paradas cuentan con acceso para personas con discapacidad</span>
              </li>
              <li class="flex gap-3">
                <UIcon name="i-lucide-info" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Consulta qué líneas pasan por cada parada</span>
              </li>
              <li class="flex gap-3">
                <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Las paradas están iluminadas y monitoreadas</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Señalización y Seguridad
            </h3>
            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Horarios:</strong> Los horarios de cada línea están publicados en la parada.
              </p>
              <p>
                <strong>Códigos QR:</strong> Escanea el código QR para obtener información en tiempo real.
              </p>
              <p>
                <strong>Emergencias:</strong> Todos los paradas tienen botón de emergencia disponible.
              </p>
              <p>
                <strong>Limpieza:</strong> Las paradas se limpian regularmente.
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
          ¿Necesitas ubicar una parada?
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Usa nuestro mapa interactivo o contacta con nosotros
        </p>
        <div class="flex gap-4 justify-center">
          <UButton
            label="Ver mapa"
            to="/docs"
            variant="outline"
            size="lg"
          />
          <UButton
            label="Contactar"
            to="/contacto"
            size="lg"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>

