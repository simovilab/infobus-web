<script setup lang="ts">
const route = useRoute()
const runId = computed(() => String(route.params.run_id || ''))
</script>

<template>
  <BlueprintPage
    path="/trips/<run_id>"
    :title="`Trip ${runId}`"
  >
    <TripHeader class="lg:col-span-2" />
    <TripStatus />
    <TripVehicle />
    <TripStops class="lg:col-span-2" />
    <TripAlerts />
    <TripAlternatives />
    <TripMap class="lg:col-span-2" />
  </BlueprintPage>
</template>
