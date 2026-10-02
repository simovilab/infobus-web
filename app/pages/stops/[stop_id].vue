<script setup lang="ts">
const route = useRoute()
const stopId = computed(() => String(route.params.stop_id || ''))
</script>

<template>
  <UPageSection :title="`Stop ${stopId}`" />
  <UContainer>
    <StopHeader />
    <StopRoutes />
    <StopNextArrivals />
    <StopAlerts />
    <StopMap />
  </UContainer>
</template>