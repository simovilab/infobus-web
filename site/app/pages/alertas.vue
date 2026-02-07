<script setup lang="ts">
useSeoMeta({
  title: 'Alertas - InfoBus',
  description: 'Mantente informado sobre cambios de servicio, cierres y alertas importantes.'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
      <UContainer>
        <UPageHeader
          title="Alertas y Notificaciones"
          description="Mantente actualizado sobre cambios en el servicio, cierres programados y otras alertas importantes."
          class="py-8"
        />
      </UContainer>
    </div>

    <!-- Alerts Section -->
    <UContainer class="py-12">
      <!-- Filters -->
      <div class="mb-8">
        <div class="flex gap-3 flex-wrap">
          <UButton
            variant="soft"
            color="amber"
            icon="i-lucide-alert-triangle"
            label="Todos"
            size="sm"
          />
          <UButton
            variant="outline"
            color="red"
            label="Urgentes"
            size="sm"
          />
          <UButton
            variant="outline"
            color="yellow"
            label="Advertencias"
            size="sm"
          />
          <UButton
            variant="outline"
            color="blue"
            label="Información"
            size="sm"
          />
        </div>
      </div>

      <!-- Alerts List -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Alertas Activas
        </h2>
        <AlertsList />
      </div>

      <!-- Subscribe Section -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
        <div class="max-w-2xl">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Recibe notificaciones en tiempo real
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Suscríbete para recibir alertas sobre cambios de servicio, cierres y otras novedades importantes directamente en tu dispositivo.
          </p>
          <div class="flex gap-3 flex-wrap">
            <UButton
              label="Activar notificaciones"
              icon="i-lucide-bell"
              size="lg"
            />
            <UButton
              label="Suscribirse por email"
              variant="outline"
              icon="i-lucide-mail"
              size="lg"
            />
          </div>
        </div>
      </div>
    </UContainer>

    <!-- FAQ Section -->
    <div class="bg-gray-50 dark:bg-slate-900/50 py-12">
      <UContainer>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Preguntas Frecuentes
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-6 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Cómo recibo alertas?
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Puedes recibir alertas por email, notificaciones push o SMS. Personaliza tus preferencias en la configuración.
            </p>
          </div>

          <div class="p-6 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Con qué frecuencia se actualizan?
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Las alertas se actualizan en tiempo real cuando ocurren cambios en el servicio.
            </p>
          </div>

          <div class="p-6 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Puedo filtrar por línea?
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Sí, puedes seleccionar qué líneas monitorear y recibir alertas solo de ellas.
            </p>
          </div>

          <div class="p-6 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Hay historial de alertas?
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Sí, puedes ver el historial completo de las últimas 30 días en tu panel.
            </p>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- CTA Section -->
    <UContainer class="py-12">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Tienes una emergencia?
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Si experimentas una situación de emergencia en una parada o en el transporte, contacta con nuestro equipo de emergencias.
        </p>
        <UButton
          label="Llamar a Emergencias"
          icon="i-lucide-phone"
          size="lg"
          color="red"
        />
      </div>
    </UContainer>
  </div>
</template>

