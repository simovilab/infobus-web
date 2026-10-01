<script setup lang="ts">
const route = useRoute()
const routeId = computed(() => String(route.params.route_id || ''))
</script>

<template>
  <UPageSection :title="`Route ${routeId}`" />
  <UContainer>
    <RouteHeader />
    <RouteNextTrips />
    <RouteAlerts />
    <RouteSchedule />
    <RouteMap />
    <RouteStops />
    <RouteFares />
  </UContainer>
</template>