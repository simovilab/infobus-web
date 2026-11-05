<script setup lang="ts">
const route = useRoute()
const stopId = computed(() => String(route.params.stop_id || ''))
</script>

<template>
  <BlueprintPage
    path="/stops/<stop_id>"
    :title="`Stop ${stopId}`"
  >
    <StopHeader class="lg:col-span-2" />
    <StopNextArrivals />
    <StopAlerts />
    <StopRoutes class="lg:col-span-2" />
    <StopMap class="lg:col-span-2" />
  </BlueprintPage>
</template>
