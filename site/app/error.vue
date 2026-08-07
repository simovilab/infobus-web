<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  htmlAttrs: {
    lang: 'es'
  }
})

useSeoMeta({
  title: 'Página no encontrada',
  description: 'No pudimos encontrar esta página.'
})
</script>

<template>
  <UContainer class="flex min-h-screen items-center justify-center">
    <UError :error="error" />
  </UContainer>
</template>
