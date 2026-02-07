<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'Horarios',
  to: '/rutas',
  icon: 'i-lucide-clock',
  active: route.path.startsWith('/rutas')
}, {
  label: 'Paradas',
  to: '/paradas',
  icon: 'i-lucide-map-pin',
  active: route.path.startsWith('/paradas')
}, {
  label: 'Alertas',
  to: '/alertas',
  icon: 'i-lucide-alert-circle',
  active: route.path.startsWith('/alertas')
}, {
  label: 'Tarifas',
  to: '/tarifas',
  icon: 'i-lucide-dollar-sign',
  active: route.path.startsWith('/tarifas')
}, {
  label: 'Mapas',
  to: '/docs',
  icon: 'i-lucide-map',
  active: route.path.startsWith('/docs')
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      class="hidden lg:flex"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        class="lg:hidden"
        aria-label="Buscar"
      />

      <UButton
        label="Contacto"
        color="neutral"
        variant="outline"
        to="/contacto"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Más"
        color="neutral"
        trailing-icon="i-lucide-chevron-down"
        class="hidden lg:inline-flex"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        label="Contacto"
        color="neutral"
        variant="subtle"
        to="/contacto"
        block
        class="mb-3"
      />
      <UButton
        label="Acerca de"
        color="neutral"
        to="/acerca"
        block
      />
    </template>
  </UHeader>
</template>
