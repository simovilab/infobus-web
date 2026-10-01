<script setup lang="ts">
const route = useRoute()
const runId = computed(() => String(route.params.run_id || ''))
</script>

<template>
  <UPageSection :title="`Trip ${runId}`" />
  <UContainer>
    <TripHeader />
    <TripNextStops />
    <TripMap />
  </UContainer>
</template>