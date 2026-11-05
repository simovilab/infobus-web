<script setup lang="ts">
const route = useRoute()
const routeId = computed(() => String(route.params.route_id || ''))
</script>

<template>
  <BlueprintPage
    path="/routes/<route_id>"
    :title="`Route ${routeId}`"
  >
    <RouteHeader class="lg:col-span-2" />
    <RouteNextTrips />
    <RouteAlerts />
    <RouteSchedule class="lg:col-span-2" />
    <RouteMap />
    <RouteStops />
    <RouteFares class="lg:col-span-2" />
  </BlueprintPage>
</template>
