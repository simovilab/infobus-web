<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div>
    <!-- Hero Section con búsqueda -->
    <div class="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <UContainer class="py-12 md:py-20">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Planifica tu viaje con InfoBus
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Consulta horarios, encuentra paradas y descubre las mejores rutas de transporte
          </p>
        </div>
        
        <!-- Search Component -->
        <SearchStopsRoutes class="mb-12" />
        
        <!-- Services Grid -->
        <div class="mt-12">
          <ServicesGrid />
        </div>
      </UContainer>
    </div>

    <!-- Alerts Section -->
    <UContainer class="py-12">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Alertas y Notificaciones
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          Mantente informado sobre cambios de servicio y trabajo de mantenimiento
        </p>
      </div>
      <AlertsList />
      <div class="mt-6 text-center">
        <NuxtLink to="/alertas" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Ver todas las alertas →
        </NuxtLink>
      </div>
    </UContainer>

    <!-- Featured Content Section -->
    <div v-if="page" class="bg-gray-50 dark:bg-slate-900/50 py-12">
      <UContainer>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">45+</div>
            <p class="text-gray-600 dark:text-gray-300">Líneas de transporte</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1200+</div>
            <p class="text-gray-600 dark:text-gray-300">Paradas disponibles</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
            <p class="text-gray-600 dark:text-gray-300">Cobertura de la ciudad</p>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- CTA Section -->
    <UContainer class="py-12">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Necesitas ayuda?
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Contáctanos para consultas o feedback sobre nuestro servicio
        </p>
        <UButton
          label="Contactar"
          to="/contacto"
          size="lg"
          icon="i-lucide-arrow-right"
          trailing
        />
      </div>
    </UContainer>
  </div>
</template>
