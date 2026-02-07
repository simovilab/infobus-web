<script setup lang="ts">
const columns = [{
  label: 'Servicios',
  children: [{
    label: 'Horarios',
    to: '/rutas'
  }, {
    label: 'Paradas',
    to: '/paradas'
  }, {
    label: 'Tarifas',
    to: '/tarifas'
  }, {
    label: 'Mapas',
    to: '/docs'
  }]
}, {
  label: 'Información',
  children: [{
    label: 'Alertas',
    to: '/alertas'
  }, {
    label: 'Blog',
    to: '/blog'
  }, {
    label: 'Acerca de',
    to: '/acerca'
  }, {
    label: 'Accesibilidad',
    to: '/servicio/accesibilidad'
  }]
}, {
  label: 'Empresa',
  children: [{
    label: 'Contacto',
    to: '/contacto'
  }, {
    label: 'Gestión',
    to: '/gestion'
  }, {
    label: 'Datos Abiertos',
    to: '/estadisticas'
  }, {
    label: 'Acerca de nosotros',
    to: '/acerca'
  }]
}, {
  label: 'Legal',
  children: [{
    label: 'Políticas de Privacidad',
    to: '#'
  }, {
    label: 'Términos de Uso',
    to: '#'
  }, {
    label: 'Cookies',
    to: '#'
  }, {
    label: 'Accesibilidad',
    to: '/servicio/accesibilidad'
  }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: '¡Suscrito!',
    description: 'Te enviaremos actualizaciones importantes sobre nuestro servicio.'
  })
  
  email.value = ''
  loading.value = false
}
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-800">
    <UContainer class="py-12">
      <div class="grid md:grid-cols-5 gap-8 mb-8">
        <!-- Logo and description -->
        <div class="md:col-span-1">
          <AppLogo class="w-auto h-6 shrink-0 mb-4" />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Sistema de transporte urbano conectando a la ciudad.
          </p>
          <div class="flex gap-2 mt-4">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-facebook"
              to="#"
              target="_blank"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-twitter"
              to="#"
              target="_blank"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-instagram"
              to="#"
              target="_blank"
            />
          </div>
        </div>

        <!-- Navigation columns -->
        <div v-for="(column, index) in columns" :key="index" class="md:col-span-1">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
            {{ column.label }}
          </h3>
          <ul class="space-y-3">
            <li v-for="(child, childIndex) in column.children" :key="childIndex">
              <NuxtLink
                :to="child.to"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Newsletter subscription -->
      <div class="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
        <div class="max-w-md">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Suscríbete a nuestras actualizaciones
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recibe notificaciones sobre cambios de servicio y nuevas características
          </p>
          <form @submit.prevent="onSubmit" class="flex gap-2">
            <UInput
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              size="sm"
              class="flex-1"
              :disabled="loading"
            />
            <UButton
              type="submit"
              size="sm"
              :loading="loading"
              label="Suscribir"
            />
          </form>
        </div>
      </div>

      <!-- Bottom info -->
      <div class="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © {{ new Date().getFullYear() }} InfoBus. Todos los derechos reservados.
        </p>
        <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <NuxtLink to="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Privacidad
          </NuxtLink>
          <span class="text-gray-300 dark:text-gray-700">•</span>
          <NuxtLink to="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Términos
          </NuxtLink>
          <span class="text-gray-300 dark:text-gray-700">•</span>
          <NuxtLink to="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Cookies
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </div>
</template>
