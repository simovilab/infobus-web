<script setup lang="ts">
const route = useRoute()
const eventId = computed(() => String(route.params.slug || ''))
</script>

<template>
  <UPageSection :title="`Event ${eventId}`" />
  <UContainer>
    <EventHeader />
    <EventBody />
  </UContainer>
</template>